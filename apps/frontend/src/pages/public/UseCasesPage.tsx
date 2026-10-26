import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Briefcase, Globe2, Building2, Sparkles, Users } from 'lucide-react';
import { MotionContainer, MotionStagger, MotionItem } from '../../components/ui/MotionSection';

export const UseCasesPage = () => {
  const useCases = [
    {
      id: 'partnerships',
      title: 'Finding Strategic Partnership Leaders',
      icon: TrendingUp,
      color: 'bg-primary-soft text-primary',
      problem: 'Strategic partnership responsibilities frequently hide behind vague titles like "Corporate Alliances", "Ecosystem Director", or "New Ventures".',
      example: '"I have an airport-lounge commercial opportunity in Malaysia. Help me identify relevant commercial, partnerships or business-development contacts at beverage companies."',
      attributes: ['Target Function: Commercial Partnerships / Alliances', 'Seniority: Director / Head of Department', 'Geography: Southeast Asia'],
      workflow: 'Meshvi normalizes the objective to beverage FMCG commercial leads, surfaces verified profiles in KL/Singapore, and drafts a contextual connection note.',
    },
    {
      id: 'sales-bd',
      title: 'Discovering Enterprise Commercial Teams',
      icon: Briefcase,
      color: 'bg-emerald-50 text-emerald-600',
      problem: 'Reaching out to general sales inboxes yields no response; identifying the exact commercial head responsible for regional accounts is tedious.',
      example: '"Identify commercial directors and enterprise sales leads at mid-market fintechs in the UK looking to expand their checkout APIs."',
      attributes: ['Industry: Fintech / Payment Gateways', 'Function: Enterprise Sales / Commercial Operations', 'Geography: United Kingdom'],
      workflow: 'Identifies authorized commercial leads, checks verified company claims, and enables direct connection with stated business context.',
    },
    {
      id: 'distribution',
      title: 'Finding Authorized Distributors in New Markets',
      icon: Globe2,
      color: 'bg-blue-50 text-blue-600',
      problem: 'Expanding into overseas markets requires localized authorized resellers and distribution executives who understand local regulatory channels.',
      example: '"Looking for licensed medical device distributors and authorized commercial importer leads in Germany."',
      attributes: ['Industry: Medical Devices / Healthcare', 'Function: Channel Distribution / Authorized Imports', 'Geography: DACH / Germany'],
      workflow: 'Surfaces organizations with verified distribution footprints, highlights trade leads, and facilitates warm intermediary introductions.',
    },
    {
      id: 'procurement',
      title: 'Discovering Procurement & Sourcing Contacts',
      icon: Building2,
      color: 'bg-amber-50 text-amber-700',
      problem: 'Vendors struggle to find who manages vendor rosters or RFP distributions within large corporate enterprises.',
      example: '"Discover vendor management and cloud procurement decision-makers at tier-1 retail brands in Scandinavia."',
      attributes: ['Industry: Retail / E-commerce', 'Function: Strategic Sourcing / Procurement', 'Geography: Nordics'],
      workflow: 'Explores permitted supply chain and procurement records, explaining the vendor selection criteria declared on company profiles.',
    },
    {
      id: 'specialists',
      title: 'Finding Transaction & Advisory Specialists',
      icon: Sparkles,
      color: 'bg-purple-50 text-purple-600',
      problem: 'Specialized cross-border legal or transaction advisors are often difficult to separate from broad administrative agencies.',
      example: '"Need cross-border tax and compliance specialists experienced in Japanese subsidiary incorporation."',
      attributes: ['Function: Legal / Cross-Border Corporate Advisory', 'Expertise: Corporate Inward Investment, Japanese Tax Law'],
      workflow: 'Matches specific advisory credentials and confirmed experience tags, providing grounded reasoning on relevant engagements.',
    },
    {
      id: 'collaboration',
      title: 'Corporate Innovation & Joint Ventures',
      icon: Users,
      color: 'bg-rose-50 text-rose-600',
      problem: 'Emerging tech ventures seeking joint pilots lack a transparent pathway into corporate venture teams.',
      example: '"Identify Open Innovation Heads and Corporate Venture Directors in manufacturing looking for IoT pilots."',
      attributes: ['Function: Corporate Innovation / R&D Ventures', 'Industry: Advanced Manufacturing'],
      workflow: 'Surfaces innovation leads with active "LOOKING_FOR: Early stage pilots" declared intents.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <MotionContainer className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Targeted Solutions</span>
        <h1 className="mt-2 text-4xl sm:text-6xl font-black text-navy tracking-tight">
          Real B2B Discovery Scenarios
        </h1>
        <p className="mt-4 text-base sm:text-lg text-text-muted leading-relaxed">
          See how MESHVI turns complex commercial goals into high-trust introductions
          across regional markets, enterprise hierarchies, and cross-border partnerships.
        </p>
      </MotionContainer>

      {/* Grid of Use Cases */}
      <MotionStagger className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {useCases.map((uc) => (
          <MotionItem key={uc.id}>
            <div className="bg-surface border border-border hover:border-primary/50 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all h-full flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${uc.color}`}>
                    <uc.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">{uc.title}</h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-surface-muted rounded-xl border border-border">
                    <span className="font-bold text-navy uppercase text-[10px] block mb-0.5">The Friction:</span>
                    <span className="text-text-muted leading-relaxed">{uc.problem}</span>
                  </div>

                  <div className="p-3 bg-primary-soft/30 rounded-xl border border-primary/20">
                    <span className="font-bold text-primary uppercase text-[10px] block mb-0.5">Objective Query:</span>
                    <span className="text-navy font-semibold italic">{uc.example}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="font-bold text-navy text-[11px] uppercase block mb-1.5">Normalized Taxonomy Mapping:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {uc.attributes.map((attr, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-surface-muted border border-border rounded-lg text-[11px] text-navy font-medium">
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted">Grounded in verified records</span>
                <Link to="/search" className="text-primary font-bold hover:underline flex items-center">
                  <span>Explore Search</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </MotionItem>
        ))}
      </MotionStagger>

      {/* Footer CTA */}
      <MotionContainer className="bg-navy text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold">Have a custom commercial objective?</h3>
          <p className="text-xs text-surface-muted mt-1">Our intent normalization model can handle arbitrary cross-border business queries.</p>
        </div>
        <Link
          to="/register"
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          Start Discovering &rarr;
        </Link>
      </MotionContainer>
    </div>
  );
};
