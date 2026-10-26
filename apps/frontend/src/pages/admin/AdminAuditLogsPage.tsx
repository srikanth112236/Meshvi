import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Activity,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { Drawer } from '../../components/ui/Drawer';

interface AuditLogRecord {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  user?: {
    email: string;
  };
  metadata?: string;
  createdAt: string;
}

export const AdminAuditLogsPage = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/v1/admin/audit-logs?limit=300', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.data);
      }
    } catch {
      // Non-fatal fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  // Live Auto-Refresh Stream every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, token]);

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['Log ID', 'Action', 'Resource', 'Resource ID', 'Actor Email', 'Timestamp', 'Metadata'];
    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.action}"`,
      `"${l.resource}"`,
      `"${l.resourceId || ''}"`,
      `"${l.user?.email || 'SYSTEM'}"`,
      `"${new Date(l.createdAt).toISOString()}"`,
      `"${(l.metadata || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Meshvi-audit-log-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    if (logs.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Meshvi-audit-log-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<AuditLogRecord>[] = [
    {
      key: 'action',
      header: 'Event & Action',
      sortable: true,
      render: (l: AuditLogRecord) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="font-mono text-xs font-bold text-navy">{l.action}</span>
            <div className="text-[10px] text-text-muted">Target: {l.resource}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'actor',
      header: 'Actor / Admin',
      sortable: true,
      render: (l: AuditLogRecord) => (
        <div className="space-y-0.5">
          <div className="text-xs font-mono text-navy truncate">{l.user?.email || 'SYSTEM AUTOMATION'}</div>
          <div className="text-[10px] text-text-muted font-mono">
            {l.userId ? `ID: ${l.userId.slice(0, 8)}...` : 'Kernel Worker'}
          </div>
        </div>
      ),
    },
    {
      key: 'resourceId',
      header: 'Resource ID',
      render: (l: AuditLogRecord) => (
        <span className="font-mono text-[11px] text-text-muted">
          {l.resourceId ? `${l.resourceId.slice(0, 16)}...` : 'N/A'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (l: AuditLogRecord) => (
        <div className="text-xs font-mono text-text-muted">
          {new Date(l.createdAt).toLocaleString()}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
              Admin Ops
            </span>
            <span className="text-xs text-text-muted flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immutable Institutional Audit Trail</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">Audit Logs & Compliance Export</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Tamper-evident system activity log capturing administrative decisions, domain claims, AI invocations, and privacy erasures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live Auto-Refresh Toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-surface-muted text-text-muted border-border'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{autoRefresh ? 'Live Stream On' : 'Live Stream Paused'}</span>
          </button>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-surface hover:bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export Dropdown / Actions */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-navy hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-surface-muted hover:bg-surface border border-border rounded-xl text-xs font-bold text-navy transition-all shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <DataTable
        data={logs}
        columns={columns}
        keyExtractor={(l) => l.id}
        searchPlaceholder="Filter audit records by action or actor..."
        emptyTitle="No audit log events recorded yet"
        onRowClick={(l) => setSelectedLog(l)}
      />

      {/* Audit Detail Drawer */}
      <Drawer
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={selectedLog?.action || 'Event Details'}
        subtitle={`Log ID: ${selectedLog?.id}`}
        width="md"
      >
        {selectedLog && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Action:</span>
                <span className="font-mono font-bold text-navy">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Target Resource:</span>
                <span className="font-semibold text-navy">{selectedLog.resource}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Actor:</span>
                <span className="font-mono text-navy">{selectedLog.user?.email || 'SYSTEM'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Recorded At:</span>
                <span className="font-mono text-text-muted">{new Date(selectedLog.createdAt).toISOString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Audit Payload & Metadata (JSON)
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
                {selectedLog.metadata
                  ? JSON.stringify(JSON.parse(selectedLog.metadata), null, 2)
                  : '// No additional payload captured'}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
