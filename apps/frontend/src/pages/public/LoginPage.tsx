import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Handshake,
  Network,
  X,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const emailQuery = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailQuery);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      const redirectUri = window.location.origin + '/auth/google/callback';
      const clientId =
        (overrideClientId && overrideClientId.trim()) ||
        customGoogleClientId.trim() ||
        (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
        '';

      if (clientId) {
        if (overrideClientId) {
          localStorage.setItem('setu_google_client_id', overrideClientId.trim());
        }
        // Redirect directly to Google's official OAuth 2.0 Account Selection screen
        const state = Math.random().toString(36).substring(2, 15);
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
          clientId,
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}&access_type=offline&prompt=select_account`;
        window.location.href = googleAuthUrl;
        return;
      }

      // Check if backend has Google OAuth configured
      try {
        const checkRes = await fetch(`/api/v1/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`);
        const checkData = await checkRes.json();
        if (checkData.success && checkData.data?.clientId && checkData.data?.url) {
          window.location.href = checkData.data.url;
          return;
        }
      } catch {}

      // If no client ID configured yet, open guidance modal
      setLoading(false);
      setShowGoogleModal(true);
    } catch (err: any) {
      setError(err.message || 'Could not initiate Google authentication');
      setLoading(false);
    }
  };

  // Fast sandbox login handler for development or testing
  const handleGoogleSandboxLogin = async (customEmail?: string, customName?: string) => {
    setShowGoogleModal(false);
    setLoading(true);
    try {
      const email = customEmail || 'rajiv.sharma.executive@gmail.com';
      const displayName = customName || 'Rajiv Sharma';
      const googleProfile = {
        email,
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
        navigate('/app/home');
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
        navigate('/app/home');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
      {/* LEFT COLUMN: APPLICATION SHOWCASE */}
      <div className="lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-[#0B1528] via-[#102A43] to-[#0A192F] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <Link to="/" className="inline-block">
            <img
              src="/meshvi-logo-white.png"
              alt="Meshvi"
              className="h-10 object-contain"
            />
          </Link>

          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sky-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Verified B2B Intent Infrastructure</span>
          </div>

          <div className="space-y-3 max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Where Executive Relationships Are Built on Purpose, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">Not Spam</span>.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              MESHVI replaces transactional cold outreach with cryptographically verified corporate profiles, mutual business intent, and high-trust warm introductions.
            </p>
          </div>

          {/* Showcase Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-2xl">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Bilateral Intent Protocol</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every outreach requires explicit business context and mutual agenda agreement before connecting.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">DNS Domain Cryptography</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Corporate domains verified via DNS TXT handshake ensuring zero impersonation or shadow accounts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <Network className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">3-Way Warm Bridges</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Facilitated introductions brokered by mutual peers with attested institutional endorsement badges.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2 hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Handshake className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Collaborative Deal Rooms</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Private virtual spaces equipped with milestones, shared objectives, and deal execution tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Strip */}
        <div className="relative z-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 max-w-xl">
          <div>
            <div className="text-2xl font-black text-white">99.4%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Executive Response</div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">100%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Verified Domains</div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">Zero</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Cold InMail Waste</div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM */}
      <div className="lg:col-span-6 xl:col-span-5 bg-surface p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <img
              src="/meshvi-mark.png"
              alt="Meshvi"
              className="w-12 h-12 object-contain mb-3 drop-shadow-xs"
            />
            <h2 className="text-2xl font-black text-navy tracking-tight">Welcome back</h2>
            <p className="text-xs text-text-muted mt-1">
              Sign in to access your MESHVI Discovery Hub, active deal rooms, and network bridges.
            </p>
          </div>

          {/* Password Reset Success Banner */}
          {searchParams.get('reset') === 'success' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-900 shadow-xs animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-800">Password Reset Successful!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Your credentials have been securely updated. Please sign in with your new password to continue.
                </p>
              </div>
            </div>
          )}

          {/* Clearance Violation Warning */}
          {isViolation && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
              <div className="flex items-center space-x-1.5 font-bold text-rose-700">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Security Clearance Boundary Enforced</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-600">{violationMsg}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-center space-x-2 text-xs text-danger">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Continue Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleGoogleSignIn()}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-all flex items-center justify-center space-x-2.5 disabled:opacity-50 hover:border-slate-400 cursor-pointer"
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
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider absolute">
                or sign in with email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="executive@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Hub'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Switch to Register */}
          <div className="pt-4 border-t border-border text-center text-xs text-text-muted">
            <span>Don't have an account yet? </span>
            <Link to="/register" className="font-bold text-primary hover:underline">
              Create an account &rarr;
            </Link>
          </div>

          {/* Dedicated Portal Links */}
          <div className="p-3 bg-surface-muted rounded-xl border border-border text-[11px] text-text-muted space-y-1">
            <span className="font-bold text-navy block">Dedicated Administrative Logins:</span>
            <div className="flex items-center space-x-4">
              <Link to="/company/login" className="text-primary hover:underline font-medium">
                Company Admin Portal &rarr;
              </Link>
              <Link to="/admin/login" className="text-text-muted hover:text-navy hover:underline">
                Super Admin Terminal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Google OAuth Configuration & Identity Setup Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-navy p-1 rounded-lg hover:bg-surface-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Google OAuth 2.0 Authentication</h3>
                <p className="text-xs text-text-muted">Direct Google Account SSO & Identity Sync</p>
              </div>
            </div>

            {/* Instruction Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex items-center space-x-1.5 font-bold text-navy">
                <Info className="w-4 h-4 text-primary" />
                <span>Google Cloud Console Credentials Required:</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600 pl-1 leading-relaxed">
                <li>Create an OAuth 2.0 Web Client ID in Google Cloud Console.</li>
                <li>
                  Authorized JavaScript origin: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-primary font-mono text-[10px]">https://setu-frontend.onrender.com</code>
                </li>
                <li>
                  Authorized redirect URI: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-primary font-mono text-[10px]">https://setu-frontend.onrender.com/auth/google/callback</code>
                </li>
                <li>Add Client ID & Secret to <code className="font-mono text-[10px]">apps/frontend/.env</code> and <code className="font-mono text-[10px]">apps/backend/.env</code>.</li>
              </ul>
            </div>

            {/* Quick Test Client ID input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-navy">
                Test with your Google Client ID now:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customGoogleClientId}
                  onChange={(e) => setCustomGoogleClientId(e.target.value)}
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-focus focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(customGoogleClientId)}
                  disabled={!customGoogleClientId.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Launch OAuth
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-surface px-2.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider absolute">
                or test immediately in sandbox
              </span>
            </div>

            {/* Sandbox Quick Sign-In */}
            <div className="p-3 bg-surface-muted border border-border rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                  alt="Rajiv Sharma"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-navy">Rajiv Sharma</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1 rounded font-semibold border border-emerald-200">Google Verified</span>
                  </div>
                  <span className="text-[11px] text-text-muted block">rajiv.sharma.executive@gmail.com</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleGoogleSandboxLogin()}
                className="py-2 px-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Sign In Directly</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
