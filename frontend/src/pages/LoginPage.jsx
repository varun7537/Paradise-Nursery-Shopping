// src/pages/LoginPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  clearAuthError,
  selectAuthLoading,
  selectAuthError,
  selectIsLoggedIn,
  selectIsAdmin,
  selectHydrating,
} from '../store/authSlice';
// ── FIX: Cloudflare Turnstile CAPTCHA widget ─────────────────────────────────
import TurnstileWidget from './TurnstileWidget';

const ROUTES = {
  adminDashboard: '/admin/admindashboard',
  userHome: '/',
};

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const intendedPath = location.state?.from?.pathname || null;
  const justSignedUp = location.state?.signedUp === true;

  const loading    = useSelector(selectAuthLoading);
  const error      = useSelector(selectAuthError);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isAdmin    = useSelector(selectIsAdmin);
  const hydrating  = useSelector(selectHydrating);

  const [form, setForm]                 = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // ── FIX: CAPTCHA state ──────────────────────────────────────────────────
  // captchaToken  : the solved Turnstile token, sent to the backend with the
  //                 login request. Cleared after every submit attempt because
  //                 Turnstile tokens are single-use — reusing a stale token
  //                 will always be rejected by Cloudflare's siteverify call.
  // captchaError  : local, client-side-only message (e.g. "please complete
  //                 the CAPTCHA") shown before the form even reaches the server.
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const captchaRef = useRef(null);

  useEffect(() => {
    if (!hydrating && isLoggedIn && !loading && intendedPath) {
      navigate(intendedPath, { replace: true });
    }
  }, [hydrating, isLoggedIn, isAdmin, navigate, loading, intendedPath]);

  useEffect(() => () => { dispatch(clearAuthError()); }, [dispatch]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── FIX: reset the widget + clear the token whenever a login attempt
  // finishes (success or failure) or the server returns a CAPTCHA-specific
  // error, so the user is never able to resubmit a consumed/expired token.
  const resetCaptcha = () => {
    setCaptchaToken('');
    captchaRef.current?.reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ── FIX: client-side gate — don't even hit the network if no token yet.
    if (!captchaToken) {
      setCaptchaError('Please complete the CAPTCHA before signing in.');
      return;
    }
    setCaptchaError('');

    const loginPayload = {
      email: form.email.trim(),
      password: form.password,
      turnstileToken: captchaToken,
    };

    dispatch(loginUser(loginPayload))
      .unwrap()
      .then((data) => {
        const role = data?.user?.role ?? 'User';
        if (role === 'Admin' || data?.user?.isAdmin === true) {
          navigate(ROUTES.adminDashboard, { replace: true });
        } else {
          navigate(ROUTES.userHome, { replace: true });
        }
      })
      .catch((err) => {
        // ── DEBUG: if the backend says "Validation failed." specifically
        // (as opposed to "Invalid email or password" etc.), it almost
        // always means turnstileToken never reached the server — i.e. the
        // loginUser thunk in authSlice.js isn't forwarding it in the POST
        // body. Surfacing this in the console makes that obvious instead
        // of looking like a CAPTCHA-provider problem.
        if (typeof err === 'string' && err.toLowerCase().includes('validation failed')) {
          console.error(
            'Login validation failed — check that authSlice.js\'s loginUser ' +
            'thunk forwards `turnstileToken` in its request body. Payload sent:',
            loginPayload
          );
        }
        // Any failed attempt (bad credentials OR rejected/expired CAPTCHA)
        // forces a fresh challenge — the server's message is already
        // surfaced via selectAuthError/Redux.
        resetCaptcha();
      });
  };

  if (hydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
            <Lock className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
        </div>

        {justSignedUp && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg text-sm">
            ✅ Account created! Please sign in to continue.
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              Remember me
            </label>
            <Link
              to="/forgetpassword"
              className="text-sm text-green-600 font-medium hover:underline"
            >
              Forgot password?
            </Link>
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
                // Token timed out client-side before submission — clear it
                // so handleSubmit's guard catches it and asks for a retry.
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in…</>
              : 'Sign in'
            }
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-600 font-medium hover:underline">
              Sign up now
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;