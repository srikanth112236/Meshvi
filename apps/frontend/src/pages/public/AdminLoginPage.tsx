import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage = () => {
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
    'Your previous session was automatically terminated due to a cross-portal clearance violation. Please sign in with authorized Super Administrator credentials.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearViolationAlert();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, targetPortal: 'SUPER_ADMIN' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Authentication rejected.');
      }

      const userRoles: string[] = data.data.user?.roles || [];
      if (!userRoles.includes('SUPER_ADMIN')) {
        logout();
        throw new Error(
          'ACCESS DENIED: This terminal strictly requires verified SUPER_ADMIN security clearance. Company Administrators must sign in at /company/login and Consumers at /login.'
        );
      }

      const token = data.data.accessToken || data.data.token;
      login(token, data.data.user, data.data.refreshToken, 'SUPER_ADMIN');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col justify-center items-center px-3 sm:px-4 py-6 sm:py-12">
      <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-2xl p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <img
              src="/meshvi-logo-white.png"
              alt="Meshvi"
              className="h-8 object-contain mx-auto mb-2"
            />
          </Link>
          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Admin Ops Portal
            </span>
            <h1 className="text-xl font-black text-white mt-2">Platform Governance Access</h1>
            <p className="text-xs text-slate-400 mt-1">
              Isolated terminal for pilot telemetry, data provenance, and user enforcement.
            </p>
          </div>
        </div>

        {isViolation && (
          <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl space-y-1 text-xs text-red-300">
            <div className="flex items-center space-x-1.5 font-bold text-red-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Security Isolation Boundary Enforced</span>
            </div>
            <p className="text-[11px] leading-relaxed text-red-300">{violationMsg}</p>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-950/50 border border-red-500/30 rounded-xl flex items-start space-x-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Super Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vedasynk.local"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Administrative Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center text-xs tracking-wide disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating Clearance...</span>
            ) : (
              <span className="flex items-center space-x-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Verify & Enter Ops Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 flex items-center justify-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Encrypted Session &bull; MESHVI Platform Governance</span>
        </div>
      </div>
    </div>
  );
};
