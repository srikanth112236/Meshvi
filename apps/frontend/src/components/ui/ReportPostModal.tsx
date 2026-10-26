import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, ShieldAlert, Send } from 'lucide-react';
import { PartnershipPost, ReportedPostItem, submitReportedPost } from '../../data/partnershipsData';

interface Props {
  post: PartnershipPost | null;
  isOpen: boolean;
  onClose: () => void;
  reporterName: string;
  reporterEmail?: string;
  onReportSubmitted: (report: ReportedPostItem) => void;
}

export const ReportPostModal: React.FC<Props> = ({
  post,
  isOpen,
  onClose,
  reporterName,
  reporterEmail,
  onReportSubmitted,
}) => {
  const [reason, setReason] = useState<ReportedPostItem['reason']>('INAPPROPRIATE');
  const [details, setDetails] = useState('');
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
    if (!details.trim()) {
      setError('Please provide a brief explanation of the violation.');
      return;
    }

    const report = submitReportedPost({
      postId: post.id,
      postTitle: post.title,
      postAuthorName: post.authorName,
      postAuthorCompany: post.authorCompany,
      postContentSnippet: post.content.slice(0, 160),
      reporterName,
      reporterEmail,
      reason,
      details: details.trim(),
    });

    onReportSubmitted(report);
    setDetails('');
    setError(null);
    onClose();
  };

  const reasonOptions: Array<{ id: ReportedPostItem['reason']; label: string; desc: string }> = [
    {
      id: 'INAPPROPRIATE',
      label: 'Inappropriate Content',
      desc: 'Offensive language, harassment, or unprofessional behavior',
    },
    {
      id: 'SPAM',
      label: 'Commercial Spam / Fake RFP',
      desc: 'Mass promotional messaging or fictitious tender tenders',
    },
    {
      id: 'MISLEADING',
      label: 'Misleading Corporate Identity',
      desc: 'False company affiliations or impersonating executives',
    },
    {
      id: 'IP_VIOLATION',
      label: 'IP or Confidentiality Breach',
      desc: 'Unauthorized disclosure of trade secrets or trademarks',
    },
    {
      id: 'OTHER',
      label: 'Other Policy Violation',
      desc: 'Breaches general platform terms or ethical standards',
    },
  ];

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
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy">Report Inappropriate Post</h3>
              <p className="text-xs text-text-muted">Directly escalates to platform integrity moderators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Post Snippet */}
          <div className="p-3 bg-surface-muted/60 rounded-xl border border-border text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold text-text-muted">Target Post:</div>
            <div className="font-bold text-navy line-clamp-1">{post.title}</div>
            <div className="text-[11px] text-text-muted">
              By <strong>{post.authorName}</strong> ({post.authorCompany})
            </div>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
              Reason for Report *
            </label>
            <div className="space-y-1.5">
              {reasonOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2.5 cursor-pointer transition-colors ${
                    reason === opt.id
                      ? 'border-rose-500 bg-rose-50/40 text-navy'
                      : 'border-border hover:bg-surface-muted text-navy'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt.id}
                    checked={reason === opt.id}
                    onChange={() => setReason(opt.id)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="font-bold text-xs">{opt.label}</div>
                    <div className="text-[11px] text-text-muted">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Explanation Textarea */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
              Details for Platform Administrators *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain how this post violates B2B platform standards or enterprise terms..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none shadow-xs"
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Report to Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
