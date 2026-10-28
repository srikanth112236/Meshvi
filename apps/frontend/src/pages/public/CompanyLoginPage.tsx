import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleSsoButton } from '../../components/auth/GoogleSsoButton';

export const CompanyLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { login, logout, violationAlert, clearViolationAlert } = useAuth();
  const navigate = useNavigate();

  const isViolation = searchParams.get('violation') === '1' || !!violationAlert;
  const violationMsg =
    violationAlert ||
    sessionStorage.getItem('setu_violation_reason') ||
    'Your previous session was automatically terminated due to a cross-portal clearance violation. Please sign in with authorized Company Administrator credentials.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearViolationAlert();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, targetPortal: 'COMPANY_ADMIN' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Authentication rejected.');
      }

      const userRoles: string[] = data.data.user?.roles || [];
      const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
      const isCompanyAdmin = userRoles.includes('COMPANY_ADMIN');

      if (isSuperAdmin) {
        logout();
        throw new Error(
          'ACCESS DENIED: Super Administrators cannot access or sign in through Company Portal login. Please use the dedicated Super Admin Ops terminal at /admin/login.'
        );
      }

      if (!isCompanyAdmin) {
        logout();
        throw new Error(
          'ACCESS RESTRICTED: Standard Consumer accounts cannot sign in through Company Portal login. Please use Consumer Hub login at /login.'
        );
      }

      const token = data.data.accessToken || data.data.token;
      login(token, data.data.user, data.data.refreshToken, 'COMPANY_ADMIN');
      navigate('/company');
    } catch (err: any) {
      setError(err.message || 'Invalid organization credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-navy flex flex-col justify-center items-center px-3 sm:px-4 py-6 sm:py-12">
      <div className="max-w-md w-full bg-surface border border-indigo-200/80 rounded-2xl p-5 sm:p-8 shadow-xl space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img
              src="/meshvi-logo-full.png"
              alt="Meshvi"
              className="h-8 object-contain mx-auto mb-2"
            />
          </Link>
          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Company Portal
            </span>
            <h1 className="text-xl font-black text-navy mt-2">Organization Sign In</h1>
            <p className="text-xs text-text-muted mt-1">
              Authorized representative access for verified enterprise management and team delegation.
            </p>
          </div>
        </div>

        {isViolation && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
            <div className="flex items-center space-x-1.5 font-bold text-rose-700">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Security Isolation Boundary Enforced</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-600">{violationMsg}</p>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-danger/10 border border-danger/20 rounded-xl flex items-start space-x-2 text-xs text-danger">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <GoogleSsoButton portalHint="COMPANY" label="Sign in with Enterprise Google Workspace" />

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-surface px-3 text-[10px] uppercase font-bold text-text-muted absolute">
            or organization credentials
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
              Corporate Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="companyadmin@projectsetu.com"
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy placeholder:text-text-muted focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy placeholder:text-text-muted focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center text-xs tracking-wide disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Authorization...</span>
            ) : (
              <span className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enter Company Management</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-border text-center text-[10px] text-text-muted flex items-center justify-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span>Multi-Tenant Corporate Partition &bull; MESHVI</span>
        </div>
      </div>
    </div>
  );
};
