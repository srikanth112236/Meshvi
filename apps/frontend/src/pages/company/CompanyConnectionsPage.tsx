import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Network,
  Users,
  Building2,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  RefreshCw,
  X,
  Share2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  XCircle,
  EyeOff,
  Send,
} from 'lucide-react';

interface CompanyConnection {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'WITHDRAWN';
  businessReason?: string;
  createdAt: string;
  respondedAt?: string;
  connectedDays: number;

  handledByType: 'OWNER' | 'DELEGATED' | 'TEAM_MEMBER';
  handlerName: string;
  handlerTitle: string;
  handlerEmail?: string | null;
  handlerProfileId?: string | null;

  isDelegated: boolean;
  delegatedToProfileId?: string | null;
  delegatedFromUserId?: string | null;
  delegationNote?: string | null;

  counterparty: {
    profileId?: string | null;
    displayName: string;
    currentTitle: string;
    companyName: string;
    city?: string | null;
    countryCode?: string | null;
    isContactUnlocked?: boolean;
    email?: string | null;
    phoneNumber?: string | null;
    verificationStatus: string;
    avatarUrl?: string | null;
  };
}

interface HandoverCandidate {
  id: string;
  profileId: string;
  name: string;
  title: string;
  companyName: string;
  email: string | null;
  phoneNumber: string | null;
  source: 'TEAM' | 'CONNECTION';
}

export const CompanyConnectionsPage: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userCompanies, setUserCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<any | null>(null);
  const [connections, setConnections] = useState<CompanyConnection[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'INBOUND' | 'OUTBOUND'>('ALL');

  // "Take Action" Modal State
  const [actionModalTarget, setActionModalTarget] = useState<CompanyConnection | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSubView, setActionSubView] = useState<'CHOICE' | 'PASS_ON'>('CHOICE');

  // Handover / Pass On Candidates State
  const [candidates, setCandidates] = useState<HandoverCandidate[]>([]);
  const [passOnMode, setPassOnMode] = useState<'EXISTING' | 'INVITE'>('EXISTING');
  const [selectedCandidateProfileId, setSelectedCandidateProfileId] = useState('');
  const [handoverNote, setHandoverNote] = useState('');

  // Parallel Colleague Invite Fields
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');

  // 1. Fetch user's affiliated companies
  useEffect(() => {
    if (!token) return;
    fetch('/api/v1/companies/my', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setUserCompanies(data.data);
          const firstId = data.data[0].company?.id || data.data[0].companyId;
          setSelectedCompanyId(firstId);
        }
      })
      .catch(() => {});
  }, [token]);

  // 2. Fetch connections when selectedCompanyId changes
  const fetchConnections = async (cId: string) => {
    if (!token || !cId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/companies/${cId}/all-connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const payload = data?.data !== undefined ? data.data : data;
      if (res.ok && payload) {
        setCompanyData(payload);
        setConnections(payload.connections || []);
      }
    } catch {
      showToast({
        title: 'Connection Roster Error',
        message: 'Could not load company connections roster.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch candidates (Team members + User 1st-degree connections) for Handover
  const fetchHandoverCandidates = async (cId: string) => {
    if (!token) return;
    const candidateList: HandoverCandidate[] = [];
    const seenProfileIds = new Set<string>();

    try {
      // Team members
      if (cId) {
        const teamRes = await fetch(`/api/v1/companies/${cId}/team`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const teamData = await teamRes.json();
        const teamArray = Array.isArray(teamData) ? teamData : teamData?.data || [];
        for (const m of teamArray) {
          const profId = m.profileId || m.user?.profile?.id;
          if (profId && !seenProfileIds.has(profId)) {
            seenProfileIds.add(profId);
            candidateList.push({
              id: m.id || profId,
              profileId: profId,
              name: m.name || m.user?.profile?.displayName || m.user?.email || 'Team Colleague',
              title: m.title || m.user?.profile?.currentTitle || 'Team Member',
              companyName: companyData?.companyName || 'Our Company',
              email: m.email || m.user?.email || null,
              phoneNumber: m.phoneNumber || m.user?.phoneNumber || null,
              source: 'TEAM',
            });
          }
        }
      }

      // Existing 1st-degree connections
      const connRes = await fetch('/api/v1/connections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const connData = await connRes.json();
      const connArray = Array.isArray(connData) ? connData : connData?.data || [];
      for (const c of connArray) {
        const profId = c.partner?.profileId;
        if (profId && !seenProfileIds.has(profId)) {
          seenProfileIds.add(profId);
          candidateList.push({
            id: c.id,
            profileId: profId,
            name: c.partner?.fullName || 'Verified Connection',
            title: c.partner?.headline || c.partner?.function || 'Partner',
            companyName: c.partner?.companyName || 'Enterprise Partner',
            email: c.partner?.email || null,
            phoneNumber: c.partner?.phoneNumber || null,
            source: 'CONNECTION',
          });
        }
      }

      setCandidates(candidateList);
      if (candidateList.length > 0 && !selectedCandidateProfileId) {
        setSelectedCandidateProfileId(candidateList[0].profileId);
      }
    } catch {}
  };

  useEffect(() => {
    if (selectedCompanyId) {
      fetchConnections(selectedCompanyId);
      fetchHandoverCandidates(selectedCompanyId);
    }
  }, [selectedCompanyId, token]);

  // Open "Take Action" modal
  const handleOpenTakeAction = (conn: CompanyConnection) => {
    setActionModalTarget(conn);
    setActionSubView('CHOICE');
    setPassOnMode('EXISTING');
    setHandoverNote('');
    setInviteName('');
    setInviteEmail('');
    setInvitePhone('');
    if (candidates.length > 0) {
      setSelectedCandidateProfileId(candidates[0].profileId);
    }
  };

  // Close "Take Action" modal
  const handleCloseTakeAction = () => {
    setActionModalTarget(null);
    setActionSubView('CHOICE');
  };

  // 1. Direct Accept
  const handleAcceptConnection = async () => {
    if (!token || !actionModalTarget) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/v1/connections/${actionModalTarget.id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Connection Accepted! 🎉',
          message: 'Phone number and email are now unlocked. You are now connected.',
          type: 'success',
        });
        handleCloseTakeAction();
        if (selectedCompanyId) fetchConnections(selectedCompanyId);
      } else {
        showToast({
          title: 'Acceptance Failed',
          message: data.message || 'Could not accept connection.',
          type: 'error',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Network error accepting connection.', type: 'error' });
    } finally {
      setSubmittingAction(false);
    }
  };

  // 2. Reject / Decline
  const handleRejectConnection = async () => {
    if (!token || !actionModalTarget) return;
    const confirmReject = window.confirm(`Decline connection request from ${actionModalTarget.counterparty.displayName}?`);
    if (!confirmReject) return;

    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/v1/connections/${actionModalTarget.id}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ declineReasonCode: 'NOT_RELEVANT' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Connection Declined',
          message: 'The connection request has been declined.',
          type: 'info',
        });
        handleCloseTakeAction();
        if (selectedCompanyId) fetchConnections(selectedCompanyId);
      } else {
        showToast({
          title: 'Action Failed',
          message: data.message || 'Could not decline connection.',
          type: 'error',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Network error declining connection.', type: 'error' });
    } finally {
      setSubmittingAction(false);
    }
  };

  // 3. Ignore
  const handleIgnoreConnection = async () => {
    if (!token || !actionModalTarget) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/v1/connections/${actionModalTarget.id}/ignore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Dismissed from connections desk' }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Connection Ignored',
          message: 'The request has been silently archived.',
          type: 'info',
        });
        handleCloseTakeAction();
        if (selectedCompanyId) fetchConnections(selectedCompanyId);
      } else {
        showToast({
          title: 'Action Failed',
          message: data.message || 'Could not ignore connection.',
          type: 'error',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Network error ignoring connection.', type: 'error' });
    } finally {
      setSubmittingAction(false);
    }
  };

  // 4. Accept & Pass On (Submit)
  const handleExecutePassOn = async () => {
    if (!token || !selectedCompanyId || !actionModalTarget) return;

    if (passOnMode === 'INVITE') {
      if (!inviteEmail.trim()) {
        showToast({ title: 'Email Required', message: 'Please enter colleague work email.', type: 'error' });
        return;
      }
    } else {
      if (!selectedCandidateProfileId) {
        showToast({ title: 'Recipient Required', message: 'Please select a colleague or connection.', type: 'error' });
        return;
      }
    }

    setSubmittingAction(true);
    try {
      const payload: any = {
        acceptAndConnect: true,
        note: handoverNote.trim() || undefined,
      };

      if (passOnMode === 'INVITE') {
        payload.inviteEmail = inviteEmail.trim();
        payload.inviteName = inviteName.trim() || undefined;
        payload.invitePhone = invitePhone.trim() || undefined;
      } else {
        payload.targetProfileId = selectedCandidateProfileId;
      }

      const res = await fetch(
        `/api/v1/companies/${selectedCompanyId}/connections/${actionModalTarget.id}/reassign`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        showToast({
          title: 'Opportunity Accepted & Passed On! 🤝',
          message: data.message || 'Connection accepted and successfully passed on to teammate.',
          type: 'success',
        });
        handleCloseTakeAction();
        fetchConnections(selectedCompanyId);
      } else {
        showToast({
          title: 'Handover Failed',
          message: data.message || 'Could not re-route connection.',
          type: 'error',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Network error during handover.', type: 'error' });
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filter connections
  const filteredConnections = connections.filter((conn) => {
    if (activeTab === 'PENDING' && conn.status !== 'PENDING') return false;
    if (activeTab === 'ACCEPTED' && conn.status !== 'ACCEPTED') return false;
    if (activeTab === 'INBOUND' && conn.direction !== 'INBOUND') return false;
    if (activeTab === 'OUTBOUND' && conn.direction !== 'OUTBOUND') return false;

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchName = conn.counterparty.displayName.toLowerCase().includes(q);
      const matchComp = conn.counterparty.companyName.toLowerCase().includes(q);
      const matchHandler = (conn.handlerName || '').toLowerCase().includes(q);
      const matchNote = (conn.delegationNote || '').toLowerCase().includes(q);
      return matchName || matchComp || matchHandler || matchNote;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Enterprise Relationship Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-navy flex items-center space-x-2.5">
            <Network className="w-7 h-7 text-indigo-600" />
            <span>Company Connections & Inbound Desk</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Streamlined institutional network for {companyData?.companyName || 'your enterprise'}. Review inbound connection requests, take instant action, or pass on to specialized colleagues.
          </p>
        </div>

        {/* Company Workspace Selector */}
        {userCompanies.length > 1 && (
          <div className="flex items-center space-x-2 bg-surface p-2 rounded-xl border border-border shadow-xs">
            <Building2 className="w-4 h-4 text-neutral-500" />
            <select
              value={selectedCompanyId || ''}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-transparent text-xs font-bold text-navy focus:outline-none cursor-pointer"
            >
              {userCompanies.map((c) => (
                <option key={c.company?.id || c.companyId} value={c.company?.id || c.companyId}>
                  {c.company?.name || 'Organization'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-text-muted text-xs font-bold uppercase tracking-wider">
            <span>Total Network</span>
            <Network className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-navy mt-2">
            {companyData?.totalConnections ?? connections.length}
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">Institutional connection records</span>
        </div>

        <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-amber-900 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Pending Action</span>
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            {connections.filter((c) => c.status === 'PENDING').length}
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">Awaiting decision or handover</span>
        </div>

        <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-emerald-900 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Connected &bull; Active</span>
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {connections.filter((c) => c.status === 'ACCEPTED').length}
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">Full email & phone unlocked</span>
        </div>

        <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-blue-900 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Delegated to Team</span>
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">
            {connections.filter((c) => c.handledByType === 'DELEGATED' || c.isDelegated).length}
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">Handed over to functional owners</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
              activeTab === 'ALL'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:bg-surface-muted hover:text-navy'
            }`}
          >
            All ({connections.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors ${
              activeTab === 'PENDING'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                : 'text-text-muted hover:bg-surface-muted hover:text-navy'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Action ({connections.filter((c) => c.status === 'PENDING').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACCEPTED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors ${
              activeTab === 'ACCEPTED'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs'
                : 'text-text-muted hover:bg-surface-muted hover:text-navy'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connected ({connections.filter((c) => c.status === 'ACCEPTED').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('INBOUND')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors ${
              activeTab === 'INBOUND'
                ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-xs'
                : 'text-text-muted hover:bg-surface-muted hover:text-navy'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-purple-600" />
            <span>Inbound ({connections.filter((c) => c.direction === 'INBOUND').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('OUTBOUND')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors ${
              activeTab === 'OUTBOUND'
                ? 'bg-blue-100 text-blue-900 border border-blue-300 shadow-xs'
                : 'text-text-muted hover:bg-surface-muted hover:text-navy'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            <span>Outbound ({connections.filter((c) => c.direction === 'OUTBOUND').length})</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, designation, company..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-bg text-xs border border-border rounded-xl focus:outline-none focus:border-navy"
          />
        </div>
      </div>

      {/* Main Clean Roster List */}
      {loading ? (
        <div className="p-12 text-center text-text-muted bg-surface rounded-2xl border border-border">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-xs font-bold">Synchronizing enterprise connections ledger...</p>
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="p-12 text-center text-text-muted bg-surface rounded-2xl border border-border">
          <Network className="w-8 h-8 text-neutral-400 mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-bold text-navy">No Connections Found</h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            {searchFilter
              ? 'No connections match your active search filter.'
              : 'Your organization currently has no connection records in this view.'}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs divide-y divide-border">
          {filteredConnections.map((conn) => {
            const isAccepted = conn.status === 'ACCEPTED';
            const isPending = conn.status === 'PENDING';

            return (
              <div
                key={conn.id}
                className="p-5 hover:bg-surface-muted/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Minimal Card Left: Name & Designation */}
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                    {conn.counterparty.displayName[0]?.toUpperCase() || 'C'}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-navy text-base tracking-tight">
                        {conn.counterparty.displayName}
                      </span>

                      {/* Direction Tag */}
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          conn.direction === 'INBOUND'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {conn.direction === 'INBOUND' ? (
                          <>
                            <ArrowDownLeft className="w-2.5 h-2.5 text-purple-600" />
                            <span>Inbound Request</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-2.5 h-2.5 text-blue-600" />
                            <span>Outbound Outreach</span>
                          </>
                        )}
                      </span>

                      {/* Status Tag */}
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isAccepted
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : isPending
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                        }`}
                      >
                        {isAccepted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Connected &bull; {conn.connectedDays === 0 ? 'Today' : `${conn.connectedDays}d`}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>{conn.status}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Designation, Organization & City */}
                    <div className="text-xs text-text-muted flex flex-wrap items-center gap-1.5 font-medium">
                      <span className="font-bold text-neutral-800">{conn.counterparty.currentTitle}</span>
                      <span>&bull;</span>
                      <span className="text-indigo-600 font-bold">{conn.counterparty.companyName}</span>
                      {conn.counterparty.city && (
                        <>
                          <span>&bull;</span>
                          <span>{conn.counterparty.city}{conn.counterparty.countryCode ? `, ${conn.counterparty.countryCode}` : ''}</span>
                        </>
                      )}
                    </div>

                    {/* Revealed Contact (If Accepted) OR Privacy Lock Status */}
                    <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
                      {isAccepted ? (
                        <>
                          <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            <Mail className="w-3 h-3 text-emerald-600" />
                            <span>{conn.counterparty.email || 'Email verified'}</span>
                          </div>
                          {conn.counterparty.phoneNumber && (
                            <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{conn.counterparty.phoneNumber}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-text-muted text-[11px] font-medium bg-neutral-100 px-2.5 py-0.5 rounded-lg border border-neutral-200">
                          <Lock className="w-3 h-3 text-neutral-500" />
                          <span>Phone & email unlocked after connecting</span>
                        </div>
                      )}
                    </div>

                    {/* Delegation Note if already passed on */}
                    {conn.delegationNote && (
                      <p className="text-[11px] text-blue-700 bg-blue-50/70 p-1.5 rounded-lg border border-blue-200/60 mt-1.5">
                        <span className="font-bold">Handover Memo:</span> {conn.delegationNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action: Clean "Take Action" or "Connected" */}
                <div className="flex items-center space-x-2 shrink-0">
                  {isAccepted ? (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate('/app/messages')}
                        className="px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 bg-navy text-white hover:bg-neutral-800 transition-colors shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Chat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenTakeAction(conn)}
                        className="px-3 py-2 text-xs font-bold rounded-xl flex items-center space-x-1 bg-surface border border-border hover:bg-surface-muted text-neutral-700 transition-colors"
                        title="Re-assign or pass on to another team member"
                      >
                        <Share2 className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Pass On</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenTakeAction(conn)}
                      className="px-5 py-2.5 text-xs font-black rounded-xl flex items-center space-x-2 bg-navy text-white hover:bg-neutral-800 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Take Action</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "Take Action" Comprehensive Modal */}
      {actionModalTarget && (
        <div className="fixed inset-0 z-60 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-navy text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {actionModalTarget.counterparty.displayName[0]?.toUpperCase() || 'C'}
                </div>
                <div>
                  <h3 className="text-base font-black text-navy">
                    {actionModalTarget.counterparty.displayName}
                  </h3>
                  <p className="text-xs text-text-muted font-medium">
                    {actionModalTarget.counterparty.currentTitle} &bull;{' '}
                    <span className="text-indigo-600 font-bold">
                      {actionModalTarget.counterparty.companyName}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseTakeAction}
                className="p-1.5 text-text-muted hover:text-navy rounded-xl hover:bg-surface-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Message Sent By Them */}
            <div className="bg-bg p-4 rounded-2xl border border-border space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                Message / Business Reason Sent By Counterparty
              </span>
              <p className="text-xs text-neutral-800 leading-relaxed font-medium italic">
                "{actionModalTarget.businessReason || 'We are seeking to initiate a direct commercial connection and explore mutual trade, strategic alignment, and procurement opportunities.'}"
              </p>
            </div>

            {/* 2. Direct Contact Locked / Privacy Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Contact Privacy Protection Active</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                  🔒 Locked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60 flex items-center space-x-2 text-neutral-600">
                  <Phone className="w-3.5 h-3.5 text-amber-700" />
                  <span className="font-mono text-[11px] font-bold">
                    {actionModalTarget.status === 'ACCEPTED' && actionModalTarget.counterparty.phoneNumber
                      ? actionModalTarget.counterparty.phoneNumber
                      : '+91 ••••• ••••• (Locked)'}
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60 flex items-center space-x-2 text-neutral-600">
                  <Mail className="w-3.5 h-3.5 text-amber-700" />
                  <span className="font-mono text-[11px] font-bold truncate">
                    {actionModalTarget.status === 'ACCEPTED' && actionModalTarget.counterparty.email
                      ? actionModalTarget.counterparty.email
                      : '•••••••••••••@••••.com'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-amber-900 leading-tight">
                🔒 Direct phone number and email are locked to prevent unsolicited outreach. Accepting or passing on this connection unlocks verified contact credentials automatically.
              </p>
            </div>

            {/* 3. Action Workflow */}
            {actionSubView === 'CHOICE' ? (
              <div className="space-y-3 pt-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-text-muted block">
                  Select Action to Execute
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Accept */}
                  <button
                    type="button"
                    disabled={submittingAction}
                    onClick={handleAcceptConnection}
                    className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-black">1. Accept Connection</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] text-emerald-100 leading-tight">
                      Unlocks email & phone. Confirms mutual friendship and enables deal room chat.
                    </span>
                  </button>

                  {/* Option 2: Accept & Pass On */}
                  <button
                    type="button"
                    disabled={submittingAction}
                    onClick={() => setActionSubView('PASS_ON')}
                    className="p-3.5 bg-navy hover:bg-neutral-800 text-white rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-black">2. Accept & Pass On</span>
                      <Share2 className="w-4 h-4 text-indigo-300 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] text-neutral-300 leading-tight">
                      Re-route to team member, connection, or invite external colleague in parallel.
                    </span>
                  </button>

                  {/* Option 3: Reject */}
                  <button
                    type="button"
                    disabled={submittingAction}
                    onClick={handleRejectConnection}
                    className="p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-2xl text-left transition-colors flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-black">3. Reject Request</span>
                      <XCircle className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-[10px] text-rose-700 leading-tight">
                      Politely declines this connection request.
                    </span>
                  </button>

                  {/* Option 4: Ignore */}
                  <button
                    type="button"
                    disabled={submittingAction}
                    onClick={handleIgnoreConnection}
                    className="p-3.5 bg-surface-muted hover:bg-neutral-200 text-neutral-800 border border-border rounded-2xl text-left transition-colors flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-black">4. Ignore Request</span>
                      <EyeOff className="w-4 h-4 text-neutral-500" />
                    </div>
                    <span className="text-[10px] text-text-muted leading-tight">
                      Silently archives request without alerting counterparty.
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Pass On Sub-workflow */
              <div className="space-y-4 pt-1 bg-surface-muted/60 p-4 rounded-2xl border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Share2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-navy">
                      Accept & Hand Over Connection
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActionSubView('CHOICE')}
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    &larr; Back to Actions
                  </button>
                </div>

                {/* Sub-mode selector: Existing Colleague vs Invite in Parallel */}
                <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-xl border border-border text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPassOnMode('EXISTING')}
                    className={`py-1.5 rounded-lg transition-colors ${
                      passOnMode === 'EXISTING'
                        ? 'bg-navy text-white shadow-xs'
                        : 'text-text-muted hover:text-navy'
                    }`}
                  >
                    👥 Team / Connection
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassOnMode('INVITE')}
                    className={`py-1.5 rounded-lg transition-colors ${
                      passOnMode === 'INVITE'
                        ? 'bg-navy text-white shadow-xs'
                        : 'text-text-muted hover:text-navy'
                    }`}
                  >
                    ✉️ Invite Colleague in Parallel
                  </button>
                </div>

                {passOnMode === 'EXISTING' ? (
                  /* Option A: Pick Existing Team Member / Connection */
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-navy uppercase block">
                      Select Recipient (Showing Name, Designation, Email & Mobile):
                    </label>

                    {candidates.length === 0 ? (
                      <p className="text-xs text-text-muted italic bg-surface p-3 rounded-xl border border-border">
                        No team members or connections found. Switch to "Invite Colleague in Parallel" tab.
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {candidates.map((cand) => {
                          const isSelected = selectedCandidateProfileId === cand.profileId;
                          return (
                            <div
                              key={cand.profileId}
                              onClick={() => setSelectedCandidateProfileId(cand.profileId)}
                              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between ${
                                isSelected
                                  ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-1 ring-indigo-500'
                                  : 'bg-surface border-border hover:border-neutral-400'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-extrabold text-navy">{cand.name}</span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-600">
                                    {cand.source === 'TEAM' ? 'Team Member' : 'Connection'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-text-muted">
                                  {cand.title} &bull; {cand.companyName}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-neutral-600">
                                  {cand.email && (
                                    <span className="flex items-center space-x-1">
                                      <Mail className="w-2.5 h-2.5 text-indigo-600" />
                                      <span>{cand.email}</span>
                                    </span>
                                  )}
                                  {cand.phoneNumber && (
                                    <span className="flex items-center space-x-1 font-mono">
                                      <Phone className="w-2.5 h-2.5 text-indigo-600" />
                                      <span>{cand.phoneNumber}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0 mt-0.5">
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  onChange={() => setSelectedCandidateProfileId(cand.profileId)}
                                  className="accent-indigo-600"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Option B: Invite Colleague in Parallel */
                  <div className="space-y-2.5 bg-surface p-3 rounded-xl border border-border">
                    <p className="text-[11px] text-text-muted leading-tight">
                      Add colleague details below. An official email invitation will be dispatched to their address immediately, and this opportunity bridge will be routed to their desk.
                    </p>

                    <div>
                      <label className="text-[10px] font-bold text-navy uppercase block mb-1">
                        Colleague Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh V. Sundaram"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="w-full p-2 bg-bg text-xs border border-border rounded-xl focus:outline-none focus:border-navy"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-navy uppercase block mb-1">
                          Work Email Address *
                        </label>
                        <input
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full p-2 bg-bg text-xs border border-border rounded-xl focus:outline-none focus:border-navy"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-navy uppercase block mb-1">
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98401 23456"
                          value={invitePhone}
                          onChange={(e) => setInvitePhone(e.target.value)}
                          className="w-full p-2 bg-bg text-xs border border-border rounded-xl focus:outline-none focus:border-navy"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Handover Memo / Instructions */}
                <div>
                  <label className="text-[10px] font-bold text-navy uppercase block mb-1">
                    Handover Note & Instructions:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please lead commercial procurement negotiations for HACCP certified ingredient supply."
                    value={handoverNote}
                    onChange={(e) => setHandoverNote(e.target.value)}
                    className="w-full p-2 bg-surface text-xs border border-border rounded-xl focus:outline-none focus:border-navy"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setActionSubView('CHOICE')}
                    className="px-3 py-1.5 text-xs font-bold text-text-muted hover:text-navy rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingAction}
                    onClick={handleExecutePassOn}
                    className="px-4 py-2 text-xs font-black bg-navy text-white rounded-xl hover:bg-neutral-800 transition-colors shadow-xs flex items-center space-x-1.5"
                  >
                    {submittingAction ? (
                      <span>Synchronizing Handover...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Confirm & Pass On</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
