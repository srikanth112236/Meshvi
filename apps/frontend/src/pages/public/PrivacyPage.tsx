import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="bg-bg min-h-screen text-text py-16 sm:py-24 selection:bg-primary/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Global Data Protection & Privacy Framework</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Effective Date: October 2026 &bull; MESHVI (Vedasynk Technologies Private Limited)
          </p>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-xs text-emerald-900 leading-relaxed flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Executive Privacy Core Principle:</strong> We never sell personal contact data to marketing aggregators, and your direct corporate email and phone numbers are never made public for cold spam scraping. All communications are governed by mandatory bilateral double-opt-in consent.
            </div>
          </div>
        </div>

        {/* Legal Sections Container */}
        <div className="space-y-8 text-xs sm:text-sm text-text-muted leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">1. Scope and Applicability</h2>
            <p>
              This Privacy Policy explains how Vedasynk Technologies Private Limited (&quot;Meshvi&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, processes, stores, and protects personal and commercial data when you access or use the MESHVI platform, website (<Link to="/" className="text-primary hover:underline">meshvi.com</Link>), company portal, mobile applications, APIs, or related enterprise services (collectively, the &quot;Services&quot;).
            </p>
            <p>
              This policy applies to individual professionals, executive leaders, founders, institutional investors, enterprise administrators, and visitors across all global jurisdictions, including compliance provisions for the General Data Protection Regulation (GDPR - EU/UK), the California Consumer Privacy Act as amended by the CPRA (CCPA - USA), and applicable international cross-border transfer laws.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-4">
            <h2 className="text-base font-bold text-navy">2. Information We Collect</h2>
            <p>
              We adhere strictly to data minimization principles. We only collect information strictly required to facilitate verified commercial discovery, taxonomy normalization, and bilateral communication:
            </p>

            <div className="space-y-3 pl-2">
              <div>
                <h3 className="font-bold text-navy text-xs">A. Account & Credential Information</h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Full name, work/personal email address, cryptographically hashed passwords (using Argon2/Bcrypt), corporate domain affiliation, and multi-factor authentication tokens.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-navy text-xs">B. Professional & Company Directory Data</h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Job title, company name, department or functional division, professional biography, operating markets, business specialties, and voluntary commercial intent statements (what you are actively seeking vs offering).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-navy text-xs">C. Bilateral Transaction & Deal Room Metadata</h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Connection requests, warm introduction routing hops, mutual opt-in timestamps, deal room milestone statuses, and executed Mutual Non-Disclosure Agreement (MNDA) audit logs.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-navy text-xs">D. Device & Technical Telemetry</h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  IP addresses (for rate-limiting and fraud prevention), browser types, operating system identifiers, and encrypted session cookies.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">3. Lawful Basis for Processing (GDPR Article 6)</h2>
            <p>
              We process personal data only when lawful bases exist under applicable law:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Performance of a Contract:</strong> To deliver our business discovery, bilateral connection routing, and Deal Room collaboration services.</li>
              <li><strong>Legitimate Interests:</strong> To authenticate executive identity, maintain network security, prevent spam and fraud, and calculate explainable 100-point matching scores.</li>
              <li><strong>Consent:</strong> Where you voluntarily elect to link social credentials (e.g. Google OAuth or LinkedIn) or publish voluntary commercial intent declarations.</li>
              <li><strong>Legal Compliance:</strong> To comply with statutory corporate recordkeeping, tax regulations, and lawful court subpoenas.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">4. Contact Privacy by Default & Bilateral Firewalls</h2>
            <p className="font-bold text-navy">
              Unlike legacy scraping directories (e.g., ZoomInfo, Apollo, Lusha), MESHVI does NOT operate an open contact marketplace.
            </p>
            <p>
              Your direct email and phone number are shielded behind a cryptographic bilateral firewall. Prospective partners can view your functional expertise and corporate profile, but cannot initiate unvetted cold email blasts. Contact details are only exchanged when both parties explicitly approve a bilateral connection or sign an NDA inside a confidential Deal Room.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">5. Data Sharing and Disclosure</h2>
            <p>
              We do not sell, rent, or trade your personal data. We disclose information only under the following limited circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Authorized Counterparties:</strong> Disclosing your declared intent and profile details to counterparties with whom you have initiated or approved a bilateral connection.</li>
              <li><strong>Trusted Technical Sub-processors:</strong> Cloud infrastructure hosts (e.g., AWS, GCP), transactional email delivery providers (e.g., Resend, SendGrid), and database clusters operating under strict Data Processing Agreements (DPAs).</li>
              <li><strong>Corporate Reorganization:</strong> In the event of a merger, acquisition, or sale of corporate assets, subject to the recipient assuming identical privacy commitments.</li>
              <li><strong>Law Enforcement & Safety:</strong> Only when strictly mandated by valid legal process or to prevent severe fraud, cyberattacks, or bodily harm.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">6. International Data Transfers</h2>
            <p>
              As a global enterprise platform serving decision-makers across 40+ countries, your information may be processed in secure data centers located in the United States, Europe, or India. Where cross-border transfers occur, we implement European Commission Standard Contractual Clauses (SCCs) and UK International Data Transfer Agreements (IDTAs) with rigorous technical safeguards.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">7. Your Global Legal Rights</h2>
            <p>
              Depending on your country of residence, you maintain full control over your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Right of Access & Portability:</strong> Request an export of your profile and data records in structured JSON or CSV format.</li>
              <li><strong>Right to Rectification:</strong> Edit or correct any inaccurate biographical or company details.</li>
              <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request the permanent deletion of your account and un-indexing of your profile.</li>
              <li><strong>Right to Restrict or Object:</strong> Restrict algorithmic processing or opt out of directory discovery at any time.</li>
            </ul>
            <p className="pt-2">
              To exercise these rights, submit your request to <strong className="text-navy">privacy@meshvi.com</strong> or utilize the self-service controls in your <Link to="/app/settings" className="text-primary hover:underline font-bold">Account Settings</Link>.
            </p>
          </section>

          {/* Section 8 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">8. Data Retention & Cryptographic Security</h2>
            <p>
              We retain account data only for as long as necessary to fulfill the operational purposes described in this policy or to satisfy statutory legal requirements. When an account is terminated, personal data is permanently wiped or irreversibly pseudonymized within 30 days. All database records are protected via AES-256 encryption at rest and TLS 1.3 encryption in transit.
            </p>
          </section>

          {/* Section 9 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">9. Contact the Data Protection Officer (DPO)</h2>
            <p>
              For inquiries, compliance audits, or requests regarding this Privacy Policy, please reach our Data Protection Officer:
            </p>
            <div className="p-4 bg-surface-muted rounded-xl space-y-1 text-xs">
              <div><strong className="text-navy">Data Protection Office:</strong> Vedasynk Technologies Private Limited</div>
              <div><strong className="text-navy">Email:</strong> privacy@meshvi.com / dpo@vedasynk.com</div>
              <div><strong className="text-navy">Compliance Headquarters:</strong> Global Technology Operations Desk</div>
            </div>
          </section>
        </div>

        {/* Cross-links */}
        <div className="pt-4 flex flex-wrap gap-4 text-xs font-bold text-primary">
          <Link to="/terms" className="hover:underline flex items-center space-x-1">
            <span>Terms of Service</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/legal" className="hover:underline flex items-center space-x-1">
            <span>Legal Notice</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/data-usage" className="hover:underline flex items-center space-x-1">
            <span>Data Usage & Protection</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/cookies" className="hover:underline flex items-center space-x-1">
            <span>Cookie Policy</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
