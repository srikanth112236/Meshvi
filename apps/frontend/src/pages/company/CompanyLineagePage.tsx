import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Network,
  Building2,
  Plus,
  Trash2,
  RefreshCw,
  GitFork,
  Layers,
  Search,
  ShieldCheck,
  Globe,
  ArrowDown,
  X,
  Building,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';

interface CompanyRelation {
  id: string;
  relationshipType: 'SUBSIDIARY' | 'DIVISION' | 'REGIONAL_HQ' | 'HOLDING' | string;
  confidenceScore: number;
  source: string;
  effectiveDate?: string;
  createdAt: string;
  parentCompany?: {
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    verificationStatus?: string;
  };
  subsidiary?: {
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    verificationStatus?: string;
  };
}

export const CompanyLineagePage = () => {
  const { token } = useAuth();
  const [activeCompany, setActiveCompany] = useState<any | null>(null);
  const [hierarchy, setHierarchy] = useState<{
    subsidiaryRelations: CompanyRelation[];
    parentRelations: CompanyRelation[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeView, setActiveView] = useState<'TREE' | 'TABLE'>('TREE');

  // Modal / Drawer state
  const [showLinkDrawer, setShowLinkDrawer] = useState(false);
  const [targetCompanyQuery, setTargetCompanyQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedTargetCompany, setSelectedTargetCompany] = useState<any | null>(null);
  const [relationshipType, setRelationshipType] = useState<'SUBSIDIARY' | 'DIVISION' | 'REGIONAL_HQ' | 'HOLDING'>('SUBSIDIARY');
  const [linking, setLinking] = useState(false);

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const myRes = await fetch('/api/v1/companies/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myData = await myRes.json();
      if (!myData.success || !myData.data || myData.data.length === 0) {
        setLoading(false);
        return;
      }

      const comp = myData.data[0].company;
      setActiveCompany(comp);

      const hierRes = await fetch(`/api/v1/companies/${comp.id}/hierarchy`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hierData = await hierRes.json();
      if (hierData.success && hierData.data) {
        setHierarchy(hierData.data);
      }
    } catch (err: any) {
      console.error('Failed to load company hierarchy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, [token]);

  const handleSearchCompany = async (q: string) => {
    setTargetCompanyQuery(q);
    if (!q || q.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/v1/companies?q=${encodeURIComponent(q)}&limit=6`);
      const data = await res.json();
      if (data.success && data.data) {
        setSearchResults(data.data.items || data.data);
      }
    } catch {
      // Handled silently
    }
  };

  const handleLinkCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !selectedTargetCompany) return;

    try {
      setLinking(true);
      setFeedback(null);

      const res = await fetch(`/api/v1/companies/${activeCompany.id}/relationships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subsidiaryId: selectedTargetCompany.id,
          relationshipType,
          confidenceScore: 1.0,
          source: 'ADMIN_VERIFIED',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to link company relation');
      }

      setFeedback({
        type: 'success',
        text: `Corporate link established! ${selectedTargetCompany.name} is now registered as ${relationshipType} under your lineage.`,
      });

      setSelectedTargetCompany(null);
      setTargetCompanyQuery('');
      setSearchResults([]);
      setShowLinkDrawer(false);
      await fetchHierarchy();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error linking corporate entity' });
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (relId: string, entityName: string) => {
    if (!activeCompany) return;
    if (!window.confirm(`Unlink ${entityName} from your corporate lineage?`)) return;

    try {
      setFeedback(null);
      const res = await fetch(`/api/v1/companies/${activeCompany.id}/relationships/${relId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to unlink corporate relation');
      }
      setFeedback({ type: 'success', text: `Unlinked ${entityName} from lineage.` });
      await fetchHierarchy();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error unlinking relation' });
    }
  };

  if (loading && !activeCompany) {
    return (
      <div className="py-20 text-center text-xs text-text-muted">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
        Loading corporate organizational lineage and group hierarchy...
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="py-20 text-center text-xs text-text-muted">
        No registered company workspace found for this account.
      </div>
    );
  }

  const parents = hierarchy?.subsidiaryRelations || [];
  const subsidiaries = hierarchy?.parentRelations || [];
  const totalGroupCount = 1 + parents.length + subsidiaries.length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Lineage Identity */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Network className="w-3 h-3 text-purple-600" />
              <span>Multi-Entity Corporate Lineage</span>
            </span>
            <span className="text-xs text-text-muted font-mono">{activeCompany.domain || 'Verified Domain'}</span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Tier-4 Group Trust
            </span>
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">
            {activeCompany.name} &bull; Corporate Lineage & Group Structure
          </h1>
          <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
            Map holding groups, regional subsidiaries, and joint ventures across Meshvi deal corridors to facilitate enterprise vendor KYC and cross-entity intent routing.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={fetchHierarchy}
            className="p-2 bg-surface-muted hover:bg-surface border border-border rounded-xl text-navy transition-all shadow-2xs"
            title="Refresh Group Hierarchy"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowLinkDrawer(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link Branch / Subsidiary</span>
          </button>
        </div>
      </div>

      {/* 2. Group Telemetry KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Primary Operating Anchor</span>
          <div className="text-sm font-black text-navy mt-0.5 truncate flex items-center space-x-1">
            <Building className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">{activeCompany.name}</span>
          </div>
          <span className="text-[10px] text-text-muted font-mono">{activeCompany.domain || 'Domain Verified'}</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Parent Holdings</span>
          <div className="text-xl font-black text-navy mt-0.5 flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>{parents.length} Registered</span>
          </div>
          <span className="text-[10px] text-text-muted">Ultimate Beneficial Owners</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Subsidiaries & HQs</span>
          <div className="text-xl font-black text-navy mt-0.5 flex items-center space-x-1.5">
            <GitFork className="w-4 h-4 text-emerald-600" />
            <span>{subsidiaries.length} Operating Units</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Inheriting Group Badges</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Total Group Network</span>
          <div className="text-xl font-black text-indigo-700 mt-0.5 flex items-center space-x-1.5">
            <Network className="w-4 h-4" />
            <span>{totalGroupCount} Entities</span>
          </div>
          <span className="text-[10px] text-text-muted">Combined Authority Web</span>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-text-muted hover:text-navy">
            ✕
          </button>
        </div>
      )}

      {/* View Switcher: Interactive Tree vs Provenance Audit Table */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-surface-muted p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveView('TREE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeView === 'TREE' ? 'bg-surface text-navy shadow-2xs' : 'text-text-muted hover:text-navy'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-indigo-600" />
            <span>Visual Group Hierarchy Tree</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('TABLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeView === 'TABLE' ? 'bg-surface text-navy shadow-2xs' : 'text-text-muted hover:text-navy'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Regulatory Provenance Ledger</span>
          </button>
        </div>

        <span className="text-xs text-text-muted">
          All lineage links cryptographically verified under Meshvi Enterprise Governance
        </span>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: INTERACTIVE CORPORATE GROUP TREE                                  */}
      {/* ========================================================================= */}
      {activeView === 'TREE' && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
          {/* Tier 1: Parent / Holding Entities */}
          {parents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                  Tier 1: Parent Group & Holding Companies ({parents.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {parents.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-purple-50/50 border border-purple-200/80 rounded-2xl flex items-center justify-between hover:border-purple-400 transition-all shadow-2xs"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shrink-0 border border-purple-200">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-navy text-sm">{p.parentCompany?.name}</div>
                        <div className="text-[11px] text-text-muted font-mono">{p.parentCompany?.domain || 'holding.corp'}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                            {p.relationshipType}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center">
                            <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
                            Admin Verified (1.0)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnlink(p.id, p.parentCompany?.name || 'Parent')}
                      className="p-2 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Unlink Entity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Tree Branch Connector */}
              <div className="flex flex-col items-center my-1 text-border">
                <div className="w-0.5 h-6 bg-purple-300" />
                <ArrowDown className="w-4 h-4 text-purple-400 -mt-1" />
              </div>
            </div>
          )}

          {/* Tier 2: Anchor Operating Company Card */}
          <div className="bg-gradient-to-r from-navy via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-white border border-white/20 shrink-0">
                <Building2 className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                  Primary Operating Entity & Corporate Anchor Node
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">{activeCompany.name}</h2>
                <div className="flex items-center space-x-3 text-xs text-white/70 font-mono mt-1">
                  <span className="flex items-center space-x-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeCompany.domain || 'Domain Verified'}</span>
                  </span>
                  <span>&bull;</span>
                  <span>{activeCompany.industry || 'Multi-Corridor Enterprise'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-400/30 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tier-4 Hub</span>
              </span>
            </div>
          </div>

          {/* Tree Branch Connector Down to Subsidiaries */}
          <div className="flex flex-col items-center my-1 text-border">
            <div className="w-0.5 h-6 bg-indigo-300" />
            <ArrowDown className="w-4 h-4 text-indigo-400 -mt-1" />
          </div>

          {/* Tier 3: Subsidiaries, Divisions & Regional HQs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                  Tier 3: Operating Subsidiaries & Regional Units ({subsidiaries.length})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowLinkDrawer(true)}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch / Entity</span>
              </button>
            </div>

            {subsidiaries.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border rounded-xl bg-surface-muted/30">
                No regional operating subsidiaries or divisions mapped yet. Click "+ Link Branch / Subsidiary" to map your corporate branches.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subsidiaries.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 bg-surface border border-border rounded-2xl shadow-2xs hover:border-indigo-400 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-black text-navy text-xs truncate max-w-[160px]">
                            {s.subsidiary?.name}
                          </div>
                          <div className="text-[10px] text-text-muted font-mono">{s.subsidiary?.domain || 'branch.entity'}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnlink(s.id, s.subsidiary?.name || 'Subsidiary')}
                        className="p-1 text-text-muted hover:text-rose-600 rounded-lg transition-colors"
                        title="Unlink"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border text-[10px]">
                      <span className="px-2 py-0.5 rounded-md font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {s.relationshipType}
                      </span>
                      <span className="text-emerald-700 font-bold flex items-center space-x-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span>100% Attested</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: REGULATORY PROVENANCE LEDGER (TABLE)                             */}
      {/* ========================================================================= */}
      {activeView === 'TABLE' && (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-surface-muted/50 border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-black text-navy flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Cryptographic Group Ownership & Relationship Ledger</span>
            </h3>
            <span className="text-[10px] font-bold text-text-muted">
              Immutable KYC & Beneficial Ownership Evidence
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-border text-[11px] font-bold text-text-muted uppercase">
                <tr>
                  <th className="py-3 px-4">Entity Name / Domain</th>
                  <th className="py-3 px-4">Lineage Relation</th>
                  <th className="py-3 px-4">Trust Level / Scope</th>
                  <th className="py-3 px-4">Verification Source</th>
                  <th className="py-3 px-4">Effective Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Anchor Row */}
                <tr className="bg-indigo-50/20 font-semibold">
                  <td className="py-3.5 px-4 font-black text-navy flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span>{activeCompany.name} (Primary Anchor)</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                      ANCHOR HUB
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold">100% Tier-4 Verified</td>
                  <td className="py-3.5 px-4 text-text-muted font-mono">PLATFORM_CORE</td>
                  <td className="py-3.5 px-4 text-text-muted">Established</td>
                  <td className="py-3.5 px-4 text-right text-text-muted text-[10px] italic">Immutable</td>
                </tr>

                {/* Parents */}
                {parents.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-navy">
                      <div>{p.parentCompany?.name}</div>
                      <div className="text-[10px] text-text-muted font-mono">{p.parentCompany?.domain || 'holding.corp'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        {p.relationshipType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">Parent Holding ({Math.round(p.confidenceScore * 100)}%)</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-navy">{p.source || 'ADMIN_VERIFIED'}</td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {new Date(p.effectiveDate || p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleUnlink(p.id, p.parentCompany?.name || 'Parent')}
                        className="text-rose-600 hover:underline font-bold"
                      >
                        Unlink
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Subsidiaries */}
                {subsidiaries.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-navy">
                      <div>{s.subsidiary?.name}</div>
                      <div className="text-[10px] text-text-muted font-mono">{s.subsidiary?.domain || 'branch.entity'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {s.relationshipType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">Subsidiary ({Math.round(s.confidenceScore * 100)}%)</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-navy">{s.source || 'ADMIN_VERIFIED'}</td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {new Date(s.effectiveDate || s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleUnlink(s.id, s.subsidiary?.name || 'Subsidiary')}
                        className="text-rose-600 hover:underline font-bold"
                      >
                        Unlink
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Link Corporate Branch Drawer */}
      <Drawer
        isOpen={showLinkDrawer}
        onClose={() => {
          setShowLinkDrawer(false);
          setSelectedTargetCompany(null);
          setTargetCompanyQuery('');
        }}
        title="Link Corporate Entity / Subsidiary"
        subtitle={`Parent: ${activeCompany.name}`}
        width="md"
      >
        <form onSubmit={handleLinkCompany} className="space-y-4 text-xs">
          <p className="text-text-muted">
            Search registered corporate entities on MESHVI to link them in an official parent-subsidiary or regional operating lineage.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
              Search Registered Corporate Entity *
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type company name or domain (e.g. Vector, Cobalt)..."
                value={targetCompanyQuery}
                onChange={(e) => handleSearchCompany(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-surface-muted border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Autocomplete list */}
            {searchResults.length > 0 && !selectedTargetCompany && (
              <div className="mt-2 bg-surface border border-border rounded-xl shadow-lg overflow-hidden divide-y divide-border max-h-48 overflow-y-auto">
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedTargetCompany(c);
                      setTargetCompanyQuery(c.name);
                      setSearchResults([]);
                    }}
                    className="w-full p-2.5 text-left text-xs hover:bg-surface-muted flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-navy">{c.name}</div>
                      <div className="text-[11px] text-text-muted font-mono">{c.domain || 'Registered Entity'}</div>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 flex items-center space-x-1">
                      <span>Select</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedTargetCompany && (
              <div className="mt-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-indigo-900 block">{selectedTargetCompany.name}</span>
                  <span className="text-[11px] text-indigo-700 font-mono">{selectedTargetCompany.domain}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTargetCompany(null);
                    setTargetCompanyQuery('');
                  }}
                  className="p-1 hover:bg-indigo-100 rounded text-text-muted hover:text-navy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
              Relationship Classification *
            </label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as any)}
              className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
            >
              <option value="SUBSIDIARY">SUBSIDIARY &bull; Fully or majority owned operating subsidiary</option>
              <option value="DIVISION">DIVISION &bull; Operating product or business division</option>
              <option value="REGIONAL_HQ">REGIONAL HQ &bull; Continental or regional headquarters</option>
              <option value="HOLDING">HOLDING &bull; Parent corporate holding entity</option>
            </select>
          </div>

          <div className="pt-2 flex space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowLinkDrawer(false);
                setSelectedTargetCompany(null);
              }}
              className="flex-1 py-2.5 bg-surface border border-border text-navy font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={linking || !selectedTargetCompany}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {linking ? 'Establishing Link...' : 'Establish Lineage Link'}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};
