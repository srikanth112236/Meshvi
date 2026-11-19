import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  MessageSquareQuote,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MeshviLogo } from '../../components/brand/MeshviLogo';
import { StarRating } from '../../components/reviews/StarRating';
import {
  canModerateReviews,
  deleteReviewAsModerator,
  fetchModerationQueue,
  ModerationResponse,
  ModerationReview,
  moderateReview,
  REVIEW_CATEGORY_LABELS,
  REVIEW_STATUS_LABELS,
  ReviewStatus,
} from '../../services/reviewsService';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const statusStyles: Record<ReviewStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  HIDDEN: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const ReviewsManagePage: React.FC = () => {
  const { user, token, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<ModerationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forbidden, setForbidden] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'ALL' | ReviewStatus>('ALL');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const allowed = canModerateReviews(user);

  const loadQueue = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    setForbidden(false);
    try {
      const response = await fetchModerationQueue(token);
      setData(response);
      setReplyDrafts(
        Object.fromEntries(response.reviews.map((review) => [review.id, review.adminReply || ''])),
      );
    } catch (err: any) {
      if (err?.status === 403) {
        setForbidden(true);
      } else {
        setError(err?.message || 'Unable to load the moderation queue.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token && allowed) {
      loadQueue();
    }
  }, [authLoading, token, allowed]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = data?.reviews || [];
    return list.filter((review) => {
      if (statusFilter !== 'ALL' && review.status !== statusFilter) return false;
      if (
        query &&
        !`${review.title || ''} ${review.message} ${review.author.name || ''} ${
          review.author.email
        }`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [data, statusFilter, search]);

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setActionError('');
    try {
      await action();
      await loadQueue();
    } catch (err: any) {
      setActionError(err?.message || 'Action failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleStatus = (review: ModerationReview, status: ReviewStatus) =>
    runAction(review.id, () => moderateReview(token as string, review.id, { status }));

  const handleReply = (review: ModerationReview) =>
    runAction(review.id, () =>
      moderateReview(token as string, review.id, {
        adminReply: replyDrafts[review.id] ?? '',
      }),
    );

  const handleDelete = (review: ModerationReview) => {
    if (!window.confirm(`Permanently delete this review by ${review.author.email}?`)) return;
    runAction(review.id, () => deleteReviewAsModerator(token as string, review.id));
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Minimal standalone header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="shrink-0">
              <MeshviLogo size="sm" variant="full" className="h-7" />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wide">
              <Lock className="w-3 h-3" />
              Review moderation
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/app/reviews"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-surface-muted text-navy text-[11px] font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reviews wall</span>
            </Link>
            <div className="hidden md:block text-right leading-tight">
              <div className="text-[11px] font-bold text-navy max-w-[220px] truncate">
                {user?.email}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wide text-amber-700">
                {user?.roles?.includes('SUPER_ADMIN') ? 'Super Admin' : 'Allow-listed moderator'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-2 rounded-xl border border-border text-text-muted hover:text-danger hover:bg-danger/5 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-xs text-text-muted">Verifying moderation clearance...</p>
          </div>
        ) : !allowed || forbidden ? (
          <div className="max-w-lg mx-auto mt-10 rounded-2xl border border-border bg-surface p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-navy">Moderation access restricted</h1>
            <p className="text-xs text-text-muted leading-relaxed">
              This console is limited to <strong>meshviconnect@gmail.com</strong>,{' '}
              <strong>vedasynk@gmail.com</strong>, and Super Admin accounts. You are signed in as{' '}
              <strong>{user?.email || 'a guest'}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Link
                to="/app/reviews"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors"
              >
                Back to reviews
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border hover:bg-surface-muted text-navy text-xs font-bold transition-colors"
              >
                Switch account
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  Restricted console
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight">
                  Member Review Moderation
                </h1>
                <p className="text-xs sm:text-sm text-text-muted max-w-2xl">
                  Approve reviews for the member reviews wall, hide unsuitable content, reply
                  officially, or
                  remove spam. Every action is written to the audit log.
                </p>
              </div>

              <button
                type="button"
                onClick={loadQueue}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-border hover:bg-surface-muted text-navy text-xs font-bold transition-colors disabled:opacity-60 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
              <StatCard
                label="Total reviews"
                value={stats?.total ?? 0}
                icon={MessageSquareQuote}
                accent="text-navy"
              />
              <StatCard
                label="Pending"
                value={stats?.pending ?? 0}
                icon={Clock}
                accent="text-amber-700"
              />
              <StatCard
                label="Published"
                value={stats?.published ?? 0}
                icon={CheckCircle2}
                accent="text-emerald-700"
              />
              <StatCard
                label="Hidden"
                value={stats?.hidden ?? 0}
                icon={EyeOff}
                accent="text-slate-600"
              />
              <StatCard
                label="Public average"
                value={stats?.averageRating ? stats.averageRating.toFixed(1) : '—'}
                icon={Star}
                accent="text-amber-600"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                {(['ALL', 'PENDING', 'PUBLISHED', 'HIDDEN'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-colors ${
                      statusFilter === status
                        ? 'bg-navy text-white border-navy'
                        : 'bg-surface text-text-muted border-border hover:text-navy'
                    }`}
                  >
                    {status === 'ALL' ? 'All' : REVIEW_STATUS_LABELS[status]}
                    {status !== 'ALL' && stats
                      ? ` (${stats[status.toLowerCase() as 'pending' | 'published' | 'hidden']})`
                      : ''}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search email, name or content"
                  className="w-full sm:w-64 pl-8 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                />
              </div>
            </div>

            {actionError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/5 p-3 text-[11px] text-danger">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger/5 p-3 text-[11px] text-danger">
                <span className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </span>
                <button type="button" onClick={loadQueue} className="font-bold underline">
                  Retry
                </button>
              </div>
            )}

            {loading && !data ? (
              <div className="rounded-2xl border border-border bg-surface p-16 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-xs text-text-muted">Loading moderation queue...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-14 text-center space-y-3">
                <Users className="w-8 h-8 text-text-muted mx-auto" />
                <h3 className="text-sm font-bold text-navy">Nothing in this view</h3>
                <p className="text-xs text-text-muted">
                  {search || statusFilter !== 'ALL'
                    ? 'Try clearing the search or status filter.'
                    : 'Reviews will appear here as members submit them.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((review) => {
                  const busy = busyId === review.id;
                  const expanded = expandedId === review.id;
                  return (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-border bg-surface p-5 shadow-2xs"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                statusStyles[review.status]
                              }`}
                            >
                              {REVIEW_STATUS_LABELS[review.status]}
                            </span>
                            <StarRating value={review.rating} size="sm" />
                            <span className="text-[10px] font-bold text-text-muted">
                              {review.rating}/5
                            </span>
                            <span className="text-[10px] text-text-muted">
                              &bull; {REVIEW_CATEGORY_LABELS[review.category]}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              &bull; {formatDate(review.createdAt)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="font-bold text-navy">
                              {review.author.name || review.author.email.split('@')[0]}
                            </span>
                            <span className="inline-flex items-center gap-1 text-text-muted">
                              <BadgeCheck className="w-3 h-3 text-primary" />
                              {review.author.email}
                            </span>
                            {review.isAnonymous && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-surface-muted text-[9px] font-bold uppercase text-text-muted">
                                <EyeOff className="w-2.5 h-2.5" />
                                Anonymous to members
                              </span>
                            )}
                          </div>

                          {review.title && (
                            <h3 className="text-sm font-bold text-navy">{review.title}</h3>
                          )}
                          <p className="text-xs leading-relaxed text-text-muted whitespace-pre-line">
                            {review.message}
                          </p>

                          {review.adminReply && !expanded && (
                            <div className="rounded-xl border border-primary/20 bg-primary-soft/40 p-3">
                              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                                <ShieldCheck className="w-3 h-3" />
                                Published reply
                                {review.repliedAt ? ` • ${formatDateTime(review.repliedAt)}` : ''}
                              </div>
                              <p className="mt-1 text-[11px] text-navy">{review.adminReply}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 lg:w-40">
                          <button
                            type="button"
                            disabled={busy || review.status === 'PUBLISHED'}
                            onClick={() => handleStatus(review, 'PUBLISHED')}
                            className="flex-1 lg:w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors disabled:opacity-40"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Publish
                          </button>
                          <button
                            type="button"
                            disabled={busy || review.status === 'HIDDEN'}
                            onClick={() => handleStatus(review, 'HIDDEN')}
                            className="flex-1 lg:w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-slate-700 text-[11px] font-bold transition-colors disabled:opacity-40"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                            Hide
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setExpandedId(expanded ? null : review.id)}
                            className="flex-1 lg:w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 bg-primary-soft hover:bg-primary-soft/70 text-primary text-[11px] font-bold transition-colors disabled:opacity-40"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {review.adminReply ? 'Edit reply' : 'Reply'}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDelete(review)}
                            className="flex-1 lg:w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-danger/20 text-danger hover:bg-danger/5 text-[11px] font-bold transition-colors disabled:opacity-40"
                          >
                            {busy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>

                      {expanded && (
                        <div className="mt-4 rounded-xl border border-border bg-surface-muted/40 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                              Official response (visible to members)
                            </label>
                            <button
                              type="button"
                              onClick={() => setExpandedId(null)}
                              className="p-1 text-text-muted hover:text-navy"
                              aria-label="Close reply editor"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            maxLength={2000}
                            value={replyDrafts[review.id] ?? ''}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))
                            }
                            placeholder="Write a short, helpful response from the MESHVI team..."
                            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-focus focus:outline-none resize-none"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-text-muted">
                              {(replyDrafts[review.id] ?? '').length}/2000 &bull; Leave empty to
                              clear
                            </span>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleReply(review)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-[11px] font-bold transition-colors disabled:opacity-60"
                            >
                              {busy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              Save reply
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) => (
  <div className="rounded-2xl border border-border bg-surface p-3.5 shadow-2xs">
    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-text-muted">
      <span>{label}</span>
      <Icon className={`w-3.5 h-3.5 ${accent}`} />
    </div>
    <div className={`mt-1.5 text-xl font-black ${accent}`}>{value}</div>
  </div>
);
