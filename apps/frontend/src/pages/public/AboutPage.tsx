import { Link } from 'react-router-dom';
import {
  Shield,
  Award,
  Sparkles,
  ArrowRight,
  Globe2,
  Target,
  Lock,
} from 'lucide-react';
import { MotionContainer, MotionStagger, MotionItem } from '../../components/ui/MotionSection';

export const AboutPage = () => {
  const leadershipValues = [
    {
      icon: Target,
      title: 'Commercial Intent Over Titles',
      desc: 'Job titles vary wildly between continents and enterprise sizes. A "Director of Growth" at a series A firm has a vastly different mandate than one at a Fortune 50 corporation. Meshvi solves this by normalizing real business objectives.',
    },
    {
      icon: Shield,
      title: 'Zero Scraping, Strict Data Provenance',
      desc: 'We refuse to participate in the dirty scraping economy. Every profile on Meshvi is anchored in verified corporate registries, authoritative DNS handshakes, and authenticated executive opt-in.',
    },
    {
      icon: Lock,
      title: 'Bilateral Double Opt-in Protection',
      desc: 'Executive attention is finite and invaluable. Meshvi eliminates unvetted cold email blasts and InMail spam by requiring mutual consent and an explainable commercial rationale before messaging begins.',
    },
    {
      icon: Award,
      title: 'Explainable AI & Grounded Scoring',
      desc: 'No black-box mystery matches. We provide an open 100-point rubric breakdown across function, geography, industry, seniority, and intent alignment so leaders know exactly why a connection makes commercial sense.',
    },
  ];

  const globalMetrics = [
    { value: '40+', label: 'Countries Represented', note: 'Active C-Suite & Founder network' },
    { value: '94%', label: 'Executive Response Rate', note: 'Compared to 1.8% cold email average' },
    { value: '100-Pt', label: 'Explainable Rubric', note: 'Deterministic match transparency' },
    { value: '0%', label: 'Data Reselling', note: 'Strict zero-monetization of private contact data' },
  ];

  return (
    <div className="bg-bg min-h-screen text-text overflow-hidden selection:bg-primary/20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-border overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-primary/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <MotionContainer className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Our Founding Philosophy & Architectural Vision</span>
          </MotionContainer>

          <MotionContainer delay={0.1} className="max-w-4xl mx-auto space-y-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-navy tracking-tight leading-[1.12]">
              Rebuilding Global B2B Discovery on{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-teal-600 to-emerald-600">
                Intent, Trust & Reciprocity
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-text-muted leading-relaxed max-w-3xl mx-auto">
              The modern executive is inundated with hundreds of automated sales sequences, generic connection requests, and unvetted pitches. MESHVI was created by Vedasynk Technologies to restore signal, privacy, and bilateral trust to high-stakes commercial relationships.
            </p>
          </MotionContainer>
        </div>
      </section>

      {/* Global Impact Numbers */}
      <section className="py-12 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {globalMetrics.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-navy tracking-tight">{m.value}</div>
                <div className="text-xs sm:text-sm font-bold text-primary">{m.label}</div>
                <div className="text-[11px] text-text-muted">{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Origin Story */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">The Origin of Meshvi</span>
          <h2 className="text-2xl sm:text-4xl font-black text-navy tracking-tight">
            Why We Built Meshvi: The Death of Cold Outreach
          </h2>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-base text-text-muted space-y-4 leading-relaxed">
          <p>
            For decades, business discovery relied on cold phone calls, trade show booths, and mutual referrals. When the internet arrived, databases like LinkedIn, ZoomInfo, and Apollo turned professional contacts into open commodities.
          </p>
          <p>
            The result was catastrophic for senior executives. C-level leaders and business owners are inundated with spam. In response, executives installed spam filters, delegated their inboxes, and stopped opening unsolicited messages. The channels became broken for everyone—both for the legitimate enterprise seeking a certified manufacturing partner and for the founder seeking a strategic distribution alliance.
          </p>
          <div className="p-6 rounded-2xl bg-surface border-l-4 border-primary border-y border-r border-border text-navy font-medium italic text-xs sm:text-sm">
            &quot;True commercial progress does not come from spamming 10,000 scraped emails. It comes from identifying the precise two organizations whose strategic objectives are aligned, and connecting their verified leaders with complete context.&quot;
          </div>
          <p>
            MESHVI is built around this exact premise. Instead of searching by arbitrary job title strings, users describe their objective in natural language. Our semantic taxonomy engine interprets the requirement, verifies counterparty readiness, explains the match with mathematical precision, and initiates contact through bilateral double-opt-in channels.
          </p>
        </div>
      </section>

      {/* 4 Foundational Pillars */}
      <section className="py-20 bg-surface-muted/60 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Operating Principles</span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy tracking-tight">
              The Four Architectural Pillars of Meshvi
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              How our engineering architecture guarantees high-trust commercial discovery.
            </p>
          </div>

          <MotionStagger className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {leadershipValues.map((v, idx) => (
              <MotionItem key={idx}>
                <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-xs hover:shadow-xl transition-all h-full space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <v.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-navy">{v.title}</h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      {/* Enterprise & Founder Call to Action */}
      <section className="py-20 bg-gradient-to-br from-[#0B1528] via-[#102A43] to-[#0A192F] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Globe2 className="w-4 h-4" />
            <span>Join Verified Global Leaders</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to Connect with Intent?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Create your executive profile or register your corporate entity today to experience zero-spam commercial discovery.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-xl transition-all flex items-center justify-center"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/search-showcase"
              className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 backdrop-blur-xs transition-all flex items-center justify-center"
            >
              <span>See How Search Works</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
