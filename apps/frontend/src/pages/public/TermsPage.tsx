import { Link } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export const TermsPage = () => {
  return (
    <div className="bg-bg min-h-screen text-text py-16 sm:py-24 selection:bg-primary/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>Commercial Terms of Service & Member Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Effective Date: October 2026 &bull; MESHVI (Vedasynk Technologies Private Limited)
          </p>
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl text-xs text-indigo-950 leading-relaxed flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Executive Code of Integrity:</strong> MESHVI is a professional bilateral discovery environment. All users agree to accurate profile representations, good-faith commercial intent, and zero scraping or harassment.
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className="space-y-8 text-xs sm:text-sm text-text-muted leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, registering an executive account, claiming a company profile, or utilizing the MESHVI platform (<Link to="/" className="text-primary hover:underline font-bold">meshvi.com</Link>), you agree to be bound by these Terms of Service (&quot;Terms&quot;), our Privacy Policy, and all supplemental guidelines.
            </p>
            <p>
              If you are entering into these Terms on behalf of a corporation, partnership, or enterprise entity, you represent and warrant that you possess the lawful corporate authority to bind said entity to these obligations.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-4">
            <h2 className="text-base font-bold text-navy">2. Account Eligibility & Verification Protocol</h2>
            <p>
              To maintain the high-trust standard expected by C-level executives, institutional partners, and enterprise founders, all accounts must satisfy our eligibility criteria:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Authentic Identity:</strong> Accounts must be created by real business professionals using genuine credentials. The creation of automated bot accounts, deceptive personas, or unauthorized proxy accounts is strictly prohibited.</li>
              <li><strong>Corporate Domain Affiliation:</strong> Claiming or managing a corporate company profile requires verification via corporate email confirmation or DNS TXT validation.</li>
              <li><strong>Account Security:</strong> You are responsible for safeguarding your authentication credentials and multi-factor tokens. You must immediately notify Meshvi of any unauthorized breach.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-4">
            <h2 className="text-base font-bold text-navy">3. Permitted Platform Use & Prohibited Conduct</h2>
            <p>
              MESHVI is engineered exclusively for intent-driven business discovery, commercial partnerships, corporate procurement, M&A matchmaking, and professional networking. You expressly agree that you will NOT:
            </p>
            <div className="space-y-2 pl-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Harvest, scrape, crawl, or extract profile data, directory entries, or company records using automated bots, spiders, or third-party scraper extensions.</span>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Send unsolicited commercial mass spam, bulk cold pitches, deceptive pyramid schemes, or unsolicited marketing blasts.</span>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Attempt to bypass platform access controls, reverse-engineer proprietary taxonomy schemas, or tamper with the 100-point rubric calculation.</span>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Upload malicious code, viruses, or defamatory material into Deal Room document repositories.</span>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">4. Bilateral Deal Rooms & Mutual Non-Disclosure Agreements (MNDA)</h2>
            <p>
              MESHVI provides cryptographic Deal Room environments equipped with digital Mutual Non-Disclosure Agreement (MNDA) execution. By executing an MNDA inside a Deal Room, the participating parties enter into a binding bilateral confidentiality contract directly with one another.
            </p>
            <p>
              MESHVI facilitates the digital execution and timestamping of these instruments but is not a contractual party to the underlying transaction. Users remain solely responsible for the legal validity, performance, and commercial enforcement of agreements reached inside Deal Rooms.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">5. Non-Circumvention & Intermediary Protection</h2>
            <p>
              Where a commercial introduction is facilitated through an intermediary member or mutual colleague, both the requesting party and the receiving party agree to respect the intermediary’s contribution. Attempting to circumvent registered introducers to evade agreed finder fees or commercial courtesies violates our community trust charter and may result in immediate expulsion from the platform.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">6. Intellectual Property & License Grants</h2>
            <p>
              You retain full ownership of all confidential pitch decks, corporate logos, and commercial materials you upload. You grant MESHVI a non-exclusive, worldwide, royalty-free license solely to host, process, and display said content to your designated bilateral counterparties as required for platform functionality.
            </p>
            <p>
              All trademarks, algorithms, UI designs, codebases, and brand assets of MESHVI are the exclusive property of Vedasynk Technologies Private Limited.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">7. Disclaimers & Warranties</h2>
            <p>
              THE MESHVI SERVICES ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. MESHVI MAKES NO REPRESENTATION OR WARRANTY REGARDING: (A) THE ACCURACY OR COMPLETENESS OF THIRD-PARTY DIRECTORY PROFILES; (B) WHETHER ANY MATCH WILL RESULT IN A SUCCESSFUL COMMERCIAL TRANSACTION; OR (C) UNINTERRUPTED OR ERROR-FREE PLATFORM OPERATION.
            </p>
          </section>

          {/* Section 8 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL VEDASYNK TECHNOLOGIES OR ITS DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITY) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM.
            </p>
          </section>

          {/* Section 9 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">9. Termination & Account Suspension</h2>
            <p>
              We reserve the right to suspend or terminate any account, revoke verified company badges, or restrict Deal Room privileges immediately and without prior notice if we determine in our sole discretion that a user has violated these Terms, engaged in fraudulent misrepresentation, or compromised network trust.
            </p>
          </section>

          {/* Section 10 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">10. Contact for Legal Inquiries</h2>
            <p>
              For legal notifications, compliance questions, or dispute escalations, please contact:
            </p>
            <div className="p-4 bg-surface-muted rounded-xl space-y-1 text-xs">
              <div><strong className="text-navy">Legal Department:</strong> Vedasynk Technologies Private Limited</div>
              <div><strong className="text-navy">Email:</strong> legal@meshvi.com</div>
              <div><strong className="text-navy">Address:</strong> Global Enterprise Legal & Compliance Desk</div>
            </div>
          </section>
        </div>

        {/* Cross-links */}
        <div className="pt-4 flex flex-wrap gap-4 text-xs font-bold text-primary">
          <Link to="/privacy" className="hover:underline flex items-center space-x-1">
            <span>Privacy Policy</span>
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
