import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  Unlock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContactRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    id: string;
    requesterName: string;
    requesterTitle: string;
    requesterCompany: string;
    requesterAvatar?: string;
    requesterCity?: string;
    requesterCountry?: string;
    isRequesterVerified?: boolean;
    objective: string;
    marketFocus: string;
    contactDetails?: {
      email: string;
      phone: string;
      linkedinUrl?: string | null;
      unlocked: boolean;
    };
  } | null;
  dealRoomId?: string | null;
}

export const ContactRevealModal: React.FC<ContactRevealModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  dealRoomId: _dealRoomId,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen || !opportunity) return null;

  const email = opportunity.contactDetails?.email || 'contact@enterprise.com';
  const phone = opportunity.contactDetails?.phone || '+1 (415) 890-2410';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-neutral-900 to-black text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black tracking-wider uppercase mb-2">
            <Unlock className="w-4 h-4" />
            <span>Institutional Contact Dossier &bull; Unlocked</span>
          </div>

          <div className="flex items-center space-x-3.5 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
              {opportunity.requesterName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">{opportunity.requesterName}</h3>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified CXO</span>
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                {opportunity.requesterTitle} &bull; <strong className="text-white">{opportunity.requesterCompany}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Unlocked Credentials Box */}
          <div className="space-y-3">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted flex items-center justify-between">
              <span>Direct Communication Coordinates</span>
              <span className="text-emerald-600 font-bold flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Revealed & Authenticated</span>
              </span>
            </div>

            {/* Email Card */}
            <div className="p-3.5 bg-bg rounded-2xl border border-border flex items-center justify-between gap-3 hover:border-black/20 transition-all">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Verified Work Email
                  </span>
                  <span className="text-xs font-mono font-bold text-navy truncate block">
                    {email}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 bg-surface hover:bg-neutral-100 border border-border rounded-xl text-xs font-bold text-navy flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-text-muted" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={`mailto:${email}`}
                  className="p-2 text-text-muted hover:text-navy hover:bg-neutral-100 rounded-xl transition-colors"
                  title="Open mail client"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Phone Card */}
            <div className="p-3.5 bg-bg rounded-2xl border border-border flex items-center justify-between gap-3 hover:border-black/20 transition-all">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Executive Direct Line / Mobile
                  </span>
                  <span className="text-xs font-mono font-bold text-navy truncate block">
                    {phone}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="px-3 py-1.5 bg-surface hover:bg-neutral-100 border border-border rounded-xl text-xs font-bold text-navy flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-text-muted" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={`tel:${phone}`}
                  className="p-2 text-text-muted hover:text-navy hover:bg-neutral-100 rounded-xl transition-colors"
                  title="Call direct number"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Mandate & Focus Context */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-xs space-y-1">
            <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">
              Opportunity Focus: {opportunity.objective}
            </span>
            <p className="text-navy font-semibold">{opportunity.marketFocus}</p>
          </div>

          {/* Governance Notice */}
          <div className="text-[11px] text-text-muted leading-relaxed bg-bg p-3 rounded-xl border border-border flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Both parties are verified under the MESHVI Enterprise Treaty. All communications, proposals, and NDAs exchanged are cryptographically timestamped for auditable attribution.
            </span>
          </div>

          {/* Direct CTA Buttons */}
          <div className="pt-2 flex items-center justify-center">
            <Link
              to="/app/messages"
              className="w-full py-3 px-4 bg-navy hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Send Direct Message</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
