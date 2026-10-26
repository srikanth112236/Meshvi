import { Link } from 'react-router-dom';
import { ArrowRight, UserCheck, MessageSquare, Building, Users, ShieldAlert, CheckCircle, Send, Sparkles } from 'lucide-react';
import { MotionContainer, MotionStagger, MotionItem } from '../../components/ui/MotionSection';

export const HowItWorksPage = () => {
  const steps = [
    {
      num: '01',
      title: 'Define Intent & Profile',
      desc: 'Declare your business role, verified expertise, and specific commercial intents (what you are offering vs. seeking).',
      icon: UserCheck,
      badge: 'Zero Spam',
    },
    {
      num: '02',
      title: 'State Your Commercial Objective',
      desc: 'Type your objective in plain English (e.g. "Airport lounge beverage partnerships in Malaysia" or "Cold-chain procurement").',
      icon: MessageSquare,
      badge: 'Intent NLP',
    },
    {
      num: '03',
      title: 'Target Division Mapping',
      desc: 'Meshvi normalizes colloquial queries into taxonomy functions (Commercial, Supply Chain, Strategic Alliances).',
      icon: Building,
      badge: 'Taxonomy Match',
    },
    {
      num: '04',
      title: 'Inspect Permitted Professional Records',
      desc: 'Discover verified professionals with full data provenance. Real records only—never hallucinated personas.',
      icon: Users,
      badge: 'Data Provenance',
    },
    {
      num: '05',
      title: 'Review Grounded Relevance Signals',
      desc: 'Transparent 100-point rubric breakdown (Function 35, Geo 25, Industry 20, Seniority 10, Intent 10) with exact reason codes.',
      icon: ShieldAlert,
      badge: 'Explainable AI',
    },
    {
      num: '06',
      title: 'Send Intent-Backed Request or Intro',
      desc: 'Send a direct request with mandatory business context, or route through mutual colleagues for warm introductions.',
      icon: Send,
      badge: 'Double-Opt-In',
    },
    {
      num: '07',
      title: 'Engage in Permissioned Direct Messaging',
      desc: 'Once mutual consent is established, engage in direct professional messaging with zero unsolicited blast outreach.',
      icon: CheckCircle,
      badge: 'Encrypted Thread',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <MotionContainer className="max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>7-Step Deterministic Protocol</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-navy tracking-tight">
          How MESHVI works
        </h1>
        <p className="mt-4 text-base sm:text-lg text-text-muted leading-relaxed">
          Traditional directories require knowing the exact person’s title before you can find them.
          Meshvi begins with your business outcome, normalizes intent, explains matches transparently,
          and facilitates mutual connections without unsolicited spam.
        </p>
      </MotionContainer>

      {/* 7 Step Interactive Flow */}
      <MotionStagger className="space-y-4">
        {steps.map((s) => (
          <MotionItem key={s.num}>
            <div className="bg-surface border border-border hover:border-primary/50 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex items-start sm:items-center space-x-5">
                <div className="text-2xl sm:text-3xl font-black text-navy/30 group-hover:text-primary transition-colors w-12 shrink-0">
                  {s.num}
                </div>
                <div className="w-12 h-12 rounded-xl bg-surface-muted group-hover:bg-primary-soft text-navy group-hover:text-primary transition-colors flex items-center justify-center shrink-0">
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-base sm:text-lg font-bold text-navy">{s.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-soft/80 px-2.5 py-0.5 rounded-full">
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-muted max-w-2xl leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            </div>
          </MotionItem>
        ))}
      </MotionStagger>

      {/* Call to action */}
      <MotionContainer className="bg-navy text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <h3 className="text-2xl font-bold">Experience the Intent-First Advantage</h3>
          <p className="text-xs text-surface-muted leading-relaxed">
            Create your professional profile today or explore open pilot search criteria.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/register"
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </MotionContainer>
    </div>
  );
};
