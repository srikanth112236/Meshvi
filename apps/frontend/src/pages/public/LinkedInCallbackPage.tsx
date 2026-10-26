import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const LinkedInCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      const msg = errorDescription || 'LinkedIn authorization was canceled or failed.';
      setError(msg);
      showToast({
        title: 'LinkedIn Authorization Failed',
        message: msg,
        type: 'warning',
      });
      return;
    }

    if (!code) {
      setError('Missing authorization code from LinkedIn.');
      return;
    }

    // Exchange authorization code for JWT session
    const redirectUri = window.location.origin + window.location.pathname;
    fetch('/api/v1/auth/linkedin/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state, redirectUri }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !data.data?.token) {
          throw new Error(data.error?.message || data.error || 'Failed to exchange LinkedIn authorization code.');
        }

        const token = data.data.accessToken || data.data.token;
        login(token, data.data.user, data.data.refreshToken, data.data.portalScope || 'CONSUMER');

        showToast({
          title: 'LinkedIn Authenticated',
          message: `Welcome, ${data.data.user.email}! (Tier-1 LinkedIn Verified)`,
          type: 'success',
        });

        // If user already completed onboarding, go to home; otherwise go to onboarding wizard
        if (data.data.user?.onboardingCompleted || data.data.user?.profile?.currentTitle) {
          navigate('/app/home');
        } else {
          navigate('/app/onboarding');
        }
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to complete LinkedIn authentication.');
      });
  }, [searchParams, login, navigate, showToast]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-lg text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-[#0A66C2] text-white flex items-center justify-center mx-auto shadow-sm">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.54a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.96v-8.37H5.06v8.37z" />
          </svg>
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Authentication Error</span>
            </div>
            <p className="text-xs text-text-muted bg-rose-50 border border-rose-200 rounded-xl p-3 text-left">
              {error}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Loader2 className="w-7 h-7 text-[#0A66C2] animate-spin mx-auto" />
            <h2 className="text-sm font-bold text-navy">Authenticating with LinkedIn OpenID...</h2>
            <p className="text-xs text-text-muted">
              Verifying cryptographic credentials and provisioning your enterprise session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
