import React from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Send,
  Building2,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

export interface WhyThisMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
  onOpenConnect?: (candidate: any) => void;
  onOpenDossier?: (companyId: string) => void;
  onOpenProposal?: (target: any) => void;
}

export const WhyThisMatchModal: React.FC<WhyThisMatchModalProps> = ({
  isOpen,
  onClose,
  match,
  onOpenConnect,
  onOpenDossier,
  onOpenProposal,
}) => {
  if (!isOpen || !match) return null;

  const profile = match.profile || {};
  const transparency = match.laymanTransparency || {};
  const criteria = transparency.criteriaBreakdown || [];
  const nonMatchFactors = transparency.nonMatchOrBroadenedFactors || [];

  const score = match.score || 70;
  const symmetricalFit = match.symmetricalFitScore || 70;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-8 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-navy flex items-center space-x-2">
                <span>Why am I seeing this Decision-Maker?</span>
              </h2>
              <p className="text-xs text-text-muted">
                100% Layman-Friendly Match &amp; Symmetry Transparency
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Candidate Card */}
        <div className="p-3.5 sm:p-4 bg-bg rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-black text-white text-sm font-black flex items-center justify-center shrink-0 shadow-xs">
              {profile.displayName?.[0] || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-bold text-navy truncate">{profile.displayName}</h3>
                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                  <span>{profile.verificationStatus || 'Verified'}</span>
                </span>
                {match.isRelaxedMatch && (
                  <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    🔄 Relaxed Alternative
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-800 font-semibold truncate pt-0.5">
                {profile.currentTitle} &bull; <span className="text-black font-extrabold">{profile.companyName || profile.company?.name || 'Enterprise'}</span>
              </p>
              <p className="text-[11px] text-text-muted flex items-center space-x-1 pt-0.5">
                <MapPin className="w-3 h-3 text-text-muted" />
                <span>{profile.city || profile.company?.headquartersCity || 'Regional'}, {profile.countryCode || 'IN'}</span>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
            <div className="flex items-center space-x-1.5">
              <span className={`px-2 py-0.5 rounded-full text-xs font-black shadow-xs ${
                score >= 80 ? 'bg-emerald-700 text-white' : score >= 60 ? 'bg-indigo-700 text-white' : 'bg-neutral-800 text-white'
              }`}>
                {score}/100 Match
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-900 border border-amber-400">
                {symmetricalFit}% ⚡ Symmetry
              </span>
            </div>
            <span className="text-[10px] text-text-muted font-semibold">
              {score >= 80 ? '⭐ Top Recommendation' : score >= 60 ? '⚡ Strong Potential' : 'Directory Profile'}
            </span>
          </div>
        </div>

        {/* Layman Executive Summary Card */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/5 border border-amber-200/90 rounded-xl space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-amber-950 font-bold text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{transparency.headline || `${score}% Match Overview`}</span>
          </div>
          <p className="text-neutral-900 leading-relaxed font-medium">
            {transparency.summary || match.explanation}
          </p>
          {transparency.whyConnectRationale && (
            <div className="pt-2 border-t border-amber-200/60 mt-2">
              <span className="font-extrabold text-[10.5px] uppercase tracking-wider text-amber-900 block mb-0.5">
                Why Connect Now?
              </span>
              <p className="text-neutral-800 text-[11.5px] leading-relaxed">
                {transparency.whyConnectRationale}
              </p>
            </div>
          )}
        </div>

        {/* Non-Match / Broadened Honest Notice if applicable */}
        {nonMatchFactors.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1.5 text-xs text-amber-950 animate-in fade-in">
            <div className="flex items-center space-x-1.5 font-bold text-amber-900">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>Transparent Match Notes (Why this is not 100%):</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900/90 pl-1 font-medium">
              {nonMatchFactors.map((factor: string, idx: number) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>
        )}

        {/* What Matched Breakdown Criteria List */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold text-navy flex items-center space-x-1.5 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Detailed Match Transparency Breakdown</span>
          </h4>

          <div className="space-y-2 text-xs">
            {criteria.map((crit: any, idx: number) => {
              const isExact = crit.matchStatus === 'EXACT_MATCH';
              const isRelaxed = crit.matchStatus === 'RELAXED_EXPANSION';
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isExact
                      ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                      : isRelaxed
                      ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                      : 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                    <span className="font-extrabold text-navy text-xs">
                      {crit.label}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                        isExact
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : isRelaxed
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}
                    >
                      {isExact ? '✅ 100% Exact Match' : isRelaxed ? '🔄 Graceful Fallback' : 'ℹ️ Related Coverage'}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-neutral-800 font-medium leading-relaxed pt-0.5">
                    {crit.laymanNote}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[10.5px] text-text-muted border-t border-border/40 mt-1.5">
                    <span>
                      <strong>Your Search:</strong> <span className="text-neutral-800">{crit.userTarget}</span>
                    </span>
                    <span className="text-neutral-400">&bull;</span>
                    <span>
                      <strong>Found Profile:</strong> <span className="text-neutral-800 font-bold">{crit.candidateValue}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Math in Plain English */}
        {transparency.scoreBreakdownExplanation && (
          <div className="p-3 bg-bg rounded-xl border border-border text-[11px] text-text-muted space-y-1">
            <span className="font-bold text-navy flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span>Score Calculation Logic (Plain English):</span>
            </span>
            <p className="text-neutral-700 leading-relaxed font-medium">
              {transparency.scoreBreakdownExplanation}
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-bold text-neutral-700 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            {profile.companyId && onOpenDossier && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDossier(profile.companyId);
                }}
                className="px-3 py-1.5 bg-surface border border-border hover:bg-surface-muted text-navy rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
                <span>Company Dossier</span>
              </button>
            )}

            {onOpenProposal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProposal({
                    recipientProfileId: profile.id,
                    companyName: profile.companyName || profile.company?.name || 'Target Enterprise',
                    executiveName: profile.displayName,
                    executiveTitle: profile.currentTitle,
                  });
                }}
                className="px-3 py-1.5 bg-surface border border-border hover:bg-surface-muted text-navy rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                <span>Proposal</span>
              </button>
            )}

            {onOpenConnect && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConnect(profile);
                }}
                className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Bridge</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
