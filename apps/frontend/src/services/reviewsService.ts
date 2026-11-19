export type ReviewCategory =
  | 'GENERAL'
  | 'USABILITY'
  | 'FEATURE_REQUEST'
  | 'BUG_REPORT'
  | 'SUPPORT';

export type ReviewStatus = 'PENDING' | 'PUBLISHED' | 'HIDDEN';

export interface PublicReview {
  id: string;
  rating: number;
  category: ReviewCategory;
  title: string | null;
  message: string;
  isAnonymous: boolean;
  authorName: string;
  authorHeadline: string | null;
  authorAvatarUrl: string | null;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalPublished: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
  categoryCounts: Record<string, number>;
}

export interface PublicReviewsResponse {
  stats: ReviewStats;
  reviews: PublicReview[];
}

export interface MyReview {
  id: string;
  rating: number;
  category: ReviewCategory;
  title: string | null;
  message: string;
  isAnonymous: boolean;
  status: ReviewStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationStats {
  total: number;
  pending: number;
  published: number;
  hidden: number;
  averageRating: number;
}

export interface ModerationReview {
  id: string;
  rating: number;
  category: ReviewCategory;
  title: string | null;
  message: string;
  isAnonymous: boolean;
  status: ReviewStatus;
  adminReply: string | null;
  repliedAt: string | null;
  repliedBy: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    name: string | null;
    headline: string | null;
    avatarUrl: string | null;
  };
}

export interface ModerationResponse {
  stats: ModerationStats;
  reviews: ModerationReview[];
}

export interface ReviewPayload {
  rating: number;
  category: ReviewCategory;
  title?: string;
  message: string;
  isAnonymous: boolean;
}

export const REVIEW_CATEGORY_LABELS: Record<ReviewCategory, string> = {
  GENERAL: 'Overall experience',
  USABILITY: 'Ease of use',
  FEATURE_REQUEST: 'Feature request',
  BUG_REPORT: 'Bug report',
  SUPPORT: 'Support',
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: 'Pending review',
  PUBLISHED: 'Published',
  HIDDEN: 'Hidden',
};

/** Emails allowed to open the moderation console (server enforces the same list). */
export const REVIEW_MODERATOR_EMAILS = ['meshviconnect@gmail.com', 'vedasynk@gmail.com'];

export function canModerateReviews(user: { email?: string | null; roles?: string[] } | null) {
  if (!user) return false;
  if ((user.roles || []).includes('SUPER_ADMIN')) return true;
  return REVIEW_MODERATOR_EMAILS.includes(String(user.email || '').trim().toLowerCase());
}

export class ReviewsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ReviewsApiError';
    this.status = status;
  }
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`/api/v1/reviews${path}`, { ...init, headers });
  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    const raw = json?.error ?? json?.message;
    const message = Array.isArray(raw)
      ? raw.join(', ')
      : typeof raw === 'string'
      ? raw
      : 'Unable to complete the request. Please try again.';
    throw new ReviewsApiError(message, res.status);
  }

  return json.data as T;
}

export function fetchPublicReviews(token: string) {
  return apiRequest<PublicReviewsResponse>('/public', {}, token);
}

export function fetchMyReviews(token: string) {
  return apiRequest<MyReview[]>('/me', {}, token);
}

export function createReview(token: string, payload: ReviewPayload) {
  return apiRequest<MyReview>(
    '',
    { method: 'POST', body: JSON.stringify(payload) },
    token,
  );
}

export function updateMyReview(token: string, id: string, payload: Partial<ReviewPayload>) {
  return apiRequest<MyReview>(
    `/me/${id}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  );
}

export function deleteMyReview(token: string, id: string) {
  return apiRequest<{ message: string }>(`/me/${id}`, { method: 'DELETE' }, token);
}

export function fetchModerationQueue(token: string, params?: { status?: ReviewStatus; q?: string }) {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.q) search.set('q', params.q);
  const suffix = search.toString() ? `?${search.toString()}` : '';
  return apiRequest<ModerationResponse>(`/moderation${suffix}`, {}, token);
}

export function moderateReview(
  token: string,
  id: string,
  payload: { status?: ReviewStatus; adminReply?: string },
) {
  return apiRequest<ModerationReview>(
    `/moderation/${id}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token,
  );
}

export function deleteReviewAsModerator(token: string, id: string) {
  return apiRequest<{ message: string }>(`/moderation/${id}`, { method: 'DELETE' }, token);
}
