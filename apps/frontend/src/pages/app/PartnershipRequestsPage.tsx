import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Send,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Handshake,
  UserPlus,
  Building2,
  Search,
  MessageSquare,
  XCircle,
  FileText,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import {
  PartnershipRequestItem,
  getStoredPartnershipRequests,
  saveStoredPartnershipRequests,
} from '../../data/partnershipsData';

export const PartnershipRequestsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [requests, setRequests] = useState<PartnershipRequestItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOMING' | 'OUTGOING'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setRequests(getStoredPartnershipRequests());
  }, []);

  const handleUpdateStatus = (
    requestId: string,
    newStatus: 'ACCEPTED' | 'DECLINED' | 'IN_DISCUSSION'
  ) => {
    setRequests((prev) => {
      const updated = prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: newStatus,
            isAlreadyConnected: newStatus === 'ACCEPTED' ? true : r.isAlreadyConnected,
          };
        }
        return r;
      });
      saveStoredPartnershipRequests(updated);
      return updated;
    });

    if (newStatus === 'ACCEPTED') {
      showToast({
        title: 'Partnership Accepted & Connected 🤝',
        message: 'Bilateral partnership accepted. Counterparty is now connected as 1st-degree.',
        type: 'success',
      });
    } else if (newStatus === 'DECLINED') {
      showToast({
        title: 'Request Declined',
        message: 'Partnership inquiry was archived.',
        type: 'info',
      });
    } else {
      showToast({
        title: 'Moved to Active Discussion',
        message: 'Partnership moved to discussion stage.',
        type: 'opportunity',
      });
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'INCOMING' && r.direction !== 'INCOMING') return false;
    if (activeTab === 'OUTGOING' && r.direction !== 'OUTGOING') return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPost = r.postTitle.toLowerCase().includes(q);
      const matchCompany =
        r.senderCompany.toLowerCase().includes(q) ||
        r.recipientCompany.toLowerCase().includes(q);
      const matchPerson =
        r.senderName.toLowerCase().includes(q) ||
        r.recipientName.toLowerCase().includes(q);
      if (!matchPost && !matchCompany && !matchPerson) return false;
    }

    return true;
  });

  const incomingPending = requests.filter(
    (r) => r.direction === 'INCOMING' && r.status === 'PENDING'
  ).length;
  const outgoingCount = requests.filter((r) => r.direction === 'OUTGOING').length;
  const inDiscussionCount = requests.filter(
    (r) => r.status === 'IN_DISCUSSION' || r.status === 'ACCEPTED'
  ).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 pt-2">
      {/* 1. Header & Navigation Switcher */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
              <Handshake className="w-3 h-3" />
              <span>Bilateral Pipeline Tracker</span>
            </span>
            <span className="text-xs text-text-muted">• Executive Deal Flow</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-navy tracking-tight">
            Partnership Requests & Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-2xl">
            Review incoming partnership proposals, track outgoing initiatives, and manage executive introductions from post activities.
          </p>
        </div>

        {/* Switcher to Posts Feed */}
        <div className="flex items-center space-x-2 shrink-0">
          <Link
            to="/app/partnerships"
            className="px-4 py-2 bg-surface hover:bg-surface-muted text-navy font-bold text-xs rounded-xl border border-border transition-colors flex items-center space-x-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Browse Posts</span>
          </Link>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Total Requests</span>
            <Handshake className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-xl font-black text-navy">{requests.length}</div>
          <div className="text-[10px] text-text-muted">All active bilateral intents</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Needs Review</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-navy">{incomingPending}</div>
          <div className="text-[10px] text-amber-700 font-semibold">Incoming inquiries awaiting action</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>In Discussion</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-navy">{inDiscussionCount}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">Active bilateral dialogues</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Sent by You</span>
            <Send className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-navy">{outgoingCount}</div>
          <div className="text-[10px] text-text-muted">Proposals initiated</div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by post title, company, or executive name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-surface-muted/60 border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-2xs"
            />
          </div>

          {/* Direction Tabs */}
          <div className="inline-flex p-1 bg-surface-muted border border-border rounded-xl self-start sm:self-auto shadow-2xs">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-surface text-navy shadow-xs border border-border'
                  : 'text-text-muted hover:text-navy'
              }`}
            >
              All Inquiries ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('INCOMING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                activeTab === 'INCOMING'
                  ? 'bg-surface text-navy shadow-xs border border-border'
                  : 'text-text-muted hover:text-navy'
              }`}
            >
              <Inbox className="w-3 h-3 text-amber-600" />
              <span>Received</span>
              {incomingPending > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-bold ml-1">
                  {incomingPending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('OUTGOING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                activeTab === 'OUTGOING'
                  ? 'bg-surface text-navy shadow-xs border border-border'
                  : 'text-text-muted hover:text-navy'
              }`}
            >
              <Send className="w-3 h-3 text-indigo-600" />
              <span>Sent</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-bold ml-1">
                {outgoingCount}
              </span>
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center space-x-2 pt-1 border-t border-border/70 text-xs">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Status:</span>
          {['ALL', 'PENDING', 'IN_DISCUSSION', 'ACCEPTED', 'DECLINED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border transition-colors ${
                statusFilter === st
                  ? 'bg-navy text-white border-navy shadow-2xs'
                  : 'bg-surface border-border text-text-muted hover:text-navy'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Requests List */}
      <div className="space-y-3.5">
        {filteredRequests.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-2xl p-10 text-center space-y-2">
            <Inbox className="w-8 h-8 text-text-muted mx-auto" />
            <h3 className="text-sm font-bold text-navy">No partnership requests found</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Requests initiated from partnership posts will appear here with full counterparty details and response tracking.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isIncoming = req.direction === 'INCOMING';
            const counterpartyName = isIncoming ? req.senderName : req.recipientName;
            const counterpartyRole = isIncoming ? req.senderRole : req.recipientRole;
            const counterpartyCompany = isIncoming ? req.senderCompany : req.recipientCompany;
            const counterpartyAvatar = isIncoming ? req.senderAvatar : req.recipientAvatar;

            return (
              <div
                key={req.id}
                className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs hover:border-primary/40 transition-all space-y-3"
              >
                {/* Header: Origin Post Reference & Direction Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                        isIncoming
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {isIncoming ? 'Received Inquiry' : 'Sent Proposal'}
                    </span>
                    <div className="text-xs text-text-muted truncate">
                      Initiated from post:{' '}
                      <Link
                        to={req.postId ? `/app/partnerships?postId=${req.postId}` : '/app/partnerships'}
                        className="font-bold text-navy hover:text-primary hover:underline"
                      >
                        &quot;{req.postTitle}&quot;
                      </Link>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        req.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : req.status === 'IN_DISCUSSION'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : req.status === 'DECLINED'
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {req.status === 'PENDING' && '⏳ Pending Review'}
                      {req.status === 'IN_DISCUSSION' && '💬 In Discussion'}
                      {req.status === 'ACCEPTED' && '🤝 Connected & Agreed'}
                      {req.status === 'DECLINED' && '✕ Archived'}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Counterparty & Proposal Note */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Counterparty Profile */}
                  <div className="flex items-center space-x-3 shrink-0 md:w-64">
                    {counterpartyAvatar ? (
                      <img
                        src={counterpartyAvatar}
                        alt={counterpartyName}
                        className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-navy text-white text-sm font-black flex items-center justify-center shrink-0">
                        {counterpartyName[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-navy truncate flex items-center space-x-1">
                        <span>{counterpartyName}</span>
                        {req.isAlreadyConnected && (
                          <span title="1st-Degree Connection" className="text-[10px]">
                            🤝
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">{counterpartyRole}</div>
                      <div className="text-[10px] font-bold text-navy flex items-center space-x-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-primary" />
                        <span className="truncate">{counterpartyCompany}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Reason & Note */}
                  <div className="flex-1 space-y-1 bg-surface-muted/50 p-3 rounded-xl border border-border/80">
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="font-bold text-navy">
                        {req.reasonType === 'PARTNERSHIP' ? '🤝 Commercial Partnership' : '🔗 Direct Connection'}
                      </span>
                      <span className="text-text-muted">•</span>
                      <span className="text-text-muted">
                        {isIncoming ? 'Note from Counterparty:' : 'Your Proposal Note:'}
                      </span>
                    </div>
                    <p className="text-xs text-text leading-relaxed">&quot;{req.proposalNote}&quot;</p>
                  </div>
                </div>

                {/* Bottom Actions for Executives */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 text-xs">
                  <div className="flex items-center space-x-2 text-[11px] text-text-muted">
                    <span>Target Entity: <strong className="text-navy">{req.postAuthorCompany}</strong></span>
                    <span>•</span>
                    <Link
                      to={req.postId ? `/app/partnerships?postId=${req.postId}` : '/app/partnerships'}
                      className="text-primary hover:underline font-bold flex items-center space-x-0.5"
                    >
                      <span>View Mandate Post</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Decision Actions */}
                  <div className="flex items-center space-x-2">
                    {isIncoming && req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-xs shadow-2xs transition-colors flex items-center space-x-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Accept & Connect 1st-Degree</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'IN_DISCUSSION')}
                          className="px-2.5 py-1.5 bg-surface hover:bg-surface-muted text-navy rounded-lg font-bold text-xs border border-border transition-colors flex items-center space-x-1"
                        >
                          <MessageSquare className="w-3 h-3 text-purple-600" />
                          <span>Discuss</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'DECLINED')}
                          className="p-1.5 text-text-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Decline"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {(!isIncoming || req.status !== 'PENDING') && (
                      <Link
                        to="/app/messages"
                        className="px-3 py-1.5 bg-surface hover:bg-surface-muted text-navy rounded-lg font-bold text-xs border border-border transition-colors flex items-center space-x-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                        <span>Open Direct Chat</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
