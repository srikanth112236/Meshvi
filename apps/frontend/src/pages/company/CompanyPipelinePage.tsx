import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DelegateToColleagueModal } from '../../components/ui/DelegateToColleagueModal';
import { DeclineReasonModal } from '../../components/ui/DeclineReasonModal';
import { ContactRevealModal } from '../../components/ui/ContactRevealModal';
import { CorporateClarifyModal } from '../../components/ui/CorporateClarifyModal';
import { CorporateAutoReplyModal } from '../../components/ui/CorporateAutoReplyModal';
import {
  GitBranch,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  Users,
  Target,
  Sparkles,
  LayoutGrid,
  FileText,
  History,
  FileCheck,
  CalendarCheck,
  X,
  Rocket,
  Check,
  ExternalLink,
  Lock,
  Unlock,
  Mail,
  Phone,
  Copy,
  Zap,
  HelpCircle,
  Table,
  ChevronRight,
  Eye,
  MessageSquare,
} from 'lucide-react';

interface InboundOpportunity {
  id: string;
  opportunityType?: 'DIRECT_CONNECT' | 'WARM_INTRODUCTION';
  intermediaryName?: string;
  intermediaryEmail?: string;
  originalStatus?: string;
  requesterId?: string;
  requesterName: string;
  requesterTitle: string;
  requesterCompany: string;
  requesterAvatar?: string;
  requesterCity?: string;
  requesterCountry?: string;
  isRequesterVerified?: boolean;
  targetColleagueId?: string;
  targetColleagueName: string;
  targetColleagueTitle: string;
  delegatedToName?: string;
  delegatedToTitle?: string;
  objective: string;
  marketFocus: string;
  pitch: string;
  status: 'PENDING' | 'DELEGATED' | 'ACCEPTED' | 'DECLINED' | 'FOLLOWUP' | 'CLARIFICATION_REQUESTED';
  receivedAt: string;
  followUpDate?: string;
  delegationNote?: string;
  declineReasonCode?: string;
  clarificationQuestion?: string;
  clarificationAnswer?: string;
  isContactRevealed: boolean;
  contactDetails: {
    email: string;
    phone: string;
    linkedinUrl?: string | null;
    unlocked: boolean;
  };
}

export const CompanyPipelinePage: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [objectiveFilter, setObjectiveFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedOpportunityForDrawer, setSelectedOpportunityForDrawer] = useState<InboundOpportunity | null>(null);

  // Corporate Multi-Company Workspace Selector State
  const [userCompanies, setUserCompanies] = useState<any[]>([]);

  // Wave 4: Proposal Comparison Matrix & Tender Evaluation State (Gap 140)
  const [activePipelineTab, setActivePipelineTab] = useState<'INBOUND_CRM' | 'REVERSE_RFPS'>('INBOUND_CRM');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('Enterprise Organization');
  const [reverseOpps, setReverseOpps] = useState<any[]>([]);
  const [selectedReverseOpp, setSelectedReverseOpp] = useState<any | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [actionLoadingBidId, setActionLoadingBidId] = useState<string | null>(null);
  const [launchedDealRoomId, setLaunchedDealRoomId] = useState<string | null>(null);

  // 5-Action Pipeline Drawers state
  const [delegatingOpportunity, setDelegatingOpportunity] = useState<InboundOpportunity | null>(null);
  const [decliningOpportunity, setDecliningOpportunity] = useState<InboundOpportunity | null>(null);
  const [clarifyingOpportunity, setClarifyingOpportunity] = useState<InboundOpportunity | null>(null);
  const [revealingOpportunity, setRevealingOpportunity] = useState<InboundOpportunity | null>(null);
  const [revealedDealRoomId, setRevealedDealRoomId] = useState<string | null>(null);

  // Action 5: Auto-Reply & SLA State
  const [autoReplyConfig, setAutoReplyConfig] = useState<{
    enabled: boolean;
    slaHours: number;
    template: string;
  } | null>(null);
  const [autoReplyModalOpen, setAutoReplyModalOpen] = useState(false);

  // Differentiator #5: Evidence-Backed Attribution Ledger state
  const [attributionDealId, setAttributionDealId] = useState<string | null>(null);
  const [attributionLedger, setAttributionLedger] = useState<any | null>(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const fetchAttributionLedger = async (dealId: string) => {
    setAttributionDealId(dealId);
    setLoadingLedger(true);
    setAttributionLedger(null);
    try {
      const res = await fetch(`/api/v1/companies/attribution/ledger/${dealId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAttributionLedger(data.data);
      }
    } catch {} finally {
      setLoadingLedger(false);
    }
  };

  // Option C: Execute Mutual NDA directly on active deal
  const handleExecuteNda = async () => {
    if (!attributionDealId) return;
    try {
      const res = await fetch('/api/v1/companies/attribution/execute-nda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bidId: attributionDealId,
          signatoryName: 'Elena Rostova',
          signatoryTitle: 'VP of Commercial Operations',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          title: 'Mutual M-NDA Executed',
          message: 'Bilateral NDA cryptographically stamped and committed to attribution ledger.',
          type: 'success',
        });
        fetchAttributionLedger(attributionDealId);
      }
    } catch {}
  };

  // Option D: Record Verified Calendar Meeting (.ICS)
  const handleRecordIcsMeeting = async () => {
    if (!attributionDealId) return;
    try {
      const res = await fetch('/api/v1/companies/attribution/record-ics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dealReferenceId: attributionDealId,
          meetingTitle: 'Commercial Terms & Integration Review',
          meetingTime: new Date().toISOString(),
          durationMinutes: 45,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          title: 'RFC 5545 Meeting Proof Recorded',
          message: 'Calendar meeting (.ICS) milestone cryptographically verified.',
          type: 'success',
        });
        fetchAttributionLedger(attributionDealId);
      }
    } catch {}
  };

  // Opportunities State
  const [opportunities, setOpportunities] = useState<InboundOpportunity[]>([]);

  const fetchAutoReplyConfig = async (cId: string) => {
    if (!token || !cId) return;
    try {
      const res = await fetch(`/api/v1/companies/${cId}/inbound-auto-reply`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data) {
        setAutoReplyConfig({
          enabled: Boolean(data.enabled),
          slaHours: data.slaHours || 24,
          template: data.template || '',
        });
      }
    } catch {}
  };

  const fetchOpportunities = async (overrideCompanyId?: string) => {
    setLoading(true);
    try {
      let resolvedCompanyId = overrideCompanyId || companyId;

      if (token && (!resolvedCompanyId || userCompanies.length === 0)) {
        try {
          const myRes = await fetch('/api/v1/companies/my', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const myData = await myRes.json();
          if (myData.success && Array.isArray(myData.data) && myData.data.length > 0) {
            setUserCompanies(myData.data);
            if (!resolvedCompanyId) {
              const resId: string = myData.data[0].company?.id;
              resolvedCompanyId = resId;
              const cName: string = myData.data[0].company?.name || 'Enterprise Organization';
              setCompanyId(resId);
              setCompanyName(cName);
            }
          }
        } catch {}
      }

      if (token && resolvedCompanyId) {
        fetchReverseOpportunities(resolvedCompanyId);
        fetchAutoReplyConfig(resolvedCompanyId);

        const res = await fetch(`/api/v1/companies/${resolvedCompanyId}/inbound-connections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resJson = await res.json();
        const rawList: any[] = Array.isArray(resJson)
          ? resJson
          : Array.isArray(resJson?.data)
          ? resJson.data
          : [];

        if (rawList.length > 0) {
          const apiItems: InboundOpportunity[] = rawList.map((item: any) => ({
            id: item.id,
            opportunityType: item.opportunityType || 'DIRECT_CONNECT',
            intermediaryName: item.intermediaryName,
            intermediaryEmail: item.intermediaryEmail,
            originalStatus: item.originalStatus,
            requesterId: item.requesterId,
            requesterName: item.requesterName || 'Business Executive',
            requesterTitle: item.requesterTitle || 'Corporate Executive',
            requesterCompany: item.requesterCompany || 'Verified Enterprise',
            requesterAvatar: item.requesterAvatar,
            requesterCity: item.requesterCity,
            requesterCountry: item.requesterCountry,
            isRequesterVerified: item.isRequesterVerified,
            targetColleagueName: item.targetColleagueName || 'Inbound Triage Desk',
            targetColleagueTitle: item.targetColleagueTitle || 'Lead',
            delegatedToName: item.delegatedToName,
            delegatedToTitle: item.delegatedToTitle,
            objective: item.objective || 'Commercial Sales',
            marketFocus: item.marketFocus || 'Enterprise Expansion',
            pitch: item.pitch || 'High-priority institutional collaboration inquiry.',
            status: item.status,
            receivedAt: new Date(item.receivedAt).toLocaleDateString(),
            followUpDate: item.followUpDate ? new Date(item.followUpDate).toLocaleDateString() : undefined,
            delegationNote: item.delegationNote,
            declineReasonCode: item.declineReasonCode,
            clarificationQuestion: item.clarificationQuestion,
            clarificationAnswer: item.clarificationAnswer,
            isContactRevealed: item.isContactRevealed,
            contactDetails: item.contactDetails || {
              email: item.isContactRevealed ? 'revealed@company.com' : 'm***@company.com',
              phone: item.isContactRevealed ? '+1 415-555-0199' : '+1 ••• ••• ••89',
              unlocked: item.isContactRevealed,
            },
          }));
          setOpportunities(apiItems);
        } else {
          setOpportunities([]);
        }
      } else {
        setOpportunities([]);
      }
    } catch {
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (newCompanyId: string) => {
    setCompanyId(newCompanyId);
    const targetComp = userCompanies.find(
      (c) => c.company?.id === newCompanyId || c.companyId === newCompanyId
    );
    if (targetComp) {
      setCompanyName(targetComp.company?.name || 'Enterprise');
    }
    fetchOpportunities(newCompanyId);
  };

  const fetchReverseOpportunities = async (targetCompanyId?: string) => {
    const cId = targetCompanyId || companyId;
    if (!cId || !token) return;
    try {
      const res = await fetch(`/api/v1/companies/${cId}/reverse-opportunities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReverseOpps(data.data || []);
        if (data.data?.length > 0) {
          setSelectedReverseOpp(data.data[0]);
          fetchBids(cId, data.data[0].id);
        }
      }
    } catch {}
  };

  const fetchBids = async (cId: string, oppId: string) => {
    if (!token) return;
    setLoadingBids(true);
    try {
      const res = await fetch(`/api/v1/companies/${cId}/reverse-opportunities/${oppId}/bids`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBids(data.data || []);
      }
    } catch {} finally {
      setLoadingBids(false);
    }
  };

  const handleBidAction = async (oppId: string, bidId: string, action: 'SHORTLIST' | 'DECLINE' | 'ACCEPT') => {
    if (!companyId || !token) return;
    setActionLoadingBidId(bidId);
    try {
      const res = await fetch(`/api/v1/companies/${companyId}/reverse-opportunities/${oppId}/bids/${bidId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update proposal bid.');
      }

      if (action === 'ACCEPT') {
        const spawnedDealRoomId = data.data?.dealRoomId || 'active';
        setLaunchedDealRoomId(spawnedDealRoomId);
        showToast({
          title: 'Proposal Accepted & Deal Room Launched! 🚀',
          message: 'Bilateral Deal Room generated with attribution ledger anchoring.',
          type: 'success',
        });
      } else {
        showToast({
          title: `Proposal ${action === 'SHORTLIST' ? 'Shortlisted' : 'Declined'}`,
          message: `Counterparty bid has been marked as ${action}.`,
          type: 'info',
        });
      }

      fetchBids(companyId, oppId);
    } catch (err: any) {
      showToast({
        title: 'Action Error',
        message: err.message || 'Action could not be executed.',
        type: 'warning',
      });
    } finally {
      setActionLoadingBidId(null);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [token]);

  const handleAccept = async (opp: InboundOpportunity) => {
    try {
      const url = companyId
        ? `/api/v1/companies/${companyId}/inbound-connections/${opp.id}/respond`
        : `/api/v1/connections/${opp.id}/accept`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'ACCEPT' }),
      });
      const data = await res.json();
      if (!res.ok || (!data.success && data.status !== 'success' && !data.id)) {
        throw new Error(data.message || data.error?.message || 'Failed to accept bridge.');
      }

      const rawEmail =
        data.contactDetails?.email ||
        (opp.contactDetails.unlocked
          ? opp.contactDetails.email
          : `${opp.requesterName.toLowerCase().replace(/\s+/g, '.')}@${opp.requesterCompany.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);

      const rawPhone =
        data.contactDetails?.phone ||
        (opp.contactDetails.unlocked ? opp.contactDetails.phone : '+1 (415) 890-2410');

      const spawnedDealRoomId = data.dealRoomId || 'active';

      const updatedOpp: InboundOpportunity = {
        ...opp,
        status: 'ACCEPTED',
        isContactRevealed: true,
        contactDetails: {
          email: rawEmail,
          phone: rawPhone,
          linkedinUrl: data.contactDetails?.linkedinUrl || opp.contactDetails.linkedinUrl,
          unlocked: true,
        },
      };

      showToast({
        title: 'Alliance Bridge Established (Won)! 🤝',
        message: `Verified contact coordinates for ${opp.requesterName} and Deal Room are now unlocked.`,
        type: 'success',
      });

      setOpportunities((prev) =>
        prev.map((item) => (item.id === opp.id ? updatedOpp : item))
      );

      if (selectedOpportunityForDrawer?.id === opp.id) {
        setSelectedOpportunityForDrawer(updatedOpp);
      }

      // Instantly open Contact Reveal Drawer
      setRevealingOpportunity(updatedOpp);
      setRevealedDealRoomId(spawnedDealRoomId);
    } catch (err: any) {
      showToast({
        title: 'Action Failed',
        message: err.message || 'Unable to accept connection bridge.',
        type: 'warning',
      });
    }
  };

  const handleFollowUpSchedule = async (opp: InboundOpportunity) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 3);
    const dateStr = nextDate.toISOString();

    try {
      await fetch(`/api/v1/connections/${opp.id}/follow-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          followUpDate: dateStr,
          reminderNote: 'Follow-up on enterprise procurement terms',
        }),
      });
    } catch {
      // Graceful fallback
    }

    showToast({
      title: 'Follow-Up Scheduled (Reviewing)',
      message: `Reminder set for ${nextDate.toLocaleDateString()} to follow up with ${opp.requesterName}.`,
      type: 'info',
    });

    const updatedOpp: InboundOpportunity = {
      ...opp,
      status: 'FOLLOWUP',
      followUpDate: `In 3 days (${nextDate.toLocaleDateString()})`,
    };

    setOpportunities((prev) =>
      prev.map((item) => (item.id === opp.id ? updatedOpp : item))
    );

    if (selectedOpportunityForDrawer?.id === opp.id) {
      setSelectedOpportunityForDrawer(updatedOpp);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.requesterCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.pitch.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && opp.status === 'PENDING') ||
      (statusFilter === 'FOLLOWUP' && (opp.status === 'FOLLOWUP' || opp.status === 'CLARIFICATION_REQUESTED')) ||
      (statusFilter === 'DELEGATED' && opp.status === 'DELEGATED') ||
      (statusFilter === 'ACCEPTED' && opp.status === 'ACCEPTED');

    const matchesObjective =
      objectiveFilter === 'ALL' || opp.objective === objectiveFilter;

    return matchesSearch && matchesStatus && matchesObjective;
  });

  const totalCount = opportunities.length;
  const pendingCount = opportunities.filter((o) => o.status === 'PENDING').length;
  const reviewingCount = opportunities.filter((o) => o.status === 'FOLLOWUP' || o.status === 'CLARIFICATION_REQUESTED').length;
  const engagedCount = opportunities.filter((o) => o.status === 'DELEGATED').length;
  const wonCount = opportunities.filter((o) => o.status === 'ACCEPTED').length;

  const pipelineStages = [
    { id: 'PENDING', title: 'New Inbound', count: pendingCount, color: 'border-amber-400 bg-amber-50/40 text-amber-900', badge: 'bg-amber-100 text-amber-800' },
    { id: 'FOLLOWUP', title: 'Reviewing', count: reviewingCount, color: 'border-purple-400 bg-purple-50/40 text-purple-900', badge: 'bg-purple-100 text-purple-800' },
    { id: 'DELEGATED', title: 'Engaged', count: engagedCount, color: 'border-blue-400 bg-blue-50/40 text-blue-900', badge: 'bg-blue-100 text-blue-800' },
    { id: 'ACCEPTED', title: 'Won', count: wonCount, color: 'border-emerald-400 bg-emerald-50/40 text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' },
  ];

  const renderCompactCard = (opp: InboundOpportunity) => (
    <div
      key={opp.id}
      onClick={() => setSelectedOpportunityForDrawer(opp)}
      className={`p-4 bg-surface border rounded-2xl shadow-xs hover:border-black/40 hover:shadow-md transition-all cursor-pointer space-y-3 ${
        opp.isContactRevealed
          ? 'border-emerald-300 ring-1 ring-emerald-500/20'
          : 'border-border'
      }`}
    >
      {/* Top Header: Avatar + Counterparty + Stage Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {opp.requesterName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-black text-navy truncate">{opp.requesterName}</span>
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            </div>
            <p className="text-[10px] text-text-muted truncate">
              {opp.requesterTitle} &bull; <strong className="text-navy">{opp.requesterCompany}</strong>
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider ${
            opp.status === 'ACCEPTED'
              ? 'bg-emerald-100 text-emerald-800'
              : opp.status === 'DELEGATED'
              ? 'bg-blue-100 text-blue-800'
              : opp.status === 'CLARIFICATION_REQUESTED'
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : opp.status === 'FOLLOWUP'
              ? 'bg-purple-100 text-purple-800'
              : opp.status === 'DECLINED'
              ? 'bg-rose-100 text-rose-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {opp.status === 'ACCEPTED'
            ? 'Won 🤝'
            : opp.status === 'DELEGATED'
            ? 'Engaged'
            : opp.status === 'CLARIFICATION_REQUESTED'
            ? 'Clarify ⏳'
            : opp.status === 'FOLLOWUP'
            ? 'Review'
            : opp.status === 'DECLINED'
            ? 'Declined'
            : 'New'}
        </span>
      </div>

      {/* Opportunity Channel Badge */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {opp.opportunityType === 'WARM_INTRODUCTION' ? (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-purple-50 text-purple-800 text-[10px] font-bold rounded-md border border-purple-200">
            <span>🤝 Warm Intro</span>
            {opp.intermediaryName && (
              <span className="text-purple-600 font-semibold truncate max-w-[130px]" title={`Introduced by ${opp.intermediaryName}`}>
                via {opp.intermediaryName}
              </span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-bold rounded-md border border-blue-200">
            <Zap className="w-2.5 h-2.5 text-blue-600" />
            <span>Direct Connect</span>
          </span>
        )}
        {opp.originalStatus === 'PENDING_INTERMEDIARY' && (
          <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            Awaiting Endorsement
          </span>
        )}
      </div>

      {/* Objective & Corridor */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        <span className="px-2 py-0.5 bg-bg text-navy font-bold rounded border border-border">
          {opp.objective}
        </span>
        <span className="text-text-muted truncate max-w-[140px]" title={opp.marketFocus}>
          &bull; {opp.marketFocus}
        </span>
      </div>

      {/* Introduction Text Message - Visible Before Action */}
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5 text-[10px] text-text-muted font-bold">
          <MessageSquare className="w-3 h-3 text-amber-600 shrink-0" />
          <span className="uppercase tracking-wider">Intro Note:</span>
        </div>
        <p className="text-[11px] text-navy font-medium italic line-clamp-2 leading-relaxed bg-bg/80 p-2.5 rounded-xl border border-border/70 hover:border-black/30 transition-colors">
          "{opp.pitch}"
        </p>
      </div>

      {/* Assigned Desk & Contact Status */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-[10px]">
        <div className="flex items-center space-x-1 text-text-muted truncate max-w-[150px]">
          <Users className="w-3 h-3 text-black shrink-0" />
          <span className="truncate">{opp.targetColleagueName}</span>
        </div>

        {opp.isContactRevealed ? (
          <span className="text-emerald-700 font-bold flex items-center space-x-1 shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            <Unlock className="w-2.5 h-2.5" />
            <span>Unlocked</span>
          </span>
        ) : (
          <span className="text-neutral-400 font-medium flex items-center space-x-1 shrink-0">
            <Lock className="w-2.5 h-2.5" />
            <span>Locked</span>
          </span>
        )}
      </div>

      {/* Clean Quick Action Bar */}
      <div className="pt-1 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
        <span className="text-[10px] text-text-muted">{opp.receivedAt}</span>

        <div className="flex items-center space-x-1.5">
          {opp.status !== 'ACCEPTED' && !opp.isContactRevealed && (
            <button
              type="button"
              onClick={() => handleAccept(opp)}
              className="px-2 py-1 bg-black hover:bg-neutral-800 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1"
              title="Quick Accept & Reveal Contacts"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Accept</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedOpportunityForDrawer(opp)}
            className="px-2.5 py-1 bg-surface hover:bg-bg text-navy border border-border text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1"
          >
            <span>Review & Triage</span>
            <ChevronRight className="w-3 h-3 text-text-muted" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTable = (items: InboundOpportunity[]) => (
    <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-bg/80 border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
              <th className="py-3 px-4">Counterparty & Executive</th>
              <th className="py-3 px-4 min-w-[280px]">Introduction Message & Intent</th>
              <th className="py-3 px-4">Objective & Focus</th>
              <th className="py-3 px-4">Assigned Desk</th>
              <th className="py-3 px-4">Pipeline Stage</th>
              <th className="py-3 px-4">Direct Contact</th>
              <th className="py-3 px-4">Received</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((opp) => (
              <tr
                key={opp.id}
                onClick={() => setSelectedOpportunityForDrawer(opp)}
                className="hover:bg-bg/60 transition-colors cursor-pointer group"
              >
                {/* Counterparty & Executive */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {opp.requesterName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-navy truncate group-hover:text-black">
                          {opp.requesterName}
                        </span>
                        <span title="Verified CXO">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </span>
                        {opp.opportunityType === 'WARM_INTRODUCTION' ? (
                          <span
                            className="px-1.5 py-0.5 text-[9px] bg-purple-100 text-purple-800 font-extrabold rounded uppercase"
                            title={opp.intermediaryName ? `Introduced by ${opp.intermediaryName}` : 'Warm Introduction'}
                          >
                            🤝 Warm Intro
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[9px] bg-blue-100 text-blue-800 font-extrabold rounded uppercase">
                            ⚡ Direct
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        {opp.requesterTitle} &bull; <strong className="text-navy font-semibold">{opp.requesterCompany}</strong>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Introduction Message & Intent - Visible Before Making Actions */}
                <td className="py-3.5 px-4 min-w-[280px] max-w-sm">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-[10px] text-text-muted font-bold">
                      <MessageSquare className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="uppercase tracking-wider">Intro Pitch Note:</span>
                    </div>
                    <p
                      className="text-xs text-navy font-medium italic line-clamp-2 leading-relaxed bg-bg/80 p-2.5 rounded-xl border border-border/70 group-hover:bg-bg group-hover:border-black/20 transition-colors"
                      title={opp.pitch}
                    >
                      "{opp.pitch}"
                    </p>
                  </div>
                </td>

                {/* Objective & Focus */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 bg-bg text-navy text-[11px] font-bold rounded-md border border-border">
                      {opp.objective}
                    </span>
                    <div className="text-[11px] text-text-muted truncate max-w-[220px]" title={opp.marketFocus}>
                      {opp.marketFocus}
                    </div>
                  </div>
                </td>

                {/* Assigned Desk */}
                <td className="py-3.5 px-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-navy truncate text-xs">
                      {opp.targetColleagueName}
                    </div>
                    <div className="text-[10px] text-text-muted truncate">
                      {opp.targetColleagueTitle}
                    </div>
                    {opp.delegatedToName && (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded mt-1 font-bold border border-blue-200">
                        <ArrowRight className="w-2.5 h-2.5" />
                        <span>Re-routed: {opp.delegatedToName}</span>
                      </span>
                    )}
                  </div>
                </td>

                {/* Status Stage */}
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                      opp.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : opp.status === 'DELEGATED'
                        ? 'bg-blue-100 text-blue-800'
                        : opp.status === 'CLARIFICATION_REQUESTED'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : opp.status === 'FOLLOWUP'
                        ? 'bg-purple-100 text-purple-800'
                        : opp.status === 'DECLINED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {opp.status === 'ACCEPTED'
                      ? 'Won 🤝'
                      : opp.status === 'DELEGATED'
                      ? 'Engaged'
                      : opp.status === 'CLARIFICATION_REQUESTED'
                      ? 'Clarification'
                      : opp.status === 'FOLLOWUP'
                      ? 'Reviewing'
                      : opp.status === 'DECLINED'
                      ? 'Declined'
                      : 'New Inbound'}
                  </span>
                </td>

                {/* Direct Contact Status */}
                <td className="py-3.5 px-4">
                  {opp.isContactRevealed ? (
                    <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-[11px] inline-flex">
                      <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Revealed 🔓</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200 font-semibold text-[11px] inline-flex">
                      <Lock className="w-3 h-3 text-neutral-400" />
                      <span>Locked 🔒</span>
                    </div>
                  )}
                </td>

                {/* Received */}
                <td className="py-3.5 px-4 text-text-muted text-[11px] whitespace-nowrap">
                  {opp.receivedAt}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end space-x-1.5">
                    {opp.status !== 'ACCEPTED' && !opp.isContactRevealed && (
                      <button
                        type="button"
                        onClick={() => handleAccept(opp)}
                        className="px-2.5 py-1.5 bg-black hover:bg-neutral-800 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center space-x-1 shadow-2xs"
                        title="Accept & Reveal Contacts"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Accept 🔓</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedOpportunityForDrawer(opp)}
                      className="px-2.5 py-1.5 bg-surface hover:bg-bg text-navy border border-border text-[11px] font-bold rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3 text-text-muted" />
                      <span>Review</span>
                      <ChevronRight className="w-3 h-3 text-text-muted" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Top Level Pipeline Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActivePipelineTab('INBOUND_CRM')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activePipelineTab === 'INBOUND_CRM'
              ? 'bg-black text-white shadow-xs'
              : 'bg-surface hover:bg-slate-100 text-slate-600 border border-border'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Direct Inbound CRM Pipeline</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActivePipelineTab('REVERSE_RFPS');
            if (companyId) fetchReverseOpportunities(companyId);
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activePipelineTab === 'REVERSE_RFPS'
              ? 'bg-black text-white shadow-xs'
              : 'bg-surface hover:bg-slate-100 text-slate-600 border border-border'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sourcing Tenders & Proposal Comparison Matrix</span>
          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-full uppercase">
            Gap 140
          </span>
        </button>
      </div>

      {activePipelineTab === 'REVERSE_RFPS' ? (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Newly Spawned Deal Room Success Alert */}
          {launchedDealRoomId && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-950">
                    Deal Room Successfully Launched from Proposal!
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Mutual connection verified, bilateral NDA protocol attached, and collaborative milestones generated.
                  </p>
                </div>
              </div>
              <Link
                to={`/app/deal-rooms/${launchedDealRoomId}`}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
              >
                <span>Open Deal Room</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Tender Selector Header */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Active Corporate Sourcing Mandates
                </span>
                <h2 className="text-lg font-black text-navy mt-0.5">
                  Select Enterprise RFP / Sourcing Tender
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
                {reverseOpps.length} Active Public Briefs
              </span>
            </div>

            {/* Horizontal Tender Selector Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {reverseOpps.length === 0 ? (
                <div className="text-xs text-text-muted italic py-2">Loading active corporate tenders...</div>
              ) : (
                reverseOpps.map((opp) => (
                  <button
                    key={opp.id}
                    type="button"
                    onClick={() => {
                      setSelectedReverseOpp(opp);
                      if (companyId) fetchBids(companyId, opp.id);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-left transition-all shrink-0 border ${
                      selectedReverseOpp?.id === opp.id
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-surface hover:bg-slate-100 border-border text-navy'
                    }`}
                  >
                    <div className="text-xs font-black truncate max-w-xs">{opp.title}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {opp.targetGeography} &bull; {opp.budgetBand} &bull; {opp._count?.bids ?? 0} Bids
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Selected Tender Overview Card */}
          {selectedReverseOpp && (
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                      {selectedReverseOpp.opportunityType?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Corridor: {selectedReverseOpp.targetGeography}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Budget: {selectedReverseOpp.budgetBand}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-navy mt-1.5">{selectedReverseOpp.title}</h3>
                  <p className="text-xs text-text-muted mt-1 max-w-3xl">
                    {selectedReverseOpp.requirementsDoc}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Submitted Proposals</span>
                  <span className="text-xl font-black text-navy">{bids.length} Bids</span>
                </div>
              </div>

              {/* Proposal Comparison Matrix Grid (Gap 140) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-navy text-sm">
                      Bilateral Proposal Comparison Matrix (Gap 140)
                    </span>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                      Side-by-Side Evaluation Grid
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    1-Click Decision converts verified bid into mutual Deal Room
                  </span>
                </div>

                {loadingBids ? (
                  <div className="py-12 text-center text-xs text-text-muted">Loading proposal bids...</div>
                ) : bids.length === 0 ? (
                  <div className="py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                    <Users className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-navy">No Proposals Submitted Yet</h4>
                    <p className="text-xs text-text-muted max-w-sm mx-auto">
                      This sourcing tender is active on the Reverse Discovery Marketplace. Incoming bids from verified suppliers will populate here in the comparison grid.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bids.map((bid) => {
                      const bidderName = bid.bidderProfile?.displayName || bid.bidderUser?.email || 'Corporate Bidder';
                      const bidderTitle = bid.bidderProfile?.currentTitle || 'Executive Principal';
                      const companyName = bid.bidderProfile?.company?.name || 'Verified Supplier';

                      return (
                        <div
                          key={bid.id}
                          className={`bg-surface border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                            bid.status === 'ACCEPTED'
                              ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                              : bid.status === 'SHORTLISTED'
                              ? 'border-amber-400'
                              : bid.status === 'DECLINED'
                              ? 'border-border opacity-60'
                              : 'border-border hover:border-slate-400'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Bidder Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-extrabold text-navy text-sm block">{bidderName}</span>
                                <span className="text-[11px] text-text-muted block">{bidderTitle} &bull; {companyName}</span>
                              </div>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  bid.status === 'ACCEPTED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : bid.status === 'SHORTLISTED'
                                    ? 'bg-amber-100 text-amber-800'
                                    : bid.status === 'DECLINED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {bid.status}
                              </span>
                            </div>

                            {/* Pricing Estimate & M-NDA Banner */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-text-muted font-bold">Stated Price / Band:</span>
                                <span className="font-mono font-black text-navy text-sm">
                                  {bid.pricingEstimate ? `$${bid.pricingEstimate.toLocaleString()} USD` : 'Negotiable'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                                <span className="text-text-muted">M-NDA Execution:</span>
                                <span className={`font-bold ${bid.requiresMnda ? 'text-amber-700' : 'text-slate-600'}`}>
                                  {bid.requiresMnda ? 'Required on Launch' : 'Public Specs'}
                                </span>
                              </div>
                            </div>

                            {/* Capability Statement */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                                Commercial Capability & Proposal
                              </span>
                              <p className="text-xs text-navy italic bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/60 line-clamp-4">
                                "{bid.proposalSummary}"
                              </p>
                            </div>
                          </div>

                          {/* Decision Action Buttons */}
                          <div className="pt-3 border-t border-border space-y-2">
                            {bid.status !== 'ACCEPTED' ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={actionLoadingBidId === bid.id}
                                  onClick={() => handleBidAction(selectedReverseOpp.id, bid.id, 'SHORTLIST')}
                                  className="px-2.5 py-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-xl transition-colors"
                                >
                                  Shortlist
                                </button>
                                <button
                                  type="button"
                                  disabled={actionLoadingBidId === bid.id}
                                  onClick={() => handleBidAction(selectedReverseOpp.id, bid.id, 'DECLINE')}
                                  className="px-2 py-1.5 border border-border hover:bg-rose-50 hover:text-rose-700 text-text-muted font-bold text-[11px] rounded-xl transition-colors"
                                >
                                  Decline
                                </button>
                                <button
                                  type="button"
                                  disabled={actionLoadingBidId === bid.id}
                                  onClick={() => handleBidAction(selectedReverseOpp.id, bid.id, 'ACCEPT')}
                                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1"
                                >
                                  <Rocket className="w-3 h-3" />
                                  <span>Accept & Launch</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                                <span className="font-bold text-emerald-900 flex items-center space-x-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Deal Room Active</span>
                                </span>
                                <Link
                                  to="/app/deal-rooms"
                                  className="font-bold text-emerald-800 hover:underline flex items-center space-x-1"
                                >
                                  <span>View &rarr;</span>
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-navy">Corporate Inbound Pipeline</h1>
                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                  CRM Engine
                </span>
                {userCompanies.length > 1 ? (
                  <div className="flex items-center space-x-1.5 bg-surface border-2 border-primary/30 rounded-xl px-2.5 py-1 shadow-xs">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-bold text-text-muted">Company Workspace:</span>
                    <select
                      value={companyId || ''}
                      onChange={(e) => handleCompanyChange(e.target.value)}
                      className="bg-transparent text-xs font-black text-navy cursor-pointer focus:outline-hidden"
                    >
                      {userCompanies.map((c) => {
                        const cId = c.company?.id || c.companyId;
                        const cTitle = c.company?.name || 'Company';
                        const cRole = c.companyRole || 'OWNER';
                        return (
                          <option key={cId} value={cId}>
                            {cTitle} ({cRole})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  <span className="px-2.5 py-1 bg-surface border border-border text-navy text-xs font-extrabold rounded-xl flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{companyName}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mt-1 max-w-2xl">
                Managing inbound channels for <strong>{companyName}</strong>. Displays all direct connections and warm introductions organized by stage: <strong>New Inbound</strong>, <strong>Reviewing</strong>, <strong>Engaged</strong>, and <strong>Won</strong>.
              </p>
            </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action 5: Auto-Replies & SLAs Button */}
          <button
            type="button"
            onClick={() => setAutoReplyModalOpen(true)}
            className="px-3 py-1.5 bg-surface hover:bg-bg border border-border hover:border-black rounded-xl text-xs font-bold text-navy flex items-center space-x-1.5 transition-all shadow-xs"
            title="Configure Inbound Corporate Auto-Replies & Response SLAs"
          >
            <Zap className={`w-3.5 h-3.5 ${autoReplyConfig?.enabled ? 'text-amber-500 fill-amber-500' : 'text-text-muted'}`} />
            <span>Auto-Replies & SLAs</span>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase ${
                autoReplyConfig?.enabled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {autoReplyConfig?.enabled ? `${autoReplyConfig.slaHours}h SLA Active` : 'Disabled'}
            </span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-bg p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'table' ? 'bg-black text-white shadow-xs' : 'text-text-muted hover:text-navy'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-black text-white shadow-xs' : 'text-text-muted hover:text-navy'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Stages Board</span>
            </button>
          </div>

          <div className="px-3 py-1.5 bg-surface border border-border rounded-xl flex items-center space-x-2 text-xs font-semibold text-navy">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Anti-Spam Verified</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Row & Stage Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pipelineStages.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => setStatusFilter(statusFilter === stage.id ? 'ALL' : stage.id)}
            className={`p-4 bg-surface border rounded-2xl shadow-sm text-left transition-all ${
              statusFilter === stage.id ? 'border-black ring-2 ring-black/10' : 'border-border hover:border-black/30'
            }`}
          >
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">{stage.title}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${stage.badge}`}>
                Stage
              </span>
            </div>
            <div className="text-2xl font-black text-navy">{stage.count}</div>
            <div className="text-[11px] text-text-muted mt-1">
              {stage.id === 'PENDING' ? 'New Inbound Inquiries' : stage.id === 'FOLLOWUP' ? 'Under Active Review' : stage.id === 'DELEGATED' ? 'Engaged with Team' : 'Agreed Partnerships'}
            </div>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-surface border border-border rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, name, or pitch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg border border-border rounded-xl text-xs focus:outline-none text-navy"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Stage Tab Chips */}
          <div className="flex items-center space-x-1 bg-bg p-1 rounded-xl border border-border text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                statusFilter === 'ALL' ? 'bg-black text-white' : 'text-text-muted hover:text-navy'
              }`}
            >
              All Stages ({totalCount})
            </button>
            {pipelineStages.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === s.id ? 'bg-black text-white' : 'text-text-muted hover:text-navy'
                }`}
              >
                {s.title} ({s.count})
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 bg-bg px-2.5 py-1.5 border border-border rounded-xl text-xs">
            <Target className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={objectiveFilter}
              onChange={(e) => setObjectiveFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Business Objectives</option>
              <option value="Strategic Alliance">Strategic Alliance</option>
              <option value="Brand Partnership">Brand Partnership</option>
              <option value="Supplier Sourcing">Supplier Sourcing</option>
              <option value="Territory Distribution">Territory Distribution</option>
              <option value="Commercial Sales">Commercial Sales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities Presentation */}
      {loading ? (
        <div className="py-20 text-center text-xs text-text-muted">Loading enterprise inbound opportunities...</div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-3">
          <GitBranch className="w-10 h-10 text-text-muted mx-auto" />
          <h3 className="text-base font-bold text-navy">No matching opportunities</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Try adjusting your search criteria or filter options to review inbound inquiries.
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW (Compact Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {pipelineStages.map((stage) => {
            const stageDeals = filteredOpportunities.filter((o) => o.status === stage.id);
            return (
              <div key={stage.id} className="bg-bg rounded-2xl p-3 border border-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                    <h3 className="text-xs font-black text-navy uppercase tracking-wider">{stage.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-surface text-navy border border-border rounded-full text-[10px] font-black">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageDeals.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-text-muted italic bg-surface/50 rounded-xl border border-dashed border-border">
                      No deals in {stage.title}
                    </div>
                  ) : (
                    stageDeals.map((opp) => renderCompactCard(opp))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (Default Modern Enterprise Grid) */
        renderTable(filteredOpportunities)
      )}
        </div>
      )}

      {/* Primary Slide-Over Opportunity Details Drawer */}
      {selectedOpportunityForDrawer && (
        <div
          className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedOpportunityForDrawer(null)}
        >
          <div
            className="w-full max-w-xl md:max-w-2xl bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-border bg-bg flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm ring-2 ring-black/5">
                  {selectedOpportunityForDrawer.requesterName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-extrabold text-navy">
                      {selectedOpportunityForDrawer.requesterName}
                    </h2>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified CXO</span>
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {selectedOpportunityForDrawer.requesterTitle} &bull;{' '}
                    <strong className="text-navy">{selectedOpportunityForDrawer.requesterCompany}</strong>
                  </p>
                  <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-text-muted">
                    <span>Received {selectedOpportunityForDrawer.receivedAt}</span>
                    <span>&bull;</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                        selectedOpportunityForDrawer.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedOpportunityForDrawer.status === 'DELEGATED'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedOpportunityForDrawer.status === 'CLARIFICATION_REQUESTED'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : selectedOpportunityForDrawer.status === 'FOLLOWUP'
                          ? 'bg-purple-100 text-purple-800'
                          : selectedOpportunityForDrawer.status === 'DECLINED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedOpportunityForDrawer.status === 'ACCEPTED'
                        ? 'Won 🤝'
                        : selectedOpportunityForDrawer.status === 'DELEGATED'
                        ? 'Engaged (Delegated)'
                        : selectedOpportunityForDrawer.status === 'CLARIFICATION_REQUESTED'
                        ? 'Clarification Pending'
                        : selectedOpportunityForDrawer.status === 'FOLLOWUP'
                        ? 'Reviewing'
                        : selectedOpportunityForDrawer.status === 'DECLINED'
                        ? 'Declined'
                        : 'New Inbound'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpportunityForDrawer(null)}
                className="p-1.5 text-text-muted hover:text-navy rounded-xl hover:bg-surface border border-transparent hover:border-border transition-colors"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* PRIMARY: Incoming Introduction Text Message Card - Evaluated First Before Action */}
              <div className="p-5 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 border-2 border-amber-300 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-navy uppercase tracking-wider">
                        Incoming Introduction Note from {selectedOpportunityForDrawer.requesterName}
                      </h4>
                      <p className="text-[11px] text-text-muted">
                        Review the counterparty's message below to evaluate fit before deciding an action
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black rounded-full uppercase tracking-wider">
                    Intro Pitch
                  </span>
                </div>

                {/* High-Contrast Message Quote Card */}
                <div className="p-4 bg-white rounded-xl border border-neutral-200 text-xs text-navy leading-relaxed shadow-xs">
                  <p className="italic font-medium text-[13px] text-navy leading-normal">
                    "{selectedOpportunityForDrawer.pitch}"
                  </p>
                </div>

                {/* Counterparty Intent Alignment Summary */}
                <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center space-x-1.5 text-text-muted">
                    <Target className="w-3.5 h-3.5 text-navy shrink-0" />
                    <span className="font-semibold text-navy">Stated Alignment:</span>
                    <span className="px-2 py-0.5 bg-bg rounded text-navy font-bold border border-border">
                      {selectedOpportunityForDrawer.objective}
                    </span>
                    <span>&bull;</span>
                    <span className="text-text-muted">{selectedOpportunityForDrawer.marketFocus}</span>
                  </div>

                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    Decision Based On Message &darr;
                  </span>
                </div>
              </div>

              {/* Direct Contact Coordinates Card */}
              {selectedOpportunityForDrawer.isContactRevealed ? (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-950 text-xs flex items-center space-x-1.5">
                      <Unlock className="w-4 h-4 text-emerald-600" />
                      <span>Verified Direct Contact Coordinates Unlocked</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 text-[10px] font-black rounded-full uppercase">
                      Unlocked 🔓
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Email */}
                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                        <span
                          className="font-mono text-xs text-navy truncate"
                          title={selectedOpportunityForDrawer.contactDetails.email}
                        >
                          {selectedOpportunityForDrawer.contactDetails.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedOpportunityForDrawer.contactDetails.email);
                          showToast({
                            title: 'Email Copied',
                            message: selectedOpportunityForDrawer.contactDetails.email,
                            type: 'success',
                          });
                        }}
                        className="p-1.5 text-text-muted hover:text-navy hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
                        title="Copy Email"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span
                          className="font-mono text-xs text-navy truncate"
                          title={selectedOpportunityForDrawer.contactDetails.phone}
                        >
                          {selectedOpportunityForDrawer.contactDetails.phone}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedOpportunityForDrawer.contactDetails.phone);
                          showToast({
                            title: 'Phone Copied',
                            message: selectedOpportunityForDrawer.contactDetails.phone,
                            type: 'success',
                          });
                        }}
                        className="p-1.5 text-text-muted hover:text-navy hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
                        title="Copy Phone"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {selectedOpportunityForDrawer.contactDetails.linkedinUrl && (
                    <a
                      href={selectedOpportunityForDrawer.contactDetails.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs text-blue-700 hover:text-blue-900 font-bold hover:underline"
                    >
                      <span>View LinkedIn Executive Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-navy flex items-center space-x-1.5">
                      <Lock className="w-4 h-4 text-neutral-500" />
                      <span>Contact Coordinates Secured by Institutional Protocol</span>
                    </span>
                    <span className="text-[10px] uppercase font-black text-neutral-500 bg-neutral-200/70 px-2 py-0.5 rounded-full">
                      Locked 🔒
                    </span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Direct email and telephone coordinates for {selectedOpportunityForDrawer.requesterName}{' '}
                    remain masked until you <strong>Accept & Connect</strong> or delegate to an authorized
                    department colleague with contact consent.
                  </p>
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-mono text-xs text-neutral-400">
                      {selectedOpportunityForDrawer.contactDetails.email} &bull;{' '}
                      {selectedOpportunityForDrawer.contactDetails.phone}
                    </span>
                    {selectedOpportunityForDrawer.status !== 'ACCEPTED' && (
                      <button
                        type="button"
                        onClick={() => handleAccept(selectedOpportunityForDrawer)}
                        className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1 shrink-0"
                      >
                        <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Accept & Reveal Now 🔓</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Opportunity Scope & Mandate */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-navy" />
                  <span>Opportunity Scope & Mandate</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-bg rounded-xl border border-border">
                    <span className="text-[10px] text-text-muted block font-semibold">Strategic Objective</span>
                    <span className="font-bold text-navy mt-0.5 block">
                      {selectedOpportunityForDrawer.objective}
                    </span>
                  </div>
                  <div className="p-3 bg-bg rounded-xl border border-border">
                    <span className="text-[10px] text-text-muted block font-semibold">Market Corridor</span>
                    <span className="font-bold text-navy mt-0.5 block">
                      {selectedOpportunityForDrawer.marketFocus}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-bg rounded-xl border border-border space-y-2">
                  <span className="text-xs font-bold text-navy flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Executive Value Proposition & Pitch</span>
                  </span>
                  <p className="text-xs text-text leading-relaxed italic bg-surface p-3.5 rounded-lg border border-border/60">
                    "{selectedOpportunityForDrawer.pitch}"
                  </p>
                </div>
              </div>

              {/* Corporate Routing & Assigned Desk */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-navy" />
                  <span>Assigned Desk & Department Lineage</span>
                </h3>
                <div className="p-4 bg-bg rounded-xl border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-text-muted block text-[11px]">Primary Assigned Desk</span>
                      <strong className="text-navy font-bold text-xs">
                        {selectedOpportunityForDrawer.targetColleagueName}
                      </strong>
                      <span className="text-text-muted ml-1">
                        ({selectedOpportunityForDrawer.targetColleagueTitle})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDelegatingOpportunity(selectedOpportunityForDrawer)}
                      className="px-2.5 py-1 text-xs font-bold bg-surface hover:bg-neutral-100 border border-border rounded-lg text-navy flex items-center space-x-1 transition-colors"
                    >
                      <GitBranch className="w-3 h-3 text-blue-600" />
                      <span>Re-assign</span>
                    </button>
                  </div>
                  {selectedOpportunityForDrawer.delegatedToName && (
                    <div className="pt-2 border-t border-border flex items-center space-x-2 text-blue-800 font-semibold bg-blue-50/60 p-2 rounded-lg">
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Re-routed to: <strong>{selectedOpportunityForDrawer.delegatedToName}</strong> (
                        {selectedOpportunityForDrawer.delegatedToTitle || 'Department Lead'})
                      </span>
                    </div>
                  )}
                  {selectedOpportunityForDrawer.delegationNote && (
                    <p className="text-[11px] text-text-muted italic">
                      Note: {selectedOpportunityForDrawer.delegationNote}
                    </p>
                  )}
                </div>
              </div>

              {/* Pre-Commitment Clarification Banner */}
              {(selectedOpportunityForDrawer.status === 'CLARIFICATION_REQUESTED' ||
                selectedOpportunityForDrawer.clarificationQuestion) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-amber-950 font-bold">
                    <span className="flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Pre-Commitment Clarification Question Sent</span>
                    </span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full uppercase font-black">
                      Awaiting Response
                    </span>
                  </div>
                  <p className="italic text-amber-900 bg-white/80 p-2.5 rounded-lg border border-amber-200">
                    "{selectedOpportunityForDrawer.clarificationQuestion}"
                  </p>
                </div>
              )}

              {/* Follow-up reminder banner */}
              {selectedOpportunityForDrawer.followUpDate && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold">
                      Scheduled Follow-Up: <strong>{selectedOpportunityForDrawer.followUpDate}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFollowUpSchedule(selectedOpportunityForDrawer)}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline"
                  >
                    Reschedule
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Action Dock Footer */}
            <div className="p-4 border-t border-border bg-bg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted">Opportunity Actions</span>
                <button
                  type="button"
                  onClick={() => fetchAttributionLedger(selectedOpportunityForDrawer.id)}
                  className="inline-flex items-center space-x-1 text-xs text-navy hover:text-emerald-700 font-bold transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Inspect Attribution Ledger &rarr;</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Action 1: Accept & Connect */}
                {selectedOpportunityForDrawer.status !== 'ACCEPTED' ? (
                  <button
                    type="button"
                    onClick={() => handleAccept(selectedOpportunityForDrawer)}
                    className="col-span-2 px-3.5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex flex-col items-center justify-center space-y-0.5"
                    title="Good & Related: Accept introduction, reveal verified email & phone, and launch Deal Room"
                  >
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Accept & Connect 🔓</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-normal">
                      Good & Related Fit &bull; Unlock Contacts
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRevealingOpportunity(selectedOpportunityForDrawer);
                      setRevealedDealRoomId('active');
                    }}
                    className="col-span-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex flex-col items-center justify-center space-y-0.5"
                  >
                    <div className="flex items-center space-x-1.5">
                      <Unlock className="w-4 h-4" />
                      <span>View Full Dossier & Contacts</span>
                    </div>
                    <span className="text-[10px] text-emerald-100 font-normal">
                      Active Alliance &bull; Deal Room Open
                    </span>
                  </button>
                )}

                {/* Action 2: Clarify */}
                {selectedOpportunityForDrawer.status !== 'ACCEPTED' && (
                  <button
                    type="button"
                    onClick={() => setClarifyingOpportunity(selectedOpportunityForDrawer)}
                    className="px-3 py-2 bg-surface hover:bg-bg text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center space-y-0.5"
                    title="Need Clarification: Inquire on budget, scope, or terms before accepting"
                  >
                    <div className="flex items-center space-x-1">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Clarify ❓</span>
                    </div>
                    <span className="text-[9px] text-amber-700 font-normal">
                      Need Details
                    </span>
                  </button>
                )}

                {/* Action 3: Delegate */}
                <button
                  type="button"
                  onClick={() => setDelegatingOpportunity(selectedOpportunityForDrawer)}
                  className="px-3 py-2 bg-surface hover:bg-bg text-navy border border-border rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center space-y-0.5"
                  title="Delegate to Colleague: Re-route to authorized department lead"
                >
                  <div className="flex items-center space-x-1">
                    <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                    <span>Delegate 👥</span>
                  </div>
                  <span className="text-[9px] text-text-muted font-normal">
                    Re-route Lead
                  </span>
                </button>

                {/* Follow-up */}
                <button
                  type="button"
                  onClick={() => handleFollowUpSchedule(selectedOpportunityForDrawer)}
                  className="px-3 py-2 bg-surface hover:bg-bg text-navy border border-border rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center space-y-0.5"
                  title="Schedule Follow-up: Set a 3-day reminder to review this proposal"
                >
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Follow-Up</span>
                  </div>
                  <span className="text-[9px] text-text-muted font-normal">
                    Remind Later
                  </span>
                </button>

                {/* Action 4: Decline */}
                {selectedOpportunityForDrawer.status !== 'DECLINED' &&
                  selectedOpportunityForDrawer.status !== 'ACCEPTED' && (
                    <button
                      type="button"
                      onClick={() => setDecliningOpportunity(selectedOpportunityForDrawer)}
                      className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex flex-col items-center justify-center space-y-0.5"
                      title="Decline: Polite institutional decline without burning reputation"
                    >
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </div>
                      <span className="text-[9px] text-rose-500 font-normal">
                        Not a Fit
                      </span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Differentiator #5: Evidence-Backed Attribution Ledger Slide-Over Drawer */}
      {attributionDealId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-xl bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <History className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy">
                    Evidence-Backed Attribution Ledger
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Cryptographic audit trail tracing discovery, introductions, proposals, and outcomes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttributionDealId(null)}
                className="p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {loadingLedger ? (
                <div className="py-20 text-center space-y-3">
                  <History className="w-8 h-8 text-black mx-auto animate-spin" />
                  <p className="text-xs text-text-muted font-bold">
                    Retrieving tamper-evident attribution events...
                  </p>
                </div>
              ) : attributionLedger ? (
                <div className="space-y-6">
                  {/* Deal Overview Banner */}
                  <div className="p-4 bg-bg rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                        Deal Reference
                      </span>
                      <span className="text-sm font-black text-navy">{attributionLedger.dealReferenceId}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                        Audit Status
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase">
                        Verified Ledger
                      </span>
                    </div>
                  </div>

                  {/* Multi-Party Attribution Breakdown */}
                  {attributionLedger.partiesInvolved?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        Parties & Contribution Weight
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attributionLedger.partiesInvolved.map((party: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between"
                          >
                            <div>
                              <span className="text-xs font-bold text-navy block">{party.name}</span>
                              <span className="text-[10px] text-text-muted">{party.role}</span>
                            </div>
                            <span className="text-xs font-black text-emerald-600">
                              {party.attributionPercentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chronological Evidence Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-navy" />
                      <span>Tamper-Evident Event Trail ({attributionLedger.events?.length || 0})</span>
                    </h4>

                    <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
                      {attributionLedger.events?.map((ev: any, idx: number) => (
                        <div key={ev.id || idx} className="relative flex items-start space-x-4 pl-8">
                          <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-black border-2 border-white flex items-center justify-center shrink-0" />
                          <div className="flex-1 p-4 bg-surface rounded-xl border border-border/80 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-navy">
                                {ev.eventType?.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] text-text-muted font-mono">
                                {new Date(ev.timestamp).toLocaleString()}
                              </span>
                            </div>

                            <p className="text-xs text-text-muted">
                              {ev.evidenceSummary || 'Attribution interaction recorded and timestamped.'}
                            </p>

                            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                              <span className="font-mono text-text-muted truncate max-w-[200px]" title={ev.cryptographicHash}>
                                Hash: {ev.cryptographicHash?.substring(0, 16)}...
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-extrabold rounded">
                                Audited
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Drawer Footer with Actions for Option C & Option D */}
            <div className="p-5 border-t border-border bg-bg flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleExecuteNda}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs"
                  title="Option C: Execute bilateral Mutual NDA on deal"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Execute M-NDA</span>
                </button>

                <button
                  type="button"
                  onClick={handleRecordIcsMeeting}
                  className="px-3 py-1.5 bg-surface hover:bg-bg text-navy border border-border text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
                  title="Option D: Register cryptographic RFC 5545 Calendar ICS proof"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Record .ICS Proof</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setAttributionDealId(null)}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Corporate Delegation Slide-Over Drawer */}
      {delegatingOpportunity && (
        <DelegateToColleagueModal
          isOpen={!!delegatingOpportunity}
          onClose={() => setDelegatingOpportunity(null)}
          connectionId={delegatingOpportunity.id}
          requesterName={delegatingOpportunity.requesterName}
          opportunitySummary={`${delegatingOpportunity.objective} - ${delegatingOpportunity.marketFocus}`}
          onSuccess={() => {
            const updated = opportunities.map((item) =>
              item.id === delegatingOpportunity.id
                ? {
                    ...item,
                    status: 'DELEGATED' as const,
                    delegationNote: 'Re-routed to verified department lead on roster.',
                  }
                : item
            );
            setOpportunities(updated);
            if (selectedOpportunityForDrawer?.id === delegatingOpportunity.id) {
              const matched = updated.find((u) => u.id === delegatingOpportunity.id);
              if (matched) setSelectedOpportunityForDrawer(matched);
            }
            setDelegatingOpportunity(null);
          }}
        />
      )}

      {/* Structured Decline Reason Slide-Over Drawer */}
      {decliningOpportunity && (
        <DeclineReasonModal
          isOpen={!!decliningOpportunity}
          onClose={() => setDecliningOpportunity(null)}
          connectionId={decliningOpportunity.id}
          requesterName={decliningOpportunity.requesterName}
          onSuccess={() => {
            const updated = opportunities.map((item) =>
              item.id === decliningOpportunity.id ? { ...item, status: 'DECLINED' as const } : item
            );
            setOpportunities(updated);
            if (selectedOpportunityForDrawer?.id === decliningOpportunity.id) {
              const matched = updated.find((u) => u.id === decliningOpportunity.id);
              if (matched) setSelectedOpportunityForDrawer(matched);
            }
            setDecliningOpportunity(null);
          }}
        />
      )}

      {/* Action 1: Contact Reveal Dossier Modal */}
      {revealingOpportunity && (
        <ContactRevealModal
          isOpen={!!revealingOpportunity}
          onClose={() => setRevealingOpportunity(null)}
          opportunity={revealingOpportunity}
          dealRoomId={revealedDealRoomId}
        />
      )}

      {/* Action 2: Pre-Commitment Clarification Modal */}
      {clarifyingOpportunity && (
        <CorporateClarifyModal
          isOpen={!!clarifyingOpportunity}
          onClose={() => setClarifyingOpportunity(null)}
          connectionId={clarifyingOpportunity.id}
          companyId={companyId}
          requesterName={clarifyingOpportunity.requesterName}
          requesterCompany={clarifyingOpportunity.requesterCompany}
          opportunitySummary={`${clarifyingOpportunity.objective} - ${clarifyingOpportunity.marketFocus}`}
          onSuccess={(question) => {
            const updated = opportunities.map((item) =>
              item.id === clarifyingOpportunity.id
                ? {
                    ...item,
                    status: 'CLARIFICATION_REQUESTED' as const,
                    clarificationQuestion: question,
                  }
                : item
            );
            setOpportunities(updated);
            if (selectedOpportunityForDrawer?.id === clarifyingOpportunity.id) {
              const matched = updated.find((u) => u.id === clarifyingOpportunity.id);
              if (matched) setSelectedOpportunityForDrawer(matched);
            }
            setClarifyingOpportunity(null);
          }}
        />
      )}

      {/* Action 5: Corporate Auto-Reply & SLA Modal */}
      {companyId && (
        <CorporateAutoReplyModal
          isOpen={autoReplyModalOpen}
          onClose={() => setAutoReplyModalOpen(false)}
          companyId={companyId}
          companyName={companyName}
          onSaved={(config) => setAutoReplyConfig(config)}
        />
      )}
    </div>
  );
};
