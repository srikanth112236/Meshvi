import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export const DeleteAccountPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({
    type: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus({ type: 'error', message: 'Please enter a valid registered email address.' });
      return;
    }

    if (!confirmed) {
      setStatus({
        type: 'error',
        message: 'Please confirm that you acknowledge the terms of the account deletion process.',
      });
      return;
    }

    try {
      setLoading(true);

      // Backend global prefix is /api/v1 (vite proxies /api -> http://localhost:3500 in dev, and VITE_API_URL in prod)
      const res = await axios.post('/api/v1/users/request-deletion', {
        email: trimmedEmail.toLowerCase(),
        confirm: confirmed,
      });

      setStatus({
        type: 'success',
        message:
          res.data?.message ||
          'If an account exists with this email address, a deletion request has been scheduled. All associated data will be permanently purged after the 14-day grace period.',
      });
      setEmail('');
      setConfirmed(false);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Unable to process your deletion request at this moment. Please try again later or reach out to support.';
      setStatus({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-surface border border-border rounded-2xl shadow-sm p-6 sm:p-10">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-text-muted hover:text-navy mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Home
        </Link>

        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">Request Account Deletion</h1>
            <span className="text-xs font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
              Google Play Policy Compliance
            </span>
          </div>
        </div>

        <p className="text-sm text-text-muted mt-2 mb-6 leading-relaxed">
          In accordance with Google Play Store data safety and user privacy guidelines, you can
          submit a request to permanently delete your MESHVI account and all associated personal data
          without needing to log in (for instance, if you have already uninstalled the application).
        </p>

        {/* Retention Policy Box */}
        <div className="bg-surface-muted border border-border/80 rounded-xl p-4 mb-6">
          <h2 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            What happens when you submit this request?
          </h2>
          <ul className="text-xs text-text-muted space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Your account will be deactivated immediately upon receiving your request.</li>
            <li>
              A <strong>14-day grace period</strong> is applied so you may cancel the request by contacting support.
            </li>
            <li>
              After 14 days, your profile, authentication credentials, and personal data will be{' '}
              <strong>permanently hard-deleted</strong> from our primary databases by automated daily jobs.
            </li>
          </ul>
        </div>

        {/* Status Messages */}
        {status.message && (
          <div
            className={`p-4 rounded-xl text-sm mb-6 flex items-start gap-3 ${
              status.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                : 'bg-danger/10 text-danger border border-danger/20'
            }`}
            role="alert"
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">{status.message}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">
              Registered Account Email <span className="text-danger">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={loading}
              placeholder="e.g. name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-navy text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 transition-all"
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
            <label htmlFor="confirm" className="text-xs text-text-muted cursor-pointer leading-relaxed">
              I acknowledge that I want to delete my MESHVI account and understand that all associated
              account details, profiles, and data will be permanently and irreversibly purged after the
              14-day grace window.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !confirmed}
            className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-danger text-white text-sm font-semibold hover:bg-danger/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Request...
              </>
            ) : (
              'Submit Account Deletion Request'
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-text-muted mt-6">
          Need assistance or want to cancel a recent deletion request? Reach out to us at{' '}
          <Link to="/contact" className="text-primary hover:underline font-medium">
            Contact Support
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
