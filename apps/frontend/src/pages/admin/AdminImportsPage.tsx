import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  Play,
  ShieldCheck,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { Drawer } from '../../components/ui/Drawer';

interface ImportJob {
  id: string;
  importType: string;
  fileName: string;
  status: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows: number;
  failedRows: number;
  createdAt: string;
  completedAt?: string;
  dataSource?: {
    name: string;
    providerKey: string;
    sourceType: string;
  };
}

export const AdminImportsPage = () => {
  const { token } = useAuth();
  const [importType, setImportType] = useState<'COMPANIES' | 'PROFESSIONALS'>('COMPANIES');
  const [fileName, setFileName] = useState('companies_batch_1.csv');
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [executeResult, setExecuteResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);

  // Load standard template
  const loadTemplate = async (type: 'COMPANIES' | 'PROFESSIONALS') => {
    try {
      const res = await fetch(`/api/v1/imports/template?type=${type}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCsvContent(data.data.sampleCsv);
        setFileName(type === 'COMPANIES' ? 'companies_sample.csv' : 'professionals_sample.csv');
      }
    } catch {
      // Ignored
    }
  };

  const fetchJobs = async () => {
    if (token) {
      try {
        const res = await fetch('/api/v1/imports', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setJobs(data.data || []);
        }
      } catch {
        // Ignored
      }
    }
  };

  useEffect(() => {
    loadTemplate('COMPANIES');
    fetchJobs();
  }, [token]);

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;
    setLoading(true);
    setError('');
    setPreviewData(null);
    setExecuteResult(null);

    try {
      const res = await fetch('/api/v1/imports/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          importType,
          fileName,
          csvContent,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Preview failed.');
      }

      setPreviewData(data.data);
      fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Error executing dry run.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!previewData?.jobId) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/imports/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: previewData.jobId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Execution failed.');
      }

      setExecuteResult(data.data);
      fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Error executing import.');
    } finally {
      setLoading(false);
    }
  };

  const jobColumns: ColumnDef<ImportJob>[] = [
    {
      key: 'fileName',
      header: 'Payload & Type',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-bold text-navy">{item.fileName}</div>
          <div className="text-[11px] text-text-muted">{item.importType}</div>
        </div>
      ),
    },
    {
      key: 'provider',
      header: 'Data Source',
      render: (item) => (
        <span className="text-text-muted text-xs">
          {item.dataSource?.providerKey || 'CSV_DIRECT'}
        </span>
      ),
    },
    {
      key: 'rows',
      header: 'Rows Ingested',
      render: (item) => (
        <div className="font-mono text-xs">
          <strong className="text-success">{item.importedRows}</strong> / {item.totalRows}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Job Status',
      sortable: true,
      render: (item) => {
        const isComplete = item.status === 'COMPLETED';
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isComplete
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
            }`}
          >
            {item.status}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (item) => (
        <span className="text-text-muted text-[11px]">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <button
          type="button"
          onClick={() => setSelectedJob(item)}
          className="px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
        >
          Inspect
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>Admin Data Provenance & Ingestion Engine</span>
          </span>
          <h1 className="text-2xl font-extrabold text-navy mt-1">Controlled Bulk Ingestion</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Two-phase batch ingestion: mandatory dry-run validation with formula injection sanitization.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchJobs}
          className="px-4 py-2 bg-surface-muted hover:bg-border text-navy text-xs font-bold rounded-xl border border-border transition-all flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Upload & Preview Interface */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-navy">Entity Type:</span>
            <div className="flex rounded-xl bg-surface-muted p-1 border border-border">
              <button
                type="button"
                onClick={() => {
                  setImportType('COMPANIES');
                  loadTemplate('COMPANIES');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  importType === 'COMPANIES'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-text-muted hover:text-navy'
                }`}
              >
                Companies
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportType('PROFESSIONALS');
                  loadTemplate('PROFESSIONALS');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  importType === 'PROFESSIONALS'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-text-muted hover:text-navy'
                }`}
              >
                Professionals
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadTemplate(importType)}
            className="inline-flex items-center space-x-1.5 text-xs text-amber-700 hover:underline font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Reset Standard Template</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-danger/10 border border-danger/20 rounded-xl flex items-center space-x-2 text-xs text-danger">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePreview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
              Source File Name
            </label>
            <input
              type="text"
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-border rounded-xl text-xs text-navy font-mono focus:ring-2 focus:ring-focus focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
              Raw CSV Payload (Direct Input or Paste)
            </label>
            <textarea
              required
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-xs font-mono text-navy focus:ring-2 focus:ring-focus focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'Validating CSV...' : 'Run Phase 1: Dry-Run Validation'}</span>
            </button>
          </div>
        </form>

        {/* Phase 1 Dry-Run Results */}
        {previewData && (
          <div className="p-5 bg-surface-muted rounded-2xl border border-border space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="font-extrabold text-navy text-sm">Dry-Run Preview Report</div>
              <span className="text-[10px] font-mono text-text-muted">Job ID: {previewData.jobId}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-surface rounded-xl border border-border">
                <span className="text-text-muted block text-[10px]">Total Rows</span>
                <span className="text-lg font-extrabold text-navy">{previewData.totalRows}</span>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-border">
                <span className="text-text-muted block text-[10px]">Valid & Clean</span>
                <span className="text-lg font-extrabold text-success">{previewData.validRows}</span>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-border">
                <span className="text-text-muted block text-[10px]">Invalid Rows</span>
                <span className="text-lg font-extrabold text-danger">{previewData.invalidRows}</span>
              </div>
            </div>

            {/* Execute Batch Action */}
            <div className="p-4 bg-primary-soft/40 border border-primary/20 rounded-xl flex items-center justify-between">
              <div className="text-xs text-navy">
                <ShieldCheck className="w-4 h-4 text-primary inline mr-1" />
                <span>Ready to commit <strong>{previewData.validRows}</strong> validated records.</span>
              </div>
              <button
                type="button"
                onClick={handleExecute}
                disabled={loading || previewData.validRows === 0}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm disabled:opacity-50 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Phase 2: Execute Batch Ingestion</span>
              </button>
            </div>
          </div>
        )}

        {executeResult && (
          <div className="p-4 bg-success/10 border border-success/30 rounded-xl flex items-center space-x-3 text-xs text-navy">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
            <div>
              <strong>{executeResult.message}</strong>
              <p className="text-text-muted mt-0.5">
                Committed {executeResult.job?.importedRows} record(s) to system database.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Historical Jobs Table with Pagination */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-navy flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Historical Batch Ingestion Runs ({jobs.length})</span>
        </h3>

        <DataTable
          columns={jobColumns}
          data={jobs}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => setSelectedJob(item)}
          searchPlaceholder="Search history by filename or type..."
          searchFilter={(item, q) =>
            item.fileName.toLowerCase().includes(q) ||
            item.importType.toLowerCase().includes(q)
          }
          emptyTitle="No Import Jobs"
          emptySubtitle="No batch ingestion jobs have been run yet."
        />
      </div>

      {/* Slide-over Drawer for Job Inspection */}
      <Drawer
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.fileName || 'Ingestion Job Details'}
        subtitle={`Job ID: ${selectedJob?.id}`}
        badge={{
          label: selectedJob?.status || 'UPLOADED',
          variant: selectedJob?.status === 'COMPLETED' ? 'success' : 'warning',
        }}
        width="lg"
        footer={
          <button
            type="button"
            onClick={() => setSelectedJob(null)}
            className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        }
      >
        {selectedJob && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-surface-muted rounded-2xl border border-border space-y-2">
              <div className="font-extrabold text-navy text-sm">{selectedJob.fileName}</div>
              <div className="text-text-muted">Target Entity: {selectedJob.importType}</div>
              <div className="text-[11px] text-text-muted">
                Source: {selectedJob.dataSource?.providerKey || 'CSV_IMPORT'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface border border-border rounded-xl">
                <span className="text-text-muted block text-[10px]">Total Rows</span>
                <span className="text-base font-bold text-navy">{selectedJob.totalRows}</span>
              </div>
              <div className="p-3 bg-surface border border-border rounded-xl">
                <span className="text-text-muted block text-[10px]">Imported Successfully</span>
                <span className="text-base font-bold text-success">{selectedJob.importedRows}</span>
              </div>
              <div className="p-3 bg-surface border border-border rounded-xl">
                <span className="text-text-muted block text-[10px]">Failed Rows</span>
                <span className="text-base font-bold text-danger">{selectedJob.failedRows}</span>
              </div>
              <div className="p-3 bg-surface border border-border rounded-xl">
                <span className="text-text-muted block text-[10px]">Validated Rows</span>
                <span className="text-base font-bold text-navy">{selectedJob.validRows}</span>
              </div>
            </div>

            <div className="text-[11px] text-text-muted space-y-1">
              <div>Created: {new Date(selectedJob.createdAt).toLocaleString()}</div>
              {selectedJob.completedAt && (
                <div>Completed: {new Date(selectedJob.completedAt).toLocaleString()}</div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
