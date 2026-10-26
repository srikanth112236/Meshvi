import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  Network,
  GitBranch,
  Globe,
  Sliders,
  ChevronDown,
  ChevronRight,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ReadinessCard } from './ReadinessCard';
import { WhyNowCard } from './WhyNowCard';

export interface CompanyDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSelectPersonForConnect?: (person: any) => void;
  onSelectCompanyForProposal?: (company: any) => void;
}

type TabType = 'overview' | 'orgchart' | 'hierarchy' | 'domains' | 'routing';

export const CompanyDossierModal: React.FC<CompanyDossierModalProps> = ({
  isOpen,
  onClose,
  companyId,
  onSelectPersonForConnect,
  onSelectCompanyForProposal,
}) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [company, setCompany] = useState<any | null>(null);
  const [orgChart, setOrgChart] = useState<any | null>(null);
  const [hierarchy, setHierarchy] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});

  const [companyReadiness, setCompanyReadiness] = useState<any | null>(null);
  const [companyTriggers, setCompanyTriggers] = useState<any[]>([]);
  const [companyOpportunities, setCompanyOpportunities] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && companyId && token) {
      setLoading(true);
      Promise.all([
        fetch(`/api/v1/companies/${companyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
        fetch(`/api/v1/companies/${companyId}/org-chart`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
        fetch(`/api/v1/companies/${companyId}/hierarchy`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()),
      ])
        .then(([companyRes, orgChartRes, hierarchyRes]) => {
          if (companyRes.success && companyRes.data) {
            setCompany(companyRes.data);
          }
          if (orgChartRes.success && orgChartRes.data) {
            setOrgChart(orgChartRes.data);
            const initExpanded: Record<string, boolean> = {};
            (orgChartRes.data.departments || []).forEach((d: any) => {
              initExpanded[d.name] = true;
            });
            setExpandedDepts(initExpanded);
          }
          if (hierarchyRes.success && hierarchyRes.data) {
            setHierarchy(hierarchyRes.data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));

      // Fetch F1: Company Partnership Readiness
      fetch(`/api/v1/readiness/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setCompanyReadiness(data?.data !== undefined ? data.data : data))
        .catch(() => setCompanyReadiness(null));

      // Fetch F3: Why Now Trigger Signals
      fetch(`/api/v1/triggers/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
          setCompanyTriggers(list);
        })
        .catch(() => setCompanyTriggers([]));

      // Fetch Gap 1: Active Corporate Opportunities
      fetch(`/api/v1/opportunities/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setCompanyOpportunities(data?.data || []))
        .catch(() => setCompanyOpportunities([]));
    }
  }, [isOpen, companyId, token]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roster = company?.memberships || [];
  const verifiedDomains = company?.verifiedDomains || [];
  const routingRules = company?.routingRules || [];
  const parentRelations = hierarchy?.parentRelations || [];
  const subsidiaryRelations = hierarchy?.subsidiaryRelations || [];

  const toggleDept = (deptName: string) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [deptName]: !prev[deptName],
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-surface border-l border-border shadow-2xl flex flex-col justify-between transform transition-transform ease-out duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border flex items-start justify-between bg-bg">
            <div className="flex items-center space-x-3.5 min-w-0 pr-3">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg shadow-sm border border-border shrink-0">
                {company?.name?.[0] || 'C'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-extrabold text-navy truncate">
                    {company?.name || 'Enterprise Dossier'}
                  </h2>
                  {company?.verificationStatus === 'VERIFIED' ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded flex items-center space-x-1 border border-emerald-200 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>DNS Verified</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded shrink-0">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {company?.industry || 'Enterprise Business'} &bull;{' '}
                  {company?.headquartersCity || 'Global'}, {company?.headquartersCountry || ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-text-muted hover:text-navy hover:bg-surface rounded-xl transition-colors shrink-0"
              title="Close drawer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border bg-surface px-6 space-x-1 text-xs font-bold text-text-muted overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-black text-navy font-extrabold'
                  : 'border-transparent hover:text-navy'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>360° Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orgchart')}
              className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'orgchart'
                  ? 'border-black text-navy font-extrabold'
                  : 'border-transparent hover:text-navy'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Org Chart ({orgChart?.totalHeadcount || roster.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hierarchy')}
              className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'hierarchy'
                  ? 'border-black text-navy font-extrabold'
                  : 'border-transparent hover:text-navy'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Hierarchy</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('domains')}
              className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'domains'
                  ? 'border-black text-navy font-extrabold'
                  : 'border-transparent hover:text-navy'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Domains ({verifiedDomains.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('routing')}
              className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'routing'
                  ? 'border-black text-navy font-extrabold'
                  : 'border-transparent hover:text-navy'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Routing Rules ({routingRules.length})</span>
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
            {loading ? (
              <div className="py-20 text-center text-text-muted">Loading enterprise dossier intelligence...</div>
            ) : !company ? (
              <div className="py-20 text-center text-text-muted">Company profile details unavailable.</div>
            ) : (
              <>
                {/* TAB 1: 360 OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    {/* Firmographics Bar */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-bg rounded-xl border border-border">
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase block">Legal Entity</span>
                        <span className="font-extrabold text-navy truncate block">{company.legalName || company.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase block">Primary Domain</span>
                        <span className="font-bold text-navy truncate block">{company.domain || 'Verified Domain'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase block">Intake Policy</span>
                        <span className="font-bold text-emerald-700 block uppercase">{company.intakeStatus || 'OPEN'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase block">Enterprise Class</span>
                        <span className="font-bold text-navy block">Tier-1 Verified</span>
                      </div>
                    </div>

                    {/* F1: Company Partnership Readiness Signal */}
                    <ReadinessCard readiness={companyReadiness} />

                    {/* F3: Why Now Trigger Signals */}
                    <WhyNowCard triggers={companyTriggers} />

                    {/* Gap 1: Active Corporate Opportunities */}
                    {companyOpportunities.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-black text-navy uppercase tracking-wider">
                              Active Commercial Opportunities ({companyOpportunities.length})
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                            Intake Open
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {companyOpportunities.map((opp) => (
                            <div
                              key={opp.id}
                              className="p-4 bg-gradient-to-br from-neutral-50 to-neutral-100/70 border border-border rounded-xl space-y-2 hover:border-black/30 transition-all"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-bold text-navy uppercase tracking-wider block text-emerald-800">
                                    {opp.ownerType} Mandate
                                  </span>
                                  <h4 className="text-xs font-black text-navy">{opp.title}</h4>
                                  <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{opp.summary}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-[11px]">
                                <div>
                                  <strong className="text-text-muted block text-[10px] uppercase font-bold">What They Seek:</strong>
                                  <span className="text-navy">{opp.requirements?.[0]?.description || 'Commercial partners'}</span>
                                </div>
                                <div>
                                  <strong className="text-text-muted block text-[10px] uppercase font-bold">What They Offer:</strong>
                                  <span className="text-navy">{opp.offers?.[0]?.productsServices || 'Regional market access'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Corporate Summary */}
                    {company.description && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                          Corporate Summary & Mission
                        </span>
                        <p className="text-text-muted leading-relaxed bg-surface-muted/50 p-3.5 rounded-xl border border-border/50">
                          {company.description}
                        </p>
                      </div>
                    )}

                    {/* Roster Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-black" />
                          <span className="text-xs font-black text-navy uppercase tracking-wider">
                            Key Decision Makers ({roster.length})
                          </span>
                        </div>
                        <span className="text-[10px] text-text-muted font-bold">Privacy-Preserving Corporate Roster</span>
                      </div>

                      {roster.length === 0 ? (
                        <div className="p-4 bg-bg rounded-xl border border-border text-center text-text-muted">
                          No public roster members active.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {roster.map((m: any) => {
                            const p = m.user?.profile;
                            if (!p) return null;
                            return (
                              <div
                                key={m.id}
                                className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between hover:border-black/50 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center">
                                    {p.displayName?.[0] || 'U'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-navy">{p.displayName}</div>
                                    <div className="text-[11px] text-text-muted">
                                      {p.currentTitle} &bull; {m.department || p.function || 'Executive'}
                                    </div>
                                  </div>
                                </div>

                                {onSelectPersonForConnect && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSelectPersonForConnect({
                                        id: p.id,
                                        displayName: p.displayName,
                                        currentTitle: p.currentTitle,
                                        companyName: company.name,
                                        city: p.city,
                                        countryCode: p.countryCode,
                                        matchScore: 95,
                                      });
                                      onClose();
                                    }}
                                    className="px-3 py-1 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-colors"
                                  >
                                    Connect
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: ORG CHART (Feature #2) */}
                {activeTab === 'orgchart' && (
                  <div className="space-y-5">
                    {/* Executive Governance Tier */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-navy flex items-center space-x-1.5">
                          <Network className="w-4 h-4 text-black" />
                          <span>Executive Governance Tier</span>
                        </span>
                        <span className="text-[10px] bg-black text-white font-bold px-2 py-0.5 rounded-full">
                          Leadership
                        </span>
                      </div>

                      {orgChart?.executiveTier?.length === 0 ? (
                        <div className="p-4 bg-bg rounded-xl border border-border text-center text-text-muted">
                          Executive leadership records private or pending attestation.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {orgChart?.executiveTier?.map((exec: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-3.5 bg-surface rounded-xl border-2 border-black/80 shadow-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-navy text-xs">{exec.name}</span>
                                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black rounded uppercase">
                                  Verified CXO
                                </span>
                              </div>
                              <div className="text-[11px] font-semibold text-black">{exec.title}</div>
                              <div className="text-[10px] text-text-muted">
                                {exec.department} &bull; {exec.role}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Department Divisions */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <span className="text-xs font-black uppercase tracking-wider text-navy block">
                        Functional Department Divisions
                      </span>

                      {orgChart?.departments?.length === 0 ? (
                        <div className="p-4 bg-bg rounded-xl border border-border text-center text-text-muted">
                          No departmental divisions mapped.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {orgChart?.departments?.map((dept: any) => {
                            const isExpanded = expandedDepts[dept.name];
                            return (
                              <div key={dept.name} className="border border-border rounded-xl bg-surface overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => toggleDept(dept.name)}
                                  className="w-full px-4 py-2.5 bg-surface-muted/60 flex items-center justify-between text-left hover:bg-surface-muted transition-colors"
                                >
                                  <div className="flex items-center space-x-2">
                                    {isExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                                    )}
                                    <span className="font-bold text-navy text-xs">{dept.name}</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-extrabold text-text-muted">
                                    {dept.memberCount} Members
                                  </span>
                                </button>

                                {isExpanded && (
                                  <div className="p-3 space-y-2 bg-surface">
                                    {dept.members.map((m: any, mIdx: number) => (
                                      <div
                                        key={mIdx}
                                        className="p-2.5 bg-bg rounded-lg border border-border/60 flex items-center justify-between"
                                      >
                                        <div>
                                          <div className="font-bold text-navy text-xs">{m.name}</div>
                                          <div className="text-[11px] text-text-muted">{m.title}</div>
                                        </div>
                                        <span className="text-[10px] font-bold text-text-muted px-2 py-0.5 bg-surface rounded">
                                          {m.seniority || 'Staff'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: HIERARCHY (Feature #1) */}
                {activeTab === 'hierarchy' && (
                  <div className="space-y-5">
                    {/* Parent Entities */}
                    <div className="space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider text-navy block">
                        Parent Holding & Group Entities
                      </span>
                      {subsidiaryRelations.length === 0 ? (
                        <div className="p-4 bg-bg rounded-xl border border-border text-center text-text-muted">
                          This entity operates independently with no parent holding group listed.
                        </div>
                      ) : (
                        subsidiaryRelations.map((rel: any) => (
                          <div
                            key={rel.id}
                            className="p-4 bg-surface rounded-xl border border-border flex items-center justify-between shadow-2xs"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-extrabold text-navy text-xs">{rel.parentCompany.name}</h4>
                                <span className="px-1.5 py-0.2 bg-black text-white text-[9px] font-black rounded uppercase">
                                  {rel.relationshipType}
                                </span>
                              </div>
                              <p className="text-[11px] text-text-muted mt-0.5">
                                {rel.parentCompany.industry} &bull; {rel.parentCompany.domain}
                              </p>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Verified Parent
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Subsidiary Entities */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <span className="text-xs font-black uppercase tracking-wider text-navy block">
                        Subsidiaries & Operating Units
                      </span>
                      {parentRelations.length === 0 ? (
                        <div className="p-4 bg-bg rounded-xl border border-border text-center text-text-muted">
                          No direct operating subsidiaries registered under this entity.
                        </div>
                      ) : (
                        parentRelations.map((rel: any) => (
                          <div
                            key={rel.id}
                            className="p-4 bg-surface rounded-xl border border-border flex items-center justify-between shadow-2xs"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-extrabold text-navy text-xs">{rel.subsidiary.name}</h4>
                                <span className="px-1.5 py-0.2 bg-surface-muted text-navy border border-border text-[9px] font-black rounded uppercase">
                                  {rel.relationshipType}
                                </span>
                              </div>
                              <p className="text-[11px] text-text-muted mt-0.5">
                                {rel.subsidiary.industry} &bull; {rel.subsidiary.domain}
                              </p>
                            </div>
                            <span className="text-[10px] font-black text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
                              Subsidiary
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: DOMAINS (Feature #6) */}
                {activeTab === 'domains' && (
                  <div className="space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-navy block">
                      Multi-Domain Corporate Workspace
                    </span>
                    {verifiedDomains.length === 0 ? (
                      <div className="p-4 bg-bg rounded-xl border border-border text-center text-text-muted">
                        Only primary domain registered.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {verifiedDomains.map((d: any) => (
                          <div
                            key={d.id}
                            className="p-3.5 bg-surface rounded-xl border border-border flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <Globe className="w-4 h-4 text-black" />
                              <div>
                                <div className="font-bold text-navy text-xs">{d.domain}</div>
                                <span className="text-[10px] text-text-muted">
                                  {d.isPrimary ? 'Primary Corporate Root' : 'Regional / Subsidiary Alias'}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                d.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {d.verificationStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: ROUTING (Feature #9) */}
                {activeTab === 'routing' && (
                  <div className="space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-navy block">
                      Inbound Departmental Routing Rules
                    </span>
                    {routingRules.length === 0 ? (
                      <div className="p-4 bg-bg rounded-xl border border-border text-center text-text-muted">
                        Inbound opportunities route to the primary executive leadership desk.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {routingRules.map((rule: any) => (
                          <div
                            key={rule.id}
                            className="p-3.5 bg-surface rounded-xl border border-border flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-navy text-xs">{rule.department}</span>
                                {rule.categoryTag && (
                                  <span className="px-1.5 py-0.2 bg-black text-white text-[9px] font-black rounded uppercase">
                                    {rule.categoryTag}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-text-muted mt-0.5">
                                Priority Dispatch: <strong>{rule.priority}</strong> &bull; Directs to assigned category desk
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                              Active Rule
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Action Footer (Black Clean Actions) */}
          {company && (
            <div className="px-6 py-4 border-t border-border bg-surface-muted/40 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-text-muted hover:text-navy rounded-xl"
              >
                Close
              </button>

              <div className="flex items-center space-x-2">
                {onSelectCompanyForProposal && (
                  <button
                    type="button"
                    onClick={() => {
                      const firstLeader = roster[0]?.user?.profile;
                      onSelectCompanyForProposal({
                        companyId: company.id,
                        companyName: company.name,
                        recipientProfileId: firstLeader?.id || company.id,
                        executiveName: firstLeader?.displayName || `${company.name} Executive Office`,
                        executiveTitle: firstLeader?.currentTitle || 'Corporate Inbound Desk',
                      });
                      onClose();
                    }}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <span>Submit Proposal to Company</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
