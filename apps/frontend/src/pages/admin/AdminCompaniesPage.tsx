import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { Drawer } from '../../components/ui/Drawer';

interface CompanyRecord {
  id: string;
  name: string;
  legalName?: string;
  domain?: string;
  websiteUrl?: string;
  industry?: string;
  subIndustry?: string;
  headquartersCity?: string;
  headquartersCountry?: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED' | 'REJECTED';
  isSeedData: boolean;
  createdAt: string;
  _count?: {
    memberships: number;
    profiles: number;
  };
}

export const AdminCompaniesPage = () => {
  const { token } = useAuth();
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/companies', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCompanies(data.data);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load company registry.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [token]);

  const handleVerificationChange = async (companyId: string, status: 'VERIFIED' | 'REJECTED' | 'UNVERIFIED') => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/admin/companies/${companyId}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verificationStatus: status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Verification update failed.');
      }

      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, verificationStatus: status } : c))
      );
      if (selectedCompany?.id === companyId) {
        setSelectedCompany((prev) => (prev ? { ...prev, verificationStatus: status } : null));
      }
      setFeedback({ type: 'success', message: `Organization status updated to ${status}.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnDef<CompanyRecord>[] = [
    {
      key: 'name',
      header: 'Company & Domain',
      sortable: true,
      render: (c: CompanyRecord) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-600 shrink-0">
            {c.name[0]}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-navy truncate">{c.name}</div>
            <div className="text-[11px] font-mono text-text-muted truncate">{c.domain || 'No domain'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'industry',
      header: 'Industry & Sector',
      sortable: true,
      render: (c: CompanyRecord) => (
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-navy truncate">{c.industry || 'General Industry'}</div>
          <div className="text-[11px] text-text-muted truncate">{c.subIndustry || 'Commercial'}</div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Headquarters',
      sortable: true,
      render: (c: CompanyRecord) => (
        <div className="flex items-center space-x-1.5 text-xs text-text-muted">
          <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span>
            {c.headquartersCity || 'Global'}
            {c.headquartersCountry ? `, ${c.headquartersCountry}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'roster',
      header: 'Roster Count',
      sortable: true,
      render: (c: CompanyRecord) => (
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-navy font-bold">{c._count?.profiles || 0}</span>
          <span className="text-text-muted text-[10px]">decision makers</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Verification Status',
      sortable: true,
      render: (c: CompanyRecord) => (
        <span
          className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
            c.verificationStatus === 'VERIFIED'
              ? 'bg-emerald-100 text-emerald-800'
              : c.verificationStatus === 'PENDING'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {c.verificationStatus === 'VERIFIED' ? (
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
          ) : (
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
          )}
          {c.verificationStatus}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Admin Ops
            </span>
            <span className="text-xs text-text-muted">Global Organization Registry</span>
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">Company Registry & Verification</h1>
          <p className="text-xs text-text-muted">
            Inspect all 1,000+ verified corporate entities, validate DNS claims, and review roster decision-makers.
          </p>
        </div>

        <button
          onClick={fetchCompanies}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-surface hover:bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Companies</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Companies Table */}
      <DataTable
        data={companies}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Filter 1,000+ companies by name, domain, or industry..."
        emptyTitle="No organizations match your query"
        onRowClick={(c) => setSelectedCompany(c)}
      />

      {/* Company Inspection Drawer */}
      <Drawer
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        title={selectedCompany?.name || 'Company Details'}
        subtitle={`Domain: ${selectedCompany?.domain || 'N/A'}`}
        width="md"
      >
        {selectedCompany && (
          <div className="space-y-6 text-xs">
            {/* Header Card */}
            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                  {selectedCompany.name[0]}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-navy text-sm truncate">{selectedCompany.name}</div>
                  <div className="font-mono text-text-muted truncate">{selectedCompany.domain}</div>
                  <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                    {selectedCompany.legalName || `${selectedCompany.name} Pte. Ltd.`}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Data */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Industry & Geography
              </div>
              <div className="p-3 bg-surface border border-border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Sector:</span>
                  <span className="font-bold text-navy">{selectedCompany.industry || 'Enterprise'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Specialization:</span>
                  <span className="font-semibold text-navy">{selectedCompany.subIndustry || 'B2B Commercial'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Headquarters:</span>
                  <span className="font-semibold text-navy">
                    {selectedCompany.headquartersCity}, {selectedCompany.headquartersCountry}
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Analytics */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Platform Adoption
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-surface border border-border rounded-lg text-center">
                  <div className="text-lg font-black text-navy">{selectedCompany._count?.profiles || 0}</div>
                  <div className="text-[10px] text-text-muted">Associated Decision Makers</div>
                </div>
                <div className="p-3 bg-surface border border-border rounded-lg text-center">
                  <div className="text-lg font-black text-navy">{selectedCompany._count?.memberships || 0}</div>
                  <div className="text-[10px] text-text-muted">Active Team Members</div>
                </div>
              </div>
            </div>

            {/* Verification Status Actions */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Compliance & Verification Workflow
              </div>

              {selectedCompany.verificationStatus !== 'VERIFIED' && (
                <button
                  onClick={() => handleVerificationChange(selectedCompany.id, 'VERIFIED')}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Grant Verified Organization Status</span>
                </button>
              )}

              {selectedCompany.verificationStatus !== 'REJECTED' && (
                <button
                  onClick={() => handleVerificationChange(selectedCompany.id, 'REJECTED')}
                  disabled={actionLoading}
                  className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Organization Listing</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
