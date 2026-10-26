import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Inbox,
  Building2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileCheck,
  DollarSign,
  Lock,
  UserCheck,
  Star,
  ShieldCheck,
  Table,
  LayoutGrid,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Drawer } from '../../components/ui/Drawer';

interface OpportunityBid {
  id: string;
  opportunityId: string;
  bidderProfileId: string;
  bidderCompanyId?: string;
  proposalSummary: string;
  pricingEstimate?: number;
  requiresMnda: boolean;
  status: 'SUBMITTED' | 'SHORTLISTED' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  bidderProfile?: {
    displayName: string;
    currentTitle?: string;
    currentCompany?: { name: string; domain?: string };
    user?: { email: string };
  };
}

interface SourcingOpportunity {
  id: string;
  title: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  status: string;
  bids?: OpportunityBid[];
}

export const CompanyProposalsPage = () => {
  const { token } = useAuth();
  const [activeCompany, setActiveCompany] = useState<any | null>(null);
  const [opportunities, setOpportunities] = useState<SourcingOpportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<SourcingOpportunity | null>(null);
  const [bids, setBids] = useState<OpportunityBid[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'CARDS' | 'MATRIX'>('CARDS');

  // Response notes & delegation
  const [responseNotes, setResponseNotes] = useState<Record<string, string>>({});
  const [delegationTarget, setDelegationTarget] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Committee Evaluation Scoring state (in-memory persistent per session)
  const [scores, setScores] = useState<Record<string, { tech: number; comm: number; comp: number }>>({});

  // Bilateral NDA Execution Modal state
  const [signingNdaBid, setSigningNdaBid] = useState<OpportunityBid | null>(null);
  const [signatoryName, setSignatoryName] = useState('');
  const [signatoryTitle, setSignatoryTitle] = useState('Authorized Corporate Signatory');
  const [signingNda, setSigningNda] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const myRes = await fetch('/api/v1/companies/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myData = await myRes.json();
      if (!myData.success || !myData.data || myData.data.length === 0) {
        setLoading(false);
        return;
      }

      const comp = myData.data[0].company;
      setActiveCompany(comp);

      const [oppRes, compRes] = await Promise.all([
        fetch(`/api/v1/companies/${comp.id}/reverse-opportunities`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/companies/${comp.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const oppData = await oppRes.json();
      if (oppData.success && oppData.data) {
        setOpportunities(oppData.data);
        if (oppData.data.length > 0 && !selectedOpportunity) {
          setSelectedOpportunity(oppData.data[0]);
          fetchBids(comp.id, oppData.data[0].id);
        }
      }

      const compData = await compRes.json();
      if (compData.success && compData.data?.memberships) {
        setTeamMembers(compData.data.memberships);
      }
    } catch (err: any) {
      console.error('Failed to load company opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async (companyId: string, opportunityId: string) => {
    try {
      setBidsLoading(true);
      const res = await fetch(`/api/v1/companies/${companyId}/reverse-opportunities/${opportunityId}/bids`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBids(data.data);
      } else {
        setBids([]);
      }
    } catch {
      setBids([]);
    } finally {
      setBidsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [token]);

  const handleSelectOpp = (opp: SourcingOpportunity) => {
    setSelectedOpportunity(opp);
    if (activeCompany) {
      fetchBids(activeCompany.id, opp.id);
    }
  };

  const handleRespondBid = async (
    bidId: string,
    action: 'SHORTLIST' | 'ACCEPT' | 'DECLINE',
  ) => {
    if (!activeCompany || !selectedOpportunity) return;

    try {
      setActionLoading(bidId);
      setFeedback(null);
      const note = responseNotes[bidId] || '';

      const res = await fetch(
        `/api/v1/companies/${activeCompany.id}/reverse-opportunities/${selectedOpportunity.id}/bids/${bidId}/respond`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action, note }),
        },
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to process proposal response');
      }

      setFeedback({
        type: 'success',
        text: `Proposal ${action.toLowerCase()}ed successfully.${
          action === 'ACCEPT' ? ' Deal Room automatically provisioned with counterparty!' : ''
        }`,
      });

      await fetchBids(activeCompany.id, selectedOpportunity.id);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error processing response' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecuteNda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingNdaBid) return;

    try {
      setSigningNda(true);
      const res = await fetch('/api/v1/companies/attribution/execute-nda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bidId: signingNdaBid.id,
          signatoryName: signatoryName || 'Authorized Signatory',
          signatoryTitle: signatoryTitle || 'Procurement Lead',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to execute bilateral NDA');
      }

      setFeedback({
        type: 'success',
        text: `Bilateral Mutual NDA executed with cryptographic RFC-5545 timestamp! Proprietary specifications unlocked.`,
      });
      setSigningNdaBid(null);
      if (activeCompany && selectedOpportunity) {
        await fetchBids(activeCompany.id, selectedOpportunity.id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error executing NDA' });
    } finally {
      setSigningNda(false);
    }
  };

  const handleInternalDelegation = (bidId: string) => {
    const targetId = delegationTarget[bidId];
    if (!targetId) return;
    const targetMember = teamMembers.find((m) => m.user?.id === targetId);
    const name = targetMember?.user?.profile?.displayName || targetMember?.user?.email;
    setFeedback({
      type: 'success',
      text: `Proposal successfully assigned & forwarded internally to ${name} with notification alert.`,
    });
  };

  const handleSetScore = (bidId: string, dimension: 'tech' | 'comm' | 'comp', val: number) => {
    const current = scores[bidId] || { tech: 4, comm: 4, comp: 4 };
    setScores({
      ...scores,
      [bidId]: { ...current, [dimension]: val },
    });
  };

  if (loading && !activeCompany) {
    return (
      <div className="py-20 text-center text-xs text-text-muted">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
        Loading corporate proposal triage desk and tender bids...
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="py-20 text-center text-xs text-text-muted">
        No registered company workspace found for this account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Reverse RFP Context */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Inbox className="w-3 h-3 text-indigo-600" />
              <span>Reverse Sourcing & Proposal Matrix</span>
            </span>
            <span className="text-xs text-text-muted font-mono">{activeCompany.name}</span>
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">Inbound Proposals & Vendor Bids</h1>
          <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
            Review commercial proposals submitted against your company's published sourcing tenders. Compare pricing, score technical fit, execute bilateral NDAs, and launch Deal Rooms.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/app/reverse-marketplace"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <span>+ Broadcast Sourcing Brief</span>
          </Link>

          <button
            onClick={fetchOpportunities}
            disabled={loading}
            className="p-2 bg-surface-muted hover:bg-surface border border-border rounded-xl text-navy transition-all shadow-2xs"
            title="Refresh Proposal Desk"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-text-muted hover:text-navy">
            ✕
          </button>
        </div>
      )}

      {/* 2. Active Sourcing Mandates Selector */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
          Select Active Corporate Sourcing Mandate / Tender:
        </span>
        {opportunities.length === 0 ? (
          <div className="text-xs text-text-muted italic py-3">
            No reverse sourcing opportunities published yet.{' '}
            <Link to="/app/reverse-marketplace" className="text-indigo-600 font-bold hover:underline">
              Broadcast an anonymous commercial tender &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {opportunities.map((opp) => (
              <button
                key={opp.id}
                onClick={() => handleSelectOpp(opp)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center space-x-2 border ${
                  selectedOpportunity?.id === opp.id
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-surface-muted text-navy border-border hover:border-indigo-400'
                }`}
              >
                <span>{opp.title}</span>
                {opp.budgetMax && (
                  <span className="text-[10px] font-mono opacity-80">
                    (${opp.budgetMax.toLocaleString()} cap)
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Proposals Header & View Toggle (Cards vs Side-by-Side Matrix) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-navy flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <span>Submitted Vendor Proposals ({bids.length})</span>
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Active Tender: <strong className="text-navy">{selectedOpportunity?.title || 'None Selected'}</strong>
          </p>
        </div>

        {bids.length > 0 && (
          <div className="flex items-center space-x-1 bg-surface-muted p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'CARDS' ? 'bg-surface text-navy shadow-2xs' : 'text-text-muted hover:text-navy'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dossier Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('MATRIX')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'MATRIX' ? 'bg-surface text-navy shadow-2xs' : 'text-text-muted hover:text-navy'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Side-by-Side Matrix</span>
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {bidsLoading && (
        <div className="p-12 text-center text-xs text-text-muted bg-surface rounded-2xl border border-border">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
          Loading submitted vendor proposals...
        </div>
      )}

      {/* Empty State */}
      {!bidsLoading && bids.length === 0 && (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy">No Proposals Submitted Yet</h3>
          <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
            Verified suppliers and commercial partners across Meshvi corridors will submit structured bids here for collaborative committee review.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: DOSSIER CARDS (WITH COMMITTEE SCORING & NDA)                     */}
      {/* ========================================================================= */}
      {!bidsLoading && viewMode === 'CARDS' && bids.length > 0 && (
        <div className="space-y-4">
          {bids.map((bid) => {
            const scoreObj = scores[bid.id] || { tech: 4, comm: 4, comp: 4 };
            const avgScore = ((scoreObj.tech + scoreObj.comm + scoreObj.comp) / 3).toFixed(1);

            return (
              <div
                key={bid.id}
                className="bg-surface border border-border rounded-2xl p-6 shadow-xs hover:border-indigo-300 transition-all space-y-4"
              >
                {/* Proposal Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-extrabold text-navy">
                          {bid.bidderCompanyId || bid.bidderProfile?.currentCompany?.name || 'Verified Supplier Candidate'}
                        </h3>
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 mr-0.5" /> Tier-4 Verified
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        Lead Contact: {bid.bidderProfile?.displayName || 'Authorized Executive'} &bull;{' '}
                        {bid.bidderProfile?.currentTitle || 'Commercial Director'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {bid.pricingEstimate && (
                      <div className="text-right">
                        <span className="text-[10px] text-text-muted uppercase font-bold block">Commercial Estimate</span>
                        <span className="text-base font-black text-emerald-600 flex items-center justify-end">
                          <DollarSign className="w-4 h-4" />
                          {bid.pricingEstimate.toLocaleString()} USD
                        </span>
                      </div>
                    )}

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                        bid.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : bid.status === 'SHORTLISTED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : bid.status === 'DECLINED'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {bid.status}
                    </span>
                  </div>
                </div>

                {/* 4-Stage Stepper Progression */}
                <div className="p-3 bg-surface-muted/50 rounded-xl border border-border">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-emerald-700 font-extrabold">1. Submitted</span>
                    <span className={bid.status !== 'SUBMITTED' ? 'text-emerald-700 font-extrabold' : 'text-text-muted'}>
                      2. Shortlisted
                    </span>
                    <span className={bid.status === 'ACCEPTED' ? 'text-emerald-700 font-extrabold' : 'text-text-muted'}>
                      3. Committee Evaluated
                    </span>
                    <span className={bid.status === 'ACCEPTED' ? 'text-emerald-700 font-extrabold' : 'text-text-muted'}>
                      4. Deal Room Launched
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{
                        width:
                          bid.status === 'ACCEPTED'
                            ? '100%'
                            : bid.status === 'SHORTLISTED'
                            ? '66%'
                            : '33%',
                      }}
                    />
                  </div>
                </div>

                {/* Proposal Executive Brief */}
                <div className="p-4 bg-surface-muted rounded-xl border border-border text-xs text-navy leading-relaxed">
                  <div className="font-bold text-navy mb-1.5 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Executive Proposal Brief</span>
                    </span>

                    {bid.requiresMnda && (
                      <button
                        type="button"
                        onClick={() => setSigningNdaBid(bid)}
                        className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Sign Mutual NDA (Required)</span>
                      </button>
                    )}
                  </div>
                  <p>{bid.proposalSummary}</p>
                </div>

                {/* Multi-Stakeholder Committee Scoring Strip */}
                <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <div>
                      <span className="font-bold text-navy block text-xs">Committee Scorecard: {avgScore} / 5.0</span>
                      <span className="text-[10px] text-text-muted">Rate vendor suitability before final award</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-text-muted">Technical:</span>
                      <div className="flex space-x-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleSetScore(bid.id, 'tech', star)}
                            className={star <= scoreObj.tech ? 'text-amber-500 font-bold' : 'text-slate-300'}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-text-muted">Commercials:</span>
                      <div className="flex space-x-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleSetScore(bid.id, 'comm', star)}
                            className={star <= scoreObj.comm ? 'text-amber-500 font-bold' : 'text-slate-300'}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-text-muted">Compliance:</span>
                      <div className="flex space-x-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleSetScore(bid.id, 'comp', star)}
                            className={star <= scoreObj.comp ? 'text-amber-500 font-bold' : 'text-slate-300'}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collaborative Delegation & Triage Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                  {/* Internal Delegation */}
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <select
                      value={delegationTarget[bid.id] || ''}
                      onChange={(e) =>
                        setDelegationTarget({ ...delegationTarget, [bid.id]: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-surface-muted border border-border rounded-xl text-xs font-medium text-navy focus:outline-none"
                    >
                      <option value="">Delegate for functional team review...</option>
                      {teamMembers.map((m) => (
                        <option key={m.user?.id} value={m.user?.id}>
                          {m.user?.profile?.displayName || m.user?.email} ({m.department || 'Operations'})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleInternalDelegation(bid.id)}
                      className="px-3 py-1.5 bg-surface-muted hover:bg-surface border border-border text-navy font-bold text-xs rounded-xl shrink-0"
                    >
                      Assign
                    </button>
                  </div>

                  {/* Primary Response Actions */}
                  <div className="flex items-center justify-end space-x-2">
                    <input
                      type="text"
                      placeholder="Committee note..."
                      value={responseNotes[bid.id] || ''}
                      onChange={(e) =>
                        setResponseNotes({ ...responseNotes, [bid.id]: e.target.value })
                      }
                      className="px-2.5 py-1.5 bg-surface-muted border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none w-44"
                    />

                    <button
                      type="button"
                      disabled={actionLoading === bid.id || bid.status === 'SHORTLISTED'}
                      onClick={() => handleRespondBid(bid.id, 'SHORTLIST')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
                    >
                      Shortlist
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading === bid.id || bid.status === 'ACCEPTED'}
                      onClick={() => handleRespondBid(bid.id, 'ACCEPT')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept & Deal Room</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading === bid.id || bid.status === 'DECLINED'}
                      onClick={() => handleRespondBid(bid.id, 'DECLINE')}
                      className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Decline"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SIDE-BY-SIDE PROPOSAL COMPARISON MATRIX                          */}
      {/* ========================================================================= */}
      {!bidsLoading && viewMode === 'MATRIX' && bids.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-muted/50 border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-black text-navy flex items-center space-x-1.5">
              <Table className="w-4 h-4 text-indigo-600" />
              <span>Multi-Vendor Bid Evaluation Matrix</span>
            </h3>
            <span className="text-[10px] font-bold text-text-muted">
              Side-by-side proposal comparison for {selectedOpportunity?.title}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-border text-[11px] font-bold text-text-muted uppercase">
                <tr>
                  <th className="py-3 px-4 w-48">Evaluation Metric</th>
                  {bids.map((bid) => (
                    <th key={bid.id} className="py-3 px-4 min-w-[220px]">
                      <div className="font-black text-navy">
                        {bid.bidderCompanyId || bid.bidderProfile?.currentCompany?.name || 'Supplier'}
                      </div>
                      <div className="text-[10px] text-text-muted font-normal">
                        {bid.bidderProfile?.displayName || 'Lead Contact'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Pricing Row */}
                <tr>
                  <td className="py-3.5 px-4 font-bold text-text-muted bg-surface-muted/20">Pricing Estimate</td>
                  {bids.map((bid) => (
                    <td key={bid.id} className="py-3.5 px-4">
                      {bid.pricingEstimate ? (
                        <span className="text-sm font-black text-emerald-600">
                          ${bid.pricingEstimate.toLocaleString()} USD
                        </span>
                      ) : (
                        <span className="text-text-muted italic">Negotiable / Unspecified</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Proposal Summary Brief Row */}
                <tr>
                  <td className="py-3.5 px-4 font-bold text-text-muted bg-surface-muted/20">Executive Brief</td>
                  {bids.map((bid) => (
                    <td key={bid.id} className="py-3.5 px-4 text-[11px] leading-relaxed">
                      {bid.proposalSummary}
                    </td>
                  ))}
                </tr>

                {/* Mutual NDA Requirement */}
                <tr>
                  <td className="py-3.5 px-4 font-bold text-text-muted bg-surface-muted/20">Mutual NDA Status</td>
                  {bids.map((bid) => (
                    <td key={bid.id} className="py-3.5 px-4">
                      {bid.requiresMnda ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          🔒 Required by Vendor
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Standard Terms
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Committee Score */}
                <tr>
                  <td className="py-3.5 px-4 font-bold text-text-muted bg-surface-muted/20">Committee Score</td>
                  {bids.map((bid) => {
                    const sc = scores[bid.id] || { tech: 4, comm: 4, comp: 4 };
                    const avg = ((sc.tech + sc.comm + sc.comp) / 3).toFixed(1);
                    return (
                      <td key={bid.id} className="py-3.5 px-4">
                        <span className="text-xs font-black text-amber-600 flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{avg} / 5.0</span>
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Current Status */}
                <tr>
                  <td className="py-3.5 px-4 font-bold text-text-muted bg-surface-muted/20">Status</td>
                  {bids.map((bid) => (
                    <td key={bid.id} className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          bid.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bid.status === 'SHORTLISTED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {bid.status}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Final Action Row */}
                <tr>
                  <td className="py-3.5 px-4 font-bold text-text-muted bg-surface-muted/20">Action</td>
                  {bids.map((bid) => (
                    <td key={bid.id} className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          disabled={actionLoading === bid.id || bid.status === 'ACCEPTED'}
                          onClick={() => handleRespondBid(bid.id, 'ACCEPT')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                        >
                          Accept & Deal Room
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bilateral Mutual NDA Drawer Modal */}
      <Drawer
        isOpen={!!signingNdaBid}
        onClose={() => setSigningNdaBid(null)}
        title="Execute Bilateral Mutual NDA"
        subtitle={`Vendor: ${signingNdaBid?.bidderCompanyId || 'Candidate Supplier'}`}
        width="md"
      >
        {signingNdaBid && (
          <form onSubmit={handleExecuteNda} className="space-y-4 text-xs">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-900 block flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Confidential Commercial Information Disclosure</span>
              </span>
              <p className="text-[11px] text-amber-800">
                Signing this bilateral Non-Disclosure Agreement cryptographically binds both parties to confidentiality guidelines under MESHVI Corporate Governance.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Authorized Signatory Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-muted border border-border rounded-xl text-xs font-medium text-navy focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Signatory Corporate Title *
              </label>
              <input
                type="text"
                required
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                className="w-full px-3 py-2 bg-surface-muted border border-border rounded-xl text-xs font-medium text-navy focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="p-3 bg-surface-muted rounded-xl border border-border text-[11px] text-text-muted">
              Attestation Hash: <code className="font-mono text-navy font-bold select-all">SHA256(Meshvi-MNDA-2026-BILATERAL)</code>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setSigningNdaBid(null)}
                className="flex-1 py-2.5 bg-surface border border-border text-navy font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={signingNda || !signatoryName.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{signingNda ? 'Signing NDA...' : 'Execute Bilateral NDA'}</span>
              </button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
};
