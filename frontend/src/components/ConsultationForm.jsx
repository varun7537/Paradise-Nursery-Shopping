// src/components/ConsultationForm.jsx
// ✅ Enhanced with: dynamic fields, multi-image, step validation, Indian phone validation,
//    character counter, date/time picker, budget, location, plant details, WhatsApp,
//    preferred contact, home visit request, privacy consent, lead tracking, honeypot
//    spam protection, reference ID on success — design/colors/theme unchanged.

import React, { useState, useEffect, useRef } from "react";
import { useNavigate }                         from "react-router-dom";
import { useDispatch, useSelector }            from "react-redux";
import {
  submitConsultation,
  resetConsultation,
  clearConsultationError,
  selectConsultationLoading,
  selectConsultationSuccess,
  selectConsultationError,
} from "../store/consultationSlice";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANT_PROBLEMS = [
  "Yellow Leaves",
  "Plant Dying",
  "Pest Attack",
  "Overwatering",
  "Fungus Issue",
  "Growth Problem",
  "Other",
];

const PEST_TYPES = [
  "Aphids",
  "Mealybugs",
  "Spider Mites",
  "Whiteflies",
  "Fungus Gnats",
  "Scale Insects",
  "Other",
];

const SEVERITY_LEVELS = ["Mild", "Moderate", "Severe"];

// ─── Helper ───────────────────────────────────────────────────────────────────

const generateRefId = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PN-${date}-${rand}`;
};

const todayString = () => new Date().toISOString().split("T")[0];

// ─── Component ────────────────────────────────────────────────────────────────

const ConsultationForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const loading  = useSelector(selectConsultationLoading);
  const success  = useSelector(selectConsultationSuccess);
  const apiError = useSelector(selectConsultationError);

  // Local form state
  const [formData, setFormData] = useState({
    name:             "",
    email:            "",
    phone:            "",
    whatsapp:         "",
    preferredContact: "Phone Call",
    consultationType: "plantCare",
    // Plant Care
    plantCategory:    "Indoor Plants",
    plantCount:       "1-5",
    problemType:      [],
    plantName:        "",
    plantAge:         "",
    // Landscape Design
    areaSize:         "",
    budget:           "Below ₹5,000",
    address:          "",
    // Pest Control
    pestType:         "Aphids",
    severity:         "Mild",
    // Common
    preferredDate:    "",
    preferredTime:    "",
    message:          "",
    files:            [],
    // Home Visit
    requiresHomeVisit: false,
    homeVisitAddress:  "",
    // Consent
    agreeToTerms:     false,
    agreeToPrivacy:   false,
    // Lead tracking (hidden)
    source:           "website",
    page:             typeof window !== "undefined" ? window.location.pathname : "/",
    // Honeypot (must stay empty)
    _hp_field:        "",
  });

  const [error,   setError]   = useState(null);
  const [step,    setStep]    = useState(1);
  const [refId,   setRefId]   = useState("");

  // Total steps: 4
  const TOTAL_STEPS = 4;
  const progress = Math.round((step / TOTAL_STEPS) * 100);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(resetConsultation());
        navigate("/thank-you");
      }, 2500);
    }
  }, [success, dispatch, navigate]);

  useEffect(() => {
    if (apiError) setError(apiError);
  }, [apiError]);

  useEffect(() => {
    return () => { dispatch(resetConsultation()); };
  }, [dispatch]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const clearErr = () => {
    if (error) { setError(null); dispatch(clearConsultationError()); }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearErr();
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
    clearErr();
  };

  const handleMultiCheckbox = (e, field) => {
    const val   = e.target.value;
    const list  = formData[field];
    const next  = e.target.checked
      ? [...list, val]
      : list.filter((v) => v !== val);
    setFormData({ ...formData, [field]: next });
    clearErr();
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5); // max 5 files
    setFormData({ ...formData, files: selected });
    clearErr();
  };

  // ── Validation per step ────────────────────────────────────────────────────

  // Indian mobile: starts with 6-9, exactly 10 digits
  const phoneRegex = /^[6-9]\d{9}$/;

  const validateStep = (s) => {
    const {
      name, email, phone, agreeToTerms, agreeToPrivacy, _hp_field,
      requiresHomeVisit, homeVisitAddress,
    } = formData;

    // Honeypot check (should always be empty)
    if (_hp_field) {
      setError("Submission blocked.");
      return false;
    }

    if (s === 1) {
      if (!name.trim()) { setError("Please enter your full name."); return false; }
      if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return false; }
    }
    if (s === 2) {
      if (!phoneRegex.test(phone)) {
        setError("Please enter a valid 10-digit Indian mobile number.");
        return false;
      }
    }
    if (s === 3) {
      if (requiresHomeVisit && !homeVisitAddress.trim()) {
        setError("Please enter the address for your home visit.");
        return false;
      }
    }
    if (s === TOTAL_STEPS) {
      if (!agreeToTerms)   { setError("You must agree to the Terms & Conditions."); return false; }
      if (!agreeToPrivacy) { setError("You must agree to the Privacy Policy."); return false; }
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
    setError(null);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(TOTAL_STEPS)) return;

    const id = generateRefId();
    setRefId(id);

    try {
      await dispatch(submitConsultation({ ...formData, referenceId: id })).unwrap();
      setFormData({
        name: "", email: "", phone: "", whatsapp: "",
        preferredContact: "Phone Call", consultationType: "plantCare",
        plantCategory: "Indoor Plants", plantCount: "1-5", problemType: [],
        plantName: "", plantAge: "", areaSize: "", budget: "Below ₹5,000",
        address: "", pestType: "Aphids", severity: "Mild",
        preferredDate: "", preferredTime: "", message: "", files: [],
        requiresHomeVisit: false, homeVisitAddress: "",
        agreeToTerms: false, agreeToPrivacy: false,
        source: "website", page: typeof window !== "undefined" ? window.location.pathname : "/",
        _hp_field: "",
      });
    } catch {
      // apiError useEffect handles display
    }
  };

  // ── Dynamic fields based on consultation type ──────────────────────────────

  const type = formData.consultationType;

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Request Free Consultation</h2>

      {/* Messages */}
      {error && (
        <p className="text-red-600 text-center mb-4">{error}</p>
      )}
      {success && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4 text-center">
          <p className="text-green-700 font-semibold text-lg">
            ✓ Consultation Request Submitted Successfully
          </p>
          {refId && (
            <p className="text-green-600 text-sm mt-1">Reference ID: <span className="font-mono font-bold">{refId}</span></p>
          )}
          <p className="text-gray-500 text-sm mt-1">We'll get in touch soon. Redirecting…</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-400 mt-1">Step {step} of {TOTAL_STEPS}</p>
      </div>

      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="_hp_field"
        value={formData._hp_field}
        onChange={handleChange}
        style={{ display: "none" }}
        tabIndex="-1"
        autoComplete="off"
      />

      {/* Hidden lead tracking fields */}
      <input type="hidden" name="source" value={formData.source} />
      <input type="hidden" name="page"   value={formData.page} />

      <form onSubmit={handleSubmit}>

        {/* ── Step 1: Name + Email ─────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="name">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text" id="name" name="name"
                value={formData.name} onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="email">Email <span className="text-red-500">*</span></label>
              <input
                type="email" id="email" name="email"
                value={formData.email} onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="preferredContact">Preferred Contact Method</label>
              <select
                id="preferredContact" name="preferredContact"
                value={formData.preferredContact} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Phone Call</option>
                <option>WhatsApp</option>
                <option>Email</option>
              </select>
            </div>
          </div>
        )}

        {/* ── Step 2: Phone + WhatsApp + Consultation Type + Dynamic Fields ── */}
        {step === 2 && (
          <div>
            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="phone">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="tel" id="phone" name="phone"
                value={formData.phone} onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="whatsapp">WhatsApp Number <span className="text-gray-400 text-sm font-normal">(Optional)</span></label>
              <input
                type="tel" id="whatsapp" name="whatsapp"
                value={formData.whatsapp} onChange={handleChange}
                placeholder="If different from phone"
                maxLength={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="consultationType">Consultation Type</label>
              <select
                id="consultationType" name="consultationType"
                value={formData.consultationType} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="plantCare">Plant Care</option>
                <option value="landscapeDesign">Landscape Design</option>
                <option value="pestControl">Pest Control</option>
              </select>
            </div>

            {/* ── Plant Care specific fields ── */}
            {type === "plantCare" && (
              <>
                <div className="mb-4">
                  <label className="block font-medium mb-1" htmlFor="plantCategory">Plant Category</label>
                  <select
                    id="plantCategory" name="plantCategory"
                    value={formData.plantCategory} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option>Indoor Plants</option>
                    <option>Outdoor Plants</option>
                    <option>Flowering Plants</option>
                    <option>Succulents</option>
                    <option>Vegetable Garden</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium mb-1" htmlFor="plantName">Plant Name <span className="text-gray-400 text-sm font-normal">(Optional)</span></label>
                    <input
                      type="text" id="plantName" name="plantName"
                      value={formData.plantName} onChange={handleChange}
                      placeholder="e.g. Monstera"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1" htmlFor="plantAge">Plant Age <span className="text-gray-400 text-sm font-normal">(Optional)</span></label>
                    <input
                      type="text" id="plantAge" name="plantAge"
                      value={formData.plantAge} onChange={handleChange}
                      placeholder="e.g. 2 years"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-1" htmlFor="plantCount">Number of Plants</label>
                  <select
                    id="plantCount" name="plantCount"
                    value={formData.plantCount} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option>1-5</option>
                    <option>5-20</option>
                    <option>20-50</option>
                    <option>50+</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2">Problem Type <span className="text-gray-400 text-sm font-normal">(Select all that apply)</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLANT_PROBLEMS.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox" value={p}
                          checked={formData.problemType.includes(p)}
                          onChange={(e) => handleMultiCheckbox(e, "problemType")}
                          className="accent-green-500"
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── Landscape Design specific fields ── */}
            {type === "landscapeDesign" && (
              <>
                <div className="mb-4">
                  <label className="block font-medium mb-1" htmlFor="address">Garden / Project Location</label>
                  <input
                    type="text" id="address" name="address"
                    value={formData.address} onChange={handleChange}
                    placeholder="City or full address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium mb-1" htmlFor="areaSize">Area Size (sq ft)</label>
                    <input
                      type="number" id="areaSize" name="areaSize"
                      value={formData.areaSize} onChange={handleChange}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1" htmlFor="budget">Budget Range</label>
                    <select
                      id="budget" name="budget"
                      value={formData.budget} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option>Below ₹5,000</option>
                      <option>₹5,000 - ₹20,000</option>
                      <option>₹20,000 - ₹50,000</option>
                      <option>₹50,000+</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ── Pest Control specific fields ── */}
            {type === "pestControl" && (
              <>
                <div className="mb-4">
                  <label className="block font-medium mb-1" htmlFor="pestType">Pest Type</label>
                  <select
                    id="pestType" name="pestType"
                    value={formData.pestType} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {PEST_TYPES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-1">Severity</label>
                  <div className="flex gap-4">
                    {SEVERITY_LEVELS.map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio" name="severity" value={s}
                          checked={formData.severity === s}
                          onChange={handleChange}
                          className="accent-green-500"
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step 3: Date/Time + Home Visit + Files + Message ────────────── */}
        {step === 3 && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-medium mb-1" htmlFor="preferredDate">Preferred Date</label>
                <input
                  type="date" id="preferredDate" name="preferredDate"
                  value={formData.preferredDate} onChange={handleChange}
                  min={todayString()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="preferredTime">Preferred Time</label>
                <input
                  type="time" id="preferredTime" name="preferredTime"
                  value={formData.preferredTime} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* ── Home Visit request ── */}
            <div className="mb-4 border border-gray-200 rounded-lg p-4">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox" name="requiresHomeVisit"
                  checked={formData.requiresHomeVisit}
                  onChange={handleCheckboxChange}
                  className="accent-green-500"
                />
                <span className="font-medium">Request a home / site visit</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Our team will visit your location to assess the plants, garden, or pest issue in person.
              </p>
              {formData.requiresHomeVisit && (
                <div>
                  <label className="block font-medium mb-1 text-sm" htmlFor="homeVisitAddress">
                    Visit Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="homeVisitAddress" name="homeVisitAddress"
                    value={formData.homeVisitAddress} onChange={handleChange}
                    rows={2}
                    placeholder="Full address for the home visit"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="files">
                Upload Images / Documents <span className="text-gray-400 text-sm font-normal">(Optional, up to 5 files)</span>
              </label>
              <input
                type="file" id="files" name="files"
                multiple
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {formData.files.length > 0 && (
                <ul className="text-sm text-gray-500 mt-1 space-y-0.5">
                  {formData.files.map((f, i) => (
                    <li key={i}>📎 {f.name}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="message">Message <span className="text-gray-400 text-sm font-normal">(Optional)</span></label>
              <textarea
                id="message" name="message"
                value={formData.message} onChange={handleChange}
                placeholder="Describe your query in detail…"
                rows="4"
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <p className="text-xs text-right text-gray-400 mt-0.5">{formData.message.length}/500</p>
            </div>
          </div>
        )}

        {/* ── Step 4: Terms + Privacy + Submit ────────────────────────────── */}
        {step === 4 && (
          <div>
            <p className="text-gray-600 text-sm mb-4">Please review and confirm the following before submitting.</p>

            {/* Summary card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-sm text-gray-700 space-y-1">
              <p><span className="font-medium">Name:</span> {formData.name || "—"}</p>
              <p><span className="font-medium">Email:</span> {formData.email || "—"}</p>
              <p><span className="font-medium">Phone:</span> {formData.phone || "—"}</p>
              <p><span className="font-medium">Consultation:</span> {
                { plantCare: "Plant Care", landscapeDesign: "Landscape Design", pestControl: "Pest Control" }[formData.consultationType]
              }</p>
              {formData.preferredDate && <p><span className="font-medium">Date:</span> {formData.preferredDate} {formData.preferredTime && `at ${formData.preferredTime}`}</p>}
              {formData.requiresHomeVisit && (
                <p><span className="font-medium">Home Visit:</span> Requested — {formData.homeVisitAddress || "—"}</p>
              )}
            </div>

            <div className="mb-3 flex items-start gap-2">
              <input
                type="checkbox" id="agreeToTerms" name="agreeToTerms"
                checked={formData.agreeToTerms} onChange={handleCheckboxChange}
                className="mt-0.5 accent-green-500"
              />
              <label htmlFor="agreeToTerms" className="text-sm">
                I agree to the <span className="text-green-700 underline cursor-pointer">Terms &amp; Conditions</span>. <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="mb-4 flex items-start gap-2">
              <input
                type="checkbox" id="agreeToPrivacy" name="agreeToPrivacy"
                checked={formData.agreeToPrivacy} onChange={handleCheckboxChange}
                className="mt-0.5 accent-green-500"
              />
              <label htmlFor="agreeToPrivacy" className="text-sm">
                I agree to the <span className="text-green-700 underline cursor-pointer">Privacy Policy</span>. <span className="text-red-500">*</span>
              </label>
            </div>

            <p className="text-xs text-gray-400">
              🔒 Your information is secure and will never be shared with third parties.
            </p>
          </div>
        )}

        {/* ── Navigation buttons ───────────────────────────────────────────── */}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="bg-green-800 text-white py-2 px-4 rounded-lg"
            >
              Previous
            </button>
          )}

          {step < TOTAL_STEPS && (
            <button
              type="button"
              onClick={handleNext}
              className="bg-green-500 text-white py-2 px-4 rounded-lg ml-auto"
            >
              Next
            </button>
          )}

          {step === TOTAL_STEPS && (
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConsultationForm;