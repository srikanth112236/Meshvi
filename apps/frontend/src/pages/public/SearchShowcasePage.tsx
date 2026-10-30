import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  Globe2,
  SlidersHorizontal,
  ChevronRight,
  Lock,
  Zap,
  Cpu,
  BarChart3,
  Users,
  Play,
} from 'lucide-react';
import { MotionContainer, MotionStagger, MotionItem } from '../../components/ui/MotionSection';
import { ProductDemoPlayer } from '../../components/ui/ProductDemoPlayer';

interface SimulationScenario {
  id: string;
  category: string;
  prompt: string;
  taxonomy: {
    function: string;
    subFunction: string;
    industry: string;
    geography: string;
    seniority: string;
    intentType: string;
  };
  rubric: {
    total: number;
    breakdown: {
      functionScore: number;
      geoScore: number;
      industryScore: number;
      seniorityScore: number;
      intentScore: number;
    };
  };
  topMatches: Array<{
    name: string;
    role: string;
    company: string;
    location: string;
    verified: boolean;
    reason: string;
    score: number;
  }>;
}

const scenarios: SimulationScenario[] = [
  {
    id: 'aerospace',
    category: 'Advanced Manufacturing',
    prompt: 'Certified aerospace & titanium forging suppliers with AS9100 Rev D in India or the UK for defense contracts.',
    taxonomy: {
      function: 'Procurement & Supply Chain Operations',
      subFunction: 'Titanium & Superalloy Forging',
      industry: 'Aerospace & Defense',
      geography: 'India (Bangalore) / United Kingdom (Derby)',
      seniority: 'C-Level & VP Procurement',
      intentType: 'Supplier Qualification / Contract Manufacturing',
    },
    rubric: {
      total: 96,
      breakdown: {
        functionScore: 35, // out of 35
        geoScore: 24,      // out of 25
        industryScore: 20, // out of 20
        seniorityScore: 9, // out of 10
        intentScore: 8,    // out of 10
      },
    },
    topMatches: [
      {
        name: 'Dr. Vikram Malhotra',
        role: 'Chief Operating Officer & Head of Defense Works',
        company: 'Bharat Precision Metallurgy Ltd',
        location: 'Bangalore, India',
        verified: true,
        reason: 'AS9100 Rev D certified facility; direct supplier to DRDO and European primes.',
        score: 96,
      },
      {
        name: 'Alistair Sterling',
        role: 'VP Global Supply Chain & Aerospace Forging',
        company: 'Sterling Alloys & Aerostructures UK',
        location: 'Sheffield, United Kingdom',
        verified: true,
        reason: 'Specialized titanium aerospace alloy forgings with Nadcap accreditation.',
        score: 93,
      },
    ],
  },
  {
    id: 'cleantech',
    category: 'Energy & Infrastructure',
    prompt: 'Utility-scale battery energy storage system (BESS) EPC partners and grid interconnections in Western Europe.',
    taxonomy: {
      function: 'Project Finance & Renewable Engineering',
      subFunction: 'BESS Utility Deployment & EPC',
      industry: 'Renewable CleanTech & Utilities',
      geography: 'Germany / Netherlands / France',
      seniority: 'Managing Director / Partner',
      intentType: 'Grid EPC Joint Ventures & Offtake Agreements',
    },
    rubric: {
      total: 94,
      breakdown: {
        functionScore: 34,
        geoScore: 25,
        industryScore: 19,
        seniorityScore: 9,
        intentScore: 7,
      },
    },
    topMatches: [
      {
        name: 'Elena von Hardenberg',
        role: 'Managing Director - Energy Transition Infrastructure',
        company: 'Vanguard Cleantech Capital Europe',
        location: 'Frankfurt, Germany',
        verified: true,
        reason: '2.4 GW active pipeline across Central Europe; lead EPC contract syndicate.',
        score: 94,
      },
      {
        name: 'Pieter van den Berg',
        role: 'Chief Technology Officer - Grid Interconnections',
        company: 'Nordic-Benelux Gridworks BV',
        location: 'Rotterdam, Netherlands',
        verified: true,
        reason: 'High-voltage substation engineering and fast-frequency response integration.',
        score: 91,
      },
    ],
  },
  {
    id: 'enterprise-ai',
    category: 'Enterprise SaaS & FinTech',
    prompt: 'Chief Information Security Officers (CISOs) with SOC-2 Type II and FedRAMP high-assurance compliance experience.',
    taxonomy: {
      function: 'Information Security & Regulatory Governance',
      subFunction: 'Cloud Trust, FedRAMP & Zero-Trust',
      industry: 'Enterprise Software & FinTech',
      geography: 'North America / Singapore',
      seniority: 'CISO / VP Security',
      intentType: 'Security Advisory / Strategic Vendor Vetting',
    },
    rubric: {
      total: 98,
      breakdown: {
        functionScore: 35,
        geoScore: 25,
        industryScore: 20,
        seniorityScore: 10,
        intentScore: 8,
      },
    },
    topMatches: [
      {
        name: 'Marcus K. Thorne',
        role: 'Chief Information Security Officer',
        company: 'OmniTrust Financial Cloud',
        location: 'New York, USA',
        verified: true,
        reason: 'Successfully achieved FedRAMP High and SOC2 Type II for global Tier-1 banks.',
        score: 98,
      },
      {
        name: 'Serena Wei Lin',
        role: 'Head of Enterprise Cyber Risk & Cloud Governance',
        company: 'Apex Horizon APAC',
        location: 'Singapore',
        verified: true,
        reason: 'Author of APAC banking cloud zero-trust standard; bilateral deal advisor.',
        score: 95,
      },
    ],
  },
];

export const SearchShowcasePage = () => {
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>(scenarios[0]);
  const [customQuery, setCustomQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoChapter, setDemoChapter] = useState(1);

  const handleSimulate = (scenario: SimulationScenario) => {
    setIsSimulating(true);
    setActiveScenario(scenario);
    setCustomQuery('');
    setTimeout(() => {
      setIsSimulating(false);
    }, 350);
  };

  return (
    <div className="bg-bg min-h-screen text-text overflow-hidden selection:bg-primary/20">
      {/* Hero Section with Parallax Atmosphere */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-border overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-primary/15 via-emerald-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <MotionContainer className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide shadow-xs">
            <Cpu className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span>Deterministic Commercial Intent Engine</span>
          </MotionContainer>

          <MotionContainer delay={0.1} className="max-w-4xl mx-auto space-y-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-navy tracking-tight leading-[1.12]">
              Search by Commercial Intent.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-600 to-emerald-600">
                Not Flawed Job Titles.
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-text-muted leading-relaxed max-w-3xl mx-auto">
              Traditional databases match arbitrary strings like &quot;Manager&quot; or &quot;Director&quot;.
              Meshvi interprets your commercial goal, normalizes complex industrial requirements, and verifies match signals with an explainable 100-point rubric.
            </p>
          </MotionContainer>

          <MotionContainer delay={0.2} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl transition-all flex items-center justify-center text-sm"
            >
              <span>Explore Verified Directory</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <button
              type="button"
              onClick={() => {
                setDemoChapter(1);
                setDemoOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-navy font-bold rounded-xl border-2 border-primary/30 hover:border-primary shadow-xs transition-all flex items-center justify-center text-sm space-x-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-primary fill-primary" />
              <span>Watch Search Demo (0:15)</span>
            </button>
            <Link
              to="/why-meshvi"
              className="w-full sm:w-auto px-6 py-3.5 bg-surface hover:bg-surface-muted text-navy font-bold rounded-xl border border-border shadow-xs hover:border-slate-300 transition-all flex items-center justify-center text-sm"
            >
              <span>Why Meshvi Over Cold Outreach</span>
              <ChevronRight className="w-4 h-4 ml-1 text-text-muted" />
            </Link>
          </MotionContainer>
        </div>
      </section>

      {/* Interactive Live Intent Simulation Canvas */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Live Simulation</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-navy tracking-tight">
            See the Semantic Intent Normalizer in Action
          </h2>
          <p className="text-xs sm:text-sm text-text-muted">
            Select a C-level commercial procurement prompt below to observe how Meshvi deconstructs unstructured executive requirements into deterministic taxonomy signals.
          </p>
        </div>

        {/* Prompt Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {scenarios.map((sc) => {
            const isSelected = activeScenario.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSimulate(sc)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-navy text-white border-navy shadow-md scale-[1.02]'
                    : 'bg-surface text-navy border-border hover:bg-surface-muted hover:border-slate-300'
                }`}
              >
                <Target className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-primary'}`} />
                <span>{sc.category}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Simulation Display Board */}
        <div className="bg-surface rounded-3xl border border-border/80 shadow-xl overflow-hidden transition-all">
          {/* Top Bar with Live Prompt */}
          <div className="p-5 sm:p-7 bg-gradient-to-r from-slate-900 via-navy to-slate-900 text-white border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Active Natural Language Input
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Model: Meshvi-Intent-v3 (Latency: 42ms)
              </span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/5 border border-white/10 font-mono text-xs sm:text-sm text-emerald-200 leading-relaxed flex items-start space-x-3">
              <Search className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="flex-1">&quot;{customQuery || activeScenario.prompt}&quot;</p>
            </div>
          </div>

          {/* 3-Column Processing Breakdown */}
          <div className={`p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 ${isSimulating ? 'opacity-50 blur-[1px]' : 'opacity-100'} transition-all duration-300`}>
            
            {/* Column 1: Normalized Taxonomy (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-border">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                  1. Normalized Taxonomy
                </h3>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-surface-muted border border-border">
                  <span className="text-text-muted block text-[10px] font-bold uppercase">Functional Discipline</span>
                  <span className="font-bold text-navy text-xs">{activeScenario.taxonomy.function}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-muted border border-border">
                  <span className="text-text-muted block text-[10px] font-bold uppercase">Target Sub-Function</span>
                  <span className="font-bold text-navy text-xs">{activeScenario.taxonomy.subFunction}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-muted border border-border">
                  <span className="text-text-muted block text-[10px] font-bold uppercase">Industry Domain</span>
                  <span className="font-bold text-navy text-xs">{activeScenario.taxonomy.industry}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-muted border border-border">
                  <span className="text-text-muted block text-[10px] font-bold uppercase">Target Geographies</span>
                  <span className="font-bold text-navy text-xs">{activeScenario.taxonomy.geography}</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-muted border border-border">
                  <span className="text-text-muted block text-[10px] font-bold uppercase">Seniority & Mandate</span>
                  <span className="font-bold text-navy text-xs">{activeScenario.taxonomy.seniority}</span>
                </div>
              </div>
            </div>

            {/* Column 2: 100-Point Match Rubric (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-border">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                  2. 100-Point Rubric
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center space-y-1">
                <span className="text-[11px] font-bold uppercase text-emerald-800">Composite Match Score</span>
                <div className="text-4xl font-black text-emerald-700 tracking-tight">
                  {activeScenario.rubric.total}<span className="text-lg font-normal text-emerald-600">/100</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium block">
                  Exceeds 85% high-confidence bilateral threshold
                </span>
              </div>

              {/* Rubric Progress Bars */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-navy mb-1">
                    <span>Function Alignment</span>
                    <span className="font-mono">{activeScenario.rubric.breakdown.functionScore}/35</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(activeScenario.rubric.breakdown.functionScore / 35) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-navy mb-1">
                    <span>Geography Match</span>
                    <span className="font-mono">{activeScenario.rubric.breakdown.geoScore}/25</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${(activeScenario.rubric.breakdown.geoScore / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-navy mb-1">
                    <span>Industry Precision</span>
                    <span className="font-mono">{activeScenario.rubric.breakdown.industryScore}/20</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(activeScenario.rubric.breakdown.industryScore / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-navy mb-1">
                    <span>Seniority Authority</span>
                    <span className="font-mono">{activeScenario.rubric.breakdown.seniorityScore}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(activeScenario.rubric.breakdown.seniorityScore / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-navy mb-1">
                    <span>Active Intent Reciprocity</span>
                    <span className="font-mono">{activeScenario.rubric.breakdown.intentScore}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(activeScenario.rubric.breakdown.intentScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Verified Matching Decision Makers (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-border">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-navy uppercase tracking-wider">
                  3. Verified Decision-Makers
                </h3>
              </div>

              <div className="space-y-3.5">
                {activeScenario.topMatches.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-surface border border-border hover:border-primary/40 shadow-xs hover:shadow-md transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-sm font-bold text-navy">{m.name}</h4>
                          {m.verified && (
                            <span className="inline-flex items-center text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3 mr-0.5" /> DNS Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-text-muted mt-0.5">{m.role}</p>
                        <p className="text-xs text-text-muted/80">{m.company} &bull; {m.location}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-emerald-700">{m.score}%</span>
                        <span className="block text-[10px] text-text-muted">Match Score</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-surface-muted rounded-xl text-[11px] text-text-muted leading-relaxed border border-border/60">
                      <strong className="text-navy font-semibold">Grounded Reason: </strong>
                      {m.reason}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-bold text-indigo-600 flex items-center">
                        <Lock className="w-3 h-3 mr-1" /> Bilateral Double-Opt-In
                      </span>
                      <Link
                        to="/register"
                        className="text-xs font-bold text-primary hover:text-primary-hover flex items-center space-x-1"
                      >
                        <span>Request Contact</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 Architectural Pillars: Parallax-style Grid */}
      <section className="py-20 bg-surface-muted/60 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Core Architectural Superiority
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
              Built for High-Stakes Business Deals
            </h2>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              Why Fortune 500 executives, sovereign wealth directors, and high-growth founders choose Meshvi over traditional scraping databases.
            </p>
          </div>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MotionItem>
              <div className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-xs hover:shadow-lg transition-all h-full space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy">Zero Semantic Drift</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Keywords fail when dealing with complex engineering or regional terminology. Our taxonomy mapping aligns colloquial business speak with standardized enterprise schemas.
                </p>
              </div>
            </MotionItem>

            <MotionItem>
              <div className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-xs hover:shadow-lg transition-all h-full space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy">Corporate DNS Anchored</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Every profile and company page is verified against authoritative corporate DNS, official corporate email records, and executive verification audits. Zero ghost profiles.
                </p>
              </div>
            </MotionItem>

            <MotionItem>
              <div className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-xs hover:shadow-lg transition-all h-full space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy">Contact Privacy Firewall</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Executives do not have their direct phone numbers or email addresses published for cold spamming. Outreach requires business context and bilateral acceptance.
                </p>
              </div>
            </MotionItem>

            <MotionItem>
              <div className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-xs hover:shadow-lg transition-all h-full space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy">Explainable Scoring</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Never wonder why someone was suggested. Every recommendation reveals the exact mathematical rubric breakdown across function, geography, industry, and intent.
                </p>
              </div>
            </MotionItem>
          </MotionStagger>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Direct Technology Comparison
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-navy tracking-tight">
            How Meshvi Search Compares to Legacy Platforms
          </h2>
          <p className="text-xs sm:text-sm text-text-muted">
            Engineered specifically to solve the low-signal, high-noise crisis of professional outbound.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-surface-muted border-b border-border text-navy">
                <th className="p-4 sm:p-5 font-bold">Search & Discovery Capabilities</th>
                <th className="p-4 sm:p-5 font-bold text-primary bg-primary/5 border-x border-primary/20">
                  Meshvi Intent Engine
                </th>
                <th className="p-4 sm:p-5 font-bold text-slate-500">Traditional Scraping Tools (Apollo/ZoomInfo)</th>
                <th className="p-4 sm:p-5 font-bold text-slate-500">General Networks (LinkedIn Recruiter)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface text-text-muted">
              <tr>
                <td className="p-4 sm:p-5 font-bold text-navy">Search Input Format</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-primary/5 border-x border-primary/20">
                  Plain English Commercial Intent & Scope
                </td>
                <td className="p-4 sm:p-5">Rigid boolean title strings</td>
                <td className="p-4 sm:p-5">Exact job title keywords</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-navy">Match Justification</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-primary/5 border-x border-primary/20">
                  Transparent 100-pt rubric with exact reasoning
                </td>
                <td className="p-4 sm:p-5">None (Raw database filter)</td>
                <td className="p-4 sm:p-5">Black-box algorithm</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-navy">Outbound Spam Vulnerability</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-primary/5 border-x border-primary/20">
                  Zero. Protected by Double-Opt-In
                </td>
                <td className="p-4 sm:p-5">Severe (direct email exposed)</td>
                <td className="p-4 sm:p-5">High (unlimited InMail spam)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-navy">Data Provenance & Audit</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-primary/5 border-x border-primary/20">
                  Strictly permitted & DNS verified records
                </td>
                <td className="p-4 sm:p-5">Scraped without consent; high bounce rate</td>
                <td className="p-4 sm:p-5">Self-reported without verification</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-bold text-navy">Post-Search Collaboration</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-primary/5 border-x border-primary/20">
                  Bilateral Deal Rooms, NDAs & Milestones
                </td>
                <td className="p-4 sm:p-5">None (Exports to CSV)</td>
                <td className="p-4 sm:p-5">Casual messaging thread</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Global Executive Call-To-Action */}
      <section className="py-20 bg-gradient-to-br from-[#0B1528] via-[#102A43] to-[#0A192F] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Globe2 className="w-4 h-4" />
            <span>Connecting Decision-Makers in 40+ Countries</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Stop Guessing Titles. Start Connecting on Real Commercial Intent.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Join thousands of verified business leaders, enterprise buyers, and strategic partners already collaborating through Meshvi.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-xl transition-all flex items-center justify-center"
            >
              <span>Create Verified Executive Profile</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/why-meshvi"
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-xs transition-all flex items-center justify-center"
            >
              <span>Read Why Meshvi</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Search Product Demo Player */}
      <ProductDemoPlayer
        open={demoOpen}
        initialChapter={demoChapter}
        mode="single"
        onClose={() => setDemoOpen(false)}
      />
    </div>
  );
};
