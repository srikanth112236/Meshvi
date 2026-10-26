export const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Terms of Use</span>
        <h1 className="mt-2 text-4xl font-extrabold text-navy tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Last revised: October 2026 &bull; MESHVI (Vedasynk Technologies)
        </p>
      </div>

      <div className="bg-surface p-8 rounded-2xl border border-border space-y-6 text-sm text-text-muted leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy">1. Acceptable Platform Use</h2>
          <p>
            MESHVI is intended for legitimate business discovery, commercial introductions, partnerships, and professional inquiries. Users agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submit fabricated or misleading corporate claims or professional profiles.</li>
            <li>Use automated scrapers, crawlers, or harvesting tools to extract platform data.</li>
            <li>Send unsolicited mass spam, harassment, or fraudulent inquiries.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy">2. Discovery and Accuracy Disclaimer</h2>
          <p>
            Search matches and suggestions represent potential relevance based on currently available and permitted database records. MESHVI does not guarantee that any suggested contact possesses definitive decision-making authority or will accept any given connection request.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy">3. Billing & Pilot Scope</h2>
          <p>
            The initial MVP pilot is provided without subscription fees or payment enforcement. Future billing models, if introduced, will be clearly notified in advance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-navy">4. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate professional integrity standards, submit abusive connection requests, or attempt privilege escalation.
          </p>
        </section>
      </div>
    </div>
  );
};
