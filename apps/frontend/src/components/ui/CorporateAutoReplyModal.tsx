import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface CorporateAutoReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onSaved?: (config: { enabled: boolean; slaHours: number; template: string }) => void;
}

const SLA_OPTIONS = [
  { hours: 12, label: '12 Hours (Ultra-Fast CXO SLA)' },
  { hours: 24, label: '24 Hours (Standard Institutional SLA)' },
  { hours: 48, label: '48 Hours (Standard Corporate Desk)' },
  { hours: 72, label: '72 Hours (3 Business Days Evaluation)' },
];

export const CorporateAutoReplyModal: React.FC<CorporateAutoReplyModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  onSaved,
}) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  const [enabled, setEnabled] = useState(false);
  const [slaHours, setSlaHours] = useState(24);
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const defaultTemplate = `Thank you for reaching out to ${companyName}. Your institutional partnership inquiry has been routed to our departmental triage desk. An authorized functional lead will review your pitch within ${slaHours} hours.`;

  useEffect(() => {
    if (!token || !isOpen || !companyId) return;
    const fetchConfig = async () => {
      setFetching(true);
      setError('');
      try {
        const res = await fetch(`/api/v1/companies/${companyId}/inbound-auto-reply`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data) {
          setEnabled(Boolean(data.enabled));
          setSlaHours(data.slaHours || 24);
          setTemplate(data.template || defaultTemplate);
        } else {
          setTemplate(defaultTemplate);
        }
      } catch {
        setTemplate(defaultTemplate);
      } finally {
        setFetching(false);
      }
    };
    fetchConfig();
  }, [token, isOpen, companyId]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/companies/${companyId}/inbound-auto-reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled,
          slaHours,
          template: template.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || (!data.success && data.status !== 'success')) {
        throw new Error(data.message || data.error?.message || 'Failed to save auto-reply configuration.');
      }

      showToast({
        title: 'Auto-Reply Policy Saved ⚡',
        message: enabled
          ? `Inbound auto-acknowledgment is active with a committed ${slaHours}h response SLA.`
          : 'Corporate auto-reply policy updated (currently paused).',
        type: 'success',
      });

      onSaved?.({ enabled, slaHours, template: template.trim() });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving auto-reply configuration.');
    } finally {
      setLoading(false);
    }
  };

  const previewMessage = template
    ? template.replace(/\{company\}/gi, companyName).replace(/\{sla\}/gi, `${slaHours}`)
    : defaultTemplate;

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-start justify-between bg-bg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                Action 5: Institutional SLA Engine
              </span>
              <h2 className="text-base font-extrabold text-navy mt-1">
                Corporate Auto-Replies & SLAs
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Configuring for: <strong className="text-navy">{companyName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-navy p-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {fetching ? (
          <div className="p-12 text-center text-xs text-text-muted space-y-3">
            <Clock className="w-8 h-8 text-black mx-auto animate-spin" />
            <p className="font-bold text-navy">Loading corporate auto-reply configuration...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Toggle Switch */}
            <div className="p-4 bg-bg rounded-2xl border border-border flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-navy block">
                Enable Inbound Auto-Acknowledgment
              </span>
              <span className="text-[11px] text-text-muted block mt-0.5">
                Automatically dispatches an official institutional receipt to counterparties when they submit an inbound bridge.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enabled ? 'bg-emerald-600' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Response SLA Commitment */}
          <div>
            <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-black" />
              <span>Public Response SLA Commitment</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SLA_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setSlaHours(opt.hours)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    slaHours === opt.hours
                      ? 'bg-black text-white font-bold shadow-xs border-black'
                      : 'bg-surface border-border hover:bg-bg text-text-muted'
                  }`}
                >
                  <span className="block font-black text-sm">{opt.hours}h SLA</span>
                  <span className="text-[10px] opacity-80 block mt-0.5">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message Template Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-navy uppercase tracking-wider">
                Auto-Reply Message Template
              </label>
              <button
                type="button"
                onClick={() => setTemplate(defaultTemplate)}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Reset to Default
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Write the auto-reply message template..."
              className="w-full p-3.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none resize-none leading-relaxed"
            />
            <p className="text-[10px] text-text-muted mt-1">
              Supports dynamic placeholders: <code>{'{company}'}</code> and <code>{'{sla}'}</code>.
            </p>
          </div>

          {/* Counterparty Live Simulator / Preview */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-navy uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-black" />
              <span>Counterparty Inbound Experience Preview</span>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-950 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>⚡ Instant Acknowledgment &bull; {companyName}</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 font-extrabold text-[10px] rounded">
                  {slaHours}h SLA Active
                </span>
              </div>
              <p className="text-emerald-900 leading-relaxed italic">"{previewMessage}"</p>
            </div>
          </div>

          {/* Footer CTA */}
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
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{loading ? 'Saving...' : 'Save Auto-Reply Policy'}</span>
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
