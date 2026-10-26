import React, { useState } from 'react';
import {
  X,
  Building2,
  Briefcase,
  Target,
  Sparkles,
  Send,
  ShieldCheck,
  DollarSign,
  Lock,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface SubmitCompanyProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCompanyId?: string;
  targetCompanyName: string;
  targetExecutiveName?: string;
  targetExecutiveTitle?: string;
  recipientProfileId: string;
  onSuccess?: () => void;
}

export const SubmitCompanyProposalModal: React.FC<SubmitCompanyProposalModalProps> = ({
  isOpen,
  onClose,
  targetCompanyName,
  targetExecutiveName,
  targetExecutiveTitle,
  recipientProfileId,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  // 4-step structured RFP fields (Feature #22)
  const [dealSize, setDealSize] = useState('$100k - $500k');
  const [scopeOfWork, setScopeOfWork] = useState('Regional logistics fulfillment and retail distribution across key Southeast Asian airport hubs.');
  const [timeline, setTimeline] = useState('Q3 2026 (6-Month Rollout)');
  const [category, setCategory] = useState('Commercial RFP & Tender');
  const [targetDivision, setTargetDivision] = useState('Commercial Operations & Sourcing');
  const [marketFocus, setMarketFocus] = useState('Southeast Asia (Malaysia & Singapore)');
  const [executiveSummary, setExecutiveSummary] = useState(
    'We would like to submit a formal enterprise commercial proposal for supply chain integration and SLA fulfillment across regional nodes.'
  );

  // Confidentiality / NDA Gating Indicator (Feature #23)
  const [requiresMnda, setRequiresMnda] = useState(false);

  const [aiGenerating, setAiGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAiPolish = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/v1/ai/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetTitle: targetExecutiveTitle || 'Executive Leadership',
          targetCompany: targetCompanyName,
          objective: `${category} in ${marketFocus} (${dealSize})`,
          tone: 'authoritative & commercially structured',
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.pitch) {
        setExecutiveSummary(data.data.pitch);
        showToast({
          title: 'Proposal Polished by AI',
          message: 'Generated high-conversion commercial proposal summary.',
          type: 'info',
        });
      }
    } catch {
      // Deterministic fallback
      setExecutiveSummary(
        `Submitting enterprise partnership proposal for ${targetCompanyName}: structured ${category} targeting ${marketFocus} with allocated capacity in the ${dealSize} tier.`
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const ndaPrefix = requiresMnda ? '[M-NDA GATED] ' : '';
    const formattedReason = `${ndaPrefix}[${category} | ${targetDivision} | Deal Size: ${dealSize} | Timeline: ${timeline}] ${executiveSummary} (Scope: ${scopeOfWork}, Target Market: ${marketFocus})`;

    try {
      const res = await fetch('/api/v1/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientProfileId,
          businessReason: formattedReason,
          opportunityPitch: executiveSummary,
          mutualGoals: `${marketFocus} | Deal Size: ${dealSize} | Scope: ${scopeOfWork} | Timeline: ${timeline}${requiresMnda ? ' | Requires Mutual NDA' : ''}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || (Array.isArray(data.message) ? data.message.join(', ') : 'Failed to submit commercial proposal.'));
      }

      showToast({
        title: 'Commercial Proposal Delivered',
        message: `Your structured RFP has been routed to ${targetCompanyName}'s executive pipeline.`,
        type: 'success',
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error transmitting proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-navy">Submit Commercial Proposal</h3>
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 text-[10px] font-black rounded uppercase">
                  Structured RFP (#22)
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Direct RFP dispatch to <strong className="text-navy">{targetCompanyName}</strong>
                {targetExecutiveName ? ` (${targetExecutiveName})` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Target Entity Banner */}
          <div className="p-3 bg-bg border border-border rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-navy">
              <Building2 className="w-4 h-4 text-neutral-800" />
              <span>Target Organization:</span>
              <strong className="font-extrabold">{targetCompanyName}</strong>
            </div>
            <div className="text-[11px] text-text-muted flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Anti-Spam Verified</span>
            </div>
          </div>

          {/* Proposal Category & Step 1: Deal Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
                Proposal Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs font-semibold text-navy focus:outline-none"
              >
                <option value="Commercial RFP & Tender">Commercial RFP & Tender</option>
                <option value="Strategic Alliance & Co-Dev">Strategic Alliance & Co-Dev</option>
                <option value="Territory Distribution">Territory Distribution</option>
                <option value="Vendor Supplier Quotation">Vendor Supplier Quotation</option>
                <option value="Cross-Border Channel Mandate">Cross-Border Channel Mandate</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1 flex items-center space-x-1">
                <DollarSign className="w-3 h-3 text-text-muted" />
                <span>1. Deal Size / Budget</span>
              </label>
              <select
                value={dealSize}
                onChange={(e) => setDealSize(e.target.value)}
                className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs font-semibold text-navy focus:outline-none"
              >
                <option value="Under $100k">Under $100k</option>
                <option value="$100k - $500k">$100k - $500k</option>
                <option value="$500k - $2.5M">$500k - $2.5M</option>
                <option value="$2.5M+ Enterprise">$2.5M+ Enterprise</option>
                <option value="Strategic Non-Monetary">Strategic Non-Monetary</option>
              </select>
            </div>
          </div>

          {/* Step 2: Scope of Work */}
          <div>
            <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1 flex items-center space-x-1">
              <FileText className="w-3 h-3 text-text-muted" />
              <span>2. Scope of Work (SOW)</span>
            </label>
            <input
              type="text"
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              placeholder="e.g. Turnkey cold chain procurement and regional distribution mandate"
              className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
              required
            />
          </div>

          {/* Step 3: Project Timelines & Market Focus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-text-muted" />
                <span>3. Timelines & Milestones</span>
              </label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs font-semibold text-navy focus:outline-none"
              >
                <option value="Immediate (1-3 Months)">Immediate (1-3 Months)</option>
                <option value="Q3 2026 (6-Month Rollout)">Q3 2026 (6-Month Rollout)</option>
                <option value="Q4 2026 - Q1 2027 (Annual)">Q4 2026 - Q1 2027 (Annual)</option>
                <option value="Multi-Year Enterprise SLA">Multi-Year Enterprise SLA</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
                Target Market / Jurisdiction
              </label>
              <input
                type="text"
                value={marketFocus}
                onChange={(e) => setMarketFocus(e.target.value)}
                placeholder="e.g. Malaysia, Singapore, ASEAN"
                className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Target Business Unit */}
          <div>
            <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
              Target Business Unit / Division
            </label>
            <input
              type="text"
              value={targetDivision}
              onChange={(e) => setTargetDivision(e.target.value)}
              placeholder="e.g. Commercial Operations & Sourcing"
              className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
              required
            />
          </div>

          {/* Step 4: Executive Summary with AI Polish */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-navy uppercase tracking-wider">
                4. Executive Value Proposition & Terms
              </label>
              <button
                type="button"
                onClick={handleAiPolish}
                disabled={aiGenerating}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-black text-white hover:bg-neutral-800 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{aiGenerating ? 'Polishing...' : 'AI Value Proposition'}</span>
              </button>
            </div>
            <textarea
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              rows={3}
              placeholder="Outline the commercial synergy, deliverables, and proposed engagement timeline..."
              className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-navy leading-relaxed focus:outline-none"
              required
            />
          </div>

          {/* Feature #23: Confidentiality / M-NDA Gating Toggle */}
          <div className="p-3 bg-bg border border-border rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5 pr-2">
              <Lock className={`w-4 h-4 ${requiresMnda ? 'text-black' : 'text-text-muted'}`} />
              <div>
                <span className="text-xs font-bold text-navy block">
                  Requires Mutual Non-Disclosure Agreement (M-NDA)
                </span>
                <span className="text-[10px] text-text-muted">
                  Enforces confidentiality gating before full commercial documents and pricing are revealed.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={requiresMnda}
              onChange={(e) => setRequiresMnda(e.target.checked)}
              className="w-4 h-4 accent-black rounded cursor-pointer shrink-0"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] text-text-muted">
              <Target className="w-3.5 h-3.5 text-neutral-800" />
              <span>Injected into Corporate Inbound Queue</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-navy hover:bg-bg rounded-xl border border-border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Transmitting...' : 'Transmit Proposal'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
