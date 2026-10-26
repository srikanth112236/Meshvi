import React, { useEffect, useRef } from 'react';
import { X, TrendingUp, Users, Eye, ThumbsUp, BarChart3, MessageSquare, Repeat2 } from 'lucide-react';
import { PartnershipPost } from '../../data/partnershipsData';

interface Props {
  post: PartnershipPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostAnalyticsModal: React.FC<Props> = ({ post, isOpen, onClose }) => {
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

  const totalEngagements = post.likesCount + post.commentsCount + post.resharesCount;
  const impressions = Math.max(1, post.impressionsCount);
  const engagementRate = ((totalEngagements / impressions) * 100).toFixed(1);
  const uniqueViewers = post.analytics?.uniqueViewers || Math.round(impressions * 0.65);
  const dailyViews = post.analytics?.dailyViews || [
    { date: 'Oct 20', views: Math.round(impressions * 0.25) },
    { date: 'Oct 21', views: Math.round(impressions * 0.45) },
    { date: 'Oct 22', views: Math.round(impressions * 0.3) },
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
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy">Post Analytics & Performance</h3>
              <p className="text-xs text-text-muted">LinkedIn-style visibility & bilateral engagement metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Post Snippet */}
          <div className="p-3 bg-surface-muted/40 rounded-xl border border-border">
            <h4 className="text-xs font-bold text-navy line-clamp-1">{post.title}</h4>
            <div className="flex items-center space-x-2 text-[11px] text-text-muted mt-1">
              <span>{post.visibility === 'PUBLIC' ? '🌐 Public Broadcast' : '🔒 Connections Only'}</span>
              <span>•</span>
              <span>Posted {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-surface border border-border text-center shadow-xs">
              <div className="flex justify-center text-primary mb-1">
                <Eye className="w-4 h-4" />
              </div>
              <div className="text-lg font-black text-navy">{post.impressionsCount}</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                Impressions
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border text-center shadow-xs">
              <div className="flex justify-center text-indigo-600 mb-1">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-lg font-black text-navy">{uniqueViewers}</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                Viewers
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border text-center shadow-xs">
              <div className="flex justify-center text-emerald-600 mb-1">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <div className="text-lg font-black text-navy">{post.likesCount}</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                Likes
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border text-center shadow-xs">
              <div className="flex justify-center text-amber-600 mb-1">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-lg font-black text-navy">{engagementRate}%</div>
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                Eng. Rate
              </div>
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="p-3.5 bg-surface-muted/30 rounded-xl border border-border space-y-2">
            <div className="text-xs font-bold text-navy uppercase tracking-wider">Interaction Breakdown</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
                <span className="flex items-center space-x-1.5 text-text-muted">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span>Comments</span>
                </span>
                <span className="font-bold text-navy">{post.commentsCount}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
                <span className="flex items-center space-x-1.5 text-text-muted">
                  <Repeat2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Reshares</span>
                </span>
                <span className="font-bold text-navy">{post.resharesCount}</span>
              </div>
            </div>
          </div>

          {/* Daily Views Bar Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-navy uppercase tracking-wider">
              <span>Impression Trajectory</span>
              <span className="text-[10px] text-text-muted font-normal">Past days</span>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border space-y-2.5">
              {dailyViews.map((item, idx) => {
                const maxVal = Math.max(...dailyViews.map((v) => v.views), 1);
                const pct = Math.round((item.views / maxVal) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-navy">
                      <span>{item.date}</span>
                      <span className="font-bold">{item.views} views</span>
                    </div>
                    <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-surface hover:bg-surface-muted text-navy font-bold text-xs rounded-xl border border-border transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
