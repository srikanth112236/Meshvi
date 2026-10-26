import React from 'react';
import {
  X,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  Handshake,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateModal?: () => void;
}

export const PartnershipGuidelinesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenCreateModal,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-surface border border-border w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-surface-muted/40 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Handshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy flex items-center space-x-1.5">
                <span>Partnership Posting Standards</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                  AI Guardrail
                </span>
              </h3>
              <p className="text-[11px] text-text-muted">
                How to formulate bilateral commercial mandates on MESHVI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-navy hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs leading-relaxed"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Mission Callout */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-navy space-y-1">
            <div className="font-bold flex items-center space-x-1.5 text-primary text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pure B2B Commercial Intent</span>
            </div>
            <p className="text-[11px] text-text-muted">
              MESHVI is strictly a corporate negotiation room. Unlike social networks,
              our feed is reserved for bilateral business partnerships, joint ventures, OEM supply,
              and strategic alliances.
            </p>
          </div>

          {/* DO vs DONT Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Allowed Column */}
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>What to Post (Allowed)</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-emerald-900">
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Joint Ventures:</strong> Bilateral co-development, risk/equity share.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Distribution Alliances:</strong> Regional channel partners, cold-chain hubs.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>OEM & Sourcing:</strong> Recurring commercial volume ($1M+) tenders.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Tech & Licensing:</strong> API integration, patent/IP licensing, co-development.</span>
                </li>
              </ul>
            </div>

            {/* Disallowed Column */}
            <div className="p-3 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
              <div className="flex items-center space-x-1.5 text-red-800 font-bold text-xs">
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Flagged (Not Allowed)</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-red-900">
                <li className="flex items-start space-x-1.5">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Career Milestones:</strong> "Joined X as VP", promotions, anniversaries.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Motivational Fluff:</strong> Hustle culture, leadership quotes, life updates.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Vague Startup Hype:</strong> "Day 1 of my venture, wish me luck!"</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-red-600 font-bold">•</span>
                  <span><strong>Retail / B2C Pitches:</strong> Direct selling, coaching ads, discount codes.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* How the AI Sentinel Works */}
          <div className="p-3 rounded-xl border border-border bg-surface space-y-2">
            <div className="font-bold text-navy text-xs flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>AI Mandate Sentinel (Gemini 2.5 Flash)</span>
              </span>
              <span className="text-[10px] text-text-muted font-normal">Real-Time Scoring</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-text-muted">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>70% - 100%: Approved.</strong> Immediate global broadcasting to verified executives.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span><strong>40% - 69%: Needs Specificity.</strong> Corporate intent, but needs volume or counterpart criteria.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span><strong>0% - 39%: Flagged & Blocked.</strong> Personal career updates or motivational posts are blocked with 1-click AI conversion.</span>
              </div>
            </div>
          </div>

          {/* Quick Mandate Anatomy */}
          <div className="p-3 rounded-xl bg-surface-muted/50 border border-border space-y-1.5">
            <div className="text-[11px] font-bold text-navy uppercase tracking-wider">
              Anatomy of a High-Scoring Mandate:
            </div>
            <div className="bg-surface p-2.5 rounded-lg border border-border text-[11px] text-navy font-mono leading-relaxed">
              <span className="text-primary font-bold">1. Title:</span> Seeking [Partner Role] for [Specific Scope/Corridor]<br />
              <span className="text-primary font-bold">2. Counterparty:</span> Target credentials (e.g. ISO/IATA certified, $10M+ fulfillment)<br />
              <span className="text-primary font-bold">3. Structure:</span> Bilateral JV, Revenue Share, or OEM Supply<br />
              <span className="text-primary font-bold">4. Volume:</span> Concrete threshold (e.g. $5M Annual Commitment)
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-muted/30 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-surface hover:bg-surface-muted text-navy font-semibold text-xs rounded-xl border border-border transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenCreateModal) {
                onOpenCreateModal();
              }
            }}
            className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Post Partnership Request</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
