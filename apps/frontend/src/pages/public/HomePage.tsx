import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  ChevronRight,
  Play,
  Globe2,
} from 'lucide-react';
import { MotionContainer } from '../../components/ui/MotionSection';
import { AnimatedProductShowcase } from '../../components/ui/AnimatedProductShowcase';
import { AnimatedVideoModal } from '../../components/ui/AnimatedVideoModal';

export const HomePage = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(
    'Looking for certified aerospace & titanium forging suppliers with AS9100 Rev D in India or the UK.'
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const samplePrompts = [
    {
      label: 'Aerospace & Titanium (India / UK)',
      text: 'Looking for certified aerospace & titanium forging suppliers with AS9100 Rev D in India or the UK.',
    },
    {
      label: 'CleanTech & Battery (Australia)',
      text: 'Seeking solar EPC and utility-scale battery storage partners for commercial grid interconnections in Sydney.',
    },
    {
      label: 'Pharma Cold Chain (Europe)',
      text: 'Need GDP-certified refrigerated intermodal freight carriers for biopharma distribution across Germany and UK.',
    },
    {
      label: 'Enterprise AI & Automation (US / Global)',
      text: 'Identifying CTOs and Heads of Enterprise Automation with SOC-2 compliant autonomous workflow experience.',
    },
  ];

  const faqs = [
    {
      q: 'How does MESHVI eliminate spam and bot outreach?',
      a: 'Every member must be verified via their corporate domain DNS and work email. Unsolicited blast outreach is impossible: connections require mutual bilateral double-opt-in before any direct communication or contact details unlock.',
    },
    {
      q: 'Are the companies and executives real?',
      a: 'Yes. 100% of profiles represent verified corporate entities across India, Australia, the UK, Europe, and North America. No scraped contact lists or web-harvested placeholders.',
    },
    {
      q: 'What is a MESHVI Deal Room?',
      a: 'A Deal Room is a private, encrypted bilateral workspace between two approved parties. It includes built-in mutual NDA e-signatures, confidential document exchange, and milestone progress tracking.',
    },
    {
      q: 'How does intent-first discovery work?',
      a: 'Instead of guessing job titles or writing Boolean queries, type the exact business outcome you need. Our engine parses the operational context and ranks decision-makers with transparent match confidence.',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: MINIMAL, PUNCHY, HIGH-CONVERTING */}
      {/* ========================================================================= */}
      <section className="relative pt-12 md:pt-18 overflow-hidden bg-grid-pattern">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[360px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <MotionContainer>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-surface glass-card text-navy text-xs font-bold mb-6 shadow-xs border border-border">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <BadgeCheck className="w-4 h-4 text-primary" />
              <span>Intent-First Enterprise Network</span>
              <span className="text-text-muted hidden sm:inline">&bull; 100% Verified Identities</span>
            </div>
          </MotionContainer>

          <MotionContainer delay={0.1}>
            <h1 className="text-4xl sm:text-6xl font-black text-navy tracking-tight max-w-4xl mx-auto leading-[1.1]">
              Where High-Stakes B2B Partnerships <span className="shimmer-text">Actually Close</span>.
            </h1>
          </MotionContainer>

          <MotionContainer delay={0.2}>
            <p className="mt-5 text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed font-normal">
              Find verified business leaders by what you actually need. Connect with zero spam, and only when both people agree.
            </p>
          </MotionContainer>

          <MotionContainer delay={0.3}>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md shadow-primary/25 transition-all flex items-center justify-center text-sm cursor-pointer"
              >
                <span>Enter Workspace Free</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 bg-surface hover:bg-surface-muted text-navy font-bold border border-border rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 text-sm cursor-pointer group"
              >
                <Play className="w-3.5 h-3.5 text-primary fill-primary group-hover:scale-110 transition-transform" />
                <span>Watch Animated Video</span>
                <span className="text-[10px] font-mono font-bold bg-primary-soft text-primary px-1.5 py-0.5 rounded-full">
                  0:30
                </span>
              </button>
              <Link
                to="/search-showcase"
                className="w-full sm:w-auto px-5 py-3 text-text-muted hover:text-navy font-semibold text-sm transition-colors flex items-center justify-center"
              >
                <span>Live Sandbox &rarr;</span>
              </Link>
            </div>
          </MotionContainer>

          {/* Quick Metrics Strip */}
          <MotionContainer delay={0.4}>
            <div className="mt-8 pt-5 border-t border-border/60 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-black text-navy">500+</div>
                <div className="text-[11px] text-text-muted font-medium">Verified Leaders</div>
              </div>
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-black text-emerald-600">0%</div>
                <div className="text-[11px] text-text-muted font-medium">Cold Spam</div>
              </div>
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-black text-primary">100%</div>
                <div className="text-[11px] text-text-muted font-medium">Both Sides Agree</div>
              </div>
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-black text-navy">4 Corridors</div>
                <div className="text-[11px] text-text-muted font-medium">India &bull; AU &bull; UK &bull; US</div>
              </div>
            </div>
          </MotionContainer>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MODERN ANIMATED PRODUCT SHOWCASE CONTAINER */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedProductShowcase onWatchVideoClick={() => setVideoModalOpen(true)} />
      </section>

      {/* ========================================================================= */}
      {/* 3. THE 3-STEP REALITY: HOW MESHVI WORKS */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-navy tracking-tight">
            How Deals Move on MESHVI
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            From describing what you need to closing the deal in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-surface glass-card border border-border shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary font-black text-sm flex items-center justify-center">
              01
            </div>
            <h3 className="text-lg font-bold text-navy">Describe What You Need</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Type what you are looking for in normal English. No complex keyword guessing—we match you directly with the right verified decision-makers.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-surface glass-card border border-border shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-200">
              02
            </div>
            <h3 className="text-lg font-bold text-navy">Both Sides Agree First</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Zero unsolicited spam. Both people must review the reason and agree to connect before any direct contact details are shared.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-surface glass-card border border-border shadow-xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-black text-sm flex items-center justify-center border border-amber-200">
              03
            </div>
            <h3 className="text-lg font-bold text-navy">Private Deal Room</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Sign confidential agreements, safely share files, and track project milestones together in a private, secure workspace.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ANTI-SPAM COMPARISON (CLEAN & MINIMAL) */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
            Why Leaders Choose MESHVI
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-text-muted">
            The difference between noisy social networks and a spam-free verified business network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Cold Email Scrapers */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 text-rose-600 font-bold">
              <XCircle className="w-4 h-4" />
              <span>Cold Email Scrapers</span>
            </div>
            <ul className="space-y-2 text-text-muted">
              <li>&bull; Stale, harvested email lists</li>
              <li>&bull; High bounce rates &amp; spam traps</li>
              <li>&bull; Ignored mass blast outreach</li>
            </ul>
          </div>

          {/* Social InMail */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 text-rose-600 font-bold">
              <XCircle className="w-4 h-4" />
              <span>Social Networks</span>
            </div>
            <ul className="space-y-2 text-text-muted">
              <li>&bull; Inboxes flooded with automated bots</li>
              <li>&bull; Unverified, self-declared titles</li>
              <li>&bull; Casual chat with no NDAs or deals</li>
            </ul>
          </div>

          {/* MESHVI */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-3 shadow-xs">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>The MESHVI Standard</span>
            </div>
            <ul className="space-y-2 text-slate-700 font-medium">
              <li>&bull; 100% corporate DNS verified</li>
              <li>&bull; Mandatory double-opt-in consensus</li>
              <li>&bull; Built-in mutual NDAs &amp; Deal Rooms</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE OBJECTIVE SIMULATOR */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-surface glass-card border border-border shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-navy">Try Intent Search</h3>
              <p className="text-xs text-text-muted">Pick a sample objective or type your own:</p>
            </div>
            <span className="text-[11px] font-mono text-primary bg-primary-soft px-2.5 py-1 rounded-full border border-primary/20 self-start sm:self-auto">
              Live Demo
            </span>
          </div>

          {/* Quick Select Prompts */}
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPrompt(p.text)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  selectedPrompt === p.text
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface-muted text-slate-600 border-border hover:border-primary/40'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-surface-muted border border-border rounded-xl text-xs sm:text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              placeholder="e.g. Need AS9100 certified aerospace machining suppliers..."
            />
            <Link
              to={`/app/search?q=${encodeURIComponent(selectedPrompt)}`}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
            >
              <span>Search Matches</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. GLOBAL TRADE CORRIDORS STRIP */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center space-x-1.5 text-xs text-primary-light font-bold">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Global Corridors</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Active Across 4 Strategic Regions
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Pre-indexed with 500+ verified decision-makers across high-value industrial sectors.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-lg">🇮🇳</span>
                <div className="text-xs font-bold text-white mt-1">India</div>
                <div className="text-[10px] text-slate-400">Aerospace &amp; Tech</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-lg">🇦🇺</span>
                <div className="text-xs font-bold text-white mt-1">Australia</div>
                <div className="text-[10px] text-slate-400">Clean Energy &amp; Ag</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-lg">🇬🇧 🇪🇺</span>
                <div className="text-xs font-bold text-white mt-1">UK &amp; Europe</div>
                <div className="text-[10px] text-slate-400">Pharma &amp; Advanced</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-lg">🇺🇸</span>
                <div className="text-xs font-bold text-white mt-1">Americas</div>
                <div className="text-[10px] text-slate-400">Enterprise Cloud</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-navy tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-surface glass-card rounded-xl border border-border overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-navy hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-3 ${
                      isOpen ? 'rotate-90 text-primary' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-text-muted leading-relaxed border-t border-border/50 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL EXECUTIVE CTA BANNER */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-navy via-slate-900 to-navy text-white p-8 sm:p-12 text-center border border-slate-800 shadow-xl space-y-5">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Build Meaningful B2B Partnerships?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Join hundreds of verified executives already executing high-trust bilateral deals on MESHVI.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer"
            >
              <span>Get Started Free</span>
            </Link>
            <button
              type="button"
              onClick={() => setVideoModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all text-sm flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch Video (30s)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modern 30s Animated Video Modal */}
      <AnimatedVideoModal
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />
    </div>
  );
};
