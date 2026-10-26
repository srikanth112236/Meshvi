import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Shield, Award, Sparkles } from 'lucide-react';
import { MotionContainer, MotionStagger, MotionItem } from '../../components/ui/MotionSection';

export const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      <MotionContainer className="max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Operating Philosophy</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-navy tracking-tight leading-tight">
          About MESHVI
        </h1>
        <p className="mt-6 text-lg text-text-muted leading-relaxed">
          Business discovery should begin with the user’s commercial objective, rather than requiring someone to guess the exact person, title, or internal reporting line in advance.
        </p>
      </MotionContainer>

      <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MotionItem>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all h-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy">Intent Over Titles</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Standard databases index job titles that vary wildly by industry and firm. Meshvi focuses on functional responsibilities and business goals to bridge that disconnect.
            </p>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all h-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy">Data Provenance</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              We adhere strictly to data provenance. We never fabricate profiles, scrape restricted platforms, or inflate match confidence with arbitrary numbers.
            </p>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all h-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy">Contextual Bridges</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Connections succeed when both sides understand the purpose. Meshvi pairs every outbound request with a grounded, spam-free business rationale.
            </p>
          </div>
        </MotionItem>
      </MotionStagger>

      <MotionContainer className="p-8 sm:p-10 rounded-3xl bg-surface-muted border border-border max-w-4xl space-y-4">
        <h3 className="text-base font-bold text-navy">Commitment to Honest Communication</h3>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          MESHVI is developed by Vedasynk Technologies as an intent-driven platform. We do not present unverified claims, fabricated user metrics, or artificial testimonials. As the platform evolves through its pilot phases, our features, coverage, and limitations remain fully transparent to our users.
        </p>
      </MotionContainer>

      <MotionContainer className="pt-2">
        <Link
          to="/contact"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-sm transition-all"
        >
          Contact Our Engineering & Pilot Team
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </MotionContainer>
    </div>
  );
};
