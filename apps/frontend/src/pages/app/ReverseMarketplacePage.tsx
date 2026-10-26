import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Search,
  Building2,
  ShieldCheck,
  Send,
  ArrowRight,
  X,
  Clock,
  Globe,
  Users,
} from 'lucide-react';

interface ReverseOpportunity {
  id: string;
  title: string;
  opportunityType: string;
  targetGeography: string;
  budgetBand: string;
  requirementsDoc: string;
  deadline?: string;
  status: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    industry: string;
    verificationStatus: string;
  };
  bids: Array<{ id: string; status: string }>;
}

export const ReverseMarketplacePage: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  const [opportunities, setOpportunities] = useState<ReverseOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterGeo, setFilterGeo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Bid submission drawer state
  const [selectedOpp, setSelectedOpp] = useState<ReverseOpportunity | null>(null);
  const [proposalSummary, setProposalSummary] = useState('');
  const [pricingEstimate, setPricingEstimate] = useState<string>('250000');
  const [requiresMnda, setRequiresMnda] = useState(true);
  const [submittingBid, setSubmittingBid] = useState(false);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/companies/reverse-opportunities/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOpportunities(data.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [token]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp || !proposalSummary.trim()) return;

    setSubmittingBid(true);
    try {
      const res = await fetch(`/api/v1/companies/reverse-opportunities/${selectedOpp.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proposalSummary: proposalSummary.trim(),
          pricingEstimate: parseFloat(pricingEstimate) || undefined,
          requiresMnda,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit bid.');
      }

      showToast({
        title: 'Verified Proposal Submitted',
        message: `Your commercial bid has been routed to the procurement committee at ${selectedOpp.company.name}.`,
        type: 'success',
      });

      setTimeout(() => {
        setSelectedOpp(null);
        setProposalSummary('');
        fetchOpportunities();
      }, 1500);
    } catch (err: any) {
      showToast({
        title: 'Submission Error',
        message: err.message || 'Could not dispatch proposal bid.',
        type: 'warning',
      });
    } finally {
      setSubmittingBid(false);
    }
  };

  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.requirementsDoc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'ALL' || opp.opportunityType === filterType;
    const matchesGeo = !filterGeo || opp.targetGeography.toLowerCase().includes(filterGeo.toLowerCase());

    return matchesSearch && matchesType && matchesGeo;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Page Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-wider">
              Differentiator #4
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Corporate Deal Exchange
            </span>
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">Enterprise Procurement & Commercial Tenders</h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            Enterprises broadcast what they actively need (distributors, suppliers, regional partners). Verified Meshvi members submit structured bids with zero cold outreach.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right">
            <span className="text-[10px] font-bold uppercase text-text-muted block">Active Public Briefs</span>
            <span className="text-base font-black text-navy">{opportunities.length} Open Tenders</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tender briefs (e.g. 'beverage', 'logistics', 'cold storage')..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy font-semibold focus:outline-none"
            >
              <option value="ALL">All Tender Types</option>
              <option value="SUPPLIER_SOURCING">Supplier Sourcing</option>
              <option value="DISTRIBUTOR_SEARCH">Distributor Search</option>
              <option value="JOINT_VENTURE">Joint Venture</option>
            </select>

            <input
              type="text"
              value={filterGeo}
              onChange={(e) => setFilterGeo(e.target.value)}
              placeholder="Filter Corridor..."
              className="w-36 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy focus:outline-none"
            />
          </div>
        </div>

        {/* Corridor Quick Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center space-x-1 shrink-0 mr-1">
            <Globe className="w-3 h-3 text-slate-500" />
            <span>Corridors:</span>
          </span>
          {['ALL', 'ASEAN', 'MY', 'SG', 'EU', 'US', 'GLOBAL'].map((corridor) => (
            <button
              type="button"
              key={corridor}
              onClick={() => setFilterGeo(corridor === 'ALL' ? '' : corridor)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors shrink-0 ${
                (corridor === 'ALL' && !filterGeo) || filterGeo === corridor
                  ? 'bg-black text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {corridor === 'ALL' ? 'All Regions' : corridor}
            </button>
          ))}
        </div>
      </div>

      {/* Tender Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-text-muted">Loading commercial tenders...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-surface border border-border rounded-2xl p-8 space-y-2">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-navy">No Matching Commercial Briefs</h3>
          <p className="text-xs text-text-muted">Try adjusting your keyword search or territory filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((opp) => {
            const daysLeft = Math.max(
              3,
              Math.ceil(
                (new Date(opp.deadline || Date.now() + 86310000 * 25).getTime() - Date.now()) /
                  (1000 * 3600 * 24)
              )
            );

            return (
              <div
                key={opp.id}
                className="bg-surface border border-border hover:border-slate-400 rounded-2xl p-5 shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                        {opp.opportunityType.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {opp.targetGeography}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-text-muted font-bold">
                      Budget: {opp.budgetBand}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-navy leading-snug">{opp.title}</h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-navy">{opp.company.name}</span>
                      <span>&bull;</span>
                      <span className="text-text-muted">{opp.company.industry}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 line-clamp-2">
                    {opp.requirementsDoc}
                  </p>

                  <div className="flex items-center space-x-3 text-[11px] text-text-muted pt-1">
                    <span className="flex items-center space-x-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{daysLeft} days left</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-semibold">
                      <Users className="w-3 h-3" />
                      <span>{opp.bids?.length || 0} proposals submitted</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-[11px] text-text-muted flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Verified Organization Brief</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOpp(opp)}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <span>Submit Verified Bid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bid Submission Slide-Over Drawer */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-surface h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Corporate Deal Exchange Proposal
                </span>
                <h2 className="text-base font-black text-navy truncate max-w-sm mt-0.5">
                  {selectedOpp.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                className="p-1.5 text-text-muted hover:text-navy rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBid} className="p-6 space-y-4 flex-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Recipient Enterprise</span>
                <strong className="text-navy font-black block">{selectedOpp.company.name}</strong>
                <span className="text-text-muted">Target Geography: {selectedOpp.targetGeography} &bull; Budget Band: {selectedOpp.budgetBand}</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                  Commercial Capability & Proposal Summary *
                </label>
                <textarea
                  rows={4}
                  required
                  value={proposalSummary}
                  onChange={(e) => setProposalSummary(e.target.value)}
                  placeholder="Detail your capacity, certifications (e.g. Halal, ISO), fulfillment timeline, and commercial advantage..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                  Indicative Commercial Pricing / Deal Band (USD)
                </label>
                <input
                  type="number"
                  value={pricingEstimate}
                  onChange={(e) => setPricingEstimate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start space-x-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresMnda}
                    onChange={(e) => setRequiresMnda(e.target.checked)}
                    className="mt-0.5 text-black rounded focus:ring-black"
                  />
                  <div>
                    <span className="text-xs font-bold text-navy block">Require Mutual M-NDA Execution</span>
                    <span className="text-[11px] text-text-muted">
                      Technical specs and pricing matrices remain confidential until bilateral non-disclosure agreement is accepted.
                    </span>
                  </div>
                </label>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Your bid will be logged in the <strong>Evidence-Backed Attribution Ledger</strong> to ensure full transparent credit upon contract close.
                </span>
              </div>
            </form>

            <div className="p-6 border-t border-border flex space-x-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                className="flex-1 py-2.5 border border-border bg-white text-navy font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitBid}
                disabled={submittingBid}
                className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                {submittingBid ? (
                  <span>Routing to Committee...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Commercial Bid</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
