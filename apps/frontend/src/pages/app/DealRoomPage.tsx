import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Circle, Clock, Flag,
  Lock, Plus, Target, Award, AlertTriangle,
  ArrowLeft, Users, MessageSquare, ShieldCheck,
  FileText, Download, CheckCircle2, Calendar,
  Sparkles, ExternalLink, X, Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = (import.meta as any).env?.VITE_API_URL || 'https://api.meshvi.org/api/v1';

function api(path: string, token: string, opts?: RequestInit) {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts?.headers || {}) },
  }).then((r) => r.json());
}

type DealRoomStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED_WON' | 'CLOSED_NOT_FIT' | 'PARKED';
type DealOutcomeType = 'EXPLORATORY_CALL' | 'DEMO_COMPLETED' | 'MOU_SIGNED' | 'DEAL_CLOSED' | 'NOT_A_FIT' | 'PARKED';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  assignedTo?: string;
}

interface DealRoom {
  id: string;
  title: string;
  status: DealRoomStatus;
  initiatorUserId: string;
  partnerUserId: string;
  initiatorGoal?: string;
  partnerGoal?: string;
  ndaRequired: boolean;
  closedAt?: string;
  closedOutcome?: DealOutcomeType;
  milestones: Milestone[];
  documents?: any[];
  outcome?: any;
  attributionEvents?: any[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<DealRoomStatus, { label: string; text: string; bg: string; border: string; dot: string }> = {
  ACTIVE:         { label: 'Active Pipeline', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  PAUSED:         { label: 'On Hold',         text: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  CLOSED_WON:     { label: 'Closed Won',      text: 'text-sky-700',     bg: 'bg-sky-50',     border: 'border-sky-200',     dot: 'bg-sky-500' },
  CLOSED_NOT_FIT: { label: 'Not a Fit',       text: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',    dot: 'bg-rose-400' },
  PARKED:         { label: 'Parked',          text: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200',   dot: 'bg-slate-400' },
};

const OUTCOME_OPTIONS: { value: DealOutcomeType; label: string; emoji: string }[] = [
  { value: 'DEAL_CLOSED',       label: 'Commercial Contract Executed', emoji: '🤝' },
  { value: 'MOU_SIGNED',        label: 'MOU / LOI Formally Executed',  emoji: '✍️' },
  { value: 'DEMO_COMPLETED',    label: 'Pilot Deployed / Tested',      emoji: '🖥️' },
  { value: 'EXPLORATORY_CALL',  label: 'Exploratory Call Complete',    emoji: '📞' },
  { value: 'NOT_A_FIT',         label: 'Not a Strategic Fit',          emoji: '❌' },
  { value: 'PARKED',            label: 'Park for Future Review',       emoji: '⏸️' },
];

function formatDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const DealRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth() as any;
  const navigate = useNavigate();

  const [room, setRoom] = useState<DealRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Phase 3: Mutual NDA State
  const [showMndaModal, setShowMndaModal] = useState(false);
  const [signerName, setSignerName] = useState(user?.profile?.displayName || '');
  const [legalEntity, setLegalEntity] = useState(user?.profile?.company?.name || 'Authorized Commercial Principal');
  const [isSigningMnda, setIsSigningMnda] = useState(false);
  const [mndaError, setMndaError] = useState('');

  // Milestone filters
  const [milestoneFilter, setMilestoneFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  // Milestone add form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDue, setMilestoneDue] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  // Goal editing
  const [editGoal, setEditGoal] = useState<'initiator' | 'partner' | null>(null);
  const [goalText, setGoalText] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  // Close & Reciprocal Outcome Dialog (Gaps 114, 119)
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closeOutcome, setCloseOutcome] = useState<DealOutcomeType>('DEAL_CLOSED');
  const [outcomeRating, setOutcomeRating] = useState<number>(5);
  const [outcomeDealValue, setOutcomeDealValue] = useState<string>('250000');
  const [outcomeCategory, setOutcomeCategory] = useState<string>('SUPPLIER_PROCUREMENT');
  const [outcomeFeedback, setOutcomeFeedback] = useState<string>(
    'Exceptional commercial execution, verified technical milestones delivered on schedule.'
  );
  const [closing, setClosing] = useState(false);

  const handleSignMnda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !legalEntity.trim()) {
      setMndaError('Please provide both your legal name and corporate entity.');
      return;
    }
    setIsSigningMnda(true);
    setMndaError('');
    try {
      const res = await api(`/deal-rooms/${id}/sign-mnda`, token, {
        method: 'POST',
        body: JSON.stringify({ signerName: signerName.trim(), legalEntity: legalEntity.trim() }),
      });
      if (res.success || res.dealRoom) {
        setShowMndaModal(false);
        load();
      } else {
        setMndaError(res.message || 'Failed to execute Mutual NDA');
      }
    } catch (err: any) {
      setMndaError(err.message || 'Execution error');
    } finally {
      setIsSigningMnda(false);
    }
  };

  const load = useCallback(async () => {
    if (!token || !id) return;
    try {
      const data = await api(`/deal-rooms/${id}`, token);
      const r = data?.data || data;
      if (r?.id) setRoom(r);
      else setError('Deal Room not found or access denied.');
    } catch {
      setError('Failed to load Deal Room.');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { load(); }, [load]);

  const toggleMilestone = async (milestoneId: string) => {
    if (!room || !token) return;
    await api(`/deal-rooms/${room.id}/milestones/${milestoneId}/toggle`, token, { method: 'PATCH' });
    load();
  };

  const addMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !token || !milestoneTitle.trim()) return;
    setAddingMilestone(true);
    await api(`/deal-rooms/${room.id}/milestones`, token, {
      method: 'POST',
      body: JSON.stringify({
        title: milestoneTitle.trim(),
        description: milestoneDesc.trim() || undefined,
        dueDate: milestoneDue || undefined,
      }),
    });
    setMilestoneTitle('');
    setMilestoneDesc('');
    setMilestoneDue('');
    setShowMilestoneForm(false);
    setAddingMilestone(false);
    load();
  };

  const saveGoal = async () => {
    if (!room || !token || !editGoal) return;
    setSavingGoal(true);
    const isInitiator = room.initiatorUserId === user?.id;
    const payload = isInitiator ? { initiatorGoal: goalText } : { partnerGoal: goalText };
    await api(`/deal-rooms/${room.id}`, token, { method: 'PATCH', body: JSON.stringify(payload) });
    setEditGoal(null);
    setSavingGoal(false);
    load();
  };

  const closeDealRoom = async () => {
    if (!room || !token) return;
    setClosing(true);
    try {
      await api(`/deal-rooms/${room.id}/outcome`, token, {
        method: 'POST',
        body: JSON.stringify({
          outcomeType: closeOutcome,
          rating: outcomeRating,
          dealValue: parseFloat(outcomeDealValue) || undefined,
          partnershipCategory: outcomeCategory,
          feedback: outcomeFeedback.trim() || undefined,
        }),
      });
      setShowCloseDialog(false);
      load();
    } catch {
      // Handled silently
    } finally {
      setClosing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-9 h-9 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !room) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-xl font-black text-navy">{error || 'Deal Room not found'}</h2>
        <p className="text-xs text-text-muted mt-1">This workspace may be private, archived, or you lack participant permissions.</p>
      </div>
      <Link
        to="/app/deal-rooms"
        className="inline-flex items-center space-x-2 px-4 py-2 bg-[#102A43] text-white text-xs font-bold rounded-xl"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Deal Rooms</span>
      </Link>
    </div>
  );

  const isInitiator = room.initiatorUserId === user?.id;
  const isClosed = ['CLOSED_WON', 'CLOSED_NOT_FIT', 'PARKED'].includes(room.status);
  const statusCfg = STATUS_CONFIG[room.status] || STATUS_CONFIG.ACTIVE;
  const milestones = room.milestones || [];
  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const totalCount = milestones.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredMilestones = milestones.filter((m) => {
    if (milestoneFilter === 'PENDING') return !m.isCompleted;
    if (milestoneFilter === 'COMPLETED') return m.isCompleted;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Link
            to="/app/deal-rooms"
            className="inline-flex items-center space-x-1.5 text-text-muted hover:text-navy font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Deal Rooms</span>
          </Link>
          <span className="text-text-muted/40 font-mono">/</span>
          <span className="text-navy font-mono text-[11px] truncate max-w-xs">
            ROOM-{room.id.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => navigate('/app/messages')}
            className="px-3.5 py-1.5 bg-surface hover:bg-border text-navy font-bold rounded-xl border border-border flex items-center space-x-1.5 shadow-2xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span>Chat Channel</span>
          </button>

          {!isClosed && (
            <button
              type="button"
              onClick={() => setShowCloseDialog(true)}
              className="px-3.5 py-1.5 bg-[#102A43] hover:bg-[#173B5E] text-white font-bold rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Conclude Deal</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Workspace Header Banner (Full Screen Width) */}
      <div className="bg-gradient-to-r from-[#102A43] via-[#173B5E] to-[#0B2034] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                <span className={`w-2 h-2 rounded-full ${statusCfg.dot} ${isClosed ? '' : 'animate-pulse'}`} />
                <span>{statusCfg.label}</span>
              </span>

              {room.closedOutcome && (
                <span className="px-2.5 py-1 bg-white/10 text-white rounded-full text-xs font-semibold backdrop-blur-xs border border-white/15">
                  Outcome: {room.closedOutcome.replace(/_/g, ' ')}
                </span>
              )}

              {room.ndaRequired && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-sky-500/20 text-sky-200 rounded-full text-xs font-semibold border border-sky-400/30">
                  <Lock className="w-3 h-3 text-sky-300" />
                  <span>Mutual NDA Secured</span>
                </span>
              )}
            </div>

            {/* Deal Room Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              {room.title}
            </h1>

            {/* Timestamps & Telemetry */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-300" />
                <span>Created {formatDate(room.createdAt)}</span>
              </span>
              {room.closedAt && (
                <span className="flex items-center space-x-1.5 text-emerald-300">
                  <Award className="w-3.5 h-3.5" />
                  <span>Closed {formatDate(room.closedAt)}</span>
                </span>
              )}
              <span className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last Updated {formatDate(room.updatedAt)}</span>
              </span>
            </div>
          </div>

          {/* Quick Progress Dial / Meter */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center space-x-4 min-w-[220px]">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-xl font-black text-white font-mono border border-white/20">
              {progress}%
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">Execution Velocity</div>
              <div className="text-xs text-sky-200 mt-0.5">
                {completedCount} of {totalCount} completed
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar Strip */}
        <div className="mt-6 pt-4 border-t border-white/15">
          <div className="h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT MAIN COLUMN (8 cols) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Mutual Strategic Mandates (My Goal vs Partner Goal) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card A: My Objective */}
            <div className="bg-surface rounded-2xl border border-border p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>{isInitiator ? 'My Organization Mandate' : 'Their Stated Mandate'}</span>
                </span>
                {isInitiator && editGoal !== 'initiator' && !isClosed && (
                  <button
                    type="button"
                    onClick={() => { setEditGoal('initiator'); setGoalText(room.initiatorGoal || ''); }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editGoal === 'initiator' ? (
                <div className="space-y-2">
                  <textarea
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    rows={3}
                    className="w-full text-xs font-medium text-navy bg-bg border border-border rounded-xl p-3 focus:outline-none focus:border-primary resize-none"
                    placeholder="Specify target deliverables, volume, SLA requirements..."
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={saveGoal}
                      disabled={savingGoal}
                      className="px-3 py-1.5 bg-[#102A43] text-white text-xs font-bold rounded-lg hover:bg-[#173B5E]"
                    >
                      {savingGoal ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditGoal(null)}
                      className="px-3 py-1.5 text-xs text-text-muted hover:text-navy"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-navy font-semibold leading-relaxed min-h-[50px] bg-bg/60 p-3 rounded-xl border border-border/50">
                  {room.initiatorGoal || (
                    <span className="text-text-muted italic">
                      {isInitiator ? 'Click Edit to declare your commercial target.' : 'Mandate pending declaration.'}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Card B: Partner Objective */}
            <div className="bg-surface rounded-2xl border border-border p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{!isInitiator ? 'My Organization Mandate' : 'Partner Stated Mandate'}</span>
                </span>
                {!isInitiator && editGoal !== 'partner' && !isClosed && (
                  <button
                    type="button"
                    onClick={() => { setEditGoal('partner'); setGoalText(room.partnerGoal || ''); }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editGoal === 'partner' ? (
                <div className="space-y-2">
                  <textarea
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    rows={3}
                    className="w-full text-xs font-medium text-navy bg-bg border border-border rounded-xl p-3 focus:outline-none focus:border-primary resize-none"
                    placeholder="Specify partner capabilities, delivery schedules, logistics..."
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={saveGoal}
                      disabled={savingGoal}
                      className="px-3 py-1.5 bg-[#102A43] text-white text-xs font-bold rounded-lg hover:bg-[#173B5E]"
                    >
                      {savingGoal ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditGoal(null)}
                      className="px-3 py-1.5 text-xs text-text-muted hover:text-navy"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-navy font-semibold leading-relaxed min-h-[50px] bg-bg/60 p-3 rounded-xl border border-border/50">
                  {room.partnerGoal || (
                    <span className="text-text-muted italic">
                      {!isInitiator ? 'Click Edit to declare your commercial target.' : 'Mandate pending declaration.'}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* 2. Interactive Milestone Pipeline Card */}
          <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
            {/* Header Strip */}
            <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-navy text-sm sm:text-base">
                  Milestone Execution Pipeline
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-bg border border-border text-navy">
                  {completedCount}/{totalCount} Done
                </span>
              </div>

              {/* Action & Filter Pills */}
              <div className="flex items-center space-x-2 shrink-0">
                <div className="flex items-center bg-bg p-0.5 rounded-xl border border-border text-[11px] font-bold">
                  {(['ALL', 'PENDING', 'COMPLETED'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setMilestoneFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        milestoneFilter === filter
                          ? 'bg-surface text-navy shadow-xs border border-border/60'
                          : 'text-text-muted hover:text-navy'
                      }`}
                    >
                      {filter === 'ALL' ? 'All' : filter === 'PENDING' ? 'Pending' : 'Done'}
                    </button>
                  ))}
                </div>

                {!isClosed && (
                  <button
                    type="button"
                    onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                    className="px-3 py-1.5 bg-primary-soft hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                )}
              </div>
            </div>

            {/* Inline Add Milestone Drawer/Form */}
            {showMilestoneForm && (
              <form onSubmit={addMilestone} className="p-4 bg-primary-soft/30 border-b border-primary/20 space-y-3">
                <div className="text-xs font-bold text-navy flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Define New Commercial Milestone</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    placeholder="Milestone title (e.g. Consignment audit)"
                    required
                    className="sm:col-span-2 bg-surface border border-border rounded-xl px-3 py-2 text-xs font-semibold text-navy focus:outline-none focus:border-primary"
                  />
                  <input
                    type="date"
                    value={milestoneDue}
                    onChange={(e) => setMilestoneDue(e.target.value)}
                    className="bg-surface border border-border rounded-xl px-3 py-2 text-xs font-semibold text-navy focus:outline-none focus:border-primary"
                  />
                </div>
                <input
                  type="text"
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Optional deliverables, audit parameters, or verification notes..."
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-navy focus:outline-none focus:border-primary"
                />
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    disabled={addingMilestone}
                    className="px-4 py-1.5 bg-[#102A43] hover:bg-[#173B5E] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    {addingMilestone ? 'Adding...' : 'Save Milestone'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMilestoneForm(false)}
                    className="px-3 py-1.5 text-xs text-text-muted hover:text-navy"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Milestone Items List */}
            <div className="divide-y divide-border/60">
              {filteredMilestones.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <Target className="w-8 h-8 text-text-muted/40 mx-auto" />
                  <p className="text-xs font-bold text-navy">No milestones in this view</p>
                  <p className="text-[11px] text-text-muted">Use the button above to add collaborative deliverables.</p>
                </div>
              ) : (
                filteredMilestones.map((m) => {
                  const isOverdue = !m.isCompleted && m.dueDate && new Date(m.dueDate) < new Date();

                  return (
                    <div
                      key={m.id}
                      className={`p-4 sm:p-5 flex items-start space-x-3.5 transition-colors ${
                        m.isCompleted ? 'bg-bg/40 opacity-75' : 'hover:bg-bg/60'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => !isClosed && toggleMilestone(m.id)}
                        disabled={isClosed}
                        className={`mt-0.5 shrink-0 transition-transform ${isClosed ? 'cursor-default' : 'hover:scale-110 active:scale-95'}`}
                      >
                        {m.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-primary transition-colors" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`text-xs sm:text-sm font-bold ${
                            m.isCompleted ? 'line-through text-text-muted' : 'text-navy'
                          }`}>
                            {m.title}
                          </span>

                          <div className="flex items-center space-x-2 text-[11px]">
                            {m.dueDate && (
                              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md font-medium ${
                                isOverdue
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                <Clock className="w-3 h-3" />
                                <span>Due {formatDate(m.dueDate)}</span>
                                {isOverdue && <span className="font-bold">· Overdue</span>}
                              </span>
                            )}

                            {m.completedAt && (
                              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Completed {formatDate(m.completedAt)}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {m.description && (
                          <p className="text-xs text-text-muted leading-relaxed">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Verified Document Vault & Artifact Exchange */}
          <div className="bg-surface rounded-2xl border border-border p-5 space-y-4 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-extrabold text-navy text-sm">
                  Document Vault & Compliance Artifacts
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  room.ndaRequired
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}
              >
                {room.ndaRequired ? 'Mutual NDA Executed' : 'Mutual NDA Gated'}
              </span>
            </div>

            {!room.ndaRequired && (
              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start space-x-2.5">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-amber-950 block">
                      Proprietary Disclosure Gated
                    </span>
                    <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                      Proprietary technical documentation, audit certifications, and financial disclosures remain locked until bilateral execution of the Meshvi Mutual NDA.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMndaModal(true)}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Execute Mutual NDA</span>
                </button>
              </div>
            )}

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all ${!room.ndaRequired ? 'filter blur-[2.5px] select-none pointer-events-none opacity-40' : ''}`}>
              <div className="p-3 bg-bg rounded-xl border border-border flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-navy text-xs truncate">Mutual_NDA_Standard_v2.pdf</div>
                    <div className="text-[10px] text-text-muted">{room.ndaRequired ? 'Cryptographically Executed' : 'Pending Execution'} • 184 KB</div>
                  </div>
                </div>
                <button type="button" className="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-navy transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 bg-bg rounded-xl border border-border flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-navy text-xs truncate">JAKIM_Halal_Certification_MY.pdf</div>
                    <div className="text-[10px] text-text-muted">Audit Approved • 420 KB</div>
                  </div>
                </div>
                <button type="button" className="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-navy transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Bilateral Outcome Card (If closed) */}
          {room.outcome && (
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-300/60 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-navy text-base">Recorded Deal Outcome & Rating</h3>
                    <p className="text-xs text-text-muted">Verified MESHVI bilateral closing transaction</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                  {room.closedOutcome?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {room.outcome.initiatorFeedback && (
                  <div className="bg-surface p-4 rounded-xl border border-border space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Initiator Assessment & Feedback
                    </span>
                    <p className="text-xs font-semibold text-navy italic">
                      "{room.outcome.initiatorFeedback}"
                    </p>
                  </div>
                )}

                {room.outcome.partnerFeedback && (
                  <div className="bg-surface p-4 rounded-xl border border-border space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Partner Assessment & Feedback
                    </span>
                    <p className="text-xs font-semibold text-navy italic">
                      "{room.outcome.partnerFeedback}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT INTELLIGENCE RAIL (4 cols) ================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* Partner Intelligence Card */}
          <div className="bg-surface rounded-2xl border border-border p-5 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-navy">
              <Users className="w-4 h-4 text-primary" />
              <span>Deal Room Collaborator</span>
            </div>

            <div className="p-3 bg-bg rounded-xl border border-border flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full bg-navy text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                P
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-navy text-sm truncate">Verified Commercial Partner</div>
                <div className="text-[11px] text-text-muted truncate">Director of Regional Procurement</div>
                <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-bold mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Tier-1 Verified Partner</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/app/messages')}
              className="w-full py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-hover transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Dedicated Chat</span>
            </button>
          </div>

          {/* Deal Telemetry & Governance */}
          <div className="bg-surface rounded-2xl border border-border p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-navy">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Governance & Security Protocol</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-text-muted">Mutual Secrecy Protocol</span>
                <span className="font-bold text-navy">{room.ndaRequired ? 'NDA Enforced' : 'Standard'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-text-muted">Anti-Spam Guarantee</span>
                <span className="font-bold text-emerald-700">Active</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="text-text-muted">Audit Log Integrity</span>
                <span className="font-bold text-navy font-mono">SHA-256</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-text-muted">Settlement Protocol</span>
                <span className="font-bold text-navy">Bilateral Consent</span>
              </div>
            </div>
          </div>

          {/* Evidence-Backed Attribution Ledger */}
          <div className="bg-surface rounded-2xl border border-border p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-navy">
                <Award className="w-4 h-4 text-primary" />
                <span>Attribution Ledger</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Immutable
              </span>
            </div>

            <p className="text-[11px] text-text-muted leading-relaxed">
              Cryptographically timestamped transaction milestones proving deal lineage, introductions, and compliance.
            </p>

            <div className="space-y-2.5 pt-1">
              {room.attributionEvents && room.attributionEvents.length > 0 ? (
                room.attributionEvents.map((evt: any) => (
                  <div key={evt.id} className="p-2.5 bg-bg border border-border/80 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-navy">
                        {evt.eventType.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">
                        {new Date(evt.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted flex items-center justify-between">
                      <span>Role: {evt.contributorRole}</span>
                      <span className="text-emerald-700 font-semibold font-mono">
                        Score: {(evt.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-bg rounded-xl border border-border/60 text-[11px] text-text-muted italic text-center">
                  Ledger active. Events record upon NDA signing and milestone completion.
                </div>
              )}
            </div>
          </div>

          {/* Fast Navigation Quick Links */}
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Quick Shortcuts
            </span>
            <Link
              to="/app/connections"
              className="flex items-center justify-between p-2 hover:bg-bg rounded-lg text-navy font-semibold transition-colors"
            >
              <span>View All Connections</span>
              <ExternalLink className="w-3 h-3 text-text-muted" />
            </Link>
            <Link
              to="/app/opportunities"
              className="flex items-center justify-between p-2 hover:bg-bg rounded-lg text-navy font-semibold transition-colors"
            >
              <span>Explore Tenders & RFPs</span>
              <ExternalLink className="w-3 h-3 text-text-muted" />
            </Link>
          </div>
        </div>
      </div>

      {/* Close Room Modal Dialog */}
      {showCloseDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-navy text-base">Conclude Deal Room</h3>
                  <p className="text-xs text-text-muted">Select verified closing state for reputation engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseDialog(false)}
                className="p-1 text-text-muted hover:text-navy rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-bold text-navy block mb-1.5">
                  Select Verified Closing State
                </label>
                <div className="space-y-1.5">
                  {OUTCOME_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center space-x-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        closeOutcome === opt.value
                          ? 'border-primary bg-primary-soft/40 shadow-2xs'
                          : 'border-border hover:border-border/80 bg-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name="outcome"
                        value={opt.value}
                        checked={closeOutcome === opt.value}
                        onChange={() => setCloseOutcome(opt.value)}
                        className="sr-only"
                      />
                      <span className="text-lg">{opt.emoji}</span>
                      <span className="text-xs font-bold text-navy">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reciprocal Rating Stars */}
              <div>
                <label className="text-xs font-bold text-navy block mb-1">
                  Reciprocal Counterparty Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setOutcomeRating(star)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        outcomeRating >= star ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-navy font-mono ml-2">
                    {outcomeRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Deal Value Band */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-navy block mb-1">
                    Executed Deal Value (USD)
                  </label>
                  <input
                    type="number"
                    value={outcomeDealValue}
                    onChange={(e) => setOutcomeDealValue(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-navy block mb-1">
                    Partnership Category
                  </label>
                  <select
                    value={outcomeCategory}
                    onChange={(e) => setOutcomeCategory(e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="SUPPLIER_PROCUREMENT">Supplier Procurement</option>
                    <option value="DISTRIBUTION">Regional Distribution</option>
                    <option value="JOINT_VENTURE">Joint Venture Alliance</option>
                    <option value="TECHNOLOGY_INTEGRATION">Technology Integration</option>
                  </select>
                </div>
              </div>

              {/* Feedback Review */}
              <div>
                <label className="text-[11px] font-bold text-navy block mb-1">
                  Qualitative Outcome & Performance Review
                </label>
                <textarea
                  rows={2}
                  value={outcomeFeedback}
                  onChange={(e) => setOutcomeFeedback(e.target.value)}
                  className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Attest to delivery timeline, commercial integrity, and partnership execution..."
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] text-emerald-900 flex items-start space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  This outcome generates a tamper-evident <strong>SHA-256 cryptographic hash</strong> stamped on the Meshvi Attribution Ledger to boost both counterparties' verified Reputation Score.
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={closeDealRoom}
                disabled={closing}
                className="flex-1 py-2.5 bg-[#102A43] hover:bg-[#173B5E] text-white font-bold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-60 flex items-center justify-center space-x-1.5"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>{closing ? 'Cryptographically Anchoring...' : 'Record Outcome & Stamp Ledger'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCloseDialog(false)}
                className="px-4 py-2.5 border border-border rounded-xl text-xs font-semibold text-text-muted hover:bg-bg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Mutual NDA Execution Modal */}
      {showMndaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-navy text-base">
                    Execute Mutual Non-Disclosure Agreement
                  </h3>
                  <p className="text-xs text-text-muted">
                    MESHVI Standard Bilateral Secrecy Protocol (v2.4)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMndaModal(false)}
                className="text-text-muted hover:text-navy p-1.5 rounded-lg hover:bg-bg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {mndaError && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger">
                {mndaError}
              </div>
            )}

            <div className="p-3.5 bg-bg border border-border rounded-xl text-xs text-text-muted space-y-2 max-h-48 overflow-y-auto leading-relaxed">
              <strong className="text-navy block font-bold">Confidentiality Stance & Scope</strong>
              <p>
                This Mutual Non-Disclosure Agreement ("Agreement") is executed between the undersigned commercial counterparties to protect proprietary information, distributor contracts, technical architectures, and financial terms exchanged within this Meshvi Deal Room.
              </p>
              <p>
                Each party agrees to maintain strict confidentiality, limit dissemination to authorized representatives on a need-to-know basis, and prohibit reverse-engineering or disclosure without prior written consent.
              </p>
              <p className="text-[10px] font-mono text-slate-500">
                Governing Jurisdiction: International Commercial Arbitration Forum &bull; Bilateral Attribution SHA-256
              </p>
            </div>

            <form onSubmit={handleSignMnda} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-navy text-[11px] uppercase tracking-wider block">
                    Authorized Signer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="e.g. Alexander Chen"
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-navy focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy text-[11px] uppercase tracking-wider block">
                    Represented Corporate Entity
                  </label>
                  <input
                    type="text"
                    required
                    value={legalEntity}
                    onChange={(e) => setLegalEntity(e.target.value)}
                    placeholder="e.g. Apex Industries Ltd"
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowMndaModal(false)}
                  className="px-4 py-2 border border-border text-xs font-semibold text-text-muted hover:text-navy rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSigningMnda}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSigningMnda ? 'Anchoring Signature...' : 'Cryptographically Sign & Execute'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealRoomPage;
