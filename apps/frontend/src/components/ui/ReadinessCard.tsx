import React from 'react';
import { CheckCircle, Clock, Globe, Tag, MessageSquare, XCircle, Pause, Eye } from 'lucide-react';

export interface ReadinessData {
  status: 'OPEN' | 'SELECTIVE' | 'STEALTH' | 'PAUSED';
  activeSectors?: string | null;    // JSON array string
  activeGeographies?: string | null; // JSON array string
  partnershipTypes?: string | null;  // JSON array string
  notLookingFor?: string | null;     // JSON array string
  openMessage?: string | null;
  lastRespondedAt?: string | null;
  refreshedAt?: string | null;
}

interface ReadinessCardProps {
  readiness: ReadinessData | null;
  compact?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  OPEN: {
    label: 'Open to Introductions',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
    icon: CheckCircle,
  },
  SELECTIVE: {
    label: 'Selectively Open',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: Eye,
  },
  STEALTH: {
    label: 'Stealth Mode',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    icon: Eye,
  },
  PAUSED: {
    label: 'Paused',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Pause,
  },
};

function parseJson(val: string | null | undefined): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return [val]; }
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86310000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export const ReadinessCard: React.FC<ReadinessCardProps> = ({ readiness, compact = false, className = '' }) => {
  if (!readiness) {
    return (
      <div className={`rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-slate-300" />
        <span className="text-xs text-slate-500 font-medium">Readiness not set</span>
      </div>
    );
  }

  const config = STATUS_CONFIG[readiness.status] || STATUS_CONFIG.OPEN;
  const Icon = config.icon;
  const sectors = parseJson(readiness.activeSectors);
  const geos = parseJson(readiness.activeGeographies);
  const types = parseJson(readiness.partnershipTypes);
  const notFor = parseJson(readiness.notLookingFor);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${config.bg} ${config.border} ${config.color} ${className}`}>
        <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
        {config.label}
        {readiness.lastRespondedAt && (
          <span className="text-slate-400 font-normal">· {timeAgo(readiness.lastRespondedAt)}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 font-semibold text-sm ${config.color}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${config.dot} animate-pulse`} />
          <Icon size={14} />
          {config.label}
        </div>
        {readiness.lastRespondedAt && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={11} />
            Last responded {timeAgo(readiness.lastRespondedAt)}
          </div>
        )}
      </div>

      {/* Open Message */}
      {readiness.openMessage && (
        <div className="flex items-start gap-2 text-xs text-slate-700 bg-white/70 rounded-lg p-2.5">
          <MessageSquare size={12} className="mt-0.5 shrink-0 text-slate-400" />
          <span className="italic">"{readiness.openMessage}"</span>
        </div>
      )}

      {/* Tags Grid */}
      <div className="grid grid-cols-1 gap-2">
        {sectors.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium w-16 shrink-0">
              <Tag size={10} className="inline mr-1" />Focus:
            </span>
            {sectors.map((s) => (
              <span key={s} className="text-xs bg-white border border-slate-200 text-slate-700 rounded-full px-2 py-0.5 font-medium">{s}</span>
            ))}
          </div>
        )}
        {types.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium w-16 shrink-0">
              <CheckCircle size={10} className="inline mr-1" />Type:
            </span>
            {types.map((t) => (
              <span key={t} className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-2 py-0.5 font-medium">{t}</span>
            ))}
          </div>
        )}
        {geos.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium w-16 shrink-0">
              <Globe size={10} className="inline mr-1" />Active in:
            </span>
            {geos.map((g) => (
              <span key={g} className="text-xs bg-white border border-slate-200 text-slate-700 rounded-full px-2 py-0.5 font-medium">{g}</span>
            ))}
          </div>
        )}
        {notFor.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium w-16 shrink-0">
              <XCircle size={10} className="inline mr-1" />Not now:
            </span>
            {notFor.map((n) => (
              <span key={n} className="text-xs bg-white border border-red-100 text-red-600 rounded-full px-2 py-0.5 font-medium">{n}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadinessCard;
