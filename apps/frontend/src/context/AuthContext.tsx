import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, Clock } from 'lucide-react';

export interface UserProfile {
  id: string;
  userId?: string;
  displayName: string;
  headline?: string;
  summary?: string;
  currentTitle?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  function?: string;
  seniority?: string;
  industry?: string;
  city?: string;
  countryCode?: string;
  visibility: 'PUBLIC' | 'SIGNED_IN_ONLY' | 'PRIVATE';
  verificationStatus: string;
  isLinkedInVerified?: boolean;
  isWorkEmailVerified?: boolean;
  isRoleConfirmed?: boolean;
  completenessScore?: number;
  companyId?: string;
  company?: any;
  currentCompanyId?: string;
  experiences?: any[];
  expertise?: any[];
  intents?: any[];
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  avatarUrl?: string;
  linkedinId?: string;
  linkedinProfileUrl?: string;
  authProvider?: string;
  onboardingStep?: number;
  onboardingCompleted?: boolean;
  linkedinVerified?: boolean;
  workEmailVerified?: boolean;
  profile?: UserProfile;
  memberships?: any[];
  portalScope?: 'CONSUMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  portalScope: 'CONSUMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN' | null;
  loading: boolean;
  violationAlert: string | null;
  login: (
    authToken: string,
    userData: User,
    refreshToken?: string,
    portalScope?: 'CONSUMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN',
  ) => void;
  logout: (violationReason?: string) => void;
  clearViolationAlert: () => void;
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  loginWithGoogle: (googleData: {
    email?: string;
    googleId?: string;
    displayName?: string;
    avatarUrl?: string;
    idToken?: string;
  }) => Promise<{ success: boolean; isNewUser?: boolean; onboardingCompleted?: boolean; error?: string }>;
}

export function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) return false;
    // Considered expired if within 15 seconds of expiration
    return Math.floor(Date.now() / 1000) + 15 >= decoded.exp;
  } catch {
    return false;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('setu_auth_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem('setu_refresh_token'),
  );
  const [portalScope, setPortalScope] = useState<
    'CONSUMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN' | null
  >((localStorage.getItem('setu_portal_scope') as any) || null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [violationAlert, setViolationAlert] = useState<string | null>(
    sessionStorage.getItem('setu_violation_reason'),
  );
  const [sessionExpiredModal, setSessionExpiredModal] = useState<boolean>(false);
  const isExpiringRef = useRef(false);

  // Trigger 2-second logout modal on session expiry
  const triggerSessionExpiredLogout = useCallback(() => {
    if (isExpiringRef.current) return;
    isExpiringRef.current = true;
    setSessionExpiredModal(true);

    setTimeout(() => {
      localStorage.removeItem('setu_auth_token');
      localStorage.removeItem('setu_refresh_token');
      localStorage.removeItem('setu_portal_scope');
      sessionStorage.removeItem('setu_violation_reason');

      setToken(null);
      setRefreshToken(null);
      setPortalScope(null);
      setUser(null);
      setSessionExpiredModal(false);
      isExpiringRef.current = false;

      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }, 2000);
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const currentRefresh = localStorage.getItem('setu_refresh_token');
    if (!currentRefresh) return false;

    try {
      const res = await fetch('/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: currentRefresh,
          targetPortal: localStorage.getItem('setu_portal_scope') || undefined,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && (data.data?.accessToken || data.data?.token)) {
        const newAccess = data.data.accessToken || data.data.token;
        localStorage.setItem('setu_auth_token', newAccess);
        setToken(newAccess);

        if (data.data.refreshToken) {
          localStorage.setItem('setu_refresh_token', data.data.refreshToken);
          setRefreshToken(data.data.refreshToken);
        }
        if (data.data.portalScope) {
          localStorage.setItem('setu_portal_scope', data.data.portalScope);
          setPortalScope(data.data.portalScope);
        }
        if (data.data.user) {
          setUser(data.data.user);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setUser(data.data);
      } else {
        // Attempt auto-refresh if access token expired
        const refreshed = await refreshSession();
        if (!refreshed) {
          triggerSessionExpiredLogout();
        }
      }
    } catch {
      const refreshed = await refreshSession();
      if (!refreshed) {
        triggerSessionExpiredLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [refreshSession, triggerSessionExpiredLogout]);

  useEffect(() => {
    if (token) {
      if (isJwtExpired(token)) {
        refreshSession().then((refreshed) => {
          if (!refreshed) {
            triggerSessionExpiredLogout();
          } else {
            setLoading(false);
          }
        });
      } else {
        fetchCurrentUser(token);
      }
    } else {
      setLoading(false);
    }
  }, [token, fetchCurrentUser, refreshSession, triggerSessionExpiredLogout]);

  // Proactive token expiration monitor
  useEffect(() => {
    const interval = setInterval(() => {
      const activeToken = localStorage.getItem('setu_auth_token');
      if (activeToken && isJwtExpired(activeToken)) {
        refreshSession().then((refreshed) => {
          if (!refreshed) {
            triggerSessionExpiredLogout();
          }
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [refreshSession, triggerSessionExpiredLogout]);

  // Global Zero-Trust Network Boundary & 401/403 Interceptor
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [resource, config] = args;
      const url = typeof resource === 'string' ? resource : resource instanceof Request ? resource.url : '';

      // Skip interception for refresh-token or login endpoints
      if (url.includes('/auth/refresh-token') || url.includes('/auth/login')) {
        return originalFetch(...args);
      }

      const response = await originalFetch(...args);

      if (response.status === 401) {
        // Transparent token auto-refresh
        const refreshed = await refreshSession();
        if (refreshed) {
          const freshToken = localStorage.getItem('setu_auth_token');
          if (freshToken) {
            const headers = new Headers((config && config.headers) || {});
            headers.set('Authorization', `Bearer ${freshToken}`);
            return originalFetch(resource, { ...config, headers });
          }
        } else {
          triggerSessionExpiredLogout();
        }
      } else if (response.status === 403) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          if (
            data?.error === 'PORTAL_ACCESS_VIOLATION' ||
            data?.message?.includes('PORTAL_ACCESS_VIOLATION') ||
            data?.message?.includes('Security Isolation') ||
            data?.message?.includes('ACCESS DENIED')
          ) {
            logout(
              data.message ||
                'Security Isolation Violation: Active session attempted to access isolated portal resources. Automatic logout enforced.'
            );
          }
        } catch {
          // Non-JSON response
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [refreshSession, triggerSessionExpiredLogout]);

  const login = (
    authToken: string,
    userData: User,
    newRefreshToken?: string,
    newPortalScope?: 'CONSUMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN',
  ) => {
    localStorage.setItem('setu_auth_token', authToken);
    setToken(authToken);

    if (newRefreshToken) {
      localStorage.setItem('setu_refresh_token', newRefreshToken);
      setRefreshToken(newRefreshToken);
    }

    const effectiveScope =
      newPortalScope ||
      (userData.roles?.includes('SUPER_ADMIN')
        ? 'SUPER_ADMIN'
        : userData.roles?.includes('COMPANY_ADMIN')
        ? 'COMPANY_ADMIN'
        : 'CONSUMER');

    localStorage.setItem('setu_portal_scope', effectiveScope);
    setPortalScope(effectiveScope);

    sessionStorage.removeItem('setu_violation_reason');
    setViolationAlert(null);

    setUser({ ...userData, portalScope: effectiveScope });
  };

  const logout = (violationReason?: string) => {
    localStorage.removeItem('setu_auth_token');
    localStorage.removeItem('setu_refresh_token');
    localStorage.removeItem('setu_portal_scope');

    if (violationReason) {
      sessionStorage.setItem('setu_violation_reason', violationReason);
      setViolationAlert(violationReason);
    } else {
      sessionStorage.removeItem('setu_violation_reason');
      setViolationAlert(null);
    }

    setToken(null);
    setRefreshToken(null);
    setPortalScope(null);
    setUser(null);
  };

  const clearViolationAlert = () => {
    sessionStorage.removeItem('setu_violation_reason');
    setViolationAlert(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  const loginWithGoogle = async (googleData: {
    email?: string;
    googleId?: string;
    displayName?: string;
    avatarUrl?: string;
    idToken?: string;
  }) => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && (data.data?.accessToken || data.data?.token)) {
        const authToken = data.data.accessToken || data.data.token;
        const newRefreshToken = data.data.refreshToken;
        const userData = data.data.user;
        const isNewUser = !!data.data.isNewUser;
        const onboardingCompleted = data.data.onboardingCompleted ?? userData?.onboardingCompleted ?? false;

        login(authToken, userData, newRefreshToken, 'CONSUMER');

        return {
          success: true,
          isNewUser,
          onboardingCompleted,
        };
      }

      return {
        success: false,
        error: data?.message || data?.error || 'Google authentication failed',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Unable to connect to Google authentication server',
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        portalScope,
        loading,
        violationAlert,
        login,
        logout,
        clearViolationAlert,
        refreshUser,
        refreshSession,
        loginWithGoogle,
      }}
    >
      {children}

      {/* 2-Second Secure Session Expired Modal */}
      {sessionExpiredModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#0F172A] p-6 text-center shadow-2xl shadow-red-950/60">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
              <ShieldAlert className="h-7 w-7 text-red-400 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Security Notice: Session Expired
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Your 24-hour authentication session has expired. You are being logged out securely.
            </p>
            {/* 2-Second Progress Bar */}
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-sky-500"
                style={{
                  width: '100%',
                  animation: 'sessionExpiredShrink 2s linear forwards',
                }}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Clock className="h-3.5 w-3.5 text-red-400" />
              <span>Logging out in 2 seconds...</span>
            </div>
          </div>
          <style>{`
            @keyframes sessionExpiredShrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
