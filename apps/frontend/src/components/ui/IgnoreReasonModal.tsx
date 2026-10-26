import React, { useState } from 'react';
import { X, AlertOctagon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface IgnoreReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  requesterName: string;
  onSuccess?: () => void;
}

const IGNORE_REASONS = [
  { id: 'ROADMAP', label: 'Outside Current Strategic Roadmap', desc: 'No commercial initiative aligns with this in current quarters.' },
  { id: 'CAPACITY', label: 'No Current Bandwidth / Resource Capacity', desc: 'Team is operating at full bandwidth with existing pipeline.' },
  { id: 'ALIGNMENT', label: 'Low Commercial Alignment / Not a Fit', desc: 'Proposition does not match company domain or objectives.' },
  { id: 'DUPLICATE', label: 'Duplicate / Redundant Outreach', desc: 'Already in discussion or received duplicate inquiry.' },
  { id: 'OTHER', label: 'Other Context', desc: 'Specify reason for organizational records.' },
];

export const IgnoreReasonModal: React.FC<IgnoreReasonModalProps> = ({
  isOpen,
  onClose,
  connectionId,
  requesterName,
  onSuccess,
}) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();
  const [selectedReason, setSelectedReason] = useState(IGNORE_REASONS[0].id);
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleIgnore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const chosen = IGNORE_REASONS.find((r) => r.id === selectedReason);
    const finalReason = selectedReason === 'OTHER' && customNote.trim()
      ? customNote.trim()
      : chosen?.label || 'Ignored by recipient';

    try {
      const res = await fetch(`/api/v1/connections/${connectionId}/ignore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: finalReason }),
      });

      if (!res.ok) {
        throw new Error('Failed to ignore request');
      }

      showToast({
        title: 'Request Ignored & Archived',
        message: `Request from ${requesterName} archived with reason: ${finalReason}.`,
        type: 'info',
      });

      onSuccess?.();
      onClose();
    } catch {
      showToast({
        title: 'Error',
        message: 'Could not archive request. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-200 text-neutral-800 flex items-center justify-center font-bold">
              <AlertOctagon className="w-5 h-5 text-neutral-700" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-navy">Ignore Connection Request</h2>
              <p className="text-[11px] text-text-muted">Inbound from: <strong className="text-navy">{requesterName}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-navy p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleIgnore} className="space-y-3">
          <label className="block text-[11px] font-bold text-navy uppercase tracking-wider">
            Select Archive / Ignore Reason:
          </label>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {IGNORE_REASONS.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedReason(r.id)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                  selectedReason === r.id
                    ? 'bg-neutral-100 border-black shadow-xs font-semibold'
                    : 'bg-surface border-border hover:bg-bg'
                }`}
              >
                <div className="font-bold text-navy">{r.label}</div>
                <div className="text-[10px] text-text-muted">{r.desc}</div>
              </div>
            ))}
          </div>

          {selectedReason === 'OTHER' && (
            <div>
              <label className="block text-[10px] font-bold text-navy uppercase mb-1">
                Custom Reason Note:
              </label>
              <textarea
                required
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Reason for archiving request..."
                className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
              />
            </div>
          )}

          <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-text-muted hover:text-navy rounded-xl border border-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-neutral-800 hover:bg-black text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Archiving...' : 'Confirm & Ignore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
