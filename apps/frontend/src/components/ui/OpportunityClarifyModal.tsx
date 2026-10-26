import React, { useState } from 'react';
import { X, Send, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface OpportunityClarifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  request: any;
  mode: 'ask' | 'answer';
}

export const OpportunityClarifyModal: React.FC<OpportunityClarifyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  request,
  mode,
}) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please provide your message');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = mode === 'ask' ? { question: text.trim() } : { answer: text.trim() };
      const res = await fetch(`/api/v1/opportunities/requests/${request.id}/clarify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit clarification');
      }

      showToast({
        title: mode === 'ask' ? 'Clarification Requested' : 'Clarification Answer Sent',
        message: mode === 'ask'
          ? 'Your question was sent to the sender before deciding on the proposal.'
          : 'Your answer was delivered to the recipient.',
        type: 'success',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating request');
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
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-navy">
                {mode === 'ask' ? 'Request Additional Clarification' : 'Answer Clarification Question'}
              </h3>
              <p className="text-[11px] text-text-muted">
                Opportunity: {request.recipientOpportunity?.title || request.senderOpportunity?.title}
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

          {mode === 'answer' && request.clarificationQuestion && (
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-border space-y-1">
              <span className="text-[10px] font-bold text-navy uppercase tracking-wider block">
                Recipient Asked:
              </span>
              <p className="text-xs text-text-muted italic">"{request.clarificationQuestion}"</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy block">
              {mode === 'ask' ? 'What question or specification would you like clarified?' : 'Your Response'}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                mode === 'ask'
                  ? 'e.g. Could you clarify your minimum monthly case volume and whether packaging is certified for duty-free transit?'
                  : 'Provide specific commercial or technical clarification...'
              }
              rows={4}
              className="w-full text-xs p-3 rounded-xl border border-border bg-bg text-navy focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
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
              className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : mode === 'ask' ? 'Send Question' : 'Deliver Answer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
