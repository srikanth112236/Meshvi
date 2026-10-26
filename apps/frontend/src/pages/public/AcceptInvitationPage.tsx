import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Mail,
  Loader2,
  KeyRound,
} from 'lucide-react';

interface InvitationPreview {
  isValid: boolean;
  status: string;
  isExpired: boolean;
  invitedEmail: string;
  expiresAt: string;
  company: {
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    headquartersCity?: string;
    headquartersCountry?: string;
    description?: string;
  };
}

export const AcceptInvitationPage: React.FC = () => {
  const { token: urlTokenParam } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('token');
  const initialToken = urlTokenParam || tokenFromQuery || '';

  const { token: authToken, user } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [inviteToken, setInviteToken] = useState(initialToken);
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptedCompany, setAcceptedCompany] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Fetch invitation preview if a token is present
  useEffect(() => {
    if (!inviteToken.trim()) {
      setPreview(null);
      return;
    }

    const fetchPreview = async () => {
      setLoadingPreview(true);
      setError('');
      try {
        const res = await fetch(
          `/api/v1/companies/invitations/preview?token=${encodeURIComponent(inviteToken.trim())}`
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setPreview(data.data);
        } else {
          setPreview(null);
          setError(data.error?.message || 'Invalid or expired invitation token.');
        }
      } catch {
        setPreview(null);
        setError('Failed to resolve invitation token details.');
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [inviteToken]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken.trim()) {
      setError('Please provide a valid invitation token.');
      return;
    }

    if (!authToken) {
      setError('You must be logged in to accept this invitation. Please log in or register first.');
      return;
    }

    setAccepting(true);
    setError('');

    try {
      const res = await fetch('/api/v1/companies/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: inviteToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to accept invitation.');
      }

      const companyName = data.data?.companyName || preview?.company?.name || 'the organization';
      setAcceptedCompany(companyName);
      showToast({
        title: 'Joined Organization Successfully',
        message: `Your professional profile is now linked to ${companyName}.`,
        type: 'success',
      });
    } catch (err: any) {
      setError(err.message || 'Error accepting invitation token.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-navy py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src="/meshvi-mark.png"
            alt="Meshvi"
            className="w-14 h-14 object-contain mx-auto mb-2 drop-shadow-xs"
          />
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">
            Organization Affiliation Invitation
          </h1>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Accept your verified corporate invitation to join your company&apos;s commercial network node on MESHVI.
          </p>
        </div>

        {/* Accepted Success Screen */}
        {acceptedCompany ? (
          <div className="bg-surface border border-emerald-200 rounded-2xl p-8 text-center space-y-5 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-navy">Welcome to {acceptedCompany}!</h2>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                You are now an authorized member of {acceptedCompany}. Your profile displays your verified corporate affiliation.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate('/app/home')}
                className="py-2.5 px-6 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>Go to Personal Discovery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Acceptance Form */
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-center space-x-2 text-xs text-danger">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Token Input Field */}
            <form onSubmit={handleAccept} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5 flex items-center justify-between">
                  <span>Invitation Token</span>
                  <span className="text-[10px] text-text-muted font-normal">Supplied by Company Admin</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value.trim())}
                    placeholder="Enter 64-character invitation token..."
                    className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-xs font-mono text-navy focus:ring-2 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Invitation Preview Card */}
              {loadingPreview && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3 text-xs text-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Validating invitation token cryptographic signature...</span>
                </div>
              )}

              {preview && preview.company && (
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                    <span>Target Enterprise: {preview.company.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-text-muted block">Domain:</span>
                      <span className="font-semibold text-navy">@{preview.company.domain || 'Verified Domain'}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Industry:</span>
                      <span className="font-semibold text-navy">{preview.company.industry || 'General Industry'}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Invited Recipient:</span>
                      <span className="font-semibold text-navy">{preview.invitedEmail}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block">Token Status:</span>
                      <span className="font-semibold text-emerald-600">ACTIVE & READY</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Check */}
              {!authToken ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                  <div className="font-bold flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Authentication Required</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    You must sign in or register with your email to claim membership in this organization.
                  </p>
                  <div className="pt-2 flex space-x-3">
                    <Link
                      to={`/login?redirect=/invite/${encodeURIComponent(inviteToken)}`}
                      className="py-1.5 px-3 bg-navy text-white text-xs font-bold rounded-lg hover:bg-black"
                    >
                      Log In First
                    </Link>
                    <Link
                      to={`/register?redirect=/invite/${encodeURIComponent(inviteToken)}`}
                      className="py-1.5 px-3 bg-white border border-border text-navy text-xs font-bold rounded-lg hover:bg-slate-50"
                    >
                      Register Account
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-border rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-text-muted" />
                    <span>Logged in as: <strong className="text-navy">{user?.email}</strong></span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Session Active</span>
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={accepting || !authToken || !inviteToken.trim() || (preview !== null && !preview.isValid)}
                className="w-full py-3 px-4 bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Joining Organization...</span>
                  </>
                ) : (
                  <>
                    <span>Accept Invitation & Join Company</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="text-center">
          <Link to="/app/home" className="text-xs font-semibold text-text-muted hover:text-navy inline-flex items-center space-x-1">
            <span>&larr; Return to MESHVI</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
