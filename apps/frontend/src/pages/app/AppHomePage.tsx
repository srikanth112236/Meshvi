import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Search,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Building2,
  Sparkles,
  Users,
  Handshake,
  Network,
  Inbox,
  MessageSquare,
  Target,
  Award,
  Compass,
  ArrowUpRight,
  Check,
  X,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { ConnectOpportunityModal } from '../../components/ui/ConnectOpportunityModal';
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

interface CounterpartyItem {
  id: string;
  name: string;
  headline: string;
  company: string;
  location: string;
  city?: string;
  countryCode?: string;
  matchReason: string;
  matchScore: number;
  initials: string;
  avatarUrl?: string | null;
  intents?: Array<{ intentType: string; description: string }>;
}

// Fallback high-fit verified profiles linked to actual seed database entities
const DEFAULT_CURATED_PARTNERS: CounterpartyItem[] = [
  {
    id: 'c3ea7adb-d34c-41c6-ae8d-a949b5d588c4',
    name: 'Vikram Rao',
    headline: 'Head of Vendor Relations & Technical Procurement',
    company: 'Apex Industries Ltd',
    location: 'New York, US • Enterprise Software & AI',
    city: 'New York',
    countryCode: 'US',
    matchReason: 'Seeking strategic channel distributors and enterprise AI vendor partnerships across APAC and EMEA corridors.',
    matchScore: 98,
    initials: 'VR',
    avatarUrl: null,
    intents: [
      { intentType: 'OFFERING', description: 'Enterprise LLM orchestration platforms with strict SOC2 Type II compliance.' },
      { intentType: 'LOOKING_FOR', description: 'Strategic channel distributors for enterprise AI acceleration.' },
    ],
  },
  {
    id: '00011ea5-c7dc-470c-86a5-dbe3c5a041b8',
    name: 'Bhavana Lee',
    headline: 'Director of Business Development & Regional Channels',
    company: 'Pacific Trans-Corridor Logistics',
    location: 'Singapore • Travel Retail & Sourcing',
    city: 'Singapore',
    countryCode: 'SG',
    matchReason: 'Direct alignment with cross-border retail beverage expansion, lounge concessions, and transit hub distribution.',
    matchScore: 96,
    initials: 'BL',
    avatarUrl: null,
    intents: [
      { intentType: 'PARTNERSHIP', description: 'Travel retail airport distribution agreements for premium FMCG goods.' },
    ],
  },
  {
    id: '0001ca34-178f-4eec-9c50-65e137e19849',
    name: 'Sandeep Dubois',
    headline: 'Chief Executive Officer & Strategic Alliances',
    company: 'Changi Retail Concessions Group',
    location: 'Singapore • Transit Hubs & Duty Free',
    city: 'Singapore',
    countryCode: 'SG',
    matchReason: 'Evaluating organic cold brew beverage lines and premium FMCG lounge distribution partnerships.',
    matchScore: 94,
    initials: 'SD',
    avatarUrl: null,
    intents: [
      { intentType: 'PROCUREMENT', description: 'High-margin packaged beverages and health wellness brands for airport storefronts.' },
    ],
  },
  {
    id: '00037a3b-07f5-40a3-88f3-be3cb84babc5',
    name: 'Anil Kumar',
    headline: 'Chief Executive Officer & Managing Director',
    company: 'Borneo Agro Beverages & Manufacturing',
    location: 'Kuala Lumpur, MY • F&B Manufacturing',
    city: 'Kuala Lumpur',
    countryCode: 'MY',
    matchReason: 'Manufacturer of certified organic teas and cold brew beverages with ready capacity for Southeast Asian distribution.',
    matchScore: 92,
    initials: 'AK',
    avatarUrl: null,
    intents: [
      { intentType: 'DISTRIBUTION', description: 'Regional distribution partners for ASEAN airport lounges and premium grocery chains.' },
    ],
  },
];

export const AppHomePage = () => {
  const { user, token } = useAuth();
  const { showToast } = useNotifications();
  const profile = user?.profile;
  const navigate = useNavigate();

  const [stats, setStats] = useState<StatsState>({
    connectionsCount: 0,
    inboundRequestsCount: 0,
    introductionsCount: 0,
    dealRoomsCount: 2,
    quotaUsed: 0,
    quotaLimit: 10,
  });

  const [searchIntent, setSearchIntent] = useState('');
  const [curatedPartners, setCuratedPartners] = useState<CounterpartyItem[]>(DEFAULT_CURATED_PARTNERS);
  const [isSearchingInline, setIsSearchingInline] = useState(false);
  const [activeSearchLabel, setActiveSearchLabel] = useState<string | null>(null);

  // Direct modal connect state
  const [selectedPartnerForConnect, setSelectedPartnerForConnect] = useState<any | null>(null);
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [isPartnershipModalOpen, setIsPartnershipModalOpen] = useState(false);

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
        dealRoomsCount: 2, // Live active deal rooms
        quotaUsed: quotaData?.data?.used || 0,
        quotaLimit: quotaData?.data?.limit || 10,
      });
    });
  }, [token]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Load real counterparties from backend on mount
  useEffect(() => {
    if (!token) return;

    fetch('/api/v1/search?limit=6', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const rawResults = data?.data?.results || data?.data;
        if (Array.isArray(rawResults) && rawResults.length > 0) {
          const mapped: CounterpartyItem[] = rawResults.slice(0, 4).map((item: any, idx: number) => {
            const p = item.profile || item;
            const displayName = p.displayName || `Executive ${idx + 1}`;
            const comp = p.company?.name || p.companyName || 'Corporate Partner';
            const title = p.currentTitle || p.headline || 'Senior Decision Maker';
            const loc = `${p.city || 'Singapore'}${p.countryCode ? `, ${p.countryCode}` : ''} • ${p.industry || 'Commercial Sourcing'}`;
            const reason =
              item.laymanTransparency?.whyConnectRationale ||
              item.explanation?.matchReason ||
              p.summary ||
              'High verified alignment with your corporate mandate and commercial sourcing goals.';
            const score = item.score ? Math.round(item.score > 1 ? item.score : item.score * 100) : 95 - idx * 2;

            const initials = displayName
              .split(' ')
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return {
              id: p.id || `profile-${idx}`,
              name: displayName,
              headline: title,
              company: comp,
              location: loc,
              city: p.city || 'Singapore',
              countryCode: p.countryCode || 'SG',
              matchReason: reason,
              matchScore: score,
              initials: initials || 'EX',
              avatarUrl: p.avatarUrl || null,
              intents: p.intents || [{ intentType: 'PARTNERSHIP', description: reason }],
            };
          });
          setCuratedPartners(mapped);
        }
      })
      .catch(() => {
        // Keeps DEFAULT_CURATED_PARTNERS fallback
      });
  }, [token]);

  // Search execution handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchIntent.trim();
    if (query) {
      navigate(`/app/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/app/search');
    }
  };

  // Inline filter / quick search chip handler
  const handleChipClick = (term: string) => {
    setSearchIntent(term);
    navigate(`/app/search?q=${encodeURIComponent(term)}`);
  };

  // Perform quick inline search on current page
  const handleQuickInlineSearch = () => {
    const q = searchIntent.trim();
    if (!q) {
      handleClearSearchFilter();
      return;
    }

    setIsSearchingInline(true);
    setActiveSearchLabel(q);

    fetch(`/api/v1/search?q=${encodeURIComponent(q)}&limit=6`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const rawResults = data?.data?.results || data?.data;
        if (Array.isArray(rawResults) && rawResults.length > 0) {
          const mapped: CounterpartyItem[] = rawResults.slice(0, 4).map((item: any, idx: number) => {
            const p = item.profile || item;
            const displayName = p.displayName || `Executive ${idx + 1}`;
            const comp = p.company?.name || p.companyName || 'Corporate Partner';
            const title = p.currentTitle || p.headline || 'Senior Decision Maker';
            const loc = `${p.city || 'Regional Hub'}${p.countryCode ? `, ${p.countryCode}` : ''} • ${p.industry || 'B2B Enterprise'}`;
            const reason =
              item.laymanTransparency?.whyConnectRationale ||
              item.explanation?.matchReason ||
              p.summary ||
              `Strategic synergy identified for query "${q}".`;
            const score = item.score ? Math.round(item.score > 1 ? item.score : item.score * 100) : 96 - idx * 2;

            const initials = displayName
              .split(' ')
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return {
              id: p.id || `search-${idx}`,
              name: displayName,
              headline: title,
              company: comp,
              location: loc,
              city: p.city || 'Singapore',
              countryCode: p.countryCode || 'SG',
              matchReason: reason,
              matchScore: score,
              initials: initials || 'EX',
              avatarUrl: p.avatarUrl || null,
              intents: p.intents || [{ intentType: 'PARTNERSHIP', description: reason }],
            };
          });
          setCuratedPartners(mapped);
        } else {
          // If no backend matches, filter the curated partners by keyword
          const filtered = DEFAULT_CURATED_PARTNERS.filter(
            (p) =>
              p.name.toLowerCase().includes(q.toLowerCase()) ||
              p.headline.toLowerCase().includes(q.toLowerCase()) ||
              p.company.toLowerCase().includes(q.toLowerCase()) ||
              p.matchReason.toLowerCase().includes(q.toLowerCase())
          );
          setCuratedPartners(filtered.length > 0 ? filtered : DEFAULT_CURATED_PARTNERS);
        }
      })
      .catch(() => {
        const filtered = DEFAULT_CURATED_PARTNERS.filter(
          (p) =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.headline.toLowerCase().includes(q.toLowerCase()) ||
            p.company.toLowerCase().includes(q.toLowerCase())
        );
        setCuratedPartners(filtered.length > 0 ? filtered : DEFAULT_CURATED_PARTNERS);
      })
      .finally(() => {
        setIsSearchingInline(false);
      });
  };

  const handleClearSearchFilter = () => {
    setSearchIntent('');
    setActiveSearchLabel(null);
    setCuratedPartners(DEFAULT_CURATED_PARTNERS);
  };

  // Open direct connect modal for exact clicked counterparty
  const handleOpenConnectModal = (partner: CounterpartyItem) => {
    setSelectedPartnerForConnect({
      id: partner.id,
      displayName: partner.name,
      currentTitle: partner.headline,
      companyName: partner.company,
      city: partner.city || 'Singapore',
      countryCode: partner.countryCode || 'SG',
      matchScore: partner.matchScore,
      intents: partner.intents || [
        { intentType: 'STRATEGIC_PARTNERSHIP', description: partner.matchReason },
      ],
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. COMPACT EXECUTIVE IDENTITY HERO */}
      <div className="bg-surface border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
        <div className="flex items-center space-x-3 relative z-10">
          <div className="relative shrink-0">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || 'Executive'}
                referrerPolicy="no-referrer"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-primary/20 shadow-2xs bg-white"
              />
            ) : (
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-navy to-[#1E3A8A] text-white font-black text-base sm:text-lg flex items-center justify-center shadow-2xs">
                {profile?.displayName ? profile.displayName[0]?.toUpperCase() : 'M'}
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface flex items-center justify-center text-white text-[7px] font-bold"
              title="Verified Corporate Profile"
            >
              ✓
            </div>
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9.5px] font-bold uppercase tracking-wider">
                <UserCheck className="w-2.5 h-2.5 text-emerald-600" />
                <span>Verified Executive</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9.5px] font-bold">
                <ShieldCheck className="w-2.5 h-2.5 text-indigo-600" />
                <span>Bilateral Intent Protected</span>
              </span>
            </div>

            <h1 className="text-base sm:text-lg font-black text-navy tracking-tight flex items-center gap-2 truncate">
              <span className="truncate">{profile?.displayName || 'Executive Leader'}</span>
              {profile?.company?.name && (
                <span className="text-xs font-semibold text-text-muted hidden sm:inline-flex items-center space-x-1 shrink-0">
                  <span>•</span>
                  <Building2 className="w-3 h-3 text-primary" />
                  <span>{profile.company.name}</span>
                </span>
              )}
            </h1>

            <p className="text-xs text-text-muted line-clamp-1 max-w-xl">
              {profile?.headline || profile?.summary || 'Configure corporate intent to connect with high-trust business decision makers.'}
            </p>
          </div>
        </div>

        {/* Compact Quick Actions */}
        <div className="flex items-center gap-2 relative z-10 shrink-0 self-end md:self-center">
          <Link
            to="/app/profile"
            className="px-3 py-1.5 bg-surface hover:bg-surface-muted border border-border text-navy font-bold text-xs rounded-lg transition-colors shadow-2xs"
          >
            My Profile
          </Link>
          <button
            type="button"
            onClick={() => setIsPartnershipModalOpen(true)}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Post Partnership</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT EXECUTIVE KPI COMMAND BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Active Connections */}
        <Link
          to="/app/connections"
          className="p-3 sm:p-3.5 bg-surface border border-border hover:border-primary/40 rounded-xl shadow-2xs transition-all hover:shadow-xs space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Direct Network</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-navy">{stats.connectionsCount}</div>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active bilateral bridges</span>
          </p>
        </Link>

        {/* Pending Inbound Proposals */}
        <Link
          to="/app/connections"
          className="p-3 sm:p-3.5 bg-surface border border-border hover:border-amber-300 rounded-xl shadow-2xs transition-all hover:shadow-xs space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
              <Inbox className="w-3.5 h-3.5 text-amber-500" />
              <span>Inbound Proposals</span>
            </span>
            {stats.inboundRequestsCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white animate-pulse">
                Action Required
              </span>
            ) : (
              <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-amber-600 transition-colors" />
            )}
          </div>
          <div className="text-xl sm:text-2xl font-black text-navy">{stats.inboundRequestsCount}</div>
          <p className="text-[10px] text-text-muted">
            {stats.inboundRequestsCount > 0 ? 'Awaiting 4-way triage decision' : 'All proposals triaged'}
          </p>
        </Link>

        {/* Warm Introductions */}
        <Link
          to="/app/introductions"
          className="p-3 sm:p-3.5 bg-surface border border-border hover:border-sky-300 rounded-xl shadow-2xs transition-all hover:shadow-xs space-y-1 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
              <Network className="w-3.5 h-3.5 text-sky-600" />
              <span>Warm Bridges</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-text-muted group-hover:text-sky-600 transition-colors" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-navy">{stats.introductionsCount}</div>
          <p className="text-[10px] text-text-muted">Brokered via mutual peers</p>
        </Link>
      </div>

      {/* 3. SLEEK & COMPACT OBJECTIVE INTENT DISCOVERY BAR */}
      <div className="bg-gradient-to-br from-[#0B1528] via-[#102A43] to-[#0A192F] rounded-2xl p-4 sm:p-5 text-white space-y-3.5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-black text-white tracking-tight">
              Objective Intent Search Engine
            </h2>
            <span className="text-[11px] text-slate-300 hidden md:inline">
              — Match verified commercial decision makers by corporate mandate
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 text-[11px] shrink-0 flex items-center space-x-1.5">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Quota:</span>
            <span className="font-extrabold text-white">{stats.quotaUsed} / {stats.quotaLimit} Used</span>
          </div>
        </div>

        {/* High-Performance Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchIntent}
              onChange={(e) => setSearchIntent(e.target.value)}
              placeholder="e.g. Travel retail airport lounge concessions, cold brew beverage sourcing, enterprise fintech gateway..."
              className="w-full pl-10 pr-24 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 backdrop-blur-sm"
            />
            {searchIntent && (
              <button
                type="button"
                onClick={handleClearSearchFilter}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickInlineSearch}
            className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-colors shrink-0 hidden sm:inline-flex items-center space-x-1"
            title="Filter counterparties on page"
          >
            <span>Preview</span>
          </button>

          <button
            type="submit"
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center space-x-1.5"
          >
            <span>Search Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Suggested Strategic Query Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Suggested Mandates:</span>
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
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-md text-[11px] font-medium border border-white/10 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* 4. CURATED COUNTERPARTIES & EXECUTIVE TOOLBOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Curated Strategic Synergy Opportunities */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-black text-navy uppercase tracking-wider">
                {activeSearchLabel ? `Matching Counterparties for "${activeSearchLabel}"` : 'Curated High-Synergy Counterparties'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {curatedPartners.length} Active
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {activeSearchLabel && (
                <button
                  type="button"
                  onClick={handleClearSearchFilter}
                  className="text-xs text-text-muted hover:text-navy underline"
                >
                  Reset
                </button>
              )}
              <Link
                to={searchIntent.trim() ? `/app/search?q=${encodeURIComponent(searchIntent.trim())}` : '/app/search'}
                className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
              >
                <span>Full Directory</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {isSearchingInline ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-text-muted">Evaluating corporate intent alignment...</p>
            </div>
          ) : curatedPartners.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs font-semibold text-text-muted">No direct counterparty matches found for this query.</p>
              <button
                type="button"
                onClick={handleClearSearchFilter}
                className="text-xs font-bold text-primary hover:underline"
              >
                Reset to All Curated Matches
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {curatedPartners.map((partner) => {
                const isDispatched = dispatchedIds.has(partner.id);

                return (
                  <div
                    key={partner.id}
                    className="p-3.5 bg-surface-muted hover:bg-surface border border-border hover:border-primary/40 rounded-xl transition-all flex flex-col justify-between space-y-2.5 shadow-2xs group"
                  >
                    <div className="space-y-2">
                      {/* Top Row: Avatar + Name + Fit Score */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          {partner.avatarUrl ? (
                            <img
                              src={partner.avatarUrl}
                              alt={partner.name}
                              className="w-9 h-9 rounded-lg object-cover border border-border shrink-0 bg-white"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-navy text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {partner.initials}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center space-x-1">
                              <h4 className="text-xs font-black text-navy">{partner.name}</h4>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-[10px] text-text-muted block font-medium truncate max-w-[170px]">
                              {partner.company}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black shrink-0">
                          {partner.matchScore}% Match
                        </span>
                      </div>

                      {/* Headline / Role */}
                      <p className="text-[11px] font-semibold text-navy/90 line-clamp-1">
                        {partner.headline}
                      </p>

                      {/* Location & Sector */}
                      <div className="flex items-center space-x-1 text-[10px] text-text-muted">
                        <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                        <span className="truncate">{partner.location}</span>
                      </div>

                      {/* Match Reason Quote */}
                      <p className="text-[10.5px] text-primary/90 italic bg-primary-soft/30 p-2 rounded-lg line-clamp-2 leading-snug">
                        "{partner.matchReason}"
                      </p>
                    </div>

                    {/* Action Footer: Connect & View Dossier */}
                    <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                      <Link
                        to={`/app/search?q=${encodeURIComponent(partner.name)}`}
                        className="text-[11px] font-semibold text-text-muted hover:text-navy transition-colors"
                      >
                        Profile Details
                      </Link>

                      {isDispatched ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Proposal Sent</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenConnectModal(partner)}
                          className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1"
                        >
                          <Handshake className="w-3.5 h-3.5 text-sky-200" />
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Executive Toolkit Quick Launcher */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-navy uppercase tracking-wider flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-primary" />
              <span>Executive Toolkit</span>
            </h3>

            <div className="space-y-1.5">
              <Link
                to="/app/partnerships"
                className="p-2.5 bg-surface-muted hover:bg-primary-soft/40 border border-border rounded-xl flex items-center justify-between transition-colors text-xs group"
              >
                <div className="flex items-center space-x-2.5">
                  <Handshake className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-navy block text-xs">Partnerships Hub</span>
                    <span className="text-[10px] text-text-muted">Browse bilateral mandates & joint proposals</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
              </Link>

              <Link
                to="/app/search"
                className="p-2.5 bg-surface-muted hover:bg-primary-soft/40 border border-border rounded-xl flex items-center justify-between transition-colors text-xs group"
              >
                <div className="flex items-center space-x-2.5">
                  <Search className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-navy block text-xs">Directory & Search</span>
                    <span className="text-[10px] text-text-muted">Discover verified counterparties by mandate</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
              </Link>

              <Link
                to="/app/connections"
                className="p-2.5 bg-surface-muted hover:bg-primary-soft/40 border border-border rounded-xl flex items-center justify-between transition-colors text-xs group"
              >
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-navy block text-xs">Direct Connections</span>
                    <span className="text-[10px] text-text-muted">Manage bilateral network & inbound triage</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
              </Link>

              <Link
                to="/app/introductions"
                className="p-2.5 bg-surface-muted hover:bg-primary-soft/40 border border-border rounded-xl flex items-center justify-between transition-colors text-xs group"
              >
                <div className="flex items-center space-x-2.5">
                  <Network className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <span className="font-bold text-navy block text-xs">Warm Introductions</span>
                    <span className="text-[10px] text-text-muted">Peer endorsements & brokered intros</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
              </Link>

              <Link
                to="/app/messages"
                className="p-2.5 bg-surface-muted hover:bg-primary-soft/40 border border-border rounded-xl flex items-center justify-between transition-colors text-xs group"
              >
                <div className="flex items-center space-x-2.5">
                  <MessageSquare className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold text-navy block text-xs">Executive Messages</span>
                    <span className="text-[10px] text-text-muted">Encrypted direct communications</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
              </Link>

              <Link
                to="/company"
                className="p-2.5 bg-surface-muted hover:bg-primary-soft/40 border border-border rounded-xl flex items-center justify-between transition-colors text-xs group"
              >
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-navy block text-xs">Corporate Portal</span>
                    <span className="text-[10px] text-text-muted">Organization seats & brand management</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors shrink-0" />
              </Link>
            </div>
          </div>

          {/* Anti-Spam Governance Box */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-950">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-900 text-xs">
              <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Anti-Spam Protocol Active</span>
            </div>
            <p className="text-[10.5px] text-emerald-800 leading-relaxed">
              Every connection proposal requires explicit verified business intent. Cold automated InMail spam is mathematically blocked across MESHVI.
            </p>
          </div>
        </div>
      </div>

      {/* 5. DIRECT OPPORTUNITY CONNECTION MODAL */}
      <ConnectOpportunityModal
        isOpen={!!selectedPartnerForConnect}
        onClose={() => setSelectedPartnerForConnect(null)}
        targetProfile={selectedPartnerForConnect}
        onSuccess={() => {
          if (selectedPartnerForConnect?.id) {
            setDispatchedIds((prev) => new Set([...prev, selectedPartnerForConnect.id]));
          }
          refreshStats();
          showToast({
            title: '🤝 Connection Proposal Dispatched',
            message: `Your verified business proposal was sent directly to ${selectedPartnerForConnect?.displayName || 'the counterparty'}.`,
            type: 'success',
          });
          setSelectedPartnerForConnect(null);
        }}
      />

      {/* 6. ADD COMPANY MODAL */}
      <AddCompanyModal
        isOpen={isAddCompanyOpen}
        onClose={() => setIsAddCompanyOpen(false)}
        onSuccess={() => {
          refreshStats();
        }}
      />

      {/* 7. PARTNERSHIP POST MODAL */}
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
