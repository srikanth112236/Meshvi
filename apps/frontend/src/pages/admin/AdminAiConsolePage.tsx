import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Cpu,
  Play,
  RotateCcw,
  AlertTriangle,
  Zap,
  Clock,
  Coins,
  ShieldCheck,
  FileCode,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export const AdminAiConsolePage = () => {
  const { token } = useAuth();
  const [telemetry, setTelemetry] = useState<any | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(true);

  // Diagnostic sandbox states
  const [query, setQuery] = useState('Looking for senior procurement directors in FMCG beverages across Singapore and Malaysia');
  const [providerOverride, setProviderOverride] = useState<'gemini' | 'fallback'>('gemini');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const fetchTelemetry = async () => {
    try {
      setTelemetryLoading(true);
      const res = await fetch('/api/v1/admin/ai-governance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setTelemetry(json.data);
      }
    } catch (err: any) {
      console.error('Failed to load AI telemetry:', err);
    } finally {
      setTelemetryLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [token]);

  const handleRunDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/v1/ai/sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: query.trim(),
          providerOverride,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Diagnostic run failed.');
      }

      setResult(data.data);
      // Refresh telemetry stats as well
      fetchTelemetry();
    } catch (err: any) {
      setError(err.message || 'Error running AI sandbox diagnostic.');
    } finally {
      setLoading(false);
    }
  };

  const rawSummary = telemetry?.summary || {};
  const summary = {
    totalCalls: rawSummary.totalCalls ?? 0,
    totalTokens: rawSummary.totalTokens ?? 0,
    promptTokens: rawSummary.promptTokens ?? rawSummary.totalInputTokens ?? 0,
    completionTokens: rawSummary.completionTokens ?? rawSummary.totalOutputTokens ?? 0,
    totalCostUSD: rawSummary.totalCostUSD ?? rawSummary.estimatedCostUsd ?? 0,
    avgLatencyMs: rawSummary.avgLatencyMs ?? 0,
    p95LatencyMs: rawSummary.p95LatencyMs ?? 0,
    successRate: rawSummary.successRate ?? 100,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-amber-600" />
            <span>Enterprise LLM Telemetry & Cost Control</span>
          </span>
          <h1 className="text-2xl font-extrabold text-navy mt-1">Platform-Wide AI Command Center</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time multi-tenant token consumption, provider latency distribution, budget guardrails, and deterministic fallback diagnostics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchTelemetry}
            disabled={telemetryLoading}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-surface-muted hover:bg-surface border border-border text-xs font-bold text-navy transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${telemetryLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Cost & Token Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total LLM Calls</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-navy">{summary.totalCalls.toLocaleString()}</div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-600 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>{summary.successRate}% Success Rate</span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tokens</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-navy">{summary.totalTokens.toLocaleString()}</div>
          <p className="text-[11px] text-text-muted mt-1">
            In: {summary.promptTokens.toLocaleString()} | Out: {summary.completionTokens.toLocaleString()}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">${summary.totalCostUSD.toFixed(4)}</div>
          <p className="text-[11px] text-text-muted mt-1">Blended rate ($0.15/1M tokens)</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg / P95 Latency</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">
            {summary.avgLatencyMs}ms <span className="text-sm font-normal text-text-muted">/ {summary.p95LatencyMs}ms</span>
          </div>
          <p className="text-[11px] text-text-muted mt-1">Zero timeout policy</p>
        </div>
      </div>

      {/* Provider & Task Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-navy flex items-center space-x-2 mb-3">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Inference Provider Breakdown</span>
          </h2>
          <div className="space-y-2">
            {telemetry?.distribution?.providers?.length > 0 ? (
              telemetry.distribution.providers.map((p: any) => (
                <div key={p.name} className="flex items-center justify-between p-2.5 bg-surface-muted rounded-xl text-xs font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-bold text-navy">{p.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-surface font-mono font-bold text-text-muted border border-border">
                    {p.count} calls
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted italic">No inference events recorded yet.</p>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-navy flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Task Workload Distribution</span>
          </h2>
          <div className="space-y-2">
            {telemetry?.distribution?.tasks?.length > 0 ? (
              telemetry.distribution.tasks.map((t: any) => (
                <div key={t.type} className="flex items-center justify-between p-2.5 bg-surface-muted rounded-xl text-xs font-medium">
                  <span className="font-bold text-navy">{t.type}</span>
                  <span className="px-2 py-0.5 rounded-md bg-surface font-mono font-bold text-text-muted border border-border">
                    {t.count} tasks
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted italic">No task breakdown available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Sandbox Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-sm font-bold text-navy flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Interactive Multi-Provider Diagnostic Sandbox</span>
          </h2>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-text-muted">Target Provider:</span>
            <select
              value={providerOverride}
              onChange={(e) => setProviderOverride(e.target.value as any)}
              className="px-2.5 py-1 bg-surface-muted border border-border rounded-lg text-xs font-bold text-navy focus:outline-none"
            >
              <option value="gemini">Google Gemini 1.5 Flash</option>
              <option value="fallback">Deterministic Fallback NLP</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRunDiagnostic} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
              Input Natural Language Query
            </label>
            <textarea
              rows={3}
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-xs text-navy font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="e.g. Sourcing partners for organic tea in Malaysia..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Telemetry Test...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Live Inference Test</span>
              </>
            )}
          </button>
        </form>

        {/* Telemetry Result */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-border animate-in fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-surface-muted rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold block flex items-center space-x-1">
                  <Cpu className="w-3 h-3 text-amber-600" />
                  <span>Provider Used</span>
                </span>
                <span className="text-sm font-extrabold text-navy">
                  {result.result?.provider || 'Unknown'}
                </span>
              </div>

              <div className="p-3 bg-surface-muted rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold block flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Latency</span>
                </span>
                <span className="text-sm font-extrabold text-navy">{result.latencyMs} ms</span>
              </div>

              <div className="p-3 bg-surface-muted rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold block flex items-center space-x-1">
                  <Coins className="w-3 h-3 text-amber-600" />
                  <span>Tokens Billed</span>
                </span>
                <span className="text-sm font-extrabold text-navy font-mono">
                  {(result.result?.inputTokens || 0) + (result.result?.outputTokens || 0)}
                </span>
              </div>

              <div className="p-3 bg-surface-muted rounded-xl border border-border">
                <span className="text-[10px] text-text-muted font-bold block flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Status</span>
                </span>
                <span className="text-sm font-extrabold text-emerald-700">{result.status}</span>
              </div>
            </div>

            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-2">
              <span className="text-xs font-bold text-navy flex items-center space-x-1.5">
                <FileCode className="w-4 h-4 text-amber-600" />
                <span>Extracted Intent JSON Payload</span>
              </span>
              <pre className="text-[11px] font-mono text-navy/80 bg-surface p-3 rounded-lg border border-border overflow-x-auto">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Live AI Audit Trail */}
      {telemetry?.recentEvents && telemetry.recentEvents.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-navy flex items-center space-x-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Recent AI Inference Audit Stream</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted border-b border-border text-[11px] font-bold text-text-muted uppercase">
                <tr>
                  <th className="py-2.5 px-3">Task Type</th>
                  <th className="py-2.5 px-3">Provider / Model</th>
                  <th className="py-2.5 px-3">Tokens</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {telemetry.recentEvents.map((evt: any) => (
                  <tr key={evt.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-navy">{evt.taskType}</td>
                    <td className="py-2.5 px-3 text-text-muted">
                      {evt.provider} / <span className="font-mono text-[10px]">{evt.model}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-navy">{evt.tokens}</td>
                    <td className="py-2.5 px-3 font-mono">{evt.latencyMs}ms</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          evt.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-text-muted font-mono text-[11px]">{evt.userEmail}</td>
                    <td className="py-2.5 px-3 text-text-muted">{new Date(evt.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
