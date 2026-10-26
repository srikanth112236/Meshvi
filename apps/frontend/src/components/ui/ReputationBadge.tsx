import React from 'react';
import { Award, Star, Target, Globe } from 'lucide-react';

export interface ReputationData {
  totalDeals: number;
  closedWonCount: number;
  averageRatingReceived: number;
  responsivenessScore: number;
  topCategories?: string | null;
  topGeographies?: string | null;
  lastComputedAt?: string;
}

interface ReputationBadgeProps {
  reputation: ReputationData | null;
  compact?: boolean;
  className?: string;
}

function parseJson(val: string | null | undefined): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  );
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({ reputation, compact = false, className = '' }) => {
  if (!reputation || reputation.totalDeals === 0) {
    if (compact) return null;
    return (
      <div className={`rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 text-center ${className}`}>
        No completed deals yet
      </div>
    );
  }

  const winRate = reputation.totalDeals > 0
    ? Math.round((reputation.closedWonCount / reputation.totalDeals) * 100)
    : 0;
  const categories = parseJson(reputation.topCategories);
  const geos = parseJson(reputation.topGeographies);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold ${className}`}>
        <Award size={11} className="text-amber-500" />
        <StarRating rating={reputation.averageRatingReceived} />
        <span className="text-amber-600 font-bold">{reputation.averageRatingReceived.toFixed(1)}</span>
        <span className="text-amber-500 font-normal">·</span>
        <span>{reputation.totalDeals} deal{reputation.totalDeals !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Award size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Partnership Track Record</p>
            <p className="text-xs text-slate-500">Verified by Meshvi-mediated deals</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <StarRating rating={reputation.averageRatingReceived} />
            <span className="text-base font-black text-amber-600 ml-1">
              {reputation.averageRatingReceived.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-slate-400">avg rating</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-lg border border-slate-100 p-2 text-center">
          <p className="text-lg font-black text-slate-800">{reputation.totalDeals}</p>
          <p className="text-xs text-slate-500 leading-tight">Total<br/>Deals</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-100 p-2 text-center">
          <p className="text-lg font-black text-emerald-600">{winRate}%</p>
          <p className="text-xs text-slate-500 leading-tight">Win<br/>Rate</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-100 p-2 text-center">
          <p className="text-lg font-black text-blue-600">{reputation.closedWonCount}</p>
          <p className="text-xs text-slate-500 leading-tight">Closed<br/>Won</p>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2">
          <Target size={12} className="text-slate-400 shrink-0" />
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <span key={c} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2 py-0.5 font-medium">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Geographies */}
      {geos.length > 0 && (
        <div className="flex items-center gap-2">
          <Globe size={12} className="text-slate-400 shrink-0" />
          <div className="flex flex-wrap gap-1">
            {geos.map((g) => (
              <span key={g} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 font-medium">{g}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationBadge;
