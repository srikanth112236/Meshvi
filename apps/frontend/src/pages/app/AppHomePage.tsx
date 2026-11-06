import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import {
  ShieldCheck,
  Plus,
  X,
  Handshake,
  Users,
  ArrowRight,
  Sparkles,
  Search,
  Globe,
  Layers,
  ChevronRight,
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
  void latestQuery;

  const recommendedProfiles = useMemo(() => {
    return [
      {
        id: 'rec-1',
        name: 'Rajiv Sharma',
        title: 'SVP Global Procurement & Amenities',
        company: 'Taj Luxury Hotels & Resorts',
        location: 'Mumbai, India',
        matchScore: 94,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'rec-2',
        name: 'Priya Sundaram',
        title: 'Head of Airport Concessions',
        company: 'Changi Airport Group',
        location: 'Singapore',
        matchScore: 89,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'rec-3',
        name: 'Elena Rostova',
        title: 'Director of Food & Beverage Sourcing',
        company: 'Boreal Food Retail Group',
        location: 'Berlin, Germany',
        matchScore: 86,
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      },
    ];
  }, []);

  const recommendedOpportunities = useMemo(() => {
    return [
      {
        id: 'opp-1',
        title: 'Airport Retail & Transit Concessions Partnership',
        requirement: 'Seeking premium specialty FMCG suppliers for 12 international terminal lounges across SE Asia.',
        company: 'AeroGroup Retail',
        region: 'Singapore & Malaysia',
        category: 'Commercial Distribution',
        matchPct: 96,
      },
      {
        id: 'opp-2',
        title: 'Enterprise AI Logistics Platform Integration',
        requirement: 'Looking for verified supply chain data orchestration API partners with ISO-27001 compliance.',
        company: 'Vanguard Freight Global',
        region: 'Global / Remote',
        category: 'Technology & AI',
        matchPct: 91,
      },
      {
        id: 'opp-3',
        title: 'Cold Brew Beverage Channel Distribution Agreement',
        requirement: 'Exclusive territorial co-packing and enterprise distribution channels for APAC markets.',
        company: 'Pacific Roast Works',
        region: 'Tokyo & Seoul',
        category: 'Strategic Sourcing',
        matchPct: 88,
      },
    ];
  }, []);

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
  const [videoOpen, setVideoOpen] = useState(false);
  const [onboardingDismissed] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const urlSession = searchParams.get('session');

  // Load real-time stats
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

  const handleChipClick = (term: string) => {
    setSearchIntent(term);
    const sessionId = urlSession || activeSessionId || startNewSearchSession();
    navigate(`/app/search?q=${encodeURIComponent(term)}&session=${sessionId}`);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Executive';

  return (
    <div className="w-full space-y-3 sm:space-y-3.5 pb-8 animate-fade-in font-sans">
      {/* 1. Header: Welcome + Executive Profile Snapshot + Quick Action */}
      <div className="bg-white border border-[#E8EDF3] rounded-xl p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative shrink-0">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || 'Executive'}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-2xs bg-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#102B45] to-[#078BCC] text-white font-bold text-sm flex items-center justify-center shadow-2xs">
                {firstName[0]?.toUpperCase() || 'M'}
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[8px] font-black"
              title="Verified Executive"
            >
              ✓
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-bold text-[#142B45] tracking-tight">
                {greeting}, {firstName}
              </h1>
              <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                <span>Verified Executive</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {profile?.currentTitle ? `${profile.currentTitle} · ` : ''}
              {(profile as any)?.company?.name || (profile as any)?.currentCompanyName || 'Global Enterprise Network'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPartnershipModalOpen(true)}
            className="px-3 py-1.5 bg-[#078BCC] hover:bg-[#056FA8] text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Opportunity</span>
          </button>
        </div>
      </div>

      {/* 2. Compact KPI Metrics Row (4 Linear-style KPI cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <Link
          to="/app/connections"
          className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#E8EDF3] shadow-2xs hover:border-[#078BCC]/40 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Active Connections</span>
            <span className="p-1 rounded-md bg-blue-50 text-[#078BCC] group-hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-[#142B45] tracking-tight">{stats.connectionsCount}</span>
            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              Verified Peers
            </span>
          </div>
        </Link>

        <Link
          to="/app/connections"
          className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#E8EDF3] shadow-2xs hover:border-[#078BCC]/40 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Pending Requests</span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Handshake className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-[#142B45] tracking-tight">{stats.inboundRequestsCount}</span>
            <span className="text-[9.5px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
              Inbound
            </span>
          </div>
        </Link>

        <Link
          to="/app/partnerships"
          className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#E8EDF3] shadow-2xs hover:border-[#078BCC]/40 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Active Deal Rooms</span>
            <span className="p-1 rounded-md bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-[#142B45] tracking-tight">{stats.dealRoomsCount}</span>
            <span className="text-[9.5px] font-bold text-[#078BCC] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              NDA Protected
            </span>
          </div>
        </Link>

        <Link
          to="/app/search"
          className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#E8EDF3] shadow-2xs hover:border-[#078BCC]/40 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Executive Matches</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-[#142B45] tracking-tight">
              {stats.quotaLimit - stats.quotaUsed > 0 ? stats.quotaLimit - stats.quotaUsed : 24}
            </span>
            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              Quota Ready
            </span>
          </div>
        </Link>
      </div>

      {/* 3. Compact Intelligent Search & Command Bar (Clean, no 5xl banners) */}
      <div className="bg-white border border-[#E8EDF3] rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchIntent}
              onChange={(e) => setSearchIntent(e.target.value)}
              placeholder="Search verified decision-makers, company mandates, or commercial partnerships..."
              className="w-full h-10 pl-10 pr-9 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#078BCC] focus:ring-3 focus:ring-[#078BCC]/10 transition-all"
            />
            {searchIntent && (
              <button
                type="button"
                onClick={() => setSearchIntent('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-10 px-4 bg-[#078BCC] hover:bg-[#056FA8] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px] pt-0.5">
          <span className="text-slate-400 shrink-0 font-medium">Popular mandates:</span>
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
              className="px-2.5 py-1 bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 rounded-lg whitespace-nowrap transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Collapsible Onboarding Checklist (Only shown if active) */}
      {!onboardingDismissed && (
        <div className="relative">
          <OnboardingChecklistWidget
            connectionsCount={stats.connectionsCount}
            onOpenCreatePost={() => setIsPartnershipModalOpen(true)}
          />
        </div>
      )}

      {/* 5. Two-Column Intelligence Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Main Column (8 Cols): Opportunities & Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recommended Opportunities Feed */}
          <div className="bg-white border border-[#E8EDF3] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#142B45] tracking-tight">
                  Recommended Opportunities
                </h2>
                <p className="text-[11px] text-slate-500">
                  Curated commercial mandates aligned with your verified corporate profile.
                </p>
              </div>
              <Link
                to="/app/partnerships"
                className="text-xs font-semibold text-[#078BCC] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-[#078BCC]/50 bg-slate-50/50 hover:bg-white transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-[#078BCC] bg-blue-50 px-2 py-0.5 rounded">
                          {opp.category}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {opp.matchPct}% Match
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#078BCC] transition-colors">
                        {opp.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/app/partnerships')}
                      className="px-3 py-1.5 bg-[#078BCC] hover:bg-[#056FA8] text-white text-[11px] font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
                    >
                      Initiate
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {opp.requirement}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">{opp.company}</span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {opp.region}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access to My Deals Pipeline */}
          <div className="bg-white border border-[#E8EDF3] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#142B45]">Deal Pipeline & Collaborative Vault</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your active deals, project milestones, and signed agreements.
              </p>
            </div>
            <Link
              to="/app/partnerships?tab=deals"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1"
            >
              <span>Open Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Sidebar Column (4 Cols): Recommended Decision-Makers & Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recommended Leaders */}
          <div className="bg-white border border-[#E8EDF3] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#142B45] tracking-tight">
                  Suggested Leaders
                </h2>
                <p className="text-[11px] text-slate-500">Verified executives in your corridor.</p>
              </div>
              <Link
                to="/app/search"
                className="text-xs font-semibold text-[#078BCC] hover:underline"
              >
                Explore
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedProfiles.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{p.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.company}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/app/search?q=${encodeURIComponent(p.name)}`)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 rounded-lg shadow-2xs shrink-0 transition-colors"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Help & Video Guide */}
          <div className="bg-gradient-to-br from-[#102B45] to-[#078BCC] text-white rounded-2xl p-4.5 shadow-sm space-y-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-sky-200">
              Meshvi Safety & Privacy
            </span>
            <h3 className="text-sm font-bold">How our spam-free network protects your inbox</h3>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              Both people must agree before connecting. Zero cold spam, zero automated sales pitches.
            </p>
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="mt-1 text-xs font-bold text-white hover:text-sky-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Watch 60-second walkthrough</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Shared Modals */}
      <CreatePartnershipPostModal
        isOpen={isPartnershipModalOpen}
        onClose={() => setIsPartnershipModalOpen(false)}
        onPostCreated={() => {
          setIsPartnershipModalOpen(false);
          navigate('/app/partnerships');
        }}
      />

      <AddCompanyModal
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
        onSuccess={() => setIsAddCompanyOpen(false)}
      />

      <AnimatedVideoModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
      />
    </div>
  );
};
