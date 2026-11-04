import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import {
  UserCheck,
  ShieldCheck,
  Plus,
  Send,
  X,
  Handshake,
  Users,
  ArrowRight,
  Building2,
  Play,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { AddCompanyModal } from '../../components/ui/AddCompanyModal';
import { CreatePartnershipPostModal } from '../../components/ui/CreatePartnershipPostModal';
import { AnimatedVideoModal } from '../../components/ui/AnimatedVideoModal';
import { OnboardingChecklistWidget } from '../../components/ui/OnboardingChecklistWidget';

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
  const { startNewSearchSession, activeSessionId, recent } = useSearchHistory();
  const profile = user?.profile;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const latestQuery = recent && recent.length > 0 ? recent[0].query : '';
  const lowerLatest = latestQuery.toLowerCase();

  const recommendedProfiles = useMemo(() => {
    if (
      lowerLatest.includes('hospit') ||
      lowerLatest.includes('hotel') ||
      lowerLatest.includes('resort') ||
      lowerLatest.includes('tourism')
    ) {
      return [
        {
          id: 'rec-1',
          name: 'Rajiv Sharma',
          title: 'SVP Global Procurement & Amenities',
          company: 'Tata Consumer & Taj Luxury Group',
          location: 'Mumbai, India',
          badge: 'Signatory Authority',
          reason: `Recommended based on your recent search for "${latestQuery}"`,
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        },
        {
          id: 'rec-2',
          name: 'Priya Sundaram',
          title: 'Head of Airport Concessions & Hospitality',
          company: 'Changi Airport Group',
          location: 'Singapore',
          badge: 'Commercial Lead',
          reason: `Matched via hospitality & travel amenities search`,
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        },
        {
          id: 'rec-3',
          name: 'Elena Rostova',
          title: 'Director of Food & Beverage Sourcing',
          company: 'Boreal Food Retail & Hospitality',
          location: 'Berlin, Germany',
          badge: 'FMCG Mandate',
          reason: `Verified decision-maker in related consumer goods`,
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        },
      ];
    }

    if (
      lowerLatest.includes('logistic') ||
      lowerLatest.includes('supply') ||
      lowerLatest.includes('freight')
    ) {
      return [
        {
          id: 'rec-4',
          name: 'Vikram Al-Mansoor',
          title: 'VP Supply Chain Logistics & Cold Chain',
          company: 'Apex Freight Logistics',
          location: 'Dubai, UAE',
          badge: 'Logistics Signatory',
          reason: `Recommended based on your recent search for "${latestQuery}"`,
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        },
        {
          id: 'rec-5',
          name: 'Kenji Sato',
          title: 'Chief Procurement Officer',
          company: 'Yamato Global Systems',
          location: 'Tokyo, Japan',
          badge: 'C-Level Mandate',
          reason: `Matched via supply chain trade corridor`,
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
        },
        {
          id: 'rec-6',
          name: 'Sophie Laurent',
          title: 'Head of Strategic Bilateral Sourcing',
          company: 'CMA CGM Europe',
          location: 'Paris, France',
          badge: 'Bilateral Lead',
          reason: `Cross-border procurement leader in EU trade`,
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        },
      ];
    }

    return [
      {
        id: 'rec-7',
        name: 'Aarav Mehta',
        title: 'Chief Commercial Officer',
        company: 'Indo-ASEAN Strategic Alliance',
        location: 'Singapore',
        badge: 'C-Level Signatory',
        reason: latestQuery
          ? `Recommended match based on "${latestQuery}"`
          : 'High-mandate commercial leader in your bilateral trade corridor',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'rec-8',
        name: 'Mei Ling Tan',
        title: 'Director of Strategic Partnerships',
        company: 'Pacific Rim Trade Solutions',
        location: 'Kuala Lumpur, Malaysia',
        badge: 'Trade Director',
        reason: 'Cross-border alliance leader active in your network',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'rec-9',
        name: 'David Zimmermann',
        title: 'Head of Industrial Supply & Procurement',
        company: 'Vanguard Industrial Corp',
        location: 'Frankfurt, Germany',
        badge: 'Audited Procurement',
        reason: 'Verified decision-maker with active bilateral requirements',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      },
    ];
  }, [lowerLatest, latestQuery]);

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
  const [videoOpen, setVideoOpen] = useState(false);

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

      {/* 1.5 INTERACTIVE CHECKLIST FOR NEW USERS */}
      <OnboardingChecklistWidget
        connectionsCount={stats.connectionsCount}
        onOpenCreatePost={() => setIsPartnershipModalOpen(true)}
      />

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

      {/* 3. COMPACT OPERATIONAL ACTION HUB */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-5xl mx-auto w-full pt-1">
        {/* Card 1: Active Deal Rooms */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-primary-soft text-primary">
                <Handshake className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {stats.dealRoomsCount} Active
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy">Bilateral Deal Rooms</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Mutual NDAs signed, milestone tracking, and bilateral escrow vault.
              </p>
            </div>
          </div>
          <Link
            to="/app/partnerships"
            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Open Deal Rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Handshakes & Connections */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Users className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {stats.connectionsCount} Verified Peers
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy">Executive Handshakes</h3>
              <p className="text-xs text-text-muted mt-0.5">
                {stats.inboundRequestsCount > 0
                  ? `${stats.inboundRequestsCount} inbound handshake request waiting.`
                  : 'Zero cold spam. Bilateral double-opt-in consensus active.'}
              </p>
            </div>
          </div>
          <Link
            to="/app/connections"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            <span>Review Handshakes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Quick Action Hub & Video */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-primary bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                title="Watch 30s Animated Video"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Video (0:30)</span>
              </button>
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy">Fast Actions</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Launch a commercial post, add an enterprise entity, or explore.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPartnershipModalOpen(true)}
              className="flex-1 py-1 px-2 bg-primary-soft hover:bg-primary/20 text-primary font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Post Deal</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddCompanyOpen(true)}
              className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-navy font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Building2 className="w-3 h-3 text-slate-500" />
              <span>Add Firm</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECOMMENDED CONNECTIONS BASED ON RECENT SEARCHES */}
      <div className="max-w-5xl mx-auto w-full space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="w-4 h-4 text-primary" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-navy">
                Recommended Connections
              </h2>
              <p className="text-[11px] text-text-muted">
                {latestQuery
                  ? `Curated decision-makers based on your recent search for "${latestQuery}"`
                  : 'High-mandate commercial decision-makers matching your trade corridor'}
              </p>
            </div>
          </div>
          <Link
            to="/app/search"
            className="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recommendedProfiles.map((person) => (
            <div
              key={person.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-[#1E3A8A] text-white font-black text-sm flex items-center justify-center shrink-0 overflow-hidden">
                    {person.avatarUrl ? (
                      <img src={person.avatarUrl} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      person.name[0]
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {person.badge || 'Verified Mandate'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="font-extrabold text-xs text-navy truncate">{person.name}</h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-700 truncate">{person.title}</p>
                  <p className="text-[11px] text-text-muted truncate">{person.company} &bull; {person.location}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] text-slate-600 font-medium">
                  {person.reason}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/app/search?q=${encodeURIComponent(person.name)}`)}
                  className="text-[11px] font-bold text-slate-600 hover:text-navy transition-colors cursor-pointer"
                >
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/app/search?q=${encodeURIComponent(person.name)}`)}
                  className="px-2.5 py-1 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg text-[11px] flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <Handshake className="w-3 h-3" />
                  <span>Connect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatedVideoModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
      />

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
