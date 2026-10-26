import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface ExpressInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  match: any;
  myOpportunities: any[];
}

export const ExpressInterestModal: React.FC<ExpressInterestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  match,
  myOpportunities,
}) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  const [selectedMyOppId, setSelectedMyOppId] = useState<string>('');
  const [message, setMessage] = useState(
    'We reviewed your opportunity on MESHVI and identified significant bilateral alignment with our distribution network. Would love to coordinate next steps.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Keep selectedMyOppId in sync whenever modal opens or props update
  useEffect(() => {
    if (isOpen) {
      const defaultOppId =
        match?.sourceOpportunityId ||
        match?.sourceOpportunity?.id ||
        myOpportunities[0]?.id ||
        '';
      setSelectedMyOppId(defaultOppId);
      setError('');
    }
  }, [isOpen, match, myOpportunities]);

  if (!isOpen || !match) return null;

  const targetOpp = match.targetOpportunity || match;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide a message outlining your proposition');
      return;
    }

    const effectiveSenderOppId =
      selectedMyOppId ||
      match?.sourceOpportunityId ||
      match?.sourceOpportunity?.id ||
      myOpportunities[0]?.id;

    if (!effectiveSenderOppId) {
      setError('Please create an opportunity profile before sending a business proposal');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/v1/opportunities/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          opportunityMatchId: match.id,
          recipientOpportunityId: targetOpp.id,
          senderOpportunityId: effectiveSenderOppId,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        let msg = 'Failed to dispatch opportunity interest';
        if (Array.isArray(data.error)) msg = data.error.join(', ');
        else if (typeof data.error === 'string') msg = data.error;
        else if (data.error?.message) msg = data.error.message;
        else if (data.message) msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(msg);
      }

      showToast({
        title: 'Business Opportunity Request Dispatched!',
        message: `Your proposal was delivered to ${targetOpp.company?.name || targetOpp.profile?.displayName || 'the counterparty'}.`,
        type: 'success',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to submit interest.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[75] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div
        className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border bg-bg flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy">Express Business Interest</h3>
              <p className="text-[11px] text-text-muted">
                Recipient: {targetOpp.company?.name || targetOpp.profile?.displayName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Target Opportunity Card Snippet */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-border space-y-1">
            <span className="text-[10px] font-bold text-navy uppercase tracking-wider block">
              Target Opportunity
            </span>
            <p className="text-xs font-bold text-navy">{targetOpp.title}</p>
            <p className="text-[11px] text-text-muted line-clamp-2">{targetOpp.summary}</p>
          </div>

          {/* Proposing Opportunity Profile Display / Selector */}
          {myOpportunities.length === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                You do not have an active opportunity profile yet. Create an opportunity profile first so the counterparty can review what you offer and seek.
              </span>
            </div>
          )}

          {myOpportunities.length === 1 && (
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Proposing With Your Opportunity
                </span>
                <span className="text-[9.5px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{myOpportunities[0].ownerType}</span>
                </span>
              </div>
              <p className="text-xs font-bold text-navy">{myOpportunities[0].title}</p>
              <p className="text-[11px] text-text-muted line-clamp-1">{myOpportunities[0].summary}</p>
            </div>
          )}

          {myOpportunities.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy block">Propose with your opportunity profile:</label>
              <select
                value={selectedMyOppId || myOpportunities[0]?.id}
                onChange={(e) => {
                  setSelectedMyOppId(e.target.value);
                  setError('');
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-bg text-navy focus:outline-none focus:ring-2 focus:ring-black"
              >
                {myOpportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.ownerType})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy block">Custom Business Proposition Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Detail your capacity, initial proposition terms, or operational readiness..."
              className="w-full text-xs p-3 rounded-xl border border-border bg-bg text-navy leading-relaxed focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-border bg-surface text-navy font-bold text-xs rounded-xl hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Dispatching...' : 'Dispatch Proposal Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
