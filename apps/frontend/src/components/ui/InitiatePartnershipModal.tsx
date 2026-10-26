import React, { useState, useEffect, useRef } from 'react';
import { X, Handshake, Send, AlertCircle, Building2, UserPlus, UserCheck } from 'lucide-react';
import { PartnershipPost } from '../../data/partnershipsData';

interface Props {
  post: PartnershipPost | null;
  isOpen: boolean;
  onClose: () => void;
  isAlreadyConnected: boolean;
  onSubmit: (reasonType: 'PARTNERSHIP' | 'CONNECTION', proposalNote: string) => void;
}

export const InitiatePartnershipModal: React.FC<Props> = ({
  post,
  isOpen,
  onClose,
  isAlreadyConnected,
  onSubmit,
}) => {
  const [reasonType, setReasonType] = useState<'PARTNERSHIP' | 'CONNECTION'>('PARTNERSHIP');
  const [proposalNote, setProposalNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalNote.trim()) {
      setError('Please provide a brief introduction or proposal note.');
      return;
    }
    onSubmit(reasonType, proposalNote.trim());
    setProposalNote('');
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalContentRef}
        className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy">
                {isAlreadyConnected ? 'Initiate Partnership' : 'Initiate & Connect'}
              </h3>
              <p className="text-xs text-text-muted">
                {isAlreadyConnected
                  ? 'Send proposal directly to your 1st-degree connection'
                  : 'Send commercial proposal and connect 1st-degree'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Clean Target Header (no 'mandate' wording) */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-muted/40 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-text-muted">
              <span className="flex items-center space-x-1.5 font-bold text-navy">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span>{post.authorCompany}</span>
              </span>
              {isAlreadyConnected ? (
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span>1st-Degree Connection</span>
                </span>
              ) : (
                <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1">
                  <UserPlus className="w-3 h-3 text-indigo-600" />
                  <span>Will Connect on Send</span>
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-navy line-clamp-1">{post.title}</div>
            <div className="text-[11px] text-text-muted">
              Recipient: <strong className="text-navy">{post.authorName}</strong> ({post.authorRole})
            </div>
          </div>

          {/* Simple Reason Selector: Partnership vs Connection */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
              Primary Objective
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setReasonType('PARTNERSHIP')}
                className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                  reasonType === 'PARTNERSHIP'
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                    : 'border-border bg-surface hover:bg-surface-muted text-navy'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Handshake className="w-3.5 h-3.5 text-primary" />
                  <span>Partnership Intent</span>
                </div>
                <div className="text-[10px] text-text-muted font-normal mt-0.5">
                  Joint venture, distribution, or licensing
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReasonType('CONNECTION')}
                className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                  reasonType === 'CONNECTION'
                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                    : 'border-border bg-surface hover:bg-surface-muted text-navy'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Direct Connection</span>
                </div>
                <div className="text-[10px] text-text-muted font-normal mt-0.5">
                  Executive introduction & synergy discovery
                </div>
              </button>
            </div>
          </div>

          {/* Proposal Summary Note */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
              Introduction & Proposal Note *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Outline your commercial synergy, regional capabilities, or proposed next step..."
              value={proposalNote}
              onChange={(e) => setProposalNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none shadow-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface hover:bg-surface-muted text-navy font-bold text-xs rounded-xl border border-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAlreadyConnected ? 'Send Partnership Request' : 'Send & Connect Now 🤝'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
