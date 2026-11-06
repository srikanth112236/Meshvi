import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCanonicalGoogleRedirectUri, getGoogleClientId, saveOAuthHandshakeState } from '../../utils/oauthUtils';
import { AuthShowcasePanel } from '../../components/auth/AuthShowcasePanel';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const emailQuery = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailQuery);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, logout, loginWithGoogle, violationAlert, clearViolationAlert } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (emailQuery) {
      setEmail(emailQuery);
    }
  }, [emailQuery]);

  const isViolation = searchParams.get('violation') === '1' || !!violationAlert;
  const violationMsg =
    violationAlert ||
    sessionStorage.getItem('setu_violation_reason') ||
    'Your previous session was automatically terminated due to a cross-portal clearance violation. Please sign in with authorized Consumer credentials.';

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleClientId, setCustomGoogleClientId] = useState(
    localStorage.getItem('setu_google_client_id') || ''
  );

  // Google OAuth Initiation Handler
  const handleGoogleSignIn = async (overrideClientId?: string) => {
    setError('');
    clearViolationAlert();
    setLoading(true);

    try {
      const redirectUri = getCanonicalGoogleRedirectUri();
      const clientId = getGoogleClientId(overrideClientId || customGoogleClientId);

      if (clientId) {
        if (overrideClientId) {
          localStorage.setItem('setu_google_client_id', overrideClientId.trim());
        }
        const state = Math.random().toString(36).substring(2, 15);
        saveOAuthHandshakeState(redirectUri, state);

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
          clientId
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}&access_type=offline&prompt=select_account`;
        window.location.href = googleAuthUrl;
        return;
      }

      // Check if backend has Google OAuth configured
      try {
        const checkRes = await fetch(`/api/v1/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
        const checkData = await checkRes.json();
        if (checkData.success && checkData.data?.clientId && checkData.data?.url) {
          saveOAuthHandshakeState(checkData.data.redirectUri || redirectUri, checkData.data.state || '');
          window.location.href = checkData.data.url;
          return;
        }
      } catch {}

      setLoading(false);
      setShowGoogleModal(true);
    } catch (err: any) {
      setError(err.message || 'Could not initiate Google authentication');
      setLoading(false);
    }
  };

  const handleGoogleSandboxLogin = async (customEmail?: string, customName?: string) => {
    setShowGoogleModal(false);
    setLoading(true);
    try {
      const emailVal = customEmail || 'rajiv.sharma.executive@gmail.com';
      const displayName = customName || 'Rajiv Sharma';
      const googleProfile = {
        email: emailVal,
        displayName,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        googleId: '109847284918239019283',
      };

      const res = await loginWithGoogle(googleProfile);
      if (!res.success) {
        throw new Error(res.error || 'Google authentication rejected.');
      }

      if (res.isNewUser || !res.onboardingCompleted) {
        navigate('/app/onboarding');
      } else {
        navigate('/app/search');
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearViolationAlert();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, targetPortal: 'CONSUMER' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to sign in.');
      }

      const roles: string[] = data.data.user?.roles || [];
      if (roles.includes('SUPER_ADMIN')) {
        logout();
        throw new Error(
          'ACCESS DENIED: Super Administrators cannot access Consumer Hub. Please use the dedicated Super Admin Ops terminal at /admin/login.'
        );
      }

      if (roles.includes('COMPANY_ADMIN')) {
        logout();
        throw new Error(
          'ACCESS DENIED: Company Administrators must sign in through the Company Portal at /company/login.'
        );
      }

      const token = data.data.accessToken || data.data.token;
      login(token, data.data.user, data.data.refreshToken, 'CONSUMER');

      if (!data.data.user?.profile?.currentTitle && !data.data.user?.onboardingCompleted) {
        navigate('/app/onboarding');
      } else {
        navigate('/app/search');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#edf0f5] flex items-center justify-center p-3 sm:p-6 lg:p-8 selection:bg-blue-100">
      {/* Main Container Card */}
      <div className="w-full max-w-[1360px] min-h-[720px] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_20px_70px_-10px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Auth Form */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 bg-white relative">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#078BCC] to-[#056FA8] flex items-center justify-center p-1.5 shadow-sm shrink-0 transition-transform group-hover:scale-105">
                <img
                  src="/meshvi-mark.png"
                  alt="Meshvi"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              <div className="min-w-0">
                <span className="text-base font-black text-[#142B45] tracking-tight block leading-tight">
                  Meshvi
                </span>
                <span className="text-[9px] font-extrabold text-[#078BCC] tracking-[0.22em] uppercase block leading-tight">
                  ENTERPRISE
                </span>
              </div>
            </Link>

            {/* Top-Right Switch to Register */}
            <div className="flex items-center space-x-2.5 text-xs">
              <span className="text-slate-500 hidden sm:inline">Don't have an account?</span>
              <Link
                to="/register"
                className="px-3.5 py-1.5 font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all active:scale-[0.98]"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Center Form Area */}
          <div className="w-full max-w-[360px] mx-auto py-8 sm:py-10">
            {/* Avatar Pill / Icon Squircle */}
            <div className="w-12 h-12 rounded-2xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center mx-auto mb-4 text-[#078BCC] shadow-2xs">
              <User className="w-5 h-5" strokeWidth={2} />
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 text-center tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-slate-500 text-center mt-1.5 mb-6">
              Sign in to connect with verified business leaders.
            </p>

            {/* Password Reset Notice */}
            {searchParams.get('reset') === 'success' && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-xs text-emerald-800 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Password reset successful! Sign in with your new password.</span>
              </div>
            )}

            {/* Clearance Violation Notice */}
            {isViolation && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
                <div className="flex items-center space-x-1.5 font-bold text-rose-700">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Clearance Boundary Enforced</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-600">{violationMsg}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* Social Auth Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={loading}
                className="w-full h-11 px-4 rounded-xl bg-[#f1f3f6] hover:bg-[#e7eaf0] border border-slate-200/50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2.5 transition-all shadow-2xs active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-[11px] font-medium text-slate-400">Or</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 bg-[#f8f9fa] border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-4 pr-11 bg-[#f8f9fa] border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-end pt-0.5">
                <Link
                  to="/forgot-password"
                  className="text-[11px] sm:text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 px-4 bg-[#142B45] hover:bg-[#078BCC] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-[#078BCC]/20 transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-100 sm:border-0 sm:pt-0">
            <span className="text-slate-400 font-medium text-[11px] sm:text-xs">
              © 2026 Meshvi
            </span>
            <div className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[11px] sm:text-xs font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>ENG</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Right Column: Hero Graphic Showcase Panel */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 p-2 sm:p-3">
          <AuthShowcasePanel />
        </div>
      </div>

      {/* Google OAuth Sandbox Setup Modal (Development Fallback) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Google Sign-In Configuration
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Google OAuth client ID is not configured on this host. You can provide your Google Client ID or test with a simulated enterprise sandbox session.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Google Client ID (Optional)
                </label>
                <input
                  type="text"
                  value={customGoogleClientId}
                  onChange={(e) => setCustomGoogleClientId(e.target.value)}
                  placeholder="xxxx.apps.googleusercontent.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleGoogleSandboxLogin()}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Test Sandbox Login
                </button>
                {customGoogleClientId.trim() && (
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn(customGoogleClientId)}
                    className="py-2 px-3 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg"
                  >
                    Use Client ID
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
