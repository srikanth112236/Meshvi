import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  Handshake,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Search,
  Bell,
  Building2,
  Shield,
  Settings,
  User,
  Clock,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import { UniversalCommandBar } from '../ui/UniversalCommandBar';
import { NetworkStatusPill } from '../ui/NetworkStatusPill';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount, setDrawerOpen } = useNotifications();
  const { recent, startNewSearchSession } = useSearchHistory();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Sidebar starts expanded on desktop by default (228px), with collapsible rail (68px)
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('setu_sidebar_collapsed') === '1'
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('setu_sidebar_collapsed', next ? '1' : '0');
      return next;
    });
  };

  const showLabels = mobileMenuOpen || !collapsed;

  // Global Ctrl+K / Cmd+K listener
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

  // Route unonboarded users
  useEffect(() => {
    if (user && user.onboardingCompleted === false && !location.pathname.startsWith('/app/onboarding')) {
      navigate('/app/onboarding', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStartNewSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    const newSessionId = startNewSearchSession();
    setMobileMenuOpen(false);
    navigate(`/app/search?session=${newSessionId}`);
  };

  // The 5 Primary Destinations (Strict Linear / Attio style navigation)
  const primaryNavItems = [
    {
      name: 'Home',
      href: '/app/home',
      icon: LayoutDashboard,
      isActive: (pathname: string) => pathname === '/app/home' || pathname === '/app',
    },
    {
      name: 'Discover',
      href: '/app/search',
      icon: Compass,
      isActive: (pathname: string) => pathname.startsWith('/app/search'),
    },
    {
      name: 'Partnerships',
      href: '/app/partnerships',
      icon: Handshake,
      isActive: (pathname: string) => pathname.startsWith('/app/partnerships') || pathname.startsWith('/app/deal-rooms'),
    },
    {
      name: 'My Network',
      href: '/app/connections',
      icon: Users,
      isActive: (pathname: string) => pathname.startsWith('/app/connections') || pathname.startsWith('/app/introductions') || pathname.startsWith('/app/requests'),
    },
    {
      name: 'Messages',
      href: '/app/messages',
      icon: MessageSquare,
      hasBadge: unreadCount > 0,
      badgeCount: unreadCount,
      isActive: (pathname: string) => pathname.startsWith('/app/messages'),
    },
  ];

  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.startsWith('/app/search')) return 'Discover Decision Makers';
    if (p.startsWith('/app/home')) return 'Intelligence Dashboard';
    if (p.startsWith('/app/partnerships')) return 'Partnership Marketplace';
    if (p.startsWith('/app/deal-rooms')) return 'Deal Rooms';
    if (p.startsWith('/app/messages')) return 'Messages';
    if (p.startsWith('/app/connections')) return 'My Network';
    if (p.startsWith('/app/introductions')) return 'Warm Introductions';
    if (p.startsWith('/app/profile')) return 'Executive Profile';
    if (p.startsWith('/app/settings')) return 'Account Settings';
    return 'Meshvi Workspace';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#142B45] flex flex-col md:flex-row selection:bg-blue-100">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Consolidated Sidebar (228px expanded, 68px collapsed) */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 bg-white border-r border-[#E8EDF3] flex flex-col justify-between transition-all duration-200 ease-in-out md:translate-x-0 ${
          collapsed ? 'md:w-[68px]' : 'md:w-[228px]'
        } ${mobileMenuOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full w-[228px]'} h-screen`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Top Brand & Header */}
          <div
            className={`border-b border-[#E8EDF3] flex ${
              showLabels
                ? 'items-center justify-between px-3.5 py-3'
                : 'flex-col items-center gap-1.5 px-2 py-3'
            }`}
          >
            <Link
              to="/app/home"
              className="flex items-center space-x-2.5 min-w-0 group"
              title="Meshvi Enterprise"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#078BCC] to-[#056FA8] flex items-center justify-center p-1.5 shadow-2xs shrink-0 transition-transform group-hover:scale-105">
                <img
                  src="/meshvi-mark.png"
                  alt="Meshvi"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              {showLabels && (
                <div className="min-w-0">
                  <span className="text-sm font-bold text-[#142B45] tracking-tight block leading-tight">
                    Meshvi
                  </span>
                  <span className="text-[9px] font-bold text-[#078BCC] tracking-[0.2em] uppercase block leading-tight">
                    ENTERPRISE
                  </span>
                </div>
              )}
            </Link>

            {showLabels && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 md:hidden"
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden md:inline-flex items-center justify-center w-6 h-6 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Quick Search Action */}
          <div className={showLabels ? 'px-3 pt-3 pb-1' : 'px-2 pt-3 pb-1 flex justify-center'}>
            {showLabels ? (
              <button
                type="button"
                onClick={handleStartNewSearch}
                className="flex items-center justify-between w-full rounded-xl border border-[#E8EDF3] bg-slate-50 hover:bg-slate-100/80 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-3.5 h-3.5 text-[#078BCC]" />
                  <span>Discover leaders</span>
                </div>
                <kbd className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                  ⌘K
                </kbd>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartNewSearch}
                title="Discover leaders (Cmd+K)"
                className="w-9 h-9 rounded-xl border border-[#E8EDF3] bg-slate-50 flex items-center justify-center text-slate-500 hover:text-[#078BCC] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 5 Primary Navigation Items */}
          <nav className={showLabels ? 'p-3 space-y-1' : 'p-2 space-y-1.5'}>
            {primaryNavItems.map((item) => {
              const active = item.isActive(location.pathname);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  title={item.name}
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    showLabels ? 'justify-between px-3 py-2.5' : 'justify-center px-0 py-2.5'
                  } ${
                    active
                      ? 'bg-[#078BCC] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-[#142B45] hover:bg-slate-100/70'
                  }`}
                >
                  <div className={`flex items-center ${showLabels ? 'space-x-2.5' : ''}`}>
                    <div className="relative">
                      <item.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                      {item.hasBadge && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#36C4E8] ring-2 ring-white" />
                      )}
                    </div>
                    {showLabels && <span>{item.name}</span>}
                  </div>
                  {showLabels && active && <ChevronRight className="w-3 h-3 text-white/70" />}
                  {showLabels && !active && item.hasBadge && (item.badgeCount ?? 0) > 0 && (
                    <span className="text-[10px] font-bold bg-[#078BCC] text-white px-1.5 py-0.2 rounded-full">
                      {(item.badgeCount ?? 0) > 9 ? '9+' : item.badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Last 5 Recent Searches in Sidebar */}
            {showLabels && recent.length > 0 && (
              <div className="pt-2 pb-1 my-1 border-t border-slate-100">
                <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Recent Searches</span>
                  </span>
                  <span className="text-[9px] font-medium text-slate-400">
                    {Math.min(recent.length, 5)}
                  </span>
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {recent.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(`/app/search?q=${encodeURIComponent(item.query)}&session=${item.id}`);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-[#142B45] hover:bg-slate-100 transition-colors text-left group cursor-pointer"
                      title={item.query}
                    >
                      <span className="truncate flex-1 min-w-0 pr-1 group-hover:text-[#078BCC] font-medium">
                        {item.query}
                      </span>
                      {item.count > 0 && (
                        <span className="text-[9.5px] font-medium text-slate-400 group-hover:text-slate-600 shrink-0">
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contextual "More" Submenu (Corporate, Admin) */}
            {showLabels ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setMoreOptionsOpen(!moreOptionsOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    moreOptionsOpen
                      ? 'text-[#142B45] bg-slate-100 font-bold'
                      : 'text-slate-500 hover:text-[#142B45] hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    <span>More Tools</span>
                  </div>
                  {moreOptionsOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {moreOptionsOpen && (
                  <div className="mt-1 space-y-0.5 pl-3 border-l-2 border-slate-200 ml-3 animate-fade-in">
                    <Link
                      to="/company"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Corporate Portal</span>
                      </div>
                    </Link>

                    {user?.roles?.includes('SUPER_ADMIN') && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Shield className="w-3.5 h-3.5 text-amber-600" />
                          <span>Admin Ops</span>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </nav>
        </div>

        {/* Bottom Profile & Account Destination */}
        <div className="border-t border-[#E8EDF3] p-2.5 relative">
          {showLabels ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  {user?.profile?.avatarUrl || user?.avatarUrl ? (
                    <img
                      src={user?.profile?.avatarUrl || user?.avatarUrl}
                      alt={user?.profile?.displayName || 'Executive'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-white shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#102B45] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {user?.profile?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'M'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#142B45] truncate leading-tight">
                      {user?.profile?.displayName || 'Executive Leader'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                      {user?.profile?.currentTitle || user?.email}
                    </p>
                  </div>
                </div>
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {/* Account Flyout Menu */}
              {accountMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-[#E8EDF3] rounded-2xl shadow-xl p-1.5 z-50 animate-fade-in">
                  <Link
                    to="/app/profile"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Executive Profile</span>
                  </Link>

                  <Link
                    to="/app/settings"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/app/profile')}
                className="cursor-pointer"
                title={user?.profile?.displayName || user?.email}
              >
                {user?.profile?.avatarUrl || user?.avatarUrl ? (
                  <img
                    src={user?.profile?.avatarUrl || user?.avatarUrl}
                    alt={user?.profile?.displayName || 'Executive'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#102B45] text-white text-xs font-bold flex items-center justify-center">
                    {user?.profile?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'M'}
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area — Full-width clean workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Standard Header (Linear + Stripe inspired) */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8EDF3] px-4 sm:px-6 h-13 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-slate-500 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#142B45] text-sm tracking-tight">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Global Search / Command Bar Trigger */}
            <button
              type="button"
              onClick={() => setCommandBarOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80 bg-slate-50/70 text-xs shadow-2xs"
              title="Launch Command Bar (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search anything...</span>
              <kbd className="hidden sm:inline text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Live Network Status Indicator */}
            <NetworkStatusPill />

            {/* Notifications Drawer Bell */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#078BCC] ring-2 ring-white" />
              )}
            </button>
          </div>
        </header>

        {/* Routed Workspace View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Shared Modals */}
      <UniversalCommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
      />
    </div>
  );
};
