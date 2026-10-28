import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Mail,
  Check,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Forward,
  Calendar,
  CalendarClock,
  Bell,
  HelpCircle,
  MessageSquare,
  Undo2,
  Play,
  Pause,
  ListChecks,
  Building2,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DelegateToColleagueModal } from '../../components/ui/DelegateToColleagueModal';
import { DeclineReasonModal } from '../../components/ui/DeclineReasonModal';
import { IgnoreReasonModal } from '../../components/ui/IgnoreReasonModal';
import { AcceptAndConnectModal } from '../../components/ui/AcceptAndConnectModal';

interface RequestItem {
  id: string;
  businessReason: string;
  status: string;
  createdAt: string;
  followUpDate?: string;
  reminderNote?: string;
  delegatedFromUserId?: string;
  delegationNote?: string;
  clarificationQuestion?: string | null;
  clarificationAnswer?: string | null;
  remindedAt?: string | null;
  reminderCount?: number;
  daysRemaining?: number;
  isExpiringSoon?: boolean;
  canRemind?: boolean;
  canWithdraw?: boolean;
  isWithdrawableWithQuota?: boolean;
  requesterPhone?: string | null;
  recipientPhone?: string | null;
  partnerPhone?: string | null;
  delegatedToProfile?: {
    displayName: string;
    currentTitle?: string;
    function?: string;
  };
  requester?: {
    id: string;
    email: string;
    phoneNumber?: string | null;
    profile?: {
      displayName: string;
      headline: string | null;
      function: string | null;
      phoneNumber?: string | null;
      company?: { name: string } | null;
    } | null;
  };
  recipientProfile?: {
    displayName: string;
    headline: string | null;
    function: string | null;
    phoneNumber?: string | null;
    company?: { name: string } | null;
    user?: {
      email?: string;
      phoneNumber?: string | null;
    } | null;
  };
}

export const RequestsPage = () => {
  const { token } = useAuth();
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState<'incoming' | 'deferred' | 'outgoing'>('incoming');
  const [incoming, setIncoming] = useState<RequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Drawers & Modals State
  const [delegateModalTarget, setDelegateModalTarget] = useState<RequestItem | null>(null);
  const [declineModalTarget, setDeclineModalTarget] = useState<RequestItem | null>(null);
  const [ignoreModalTarget, setIgnoreModalTarget] = useState<RequestItem | null>(null);
  const [acceptModalTarget, setAcceptModalTarget] = useState<RequestItem | null>(null);
  const [followUpTarget, setFollowUpTarget] = useState<RequestItem | null>(null);

  // Wave 3 Pillar 4: Clarification Modal & Answering State
  const [clarifyModalTarget, setClarifyModalTarget] = useState<RequestItem | null>(null);
  const [clarifyQuestion, setClarifyQuestion] = useState('');
  const [submittingClarify, setSubmittingClarify] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const [answerModalTarget, setAnswerModalTarget] = useState<RequestItem | null>(null);
  const [clarifyAnswer, setClarifyAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Feature #27: Follow-up Drawer form fields
  const [followUpDateStr, setFollowUpDateStr] = useState('');
  const [followUpNote, setFollowUpNote] = useState('Reviewing procurement budget and alignment with department team.');
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/connections/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIncoming(data.data.incoming || []);
        setOutgoing(data.data.outgoing || []);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    setFollowUpDateStr(defaultDate.toISOString().split('T')[0]);
  }, [token]);

  const handleAction = async (id: string, action: 'accept' | 'decline' | 'cancel') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/connections/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast({
          title: action === 'accept' ? 'Connection Bridge Established' : 'Request Updated',
          message: action === 'accept' ? 'Direct communication channel opened.' : 'Status successfully recorded.',
          type: 'success',
        });
        await fetchRequests();
      }
    } catch {
      // Handled
    } finally {
      setActionLoading(null);
    }
  };

  // Feature #27: Schedule Follow-Up & Move to Deferred Queue
  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpTarget) return;

    setSavingFollowUp(true);
    try {
      await fetch(`/api/v1/connections/${followUpTarget.id}/follow-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          followUpDate: new Date(followUpDateStr).toISOString(),
          reminderNote: followUpNote,
        }),
      });

      showToast({
        title: 'Follow-Up Scheduled (Feature #27)',
        message: `Inbound bridge deferred to ${followUpDateStr}. Moved to Deferred Cadence Queue.`,
        type: 'info',
      });

      setIncoming((prev) =>
        prev.map((r) =>
          r.id === followUpTarget.id
            ? { ...r, status: 'FOLLOWUP', followUpDate: followUpDateStr, reminderNote: followUpNote }
            : r
        )
      );
      setFollowUpTarget(null);
    } catch {
      // Handled
    } finally {
      setSavingFollowUp(false);
    }
  };

  // Wave 3 Pillar 4: Gentle Cadence Follow-Up Reminder (Exactly 1 with cooldown)
  const handleRemind = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/connections/${id}/remind`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reminderNote: 'Gentle follow-up regarding partnership synergy.' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          title: 'Gentle Reminder Sent',
          message: 'Polite executive nudge dispatched. Cooldown is now active to prevent spam.',
          type: 'success',
        });
        await fetchRequests();
      } else {
        showToast({
          title: 'Reminder Blocked',
          message: data.error?.message || 'Unable to send reminder at this time.',
          type: 'error',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Network error sending reminder.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // Wave 3 Pillar 4: Graceful Request Withdrawal with Quota Restoration
  const handleWithdraw = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/connections/${id}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          title: 'Connection Bridge Withdrawn',
          message: data.data?.quotaRestored
            ? 'Bridge successfully withdrawn within 24h. 1 weekly quota slot was restored to your balance!'
            : 'Bridge successfully withdrawn.',
          type: 'success',
        });
        await fetchRequests();
      } else {
        showToast({
          title: 'Withdrawal Failed',
          message: data.error?.message || 'Could not withdraw bridge.',
          type: 'error',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Failed to process withdrawal.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // Wave 3 Pillar 4: Ask Clarification Before Accepting
  const handleClarifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarifyModalTarget || !clarifyQuestion.trim()) return;

    setSubmittingClarify(true);
    try {
      const res = await fetch(`/api/v1/connections/${clarifyModalTarget.id}/clarify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: clarifyQuestion }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          title: 'Clarification Question Sent',
          message: 'The requester has been notified to clarify their context before you accept or decline.',
          type: 'success',
        });
        setClarifyModalTarget(null);
        setClarifyQuestion('');
        await fetchRequests();
      } else {
        showToast({
          title: 'Failed to Send Clarification',
          message: data.error?.message || 'Could not send question.',
          type: 'error',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Network error sending question.', type: 'error' });
    } finally {
      setSubmittingClarify(false);
    }
  };

  // Wave 3 Pillar 4: Answer Clarification Request
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerModalTarget || !clarifyAnswer.trim()) return;

    setSubmittingAnswer(true);
    try {
      const res = await fetch(`/api/v1/connections/${answerModalTarget.id}/answer-clarification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answer: clarifyAnswer }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          title: 'Clarification Answer Dispatched',
          message: 'Your clarification has been delivered to the recipient.',
          type: 'success',
        });
        setAnswerModalTarget(null);
        setClarifyAnswer('');
        await fetchRequests();
      } else {
        showToast({
          title: 'Failed to Answer',
          message: data.error?.message || 'Could not dispatch answer.',
          type: 'error',
        });
      }
    } catch {
      showToast({ title: 'Error', message: 'Network error answering clarification.', type: 'error' });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const pendingIncoming = incoming.filter((r) => r.status === 'PENDING');
  const deferredIncoming = incoming.filter((r) => r.status === 'FOLLOWUP' || Boolean(r.followUpDate));
  const pendingOutgoing = outgoing.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-black flex items-center space-x-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>Two-Way Bridge Inquiries (#27, #28)</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy mt-1">Connection Requests & Cadence</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Review incoming requests with stated business intent, schedule follow-up reminders, or re-route to colleagues.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <Link
            to="/company/pipeline"
            className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Pipeline &rarr;</span>
          </Link>
          <Link
            to="/app/connections"
            className="px-3.5 sm:px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            Active Connections &rarr;
          </Link>
        </div>
      </div>

      {/* Corporate Inbound Pipeline Notice Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-black text-navy uppercase tracking-wider">
              Corporate Inbound CRM Pipeline
            </h4>
            <p className="text-xs text-text-muted mt-0.5">
              Looking for inbound inquiries sent to your corporate brand or team? Manage company-wide triage, deal rooms, and SLAs in your Corporate Inbound Pipeline.
            </p>
          </div>
        </div>
        <Link
          to="/company/pipeline"
          className="px-3.5 sm:px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shrink-0 flex items-center space-x-1.5 shadow-xs"
        >
          <span>Open Pipeline</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 sm:space-x-2 border-b border-border pb-3 overflow-x-auto max-w-full">
        <button
          type="button"
          onClick={() => setActiveTab('incoming')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 sm:space-x-2 transition-all shrink-0 ${
            activeTab === 'incoming'
              ? 'bg-black text-white shadow-xs'
              : 'bg-surface-muted text-text-muted hover:text-navy'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Active Incoming ({pendingIncoming.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deferred')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 sm:space-x-2 transition-all shrink-0 ${
            activeTab === 'deferred'
              ? 'bg-black text-white shadow-xs'
              : 'bg-surface-muted text-text-muted hover:text-navy'
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Deferred Queue ({deferredIncoming.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outgoing')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 sm:space-x-2 transition-all shrink-0 ${
            activeTab === 'outgoing'
              ? 'bg-black text-white shadow-xs'
              : 'bg-surface-muted text-text-muted hover:text-navy'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Outgoing Sent ({pendingOutgoing.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-xs text-text-muted">Loading requests...</div>
      ) : activeTab === 'incoming' ? (
        pendingIncoming.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center text-xs text-text-muted">
            You have no pending incoming connection requests.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingIncoming.map((item) => {
              const name = item.requester?.profile?.displayName || item.requester?.email || 'Anonymous';
              const company = item.requester?.profile?.company?.name;
              const headline = item.requester?.profile?.headline || item.requester?.profile?.function;

              return (
                <div
                  key={item.id}
                  className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-black/30 transition-colors"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center">
                        {name[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-navy">{name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          {headline} {company ? `• ${company}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Feature #7: Smart Wrong-Contact Handover Banner */}
                    {item.delegationNote && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center space-x-1.5 text-emerald-900 font-extrabold text-[11px] uppercase tracking-wider">
                          <Forward className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Attested Internal Handover from Peer</span>
                        </div>
                        <p className="text-emerald-800 text-xs italic">
                          "{item.delegationNote}"
                        </p>
                      </div>
                    )}

                    {/* Wave 3 Pillar 4: Clarification Q&A Thread */}
                    {item.clarificationQuestion && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-amber-900 font-extrabold text-[11px] uppercase tracking-wider">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Clarification Inquiry (Pillar 4)</span>
                        </div>
                        <div className="text-amber-950">
                          <strong className="text-amber-900">Your Inquiry: </strong>
                          <span>"{item.clarificationQuestion}"</span>
                        </div>
                        {item.clarificationAnswer ? (
                          <div className="pt-1.5 text-emerald-950 border-t border-amber-200/60">
                            <strong className="text-emerald-900">Requester's Answer: </strong>
                            <span>"{item.clarificationAnswer}"</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-amber-700 italic">
                            Awaiting requester's clarifying response before final acceptance.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Authenticated 60s Voice Brief Interactive Waveform Player */}
                    {item.businessReason?.includes('Voice Memo:') && (
                      <div className="p-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center space-x-2.5">
                          <button
                            type="button"
                            onClick={() => setPlayingAudioId(playingAudioId === item.id ? null : item.id)}
                            className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 shadow-xs transition-colors shrink-0"
                          >
                            {playingAudioId === item.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                          </button>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-navy">Verified 60s Voice Brief</span>
                              <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-300">
                                🎙️ Spoken Memo
                              </span>
                            </div>
                            <span className="text-[10px] text-text-muted">
                              {playingAudioId === item.id ? '🔊 Playing executive pitch...' : 'Click to listen to authentic vocal pitch'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-0.5 h-5 px-2">
                          {[30, 60, 40, 85, 55, 95, 45, 100, 50, 75, 40, 60].map((h, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full transition-all duration-300 ${
                                playingAudioId === item.id ? 'bg-rose-600 animate-pulse' : 'bg-rose-300'
                              }`}
                              style={{ height: `${playingAudioId === item.id ? h : 30}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Pre-Meeting Mutual Agenda Contract Deliverables */}
                    {item.businessReason?.includes('Agenda Contract:') && (
                      <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                        <div className="text-[10.5px] font-bold text-navy flex items-center space-x-1">
                          <ListChecks className="w-3.5 h-3.5 text-neutral-800" />
                          <span>Pre-Meeting Agenda Deliverables Agreed:</span>
                        </div>
                        <p className="text-[11px] text-neutral-700 font-medium">
                          {item.businessReason.split('[Agenda Contract:')[1]?.split(']')[0]}
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-bg rounded-xl border border-border text-xs text-navy">
                      <strong className="text-black font-semibold">Stated Intent: </strong>
                      <span>"{item.businessReason}"</span>
                    </div>

                    {/* Feature: Verified Direct Phone Coordinate for Both Sides */}
                    {(() => {
                      const requesterPhone = item.requesterPhone || item.requester?.phoneNumber || item.requester?.profile?.phoneNumber;
                      if (!requesterPhone) return null;
                      return (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <Phone className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-emerald-900 uppercase tracking-wider">
                                Verified Direct Phone (Requester)
                              </div>
                              <div className="text-xs font-mono font-bold text-navy select-all">
                                {requesterPhone}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <a
                              href={`tel:${requesterPhone.replace(/\s+/g, '')}`}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1 shadow-2xs"
                              title="Call phone number"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(requesterPhone);
                                showToast({ title: 'Phone Copied', message: requesterPhone, type: 'info' });
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 text-navy border border-border rounded-lg text-[11px] font-bold transition-colors shadow-2xs"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-center space-x-1.5 text-[11px] text-text-muted">
                      <Clock className="w-3 h-3" />
                      <span>Sent on {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Utility: Clarification / Follow-up */}
                    {item.clarificationQuestion ? (
                      <span className="px-2.5 py-1.5 bg-neutral-100 text-text-muted text-[11px] font-semibold rounded-xl border border-neutral-200">
                        Clarification Pending
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setClarifyModalTarget(item);
                          setClarifyQuestion('');
                        }}
                        className="px-2.5 py-1.5 bg-surface hover:bg-bg text-text-muted hover:text-navy border border-border text-[11px] font-semibold rounded-xl transition-all flex items-center space-x-1"
                        title="Ask clarifying question before taking action"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Clarify</span>
                      </button>
                    )}

                    {/* Option 1: Ignore with reason */}
                    <button
                      type="button"
                      onClick={() => setIgnoreModalTarget(item)}
                      className="px-3 py-2 bg-surface hover:bg-neutral-100 text-neutral-600 hover:text-black border border-border text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
                      title="Archive or ignore this request with internal reason note"
                    >
                      <Pause className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Ignore</span>
                    </button>

                    {/* Option 2: Decline with reason */}
                    <button
                      type="button"
                      onClick={() => setDeclineModalTarget(item)}
                      className="px-3 py-2 border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
                      title="Decline with structured reason taxonomy"
                    >
                      <X className="w-3.5 h-3.5 text-rose-600" />
                      <span>Decline</span>
                    </button>

                    {/* Option 3: Accept & Connect (Direct or Route to Team Member) */}
                    <button
                      type="button"
                      disabled={actionLoading === item.id}
                      onClick={() => setAcceptModalTarget(item)}
                      className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                      title="Accept directly or assign to team member"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Accept & Connect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'deferred' ? (
        /* Feature #27: Deferred Cadence Queue */
        deferredIncoming.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center text-xs text-text-muted space-y-2">
            <CalendarClock className="w-8 h-8 text-text-muted mx-auto" />
            <p className="font-bold text-navy">No deferred requests in queue</p>
            <p>Click "Follow-Up Later" on any inbound request to stage it for a scheduled reminder date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deferredIncoming.map((item) => {
              const name = item.requester?.profile?.displayName || item.requester?.email || 'Anonymous';
              return (
                <div
                  key={item.id}
                  className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-900 text-white font-black text-xs flex items-center justify-center">
                        {name[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-navy">{name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            Deferred Follow-Up
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          {item.requester?.profile?.headline} &bull; {item.requester?.profile?.company?.name}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/60 text-xs text-purple-950 flex items-start space-x-2">
                      <Calendar className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Scheduled Reminder: {item.followUpDate || 'In 3 days'}</strong>
                        <span>Note: "{item.reminderNote || 'Awaiting internal department synchronization'}"</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-bg rounded-xl border border-border text-xs text-text-muted">
                      <span>Stated Intent: "{item.businessReason}"</span>
                    </div>

                    {/* Deferred Phone Coordinate */}
                    {(() => {
                      const phone = item.requesterPhone || item.requester?.phoneNumber || item.requester?.profile?.phoneNumber;
                      if (!phone) return null;
                      return (
                        <div className="flex items-center justify-between p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs">
                          <div className="flex items-center space-x-1.5 font-mono text-navy">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <strong>{phone}</strong>
                          </div>
                          <a
                            href={`tel:${phone.replace(/\s+/g, '')}`}
                            className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold"
                          >
                            Call
                          </a>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAction(item.id, 'accept')}
                      className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Accept Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeclineModalTarget(item)}
                      className="px-3 py-2 border border-border hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : outgoing.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center text-xs text-text-muted">
          You haven't sent any connection requests yet.
        </div>
      ) : (
        <div className="space-y-3">
          {outgoing.map((item) => {
            const targetName = item.recipientProfile?.displayName || 'Decision Maker';
            const company = item.recipientProfile?.company?.name;

            return (
              <div
                key={item.id}
                className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-black text-white font-bold text-xs flex items-center justify-center">
                      {targetName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="text-sm font-bold text-navy">{targetName}</h4>
                        {item.daysRemaining !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.isExpiringSoon
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                            }`}
                            title="14-day automatic stale request decay"
                          >
                            ⏳ {item.daysRemaining}d until decay
                          </span>
                        )}
                        {Boolean(item.reminderCount && item.reminderCount > 0) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            🔔 Gentle Reminder Sent
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">
                        {item.recipientProfile?.headline} {company ? `• ${company}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Wave 3 Pillar 4: Recipient Clarification Request */}
                  {item.clarificationQuestion && (
                    <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl text-xs space-y-2">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Recipient Requested Clarification Before Connecting</span>
                      </div>
                      <div className="text-amber-950">
                        <strong className="text-amber-900 block text-[11px] uppercase tracking-wider">Inquiry:</strong>
                        <p className="italic">"{item.clarificationQuestion}"</p>
                      </div>
                      {item.clarificationAnswer ? (
                        <div className="pt-1.5 border-t border-amber-200/80 text-emerald-950">
                          <strong className="text-emerald-900 text-[11px] uppercase tracking-wider block">Your Transmitted Answer:</strong>
                          <p>"{item.clarificationAnswer}"</p>
                        </div>
                      ) : (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAnswerModalTarget(item);
                              setClarifyAnswer('');
                            }}
                            className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Reply to Clarification &rarr;</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3 bg-bg rounded-xl border border-border text-xs text-navy">
                    <strong className="text-black font-semibold">Your Outreach Context: </strong>
                    <span>"{item.businessReason}"</span>
                  </div>

                  {/* Bilateral Phone Coordinates for Outgoing */}
                  {(() => {
                    const recipientPhone = item.recipientPhone || item.recipientProfile?.phoneNumber || item.recipientProfile?.user?.phoneNumber;
                    const myPhone = item.requesterPhone || item.requester?.phoneNumber;
                    if (!recipientPhone && !myPhone) return null;
                    return (
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                            <span>Bilateral Direct Phone Exchange</span>
                          </div>
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                            Both Sides Protected
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-navy">
                          {recipientPhone && (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] text-text-muted font-sans font-bold">Recipient Phone:</span>
                              <strong className="select-all">{recipientPhone}</strong>
                              <a
                                href={`tel:${recipientPhone.replace(/\s+/g, '')}`}
                                className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded text-[10px] font-sans font-bold transition-colors ml-1 shadow-2xs"
                              >
                                Call
                              </a>
                            </div>
                          )}
                          {myPhone && (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] text-text-muted font-sans font-bold">Your Transmitted Phone:</span>
                              <strong className="text-text-muted select-all">{myPhone}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center space-x-2 text-[11px] text-text-muted">
                    <span>Sent on {new Date(item.createdAt).toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span className="font-semibold text-amber-700">Awaiting Recipient Review</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Wave 3 Pillar 4: Gentle Follow-Up Reminder (Exactly 1 with cooldown) */}
                  <button
                    type="button"
                    disabled={actionLoading === item.id || !item.canRemind}
                    onClick={() => handleRemind(item.id)}
                    className={`px-3 py-2 border text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 ${
                      item.canRemind
                        ? 'bg-surface hover:bg-bg text-navy border-border'
                        : 'bg-neutral-100 text-text-muted border-neutral-200 opacity-60 cursor-not-allowed'
                    }`}
                    title={item.canRemind ? 'Send exactly 1 polite reminder' : 'Follow-up cooldown active'}
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item.canRemind ? 'Gentle Reminder' : 'Reminder Sent'}</span>
                  </button>

                  {/* Wave 3 Pillar 4: Withdraw Bridge with Quota Restoration */}
                  <button
                    type="button"
                    disabled={actionLoading === item.id}
                    onClick={() => handleWithdraw(item.id)}
                    className="px-3 py-2 border border-border hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
                    title={item.isWithdrawableWithQuota ? 'Withdraw within 24h to recover 1 quota slot' : 'Gracefully cancel outreach bridge'}
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                    {item.isWithdrawableWithQuota && (
                      <span className="text-[9.5px] font-black bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded border border-emerald-300">
                        +1 Quota
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature #27: Follow-Up Schedule Slide-Over Drawer */}
      {followUpTarget && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-md bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
              <div className="flex items-center space-x-2">
                <CalendarClock className="w-5 h-5 text-black" />
                <h3 className="text-sm font-extrabold text-navy">
                  Schedule Follow-Up Reminder (#27)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFollowUpTarget(null)}
                className="p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleFollowUp} className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-xs text-text-muted leading-relaxed">
                Defer this inbound bridge to your schedule queue. A notification reminder will trigger on the specified sunset date.
              </p>

              <div>
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Follow-Up Reminder Date
                </label>
                <input
                  type="date"
                  required
                  value={followUpDateStr}
                  onChange={(e) => setFollowUpDateStr(e.target.value)}
                  className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Internal Reminder Note
                </label>
                <textarea
                  rows={3}
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="e.g. Awaiting Q3 budget sign-off from finance director"
                  className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setFollowUpTarget(null)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFollowUp}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {savingFollowUp ? 'Staging...' : 'Stage in Deferred Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Corporate Delegation Slide-Over Drawer */}
      {delegateModalTarget && (
        <DelegateToColleagueModal
          isOpen={!!delegateModalTarget}
          onClose={() => setDelegateModalTarget(null)}
          connectionId={delegateModalTarget.id}
          requesterName={delegateModalTarget.requester?.profile?.displayName || 'Requester'}
          opportunitySummary={delegateModalTarget.businessReason}
          onSuccess={() => {
            fetchRequests();
            setDelegateModalTarget(null);
          }}
        />
      )}

      {/* Structured Decline Reason Slide-Over Drawer (Feature #28) */}
      {declineModalTarget && (
        <DeclineReasonModal
          isOpen={!!declineModalTarget}
          onClose={() => setDeclineModalTarget(null)}
          connectionId={declineModalTarget.id}
          requesterName={declineModalTarget.requester?.profile?.displayName || 'Requester'}
          onSuccess={() => {
            fetchRequests();
            setDeclineModalTarget(null);
          }}
        />
      )}

      {/* Wave 3 Pillar 4: Recipient Clarification Request Slide-Over Drawer */}
      {clarifyModalTarget && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-md bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-extrabold text-navy">
                    Ask Clarification (Pillar 4)
                  </h3>
                  <span className="text-[11px] text-text-muted">
                    To: {clarifyModalTarget.requester?.profile?.displayName || 'Requester'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClarifyModalTarget(null)}
                className="p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleClarifySubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <strong className="block text-navy font-bold mb-1">Their Connection Context:</strong>
                <p className="text-text-muted italic">"{clarifyModalTarget.businessReason}"</p>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                Rather than declining or accepting prematurely, ask the requester a clarifying question regarding project scope, department alignment, or commercial backing.
              </p>

              <div>
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Clarification Inquiry
                </label>
                <textarea
                  required
                  rows={4}
                  value={clarifyQuestion}
                  onChange={(e) => setClarifyQuestion(e.target.value)}
                  placeholder="e.g. Could you clarify your timeline and whether this has executive budget approval from your VP?"
                  className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setClarifyModalTarget(null)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClarify || !clarifyQuestion.trim()}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {submittingClarify ? 'Sending...' : 'Dispatch Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wave 3 Pillar 4: Requester Clarification Answer Slide-Over Drawer */}
      {answerModalTarget && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-md bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-extrabold text-navy">
                    Answer Clarification (Pillar 4)
                  </h3>
                  <span className="text-[11px] text-text-muted">
                    Recipient: {answerModalTarget.recipientProfile?.displayName || 'Decision Maker'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnswerModalTarget(null)}
                className="p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAnswerSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <strong className="block text-amber-900 font-bold">Recipient Question:</strong>
                <p className="italic">"{answerModalTarget.clarificationQuestion}"</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Your Clarifying Response (Max 300 chars)
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={300}
                  value={clarifyAnswer}
                  onChange={(e) => setClarifyAnswer(e.target.value)}
                  placeholder="Provide a concise, direct answer to unblock your connection bridge..."
                  className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
                />
                <span className="text-[10px] text-text-muted block text-right mt-1">
                  {clarifyAnswer.length} / 300 characters
                </span>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAnswerModalTarget(null)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAnswer || !clarifyAnswer.trim()}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {submittingAnswer ? 'Dispatching...' : 'Transmit Answer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Option 1 Modal: Ignore with Reason */}
      {ignoreModalTarget && (
        <IgnoreReasonModal
          isOpen={!!ignoreModalTarget}
          onClose={() => setIgnoreModalTarget(null)}
          connectionId={ignoreModalTarget.id}
          requesterName={
            ignoreModalTarget.requester?.profile?.displayName ||
            ignoreModalTarget.requester?.email ||
            'Requester'
          }
          onSuccess={fetchRequests}
        />
      )}

      {/* Option 3 Modal: Accept & Connect (Directly or Route to Team Member) */}
      {acceptModalTarget && (
        <AcceptAndConnectModal
          isOpen={!!acceptModalTarget}
          onClose={() => setAcceptModalTarget(null)}
          connectionId={acceptModalTarget.id}
          requester={
            acceptModalTarget.requester || {
              id: '',
              email: 'partner@domain.com',
            }
          }
          businessReason={acceptModalTarget.businessReason}
          onSuccess={fetchRequests}
        />
      )}
    </div>
  );
};
