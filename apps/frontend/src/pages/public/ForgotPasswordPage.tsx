import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  Send,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // 10-minute countdown timer (600 seconds)
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let interval: any = null;
    if (timerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsLeft]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Step 1: Dispatch 6-digit recovery code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your registered work email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to dispatch recovery code.');
      }

      if (data.data?.devOtp) {
        setDevOtp(data.data.devOtp);
      }

      setStep('RESET');
      setSecondsLeft(600); // 10 minutes
      setTimerActive(true);
    } catch (err: any) {
      setError(err.message || 'Unable to request password recovery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password and force re-login
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Password reset failed.');
      }

      // Security requirement: strictly clear old sessions and force fresh re-login
      logout();
      navigate('/login?reset=success', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Unable to reset password. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-muted/30">
      <div className="max-w-md w-full bg-surface p-8 sm:p-10 rounded-3xl border border-border shadow-xl space-y-6 animate-fade-in">
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <img
            src="/meshvi-mark.png"
            alt="Meshvi"
            className="w-14 h-14 object-contain mx-auto mb-2 drop-shadow-xs"
          />
          <h1 className="text-2xl font-black text-navy tracking-tight">
            {step === 'REQUEST' ? 'Reset Your Password' : 'Enter 6-Digit Code'}
          </h1>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            {step === 'REQUEST'
              ? 'Enter your verified work email. We will send a secure 6-digit authorization code.'
              : `A 6-digit recovery code was dispatched to ${email}.`}
          </p>
        </div>

        {/* 10-Minute Expiry Countdown Pill (Step 2) */}
        {step === 'RESET' && (
          <div className="flex items-center justify-between p-3 bg-primary-soft/60 border border-primary/20 rounded-xl text-xs">
            <div className="flex items-center space-x-2 text-navy font-bold">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span>Code Expiry Window:</span>
            </div>
            <span
              className={`font-black font-mono px-2 py-0.5 rounded-md ${
                secondsLeft < 120
                  ? 'bg-rose-100 text-rose-700 animate-pulse'
                  : 'bg-primary text-white'
              }`}
            >
              {secondsLeft > 0 ? formatTimer(secondsLeft) : 'Expired'}
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-start space-x-2 text-xs text-danger animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: REQUEST CODE */}
        {step === 'REQUEST' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="executive@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Sending Code...' : 'Send 10-Minute Reset Code'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY CODE & NEW PASSWORD */}
        {step === 'RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Quick Fill in Dev Mode */}
            {devOtp && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <span className="font-semibold">Dev Auto-fill Code: <strong>{devOtp}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtp(devOtp)}
                  className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded text-[11px]"
                >
                  Fill Code
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                6-Digit Security Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-mono tracking-widest text-navy focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                New Password (Min 8 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-10 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-text-muted hover:text-navy"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || secondsLeft === 0}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Updating Credentials...' : 'Update Password & Re-login'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            {/* Resend Code Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleRequestCode}
                disabled={loading}
                className="text-xs text-primary hover:underline font-semibold inline-flex items-center space-x-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Didn't receive code? Resend</span>
              </button>
            </div>
          </form>
        )}

        {/* Security Assurance Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-semibold text-text-muted hover:text-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to sign in
          </Link>
          <span className="flex items-center space-x-1 text-[11px] text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Cryptographic Reset</span>
          </span>
        </div>
      </div>
    </div>
  );
};
