import { Link } from 'react-router-dom';
import { ArrowRight, Building2, UserPlus, ShieldCheck, CheckCircle2, Sparkles, Globe, Lock } from 'lucide-react';
import { MotionContainer, MotionStagger, MotionItem } from '../../components/ui/MotionSection';

export const ForCompaniesPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Hero */}
      <MotionContainer className="max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Enterprise Discovery Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-navy tracking-tight leading-tight">
          Make your organization discoverable for real commercial objectives.
        </h1>
        <p className="mt-6 text-lg text-text-muted leading-relaxed">
          Create a verified company profile describing your operational markets, industry focus, and product capabilities.
          Enable enterprise buyers, distributors, and strategic partners to discover your division when their commercial goals align with yours.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center"
          >
            Register Company Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            to="/company/claim"
            className="w-full sm:w-auto px-6 py-3.5 bg-surface hover:bg-surface-muted text-navy font-bold rounded-xl border border-border shadow-sm transition-all flex items-center justify-center"
          >
            Claim Existing Listing &rarr;
          </Link>
        </div>
      </MotionContainer>

      {/* Feature Pillars */}
      <MotionStagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MotionItem>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all h-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy">Claim & Manage Listings</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Authorized representatives can submit claims for existing company listings, specifying operational headquarters, product domains, and corporate details.
            </p>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all h-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy">Secure Team Invitations</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Company administrators issue cryptographically hashed, single-use invitation tokens to employees, ensuring verified affiliation across business divisions.
            </p>
          </div>
        </MotionItem>

        <MotionItem>
          <div className="p-8 rounded-2xl bg-surface border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all h-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy">Administrative Verification</h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Claims undergo independent administrative verification. No fake profiles or unverified takeovers are permitted on the platform.
            </p>
          </div>
        </MotionItem>
      </MotionStagger>

      {/* Enterprise Capabilities */}
      <MotionContainer className="bg-surface border border-border rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Organizational Control</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">
            Enterprise Governance & Privacy First
          </h3>
          <p className="text-xs sm:text-sm text-text-muted mt-2">
            Control which corporate divisions are public vs. discoverable only by authenticated business peers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-navy">Domain Email Verification</div>
              <p className="text-[11px] text-text-muted mt-0.5">Strict validation against registered enterprise web domains.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-navy">Global Territory Mapping</div>
              <p className="text-[11px] text-text-muted mt-0.5">Multi-country regional footprint tags across APAC, EMEA, and Americas.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-navy">Role-Based Scope (RBAC)</div>
              <p className="text-[11px] text-text-muted mt-0.5">Separate privileges for Company Admins, Members, and Discovery searchers.</p>
            </div>
          </div>
        </div>
      </MotionContainer>
    </div>
  );
};
