import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  Target,
  Gift,
  Globe,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface OpportunitySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any | null;
}

const OBJECTIVE_OPTIONS = [
  { id: 'distribution_partnership', label: 'Regional Distribution Partnership' },
  { id: 'supplier_intake', label: 'Supplier & Product Sourcing Intake' },
  { id: 'concession_licensing', label: 'Transit / Concession Licensing' },
  { id: 'joint_venture', label: 'Strategic Joint Venture' },
  { id: 'contract_manufacturing', label: 'Contract Manufacturing & Packaging' },
  { id: 'market_entry', label: 'Cross-Border Market Entry & Agency' },
];

const CAPABILITY_OPTIONS = [
  { id: 'hospitality_distribution', label: 'Airport & Travel Retail Placements' },
  { id: 'cold_chain_logistics', label: 'Cold-Chain Regional Fulfillment' },
  { id: 'organic_beverage_supply', label: 'Organic & Halal Certified Production' },
  { id: 'concession_licensing', label: 'Master Concession Operator Rights' },
  { id: 'retail_shelf_access', label: 'Supermarket & Modern Trade Placement' },
  { id: 'customs_clearance', label: 'Bonded Warehouse & Trade Compliance' },
];

const INDUSTRY_OPTIONS = [
  'Food & Beverage',
  'Consumer Goods & Retail',
  'Travel Retail & Concessions',
  'Logistics & Supply Chain',
  'Hospitality & Tourism',
  'Health & Wellness',
  'Enterprise Software',
];

const GEO_OPTIONS = [
  { code: 'SG', label: 'Singapore' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'TH', label: 'Thailand' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'VN', label: 'Vietnam' },
  { code: 'PH', label: 'Philippines' },
  { code: 'GLOBAL', label: 'Pan-Asia / Global' },
];

export const OpportunitySetupModal: React.FC<OpportunitySetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { user, token } = useAuth();
  const { showToast } = useNotifications();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [ownerType, setOwnerType] = useState<'COMPANY' | 'PROFESSIONAL'>('COMPANY');
  const [companyId, setCompanyId] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [visibility, setVisibility] = useState<'DISCOVERABLE' | 'PRIVATE'>('DISCOVERABLE');
  const [approvalMode] = useState('MANUAL');

  // Seeking
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(['distribution_partnership']);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(['Food & Beverage', 'Consumer Goods & Retail']);
  const [selectedGeos, setSelectedGeos] = useState<string[]>(['SG', 'MY']);
  const [seekingDescription, setSeekingDescription] = useState('');

  // Offering
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>(['hospitality_distribution']);
  const [offeringProducts, setOfferingProducts] = useState('');
  const [marketAccess, setMarketAccess] = useState('');

  useEffect(() => {
    if (user?.profile?.currentCompanyId) {
      setCompanyId(user.profile.currentCompanyId);
      setCompanyName(user.profile.company?.name || 'My Enterprise');
    }

    if (token) {
      fetch('/api/v1/companies/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((d) => {
          if (d.success && d.data) {
            setCompanyId(d.data.id);
            setCompanyName(d.data.name);
          }
        })
        .catch(() => {
          /* silent fallback */
        });
    }

    if (initialData) {
      setTitle(initialData.title || '');
      setSummary(initialData.summary || '');
      setOwnerType(initialData.ownerType || 'COMPANY');
      setVisibility(initialData.visibility || 'DISCOVERABLE');
      if (initialData.targetIndustries) {
        try { setSelectedIndustries(JSON.parse(initialData.targetIndustries)); } catch { /* ignore */ }
      }
      if (initialData.targetMarkets) {
        try { setSelectedGeos(JSON.parse(initialData.targetMarkets)); } catch { /* ignore */ }
      }
      if (initialData.requirements?.[0]) {
        const req = initialData.requirements[0];
        setSelectedObjectives([req.businessObjective]);
        setSeekingDescription(req.description || '');
      }
      if (initialData.offers?.[0]) {
        const off = initialData.offers[0];
        setSelectedCapabilities([off.capability]);
        setOfferingProducts(off.productsServices || '');
        setMarketAccess(off.marketAccess || '');
      }
    } else {
      // Default sample values for smooth testing
      setTitle('Premium Airport Lounge Beverage Concession Intake');
      setSummary('Master concessionaire managing airport VIP lounges seeking organic botanical beverage producers for ASEAN transit hub placements.');
      setSeekingDescription('Seeking organic, premium RTD and botanical infusions compliant with travel retail airport lounge guidelines.');
      setOfferingProducts('Exclusive shelf and refrigeration placements across Singapore & Malaysia airport VIP lounges.');
      setMarketAccess('Changi Terminal 3 & 4 VIP Lounges, KLIA Satellite Lounge.');
    }
  }, [user, initialData, isOpen, token]);

  if (!isOpen) return null;

  const toggleArrayItem = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      if (list.length > 1) setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (publishImmediately: boolean) => {
    if (!title.trim()) {
      setError('Please provide a title for your opportunity');
      setStep(4);
      return;
    }

    setSubmitting(true);
    setError('');

    const effectiveCompanyId =
      ownerType === 'COMPANY'
        ? companyId || (user?.profile as any)?.currentCompanyId || (user?.profile as any)?.companyId || undefined
        : undefined;

    const payload: any = {
      ownerType,
      title: title.trim(),
      summary: summary.trim(),
      visibility,
      approvalMode,
      status: publishImmediately ? 'ACTIVE' : 'DRAFT',
      targetIndustries: selectedIndustries,
      targetMarkets: selectedGeos,
      partnerTypes: selectedObjectives,
      seeking: {
        objectives: selectedObjectives,
        industries: selectedIndustries,
        geographies: selectedGeos,
        description: seekingDescription.trim(),
      },
      offering: {
        capabilities: selectedCapabilities,
        productsServices: offeringProducts.trim(),
        marketAccess: marketAccess.trim(),
        geographies: selectedGeos,
      },
    };

    if (effectiveCompanyId) {
      payload.companyId = effectiveCompanyId;
    }

    try {
      const endpoint = initialData ? `/api/v1/opportunities/${initialData.id}` : '/api/v1/opportunities';
      const method = initialData ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        let msg = 'Failed to save opportunity';
        if (Array.isArray(data.error)) {
          msg = data.error.join(', ');
        } else if (typeof data.error === 'string') {
          msg = data.error;
        } else if (typeof data.error === 'object' && data.error?.message) {
          msg = data.error.message;
        } else if (data.message) {
          msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        }
        throw new Error(msg);
      }

      showToast({
        title: publishImmediately ? '🚀 Opportunity Published!' : 'Draft Saved',
        message: publishImmediately
          ? 'Your opportunity is now live. Symmetrical mutual matching is evaluating partner overlap.'
          : 'Opportunity draft saved. You can preview and publish whenever ready.',
        type: 'success',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to submit opportunity.';
      setError(msg);
      showToast({
        title: 'Save Failed',
        message: msg,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div
        className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-border bg-bg flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Gap 1 &bull; Bilateral Opportunity Setup
                </span>
                <span className="text-xs text-text-muted">Step {step} of 5</span>
              </div>
              <h2 className="text-base font-extrabold text-navy mt-0.5">
                {initialData ? 'Edit Opportunity Profile' : 'Set Up Your Business Opportunity'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-navy hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-100">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* STEP 1: Scope */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-navy">Who is this opportunity profile for?</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Decide whether you are publishing on behalf of your institutional enterprise or as an independent executive.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOwnerType('COMPANY')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    ownerType === 'COMPANY'
                      ? 'border-black bg-neutral-50 shadow-xs'
                      : 'border-border bg-surface hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className={`w-5 h-5 ${ownerType === 'COMPANY' ? 'text-black' : 'text-text-muted'}`} />
                    {ownerType === 'COMPANY' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="mt-3">
                    <p className="font-bold text-xs text-navy">My Company / Enterprise</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {companyName || 'Institutional Entity'} &bull; DNS TXT Verified
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOwnerType('PROFESSIONAL')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    ownerType === 'PROFESSIONAL'
                      ? 'border-black bg-neutral-50 shadow-xs'
                      : 'border-border bg-surface hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <User className={`w-5 h-5 ${ownerType === 'PROFESSIONAL' ? 'text-black' : 'text-text-muted'}`} />
                    {ownerType === 'PROFESSIONAL' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div className="mt-3">
                    <p className="font-bold text-xs text-navy">Me as a Professional</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {user?.profile?.displayName || 'Executive Identity'} &bull; Advisory & Mandates
                    </p>
                  </div>
                </button>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Anti-Spam Authorization:</strong> Publishing as an enterprise checks your active membership role (`OWNER` or `ADMIN`). Cold recruitment or unverified outreach is strictly blocked.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: What Are You Looking For? */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-navy flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>What are you looking for? (Seeking Criteria)</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Meshvi will search for verified counterparties matching these explicit objectives.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-navy block">Commercial Objectives</label>
                <div className="grid grid-cols-2 gap-2">
                  {OBJECTIVE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleArrayItem(opt.id, selectedObjectives, setSelectedObjectives)}
                      className={`p-2.5 text-xs text-left font-medium rounded-lg border transition-all ${
                        selectedObjectives.includes(opt.id)
                          ? 'bg-neutral-900 text-white border-black'
                          : 'bg-bg text-navy border-border hover:border-neutral-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-navy block">Target Industry Sectors</label>
                <div className="flex flex-wrap gap-1.5">
                  {INDUSTRY_OPTIONS.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => toggleArrayItem(ind, selectedIndustries, setSelectedIndustries)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all font-semibold ${
                        selectedIndustries.includes(ind)
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-bg text-neutral-700 border-border hover:border-neutral-300'
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-navy block">Target Market Geographies</label>
                <div className="flex flex-wrap gap-1.5">
                  {GEO_OPTIONS.map((g) => (
                    <button
                      key={g.code}
                      type="button"
                      onClick={() => toggleArrayItem(g.code, selectedGeos, setSelectedGeos)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all font-semibold ${
                        selectedGeos.includes(g.code)
                          ? 'bg-sky-600 text-white border-sky-700'
                          : 'bg-bg text-neutral-700 border-border hover:border-neutral-300'
                      }`}
                    >
                      {g.label} ({g.code})
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy block">Describe what you seek (1-2 sentences)</label>
                <textarea
                  value={seekingDescription}
                  onChange={(e) => setSeekingDescription(e.target.value)}
                  placeholder="e.g. Seeking organic RTD botanical brands ready for airport lounge and transit hub shelf placement across Singapore and Malaysia."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-border bg-bg text-navy focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          )}

          {/* STEP 3: What Can You Offer? */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-navy flex items-center space-x-1.5">
                  <Gift className="w-4 h-4 text-sky-600" />
                  <span>What can you offer? (Bilateral Capabilities)</span>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  What makes you a compelling partner? This creates the symmetrical mutual match.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-navy block">Core Offering Capabilities</label>
                <div className="grid grid-cols-2 gap-2">
                  {CAPABILITY_OPTIONS.map((cap) => (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => toggleArrayItem(cap.id, selectedCapabilities, setSelectedCapabilities)}
                      className={`p-2.5 text-xs text-left font-medium rounded-lg border transition-all ${
                        selectedCapabilities.includes(cap.id)
                          ? 'bg-neutral-900 text-white border-black'
                          : 'bg-bg text-navy border-border hover:border-neutral-400'
                      }`}
                    >
                      {cap.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy block">Products, Inventory or Commercial Assets</label>
                <textarea
                  value={offeringProducts}
                  onChange={(e) => setOfferingProducts(e.target.value)}
                  placeholder="e.g. 12 Changi Terminal VIP lounge shelf allocations, cold-chain bonded fulfillment, master concession distribution."
                  rows={2}
                  className="w-full text-xs p-3 rounded-xl border border-border bg-bg text-navy focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy block">Physical Market Access / Regional Footprint</label>
                <input
                  type="text"
                  value={marketAccess}
                  onChange={(e) => setMarketAccess(e.target.value)}
                  placeholder="e.g. Changi Terminal 3 & 4 VIP Lounges, KLIA Satellite Hub"
                  className="w-full text-xs p-3 rounded-xl border border-border bg-bg text-navy focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Title & Summary */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-navy">Opportunity Overview</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Keep it concise so a busy executive can assess the fit in under 10 seconds.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy block">Opportunity Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Premium Airport Lounge Beverage Concession Intake"
                  className="w-full text-xs p-3 rounded-xl border border-border bg-bg text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-navy block">Executive Summary (1-2 sentences)</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Explain the opportunity context clearly..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-border bg-bg text-navy leading-relaxed focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="p-3 bg-bg border border-border rounded-xl space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                  Configured Two-Sided Alignment
                </span>
                <p className="text-navy font-medium">
                  <strong>Seeking:</strong> {selectedObjectives.join(', ')} &bull; {selectedGeos.join(', ')}
                </p>
                <p className="text-navy font-medium">
                  <strong>Offering:</strong> {selectedCapabilities.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Visibility & Review */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-navy">Who can discover this opportunity?</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  You stay in full control. Mutual matching will only evaluate eligible discoverable peers.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setVisibility('DISCOVERABLE')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                    visibility === 'DISCOVERABLE'
                      ? 'border-black bg-neutral-50 shadow-xs'
                      : 'border-border bg-surface hover:border-neutral-300'
                  }`}
                >
                  <Globe className={`w-5 h-5 shrink-0 mt-0.5 ${visibility === 'DISCOVERABLE' ? 'text-black' : 'text-text-muted'}`} />
                  <div>
                    <strong className="text-xs font-bold text-navy block">
                      Discoverable to Verified Meshvi Members (Recommended)
                    </strong>
                    <span className="text-[11px] text-text-muted leading-relaxed block mt-0.5">
                      Matched partners can discover the opportunity and submit a structured proposal. Direct phone and email remain shielded until you accept.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('PRIVATE')}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                    visibility === 'PRIVATE'
                      ? 'border-black bg-neutral-50 shadow-xs'
                      : 'border-border bg-surface hover:border-neutral-300'
                  }`}
                >
                  <Lock className={`w-5 h-5 shrink-0 mt-0.5 ${visibility === 'PRIVATE' ? 'text-black' : 'text-text-muted'}`} />
                  <div>
                    <strong className="text-xs font-bold text-navy block">
                      Private; Invite-Only
                    </strong>
                    <span className="text-[11px] text-text-muted leading-relaxed block mt-0.5">
                      Hidden from directory search. Only peers you explicitly share the link with can view.
                    </span>
                  </div>
                </button>
              </div>

              {/* Review Card */}
              <div className="p-4 bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Profile Preview
                  </span>
                  <span className="text-[9.5px] bg-white/10 px-2 py-0.5 rounded-full font-bold">
                    {ownerType}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white">{title || 'Untitled Opportunity'}</h4>
                <p className="text-[11px] text-neutral-300 line-clamp-2">{summary || 'No summary entered.'}</p>
                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1">
                  {selectedGeos.map((g) => (
                    <span key={g} className="px-1.5 py-0.5 bg-white/10 text-white text-[9px] rounded font-mono">
                      {g}
                    </span>
                  ))}
                  {selectedIndustries.slice(0, 2).map((i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-white/10 text-white text-[9px] rounded">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-border bg-bg flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-1.5 border border-border bg-surface hover:bg-neutral-100 text-navy font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="px-3.5 py-1.5 border border-border bg-surface hover:bg-neutral-100 text-navy font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>{submitting ? 'Publishing...' : 'Publish & Find Mutual Matches'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
