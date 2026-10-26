import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Shield, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import { MotionContainer, MotionStagger, MotionItem } from '../../components/ui/MotionSection';

export const ForProfessionalsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Hero */}
      <MotionContainer className="max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intent-Curated Executive Inbound</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-navy tracking-tight leading-tight">
          Help relevant business opportunities find their way to you.
        </h1>
        <p className="mt-6 text-lg text-text-muted leading-relaxed">
          Create an intent-driven profile describing your responsibilities, areas of domain expertise,
          market focus, and the exact commercial opportunities you welcome—while blocking blind spam.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center"
          >
            Create Professional Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            to="/use-cases"
            className="w-full sm:w-auto px-6 py-3.5 bg-surface hover:bg-surface-muted text-navy font-bold rounded-xl border border-border shadow-sm transition-all flex items-center justify-center"
          >
            Explore Use Cases &rarr;
          </Link>
        </div>
      </MotionContainer>

      {/* Value Pillars */}
      <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MotionItem>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all h-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy">High-Intent Inbound</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Eliminate indiscriminate mass outreach. Every incoming connection requires a concrete business reason matching your declared commercial intents.
            </p>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all h-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy">Granular Visibility</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Control what is public, signed-in-only, or private. Direct personal identifiers (email and phone) are never exposed by default to casual viewers.
            </p>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all h-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy">Data Privacy & Erasure</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Full control under global privacy laws (DPDP & GDPR). Edit, claim, or trigger complete profile erasure anytime via automated endpoints.
            </p>
          </div>
        </MotionItem>
      </MotionStagger>

      {/* Intent Taxonomy Preview */}
      <MotionContainer className="bg-surface border border-border rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Declared Focus</span>
          <h3 className="text-2xl font-extrabold text-navy mt-1">Dual-Intent Architecture</h3>
          <p className="text-xs sm:text-sm text-text-muted mt-2">
            State both sides of your professional agenda so algorithmic matching works bidirectionally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-primary-soft/40 border border-primary/20 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-primary">
              <CheckCircle2 className="w-4 h-4" />
              <span>WHAT YOU ARE OFFERING</span>
            </div>
            <p className="text-xs text-navy font-medium leading-relaxed">
              e.g. "Airport commercial contract navigation and regional distribution advisory for Southeast Asian travel retail hubs."
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-muted border border-border space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-navy">
              <CheckCircle2 className="w-4 h-4 text-navy" />
              <span>WHAT YOU ARE LOOKING FOR</span>
            </div>
            <p className="text-xs text-text-muted font-medium leading-relaxed">
              e.g. "FMCG beverage partners and innovative food brand concessionaires seeking duty-free shelf placement."
            </p>
          </div>
        </div>
      </MotionContainer>
    </div>
  );
};
