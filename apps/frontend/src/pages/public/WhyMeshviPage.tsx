import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  FileCheck2,
  Sparkles,
  ChevronRight,
  Scale,
  Handshake,
} from 'lucide-react';
import { MotionContainer, MotionStagger, MotionItem } from '../../components/ui/MotionSection';

export const WhyMeshviPage = () => {
  const comparisonData = [
    {
      feature: 'Discovery Paradigm',
      meshvi: 'Commercial outcome & intent-first matching',
      linkedin: 'Manual keyword guessing by job title',
      coldEmail: 'Stale scraped contact lists blasted en masse',
      headhunter: 'Slow manual rolodex with high retainers',
    },
    {
      feature: 'Spam & Noise Protection',
      meshvi: '100% Zero Spam. Mandatory bilateral double-opt-in',
      linkedin: 'High noise; pay-to-spam InMail allowed',
      coldEmail: 'Severe; flooded inboxes and spam filters',
      headhunter: 'Low volume, but high commission pressure',
    },
    {
      feature: 'Identity & Data Provenance',
      meshvi: 'Authoritative corporate DNS & executive verification',
      linkedin: 'Unverified self-reported claims',
      coldEmail: 'Unverified scraped web snippets; high bounce rate',
      headhunter: 'Manual verification; non-transparent',
    },
    {
      feature: 'Explainability of Recommendation',
      meshvi: 'Open 100-point rubric breakdown with reasons',
      linkedin: 'Opaque black-box algorithmic ranking',
      coldEmail: 'None (mass bulk export)',
      headhunter: 'Subjective broker opinion',
    },
    {
      feature: 'Deal Acceleration Tooling',
      meshvi: 'Bilateral Deal Rooms, Mutual NDAs, & Milestone tracking',
      linkedin: 'Casual text chat inbox',
      coldEmail: 'Email threads with easily lost attachments',
      headhunter: 'Manual PDF exchanges over months',
    },
    {
      feature: 'Economics & Cost',
      meshvi: 'Transparent platform access; zero deal cut taken',
      linkedin: 'Expensive Recruiter/Sales Navigator seats',
      coldEmail: 'Monthly domain churn & scraping software costs',
      headhunter: '15% to 30% commission per deal or hire',
    },
  ];

  const valueProps = [
    {
      icon: Clock,
      title: 'Save 80+ Hours on Executive Sourcing',
      desc: 'Instead of having your analysts spend weeks sifting through thousands of irrelevant profiles, Meshvi isolates matching commercial intent in seconds.',
      badge: 'Speed to Meeting',
    },
    {
      icon: Lock,
      title: 'Bilateral Privacy & Zero Inbound Spam',
      desc: 'Your direct contact credentials remain strictly confidential. You only communicate with verified peers after reviewing their business rationale and mutually consenting.',
      badge: 'Executive Privacy',
    },
    {
      icon: Handshake,
      title: 'Warm Introductions with Reciprocal Trust',
      desc: 'Route critical commercial requests through mutual colleagues and industry connectors who can personally vouch for both parties.',
      badge: 'Warm Intros',
    },
    {
      icon: FileCheck2,
      title: 'Cryptographic Deal Rooms & Mutual NDAs',
      desc: 'Convert warm conversations into commercial execution. One-click Mutual NDAs, milestone deliverables, and bilateral document vaults built-in.',
      badge: 'Deal Rooms',
    },
  ];

  return (
    <div className="bg-bg min-h-screen text-text overflow-hidden selection:bg-primary/20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-border overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-primary/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <MotionContainer className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide shadow-xs">
            <Scale className="w-3.5 h-3.5 text-primary" />
            <span>The New Standard for High-Trust Enterprise Discovery</span>
          </MotionContainer>

          <MotionContainer delay={0.1} className="max-w-4xl mx-auto space-y-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-navy tracking-tight leading-[1.12]">
              Why Decision-Makers Are Moving to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-teal-600">
                Meshvi
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-text-muted leading-relaxed max-w-3xl mx-auto">
              Cold email outreach is dying. LinkedIn InMails are ignored. Executive deals require verified identity, clear business intent, and bilateral consent. Here is why the world’s founders and C-suite leaders choose Meshvi.
            </p>
          </MotionContainer>

          <MotionContainer delay={0.2} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center text-sm"
            >
              <span>Join Verified C-Suite Network</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/search-showcase"
              className="w-full sm:w-auto px-6 py-3.5 bg-surface hover:bg-surface-muted text-navy font-bold rounded-xl border border-border shadow-xs transition-all flex items-center justify-center text-sm"
            >
              <span>Experience Search Engine</span>
              <ChevronRight className="w-4 h-4 ml-1 text-text-muted" />
            </Link>
          </MotionContainer>
        </div>
      </section>

      {/* 4 Value Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Calculated Executive ROI
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
            Built for Executive Velocity & Bilateral Trust
          </h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Eliminate endless back-and-forth qualification calls. Discover the exact executive partner whose active intent mirrors your own.
          </p>
        </div>

        <MotionStagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((vp, idx) => (
            <MotionItem key={idx}>
              <div className="p-7 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-xs hover:shadow-xl transition-all h-full space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <vp.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {vp.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-navy">{vp.title}</h3>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    {vp.desc}
                  </p>
                </div>
              </div>
            </MotionItem>
          ))}
        </MotionStagger>
      </section>

      {/* Comprehensive Comparison Table */}
      <section className="py-20 bg-surface-muted/60 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Head-to-Head Architectural Breakdown
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy tracking-tight">
              Meshvi vs. Traditional Outreach Channels
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              See why high-net-worth founders, C-level executives, and institutional partners avoid generic social channels in favor of Meshvi’s bilateral architecture.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-surface border-b border-border text-navy">
                  <th className="p-4 sm:p-5 font-bold">Strategic Dimension</th>
                  <th className="p-4 sm:p-5 font-bold text-primary bg-primary/5 border-x border-primary/20">
                    Meshvi Platform
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-slate-500">LinkedIn InMail</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-500">Cold Email / Scraping</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-500">Brokers / Retainers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface text-text-muted">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-navy whitespace-nowrap">{row.feature}</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-primary/5 border-x border-primary/20">
                      <div className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.meshvi}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">
                      <div className="flex items-start space-x-1.5">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{row.linkedin}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">
                      <div className="flex items-start space-x-1.5">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{row.coldEmail}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500">
                      <div className="flex items-start space-x-1.5">
                        <XCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{row.headhunter}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Global Call to Action */}
      <section className="py-20 bg-gradient-to-br from-[#0B1528] via-[#102A43] to-[#0A192F] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-4 h-4" />
            <span>Elevate Your Professional Reach</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Your Time is Too Valuable for Cold Inboxes.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Experience deterministic commercial search, grounded relevance rubrics, and confidential bilateral deal execution.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-black rounded-xl shadow-xl transition-all flex items-center justify-center"
            >
              <span>Create Executive Profile</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/search-showcase"
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-xs transition-all flex items-center justify-center"
            >
              <span>Explore Interactive Demo</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
