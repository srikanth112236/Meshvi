import { Link } from 'react-router-dom';
import { Cookie, ExternalLink } from 'lucide-react';

export const CookiePolicyPage = () => {
  return (
    <div className="bg-bg min-h-screen text-text py-16 sm:py-24 selection:bg-primary/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-800 text-xs font-bold">
            <Cookie className="w-3.5 h-3.5" />
            <span>ePrivacy & Cookie Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy tracking-tight">
            Cookie & Tracking Policy
          </h1>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            This policy outlines how MESHVI uses cookies and browser storage technologies to deliver secure session management, optimize performance, and protect executive account credentials.
          </p>
          <div className="text-xs text-text-muted font-mono pt-1">
            Last Updated: October 2026 &bull; Global Operations Standard
          </div>
        </div>

        {/* Content Box */}
        <div className="space-y-8 text-xs sm:text-sm text-text-muted leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your browser or device when you visit our website. They allow the platform to remember your active session, authenticate token exchanges, store user preferences (such as dark/light themes), and protect against cross-site request forgery (CSRF) attacks.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-4">
            <h2 className="text-base font-bold text-navy">2. Categories of Cookies We Use</h2>
            
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy text-xs">Strictly Necessary & Authentication Cookies</span>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Mandatory
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Required for core platform operations. These include cryptographic JSON Web Tokens (JWT) stored securely for session authentication, CSRF validation tokens, and rate-limiting safeguards. The platform cannot function properly without these cookies.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy text-xs">Security & Fraud Prevention Cookies</span>
                  <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    Security
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Used to detect unauthorized login attempts, mitigate brute-force credential stuffing, and safeguard confidential Deal Room access.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy text-xs">Functional & Preference Cookies</span>
                  <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                    Preferences
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Remember your preferred filters, language settings, notification badges, and UI layout preferences across sessions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy text-xs">Aggregated Technical Performance Cookies</span>
                  <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                    Telemetry
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Collect anonymized telemetry regarding page load latency and API error rates to help us maintain 99.9% uptime. These do not track personal browsing habits across external websites.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">3. Third-Party Advertising & Cross-Site Tracking</h2>
            <p className="font-bold text-navy">
              MESHVI does NOT employ third-party behavioral advertising trackers, ad retargeting pixels (e.g. Meta Pixel, TikTok Pixel), or data broker SDKs.
            </p>
            <p>
              Your browsing behavior on MESHVI is confidential and is never shared with consumer ad platforms for retargeting purposes.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 bg-surface rounded-2xl border border-border space-y-3">
            <h2 className="text-base font-bold text-navy">4. How to Control and Delete Cookies</h2>
            <p>
              You have the right to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline non-essential cookies. Please note that disabling strictly necessary authentication cookies will prevent you from accessing authenticated areas of the MESHVI platform.
            </p>
            <p>
              For guidance on managing cookies in popular browsers:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Google Chrome: Settings &rarr; Privacy and security &rarr; Cookies and other site data</li>
              <li>Apple Safari: Preferences &rarr; Privacy &rarr; Manage Website Data</li>
              <li>Mozilla Firefox: Options &rarr; Privacy & Security &rarr; Cookies and Site Data</li>
              <li>Microsoft Edge: Settings &rarr; Cookies and site permissions</li>
            </ul>
          </section>
        </div>

        {/* Quick Links */}
        <div className="pt-4 flex flex-wrap gap-4 text-xs font-bold text-primary">
          <Link to="/privacy" className="hover:underline flex items-center space-x-1">
            <span>Global Privacy Policy</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/terms" className="hover:underline flex items-center space-x-1">
            <span>Terms of Service</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/data-usage" className="hover:underline flex items-center space-x-1">
            <span>Data Usage & Protection</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link to="/legal" className="hover:underline flex items-center space-x-1">
            <span>Legal Notice</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
