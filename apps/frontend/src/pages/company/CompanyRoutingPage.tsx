import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GitPullRequest,
  Plus,
  Trash2,
  Building2,
  CheckCircle2,
  RefreshCw,
  Tag,
  Send,
  Zap,
  Sparkles,
  Users,
  Briefcase,
  HelpCircle,
  Check,
  AlertCircle,
} from 'lucide-react';

interface RoutingRule {
  id: string;
  companyId: string;
  department: string;
  categoryTag?: string | null;
  priority: number;
  targetUserId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export const CompanyRoutingPage = () => {
  const { token } = useAuth();
  const [activeCompany, setActiveCompany] = useState<any | null>(null);
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states (Natural Language Builder)
  const [department, setDepartment] = useState('Procurement & Sourcing');
  const [categoryTag, setCategoryTag] = useState('');
  const [priorityTier, setPriorityTier] = useState<'HIGH' | 'STANDARD' | 'FALLBACK'>('HIGH');
  const [targetUserId, setTargetUserId] = useState('');

  // Simulator states
  const [simQuery, setSimQuery] = useState('');
  const [simResult, setSimResult] = useState<any | null>(null);

  const departmentsList = [
    'Procurement & Sourcing',
    'Strategic Partnerships',
    'M&A & Corporate Development',
    'Sales & Commercial',
    'Engineering & Technology',
    'Legal & Regulatory Compliance',
    'Executive Leadership',
  ];

  // Common keywords suggestions
  const SUGGESTED_KEYWORDS = [
    'RFP',
    'TENDER',
    'VENDOR',
    'PARTNERSHIP',
    'DISTRIBUTOR',
    'PRICING',
    'M&A',
    'NDA',
    'SUPPLIER',
    'API',
    'INVESTMENT',
  ];

  // Pre-configured 1-click recipes for layman users
  const STARTER_RECIPES = [
    {
      title: 'Procurement & RFPs',
      department: 'Procurement & Sourcing',
      categoryTag: 'RFP, VENDOR, TENDER',
      priorityTier: 'HIGH' as const,
      priorityNum: 8,
      icon: '📦',
      description: 'Auto-route vendor proposals, pricing quotes & tender inquiries to your Sourcing Lead.',
    },
    {
      title: 'Strategic Partnerships',
      department: 'Strategic Partnerships',
      categoryTag: 'PARTNERSHIP, CHANNEL, ALLIANCE',
      priorityTier: 'HIGH' as const,
      priorityNum: 8,
      icon: '🤝',
      description: 'Direct co-development, reseller partnerships & joint-venture proposals to BizDev.',
    },
    {
      title: 'Sales & Distribution',
      department: 'Sales & Commercial',
      categoryTag: 'DISTRIBUTOR, RESELLER, WHOLESALE',
      priorityTier: 'STANDARD' as const,
      priorityNum: 6,
      icon: '💼',
      description: 'Route bulk purchase inquiries and dealership applications to the Commercial desk.',
    },
    {
      title: 'Legal & NDAs',
      department: 'Legal & Regulatory Compliance',
      categoryTag: 'NDA, CONTRACT, COMPLIANCE',
      priorityTier: 'STANDARD' as const,
      priorityNum: 6,
      icon: '⚖️',
      description: 'Route mutual NDAs, master service agreements & regulatory reviews to Legal.',
    },
  ];

  // Pre-configured test prompts for the simulator
  const SAMPLE_SIMULATION_QUERIES = [
    {
      label: 'Sourcing RFP',
      text: 'Submitting an RFP for 50,000 units of biodegradable packaging materials with net-30 vendor terms.',
    },
    {
      label: 'Regional Distribution',
      text: 'Looking to become an authorized wholesale distributor and reseller for your product line in Western region.',
    },
    {
      label: 'Mutual NDA Execution',
      text: 'Requesting bilateral NDA execution before sharing our enterprise product roadmap and architecture.',
    },
    {
      label: 'Strategic Partnership',
      text: 'Proposing a joint channel partnership and co-marketing alliance for enterprise SaaS customers.',
    },
  ];

  const fetchCompanyAndRules = async () => {
    try {
      setLoading(true);
      const myRes = await fetch('/api/v1/companies/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myData = await myRes.json();
      if (!myData.success || !myData.data || myData.data.length === 0) {
        setLoading(false);
        return;
      }

      const comp = myData.data[0].company;
      setActiveCompany(comp);

      const [rulesRes, compDetailsRes] = await Promise.all([
        fetch(`/api/v1/companies/${comp.id}/routing-rules`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/companies/${comp.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const rulesData = await rulesRes.json();
      if (rulesData.success && rulesData.data) {
        setRules(rulesData.data);
      }

      const compDetails = await compDetailsRes.json();
      if (compDetails.success && compDetails.data?.memberships) {
        setTeamMembers(compDetails.data.memberships);
      }
    } catch (err: any) {
      console.error('Failed to load routing rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyAndRules();
  }, [token]);

  const getPriorityNumber = (tier: 'HIGH' | 'STANDARD' | 'FALLBACK') => {
    switch (tier) {
      case 'HIGH':
        return 8;
      case 'STANDARD':
        return 5;
      case 'FALLBACK':
        return 2;
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;
    try {
      setCreating(true);
      setFeedback(null);

      const priorityVal = getPriorityNumber(priorityTier);

      const res = await fetch(`/api/v1/companies/${activeCompany.id}/routing-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          department,
          categoryTag: categoryTag.trim().toUpperCase() || undefined,
          priority: priorityVal,
          targetUserId: targetUserId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create routing rule');
      }

      setFeedback({
        type: 'success',
        text: `Smart rule created! Inbound proposals matching "${categoryTag || department}" will auto-route to ${department}.`,
      });
      setCategoryTag('');
      setTargetUserId('');
      setPriorityTier('HIGH');
      await fetchCompanyAndRules();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error creating routing rule' });
    } finally {
      setCreating(false);
    }
  };

  const handleApplyRecipe = async (recipe: typeof STARTER_RECIPES[0]) => {
    if (!activeCompany) return;
    try {
      setCreating(true);
      setFeedback(null);

      const res = await fetch(`/api/v1/companies/${activeCompany.id}/routing-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          department: recipe.department,
          categoryTag: recipe.categoryTag,
          priority: recipe.priorityNum,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create recipe rule');
      }

      setFeedback({
        type: 'success',
        text: `Preset applied! "${recipe.title}" is now active and routing incoming opportunities.`,
      });
      await fetchCompanyAndRules();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error applying recipe' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!activeCompany) return;
    try {
      setFeedback(null);
      const res = await fetch(`/api/v1/companies/${activeCompany.id}/routing-rules/${ruleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to remove routing rule');
      }
      setFeedback({ type: 'success', text: 'Routing directive removed.' });
      await fetchCompanyAndRules();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error deleting rule' });
    }
  };

  const runSimulation = (query: string) => {
    if (!query.trim()) return;

    const queryUpper = query.toUpperCase();
    // Match against rules ordered by priority
    const matchedRule = rules.find((r) => {
      if (r.categoryTag) {
        const tags = r.categoryTag.split(',').map((t) => t.trim().toUpperCase());
        if (tags.some((t) => queryUpper.includes(t))) return true;
      }
      if (queryUpper.includes(r.department.toUpperCase())) {
        return true;
      }
      return false;
    });

    if (matchedRule) {
      const assignee = teamMembers.find((m) => m.user?.id === matchedRule.targetUserId);
      setSimResult({
        matched: true,
        department: matchedRule.department,
        priority: matchedRule.priority >= 7 ? 'High / Urgent' : matchedRule.priority >= 4 ? 'Standard' : 'Fallback',
        trigger: matchedRule.categoryTag || 'Department Keyword Match',
        assignee: assignee?.user?.profile?.displayName || assignee?.user?.email || `${matchedRule.department} Team Pool`,
      });
    } else {
      setSimResult({
        matched: false,
        department: 'Primary Organization Administrator Desk',
        priority: 'Default Fallback',
        trigger: 'Default Company Fallback',
        assignee: 'Primary Company Owner',
      });
    }
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSimulation(simQuery);
  };

  const toggleKeywordChip = (chip: string) => {
    const existing = categoryTag
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    if (existing.includes(chip)) {
      setCategoryTag(existing.filter((k) => k !== chip).join(', '));
    } else {
      setCategoryTag([...existing, chip].join(', '));
    }
  };

  if (loading && !activeCompany) {
    return (
      <div className="py-20 text-center text-xs text-text-muted">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
        Loading organization routing switchboard...
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="py-20 text-center text-xs text-text-muted">
        No registered company workspace found for this account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Plain-English Switchboard Metaphor */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <GitPullRequest className="w-3 h-3 text-indigo-600" />
              <span>Smart Corporate Switchboard</span>
            </span>
            <span className="text-xs text-text-muted font-mono">{activeCompany.name}</span>
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">Opportunity & Proposal Routing Rules</h1>
          <p className="text-xs text-text-muted mt-0.5 max-w-2xl">
            Automatically direct incoming B2B proposals, tenders, and RFPs to the exact colleagues responsible—so the CEO never acts as an overwhelmed manual receptionist.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/company/team"
            className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-muted border border-border text-xs font-bold text-navy transition-all flex items-center space-x-1.5"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Team Roster & Capacity</span>
          </Link>

          <button
            onClick={fetchCompanyAndRules}
            disabled={loading}
            className="p-2 rounded-xl bg-surface-muted hover:bg-surface border border-border text-xs font-bold text-navy transition-all shadow-2xs"
            title="Refresh Switchboard Rules"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Visual "How It Works" 3-Step Flow Diagram for Layman Users */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-surface to-surface border border-indigo-100 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold text-navy flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>How Inbound Opportunities Travel Through Your Company</span>
          </span>
          <span className="text-[10px] font-bold text-indigo-700 bg-white border border-indigo-200 px-2.5 py-0.5 rounded-full">
            Zero Lost Leads
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="text-xs font-black text-navy">External Discovery</h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                A verified buyer or partner finds your company and sends an RFP, tender, or partnership note.
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="text-xs font-black text-navy">Automated Matching</h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Meshvi reads the proposal's intent & keywords (e.g. "Packaging RFP") and matches your active rules.
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs flex items-start space-x-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="text-xs font-black text-navy">Specialist Desk Delivered</h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Routed immediately to your Sourcing or Sales Lead's desk with an instant Deal Room created.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-text-muted hover:text-navy">
            ✕
          </button>
        </div>
      )}

      {/* 3. 1-Click "Smart Starter Recipes" Strip */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-navy flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>1-Click Starter Switchboards (No Typing Required)</span>
            </h2>
            <p className="text-xs text-text-muted">
              Tap any recipe below to instantly activate standard industry routing for your company.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STARTER_RECIPES.map((recipe) => (
            <div
              key={recipe.title}
              className="bg-surface border border-border hover:border-indigo-300 rounded-2xl p-4 shadow-2xs transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{recipe.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    {recipe.priorityTier}
                  </span>
                </div>
                <h3 className="font-extrabold text-navy text-xs mt-2">{recipe.title}</h3>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{recipe.description}</p>
                <div className="mt-2 text-[10px] font-mono text-indigo-700 bg-surface-muted p-1.5 rounded-lg border border-border">
                  Matches: {recipe.categoryTag}
                </div>
              </div>

              <button
                type="button"
                disabled={creating}
                onClick={() => handleApplyRecipe(recipe)}
                className="w-full py-2 bg-surface hover:bg-indigo-600 text-navy hover:text-white border border-border hover:border-indigo-600 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Activate Preset</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Natural Language "IF -> THEN" Visual Rule Builder & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Visual IF -> THEN Builder (7 Cols) */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-black text-navy flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Custom Rule Builder</span>
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Set up a custom routing rule using simple conversational logic.
              </p>
            </div>
            <span className="text-[10px] font-bold text-text-muted">Conversational Engine</span>
          </div>

          <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
            {/* IF BLOCK */}
            <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 block flex items-center space-x-1">
                <span>1. WHEN</span>
                <span className="text-text-muted font-normal">an incoming proposal mentions any of these keywords:</span>
              </span>

              {/* Clickable Keyword Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_KEYWORDS.map((chip) => {
                  const isSelected = categoryTag
                    .split(',')
                    .map((k) => k.trim().toUpperCase())
                    .includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleKeywordChip(chip)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-surface text-navy border border-border hover:border-indigo-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{chip}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Or type custom keywords, e.g. ASEAN, SOLAR, WHOLESALE..."
                  value={categoryTag}
                  onChange={(e) => setCategoryTag(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-surface border border-border rounded-xl text-xs font-semibold text-navy placeholder:text-text-muted focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>
            </div>

            {/* THEN BLOCK */}
            <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block flex items-center space-x-1">
                <span>2. THEN</span>
                <span className="text-text-muted font-normal">deliver directly to this department desk:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-navy mb-1">Target Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-navy mb-1">
                    Specific Colleague (Optional)
                  </label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium text-navy focus:outline-none focus:border-indigo-600"
                  >
                    <option value="">-- Team Pool (Round-robin) --</option>
                    {teamMembers.map((m) => (
                      <option key={m.user?.id} value={m.user?.id}>
                        {m.user?.profile?.displayName || m.user?.email} ({m.companyRole}) - {m.department || 'Operations'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* PRIORITY TIER BLOCK */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1.5">
                3. Urgency & Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriorityTier('HIGH')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    priorityTier === 'HIGH'
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-black shadow-2xs'
                      : 'bg-surface border-border text-text-muted hover:text-navy'
                  }`}
                >
                  <div className="text-xs">🔴 High Priority</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Urgent RFPs & Deals</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPriorityTier('STANDARD')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    priorityTier === 'STANDARD'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-black shadow-2xs'
                      : 'bg-surface border-border text-text-muted hover:text-navy'
                  }`}
                >
                  <div className="text-xs">🟡 Standard</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Routine Inquiries</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPriorityTier('FALLBACK')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    priorityTier === 'FALLBACK'
                      ? 'bg-slate-100 border-slate-300 text-slate-900 font-black shadow-2xs'
                      : 'bg-surface border-border text-text-muted hover:text-navy'
                  }`}
                >
                  <div className="text-xs">⚪ Fallback</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Catch-all Default</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{creating ? 'Saving Rule...' : 'Save & Activate Routing Directive'}</span>
            </button>
          </form>
        </div>

        {/* Right Col: Live Interactive Simulator (5 Cols) */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-navy flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>1-Click Test Drive Simulator</span>
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Tap any sample inquiry below to test how Meshvi evaluates and routes the proposal in real-time.
            </p>

            {/* Clickable Sample Test Queries */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                Try a Sample Inquiry:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {SAMPLE_SIMULATION_QUERIES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setSimQuery(sample.text);
                      runSimulation(sample.text);
                    }}
                    className="p-2 text-left bg-surface-muted hover:bg-surface border border-border rounded-xl text-navy transition-all"
                  >
                    <div className="text-[11px] font-extrabold text-navy truncate">{sample.label}</div>
                    <div className="text-[9px] text-text-muted truncate mt-0.5">{sample.text}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-2 pt-2">
              <textarea
                rows={3}
                placeholder="Or type your own custom proposal to test..."
                value={simQuery}
                onChange={(e) => setSimQuery(e.target.value)}
                className="w-full px-3 py-2 bg-surface-muted border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                className="w-full py-2 bg-navy hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simulate Switchboard Dispatch</span>
              </button>
            </form>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="p-4 bg-surface-muted border border-border rounded-xl space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-text-muted">Simulation Result:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    simResult.matched ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {simResult.matched ? 'MATCHED DIRECTIVE' : 'DEFAULT ROUTE'}
                </span>
              </div>

              <div className="p-3 bg-white border border-border rounded-xl space-y-1.5 shadow-2xs">
                <div className="text-[10px] text-text-muted uppercase font-bold">Delivered To:</div>
                <div className="text-sm font-black text-navy flex items-center space-x-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>{simResult.department}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-muted pt-1 border-t border-border">
                  <span>
                    Trigger: <strong className="text-navy">{simResult.trigger}</strong>
                  </span>
                  <span>
                    Assignee: <strong className="text-indigo-700">{simResult.assignee}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Active Rules Table & Switchboard Status */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-navy flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Active Department Directives ({rules.length})</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Incoming opportunities evaluate from highest priority to lowest priority.
            </p>
          </div>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {rules.length} Active Directives
          </span>
        </div>

        {rules.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-muted border border-dashed border-border rounded-xl space-y-2">
            <HelpCircle className="w-8 h-8 text-text-muted mx-auto" />
            <p className="font-bold text-navy">No routing rules created yet.</p>
            <p className="max-w-md mx-auto text-[11px]">
              All incoming proposals will currently route to the primary organization administrator. Click any of the 1-click presets above to set up your switchboard in 10 seconds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-border text-[11px] font-bold text-text-muted uppercase">
                <tr>
                  <th className="py-3 px-4">Priority Tier</th>
                  <th className="py-3 px-4">Target Department</th>
                  <th className="py-3 px-4">Trigger Keywords / Intent</th>
                  <th className="py-3 px-4">Assigned Specialist</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rules.map((rule) => {
                  const assignee = teamMembers.find((m) => m.user?.id === rule.targetUserId);
                  const isHigh = rule.priority >= 7;
                  const isMedium = rule.priority >= 4 && rule.priority < 7;

                  return (
                    <tr key={rule.id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isMedium
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isHigh ? 'High (P8)' : isMedium ? 'Standard (P5)' : 'Fallback (P2)'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-navy flex items-center space-x-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{rule.department}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {rule.categoryTag ? (
                          <div className="flex flex-wrap gap-1">
                            {rule.categoryTag.split(',').map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md bg-surface font-mono font-bold text-indigo-700 border border-indigo-100 text-[10px]"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-text-muted italic text-[11px]">All general inquiries</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {assignee ? (
                          <div>
                            <span className="font-extrabold text-navy block">
                              {assignee.user?.profile?.displayName || assignee.user?.email}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {assignee.user?.profile?.currentTitle || assignee.companyRole}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-muted text-[11px] font-semibold">
                            Department Pool (Round-robin)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
