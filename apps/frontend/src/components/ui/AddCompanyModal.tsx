import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Mail,
  Globe,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Copy,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (company: any) => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token, refreshUser } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'create' | 'invite'>('create');
  const [createdCompany, setCreatedCompany] = useState<any | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [domain, setDomain] = useState('');
  const [workEmail, setWorkEmail] = useState('');

  // Team invite fields
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setName('');
      setCity('');
      setDomain('');
      setWorkEmail('');
      setCreatedCompany(null);
      setActiveTab('create');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a company name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: any = {
        name: name.trim(),
        industry: industry.trim() || 'General Business',
        headquartersCity: city.trim() || undefined,
        headquartersCountry: country.trim() || undefined,
        domain: domain.trim() || undefined,
        websiteUrl: domain.trim() ? (domain.startsWith('http') ? domain : `https://${domain}`) : undefined,
      };

      const res = await fetch('/api/v1/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to create company.');
      }

      const created = data.data;
      setCreatedCompany(created);
      await refreshUser();

      showToast({
        title: '🏢 Company Created!',
        message: `${created.name} is now registered under your profile with Admin rights.`,
        type: 'success',
      });

      // Switch to invite tab
      setActiveTab('invite');
      onSuccess?.(created);
    } catch (err: any) {
      setError(err.message || 'Unable to register company.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !createdCompany?.id) return;

    setInviting(true);
    try {
      const res = await fetch(`/api/v1/companies/${createdCompany.id}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to dispatch invitation.');
      }

      showToast({
        title: 'Invitation Sent',
        message: `Teammate invitation dispatched to ${inviteEmail}.`,
        type: 'success',
      });
      setInviteEmail('');
    } catch (err: any) {
      showToast({
        title: 'Invitation Note',
        message: err.message || 'Invitation created. Share the link directly.',
        type: 'info',
      });
    } finally {
      setInviting(false);
    }
  };

  const inviteLink = createdCompany
    ? `${window.location.origin}/register?company=${encodeURIComponent(createdCompany.name)}`
    : '';

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    showToast({
      title: 'Link Copied',
      message: 'Share this link with colleagues to join your company on Meshvi.',
      type: 'info',
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-hidden flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-navy">
                {activeTab === 'invite' ? 'Invite Team Members' : 'Add Company Profile'}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {activeTab === 'invite'
                  ? `Build your team roster at ${createdCompany?.name}`
                  : 'Register your organization and become Primary Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-navy p-1.5 rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                  Company / Organization Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Technologies Private Limited"
                    className="w-full pl-9 pr-3 py-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                  Industry / Sector
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-black"
                >
                  <option value="Technology & Software">Technology & Software</option>
                  <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                  <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                  <option value="Automotive & Mobility">Automotive & Mobility</option>
                  <option value="Financial Services & FinTech">Financial Services & FinTech</option>
                  <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                  <option value="FMCG & Consumer Goods">FMCG & Consumer Goods</option>
                  <option value="Consulting & Professional Services">Consulting & Professional Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru"
                      className="w-full pl-8 pr-3 py-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India, Singapore"
                    className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                  Website or Corporate Domain (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. acme.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-navy uppercase tracking-wider mb-1">
                  Corporate Work Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                <span className="font-bold text-neutral-900 block">✓ Zero Friction Registration</span>
                <p>
                  No complex DNS setup or legal certificate audits needed. As the creator, you own this company page and can invite colleagues.
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-navy rounded-xl border border-border hover:bg-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Register Company'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Company Successfully Registered!</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  <strong>{createdCompany?.name}</strong> is now live. Invite your team members so they appear on your organization roster.
                </p>
              </div>

              {/* Shareable Invite Link */}
              <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                <label className="block text-[11px] font-bold text-navy uppercase tracking-wider">
                  🔗 1-Click Team Registration Link
                </label>
                <p className="text-[11px] text-text-muted">
                  Anyone who signs up using this link will automatically join your company roster:
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="w-full p-2 bg-bg border border-border rounded-lg text-xs font-mono text-navy select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg shrink-0 flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Email Invite */}
              <form onSubmit={handleSendInvite} className="p-4 bg-surface rounded-xl border border-border space-y-3">
                <label className="block text-[11px] font-bold text-navy uppercase tracking-wider">
                  ✉️ Invite Colleague by Email
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-bg border border-border rounded-lg text-xs text-navy focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <select
                      value={inviteRole}
                      onChange={(e: any) => setInviteRole(e.target.value)}
                      className="px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs text-navy"
                    >
                      <option value="MEMBER">Role: Member</option>
                      <option value="ADMIN">Role: Company Admin</option>
                    </select>
                    <button
                      type="submit"
                      disabled={inviting || !inviteEmail.trim()}
                      className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{inviting ? 'Sending...' : 'Send Invite'}</span>
                    </button>
                  </div>
                </div>
              </form>

              <div className="pt-3 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
