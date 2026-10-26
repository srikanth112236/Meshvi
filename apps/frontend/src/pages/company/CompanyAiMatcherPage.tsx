import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';

export const CompanyAiMatcherPage = () => {
  const { token } = useAuth();
  const [objective, setObjective] = useState('Distributors with cold-storage warehousing in Singapore and Malaysia');
  const [industry, setIndustry] = useState('Wholesale Distribution');
  const [region, setRegion] = useState('SG');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [aiIntent, setAiIntent] = useState<any | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleRunAiMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;
    setLoading(true);
    setError('');
    setMatches([]);

    try {
      // 1. Interpret corporate intent using AI
      const aiRes = await fetch('/api/v1/ai/interpret-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: `${objective} in ${industry}` }),
      });
      const aiData = await aiRes.json();
      if (aiData.success) {
        setAiIntent(aiData.data.intent);
      }

      // 2. Query search engine with grounded scoring
      const searchRes = await fetch('/api/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          q: objective,
          industry: industry || undefined,
          countryCode: region || undefined,
        }),
      });
      const searchData = await searchRes.json();
      if (searchData.success) {
        setMatches(searchData.data?.matches || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error executing AI enterprise match.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Enterprise Match & Sourcing Engine</span>
          </span>
          <h1 className="text-2xl font-extrabold text-navy mt-1">B2B Partner Matching Hub</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Leverage Gemini 1.5 to translate corporate strategic objectives into verified decision-maker matches with explainable alignment scores.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <form onSubmit={handleRunAiMatch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
              Corporate Objective / Sourcing Need
            </label>
            <input
              type="text"
              required
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. Cold-storage bonded warehousing in Singapore for organic beverage line..."
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                Target Industry Sector
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none"
              >
                <option value="Wholesale Distribution">Wholesale Distribution & Logistics</option>
                <option value="FMCG">FMCG & Consumer Goods</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Manufacturing">Manufacturing & Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1.5">
                Target Country / Jurisdiction
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none"
              >
                <option value="SG">Singapore (SG)</option>
                <option value="MY">Malaysia (MY)</option>
                <option value="IN">India (IN)</option>
                <option value="">Any Jurisdiction</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Analyzing Alignment via AI...' : 'Run AI Enterprise Match'}</span>
          </button>
        </form>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger">
            {error}
          </div>
        )}
      </div>

      {/* AI Intent Normalization Breakdown */}
      {aiIntent && (
        <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 text-indigo-900 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Intent Dissection:</span>
          </div>
          <p className="text-indigo-800 text-[11px] leading-relaxed">
            {aiIntent.reasoningSummary}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {aiIntent.searchKeywords?.map((kw: string) => (
              <span key={kw} className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Match Results List */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-navy flex items-center justify-between">
            <span>Verified Decision-Maker Matches ({matches.length})</span>
            <span className="text-[11px] text-text-muted font-normal">Ranked by Grounded Alignment Score</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((item) => (
              <div
                key={item.profile?.id}
                onClick={() => setSelectedMatch(item)}
                className="p-5 bg-surface border border-border hover:border-indigo-300 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                      {item.profile?.displayName?.[0] || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy">{item.profile?.displayName}</h4>
                      <p className="text-xs text-text-muted line-clamp-1">
                        {item.profile?.currentTitle} &bull; {item.profile?.company?.name || 'Enterprise'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-indigo-600" />
                      <span>{Math.round(item.score)}% Fit</span>
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-surface-muted rounded-xl text-[11px] text-navy">
                  <span className="font-bold text-indigo-700">AI Match Rationale: </span>
                  <span>{item.explanation}</span>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                  <span>Jurisdiction: {item.profile?.countryCode || 'SG'}</span>
                  <span className="text-indigo-600 font-bold hover:underline flex items-center">
                    <span>Inspect Match Dossier</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Dossier Drawer */}
      <Drawer
        isOpen={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        title={selectedMatch?.profile?.displayName || 'Partner Dossier'}
        subtitle={`${selectedMatch?.profile?.currentTitle} at ${selectedMatch?.profile?.company?.name || 'Enterprise'}`}
        badge={{ label: `${Math.round(selectedMatch?.score || 0)}% FIT`, variant: 'primary' }}
        width="md"
        footer={
          <button
            type="button"
            onClick={() => setSelectedMatch(null)}
            className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        }
      >
        {selectedMatch && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-surface-muted rounded-2xl border border-border space-y-2">
              <div className="text-sm font-extrabold text-navy">{selectedMatch.profile?.displayName}</div>
              <div className="text-text-muted">{selectedMatch.profile?.headline}</div>
              <div className="text-[11px] text-text-muted">
                Industry: {selectedMatch.profile?.industry || 'Wholesale Distribution'} &bull; Country: {selectedMatch.profile?.countryCode}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-navy">
                AI Match Alignment Breakdown
              </h4>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 leading-relaxed">
                {selectedMatch.explanation}
              </div>
            </div>

            {selectedMatch.reasonCodes && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-text-muted">Triggered Reason Codes:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedMatch.reasonCodes.map((rc: string) => (
                    <span key={rc} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy text-white">
                      {rc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
