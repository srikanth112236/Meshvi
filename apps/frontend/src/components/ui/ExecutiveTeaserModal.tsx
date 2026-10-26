import React, { useEffect, useRef } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  Building2,
  Globe,
  TrendingUp,
  DollarSign,
  Download,
  Handshake,
  Lock,
  Clock,
  Award,
} from 'lucide-react';
import { PartnershipPost } from '../../data/partnershipsData';

interface Props {
  post: PartnershipPost | null;
  isOpen: boolean;
  onClose: () => void;
  onInitiatePartnership: (post: PartnershipPost) => void;
}

export const ExecutiveTeaserModal: React.FC<Props> = ({
  post,
  isOpen,
  onClose,
  onInitiatePartnership,
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

  if (!isOpen || !post || !post.dealTeaser) return null;

  const teaser = post.dealTeaser;

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
        className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-150 relative"
      >
        {/* Top Confidential Security Bar */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy text-white px-5 py-2.5 flex items-center justify-between text-xs border-b border-border">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider uppercase text-[10px] text-slate-300">
              Confidential Executive Deal Teaser &bull; 1-Page Commercial Spec Sheet
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Teaser Document Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-surface-muted/30 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{post.authorCompany}</span>
                </span>
                <span className="text-text-muted">&bull;</span>
                <span className="text-[11px] text-text-muted">Bilateral Mandate Dossier</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-navy tracking-tight">{post.title}</h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Author & Verified Decision-Maker Badges */}
          <div className="p-3 bg-surface rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center space-x-2.5">
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-9 h-9 rounded-xl object-cover border border-border"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-navy text-white text-xs font-bold flex items-center justify-center">
                  {post.authorName[0]}
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-navy">{post.authorName}</div>
                <div className="text-[11px] text-text-muted">{post.authorRole}</div>
              </div>
            </div>

            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-1.5">
              {post.authorBadges && post.authorBadges.length > 0 ? (
                post.authorBadges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20"
                  >
                    {badge.type === 'SIGNATORY' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                    {badge.type === 'FULFILLMENT' && <Award className="w-3 h-3 text-indigo-600" />}
                    {badge.type === 'SLA' && <Clock className="w-3 h-3 text-amber-600" />}
                    <span>{badge.label}</span>
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Executive Member</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 1-Page Teaser Commercial Matrix */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Commercial Scope */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-muted/20 space-y-1">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span>Commercial Deal Scope</span>
              </div>
              <p className="text-xs font-bold text-navy leading-relaxed">{teaser.scope}</p>
            </div>

            {/* 2. Volume / Annual Value Threshold */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-muted/20 space-y-1">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                <span>Volume & Annual Commitment</span>
              </div>
              <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                {teaser.volumeThreshold}
              </p>
            </div>

            {/* 3. Geographic Reach */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-muted/20 space-y-1">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                <Globe className="w-3 h-3 text-indigo-600" />
                <span>Target Corridors & Geography</span>
              </div>
              <p className="text-xs font-bold text-navy leading-relaxed">{teaser.geographicReach}</p>
            </div>

            {/* 4. Capital / Co-Investment Required */}
            <div className="p-3.5 rounded-xl border border-border bg-surface-muted/20 space-y-1">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Capital / Fulfillment Requirement</span>
              </div>
              <p className="text-xs font-bold text-navy leading-relaxed">
                {teaser.capitalRequired || 'Bilateral Agreement / Term Sheet'}
              </p>
            </div>
          </div>

          {/* Attached Document File */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-navy truncate">
                  {teaser.fileName || 'Commercial_Partnership_Teaser.pdf'}
                </div>
                <div className="text-[10px] text-text-muted">1-Page Executive Spec Sheet &bull; Encrypted Watermark</div>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading verified spec sheet: ${teaser.fileName || 'Teaser.pdf'}`)}
              className="px-3 py-1.5 bg-surface hover:bg-surface-muted text-navy rounded-lg font-bold text-xs border border-border transition-colors flex items-center space-x-1 shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface-muted/40 flex items-center justify-between">
          <div className="text-[11px] text-text-muted">
            Directly authorized by <strong className="text-navy">{post.authorName}</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-surface hover:bg-surface-muted text-navy font-bold text-xs rounded-xl border border-border transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onInitiatePartnership(post);
              }}
              className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Initiate Partnership on this Teaser</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
