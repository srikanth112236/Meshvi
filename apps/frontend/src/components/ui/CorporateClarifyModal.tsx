import React, { useState } from 'react';
import {
  X,
  Send,
  Lock,
  Sparkles,
  AlertCircle,
  FileQuestion,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface CorporateClarifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  companyId?: string | null;
  requesterName: string;
  requesterCompany: string;
  opportunitySummary: string;
  onSuccess?: (question: string) => void;
}

const PRESET_TEMPLATES = [
  {
    title: 'Scope & Functional Deliverables',
    icon: '📋',
    question:
      'Could you specify the detailed functional scope, technical milestones, and the primary executive stakeholder on your team?',
  },
  {
    title: 'Budget & Commercial Model',
    icon: '💰',
    question:
      'Please outline the anticipated commercial model (e.g. revenue-share, annual licensing, or retainer) and ballpark budget envelope.',
  },
  {
    title: 'Mutual NDA & Regulatory Scope',
    icon: '⚖️',
    question:
      'Please confirm if your legal department requires an executed bilateral M-NDA prior to scheduling the initial technical discovery session.',
  },
  {
    title: 'Geographic Rollout & Timeline',
    icon: '🌍',
    question:
      'What target regional territories and anticipated go-live timeline are you evaluating for this joint deployment?',
  },
];

export const CorporateClarifyModal: React.FC<CorporateClarifyModalProps> = ({
  isOpen,
  onClose,
  connectionId,
  companyId,
  requesterName,
  requesterCompany,
  opportunitySummary,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  const [question, setQuestion] = useState(PRESET_TEMPLATES[0].question);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please provide a specific clarification question.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = companyId
        ? `/api/v1/companies/${companyId}/inbound-connections/${connectionId}/clarify`
        : `/api/v1/connections/${connectionId}/clarify`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await res.json();
      if (!res.ok || (!data.success && data.status !== 'success')) {
        throw new Error(data.message || data.error?.message || 'Failed to dispatch clarification.');
      }

      showToast({
        title: 'Clarification Dispatched ⏳',
        message: `Clarification request sent to ${requesterName}. Contact details remain locked pending response.`,
        type: 'info',
      });

      onSuccess?.(question.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred while requesting clarification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-start justify-between bg-bg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                Action 2: Pre-Commitment Triage
              </span>
              <h2 className="text-base font-extrabold text-navy mt-1">
                Request Clarification
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Inbound from: <strong className="text-navy">{requesterName}</strong> ({requesterCompany})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-navy p-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Privacy & Governance Notice */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start space-x-3">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block">Contact Coordinates Remain Locked</span>
              To preserve executive privacy, direct email and mobile numbers remain concealed until the counterparty answers your clarification question satisfactorily.
            </div>
          </div>

          {/* Opportunity Reference Card */}
          <div className="p-3 bg-bg rounded-xl border border-border text-xs space-y-1">
            <div className="text-[10px] font-bold text-text-muted uppercase">Opportunity Subject:</div>
            <p className="text-navy font-medium italic line-clamp-2">"{opportunitySummary}"</p>
          </div>

          {/* 1-Click Institutional Preset Question Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-2">
              1-Click Institutional Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuestion(tmpl.question)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start space-x-2 ${
                    question === tmpl.question
                      ? 'bg-neutral-100 border-black shadow-xs font-bold text-navy'
                      : 'bg-surface border-border hover:bg-bg text-text-muted'
                  }`}
                >
                  <span className="text-sm shrink-0">{tmpl.icon}</span>
                  <span className="leading-snug">{tmpl.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question Textarea */}
          <div>
            <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1.5">
              Clarification Question (Visible to Counterparty)
            </label>
            <textarea
              required
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Specify the exact parameters or qualifications you require before accepting..."
              className="w-full p-3.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none resize-none leading-relaxed"
            />
            <p className="text-[11px] text-text-muted mt-1 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Counterparty will receive an instant notification with a 1-click answer prompt.</span>
            </p>
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-border flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-navy rounded-xl border border-border hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{loading ? 'Transmitting...' : 'Dispatch Clarification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
