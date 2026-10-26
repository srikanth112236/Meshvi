import {
  BookOpen,
  CheckCircle2,
  Lock,
  Cpu,
  FileSpreadsheet,
  Scale,
} from 'lucide-react';

export const AdminGuidePage = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>Platform Operational Manual</span>
        </span>
        <h1 className="text-2xl font-extrabold text-navy">Super Admin Governance Handbook</h1>
        <p className="text-xs text-text-muted">
          Official compliance, security partitioning, GDPR right-to-erasure procedures, and AI token quota stewardship.
        </p>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Architecture & Partitioning */}
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5 text-navy font-bold text-sm">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>1. Strict Three-Portal Security Partitioning</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            MESHVI divides functionality across 3 isolated clearance planes:
          </p>
          <ul className="text-xs space-y-2 text-navy">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
              <span><strong>Admin Ops (/admin/*):</strong> Strictly accessible to users with the <code className="bg-surface-muted px-1 rounded">SUPER_ADMIN</code> database role. Contains telemetry, batch ingestion, and user status controls.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
              <span><strong>Company Portal (/company/*):</strong> Accessible only to verified organization administrators with <code className="bg-surface-muted px-1 rounded">COMPANY_ADMIN</code>.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <span><strong>Member Hub (/app/*):</strong> Available to all authenticated professionals for intent discovery.</span>
            </li>
          </ul>
        </div>

        {/* Module 2: AI Pipeline & Resilience */}
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5 text-navy font-bold text-sm">
            <Cpu className="w-4 h-4 text-amber-600" />
            <span>2. AI Intent Interpretation & Zero-Downtime Fallback</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            How the platform handles query intelligence:
          </p>
          <div className="space-y-2 text-xs text-navy">
            <div className="p-3 bg-surface-muted rounded-xl space-y-1">
              <div className="font-bold text-amber-700">Primary: Google Gemini 1.5 Flash</div>
              <div className="text-[11px] text-text-muted">
                Extracts structured JSON: targetFunction, targetIndustry, targetCountry, targetSeniority, searchKeywords.
              </div>
            </div>
            <div className="p-3 bg-surface-muted rounded-xl space-y-1">
              <div className="font-bold text-emerald-700">Fail-Safe: Deterministic Rule-Based NLP</div>
              <div className="text-[11px] text-text-muted">
                If the external AI API times out (&gt;10s) or exceeds quotas, the system instantly switches to local regex rules with zero user-facing errors.
              </div>
            </div>
          </div>
        </div>

        {/* Module 3: GDPR & DPDP Right to Erasure */}
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5 text-navy font-bold text-sm">
            <Scale className="w-4 h-4 text-amber-600" />
            <span>3. GDPR & DPDP Compliance Protocol</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            In compliance with global data privacy frameworks (EU GDPR & India DPDP Act 2023):
          </p>
          <ul className="text-xs space-y-2 text-text-muted">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Admins can execute right-to-be-forgotten deletion from the User Management Drawer.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Personal identifying data is wiped while anonymized statistical event counts remain intact.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Audit logs record an immutable cryptographic record of the erasure action.</span>
            </li>
          </ul>
        </div>

        {/* Module 4: Batch CSV Ingestion */}
        <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2.5 text-navy font-bold text-sm">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>4. Controlled CSV Provenance & Anti-Formula Injection</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            To prevent spreadsheet execution attacks (CSV injection), the platform enforces:
          </p>
          <ul className="text-xs space-y-2 text-text-muted">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>All input rows prefixed with <code className="bg-surface-muted px-1 rounded">=</code>, <code className="bg-surface-muted px-1 rounded">+</code>, <code className="bg-surface-muted px-1 rounded">-</code>, or <code className="bg-surface-muted px-1 rounded">@</code> are sanitized with single quote escaping.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Mandatory Phase 1 dry-run before database commit.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
