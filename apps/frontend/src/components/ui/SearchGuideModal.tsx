import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Layers,
  Building2,
  Compass,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface SearchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: 'DECISION_MAKERS' | 'OPPORTUNITY_GRAPH' | 'ENTERPRISES' | 'MARKET_CORRIDOR';
  onSelectSampleQuery?: (query: string, mode: 'DECISION_MAKERS' | 'OPPORTUNITY_GRAPH' | 'ENTERPRISES' | 'MARKET_CORRIDOR') => void;
}

export const SearchGuideModal: React.FC<SearchGuideModalProps> = ({
  isOpen,
  onClose,
  activeTab = 'DECISION_MAKERS',
  onSelectSampleQuery,
}) => {
  const [currentTab, setCurrentTab] = useState<
    'DECISION_MAKERS' | 'OPPORTUNITY_GRAPH' | 'ENTERPRISES' | 'MARKET_CORRIDOR'
  >(activeTab);

  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
              <HelpCircle className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-navy">Search Guide & How It Works</h2>
              <p className="text-xs text-text-muted">
                Learn how to search in plain English and understand how results are matched.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-navy hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-bg p-1 rounded-xl border border-border mt-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setCurrentTab('DECISION_MAKERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              currentTab === 'DECISION_MAKERS'
                ? 'bg-black text-white shadow-xs'
                : 'text-text-muted hover:text-navy'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Decision Makers</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('OPPORTUNITY_GRAPH')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              currentTab === 'OPPORTUNITY_GRAPH'
                ? 'bg-black text-white shadow-xs'
                : 'text-text-muted hover:text-navy'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Opportunity Graph</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('ENTERPRISES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              currentTab === 'ENTERPRISES'
                ? 'bg-black text-white shadow-xs'
                : 'text-text-muted hover:text-navy'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Enterprises (1,000+)</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('MARKET_CORRIDOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              currentTab === 'MARKET_CORRIDOR'
                ? 'bg-black text-white shadow-xs'
                : 'text-text-muted hover:text-navy'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Market Corridors</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-5 space-y-4 text-xs">
          {currentTab === 'DECISION_MAKERS' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 text-xs flex items-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-700" />
                  <span>What is Decision Makers Search?</span>
                </span>
                <p className="text-[11.5px] text-blue-950 leading-relaxed">
                  Use this tab when you want to find the exact person to connect with—such as a Chief Executive Officer, Procurement Director, or Head of Strategic Partnerships.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-navy text-xs">How to Search (Plain English Examples):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => {
                      onSelectSampleQuery?.('Chief Executive Officer in Germany', 'DECISION_MAKERS');
                      onClose();
                    }}
                    className="p-2.5 bg-bg border border-border rounded-lg cursor-pointer hover:border-black transition-all space-y-0.5"
                  >
                    <span className="font-semibold text-navy text-[11px] block">By Job Title & Country</span>
                    <span className="text-[10.5px] text-text-muted block">"Chief Executive Officer in Germany"</span>
                  </div>
                  <div
                    onClick={() => {
                      onSelectSampleQuery?.('Director of Procurement at Apex', 'DECISION_MAKERS');
                      onClose();
                    }}
                    className="p-2.5 bg-bg border border-border rounded-lg cursor-pointer hover:border-black transition-all space-y-0.5"
                  >
                    <span className="font-semibold text-navy text-[11px] block">By Role & Company</span>
                    <span className="text-[10.5px] text-text-muted block">"Director of Procurement at Apex"</span>
                  </div>
                  <div
                    onClick={() => {
                      onSelectSampleQuery?.('Rafael Rao at Boreal Industries', 'DECISION_MAKERS');
                      onClose();
                    }}
                    className="p-2.5 bg-bg border border-border rounded-lg cursor-pointer hover:border-black transition-all space-y-0.5"
                  >
                    <span className="font-semibold text-navy text-[11px] block">By Person Name</span>
                    <span className="text-[10.5px] text-text-muted block">"Rafael Rao at Boreal Industries"</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-0.5">
                    <span className="font-semibold text-emerald-900 text-[11px] block">Paste Full Email / Pitch</span>
                    <span className="text-[10.5px] text-emerald-800 block">
                      You can paste your entire outreach draft. Our engine automatically detects the role, company, and goals!
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-border">
                <h4 className="font-bold text-navy text-xs">Understanding Match Tiers:</h4>
                <div className="space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold shrink-0 mt-0.5">
                      ⭐ Top Recommendations (80-100%)
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Direct, high-precision matches on role, company, and territory with verified commercial intent.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="px-1.5 py-0.2 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-bold shrink-0 mt-0.5">
                      Strong Potential (60-79%)
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Senior executives in the same industry or adjacent regional procurement hubs.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-bg rounded-lg border border-border flex items-center justify-between text-[11px]">
                <span className="text-text-muted">Ready to reach out?</span>
                <span className="font-bold text-navy flex items-center space-x-1">
                  <span>Click</span>
                  <span className="px-1.5 py-0.5 bg-black text-white rounded text-[10px] font-bold">Bridge</span>
                  <span>to send a private introduction request.</span>
                </span>
              </div>
            </div>
          )}

          {currentTab === 'OPPORTUNITY_GRAPH' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-1">
                <span className="font-bold text-purple-900 text-xs flex items-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-700" />
                  <span>What is the Opportunity Graph?</span>
                </span>
                <p className="text-[11.5px] text-purple-950 leading-relaxed">
                  Instead of searching for just one individual, the Opportunity Graph maps your commercial objective into complete enterprise buying committees (Evaluators, Commercial Sponsors, and Decision Makers).
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-navy text-xs">How to Search:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => {
                      onSelectSampleQuery?.('Cold Storage Logistics', 'OPPORTUNITY_GRAPH');
                      onClose();
                    }}
                    className="p-2.5 bg-bg border border-border rounded-lg cursor-pointer hover:border-black transition-all space-y-0.5"
                  >
                    <span className="font-semibold text-navy text-[11px] block">Logistics & Supply Chain</span>
                    <span className="text-[10.5px] text-text-muted block">"Cold Storage Logistics"</span>
                  </div>
                  <div
                    onClick={() => {
                      onSelectSampleQuery?.('Airport Lounges in Malaysia', 'OPPORTUNITY_GRAPH');
                      onClose();
                    }}
                    className="p-2.5 bg-bg border border-border rounded-lg cursor-pointer hover:border-black transition-all space-y-0.5"
                  >
                    <span className="font-semibold text-navy text-[11px] block">Hospitality & Food</span>
                    <span className="text-[10.5px] text-text-muted block">"Airport Lounges in Malaysia"</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-bg rounded-lg border border-border space-y-1.5">
                <h4 className="font-bold text-navy text-[11.5px]">What You See on Each Card:</h4>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-text-muted">
                  <li><strong>Buying Committee:</strong> All key officers involved in approving commercial contracts.</li>
                  <li><strong>Recommended Route:</strong> Tells you whether to approach via a Direct Mandate Bridge or Committee Introduction.</li>
                  <li><strong>One-Click Bridge:</strong> Directly initiate introductions with the relevant committee member.</li>
                </ul>
              </div>
            </div>
          )}

          {currentTab === 'ENTERPRISES' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                <span className="font-bold text-emerald-900 text-xs flex items-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-700" />
                  <span>What is Enterprises Search?</span>
                </span>
                <p className="text-[11.5px] text-emerald-950 leading-relaxed">
                  Browse and qualify corporate entities with 1,000+ employees, global subsidiary relations, corporate registries, and annual revenue bands.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-navy text-xs">How to Search:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => {
                      onSelectSampleQuery?.('Apex Industries', 'ENTERPRISES');
                      onClose();
                    }}
                    className="p-2.5 bg-bg border border-border rounded-lg cursor-pointer hover:border-black transition-all space-y-0.5"
                  >
                    <span className="font-semibold text-navy text-[11px] block">Company Name</span>
                    <span className="text-[10.5px] text-text-muted block">"Apex Industries" or "Pacifica"</span>
                  </div>
                  <div
                    onClick={() => {
                      onSelectSampleQuery?.('Renewable Energy in Canada', 'ENTERPRISES');
                      onClose();
                    }}
                    className="p-2.5 bg-bg border border-border rounded-lg cursor-pointer hover:border-black transition-all space-y-0.5"
                  >
                    <span className="font-semibold text-navy text-[11px] block">Sector & Region</span>
                    <span className="text-[10.5px] text-text-muted block">"Renewable Energy in Canada"</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-bg rounded-lg border border-border space-y-1">
                <span className="font-bold text-navy text-[11.5px] block">Action: Corporate Dossier</span>
                <p className="text-[11px] text-text-muted">
                  Click <strong>Dossier</strong> on any organization to view their corporate verification, active published tenders, subsidiary hubs, and key leadership team.
                </p>
              </div>
            </div>
          )}

          {currentTab === 'MARKET_CORRIDOR' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                <span className="font-bold text-amber-900 text-xs flex items-center space-x-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                  <span>What are Market Corridors?</span>
                </span>
                <p className="text-[11.5px] text-amber-950 leading-relaxed">
                  Bilateral trade routes that connect certified exporters and manufacturers with verified overseas distributors, customs agents, and retail buyers.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-navy text-xs">How to Search:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => {
                      onSelectSampleQuery?.('Supply Chain with Certification: ISO 9001', 'MARKET_CORRIDOR');
                      onClose();
                    }}
                    className="p-2.5 bg-bg border border-border rounded-lg cursor-pointer hover:border-black transition-all space-y-0.5"
                  >
                    <span className="font-semibold text-navy text-[11px] block">By Certification</span>
                    <span className="text-[10.5px] text-text-muted block">"Supply Chain with Certification: ISO 9001"</span>
                  </div>
                  <div
                    onClick={() => {
                      onSelectSampleQuery?.('Singapore to Malaysia cross-border logistics', 'MARKET_CORRIDOR');
                      onClose();
                    }}
                    className="p-2.5 bg-bg border border-border rounded-lg cursor-pointer hover:border-black transition-all space-y-0.5"
                  >
                    <span className="font-semibold text-navy text-[11px] block">By Trade Route</span>
                    <span className="text-[10.5px] text-text-muted block">"Singapore to Malaysia logistics"</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-bg rounded-lg border border-border space-y-1.5">
                <h4 className="font-bold text-navy text-[11.5px]">What Every Corridor Shows:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2 bg-surface rounded border border-border text-[10.5px]">
                    <strong className="block text-navy">Annual Trade Flow</strong>
                    <span className="text-text-muted">Estimated bilateral commercial volume</span>
                  </div>
                  <div className="p-2 bg-surface rounded border border-border text-[10.5px]">
                    <strong className="block text-navy">Customs Clearance</strong>
                    <span className="text-text-muted">Average border clearance speed</span>
                  </div>
                  <div className="p-2 bg-surface rounded border border-border text-[10.5px]">
                    <strong className="block text-navy">Compliance Attestation</strong>
                    <span className="text-text-muted">Halal, ISO 9001, GDP Cold-Chain</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-xs">
          <span className="text-text-muted text-[11px]">Strict 85-Introduction Quotas Enforced</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold transition-colors"
          >
            Got it, Let's Search
          </button>
        </div>
      </div>
    </div>
  );
};
