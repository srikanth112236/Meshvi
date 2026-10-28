import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Handshake,
  Search,
  Users,
  Network,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Bell,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { UniversalCommandBar } from '../ui/UniversalCommandBar';
import { NetworkStatusPill } from '../ui/NetworkStatusPill';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount, setDrawerOpen } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut listener
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

  // Intercept users who haven't completed onboarding and route them to Onboarding Wizard
  useEffect(() => {
    if (user && user.onboardingCompleted === false && !location.pathname.startsWith('/app/onboarding')) {
      navigate('/app/onboarding', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/app/home', icon: LayoutDashboard },
    { name: 'Partnerships', href: '/app/partnerships', icon: Handshake },
    { name: 'Search', href: '/app/search', icon: Search },
    { name: 'Connections', href: '/app/connections', icon: Users },
    { name: 'Introductions', href: '/app/introductions', icon: Network },
    { name: 'Messages', href: '/app/messages', icon: MessageSquare },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/app/home' && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar - Isolated & Compact */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-60 bg-surface border-r border-border flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } h-screen`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand & Portal Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link to="/app/home" className="flex items-center space-x-2.5">
              <img
                src="/meshvi-mark.png"
                alt="Meshvi"
                className="w-8 h-8 object-contain shrink-0"
              />
              <div>
                <span className="text-sm font-black text-navy tracking-tight block">
                  MESHVI
                </span>
                <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest block">
                  Member Portal
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-text-muted hover:text-navy md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Member Plane Status */}
          <div className="px-3 pt-3">
            <div className="px-2.5 py-1.5 bg-primary-soft/60 border border-primary/20 rounded-lg flex items-center space-x-1.5 text-[10px] text-primary font-bold">
              <Shield className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">Professional Network Plane</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Workspace
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
                      ? 'bg-primary text-white shadow-sm font-bold'
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
                to="/company"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-navy hover:bg-surface-muted transition-all"
              >
                <div className="flex items-center space-x-2.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Corporate Portal</span>
                </div>
                <ChevronRight className="w-3 h-3 text-text-muted" />
              </Link>
              {user?.roles?.includes('SUPER_ADMIN') && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-navy hover:bg-surface-muted transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>Admin Ops Portal</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-text-muted" />
                </Link>
              )}
            </div>
          </nav>
        </div>

        {/* Compact User Footer Card */}
        <div className="p-2.5 border-t border-border bg-surface-muted/40">
          <div className="p-2.5 bg-surface rounded-xl border border-border/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2 min-w-0">
              {user?.profile?.avatarUrl || user?.avatarUrl ? (
                <img
                  src={user?.profile?.avatarUrl || user?.avatarUrl}
                  alt={user?.profile?.displayName || 'Executive'}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-border shrink-0 bg-white"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {user?.profile?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-navy truncate">
                  {user?.profile?.displayName || user?.email?.split('@')[0]}
                </div>
                <div className="text-[9px] text-text-muted flex items-center space-x-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-success"></span>
                  <span className="truncate">{user?.profile?.currentTitle || 'Member'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-text-muted hover:text-navy md:hidden rounded-lg hover:bg-surface-muted"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs">
              <span className="font-bold text-navy text-xs sm:text-sm">Member Hub</span>
              <span className="text-text-muted hidden sm:inline">&bull;</span>
              <span className="text-text-muted text-[11px] hidden sm:inline">B2B Relationship Discovery & Commerce</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
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
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-soft text-primary border border-primary/20 shrink-0">
              <Shield className="w-3 h-3 mr-1 shrink-0" />
              <span className="hidden xs:inline">Member Plane</span>
            </span>
          </div>
        </header>

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-[max(6rem,calc(5rem+env(safe-area-inset-bottom)))] md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="border-t border-border bg-surface py-3 text-center text-[10px] sm:text-[11px] text-text-muted hidden md:block">
          MESHVI &bull; Member Hub Security Partition &bull; 256-Bit Encrypted Session
        </footer>

        {/* Mobile Persistent Bottom Navigation Bar (iOS Home-Indicator Safe) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                  active
                    ? 'text-primary font-bold'
                    : 'text-text-muted hover:text-navy'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 ${active ? 'text-primary stroke-[2.5]' : 'text-text-muted stroke-[1.75]'}`} />
                  {item.href === '/app/messages' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface animate-pulse" />
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${active ? 'font-black text-primary' : 'font-medium'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Feature #48: Universal Command Bar Modal */}
      <UniversalCommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
      />
    </div>
  );
};
