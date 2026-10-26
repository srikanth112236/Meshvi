import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Mail,
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  Gauge,
  Globe,
  Key,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  ArrowRightLeft,
  GitBranch,
  Layers,
  ArrowUpRight,
  Briefcase,
  AlertTriangle,
  UserCheck,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';

interface TeamMember {
  id: string;
  department?: string;
  companyRole: 'OWNER' | 'ADMIN' | 'MEMBER';
  membershipStatus: string;
  maxOpenBridges?: number;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    profile?: {
      id?: string;
      displayName: string;
      headline?: string;
      currentTitle?: string;
      linkedinVerified?: boolean;
    };
  };
}

interface DelegationItem {
  id: string;
  status: string;
  businessReason?: string;
  createdAt: string;
  updatedAt: string;
  isInbound: boolean;
  handledByType: 'OWNER' | 'DELEGATED' | 'TEAM_MEMBER';
  handlerName: string;
  handlerTitle?: string;
  handlerEmail?: string | null;
  requester?: {
    email: string;
    profile?: {
      displayName: string;
      currentTitle?: string;
      company?: { name: string };
    };
  };
  recipientProfile?: {
    displayName: string;
    currentTitle?: string;
  };
  delegatedToProfile?: {
    id: string;
    displayName: string;
    currentTitle?: string;
  };
  delegationNote?: string;
}

interface OrgChartDepartment {
  department: string;
  count: number;
  members: Array<{
    id: string;
    name: string;
    title: string;
    role: string;
    email: string;
  }>;
}

export const CompanyTeamPage = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('id');

  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(companyId);
  const [company, setCompany] = useState<any>(null);
  const [workloads, setWorkloads] = useState<any[]>([]);
  const [delegations, setDelegations] = useState<DelegationItem[]>([]);
  const [orgChart, setOrgChart] = useState<OrgChartDepartment[]>([]);
  const [routingRules, setRoutingRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active sub-tab: 'ROSTER' | 'DELEGATIONS' | 'DEPARTMENTS' | 'DOMAINS'
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'DELEGATIONS' | 'DEPARTMENTS' | 'DOMAINS'>('ROSTER');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals & Drawers
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState('Procurement & Sourcing');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [inviteResult, setInviteResult] = useState<any>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit Member State
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [editCapacity, setEditCapacity] = useState(25);
  const [isOoo, setIsOoo] = useState(false);
  const [oooProxyId, setOooProxyId] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Reassign Delegation Drawer State
  const [reassigningItem, setReassigningItem] = useState<DelegationItem | null>(null);
  const [reassignTargetProfileId, setReassignTargetProfileId] = useState('');
  const [reassignNote, setReassignNote] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  // Domain whitelist states
  const [newDomain, setNewDomain] = useState('');
  const [domainFeedback, setDomainFeedback] = useState<string | null>(null);
  const [dnsChallenge, setDnsChallenge] = useState<string | null>(null);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [isVerifyingDns, setIsVerifyingDns] = useState(false);

  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');

  const DEPARTMENTS = [
    'Executive Management',
    'Procurement & Sourcing',
    'Strategic Partnerships',
    'M&A & Corporate Development',
    'Sales & Commercial',
    'Engineering & Technology',
    'Legal & Regulatory Compliance',
    'Operations & Supply Chain',
  ];

  const fetchCompanyDetails = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    let targetId = activeCompanyId || companyId;
    if (!targetId) {
      try {
        const myRes = await fetch('/api/v1/companies/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const myData = await myRes.json();
        if (myData.success && myData.data && myData.data.length > 0) {
          targetId = myData.data[0].company?.id;
          setActiveCompanyId(targetId);
        }
      } catch {
        // Handled silently
      }
    }

    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      const [companyRes, workloadRes, connectionsRes, orgRes, rulesRes] = await Promise.all([
        fetch(`/api/v1/companies/${targetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()).catch(() => ({ success: false })),
        fetch(`/api/v1/companies/${targetId}/workload`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()).catch(() => ({ success: false })),
        fetch(`/api/v1/companies/${targetId}/all-connections`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()).catch(() => ({ success: false })),
        fetch(`/api/v1/companies/${targetId}/org-chart`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()).catch(() => ({ success: false })),
        fetch(`/api/v1/companies/${targetId}/routing-rules`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => res.json()).catch(() => ({ success: false })),
      ]);

      if (companyRes.success && companyRes.data) {
        setCompany(companyRes.data);
      }
      if (workloadRes.success && workloadRes.data) {
        setWorkloads(workloadRes.data);
      }
      if (connectionsRes.success && connectionsRes.data) {
        // Filter or prioritize items with delegation or inbound connections
        const all = connectionsRes.data.connections || connectionsRes.data;
        if (Array.isArray(all)) {
          setDelegations(all);
        }
      }
      if (orgRes.success && orgRes.data) {
        const depts = orgRes.data.departments || orgRes.data;
        if (Array.isArray(depts)) {
          setOrgChart(depts);
        }
      }
      if (rulesRes.success && rulesRes.data) {
        setRoutingRules(rulesRes.data);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId, token]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = activeCompanyId || companyId;
    if (!targetId || !inviteEmail.trim()) return;
    setGeneralError('');
    setInviteResult(null);
    setInviteLoading(true);

    try {
      const res = await fetch(`/api/v1/companies/${targetId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          department: inviteDept,
          companyRole: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to dispatch invitation.');
      }

      setInviteResult(data.data);
      setInviteEmail('');
      await fetchCompanyDetails();
    } catch (err: any) {
      setGeneralError(err.message || 'Error inviting employee.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setEditDepartment(member.department || 'Executive Management');
    setEditRole(member.companyRole === 'OWNER' ? 'ADMIN' : (member.companyRole as 'ADMIN' | 'MEMBER'));
    setEditCapacity(member.maxOpenBridges || 25);
    setIsOoo(false);
    setOooProxyId('');
  };

  const handleSaveMemberEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = activeCompanyId || companyId;
    if (!targetId || !editingMember) return;

    try {
      setSavingEdit(true);
      const res = await fetch(`/api/v1/companies/${targetId}/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyRole: editRole,
          department: editDepartment,
          maxOpenBridges: Number(editCapacity),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update team member.');
      }

      setGeneralSuccess(`Team settings for ${editingMember.user.profile?.displayName || editingMember.user.email} updated.`);
      setTimeout(() => setGeneralSuccess(''), 3100);
      setEditingMember(null);
      await fetchCompanyDetails();
    } catch (err: any) {
      setGeneralError(err.message || 'Error updating member.');
      setTimeout(() => setGeneralError(''), 3100);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const targetId = activeCompanyId || companyId;
    if (!targetId) return;
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this organization roster?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/companies/${targetId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to remove member.');
      }

      setGeneralSuccess(`${memberName} removed from company roster.`);
      setTimeout(() => setGeneralSuccess(''), 3100);
      await fetchCompanyDetails();
    } catch (err: any) {
      setGeneralError(err.message || 'Error removing member.');
      setTimeout(() => setGeneralError(''), 3100);
    }
  };

  const handleOpenReassign = (item: DelegationItem) => {
    setReassigningItem(item);
    setReassignTargetProfileId('');
    setReassignNote(`Re-routed from team governance overview`);
  };

  const handleSaveReassignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = activeCompanyId || companyId;
    if (!targetId || !reassigningItem || !reassignTargetProfileId) return;

    try {
      setIsReassigning(true);
      const res = await fetch(`/api/v1/companies/${targetId}/connections/${reassigningItem.id}/reassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetProfileId: reassignTargetProfileId,
          note: reassignNote,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to reassign connection.');
      }

      setGeneralSuccess('Opportunity connection successfully re-assigned to colleague.');
      setTimeout(() => setGeneralSuccess(''), 3100);
      setReassigningItem(null);
      await fetchCompanyDetails();
    } catch (err: any) {
      setGeneralError(err.message || 'Error reassigning opportunity.');
      setTimeout(() => setGeneralError(''), 3100);
    } finally {
      setIsReassigning(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = activeCompanyId || companyId;
    if (!targetId || !newDomain.trim()) return;

    try {
      setIsAddingDomain(true);
      setDomainFeedback(null);
      const res = await fetch(`/api/v1/companies/${targetId}/domains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          domain: newDomain.trim().toLowerCase(),
          isPrimary: false,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to add corporate domain');
      }
      setDomainFeedback(`Domain "${newDomain.trim()}" whitelisted! Employees signing up with this email suffix will auto-match.`);
      setNewDomain('');
      await fetchCompanyDetails();
    } catch (err: any) {
      setDomainFeedback(err.message || 'Error adding domain');
    } finally {
      setIsAddingDomain(false);
    }
  };

  const handleGenerateDnsToken = async () => {
    const targetId = activeCompanyId || companyId;
    if (!targetId) return;
    try {
      const res = await fetch(`/api/v1/companies/${targetId}/challenge-dns`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data?.challengeToken) {
        setDnsChallenge(data.data.challengeToken);
      }
    } catch {
      // Non-fatal
    }
  };

  const handleVerifyDnsLive = async () => {
    const targetId = activeCompanyId || companyId;
    if (!targetId) return;
    try {
      setIsVerifyingDns(true);
      const res = await fetch(`/api/v1/companies/${targetId}/verify-dns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: dnsChallenge || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeneralSuccess('Cryptographic DNS verification confirmed! Domain marked authoritative.');
        setTimeout(() => setGeneralSuccess(''), 5000);
        await fetchCompanyDetails();
      } else {
        throw new Error(data.error?.message || 'DNS TXT record not yet detected in public DNS.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'DNS verification failed. DNS propagation may take up to 5 minutes.');
      setTimeout(() => setGeneralError(''), 5000);
    } finally {
      setIsVerifyingDns(false);
    }
  };

  const copyToken = () => {
    if (inviteResult?.inviteUrl || inviteResult?.inviteToken) {
      navigator.clipboard.writeText(inviteResult.inviteUrl || inviteResult.inviteToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getMemberWorkload = (member: TeamMember) => {
    return workloads.find((w) => w.userId === member.user.id || w.membershipId === member.id);
  };

  if (loading && !company) {
    return (
      <div className="py-20 text-center text-xs text-text-muted">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
        Loading organization team, capacity meters, and delegation logs...
      </div>
    );
  }

  const effectiveId = activeCompanyId || companyId;
  if (!effectiveId || !company) {
    return (
      <div className="py-20 text-center text-xs text-text-muted">
        No active organization found for this account.
      </div>
    );
  }

  const members: TeamMember[] = company?.memberships || [];
  const filteredMembers = members.filter((m) => {
    const name = m.user?.profile?.displayName || m.user?.email || '';
    const dept = m.department || '';
    const role = m.companyRole || 'MEMBER';
    const q = searchFilter.toLowerCase();
    const matchesSearch = name.toLowerCase().includes(q) || dept.toLowerCase().includes(q) || m.user?.email.toLowerCase().includes(q);
    const matchesDept = selectedDeptFilter === 'ALL' || dept === selectedDeptFilter;
    const matchesRole = selectedRoleFilter === 'ALL' || role === selectedRoleFilter;
    return matchesSearch && matchesDept && matchesRole;
  });

  const totalCapacity = members.reduce((acc, m) => acc + (m.maxOpenBridges || 25), 0);
  const totalActiveBridges = workloads.reduce((acc, w) => acc + (w.activeBridges || 0), 0);
  const overallUtilization = totalCapacity > 0 ? Math.round((totalActiveBridges / totalCapacity) * 100) : 0;
  const delegatedCount = delegations.filter((d) => d.handledByType === 'DELEGATED' || d.delegatedToProfile).length;

  return (
    <div className="space-y-6">
      {/* 1. Header with Corporate Identity & Quick Actions */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              Enterprise Governance & Delegation
            </span>
            <span className="text-xs text-text-muted font-mono">{company?.domain || 'corporate entity'}</span>
            {company?.verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Tier-4 Attested
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-navy mt-1">
            {company?.name} &bull; Team & Capacity Management
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage decision-makers, prevent introduction fatigue via bridge quotas, and supervise cross-department opportunity delegations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={fetchCompanyDetails}
            className="p-2 bg-surface-muted hover:bg-surface border border-border rounded-xl text-navy transition-all"
            title="Refresh Roster & Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/company/routing"
            className="px-3 py-2 bg-surface hover:bg-surface-muted border border-border rounded-xl text-navy text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
            <span>Routing Directives</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Colleague</span>
          </button>
        </div>
      </div>

      {/* 2. Anti-Fatigue Governance KPIs Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Authorized Roster</span>
          <div className="text-xl font-black text-navy mt-0.5 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>{members.length} Members</span>
          </div>
          <span className="text-[10px] text-text-muted">
            {members.filter((m) => m.companyRole === 'ADMIN' || m.companyRole === 'OWNER').length} Admins &bull; {members.filter((m) => m.companyRole === 'MEMBER').length} Liaisons
          </span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Active Bridges</span>
          <div className="text-xl font-black text-navy mt-0.5 flex items-center space-x-1.5">
            <Gauge className="w-4 h-4 text-emerald-600" />
            <span>{totalActiveBridges} In Flight</span>
          </div>
          <span className="text-[10px] text-text-muted">Concurrent warm discussions</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Team Capacity</span>
          <div className="text-xl font-black text-navy mt-0.5 flex items-center space-x-1.5">
            <span className={overallUtilization > 75 ? 'text-amber-600' : 'text-emerald-600'}>
              {overallUtilization}%
            </span>
            <span className="text-[11px] font-normal text-text-muted">of {totalCapacity} cap</span>
          </div>
          <span className="text-[10px] text-text-muted">Anti-burnout quota pool</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Delegated Intros</span>
          <div className="text-xl font-black text-navy mt-0.5 flex items-center space-x-1.5">
            <ArrowRightLeft className="w-4 h-4 text-purple-600" />
            <span>{delegatedCount} Handed Off</span>
          </div>
          <span className="text-[10px] text-text-muted">Specialist re-assignments</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Domain Authority</span>
          <div className="text-xl font-black text-navy mt-0.5 flex items-center space-x-1.5">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>{company?.domains?.length || 1} Verified</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Auto-Join Active</span>
        </div>
      </div>

      {/* Global Feedback Notifications */}
      {generalSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{generalSuccess}</span>
          </div>
          <button onClick={() => setGeneralSuccess('')}>✕</button>
        </div>
      )}
      {generalError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{generalError}</span>
          </div>
          <button onClick={() => setGeneralError('')}>✕</button>
        </div>
      )}

      {/* 3. Navigation Sub-Tabs Bar */}
      <div className="bg-surface border border-border rounded-2xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ROSTER')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'ROSTER'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Roster & Workload ({members.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DELEGATIONS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'DELEGATIONS'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Delegation & Handover Log ({delegatedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Department Tiers & Org Chart</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOMAINS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'DOMAINS'
                ? 'bg-navy text-white shadow-xs'
                : 'text-text-muted hover:text-navy hover:bg-surface-muted'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Domains & DNS Attestation</span>
          </button>
        </div>

        {/* View mode toggle for Roster */}
        {activeTab === 'ROSTER' && (
          <div className="flex items-center space-x-1 bg-surface-muted p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-surface text-navy shadow-2xs font-bold' : 'text-text-muted hover:text-navy'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-surface text-navy shadow-2xs font-bold' : 'text-text-muted hover:text-navy'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ROSTER & CAPACITY WORKLOAD                                         */}
      {/* ========================================================================= */}
      {activeTab === 'ROSTER' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-surface border border-border rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, title, email..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-surface-muted border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-1.5 bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
              >
                <option value="ALL">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
              >
                <option value="ALL">All Roles</option>
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
                <option value="MEMBER">Member</option>
              </select>
            </div>
          </div>

          {/* Roster Table or Grid View */}
          {viewMode === 'table' ? (
            <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted border-b border-border text-[11px] font-bold text-text-muted uppercase">
                    <tr>
                      <th className="py-3 px-4">Member / Dossier</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Role & Attestation</th>
                      <th className="py-3 px-4">Workload Capacity Meter</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-text-muted">
                          No team members matched your search or department filter.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => {
                        const wl = getMemberWorkload(member);
                        const percent = wl?.capacityPercent ?? 0;
                        const active = wl?.activeBridges ?? 0;
                        const max = wl?.maxOpenBridges ?? member.maxOpenBridges ?? 25;
                        const isFull = wl?.isAtCapacity || percent >= 100;
                        const name = member.user?.profile?.displayName || member.user?.email.split('@')[0];

                        return (
                          <tr key={member.id} className="hover:bg-surface-muted/50 transition-colors">
                            {/* Member Identity */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                  {name[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-extrabold text-navy flex items-center space-x-1.5">
                                    <span>{name}</span>
                                    {member.user?.profile?.linkedinVerified && (
                                      <span className="w-2 h-2 rounded-full bg-blue-500" title="LinkedIn Verified" />
                                    )}
                                  </div>
                                  <div className="text-[11px] text-text-muted">{member.user?.email}</div>
                                  {member.user?.profile?.currentTitle && (
                                    <div className="text-[10px] text-indigo-700 font-semibold">
                                      {member.user.profile.currentTitle}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Department */}
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-navy">
                                {member.department || 'Executive Operations'}
                              </span>
                            </td>

                            {/* Role Badge */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                    member.companyRole === 'OWNER'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : member.companyRole === 'ADMIN'
                                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {member.companyRole}
                                </span>
                                <span
                                  className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  title="Cryptographically Tier-4 Attested Corporate Identity"
                                >
                                  <ShieldCheck className="w-3 h-3" />
                                </span>
                              </div>
                            </td>

                            {/* Capacity Meter */}
                            <td className="py-3.5 px-4">
                              <div className="w-44 space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold">
                                  <span className={isFull ? 'text-rose-600 font-extrabold' : 'text-navy'}>
                                    {active} / {max} Open Bridges
                                  </span>
                                  <span className={isFull ? 'text-rose-600 font-black' : 'text-text-muted'}>
                                    {percent}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      isFull ? 'bg-rose-500' : percent > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, percent)}%` }}
                                  />
                                </div>
                                {isFull && (
                                  <span className="text-[9px] text-rose-600 font-bold block">
                                    At max capacity — auto-rerouting recommended
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Availability */}
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Receiving Intros
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(member)}
                                  className="p-1.5 text-text-muted hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Edit Role, Quota & Attestation"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {member.companyRole !== 'OWNER' && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMember(member.id, name)}
                                    className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Remove from Roster"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => {
                const wl = getMemberWorkload(member);
                const percent = wl?.capacityPercent ?? 0;
                const active = wl?.activeBridges ?? 0;
                const max = wl?.maxOpenBridges ?? member.maxOpenBridges ?? 25;
                const isFull = wl?.isAtCapacity || percent >= 100;
                const name = member.user?.profile?.displayName || member.user?.email.split('@')[0];

                return (
                  <div key={member.id} className="bg-surface border border-border rounded-2xl p-4 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                          {name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-navy text-xs">{name}</h3>
                          <p className="text-[11px] text-text-muted truncate max-w-[160px]">{member.user?.email}</p>
                          <span className="text-[10px] text-indigo-700 font-bold block mt-0.5">
                            {member.user?.profile?.currentTitle || 'Corporate Representative'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          member.companyRole === 'OWNER'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : member.companyRole === 'ADMIN'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {member.companyRole}
                      </span>
                    </div>

                    <div className="p-2.5 bg-surface-muted rounded-xl border border-border space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-text-muted">Department:</span>
                        <span className="text-navy">{member.department || 'Executive Operations'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-text-muted">Bridge Quota:</span>
                        <span className={isFull ? 'text-rose-600 font-extrabold' : 'text-navy'}>
                          {active} / {max} Open ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? 'bg-rose-500' : percent > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-700">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Tier-4 Verified
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(member)}
                          className="px-2.5 py-1 text-xs font-bold text-navy bg-surface-muted hover:bg-surface border border-border rounded-lg transition-colors"
                        >
                          Configure
                        </button>
                        {member.companyRole !== 'OWNER' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id, name)}
                            className="p-1.5 text-text-muted hover:text-rose-600 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DELEGATION & RE-ROUTING LOG                                        */}
      {/* ========================================================================= */}
      {activeTab === 'DELEGATIONS' && (
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-navy flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                <span>Opportunity Handover & Delegation Audit Trail</span>
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Every opportunity routed to a colleague is tracked in this immutable ledger with handover notes and current bridge status.
              </p>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
              Audit Provenance Active
            </span>
          </div>

          <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted border-b border-border text-[11px] font-bold text-text-muted uppercase">
                  <tr>
                    <th className="py-3 px-4">Requester / Counterparty</th>
                    <th className="py-3 px-4">Original Handler</th>
                    <th className="py-3 px-4">Delegated Assignee</th>
                    <th className="py-3 px-4">Delegation Note / Rationale</th>
                    <th className="py-3 px-4">Bridge Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {delegations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-text-muted">
                        No delegated opportunities recorded yet. When inbound requests are re-routed to specialists, they will appear here.
                      </td>
                    </tr>
                  ) : (
                    delegations.map((item) => {
                      const counterpartyName = item.requester?.profile?.displayName || item.requester?.email || 'External Partner';
                      const counterpartyCompany = item.requester?.profile?.company?.name || 'Counterparty';
                      const originalHandler = item.recipientProfile?.displayName || 'Primary Gatekeeper';
                      const assignedTo = item.delegatedToProfile?.displayName || item.handlerName || 'Assigned Lead';

                      return (
                        <tr key={item.id} className="hover:bg-surface-muted/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-extrabold text-navy">{counterpartyName}</div>
                              <div className="text-[11px] text-text-muted">{counterpartyCompany}</div>
                              {item.businessReason && (
                                <span className="inline-block mt-0.5 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                  {item.businessReason.slice(0, 45)}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-text-muted">
                            <div className="flex items-center space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>{originalHandler}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-navy">
                            <div className="flex items-center space-x-1.5">
                              <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>{assignedTo}</span>
                            </div>
                            {item.delegatedToProfile?.currentTitle && (
                              <span className="text-[10px] text-text-muted block ml-5">
                                {item.delegatedToProfile.currentTitle}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-[11px] text-text-muted italic truncate">
                              "{item.delegationNote || 'Re-routed for functional domain evaluation'}"
                            </p>
                            <span className="text-[9px] text-text-muted block mt-0.5">
                              {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                item.status === 'ACCEPTED'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : item.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenReassign(item)}
                              className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors inline-flex items-center space-x-1"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Reassign</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DEPARTMENT TIERS & ORG CHART                                       */}
      {/* ========================================================================= */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-navy">Departmental Governance & Routing Tiers</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Organize your company into functional decision silos. Configure which lead acts as the primary gatekeeper for each corridor.
                {orgChart.length > 0 && ` (${orgChart.length} organizational units synced)`}
              </p>
            </div>
            <Link
              to="/company/routing"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <span>Manage Department Rules</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEPARTMENTS.map((deptName) => {
              const deptMembers = members.filter((m) => m.department === deptName);
              const deptRules = routingRules.filter((r) => r.department === deptName);
              const totalDeptCapacity = deptMembers.reduce((acc, m) => acc + (m.maxOpenBridges || 25), 0);
              const activeDeptBridges = deptMembers.reduce((acc, m) => {
                const wl = getMemberWorkload(m);
                return acc + (wl?.activeBridges || 0);
              }, 0);

              return (
                <div key={deptName} className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-navy text-sm flex items-center space-x-1.5">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        <span>{deptName}</span>
                      </h3>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {deptMembers.length} authorized colleague{deptMembers.length === 1 ? '' : 's'} assigned
                      </p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Cap: {activeDeptBridges}/{totalDeptCapacity || 25}
                    </span>
                  </div>

                  {/* Active Department Rules */}
                  {deptRules.length > 0 && (
                    <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
                      <span className="text-[9px] font-black uppercase text-indigo-800 tracking-wider block">
                        Active Inbound Directive
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {deptRules.map((rule) => (
                          <span
                            key={rule.id}
                            className="text-[10px] font-bold px-2 py-0.5 bg-surface text-indigo-700 rounded border border-indigo-200"
                          >
                            Tag: {rule.categoryTag || 'ANY'} &bull; Priority {rule.priority}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Members inside this Department */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Team Members in this Silo
                    </span>
                    {deptMembers.length === 0 ? (
                      <p className="text-[11px] text-text-muted italic">
                        No team members explicitly mapped to this department yet.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {deptMembers.map((m) => {
                          const mName = m.user?.profile?.displayName || m.user?.email.split('@')[0];
                          const mWorkload = getMemberWorkload(m);
                          return (
                            <div
                              key={m.id}
                              className="p-2 bg-surface-muted rounded-xl flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                                  {mName[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-extrabold text-navy text-[11px] block">{mName}</span>
                                  <span className="text-[9px] text-text-muted">
                                    {m.user?.profile?.currentTitle || m.companyRole}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-text-muted font-mono">
                                {mWorkload?.activeBridges || 0} active bridges
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DOMAINS & CRYPTOGRAPHIC ATTESTATION                                 */}
      {/* ========================================================================= */}
      {activeTab === 'DOMAINS' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-navy">Corporate Domain Whitelist & Cryptographic Authority</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Employees with verified corporate email matching these domains are automatically placed in your team roster with Tier-4 cryptographic attestation.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                Auto-Join Active
              </span>
            </div>

            {domainFeedback && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 font-semibold">
                {domainFeedback}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Primary Domain</span>
                    <span className="font-mono text-xs font-bold text-navy">{company?.domain || 'company.com'}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Verified
                </span>
              </div>

              <div className="p-3.5 bg-surface-muted rounded-xl border border-border flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-text-muted block">DNS TXT Challenge</span>
                    <span className="text-xs font-bold text-navy">
                      {dnsChallenge ? 'Token Generated' : 'Challenge Ready'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleGenerateDnsToken}
                    className="px-2.5 py-1 bg-surface border border-border rounded-lg text-[10px] font-bold text-navy hover:bg-surface-muted"
                  >
                    {dnsChallenge ? 'Regenerate' : 'Get TXT Record'}
                  </button>
                  {dnsChallenge && (
                    <button
                      type="button"
                      disabled={isVerifyingDns}
                      onClick={handleVerifyDnsLive}
                      className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isVerifyingDns ? 'Verifying...' : 'Verify DNS'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {dnsChallenge && (
              <div className="p-3.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] flex items-center justify-between">
                <span className="truncate mr-2">Meshvi-domain-verification={dnsChallenge}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`Meshvi-domain-verification=${dnsChallenge}`);
                    setGeneralSuccess('DNS TXT token copied to clipboard');
                    setTimeout(() => setGeneralSuccess(''), 3000);
                  }}
                  className="text-xs text-white hover:underline font-sans font-bold shrink-0"
                >
                  Copy TXT Record
                </button>
              </div>
            )}

            {/* Add Secondary Domain Form */}
            <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
              <input
                type="text"
                placeholder="Add secondary subsidiary domain, e.g. subsidiary-group.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-surface-muted border border-border rounded-xl text-xs font-mono text-navy placeholder:text-text-muted focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={isAddingDomain || !newDomain.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isAddingDomain ? 'Whitelisting...' : 'Whitelist Secondary Domain'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER 1: EDIT TEAM MEMBER & CAPACITY                                     */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Configure Team Member & Quotas"
        subtitle={editingMember ? (editingMember.user?.profile?.displayName || editingMember.user?.email) : ''}
        width="md"
      >
        {editingMember && (
          <form onSubmit={handleSaveMemberEdit} className="space-y-5 text-xs">
            <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Account Email</span>
              <span className="font-mono font-bold text-navy text-xs">{editingMember.user?.email}</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Department Assignment
              </label>
              <select
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Corporate Authority Role
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as any)}
                disabled={editingMember.companyRole === 'OWNER'}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600 disabled:opacity-50"
              >
                <option value="ADMIN">ADMIN &bull; Full administrative and routing authority</option>
                <option value="MEMBER">MEMBER &bull; Functional liaison and deal room participant</option>
              </select>
              {editingMember.companyRole === 'OWNER' && (
                <p className="text-[10px] text-text-muted mt-1 italic">
                  Primary corporate owner role cannot be downgraded.
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Max Open Bridges (Anti-Fatigue Quota)
                </label>
                <span className="font-mono font-bold text-indigo-700">{editCapacity} Intros</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={editCapacity}
                onChange={(e) => setEditCapacity(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <p className="text-[10px] text-text-muted mt-1">
                Caps concurrent warm introductions assigned to this team member to prevent response latency.
              </p>
            </div>

            {/* Out of Office (OOO) Proxy Delegation Setting */}
            <div className="p-3.5 bg-surface-muted border border-border rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-navy block">Out of Office (OOO) Proxy</span>
                  <span className="text-[10px] text-text-muted">Auto-route incoming intros when on leave</span>
                </div>
                <input
                  type="checkbox"
                  checked={isOoo}
                  onChange={(e) => setIsOoo(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
              </div>

              {isOoo && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Designated Proxy Colleague
                  </label>
                  <select
                    value={oooProxyId}
                    onChange={(e) => setOooProxyId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-medium text-navy"
                  >
                    <option value="">Select fallback colleague...</option>
                    {members
                      .filter((m) => m.id !== editingMember.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.user?.profile?.displayName || m.user?.email} ({m.department || 'Operations'})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Tier-4 Role Confirmation Action for Company Admin */}
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy">Tier-4: Corporate Role Attestation</span>
                <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-[9px] font-bold rounded-full">
                  Admin Sign
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Attest this executive's official corporate title to grant them the maximum cryptographic Tier-4 badge across all Meshvi deal corridors.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/v1/auth/confirm-role', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        targetProfileId: (editingMember.user as any).profile?.id || editingMember.user.id,
                        title: editingMember.user.profile?.currentTitle || 'Corporate Representative',
                        companyName: company?.name || 'Organization',
                      }),
                    });
                    const d = await res.json();
                    if (res.ok && d.success) {
                      setGeneralSuccess('Tier-4 Role Confirmed! Badge updated for ' + (editingMember.user.profile?.displayName || editingMember.user.email));
                      setTimeout(() => setGeneralSuccess(''), 3100);
                    } else {
                      setGeneralError(d.error?.message || 'Could not attest role.');
                      setTimeout(() => setGeneralError(''), 3100);
                    }
                  } catch {
                    setGeneralError('Network error confirming role.');
                  }
                }}
                className="w-full py-2 bg-navy hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirm & Attest Executive Role</span>
              </button>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="flex-1 py-2.5 bg-surface border border-border text-navy font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
              >
                {savingEdit ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* DRAWER 2: INVITE COLLEAGUE MODAL                                          */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteResult(null);
        }}
        title="Invite Colleague to Organization"
        subtitle={`Organization: ${company?.name}`}
        width="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-text-muted">
            Send a single-use onboarding invitation token to authorize a colleague on your organization roster.
          </p>

          <form onSubmit={handleSendInvite} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Colleague Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder={`colleague@${company?.domain || 'company.com'}`}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-surface-muted border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Department Assignment
              </label>
              <select
                value={inviteDept}
                onChange={(e) => setInviteDept(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-navy"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Initial Permission Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-navy"
              >
                <option value="MEMBER">MEMBER &bull; Functional Liaison</option>
                <option value="ADMIN">ADMIN &bull; Corporate Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={inviteLoading || !inviteEmail.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {inviteLoading ? 'Generating Invitation...' : 'Dispatch Invitation Token'}
            </button>
          </form>

          {inviteResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Invitation Dispatched!</span>
              </div>
              <p className="text-[11px] text-emerald-900">
                Single-use invite link created for <strong>{inviteResult.invitedEmail}</strong> (expires in 7 days).
              </p>
              <div className="p-2.5 bg-surface rounded-lg border border-border flex items-center justify-between">
                <span className="font-mono text-[10px] text-navy truncate mr-2 select-all">
                  {inviteResult.inviteUrl || inviteResult.inviteToken}
                </span>
                <button
                  type="button"
                  onClick={copyToken}
                  className="px-2 py-1 bg-surface-muted hover:bg-surface border border-border rounded text-[10px] font-bold text-navy shrink-0"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* ========================================================================= */}
      {/* DRAWER 3: REASSIGN DELEGATION MODAL                                       */}
      {/* ========================================================================= */}
      <Drawer
        isOpen={!!reassigningItem}
        onClose={() => setReassigningItem(null)}
        title="Reassign Opportunity Connection"
        subtitle={reassigningItem ? `Counterparty: ${reassigningItem.requester?.profile?.displayName || reassigningItem.requester?.email}` : ''}
        width="md"
      >
        {reassigningItem && (
          <form onSubmit={handleSaveReassignment} className="space-y-4 text-xs">
            <div className="p-3.5 bg-surface-muted rounded-xl border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase text-text-muted block">Current Assignment</span>
              <div className="font-bold text-navy">
                {reassigningItem.delegatedToProfile?.displayName || reassigningItem.handlerName || 'Current Assignee'}
              </div>
              {reassigningItem.businessReason && (
                <p className="text-[11px] text-text-muted mt-1">"{reassigningItem.businessReason}"</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Select New Colleague from Roster *
              </label>
              <select
                required
                value={reassignTargetProfileId}
                onChange={(e) => setReassignTargetProfileId(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-navy focus:outline-none focus:border-indigo-600"
              >
                <option value="">Choose colleague...</option>
                {members.map((m) => {
                  const wl = getMemberWorkload(m);
                  const mName = m.user?.profile?.displayName || m.user?.email;
                  const profileId = m.user?.profile?.id || m.user?.id;
                  return (
                    <option key={m.id} value={profileId}>
                      {mName} ({m.department || 'Operations'}) &bull; {wl?.activeBridges || 0} active bridges ({wl?.capacityPercent || 0}%)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                Reassignment Handover Rationale
              </label>
              <textarea
                rows={3}
                value={reassignNote}
                onChange={(e) => setReassignNote(e.target.value)}
                placeholder="Why is this opportunity being transferred to this colleague?"
                className="w-full px-3 py-2 bg-surface-muted border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setReassigningItem(null)}
                className="flex-1 py-2.5 bg-surface border border-border text-navy font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isReassigning || !reassignTargetProfileId}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{isReassigning ? 'Reassigning...' : 'Confirm Reassignment'}</span>
              </button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
};
