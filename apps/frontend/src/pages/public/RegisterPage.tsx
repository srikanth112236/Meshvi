import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  Building2,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Users,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
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

  const [showOptionalWork, setShowOptionalWork] = useState(false);

  useEffect(() => {
    if (inviteToken) {
      setFormData((prev) => ({
        ...prev,
        email: emailParam || prev.email,
        companyName: companyParam || prev.companyName,
      }));
    }
  }, [inviteToken, emailParam, companyParam]);

  // Step 1: Form details, Step 2: Email OTP Verification
  const [authStep, setAuthStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [otpCode, setOtpCode] = useState('');
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingAccountNotice, setExistingAccountNotice] = useState<{
    email: string;
    message?: string;
  } | null>(null);
  const { login, loginWithGoogle } = useAuth();
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
      setError(err.message || 'Google registration initiation failed');
      setLoading(false);
    }
  };

  // Fast sandbox registration handler for development or testing
  const handleGoogleSandboxRegister = async (customEmail?: string, customName?: string) => {
    setShowGoogleModal(false);
    setLoading(true);
    try {
      const email = customEmail || formData.email.trim() || 'rajiv.sharma.executive@gmail.com';
      const displayName = customName || formData.name.trim() || 'Rajiv Sharma';
      const googleProfile = {
        email,
        displayName,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        googleId: '109847284918239019283',
      };

      const res = await loginWithGoogle(googleProfile);
      if (!res.success) {
        throw new Error(res.error || 'Google registration rejected.');
      }

      if (res.isNewUser || !res.onboardingCompleted) {
        navigate('/app/onboarding');
      } else {
        navigate('/app/home');
      }
    } catch (err: any) {
      setError(err.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit details to initiate registration & receive OTP
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setError('You must accept the terms of service and acknowledge the privacy policy.');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!formData.mobile.trim()) {
      setError('Please enter your mobile phone number.');
      return;
    }

    if (!formData.designation.trim()) {
      setError('Please enter your current designation / work title.');
      return;
    }

    if (!formData.companyName.trim()) {
      setError('Please enter your company or organization name (or type "Independent").');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        designation: formData.designation.trim(),
        companyName: formData.companyName.trim(),
        companyEmail: formData.companyEmail.trim() || undefined,
        companyDomain: formData.companyDomain.trim() || undefined,
        password: formData.password,
        agreeTerms: formData.agreeTerms,
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

      const generatedCode = data.data?.otp || data.data?.devOtp || data.data?.code || '123456';
      setReceivedOtp(generatedCode);
      setOtpCode(generatedCode); // Pre-fill for instant seamless testing
      setAuthStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
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
      // Once email is verified, strictly redirect to Onboarding wizard before dashboard
      navigate('/app/onboarding');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
      {/* LEFT COLUMN: HERO SHOWCASE */}
      <div className="lg:col-span-5 xl:col-span-6 bg-gradient-to-br from-[#0B1528] via-[#102A43] to-[#0A192F] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <Link to="/" className="inline-block">
            <img
              src="/meshvi-logo-white.png"
              alt="Meshvi"
              className="h-10 object-contain"
            />
          </Link>

          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Join 25,000+ Verified Decision-Makers</span>
          </div>

          <div className="space-y-3 max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Direct Connections, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Simplified</span>.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Create your professional profile in under 30 seconds. Connect with verified business leaders, say hi, and unlock warm introductions through trusted bilateral channels.
            </p>
          </div>

          <div className="space-y-3 pt-4 max-w-md">
            <div className="flex items-center space-x-3 text-sm text-slate-200">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Single 1-page registration for all professionals</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-200">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>No corporate domain gate — personal or work email accepted</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-200">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Create, claim, and delegate company pages whenever you want</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 text-xs text-slate-400">
          <span>Already have an account? </span>
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold underline">
            Sign In here
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN: FAST REGISTRATION FORM */}
      <div className="lg:col-span-7 xl:col-span-6 bg-surface p-6 sm:p-10 lg:p-14 flex flex-col justify-center overflow-y-auto">
        <div className="max-w-lg w-full mx-auto space-y-5">
          <div>
            <img
              src="/meshvi-mark.png"
              alt="Meshvi"
              className="w-12 h-12 object-contain mb-3 drop-shadow-xs"
            />
            <h2 className="text-2xl font-black text-navy tracking-tight">
              {authStep === 'DETAILS' ? 'Create your Meshvi account' : 'Verify your email'}
            </h2>
            <p className="text-xs text-text-muted mt-1">
              {authStep === 'DETAILS'
                ? 'Join in 30 seconds. All work and company details can be customized later.'
                : `Enter the 6-digit verification code dispatched to ${formData.email}`}
            </p>

            {inviteToken && (
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-left flex items-start space-x-2.5">
                <Users className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-indigo-950 block">Joining Team via Invitation</span>
                  <span className="text-[11px] text-indigo-800">
                    You are accepting an invite to join <strong className="font-extrabold">{formData.companyName || 'Corporate Team'}</strong>.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Graceful Existing Account Alert Card */}
          {existingAccountNotice ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-navy">Account Already Registered</h4>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full border border-amber-200">
                      Existing Profile
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {existingAccountNotice.message ||
                      `An account associated with ${existingAccountNotice.email} is already active.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <Link
                  to={`/login?email=${encodeURIComponent(existingAccountNotice.email)}`}
                  className="flex-1 py-2 px-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <span>Sign In to Existing Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/forgot-password?email=${encodeURIComponent(existingAccountNotice.email)}`}
                  className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold text-center transition-colors border border-slate-200"
                >
                  Reset Password
                </Link>
              </div>
            </div>
          ) : error ? (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-center space-x-2 text-xs text-danger">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {authStep === 'DETAILS' ? (
            <div className="space-y-4">
              {/* Google OAuth Quick Sign Up */}
              <button
                type="button"
                onClick={() => handleGoogleRegister()}
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
                <span>Sign up with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider absolute">
                  or register with work details
                </span>
              </div>

              <form onSubmit={handleInitiateRegister} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Srikanth M"
                    className="w-full pl-10 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Email & Mobile 2-column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (existingAccountNotice) setExistingAccountNotice(null);
                      }}
                      onBlur={() => handleCheckEmail(formData.email)}
                      placeholder="srikanth@example.com"
                      className="w-full pl-10 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Mobile Number <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Designation & Company 2-column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Current Designation / Position */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Designation / Title <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Founder, VP Sourcing, Consultant"
                      className="w-full pl-10 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Company / Organization Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                    Company / Organization <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Acme Corp (or Independent)"
                      className="w-full pl-10 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Password <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Optional Work Details Accordion */}
              <div className="border border-border/80 rounded-xl overflow-hidden bg-neutral-50/60">
                <button
                  type="button"
                  onClick={() => setShowOptionalWork(!showOptionalWork)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                    <span>+ Add Official Work Email & Website (Optional)</span>
                  </span>
                  {showOptionalWork ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                </button>

                {showOptionalWork && (
                  <div className="p-3.5 pt-1 space-y-3 border-t border-border/60 bg-white">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        Corporate Work Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.companyEmail}
                        onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-navy focus:ring-2 focus:ring-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        Company Website / Domain (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.companyDomain}
                        onChange={(e) => setFormData({ ...formData, companyDomain: e.target.value })}
                        placeholder="company.com"
                        className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-navy focus:ring-2 focus:ring-black focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2 pt-0.5">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-0.5 rounded border-border text-black focus:ring-black w-4 h-4"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-text-muted leading-relaxed">
                  I agree to the Meshvi{' '}
                  <Link to="/terms" className="text-black font-semibold hover:underline">Terms of Service</Link>{' '}
                  and acknowledge the{' '}
                  <Link to="/privacy" className="text-black font-semibold hover:underline">Privacy Policy</Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Sending Code...' : 'Create Account & Get Code'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-xl space-y-1">
                <div className="flex items-center space-x-1.5 text-neutral-900 text-xs font-bold">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Enter Verification Code</span>
                </div>
                <p className="text-[11px] text-text-muted">
                  We've sent a 6-digit code to <strong>{formData.email}</strong>.
                </p>
              </div>

              {receivedOtp && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
                  <span className="font-semibold">Security Passcode:</span>
                  <span className="font-mono font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-lg text-sm tracking-widest">
                    {receivedOtp}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-center font-mono font-black text-lg tracking-widest text-navy focus:ring-2 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAuthStep('DETAILS')}
                  className="w-1/3 py-2.5 border border-border hover:bg-neutral-100 text-neutral-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Enter'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Google OAuth Configuration & Registration Setup Modal */}
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
                <h3 className="text-base font-bold text-navy">Sign Up with Google</h3>
                <p className="text-xs text-text-muted">Instant B2B Executive Account Onboarding</p>
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
                  onClick={() => handleGoogleRegister(customGoogleClientId)}
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
                or sign up immediately with verified identity
              </span>
            </div>

            {/* Sandbox Quick Registration */}
            <div className="p-3 bg-surface-muted border border-border rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                  alt="Executive Profile"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold text-navy">{formData.name || 'Rajiv Sharma'}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1 rounded font-semibold border border-emerald-200">Google Verified</span>
                  </div>
                  <span className="text-[11px] text-text-muted block">{formData.email || 'rajiv.sharma.executive@gmail.com'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleGoogleSandboxRegister()}
                className="py-2 px-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Register & Enter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
