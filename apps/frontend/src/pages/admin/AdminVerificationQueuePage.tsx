import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  User,
  Search,
  Filter,
  ExternalLink,
  RefreshCw,
  FileText,
  Mail,
  Linkedin,
} from 'lucide-react';

interface VerificationQueueItem {
  id: string;
  type: 'PROFILE' | 'COMPANY' | 'CLAIM';
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
  domain?: string;
  email?: string;
  linkedinUrl?: string;
  score?: number;
  metadata?: any;
}

export const AdminVerificationQueuePage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    summary: { totalPending: number; pendingProfiles: number; pendingCompanies: number; pendingClaims: number };
    items: VerificationQueueItem[];
  }>({
    summary: { totalPending: 0, pendingProfiles: 0, pendingCompanies: 0, pendingClaims: 0 },
    items: [],
  });
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PROFILE' | 'COMPANY' | 'CLAIM'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/verifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const raw = json.data || {};
        const profileItems: VerificationQueueItem[] = (raw.profiles || []).map((p: any) => ({
          id: p.id,
          type: 'PROFILE' as const,
          title: p.displayName || 'Executive Member',
          subtitle: `${p.currentTitle || 'Professional'} • ${p.companyName || 'Corporate'}`,
          status: p.verificationStatus,
          createdAt: p.updatedAt || new Date().toISOString(),
          email: p.userEmail,
          score: p.completenessScore,
          metadata: p,
        }));

        const companyItems: VerificationQueueItem[] = (raw.companies || []).map((c: any) => ({
          id: c.id,
          type: 'COMPANY' as const,
          title: c.name,
          subtitle: `${c.industry || 'Corporate Registry'} • ${c.headquartersCity || ''} ${c.headquartersCountry || ''}`,
          status: c.verificationStatus,
          createdAt: c.createdAt || new Date().toISOString(),
          domain: c.domain,
          metadata: c,
        }));

        const claimItems: VerificationQueueItem[] = (raw.claims || []).map((cl: any) => ({
          id: cl.id,
          type: 'CLAIM' as const,
          title: `Claim: ${cl.companyName}`,
          subtitle: `Verification: ${cl.verificationMethod || 'DNS / Work Email'}`,
          status: cl.status,
          createdAt: cl.createdAt || new Date().toISOString(),
          domain: cl.companyDomain,
          metadata: cl,
        }));

        const allItems = [...profileItems, ...companyItems, ...claimItems];

        setData({
          summary: {
            totalPending: raw.summary?.totalPending ?? allItems.length,
            pendingProfiles: raw.summary?.profilesCount ?? profileItems.length,
            pendingCompanies: raw.summary?.companiesCount ?? companyItems.length,
            pendingClaims: raw.summary?.claimsCount ?? claimItems.length,
          },
          items: allItems,
        });
      }
    } catch (err: any) {
      console.error('Failed to load verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [token]);

  const handleDecision = async (
    entityType: 'PROFILE' | 'COMPANY' | 'CLAIM',
    entityId: string,
    decision: 'APPROVE' | 'REJECT' | 'REQUEST_INFO',
  ) => {
    try {
      setProcessingId(entityId);
      setFeedbackMsg(null);
      const notes = decisionNotes[entityId] || '';

      const res = await fetch('/api/v1/admin/verifications/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entityType,
          entityId,
          decision,
          notes,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error?.message || 'Verification decision failed');
      }

      setFeedbackMsg({
        type: 'success',
        text: `Action successfully processed: ${decision} for ${entityType} (${entityId.slice(0, 8)}...)`,
      });

      // Clear note
      setDecisionNotes((prev) => {
        const next = { ...prev };
        delete next[entityId];
        return next;
      });

      // Refresh queue
      await fetchQueue();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Action failed' });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredItems = (data?.items || []).filter((item) => {
    const matchesFilter = selectedFilter === 'ALL' || item.type === selectedFilter;
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subtitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.domain && item.domain.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Institutional Trust & Integrity Gate</span>
          </span>
          <h1 className="text-2xl font-extrabold text-navy mt-1">Real-Time Verification Queue</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Review pending executive identity verifications, corporate domain authority claims, and prevent impersonation attacks.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-surface-muted hover:bg-surface border border-border text-xs font-bold text-navy transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-navy">{data.summary.totalPending}</div>
          <p className="text-[11px] text-text-muted mt-1">Awaiting compliance review</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Executive Profiles</span>
            <User className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{data.summary.pendingProfiles}</div>
          <p className="text-[11px] text-text-muted mt-1">Work email & LinkedIn badges</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Corporate Entities</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{data.summary.pendingCompanies}</div>
          <p className="text-[11px] text-text-muted mt-1">Registries & domain claims</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Domain Claims</span>
            <ShieldAlert className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{data.summary.pendingClaims}</div>
          <p className="text-[11px] text-text-muted mt-1">Company ownership takeover</p>
        </div>
      </div>

      {/* Notification Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-text-muted hover:text-navy">
            ✕
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-text-muted" />
          {(['ALL', 'PROFILE', 'COMPANY', 'CLAIM'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === tab
                  ? 'bg-navy text-white shadow-xs'
                  : 'bg-surface-muted text-text-muted hover:text-navy'
              }`}
            >
              {tab === 'ALL'
                ? 'All Queue'
                : tab === 'PROFILE'
                ? 'Profiles'
                : tab === 'COMPANY'
                ? 'Companies'
                : 'Domain Claims'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, domain, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface-muted border border-border rounded-lg text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Verification Queue List */}
      <div className="space-y-3">
        {loading && data.items.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center text-xs text-text-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            Loading verification queue records...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy">All Verifications Cleared</h3>
            <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
              There are no pending identity verifications or domain claims requiring super admin attention.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-surface border border-border rounded-2xl p-5 shadow-xs hover:border-primary/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    item.type === 'PROFILE'
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : item.type === 'COMPANY'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-purple-50 border-purple-200 text-purple-600'
                  }`}
                >
                  {item.type === 'PROFILE' ? (
                    <User className="w-5 h-5" />
                  ) : item.type === 'COMPANY' ? (
                    <Building2 className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                        item.type === 'PROFILE'
                          ? 'bg-blue-100 text-blue-800'
                          : item.type === 'COMPANY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {item.type}
                    </span>
                    <h3 className="text-sm font-extrabold text-navy">{item.title}</h3>
                  </div>

                  <p className="text-xs text-text-muted font-medium">{item.subtitle}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted pt-1">
                    {item.email && (
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-text-muted" />
                        <span>{item.email}</span>
                      </span>
                    )}
                    {item.domain && (
                      <span className="flex items-center space-x-1 font-mono">
                        <Building2 className="w-3 h-3 text-text-muted" />
                        <span>{item.domain}</span>
                      </span>
                    )}
                    {item.linkedinUrl && (
                      <a
                        href={item.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:underline"
                      >
                        <Linkedin className="w-3 h-3" />
                        <span>LinkedIn Dossier</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Compliance Note */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                <input
                  type="text"
                  placeholder="Compliance review notes..."
                  value={decisionNotes[item.id] || ''}
                  onChange={(e) =>
                    setDecisionNotes({ ...decisionNotes, [item.id]: e.target.value })
                  }
                  className="px-2.5 py-1.5 bg-surface-muted border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:border-primary w-full sm:w-52"
                />

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDecision(item.type, item.id, 'APPROVE')}
                    disabled={processingId === item.id}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleDecision(item.type, item.id, 'REQUEST_INFO')}
                    disabled={processingId === item.id}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface border border-border text-navy text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Docs</span>
                  </button>

                  <button
                    onClick={() => handleDecision(item.type, item.id, 'REJECT')}
                    disabled={processingId === item.id}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
