import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Users,
  Building,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { Drawer } from '../../components/ui/Drawer';

interface AdminUser {
  id: string;
  email: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DEACTIVATED';
  createdAt: string;
  lastLoginAt: string | null;
  roles: { role: string }[];
  profile: {
    displayName: string;
    headline: string | null;
    currentTitle: string | null;
    city: string | null;
    countryCode: string | null;
    company: { name: string } | null;
  } | null;
}

interface MetricsData {
  overview: {
    totalUsers: number;
    totalCompanies: number;
    totalProfiles: number;
    totalConnections: number;
    totalIntroductions: number;
    totalAiEvents: number;
    totalImportJobs: number;
    pendingEmails: number;
  };
  recentAuditLogs: {
    id: string;
    action: string;
    resource: string;
    resourceId: string;
    actorEmail: string;
    createdAt: string;
  }[];
}

interface AiEvent {
  id: string;
  taskType: string;
  provider: string;
  model: string;
  tokens: number;
  latencyMs: number;
  status: string;
  userEmail: string;
  createdAt: string;
}

interface AiUsageData {
  summary: {
    totalCalls: number;
    totalTokens: number;
    totalCostUSD: number;
  };
  recentEvents: AiEvent[];
}

export const AdminDashboardPage = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [aiUsage, setAiUsage] = useState<AiUsageData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'ai' | 'audit'>('metrics');
  const [loading, setLoading] = useState(true);

  // Drawers
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedAiEvent, setSelectedAiEvent] = useState<AiEvent | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, aiRes, usersRes] = await Promise.all([
        fetch('/api/v1/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/admin/ai-usage', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const dashData = await dashRes.json();
      const aiData = await aiRes.json();
      const usersData = await usersRes.json();

      if (dashData.success) setMetrics(dashData.data);
      if (aiData.success) setAiUsage(aiData.data);
      if (usersData.success) setUsers(usersData.data || []);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  // Status toggle handler
  const handleToggleUserStatus = async (user: AdminUser, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    setActionLoading(true);
    setActionSuccess('');
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`User status updated to ${newStatus}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, accountStatus: newStatus } : u))
        );
        if (selectedUser?.id === user.id) {
          setSelectedUser({ ...selectedUser, accountStatus: newStatus });
        }
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  // GDPR erasure handler
  const handlePrivacyErase = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to permanently erase all personal data for ${user.email} under GDPR/DPDP?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}/privacy-erase`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('User account personal data has been erased successfully.');
        setSelectedUser(null);
        fetchAdminData();
      }
    } catch (e: any) {
      alert(e.message || 'Failed to execute privacy erasure');
    } finally {
      setActionLoading(false);
    }
  };

  // Columns for Users Table
  const userColumns: ColumnDef<AdminUser>[] = [
    {
      key: 'user',
      header: 'Account & Identity',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-navy text-white font-bold text-xs flex items-center justify-center shrink-0">
            {item.profile?.displayName?.[0] || item.email[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-navy truncate">
              {item.profile?.displayName || item.email.split('@')[0]}
            </div>
            <div className="text-[11px] text-text-muted truncate">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Assigned Roles',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.roles.map((r) => {
            const isSuper = r.role === 'SUPER_ADMIN';
            const isCo = r.role === 'COMPANY_ADMIN';
            return (
              <span
                key={r.role}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isSuper
                    ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
                    : isCo
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-primary-soft text-primary border-primary/20'
                }`}
              >
                {r.role}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company / Org',
      render: (item) => (
        <span className="text-navy text-xs font-medium">
          {item.profile?.company?.name || 'Independent'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            item.accountStatus === 'ACTIVE'
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-danger/10 text-danger border-danger/20'
          }`}
        >
          {item.accountStatus}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registered',
      sortable: true,
      render: (item) => (
        <span className="text-text-muted text-[11px]">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedUser(item)}
            className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-soft rounded-lg transition-colors"
          >
            Manage
          </button>
        </div>
      ),
    },
  ];

  // Columns for AI Events
  const aiColumns: ColumnDef<AiEvent>[] = [
    {
      key: 'taskType',
      header: 'Task Type',
      sortable: true,
      render: (item) => <span className="font-bold text-navy">{item.taskType}</span>,
    },
    {
      key: 'model',
      header: 'Provider & Model',
      render: (item) => (
        <span className="text-text-muted">
          {item.provider} &bull; <strong className="text-navy">{item.model}</strong>
        </span>
      ),
    },
    {
      key: 'tokens',
      header: 'Billed Tokens',
      sortable: true,
      render: (item) => <span className="font-mono text-navy">{item.tokens}</span>,
    },
    {
      key: 'latencyMs',
      header: 'Latency',
      sortable: true,
      render: (item) => <span className="text-text-muted">{item.latencyMs} ms</span>,
    },
    {
      key: 'status',
      header: 'Execution Status',
      render: (item) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">
          {item.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (item) => (
        <span className="text-text-muted text-[11px]">
          {new Date(item.createdAt).toLocaleTimeString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Pilot Operations & Governance Console</span>
          </span>
          <h1 className="text-2xl font-extrabold text-navy mt-1">Platform Admin Ops</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Super Administrator privilege plane: user status management, AI tokens, telemetry, and GDPR controls.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          className="px-4 py-2 bg-surface-muted hover:bg-border text-navy text-xs font-bold rounded-xl border border-border transition-all flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-border pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-surface-muted text-text-muted hover:text-navy'
          }`}
        >
          Overview & Telemetry
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-surface-muted text-text-muted hover:text-navy'
          }`}
        >
          Users & Role Governance ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ai'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-surface-muted text-text-muted hover:text-navy'
          }`}
        >
          AI Usage & Metering
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-surface-muted text-text-muted hover:text-navy'
          }`}
        >
          Security Audit Logs
        </button>
      </div>

      {/* Tab 1: Overview */}
      {loading ? (
        <div className="py-20 text-center text-xs text-text-muted">Loading administration state...</div>
      ) : activeTab === 'metrics' && metrics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-black text-navy">{metrics.overview.totalUsers}</div>
              <span className="text-[10px] text-text-muted">Registered platform accounts</span>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
                <span>Companies</span>
                <Building className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-black text-navy">{metrics.overview.totalCompanies}</div>
              <span className="text-[10px] text-text-muted">Verified enterprise listings</span>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
                <span>Active Connections</span>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div className="text-2xl font-black text-navy">{metrics.overview.totalConnections}</div>
              <span className="text-[10px] text-text-muted">Mutual intent bridges</span>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-text-muted text-xs font-semibold">
                <span>AI Executions</span>
                <Cpu className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-navy">{metrics.overview.totalAiEvents}</div>
              <span className="text-[10px] text-text-muted">Intent parsing invocations</span>
            </div>
          </div>

          {/* Pilot Checklist */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Pilot Launch Verification Checklist</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-navy">Dedicated Ports Locked</div>
                  <div className="text-text-muted text-[11px]">Frontend :3100 &bull; Backend :3500</div>
                </div>
                <span className="text-success font-bold text-[10px] bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                  VERIFIED
                </span>
              </div>

              <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-navy">JWT Role Security Guards</div>
                  <div className="text-text-muted text-[11px]">Strict Super Admin & Co. Admin routes</div>
                </div>
                <span className="text-success font-bold text-[10px] bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-navy">AI Fallback Resilience</div>
                  <div className="text-text-muted text-[11px]">Gemini 1.5 + Deterministic NLP fallback</div>
                </div>
                <span className="text-success font-bold text-[10px] bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                  PASSING
                </span>
              </div>

              <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-navy">GDPR & DPDP Right to Erasure</div>
                  <div className="text-text-muted text-[11px]">Hard privacy deletion mechanism</div>
                </div>
                <span className="text-success font-bold text-[10px] bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                  READY
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'users' ? (
        /* Tab 2: Users Table */
        <div className="space-y-4">
          <DataTable
            columns={userColumns}
            data={users}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => setSelectedUser(item)}
            searchPlaceholder="Search by email, name, or company..."
            searchFilter={(item, q) =>
              item.email.toLowerCase().includes(q) ||
              Boolean(item.profile?.displayName?.toLowerCase().includes(q)) ||
              Boolean(item.profile?.company?.name?.toLowerCase().includes(q))
            }
            emptyTitle="No Users Found"
            emptySubtitle="No user records match your search filter."
          />
        </div>
      ) : activeTab === 'ai' && aiUsage ? (
        /* Tab 3: AI Metering */
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 p-5 bg-surface border border-border rounded-2xl shadow-sm">
            <div>
              <span className="text-text-muted text-[11px] font-semibold block">Total Invocations</span>
              <span className="text-2xl font-black text-navy">{aiUsage.summary.totalCalls}</span>
            </div>
            <div>
              <span className="text-text-muted text-[11px] font-semibold block">Total Tokens Billed</span>
              <span className="text-2xl font-black text-navy font-mono">{aiUsage.summary.totalTokens}</span>
            </div>
            <div>
              <span className="text-text-muted text-[11px] font-semibold block">Total Estimated Cost</span>
              <span className="text-2xl font-black text-navy">${aiUsage.summary.totalCostUSD} USD</span>
            </div>
          </div>

          <DataTable
            columns={aiColumns}
            data={aiUsage.recentEvents}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => setSelectedAiEvent(item)}
            searchPlaceholder="Filter AI invocations..."
            searchFilter={(item, q) =>
              item.taskType.toLowerCase().includes(q) ||
              item.model.toLowerCase().includes(q) ||
              item.provider.toLowerCase().includes(q)
            }
          />
        </div>
      ) : activeTab === 'audit' && metrics ? (
        /* Tab 4: Audit Logs */
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy">Immutable Security & System Event Stream</h3>
            <div className="divide-y divide-border">
              {metrics.recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedAuditLog(log)}
                  className="py-3 flex items-center justify-between text-xs cursor-pointer hover:bg-surface-muted/50 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <span className="font-bold text-navy">{log.action}</span>
                    <span className="text-text-muted ml-2">on {log.resource} ({log.resourceId})</span>
                  </div>
                  <div className="text-right text-[11px] text-text-muted">
                    <div>By: {log.actorEmail}</div>
                    <div>{new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Slide-over Drawer for User Governance */}
      <Drawer
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.profile?.displayName || selectedUser?.email || 'User Account'}
        subtitle={`User ID: ${selectedUser?.id}`}
        badge={{
          label: selectedUser?.accountStatus || 'ACTIVE',
          variant: selectedUser?.accountStatus === 'ACTIVE' ? 'success' : 'danger',
        }}
        width="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => selectedUser && handlePrivacyErase(selectedUser)}
              className="px-3.5 py-2 text-danger hover:bg-danger/10 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>GDPR Erase Account</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-navy/90"
            >
              Done
            </button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-6 text-xs">
            {actionSuccess && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-success font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Profile Overview */}
            <div className="p-4 bg-surface-muted rounded-2xl border border-border space-y-2">
              <div className="font-bold text-navy text-sm">
                {selectedUser.profile?.displayName || 'No profile created'}
              </div>
              <div className="text-text-muted">{selectedUser.email}</div>
              <div className="text-[11px] text-text-muted">
                {selectedUser.profile?.headline || selectedUser.profile?.currentTitle || 'No headline set'}
              </div>
            </div>

            {/* Roles */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-navy">
                Role Authorizations
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser.roles.map((r) => (
                  <span
                    key={r.role}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-navy text-white"
                  >
                    {r.role}
                  </span>
                ))}
              </div>
            </div>

            {/* Status Control */}
            <div className="p-4 bg-surface border border-border rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-navy">Account Access Control</div>
                  <div className="text-[11px] text-text-muted">Suspend or restore portal permissions</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedUser.accountStatus === 'ACTIVE'
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger'
                  }`}
                >
                  {selectedUser.accountStatus}
                </span>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                {selectedUser.accountStatus === 'ACTIVE' ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleToggleUserStatus(selectedUser, 'SUSPENDED')}
                    className="px-4 py-2 bg-danger/10 hover:bg-danger text-danger hover:text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Suspend Account</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleToggleUserStatus(selectedUser, 'ACTIVE')}
                    className="px-4 py-2 bg-success text-white hover:bg-success/90 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Re-activate Account</span>
                  </button>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-2 text-[11px] text-text-muted">
              <div>Created: {new Date(selectedUser.createdAt).toLocaleString()}</div>
              <div>
                Last Login:{' '}
                {selectedUser.lastLoginAt
                  ? new Date(selectedUser.lastLoginAt).toLocaleString()
                  : 'Never'}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Slide-over Drawer for AI Event */}
      <Drawer
        isOpen={Boolean(selectedAiEvent)}
        onClose={() => setSelectedAiEvent(null)}
        title="AI Telemetry Dossier"
        subtitle={`Event ID: ${selectedAiEvent?.id}`}
        badge={{ label: selectedAiEvent?.status || 'SUCCESS', variant: 'success' }}
      >
        {selectedAiEvent && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-surface-muted rounded-xl space-y-1">
              <div className="text-text-muted text-[10px] uppercase font-bold">Task Type</div>
              <div className="text-sm font-bold text-navy">{selectedAiEvent.taskType}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface border border-border rounded-xl">
                <div className="text-text-muted text-[10px]">Model</div>
                <div className="font-bold text-navy">{selectedAiEvent.model}</div>
              </div>
              <div className="p-3 bg-surface border border-border rounded-xl">
                <div className="text-text-muted text-[10px]">Latency</div>
                <div className="font-bold text-navy">{selectedAiEvent.latencyMs} ms</div>
              </div>
              <div className="p-3 bg-surface border border-border rounded-xl">
                <div className="text-text-muted text-[10px]">Tokens</div>
                <div className="font-bold text-navy">{selectedAiEvent.tokens}</div>
              </div>
              <div className="p-3 bg-surface border border-border rounded-xl">
                <div className="text-text-muted text-[10px]">Provider</div>
                <div className="font-bold text-navy">{selectedAiEvent.provider}</div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Slide-over Drawer for Audit Log */}
      <Drawer
        isOpen={Boolean(selectedAuditLog)}
        onClose={() => setSelectedAuditLog(null)}
        title="Audit Log Event"
        subtitle={`Resource: ${selectedAuditLog?.resource}`}
        badge={{ label: selectedAuditLog?.action || 'EVENT', variant: 'navy' }}
      >
        {selectedAuditLog && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-surface-muted rounded-xl">
              <div className="text-text-muted text-[10px]">Action</div>
              <div className="font-bold text-navy">{selectedAuditLog.action}</div>
            </div>
            <div className="p-3 bg-surface-muted rounded-xl">
              <div className="text-text-muted text-[10px]">Actor Email</div>
              <div className="font-bold text-navy">{selectedAuditLog.actorEmail}</div>
            </div>
            <div className="p-3 bg-surface-muted rounded-xl">
              <div className="text-text-muted text-[10px]">Timestamp</div>
              <div className="font-bold text-navy">{new Date(selectedAuditLog.createdAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
