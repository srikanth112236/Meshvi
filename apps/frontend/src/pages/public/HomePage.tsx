import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Network,
  Cpu,
  Layers,
  Lock,
  Zap,
  Target,
  FileCheck,
  BarChart3,
  Building2,
  UserCheck,
  ChevronRight,
  Database,
} from 'lucide-react';
import { MotionContainer, MotionStagger, MotionItem } from '../../components/ui/MotionSection';
import {
  SpotlightCard,
  AnimatedBeam,
  LiveRadar,
  LiveSearchPipelineVisual,
  StickyScrollLifecycle,
  InfiniteTicker,
  ConnectionBridgeSimulator,
  LiveQueryTerminal,
} from '../../components/ui/AceternityUI';

export const HomePage = () => {
  const [selectedPrompt, setSelectedPrompt] = useState(
    'I have an airport-lounge opportunity in Malaysia. Help me identify relevant commercial, partnerships or business-development contacts at beverage companies.'
  );

  const [activeTab, setActiveTab] = useState<'partnerships' | 'procurement' | 'distribution'>('partnerships');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const samplePrompts = [
    {
      label: 'Airport Lounge Partnerships (Malaysia)',
      text: 'I have an airport-lounge opportunity in Malaysia. Help me identify relevant commercial, partnerships or business-development contacts at beverage companies.',
      type: 'partnerships',
    },
    {
      label: 'Procurement Leaders (Consumer Electronics)',
      text: 'Looking for supply chain and component procurement decision-makers at tier-1 consumer electronics hardware manufacturers in Germany.',
      type: 'procurement',
    },
    {
      label: 'B2B Software Distributors (Japan)',
      text: 'Expanding enterprise SaaS into Tokyo. Need authorized commercial directors or reseller alliance heads with cloud distribution experience.',
      type: 'distribution',
    },
  ];

  const faqs = [
    {
      q: 'How does MESHVI differ from mass scrapers and legacy email blast databases?',
      a: 'Legacy directories index millions of unverified, stale emails and encourage low-reply spamming. MESHVI operates on strict intent normalization, permissioned data provenance, bounded 100-point heuristic scoring, and mandatory business context on every single outbound request.',
    },
    {
      q: 'Are search matches based on black-box probabilities or real data fields?',
      a: 'Every search result is calculated using transparent, deterministic rubric points: Function (35 pts), Geography (25 pts), Industry (20 pts), Seniority (10 pts), and Declared Intent (10 pts). We supply unambiguous reason codes like EXACT_FUNCTION_MATCH rather than ungrounded "99% match" claims.',
    },
    {
      q: 'How do warm introductions work through mutual colleagues?',
      a: 'Meshvi features a double-opt-in bridge workflow. You designate a shared colleague as an intermediary, explain your business purpose, and they decide whether to sponsor and forward the introduction to the target executive.',
    },
    {
      q: 'Can my company claim and manage our enterprise profile and employees?',
      a: 'Yes. Authorized representatives can claim or register company listings. Administrators issue cryptographically hashed, single-use invitation tokens to employees to build a verified roster of organizational decision-makers.',
    },
    {
      q: 'What privacy rights does Meshvi provide under GDPR and DPDP?',
      a: 'Full control. Users can adjust visibility to public, signed-in-only, or private. Automated right-to-erasure workflows are integrated directly into our administrative and profile dashboards.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* SECTION 1: HERO SECTION (Modern Aceternity Grid & Ambient Light) */}
      <section className="relative pt-12 md:pt-24 overflow-hidden bg-grid-pattern">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <MotionContainer>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface glass-card text-navy text-xs font-bold mb-8 shadow-sm border border-border">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Intent-Driven B2B Professional Discovery</span>
              <span className="text-text-muted">&bull; Global Pilot Edition</span>
            </div>
          </MotionContainer>

          <MotionContainer delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-navy tracking-tight max-w-5xl mx-auto leading-[1.1] sm:leading-[1.1]">
              Who do you need to <span className="shimmer-text">connect with</span>?
            </h1>
          </MotionContainer>

          <MotionContainer delay={0.2}>
            <p className="mt-6 text-lg sm:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed font-normal">
              State your commercial objective in plain English. MESHVI interprets your target criteria, scores real permitted records with explainable reason codes, and brokers verified high-trust introductions.
            </p>
          </MotionContainer>

          <MotionContainer delay={0.3}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center group"
              >
                <span>Start Discovering Free</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/how-it-works"
                className="w-full sm:w-auto px-8 py-3.5 bg-surface hover:bg-surface-muted text-navy font-bold border border-border rounded-xl transition-all shadow-sm flex items-center justify-center"
              >
                Explore 7-Step Protocol &rarr;
              </Link>
            </div>
          </MotionContainer>

          {/* Trust Banner */}
          <MotionContainer delay={0.4}>
            <div className="mt-6 max-w-2xl mx-auto text-xs text-text-muted flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>
                100% Grounded in real, permitted records. Never hallucinated. No scraping behind personal walls.
              </span>
            </div>
          </MotionContainer>

          {/* Interactive Sandbox */}
          <MotionContainer delay={0.5} className="mt-14 max-w-4xl mx-auto">
            <div className="glass-card rounded-2xl shadow-2xl border border-border overflow-hidden text-left">
              <div className="p-4 sm:p-6 border-b border-border bg-surface-muted/60">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="objective-input" className="block text-[11px] font-black uppercase tracking-wider text-navy">
                    Simulate an Objective Query
                  </label>
                  <span className="text-[10px] font-bold text-primary flex items-center">
                    <Compass className="w-3 h-3 mr-1" />
                    AI Intent Normalization
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap mb-3">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPrompt(p.text)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all font-semibold border ${
                        selectedPrompt === p.text
                          ? 'bg-navy text-white border-navy shadow-sm'
                          : 'bg-surface text-text-muted border-border hover:bg-surface-muted hover:text-navy'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    id="objective-input"
                    rows={3}
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    className="w-full p-4 bg-surface border border-border rounded-xl text-xs sm:text-sm text-navy focus:outline-none focus:ring-2 focus:ring-focus font-medium resize-none shadow-inner"
                  />
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center"
                    >
                      <Search className="w-3.5 h-3.5 mr-1.5" />
                      Run Real Search &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              {/* Match Card Preview */}
              <div className="p-4 sm:p-6 bg-surface">
                <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Structured Match Preview</span>
                  <span className="text-success font-semibold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Confidence Score: 90 / 100
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-surface-muted/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-navy text-white font-black text-sm flex items-center justify-center">
                        SM
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-navy">Srikanth M</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary">
                            Head of Strategic Partnerships
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          Apex Pacific Distribution &bull; Kuala Lumpur, Malaysia (MY)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-navy bg-surface px-3 py-1.5 rounded-lg border border-border">
                        Commercial & Partnerships
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-surface rounded-xl border border-border/60 text-xs text-navy flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-primary font-bold">Why this match: </strong>
                      <span>
                        Exact functional alignment with "Commercial & Partnerships"; Operating in target market territory (MY); Active in specified industry (Consumer Goods & FMCG); Declared business intent aligns directly with your airport concession goal.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionContainer>
        </div>
      </section>

      {/* SECTION 2: LIVE TELEMETRY & TRUST COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionContainer>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-surface border border-border rounded-2xl shadow-sm">
            <div className="text-center p-3">
              <span className="text-3xl font-black text-navy block">100%</span>
              <span className="text-xs text-text-muted font-medium mt-1 block">Verified Record Grounding</span>
            </div>
            <div className="text-center p-3 border-l border-border">
              <span className="text-3xl font-black text-primary block">35-100</span>
              <span className="text-xs text-text-muted font-medium mt-1 block">Bounded Rubric Score</span>
            </div>
            <div className="text-center p-3 border-l border-border">
              <span className="text-3xl font-black text-navy block">0</span>
              <span className="text-xs text-text-muted font-medium mt-1 block">Blind Email Blast Spam</span>
            </div>
            <div className="text-center p-3 border-l border-border">
              <span className="text-3xl font-black text-success block">Double</span>
              <span className="text-xs text-text-muted font-medium mt-1 block">Opt-In Introduction Privacy</span>
            </div>
          </div>
        </MotionContainer>
      </section>

      {/* SECTION 3: THE PARADIGM SHIFT (Legacy vs. Meshvi) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionContainer className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">The Paradigm Shift</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mt-2">
            Why Traditional B2B Prospecting Fails
          </h2>
          <p className="text-text-muted text-sm sm:text-base mt-2">
            Cold spray-and-pray databases have destroyed response rates. Here is how Meshvi restores commercial trust.
          </p>
        </MotionContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-danger/5 border border-danger/20 space-y-4">
            <div className="flex items-center space-x-2 text-danger font-bold text-sm uppercase">
              <Lock className="w-4 h-4" />
              <span>Legacy Prospecting Engines</span>
            </div>
            <ul className="space-y-3 text-xs text-text-muted">
              <li className="flex items-start space-x-2">
                <span className="text-danger font-bold shrink-0">&times;</span>
                <span>Requires guessing arbitrary job titles that differ by country and org chart.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-danger font-bold shrink-0">&times;</span>
                <span>Encourages indiscriminate cold email blasts with 0.5% response rates.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-danger font-bold shrink-0">&times;</span>
                <span>Vague probabilistic claims ("98% matching candidate") with zero explanation.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-danger font-bold shrink-0">&times;</span>
                <span>Scraped behind paywalls, violating privacy directives and spam laws.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-primary-soft/40 border border-primary/30 space-y-4">
            <div className="flex items-center space-x-2 text-primary font-bold text-sm uppercase">
              <CheckCircle2 className="w-4 h-4" />
              <span>MESHVI Intent Architecture</span>
            </div>
            <ul className="space-y-3 text-xs text-navy font-medium">
              <li className="flex items-start space-x-2">
                <span className="text-success font-bold shrink-0">&check;</span>
                <span>Intent-first search: specify the commercial objective; we normalize the function.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-success font-bold shrink-0">&check;</span>
                <span>Mandatory business reason for every connection; zero unsolicited blasts.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-success font-bold shrink-0">&check;</span>
                <span>Transparent 100-point rubric breakdown and clear reason codes.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-success font-bold shrink-0">&check;</span>
                <span>Full data provenance, GDPR/DPDP right-to-erasure, and company claiming.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Live Animated Search & Data Pipeline Arena (Replaces static slider) */}
        <div className="mt-14 space-y-4">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1 rounded-full">
              Live Interactive Resolution Arena
            </span>
            <h3 className="text-2xl font-bold text-navy mt-2">How Your Need Connects to the Right Leader</h3>
            <p className="text-xs text-text-muted mt-1 max-w-xl mx-auto">
              Follow how an ordinary business goal is translated into commercial areas, cross-referenced with verified corporate directories, and matched with clear business rationale.
            </p>
          </div>
          <LiveSearchPipelineVisual />
        </div>
      </section>

      {/* SECTION 4: 100-POINT GROUNDED SCORING BREAKDOWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionContainer className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Explainable Scoring</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mt-2">
            Bounded 100-Point Match Rubric
          </h2>
          <p className="text-text-muted text-sm sm:text-base mt-2">
            No hallucinated percentages. Every point is anchored to verifiable database attributes.
          </p>
        </MotionContainer>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bento-card p-5 space-y-2">
            <div className="text-2xl font-black text-primary">35 Pts</div>
            <div className="text-xs font-bold text-navy">Function Alignment</div>
            <p className="text-[11px] text-text-muted">Exact match with normalized functional taxonomies (Commercial, Supply Chain, BD).</p>
          </div>
          <div className="bento-card p-5 space-y-2">
            <div className="text-2xl font-black text-primary">25 Pts</div>
            <div className="text-xs font-bold text-navy">Geographic Proximity</div>
            <p className="text-[11px] text-text-muted">Physical territory alignment in target markets (e.g. Malaysia, Germany, Japan).</p>
          </div>
          <div className="bento-card p-5 space-y-2">
            <div className="text-2xl font-black text-primary">20 Pts</div>
            <div className="text-xs font-bold text-navy">Industry Focus</div>
            <p className="text-[11px] text-text-muted">Enterprise operational sector match (FMCG, Medical, Cloud Enterprise Software).</p>
          </div>
          <div className="bento-card p-5 space-y-2">
            <div className="text-2xl font-black text-primary">10 Pts</div>
            <div className="text-xs font-bold text-navy">Seniority Level</div>
            <p className="text-[11px] text-text-muted">Decision-making rank matches hierarchy requirements (Director, Head, VP).</p>
          </div>
          <div className="bento-card p-5 space-y-2">
            <div className="text-2xl font-black text-primary">10 Pts</div>
            <div className="text-xs font-bold text-navy">Declared Intent</div>
            <p className="text-[11px] text-text-muted">Direct match with candidate's published OFFERING or LOOKING_FOR statements.</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: THREE PILLARS (Aceternity Bento Showcase) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionContainer className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Core Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mt-2">
            Engineered for High-Trust Alliances
          </h2>
        </MotionContainer>

        <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MotionItem>
            <SpotlightCard className="p-8 h-full flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy">Intent-First Normalization</h3>
                <p className="text-text-muted text-xs leading-relaxed">
                  Instead of guessing job titles, state your business goal. Our dual AI & deterministic engine maps colloquial queries to structured functions.
                </p>
                <AnimatedBeam className="mt-2" />
              </div>
              <div className="pt-4 border-t border-border text-xs text-primary font-bold flex items-center">
                <span>Deterministic Fallback NLP</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </SpotlightCard>
          </MotionItem>

          <MotionItem>
            <SpotlightCard className="p-8 h-full flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy">Verified Provenance</h3>
                <p className="text-text-muted text-xs leading-relaxed">
                  Every data source and CSV ingestion job is audited. Formula injection shields (=, +, -, @) protect enterprise integrity at all times.
                </p>
                <AnimatedBeam className="mt-2" />
              </div>
              <div className="pt-4 border-t border-border text-xs text-success font-bold flex items-center">
                <span>Sanitized Data Pipelines</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </SpotlightCard>
          </MotionItem>

          <MotionItem>
            <SpotlightCard className="p-8 h-full flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Network className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-navy">Warm Bridge Introductions</h3>
                <p className="text-text-muted text-xs leading-relaxed">
                  Connect directly with verified reasons, or leverage mutual colleagues to broker double-opt-in warm introductions.
                </p>
                <AnimatedBeam className="mt-2" />
              </div>
              <div className="pt-4 border-t border-border text-xs text-purple-600 font-bold flex items-center">
                <span>3-Party Double-Opt-In</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </SpotlightCard>
          </MotionItem>
        </MotionStagger>

        {/* Live Radar Spotlight Showcase (Aceternity interactive visual) */}
        <div className="mt-12 p-8 bg-surface border border-border rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
              Real-Time Search Telemetry
            </span>
            <h3 className="text-2xl font-bold text-navy">Continuous Candidate Verification Radar</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              When queries enter the discovery engine, our multi-tier resolver validates candidate titles, cross-checks active company domains, and calculates bounded reason codes with zero probabilistic hallucination.
            </p>
          </div>
          <div>
            <LiveRadar />
          </div>
        </div>
      </section>

      {/* SECTION 6: THE 7-STEP PROTOCOL TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Process Integrity</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">
                The 7-Step Deterministic Protocol
              </h3>
              <p className="text-xs sm:text-sm text-text-muted mt-1">
                Every connection follows a structured verification path to guarantee mutual respect.
              </p>
            </div>
            <Link
              to="/how-it-works"
              className="px-6 py-2.5 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy-hover transition-all self-start md:self-auto"
            >
              View Full Protocol &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-1">
              <span className="text-[10px] font-bold text-primary">STEP 01 - 02</span>
              <h4 className="text-xs font-bold text-navy">Declare Intent & State Objective</h4>
              <p className="text-[11px] text-text-muted">Define what you are offering and state your goal in plain text.</p>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-1">
              <span className="text-[10px] font-bold text-primary">STEP 03 - 04</span>
              <h4 className="text-xs font-bold text-navy">Taxonomy Match & Record Query</h4>
              <p className="text-[11px] text-text-muted">Query real database rows mapped across authorized divisions.</p>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-1">
              <span className="text-[10px] font-bold text-primary">STEP 05 - 06</span>
              <h4 className="text-xs font-bold text-navy">Score Signals & Context Request</h4>
              <p className="text-[11px] text-text-muted">Review 100-point rubric breakdown and send structured requests.</p>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-1">
              <span className="text-[10px] font-bold text-primary">STEP 07</span>
              <h4 className="text-xs font-bold text-navy">Permissioned Messaging</h4>
              <p className="text-[11px] text-text-muted">Communicate directly in encrypted, consent-based chat threads.</p>
            </div>
          </div>
        </div>

        {/* Aceternity Sticky Scroll Lifecycle Showcase */}
        <div className="mt-14">
          <StickyScrollLifecycle />
        </div>
      </section>

      {/* SECTION 7: INTERACTIVE SCENARIO EXPLORER TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionContainer className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Live Use Cases</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mt-2">
            Explore Cross-Border Scenarios
          </h2>
        </MotionContainer>

        <div className="flex justify-center space-x-2 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('partnerships')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'partnerships'
                ? 'bg-navy text-white shadow-sm'
                : 'bg-surface-muted text-text-muted hover:text-navy'
            }`}
          >
            Duty-Free Retail Partnerships
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('procurement')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'procurement'
                ? 'bg-navy text-white shadow-sm'
                : 'bg-surface-muted text-text-muted hover:text-navy'
            }`}
          >
            OEM Supply Chain Procurement
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('distribution')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'distribution'
                ? 'bg-navy text-white shadow-sm'
                : 'bg-surface-muted text-text-muted hover:text-navy'
            }`}
          >
            SaaS Reseller Alliances
          </button>
        </div>

        <div className="mt-8 p-8 bg-surface border border-border rounded-2xl shadow-sm">
          {activeTab === 'partnerships' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
                  Travel Retail Concessions
                </span>
                <h3 className="text-2xl font-bold text-navy">Airport Lounge Beverage Concessionaires</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Connecting premium beverage brands and specialty roasters directly with authorized concession heads across Southeast Asian transit airports (KLIA, Changi, Suvarnabhumi).
                </p>
                <div className="text-xs font-semibold text-navy">
                  Normalized Taxonomy: Commercial & Partnerships &bull; FMCG &bull; Southeast Asia
                </div>
              </div>
              <div className="p-5 bg-surface-muted rounded-xl border border-border space-y-3 text-xs">
                <div className="font-bold text-navy flex items-center justify-between">
                  <span>Match Candidate Preview</span>
                  <span className="text-success font-semibold">90 / 100 Score</span>
                </div>
                <p className="text-text-muted">Srikanth M &bull; Head of Strategic Partnerships at Apex Pacific Distribution</p>
                <div className="p-3 bg-surface rounded-lg border border-border text-[11px]">
                  <strong>Declared Intent: </strong>"Seeking FMCG beverage partners for airport lounge opportunities."
                </div>
              </div>
            </div>
          )}

          {activeTab === 'procurement' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-success bg-success/10 px-2.5 py-0.5 rounded-full">
                  Component Manufacturing
                </span>
                <h3 className="text-2xl font-bold text-navy">Hardware & Electronics Tier-1 Sourcing</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Identify specific category managers and vendor onboarding leads at European electronics manufacturing facilities without getting trapped in general inquiries.
                </p>
                <div className="text-xs font-semibold text-navy">
                  Normalized Taxonomy: Supply Chain & Procurement &bull; Hardware &bull; Germany (DACH)
                </div>
              </div>
              <div className="p-5 bg-surface-muted rounded-xl border border-border space-y-3 text-xs">
                <div className="font-bold text-navy flex items-center justify-between">
                  <span>Match Candidate Preview</span>
                  <span className="text-success font-semibold">85 / 100 Score</span>
                </div>
                <p className="text-text-muted">Procurement Director &bull; Tier-1 Microelectronics GmbH</p>
                <div className="p-3 bg-surface rounded-lg border border-border text-[11px]">
                  <strong>Reason Code: </strong>EXACT_FUNCTION_MATCH &bull; MARKET_GEO_PROXIMITY
                </div>
              </div>
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                  Enterprise Software
                </span>
                <h3 className="text-2xl font-bold text-navy">Tokyo Cloud Reseller Networks</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Connect US and European B2B SaaS vendors expanding into Tokyo with licensed system integrators and reseller alliance vice presidents.
                </p>
                <div className="text-xs font-semibold text-navy">
                  Normalized Taxonomy: Business Development & Sales &bull; Enterprise Software &bull; Japan
                </div>
              </div>
              <div className="p-5 bg-surface-muted rounded-xl border border-border space-y-3 text-xs">
                <div className="font-bold text-navy flex items-center justify-between">
                  <span>Match Candidate Preview</span>
                  <span className="text-success font-semibold">88 / 100 Score</span>
                </div>
                <p className="text-text-muted">Alliance Director &bull; Tokyo Cloud Systems K.K.</p>
                <div className="p-3 bg-surface rounded-lg border border-border text-[11px]">
                  <strong>Reason Code: </strong>INDUSTRY_FOCUS &bull; DECLARED_INTENT_ALIGNMENT
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 8: FOR ENTERPRISE ORGANIZATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bento-card p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Organizational Representation</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">
              For Enterprises & Business Units
            </h3>
            <p className="text-xs sm:text-sm text-text-muted mt-2">
              Make your operational divisions discoverable to global partners while maintaining strict administrative control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <div className="text-xs font-bold text-navy flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Claim Corporate Listings</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Verify existing corporate listings or add new multi-country business divisions with verified domains.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-navy flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Hashed Team Invitations</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Issue single-use invitation tokens to colleagues to maintain verified roster affiliations.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-navy flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Verified Representation</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Claims undergo administrative review to eliminate corporate impersonation or unauthorized ownership.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link to="/for-companies" className="text-primary font-bold text-xs hover:underline flex items-center">
              <span>Explore Company Solutions</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 9: FOR DECISION MAKERS & EXECUTIVES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bento-card p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Executive Inbound</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">
              For Directors, Heads & Commercial Leaders
            </h3>
            <p className="text-xs sm:text-sm text-text-muted mt-2">
              Receive only high-value, purposeful inquiries aligned with your stated commercial responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <div className="text-xs font-bold text-navy flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-primary" />
                <span>Dual-Intent Stance</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                State both what you are offering and what you are looking for so inbound matches are mutually beneficial.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-navy flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-primary" />
                <span>Granular Privacy Shield</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Personal contact details are never exposed by default. Choose between Public, Signed-In-Only, or Private.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold text-navy flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-primary" />
                <span>Spam-Free Guarantee</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Every request must exceed minimum length requirements and provide a verified professional reason.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link to="/for-professionals" className="text-primary font-bold text-xs hover:underline flex items-center">
              <span>Explore Professional Profiles</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 10: DATA PROVENANCE & SANITIZATION SHIELD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-navy uppercase">
              <Database className="w-4 h-4 text-primary" />
              <span>Security & Data Provenance Standard</span>
            </div>
            <h3 className="text-xl font-bold text-navy">Guaranteed Sanitization of All Ingested Records</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Every CSV batch undergoes rigorous formula injection screening (=, +, -, @), title normalization, and manual verification preview before becoming searchable in the directory.
            </p>
          </div>
          <Link
            to="/admin/imports"
            className="px-5 py-2.5 bg-surface-muted hover:bg-border text-navy text-xs font-bold rounded-xl border border-border transition-all shrink-0"
          >
            Review Ingestion Protocol &rarr;
          </Link>
        </div>

        {/* 21st.dev Interactive Connection Bridge Simulator */}
        <div className="mt-14 space-y-4">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
              Interactive 3-Party Introduction Engine
            </span>
            <h3 className="text-xl font-bold text-navy mt-1">Simulate a Double-Opt-In Warm Introduction</h3>
            <p className="text-xs text-text-muted mt-0.5">Experience how mutual colleagues sponsor and forward connection requests with zero cold outreach</p>
          </div>
          <ConnectionBridgeSimulator />
        </div>
      </section>

      {/* SECTION 10B: LIVE RESOLVER TERMINAL (Executive Intent Window) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
            Commercial Intelligence
          </span>
          <h3 className="text-2xl font-bold text-navy">Live Commercial Intent Resolver</h3>
          <p className="text-xs text-text-muted max-w-xl mx-auto">
            Experience how ordinary commercial requests are instantly paired with the exact corporate division and authorized decision-maker.
          </p>
          <LiveQueryTerminal />
        </div>
      </section>

      {/* SECTION 10C: INFINITE TESTIMONIAL MARQUEE (Aceternity Ticker) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Cross-Border Social Proof</span>
          <h3 className="text-xl font-bold text-navy mt-0.5">Validated by Global Commercial Pilots</h3>
        </div>
        <InfiniteTicker />
      </section>

      {/* SECTION 11: AI PROVIDER HYBRID ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionContainer className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Technical Reliability</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mt-2">
            Multi-Tier AI Fallback Architecture
          </h2>
          <p className="text-text-muted text-sm sm:text-base mt-2">
            Guaranteed 100% platform availability through multi-provider abstraction and deterministic fallback.
          </p>
        </MotionContainer>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface border border-border rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-navy">Tier 1: Gemini 2.5 Flash</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              High-throughput structured intent extraction with strict JSON Schema output validation and automated token metering.
            </p>
          </div>

          <div className="p-6 bg-surface border border-border rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-navy">Tier 2: OpenCode Zen LLM</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              OpenAI-compatible secondary model failover maintaining semantic query expansion during high-load periods.
            </p>
          </div>

          <div className="p-6 bg-surface border border-border rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-navy">Tier 3: Deterministic NLP Fallback</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Zero-latency rule-based keyword dictionaries and geographical lookup tables guaranteeing search never goes down.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 12: PRIVACY & COMPLIANCE GUARANTEE (GDPR / DPDP) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-surface-muted border border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-navy flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>International Data Privacy Compliance</span>
            </span>
            <h3 className="text-2xl font-bold text-navy">Built for DPDP (India) & GDPR (Europe)</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              We uphold the Right to Erasure, complete profile correction, immutable audit logs, and granular access control across all global operations.
            </p>
          </div>
          <Link
            to="/privacy"
            className="px-6 py-3 bg-surface hover:bg-border text-navy text-xs font-bold rounded-xl border border-border transition-all shrink-0"
          >
            Review Privacy Policy &rarr;
          </Link>
        </div>
      </section>

      {/* SECTION 13: PILOT COHORT PARTICIPATION MILESTONE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bento-card p-8 sm:p-12 space-y-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-primary uppercase">
            <BarChart3 className="w-4 h-4" />
            <span>Pilot Milestones</span>
          </div>
          <h3 className="text-2xl font-bold text-navy">What to Expect During the Global Pilot</h3>
          <p className="text-xs sm:text-sm text-text-muted max-w-3xl leading-relaxed">
            MESHVI is initially rolling out to vetted founders, corporate development leads, and commercial heads. Early cohort members receive priority support, direct input into domain taxonomies, and unlimited search intent parsing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-surface-muted rounded-xl border border-border text-xs">
              <strong className="text-navy block">Strict Quality Control</strong>
              <span className="text-text-muted mt-1 block">Manual vetting of newly registered organizations.</span>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl border border-border text-xs">
              <strong className="text-navy block">Weekly Model Calibration</strong>
              <span className="text-text-muted mt-1 block">Continuous fine-tuning of heuristic scoring rules.</span>
            </div>
            <div className="p-4 bg-surface-muted rounded-xl border border-border text-xs">
              <strong className="text-navy block">Transparent Feedback</strong>
              <span className="text-text-muted mt-1 block">Direct line to the engineering team on match quality.</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 14: INTERACTIVE ACCORDION FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionContainer className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Common Inquiries</span>
          <h2 className="text-3xl font-extrabold text-navy mt-1">Frequently Asked Questions</h2>
        </MotionContainer>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-surface border border-border rounded-2xl overflow-hidden transition-all shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-navy hover:text-primary transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-text-muted transition-transform shrink-0 ml-2 ${
                    openFaq === idx ? 'rotate-90 text-primary' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-text-muted leading-relaxed border-t border-border/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 15: GLOBAL AUDIENCE FINAL CALL-TO-ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionContainer>
          <div className="bg-navy text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute right-0 top-0 w-96 h-96 bg-primary/20 blur-[90px] rounded-full pointer-events-none" />

            <div className="space-y-4 max-w-xl relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-focus">
                Join the Private Pilot Cohort
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Ready to find who you need to connect with?
              </h2>
              <p className="text-sm text-surface-muted leading-relaxed font-normal">
                Join international enterprises, founders, and directors building high-trust partnerships on MESHVI.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-lg transition-all text-center"
              >
                Create Account &rarr;
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all text-center"
              >
                Contact Enterprise Pilot Team
              </Link>
            </div>
          </div>
        </MotionContainer>
      </section>
    </div>
  );
};
