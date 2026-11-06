import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCanonicalGoogleRedirectUri, getGoogleClientId, saveOAuthHandshakeState } from '../../utils/oauthUtils';
import { AuthShowcasePanel } from '../../components/auth/AuthShowcasePanel';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') || searchParams.get('token');
  const emailParam = searchParams.get('email');
  const companyParam = searchParams.get('company');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    designation: '',
    companyName: '',
    companyEmail: '',
    companyDomain: '',
    password: '',
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (inviteToken) {
      setFormData((prev) => ({
        ...prev,
        email: emailParam || prev.email,
        companyName: companyParam || prev.companyName,
      }));
    }

    // Support redirect from Google OAuth callback with mandatory OTP verification
    const stepParam = searchParams.get('step');
    const emailFromUrl = searchParams.get('email');
    const nameFromUrl = searchParams.get('name');
    const googleFromUrl = searchParams.get('google');

    if (stepParam === 'otp' && emailFromUrl) {
      setFormData((prev) => ({
        ...prev,
        email: emailFromUrl,
        name: nameFromUrl || prev.name,
      }));
      if (googleFromUrl === '1') {
        setIsGoogleVerifiedFlow(true);
      }
      setAuthStep('OTP');
    }
  }, [inviteToken, emailParam, companyParam, searchParams]);

  // Step 1: Form details, Step 2: Email OTP Verification
  const [authStep, setAuthStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [isGoogleVerifiedFlow, setIsGoogleVerifiedFlow] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [existingAccountNotice, setExistingAccountNotice] = useState<{
    email: string;
    message?: string;
  } | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCheckEmail = async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) {
      setExistingAccountNotice(null);
      return;
    }
    try {
      const res = await fetch(`/api/v1/auth/check-email?email=${encodeURIComponent(emailToCheck.trim().toLowerCase())}`);
      const data = await res.json();
      if (data.success && data.data?.registered) {
        setExistingAccountNotice({
          email: data.data.email,
          message: data.data.message || `An account with this email is already registered using ${data.data.providerLabel}. Please sign in to continue.`,
        });
      } else {
        setExistingAccountNotice(null);
      }
    } catch {}
  };

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleClientId, setCustomGoogleClientId] = useState(
    localStorage.getItem('setu_google_client_id') || ''
  );

  // Google OAuth Register Handler
  const handleGoogleRegister = async (overrideClientId?: string) => {
    setError('');
    setLoading(true);

    try {
      const redirectUri = getCanonicalGoogleRedirectUri();
      const clientId = getGoogleClientId(overrideClientId || customGoogleClientId);

      if (clientId) {
        if (overrideClientId) {
          localStorage.setItem('setu_google_client_id', overrideClientId.trim());
        }
        const state = 'register_' + Math.random().toString(36).substring(2, 15);
        saveOAuthHandshakeState(redirectUri, state);

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
          clientId
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}&access_type=offline&prompt=select_account`;
        window.location.href = googleAuthUrl;
        return;
      }

      // Check if backend has Google OAuth configured
      try {
        const checkRes = await fetch(`/api/v1/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}&state=register_${Math.random().toString(36).substring(2, 10)}`);
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
      setError(err.message || 'Google registration initiation failed');
      setLoading(false);
    }
  };

  const handleGoogleSandboxRegister = async (customEmail?: string, customName?: string) => {
    setShowGoogleModal(false);
    setLoading(true);
    setError('');
    try {
      const emailVal = customEmail || formData.email.trim() || 'rajiv.sharma.executive@gmail.com';
      const displayName = customName || formData.name.trim() || 'Rajiv Sharma';

      // Pre-fill form state with verified Google identity
      setFormData((prev) => ({
        ...prev,
        email: emailVal,
        name: displayName,
        password: prev.password || 'GoogleOAuthSecure#2026',
      }));

      // MANDATORY OTP DISPATCH FOR GOOGLE REGISTRATION
      const payload = {
        name: displayName,
        email: emailVal,
        mobile: formData.mobile.trim() || '+1 555-0199',
        designation: formData.designation.trim() || 'Enterprise Member',
        companyName: formData.companyName.trim() || 'Independent',
        password: formData.password || 'GoogleOAuthSecure#2026',
        agreeTerms: true,
        track: 'INDIVIDUAL',
        authProvider: 'GOOGLE',
      };

      const res = await fetch('/api/v1/auth/register-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.error?.message || data.error || 'Failed to dispatch verification code to Google email.';
        if (
          errorMsg.toLowerCase().includes('already') ||
          errorMsg.toLowerCase().includes('registered') ||
          errorMsg.toLowerCase().includes('exists') ||
          data.error?.code === 'EMAIL_ALREADY_EXISTS'
        ) {
          setExistingAccountNotice({
            email: emailVal,
            message: errorMsg,
          });
        }
        throw new Error(errorMsg);
      }

      setIsGoogleVerifiedFlow(true);
      setOtpCode('');
      setAuthStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Google registration OTP dispatch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1: Submit details to initiate registration & receive OTP
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setError('Please create a password of at least 8 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim() || '+1 555-0199',
        designation: formData.designation.trim() || 'Enterprise Member',
        companyName: formData.companyName.trim() || 'Independent',
        companyEmail: formData.companyEmail.trim() || undefined,
        companyDomain: formData.companyDomain.trim() || undefined,
        password: formData.password,
        agreeTerms: true,
        track: 'INDIVIDUAL',
      };

      const res = await fetch('/api/v1/auth/register-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.error?.message || data.error || 'Failed to dispatch registration OTP.';
        if (
          errorMsg.toLowerCase().includes('already') ||
          errorMsg.toLowerCase().includes('registered') ||
          errorMsg.toLowerCase().includes('exists') ||
          data.error?.code === 'EMAIL_ALREADY_EXISTS'
        ) {
          setExistingAccountNotice({
            email: formData.email.trim(),
            message: errorMsg,
          });
        }
        throw new Error(errorMsg);
      }

      setOtpCode('');
      setAuthStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError('');
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim() || '+1 555-0199',
        designation: formData.designation.trim() || 'Enterprise Member',
        companyName: formData.companyName.trim() || 'Independent',
        password: formData.password,
        agreeTerms: true,
        track: 'INDIVIDUAL',
      };

      const res = await fetch('/api/v1/auth/register-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to resend verification code.');
      }
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Could not resend verification code.');
    } finally {
      setResendLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize account creation
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/verify-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Invalid or expired verification code.');
      }

      login(data.data.token || data.data.accessToken, data.data.user);
      navigate('/app/onboarding');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#edf0f5] flex items-center justify-center p-3 sm:p-6 lg:p-8 selection:bg-blue-100">
      {/* Main Container Card */}
      <div className="w-full max-w-[1360px] min-h-[720px] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_20px_70px_-10px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Form & Actions */}
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

            {/* Top-Right Switch to Login */}
            <div className="flex items-center space-x-2.5 text-xs">
              <span className="text-slate-500 hidden sm:inline">Already have an account?</span>
              <Link
                to="/login"
                className="px-3.5 py-1.5 font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all active:scale-[0.98]"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Center Form Section */}
          <div className="w-full max-w-[360px] mx-auto py-8 sm:py-10">
            {authStep === 'DETAILS' ? (
              <>
                {/* Avatar Icon Squircle */}
                <div className="w-12 h-12 rounded-2xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center mx-auto mb-4 text-slate-500 shadow-2xs">
                  <User className="w-5 h-5" strokeWidth={1.8} />
                </div>

                {/* Heading & Subtitle */}
                <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 text-center tracking-tight">
                  Create your account
                </h1>
                <p className="text-xs text-slate-500 text-center mt-1.5 mb-6">
                  Get started with Meshvi in minutes.
                </p>

                {/* Existing Account Notice */}
                {existingAccountNotice && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900 animate-fade-in">
                    <p className="font-semibold text-amber-800">Account already registered</p>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      {existingAccountNotice.message || 'An account with this email already exists.'}
                    </p>
                    <Link
                      to={`/login?email=${encodeURIComponent(existingAccountNotice.email)}`}
                      className="inline-flex items-center text-xs font-bold text-blue-700 hover:underline pt-0.5"
                    >
                      Sign in with this email &rarr;
                    </Link>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="leading-tight">{error}</span>
                  </div>
                )}

                {/* Social Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleGoogleRegister()}
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
                    <span>Sign up with Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative px-3 bg-white text-[11px] font-medium text-slate-400">Or</span>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleInitiateRegister} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full h-11 px-4 bg-[#f8f9fa] border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleCheckEmail(formData.email)}
                      required
                      className="w-full h-11 px-4 bg-[#f8f9fa] border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
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

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 px-4 bg-[#0a0d12] hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Sign up with Email</span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* OTP Verification View (Preserves all auth logic while retaining identical aesthetic) */
              <div className="space-y-4 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-2xs">
                  <KeyRound className="w-5 h-5" strokeWidth={1.8} />
                </div>

                <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 text-center tracking-tight">
                  Verify your email
                </h1>
                {isGoogleVerifiedFlow && (
                  <div className="p-2.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-center justify-center space-x-2 text-xs text-blue-900 font-semibold my-2">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google Account Linked &bull; OTP Verification Required</span>
                  </div>
                )}
                <p className="text-xs text-slate-500 text-center mt-1.5 mb-6 leading-relaxed">
                  Enter the 6-digit verification code sent to<br />
                  <span className="font-semibold text-slate-800">{formData.email}</span>
                </p>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="leading-tight">{error}</span>
                  </div>
                )}

                {resendSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>A new 6-digit code has been dispatched.</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-12 text-center text-xl font-bold tracking-[0.5em] bg-[#f8f9fa] border border-slate-200/90 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full h-11 px-4 bg-[#0a0d12] hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Verify & Complete Registration</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthStep('DETAILS')}
                      className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Edit details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendLoading}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors disabled:opacity-50"
                    >
                      {resendLoading ? 'Sending...' : 'Resend code'}
                    </button>
                  </div>
                </form>
              </div>
            )}
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
              Google Sign-Up Configuration
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
                  onClick={() => handleGoogleSandboxRegister()}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Test Sandbox Register
                </button>
                {customGoogleClientId.trim() && (
                  <button
                    type="button"
                    onClick={() => handleGoogleRegister(customGoogleClientId)}
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
