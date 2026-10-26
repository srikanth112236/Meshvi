import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  ShieldCheck,
  Plus,
  Trash2,
  X,
  Search,
  Award,
  Globe,
  DollarSign,
  CheckCircle2,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';

interface MandateItem {
  id: string;
  categoryScope: string;
  geographicScope: string;
  maxBudgetLimit?: number;
  currency: string;
  validUntil?: string;
  attestedAt: string;
  authorizedProfile: {
    id: string;
    displayName: string;
    currentTitle?: string;
    function?: string;
  };
}

export const CompanyMandatesPage: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useNotifications();
  const [searchParams] = useSearchParams();
  const paramCompanyId = searchParams.get('id');
  const [companyId, setCompanyId] = useState<string | null>(paramCompanyId);
  const [companyName, setCompanyName] = useState<string>('Corporate Enterprise');

  const [mandates, setMandates] = useState<MandateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [geoFilter, setGeoFilter] = useState('ALL');

  // Certificate Inspector Drawer State
  const [inspectingMandate, setInspectingMandate] = useState<MandateItem | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Form State
  const [colleagues, setColleagues] = useState<any[]>([]);
  const [authorizedProfileId, setAuthorizedProfileId] = useState('');
  const [categoryScope, setCategoryScope] = useState('SUPPLIER_PROCUREMENT');
  const [geographicScope, setGeographicScope] = useState('SOUTHEAST_ASIA');
  const [maxBudgetLimit, setMaxBudgetLimit] = useState('500000');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [saving, setSaving] = useState(false);

  const CATEGORY_SCOPES = [
    { value: 'SUPPLIER_PROCUREMENT', label: 'Supplier Procurement & Vendor Sourcing' },
    { value: 'DISTRIBUTION', label: 'Wholesale Distribution & Reselling' },
    { value: 'JOINT_VENTURE', label: 'Joint Ventures & Capital Commitments' },
    { value: 'STRATEGIC_M_AND_A', label: 'Strategic M&A & Corporate Buyouts' },
    { value: 'COMMERCIAL_SALES', label: 'Commercial Contracts & Enterprise Deals' },
    { value: 'TECHNOLOGY_AND_IP', label: 'Technology Transfer & IP Sublicensing' },
  ];

  const GEOGRAPHIC_SCOPES = [
    { value: 'GLOBAL', label: 'Global / All Jurisdictions' },
    { value: 'SOUTHEAST_ASIA', label: 'Southeast Asia (ASEAN)' },
    { value: 'INDIA_SUBCONTINENT', label: 'India & South Asia' },
    { value: 'MIDDLE_EAST_GCC', label: 'Middle East & GCC' },
    { value: 'EUROPE_UK', label: 'Europe & UK' },
    { value: 'NORTH_AMERICA', label: 'North America (US & Canada)' },
    { value: 'APAC', label: 'Asia Pacific (APAC)' },
  ];

  const initCompanyAndData = async () => {
    if (!token) return;
    let targetId = companyId;

    if (!targetId) {
      try {
        const myRes = await fetch('/api/v1/companies/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const myData = await myRes.json();
        if (myData.success && myData.data && myData.data.length > 0) {
          targetId = myData.data[0].company?.id;
          setCompanyId(targetId);
          setCompanyName(myData.data[0].company?.name || 'Corporate Enterprise');
        }
      } catch {
        // Handled silently
      }
    }

    if (!targetId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [mandatesRes, companyRes] = await Promise.all([
        fetch(`/api/v1/companies/${targetId}/mandates`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch(`/api/v1/companies/${targetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);

      if (mandatesRes.success) {
        setMandates(mandatesRes.data || []);
      }
      if (companyRes.success && companyRes.data) {
        if (companyRes.data.name) setCompanyName(companyRes.data.name);
        if (companyRes.data.memberships) {
          setColleagues(companyRes.data.memberships);
          if (companyRes.data.memberships[0]?.user?.profile?.id) {
            setAuthorizedProfileId(companyRes.data.memberships[0].user.profile.id);
          }
        }
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initCompanyAndData();
  }, [token, paramCompanyId]);

  const handleCreateMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorizedProfileId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/companies/${companyId}/mandates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          authorizedProfileId,
          categoryScope,
          geographicScope,
          maxBudgetLimit: parseFloat(maxBudgetLimit) || undefined,
          validUntil,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to attest mandate.');
      }

      showToast({
        title: 'Corporate Mandate Published',
        message: 'Executive authority scope verified. Tier-4 role certificate issued.',
        type: 'success',
      });

      setShowAddModal(false);
      initCompanyAndData();
    } catch (err: any) {
      showToast({
        title: 'Mandate Error',
        message: err.message || 'Could not save mandate.',
        type: 'warning',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeMandate = async (mandateId: string) => {
    if (!window.confirm('Are you sure you want to decommission this corporate authority mandate?')) return;

    try {
      const res = await fetch(`/api/v1/companies/${companyId}/mandates/${mandateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast({
          title: 'Mandate Revoked',
          message: 'Authority scope safely decommissioned.',
          type: 'info',
        });
        initCompanyAndData();
      }
    } catch {}
  };

  const copyAttestationHash = (id: string) => {
    const hash = `0x${id.replace(/-/g, '').slice(0, 32)}`;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Filtered mandates
  const filteredMandates = mandates.filter((m) => {
    const name = m.authorizedProfile?.displayName || '';
    const title = m.authorizedProfile?.currentTitle || '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || m.categoryScope === categoryFilter;
    const matchesGeo = geoFilter === 'ALL' || m.geographicScope === geoFilter;
    return matchesSearch && matchesCategory && matchesGeo;
  });

  const totalCommittedBudget = mandates.reduce((acc, m) => acc + (m.maxBudgetLimit || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* 1. Header with Authority Registry Context */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Award className="w-3 h-3 text-amber-600" />
              <span>Differentiator #3 &bull; Mandate Registry</span>
            </span>
            <span className="text-xs text-text-muted font-mono">{companyName}</span>
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">Verified Corporate Mandate Registry</h1>
          <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
            Publish cryptographically certified decision mandates so commercial partners, suppliers, and investors know with 100% confidence who has spending and negotiation authority.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-navy hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Attest New Corporate Mandate</span>
        </button>
      </div>

      {/* 2. Authority Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Active Mandates</span>
          <div className="text-xl font-black text-navy mt-0.5 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>{mandates.length} Certified</span>
          </div>
          <span className="text-[10px] text-text-muted">Company-authorized executives</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Total Authority Band</span>
          <div className="text-xl font-black text-emerald-600 mt-0.5 flex items-center space-x-1.5">
            <DollarSign className="w-4 h-4" />
            <span>${(totalCommittedBudget / 1000000).toFixed(1)}M USD</span>
          </div>
          <span className="text-[10px] text-text-muted">Combined authorized budget</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Territorial Reach</span>
          <div className="text-xl font-black text-navy mt-0.5 flex items-center space-x-1.5">
            <Globe className="w-4 h-4 text-purple-600" />
            <span>{new Set(mandates.map((m) => m.geographicScope)).size || 1} Corridors</span>
          </div>
          <span className="text-[10px] text-text-muted">Active geographical scopes</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Trust Standard</span>
          <div className="text-xl font-black text-indigo-700 mt-0.5 flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Tier-4 Stamped</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">SHA-256 Attested</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-surface border border-border rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by executive name or corporate title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-surface-muted border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
            >
              <option value="ALL">All Categories</option>
              {CATEGORY_SCOPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={geoFilter}
            onChange={(e) => setGeoFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Territories</option>
            {GEOGRAPHIC_SCOPES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Mandate Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-text-muted">Loading corporate mandate registry...</div>
      ) : filteredMandates.length === 0 ? (
        <div className="py-16 text-center bg-surface border border-border rounded-2xl p-8 space-y-3">
          <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-navy">No Matching Corporate Mandates</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {mandates.length === 0
              ? 'Attest mandates to your executives to unlock instant high-trust matchmaking and award Tier-4 verified badges.'
              : 'No active mandates matched your filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMandates.map((m) => (
            <div
              key={m.id}
              className="bg-surface border border-border rounded-2xl p-5 shadow-xs hover:border-amber-400 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                      {m.categoryScope.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">
                      {m.geographicScope.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevokeMandate(m.id)}
                    className="text-text-muted hover:text-rose-600 p-1 transition-colors"
                    title="Revoke Mandate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-base font-black text-navy">{m.authorizedProfile?.displayName || 'Authorized Executive'}</h3>
                  <p className="text-xs font-semibold text-slate-600">{m.authorizedProfile?.currentTitle || 'Corporate Lead'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Authority Ceiling</span>
                    <span className="font-mono font-black text-emerald-600 text-sm">
                      Up to ${m.maxBudgetLimit ? m.maxBudgetLimit.toLocaleString() : 'Unlimited'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Validity Expiration</span>
                    <span className="font-bold text-navy">
                      {m.validUntil ? new Date(m.validUntil).toLocaleDateString() : 'Continuous'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setInspectingMandate(m)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>View Authority Certificate &rarr;</span>
                </button>

                <span className="text-[10px] text-text-muted">
                  Attested: {new Date(m.attestedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ATTEST NEW MANDATE                                               */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-border p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-black text-navy">Attest Executive Corporate Mandate</h3>
                <p className="text-xs text-text-muted">Issue a cryptographically verified decision certificate</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-text-muted hover:text-navy p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMandate} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                  Select Team Colleague from Roster *
                </label>
                <select
                  value={authorizedProfileId}
                  onChange={(e) => setAuthorizedProfileId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
                >
                  {colleagues.map((c) => (
                    <option key={c.id} value={c.user?.profile?.id || c.user?.id}>
                      {c.user?.profile?.displayName || c.user?.email} ({c.user?.profile?.currentTitle || 'Member'}) &bull; {c.department || 'Operations'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                    Category Scope
                  </label>
                  <select
                    value={categoryScope}
                    onChange={(e) => setCategoryScope(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
                  >
                    {CATEGORY_SCOPES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                    Territorial Scope
                  </label>
                  <select
                    value={geographicScope}
                    onChange={(e) => setGeographicScope(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
                  >
                    {GEOGRAPHIC_SCOPES.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                    Spending / Authority Ceiling ($ USD)
                  </label>
                  <input
                    type="number"
                    value={maxBudgetLimit}
                    onChange={(e) => setMaxBudgetLimit(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 bg-surface-muted border border-border rounded-xl text-xs font-mono font-bold text-navy focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                <strong>Legal Attestation Note:</strong> By publishing this mandate, your registered enterprise officially warrants that the selected executive holds the requisite corporate authority to enter negotiations within these stated parameters.
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-border bg-surface text-navy font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-navy hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{saving ? 'Attesting...' : 'Certify & Publish Mandate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 2: VERIFIABLE DIGITAL CERTIFICATE INSPECTOR                        */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!inspectingMandate}
        onClose={() => setInspectingMandate(null)}
        title="Verifiable Digital Authority Certificate"
        subtitle={`Issued by: ${companyName}`}
        width="md"
      >
        {inspectingMandate && (
          <div className="space-y-5 text-xs">
            {/* The Formal Digital Certificate Card */}
            <div className="p-6 bg-gradient-to-b from-amber-50/40 via-surface to-slate-50 border-2 border-amber-300 rounded-2xl shadow-md space-y-4 relative overflow-hidden">
              <div className="absolute top-2 right-2 opacity-10">
                <Award className="w-32 h-32 text-amber-600" />
              </div>

              <div className="text-center pb-3 border-b border-amber-200/60">
                <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 text-amber-700 mx-auto flex items-center justify-center mb-1">
                  <ShieldCheck className="w-6 h-6 text-amber-700" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 block">
                  MESHVI &bull; Corporate Governance Registry
                </span>
                <h3 className="text-sm font-black text-navy mt-0.5">
                  CERTIFICATE OF COMMERCIAL AUTHORITY
                </h3>
              </div>

              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Authority Granted To:</span>
                  <div className="text-base font-black text-navy mt-0.5">
                    {inspectingMandate.authorizedProfile?.displayName}
                  </div>
                  <div className="text-xs font-semibold text-indigo-700">
                    {inspectingMandate.authorizedProfile?.currentTitle || 'Corporate Representative'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Category Scope</span>
                    <span className="font-extrabold text-navy">
                      {inspectingMandate.categoryScope.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Jurisdiction</span>
                    <span className="font-extrabold text-navy">
                      {inspectingMandate.geographicScope.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Authority Ceiling</span>
                    <span className="font-mono font-black text-emerald-600 text-sm">
                      Up to ${inspectingMandate.maxBudgetLimit ? inspectingMandate.maxBudgetLimit.toLocaleString() : 'Unlimited'} USD
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Effective Until</span>
                    <span className="font-bold text-navy">
                      {inspectingMandate.validUntil ? new Date(inspectingMandate.validUntil).toLocaleDateString() : 'Continuous'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[10px] space-y-1">
                  <div className="text-[9px] text-slate-400 uppercase font-sans font-bold flex items-center justify-between">
                    <span>Cryptographic Proof Hash:</span>
                    <button
                      type="button"
                      onClick={() => copyAttestationHash(inspectingMandate.id)}
                      className="text-white hover:underline flex items-center space-x-1"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="truncate select-all">
                    0x{inspectingMandate.id.replace(/-/g, '').slice(0, 32)}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-text-muted border-t border-amber-200/60 flex items-center justify-between">
                <span>Issued by: <strong>{companyName}</strong></span>
                <span className="text-emerald-700 font-bold flex items-center space-x-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Tier-4 Confirmed</span>
                </span>
              </div>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setInspectingMandate(null)}
                className="w-full py-2.5 bg-surface border border-border text-navy font-bold rounded-xl"
              >
                Close Certificate
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
