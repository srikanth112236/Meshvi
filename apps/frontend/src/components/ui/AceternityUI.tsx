import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Send,
  MessageSquare,
  ArrowRight,
  Filter,
  Check,
} from 'lucide-react';

export const AnimatedBeam = ({
  className = '',
}: {
  className?: string;
}) => (
  <div className={`relative overflow-hidden w-full h-px bg-border ${className}`}>
    <motion.div
      className="absolute top-0 bottom-0 w-36 bg-gradient-to-r from-transparent via-primary to-transparent"
      animate={{
        left: ['-20%', '120%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </div>
);

export const SpotlightCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface transition-all ${className}`}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(2, 132, 199, 0.08), transparent 80%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const LiveRadar = () => (
  <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
    <div className="absolute inset-0 rounded-full border border-primary/20 animate-radar" />
    <div className="absolute inset-4 rounded-full border border-primary/30" />
    <div className="absolute inset-12 rounded-full border border-primary/40" />
    <div className="absolute inset-20 rounded-full border border-primary/50" />
    <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary flex items-center justify-center">
      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
    </div>
    <div className="absolute top-8 right-10 flex items-center space-x-1 bg-surface glass-card px-2 py-0.5 rounded-full border border-primary/30 shadow-sm text-[9px] font-bold text-navy">
      <span className="w-1.5 h-1.5 rounded-full bg-success" />
      <span>Candidate Found</span>
    </div>
    <div className="absolute bottom-10 left-6 flex items-center space-x-1 bg-surface glass-card px-2 py-0.5 rounded-full border border-primary/30 shadow-sm text-[9px] font-bold text-navy">
      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      <span>Reason Grounded</span>
    </div>
  </div>
);

/**
 * 1. Live Interactive Visual Search & Step-by-Step Data Pipeline
 * (Replaces static slider with an animated visual walkthrough showing how query -> normalization -> database match -> reason codes occur live)
 */
export const LiveSearchPipelineVisual = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'query',
      label: '1. What You Need',
      title: 'Your Business Objective',
      badge: 'Natural English Input',
      summary: 'You describe your commercial goal in plain English, without needing to know specific internal titles or corporate hierarchy.',
      detail: 'Stated Goal: "Expand beverage distribution to international airport lounges in Southeast Asia."',
    },
    {
      id: 'normalizing',
      label: '2. Understanding Requirements',
      title: 'Commercial Intent Translation',
      badge: 'Smart Business Mapping',
      summary: 'Our engine identifies the business function and market responsible for making commercial decisions on this initiative.',
      detail: 'Identified Area: Commercial Partnerships & Concession Alliances | Geography: Malaysia & ASEAN Hubs',
    },
    {
      id: 'filtering',
      label: '3. Identifying Verified Organizations',
      title: 'Verified Corporate Cross-Reference',
      badge: '100% Verified Corporate Directory',
      summary: 'We cross-reference genuine, active organizations with authorized regional distribution footprints.',
      detail: 'Active Enterprise Match: Apex Pacific Distribution (Active airport concession rights verified).',
    },
    {
      id: 'grounded',
      label: '4. Introducing the Decision-Maker',
      title: 'Direct Introduction to the Right Leader',
      badge: 'Match Alignment: 90/100',
      summary: 'You are introduced directly to the authorized decision-maker with a clear explanation of why they are the right contact.',
      detail: 'Direct Executive Contact: Head of Strategic Partnerships | Ready for high-trust business conversation.',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-surface border border-border shadow-xl overflow-hidden">
      {/* Top Interactive Progress Stepper */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border bg-surface-muted/60">
        {steps.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveStep(idx)}
            className={`p-4 text-left transition-all relative border-r last:border-r-0 border-border ${
              activeStep === idx
                ? 'bg-surface font-bold text-primary shadow-sm'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider">{s.label}</div>
            <div className="text-xs font-bold truncate mt-0.5 text-navy">{s.title}</div>
            {activeStep === idx && (
              <motion.div
                layoutId="stepperActiveBar"
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Main Visual Arena: Live Process & Business Match Card */}
      <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-surface via-surface to-surface-muted/40">
        {/* Left Side: Plain English Business Process Inspector */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-soft text-primary uppercase">
              {steps[activeStep].badge}
            </span>
            <span className="text-xs text-text-muted">Live Match Process</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-navy">
            {steps[activeStep].title}
          </h3>

          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {steps[activeStep].summary}
          </p>

          <div className="p-4 rounded-xl bg-navy text-white text-xs space-y-2 shadow-inner">
            <div className="flex items-center space-x-2 text-slate-300 text-[10px] border-b border-slate-700 pb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold uppercase tracking-wider">Business Alignment Step</span>
            </div>
            <div className="text-slate-100 font-medium leading-relaxed">
              <span className="text-primary font-bold">&bull; </span>
              {steps[activeStep].detail}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveStep(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeStep === i ? 'w-8 bg-primary' : 'bg-border hover:bg-primary/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Animated Card Morphing in Real-Time */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-2xl bg-surface border border-border shadow-lg space-y-4"
              >
                <div className="flex items-center space-x-2 text-xs font-bold text-navy">
                  <Search className="w-4 h-4 text-primary" />
                  <span>Your Stated Objective</span>
                </div>
                <div className="p-4 bg-surface-muted rounded-xl border border-border text-xs text-navy font-medium italic leading-relaxed">
                  "I am seeking direct commercial and beverage distribution partners with established retail operations inside Southeast Asian airport terminals."
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Translating your goal into authorized business roles...</span>
                </div>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-2xl bg-surface border border-primary/30 shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center">
                    <Filter className="w-3.5 h-3.5 mr-1" />
                    Target Business Responsibility
                  </span>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                    Requirements Identified
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-primary-soft/40 rounded-xl border border-primary/20">
                    <span className="text-[10px] text-text-muted block font-semibold uppercase">Business Department</span>
                    <strong className="text-navy text-xs">Commercial & Partnerships</strong>
                  </div>
                  <div className="p-3 bg-primary-soft/40 rounded-xl border border-primary/20">
                    <span className="text-[10px] text-text-muted block font-semibold uppercase">Operating Region</span>
                    <strong className="text-navy text-xs">Malaysia & Transit Hubs</strong>
                  </div>
                </div>
                <div className="p-3 bg-surface-muted rounded-xl text-xs text-navy font-medium">
                  Decision-Maker Level: <span className="font-bold text-primary">Head / Director of Business Development</span> &bull; Sector: Consumer Goods & Concessions
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-2xl bg-surface border border-border shadow-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-navy">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Organization Found</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Active Concessionaire
                  </span>
                </div>
                <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy">Apex Pacific Distribution</span>
                    <span className="text-[10px] font-bold text-text-muted">Kuala Lumpur, Malaysia</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Verified regional concession holder managing retail and lounge beverage contracts across international airport terminals.
                  </p>
                  <div className="pt-2 border-t border-border flex items-center space-x-2 text-[11px] text-success font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Authorized commercial division confirmed in directory</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-2xl bg-surface border-2 border-primary shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-navy text-white font-black text-sm flex items-center justify-center">
                      SM
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy">Srikanth M</h4>
                      <p className="text-xs text-text-muted font-medium">Head of Strategic Partnerships</p>
                      <p className="text-[11px] text-text-muted">Apex Pacific Distribution &bull; Kuala Lumpur</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-text-muted block uppercase">Match Confidence</span>
                    <span className="text-base font-black text-primary">90 / 100</span>
                  </div>
                </div>

                <div className="p-3 bg-primary-soft/50 rounded-xl border border-primary/30 text-xs text-navy flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-primary font-bold">Why this connection fits: </strong>
                    <span>Direct commercial authority over airport beverage contracts; currently welcoming partnership proposals for regional lounges.</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-success font-semibold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Verified Direct Contact
                  </span>
                  <Link
                    to="/search"
                    className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg shadow-sm hover:bg-primary-hover flex items-center transition-colors"
                  >
                    <span>Request Introduction</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/**
 * 2. Sticky Scroll Explainer Section: How Meshvi Helps You Across the Full Lifecycle
 * (Aceternity Sticky Scroll Inspiration: Left side stays fixed while features scroll and visual preview updates)
 */
export const StickyScrollLifecycle = () => {
  const [activeCard, setActiveCard] = useState(0);

  const sections = [
    {
      title: '1. Intent Discovery Over Title Guessing',
      subtitle: 'Never guess whether someone is an "Ecosystem Lead" or "VP of Alliances"',
      desc: 'Our normalization engine maps colloquial natural language objectives into verified internal taxonomies. You describe the outcome; Meshvi finds the authorized seat.',
      visual: {
        icon: Search,
        highlight: 'Plain-English Query Resolver',
        badge: 'No Boolean Operators Needed',
        quote: 'Input: "Need to supply airport lounges with beverage products" -> Output: Commercial & Partnerships (FMCG)',
      },
    },
    {
      title: '2. Grounded Reason Codes & 100-Point Scoring',
      subtitle: 'Know exactly why every professional appeared in your search',
      desc: 'We eliminate vague black-box percentages. Every match carries unambiguous reason codes (EXACT_FUNCTION_MATCH, MARKET_GEO_PROXIMITY) with a bounded 100-point rubric breakdown.',
      visual: {
        icon: ShieldCheck,
        highlight: '100-Point Bounded Rubric',
        badge: 'Zero Hallucinations',
        quote: 'Function: 35/35 | Geo: 25/25 | Industry: 20/20 | Seniority: 10/10 | Intent: 10/10 = 100 Total Points',
      },
    },
    {
      title: '3. Mandatory Business Context & Spam Shield',
      subtitle: 'Every connection request requires purposeful business justification',
      desc: 'No indiscriminate 1-click cold email blasts. Initiators must state a verifiable commercial reason with a minimum 10 characters, ensuring executive inboxes remain high-trust.',
      visual: {
        icon: Send,
        highlight: 'Spam-Free Connection Gate',
        badge: '10-Char Minimum Context',
        quote: '"Exploring cross-border distribution of premium craft drinks for Changi and KLIA airport lounges."',
      },
    },
    {
      title: '4. 3-Party Warm Bridge Introductions',
      subtitle: 'Let mutual colleagues vouch for and broker conversations',
      desc: 'If you share a mutual connection, request a double-opt-in warm introduction. The intermediary reviews and forwards the request, creating high-trust bridges.',
      visual: {
        icon: MessageSquare,
        highlight: 'Double-Opt-In Protocol',
        badge: 'High Acceptance Rate',
        quote: 'Requester -> Intermediary Vouch -> Target Executive -> Mutual Direct Messaging Unlocked',
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto rounded-3xl bg-surface border border-border p-6 sm:p-12 shadow-xl space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1 rounded-full">
          Lifecycle Walkthrough
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mt-3">
          How MESHVI Powers Every Stage
        </h2>
        <p className="text-xs sm:text-sm text-text-muted mt-2">
          Click each lifecycle phase to explore how our architecture protects executive inboxes and accelerates genuine enterprise deals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4">
        {/* Left Sticky Navigation Column */}
        <div className="md:col-span-5 space-y-3">
          {sections.map((sec, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveCard(idx)}
              className={`w-full p-5 text-left rounded-2xl transition-all border ${
                activeCard === idx
                  ? 'bg-navy text-white border-navy shadow-lg shadow-navy/15 translate-x-1'
                  : 'bg-surface-muted/60 text-navy border-border hover:bg-surface-muted hover:border-primary/40'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                activeCard === idx ? 'text-primary-soft' : 'text-primary'
              }`}>
                Phase 0{idx + 1}
              </span>
              <h4 className="text-sm font-bold mt-1">{sec.title}</h4>
              <p className={`text-xs mt-1 line-clamp-2 ${
                activeCard === idx ? 'text-slate-300' : 'text-text-muted'
              }`}>
                {sec.subtitle}
              </p>
            </button>
          ))}
        </div>

        {/* Right Sticky Visual Display Card */}
        <div className="md:col-span-7 bg-surface-muted rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-inner">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="text-xs font-bold text-navy flex items-center">
              <Check className="w-4 h-4 text-success mr-1.5" />
              <span>{sections[activeCard].visual.highlight}</span>
            </span>
            <span className="text-[10px] font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
              {sections[activeCard].visual.badge}
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-navy">{sections[activeCard].title}</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {sections[activeCard].desc}
            </p>
          </div>

          <div className="p-4 bg-surface rounded-xl border border-border/80 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-text-muted uppercase block">Business Impact:</span>
            <div className="text-xs text-navy font-medium bg-surface-muted/80 p-3.5 rounded-lg border border-border leading-relaxed">
              {sections[activeCard].visual.quote}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 3. Infinite Marquee Social Proof Ticker
 */
export const InfiniteTicker = () => {
  const items = [
    { name: 'Kuala Lumpur Hub', title: 'Beverage FMCG Lead', text: 'Connected with authorized airport concession director in 48 hours without blind cold emails.' },
    { name: 'Tokyo SaaS Expansion', title: 'VP of Alliances', text: 'Located authorized regional distributor heads in Tokyo using our specific ERP integration intent.' },
    { name: 'Munich Supply Chain', title: 'Procurement Category Mgr', text: 'Clean formula-sanitized provenance ensures our corporate compliance standards are satisfied.' },
    { name: 'Singapore Fintech', title: 'Commercial Director', text: 'Warm introductions through mutual peers bridged enterprise bank partnerships seamlessly.' },
  ];

  return (
    <div className="w-full overflow-hidden relative py-4">
      <div className="animate-marquee space-x-4">
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="w-80 shrink-0 p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between space-y-3"
          >
            <p className="text-xs text-navy font-medium italic">"{item.text}"</p>
            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
              <span className="font-bold text-navy">{item.name}</span>
              <span className="text-text-muted">{item.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 4. Interactive Connection Bridge Simulator
 */
export const ConnectionBridgeSimulator = () => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-surface border border-border shadow-lg space-y-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-border -translate-y-1/2 -z-0">
          <motion.div
            className="h-full bg-primary"
            animate={{
              width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
            }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md transition-all ${
            step >= 1 ? 'bg-navy text-white ring-4 ring-navy/10' : 'bg-surface-muted text-text-muted'
          }`}>
            You
          </div>
          <span className="text-xs font-bold text-navy">Originator</span>
          <span className="text-[10px] text-text-muted">Stated Intent</span>
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md transition-all ${
            step >= 2 ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-surface-muted text-text-muted'
          }`}>
            Bridge
          </div>
          <span className="text-xs font-bold text-navy">Mutual Colleague</span>
          <span className="text-[10px] text-text-muted">{step >= 2 ? 'Vouched & Forwarded' : 'Awaiting Review'}</span>
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md transition-all ${
            step === 3 ? 'bg-success text-white ring-4 ring-success/20' : 'bg-surface-muted text-text-muted'
          }`}>
            Decision
          </div>
          <span className="text-xs font-bold text-navy">Target Executive</span>
          <span className="text-[10px] text-text-muted">{step === 3 ? 'Connection Accepted!' : 'Pending Bridge'}</span>
        </div>
      </div>

      <div className="p-4 bg-surface-muted rounded-2xl border border-border flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-navy uppercase text-[10px] block">Live Bridge State:</span>
          <span className="text-text-muted">
            {step === 1 && 'Step 1: Stating concrete commercial rationale (Minimum 10 characters).'}
            {step === 2 && 'Step 2: Mutual peer reviews intent note and clicks "Forward Introduction".'}
            {step === 3 && 'Step 3: Target executive accepts warm introduction; direct messaging unlocked!'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setStep((prev) => (prev >= 3 ? 1 : prev + 1))}
          className="px-3.5 py-1.5 bg-surface text-navy font-bold rounded-lg border border-border hover:bg-border text-xs shrink-0 ml-4"
        >
          Advance Step &rarr;
        </button>
      </div>
    </div>
  );
};

/**
 * 5. Animated Commercial Intent Resolver Window
 */
export const LiveQueryTerminal = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Find Head of Strategic Partnerships at airport concession groups in Malaysia';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index));
      index++;
      if (index > fullText.length + 8) {
        index = 0;
      }
    }, 65);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl bg-[#0B1528] text-white p-5 text-xs shadow-2xl border border-slate-800 space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] text-slate-300 font-semibold ml-2">Commercial Intent Resolver</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full">
          Active Live Session
        </span>
      </div>

      <div className="space-y-3 pt-1">
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Your Stated Need</span>
          <div className="flex items-center space-x-2 text-slate-200 text-xs">
            <span className="text-primary font-bold">&gt;</span>
            <span className="font-medium">{typedText}</span>
            <span className="w-1.5 h-3.5 bg-primary animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Target Department</span>
            <p className="text-emerald-300 font-bold">Commercial & Partnerships</p>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Geographic Territory</span>
            <p className="text-emerald-300 font-bold">Malaysia (ASEAN Concessions)</p>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Recommended Leader</span>
            <p className="text-sky-300 font-bold">Head of Strategic Partnerships (Apex)</p>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Business Alignment</span>
            <p className="text-primary font-bold">90 / 100 Verified Intent Fit</p>
          </div>
        </div>
      </div>
    </div>
  );
};
