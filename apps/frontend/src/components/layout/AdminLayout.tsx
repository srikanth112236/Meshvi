import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Sliders,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Lock,
  Cpu,
  BookOpen,
  Users,
  Building2,
  FileText,
  Bell,
  Search,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { UniversalCommandBar } from '../ui/UniversalCommandBar';
import { NetworkStatusPill } from '../ui/NetworkStatusPill';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount, setDrawerOpen } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut listener (Gap 252)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandBarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Telemetry & Ops', href: '/admin/dashboard', icon: Sliders },
    { name: 'Verification Queue', href: '/admin/verification', icon: ShieldCheck },
    { name: 'User Directory', href: '/admin/users', icon: Users },
    { name: 'Company Registry', href: '/admin/companies', icon: Building2 },
    { name: 'AI Governance', href: '/admin/ai-console', icon: Cpu },
    { name: 'Data Ingestion & CSV', href: '/admin/imports', icon: FileSpreadsheet },
    { name: 'Content Moderation', href: '/admin/moderation', icon: ShieldAlert },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
    { name: 'Admin Handbook', href: '/admin/guide', icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col md:flex-row">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar - Isolated & Compact */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-60 bg-surface border-r border-border flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } h-screen`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <img
                src="/meshvi-mark.png"
                alt="Meshvi"
                className="w-8 h-8 object-contain shrink-0"
              />
              <div>
                <span className="text-sm font-black text-navy tracking-tight block">
                  MESHVI
                </span>
                <span className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest block">
                  Admin Ops Portal
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-text-muted hover:text-navy md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Security Clearance Pill */}
          <div className="px-3 pt-3">
            <div className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center space-x-1.5 text-[10px] text-amber-800 font-bold">
              <Lock className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate">Isolated Clearance Plane</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Governance Tools
            </div>
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-amber-600 text-white shadow-sm font-bold'
                      : 'text-text-muted hover:text-navy hover:bg-surface-muted'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <item.icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-text-muted'}`} />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight className="w-3 h-3 text-white/80" />}
                </Link>
              );
            })}

            {/* Cross-Portal Access Section */}
            <div className="pt-3 border-t border-border mt-3 space-y-1">
              <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-text-muted">
                Portals & Access
              </div>
              <Link
                to="/app/home"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-navy hover:bg-surface-muted transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Member Hub</span>
                </div>
                <ChevronRight className="w-3 h-3 text-text-muted" />
              </Link>
              <Link
                to="/company"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-navy hover:bg-surface-muted transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Corporate Portal</span>
                </div>
                <ChevronRight className="w-3 h-3 text-text-muted" />
              </Link>
            </div>
          </nav>
        </div>

        {/* Compact Admin Identity Bar */}
        <div className="p-2.5 border-t border-border bg-surface-muted/40">
          <div className="p-2.5 bg-surface rounded-xl border border-border/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-navy truncate">
                  {user?.profile?.displayName || user?.email?.split('@')[0]}
                </div>
                <div className="text-[9px] text-amber-700 font-extrabold uppercase tracking-wide">
                  Super Admin
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors shrink-0"
              title="Secure Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-text-muted hover:text-navy md:hidden rounded-lg hover:bg-surface-muted"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center space-x-2 text-xs">
              <span className="font-bold text-navy">Admin Ops</span>
              <span className="text-text-muted">&bull;</span>
              <span className="text-text-muted text-[11px]">System Governance & Telemetry Control</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Quick Command Bar Trigger */}
            <button
              type="button"
              onClick={() => setCommandBarOpen(true)}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl text-text-muted hover:text-navy hover:bg-surface-muted transition-colors border border-border text-xs"
              title="Launch Universal Command Bar (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search / Jump to...</span>
              <kbd className="px-1.5 py-0.2 bg-surface text-[10px] font-black rounded border border-border text-navy">
                Ctrl+K
              </kbd>
            </button>

            {/* Network Connectivity Status Pill (Gaps 259, 270) */}
            <NetworkStatusPill />

            {/* Real-time Notification Bell */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 rounded-xl text-text-muted hover:text-navy hover:bg-surface-muted transition-colors border border-border"
              title="Open Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-amber-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
              <ShieldAlert className="w-3 h-3 mr-1 text-amber-600" />
              Super Admin Plane
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="border-t border-border bg-surface py-3 text-center text-[11px] text-text-muted">
          MESHVI &bull; Admin Ops Security Partition &bull; 256-Bit Encrypted Session
        </footer>
      </div>

      {/* Feature #48: Universal Command Bar Modal */}
      <UniversalCommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
      />
    </div>
  );
};
