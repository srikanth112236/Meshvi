import { Link } from 'react-router-dom';
import {
  Building2,
  Scale,
  ExternalLink,
} from 'lucide-react';

export const LegalNoticePage = () => {
  return (
    <div className="bg-bg min-h-screen text-text py-16 sm:py-24 selection:bg-primary/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>Corporate Governance & Regulatory Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
            Legal Notice & Disclosures
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Statutory disclosures, intellectual property rights, non-circumvention frameworks, and operating principles governing the Meshvi bilateral commercial platform.
          </p>
          <div className="text-xs text-text-muted font-mono pt-1">
            Last Updated: October 2026 &bull; Global Operations Standard
          </div>
        </div>

        {/* Corporate Identity Summary Card */}
        <div className="p-6 sm:p-8 bg-surface rounded-2xl border border-border shadow-xs space-y-4">
          <h2 className="text-base font-bold text-navy flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Operating Corporate Entity</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-text-muted">
            <div>
              <strong className="text-navy block">Operating Company:</strong>
              Vedasynk Technologies Private Limited
            </div>
            <div>
              <strong className="text-navy block">Platform Brand:</strong>
              MESHVI Commercial Discovery & Bilateral Network
            </div>
            <div>
              <strong className="text-navy block">Registered Jurisdiction:</strong>
              India (Global SaaS Services & Cross-Border Frameworks)
            </div>
            <div>
              <strong className="text-navy block">Contact & Inquiries:</strong>
              legal@meshvi.com / compliance@vedasynk.com
            </div>
          </div>
        </div>

        {/* Detailed Legal Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-text-muted leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h3 className="text-base font-bold text-navy">1. Nature of the Service & Non-Broker Disclaimer</h3>
            <p>
              MESHVI operates as an intent-driven business discovery, taxonomy normalization, and bilateral communication platform. MESHVI is a technology provider, not an investment advisor, financial broker, registered broker-dealer, or legal representative for any user or organization.
            </p>
            <p>
              Recommendations, relevance rubrics, and discovery signals reflect computational evaluations of permitted professional profiles, declared commercial intents, and corporate domain metadata. MESHVI does not guarantee that any suggested contact possesses definitive commercial authority or that any bilateral engagement will conclude in a completed transaction.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h3 className="text-base font-bold text-navy">2. Intellectual Property Rights</h3>
            <p>
              All software algorithms, taxonomy schemas, user interface architectures, logos, trademarks, database indexes, and proprietary materials on MESHVI are the exclusive intellectual property of Vedasynk Technologies Private Limited or its licensors.
            </p>
            <p>
              Users retain ownership of proprietary content, trade secrets, and documents they upload to confidential Deal Rooms. By uploading content, users grant MESHVI the limited, encrypted technical right necessary to host, index, and deliver said materials solely to authorized bilateral counterparties.
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h3 className="text-base font-bold text-navy">3. Non-Circumvention & Bilateral Trust Conduct</h3>
            <p>
              Parties engaging via MESHVI bilateral introductions or Deal Rooms agree to act in good faith. Introducers, intermediaries, and partners who facilitate commercial connections are protected under the bilateral code of conduct. Exploiting platform metadata for unauthorized mass scraping, data re-selling, or malicious deception constitutes a material breach of terms resulting in immediate revocation of access and potential civil liability.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h3 className="text-base font-bold text-navy">4. Data Provenance & DMCA / Content Removal</h3>
            <p>
              MESHVI respects the data ownership rights of enterprises and executives. If you believe your corporate mark, proprietary materials, or professional listing have been displayed in error or without appropriate authorization, you may file a notice of removal or claim through our verified corporate claim pipeline at <Link to="/company/claim" className="text-primary hover:underline font-bold">meshvi.com/company/claim</Link> or by submitting a signed removal request to <strong className="text-navy">legal@meshvi.com</strong>.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h3 className="text-base font-bold text-navy">5. Limitation of Liability</h3>
            <p>
              To the fullest extent permitted by applicable law, MESHVI and Vedasynk Technologies shall not be liable for any indirect, incidental, punitive, or consequential damages arising from: (a) communications between counterparties; (b) contractual disputes arising out of executed Deal Room arrangements; or (c) temporary service interruptions caused by maintenance or upstream provider failures.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h3 className="text-base font-bold text-navy">6. Governing Law & Dispute Resolution</h3>
            <p>
              These legal notices and all platform terms shall be governed by and construed in accordance with the laws applicable to technology SaaS providers, with disputes subject to good-faith mutual escalation, confidential international commercial arbitration, or designated jurisdiction courts.
            </p>
          </section>
        </div>

        {/* Quick Cross-Links */}
        <div className="pt-4 flex flex-wrap gap-4 text-xs font-bold text-primary">
          <Link to="/privacy" className="hover:underline flex items-center space-x-1">
            <span>Global Privacy Policy</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/terms" className="hover:underline flex items-center space-x-1">
            <span>Executive Terms of Service</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/data-usage" className="hover:underline flex items-center space-x-1">
            <span>Data Usage & Protection</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/cookies" className="hover:underline flex items-center space-x-1">
            <span>Cookie & Tracking Policy</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
