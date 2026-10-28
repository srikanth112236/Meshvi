import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, Handshake,
  Target, ArrowRight, ShieldCheck, Search,
  TrendingUp, Award, Layers, Sparkles,
  Lock, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = (import.meta as any).env?.VITE_API_URL || 'https://meshvi.onrender.com/api/v1';

function api(path: string, token: string) {
  return fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
}

type DealRoomStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED_WON' | 'CLOSED_NOT_FIT' | 'PARKED';

interface Milestone {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
}

interface DealRoom {
  id: string;
  title: string;
  status: DealRoomStatus;
  initiatorUserId: string;
  partnerUserId: string;
  initiatorGoal?: string;
  partnerGoal?: string;
  ndaRequired?: boolean;
  closedOutcome?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_BADGES: Record<DealRoomStatus, { label: string; text: string; bg: string; border: string; dot: string }> = {
  ACTIVE:         { label: 'Active Pipeline', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  PAUSED:         { label: 'On Hold',         text: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  CLOSED_WON:     { label: 'Closed Won',      text: 'text-sky-700',     bg: 'bg-sky-50',     border: 'border-sky-200',     dot: 'bg-sky-500' },
  CLOSED_NOT_FIT: { label: 'Not a Fit',       text: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200',   dot: 'bg-slate-400' },
  PARKED:         { label: 'Parked',          text: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200',   dot: 'bg-slate-400' },
};

function progressPct(milestones: Milestone[]) {
  if (!milestones || milestones.length === 0) return 0;
  return Math.round((milestones.filter(m => m.isCompleted).length / milestones.length) * 100);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86310000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export const DealRoomsListPage: React.FC = () => {
  const { token } = useAuth() as any;
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<DealRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api('/deal-rooms', token);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setRooms(list);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = rooms.filter(r => {
    if (filter === 'ACTIVE') {
      if (r.status !== 'ACTIVE' && r.status !== 'PAUSED') return false;
    }
    if (filter === 'CLOSED') {
      if (!['CLOSED_WON', 'CLOSED_NOT_FIT', 'PARKED'].includes(r.status)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchGoal = (r.initiatorGoal || '').toLowerCase().includes(q) || (r.partnerGoal || '').toLowerCase().includes(q);
      if (!matchTitle && !matchGoal) return false;
    }
    return true;
  });

  const stats = {
    total: rooms.length,
    active: rooms.filter(r => r.status === 'ACTIVE' || r.status === 'PAUSED').length,
    won: rooms.filter(r => r.status === 'CLOSED_WON').length,
    totalMilestones: rooms.reduce((acc, r) => acc + (r.milestones?.length || 0), 0),
    completedMilestones: rooms.reduce((acc, r) => acc + (r.milestones?.filter(m => m.isCompleted).length || 0), 0),
  };

  const avgCompletion = stats.totalMilestones > 0
    ? Math.round((stats.completedMilestones / stats.totalMilestones) * 100)
    : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Handshake className="w-4 h-4" />
            <span>Meshvi Deal Room Hub & Collaborative Workspaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1 tracking-tight">
            Commercial Deal Rooms
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
            Dedicated bilateral execution workspaces for accepted connections. Set mutual partnership mandates, execute milestones, exchange verified credentials, and record deal outcomes.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <Link
            to="/app/connections"
            className="px-3.5 sm:px-4 py-2 bg-surface hover:bg-border text-navy text-xs font-bold rounded-xl border border-border transition-all flex items-center space-x-1.5 shadow-2xs"
          >
            <span>Connections</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/app/search"
            className="px-3.5 sm:px-4 py-2 bg-[#102A43] hover:bg-[#173B5E] text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>Find Partners</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border shadow-2xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-navy">{stats.total}</div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Deal Rooms</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border shadow-2xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{stats.active}</div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Active Collaborations</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border shadow-2xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-sky-700">{stats.won}</div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Deals Won / Closed</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border shadow-2xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-700">{avgCompletion}%</div>
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Milestone Velocity</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-2.5 rounded-2xl border border-border">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deal rooms by title, objectives, or keywords..."
            className="w-full bg-bg border border-border/80 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-navy placeholder:text-text-muted/60 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-bg p-1 rounded-xl border border-border shrink-0">
          {(['ALL', 'ACTIVE', 'CLOSED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filter === tab
                  ? 'bg-surface text-navy shadow-xs border border-border/60'
                  : 'text-text-muted hover:text-navy'
              }`}
            >
              {tab === 'ALL' ? `All (${stats.total})` : tab === 'ACTIVE' ? `Active (${stats.active})` : `Closed (${rooms.length - stats.active})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Deal Rooms Grid (Full-Width Responsive 2-Col) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-surface rounded-2xl border border-border animate-pulse p-6" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Handshake className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-navy text-base">No Deal Rooms Found</h3>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              {searchQuery ? 'No deal rooms matched your filter keyword.' : 'Accept an inbound connection request to automatically initialize a Meshvi Deal Room.'}
            </p>
          </div>
          <Link
            to="/app/connections"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#102A43] text-white font-bold rounded-xl text-xs hover:bg-[#173B5E] transition-colors"
          >
            <span>View Connections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((room) => {
            const pct = progressPct(room.milestones);
            const statusConfig = STATUS_BADGES[room.status] || STATUS_BADGES.ACTIVE;
            const completedCount = room.milestones?.filter((m) => m.isCompleted).length || 0;
            const totalCount = room.milestones?.length || 0;

            return (
              <div
                key={room.id}
                onClick={() => navigate(`/app/deal-rooms/${room.id}`)}
                className="bg-surface border border-border hover:border-primary/60 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                {/* Top Row: Status, NDA, Timing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
                        <span>{statusConfig.label}</span>
                      </span>

                      {room.closedOutcome && (
                        <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          {room.closedOutcome.replace(/_/g, ' ')}
                        </span>
                      )}

                      {room.ndaRequired && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Lock className="w-2.5 h-2.5 text-slate-500" />
                          <span>NDA</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-text-muted flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo(room.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-navy text-sm sm:text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {room.title}
                  </h3>
                </div>

                {/* Mutual Objective Preview */}
                <div className="bg-bg/80 border border-border/80 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <Target className="w-3 h-3 text-primary" />
                    <span>Executive Mandate</span>
                  </div>
                  <p className="text-text-muted line-clamp-2 leading-relaxed text-[11px]">
                    {room.initiatorGoal || room.partnerGoal || 'Mutual commercial objectives configured inside room.'}
                  </p>
                </div>

                {/* Bottom Row: Milestone Progress Bar & CTA */}
                <div className="space-y-2 pt-1 border-t border-border/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-navy flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>Milestones: {completedCount}/{totalCount} Completed</span>
                    </span>
                    <span className="font-extrabold text-navy font-mono">{pct}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 bg-bg rounded-full overflow-hidden border border-border/40">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-text-muted flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>MESHVI Verified Bridge</span>
                    </span>

                    <span className="text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DealRoomsListPage;
