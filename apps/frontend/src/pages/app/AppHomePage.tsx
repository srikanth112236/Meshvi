import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import {
  UserCheck,
  ShieldCheck,
  Plus,
  Send,
  X,
} from 'lucide-react';
import { AddCompanyModal } from '../../components/ui/AddCompanyModal';
import { CreatePartnershipPostModal } from '../../components/ui/CreatePartnershipPostModal';
import { VideoShowcase } from '../../components/ui/VideoShowcase';

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
  const firstName = profile?.displayName?.split(' ')[0] || 'Srikanth';

  return (
    <div className="w-full space-y-4 pb-8 animate-in fade-in duration-300">
      {/* 1. PROFILE HEADER — JUST ONE SLEEK LINE (AS REQUESTED) */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2 sm:py-2.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative shrink-0">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || 'Executive'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-xl object-cover border border-slate-200 shadow-2xs bg-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-navy via-slate-800 to-primary text-white font-black text-xs flex items-center justify-center shadow-2xs">
                {firstName[0]?.toUpperCase() || 'S'}
              </div>
            )}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[7px] font-black"
              title="Verified Corporate Profile"
            >
              ✓
            </div>
          </div>

          {/* Single Horizontal Row: Name + Badges + Headline in 1 line */}
          <div className="flex items-center space-x-2 min-w-0 truncate text-xs">
            <span className="font-extrabold text-navy text-xs sm:text-sm truncate">
              {greeting}, {firstName}
            </span>
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold uppercase tracking-wider shrink-0">
              <UserCheck className="w-2.5 h-2.5 text-emerald-600" />
              <span>Verified Executive</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold shrink-0">
              <ShieldCheck className="w-2.5 h-2.5 text-sky-600" />
              <span>Bilateral Intent Protected</span>
            </span>
            <span className="text-text-muted truncate hidden lg:inline text-[11px]">
              • {profile?.headline || profile?.summary || 'Verified executive focused on Consumer Goods & Retail and Commercial & Partnerships.'}
            </span>
          </div>
        </div>

        {/* Action CTAs on right */}
        <div className="flex items-center space-x-2 shrink-0 ml-auto sm:ml-0">
          <Link
            to="/app/profile"
            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-navy font-bold text-xs rounded-xl transition-colors shadow-2xs hover:shadow-xs"
          >
            My Profile
          </Link>
          <button
            type="button"
            onClick={() => setIsPartnershipModalOpen(true)}
            className="px-3.5 py-1 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-primary/20 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Post Partnership</span>
          </button>
        </div>
      </div>

      {/* 2. CHAT & MAIN PAGE HERO — "HEY! 👋, WHAT'S ON YOUR MIND NOW?" (COMPACT & MODERN) */}
      <div
        ref={searchCardRef}
        className={`w-full py-4 sm:py-6 px-4 rounded-3xl transition-all duration-300 relative overflow-hidden text-center space-y-3.5 ${
          searchHighlighted
            ? 'ring-4 ring-[#38BDF8]/40 bg-gradient-to-b from-sky-50/50 via-white to-transparent'
            : 'bg-transparent'
        }`}
      >
        {/* Modern Typography Header (Matching Image 3) */}
        <div className="space-y-1">
          <p className="text-sm sm:text-base font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <span>Hey! 👋, {firstName}</span>
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-[#38BDF8] tracking-tight leading-tight">
            What’s on your mind Now?
          </h1>
          <div className="pt-0.5">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500 border border-slate-200">
              <span className="uppercase text-[9px] font-bold text-slate-400">Monthly Quota:</span>
              <strong className="text-navy">{stats.quotaUsed} / {stats.quotaLimit}</strong>
              <span>Used</span>
            </span>
          </div>
        </div>

        {/* Sleek Floating Pill Input Bar (Matching Image 3) */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto w-full">
          <div className="relative flex items-center bg-white border border-slate-200 hover:border-slate-300 focus-within:border-[#38BDF8] focus-within:ring-4 focus-within:ring-[#38BDF8]/15 rounded-full shadow-md hover:shadow-lg transition-all p-1.5 pl-4 sm:pl-5 pr-2">
            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              className="text-slate-400 hover:text-[#38BDF8] transition-colors shrink-0 mr-1.5 cursor-pointer"
              title="Add objective"
            >
              <Plus className="w-4 h-4" />
            </button>

            <input
              ref={searchInputRef}
              type="text"
              value={searchIntent}
              onChange={(e) => setSearchIntent(e.target.value)}
              placeholder="Ask Anything... e.g. Travel retail airport lounge concessions, cold brew sourcing..."
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-navy placeholder:text-slate-400 font-medium focus:outline-none"
            />

            {searchIntent && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-slate-400 hover:text-navy p-1 mr-1.5 cursor-pointer"
                title="Clear text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Circular Blue Send Button (Matching Image 3) */}
            <button
              type="submit"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
              title="Search Directory"
            >
              <Send className="w-4 h-4 -rotate-45 -ml-0.5" />
            </button>
          </div>
        </form>

        {/* Suggested Mandate Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-2xl mx-auto pt-0.5">
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
              className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-primary rounded-full text-[11px] font-semibold border border-slate-200/90 hover:border-primary/40 transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* 3. FULL-WIDTH VIDEO SHOWCASE & PLATFORM DEMOS (AS REQUESTED) */}
      <VideoShowcase />

      {/* 4. MODALS */}
      <AddCompanyModal
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
        onSuccess={() => {
          refreshStats();
        }}
      />

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
