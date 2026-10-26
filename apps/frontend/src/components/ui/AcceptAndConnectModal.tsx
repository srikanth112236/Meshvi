import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  Users,
  UserCheck,
  Mail,
  Copy,
  Check,
  Building,
  Briefcase,
  MessageSquare,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';

interface ColleagueItem {
  id: string;
  displayName: string;
  currentTitle?: string;
  function?: string;
}

interface AcceptAndConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  requester: {
    id: string;
    email: string;
    phoneNumber?: string | null;
    profile?: {
      displayName: string;
      headline: string | null;
      function: string | null;
      phoneNumber?: string | null;
      company?: { name: string } | null;
    } | null;
  };
  businessReason: string;
  onSuccess?: () => void;
}

export const AcceptAndConnectModal: React.FC<AcceptAndConnectModalProps> = ({
  isOpen,
  onClose,
  connectionId,
  requester,
  businessReason,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  const [triageMode, setTriageMode] = useState<'SELECT' | 'DIRECT' | 'TEAM'>('SELECT');
  const [colleagues, setColleagues] = useState<ColleagueItem[]>([]);
  const [selectedColleagueId, setSelectedColleagueId] = useState<string>('');
  const [delegationNote, setDelegationNote] = useState('Accepted and assigned for specialized follow-up.');
  const [loading, setLoading] = useState(false);
  const [completedDirect, setCompletedDirect] = useState(false);
  const [completedDelegated, setCompletedDelegated] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  useEffect(() => {
    if (!token || !isOpen) return;
    const fetchColleagues = async () => {
      try {
        const res = await fetch('/api/v1/connections/colleagues-for-handover', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setColleagues(data.data);
          setSelectedColleagueId(data.data[0].id);
        }
      } catch {}
    };
    fetchColleagues();
  }, [token, isOpen]);

  if (!isOpen) return null;

  const requesterName = requester?.profile?.displayName || requester?.email || 'Partner Candidate';
  const requesterCompany = requester?.profile?.company?.name || 'Verified Organization';
  const requesterTitle = requester?.profile?.headline || requester?.profile?.function || 'Executive';
  const requesterEmail = requester?.email || 'verified.user@partner.Meshvi';
  const requesterPhone = requester?.phoneNumber || requester?.profile?.phoneNumber || null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(requesterEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    if (!requesterPhone) return;
    navigator.clipboard.writeText(requesterPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleConnectDirectly = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/connections/${connectionId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast({
          title: 'Connection Accepted',
          message: 'Direct communication channel established.',
          type: 'success',
        });
        setCompletedDirect(true);
        onSuccess?.();
      } else {
        throw new Error('Failed to accept');
      }
    } catch {
      showToast({ title: 'Error', message: 'Could not accept connection.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColleagueId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/connections/${connectionId}/delegate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          colleagueProfileId: selectedColleagueId,
          internalMemo: delegationNote,
          acceptAndConnect: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const assigned = colleagues.find((c) => c.id === selectedColleagueId);
        showToast({
          title: 'Accepted & Assigned to Team',
          message: `Opportunity connected and assigned to ${assigned?.displayName || 'colleague'}.`,
          type: 'success',
        });
        setCompletedDelegated(assigned?.displayName || 'Colleague');
        onSuccess?.();
      } else {
        throw new Error(data.error?.message || 'Failed to assign');
      }
    } catch {
      showToast({ title: 'Error', message: 'Could not assign to colleague.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified Connection Action
              </span>
              <h2 className="text-base font-extrabold text-navy mt-0.5">
                {completedDirect || completedDelegated
                  ? 'Opportunity Bridge Established'
                  : 'Accept & Connect Opportunity'}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-navy p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* State 1: Completed Direct View - Reveal verified email & details */}
        {completedDirect && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-900 font-extrabold text-xs uppercase tracking-wider">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>You are now directly connected!</span>
              </div>
              <p className="text-xs text-emerald-800">
                Contact information and verified credentials have been unlocked below.
              </p>
            </div>

            {/* Revealed Contact Data Card */}
            <div className="p-4 bg-bg border border-border rounded-xl space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-black text-white font-extrabold text-sm flex items-center justify-center">
                  {requesterName[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy">{requesterName}</h3>
                  <div className="text-xs text-text-muted flex items-center space-x-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{requesterTitle}</span>
                  </div>
                  <div className="text-xs text-text-muted flex items-center space-x-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>{requesterCompany}</span>
                  </div>
                </div>
              </div>

              {/* Verified Email Card with Copy */}
              <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-sky-600" />
                  <div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      Verified Work Email
                    </div>
                    <div className="text-xs font-mono font-bold text-navy select-all">
                      {requesterEmail}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-navy text-xs font-bold rounded-md flex items-center space-x-1 transition-colors"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Verified Direct Phone Card with Copy & Call */}
              {requesterPhone && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">
                        Verified Direct Mobile Coordinate
                      </div>
                      <div className="text-xs font-mono font-bold text-navy select-all">
                        {requesterPhone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <a
                      href={`tel:${requesterPhone.replace(/\s+/g, '')}`}
                      className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-xs font-bold flex items-center space-x-1 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-navy text-xs font-bold rounded-md flex items-center space-x-1 border border-border transition-colors"
                    >
                      {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Proposal Text */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-text-muted uppercase">Proposal Intent:</div>
                <p className="text-xs text-navy italic bg-surface p-2.5 rounded-lg border border-border">
                  "{businessReason}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <a
                href={`mailto:${requesterEmail}`}
                className="px-4 py-2 border border-border bg-surface hover:bg-bg text-navy text-xs font-bold rounded-xl flex items-center space-x-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Requester</span>
              </a>
              <Link
                to="/app/messages"
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Direct Chat</span>
              </Link>
            </div>
          </div>
        )}

        {/* State 2: Completed Delegated View */}
        {completedDelegated && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-900 font-extrabold text-xs uppercase tracking-wider">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Assigned to {completedDelegated}!</span>
              </div>
              <p className="text-xs text-emerald-800">
                This opportunity has been accepted and transferred to {completedDelegated}'s dashboard.
              </p>
            </div>

            {/* Revealed Contact Data Card provided to team member */}
            <div className="p-4 bg-bg border border-border rounded-xl space-y-3">
              <div className="text-[11px] font-bold text-navy uppercase tracking-wider">
                Credentials Dispatched to {completedDelegated}:
              </div>
              <div className="text-xs space-y-1.5">
                <div><span className="text-text-muted font-medium">Counterparty:</span> <strong>{requesterName}</strong> ({requesterTitle})</div>
                <div><span className="text-text-muted font-medium">Organization:</span> <strong>{requesterCompany}</strong></div>
                <div><span className="text-text-muted font-medium">Work Email:</span> <code className="font-mono font-bold text-navy">{requesterEmail}</code></div>
                <div><span className="text-text-muted font-medium">Intent:</span> <em>"{businessReason}"</em></div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* State 3: Triage Selection or Execution View */}
        {!completedDirect && !completedDelegated && (
          <div className="space-y-4">
            {triageMode === 'SELECT' && (
              <div className="space-y-3">
                <p className="text-xs text-text-muted">
                  Choose how your company wishes to handle this inbound request from <strong className="text-navy">{requesterName}</strong>:
                </p>

                {/* Option 1: Direct Connect */}
                <div
                  onClick={handleConnectDirectly}
                  className="p-4 rounded-xl border border-border hover:border-black bg-surface hover:bg-bg cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <UserCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-navy group-hover:text-black">
                        Accept & Connect Directly
                      </div>
                      <div className="text-[11px] text-text-muted">
                        You lead the connection. Unlocks full contact email and initiates direct collaboration.
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-black shrink-0 ml-2" />
                </div>

                {/* Option 2: Route to Team Member */}
                <div
                  onClick={() => setTriageMode('TEAM')}
                  className="p-4 rounded-xl border border-border hover:border-black bg-surface hover:bg-bg cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 text-white flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-navy group-hover:text-black">
                        Accept & Route to Team Member
                      </div>
                      <div className="text-[11px] text-text-muted">
                        Select a colleague from your company roster to handle and own this opportunity.
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-black shrink-0 ml-2" />
                </div>
              </div>
            )}

            {/* Team Member Selection Mode */}
            {triageMode === 'TEAM' && (
              <form onSubmit={handleAssignToTeamMember} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1.5">
                    Select Assigned Team Member from Organization Roster:
                  </label>
                  {colleagues.length === 0 ? (
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-text-muted">
                      No additional colleagues found on your company roster. You can invite team members in Company settings.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {colleagues.map((col) => (
                        <div
                          key={col.id}
                          onClick={() => setSelectedColleagueId(col.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                            selectedColleagueId === col.id
                              ? 'bg-neutral-100 border-black shadow-xs font-semibold'
                              : 'bg-surface border-border hover:bg-bg'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {col.displayName[0]}
                            </div>
                            <div>
                              <div className="font-bold text-navy">{col.displayName}</div>
                              <div className="text-[11px] text-text-muted">{col.currentTitle}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-text-muted">
                            {col.function}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                    Internal Handover Memo (Visible to Colleague):
                  </label>
                  <textarea
                    rows={2}
                    value={delegationNote}
                    onChange={(e) => setDelegationNote(e.target.value)}
                    placeholder="Instructions for your colleague..."
                    className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setTriageMode('SELECT')}
                    className="text-xs text-text-muted hover:text-navy underline"
                  >
                    &larr; Back to Options
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedColleagueId}
                    className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {loading ? 'Assigning...' : 'Confirm & Assign to Colleague'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
