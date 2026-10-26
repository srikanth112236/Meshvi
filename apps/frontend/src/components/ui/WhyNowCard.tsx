import React from 'react';
import { Zap, Briefcase, TrendingUp, Newspaper, Users, Rocket, ExternalLink } from 'lucide-react';

export interface TriggerSignal {
  id: string;
  triggerType: 'NEWS' | 'HIRING_SIGNAL' | 'USER_DECLARED' | 'FUNDING_EVENT' | 'PRODUCT_LAUNCH' | 'EXPANSION_SIGNAL';
  headline: string;
  body?: string | null;
  sourceUrl?: string | null;
  relevanceScore: number;
  isVerified: boolean;
  createdAt: string;
}

interface WhyNowCardProps {
  triggers: TriggerSignal[];
  compact?: boolean;
  className?: string;
}

const TRIGGER_CONFIG = {
  NEWS: { label: 'News', icon: Newspaper, color: 'text-slate-600', bg: 'bg-slate-100' },
  HIRING_SIGNAL: { label: 'Hiring', icon: Users, color: 'text-blue-700', bg: 'bg-blue-100' },
  USER_DECLARED: { label: 'Self-Declared', icon: Briefcase, color: 'text-emerald-700', bg: 'bg-emerald-100' },
  FUNDING_EVENT: { label: 'Funding', icon: TrendingUp, color: 'text-violet-700', bg: 'bg-violet-100' },
  PRODUCT_LAUNCH: { label: 'Product Launch', icon: Rocket, color: 'text-orange-700', bg: 'bg-orange-100' },
  EXPANSION_SIGNAL: { label: 'Expansion', icon: TrendingUp, color: 'text-sky-700', bg: 'bg-sky-100' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86310000);
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export const WhyNowCard: React.FC<WhyNowCardProps> = ({ triggers, compact = false, className = '' }) => {
  if (!triggers || triggers.length === 0) return null;

  if (compact) {
    const top = triggers[0];
    const config = TRIGGER_CONFIG[top.triggerType] || TRIGGER_CONFIG.NEWS;
    const Icon = config.icon;
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 ${config.bg} ${config.color} border border-current/10 ${className}`}>
        <Zap size={10} className="shrink-0" />
        <Icon size={10} className="shrink-0" />
        <span className="truncate max-w-[140px]">{top.headline}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 text-amber-800">
        <Zap size={14} className="fill-amber-500 text-amber-500" />
        <span className="text-sm font-bold tracking-tight">Why Now</span>
        <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-100 rounded-full px-2 py-0.5">
          {triggers.length} signal{triggers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Trigger list */}
      <div className="space-y-2">
        {triggers.slice(0, 3).map((trigger) => {
          const config = TRIGGER_CONFIG[trigger.triggerType] || TRIGGER_CONFIG.NEWS;
          const Icon = config.icon;
          return (
            <div key={trigger.id} className="flex items-start gap-3 bg-white/80 rounded-lg p-2.5 border border-amber-100">
              <div className={`mt-0.5 shrink-0 rounded-md p-1.5 ${config.bg}`}>
                <Icon size={12} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800 leading-snug">{trigger.headline}</p>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(trigger.createdAt)}</span>
                </div>
                {trigger.body && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{trigger.body}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium rounded-full px-1.5 py-0.5 ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                  {trigger.isVerified && (
                    <span className="text-xs text-emerald-600 font-medium">✓ Verified</span>
                  )}
                  {trigger.sourceUrl && (
                    <a
                      href={trigger.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 transition-colors"
                    >
                      Source <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhyNowCard;
