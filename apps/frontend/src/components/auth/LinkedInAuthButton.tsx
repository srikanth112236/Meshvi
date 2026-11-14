import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Loader2 } from 'lucide-react';

interface LinkedInAuthButtonProps {
  label?: string;
  portalHint?: 'MEMBER' | 'COMPANY' | 'ADMIN';
  className?: string;
  /** @deprecated Sandbox identity switching is disabled. */
  isSandboxOption?: boolean;
}

export const LinkedInAuthButton: React.FC<LinkedInAuthButtonProps> = ({
  label = 'Continue with LinkedIn',
  portalHint = 'MEMBER',
  className = '',
}) => {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);

  const handleLinkedInAuth = async () => {
    setLoading(true);
    try {
      const state = `${portalHint.toLowerCase()}_` + Math.random().toString(36).substring(2, 15);
      const redirectUri =
        ((import.meta as any).env?.VITE_LINKEDIN_REDIRECT_URI as string) ||
        `${window.location.origin}/auth/linkedin/callback`;

      const authUrlRes = await fetch(
        `/api/v1/auth/linkedin?state=${encodeURIComponent(state)}&redirectUri=${encodeURIComponent(redirectUri)}`,
      );
      const authUrlData = await authUrlRes.json().catch(() => null);

      if (!authUrlRes.ok || !authUrlData?.success || !authUrlData?.data?.url) {
        throw new Error(
          authUrlData?.error?.message ||
            authUrlData?.message ||
            'LinkedIn Sign-In is not configured on this server.',
        );
      }

      window.location.href = authUrlData.data.url;
    } catch (err: any) {
      showToast({
        title: 'LinkedIn Sign-In Unavailable',
        message: err.message || 'Could not complete LinkedIn sign-in.',
        type: 'warning',
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 w-full">
      <button
        type="button"
        onClick={handleLinkedInAuth}
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
    </div>
  );
};
