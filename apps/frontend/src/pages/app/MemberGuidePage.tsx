import { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  ShieldCheck,
  Zap,
  XCircle,
  Clock,
  ChevronDown,
  ArrowRight,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MemberGuidePage = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROTOCOL' | 'COMPETITIVE' | 'TACTICS' | 'FAQ'>('ALL');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'How does Meshvi guarantee a 95%+ executive response rate?',
      a: 'Unlike transactional social networks where anyone can spam arbitrary InMails, Meshvi enforces mandatory bilateral intent, required business objectives, and anti-spam quota limits. Every proposal requires declared context and mutual agenda agreement, filtering out spam before it reaches your inbox.',
    },
    {
      q: 'What is Wrong-Contact Recovery and Colleague Delegation?',
      a: 'If a partnership proposal reaches a VP of Sourcing when it should have gone to Retail Distribution, they do not need to decline or ignore it. With 1-click delegation, they assign it to the verified colleague on their company roster with a handover note.',
    },
    {
      q: 'How does the 3-Party Warm Introduction step-aside work?',
      a: 'When an intermediary peer brokers a conversation between a requester and a target, once both parties connect, the intermediary can gracefully step aside from the channel. Stepping aside claims +5 Facilitator Reputation points and awards an Attested Trust Badge.',
    },
    {
      q: 'How is company employment verified?',
      a: 'Companies verify their corporate domain through a cryptographic DNS TXT handshake token. Once verified, authorized administrators manage team rosters, preventing fake employment claims or shadow profiles.',
    },
    {
      q: 'What are Meshvi Deal Rooms?',
      a: 'Once two parties establish a verified 1st-degree connection, they can launch a dedicated private Deal Room equipped with shared milestones, commercial deliverables, mutual meeting agendas, and secure document vaults.',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Card */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Executive Member Playbook & Architecture</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-1 tracking-tight">
            MESHVI Master Guide
          </h1>
          <p className="text-xs text-text-muted mt-0.5 max-w-xl">
            Understand the Bilateral Intent Protocol, warm peer brokering, corporate wrong-contact recovery, and why cold scraping fails.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            to="/app/search"
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore Discovery</span>
          </Link>
        </div>
      </div>

      {/* Guide Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-surface p-1.5 rounded-2xl border border-border w-fit shadow-xs flex-wrap gap-1">
        {[
          { id: 'ALL', label: 'All Playbook Sections' },
          { id: 'PROTOCOL', label: 'Bilateral Protocol' },
          { id: 'COMPETITIVE', label: 'Competitive Matrix' },
          { id: 'TACTICS', label: 'High-Response Tactics' },
          { id: 'FAQ', label: 'Frequently Asked Questions' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: THE 4 CORE PROTOCOLS */}
      {(activeTab === 'ALL' || activeTab === 'PROTOCOL') && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-wider text-navy">
              The 4 Core Architectural Protocols
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Protocol 1: Bilateral Intent */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-3 hover:border-primary/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-navy">Bilateral Business Intent Protocol</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Blank, context-free connection spam is blocked by mathematical protocol design. Every outreach requires a specific business objective (Territory Distribution, Commercial RFP, Technology Integration) and mutually agreed agenda before direct contact details are revealed.
              </p>
              <div className="pt-2">
                <Link to="/app/search" className="text-xs font-bold text-primary hover:underline flex items-center space-x-1">
                  <span>Test with Objective Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Protocol 2: 3-Way Warm Bridges */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-3 hover:border-sky-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-navy">3-Party Warm Peer Introductions</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Unlock executive counterparties through mutual high-trust peers. Intermediaries provide permanent attested endorsement badges and claim +5 Facilitator Reputation points upon gracefully stepping aside once direct collaboration is activated.
              </p>
              <div className="pt-2">
                <Link to="/app/introductions" className="text-xs font-bold text-sky-600 hover:underline flex items-center space-x-1">
                  <span>Manage Warm Introductions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Protocol 3: Wrong Contact Recovery */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-3 hover:border-indigo-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-navy">Colleague Delegation & Wrong-Contact Recovery</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Never lose a multi-million-dollar opportunity due to misrouting. When an inquiry reaches the wrong person, they can route it in 1 click to verified colleagues on their company roster, preserving context and accelerating turnaround.
              </p>
              <div className="pt-2">
                <Link to="/app/connections" className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1">
                  <span>Review Inbound Triage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Protocol 4: Deal Rooms */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-3 hover:border-emerald-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-sm font-bold text-navy">Collaborative Deal Rooms</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Move from introduction to deal closing inside verified virtual Deal Rooms. Track deliverables, manage mutual agendas, and share sensitive procurement documents within a sovereign bilateral workspace.
              </p>
              <div className="pt-2">
                <Link to="/app/deal-rooms" className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1">
                  <span>Explore Deal Rooms</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: COMPETITIVE COMPARISON MATRIX */}
      {(activeTab === 'ALL' || activeTab === 'COMPETITIVE') && (
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-black text-navy">
                  Competitive Matrix: MESHVI vs. Legacy Networks
                </h2>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Why scraping databases (Apollo) and social media (LinkedIn) suffer from 90%+ rejection rates.
              </p>
            </div>
            <span className="px-3 py-1 bg-primary-soft text-primary text-[10px] font-black rounded-full uppercase tracking-wider self-start sm:self-auto">
              Architecture Superiority
            </span>
          </div>

          <div className="overflow-x-auto border border-border rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-bg border-b border-border text-[10px] font-black uppercase tracking-wider text-text-muted">
                  <th className="p-3.5">Capability / Protocol</th>
                  <th className="p-3.5 text-slate-500">LinkedIn</th>
                  <th className="p-3.5 text-slate-500">Apollo / ZoomInfo</th>
                  <th className="p-3.5 text-primary bg-primary-soft/30 font-black">MESHVI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3.5 font-bold text-navy">Outreach Quality</td>
                  <td className="p-3.5 text-text-muted">
                    <div className="flex items-center space-x-1.5 text-rose-600">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Cold InMail, 92% ignored</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-text-muted">
                    <div className="flex items-center space-x-1.5 text-rose-600">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Mass email blast sequences</span>
                    </div>
                  </td>
                  <td className="p-3.5 bg-primary-soft/20 text-navy font-bold">
                    <div className="flex items-center space-x-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Mandatory Bilateral Business Objective</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-navy">Misdirected Inquiries</td>
                  <td className="p-3.5 text-text-muted">
                    <div className="flex items-center space-x-1.5 text-rose-600">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Dead end; orphaned in inbox</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-text-muted">
                    <div className="flex items-center space-x-1.5 text-rose-600">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Bounces or marked as spam</span>
                    </div>
                  </td>
                  <td className="p-3.5 bg-primary-soft/20 text-navy font-bold">
                    <div className="flex items-center space-x-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1-Click Colleague Delegation</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-navy">Domain Proof</td>
                  <td className="p-3.5 text-text-muted">
                    <div className="flex items-center space-x-1.5 text-rose-600">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Unverified claims & clones</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-text-muted">
                    <div className="flex items-center space-x-1.5 text-amber-600">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Scraped stale records (35% attrition)</span>
                    </div>
                  </td>
                  <td className="p-3.5 bg-primary-soft/20 text-navy font-bold">
                    <div className="flex items-center space-x-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Cryptographic DNS TXT Handshake</span>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 font-bold text-navy">Deal Execution</td>
                  <td className="p-3.5 text-text-muted">
                    <div className="flex items-center space-x-1.5 text-rose-600">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>None (Chat only)</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-text-muted">
                    <div className="flex items-center space-x-1.5 text-rose-600">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>None (Contact list only)</span>
                    </div>
                  </td>
                  <td className="p-3.5 bg-primary-soft/20 text-navy font-bold">
                    <div className="flex items-center space-x-1.5 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Bilateral Virtual Deal Rooms</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: HIGH-RESPONSE TACTICS */}
      {(activeTab === 'ALL' || activeTab === 'TACTICS') && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-navy">
              Executive Best Practices for 95%+ Response Rate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-surface border border-border rounded-2xl space-y-2 shadow-xs">
              <span className="text-[10px] font-black text-primary uppercase tracking-wider block">Tactic 1</span>
              <h3 className="text-xs font-bold text-navy">State Concrete Value in 2 Sentences</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Decision makers evaluate business context in seconds. Mention your exact volume, geographic corridor, and strategic timeline upfront. Use the AI Assistant Studio to format it cleanly.
              </p>
            </div>

            <div className="p-5 bg-surface border border-border rounded-2xl space-y-2 shadow-xs">
              <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider block">Tactic 2</span>
              <h3 className="text-xs font-bold text-navy">Request a Warm Intro via Mutual Peers</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                If an executive shares a mutual connection with you, always prefer a 3-party warm introduction over cold outreach. An attested intermediary badge increases acceptance rates by 4.2x.
              </p>
            </div>

            <div className="p-5 bg-surface border border-border rounded-2xl space-y-2 shadow-xs">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Tactic 3</span>
              <h3 className="text-xs font-bold text-navy">Set Up a Verified Deal Room</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Immediately anchor negotiations around shared milestones. Proposing an agenda inside a Deal Room signals institutional professionalism and builds mutual commitment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: FREQUENTLY ASKED QUESTIONS */}
      {(activeTab === 'ALL' || activeTab === 'FAQ') && (
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-border">
            <HelpCircle className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-black text-navy uppercase tracking-wider">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-border rounded-2xl overflow-hidden transition-all bg-bg"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-navy hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-primary' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-text-muted leading-relaxed border-t border-border/40 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
