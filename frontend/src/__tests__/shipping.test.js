// __tests__/shipping.test.js
// Integration tests for shipping endpoints using supertest.
// Run: npm test

const request = require("supertest");
const app     = require("../server");

// ─── Helpers ──────────────────────────────────────────────────────────────────

// A valid JWT for a test user — in real tests, generate this via a login call
// or mock the auth middleware. Here we mock the middleware to keep tests fast.
jest.mock("../middleware/authMiddleware", () => ({
  protect: (req, res, next) => {
    req.user = { id: "00000000-0000-0000-0000-000000000001", role: "customer" };
    next();
  },
  authorize: () => (req, res, next) => next(),
}));

// Mock the DB models so tests don't need a live PostgreSQL instance
jest.mock("../models/shippingModel");
jest.mock("../models/cartModel");

const ShippingModel = require("../models/shippingModel");
const CartModel     = require("../models/cartModel");

const MOCK_SHIPPING = {
  id:           "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  userId:       "00000000-0000-0000-0000-000000000001",
  fullName:     "Jane Doe",
  phoneNumber:  "+1 555 000 0000",
  addressLine1: "123 Garden Street",
  addressLine2: "Apt 4B",
  city:         "San Francisco",
  state:        "California",
  postalCode:   "94102",
  country:      "United States",
  isDefault:    true,
  createdAt:    new Date().toISOString(),
  updatedAt:    new Date().toISOString(),
};

const MOCK_CART = {
  cartItems: [
    { name: "Monstera Deliciosa", price: 45, quantity: 1, total: 45 },
    { name: "Peace Lily",         price: 30, quantity: 2, total: 60 },
  ],
  grandTotal: 105,
};

const VALID_BODY = {
  fullName:     "Jane Doe",
  phoneNumber:  "+1 555 000 0000",
  addressLine1: "123 Garden Street",
  addressLine2: "Apt 4B",
  city:         "San Francisco",
  state:        "California",
  postalCode:   "94102",
  country:      "United States",
  isDefault:    true,
};

// ─── POST /api/v1/shipping ────────────────────────────────────────────────────

describe("POST /api/v1/shipping", () => {
  beforeEach(() => {
    ShippingModel.create.mockResolvedValue(MOCK_SHIPPING);
    CartModel.getCartWithTotals.mockResolvedValue(MOCK_CART);
  });

  it("should create a shipping address and return 201 with checkout payload", async () => {
    const res = await request(app)
      .post("/api/v1/shipping")
      .send(VALID_BODY)
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe("Jane Doe");
    expect(res.body.data.cartItems).toHaveLength(2);
    expect(res.body.data.grandTotal).toBe(105);
  });

  it("should return 422 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/shipping")
      .send({ fullName: "Jane" })   // missing most fields
      .expect(422);

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("should return 422 for an invalid phone number", async () => {
    const res = await request(app)
      .post("/api/v1/shipping")
      .send({ ...VALID_BODY, phoneNumber: "abc" })
      .expect(422);

    const phoneError = res.body.errors.find((e) => e.field === "phoneNumber");
    expect(phoneError).toBeDefined();
  });

  it("should return 422 for an unsupported country", async () => {
    const res = await request(app)
      .post("/api/v1/shipping")
      .send({ ...VALID_BODY, country: "Atlantis" })
      .expect(422);

    const countryError = res.body.errors.find((e) => e.field === "country");
    expect(countryError).toBeDefined();
  });
});

// ─── GET /api/v1/shipping/:id ─────────────────────────────────────────────────

describe("GET /api/v1/shipping/:id", () => {
  beforeEach(() => {
    ShippingModel.findById.mockResolvedValue(MOCK_SHIPPING);
    CartModel.getCartWithTotals.mockResolvedValue(MOCK_CART);
  });

  it("should return 200 with shipping + cart summary", async () => {
    const res = await request(app)
      .get(`/api/v1/shipping/${MOCK_SHIPPING.id}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.shippingAddress.id).toBe(MOCK_SHIPPING.id);
    expect(res.body.data.cartItems).toHaveLength(2);
    expect(res.body.data.grandTotal).toBe(105);
    expect(res.body.message).toBe("Shipping details fetched successfully.");
  });

  it("should return 404 when address does not exist", async () => {
    ShippingModel.findById.mockResolvedValue(null);
    const res = await request(app)
      .get("/api/v1/shipping/ffffffff-ffff-ffff-ffff-ffffffffffff")
      .expect(404);

    expect(res.body.success).toBe(false);
  });

  it("should return 422 for an invalid UUID", async () => {
    const res = await request(app)
      .get("/api/v1/shipping/not-a-uuid")
      .expect(422);

    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/v1/shipping/:id ─────────────────────────────────────────────────

describe("PUT /api/v1/shipping/:id", () => {
  beforeEach(() => {
    ShippingModel.belongsToUser.mockResolvedValue(true);
    ShippingModel.update.mockResolvedValue({ ...MOCK_SHIPPING, city: "Oakland" });
    CartModel.getCartWithTotals.mockResolvedValue(MOCK_CART);
  });

  it("should update and return the updated address + cart summary", async () => {
    const res = await request(app)
      .put(`/api/v1/shipping/${MOCK_SHIPPING.id}`)
      .send({ city: "Oakland" })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.shippingAddress.city).toBe("Oakland");
  });

  it("should return 404 when address not found after update", async () => {
    ShippingModel.update.mockResolvedValue(null);
    const res = await request(app)
      .put(`/api/v1/shipping/${MOCK_SHIPPING.id}`)
      .send({ city: "Oakland" })
      .expect(404);

    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/v1/shipping/:id ─────────────────────────────────────────────

describe("DELETE /api/v1/shipping/:id", () => {
  it("should delete the address and return 200", async () => {
    ShippingModel.belongsToUser.mockResolvedValue(true);
    ShippingModel.delete.mockResolvedValue(true);

    const res = await request(app)
      .delete(`/api/v1/shipping/${MOCK_SHIPPING.id}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeNull();
  });

  it("should return 404 when address not found", async () => {
    ShippingModel.belongsToUser.mockResolvedValue(true);
    ShippingModel.delete.mockResolvedValue(false);

    const res = await request(app)
      .delete(`/api/v1/shipping/${MOCK_SHIPPING.id}`)
      .expect(404);

    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/v1/shipping (list) ─────────────────────────────────────────────

describe("GET /api/v1/shipping", () => {
  it("should return paginated list of addresses", async () => {
    ShippingModel.findAllByUser.mockResolvedValue({
      addresses: [MOCK_SHIPPING],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const res = await request(app)
      .get("/api/v1/shipping?page=1&limit=10")
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });
});