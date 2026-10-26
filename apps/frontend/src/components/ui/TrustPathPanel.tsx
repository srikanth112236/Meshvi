import React from 'react';
import { Users, ArrowRight, CheckCircle, Briefcase, Building2 } from 'lucide-react';

export interface TrustBridge {
  profileId: string;
  userId?: string;
  displayName: string;
  currentTitle?: string | null;
  company?: string | null;
  successfulIntros: number;
}

export interface TrustPathData {
  found: boolean;
  bridges: TrustBridge[];
  targetProfileId: string;
}

interface TrustPathPanelProps {
  trustPath: TrustPathData | null;
  loading?: boolean;
  onRequestIntro?: (bridgeProfileId: string, bridge: TrustBridge) => void;
  className?: string;
}

export const TrustPathPanel: React.FC<TrustPathPanelProps> = ({
  trustPath,
  loading = false,
  onRequestIntro,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`rounded-xl border border-slate-200 bg-slate-50 p-4 animate-pulse ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-slate-200 rounded" />
          <div className="w-32 h-3 bg-slate-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-12 bg-slate-200 rounded-lg" />
          <div className="h-12 bg-slate-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!trustPath || !trustPath.found || trustPath.bridges.length === 0) {
    return (
      <div className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Users size={14} />
          <span>No warm introduction path found yet.</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Build more connections to unlock warm introduction paths.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center">
          <Users size={14} className="text-sky-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-sky-900">Warm Introduction Path</p>
          <p className="text-xs text-sky-600">
            {trustPath.bridges.length} bridge{trustPath.bridges.length !== 1 ? 's' : ''} found — request a warm intro
          </p>
        </div>
      </div>

      {/* Trust Path Visual */}
      <div className="space-y-2">
        {trustPath.bridges.map((bridge) => (
          <div
            key={bridge.profileId}
            className="flex items-center gap-3 bg-white/90 rounded-lg border border-sky-100 p-3 hover:border-sky-300 transition-colors group"
          >
            {/* You → Bridge → Target visual */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
              <span className="font-medium text-slate-600">You</span>
              <ArrowRight size={10} />
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs border-2 border-sky-200">
                {bridge.displayName.charAt(0).toUpperCase()}
              </div>
              <ArrowRight size={10} />
              <span className="font-medium text-sky-700 text-xs">Target</span>
            </div>

            {/* Bridge info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-800 truncate">{bridge.displayName}</p>
                {bridge.successfulIntros > 0 && (
                  <span className="shrink-0 flex items-center gap-0.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle size={10} />
                    {bridge.successfulIntros} intro{bridge.successfulIntros !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                {bridge.currentTitle && (
                  <>
                    <Briefcase size={9} />
                    <span className="truncate">{bridge.currentTitle}</span>
                  </>
                )}
                {bridge.company && (
                  <>
                    <span>·</span>
                    <Building2 size={9} />
                    <span className="truncate">{bridge.company}</span>
                  </>
                )}
              </div>
            </div>

            {/* CTA */}
            {onRequestIntro && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestIntro(bridge.profileId, bridge);
                }}
                className="shrink-0 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 opacity-100 cursor-pointer"
                title={`Ask ${bridge.displayName} for a warm introduction`}
              >
                <span>Ask intro</span>
                <ArrowRight size={11} />
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-sky-600/70 text-center pt-1">
        Consent-gated · The intermediary must agree to facilitate
      </p>
    </div>
  );
};

export default TrustPathPanel;
