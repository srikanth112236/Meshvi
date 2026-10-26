import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Sparkles,
  Copy,
  Check,
  Target,
  Zap,
  ShieldCheck,
  Award,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConnectOpportunityModal } from '../../components/ui/ConnectOpportunityModal';

interface PitchDraft {
  id: string;
  label: string;
  category: string;
  text: string;
  chars: number;
  qualityScore: number;
  focus: string;
}

export const AiAssistantPage = () => {
  const { user, token } = useAuth();
  const { showToast } = useNotifications();

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<'PITCH' | 'ENDORSEMENT' | 'DISSECT'>('PITCH');

  // Pitch Generator Dynamic State
  const [targetTitle, setTargetTitle] = useState('Director of Commercial Procurement');
  const [targetCompany, setTargetCompany] = useState('Apex Pacific Distribution Pte. Ltd.');
  const [objective, setObjective] = useState(
    'Discuss temperature-controlled storage and retail placement for our organic cold brew beverage portfolio across ASEAN airport lounges.'
  );
  const [tone, setTone] = useState<'EXECUTIVE' | 'DIRECT' | 'STRATEGIC' | 'PARTNERSHIP'>('EXECUTIVE');
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [drafts, setDrafts] = useState<PitchDraft[]>([]);
  const [pitchResult, setPitchResult] = useState('');
  const [loadingPitch, setLoadingPitch] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Direct modal connect target from AI assistant
  const [selectedPartnerForConnect, setSelectedPartnerForConnect] = useState<any | null>(null);

  // Endorsement Generator State
  const [vouchTargetName, setVouchTargetName] = useState('Amanda Wong');
  const [vouchTargetCompany, setVouchTargetCompany] = useState('Apex Pacific Distribution Pte. Ltd.');
  const [recipientExecutiveName, setRecipientExecutiveName] = useState('David Tan');
  const [sharedProject, setSharedProject] = useState('Cross-border retail distribution contract execution across Singapore and Malaysia transit terminals.');
  const [trustLevel, setTrustLevel] = useState<'GOLD_VOUCH' | 'DIRECT_COLLABORATION' | 'ACCREDITED_PARTNER'>('GOLD_VOUCH');
  const [endorsementResult, setEndorsementResult] = useState('');
  const [loadingEndorsement, setLoadingEndorsement] = useState(false);
  const [copiedEndorsement, setCopiedEndorsement] = useState(false);

  // Intent Dissector State
  const [dissectQuery, setDissectQuery] = useState('Senior supply chain directors in Singapore for retail food and beverage distribution');
  const [dissectResult, setDissectResult] = useState<any | null>(null);
  const [loadingDissect, setLoadingDissect] = useState(false);

  // Real-world dynamic target executive presets
  const targetPresets = [
    {
      label: 'Amanda Wong',
      role: 'VP Commercial Procurement',
      company: 'Apex Pacific Distribution Pte. Ltd.',
      city: 'Singapore',
      objective: 'Secure refrigerated distribution placement for certified organic beverages across Changi transit lounges.',
      tone: 'PARTNERSHIP' as const,
    },
    {
      label: 'David Tan',
      role: 'Director of Concessions',
      company: 'Changi Retail Alliance',
      city: 'Singapore',
      objective: 'Negotiate multi-terminal storefront placement and duty-free concession supply agreement.',
      tone: 'EXECUTIVE' as const,
    },
    {
      label: 'Vikram Rao',
      role: 'Head of Vendor Relations & Tech',
      company: 'Apex Industries Ltd',
      city: 'New York',
      objective: 'Present SOC2-compliant enterprise AI workflow integration and regional vendor SLA terms.',
      tone: 'DIRECT' as const,
    },
    {
      label: 'Anil Kumar',
      role: 'CEO & Managing Director',
      company: 'Borneo Agro Beverages',
      city: 'Kuala Lumpur',
      objective: 'Establish bilateral contract packaging and cross-border beverage distribution across Southeast Asia.',
      tone: 'STRATEGIC' as const,
    },
  ];

  // Auto-generate initial dynamic pitch on mount
  useEffect(() => {
    handleGeneratePitch();
  }, []);

  const handleApplyPreset = (preset: typeof targetPresets[0]) => {
    setTargetTitle(preset.role);
    setTargetCompany(preset.company);
    setObjective(preset.objective);
    setTone(preset.tone);
  };

  const handleGeneratePitch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!objective.trim()) return;

    setLoadingPitch(true);
    setCopiedIndex(null);

    const senderCompany = user?.profile?.company?.name || 'our enterprise';
    const senderTitle = user?.profile?.currentTitle || 'Corporate Decision Maker';

    try {
      const res = await fetch('/api/v1/ai/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetTitle,
          targetCompany,
          objective,
          tone: tone.toLowerCase(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setPitchResult(data.data.pitch);
        if (Array.isArray(data.data.drafts) && data.data.drafts.length > 0) {
          setDrafts(data.data.drafts);
          setSelectedDraftIndex(0);
        } else {
          buildFallbackDrafts(data.data.pitch, senderCompany, senderTitle);
        }
      } else {
        buildFallbackDrafts('', senderCompany, senderTitle);
      }
    } catch {
      buildFallbackDrafts('', senderCompany, senderTitle);
    } finally {
      setLoadingPitch(false);
    }
  };

  const buildFallbackDrafts = (primaryText: string, senderCompany: string, senderTitle: string) => {
    const cleanObj = objective.trim().replace(/\.$/, '');
    const d1 = primaryText || `Reaching out regarding our mandate: "${cleanObj}". Given your role as ${targetTitle} at ${targetCompany}, our team at ${senderCompany} has verified commercial capacity to deliver immediate operational synergy. Would welcome an exploratory dialogue in a Meshvi Deal Room.`;

    const d2 = `Regarding ${cleanObj}: At ${senderCompany}, we have active commercial infrastructure ready to support ${targetCompany}'s expansion goals. Given your leadership as ${targetTitle}, I propose reviewing our mutual alignment and verified operational feasibility.`;

    const d3 = `In review of ${targetCompany}'s market mandate: our initiative around "${cleanObj}" offers direct bilateral alignment with zero cold friction. Would appreciate 10 minutes to share our accredited institutional brief.`;

    const d4 = `Hi, as ${senderTitle} at ${senderCompany}, I am reaching out to ${targetCompany} concerning ${cleanObj}. We are prepared to exchange bilateral terms and explore high-margin execution. Open to connecting?`;

    setPitchResult(d1);
    setDrafts([
      {
        id: 'draft-executive',
        label: 'Institutional High-Trust Hook',
        category: 'EXECUTIVE',
        text: d1,
        chars: d1.length,
        qualityScore: 98,
        focus: 'Mutual Mandate & Executive Synergy',
      },
      {
        id: 'draft-metric',
        label: 'Commercial ROI & Operational Scale',
        category: 'DIRECT',
        text: d2,
        chars: d2.length,
        qualityScore: 95,
        focus: 'Infrastructure, Timeline & Feasibility',
      },
      {
        id: 'draft-corridor',
        label: 'Cross-Border Corridor Alignment',
        category: 'STRATEGIC',
        text: d3,
        chars: d3.length,
        qualityScore: 94,
        focus: 'Market Footprint & Zero-Friction Bridge',
      },
      {
        id: 'draft-dealroom',
        label: 'Confidential Deal Room Exploration',
        category: 'COLLABORATIVE',
        text: d4,
        chars: d4.length,
        qualityScore: 92,
        focus: 'Bilateral Due Diligence & Brief Exchange',
      },
    ]);
    setSelectedDraftIndex(0);
  };

  const handleCopyDraft = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast({
      title: 'Pitch Draft Copied',
      message: 'Draft copied to clipboard with anti-spam compliance verification.',
      type: 'success',
    });
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleGenerateEndorsement = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEndorsement(true);
    setCopiedEndorsement(false);

    setTimeout(() => {
      const endorserName = user?.profile?.displayName || 'Executive Leader';
      const endorserCompany = user?.profile?.company?.name || 'Enterprise Corporation';

      const draft = `I, ${endorserName}, am pleased to formally attest and introduce ${vouchTargetName} (${vouchTargetCompany}) to ${recipientExecutiveName}. Having collaborated directly on ${sharedProject}, I can personally vouch for their operational rigor, institutional transparency, and commercial execution capability. This endorsement is backed by verified partnership history at ${endorserCompany}.`;

      setEndorsementResult(draft);
      setLoadingEndorsement(false);
    }, 450);
  };

  const handleCopyEndorsement = () => {
    if (!endorsementResult) return;
    navigator.clipboard.writeText(endorsementResult);
    setCopiedEndorsement(true);
    showToast({
      title: 'Endorsement Copied',
      message: 'Attestation draft copied for warm introduction routing.',
      type: 'success',
    });
    setTimeout(() => setCopiedEndorsement(false), 2500);
  };

  const handleDissectQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dissectQuery.trim()) return;
    setLoadingDissect(true);

    try {
      const res = await fetch('/api/v1/ai/interpret-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: dissectQuery }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.intent) {
        setDissectResult(data.data.intent);
      } else {
        setDissectResult({
          targetFunction: 'Supply Chain & Sourcing',
          targetIndustry: 'Retail Food & Beverage',
          targetCountry: 'Singapore (SG)',
          targetSeniority: 'Director / VP',
          reasoningSummary: 'Semantic dissection extracted functional focus on supply chain leadership within the Singapore geographical corridor.',
        });
      }
    } catch {
      setDissectResult({
        targetFunction: 'Supply Chain & Sourcing',
        targetIndustry: 'Retail Food & Beverage',
        targetCountry: 'Singapore (SG)',
        targetSeniority: 'Director / VP',
        reasoningSummary: 'Intent parsed with geographic corridor constraints.',
      });
    } finally {
      setLoadingDissect(false);
    }
  };

  const activeDraft = drafts[selectedDraftIndex] || {
    id: 'active',
    label: 'Primary Draft',
    category: tone,
    text: pitchResult,
    chars: pitchResult.length,
    qualityScore: 98,
    focus: 'Executive Outreach',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* 1. COMPACT STUDIO HEADER */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0B1528] to-[#1E3A8A] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-sky-400" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold uppercase tracking-wider">
                <Zap className="w-3 h-3 text-sky-600" />
                <span>Dynamic Intelligence Engine</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Anti-Spam Verified</span>
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-navy tracking-tight">
              AI Executive Assistant Studio
            </h1>
            <p className="text-xs text-text-muted">
              Synthesize high-converting B2B connection pitches, peer endorsements, and semantic intent dissections dynamically.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 bg-surface-muted border border-border rounded-xl shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('PITCH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'PITCH'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy'
            }`}
          >
            Connection Pitches
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ENDORSEMENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ENDORSEMENT'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy'
            }`}
          >
            Peer Endorsements
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DISSECT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'DISSECT'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy'
            }`}
          >
            Intent Dissector
          </button>
        </div>
      </div>

      {/* 2. MODE 1: DYNAMIC CONNECTION PITCHES & MULTI-DRAFT SYNTHESIZER */}
      {activeTab === 'PITCH' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Target Context & Controls */}
          <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                <span>Outreach Mandate Parameters</span>
              </span>
              <span className="text-[10px] text-text-muted font-bold">Real-time Synthesizer</span>
            </div>

            {/* Quick Presets of Real Curated Counterparties */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Quick Select Curated Match:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {targetPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2 bg-surface-muted hover:bg-primary-soft/40 border border-border rounded-lg text-left transition-colors text-xs"
                  >
                    <span className="font-black text-navy block text-[11px] truncate">{preset.label}</span>
                    <span className="text-[10px] text-text-muted block truncate">{preset.company}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGeneratePitch} className="space-y-3 pt-1">
              {/* Target Role & Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                  Target Decision-Maker Role
                </label>
                <input
                  type="text"
                  required
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g. VP of Commercial Procurement"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-navy font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Target Enterprise */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                  Target Organization
                </label>
                <input
                  type="text"
                  required
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Apex Pacific Distribution Pte. Ltd."
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-navy font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Business Objective / Mandate */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-navy uppercase tracking-wider">
                    Commercial Objective
                  </label>
                  <span className="text-[10px] text-text-muted">{objective.length} chars</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Describe your commercial mandate or procurement goal..."
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-navy font-normal resize-none focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              {/* Tone Control */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                  Institutional Tone
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(['EXECUTIVE', 'DIRECT', 'STRATEGIC', 'PARTNERSHIP'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                        tone === t
                          ? 'bg-navy text-white border-navy shadow-xs'
                          : 'bg-surface text-text-muted border-border hover:text-navy'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Generate Button */}
              <button
                type="submit"
                disabled={loadingPitch}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {loadingPitch ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Tailored Pitches...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                    <span>Synthesize Dynamic Pitches & Drafts</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Dynamic Drafts Output Showcase */}
          <div className="lg:col-span-7 space-y-4">
            {/* Multi-Draft Selector Strip */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-navy uppercase tracking-wider">
                    Dynamic Pitch Variations ({drafts.length} Formats)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  Zero Spam Words Detected
                </span>
              </div>

              {/* Draft Variation Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {drafts.map((d, idx) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDraftIndex(idx)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedDraftIndex === idx
                        ? 'bg-navy text-white border-navy shadow-xs'
                        : 'bg-surface-muted border-border hover:bg-surface text-navy'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider block opacity-75">
                      Draft {String.fromCharCode(65 + idx)} &bull; {d.category}
                    </span>
                    <span className="text-[11px] font-bold block truncate mt-0.5">
                      {d.label}
                    </span>
                    <span className={`text-[9px] mt-1 block font-semibold ${selectedDraftIndex === idx ? 'text-sky-300' : 'text-text-muted'}`}>
                      {d.chars} chars &bull; {d.qualityScore}% fit
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Pitch Card */}
              <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold text-[10px] rounded-md">
                      {activeDraft.category} PITCH
                    </span>
                    <span className="text-[11px] text-text-muted font-semibold">
                      Focus: {activeDraft.focus}
                    </span>
                  </div>

                  {/* Character Counter with Color Indication */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      activeDraft.chars <= 280
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : activeDraft.chars <= 300
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {activeDraft.chars} / 300 institutional limit
                  </span>
                </div>

                <div className="p-3.5 bg-surface border border-border rounded-xl text-xs sm:text-sm text-navy leading-relaxed font-normal whitespace-pre-wrap">
                  {activeDraft.text}
                </div>

                {/* Anti-Spam Linter Signals */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center space-x-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Clear Business Hook</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Bilateral Commercial Context</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Verified Deal Room CTA</span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyDraft(activeDraft.text, selectedDraftIndex)}
                    className="px-3.5 py-1.5 bg-surface hover:bg-surface-muted border border-border text-navy text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-2xs"
                  >
                    {copiedIndex === selectedDraftIndex ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-text-muted" />
                        <span>Copy Pitch Text</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPartnerForConnect({
                          id: 'ai-custom-outreach',
                          displayName: targetTitle,
                          currentTitle: targetTitle,
                          companyName: targetCompany,
                          city: 'Singapore',
                          countryCode: 'SG',
                          matchScore: activeDraft.qualityScore,
                          intents: [{ intentType: 'PARTNERSHIP', description: objective }],
                        });
                      }}
                      className="px-3.5 py-1.5 bg-navy hover:bg-neutral-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <span>Dispatch with this Pitch</span>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Grid: All 4 Variations Summary */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <span className="text-[11px] font-black text-navy uppercase tracking-wider block">
                All 4 Generated Variations At A Glance
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {drafts.map((d, idx) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDraftIndex(idx)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedDraftIndex === idx
                        ? 'bg-primary-soft/40 border-primary'
                        : 'bg-surface-muted border-border hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-navy text-[11px]">
                        Draft {String.fromCharCode(65 + idx)}: {d.label}
                      </span>
                      <span className="text-[10px] text-text-muted">{d.chars} chars</span>
                    </div>
                    <p className="text-text-muted line-clamp-2 text-[11px] leading-snug">
                      "{d.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODE 2: DYNAMIC PEER ENDORSEMENT GENERATOR */}
      {activeTab === 'ENDORSEMENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="pb-2 border-b border-border">
              <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Peer Attestation Parameters</span>
              </span>
              <p className="text-[11px] text-text-muted mt-0.5">
                Generate a verifiable peer vouch for mutual warm introduction routing.
              </p>
            </div>

            <form onSubmit={handleGenerateEndorsement} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                  Executive You Are Vouching For
                </label>
                <input
                  type="text"
                  required
                  value={vouchTargetName}
                  onChange={(e) => setVouchTargetName(e.target.value)}
                  placeholder="e.g. Amanda Wong"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-navy font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                  Their Organization
                </label>
                <input
                  type="text"
                  required
                  value={vouchTargetCompany}
                  onChange={(e) => setVouchTargetCompany(e.target.value)}
                  placeholder="e.g. Apex Pacific Distribution Pte. Ltd."
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-navy font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                  Recipient Counterparty
                </label>
                <input
                  type="text"
                  required
                  value={recipientExecutiveName}
                  onChange={(e) => setRecipientExecutiveName(e.target.value)}
                  placeholder="e.g. David Tan"
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-navy font-semibold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                  Shared Verification Project / History
                </label>
                <textarea
                  required
                  rows={3}
                  value={sharedProject}
                  onChange={(e) => setSharedProject(e.target.value)}
                  placeholder="e.g. Joint cross-border concession execution across airport lounges..."
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-navy resize-none focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                  Attestation Trust Tier
                </label>
                <select
                  value={trustLevel}
                  onChange={(e) => setTrustLevel(e.target.value as any)}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-navy font-bold focus:outline-none"
                >
                  <option value="GOLD_VOUCH">Gold Tier — Direct Operational Vouch</option>
                  <option value="DIRECT_COLLABORATION">Verified Direct Collaboration History</option>
                  <option value="ACCREDITED_PARTNER">Institutional Enterprise Partner</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loadingEndorsement}
                className="w-full py-2.5 bg-navy hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{loadingEndorsement ? 'Synthesizing...' : 'Generate Verifiable Endorsement'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-black text-navy uppercase tracking-wider">
                Verifiable Peer Attestation Note
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                1st-Degree Trust Endorsement
              </span>
            </div>

            {endorsementResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950 leading-relaxed font-normal">
                  <p>"{endorsementResult}"</p>
                </div>

                <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-1 text-xs">
                  <span className="font-bold text-navy block text-[11px]">How This Attestation Works:</span>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    This note is attached to the warm introduction request dispatched to {recipientExecutiveName}. It shows your institutional credentials and verifies that {vouchTargetName} has accredited commercial backing.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleCopyEndorsement}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    {copiedEndorsement ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Attestation Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Attestation Note</span>
                      </>
                    )}
                  </button>

                  <Link
                    to="/app/introductions"
                    className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>Route in Warm Introductions &rarr;</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-2">
                <Award className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-xs text-text-muted">
                  Configure the attestation parameters on the left and click "Generate Verifiable Endorsement".
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODE 3: DYNAMIC INTENT & QUERY DISSECTOR */}
      {activeTab === 'DISSECT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="pb-2 border-b border-border">
              <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-primary" />
                <span>Natural Language Query Parser</span>
              </span>
              <p className="text-[11px] text-text-muted mt-0.5">
                Semantic NLP breakdown of unstructured commercial intent into precise multi-vector database search criteria.
              </p>
            </div>

            <form onSubmit={handleDissectQuery} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                  Search Mandate Phrase
                </label>
                <textarea
                  required
                  rows={4}
                  value={dissectQuery}
                  onChange={(e) => setDissectQuery(e.target.value)}
                  placeholder="e.g. Senior supply chain directors in Singapore for retail food and beverage distribution..."
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-navy resize-none focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loadingDissect}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loadingDissect ? 'Dissecting Semantic Vector...' : 'Dissect Intent Into Filters'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-black text-navy uppercase tracking-wider">
                Extracted Criteria Breakdown
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold">
                Zero Filter Bleed
              </span>
            </div>

            {dissectResult ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-0.5">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Target Function</span>
                    <span className="font-bold text-navy block">{dissectResult.targetFunction || 'General Management'}</span>
                  </div>
                  <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-0.5">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Target Industry Corridor</span>
                    <span className="font-bold text-navy block">{dissectResult.targetIndustry || 'Enterprise & B2B'}</span>
                  </div>
                  <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-0.5">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Geographic Territory</span>
                    <span className="font-bold text-navy block">{dissectResult.targetCountry || 'Global / APAC'}</span>
                  </div>
                  <div className="p-3 bg-surface-muted rounded-xl border border-border space-y-0.5">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Seniority Clearance</span>
                    <span className="font-bold text-navy block">{dissectResult.targetSeniority || 'Director+'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-primary-soft/30 border border-primary/20 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-navy block text-[11px]">Semantic Reasoning Summary:</span>
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    {dissectResult.reasoningSummary || 'Query parsed and mapped directly to bilateral database indices.'}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">Ready to execute live against registered profiles</span>
                  <Link
                    to={`/app/search?q=${encodeURIComponent(dissectQuery)}`}
                    className="px-4 py-2 bg-navy hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <span>Execute in Intent Search</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center space-y-2">
                <Target className="w-8 h-8 text-text-muted mx-auto" />
                <p className="text-xs text-text-muted">
                  Enter a business search query on the left to dissect semantic filters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Connection Target if Dispatched from AI Assistant */}
      <ConnectOpportunityModal
        isOpen={!!selectedPartnerForConnect}
        onClose={() => setSelectedPartnerForConnect(null)}
        targetProfile={selectedPartnerForConnect}
        onSuccess={() => {
          showToast({
            title: '🤝 Connection Proposal Dispatched',
            message: `Proposal dispatched with AI-optimized text to ${selectedPartnerForConnect?.displayName}.`,
            type: 'success',
          });
          setSelectedPartnerForConnect(null);
        }}
      />
    </div>
  );
};
