import React, { useState, useEffect, useRef } from 'react';
import { X, Repeat2 } from 'lucide-react';
import { PartnershipPost } from '../../data/partnershipsData';

interface Props {
  post: PartnershipPost | null;
  isOpen: boolean;
  onClose: () => void;
  onReshareSubmit: (commentary: string) => void;
}

export const ReshareModal: React.FC<Props> = ({
  post,
  isOpen,
  onClose,
  onReshareSubmit,
}) => {
  const [commentary, setCommentary] = useState('');
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
    onReshareSubmit(commentary);
    setCommentary('');
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
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Repeat2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy">Reshare Partnership Mandate</h3>
              <p className="text-xs text-text-muted">Broadcast to your corporate network with thoughts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
              Add Your Perspective (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Why are you endorsing or sharing this partnership request with your counterparties?"
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Embedded original post */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-muted/30 space-y-1.5">
            <div className="text-[11px] text-text-muted">
              Originally posted by <strong className="text-navy">{post.authorName}</strong> ({post.authorCompany})
            </div>
            <div className="text-xs font-bold text-navy">{post.title}</div>
            <div className="text-[11px] text-text-muted line-clamp-2">{post.content}</div>
          </div>

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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Repeat2 className="w-3.5 h-3.5" />
              <span>Reshare to Network</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
