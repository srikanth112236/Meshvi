import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Layers,
  LayoutDashboard,
  Handshake,
  Users,
  GitPullRequest,
  MessageSquare,
  Globe2,
  XCircle,
  FileText,
  BadgeCheck,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { MotionContainer } from '../../components/ui/MotionSection';

export const HomePage = () => {
  // Active Workspace Route Tour Tab
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    'home' | 'partnerships' | 'search' | 'connections' | 'introductions' | 'messages'
  >('home');

  // Simulated Intent Query State
  const [selectedPrompt, setSelectedPrompt] = useState(
    'Looking for certified aerospace & titanium forging suppliers with AS9100 Rev D in India or the UK.'
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const samplePrompts = [
    {
      label: 'Aerospace & Titanium Sourcing (India / UK)',
      text: 'Looking for certified aerospace & titanium forging suppliers with AS9100 Rev D in India or the UK.',
      category: 'Manufacturing',
    },
    {
      label: 'Renewable CleanTech & BESS (Australia)',
      text: 'Seeking solar EPC and utility-scale battery storage partners for commercial grid interconnections in Sydney.',
      category: 'CleanTech',
    },
    {
      label: 'Pharma Cold Chain Logistics (Europe)',
      text: 'Need GDP-certified refrigerated intermodal freight carriers for biopharma distribution across Germany and UK.',
      category: 'Logistics',
    },
    {
      label: 'Enterprise AI & ERP Integration (US / Global)',
      text: 'Identifying CTOs and Heads of Enterprise Automation with SOC-2 compliant autonomous workflow experience.',
      category: 'Technology',
    },
  ];

  const workspacePillars = [
    {
      id: 'home',
      name: 'Dashboard',
      route: '/app/home',
      badge: 'Command Center',
      icon: LayoutDashboard,
      headline: 'Executive Portfolio & Commercial Readiness',
      description:
        'Your centralized operational command deck. Monitor real-time readiness scores, incoming deal velocity, active deal room milestones, and bilateral connection health at a glance.',
      features: [
        'Real-time Readiness Score & Governance Audit',
        'Active Deal Room milestone tracker',
        'Incoming and outgoing handshake velocity metrics',
        'Zero-trust security and role confirmation status',
      ],
      previewContent: {
        title: 'Executive Portfolio Radar',
        stat1: { label: 'Commercial Readiness', val: '94%' },
        stat2: { label: 'Active Deal Rooms', val: '6 Live' },
        stat3: { label: 'Verified Network', val: '500+ Peers' },
        tagline: 'All signals verified through corporate DNS and bilateral double-opt-in consensus.',
      },
    },
    {
      id: 'partnerships',
      name: 'Partnerships',
      route: '/app/partnerships',
      badge: 'Deal Rooms & Escrow',
      icon: Handshake,
      headline: 'Structured Bilateral Deal Rooms & Executed NDAs',
      description:
        'Move far beyond casual chat. MESHVI provides cryptographically anchored deal rooms with built-in Mutual Non-Disclosure Agreements (MNDA), deliverable milestones, and outcome certification.',
      features: [
        'One-click Mutual NDA execution between parties',
        'Milestone-based progress with evidence attachments',
        'Bilateral confidential document vault',
        'Certified partnership outcome audit trail',
      ],
      previewContent: {
        title: 'Bilateral Deal Room #DR-8821',
        stat1: { label: 'Status', val: 'MNDA Signed' },
        stat2: { label: 'Milestone 2/4', val: 'Sample Audit' },
        stat3: { label: 'Counterparty', val: 'Dyson UK Tech' },
        tagline: 'End-to-end commercial governance. Zero unrecorded promises or lost email threads.',
      },
    },
    {
      id: 'search',
      name: 'Search',
      route: '/app/search',
      badge: 'Intent Engine',
      icon: Search,
      headline: 'Intent-Driven Global Discovery Across 500+ Enterprises',
      description:
        'Never browse through millions of spammy, scraping-derived lists. Type your objective in plain conversational English. MESHVI scores real, permitted enterprise records using transparent 100-point rubrics.',
      features: [
        'Natural language commercial query parsing',
        'Transparent 100-point deterministic rubric scoring',
        '500+ diverse decision-makers across India, Australia, UK, US & Europe',
        'Verified corporate titles and explicit declared intents',
      ],
      previewContent: {
        title: 'Intent Match Engine',
        stat1: { label: 'Match Score', val: '96 / 100' },
        stat2: { label: 'Evaluated Rubric', val: 'Function (35) + Geo (25)' },
        stat3: { label: 'Audited Leads', val: '100% Real' },
        tagline: 'Explains exactly WHY a profile matches with transparent reason codes.',
      },
    },
    {
      id: 'connections',
      name: 'Connections',
      route: '/app/connections',
      badge: 'Zero Cold Spam',
      icon: Users,
      headline: 'Double-Opt-In High-Trust Network',
      description:
        'Say goodbye to uninvited sales pitches and bot sequences. On MESHVI, every connection requires a mandatory commercial note, structured intent, and mutual bilateral acceptance before direct access is granted.',
      features: [
        'Mandatory commercial justification on every handshake',
        'Colleague delegation: handover incoming leads to the right department head',
        'Formal decline and follow-up reason feedback loops',
        'Strict rate limiting to protect executive attention',
      ],
      previewContent: {
        title: 'Connection Handshake Guard',
        stat1: { label: 'Spam Blocked', val: '100%' },
        stat2: { label: 'Handshake Rate', val: '88% Accepted' },
        stat3: { label: 'Delegation SLA', val: '< 12 Hours' },
        tagline: 'Respecting executive time. Every connection is purposeful and pre-qualified.',
      },
    },
    {
      id: 'introductions',
      name: 'Introductions',
      route: '/app/introductions',
      badge: 'Warm Network Bridges',
      icon: GitPullRequest,
      headline: 'Peer-Sponsored Warm Introductions',
      description:
        'Cold outreach has a 1% conversion rate; warm peer bridges convert at 70%+. MESHVI visualizes mutual colleagues between enterprise organizations and brokers warm sponsored handshakes with verifiable trust paths.',
      features: [
        'Verifiable trust paths through shared organizational peers',
        'Intermediary endorsement and contextual forward notes',
        'Privacy-preserving: intermediaries never reveal private contacts without consent',
        'Corridor bridges between India, Australia, UK, Europe, and Americas',
      ],
      previewContent: {
        title: 'Bilateral Trust Bridge',
        stat1: { label: 'Bridge Type', val: 'Mutual Colleague' },
        stat2: { label: 'Trust Velocity', val: 'High-Affinity' },
        stat3: { label: 'Success Rate', val: '74% Meeting Set' },
        tagline: 'Sponsor high-trust bilateral deals through shared colleagues with zero cold friction.',
      },
    },
    {
      id: 'messages',
      name: 'Messages',
      route: '/app/messages',
      badge: 'Deal-Anchored Chat',
      icon: MessageSquare,
      headline: 'Encrypted Executive Communication Channels',
      description:
        'A dedicated, clean workspace for executive negotiations. No promotional newsletters, no recruiter spam—only verified conversations anchored directly to active partnerships and deal rooms.',
      features: [
        'Linked directly to active bilateral Deal Rooms',
        'Document exchange with automatic cryptographic checksums',
        'Integrated meeting scheduler and action item tracking',
        'Direct connection to corporate governance and legal teams',
      ],
      previewContent: {
        title: 'Encrypted Negotiation Channel',
        stat1: { label: 'Channel Type', val: 'Deal-Linked' },
        stat2: { label: 'Audit Trail', val: 'Encrypted' },
        stat3: { label: 'Noise Ratio', val: '0% Bot Spam' },
        tagline: 'Focused commercial clarity between verified C-Level and Director decision-makers.',
      },
    },
  ];

  const currentTab = workspacePillars.find((t) => t.id === activeWorkspaceTab) || workspacePillars[0];

  const faqs = [
    {
      q: 'Why does MESHVI solve the overcrowding and spam problem of traditional networks?',
      a: 'Legacy platforms (like LinkedIn or Apollo) operate on open outbound volume: users can send thousands of unsolicited cold emails, and inboxes are dominated by bots. MESHVI enforces three structural barriers: 1) Every member must be verified via corporate domain DNS / corporate email, 2) All connection requests require explicit business context and double-opt-in consensus, and 3) Once approved, both parties transition directly into a structured Deal Room rather than an open social chatter thread.',
    },
    {
      q: 'Are the 500+ companies and executives in the search engine real and verified?',
      a: 'Yes. Every single profile is mapped to real corporate entities across India, Australia, the UK, Europe, and the US with confirmed seniorities, verified email provenance, and explicit declared operational capabilities. There is zero scraped web garbage or hallucinated contact records.',
    },
    {
      q: 'What is a MESHVI Deal Room, and how does it protect my commercial interests?',
      a: 'A Deal Room is a bilateral, isolated digital workspace created between two approved counterparties. It includes mutual MNDA e-signatures, secure document exchange, milestone tracking with evidence verification, and bilateral status audits. This ensures sensitive partnership terms remain completely confidential.',
    },
    {
      q: 'Can I route incoming opportunities to colleagues if they are better suited?',
      a: 'Absolutely. MESHVI features an enterprise Colleague Handover & Delegation protocol. If a C-level executive receives a proposal relevant to procurement or engineering, they can delegate the connection to an authorized colleague with a private internal note in one click.',
    },
    {
      q: 'How does MESHVI handle cross-border compliance between India, Australia, and the UK?',
      a: 'MESHVI includes built-in compliance workflows adhering to GDPR (UK/EU), DPDP (India), and the Australian Privacy Act. Corporate domains are validated cryptographically, and right-to-erasure and data residency protocols are baked into the core architecture.',
    },
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION - WHERE HIGH-STAKES PARTNERSHIPS CLOSE */}
      {/* ========================================================================= */}
      <section className="relative pt-12 md:pt-20 overflow-hidden bg-grid-pattern">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <MotionContainer>
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-surface glass-card text-navy text-xs font-bold mb-6 shadow-sm border border-border">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <BadgeCheck className="w-4 h-4 text-primary" />
              <span>The Zero-Noise B2B Partnership Platform</span>
              <span className="text-text-muted">&bull; 100% Verified Identities</span>
            </div>
          </MotionContainer>

          <MotionContainer delay={0.1}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-navy tracking-tight max-w-5xl mx-auto leading-[1.08] sm:leading-[1.08]">
              Where High-Stakes B2B Partnerships <span className="shimmer-text">Actually Close</span>.
            </h1>
          </MotionContainer>

          <MotionContainer delay={0.2}>
            <p className="mt-6 text-lg sm:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed font-normal">
              No overcrowded feeds. Zero automated sales bot spam. MESHVI is the purpose-built network for C-Suite, VP,
              and Procurement leaders to discover verified counterparties, execute bilateral NDAs, and launch high-trust
              deals across <strong>India, Australia, the UK & worldwide</strong>.
            </p>
          </MotionContainer>

          <MotionContainer delay={0.3}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center group text-base"
              >
                <span>Enter Workspace Free</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/search-showcase"
                className="w-full sm:w-auto px-6 py-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold border border-primary/30 rounded-xl transition-all shadow-xs flex items-center justify-center text-base"
              >
                <span>Explore Search Engine &rarr;</span>
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-4 bg-surface hover:bg-surface-muted text-navy font-bold border border-border rounded-xl transition-all shadow-sm flex items-center justify-center text-base"
              >
                Sign In
              </Link>
            </div>
          </MotionContainer>

          {/* Quick Metrics Bar */}
          <MotionContainer delay={0.4}>
            <div className="mt-10 pt-6 border-t border-border/60 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3">
                <div className="text-2xl font-black text-navy">500+</div>
                <div className="text-xs text-text-muted font-medium mt-0.5">Verified Global Decision-Makers</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-black text-emerald-600">0%</div>
                <div className="text-xs text-text-muted font-medium mt-0.5">Cold Bot Spam or InMail Blast</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-black text-primary">100%</div>
                <div className="text-xs text-text-muted font-medium mt-0.5">Double-Opt-In Bilateral Consensus</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-black text-navy">4 Corridors</div>
                <div className="text-xs text-text-muted font-medium mt-0.5">India &bull; Australia &bull; UK &bull; Americas</div>
              </div>
            </div>
          </MotionContainer>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: INTERACTIVE WORKSPACE TOUR - ALL 6 CORE ROUTES */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Platform Tour</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-navy tracking-tight">
            One Unified Workspace. Six High-Velocity Pillars.
          </h2>
          <p className="mt-3 text-base text-text-muted leading-relaxed">
            Every route in the MESHVI workspace is engineered with a single goal: converting commercial intent into verified,
            executed bilateral agreements without noise or distraction.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-surface-muted rounded-2xl max-w-4xl mx-auto border border-border shadow-inner">
          {workspacePillars.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = activeWorkspaceTab === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActiveWorkspaceTab(pillar.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-surface text-navy shadow-md border border-border/80 scale-[1.02]'
                    : 'text-text-muted hover:text-navy hover:bg-surface/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                <span>{pillar.name}</span>
                {isSelected && (
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Route Showcase Card */}
        <div className="mt-8 max-w-6xl mx-auto bg-surface glass-card rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Content Column */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-4">
                  <span className="font-mono">{currentTab.route}</span>
                  <span>&bull;</span>
                  <span>{currentTab.badge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-navy tracking-tight leading-snug">
                  {currentTab.headline}
                </h3>

                <p className="mt-4 text-sm sm:text-base text-text-muted leading-relaxed">
                  {currentTab.description}
                </p>

                <div className="mt-6 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-navy">Key Platform Capabilities:</div>
                  <ul className="space-y-2.5">
                    {currentTab.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                <Link
                  to={currentTab.route}
                  className="inline-flex items-center space-x-2 text-sm font-bold text-primary hover:text-primary-hover group"
                >
                  <span>Open {currentTab.name} in Workspace</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <span className="text-[11px] font-semibold text-text-muted bg-surface-muted px-2.5 py-1 rounded-md border border-border">
                  Live in MESHVI v2.0
                </span>
              </div>
            </div>

            {/* Right Interactive Mockup Simulation */}
            <div className="lg:col-span-6 p-6 sm:p-10 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[90px] rounded-full pointer-events-none" />

              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-400">meshvi-workspace{currentTab.route}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated</span>
                </div>
              </div>

              {/* Simulation Content Body */}
              <div className="my-8 space-y-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                    {currentTab.previewContent.title}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {currentTab.name} Operational Hub
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      {currentTab.previewContent.stat1.label}
                    </div>
                    <div className="text-lg sm:text-xl font-black text-primary-light mt-1">
                      {currentTab.previewContent.stat1.val}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      {currentTab.previewContent.stat2.label}
                    </div>
                    <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
                      {currentTab.previewContent.stat2.val}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">
                      {currentTab.previewContent.stat3.label}
                    </div>
                    <div className="text-lg sm:text-xl font-black text-white mt-1">
                      {currentTab.previewContent.stat3.val}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Algorithmic Safeguard Active:</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    {currentTab.previewContent.tagline}
                  </p>
                </div>
              </div>

              {/* Bottom Quick-Action Bar */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Status: Verified Zero-Trust Boundary</span>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center"
                >
                  <span>Launch Tour</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: WHY MESHVI SETS APART - THE ANTI-OVERCROWDING STANDARD */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>The Anti-Overcrowding Standard</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
            Why MESHVI Sets Itself Completely Apart
          </h2>
          <p className="mt-4 text-base sm:text-lg text-text-muted leading-relaxed">
            Traditional professional platforms have degraded into noisy, automated cold-sales directories where real
            decision-makers tune out. Here is why enterprise leaders rely on MESHVI.
          </p>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Column 1: The Broken Status Quo */}
          <div className="bg-rose-50/50 border-2 border-rose-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-rose-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-navy">Overcrowded Social Networks</h3>
                  <p className="text-xs text-rose-700 font-semibold">LinkedIn, Apollo, ZoomInfo Directories</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black bg-rose-200/80 text-rose-800 px-2.5 py-1 rounded-md">
                Stale & Cluttered
              </span>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start space-y-0.5">
                <XCircle className="w-5 h-5 text-rose-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-navy">Inboxes flooded with automated bot pitches</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Executives receive dozens of irrelevant messages every day from mass mailers with &lt;1% reply rate.
                  </div>
                </div>
              </li>
              <li className="flex items-start space-y-0.5">
                <XCircle className="w-5 h-5 text-rose-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-navy">Unverified, self-declared job titles</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Anyone can claim to be a "CPO" or "Partner" with zero enterprise corporate confirmation.
                  </div>
                </div>
              </li>
              <li className="flex items-start space-y-0.5">
                <XCircle className="w-5 h-5 text-rose-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-navy">Zero transactional governance or NDAs</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Conversations end in chat. Commercial contracts, NDA signatures, and milestones get scattered across emails.
                  </div>
                </div>
              </li>
              <li className="flex items-start space-y-0.5">
                <XCircle className="w-5 h-5 text-rose-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-navy">Personal data scraped and resold</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Contact details harvested without consent, triggering endless spam calls and unsolicited sales pipelines.
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 2: The MESHVI Standard */}
          <div className="bg-emerald-50/50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg shadow-emerald-500/5">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-navy">The MESHVI Standard</h3>
                  <p className="text-xs text-emerald-700 font-semibold">100% Verified Bilateral Partnerships</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black bg-emerald-200/80 text-emerald-900 px-2.5 py-1 rounded-md">
                Zero Spam
              </span>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start space-y-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-navy">100% Double-Opt-In & Commercial Context</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    No unsolicited outreach. Every connection requires structured commercial intent and counterparty acceptance.
                  </div>
                </div>
              </li>
              <li className="flex items-start space-y-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-navy">Enterprise Domain DNS & Identity Verification</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Companies and decision-makers are verified via corporate work email and DNS TXT challenges.
                  </div>
                </div>
              </li>
              <li className="flex items-start space-y-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-navy">Built-In Deal Rooms with Mutual NDAs</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Transition from handshake to signed bilateral NDA, document vault, and milestone delivery within one platform.
                  </div>
                </div>
              </li>
              <li className="flex items-start space-y-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-3 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-navy">Strict Executive Privacy & Sovereign Compliance</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    No data scraping or reselling. Compliant with GDPR, DPDP, and the Australian Privacy Act by design.
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: GLOBAL CORRIDORS - 500+ VERIFIED ENTERPRISES */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/20 text-primary-light text-xs font-bold mb-4 border border-primary/30">
              <Globe2 className="w-3.5 h-3.5" />
              <span>International Trade Infrastructure</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Pre-Seeded with 500+ Verified Leaders across Global Corridors
            </h2>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              MESHVI powers cross-border B2B engagements across 14 high-value industrial sectors, directly connecting decision-makers
              across major commercial corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* India Hub */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-primary/60 transition-colors">
              <div className="text-2xl mb-2">🇮🇳</div>
              <h3 className="text-lg font-black text-white">India Corridor</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">Bengaluru, Mumbai, Delhi, Hyderabad, Chennai</p>
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-1.5 text-xs text-slate-300">
                <div>&bull; Aerospace & Defense Precision</div>
                <div>&bull; Enterprise Software & AI Scaling</div>
                <div>&bull; CleanTech & EV Subsystems</div>
              </div>
            </div>

            {/* Australia Hub */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-primary/60 transition-colors">
              <div className="text-2xl mb-2">🇦🇺</div>
              <h3 className="text-lg font-black text-white">Australia Corridor</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">Sydney, Melbourne, Brisbane, Perth, Adelaide</p>
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-1.5 text-xs text-slate-300">
                <div>&bull; Critical Minerals & Clean Energy</div>
                <div>&bull; Pacific Freight & Cold Chain</div>
                <div>&bull; AgTech & Bulk Commodities</div>
              </div>
            </div>

            {/* UK & Europe Hub */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-primary/60 transition-colors">
              <div className="text-2xl mb-2">🇬🇧 🇪🇺</div>
              <h3 className="text-lg font-black text-white">UK & Europe Corridor</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">London, Manchester, Berlin, Munich, Zurich</p>
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-1.5 text-xs text-slate-300">
                <div>&bull; BioPharma & Class II Medical</div>
                <div>&bull; Precision Machinery & Robotics</div>
                <div>&bull; Corporate Banking & Trade Escrow</div>
              </div>
            </div>

            {/* North America Hub */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-primary/60 transition-colors">
              <div className="text-2xl mb-2">🇺🇸 🇨🇦</div>
              <h3 className="text-lg font-black text-white">Americas Corridor</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">San Francisco, New York, Austin, Toronto</p>
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-1.5 text-xs text-slate-300">
                <div>&bull; Tier-1 Enterprise Cloud Infra</div>
                <div>&bull; Advanced Microelectronics</div>
                <div>&bull; Multichannel Commercial Distribution</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-800 gap-4">
            <span className="text-xs text-slate-400">
              All 500 members pre-indexed with verified intent rubrics, expertise tags, and corporate affiliations.
            </span>
            <Link
              to="/app/search"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-md"
            >
              Test Live Search Across Corridors &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: SIMULATE OBJECTIVE SEARCH SANDBOX */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Objective Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-navy tracking-tight">
            State What You Need in Plain English
          </h2>
          <p className="mt-3 text-sm sm:text-base text-text-muted leading-relaxed">
            MESHVI’s intent normalizer translates natural language into deterministic multi-dimensional rubrics,
            matching permitted corporate records with explainable reason codes.
          </p>
        </div>

        {/* Prompt Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPrompt(p.text)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                selectedPrompt === p.text
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface text-slate-600 border-border hover:border-primary/40'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Interactive Query Box */}
        <div className="bg-surface glass-card rounded-2xl border border-border shadow-xl p-5 sm:p-7">
          <div className="flex items-center space-x-2 text-xs font-bold text-navy uppercase tracking-wider mb-3">
            <Search className="w-4 h-4 text-primary" />
            <span>Simulate Search Query</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              className="flex-1 px-4 py-3 bg-surface-muted border border-border rounded-xl text-xs sm:text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              placeholder="e.g. Need AS9100 certified aerospace machining suppliers in India or UK..."
            />
            <Link
              to={`/app/search?q=${encodeURIComponent(selectedPrompt)}`}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center shrink-0"
            >
              <span>Execute Match</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          {/* Reason Code Pill Preview */}
          <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Active Evaluation Rubric:
            </span>
            <span className="text-[11px] bg-primary-soft text-primary font-semibold px-2.5 py-1 rounded-md border border-primary/20">
              Exact Function Match (35 pts)
            </span>
            <span className="text-[11px] bg-primary-soft text-primary font-semibold px-2.5 py-1 rounded-md border border-primary/20">
              Corridor Geography (25 pts)
            </span>
            <span className="text-[11px] bg-primary-soft text-primary font-semibold px-2.5 py-1 rounded-md border border-primary/20">
              Industry Cluster (20 pts)
            </span>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
              Declared Intent Alignment (10 pts)
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl font-black text-navy tracking-tight">
            Clear Answers for Executive Decision-Makers
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-surface glass-card rounded-2xl border border-border overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-navy hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-4 ${
                      isOpen ? 'rotate-90 text-primary' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-border/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: FINAL EXECUTIVE CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-navy via-slate-900 to-navy text-white p-8 sm:p-14 text-center overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/25 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface/10 text-primary-light text-xs font-bold border border-white/10">
              <Sparkles className="w-4 h-4" />
              <span>Experience Zero-Spam B2B Deal-Making</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Build Meaningful, High-Value Bilateral Partnerships?
            </h2>

            <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of verified executives from India, Australia, the UK, Europe, and the US already executing
              commercial agreements on MESHVI.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center text-base"
              >
                <span>Create Your Verified Account Free</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/app/home"
                className="w-full sm:w-auto px-8 py-4 bg-surface/10 hover:bg-surface/20 text-white font-bold rounded-xl border border-white/20 transition-all text-base"
              >
                Enter Platform Demo &rarr;
              </Link>
            </div>

            <div className="pt-4 text-xs text-slate-400 flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>No credit card required &bull; 100% Verified Identity &bull; Free Pilot Tier</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
