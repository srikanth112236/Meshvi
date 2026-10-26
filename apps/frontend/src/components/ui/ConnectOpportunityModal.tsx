import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export interface ConnectOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: {
    id: string;
    displayName: string;
    currentTitle?: string;
    companyName?: string;
    city?: string;
    countryCode?: string;
    matchScore?: number;
    initialMode?: 'DIRECT' | 'WARM_INTRO_ONLY' | 'HYBRID';
    intermediaryProfileId?: string;
    intermediaryUserId?: string;
    intermediaryName?: string;
    intermediaryTitle?: string;
    intermediaryCompany?: string;
    connectionAvailability?: string;
    intents?: Array<{ intentType: string; description: string }>;
  } | null;
  onSuccess?: () => void;
}

export interface SmartDraftItem {
  id: string;
  label: string;
  text: string;
  chars: number;
}

export interface LintResultState {
  valid: boolean;
  charCount: number;
  maxChars: number;
  remainingChars: number;
  isOverLimit: boolean;
  flaggedSpamWords: string[];
  replacementSuggestions: Record<string, string>;
  recommendation: string;
  qualityScore?: number;
  structureRating?: {
    hasHook: boolean;
    hasSynergyOrMetric: boolean;
    hasClearCta: boolean;
    componentsIdentified: number;
  };
}

export const ConnectOpportunityModal: React.FC<ConnectOpportunityModalProps> = ({
  isOpen,
  onClose,
  targetProfile,
  onSuccess,
}) => {
  const { user, token } = useAuth();
  const { showToast } = useNotifications();

  const [businessReason, setBusinessReason] = useState('');
  const [draftIndex, setDraftIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState('');

  // Initial greeting note when modal opens
  useEffect(() => {
    if (!targetProfile) return;
    const company = targetProfile.companyName ? ` at ${targetProfile.companyName}` : '';
    setBusinessReason(
      `Hi ${targetProfile.displayName}, I noticed your work${company} and would love to connect.`
    );
    setError('');
    setDraftIndex(0);
  }, [targetProfile?.id, isOpen]);

  // Cycle through clean, friendly message drafts
  const cycleSmartDraft = () => {
    if (!targetProfile) return;
    const company = targetProfile.companyName ? ` at ${targetProfile.companyName}` : '';
    const variations = [
      `Hi ${targetProfile.displayName}, I noticed your work${company} and would love to connect. Open to a brief conversation?`,
      `Hi ${targetProfile.displayName}, our work closely aligns with your focus. Would value connecting with you here.`,
      `Hi ${targetProfile.displayName}, following your leadership${company}. Would love to connect and exchange perspectives.`,
    ];
    const nextIdx = (draftIndex + 1) % variations.length;
    setDraftIndex(nextIdx);
    setBusinessReason(variations[nextIdx]);
    showToast({ title: 'Draft Updated', message: `Applied draft #${nextIdx + 1}.`, type: 'info' });
  };

  // Generate AI pitch under 270 chars
  const handleAiPitchGenerate = async () => {
    if (!targetProfile) return;
    setAiGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/v1/ai/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetTitle: targetProfile.currentTitle || 'Professional',
          targetCompany: targetProfile.companyName || 'Enterprise',
          objective: `Connecting with ${targetProfile.displayName}`,
          tone: 'collaborative and professional',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        let pitch = (data.data?.pitch || '').trim();
        if (pitch.length > 270) {
          pitch = pitch.slice(0, 270).trim() + '.';
        }
        setBusinessReason(pitch);
      } else {
        throw new Error(data.error?.message || 'AI generation failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to generate pitch.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Universal Escape key dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const isCircular = Boolean(user?.profile?.id && targetProfile?.id && user.profile.id === targetProfile.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCircular) {
      setError('You cannot send a connection request to your own profile.');
      return;
    }

    if (!businessReason.trim()) {
      setError('Please write a short message.');
      return;
    }

    if (businessReason.length > 300) {
      setError('Message exceeds the 300-character limit.');
      return;
    }

    if (!targetProfile) return;

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/v1/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientProfileId: targetProfile.id,
          businessReason: businessReason.trim(),
          opportunityPitch: businessReason.trim(),
          mutualGoals: `Direct Connection | ${targetProfile.companyName || 'Professional'}`,
          recipientProfileIds: [targetProfile.id],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || (Array.isArray(data.message) ? data.message.join(', ') : 'Failed to send message.'));
      }

      showToast({
        title: '👋 Message Sent',
        message: `Your message was delivered to ${targetProfile.displayName}.`,
        type: 'success',
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send connection message.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !targetProfile) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {targetProfile.displayName ? targetProfile.displayName[0] : 'U'}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-navy truncate">
                Say Hi to {targetProfile.displayName}
              </h2>
              <p className="text-xs text-text-muted truncate mt-0.5">
                {targetProfile.currentTitle ? `${targetProfile.currentTitle} • ` : ''}
                <span className="font-semibold text-navy">{targetProfile.companyName || ''}</span>
                {targetProfile.city ? ` (${targetProfile.city})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-navy p-1.5 rounded-lg hover:bg-surface transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Simple Message Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">
                  Message
                </label>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={cycleSmartDraft}
                    disabled={loading || isCircular}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    title="Cycle sample drafts"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Draft #{draftIndex + 1}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAiPitchGenerate}
                    disabled={aiGenerating || loading || isCircular}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    title="Generate an AI pitch"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>{aiGenerating ? 'Generating...' : 'AI Pitch'}</span>
                  </button>
                </div>
              </div>

              <textarea
                required
                rows={5}
                maxLength={300}
                value={businessReason}
                onChange={(e) => {
                  const val = e.target.value;
                  setBusinessReason(val.length > 300 ? val.slice(0, 300) : val);
                }}
                disabled={loading || isCircular}
                placeholder={`Write a friendly note to ${targetProfile.displayName}...`}
                className={`w-full p-3.5 bg-bg border rounded-xl text-xs text-navy leading-relaxed focus:outline-none transition-colors ${
                  businessReason.length > 300
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-border focus:border-black'
                }`}
              />

              {/* Character Counter & Auto-Trim */}
              <div className="flex items-center justify-between text-[11px] text-text-muted pt-0.5">
                <span className={businessReason.length > 300 ? 'text-rose-600 font-bold' : ''}>
                  {businessReason.length} / 300 characters
                </span>
                {businessReason.length > 300 && (
                  <button
                    type="button"
                    onClick={() => setBusinessReason(businessReason.slice(0, 300))}
                    className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-[10px]"
                  >
                    Auto-Trim to 300
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
              disabled={loading || !businessReason.trim() || isCircular || businessReason.length > 300}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : '👋 Say Hi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
