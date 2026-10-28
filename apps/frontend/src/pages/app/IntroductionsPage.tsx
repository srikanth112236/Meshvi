import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Network,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Award,
  X,
  MessageSquare,
  Handshake,
  Inbox,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface IntroductionItem {
  id: string;
  businessReason: string;
  status: string;
  createdAt: string;
  requester: {
    id: string;
    email: string;
    profile?: { displayName: string; function: string | null; headline: string | null } | null;
  };
  intermediary: {
    id: string;
    email: string;
    profile?: { displayName: string } | null;
  };
  targetProfile: {
    id: string;
    displayName: string;
    headline: string | null;
    function: string | null;
    company?: { name: string } | null;
  };
}

export const IntroductionsPage = () => {
  const { user, token } = useAuth();
  const { showToast, notifications } = useNotifications();
  const navigate = useNavigate();

  const [introductions, setIntroductions] = useState<IntroductionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [steppedAsideIds, setSteppedAsideIds] = useState<string[]>([]);

  // Distinct Tab States: PENDING | ACTIVE | SENT | ALL
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'SENT' | 'ALL'>('PENDING');

  // Attested Endorsement Drawer State
  const [endorseModalTarget, setEndorseModalTarget] = useState<IntroductionItem | null>(null);
  const [endorsementText, setEndorsementText] = useState(
    'I have worked closely with this counterparty on cross-border initiatives and personally attest to their operational reliability and commercial execution.'
  );

  // Target Executive Response & Direct Connect Modal
  const [targetAcceptModalIntro, setTargetAcceptModalIntro] = useState<IntroductionItem | null>(null);
  const [targetResponseNote, setTargetResponseNote] = useState('');

  const fetchIntroductions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/introductions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIntroductions(data.data || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntroductions();
  }, [token]);

  // Real-time synchronization via SSE
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (['INTRO_REQUEST', 'INTRO_ACCEPTED', 'CONNECTION_REQUEST', 'CONNECTION_ACCEPTED'].includes(latest.type)) {
        fetchIntroductions();
      }
    }
  }, [notifications]);

  const handleStepAside = (introId: string) => {
    setSteppedAsideIds((prev) => [...prev, introId]);
    showToast({
      title: 'Connector Step-Aside Completed (+5 Reputation)',
      message: 'You have gracefully handed over this bridge to the parties. +5 Facilitator Reputation points credited!',
      type: 'success',
    });
  };

  const handleAction = async (id: string, action: string, note?: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/introductions/${id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, endorsementNote: note }),
      });
      if (res.ok) {
        showToast({
          title: action === 'TARGET_ACCEPT' ? '🤝 Introduction Accepted & Direct Bridge Connected' : 'Status Updated',
          message: action === 'TARGET_ACCEPT' ? 'Mutual 1st-degree connection established! Private messaging channel activated.' : 'Response recorded.',
          type: 'success',
        });
        setTargetAcceptModalIntro(null);
        await fetchIntroductions();
      }
    } catch {
      showToast({ title: 'Error', message: 'Failed to process introduction response.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEndorseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endorseModalTarget) return;

    setActionLoading(endorseModalTarget.id);
    try {
      const res = await fetch(`/api/v1/introductions/${endorseModalTarget.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'INTERMEDIARY_ACCEPT',
          endorsementNote: endorsementText.trim(),
        }),
      });

      if (res.ok) {
        showToast({
          title: 'Introduction Endorsed & Forwarded',
          message: `Your attested endorsement and intro request has been delivered to ${endorseModalTarget.targetProfile.displayName}.`,
          type: 'success',
        });
        setEndorseModalTarget(null);
        await fetchIntroductions();
      }
    } catch {
      showToast({ title: 'Error', message: 'Could not forward introduction.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // Categorization Logic for Sent, Active, Pending
  const pendingList = useMemo(() => {
    return introductions.filter((intro) => {
      const isIntermediary = intro.intermediary.id === user?.id;
      const isTarget = intro.targetProfile.id === user?.profile?.id;
      return (
        (isTarget && (intro.status === 'SENT_TO_TARGET' || intro.status === 'PENDING_INTERMEDIARY')) ||
        (isIntermediary && intro.status === 'PENDING_INTERMEDIARY')
      );
    });
  }, [introductions, user]);

  const activeList = useMemo(() => {
    return introductions.filter((intro) => intro.status === 'ACCEPTED_BY_TARGET');
  }, [introductions]);

  const sentList = useMemo(() => {
    return introductions.filter((intro) => intro.requester.id === user?.id);
  }, [introductions, user]);

  // Auto-switch to SENT if user has no pending inbound items but has sent introductions
  useEffect(() => {
    if (!loading && pendingList.length === 0 && sentList.length > 0 && activeTab === 'PENDING') {
      setActiveTab('SENT');
    }
  }, [loading, pendingList.length, sentList.length]);

  const displayedList =
    activeTab === 'PENDING'
      ? pendingList
      : activeTab === 'ACTIVE'
      ? activeList
      : activeTab === 'SENT'
      ? sentList
      : introductions;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary flex items-center space-x-1.5">
            <Network className="w-3.5 h-3.5" />
            <span>Mutual Trust Protocol</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-navy mt-1 tracking-tight">Warm Introductions Hub</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Peer-brokered introductions, institutional endorsements, and facilitated warm deal channels.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <Link
            to="/app/connections"
            className="px-3.5 sm:px-4 py-2 bg-surface hover:bg-surface-muted text-navy text-xs font-bold rounded-xl border border-border transition-all flex items-center space-x-1.5"
          >
            <span>Connections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/app/search"
            className="px-3.5 sm:px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Find Contacts</span>
          </Link>
        </div>
      </div>

      {/* KPI Status Strip: Active, Pending Actions, Sent */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          type="button"
          onClick={() => setActiveTab('PENDING')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'PENDING'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
              : 'bg-surface border-border hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
              <Inbox className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Action Needed</span>
            </span>
            {pendingList.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-navy mt-1.5">{pendingList.length}</div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Introductions awaiting your endorsement or acceptance
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'ACTIVE'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/40 shadow-xs'
              : 'bg-surface border-border hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active & Connected</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Live Channels
            </span>
          </div>
          <div className="text-2xl font-black text-navy mt-1.5">{activeList.length}</div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Bridges where 1st-degree connection was established
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SENT')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'SENT'
              ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-400/40 shadow-xs'
              : 'bg-surface border-border hover:border-sky-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 flex items-center space-x-1.5">
              <Send className="w-3.5 h-3.5 text-sky-600" />
              <span>Sent Requests</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
              Dispatched
            </span>
          </div>
          <div className="text-2xl font-black text-navy mt-1.5">{sentList.length}</div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Introductions you requested mutual peers to broker
          </p>
        </button>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-2.5">
        <div className="flex items-center space-x-1 sm:space-x-2 bg-surface p-1 rounded-xl border border-border overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 sm:space-x-2 transition-all shrink-0 ${
              activeTab === 'PENDING'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <span>⏳ Pending</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'PENDING'
                  ? 'bg-amber-400 text-black'
                  : pendingList.length > 0
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-surface-muted text-text-muted'
              }`}
            >
              {pendingList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 sm:space-x-2 transition-all shrink-0 ${
              activeTab === 'ACTIVE'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <span>🤝 Active</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'ACTIVE' ? 'bg-white/20 text-white' : 'bg-surface-muted text-text-muted'
              }`}
            >
              {activeList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SENT')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 sm:space-x-2 transition-all shrink-0 ${
              activeTab === 'SENT'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <span>📤 Sent</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'SENT' ? 'bg-white/20 text-white' : 'bg-surface-muted text-text-muted'
              }`}
            >
              {sentList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 transition-all shrink-0 ${
              activeTab === 'ALL'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <span>All ({introductions.length})</span>
          </button>
        </div>

        <div className="text-xs text-text-muted">
          Showing: <strong className="text-navy">{displayedList.length}</strong> record(s)
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-xs text-text-muted">
          Loading warm introductions...
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-muted text-text-muted mx-auto flex items-center justify-center">
            <Network className="w-6 h-6 opacity-60" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy">
              {activeTab === 'PENDING'
                ? 'No Pending Actions'
                : activeTab === 'ACTIVE'
                ? 'No Active Bridges Yet'
                : activeTab === 'SENT'
                ? 'No Sent Introductions'
                : 'No Introductions Found'}
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto mt-1">
              {activeTab === 'PENDING'
                ? 'You have addressed all warm introductions awaiting your review or endorsement.'
                : activeTab === 'ACTIVE'
                ? 'When an introduction is accepted by the recipient, it establishes an active 1st-degree connection.'
                : activeTab === 'SENT'
                ? 'Introductions you request mutual connectors to facilitate will be tracked here.'
                : 'Warm introductions allow mutual connections to vouch for and broker conversations.'}
            </p>
          </div>
          {activeTab === 'SENT' && (
            <Link
              to="/app/search"
              className="mt-3 inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Discover Contacts to Introduce</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedList.map((intro) => {
            const isIntermediary = intro.intermediary.id === user?.id;
            const isTarget = intro.targetProfile.id === user?.profile?.id;
            const isRequester = intro.requester.id === user?.id;

            const requesterName = intro.requester.profile?.displayName || intro.requester.email;
            const intermediaryName = intro.intermediary.profile?.displayName || intro.intermediary.email;
            const targetName = intro.targetProfile.displayName;

            return (
              <div
                key={intro.id}
                className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs hover:border-border-focus transition-all space-y-4"
              >
                {/* 3-Party Route Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-navy flex-wrap">
                    <span className={isRequester ? 'text-primary font-black' : ''}>
                      {requesterName} {isRequester && '(You)'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                      isIntermediary ? 'bg-primary-soft text-primary border border-primary/20' : 'bg-surface-muted text-navy'
                    }`}>
                      {intermediaryName} (Bridge) {isIntermediary && '(You)'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                    <span className={isTarget ? 'text-primary font-black' : ''}>
                      {targetName} {isTarget && '(You)'}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto uppercase tracking-wider ${
                      intro.status === 'ACCEPTED_BY_TARGET'
                        ? 'bg-success/10 text-success border border-success/20'
                        : intro.status === 'PENDING_INTERMEDIARY'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : intro.status === 'SENT_TO_TARGET'
                        ? 'bg-primary-soft text-primary border border-primary/20'
                        : 'bg-surface-muted text-text-muted'
                    }`}
                  >
                    {intro.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Purpose and Endorsement Content */}
                <div className="p-3.5 bg-surface-muted rounded-xl border border-border/50 text-xs text-navy space-y-2">
                  <div>
                    <span className="font-bold text-text-muted block text-[11px] uppercase tracking-wider mb-0.5">
                      Mutual Business Proposition:
                    </span>
                    <p className="italic leading-relaxed">
                      "{intro.businessReason?.split('\n\n[Attested Endorsement')[0] || intro.businessReason}"
                    </p>
                  </div>

                  {/* Render Attested Endorsement Banner if present */}
                  {intro.businessReason?.includes('[Attested Endorsement') && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-950 shadow-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold flex items-center space-x-1 text-emerald-900">
                          <span>Attested Intermediary Endorsement</span>
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <p className="mt-0.5 text-emerald-800 italic">
                          {intro.businessReason.substring(intro.businessReason.indexOf('[Attested Endorsement'))}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ================= ACTIONS TO TAKE FROM THEIR END ================= */}
                <div className="pt-2 flex flex-col gap-3">
                  <div className="text-[11px] text-text-muted flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Dispatched on {new Date(intro.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Case 1: You are Intermediary and bridge is PENDING_INTERMEDIARY */}
                  {isIntermediary && intro.status === 'PENDING_INTERMEDIARY' && (
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-amber-950 block flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Action Required from You (Bridge Intermediary)</span>
                        </span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          {requesterName} has asked you to broker an intro to {targetName}. Choose whether to attest & forward or decline.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          disabled={actionLoading === intro.id}
                          onClick={() => handleAction(intro.id, 'INTERMEDIARY_REJECT')}
                          className="px-3.5 py-1.5 border border-border hover:bg-surface-muted text-text-muted text-xs font-semibold rounded-xl bg-white"
                        >
                          Decline to Bridge
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === intro.id}
                          onClick={() => setEndorseModalTarget(intro)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Attest & Forward</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Case 2: You are Target and bridge is SENT_TO_TARGET */}
                  {isTarget && intro.status === 'SENT_TO_TARGET' && (
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-emerald-950 block flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Action Required from You (Recipient Decision Maker)</span>
                        </span>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Endorsed and introduced by mutual contact {intermediaryName}. Accept to connect directly or decline.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={actionLoading === intro.id}
                          onClick={() => handleAction(intro.id, 'TARGET_DECLINE')}
                          className="px-3 py-1.5 border border-border hover:bg-surface-muted text-text-muted text-xs font-semibold rounded-xl bg-white"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === intro.id}
                          onClick={() => {
                            setTargetAcceptModalIntro(intro);
                            setTargetResponseNote(`Glad to connect through ${intermediaryName}. Looking forward to discussing synergies.`);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-surface-muted text-navy text-xs font-bold rounded-xl border border-border flex items-center space-x-1"
                        >
                          <span>💬 Reply Note</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === intro.id}
                          onClick={() => handleAction(intro.id, 'TARGET_ACCEPT')}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept & Connect Directly</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Case 2b: You are Target and bridge is PENDING_INTERMEDIARY */}
                  {isTarget && intro.status === 'PENDING_INTERMEDIARY' && (
                    <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-sky-950 block flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>Incoming Warm Intro (Awaiting Endorsement by {intermediaryName})</span>
                        </span>
                        <p className="text-[11px] text-sky-800 mt-0.5">
                          {requesterName} requested {intermediaryName} to introduce them. You can wait for the attestation or connect directly right now.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={actionLoading === intro.id}
                          onClick={() => handleAction(intro.id, 'TARGET_DECLINE')}
                          className="px-3 py-1.5 border border-border hover:bg-surface-muted text-text-muted text-xs font-semibold rounded-xl bg-white"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading === intro.id}
                          onClick={() => handleAction(intro.id, 'TARGET_ACCEPT')}
                          className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1"
                        >
                          <Handshake className="w-3.5 h-3.5" />
                          <span>Direct Connect (Skip Wait)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Case 3: Completed / Active Bridge (ACCEPTED_BY_TARGET) */}
                  {intro.status === 'ACCEPTED_BY_TARGET' && (
                    <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          🤝
                        </div>
                        <div>
                          <span className="text-xs font-bold text-emerald-950 block">
                            Active Direct Bridge Established
                          </span>
                          <span className="text-[11px] text-emerald-800">
                            Facilitated by {intermediaryName}. Mutual direct connection and messaging active.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {isIntermediary && !steppedAsideIds.includes(intro.id) && (
                          <button
                            type="button"
                            onClick={() => handleStepAside(intro.id)}
                            className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold shadow-xs transition-colors"
                            title="Gracefully hand over channel to parties and claim +5 Facilitator Reputation"
                          >
                            Step Aside & Claim Rep (+5)
                          </button>
                        )}
                        {isIntermediary && steppedAsideIds.includes(intro.id) && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-[10px] font-bold">
                            ✓ Handed Over (+5 Rep)
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const partnerName = isRequester
                              ? intro.targetProfile.displayName
                              : (intro.requester.profile?.displayName || intro.requester.email);
                            navigate(`/app/messages?name=${encodeURIComponent(partnerName)}`);
                          }}
                          className="px-3.5 py-1.5 bg-navy hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Chat</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Case 4: You are Requester (Sent list progress status) */}
                  {isRequester && intro.status !== 'ACCEPTED_BY_TARGET' && (
                    <div className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-navy">Current Status:</span>
                        <span className="text-text-muted">
                          {intro.status === 'PENDING_INTERMEDIARY'
                            ? `Awaiting endorsement review by ${intermediaryName}`
                            : `Endorsed by ${intermediaryName} & awaiting response from ${targetName}`}
                        </span>
                      </div>
                      <span className="text-[11px] text-primary font-bold">
                        {intro.status === 'PENDING_INTERMEDIARY' ? 'Stage 1 of 2' : 'Stage 2 of 2'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attested Endorsement Drawer Modal */}
      {endorseModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy">Attest & Forward Introduction</h3>
                  <p className="text-[11px] text-text-muted">
                    Vouch for {endorseModalTarget.requester.profile?.displayName || 'the counterparty'} to{' '}
                    {endorseModalTarget.targetProfile.displayName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEndorseModalTarget(null)}
                className="text-text-muted hover:text-navy p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEndorseSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-navy flex items-center justify-between">
                  <span>Attested Endorsement Statement</span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                    Institutional Trust Badge
                  </span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={endorsementText}
                  onChange={(e) => setEndorsementText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-border bg-surface-muted focus:bg-surface focus:outline-hidden focus:ring-1 focus:ring-primary text-navy"
                  placeholder="Provide your personal endorsement, mutual past engagements, or reasons why this bridge should be established..."
                />
                <p className="text-[10px] text-text-muted">
                  This note will be permanently attested to the recipient with your institutional reputation badge.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEndorseModalTarget(null)}
                  className="px-4 py-2 border border-border text-xs font-bold text-text-muted hover:bg-surface-muted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === endorseModalTarget.id || !endorsementText.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{actionLoading === endorseModalTarget.id ? 'Attesting...' : 'Attest & Forward Bridge'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target Executive Response & Direct Connect Modal */}
      {targetAcceptModalIntro && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2 text-navy">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold">Accept Introduction & Establish Direct Bridge</h3>
              </div>
              <button
                type="button"
                onClick={() => setTargetAcceptModalIntro(null)}
                className="text-text-muted hover:text-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
              <span className="font-bold block">✓ Mutual Connection & Deal Room Activation</span>
              <p className="text-[11px] text-emerald-800">
                Accepting this introduction from <strong>{targetAcceptModalIntro.requester.profile?.displayName || targetAcceptModalIntro.requester.email}</strong> (facilitated by {targetAcceptModalIntro.intermediary.profile?.displayName || 'mutual connector'}) will instantly establish a verified 1st-degree connection between both of your profiles and open a private collaboration channel.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-navy block">
                Personal Response / Counter Note (Optional):
              </label>
              <textarea
                value={targetResponseNote}
                onChange={(e) => setTargetResponseNote(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Add a greeting, propose an introductory meeting time, or share initial mutual topics..."
                className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-text-muted text-right block">
                {targetResponseNote.length} / 300 characters
              </span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setTargetAcceptModalIntro(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-text-muted hover:bg-surface-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading === targetAcceptModalIntro.id}
                onClick={() => handleAction(targetAcceptModalIntro.id, 'TARGET_ACCEPT', targetResponseNote)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Connect Directly</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
