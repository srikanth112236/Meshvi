import React, { useState } from 'react';
import {
  X,
  Forward,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface ColleagueItem {
  id: string;
  displayName: string;
  currentTitle?: string;
  function?: string;
}

interface DelegateToColleagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  requesterName: string;
  opportunitySummary: string;
  onSuccess?: () => void;
}

export const DelegateToColleagueModal: React.FC<DelegateToColleagueModalProps> = ({
  isOpen,
  onClose,
  connectionId,
  requesterName,
  opportunitySummary,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  // Colleague directory dynamically loaded from company roster
  const [colleagues, setColleagues] = useState<ColleagueItem[]>([
    { id: '418b6422-b936-4bfa-8d27-20fb7304695f', displayName: 'Priya Sharma', currentTitle: 'Head of Business Development', function: 'Business Development' },
    { id: 'colleague-2', displayName: 'David Tan', currentTitle: 'Director of Strategic Alliances', function: 'Partnerships' },
    { id: 'colleague-3', displayName: 'Amanda Wong', currentTitle: 'VP of Commercial Procurement', function: 'Procurement' },
    { id: 'colleague-4', displayName: 'Alex Chen', currentTitle: 'Regional Sales Director, APAC', function: 'Sales & Channel' },
  ]);

  const [selectedColleagueId, setSelectedColleagueId] = useState<string>(colleagues[0].id);
  const [delegationNote, setDelegationNote] = useState(
    'Passing this connection over to you as it directly aligns with your team focus.'
  );
  const [acceptAndConnect, setAcceptAndConnect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!token || !isOpen) return;
    const loadPeers = async () => {
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
    loadPeers();
  }, [token, isOpen]);

  if (!isOpen) return null;

  const handleDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
          acceptAndConnect,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to forward request.');
      }

      const assignedColleague = colleagues.find((c) => c.id === selectedColleagueId);

      showToast({
        title: 'Forwarded to Colleague',
        message: `Successfully forwarded request from ${requesterName} to ${assignedColleague?.displayName || 'colleague'}.`,
        type: 'success',
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred while forwarding request.');
    } finally {
      setLoading(false);
    }
  };

  const selectedColleague = colleagues.find((c) => c.id === selectedColleagueId);

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-start justify-between bg-bg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                Forward to Colleague
              </span>
              <h2 className="text-base font-extrabold text-navy mt-1">
                Pass to Teammate
              </h2>
              <div className="text-xs text-text-muted flex items-center space-x-1.5 mt-0.5">
                <span>Inbound from: <strong className="text-navy">{requesterName}</strong></span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-navy p-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDelegate} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Simple Explanation */}
          <p className="text-xs text-text-muted">
            Can't handle this request yourself? Forward it to a teammate at your organization who can assist.
          </p>

          {/* Opportunity Summary Card */}
          <div className="p-3 bg-bg rounded-xl border border-border text-xs space-y-1">
            <div className="text-[10px] font-bold text-text-muted uppercase">Inbound Message:</div>
            <p className="text-navy font-medium italic line-clamp-3">"{opportunitySummary}"</p>
          </div>

          {/* Accept and Connect Option */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptAndConnect}
                onChange={(e) => setAcceptAndConnect(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
              />
              <div className="text-xs">
                <span className="font-extrabold text-emerald-950 block">
                  Accept connection and introduce to colleague
                </span>
                <span className="text-[11px] text-emerald-800 block mt-0.5">
                  Connects with {requesterName} and unlocks their contact email and phone number for your colleague.
                </span>
              </div>
            </label>
          </div>

          {/* Colleague Selector */}
          <div>
            <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1.5">
              Choose Teammate
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {colleagues.map((col) => (
                <div
                  key={col.id}
                  onClick={() => setSelectedColleagueId(col.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
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
          </div>

          {/* Note to Colleague */}
          <div>
            <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
              Note to Colleague (Optional)
            </label>
            <textarea
              required
              rows={3}
              value={delegationNote}
              onChange={(e) => setDelegationNote(e.target.value)}
              placeholder="Hi, passing this over to you as it fits your area..."
              className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none resize-none leading-relaxed"
            />
            <p className="text-[10px] text-text-muted mt-1.5">
              {requesterName} will be notified that you passed this request to {selectedColleague?.displayName || 'your colleague'}.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-navy rounded-xl border border-border hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Forward className="w-3.5 h-3.5" />
              <span>{loading ? 'Forwarding...' : 'Forward to Colleague'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
