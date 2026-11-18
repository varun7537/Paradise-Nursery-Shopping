import React, { useState, useReducer, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Truck, MapPin, User, Phone, Home, Building2, Globe,
  ChevronRight, CheckCircle2, AlertCircle, Loader2,
  Shield, Clock, Package, Star, ArrowLeft, Save, Leaf
} from "lucide-react";

// ─── Countries List ────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" },
  { code: "ZA", name: "South Africa" },
];

// ─── Shipping Methods ─────────────────────────────────────────────────────────
const SHIPPING_METHODS = [
  {
    id: "standard",
    label: "Standard Delivery",
    duration: "5–7 business days",
    price: "Free",
    icon: <Truck className="w-5 h-5" />,
    badge: null,
  },
  {
    id: "express",
    label: "Express Delivery",
    duration: "2–3 business days",
    price: "$9.99",
    icon: <Clock className="w-5 h-5" />,
    badge: "Popular",
  },
  {
    id: "overnight",
    label: "Overnight Delivery",
    duration: "Next business day",
    price: "$19.99",
    icon: <Package className="w-5 h-5" />,
    badge: "Fastest",
  },
];

// ─── Validation Helpers ───────────────────────────────────────────────────────
const validators = {
  fullName: (v) =>
    !v.trim()
      ? "Full name is required"
      : v.trim().length < 2
      ? "Name must be at least 2 characters"
      : "",
  phone: (v) =>
    !v.trim()
      ? "Phone number is required"
      : !/^\+?[\d\s\-().]{7,20}$/.test(v)
      ? "Enter a valid phone number"
      : "",
  address1: (v) =>
    !v.trim() ? "Address line 1 is required" : "",
  address2: () => "",
  city: (v) => (!v.trim() ? "City is required" : ""),
  state: (v) => (!v.trim() ? "State / Province is required" : ""),
  postal: (v) =>
    !v.trim()
      ? "Postal code is required"
      : !/^[A-Z0-9\s\-]{3,10}$/i.test(v)
      ? "Enter a valid postal / ZIP code"
      : "",
  country: (v) => (!v ? "Please select a country" : ""),
};

const validateAll = (fields) =>
  Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, validators[k]?.(v) ?? ""])
  );

const hasErrors = (errs) => Object.values(errs).some(Boolean);

// ─── Reducer ──────────────────────────────────────────────────────────────────
const initialState = {
  fields: {
    fullName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postal: "",
    country: "",
  },
  errors: {},
  touched: {},
  saveAddress: false,
  shippingMethod: "standard",
  submitState: "idle", // idle | loading | success | error
};

function reducer(state, action) {
  switch (action.type) {
    case "FIELD_CHANGE":
      return {
        ...state,
        fields: { ...state.fields, [action.name]: action.value },
        errors: {
          ...state.errors,
          [action.name]: state.touched[action.name]
            ? validators[action.name]?.(action.value) ?? ""
            : state.errors[action.name] ?? "",
        },
      };
    case "FIELD_BLUR":
      return {
        ...state,
        touched: { ...state.touched, [action.name]: true },
        errors: {
          ...state.errors,
          [action.name]: validators[action.name]?.(state.fields[action.name]) ?? "",
        },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors, touched: action.touched };
    case "TOGGLE_SAVE":
      return { ...state, saveAddress: !state.saveAddress };
    case "SET_SHIPPING":
      return { ...state, shippingMethod: action.id };
    case "SET_SUBMIT":
      return { ...state, submitState: action.state };
    case "PREFILL":
      return { ...state, fields: { ...state.fields, ...action.data } };
    default:
      return state;
  }
}

// ─── Reusable FormField ────────────────────────────────────────────────────────
const FormField = ({
  id, label, type = "text", placeholder, value, error, touched,
  onChange, onBlur, icon: Icon, autoComplete, required = true, hint,
}) => {
  const hasError = touched && error;
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-gray-700 flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-400 text-xs">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              hasError ? "text-red-400" : "text-green-500"
            }`}
          />
        )}
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-required={required}
          aria-invalid={!!hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-3 rounded-xl border-2 text-gray-800 placeholder:text-gray-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2
            ${hasError
              ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50"
              : "border-gray-200 focus:border-green-400 focus:ring-green-100 bg-white hover:border-green-300"
            }`}
        />
        {touched && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : value ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : null}
          </div>
        )}
      </div>
      {hint && !hasError && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
      {hasError && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

// ─── SelectField ──────────────────────────────────────────────────────────────
const SelectField = ({ id, label, value, error, touched, onChange, onBlur, options, icon: Icon }) => {
  const hasError = touched && error;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700 flex items-center gap-1">
        {label} <span className="text-red-400 text-xs">*</span>
      </label>
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${hasError ? "text-red-400" : "text-green-500"}`} />
        )}
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-required
          aria-invalid={!!hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-3 rounded-xl border-2 text-gray-800 text-sm appearance-none transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer
            ${hasError
              ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50"
              : "border-gray-200 focus:border-green-400 focus:ring-green-100 bg-white hover:border-green-300"
            }`}
        >
          <option value="">Select a country…</option>
          {options.map((o) => (
            <option key={o.code} value={o.code}>{o.name}</option>
          ))}
        </select>
        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
      </div>
      {hasError && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DeliveryOptions = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { fields, errors, touched, saveAddress, shippingMethod, submitState } = state;

  // Autofill from localStorage if previously saved
  useEffect(() => {
    try {
      const saved = localStorage.getItem("paradise_address");
      if (saved) dispatch({ type: "PREFILL", data: JSON.parse(saved) });
    } catch {}
  }, []);

  const handleChange = (e) =>
    dispatch({ type: "FIELD_CHANGE", name: e.target.name, value: e.target.value });

  const handleBlur = (e) =>
    dispatch({ type: "FIELD_BLUR", name: e.target.name });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allErrors = validateAll(fields);
    const allTouched = Object.fromEntries(Object.keys(fields).map((k) => [k, true]));

    if (hasErrors(allErrors)) {
      dispatch({ type: "SET_ERRORS", errors: allErrors, touched: allTouched });
      // Scroll to first error
      const firstErrEl = document.querySelector("[aria-invalid='true']");
      firstErrEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (saveAddress) {
      try { localStorage.setItem("paradise_address", JSON.stringify(fields)); } catch {}
    }

    dispatch({ type: "SET_SUBMIT", state: "loading" });

    // Simulated API call
    await new Promise((r) => setTimeout(r, 1800));

    // 90% success simulation (replace with real API)
    const success = Math.random() > 0.1;
    dispatch({ type: "SET_SUBMIT", state: success ? "success" : "error" });
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (submitState === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6 transform animate-[fadeInUp_0.5s_ease]">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto ring-8 ring-green-100">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order Confirmed!</h2>
            <p className="text-gray-500 mt-2">
              Your plants are on their way to <span className="font-semibold text-gray-700">{fields.city}, {fields.country}</span>
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-left space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Shipping to:</span> {fields.fullName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Address:</span> {fields.address1}, {fields.city}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Method:</span>{" "}
              {SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.label}
            </p>
          </div>
          <Link
            to="/products"
            className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-8 rounded-full font-bold transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-green-200"
          >
            <Leaf className="w-4 h-4" />
            Continue Shopping
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner — mirrors hero gradient */}
      <div className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 py-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://media.istockphoto.com/id/1409763640/photo/friends-buying-plants-at-a-garden-center.jpg?s=1024x1024&w=is&k=20&c=aHJM6PvuQGnIkCH4g1z1ari7BVjo2dVGaSWp_XhIx40=')] bg-cover bg-center" />
        <div className="max-w-3xl mx-auto relative">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-teal-100 hover:text-white text-sm font-medium mb-4 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Cart
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Delivery Options</h1>
              <p className="text-teal-100 text-sm mt-0.5">We deliver happiness, one plant at a time 🌿</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {["Cart", "Delivery", "Payment", "Confirm"].map((step, i) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  i === 1
                    ? "bg-white text-green-600 shadow"
                    : i < 1
                    ? "bg-white/30 text-white"
                    : "bg-white/10 text-teal-200"
                }`}>
                  {i < 1 ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 flex items-center justify-center">{i + 1}</span>}
                  {step}
                </div>
                {i < 3 && <ChevronRight className="w-3 h-3 text-teal-200 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="bg-white border-b border-gray-100 py-3 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-center sm:justify-between text-xs text-gray-500 font-medium">
          {[
            { icon: <Shield className="w-3.5 h-3.5 text-green-500" />, text: "SSL Secured Checkout" },
            { icon: <Truck className="w-3.5 h-3.5 text-green-500" />, text: "Free Standard Delivery" },
            { icon: <Star className="w-3.5 h-3.5 text-green-500" />, text: "30-Day Plant Guarantee" },
            { icon: <Phone className="w-3.5 h-3.5 text-green-500" />, text: "24/7 Support" },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-1.5">{icon}{text}</span>
          ))}
        </div>
      </div>

      {/* Page Body */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Error Banner */}
        {submitState === "error" && (
          <div role="alert" className="flex items-start gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Something went wrong</p>
              <p className="text-red-600 text-sm">Please try submitting again. If the problem persists, contact support.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate aria-label="Delivery details form">

          {/* ── Shipping Method Card ────────────────────────────────────────── */}
          <section aria-labelledby="shipping-method-heading" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-600" />
              <h2 id="shipping-method-heading" className="text-lg font-bold text-gray-800">Shipping Method</h2>
            </div>
            <div className="p-6 space-y-3" role="radiogroup" aria-labelledby="shipping-method-heading">
              {SHIPPING_METHODS.map((method) => (
                <label
                  key={method.id}
                  htmlFor={`method-${method.id}`}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                    ${shippingMethod === method.id
                      ? "border-green-400 bg-green-50 shadow-sm"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-50/30"
                    }`}
                >
                  <input
                    type="radio"
                    id={`method-${method.id}`}
                    name="shippingMethod"
                    value={method.id}
                    checked={shippingMethod === method.id}
                    onChange={() => dispatch({ type: "SET_SHIPPING", id: method.id })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    shippingMethod === method.id ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-600"
                  }`}>
                    {method.icon}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{method.label}</span>
                      {method.badge && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">{method.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{method.duration}</p>
                  </div>
                  <span className={`font-bold text-sm flex-shrink-0 ${shippingMethod === method.id ? "text-green-600" : "text-gray-700"}`}>
                    {method.price}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center ${
                    shippingMethod === method.id ? "border-green-500 bg-green-500" : "border-gray-300"
                  }`}>
                    {shippingMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* ── Shipping Address Card ───────────────────────────────────────── */}
          <section aria-labelledby="address-heading" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <h2 id="address-heading" className="text-lg font-bold text-gray-800">Shipping Address</h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Row: Full Name + Phone */}
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  id="fullName"
                  label="Full Name"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  icon={User}
                  value={fields.fullName}
                  error={errors.fullName}
                  touched={touched.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <FormField
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  autoComplete="tel"
                  icon={Phone}
                  value={fields.phone}
                  error={errors.phone}
                  touched={touched.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  hint="Include country code for international orders"
                />
              </div>

              {/* Address Line 1 */}
              <FormField
                id="address1"
                label="Address Line 1"
                placeholder="123 Garden Street, Apt 4B"
                autoComplete="address-line1"
                icon={Home}
                value={fields.address1}
                error={errors.address1}
                touched={touched.address1}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              {/* Address Line 2 */}
              <FormField
                id="address2"
                label="Address Line 2"
                placeholder="Building name, floor, landmark (optional)"
                autoComplete="address-line2"
                icon={Building2}
                required={false}
                value={fields.address2}
                error={errors.address2}
                touched={touched.address2}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              {/* Row: City + State */}
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  id="city"
                  label="City"
                  placeholder="New York"
                  autoComplete="address-level2"
                  icon={MapPin}
                  value={fields.city}
                  error={errors.city}
                  touched={touched.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <FormField
                  id="state"
                  label="State / Province"
                  placeholder="New York"
                  autoComplete="address-level1"
                  value={fields.state}
                  error={errors.state}
                  touched={touched.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              {/* Row: Postal + Country */}
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  id="postal"
                  label="Postal / ZIP Code"
                  placeholder="10001"
                  autoComplete="postal-code"
                  value={fields.postal}
                  error={errors.postal}
                  touched={touched.postal}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <SelectField
                  id="country"
                  label="Country"
                  options={COUNTRIES}
                  icon={Globe}
                  value={fields.country}
                  error={errors.country}
                  touched={touched.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              {/* Save address toggle */}
              <label
                htmlFor="saveAddress"
                className="flex items-center gap-3 cursor-pointer select-none group"
              >
                <div
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 ${
                    saveAddress ? "bg-green-500" : "bg-gray-200 group-hover:bg-gray-300"
                  }`}
                  onClick={() => dispatch({ type: "TOGGLE_SAVE" })}
                  role="switch"
                  aria-checked={saveAddress}
                  aria-label="Save address for later"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === " " && dispatch({ type: "TOGGLE_SAVE" })}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                    saveAddress ? "left-6" : "left-1"
                  }`} />
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={() => dispatch({ type: "TOGGLE_SAVE" })}
                    className="sr-only"
                  />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Save className="w-4 h-4 text-green-500" />
                    Save this address for future orders
                  </span>
                  <span className="text-xs text-gray-400">Stored securely in your browser</span>
                </div>
              </label>
            </div>
          </section>

          {/* ── Order Summary Stub ──────────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-100 p-6 mt-8 space-y-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600" />
              Order Summary
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal (3 plants)</span>
                <span className="font-semibold text-gray-800">$100.00</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping ({SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.label})</span>
                <span className={`font-semibold ${shippingMethod === "standard" ? "text-green-600" : "text-gray-800"}`}>
                  {SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price}
                </span>
              </div>
              <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span className="text-green-600">
                  {shippingMethod === "standard"
                    ? "$100.00"
                    : shippingMethod === "express"
                    ? "$109.99"
                    : "$119.99"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Submit Button ────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={submitState === "loading"}
            aria-label="Continue to payment"
            className={`w-full mt-6 py-4 px-8 rounded-full font-bold text-white transition-all duration-300 transform flex items-center justify-center gap-3 shadow-lg text-base
              ${submitState === "loading"
                ? "bg-green-400 cursor-not-allowed scale-100"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-200 active:scale-[0.99]"
              }`}
          >
            {submitState === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Confirming your address…
              </>
            ) : (
              <>
                Continue to Payment
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            Your information is encrypted and securely processed.
          </p>
        </form>
      </div>
    </div>
  );
};

export default DeliveryOptions;