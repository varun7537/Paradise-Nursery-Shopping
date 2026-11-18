// ShippingDetails.jsx
import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin, User, Phone, Home, Building2, Globe, Hash,
  ChevronRight, CheckCircle, AlertCircle, Loader2,
  ArrowLeft, Bookmark, Leaf, ShieldCheck, Truck,
  Mail, Package,
} from "lucide-react";

// ── Shipping thunks + selectors ───────────────────────────────────────────────
import {
  createShipping,
  updateShipping,
  clearStatus,
  selectShippingDetails,
  selectShippingLoading,
  selectShippingError,
  selectShippingSuccess,
  selectValidationErrors,
} from "../store/shippingSlice";

// ── Checkout pre-fetch thunks + selectors ─────────────────────────────────────
import {
  initCheckoutPage,
  selectUserProfile,
  selectProfileLoading,
  selectCheckoutCart,
  selectCheckoutTotal,
  selectCheckoutItems,
  selectCartLoading,
  selectCartError,
} from "../store/checkoutSlice";

// ─── Constants ────────────────────────────────────────────────────────────────
const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Netherlands", "India", "Japan",
  "Singapore", "New Zealand", "Ireland", "Sweden", "Norway",
  "Denmark", "Switzerland", "Austria", "Belgium", "Spain", "Italy",
];

// fullName and phoneNumber are NOT form fields — they come from userProfile.
// They are injected into the API payload on submit, but the user cannot edit
// them here (they edit them on the profile page instead).
const INITIAL_FORM = {
  addressLine1: "",
  addressLine2: "",
  city:         "",
  state:        "",
  postalCode:   "",
  country:      "",
  isDefault:    false,
};

// ─── Address-only validators ─────────────────────────────────────────────────
const localValidators = {
  addressLine1: (v) => !v.trim() ? "Address line 1 is required." : null,
  addressLine2: ()  => null,
  city:         (v) => !v.trim() ? "City is required." : null,
  state:        (v) => !v.trim() ? "State / Province is required." : null,
  postalCode:   (v) =>
    !v.trim()
      ? "Postal / ZIP code is required."
      : !/^[A-Za-z0-9\s\-]{3,10}$/.test(v.trim())
      ? "Enter a valid postal code (3–10 characters)."
      : null,
  country: (v) => !v ? "Please select a country." : null,
};

const validateAll = (form) => {
  const errs = {};
  Object.keys(localValidators).forEach((k) => {
    const e = localValidators[k](form[k]);
    if (e) errs[k] = e;
  });
  return errs;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
// userController.formatUser returns:
//   fullName  — from DB column full_name
//   phone     — from DB column phone  (NOT phoneNumber)
//   email     — standard
// BUG FIX: previous code read userProfile?.phoneNumber which is always undefined.
const getDisplayName  = (p) => p?.fullName || p?.name  || "";
const getDisplayPhone = (p) => p?.phone    || "";          // ← correct key
const getDisplayEmail = (p) => p?.email    || "";

// ─── FormField ────────────────────────────────────────────────────────────────
function FormField({ id, label, icon: Icon, error, optional, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        {Icon && <Icon className="w-4 h-4 text-green-600" aria-hidden="true" />}
        {label}
        {optional && <span className="ml-1 text-xs font-normal text-gray-400">(optional)</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="flex items-center gap-1 text-xs text-red-600 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError) {
  return [
    "w-full px-4 py-3 rounded-xl border-2 bg-white text-gray-800 placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 transition duration-200 text-sm",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-200"
      : "border-gray-200 focus:border-green-400 focus:ring-green-100 hover:border-green-300",
  ].join(" ");
}

// ─── Read-only User Card ──────────────────────────────────────────────────────
// Replaces the fullName + phoneNumber inputs. Shows who the order delivers to.
function UserInfoCard({ userProfile, profileLoading }) {
  if (profileLoading) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3 animate-pulse">
        <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-36 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
    );
  }

  const name  = getDisplayName(userProfile);
  const phone = getDisplayPhone(userProfile);
  const email = getDisplayEmail(userProfile);
  const initial = name ? name.trim().charAt(0).toUpperCase() : "?";

  return (
    <div className="flex items-start gap-3 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-100 rounded-2xl px-4 py-4">
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm select-none">
        <span className="text-white font-bold text-base leading-none">{initial}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">
          {name || <span className="text-gray-400 font-normal italic">Name not set</span>}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
          {phone && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Phone className="w-3 h-3 text-green-500 flex-shrink-0" />
              {phone}
            </span>
          )}
          {email && (
            <span className="flex items-center gap-1 text-xs text-gray-500 truncate max-w-[200px]">
              <Mail className="w-3 h-3 text-green-500 flex-shrink-0" />
              {email}
            </span>
          )}
        </div>
      </div>

      <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0">
        <CheckCircle className="w-3 h-3" /> Verified
      </span>
    </div>
  );
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
function OrderSummary({ cartItems, grandTotal, totalItems, cartLoading, cartError }) {
  // Skeleton
  if (cartLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl shadow-green-100/60 p-6 border border-green-50">
        <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-600" /> Order Summary
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-14 bg-gray-200 rounded" />
            </div>
          ))}
          <div className="border-t border-dashed border-green-100 pt-3 space-y-2 animate-pulse">
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-5 w-full bg-gray-200 rounded mt-1" />
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (cartError) {
    return (
      <div className="bg-white rounded-3xl shadow-xl shadow-green-100/60 p-6 border border-red-100">
        <h3 className="text-base font-extrabold text-gray-800 mb-3 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-red-400" /> Order Summary
        </h3>
        <p className="text-sm text-red-500 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {cartError}
        </p>
      </div>
    );
  }

  // Empty
  if (!cartItems?.length) {
    return (
      <div className="bg-white rounded-3xl shadow-xl shadow-green-100/60 p-6 border border-green-50">
        <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-600" /> Order Summary
        </h3>
        <div className="flex flex-col items-center py-6 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
            <Package className="w-7 h-7 text-green-300" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Your cart is empty.</p>
          <Link to="/products" className="text-xs text-green-600 font-semibold hover:underline">
            Browse plants →
          </Link>
        </div>
      </div>
    );
  }

  const total = grandTotal ?? 0;

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-green-100/60 p-6 border border-green-50">
      {/* Header */}
      <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
        <Leaf className="w-4 h-4 text-green-600" />
        Order Summary
        {totalItems > 0 && (
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </span>
        )}
      </h3>

      {/* Items */}
      <div className="space-y-3">
        {cartItems.map((item) => {
          const key      = item.id ?? item.productId ?? item.name;
          const price    = parseFloat(item.price   ?? 0);
          const qty      = item.quantity ?? 1;
          // cartController sends `subtotal`; cartModel sends `total` — handle both
          const subtotal = parseFloat(item.subtotal ?? item.total ?? price * qty);

          return (
            <div
              key={key}
              className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0"
            >
              {/* Thumbnail */}
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-green-100"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display = "flex";
                  }}
                />
              ) : null}
              {/* Fallback icon (shown when no image or image fails) */}
              <div
                style={{ display: item.image ? "none" : "flex" }}
                className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 items-center justify-center flex-shrink-0"
              >
                <Leaf className="w-5 h-5 text-green-400" />
              </div>

              {/* Name + unit price */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  ${price.toFixed(2)} × {qty}
                </p>
              </div>

              {/* Line total + qty badge */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold">
                  {qty}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-dashed border-green-100 pt-3 mt-3 space-y-1.5">
        <div className="flex justify-between text-gray-500 text-xs">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500 text-xs">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-green-500" /> Delivery
          </span>
          <span className="text-green-600 font-semibold">Free</span>
        </div>
        <div className="flex justify-between font-extrabold text-gray-800 text-base pt-1 border-t border-green-50">
          <span>Total</span>
          <span className="text-green-700">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ShippingDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Shipping slice
  const existingAddress   = useSelector(selectShippingDetails);
  const isLoading         = useSelector(selectShippingLoading);
  const apiError          = useSelector(selectShippingError);
  const isSuccess         = useSelector(selectShippingSuccess);
  const serverFieldErrors = useSelector(selectValidationErrors);

  // Checkout slice
  const userProfile    = useSelector(selectUserProfile);
  const profileLoading = useSelector(selectProfileLoading);
  const cartItems      = useSelector(selectCheckoutCart);
  const grandTotal     = useSelector(selectCheckoutTotal);
  const totalItems     = useSelector(selectCheckoutItems);
  const cartLoading    = useSelector(selectCartLoading);
  const cartError      = useSelector(selectCartError);

  // Local form state — address fields only
  const [form, setForm]       = useState(INITIAL_FORM);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  // 1. Fetch user profile + cart on mount
  useEffect(() => {
    dispatch(initCheckoutPage());
  }, [dispatch]);

  // 2. Pre-fill address if a saved record exists in Redux
  useEffect(() => {
    if (existingAddress) {
      setForm({
        addressLine1: existingAddress.addressLine1 || "",
        addressLine2: existingAddress.addressLine2 || "",
        city:         existingAddress.city         || "",
        state:        existingAddress.state        || "",
        postalCode:   existingAddress.postalCode   || "",
        country:      existingAddress.country      || "",
        isDefault:    existingAddress.isDefault    || false,
      });
    }
  }, [existingAddress]);

  // 3. Merge server-side 422 field errors
  useEffect(() => {
    if (serverFieldErrors?.length) {
      const merged = {};
      serverFieldErrors.forEach(({ field, message }) => { merged[field] = message; });
      setErrors((prev) => ({ ...prev, ...merged }));
    }
  }, [serverFieldErrors]);

  // 4. Navigate on success
  useEffect(() => {
    if (isSuccess) {
      const t = setTimeout(() => {
        dispatch(clearStatus());
        navigate("/delivery-options");
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [isSuccess, dispatch, navigate]);

  // Handlers
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    if (touched[name]) {
      const err = localValidators[name]?.(val);
      setErrors((prev) => ({ ...prev, [name]: err || undefined }));
    }
  }, [touched]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = localValidators[name]?.(value);
    setErrors((prev) => ({ ...prev, [name]: err || undefined }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields touched to show any hidden errors
    setTouched(Object.keys(INITIAL_FORM).reduce((a, k) => ({ ...a, [k]: true }), {}));
    const validationErrors = validateAll(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // BUG FIX: userController.formatUser returns `phone`, not `phoneNumber`.
    // Previous code read userProfile?.phoneNumber which was always undefined,
    // so an empty string was sent → backend validator rejected it with 422.
    const fullName    = getDisplayName(userProfile);
    const phoneNumber = getDisplayPhone(userProfile); // reads .phone correctly

    // Guard: if profile hasn't loaded yet, block submit to avoid sending
    // empty fullName/phoneNumber which would cause a 422 from the backend.
    if (!fullName || !phoneNumber) {
      setErrors((prev) => ({
        ...prev,
        _profile: !fullName
          ? "Your profile name is missing. Please update your profile first."
          : "Your phone number is missing. Please update your profile first.",
      }));
      return;
    }

    const payload = { ...form, fullName, phoneNumber };

    if (existingAddress?.id) {
      dispatch(updateShipping({ id: existingAddress.id, ...payload }));
    } else {
      dispatch(createShipping(payload));
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setTouched({});
    dispatch(clearStatus());
  };

  // Derived display values for success screen
  const displayName  = getDisplayName(userProfile);
  const displayPhone = getDisplayPhone(userProfile);

  // ─── Success Screen ───────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-green-200">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 text-2xl">🌿</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Address Saved!</h2>
          <p className="text-gray-600 mb-4 text-lg">Your shipping details have been confirmed.</p>

          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-4 mb-8 text-sm text-gray-700 text-left space-y-1.5">
            {displayName  && <p><span className="font-semibold text-gray-800">Name:</span> {displayName}</p>}
            {displayPhone && <p><span className="font-semibold text-gray-800">Phone:</span> {displayPhone}</p>}
            <p>
              <span className="font-semibold text-gray-800">Address:</span>{" "}
              {form.addressLine1}{form.addressLine2 ? `, ${form.addressLine2}` : ""}
            </p>
            <p>
              <span className="font-semibold text-gray-800">City:</span>{" "}
              {form.city}, {form.state} {form.postalCode}
            </p>
            <p><span className="font-semibold text-gray-800">Country:</span> {form.country}</p>
            {grandTotal > 0 && (
              <p className="pt-1.5 border-t border-green-100 mt-1">
                <span className="font-semibold text-gray-800">Order Total:</span>{" "}
                <span className="text-green-700 font-bold">${grandTotal.toFixed(2)}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/delivery-options"
              className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-8 rounded-full font-bold transition duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-200 flex items-center justify-center gap-2"
            >
              Continue to Delivery Options
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={handleReset}
              className="border-2 border-green-200 text-green-700 hover:bg-green-50 py-3 px-8 rounded-full font-bold transition duration-300"
            >
              Edit Address
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none select-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="white" d="M100,10 Q170,50 160,120 Q150,190 80,180 Q10,170 20,100 Q30,30 100,10Z" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-10 relative">
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white text-sm font-medium mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur rounded-2xl p-3 flex-shrink-0">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Shipping Details</h1>
              <p className="text-teal-100 mt-1 text-base md:text-lg">Where should we deliver your green friends? 🌿</p>
            </div>
          </div>

          {/* Progress steps */}
          <div className="mt-8 flex items-center gap-0">
            {["Cart", "Shipping", "Delivery Options", "Payment"].map((step, i) => {
              const isActive = i === 1;
              const isDone   = i < 1;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={[
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                      isDone   ? "bg-white text-green-600 border-white" :
                      isActive ? "bg-teal-700 text-white border-white shadow-lg scale-110" :
                                 "bg-transparent text-teal-200 border-teal-300",
                    ].join(" ")}>
                      {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${isActive ? "text-white" : "text-teal-200"}`}>
                      {step}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 ${isDone ? "bg-white" : "bg-teal-300/40"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── Form Card ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl shadow-green-100/60 p-8 border border-green-50">
              <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                <Home className="w-5 h-5 text-green-600" />
                {existingAddress ? "Update Delivery Address" : "Delivery Address"}
              </h2>

              {/* Delivering to — read-only user info */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Delivering to
                </p>
                <UserInfoCard userProfile={userProfile} profileLoading={profileLoading} />

                {/* Profile incomplete warning */}
                {!profileLoading && userProfile && (!getDisplayName(userProfile) || !getDisplayPhone(userProfile)) && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Your profile is missing a{!getDisplayName(userProfile) ? " name" : " phone number"}.{" "}
                      <Link to="/profile" className="font-semibold underline">Update profile</Link>{" "}
                      before continuing.
                    </span>
                  </div>
                )}

                {/* Profile-level submit error */}
                {errors._profile && (
                  <p role="alert" className="mt-2 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors._profile}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-2 pl-1">
                  Name and phone are from your account.{" "}
                  <Link to="/profile" className="text-green-600 font-semibold hover:underline">
                    Edit profile
                  </Link>
                </p>
              </div>

              {/* API error banner */}
              {apiError && (
                <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-6 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate aria-label="Shipping details form" autoComplete="on">
                <div className="space-y-5">

                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Delivery address
                  </p>

                  <FormField id="addressLine1" label="Address Line 1" icon={MapPin} error={errors.addressLine1}>
                    <input
                      id="addressLine1" name="addressLine1" type="text"
                      autoComplete="address-line1"
                      value={form.addressLine1}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="123 Garden Street"
                      className={inputClass(!!errors.addressLine1)}
                      aria-invalid={!!errors.addressLine1}
                    />
                  </FormField>

                  <FormField id="addressLine2" label="Address Line 2" icon={Building2} error={errors.addressLine2} optional>
                    <input
                      id="addressLine2" name="addressLine2" type="text"
                      autoComplete="address-line2"
                      value={form.addressLine2}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="Apartment, suite, unit…"
                      className={inputClass(false)}
                    />
                  </FormField>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField id="city" label="City" icon={Building2} error={errors.city}>
                      <input
                        id="city" name="city" type="text"
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={handleChange} onBlur={handleBlur}
                        placeholder="San Francisco"
                        className={inputClass(!!errors.city)}
                        aria-invalid={!!errors.city}
                      />
                    </FormField>
                    <FormField id="state" label="State / Province" icon={MapPin} error={errors.state}>
                      <input
                        id="state" name="state" type="text"
                        autoComplete="address-level1"
                        value={form.state}
                        onChange={handleChange} onBlur={handleBlur}
                        placeholder="California"
                        className={inputClass(!!errors.state)}
                        aria-invalid={!!errors.state}
                      />
                    </FormField>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <FormField id="postalCode" label="Postal / ZIP Code" icon={Hash} error={errors.postalCode}>
                      <input
                        id="postalCode" name="postalCode" type="text"
                        autoComplete="postal-code"
                        value={form.postalCode}
                        onChange={handleChange} onBlur={handleBlur}
                        placeholder="94102"
                        className={inputClass(!!errors.postalCode)}
                        aria-invalid={!!errors.postalCode}
                      />
                    </FormField>
                    <FormField id="country" label="Country" icon={Globe} error={errors.country}>
                      <select
                        id="country" name="country"
                        autoComplete="country-name"
                        value={form.country}
                        onChange={handleChange} onBlur={handleBlur}
                        className={[
                          inputClass(!!errors.country),
                          "appearance-none cursor-pointer bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234B5563' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_1rem_center]",
                        ].join(" ")}
                        aria-invalid={!!errors.country}
                      >
                        <option value="">Select a country…</option>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </FormField>
                  </div>

                  {/* Default address checkbox */}
                  <label
                    htmlFor="isDefault"
                    className="flex items-start gap-3 p-4 rounded-2xl border-2 border-green-100 bg-gradient-to-r from-green-50 to-teal-50 cursor-pointer hover:border-green-300 transition-colors"
                  >
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        id="isDefault" name="isDefault" type="checkbox"
                        checked={form.isDefault} onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-green-300 bg-white peer-checked:bg-green-500 peer-checked:border-green-500 transition-all flex items-center justify-center">
                        {form.isDefault && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                        <Bookmark className="w-4 h-4 text-green-600" />
                        Set as default address
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">We'll pre-select this for your next order.</p>
                    </div>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading || profileLoading}
                    className="group w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-8 rounded-full font-bold text-base transition duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    aria-live="polite"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Saving address…</>
                    ) : profileLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Loading profile…</>
                    ) : (
                      <>Continue to Delivery Options <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>

                  <div className="text-center">
                    <Link to="/cart" className="text-sm text-gray-500 hover:text-green-600 transition-colors font-medium inline-flex items-center gap-1">
                      <ArrowLeft className="w-3.5 h-3.5" /> Return to cart
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            <OrderSummary
              cartItems={cartItems}
              grandTotal={grandTotal}
              totalItems={totalItems}
              cartLoading={cartLoading}
              cartError={cartError}
            />

            {/* Why shop with us */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-6 border border-green-100 space-y-4">
              <h3 className="text-sm font-extrabold text-gray-700 uppercase tracking-wide">Why shop with us</h3>
              {[
                { icon: Truck,       title: "Free Delivery",    desc: "On all orders above $50" },
                { icon: ShieldCheck, title: "30-Day Guarantee", desc: "Healthy plants, guaranteed" },
                { icon: Mail,        title: "Tracking Updates", desc: "Know where your plants are" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo */}
            <div className="bg-gradient-to-r from-teal-500 to-green-600 rounded-3xl p-6 text-white text-center shadow-lg shadow-green-200">
              <p className="text-2xl mb-1">🎁</p>
              <p className="font-extrabold text-lg leading-tight">First order?</p>
              <p className="text-teal-100 text-sm mt-1">
                Use code{" "}
                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">GREEN10</span>
                {" "}for 10% off!
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShippingDetails;