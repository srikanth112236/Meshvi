import React, { useEffect, useRef } from 'react';
import {
  X,
  Building2,
  MapPin,
  CheckCircle2,
  FileText,
  Handshake,
  Globe,
  Lock,
  MessageSquare,
  Repeat2,
  Share2,
  Award,
  Clock,
} from 'lucide-react';
import { PartnershipPost } from '../../data/partnershipsData';

interface Props {
  post: PartnershipPost | null;
  isOpen: boolean;
  onClose: () => void;
  onInitiatePartnership: (post: PartnershipPost) => void;
  onToggleComments?: (postId: string) => void;
  onShareLink?: (post: PartnershipPost) => void;
}

export const PartnershipDetailModal: React.FC<Props> = ({
  post,
  isOpen,
  onClose,
  onInitiatePartnership,
  onShareLink,
}) => {
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

  const locationLabel =
    post.dealTeaser?.geographicReach || 'Cross-Border / Multi-Region';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalContentRef}
        className="bg-surface border border-border w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-white block">
                Partnership Mandate & Commercial Details
              </span>
              <span className="text-[11px] text-slate-400">
                Verified B2B Corporate Alliance Opportunity
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-text">
          {/* Company & Author Card */}
          <div className="p-4 rounded-xl border border-border bg-surface-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy to-[#1E3A8A] text-white font-black text-base flex items-center justify-center shrink-0">
                  {post.authorName[0]?.toUpperCase() || 'E'}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm text-navy">{post.authorName}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xs text-text-muted">
                  {post.authorRole} &bull; <strong className="text-navy">{post.authorCompany}</strong>
                </div>
                {post.authorBadges && post.authorBadges.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1.5">
                    {post.authorBadges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9.5px] font-bold bg-primary/10 text-primary border border-primary/20"
                      >
                        {badge.type === 'SIGNATORY' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {badge.type === 'FULFILLMENT' && <Award className="w-3 h-3 text-indigo-600" />}
                        {badge.type === 'SLA' && <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{badge.label}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Badges: Location & Visibility */}
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{locationLabel}</span>
              </span>
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  post.visibility === 'PUBLIC'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                {post.visibility === 'PUBLIC' ? (
                  <>
                    <Globe className="w-3 h-3 text-emerald-600" />
                    <span>Public Mandate</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-indigo-600" />
                    <span>Connections Only</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Mandate Title & Full Content */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Requirement Mandate
            </div>
            <h2 className="text-lg sm:text-xl font-black text-navy">{post.title}</h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* Image Banner if uploaded */}
          {post.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-border max-h-80 bg-surface-muted">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 1-Page Deal Teaser Spec Sheet (if present) */}
          {post.dealTeaser && (
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-navy flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>1-Page Executive Deal Teaser & Specifications</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Spec Sheet
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-surface p-3 rounded-xl border border-border">
                <div>
                  <span className="text-text-muted block text-[10px] uppercase tracking-wider font-semibold">
                    Scope of Partnership
                  </span>
                  <span className="font-bold text-navy">{post.dealTeaser.scope}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase tracking-wider font-semibold">
                    Volume Threshold
                  </span>
                  <span className="font-bold text-emerald-700">{post.dealTeaser.volumeThreshold}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase tracking-wider font-semibold">
                    Target Geography
                  </span>
                  <span className="font-bold text-navy">{post.dealTeaser.geographicReach}</span>
                </div>
              </div>

              {(post.dealTeaser.fileName || post.dealTeaser.specSheetFileName) && (
                <div className="p-2.5 bg-surface rounded-lg border border-border flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-700 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>{post.dealTeaser.fileName || post.dealTeaser.specSheetFileName}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-primary">Attached Document</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface-muted/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-text-muted">
            <span className="flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span>{post.commentsCount} Comments</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <Repeat2 className="w-3.5 h-3.5 text-purple-600" />
              <span>{post.resharesCount} Reshares</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onShareLink && (
              <button
                type="button"
                onClick={() => onShareLink(post)}
                className="px-3 py-2 rounded-xl border border-border hover:bg-surface text-navy font-semibold text-xs transition-colors flex items-center space-x-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Share Link</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                onInitiatePartnership(post);
              }}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-md transition-colors flex items-center space-x-1.5"
            >
              <Handshake className="w-4 h-4" />
              <span>Initiate Partnership / Deal Room</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
