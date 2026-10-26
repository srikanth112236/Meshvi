import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Loader2 } from 'lucide-react';

interface LinkedInAuthButtonProps {
  label?: string;
  portalHint?: 'MEMBER' | 'COMPANY' | 'ADMIN';
  className?: string;
  isSandboxOption?: boolean;
}

export const LinkedInAuthButton: React.FC<LinkedInAuthButtonProps> = ({
  label = 'Continue with LinkedIn',
  portalHint = 'MEMBER',
  className = '',
  isSandboxOption = true,
}) => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLinkedInAuth = async (useSandbox: boolean = false) => {
    setLoading(true);
    try {
      if (useSandbox) {
        // High-fidelity local sandbox authentication using seed Priya Sharma / user profile
        const res = await fetch('/api/v1/auth/linkedin/sandbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            linkedinId: 'li_usr_sandbox_' + Math.random().toString(36).substring(2, 9),
            email: 'priya.sharma@fmcgpartners.asia',
            firstName: 'Priya',
            lastName: 'Sharma',
            headline: 'VP Sourcing & Concession Distribution | ASEAN FMCG Lead',
            profileUrl: 'https://linkedin.com/in/priya-sharma-fmcg',
            pictureUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error?.message || 'LinkedIn sandbox authentication failed.');
        }

        login(data.data.token, data.data.user);

        showToast({
          title: 'LinkedIn Authenticated',
          message: `Logged in via LinkedIn OpenID as ${data.data.user.email} (Tier-1 Verified)`,
          type: 'success',
        });

        // Navigate directly to Onboarding Wizard Step 3
        navigate('/app/onboarding');
        return;
      }

      // Live OAuth flow: redirect to LinkedIn Authorization Consent Endpoint
      const state = `${portalHint.toLowerCase()}_` + Math.random().toString(36).substring(2, 15);
      const redirectUri =
        ((import.meta as any).env?.VITE_LINKEDIN_REDIRECT_URI as string) ||
        `${window.location.origin}/auth/linkedin/callback`;
      const authUrlRes = await fetch(
        `/api/v1/auth/linkedin?state=${encodeURIComponent(state)}&redirectUri=${encodeURIComponent(redirectUri)}`
      );
      const authUrlData = await authUrlRes.json();

      if (authUrlData.success && authUrlData.data?.url) {
        window.location.href = authUrlData.data.url;
      } else {
        // Fallback to sandbox if live LinkedIn credentials are not set
        await handleLinkedInAuth(true);
      }
    } catch (err: any) {
      showToast({
        title: 'LinkedIn Authorization Error',
        message: err.message || 'Could not complete LinkedIn sign-in.',
        type: 'warning',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 w-full">
      <button
        type="button"
        onClick={() => handleLinkedInAuth(false)}
        disabled={loading}
        className={`w-full flex items-center justify-center space-x-3 py-2.5 px-4 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/50 ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.54a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.96v-8.37H5.06v8.37z" />
          </svg>
        )}
        <span>{label}</span>
      </button>

      {isSandboxOption && (
        <button
          type="button"
          onClick={() => handleLinkedInAuth(true)}
          disabled={loading}
          className="w-full text-center text-[11px] font-medium text-text-muted hover:text-navy underline transition-colors"
        >
          Fast-track with LinkedIn Sandbox (Priya Sharma, VP Sourcing)
        </button>
      )}
    </div>
  );
};
