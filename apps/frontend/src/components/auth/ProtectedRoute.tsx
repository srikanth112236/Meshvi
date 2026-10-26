import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedPortal?: 'CONSUMER' | 'COMPANY_ADMIN' | 'SUPER_ADMIN';
  allowedRoles?: string[];
  disallowedRoles?: string[];
  loginUrl?: string;
  portalName?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  disallowedRoles,
  loginUrl = '/login',
}) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-navy">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-text-muted">Verifying portal authorization...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to the portal's dedicated login terminal
  if (!token || !user) {
    return <Navigate to={loginUrl} replace />;
  }

  const userRoles = user.roles || [];

  // Determine user's designated home portal (One portal for each role)
  const getUserHomePortal = () => {
    if (userRoles.includes('SUPER_ADMIN')) return '/admin/dashboard';
    if (userRoles.includes('COMPANY_ADMIN')) return '/company';
    return '/app/home';
  };

  // 1. Strict Disallowed Role Validation: Cleanly redirect to designated portal
  if (disallowedRoles && disallowedRoles.length > 0) {
    const matchedDisallowed = disallowedRoles.find((role) => userRoles.includes(role));
    if (matchedDisallowed) {
      return <Navigate to={getUserHomePortal()} replace />;
    }
  }

  // 2. Strict Allowed Role Validation: Cleanly redirect to designated portal
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return <Navigate to={getUserHomePortal()} replace />;
    }
  }

  return <Outlet />;
};
