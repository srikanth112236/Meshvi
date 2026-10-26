import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is MESHVI?',
      a: 'MESHVI is an intent-driven B2B professional and business connection platform. Instead of requiring you to know someone’s exact job title in advance, Meshvi translates your natural-language business objective into relevant companies, functions, and available professionals with explainable relevance signals.',
    },
    {
      q: 'How does discovery work?',
      a: 'When you submit a business goal, Meshvi interprets the target industry, geographic markets, and required functional capabilities. It matches these criteria against real, permitted company and professional records in our database and ranks candidates using grounded relevance scoring.',
    },
    {
      q: 'Does Meshvi have every professional’s details?',
      a: 'No. Meshvi does not claim comprehensive global coverage. We operate on a hybrid data acquisition model combining first-party verified member profiles, controlled and validated CSV imports, and licensed directory data where approved. We never fabricate records to artificially pad search results.',
    },
    {
      q: 'Are all profiles verified?',
      a: 'No. Records in Meshvi carry clear status tags: Member-Verified, Claimed Company, or Available Record (unverified). We distinguish verified first-party members from imported records so you always know the confidence level of the contact information.',
    },
    {
      q: 'How are results ranked?',
      a: 'Results are ranked deterministically by functional alignment, geographic proximity, industry fit, and data freshness. Meshvi provides explicit reason codes (e.g. “Matched commercial role in SE Asia”) rather than vague, fabricated percentage match scores.',
    },
    {
      q: 'Can I request a connection?',
      a: 'Yes. If a professional is an active, registered member of Meshvi, you can send a direct connection request accompanied by a concise business rationale explaining why you want to connect.',
    },
    {
      q: 'What is an introduction request?',
      a: 'An introduction request is a structured workflow where you ask a mutual intermediary (such as an existing colleague or verified mutual connection) to introduce you to a target professional. The intermediary must review and agree before the request is routed.',
    },
    {
      q: 'How can I correct or delete a profile?',
      a: 'Professionals and organizations can claim their existing records or submit data correction and deletion requests through our privacy management workflow. Validated deletion requests remove records from future search runs.',
    },
    {
      q: 'How does Meshvi handle data and privacy?',
      a: 'We enforce contact privacy by default. Direct email addresses and phone numbers are not published publicly on search cards. Data imports require validated legal basis and provenance tagging, and sensitive administrative operations are logged in audit trails.',
    },
    {
      q: 'Is a paid subscription required?',
      a: 'No. Monetization and billing models remain undecided for the initial MVP. No payment or credit card enforcement is active during the current pilot phase.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Got Questions?</span>
        <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-navy tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-base text-text-muted leading-relaxed">
          Clear, honest answers about MESHVI’s discovery engine, data integrity, and connection workflows.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-surface border border-border rounded-2xl overflow-hidden transition-all shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between space-x-4 focus:outline-none"
              >
                <span className="font-bold text-navy text-base">{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-1 text-sm text-text-muted border-t border-border/50 bg-surface-muted/30 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
