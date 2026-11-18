import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ChevronDown, Camera, AlertCircle } from 'lucide-react';
import api from '../services/api';
// ── FIX: Cloudflare Turnstile CAPTCHA widget ─────────────────────────────────
import TurnstileWidget from './TurnstileWidget';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
  });
  const [showPw, setShowPw]               = useState({ password: false, confirmPassword: false });
  const [error, setError]                 = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  const [termsAgreed, setTermsAgreed]     = useState(false);
  const [avatar, setAvatar]               = useState(null);       // File object
  const [avatarPreview, setAvatarPreview] = useState(null);       // Data-URL
  const avatarInputRef                    = useRef(null);
  const navigate                          = useNavigate();

  // ── FIX: CAPTCHA state ────────────────────────────────────────────────────
  // captchaToken: the solved Turnstile token appended to the signup FormData.
  // Cleared after every submit attempt — tokens are single-use, so resubmitting
  // a stale one always fails Cloudflare's siteverify check on the backend.
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const captchaRef = useRef(null);

  const resetCaptcha = () => {
    setCaptchaToken('');
    captchaRef.current?.reset();
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ── Avatar picker ─────────────────────────────────────────────────────── */
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // FIX: match backend MIME allowlist (jpg/jpeg/png/webp only).
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return setError('Please select a jpg, jpeg, png, or webp image.');
    }
    if (file.size > 5 * 1024 * 1024) {
      return setError('Avatar must be smaller than 5 MB.');
    }

    setAvatar(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setError('');
  };

  /* ── Submit ────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { fullName, email, password, confirmPassword, phone, gender } = formData;

    // ── Client-side validation ────────────────────────────────────────────
    if (!fullName || !email || !password || !confirmPassword || !phone || !gender) {
      return setError('All fields are required.');
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 120) {
      return setError('Full name must be 2–120 characters.');
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError('Please enter a valid email address.');
    }
    if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) {
      return setError('Please enter a valid phone number.');
    }
    // FIX: minimum raised from 6 → 8 to match the backend rule.
    // The old check (>= 6) let the request through on the client but the
    // backend rejected it with 422, which appeared as a confusing 400 error.
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (password.length > 128) {
      return setError('Password must be 128 characters or fewer.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!termsAgreed) {
      return setError('You must agree to the Terms of Service and Privacy Policy.');
    }
    // ── FIX: CAPTCHA gate — checked client-side before spending a network
    // round-trip. The backend re-verifies independently regardless.
    if (!captchaToken) {
      return setError('Please complete the CAPTCHA before creating your account.');
    }

    setIsLoading(true);
    try {
      // FIX: always send as multipart/form-data so multer can parse the body
      // on the backend — regardless of whether an avatar was chosen.
      // Previously, JSON was sent when there was no avatar, but the backend
      // now mounts multer (which only parses multipart) on /signup for every
      // request. Sending JSON would leave req.body unparsed → 400 from validators.
      const payload = new FormData();
      payload.append('fullName', fullName.trim());
      payload.append('email',    email.trim().toLowerCase());
      payload.append('password', password);
      payload.append('phone',    phone.trim());
      payload.append('gender',   gender);
      // ── FIX: CAPTCHA token travels as just another form field — multer
      // parses it into req.body.turnstileToken on the backend exactly like
      // the JSON-body routes do.
      payload.append('turnstileToken', captchaToken);
      if (avatar) {
        payload.append('avatar', avatar);
      }

      await api.post('/auth/signup', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/login', { state: { signedUp: true } });
    } catch (err) {
      const data = err.response?.data;
      // ── FIX: surface CAPTCHA-specific backend errors (CAPTCHA_MISSING /
      // CAPTCHA_INVALID / CAPTCHA_EXPIRED) using the same `message` field,
      // and force a fresh challenge so the user isn't stuck retrying with a
      // dead token.
      setError(data?.message || data?.error || 'An error occurred. Please try again.');
      resetCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  /* ── UI ────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">

        {/* Header */}
        <div className="text-center mb-8">
          {/* Avatar picker */}
          <div className="relative inline-block mb-4">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-green-400 hover:border-green-600 transition"
              title="Click to upload avatar"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <User className="h-9 w-9 text-green-500" />
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white rounded-full p-1.5 shadow transition"
              title="Upload photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            {/* FIX: accept restricted to backend-allowed types only */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-1 text-sm text-gray-500">
            {avatarPreview ? 'Looking good! Fill in your details below.' : 'Join us today and start your journey'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text" name="fullName" value={formData.fullName} onChange={handleChange}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="tel" name="phone" value={formData.phone} onChange={handleChange}
              placeholder="Phone Number (e.g. +91 98765 43210)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Gender */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <select
              name="gender" value={formData.gender} onChange={handleChange}
              className={`w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none ${!formData.gender ? 'text-gray-400' : ''}`}
            >
              <option value="" disabled hidden>Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type={showPw.password ? 'text' : 'password'}
              name="password" value={formData.password} onChange={handleChange}
              placeholder="Password (min. 8 characters)"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => ({ ...p, password: !p.password }))}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPw.password ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type={showPw.confirmPassword ? 'text' : 'password'}
              name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => ({ ...p, confirmPassword: !p.confirmPassword }))}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPw.confirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 pt-1">
            <input
              id="terms" type="checkbox" checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="h-4 w-4 mt-0.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/termsandconditions" className="text-green-600 font-medium hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacypolicies" className="text-green-600 font-medium hover:underline">Privacy Policy</Link>
            </label>
          </div>

          {/* ── FIX: Cloudflare Turnstile CAPTCHA widget ──────────────────── */}
          <div>
            <TurnstileWidget
              ref={captchaRef}
              onVerify={(token) => {
                setCaptchaToken(token);
                setCaptchaError('');
              }}
              onExpire={() => {
                setCaptchaToken('');
                setCaptchaError('CAPTCHA expired. Please verify again.');
              }}
              onError={() => {
                setCaptchaToken('');
                setCaptchaError('Could not load CAPTCHA. Please refresh and try again.');
              }}
            />
            {captchaError && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" /> {captchaError}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={isLoading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {isLoading
              ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              )
              : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;