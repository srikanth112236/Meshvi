import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Loader2,
  X,
  Mail,
  Clock,
  Trash2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

/**
 * Dynamically resolves the backend API origin based on the current execution environment.
 * Ensures that on meshvi.org / www.meshvi.org, requests target api.meshvi.org (port 3500)
 * rather than the static web server, avoiding 405 Method Not Allowed errors.
 */
const getBackendApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return ''; // Vite proxy to backend
    }
    if (host === 'meshvi.org' || host.endsWith('meshvi.org')) {
      return 'https://api.meshvi.org';
    }
  }

  const rawEnv = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (rawEnv) {
    return rawEnv.replace(/\/api\/v1\/?$/, '');
  }

  return 'https://api.meshvi.org';
};

export const DeleteAccountPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  // Calculate cutoff date (14 days from now) for display
  const purgeDate = new Date();
  purgeDate.setDate(purgeDate.getDate() + 14);
  const formattedPurgeDate = purgeDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid, registered email address.');
      return;
    }

    if (!confirmed) {
      setErrorMessage('Please acknowledge the terms checkbox before proceeding.');
      return;
    }

    setIsModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    setErrorMessage('');
    setLoading(true);

    const baseUrl = getBackendApiUrl();
    const endpoint = `${baseUrl}/api/v1/users/request-deletion`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          confirm: true,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || `Request failed with status ${response.status}. Please try again later.`
        );
      }

      setSubmittedEmail(trimmedEmail);
      setIsSuccess(true);
      setIsModalOpen(false);
      setEmail('');
      setConfirmed(false);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Unable to complete your request at this time. Please check your connection or contact support directly.'
      );
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setEmail('');
    setConfirmed(false);
    setErrorMessage('');
    setSubmittedEmail('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-surface border border-border rounded-2xl shadow-sm p-6 sm:p-10 relative">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-text-muted hover:text-navy mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Home
        </Link>

        {/* SUCCESS VIEW */}
        {isSuccess ? (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy tracking-tight">
                Deletion Request Registered
              </h2>
              <p className="text-sm text-text-muted mt-2 max-w-md mx-auto leading-relaxed">
                A scheduled account deletion request has been registered for:
              </p>
              <div className="inline-flex items-center gap-1.5 bg-surface-muted border border-border/80 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-navy mt-2">
                <Mail className="w-3.5 h-3.5 text-text-muted" />
                {submittedEmail}
              </div>
            </div>

            {/* Timeline breakdown */}
            <div className="bg-surface-muted/60 border border-border/70 rounded-xl p-5 text-left space-y-4">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                What happens next?
              </h3>

              <div className="space-y-3 text-xs text-text-muted">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-[11px]">
                    1
                  </div>
                  <div>
                    <strong className="text-navy">Immediate Account Deactivation:</strong> Your
                    account has been deactivated and hidden from public and partner search results.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[11px]">
                    2
                  </div>
                  <div>
                    <strong className="text-navy">14-Day Grace Window:</strong> Your data remains
                    retainable until <strong>{formattedPurgeDate}</strong> in case this request was
                    submitted accidentally.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0 font-bold text-[11px]">
                    3
                  </div>
                  <div>
                    <strong className="text-navy">Permanent Purge:</strong> On {formattedPurgeDate},
                    all profile information, credentials, and associated user data will be
                    permanently removed from all production databases.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-900 text-left flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Changed your mind? You can cancel this request at any time during the 14-day grace
                window by contacting our team at{' '}
                <a href="mailto:support@meshvi.org" className="font-semibold underline">
                  support@meshvi.org
                </a>
                .
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="px-5 py-2.5 rounded-lg bg-navy text-white text-xs font-semibold hover:bg-navy/90 transition-all text-center"
              >
                Return to MESHVI Home
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-lg border border-border bg-surface text-text-muted hover:text-navy text-xs font-semibold transition-all"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy tracking-tight">
                  Request Account Deletion
                </h1>
                <span className="text-xs font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                  Google Play Policy Compliance
                </span>
              </div>
            </div>

            <p className="text-sm text-text-muted mt-2 mb-6 leading-relaxed">
              In accordance with Google Play Store data safety policies, you can request permanent
              deletion of your MESHVI account and associated personal data directly from this public
              page without logging in (e.g., if you have already uninstalled the mobile app).
            </p>

            {/* Disclosure Notice Box */}
            <div className="bg-surface-muted border border-border/80 rounded-xl p-4 mb-6">
              <h2 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Data Deletion Scope & Retention Period
              </h2>
              <ul className="text-xs text-text-muted space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  Your account will be <strong>deactivated immediately</strong> upon request receipt.
                </li>
                <li>
                  A <strong>14-day retention period</strong> is observed so unintentional requests can
                  be revoked upon request.
                </li>
                <li>
                  After 14 days, your profile, authentication data, messages, and affiliations are{' '}
                  <strong>permanently hard-deleted</strong> by our automated daily jobs.
                </li>
              </ul>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                className="p-4 rounded-xl text-sm mb-6 flex items-start gap-3 bg-danger/10 text-danger border border-danger/20"
                role="alert"
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="leading-relaxed flex-1">
                  <p className="font-semibold text-xs uppercase tracking-wide">
                    Action Required
                  </p>
                  <p className="text-xs mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleOpenConfirmModal} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-navy uppercase tracking-wider mb-2"
                >
                  Registered Account Email <span className="text-danger">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={loading}
                  placeholder="e.g. user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-navy text-sm focus:outline-none focus:ring-2 focus:ring-danger/20 focus:border-danger disabled:opacity-60 transition-all"
                />
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input
                  id="confirm"
                  type="checkbox"
                  required
                  disabled={loading}
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-danger focus:ring-danger cursor-pointer"
                />
                <label
                  htmlFor="confirm"
                  className="text-xs text-text-muted cursor-pointer leading-relaxed select-none"
                >
                  I acknowledge that I wish to request deletion of my MESHVI account and understand that
                  all associated profile credentials and user data will be permanently purged after the
                  14-day grace window.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !confirmed || !email.trim()}
                className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-danger text-white text-sm font-semibold hover:bg-danger/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Submit Account Deletion Request
              </button>
            </form>

            <div className="border-t border-border mt-6 pt-5 flex items-center justify-between text-[11px] text-text-muted">
              <span>Need help or want to talk to an agent?</span>
              <Link
                to="/contact"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                Contact Support <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* CONFIRMATION MODAL DIALOG */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fadeIn">
            <div
              className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative animate-scaleUp"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                onClick={() => !loading && setIsModalOpen(false)}
                disabled={loading}
                className="absolute top-4 right-4 text-text-muted hover:text-navy transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h2 className="text-xl font-bold text-navy tracking-tight">
                Confirm Account Deletion
              </h2>

              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                You are about to schedule the permanent deletion of the account associated with:
              </p>

              <div className="bg-surface-muted border border-border/80 px-3.5 py-2.5 rounded-lg text-xs font-mono font-semibold text-danger my-3 break-all flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-text-muted" />
                {email.trim().toLowerCase()}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 my-4 text-xs text-amber-800 space-y-1.5 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 text-amber-900">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  Irreversible After 14 Days
                </p>
                <p>
                  Upon clicking confirm, your access is terminated immediately. All profile details,
                  work experiences, sent connections, and deal rooms will be permanently erased on{' '}
                  <strong>{formattedPurgeDate}</strong>.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg border border-border bg-surface text-text-muted hover:text-navy text-xs font-semibold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinalSubmit}
                  className="w-full sm:w-1/2 flex items-center justify-center py-2.5 px-4 rounded-lg bg-danger text-white text-xs font-semibold hover:bg-danger/90 transition-all disabled:opacity-50 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Yes, Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountPage;
