export const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Data Policy</span>
        <h1 className="mt-2 text-4xl font-extrabold text-navy tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Last revised: October 2026 &bull; MESHVI (Vedasynk Technologies)
        </p>
      </div>

      <div className="bg-surface p-8 rounded-2xl border border-border space-y-6 text-sm text-text-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy">1. Information We Collect</h2>
          <p>
            MESHVI collects information to facilitate intent-driven business discovery and professional networking:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Details:</strong> Email address, hashed password, and authentication metadata.</li>
            <li><strong>Professional Profile Information:</strong> Display name, headline, current title, company affiliation, functional domains, geographic markets, and declared business intent.</li>
            <li><strong>Controlled Data Imports:</strong> Business profiles sourced from permitted enterprise datasets or corporate administrator imports.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy">2. How Information is Used</h2>
          <p>
            Information is used solely to interpret user objectives, match relevant companies and professionals, explain relevance signals, and route authorized connection and introduction requests.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy">3. Contact Privacy by Default</h2>
          <p>
            Meshvi does not publish personal email addresses or phone numbers openly. Members interact through structured in-platform connection requests. Contact credentials are only shared when explicitly provided in messaging following an accepted connection.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy">4. Right to Correct, Claim, or Delete</h2>
          <p>
            You have the right to inspect, correct, or request the immediate deletion of your professional record from our search database. Requests submitted through our contact or settings endpoints are processed in accordance with applicable data protection principles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy">5. Notice Regarding Legal Scope</h2>
          <p>
            This privacy policy outlines the technical data practices of the MESHVI MVP. Formal localized production agreements will be updated prior to commercial deployment.
          </p>
        </section>
      </div>
    </div>
  );
};
