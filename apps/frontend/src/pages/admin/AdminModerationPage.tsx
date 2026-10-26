import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Clock,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  Bell,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import {
  ReportedPostItem,
  getStoredReportedPosts,
  updateReportStatus,
  deleteStoredPost,
} from '../../data/partnershipsData';

export const AdminModerationPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [reports, setReports] = useState<ReportedPostItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setReports(getStoredReportedPosts());
  }, []);

  const handleTakedownPost = (report: ReportedPostItem) => {
    // 1. Remove post from platform store
    deleteStoredPost(report.postId);

    // 2. Update report status
    updateReportStatus(report.id, 'POST_REMOVED', 'Post removed by SuperAdmin due to community violation.');
    setReports(getStoredReportedPosts());

    showToast({
      title: 'Post Removed & Content Taken Down 🚫',
      message: `"${report.postTitle}" by ${report.postAuthorName} was permanently removed platform-wide.`,
      type: 'warning',
    });
  };

  const handleDismissReport = (report: ReportedPostItem) => {
    updateReportStatus(report.id, 'RESOLVED_DISMISSED', 'Reviewed and dismissed: No violation found.');
    setReports(getStoredReportedPosts());

    showToast({
      title: 'Report Dismissed ✓',
      message: 'Report resolved and dismissed as conforming to B2B standards.',
      type: 'info',
    });
  };

  const handleWarnAuthor = (report: ReportedPostItem) => {
    showToast({
      title: 'Executive Integrity Warning Dispatched ⚠️',
      message: `Formal warning sent to ${report.postAuthorName} (${report.postAuthorCompany}) regarding reported post.`,
      type: 'opportunity',
    });
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.postTitle.toLowerCase().includes(q);
      const matchAuthor = r.postAuthorName.toLowerCase().includes(q);
      const matchReporter = r.reporterName.toLowerCase().includes(q);
      const matchCompany = r.postAuthorCompany.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchReporter && !matchCompany) return false;
    }
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === 'PENDING_REVIEW').length;
  const removedCount = reports.filter((r) => r.status === 'POST_REMOVED').length;
  const dismissedCount = reports.filter((r) => r.status === 'RESOLVED_DISMISSED').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Platform Integrity</span>
            </span>
            <span className="text-xs text-text-muted">• SuperAdmin Moderation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight">
            Reported Posts & Content Moderation
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-2xl">
            Audit user-reported partnership posts, verify commercial authenticity, and take platform moderation actions.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            to="/app/partnerships"
            className="px-3.5 py-2 bg-surface hover:bg-surface-muted text-navy font-bold text-xs rounded-xl border border-border transition-colors flex items-center space-x-1.5 shadow-2xs"
          >
            <span>Live Member Feed</span>
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Pending Review</span>
            <Clock className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-600">{pendingCount}</div>
          <div className="text-[10px] text-text-muted">Awaiting moderator triage</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Posts Taken Down</span>
            <Trash2 className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black text-navy">{removedCount}</div>
          <div className="text-[10px] text-text-muted">Content removed platform-wide</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Dismissed Reports</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-navy">{dismissedCount}</div>
          <div className="text-[10px] text-text-muted">Cleared & validated</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Total Escalations</span>
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xl font-black text-navy">{reports.length}</div>
          <div className="text-[10px] text-text-muted">All lifetime reports</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reports by title, author, or reporter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-surface-muted/60 border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center space-x-1.5 self-start sm:self-auto">
          {[
            { id: 'ALL', label: 'All Reports' },
            { id: 'PENDING_REVIEW', label: 'Pending Review' },
            { id: 'POST_REMOVED', label: 'Taken Down' },
            { id: 'RESOLVED_DISMISSED', label: 'Dismissed' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st.id
                  ? 'bg-navy text-white shadow-xs'
                  : 'bg-surface-muted text-text-muted hover:text-navy border border-border'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3.5">
        {filteredReports.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-2xl p-10 text-center space-y-2">
            <ShieldCheck className="w-9 h-9 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-navy">No reported posts in queue</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              All member posts are conforming to platform standards. New user reports will appear here in real time.
            </p>
          </div>
        ) : (
          filteredReports.map((item) => (
            <div
              key={item.id}
              className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 hover:border-border/80 transition-all"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    {item.reason.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-text-muted">
                    Reported by <strong className="text-navy">{item.reporterName}</strong>
                    {item.reporterEmail && ` (${item.reporterEmail})`}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === 'PENDING_REVIEW'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : item.status === 'POST_REMOVED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {item.status === 'PENDING_REVIEW' && '⏳ Pending Review'}
                    {item.status === 'POST_REMOVED' && '🚫 Post Taken Down'}
                    {item.status === 'RESOLVED_DISMISSED' && '✓ Dismissed (Conforming)'}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Reported Content Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Target Post */}
                <div className="p-3 rounded-xl bg-surface-muted/50 border border-border/80 space-y-1">
                  <div className="text-[10px] font-bold text-text-muted uppercase">Target Post Details:</div>
                  <div className="font-bold text-navy">{item.postTitle}</div>
                  <div className="text-[11px] text-text-muted flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-primary" />
                    <span>Author: <strong>{item.postAuthorName}</strong> ({item.postAuthorCompany})</span>
                  </div>
                  <p className="text-[11px] text-text-muted line-clamp-2 italic pt-1">&quot;{item.postContentSnippet}&quot;</p>
                </div>

                {/* Reporter's Allegation */}
                <div className="p-3 rounded-xl bg-rose-50/30 border border-rose-200/60 space-y-1">
                  <div className="text-[10px] font-bold text-rose-800 uppercase flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Reported Violation Details:</span>
                  </div>
                  <p className="text-xs text-navy font-medium leading-relaxed">&quot;{item.details}&quot;</p>
                  {item.adminActionNote && (
                    <div className="pt-1.5 border-t border-rose-200/50 text-[10px] text-text-muted">
                      Admin Note: <strong className="text-navy">{item.adminActionNote}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Moderators */}
              {item.status === 'PENDING_REVIEW' && (
                <div className="pt-2 flex items-center justify-end space-x-2 border-t border-border/60">
                  <button
                    onClick={() => handleDismissReport(item)}
                    className="px-3 py-1.5 bg-surface hover:bg-surface-muted text-navy rounded-lg font-bold text-xs border border-border transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dismiss Report</span>
                  </button>

                  <button
                    onClick={() => handleWarnAuthor(item)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-xs border border-amber-200 transition-colors flex items-center space-x-1"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>Warn Author</span>
                  </button>

                  <button
                    onClick={() => handleTakedownPost(item)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Take Down Post</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
