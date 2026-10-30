import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import {
  Search,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Building2,
  Sparkles,
  X,
  Plus,
} from 'lucide-react';
import { AddCompanyModal } from '../../components/ui/AddCompanyModal';
import { CreatePartnershipPostModal } from '../../components/ui/CreatePartnershipPostModal';

interface StatsState {
  connectionsCount: number;
  inboundRequestsCount: number;
  introductionsCount: number;
  dealRoomsCount: number;
  quotaUsed: number;
  quotaLimit: number;
}

export const AppHomePage = () => {
  const { user, token } = useAuth();
  const { startNewSearchSession, activeSessionId } = useSearchHistory();
  const profile = user?.profile;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [stats, setStats] = useState<StatsState>({
    connectionsCount: 0,
    inboundRequestsCount: 0,
    introductionsCount: 0,
    dealRoomsCount: 2,
    quotaUsed: 0,
    quotaLimit: 50,
  });

  const [searchIntent, setSearchIntent] = useState('');
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isPartnershipModalOpen, setIsPartnershipModalOpen] = useState(false);
  const [searchHighlighted, setSearchHighlighted] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchCardRef = useRef<HTMLDivElement>(null);

  const isNewSearchRequested = searchParams.get('new_search') === 'true';
  const urlSession = searchParams.get('session');

  // Trigger search focus and glowing animation when user clicks "New Search"
  useEffect(() => {
    if (isNewSearchRequested) {
      setSearchIntent('');
      setSearchHighlighted(true);
      setTimeout(() => {
        searchCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        searchInputRef.current?.focus();
      }, 100);
      const timer = setTimeout(() => {
        setSearchHighlighted(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isNewSearchRequested]);

  // Load real-time counts from APIs
  const refreshStats = useCallback(() => {
    if (!token) return;

    Promise.all([
      fetch('/api/v1/connections', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => ({})),
      fetch('/api/v1/connections/requests', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => ({})),
      fetch('/api/v1/introductions', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => ({})),
      fetch('/api/v1/connections/quota', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => ({})),
    ]).then(([connData, reqData, introData, quotaData]) => {
      setStats({
        connectionsCount: connData?.data?.length || 0,
        inboundRequestsCount: reqData?.data?.incoming?.length || 0,
        introductionsCount: introData?.data?.length || 0,
        dealRoomsCount: 2,
        quotaUsed: quotaData?.data?.used || 0,
        quotaLimit: quotaData?.data?.limit || 50,
      });
    });
  }, [token]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Search execution handler -> goes directly to /app/search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchIntent.trim();
    const sessionId = urlSession || activeSessionId || startNewSearchSession();
    if (query) {
      navigate(`/app/search?q=${encodeURIComponent(query)}&session=${sessionId}`);
    } else {
      navigate(`/app/search?session=${sessionId}`);
    }
  };

  // 1-Click suggested mandate query handler -> goes directly to /app/search
  const handleChipClick = (term: string) => {
    setSearchIntent(term);
    const sessionId = urlSession || activeSessionId || startNewSearchSession();
    navigate(`/app/search?q=${encodeURIComponent(term)}&session=${sessionId}`);
  };

  const handleClearSearch = () => {
    setSearchIntent('');
    searchInputRef.current?.focus();
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* 1. EXECUTIVE IDENTITY HERO - COMPACT & REFINED */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative overflow-hidden">
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="relative shrink-0">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || 'Executive'}
                referrerPolicy="no-referrer"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-slate-200 shadow-2xs bg-white"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-navy via-slate-800 to-primary text-white font-black text-sm flex items-center justify-center shadow-2xs">
                {profile?.displayName ? profile.displayName[0]?.toUpperCase() : 'M'}
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[7.5px] font-black"
              title="Verified Corporate Profile"
            >
              ✓
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9.5px] font-bold uppercase tracking-wider">
                <UserCheck className="w-2.5 h-2.5 text-emerald-600" />
                <span>Verified Executive</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[9.5px] font-bold">
                <ShieldCheck className="w-2.5 h-2.5 text-sky-600" />
                <span>Bilateral Intent Protected</span>
              </span>
            </div>

            <h1 className="text-sm sm:text-base font-black text-navy tracking-tight flex items-center gap-2 truncate">
              <span className="truncate">{`${greeting}, ${profile?.displayName?.split(' ')[0] || 'srikanth'}`}</span>
              {profile?.company?.name && (
                <span className="text-xs font-semibold text-text-muted hidden sm:inline-flex items-center space-x-1 shrink-0">
                  <span>•</span>
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>{profile.company.name}</span>
                </span>
              )}
            </h1>

            <p className="text-xs text-text-muted line-clamp-1 max-w-xl">
              {profile?.headline || profile?.summary || 'Verified executive in Commercial Partnerships & Alliances at Enterprise.'}
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 relative z-10 shrink-0 self-start md:self-center">
          <Link
            to="/app/profile"
            className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-navy font-bold text-xs rounded-xl transition-colors shadow-2xs hover:shadow-xs"
          >
            My Profile
          </Link>
          <button
            type="button"
            onClick={() => setIsPartnershipModalOpen(true)}
            className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-primary/20 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Post Partnership</span>
          </button>
        </div>
      </div>

      {/* 2. OBJECTIVE INTENT SEARCH ENGINE - COMPACT, SPACIOUS & LIGHT THEME */}
      <div
        ref={searchCardRef}
        data-tour="tour-dashboard"
        className={`bg-white border transition-all duration-300 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden ${
          searchHighlighted
            ? 'ring-4 ring-primary/30 border-primary shadow-lg scale-[1.005]'
            : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
        } space-y-4`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-primary flex items-center justify-center border border-sky-100 shadow-2xs">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-navy tracking-tight">
                  Objective Intent Search Engine
                </h2>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/70 text-[9.5px] font-black uppercase tracking-wider">
                  Mandate AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                Match verified commercial decision makers by corporate mandate — no cold spam.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200/80 text-xs shrink-0 flex items-center space-x-1.5 self-start sm:self-center shadow-2xs">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Quota:</span>
            <span className="font-extrabold text-navy">{stats.quotaUsed} / {stats.quotaLimit}</span>
            <span className="text-[10.5px] text-slate-400 font-medium">Used</span>
          </div>
        </div>

        {/* High-Performance Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchIntent}
              onChange={(e) => setSearchIntent(e.target.value)}
              placeholder="e.g. Travel retail airport lounge concessions, cold brew beverage sourcing, enterprise AI..."
              className="w-full pl-10 pr-20 py-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 focus:border-primary focus:ring-2 focus:ring-primary/15 rounded-xl text-xs sm:text-sm text-navy placeholder:text-slate-400 font-medium transition-all shadow-inner/10"
            />
            {searchIntent && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy transition-colors p-1 cursor-pointer"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-primary/20 transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="hidden sm:inline">Search Directory</span>
            <span className="sm:hidden">Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Suggested Strategic Query Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs pt-2">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mr-1">Suggested mandates:</span>
          {[
            'Airport Retail Concessions',
            'Cold Brew Beverage Sourcing',
            'APAC Supply Chain Logistics',
            'Enterprise AI Platform',
            'FMCG Food Procurement',
          ].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleChipClick(term)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-primary-soft text-slate-700 hover:text-primary rounded-lg text-xs font-semibold border border-slate-200/80 hover:border-primary/30 transition-all shadow-2xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* 3. ADD COMPANY MODAL */}
      <AddCompanyModal
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
        onSuccess={() => {
          refreshStats();
        }}
      />

      {/* 4. PARTNERSHIP POST MODAL */}
      <CreatePartnershipPostModal
        isOpen={isPartnershipModalOpen}
        onClose={() => setIsPartnershipModalOpen(false)}
        onPostCreated={() => {
          navigate('/app/partnerships');
        }}
      />
    </div>
  );
};
