import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Users,
  Building2,
  Briefcase,
  Mail,
  Send,
  CheckCircle2,
  Table as TableIcon,
  LayoutGrid,
  MessageSquare,
  Calendar,
  ExternalLink,
  Handshake,
  ShieldCheck,
  Download,
  Inbox,
  ArrowUpRight,
  Forward,
  XCircle,
  Clock,
  Search,
  UserMinus,
  Phone,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { DelegateToColleagueModal } from '../../components/ui/DelegateToColleagueModal';
import { DeclineReasonModal } from '../../components/ui/DeclineReasonModal';
import { IgnoreReasonModal } from '../../components/ui/IgnoreReasonModal';
import { AcceptAndConnectModal } from '../../components/ui/AcceptAndConnectModal';

interface ActiveConnection {
  id: string;
  businessReason: string;
  status: string;
  connectedAt: string;
  partner: {
    userId: string;
    fullName: string;
    headline: string | null;
    function: string | null;
    companyName: string | null;
    profileId: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  };
}

interface RequestItem {
  id: string;
  businessReason: string;
  status: string;
  createdAt: string;
  followUpDate?: string;
  reminderNote?: string;
  delegatedFromUserId?: string;
  delegationNote?: string;
  requester?: {
    id: string;
    email: string;
    profile?: {
      displayName: string;
      headline: string | null;
      function: string | null;
      company?: { name: string } | null;
    } | null;
  };
  recipientProfile?: {
    displayName: string;
    headline: string | null;
    function: string | null;
    company?: { name: string } | null;
  };
}

interface QuotaState {
  limit: number;
  used: number;
  remaining: number;
  canConnect: boolean;
  isVerified: boolean;
  resetsInDays?: number;
}

export const ConnectionsPage = () => {
  const { token } = useAuth();
  const { notifications, showToast } = useNotifications();
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'CONNECTIONS' | 'INCOMING' | 'OUTGOING'>('CONNECTIONS');

  // Data states
  const [connections, setConnections] = useState<ActiveConnection[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<RequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<RequestItem[]>([]);
  const [quota, setQuota] = useState<QuotaState | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedConnection, setSelectedConnection] = useState<ActiveConnection | null>(null);

  // Modal triage targets
  const [acceptModalTarget, setAcceptModalTarget] = useState<RequestItem | null>(null);
  const [delegateModalTarget, setDelegateModalTarget] = useState<RequestItem | null>(null);
  const [declineModalTarget, setDeclineModalTarget] = useState<RequestItem | null>(null);
  const [ignoreModalTarget, setIgnoreModalTarget] = useState<RequestItem | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [connRes, reqRes, quotaRes] = await Promise.all([
        fetch('/api/v1/connections', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/v1/connections/requests', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/v1/connections/quota', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const connData = await connRes.json();
      if (connRes.ok && connData.success) {
        setConnections(connData.data || []);
      }

      const reqData = await reqRes.json();
      if (reqRes.ok && reqData.success) {
        setIncomingRequests(reqData.data?.incoming || []);
        setOutgoingRequests(reqData.data?.outgoing || []);
      }

      const quotaData = await quotaRes.json();
      if (quotaRes.ok && quotaData.data) {
        setQuota(quotaData.data);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  // Intelligently auto-open INCOMING or OUTGOING if user has no active 1st-degree connections yet
  useEffect(() => {
    if (!loading && connections.length === 0 && activeTab === 'CONNECTIONS') {
      if (incomingRequests.length > 0) {
        setActiveTab('INCOMING');
      } else if (outgoingRequests.length > 0) {
        setActiveTab('OUTGOING');
      }
    }
  }, [loading, connections.length, incomingRequests.length, outgoingRequests.length]);

  // Real-time synchronization via SSE
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (['CONNECTION_ACCEPTED', 'CONNECTION_REQUEST', 'INTRO_ACCEPTED'].includes(latest.type)) {
        fetchAllData();
      }
    }
  }, [notifications]);

  // Filtered connections based on local search
  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return connections;
    const q = searchQuery.toLowerCase().trim();
    return connections.filter(
      (c) =>
        c.partner.fullName.toLowerCase().includes(q) ||
        (c.partner.companyName && c.partner.companyName.toLowerCase().includes(q)) ||
        (c.partner.function && c.partner.function.toLowerCase().includes(q)) ||
        c.businessReason.toLowerCase().includes(q)
    );
  }, [connections, searchQuery]);

  // Download vCard helper
  const handleDownloadVCard = (conn: ActiveConnection) => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${conn.partner.fullName}\nORG:${conn.partner.companyName || 'Independent'}\nTITLE:${conn.partner.headline || conn.partner.function || ''}\nNOTE:Connected via Meshvi - Business Intent: ${conn.businessReason}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conn.partner.fullName.replace(/\s+/g, '_')}_Setu.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({
      title: 'vCard Exported',
      message: `Downloaded contact card for ${conn.partner.fullName}.`,
      type: 'info',
    });
  };

  const handleDisconnect = async (connectionId: string, partnerName: string) => {
    if (!token) return;
    const confirm = window.confirm(
      `Are you sure you want to disconnect from ${partnerName}? Both parties will be disconnected and can reconnect at any time.`
    );
    if (!confirm) return;

    try {
      const res = await fetch(`/api/v1/connections/${connectionId}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        showToast({
          title: 'Connection Disconnected',
          message: `You have cleanly disconnected from ${partnerName}.`,
          type: 'info',
        });
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
        if (selectedConnection?.id === connectionId) setSelectedConnection(null);
      }
    } catch {
      showToast({
        title: 'Error',
        message: 'Failed to disconnect connection.',
        type: 'error',
      });
    }
  };

  // Columns for DataTable
  const columns: ColumnDef<ActiveConnection>[] = [
    {
      key: 'partner',
      header: 'Professional Contact',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-navy text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {item.partner.fullName[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-bold text-navy hover:text-primary transition-colors">
              {item.partner.fullName}
            </div>
            <div className="text-[11px] text-text-muted line-clamp-1 max-w-xs">
              {item.partner.headline || item.partner.function || 'Industry Professional'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company / Org',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-1.5 text-xs text-navy font-semibold">
          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{item.partner.companyName || 'Independent'}</span>
        </div>
      ),
    },
    {
      key: 'function',
      header: 'Function',
      render: (item) => (
        <span className="text-text-muted text-xs">
          {item.partner.function || 'General Management'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Relationship Tenure',
      render: (item) => {
        const days = Math.max(
          0,
          Math.floor((Date.now() - new Date(item.connectedAt).getTime()) / (1000 * 60 * 60 * 24))
        );
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />
            <span>Connected &bull; {days === 0 ? 'Today' : `${days}d`}</span>
          </span>
        );
      },
    },
    {
      key: 'connectedAt',
      header: 'Connected Date',
      sortable: true,
      render: (item) => (
        <span className="text-text-muted text-[11px]">
          {new Date(item.connectedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Quick Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleDownloadVCard(item)}
            className="p-1.5 text-text-muted hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Download vCard (.vcf)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/deal-rooms')}
            className="p-1.5 text-text-muted hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
            title="Open Deal Rooms"
          >
            <Handshake className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const partner = item.partner;
              const pId = partner.userId;
              const pName = partner.fullName;
              const pComp = partner.companyName || '';
              const pRole = partner.headline || partner.function || '';
              navigate(`/app/messages?userId=${pId}&name=${encodeURIComponent(pName)}&company=${encodeURIComponent(pComp)}&role=${encodeURIComponent(pRole)}`);
            }}
            className="p-1.5 text-text-muted hover:text-navy hover:bg-surface-muted rounded-lg transition-colors"
            title="Open Direct Chat"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDisconnect(item.id, item.partner.fullName)}
            className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Remove / Disconnect Connection"
          >
            <UserMinus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedConnection(item)}
            className="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary-soft rounded-lg transition-colors ml-1"
          >
            Dossier
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Professional Network Directory</span>
          </span>
          <h1 className="text-2xl font-black text-navy mt-1 tracking-tight">Connections Hub</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Verified direct connections, inbound executive proposals, and relationship channels.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            to="/app/search"
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Find Contacts</span>
          </Link>
        </div>
      </div>

      {/* Quota & Governance Strip */}
      {quota && (
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-navy">Anti-Spam Outreach Allowance</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {quota.isVerified ? 'Verified Executive' : 'Standard Quota'}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-0.5">
                Rolling 7-day governance limits to ensure prompt response times and zero executive spam.
              </p>
            </div>
          </div>

          <div className="bg-bg border border-border rounded-xl px-3.5 py-2 min-w-[200px] shrink-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-text-muted text-[10px] font-semibold">Weekly Capacity</span>
              <span className="font-extrabold text-navy text-[11px]">
                {quota.used} / {quota.limit} used
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  quota.remaining === 0 ? 'bg-danger' : quota.remaining <= 2 ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, (quota.used / Math.max(1, quota.limit)) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-text-muted mt-1 block">
              {quota.remaining} slots available this cycle
            </span>
          </div>
        </div>
      )}

      {/* 3 Status KPI Metric Cards: Active, Pending Inbound, Sent Outgoing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          type="button"
          onClick={() => setActiveTab('CONNECTIONS')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'CONNECTIONS'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/40 shadow-xs'
              : 'bg-surface border-border hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Connections</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Verified
            </span>
          </div>
          <div className="text-2xl font-black text-navy mt-1.5">{connections.length}</div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Direct 1st-degree business relationships
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INCOMING')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'INCOMING'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
              : 'bg-surface border-border hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
              <Inbox className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Inbound</span>
            </span>
            {incomingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-navy mt-1.5">{incomingRequests.length}</div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Connection proposals awaiting your response
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('OUTGOING')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'OUTGOING'
              ? 'bg-sky-50/70 border-sky-300 ring-2 ring-sky-400/40 shadow-xs'
              : 'bg-surface border-border hover:border-sky-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-900 flex items-center space-x-1.5">
              <Send className="w-3.5 h-3.5 text-sky-600" />
              <span>Sent Proposals</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
              Outgoing
            </span>
          </div>
          <div className="text-2xl font-black text-navy mt-1.5">{outgoingRequests.length}</div>
          <p className="text-[11px] text-text-muted mt-0.5">
            Connection bridges you initiated to executives
          </p>
        </button>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-3">
        <div className="flex items-center space-x-2 bg-surface p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('CONNECTIONS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'CONNECTIONS'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Connections</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'CONNECTIONS' ? 'bg-white/20 text-white' : 'bg-surface-muted text-text-muted'
              }`}
            >
              {connections.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('INCOMING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'INCOMING'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Pending Inbound</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('OUTGOING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'OUTGOING'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Outgoing</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'OUTGOING' ? 'bg-white/20 text-white' : 'bg-surface-muted text-text-muted'
              }`}
            >
              {outgoingRequests.length}
            </span>
          </button>
        </div>

        {/* View mode toggle (active only on Connections tab) */}
        {activeTab === 'CONNECTIONS' && (
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Filter connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-navy placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center space-x-1 bg-surface border border-border p-1 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-navy hover:bg-surface-muted'
                }`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-navy hover:bg-surface-muted'
                }`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-xs text-text-muted">
          Loading network records...
        </div>
      ) : activeTab === 'CONNECTIONS' ? (
        /* ================= TAB 1: ACTIVE CONNECTIONS ================= */
        viewMode === 'table' ? (
          <DataTable
            columns={columns}
            data={filteredConnections}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => setSelectedConnection(item)}
            searchPlaceholder="Search connection by name, company, or role..."
            searchFilter={(item, q) =>
              item.partner.fullName.toLowerCase().includes(q) ||
              Boolean(item.partner.companyName?.toLowerCase().includes(q)) ||
              Boolean(item.partner.function?.toLowerCase().includes(q)) ||
              item.businessReason.toLowerCase().includes(q)
            }
            emptyTitle="No Connections Found"
            emptySubtitle="You haven't established any connections yet. Use the Intent Search to find decision makers."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map((conn) => (
              <div
                key={conn.id}
                onClick={() => setSelectedConnection(conn)}
                className="bg-surface border border-border hover:border-primary/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 cursor-pointer hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-navy text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {conn.partner.fullName[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-navy">{conn.partner.fullName}</h3>
                        <p className="text-xs text-text-muted line-clamp-1">
                          {conn.partner.headline || conn.partner.function || 'Industry Professional'}
                        </p>
                      </div>
                    </div>
                    {(() => {
                      const days = Math.max(
                        0,
                        Math.floor((Date.now() - new Date(conn.connectedAt).getTime()) / (1000 * 60 * 60 * 24))
                      );
                      return (
                        <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />
                          <span>Connected &bull; {days === 0 ? 'Today' : `${days}d`}</span>
                        </span>
                      );
                    })()}
                  </div>

                  {conn.partner.companyName && (
                    <div className="flex items-center text-xs text-text-muted space-x-1.5 pt-1">
                      <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-medium text-navy">{conn.partner.companyName}</span>
                    </div>
                  )}

                  <div className="p-2.5 bg-surface-muted rounded-xl border border-border/50 text-[11px] text-text-muted">
                    <span className="font-semibold text-navy">Business Context: </span>
                    <span className="line-clamp-2">"{conn.businessReason}"</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                  <span>Since {new Date(conn.connectedAt).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleDownloadVCard(conn)}
                      className="p-1 text-text-muted hover:text-emerald-700"
                      title="vCard"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/app/deal-rooms')}
                      className="p-1 text-text-muted hover:text-sky-700"
                      title="Deal Room"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const partner = conn.partner;
                        navigate(`/app/messages?userId=${partner.userId}&name=${encodeURIComponent(partner.fullName)}&company=${encodeURIComponent(partner.companyName || '')}&role=${encodeURIComponent(partner.headline || partner.function || '')}`);
                      }}
                      className="p-1 text-text-muted hover:text-navy"
                      title="Chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisconnect(conn.id, conn.partner.fullName)}
                      className="p-1 text-text-muted hover:text-rose-600 transition-colors"
                      title="Remove / Disconnect"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'INCOMING' ? (
        /* ================= TAB 2: PENDING INBOUND REQUESTS ================= */
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="py-16 text-center bg-surface border border-border rounded-2xl p-8">
              <Inbox className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-navy">Your Inbound Queue is Clear</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                No pending connection proposals right now. New requests will appear here with 4-way triage actions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-text-muted flex items-center justify-between">
                <span>
                  <strong>{incomingRequests.length}</strong> inbound connection proposal(s) awaiting your decision
                </span>
                <span className="text-[11px] text-primary font-medium">
                  Review context and select an action below
                </span>
              </div>

              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-surface border border-border rounded-2xl p-5 shadow-xs hover:border-border-focus transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-full bg-navy text-white font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                        {req.requester?.profile?.displayName?.[0]?.toUpperCase() || 'R'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-navy">
                            {req.requester?.profile?.displayName || req.requester?.email || 'Executive Requester'}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Awaiting Response
                          </span>
                        </div>
                        <div className="text-xs text-text-muted flex items-center space-x-2 mt-0.5">
                          <span>{req.requester?.profile?.headline || req.requester?.profile?.function || 'Professional'}</span>
                          {req.requester?.profile?.company?.name && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-navy">{req.requester.profile.company.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-text-muted flex items-center space-x-1 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Received {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Business Intent Box */}
                  <div className="p-3.5 bg-surface-muted rounded-xl border border-border text-xs text-navy leading-relaxed">
                    <span className="font-bold text-navy block text-[11px] uppercase tracking-wider mb-1">
                      Business Proposition / Intent:
                    </span>
                    <p className="italic">"{req.businessReason}"</p>
                  </div>

                  {/* 4-Way Triage Action Bar with clear Action Required banner */}
                  <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-amber-900 block flex items-center gap-1">
                        <span>🎯 Action Required From Your End:</span>
                      </span>
                      <span className="text-[10px] text-text-muted">
                        Accept directly (reveals contact & opens channel), route to colleague, decline politely, or ignore.
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAcceptModalTarget(req)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept & Connect Directly</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDelegateModalTarget(req)}
                        className="px-3.5 py-2 bg-surface hover:bg-surface-muted text-navy border border-border rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
                        title="Forward to a colleague or team member"
                      >
                        <Forward className="w-3.5 h-3.5 text-primary" />
                        <span>Forward to Colleague</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeclineModalTarget(req)}
                        className="px-3 py-2 bg-surface hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline with Reason</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIgnoreModalTarget(req)}
                        className="px-3 py-2 bg-surface hover:bg-surface-muted text-text-muted rounded-xl text-xs font-medium transition-colors"
                        title="Quietly archive without notification"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= TAB 3: OUTGOING REQUESTS ================= */
        <div className="space-y-4">
          {outgoingRequests.length === 0 ? (
            <div className="py-16 text-center bg-surface border border-border rounded-2xl p-8">
              <Mail className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-navy">No Outgoing Proposals</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                You haven't initiated any connection proposals recently. Discover partners using Intent Search.
              </p>
              <Link
                to="/app/search"
                className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Find Contacts</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {outgoingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-surface border border-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-navy">
                        {req.recipientProfile?.displayName || 'Prospective Executive'}
                      </h4>
                      {req.recipientProfile?.company?.name && (
                        <span className="text-[11px] text-text-muted">
                          at {req.recipientProfile.company.name}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-text-muted border border-border">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted line-clamp-1 italic">
                      "{req.businessReason}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 text-xs text-text-muted">
                    <span>Sent {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Slide-over Details Drawer for Connection */}
      <Drawer
        isOpen={Boolean(selectedConnection)}
        onClose={() => setSelectedConnection(null)}
        title={selectedConnection?.partner.fullName || 'Connection Dossier'}
        subtitle={selectedConnection?.partner.headline || selectedConnection?.partner.function || 'Verified Contact'}
        badge={{ label: selectedConnection?.status || 'CONNECTED', variant: 'success' }}
        width="lg"
        footer={
          <div className="flex items-center space-x-3 w-full justify-between">
            <button
              type="button"
              onClick={() => setSelectedConnection(null)}
              className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-text-muted hover:text-navy hover:bg-surface-muted transition-colors"
            >
              Close
            </button>
            <div className="flex items-center space-x-2">
              {selectedConnection && (
                <button
                  type="button"
                  onClick={() => handleDownloadVCard(selectedConnection)}
                  className="px-3.5 py-2 border border-border hover:bg-surface-muted text-navy text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export vCard</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (selectedConnection) {
                    const partner = selectedConnection.partner;
                    const pId = partner.userId;
                    const pName = partner.fullName;
                    const pComp = partner.companyName || '';
                    const pRole = partner.headline || partner.function || '';
                    setSelectedConnection(null);
                    navigate(`/app/messages?userId=${pId}&name=${encodeURIComponent(pName)}&company=${encodeURIComponent(pComp)}&role=${encodeURIComponent(pRole)}`);
                  }
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open in Messages</span>
              </button>
            </div>
          </div>
        }
      >
        {selectedConnection && (
          <div className="space-y-6 text-xs">
            {/* Contact Header Card */}
            <div className="p-4 bg-surface-muted rounded-2xl border border-border flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-navy text-white text-xl font-extrabold flex items-center justify-center shrink-0">
                {selectedConnection.partner.fullName[0]?.toUpperCase() || 'U'}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-navy">
                  {selectedConnection.partner.fullName}
                </div>
                <div className="text-xs text-text-muted">
                  {selectedConnection.partner.headline || 'Industry Professional'}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="inline-flex items-center text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified Connection
                  </span>
                </div>
              </div>
            </div>

            {/* Structured Details */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-navy">
                Professional Details
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface border border-border rounded-xl space-y-1">
                  <div className="text-text-muted text-[10px] font-semibold flex items-center space-x-1">
                    <Building2 className="w-3 h-3 text-primary" />
                    <span>Company</span>
                  </div>
                  <div className="font-bold text-navy truncate">
                    {selectedConnection.partner.companyName || 'Not Listed'}
                  </div>
                </div>

                <div className="p-3 bg-surface border border-border rounded-xl space-y-1">
                  <div className="text-text-muted text-[10px] font-semibold flex items-center space-x-1">
                    <Briefcase className="w-3 h-3 text-primary" />
                    <span>Function</span>
                  </div>
                  <div className="font-bold text-navy truncate">
                    {selectedConnection.partner.function || 'General'}
                  </div>
                </div>

                <div className="p-3 bg-surface border border-border rounded-xl space-y-1">
                  <div className="text-text-muted text-[10px] font-semibold flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    <span>Established Date</span>
                  </div>
                  <div className="font-bold text-navy truncate">
                    {new Date(selectedConnection.connectedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-3 bg-surface border border-border rounded-xl space-y-1">
                  <div className="text-text-muted text-[10px] font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    <span>Protocol</span>
                  </div>
                  <div className="font-bold text-success truncate">
                    Intent Verified
                  </div>
                </div>
              </div>
            </div>

            {/* Business Objective & Context */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-navy">
                Verified Business Intent
              </h4>
              <div className="p-4 bg-primary-soft/40 border border-primary/20 rounded-2xl text-xs text-navy leading-relaxed">
                "{selectedConnection.businessReason}"
              </div>
            </div>

            {/* Revealed Direct Contact Information */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
              <div className="flex items-center space-x-1.5 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Unlocked Direct Contact Details</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Connection established! Verified contact credentials unlocked:
              </p>
              <div className="grid grid-cols-1 gap-2 pt-0.5 text-xs">
                {selectedConnection.partner.email ? (
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-text-muted block">Direct Email</span>
                        <span className="font-bold text-navy truncate block">
                          {selectedConnection.partner.email}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`mailto:${selectedConnection.partner.email}`}
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg shrink-0 transition-colors"
                    >
                      Email
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-emerald-200 text-text-muted">
                    <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="text-[11px]">Email not shared</span>
                  </div>
                )}

                {selectedConnection.partner.phoneNumber ? (
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-text-muted block">Direct Phone</span>
                        <span className="font-bold text-navy truncate block">
                          {selectedConnection.partner.phoneNumber}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${selectedConnection.partner.phoneNumber}`}
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg shrink-0 transition-colors"
                    >
                      Call
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-emerald-200 text-text-muted">
                    <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="text-[11px]">Phone not provided by member</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Card */}
            <div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-navy">Direct Message Channel</div>
                <div className="text-text-muted text-[11px]">End-to-end synchronized communications</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedConnection) {
                    const partner = selectedConnection.partner;
                    setSelectedConnection(null);
                    navigate(`/app/messages?userId=${partner.userId}&name=${encodeURIComponent(partner.fullName)}&company=${encodeURIComponent(partner.companyName || '')}&role=${encodeURIComponent(partner.headline || partner.function || '')}`);
                  }
                }}
                className="px-3.5 py-1.5 bg-primary text-white font-bold rounded-xl text-xs shadow-xs hover:bg-primary-hover flex items-center space-x-1"
              >
                <span>Chat</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>

            {/* Meshvi Deal Room Card */}
            <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Handshake className="w-4 h-4 text-sky-600" />
                  <span>Meshvi Deal Room</span>
                </div>
                <div className="text-sky-700/80 text-[11px]">Milestones, mutual goals & deal closing</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedConnection(null);
                  navigate('/app/deal-rooms');
                }}
                className="px-3.5 py-1.5 bg-[#102A43] text-white font-bold rounded-xl text-xs hover:bg-[#173B5E] flex items-center space-x-1"
              >
                <span>Deal Room</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modal 1: 4-Way Accept & Connect / Route to Team */}
      {acceptModalTarget && (
        <AcceptAndConnectModal
          isOpen={Boolean(acceptModalTarget)}
          onClose={() => setAcceptModalTarget(null)}
          connectionId={acceptModalTarget.id}
          requester={
            acceptModalTarget.requester || {
              id: '',
              email: 'partner@domain.com',
            }
          }
          businessReason={acceptModalTarget.businessReason}
          onSuccess={() => {
            fetchAllData();
            setAcceptModalTarget(null);
          }}
        />
      )}

      {/* Modal 2: Forward / Route to Colleague */}
      {delegateModalTarget && (
        <DelegateToColleagueModal
          isOpen={Boolean(delegateModalTarget)}
          onClose={() => setDelegateModalTarget(null)}
          connectionId={delegateModalTarget.id}
          requesterName={delegateModalTarget.requester?.profile?.displayName || 'Executive Requester'}
          opportunitySummary={delegateModalTarget.businessReason}
          onSuccess={() => {
            fetchAllData();
            setDelegateModalTarget(null);
          }}
        />
      )}

      {/* Modal 3: Structured Decline Reason */}
      {declineModalTarget && (
        <DeclineReasonModal
          isOpen={Boolean(declineModalTarget)}
          onClose={() => setDeclineModalTarget(null)}
          connectionId={declineModalTarget.id}
          requesterName={declineModalTarget.requester?.profile?.displayName || 'Executive Requester'}
          onSuccess={() => {
            fetchAllData();
            setDeclineModalTarget(null);
          }}
        />
      )}

      {/* Modal 4: Ignore / Archive with Reason */}
      {ignoreModalTarget && (
        <IgnoreReasonModal
          isOpen={Boolean(ignoreModalTarget)}
          onClose={() => setIgnoreModalTarget(null)}
          connectionId={ignoreModalTarget.id}
          requesterName={
            ignoreModalTarget.requester?.profile?.displayName ||
            ignoreModalTarget.requester?.email ||
            'Executive Requester'
          }
          onSuccess={() => {
            fetchAllData();
            setIgnoreModalTarget(null);
          }}
        />
      )}
    </div>
  );
};
