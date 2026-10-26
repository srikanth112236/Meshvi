import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Target,
  Gift,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  HelpCircle,
  Handshake,
  Layers,
  Check,
  MessageSquare,
  Pause,
  Play,
  Archive,
  Edit,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { OpportunitySetupModal } from '../../components/ui/OpportunitySetupModal';
import { ExpressInterestModal } from '../../components/ui/ExpressInterestModal';
import { OpportunityClarifyModal } from '../../components/ui/OpportunityClarifyModal';

type TabType = 'matches' | 'discover' | 'mine' | 'received' | 'sent' | 'connected';

export const OpportunitiesPage: React.FC = () => {
  const { user, token } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (searchParams.get('tab') as TabType) || 'matches';

  const [loading, setLoading] = useState(true);
  const [myOpportunities, setMyOpportunities] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [discoveredOpps, setDiscoveredOpps] = useState<any[]>([]);

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<any | null>(null);

  const [interestMatch, setInterestMatch] = useState<any | null>(null);

  const [clarifyRequest, setClarifyRequest] = useState<any | null>(null);
  const [clarifyMode, setClarifyMode] = useState<'ask' | 'answer'>('ask');

  // Filters for Matches
  const [matchLevelFilter, setMatchLevelFilter] = useState<'ALL' | 'MUTUAL_INTENT' | 'POTENTIAL_FIT'>('ALL');
  const [savedMatchIds, setSavedMatchIds] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [oppsRes, matchesRes, requestsRes, discoverRes] = await Promise.all([
        fetch('/api/v1/opportunities/mine', { headers }),
        fetch('/api/v1/opportunities/matches', { headers }),
        fetch('/api/v1/opportunities/requests', { headers }),
        fetch('/api/v1/opportunities/discover', { headers }),
      ]);

      const [oppsData, matchesData, requestsData, discoverData] = await Promise.all([
        oppsRes.json(),
        matchesRes.json(),
        requestsRes.json(),
        discoverRes.json(),
      ]);

      if (oppsRes.ok && oppsData.success) {
        setMyOpportunities(oppsData.data || []);
      }
      if (matchesRes.ok && matchesData.success) {
        setMatches(matchesData.data || []);
      }
      if (requestsRes.ok && requestsData.success) {
        setRequests(requestsData.data || []);
      }
      if (discoverRes.ok && discoverData.success) {
        setDiscoveredOpps(discoverData.data || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
  };

  const handleTogglePause = async (opp: any) => {
    const action = opp.status === 'ACTIVE' ? 'pause' : 'publish';
    try {
      const res = await fetch(`/api/v1/opportunities/${opp.id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          title: action === 'pause' ? 'Opportunity Paused' : 'Opportunity Activated',
          message: action === 'pause' ? 'Opportunity matching temporarily paused.' : 'Opportunity is active and matching.',
          type: 'success',
        });
        loadData();
      }
    } catch {
      showToast({ title: 'Action failed', message: 'Unable to update status', type: 'error' });
    }
  };

  const handleArchive = async (oppId: string) => {
    if (!window.confirm('Are you sure you want to archive this opportunity?')) return;
    try {
      const res = await fetch(`/api/v1/opportunities/${oppId}/archive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast({ title: 'Opportunity Archived', message: 'Moved to archived records.', type: 'info' });
        loadData();
      }
    } catch {
      showToast({ title: 'Error', message: 'Unable to archive', type: 'error' });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/v1/opportunities/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          title: '🎉 Opportunity Accepted!',
          message: 'Connection established and a bilateral Deal Room is now ready.',
          type: 'success',
        });
        loadData();
        if (data.data?.dealRoomId) {
          navigate(`/app/deal-rooms/${data.data.dealRoomId}`);
        }
      } else {
        throw new Error(data.error?.message || 'Failed to accept');
      }
    } catch (err: any) {
      showToast({ title: 'Accept Failed', message: err.message, type: 'error' });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/v1/opportunities/requests/${requestId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Not a mutual commercial fit at this time.' }),
      });
      if (res.ok) {
        showToast({ title: 'Request Declined', message: 'Recorded decision.', type: 'info' });
        loadData();
      }
    } catch {
      showToast({ title: 'Error', message: 'Unable to decline', type: 'error' });
    }
  };

  const toggleSaveMatch = (matchId: string) => {
    setSavedMatchIds((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    );
  };

  // Filtered lists
  const filteredMatches = matches.filter((m) => {
    if (matchLevelFilter === 'MUTUAL_INTENT') return m.matchLevel === 'MUTUAL_INTENT';
    if (matchLevelFilter === 'POTENTIAL_FIT') return m.matchLevel === 'POTENTIAL_FIT';
    return true;
  });

  const receivedRequests = requests.filter((r) => r.recipientUserId === user?.id);
  const sentRequests = requests.filter((r) => r.senderUserId === user?.id);
  const connectedRequests = requests.filter((r) => r.status === 'ACCEPTED');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-black text-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-neutral-950">
              Gap 1 Implementation
            </span>
            <span className="text-neutral-400 text-xs">Bilateral Symmetrical Alignment</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Mutual Opportunity Matching
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Match what both sides want. Align verified corporate capabilities with explicit buyer demands across transit and regional commercial corridors.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingOpp(null);
            setIsSetupOpen(true);
          }}
          className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md transition-all shrink-0 self-start md:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4 text-neutral-900" />
          <span>Create Opportunity Profile</span>
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center space-x-1 border-b border-border overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => handleTabChange('matches')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'matches'
              ? 'border-black text-navy bg-surface shadow-2xs'
              : 'border-transparent text-text-muted hover:text-navy hover:bg-neutral-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Mutual Matches</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-100 text-navy font-bold">
            {matches.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('discover')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'discover'
              ? 'border-black text-navy bg-surface shadow-2xs'
              : 'border-transparent text-text-muted hover:text-navy hover:bg-neutral-50'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-sky-600" />
          <span>Network Directory</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-100 text-navy font-bold">
            {discoveredOpps.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('mine')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'mine'
              ? 'border-black text-navy bg-surface shadow-2xs'
              : 'border-transparent text-text-muted hover:text-navy hover:bg-neutral-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>My Opportunities</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-100 text-navy font-bold">
            {myOpportunities.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('received')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'received'
              ? 'border-black text-navy bg-surface shadow-2xs'
              : 'border-transparent text-text-muted hover:text-navy hover:bg-neutral-50'
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600 rotate-180" />
          <span>Received Requests</span>
          {receivedRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold">
              {receivedRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('sent')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'sent'
              ? 'border-black text-navy bg-surface shadow-2xs'
              : 'border-transparent text-text-muted hover:text-navy hover:bg-neutral-50'
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
          <span>Sent Requests</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-100 text-navy font-bold">
            {sentRequests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('connected')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center space-x-2 border-b-2 ${
            activeTab === 'connected'
              ? 'border-black text-navy bg-surface shadow-2xs'
              : 'border-transparent text-text-muted hover:text-navy hover:bg-neutral-50'
          }`}
        >
          <Handshake className="w-3.5 h-3.5 text-indigo-600" />
          <span>Connected Deals</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-100 text-navy font-bold">
            {connectedRequests.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. MATCHES TAB */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {/* Subheader & Level Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-navy">Filter Overlap Level:</span>
              <div className="flex items-center space-x-1 bg-bg p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setMatchLevelFilter('ALL')}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                    matchLevelFilter === 'ALL' ? 'bg-black text-white shadow-xs' : 'text-text-muted hover:text-navy'
                  }`}
                >
                  All ({matches.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMatchLevelFilter('MUTUAL_INTENT')}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                    matchLevelFilter === 'MUTUAL_INTENT'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-navy'
                  }`}
                >
                  Mutual Intent Only
                </button>
                <button
                  type="button"
                  onClick={() => setMatchLevelFilter('POTENTIAL_FIT')}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                    matchLevelFilter === 'POTENTIAL_FIT'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-navy'
                  }`}
                >
                  Potential Fit
                </button>
              </div>
            </div>

            <div className="text-xs text-text-muted flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Grounded Claims: Never inferring intent without explicit declaration</span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-text-muted bg-surface rounded-2xl border border-border">
              Calculating two-sided mutual intent overlaps...
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-sm font-bold text-navy">No mutual matches found yet</h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Create or publish an opportunity profile with active seeking requirements and offering capabilities to unlock bilateral matches.
              </p>
              <button
                type="button"
                onClick={() => setIsSetupOpen(true)}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
              >
                Create Opportunity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map((m) => {
                const targetOpp = m.targetOpportunity;
                const evidence = m.evidence || {};
                const isMutual = m.matchLevel === 'MUTUAL_INTENT';
                const isSaved = savedMatchIds.includes(m.id);

                return (
                  <div
                    key={m.id}
                    className="p-5 bg-surface border border-border rounded-2xl shadow-xs hover:border-black/30 transition-all space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-black text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {targetOpp.company?.name?.[0] || targetOpp.profile?.displayName?.[0] || 'O'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h3 className="text-sm font-bold text-navy">{targetOpp.title}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center space-x-1 ${
                                isMutual
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-sky-50 text-sky-800 border-sky-300'
                              }`}
                            >
                              <span>{isMutual ? '⚡ Confirmed Mutual Intent' : 'Potential Fit'}</span>
                            </span>
                          </div>

                          <div className="text-xs text-text-muted flex items-center space-x-1.5 mt-0.5">
                            <span className="font-semibold text-navy">
                              {targetOpp.company?.name || targetOpp.profile?.displayName}
                            </span>
                            <span>&bull;</span>
                            <span>{targetOpp.company?.industry || 'Enterprise Sector'}</span>
                            <span>&bull;</span>
                            <span>{targetOpp.company?.headquartersCountry || 'Global'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-xl bg-neutral-100 text-navy font-mono font-bold text-xs border border-neutral-300">
                          {Math.round(m.score)}% Overlap
                        </span>
                      </div>
                    </div>

                    {/* Symmetrical Two-Sided Overlap Card (Specified in Gap 1) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gradient-to-br from-neutral-50 to-neutral-100/70 border border-border rounded-xl">
                      {/* What you want */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy block flex items-center space-x-1">
                          <Target className="w-3 h-3 text-emerald-600" />
                          <span>What you seek</span>
                        </span>
                        <p className="text-xs text-text-muted leading-relaxed">
                          {evidence.sourceWants || 'Distribution and concession partnership opportunities.'}
                        </p>
                      </div>

                      {/* What they offer */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy block flex items-center space-x-1">
                          <Gift className="w-3 h-3 text-sky-600" />
                          <span>What they offer</span>
                        </span>
                        <p className="text-xs text-text-muted leading-relaxed">
                          {evidence.candOffers || targetOpp.offers?.[0]?.productsServices || 'Verified commercial capabilities.'}
                        </p>
                      </div>

                      {/* Geography */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy block flex items-center space-x-1">
                          <Globe className="w-3 h-3 text-amber-600" />
                          <span>Geography Alignment</span>
                        </span>
                        <p className="text-xs text-text-muted leading-relaxed font-semibold text-navy">
                          {evidence.commonMarkets?.length > 0
                            ? evidence.commonMarkets.join(', ')
                            : 'Southeast Asia Trade Corridors'}
                        </p>
                        <span className="text-[10.5px] text-text-muted block">
                          Aligned partner type and regional jurisdiction
                        </span>
                      </div>
                    </div>

                    {/* Why It Matches Explanation */}
                    <div className="p-3 bg-bg rounded-xl border border-border space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-navy">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Why it matches:</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{m.whyMatches}</p>

                      {evidence.overlaps && evidence.overlaps.length > 0 && (
                        <div className="pt-2 border-t border-border flex flex-wrap gap-1.5">
                          {evidence.overlaps.map((overlap: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-surface text-navy text-[10.5px] font-semibold rounded-md border border-border"
                            >
                              &bull; {overlap}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-text-muted font-medium">
                        Last evaluated: {new Date(m.lastEvaluatedAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => toggleSaveMatch(m.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                            isSaved
                              ? 'bg-neutral-900 text-white border-black'
                              : 'bg-surface hover:bg-neutral-100 text-navy border-border'
                          }`}
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setInterestMatch(m)}
                          className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Express Interest</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 1b. DISCOVER / NETWORK DIRECTORY TAB */}
      {activeTab === 'discover' && (
        <div className="space-y-4">
          <div className="bg-surface p-4 rounded-xl border border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy">All Public Network Opportunities</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Browse verified institutional concessions, commercial mandates, and executive partnerships across ASEAN transit corridors.
              </p>
            </div>
            <span className="text-xs text-text-muted font-mono">
              {discoveredOpps.length} Opportunities Listed
            </span>
          </div>

          {discoveredOpps.length === 0 ? (
            <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
              <Globe className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-bold text-navy">No other active public opportunities found</h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Check back soon or publish your own institutional opportunity to signal active commercial intake.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {discoveredOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="p-5 bg-surface border border-border rounded-2xl shadow-xs hover:border-black/30 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-black text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {opp.company?.name?.[0] || opp.profile?.displayName?.[0] || 'O'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="text-sm font-bold text-navy">{opp.title}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border bg-neutral-50 text-neutral-800 border-neutral-300">
                            {opp.ownerType} Mandate
                          </span>
                        </div>
                        <div className="text-xs text-text-muted flex items-center space-x-1.5 mt-0.5">
                          <span className="font-semibold text-navy">
                            {opp.company?.name || opp.profile?.displayName}
                          </span>
                          <span>&bull;</span>
                          <span>{opp.company?.industry || 'Enterprise Sector'}</span>
                          <span>&bull;</span>
                          <span>{opp.company?.headquartersCountry || 'Global'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInterestMatch({ targetOpportunity: opp, id: null })}
                      className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Express Interest</span>
                    </button>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">{opp.summary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-bg rounded-xl border border-border/70 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">What They Seek:</span>
                      <p className="text-navy font-medium mt-0.5">{opp.requirements?.[0]?.description || 'Commercial partners'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">What They Offer:</span>
                      <p className="text-navy font-medium mt-0.5">{opp.offers?.[0]?.productsServices || 'Market placements'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. MY OPPORTUNITIES TAB */}
      {activeTab === 'mine' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy">Your Published & Draft Opportunities</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Active opportunities continuously scan the MESHVI network for symmetrical partner overlap.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingOpp(null);
                setIsSetupOpen(true);
              }}
              className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Opportunity</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-text-muted bg-surface rounded-2xl border border-border">
              Loading opportunities...
            </div>
          ) : myOpportunities.length === 0 ? (
            <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
              <Layers className="w-8 h-8 text-text-muted mx-auto" />
              <h3 className="text-sm font-bold text-navy">No opportunity profiles created yet</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Set up an opportunity profile in 2 minutes to let relevant enterprises and decision-makers discover what you offer.
              </p>
              <button
                type="button"
                onClick={() => setIsSetupOpen(true)}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
              >
                Create First Opportunity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="p-5 bg-surface border border-border rounded-2xl shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider rounded-md border ${
                          opp.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : opp.status === 'PAUSED'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                        }`}
                      >
                        {opp.status}
                      </span>
                      <span className="text-[11px] text-text-muted font-bold">
                        {opp.ownerType} &bull; {opp.visibility}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-navy">{opp.title}</h4>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {opp.summary || 'No summary entered.'}
                    </p>

                    <div className="p-3 bg-bg rounded-xl border border-border text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 text-navy">
                        <Target className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold">Seeking:</span>
                        <span className="text-text-muted">
                          {opp.requirements?.[0]?.businessObjective?.replace(/_/g, ' ') || 'Commercial Partnership'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-navy">
                        <Gift className="w-3.5 h-3.5 text-sky-600" />
                        <span className="font-bold">Offering:</span>
                        <span className="text-text-muted">
                          {opp.offers?.[0]?.capability?.replace(/_/g, ' ') || 'Market Representation'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-[11px] text-text-muted font-mono">
                      {opp._count?.sourceMatches || 0} Matches Found
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePause(opp)}
                        className="p-1.5 text-text-muted hover:text-navy hover:bg-neutral-100 rounded-lg transition-colors"
                        title={opp.status === 'ACTIVE' ? 'Pause matching' : 'Activate matching'}
                      >
                        {opp.status === 'ACTIVE' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-600" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingOpp(opp);
                          setIsSetupOpen(true);
                        }}
                        className="p-1.5 text-text-muted hover:text-navy hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Edit opportunity"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleArchive(opp.id)}
                        className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Archive opportunity"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. RECEIVED REQUESTS TAB */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-navy">Inbound Opportunity Proposals</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Review commercial interest sent by verified enterprises. You can accept, decline, or request clarification.
            </p>
          </div>

          {receivedRequests.length === 0 ? (
            <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-text-muted mx-auto" />
              <h3 className="text-sm font-bold text-navy">Inbox is clear</h3>
              <p className="text-xs text-text-muted">No inbound business requests waiting for review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {receivedRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 bg-surface border border-border rounded-2xl shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Incoming Proposal
                        </span>
                        <span className="text-xs font-bold text-navy">
                          For: {req.recipientOpportunity?.title}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-navy mt-1">
                        From: {req.senderOpportunity?.company?.name || req.senderUser?.profile?.displayName}
                      </h4>
                      <p className="text-[11px] text-text-muted">
                        Sender Opportunity: {req.senderOpportunity?.title}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 border ${
                        req.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : req.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : req.status === 'CLARIFICATION_REQUESTED'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                      }`}
                    >
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="p-4 bg-bg rounded-xl border border-border space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold text-navy uppercase tracking-wider block">
                      Proposition Message:
                    </span>
                    <p className="text-navy leading-relaxed italic">"{req.message}"</p>
                  </div>

                  {req.clarificationQuestion && (
                    <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-1 text-xs">
                      <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block flex items-center space-x-1">
                        <HelpCircle className="w-3.5 h-3.5 text-sky-700" />
                        <span>Your Clarification Question:</span>
                      </span>
                      <p className="text-sky-900 font-semibold italic">"{req.clarificationQuestion}"</p>
                      {req.clarificationAnswer ? (
                        <div className="mt-2 pt-2 border-t border-sky-200">
                          <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block">
                            Sender's Answer:
                          </span>
                          <p className="text-sky-950 font-bold">{req.clarificationAnswer}</p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-sky-700 mt-1">Awaiting sender response...</p>
                      )}
                    </div>
                  )}

                  {/* Actions for PENDING or CLARIFICATION_REQUESTED */}
                  {req.status !== 'ACCEPTED' && req.status !== 'DECLINED' && (
                    <div className="pt-2 border-t border-border flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleDeclineRequest(req.id)}
                        className="px-3.5 py-1.5 border border-border bg-surface hover:bg-neutral-100 text-rose-700 font-bold text-xs rounded-xl"
                      >
                        Decline
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setClarifyRequest(req);
                          setClarifyMode('ask');
                        }}
                        className="px-3.5 py-1.5 border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs rounded-xl flex items-center space-x-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Ask Clarification</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(req.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Open Deal Room</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SENT REQUESTS TAB */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-navy">Outbound Opportunity Proposals</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Track requests you initiated with counterparty enterprises.
            </p>
          </div>

          {sentRequests.length === 0 ? (
            <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-2">
              <Clock className="w-8 h-8 text-text-muted mx-auto" />
              <h3 className="text-sm font-bold text-navy">No outbound requests sent</h3>
              <p className="text-xs text-text-muted">Explore the Matches tab to express interest in verified partner opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 bg-surface border border-border rounded-2xl shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                        Outbound Request
                      </span>
                      <h4 className="text-sm font-bold text-navy mt-1">
                        To: {req.recipientOpportunity?.title}
                      </h4>
                      <p className="text-xs text-text-muted">
                        Enterprise: {req.recipientOpportunity?.company?.name || req.recipientUser?.profile?.displayName}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 border ${
                        req.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : req.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : req.status === 'CLARIFICATION_REQUESTED'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                      }`}
                    >
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed bg-bg p-3 rounded-xl border border-border">
                    "{req.message}"
                  </p>

                  {/* Clarification prompt from recipient */}
                  {req.status === 'CLARIFICATION_REQUESTED' && req.clarificationQuestion && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-amber-900 block flex items-center space-x-1">
                        <HelpCircle className="w-4 h-4 text-amber-700" />
                        <span>Recipient Requested Clarification:</span>
                      </span>
                      <p className="text-xs text-amber-950 italic">"{req.clarificationQuestion}"</p>

                      {!req.clarificationAnswer ? (
                        <button
                          type="button"
                          onClick={() => {
                            setClarifyRequest(req);
                            setClarifyMode('answer');
                          }}
                          className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Provide Answer</span>
                        </button>
                      ) : (
                        <p className="text-xs font-bold text-emerald-800">
                          Your reply: "{req.clarificationAnswer}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. CONNECTED DEALS TAB */}
      {activeTab === 'connected' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-navy">Connected Opportunities</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Accepted opportunities with bilateral deal rooms open for collaborative execution.
            </p>
          </div>

          {connectedRequests.length === 0 ? (
            <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-2">
              <Handshake className="w-8 h-8 text-text-muted mx-auto" />
              <h3 className="text-sm font-bold text-navy">No connected deals yet</h3>
              <p className="text-xs text-text-muted">Once a proposal request is accepted, it moves here with dedicated execution tracking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 bg-surface border border-emerald-200 rounded-2xl shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                      Bilateral Bridge Accepted
                    </span>
                    <span className="text-xs text-text-muted font-bold">
                      {new Date(req.respondedAt || req.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-navy">{req.recipientOpportunity?.title}</h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Partner: {req.recipientOpportunity?.company?.name || req.senderOpportunity?.company?.name}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Deal Room Active</span>
                    </span>

                    {req.dealRoomId && (
                      <button
                        type="button"
                        onClick={() => navigate(`/app/deal-rooms/${req.dealRoomId}`)}
                        className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5"
                      >
                        <span>Open Deal Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <OpportunitySetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onSuccess={loadData}
        initialData={editingOpp}
      />

      <ExpressInterestModal
        isOpen={!!interestMatch}
        onClose={() => setInterestMatch(null)}
        onSuccess={loadData}
        match={interestMatch}
        myOpportunities={myOpportunities}
      />

      <OpportunityClarifyModal
        isOpen={!!clarifyRequest}
        onClose={() => setClarifyRequest(null)}
        onSuccess={loadData}
        request={clarifyRequest}
        mode={clarifyMode}
      />
    </div>
  );
};
export default OpportunitiesPage;
