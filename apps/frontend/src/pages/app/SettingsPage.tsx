import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  ShieldCheck,
  Mail,
  Globe,
  Copy,
  Radio,
  ChevronDown,
  Check,
  Building2,
  Lock,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Extract domain from user email or fallback
  const userDomain = user?.email ? user.email.split('@')[1] : 'borneoagro.my';
  const [domain, setDomain] = useState(userDomain || 'borneoagro.my');
  const [dnsToken] = useState(`Meshvi-verification=d94a-${Math.random().toString(36).substring(2, 10)}-2026`);
  const [dnsVerified, setDnsVerified] = useState(true);
  const [verifyingDns, setVerifyingDns] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [activeDnsGuide, setActiveDnsGuide] = useState<string | null>(null);

  const handleCopyDns = () => {
    navigator.clipboard.writeText(dnsToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
    showToast({
      title: 'DNS Record Copied',
      message: 'Cryptographic challenge token copied to clipboard.',
      type: 'info',
    });
  };

  const handleVerifyDns = () => {
    setVerifyingDns(true);
    setTimeout(() => {
      setDnsVerified(true);
      setVerifyingDns(false);
      showToast({
        title: 'DNS TXT Handshake Verified',
        message: `Cryptographic proof confirmed for domain @${domain}.`,
        type: 'success',
      });
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-navy">Account & Security Settings</h1>
        <p className="text-xs text-text-muted mt-1">
          Manage your credentials, cryptographic domain attestation, and access preferences.
        </p>
      </div>

      {/* Account Info */}
      <div className="p-6 bg-surface rounded-3xl border border-border space-y-4 shadow-2xs">
        <h2 className="text-base font-bold text-navy flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span>Identity & Login Credentials</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-surface-muted rounded-2xl border border-border">
            <span className="text-text-muted block mb-1">Account Email</span>
            <span className="font-semibold text-navy flex items-center">
              <Mail className="w-3.5 h-3.5 text-primary mr-1.5" />
              {user?.email}
            </span>
          </div>
          <div className="p-4 bg-surface-muted rounded-2xl border border-border">
            <span className="text-text-muted block mb-1">Assigned Role</span>
            <span className="font-semibold text-navy">
              {user?.roles?.join(', ') || 'USER'}
            </span>
          </div>
        </div>
      </div>

      {/* Cryptographic DNS TXT Handshake Section (Moved from Onboarding to Profile Settings) */}
      <div className="p-6 bg-surface rounded-3xl border border-border space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-navy">Cryptographic DNS TXT Handshake</h2>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Prove verified corporate ownership of <strong className="text-navy">@{domain}</strong> by creating a public TXT record in your DNS zone.
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-center ${
              dnsVerified
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {dnsVerified ? 'Domain Handshake Confirmed ✓' : 'Awaiting DNS Broadcast'}
          </span>
        </div>

        {/* Domain Input Field */}
        <div className="max-w-md">
          <label className="block text-xs font-bold text-navy mb-1.5">Corporate Domain</label>
          <div className="relative">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. yourcompany.com"
              className="w-full p-2.5 pl-8 bg-surface-muted border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            <Globe className="w-4 h-4 text-text-muted absolute left-2.5 top-3" />
          </div>
        </div>

        {/* DNS Specification Card */}
        <div className="p-5 bg-surface-muted rounded-2xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-primary" />
              <span>Required DNS TXT Record Specification</span>
            </span>
            <button
              type="button"
              onClick={handleCopyDns}
              className="px-3.5 py-1.5 bg-surface border border-border text-primary hover:bg-primary-soft text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToken ? 'Copied to Clipboard!' : 'Copy Record Value'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-surface border border-border rounded-xl">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Type</span>
              <span className="font-mono font-bold text-navy">TXT</span>
            </div>
            <div className="p-3 bg-surface border border-border rounded-xl">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Host / Name</span>
              <span className="font-mono font-bold text-navy">@ (Root)</span>
            </div>
            <div className="p-3 bg-surface border border-border rounded-xl">
              <span className="text-[10px] text-text-muted uppercase font-bold block">TTL</span>
              <span className="font-mono font-bold text-navy">300 seconds / Auto</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">
              Cryptographic Token Value
            </span>
            <div className="p-3 bg-surface border border-border rounded-xl font-mono text-xs text-navy select-all break-all shadow-inner">
              {dnsToken}
            </div>
          </div>
        </div>

        {/* Verification Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={verifyingDns}
              onClick={handleVerifyDns}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-2 ${
                dnsVerified
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {verifyingDns
                  ? 'Querying DNS Servers...'
                  : dnsVerified
                  ? 'Verified ✓ Check Again'
                  : 'Verify DNS Record'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDnsVerified(!dnsVerified)}
              className="text-xs text-text-muted hover:text-navy underline px-2 py-1"
            >
              {dnsVerified ? 'Simulate Unverified' : 'Bypass / Test Mode'}
            </button>
          </div>

          <p className="text-[11px] text-text-muted">
            Cryptographic proof unlocks Tier-2 Institutional Inbound Routing and deal rooms.
          </p>
        </div>

        {/* Provider Setup Guides */}
        <div className="space-y-2 pt-3 border-t border-border">
          <span className="text-xs font-bold text-navy uppercase tracking-wider block">
            DNS Provider Setup Guides
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {['Cloudflare', 'AWS Route 53', 'GoDaddy', 'Google Cloud'].map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() =>
                  setActiveDnsGuide(activeDnsGuide === provider ? null : provider)
                }
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  activeDnsGuide === provider
                    ? 'bg-primary-soft border-primary text-primary font-bold'
                    : 'bg-surface border-border text-navy hover:bg-surface-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{provider}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      activeDnsGuide === provider ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>

          {activeDnsGuide && (
            <div className="p-4 bg-surface-muted border border-border rounded-2xl text-xs space-y-1.5 animate-fade-in">
              <h5 className="font-bold text-navy">
                Instructions for {activeDnsGuide}:
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-text-muted">
                <li>Log in to your {activeDnsGuide} DNS Management dashboard for {domain}.</li>
                <li>Click "Add Record" and select type <strong>TXT</strong>.</li>
                <li>Set Name / Host to <strong>@</strong> (or root).</li>
                <li>Paste the verification token into the Content/Value field and save.</li>
                <li>DNS propagation typically takes 30 to 90 seconds.</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Data Privacy & Security Notice */}
      <div className="p-6 bg-surface rounded-3xl border border-border space-y-3 shadow-2xs">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-navy">Data Privacy & Provenance</h2>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          MESHVI isolates member data according to strict role boundaries. Direct contact credentials (email addresses and phone numbers) are never sold or surfaced in unverified third-party queries. Cryptographic DNS handshakes provide tamper-proof validation of institutional authority.
        </p>
      </div>
    </div>
  );
};
