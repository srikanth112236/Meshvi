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
  Shield,
  Bell,
  History,
  Plus,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import { formatSearchTime } from '../../utils/formatSearchTime';
import { UniversalCommandBar } from '../ui/UniversalCommandBar';
import { NetworkStatusPill } from '../ui/NetworkStatusPill';
import { FeatureTour } from '../ui/FeatureTour';
import { RecentSearchesModal } from '../ui/RecentSearchesModal';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount, setDrawerOpen } = useNotifications();
  const { recent, removeSearch, setActiveSessionId, startNewSearchSession } = useSearchHistory();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
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
  const activeQuery = new URLSearchParams(location.search).get('q') || '';

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

  // Contextual feature tour: auto-open once per session for authenticated members
  useEffect(() => {
    if (!user?.id) return;
    if (user.onboardingCompleted === false) return;
    if (localStorage.getItem('setu_feature_tour_seen')) return;
    localStorage.setItem('setu_feature_tour_seen', '1');
    setTourOpen(true);
  }, [user?.id, user?.onboardingCompleted]);

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
    navigate(`/app/search?session=${newSessionId}`);
  };

  const openRecentModal = () => {
    setRecentModalOpen(true);
    setMobileMenuOpen(false);
  };

  const tourSteps = [
    {
      id: 'tour-dashboard',
      title: 'Welcome to your Command Center',
      description:
        'This is your mission control. Push your next intent with the search engine, or jump through the network areas from the sidebar.',
      target: '[data-tour="tour-dashboard"]',
    },
    {
      id: 'tour-search',
      title: 'Search anything, find your people',
      description:
        'The intent engine matches executives, companies and opportunities from live signals — this is the core of MESHVI.',
      target: '[data-tour="tour-search"]',
    },
    {
      id: 'tour-partners',
      title: 'Curated high-fit partners',
      description:
        'When the engine surfaces a counterparty above your threshold, it lands here with match rationale and a one-click bridge.',
      target: '[data-tour="tour-partners"]',
    },
    {
      id: 'tour-connections',
      title: 'Your network at a glance',
      description:
        'Direct bridges, inbound proposals and warm introductions live here — action items surface automatically.',
      target: '[data-tour="tour-connections"]',
    },
  ];

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

          {/* Recent searches — first thing in the sidebar, like ChatGPT recents */}
          {showLabels ? (
            <div className="mt-2.5 px-2 pb-2 border-b border-border">
              <div className="flex items-center justify-between px-1 py-1">
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-text-muted">
                  <History className="w-3 h-3" />
                  <span>Recent</span>
                  {recent.length > 0 && (
                    <span className="ml-0.5 rounded-full bg-surface-muted px-1 text-[8px] font-black text-text-muted">
                      {recent.length}
                    </span>
                  )}
                </span>
                {recent.length > 0 && (
                  <button
                    type="button"
                    onClick={openRecentModal}
                    className="text-[9px] font-bold text-primary hover:underline"
                  >
                    See all
                  </button>
                )}
              </div>

              {recent.length === 0 ? (
                <p className="px-1 pb-1 text-[9.5px] leading-snug text-text-muted">
                  Your recent searches and results appear here.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {recent.slice(0, 3).map((entry) => {
                    const isActiveResult =
                      !!activeQuery && activeQuery.toLowerCase() === entry.query.toLowerCase();
                    return (
                      <div
                        key={entry.id}
                        className={`group flex items-center rounded-lg transition-colors ${
                          isActiveResult ? 'bg-primary-soft' : 'hover:bg-surface-muted'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => runRecentSearch(entry.query, entry.id)}
                          className="flex-1 min-w-0 text-left px-1.5 py-1"
                          title={entry.query}
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <span
                              className={`block truncate text-[10.5px] font-semibold ${
                                isActiveResult ? 'text-primary' : 'text-navy'
                              }`}
                            >
                              {entry.query}
                            </span>
                            {entry.queries && entry.queries.length > 1 && (
                              <span className="shrink-0 text-[8px] font-bold bg-primary/10 text-primary px-1 py-0.2 rounded-full">
                                {entry.queries.length}
                              </span>
                            )}
                          </div>
                          <span className="block truncate text-[9px] text-text-muted">
                            {entry.count} result{entry.count === 1 ? '' : 's'} ·{' '}
                            {formatSearchTime(entry.at)}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSearch(entry.id)}
                          className="p-1 mr-0.5 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove this search"
                          aria-label={`Remove search ${entry.query}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="px-2 pt-2 flex justify-center">
              <button
                type="button"
                onClick={openRecentModal}
                title="Recent searches"
                aria-label="Recent searches"
                className="relative w-8 h-8 rounded-lg text-text-muted hover:text-primary hover:bg-surface-muted flex items-center justify-center transition-colors"
              >
                <History className="w-4 h-4" />
                {recent.length > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className={showLabels ? 'p-2.5 pt-2 space-y-0.5' : 'p-2 pt-2 space-y-1'}>
            {showLabels && (
              <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-text-muted">
                Workspace
              </div>
            )}
            {navItems.map((item) => {
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
                    <item.icon className={`w-4 h-4 ${active ? 'text-white' : 'text-text-muted'}`} />
                    {showLabels && <span>{item.name}</span>}
                  </div>
                  {showLabels && active && <ChevronRight className="w-3 h-3 text-white/80" />}
                </Link>
              );
            })}

            {/* Cross-Portal Access Section */}
            <div className="pt-2 border-t border-border mt-2 space-y-0.5">
              {showLabels && (
                <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-text-muted">
                  Portals &amp; Access
                </div>
              )}
              <Link
                to="/company"
                onClick={() => setMobileMenuOpen(false)}
                title="Corporate Portal"
                aria-label="Corporate Portal"
                className={`flex items-center rounded-xl text-xs font-semibold text-text-muted hover:text-navy hover:bg-surface-muted transition-all ${
                  showLabels ? 'justify-between px-3 py-2' : 'justify-center px-0 py-2.5'
                }`}
              >
                <div className={`flex items-center ${showLabels ? 'space-x-2.5' : ''}`}>
                  <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                  {showLabels && <span>Corporate Portal</span>}
                </div>
                {showLabels && <ChevronRight className="w-3 h-3 text-text-muted" />}
              </Link>
              {user?.roles?.includes('SUPER_ADMIN') && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  title="Admin Ops Portal"
                  aria-label="Admin Ops Portal"
                  className={`flex items-center rounded-xl text-xs font-semibold text-text-muted hover:text-navy hover:bg-surface-muted transition-all ${
                    showLabels ? 'justify-between px-3 py-2' : 'justify-center px-0 py-2.5'
                  }`}
                >
                  <div className={`flex items-center ${showLabels ? 'space-x-2.5' : ''}`}>
                    <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                    {showLabels && <span>Admin Ops Portal</span>}
                  </div>
                  {showLabels && <ChevronRight className="w-3 h-3 text-text-muted" />}
                </Link>
              )}
            </div>
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
            <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs">
              <span className="font-bold text-navy text-xs sm:text-sm">Member Hub</span>
              <span className="text-text-muted hidden sm:inline">&bull;</span>
              <span className="text-text-muted text-[11px] hidden lg:inline">
                B2B Relationship Discovery &amp; Commerce
              </span>
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

            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary-soft text-primary border border-primary/20 shrink-0">
              <Shield className="w-3 h-3 mr-1 shrink-0" />
              <span className="hidden xs:inline">Member Plane</span>
            </span>
          </div>
        </header>

        <main className="flex-1 w-full p-3 sm:p-4 lg:p-5 pb-[max(5.5rem,calc(4.5rem+env(safe-area-inset-bottom)))] md:pb-5">
          <Outlet />
        </main>

        <footer className="border-t border-border bg-surface py-2 text-center text-[10px] sm:text-[11px] text-text-muted hidden md:block">
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

      {/* Feature Tour Overlay */}
      <FeatureTour
        steps={tourSteps}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        onComplete={() => setTourOpen(false)}
      />

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
