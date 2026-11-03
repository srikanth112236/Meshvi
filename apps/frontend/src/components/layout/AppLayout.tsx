import { useEffect, useState } from 'react';
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
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  Bell,
  History,
  Plus,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import { UniversalCommandBar } from '../ui/UniversalCommandBar';
import { NetworkStatusPill } from '../ui/NetworkStatusPill';
import { RecentSearchesModal } from '../ui/RecentSearchesModal';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount, setDrawerOpen } = useNotifications();
  const { recent, setActiveSessionId, startNewSearchSession } = useSearchHistory();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [recentModalOpen, setRecentModalOpen] = useState(false);

  // Sidebar starts collapsed (icon rail) and remembers the user's choice.
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('setu_sidebar_collapsed') !== '0'
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('setu_sidebar_collapsed', next ? '1' : '0');
      return next;
    });
  };

  // On mobile the drawer always shows the complete labelled sidebar.
  const showLabels = mobileMenuOpen || !collapsed;

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

  const runRecentSearch = (query: string, sessionId?: string) => {
    setRecentModalOpen(false);
    setMobileMenuOpen(false);
    if (sessionId) {
      setActiveSessionId(sessionId);
      navigate(`/app/search?q=${encodeURIComponent(query)}&session=${sessionId}`);
    } else {
      navigate(`/app/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleStartNewSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    const newSessionId = startNewSearchSession();
    setMobileMenuOpen(false);
    navigate(`/app/home?new_search=true&session=${newSessionId}`);
  };

  const openRecentModal = () => {
    setRecentModalOpen(true);
    setMobileMenuOpen(false);
  };

  // Primary 4 items — clean, focused, essential
  const primaryNavItems = [
    { name: 'Search', href: '/app/search', icon: Search },
    { name: 'Dashboard', href: '/app/home', icon: LayoutDashboard },
    { name: 'Deal Rooms', href: '/app/partnerships', icon: Handshake },
    { name: 'Messages', href: '/app/messages', icon: MessageSquare, hasBadge: unreadCount > 0 },
  ];

  // Secondary items — disclosed via "More Options"
  const secondaryNavItems = [
    { name: 'Connections', href: '/app/connections', icon: Users },
    { name: 'Introductions', href: '/app/introductions', icon: Network },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/app/home' && location.pathname.startsWith(path));

  const isSecondaryActive =
    secondaryNavItems.some((item) => isActive(item.href)) ||
    location.pathname.startsWith('/company') ||
    location.pathname.startsWith('/admin');

  // Progressive disclosure state: auto-expanded if currently viewing a secondary tool
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(
    () => isSecondaryActive || localStorage.getItem('setu_sidebar_more_open') === '1'
  );

  useEffect(() => {
    if (isSecondaryActive) {
      setMoreOptionsOpen(true);
    }
  }, [isSecondaryActive]);

  const toggleMoreOptions = () => {
    setMoreOptionsOpen((prev) => {
      const next = !prev;
      localStorage.setItem('setu_sidebar_more_open', next ? '1' : '0');
      return next;
    });
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith('/app/search')) return 'Search & Discovery';
    if (location.pathname.startsWith('/app/home')) return 'Dashboard';
    if (location.pathname.startsWith('/app/partnerships')) return 'Deal Rooms';
    if (location.pathname.startsWith('/app/messages')) return 'Messages';
    if (location.pathname.startsWith('/app/connections')) return 'Connections';
    if (location.pathname.startsWith('/app/introductions')) return 'Warm Introductions';
    if (location.pathname.startsWith('/app/profile')) return 'Profile Dossier';
    if (location.pathname.startsWith('/app/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col md:flex-row">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar — collapsed icon rail by default, expandable to the full panel */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 bg-surface border-r border-border flex flex-col justify-between transition-all duration-200 ease-in-out md:translate-x-0 w-60 ${
          collapsed ? 'md:w-[68px]' : 'md:w-60'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} h-screen`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Brand & Collapse Toggle */}
          <div
            className={`border-b border-border flex ${
              showLabels
                ? 'items-center justify-between px-3 py-2.5'
                : 'flex-col items-center gap-1.5 px-2 py-2.5'
            }`}
          >
            <Link
              to="/app/home"
              className="flex items-center space-x-2.5 min-w-0"
              title="MESHVI Member Portal"
            >
              <img
                src="/meshvi-mark.png"
                alt="Meshvi"
                className="w-8 h-8 object-contain shrink-0"
              />
              {showLabels && (
                <div className="min-w-0">
                  <span className="text-sm font-black text-navy tracking-tight block leading-tight">
                    MESHVI
                  </span>
                  <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest block leading-tight">
                    Member Portal
                  </span>
                </div>
              )}
            </Link>

            {showLabels && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-text-muted hover:text-navy md:hidden"
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden md:inline-flex items-center justify-center w-6 h-6 rounded-md text-text-muted hover:text-navy hover:bg-surface-muted transition-colors shrink-0"
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

          {/* New search */}
          <div className={showLabels ? 'px-2.5 pt-2.5' : 'px-2 pt-2.5 flex justify-center'}>
            {showLabels ? (
              <button
                type="button"
                onClick={handleStartNewSearch}
                className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-border bg-surface hover:bg-surface-muted px-2 py-1.5 text-[11px] font-bold text-navy transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>New search</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartNewSearch}
                title="New search"
                aria-label="New search"
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Compact Primary Navigation Links */}
          <nav className={showLabels ? 'p-2.5 pt-2 space-y-1' : 'p-2 pt-2 space-y-1.5'}>
            {primaryNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  title={item.name}
                  aria-label={item.name}
                  className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                    showLabels ? 'justify-between px-3 py-2' : 'justify-center px-0 py-2.5'
                  } ${
                    active
                      ? 'bg-primary text-white shadow-sm font-bold'
                      : 'text-text-muted hover:text-navy hover:bg-surface-muted'
                  }`}
                >
                  <div className={`flex items-center ${showLabels ? 'space-x-2.5' : ''}`}>
                    <div className="relative">
                      <item.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-text-muted'}`} />
                      {item.hasBadge && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-surface" />
                      )}
                    </div>
                    {showLabels && <span>{item.name}</span>}
                  </div>
                  {showLabels && active && <ChevronRight className="w-3 h-3 text-white/80" />}
                  {showLabels && !active && item.hasBadge && unreadCount > 0 && (
                    <span className="text-[9px] font-black bg-primary text-white px-1.5 py-0.2 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* "More Options" Toggle Button */}
            {showLabels ? (
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={toggleMoreOptions}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    moreOptionsOpen || isSecondaryActive
                      ? 'text-navy bg-surface-muted/70 font-bold'
                      : 'text-text-muted hover:text-navy hover:bg-surface-muted'
                  }`}
                  aria-expanded={moreOptionsOpen}
                  title="View additional tools and portals"
                >
                  <div className="flex items-center space-x-2.5">
                    <MoreHorizontal className="w-4 h-4 text-text-muted" />
                    <span>More Options</span>
                  </div>
                  {moreOptionsOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  )}
                </button>

                {/* Expanded Secondary Options Drawer */}
                {moreOptionsOpen && (
                  <div className="mt-1 space-y-0.5 pl-2 border-l-2 border-border/70 ml-2 animate-fadeIn">
                    {secondaryNavItems.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          title={item.name}
                          aria-label={item.name}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            active
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-text-muted hover:text-navy hover:bg-surface-muted'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <item.icon className={`w-3.5 h-3.5 ${active ? 'text-primary' : 'text-text-muted'}`} />
                            <span>{item.name}</span>
                          </div>
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </Link>
                      );
                    })}

                    {/* Search History Button */}
                    <button
                      type="button"
                      onClick={openRecentModal}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-navy hover:bg-surface-muted transition-colors text-left cursor-pointer"
                      title="Open search history"
                    >
                      <div className="flex items-center space-x-2">
                        <History className="w-3.5 h-3.5 text-text-muted" />
                        <span>Search History</span>
                      </div>
                      {recent.length > 0 && (
                        <span className="text-[9px] font-bold bg-surface-muted px-1.5 py-0.2 rounded-full text-text-muted">
                          {recent.length}
                        </span>
                      )}
                    </button>

                    {/* Portals Sub-group */}
                    <div className="pt-1 mt-1 border-t border-border/50">
                      <Link
                        to="/company"
                        onClick={() => setMobileMenuOpen(false)}
                        title="Corporate Portal"
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-navy hover:bg-surface-muted transition-all"
                      >
                        <div className="flex items-center space-x-2">
                          <Shield className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Corporate Portal</span>
                        </div>
                      </Link>

                      {user?.roles?.includes('SUPER_ADMIN') && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          title="Admin Ops Portal"
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-navy hover:bg-surface-muted transition-all"
                        >
                          <div className="flex items-center space-x-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Admin Ops</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Collapsed mode icon-rail trigger for More Options */
              <div className="pt-1 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    toggleCollapsed();
                    setMoreOptionsOpen(true);
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isSecondaryActive
                      ? 'bg-primary-soft text-primary'
                      : 'text-text-muted hover:text-navy hover:bg-surface-muted'
                  }`}
                  title="More Options (Expand)"
                  aria-label="More Options (Expand)"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Compact User Footer */}
        <div className={`border-t border-border bg-surface-muted/40 ${showLabels ? 'p-2.5' : 'p-2'}`}>
          {showLabels ? (
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
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              {user?.profile?.avatarUrl || user?.avatarUrl ? (
                <img
                  src={user?.profile?.avatarUrl || user?.avatarUrl}
                  alt={user?.profile?.displayName || 'Executive'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-border bg-white"
                  title={user?.profile?.displayName || user?.email}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center"
                  title={user?.profile?.displayName || user?.email}
                >
                  {user?.profile?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area — full-width workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-border px-3 sm:px-4 h-12 sm:h-13 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-text-muted hover:text-navy md:hidden rounded-lg hover:bg-surface-muted"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden md:inline-flex p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface-muted transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2 text-xs sm:text-sm">
              <span className="font-bold text-navy text-xs sm:text-sm">{getPageTitle()}</span>
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

            {/* Network Connectivity Status Pill */}
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

            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-soft text-primary border border-primary/20 shrink-0">
              <Shield className="w-3 h-3 mr-1 shrink-0" />
              <span className="hidden xs:inline">Verified Network</span>
            </span>
          </div>
        </header>

        <main className="flex-1 w-full p-3 sm:p-4 lg:p-5 pb-[max(5.5rem,calc(4.5rem+env(safe-area-inset-bottom)))] md:pb-5">
          <Outlet />
        </main>

        <footer className="border-t border-border/60 bg-surface/50 py-1.5 px-4 flex items-center justify-between text-[10px] text-text-muted hidden md:flex">
          <span>MESHVI &bull; Intent-First Enterprise Network</span>
          <span>Encrypted Session</span>
        </footer>

        {/* Mobile Persistent Bottom Navigation Bar (iOS Home-Indicator Safe) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-around">
          {primaryNavItems.map((item) => {
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
          {/* Mobile 5th Item: More Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
              isSecondaryActive ? 'text-primary font-bold' : 'text-text-muted hover:text-navy'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isSecondaryActive ? 'text-primary stroke-[2.5]' : 'text-text-muted stroke-[1.75]'}`} />
            <span className={`text-[10px] mt-0.5 tracking-tight ${isSecondaryActive ? 'font-black text-primary' : 'font-medium'}`}>
              More
            </span>
          </button>
        </nav>
      </div>

      {/* Feature #48: Universal Command Bar Modal */}
      <UniversalCommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
      />

      {/* Recent searches — full searchable history */}
      <RecentSearchesModal
        open={recentModalOpen}
        onClose={() => setRecentModalOpen(false)}
        onSelect={runRecentSearch}
      />
    </div>
  );
};
