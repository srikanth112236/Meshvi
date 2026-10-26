import React, { useState, useEffect } from 'react';
import {
  X,
  XCircle,
  AlertCircle,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface DeclineReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  requesterName: string;
  onSuccess?: () => void;
}

export const DeclineReasonModal: React.FC<DeclineReasonModalProps> = ({
  isOpen,
  onClose,
  connectionId,
  requesterName,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  const [reasonCode, setReasonCode] = useState('OUT_OF_SCOPE');
  const [declineNote, setDeclineNote] = useState(
    'Thank you for reaching out. We are currently focusing on core initiatives and cannot pursue this opportunity at this stage.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Universal Escape key dismissal (Gap 260)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/connections/${connectionId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'DECLINE',
          reasonCode,
          note: declineNote,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to decline request.');
      }

      showToast({
        title: 'Opportunity Bridge Closed',
        message: 'Polite decline memo dispatched to requester.',
        type: 'info',
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error executing decline action.');
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
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-start justify-between bg-bg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <XCircle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                Governance Protocol
              </span>
              <h2 className="text-base font-extrabold text-navy mt-1">
                Decline Opportunity Request
              </h2>
              <div className="text-xs text-text-muted flex items-center space-x-1.5 mt-0.5">
                <span>Inbound from: <strong className="text-navy">{requesterName}</strong></span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-navy p-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <form onSubmit={handleDecline} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Structured Decline Reason Code */}
          <div>
            <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1.5">
              Select Commercial Disposition Code
            </label>
            <div className="space-y-2">
              {[
                { id: 'OUT_OF_SCOPE', label: 'Out of Strategic Scope / Not a Current Priority' },
                { id: 'WRONG_TIMING', label: 'Bad Timing / Revisit Next Financial Year' },
                { id: 'WRONG_GEOGRAPHY', label: 'Not Active in this Region / Geography' },
                { id: 'BUDGET_CLOSED', label: 'Budget Allocation Closed for Current Quarter' },
                { id: 'SUPPLIER_SATURATED', label: 'Existing Long-Term Supplier Agreements in Place' },
              ].map((reason) => (
                <label
                  key={reason.id}
                  className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer text-xs transition-all ${
                    reasonCode === reason.id
                      ? 'bg-neutral-100 border-black text-black font-bold'
                      : 'bg-surface border-border text-navy hover:bg-bg'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={reasonCode === reason.id}
                    onChange={() => setReasonCode(reason.id)}
                    className="accent-black"
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Polite Closure Note */}
          <div>
            <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
              Polite Closure Note
            </label>
            <textarea
              required
              rows={3}
              value={declineNote}
              onChange={(e) => setDeclineNote(e.target.value)}
              className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Meshvi Platform Governance - 60-Day Cooling-Off Notice (Gap 179) */}
          <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl flex items-start space-x-2.5 text-xs text-neutral-800">
            <span className="text-base leading-none">⏳</span>
            <div>
              <strong className="block font-bold text-[11px] uppercase tracking-wider text-neutral-900">
                Respectful Engagement &bull; 60-Day Cooling-Off Window (Gap 179)
              </strong>
              <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                In accordance with Meshvi institutional governance, declining this request institutes an automated 60-day cooling-off lockout between these accounts, preventing persistent nuisance outreach while preserving future alignment.
              </p>
            </div>
          </div>

          {/* Submit Actions */}
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
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Send Polite Decline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
