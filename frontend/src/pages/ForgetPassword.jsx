import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
// ── FIX: Cloudflare Turnstile CAPTCHA widget ─────────────────────────────────
import TurnstileWidget from './TurnstileWidget';

const ForgetPassword = () => {
  const [email, setEmail]         = useState('');
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── FIX: CAPTCHA state ────────────────────────────────────────────────────
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const captchaRef = useRef(null);

  const resetCaptcha = () => {
    setCaptchaToken('');
    captchaRef.current?.reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email)                       return setError('Please enter your email address.');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Please enter a valid email address.');
    // ── FIX: CAPTCHA gate — checked client-side before spending a network
    // round-trip. The backend re-verifies independently regardless.
    if (!captchaToken) {
      return setError('Please complete the CAPTCHA before continuing.');
    }

    setIsLoading(true);
    try {
      // ── FIX: turnstileToken sent alongside email — this endpoint returns
      // a generic 200 success message either way (to avoid leaking whether
      // an email is registered), so CAPTCHA failures are the only thing
      // that will actually produce an error response here.
      await api.post('/auth/forgot-password', { email, turnstileToken: captchaToken });
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      // ── FIX: surface CAPTCHA-specific backend errors (CAPTCHA_MISSING /
      // CAPTCHA_INVALID / CAPTCHA_EXPIRED) and force a fresh challenge —
      // Backend always returns 200 on a normal request, so an error here
      // means either a real server fault or a rejected CAPTCHA.
      setError(data?.message || data?.error || 'Something went wrong. Please try again.');
      resetCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">

        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Sign in
        </Link>

        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
                <Mail className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">Forgot Password?</h2>
              <p className="mt-2 text-sm text-gray-500">
                No worries — enter your email and we'll send a reset link.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition" />
              </div>

              {/* ── FIX: Cloudflare Turnstile CAPTCHA widget ──────────────── */}
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

              <button type="submit" disabled={isLoading}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                {isLoading
                  ? <span className="inline-flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending…
                    </span>
                  : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
              <CheckCircle className="h-9 w-9 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Check your inbox</h3>
            <p className="text-gray-500 text-sm">
              If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
            </p>
            <p className="text-gray-400 text-xs">
              Didn't receive it? Check your spam folder or{' '}
              <button onClick={() => { setSubmitted(false); setEmail(''); }}
                className="text-green-600 font-medium hover:underline">
                try again.
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;