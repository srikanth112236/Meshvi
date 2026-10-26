import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotifications();

  const [error, setError] = useState<string | null>(null);
  const [mobileLink, setMobileLink] = useState<string | null>(null);
  const [targetPath, setTargetPath] = useState<string>('/app/home');
  const hasExchangedRef = useRef(false);

  useEffect(() => {
    if (hasExchangedRef.current) return;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Also support implicit hash token if provided
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const idToken = hashParams.get('id_token');

    if (errorParam) {
      setError(errorDescription || errorParam || 'Google authorization was canceled.');
      return;
    }

    if (!code && !idToken) {
      setError('No authorization credentials received from Google.');
      return;
    }

    hasExchangedRef.current = true;
    const redirectUri = window.location.origin + window.location.pathname;

    const finishAuth = (resData: any) => {
      const token = resData.accessToken || resData.token;
      const user = resData.user;
      const refreshToken = resData.refreshToken;
      const portalScope = resData.portalScope || 'CONSUMER';
      const isNew = !!resData.isNewUser;
      const onboardingCompleted =
        resData.onboardingCompleted ?? user?.onboardingCompleted ?? false;

      // Save token and user in AuthContext
      login(token, user, refreshToken, portalScope);

      showToast({
        title: isNew ? 'Welcome to Meshvi' : 'Welcome back',
        message: user?.profile?.displayName || user?.email || 'Executive',
        type: 'success',
      });

      const nextRoute = isNew || !onboardingCompleted ? '/app/onboarding' : '/app/home';
      setTargetPath(nextRoute);

      // If OAuth was initiated by Meshvi Mobile, hand off session via deep link
      if (state && (state.startsWith('mobile_') || state.includes('mobile'))) {
        try {
          const deepLink = `meshvi://auth?token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(
            refreshToken || ''
          )}&user=${encodeURIComponent(JSON.stringify(user))}`;
          setMobileLink(deepLink);
          window.location.href = deepLink;
        } catch {}
        return;
      }

      // Web: Instantly move to dashboard (or onboarding for first-time user)
      navigate(nextRoute, { replace: true });
    };

    if (code) {
      fetch('/api/v1/auth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state, redirectUri }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success || !data.data?.token) {
            throw new Error(data.error?.message || data.error || 'Failed to sign in with Google.');
          }
          finishAuth(data.data);
        })
        .catch((err: any) => {
          setError(err.message || 'Failed to sign in with Google.');
        });
    } else if (idToken) {
      fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success || !data.data?.token) {
            throw new Error(data.error?.message || data.error || 'Failed to sign in with Google.');
          }
          finishAuth(data.data);
        })
        .catch((err: any) => {
          setError(err.message || 'Failed to sign in with Google.');
        });
    }
  }, [searchParams, login, navigate, showToast]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {error ? (
        <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-sm text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-navy">Authentication Failed</h3>
            <p className="text-xs text-text-muted">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="w-full py-2 px-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </button>
        </div>
      ) : mobileLink ? (
        <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-navy">Google Verified!</h3>
            <p className="text-xs text-text-muted">
              Returning to MESHVI Mobile App. If your app did not open automatically, tap below.
            </p>
          </div>

          <a
            href={mobileLink}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open MESHVI Mobile App</span>
          </a>

          <button
            type="button"
            onClick={() => navigate(targetPath, { replace: true })}
            className="text-xs text-text-muted hover:text-navy font-medium underline cursor-pointer pt-2"
          >
            Or continue in Web Browser
          </button>
        </div>
      ) : (
        /* Simple, clean, effective loading state */
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="relative">
            <img
              src="/meshvi-mark.png"
              alt="Meshvi"
              className="w-16 h-16 object-contain animate-pulse"
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-navy">Loading dashboard...</h2>
            <p className="text-xs text-text-muted">Signing you in securely</p>
          </div>

          {/* Smooth subtle loading bar */}
          <div className="w-48 bg-slate-200 rounded-full h-1 overflow-hidden">
            <div className="bg-primary h-1 rounded-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
        </div>
      )}
    </div>
  );
};
