import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const REQUIREMENTS = [
  { id: 'length',    label: 'At least 8 characters',  test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter',    test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter',    test: (p) => /[a-z]/.test(p) },
  { id: 'number',    label: 'One number',              test: (p) => /\d/.test(p) },
  { id: 'special',   label: 'One special character',   test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

const NewPassword = () => {
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get('token');
  const navigate        = useNavigate();

  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPw]     = useState('');
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [error, setError]                   = useState('');
  const [isLoading, setIsLoading]           = useState(false);
  const [isSuccess, setIsSuccess]           = useState(false);
  const [tokenMissing, setTokenMissing]     = useState(false);

  useEffect(() => {
    if (!token) setTokenMissing(true);
  }, [token]);

  const allMet = REQUIREMENTS.every((r) => r.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!allMet)               return setError('Please meet all password requirements.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
            <Lock className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-500">Create a strong new password</p>
        </div>

        {tokenMissing && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <span>
              Invalid or missing reset token.{' '}
              <Link to="/forgetpassword" className="underline font-medium">Request a new link</Link>.
            </span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">Password Updated!</h3>
            <p className="text-gray-500 text-sm">
              Your password has been changed. Redirecting to sign in…
            </p>
            <Link to="/login" className="inline-block text-sm font-medium text-green-600 hover:underline">
              Go to Sign In now →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password" disabled={tokenMissing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100" />
                <button type="button" onClick={() => setShowPw(!showPw)} disabled={tokenMissing}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Requirements checklist */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {REQUIREMENTS.map((req) => (
                <div key={req.id} className="flex items-center gap-2 text-sm">
                  {req.test(password)
                    ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    : <XCircle    className="h-4 w-4 text-gray-300 shrink-0" />}
                  <span className={req.test(password) ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Confirm your password" disabled={tokenMissing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} disabled={tokenMissing}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Live match indicator */}
              {confirmPassword.length > 0 && (
                <p className={`mt-1 text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm flex items-center gap-2">
                <XCircle className="h-5 w-5 shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={isLoading || tokenMissing}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              {isLoading
                ? <span className="inline-flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Updating…
                  </span>
                : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewPassword;