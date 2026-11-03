import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Handshake,
  Lock,
  Sparkles,
  Play,
} from 'lucide-react';
import { MotionContainer, MotionStagger, MotionItem } from '../../components/ui/MotionSection';
import { AnimatedVideoModal } from '../../components/ui/AnimatedVideoModal';

export const HowItWorksPage = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const steps = [
    {
      num: '01',
      title: 'State Your Objective in Plain English',
      desc: 'No keyword guesswork or Boolean queries. Simply describe the commercial outcome, trade corridor, or executive capability you need.',
      icon: Search,
      badge: 'Intent NLP',
    },
    {
      num: '02',
      title: 'Review Verified Decision-Makers',
      desc: 'Inspect real corporate profiles with corporate DNS validation. Every match displays transparent relevance scoring.',
      icon: ShieldCheck,
      badge: 'DNS Verified',
    },
    {
      num: '03',
      title: 'Send Intent-Backed Handshake',
      desc: 'Connect with mandatory business context. Both parties must mutually accept before direct communication or contact details unlock.',
      icon: Handshake,
      badge: 'Double-Opt-In',
    },
    {
      num: '04',
      title: 'Execute in a Private Deal Room',
      desc: 'One-click mutual NDAs, milestone tracking with evidence verification, and an encrypted document vault for clean governance.',
      icon: Lock,
      badge: 'Signed MNDA',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <MotionContainer className="max-w-2xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intent-First Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
          How MESHVI Works
        </h1>
        <p className="mt-2 text-sm sm:text-base text-text-muted leading-relaxed">
          Traditional networks sell contact lists to spammers. MESHVI starts with your business objective, verifies identities cryptographically, and closes high-trust bilateral deals.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setVideoModalOpen(true)}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Watch Product Video (0:30)</span>
          </button>
          <Link
            to="/register"
            className="px-5 py-2.5 bg-surface hover:bg-surface-muted text-navy text-xs sm:text-sm font-bold rounded-xl border border-border transition-all"
          >
            Create Free Account &rarr;
          </Link>
        </div>
      </MotionContainer>

      {/* 4 Clean Steps */}
      <MotionStagger className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {steps.map((s) => (
          <MotionItem key={s.num}>
            <div className="bg-surface border border-border hover:border-primary/50 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4 group h-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-surface-muted group-hover:bg-primary-soft text-navy group-hover:text-primary transition-colors flex items-center justify-center">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-soft/80 px-2.5 py-0.5 rounded-full">
                    {s.badge}
                  </span>
                </div>

                <div className="text-xs font-mono font-bold text-slate-400">Step {s.num}</div>
                <h3 className="text-base sm:text-lg font-bold text-navy">{s.title}</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          </MotionItem>
        ))}
      </MotionStagger>

      {/* Call to action */}
      <MotionContainer className="bg-navy text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-lg">
          <h3 className="text-xl sm:text-2xl font-bold">Ready to Start Finding Counterparties?</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Join verified decision-makers across India, Australia, the UK, Europe, and the Americas.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/register"
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center cursor-pointer"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </MotionContainer>

      {/* Animated Video Modal */}
      <AnimatedVideoModal
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />
    </div>
  );
};
