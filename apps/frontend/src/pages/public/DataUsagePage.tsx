import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Database,
  EyeOff,
  Cpu,
  FileKey,
  Server,
  UserCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { MotionStagger, MotionItem } from '../../components/ui/MotionSection';

export const DataUsagePage = () => {
  const protectionPillars = [
    {
      icon: EyeOff,
      title: 'Zero Data Selling Guarantee',
      desc: 'We never sell, broker, rent, or trade executive profiles, contact lists, or Deal Room transaction metadata to third-party advertisers, data brokers, or hedge funds. Period.',
    },
    {
      icon: Lock,
      title: 'Contact Privacy by Default',
      desc: 'Your personal phone number and direct corporate email are never exposed for cold outreach scrapers. All initial communications pass through bilateral double-opt-in requests.',
    },
    {
      icon: Database,
      title: 'Authoritative Data Provenance',
      desc: 'We do not scrape restricted walled gardens or hallucinate fake executive profiles. Every record is grounded in verified corporate registry data, corporate DNS records, and voluntary claims.',
    },
    {
      icon: FileKey,
      title: 'Bank-Grade AES-256 Encryption',
      desc: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Deal Room confidential files and executed NDAs are stored in isolated encrypted document stores.',
    },
  ];

  return (
    <div className="bg-bg min-h-screen text-text py-16 sm:py-24 selection:bg-primary/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Executive Trust & Data Governance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
            How MESHVI Uses & Protects Your Data
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            In an era of reckless web scraping and spam databases, Meshvi was engineered from day one on a foundation of explicit consent, zero data resale, and bilateral privacy.
          </p>
          <div className="text-xs text-text-muted font-mono pt-1">
            Compliant with GDPR, CCPA / CPRA, and ISO/IEC 27001 Data Protection Principles
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <MotionStagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {protectionPillars.map((p, idx) => (
            <MotionItem key={idx}>
              <div className="p-7 rounded-2xl bg-surface border border-border hover:border-emerald-500/40 shadow-xs hover:shadow-lg transition-all h-full space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <p.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-navy">{p.title}</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </MotionItem>
          ))}
        </MotionStagger>

        {/* Detailed Architecture Breakdown */}
        <div className="space-y-8 text-xs sm:text-sm text-text-muted leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-4">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-navy">1. How Our Matching Algorithm Processes Intent</h2>
            </div>
            <p>
              When a user submits a natural language search query (e.g. &quot;Seeking AS9100 aerospace forging suppliers in India&quot;), our natural language processing model extracts semantic vectors corresponding to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Target Business Function:</strong> Functional discipline required to fulfill the commercial need.</li>
              <li><strong>Target Sub-Function:</strong> Specialized technical capability or niche operational competency.</li>
              <li><strong>Industry & Sector:</strong> Standard industrial classification (e.g., Aerospace, Defense, Energy).</li>
              <li><strong>Geographic Boundary:</strong> Operational headquarters, facility locations, or distribution markets.</li>
              <li><strong>Seniority & Authority:</strong> Decision-making mandate (C-Suite, VP, Managing Director).</li>
            </ul>
            <p className="pt-1">
              <strong>Crucial Safeguard:</strong> This matching is deterministic and explainable. The system assigns a transparent 100-point rubric breakdown. We never train public large language models on your confidential message contents or Deal Room documents.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-4">
            <div className="flex items-center space-x-2.5">
              <Server className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-navy">2. Identity Verification & Corporate DNS Binding</h2>
            </div>
            <p>
              To maintain the integrity of our network, executive and company claims undergo rigorous multi-factor verification:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-1.5">
                <span className="font-bold text-navy text-xs block">Corporate Email Handshake</span>
                <p className="text-[11px] text-text-muted">
                  Users claiming executive positions must verify ownership of a corporate domain email matching the organization’s registry.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-1.5">
                <span className="font-bold text-navy text-xs block">Corporate DNS Verification</span>
                <p className="text-[11px] text-text-muted">
                  Company administrators may establish DNS TXT records to authenticate their company profile and designate official team representatives.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-4">
            <div className="flex items-center space-x-2.5">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-navy">3. Your Data Rights (GDPR & Global Standards)</h2>
            </div>
            <p>
              Whether you are an individual executive, a company founder, or an enterprise team member, you possess absolute authority over your professional representation:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Right of Access & Inspection:</strong> You may inspect all profile and directory attributes associated with your name at any time.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Right of Rectification:</strong> Edit your title, bio, functional tags, and active commercial intent in seconds via Settings.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Right of Erasure (Forgotten):</strong> Request immediate de-indexing and deletion of your profile with zero retention penalties.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Right to Claim & Control:</strong> Claim existing company pages or profiles to ensure unauthorized third parties cannot represent your firm.</span>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Bar */}
        <div className="p-8 rounded-3xl bg-surface-muted border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-navy">Have Questions Regarding Our Data Governance?</h3>
            <p className="text-xs text-text-muted mt-1">Our Data Protection Officer and security engineering team are available for enterprise reviews.</p>
          </div>
          <Link
            to="/contact"
            className="w-full sm:w-auto px-6 py-3 bg-navy hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center shrink-0"
          >
            <span>Contact Privacy Office</span>
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};
