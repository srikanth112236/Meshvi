import {
  BookOpen,
  CheckCircle2,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const CompanyGuidePage = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center space-x-1.5">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Organization Playbook</span>
        </span>
        <h1 className="text-2xl font-extrabold text-navy">Company Administration Handbook</h1>
        <p className="text-xs text-text-muted">
          Best practices for enterprise domain claims, issuing cryptographic employee tokens, and AI partner matching.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-navy font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>1. Corporate Profile & Verification Protocol</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Every company profile on MESHVI represents a verified legal entity. As a Company Admin:
          </p>
          <ul className="text-xs space-y-2 text-text-muted">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>Submit domain email verification (e.g. <code className="bg-surface-muted px-1 rounded">@company.com</code>) to claim an organization.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>Verified companies receive high-trust priority in the intent search matching algorithm.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-navy font-bold text-sm">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>2. Single-Use Cryptographic Employee Invitations</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Onboard colleagues securely without vulnerable public signup links:
          </p>
          <ul className="text-xs space-y-2 text-text-muted">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>Issue time-limited (7-day) cryptographically hashed invitation tokens from the Team Page.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>Each token can only be accepted once, instantly attaching the employee to your verified organization roster.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-navy font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>3. How to Use AI Enterprise Matching</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Navigate to <strong>B2B AI Matcher</strong> to discover supply chain partners:
          </p>
          <ul className="text-xs space-y-2 text-text-muted">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>Express real commercial goals in natural conversational English.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>The AI parses criteria and calculates fit percentages with explainable rationale for each candidate.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-navy font-bold text-sm">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <span>4. Managing Organizational Roles</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Hierarchy within your organization:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-surface-muted rounded-xl flex items-center justify-between">
              <div>
                <strong>OWNER:</strong> Primary entity representative with full administrative & team management rights.
              </div>
            </div>
            <div className="p-2.5 bg-surface-muted rounded-xl flex items-center justify-between">
              <div>
                <strong>MEMBER:</strong> Verified team member who can network and establish connections on behalf of the company.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
