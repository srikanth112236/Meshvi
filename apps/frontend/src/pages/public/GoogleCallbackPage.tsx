import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getStoredOAuthRedirectUri, clearOAuthHandshakeState } from '../../utils/oauthUtils';

export const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotifications();

  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [mobileLink, setMobileLink] = useState<string | null>(null);
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
    const redirectUri = getStoredOAuthRedirectUri();

    const finishAuth = (resData: any) => {
      const token = resData.accessToken || resData.token;
      const user = resData.user;
      const refreshToken = resData.refreshToken;
      const portalScope = resData.portalScope || 'CONSUMER';
      const isNew = !!resData.isNewUser;

      // If Google sign-up was initiated from RegisterPage, enforce mandatory email OTP verification
      if (state && (state.startsWith('register_') || state.includes('register'))) {
        const emailToVerify = user?.email;
        const nameToVerify = user?.profile?.displayName || user?.email?.split('@')[0] || 'Executive';
        fetch('/api/v1/auth/register-init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameToVerify,
            email: emailToVerify,
            password: 'GoogleOAuthSecure#2026',
            agreeTerms: true,
            authProvider: 'GOOGLE',
          }),
        }).catch(() => {});

        clearOAuthHandshakeState();
        navigate(`/register?step=otp&email=${encodeURIComponent(emailToVerify || '')}&name=${encodeURIComponent(nameToVerify)}&google=1`, { replace: true });
        return;
      }

      // Save token and user in AuthContext
      login(token, user, refreshToken, portalScope);
      setIsVerified(true);

      showToast({
        title: isNew ? 'Welcome to Meshvi' : 'Welcome back',
        message: user?.profile?.displayName || user?.email || 'Executive',
        type: 'success',
      });

      // Handle mobile deep link handoff with dynamic scheme detection (Expo Go vs Standalone)
      const isMobile = state && (state.startsWith('mobile_') || state.includes('mobile'));

      if (isMobile) {
        let targetReturnUrl = 'meshvi://auth';

        // Extract and decode return scheme from state if provided (e.g. exp://192.168.1.6:8081/--/auth)
        const parts = state.split('_');
        if (parts.length >= 2 && parts[1]) {
          try {
            let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) base64 += '=';
            const decoded = atob(base64);
            if (
              decoded.startsWith('exp://') ||
              decoded.startsWith('exps://') ||
              decoded.startsWith('meshvi://') ||
              decoded.startsWith('http://') ||
              decoded.startsWith('https://')
            ) {
              targetReturnUrl = decoded;
            }
          } catch {}
        }

        const deepLink = `${targetReturnUrl}${targetReturnUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(
          token
        )}&refreshToken=${encodeURIComponent(refreshToken || '')}&user=${encodeURIComponent(
          JSON.stringify(user)
        )}`;

        setMobileLink(deepLink);

        // Auto-navigate to app scheme
        try {
          window.location.replace(deepLink);
        } catch {
          window.location.href = deepLink;
        }
        return;
      }

      // Web: Automatically transition directly to dashboard after brief verification feedback
      setTimeout(() => {
        navigate('/app/home', { replace: true });
      }, 700);
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
          clearOAuthHandshakeState();
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
      ) : (
        /* Sleek, modern verification & redirect loading screen */
        <div className="flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-300 max-w-sm w-full mx-auto p-4">
          <div className="relative">
            {isVerified ? (
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <img
                src="/meshvi-mark.png"
                alt="Meshvi"
                className="w-16 h-16 object-contain animate-pulse"
              />
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-navy">
              {isVerified ? 'Login Verified!' : 'Verifying Google credentials...'}
            </h2>
            <p className="text-xs text-text-muted">
              {mobileLink
                ? mobileLink.startsWith('exp://')
                  ? 'Returning to Expo Go...'
                  : 'Returning to MESHVI App...'
                : isVerified
                ? 'Connecting securely to your dashboard...'
                : 'Signing you in securely'}
            </p>
          </div>

          {/* Smooth, subtle loading progress bar */}
          <div className="w-52 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isVerified ? 'bg-emerald-500 w-full' : 'bg-primary w-2/3 animate-[pulse_1s_ease-in-out_infinite]'
              }`}
            />
          </div>

          {/* 1-Tap fallback button to ensure 100% reliable opening on all device browsers */}
          {mobileLink && (
            <a
              href={mobileLink}
              className="w-full mt-3 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>{mobileLink.startsWith('exp://') ? 'Open in Expo Go' : 'Open in MESHVI App'}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
