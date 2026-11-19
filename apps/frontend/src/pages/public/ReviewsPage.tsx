import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Edit3,
  Filter,
  Loader2,
  Lock,
  MessageSquareQuote,
  PenLine,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StarRating } from '../../components/reviews/StarRating';
import {
  canModerateReviews,
  createReview,
  deleteMyReview,
  fetchMyReview,
  fetchPublicReviews,
  MyReview,
  PublicReview,
  PublicReviewsResponse,
  REVIEW_CATEGORY_LABELS,
  REVIEW_STATUS_LABELS,
  ReviewCategory,
  ReviewPayload,
  updateMyReview,
} from '../../services/reviewsService';

const EMPTY_FORM = {
  rating: 0,
  category: 'GENERAL' as ReviewCategory,
  title: '',
  message: '',
  isAnonymous: false,
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'MS';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  HIDDEN: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const ReviewsPage: React.FC = () => {
  const { user, token, loading: authLoading } = useAuth();

  const [data, setData] = useState<PublicReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [myReview, setMyReview] = useState<MyReview | null>(null);
  const [myReviewLoading, setMyReviewLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitState, setSubmitState] = useState<{
    loading: boolean;
    success?: string;
    error?: string;
  }>({ loading: false });
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ReviewCategory>('ALL');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [search, setSearch] = useState('');

  const canModerate = canModerateReviews(user);

  const loadPublic = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetchPublicReviews();
      setData(response);
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to load member reviews right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublic();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMine = async () => {
      if (!token) {
        setMyReview(null);
        return;
      }
      setMyReviewLoading(true);
      try {
        const review = await fetchMyReview(token);
        if (!cancelled) setMyReview(review);
      } catch {
        if (!cancelled) setMyReview(null);
      } finally {
        if (!cancelled) setMyReviewLoading(false);
      }
    };

    loadMine();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = data?.stats;
  const reviews = data?.reviews || [];

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = reviews.filter((review) => {
      if (categoryFilter !== 'ALL' && review.category !== categoryFilter) return false;
      if (ratingFilter > 0 && review.rating !== ratingFilter) return false;
      if (
        query &&
        !`${review.title || ''} ${review.message} ${review.authorName}`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reviews, categoryFilter, ratingFilter, search, sortBy]);

  const startEditing = () => {
    if (!myReview) return;
    setForm({
      rating: myReview.rating,
      category: myReview.category,
      title: myReview.title || '',
      message: myReview.message,
      isAnonymous: myReview.isAnonymous,
    });
    setEditing(true);
    setSubmitState({ loading: false });
    setNotice(null);
    window.setTimeout(() => {
      document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(false);
    setSubmitState({ loading: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setSubmitState({ loading: false, error: 'Please sign in to rate MESHVI.' });
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      setSubmitState({ loading: false, error: 'Please choose a star rating from 1 to 5.' });
      return;
    }
    if (form.message.trim().length < 10) {
      setSubmitState({ loading: false, error: 'Please share at least a few words (10+ characters).' });
      return;
    }

    setSubmitState({ loading: true });
    const payload: ReviewPayload = {
      rating: form.rating,
      category: form.category,
      title: form.title.trim() || undefined,
      message: form.message.trim(),
      isAnonymous: form.isAnonymous,
    };

    try {
      const saved = myReview
        ? await updateMyReview(token, payload)
        : await createReview(token, payload);
      setMyReview(saved);
      setForm(EMPTY_FORM);
      setEditing(false);
      setSubmitState({ loading: false });
      setNotice({
        type: 'success',
        message:
          saved.status === 'PUBLISHED'
            ? 'Your review is live on the public wall. Thank you!'
            : 'Thank you! Your review is now in the moderation queue and will appear shortly.',
      });
      await loadPublic();
    } catch (err: any) {
      setSubmitState({
        loading: false,
        error: err?.message || 'We could not save your review. Please try again.',
      });
    }
  };

  const handleDelete = async () => {
    if (!token || !myReview) return;
    if (!window.confirm('Remove your review from MESHVI? This cannot be undone.')) return;

    try {
      await deleteMyReview(token);
      setMyReview(null);
      resetForm();
      setNotice({ type: 'success', message: 'Your review has been removed.' });
      await loadPublic();
    } catch (err: any) {
      setSubmitState({ loading: false, error: err?.message || 'Could not remove your review.' });
    }
  };

  const totalPublished = stats?.totalPublished || 0;
  const averageRating = stats?.averageRating || 0;

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-grid-pattern border-b border-border">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[320px] w-[720px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-[11px] font-bold text-navy shadow-xs mb-5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Member Reviews</span>
              <span className="text-text-muted">&bull;</span>
              <span className="text-text-muted">Verified MESHVI accounts only</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-navy tracking-tight leading-[1.12]">
              Real feedback from the people <span className="text-primary">building on MESHVI</span>.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-text-muted max-w-2xl leading-relaxed">
              Every rating is submitted by a signed-in member, reviewed by our team, and published
              here. Tell us what works, what does not, and what you want next.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 sm:gap-8 items-center rounded-2xl border border-border bg-surface/90 backdrop-blur p-5 sm:p-6 shadow-sm max-w-3xl">
            <div className="flex items-center gap-4 sm:border-r sm:border-border sm:pr-8">
              <div className="text-5xl font-black text-navy leading-none">
                {totalPublished > 0 ? averageRating.toFixed(1) : '—'}
              </div>
              <div className="space-y-1">
                <StarRating value={averageRating} size="md" />
                <p className="text-xs text-text-muted">
                  {totalPublished > 0
                    ? `Based on ${totalPublished} published review${totalPublished === 1 ? '' : 's'}`
                    : 'Be the first member to share a review'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats?.ratingDistribution?.[String(star)] || 0;
                const pct = totalPublished > 0 ? Math.round((count / totalPublished) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-[11px] text-text-muted">
                    <span className="w-3 font-bold text-navy">{star}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {token ? (
              myReview ? (
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  <span>Update your review</span>
                </button>
              ) : (
                <a
                  href="#review-form"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  <span>Rate MESHVI</span>
                </a>
              )
            ) : (
              <Link
                to="/login?next=%2Freviews"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Sign in to rate MESHVI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {canModerate && (
              <Link
                to="/reviews/manage"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border hover:bg-surface-muted text-navy text-xs font-bold transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Moderation console</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-8 items-start">
          {/* Review form / sign-in */}
          <aside className="lg:sticky lg:top-20 space-y-4">
            {notice && (
              <div
                className={`flex items-start gap-2 rounded-2xl border p-4 text-[11px] leading-relaxed ${
                  notice.type === 'success'
                    ? 'border-success/20 bg-success/5 text-success'
                    : 'border-danger/20 bg-danger/5 text-danger'
                }`}
              >
                {notice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <div className="flex-1">{notice.message}</div>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  className="text-current/60 hover:text-current"
                  aria-label="Dismiss notice"
                >
                  ×
                </button>
              </div>
            )}

            {authLoading ? (
              <div className="rounded-2xl border border-border bg-surface p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : !token ? (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
                <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy">Sign in to share your review</h2>
                  <p className="mt-1 text-xs text-text-muted leading-relaxed">
                    Ratings come from real MESHVI members. Sign in to publish one review, then
                    update it any time.
                  </p>
                </div>
                <Link
                  to="/login?next=%2Freviews"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors"
                >
                  <span>Sign in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <p className="text-[11px] text-center text-text-muted">
                  New to MESHVI?{' '}
                  <Link to="/register" className="text-primary font-semibold hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>
            ) : myReviewLoading ? (
              <div className="rounded-2xl border border-border bg-surface p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : myReview && !editing ? (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-navy">Your review</h2>
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${
                      statusStyles[myReview.status]
                    }`}
                  >
                    {REVIEW_STATUS_LABELS[myReview.status]}
                  </span>
                </div>

                <div className="space-y-2">
                  <StarRating value={myReview.rating} size="md" />
                  <div className="text-[11px] font-semibold text-text-muted">
                    {REVIEW_CATEGORY_LABELS[myReview.category]} &bull; {formatDate(myReview.createdAt)}
                  </div>
                  {myReview.title && (
                    <div className="text-sm font-bold text-navy">{myReview.title}</div>
                  )}
                  <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
                    {myReview.message}
                  </p>
                </div>

                {myReview.adminReply && (
                  <div className="rounded-xl border border-primary/20 bg-primary-soft/60 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      MESHVI Team
                    </div>
                    <p className="mt-1 text-xs text-navy leading-relaxed">{myReview.adminReply}</p>
                  </div>
                )}

                <p className="text-[11px] text-text-muted">
                  {myReview.status === 'PENDING'
                    ? 'Your review is awaiting moderation. It will appear publicly once approved.'
                    : myReview.status === 'HIDDEN'
                    ? 'This review is currently hidden from the public wall by a moderator.'
                    : 'Your review is live on the public wall.'}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={startEditing}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-surface-muted text-navy text-xs font-bold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-danger/20 text-danger hover:bg-danger/5 text-xs font-bold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <form
                id="review-form"
                onSubmit={handleSubmit}
                className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4 scroll-mt-24"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-navy">
                    {editing ? 'Update your review' : 'Rate the MESHVI application'}
                  </h2>
                  {editing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-[11px] font-semibold text-text-muted hover:text-navy"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
                    Your rating *
                  </label>
                  <div className="flex items-center gap-3">
                    <StarRating
                      value={form.rating}
                      onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
                      size="lg"
                      label="Choose a rating"
                    />
                    <span className="text-xs font-bold text-navy">
                      {form.rating > 0 ? `${form.rating}/5` : 'Select'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    What is this about?
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value as ReviewCategory,
                      }))
                    }
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                  >
                    {(Object.keys(REVIEW_CATEGORY_LABELS) as ReviewCategory[]).map((key) => (
                      <option key={key} value={key}>
                        {REVIEW_CATEGORY_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Headline
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="A sharper way to find partners"
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    Your feedback *
                  </label>
                  <textarea
                    rows={5}
                    required
                    maxLength={2000}
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us what worked, what felt confusing, or what you would like to see next."
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-focus focus:outline-none resize-none"
                  />
                  <div className="mt-1 text-right text-[10px] text-text-muted">
                    {form.message.length}/2000
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isAnonymous}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, isAnonymous: e.target.checked }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-focus"
                  />
                  <span className="text-[11px] text-text-muted leading-relaxed">
                    Publish my feedback anonymously. Your name and photo will be hidden.
                  </span>
                </label>

                {submitState.error && (
                  <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/5 p-3 text-[11px] text-danger">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitState.error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitState.loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors disabled:opacity-60"
                >
                  {submitState.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{editing ? 'Submit for re-approval' : 'Submit review'}</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-text-muted">
                  Reviews are moderated before appearing publicly.
                </p>
              </form>
            )}

            <div className="rounded-2xl border border-border bg-surface-muted/50 p-4 flex items-start gap-2.5">
              <BadgeCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-muted leading-relaxed">
                One review per member. Editing your review sends it back for a quick moderation
                check.
              </p>
            </div>
          </aside>

          {/* Public wall */}
          <main className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg font-black text-navy tracking-tight">What members are saying</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {filteredReviews.length} of {reviews.length} published review
                  {reviews.length === 1 ? '' : 's'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search reviews"
                    className="w-44 pl-8 pr-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'highest' | 'lowest')}
                  className="px-2.5 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-focus focus:outline-none"
                  aria-label="Sort reviews"
                >
                  <option value="recent">Newest</option>
                  <option value="highest">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                </select>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-muted mr-1">
                <Filter className="w-3.5 h-3.5" />
                Filter
              </span>
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('ALL');
                  setRatingFilter(0);
                }}
                className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-colors ${
                  categoryFilter === 'ALL' && ratingFilter === 0
                    ? 'bg-navy text-white border-navy'
                    : 'bg-surface text-text-muted border-border hover:text-navy'
                }`}
              >
                All
              </button>
              {(Object.keys(REVIEW_CATEGORY_LABELS) as ReviewCategory[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategoryFilter(key)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-colors ${
                    categoryFilter === key
                      ? 'bg-navy text-white border-navy'
                      : 'bg-surface text-text-muted border-border hover:text-navy'
                  }`}
                >
                  {REVIEW_CATEGORY_LABELS[key]}
                  {stats?.categoryCounts?.[key] ? (
                    <span className="ml-1 opacity-60">{stats.categoryCounts[key]}</span>
                  ) : null}
                </button>
              ))}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="px-3 py-1.5 rounded-full border border-border bg-surface text-[11px] font-semibold text-text-muted focus:outline-none focus:ring-2 focus:ring-focus"
                aria-label="Filter by star rating"
              >
                <option value={0}>All ratings</option>
                <option value={5}>5 stars</option>
                <option value={4}>4 stars</option>
                <option value={3}>3 stars</option>
                <option value={2}>2 stars</option>
                <option value={1}>1 star</option>
              </select>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-border bg-surface p-16 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-xs text-text-muted">Loading member reviews...</p>
              </div>
            ) : loadError ? (
              <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center space-y-3">
                <AlertCircle className="w-6 h-6 text-danger mx-auto" />
                <p className="text-xs text-danger">{loadError}</p>
                <button
                  type="button"
                  onClick={loadPublic}
                  className="px-4 py-2 rounded-xl bg-navy text-white text-xs font-bold"
                >
                  Try again
                </button>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-14 text-center space-y-3">
                <MessageSquareQuote className="w-8 h-8 text-text-muted mx-auto" />
                <h3 className="text-sm font-bold text-navy">No reviews match this view yet</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  {reviews.length === 0
                    ? 'Published reviews will appear here. Be the first verified member to share your experience.'
                    : 'Try clearing the filters to see more member feedback.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
};

const ReviewCard: React.FC<{ review: PublicReview }> = ({ review }) => {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xs hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {review.authorAvatarUrl ? (
            <img
              src={review.authorAvatarUrl}
              alt={review.authorName}
              className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initialsOf(review.authorName)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-navy truncate">{review.authorName}</span>
              {!review.isAnonymous && (
                <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              )}
            </div>
            <div className="text-[11px] text-text-muted truncate">
              {review.isAnonymous
                ? 'Anonymous member'
                : review.authorHeadline || 'MESHVI member'}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <StarRating value={review.rating} size="sm" />
          <div className="mt-1 text-[10px] text-text-muted">{formatDate(review.createdAt)}</div>
        </div>
      </div>

      <div className="mt-4">
        <span className="inline-flex items-center rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
          {REVIEW_CATEGORY_LABELS[review.category]}
        </span>
        {review.title && <h3 className="mt-2 text-sm font-bold text-navy">{review.title}</h3>}
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted whitespace-pre-line">
          {review.message}
        </p>
      </div>

      {review.adminReply && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary-soft/50 p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            <ShieldCheck className="w-3.5 h-3.5" />
            Response from MESHVI
          </div>
          <p className="mt-1 text-xs leading-relaxed text-navy">{review.adminReply}</p>
        </div>
      )}
    </article>
  );
};
