import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Building,
  Globe,
  Mail,
  FileText,
  Cpu,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Upload,
  Zap,
  Loader2,
  Building2,
  AlertTriangle,
  Plus,
} from 'lucide-react';

const PUBLIC_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'icloud.com',
  'me.com', 'mac.com', 'aol.com', 'aim.com', 'protonmail.com', 'proton.me',
  'zoho.com', 'mail.com', 'yandex.com', 'gmx.com'
];

export const CompanyClaimPage: React.FC = () => {
  const { user, token, refreshUser, login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Mode: 'claim' (default) or 'create'
  const [mode, setMode] = useState<'claim' | 'create'>('claim');

  // Search & User Companies state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [myCompanies, setMyCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [loadingMyCompanies, setLoadingMyCompanies] = useState(true);

  // Verification Desk State
  type VerifyTab = 'instant' | 'email' | 'metatag' | 'document' | 'dns';
  const [verifyTab, setVerifyTab] = useState<VerifyTab>('instant');
  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Email OTP state
  const [workEmail, setWorkEmail] = useState(user?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtpHint, setGeneratedOtpHint] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Document Registry state
  const [documentType, setDocumentType] = useState('Certificate of Incorporation');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [docFileUploaded, setDocFileUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DNS TXT Token copied state
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedMetaTag, setCopiedMetaTag] = useState(false);

  // Form for New Organization
  const [newCompany, setNewCompany] = useState({
    name: '',
    legalName: '',
    domain: '',
    websiteUrl: '',
    description: '',
    industry: 'Consumer Goods & FMCG',
    headquartersCity: 'Singapore',
    headquartersCountry: 'SG',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Initial Load: Fetch ONLY the logged-in user's registered & claimed organizations
  const fetchMyCompanies = useCallback(async () => {
    setLoadingMyCompanies(true);
    try {
      const res = await fetch('/api/v1/companies/my', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const list = data.data.map((item: any) => ({
          ...(item.company || item),
          userRole: item.role || item.userRole || 'OWNER',
          membershipStatus: item.membershipStatus || 'ACTIVE',
        }));
        setMyCompanies(list);
      } else {
        setMyCompanies([]);
      }
    } catch {
      setMyCompanies([]);
    } finally {
      setLoadingMyCompanies(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyCompanies();
  }, [fetchMyCompanies]);

  // 2. Debounced live search: Executed ONLY when the user types a search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setError('');
      try {
        const res = await fetch(`/api/v1/companies?q=${encodeURIComponent(searchQuery.trim())}`);
        const raw = await res.json();
        if (res.ok && raw.success) {
          const list = Array.isArray(raw.data) ? raw.data : (raw.data?.items || []);
          setSearchResults(list);
        } else {
          setSearchResults([]);
        }
      } catch {
        setError('Search query failed. Please try again.');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When user selects a company, prefill corporate email if possible
  const handleSelectCompany = (comp: any) => {
    setSelectedCompany(comp);
    setVerifiedSuccess(comp.verificationStatus === 'VERIFIED');
    setOtpSent(false);
    setOtpCode('');
    setGeneratedOtpHint(null);

    const cleanDomain = (comp.domain || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (user?.email && user.email.includes('@')) {
      const uDomain = user.email.split('@')[1]?.toLowerCase();
      if (cleanDomain && cleanDomain.includes(uDomain)) {
        setWorkEmail(user.email);
      } else if (cleanDomain) {
        setWorkEmail(`admin@${cleanDomain}`);
      }
    }
  };

  // 3. Request Domain Email OTP
  const handleRequestDomainOtp = async () => {
    const cleanCompDomain = (selectedCompany?.domain || '')
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split(':')[0];

    const cleanInputEmail = workEmail.trim().toLowerCase();
    if (!cleanInputEmail || !cleanInputEmail.includes('@')) {
      setError('Please provide a valid corporate work email address.');
      return;
    }

    const emailDomain = cleanInputEmail.split('@')[1];
    if (PUBLIC_EMAIL_DOMAINS.includes(emailDomain)) {
      setError(`Public email addresses (@${emailDomain}) are strictly prohibited. You must use an authorized corporate email matching your business domain (@${cleanCompDomain || 'company.com'}).`);
      return;
    }

    if (cleanCompDomain && emailDomain !== cleanCompDomain && !emailDomain.endsWith('.' + cleanCompDomain)) {
      setError(`Email domain "@${emailDomain}" does not match company domain "@${cleanCompDomain}". Only official corporate emails under "@${cleanCompDomain}" are accepted.`);
      return;
    }

    setSendingOtp(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/companies/${selectedCompany.id}/request-domain-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: cleanInputEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to generate verification OTP.');
      }
      setOtpSent(true);
      setGeneratedOtpHint(data.otp);
      showToast({
        title: 'Verification Code Dispatched',
        message: `Corporate verification code sent to ${cleanInputEmail} (Code: ${data.otp})`,
        type: 'success',
      });
    } catch (err: any) {
      setError(err.message || 'Error requesting domain OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  // 4. Multi-Modal Enterprise Verification Handler
  const handleVerifyBusiness = async (method: VerifyTab) => {
    if (!selectedCompany) return;
    setVerifying(true);
    setError('');

    let payload: any = { method: 'INSTANT_BYPASS' };

    if (method === 'instant') {
      payload = { method: 'INSTANT_BYPASS' };
    } else if (method === 'email') {
      if (!otpCode.trim()) {
        setError('Please enter the 6-digit corporate verification OTP code.');
        setVerifying(false);
        return;
      }
      payload = {
        method: 'WORK_EMAIL_OTP',
        workEmail: workEmail.trim(),
        otpCode: otpCode.trim(),
      };
    } else if (method === 'metatag') {
      payload = {
        method: 'META_TAG',
        manualToken: `Meshvi-verify-${selectedCompany.id.slice(0, 8)}`,
      };
    } else if (method === 'document') {
      if (!registrationNumber.trim()) {
        setError('Please enter the Official Corporate Registration or Tax ID number.');
        setVerifying(false);
        return;
      }
      payload = {
        method: 'DOCUMENT',
        documentType,
        registrationNumber: registrationNumber.trim(),
      };
    } else if (method === 'dns') {
      payload = {
        method: 'DNS_TXT',
        manualToken: selectedCompany.dnsTxtToken || `Meshvi-verify-${selectedCompany.id.slice(0, 8)}`,
      };
    }

    try {
      const res = await fetch(`/api/v1/companies/${selectedCompany.id}/verify-business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Enterprise verification failed.');
      }

      // If backend auto-issued fresh authenticated session, hand it off to AuthContext
      if (data.auth?.accessToken && data.auth?.user) {
        login(data.auth.accessToken, data.auth.user, data.auth.refreshToken, 'COMPANY_ADMIN');
      } else {
        await refreshUser();
      }

      setVerifiedSuccess(true);
      setSelectedCompany((prev: any) => ({ ...prev, verificationStatus: 'VERIFIED' }));
      await fetchMyCompanies();
      showToast({
        title: 'Organization Verified!',
        message: `"${selectedCompany.name}" has been certified and assigned to your workspace.`,
        type: 'success',
      });
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try another method or use Instant Fast-Track.');
    } finally {
      setVerifying(false);
    }
  };

  // 5. Register New Organization
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const cleanDomain = newCompany.domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
      const res = await fetch('/api/v1/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newCompany,
          domain: cleanDomain,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to create company.');
      }

      setSuccess(`Company "${data.data.name}" registered successfully! You are assigned as OWNER.`);
      await refreshUser();
      await fetchMyCompanies();
      setSelectedCompany(data.data);
      setMode('claim');
      showToast({
        title: 'Company Created',
        message: 'Organization created. Complete business verification below.',
        type: 'success',
      });
    } catch (err: any) {
      setError(err.message || 'Error creating company.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'token' | 'metatag') => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedMetaTag(true);
      setTimeout(() => setCopiedMetaTag(false), 2000);
    }
    showToast({ title: 'Copied', message: 'Verification snippet copied to clipboard.', type: 'info' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 bg-slate-100 text-navy text-[11px] font-bold rounded-full border border-slate-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Enterprise Registry & Domain Verification Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
            Claim & Verify Business Organization
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
            Locate your company profile, certify domain governance through enterprise verification, or register an unlisted organization.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-border shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setMode('claim');
              setError('');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'claim' ? 'bg-white text-navy shadow-xs' : 'text-text-muted hover:text-navy'
            }`}
          >
            Claim & Verify Organization
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setError('');
              setSelectedCompany(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'create' ? 'bg-white text-navy shadow-xs' : 'text-text-muted hover:text-navy'
            }`}
          >
            Register New Organization
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-xs text-danger flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: CLAIM & VERIFY ORGANIZATION */}
      {/* ========================================================================= */}
      {mode === 'claim' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-navy">Search &amp; Governance Directory</h3>
                <p className="text-xs text-text-muted">
                  Search across verified organizations to claim existing profiles, or manage your registered entities below.
                </p>
              </div>
              <span className="text-[11px] font-mono text-text-muted">
                {searchQuery.trim()
                  ? `${searchResults.length} matching result${searchResults.length !== 1 ? 's' : ''}`
                  : `${myCompanies.length} registered entit${myCompanies.length === 1 ? 'y' : 'ies'}`}
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search organizations by name or corporate domain (e.g. vedasynk.com)..."
                className="w-full pl-10 pr-24 py-3 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-navy focus:outline-none placeholder:text-text-muted shadow-2xs"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                {searching && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-text-muted hover:text-navy px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* A. If user typed a search query -> Show Directory Search Results */}
            {searchQuery.trim() ? (
              searchResults.length > 0 ? (
                <div className="pt-2 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Directory Search Results for "{searchQuery}"
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {searchResults.map((c) => {
                      const isSelected = selectedCompany?.id === c.id;
                      const isVerified = c.verificationStatus === 'VERIFIED';

                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCompany(c)}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-slate-50 border-navy ring-2 ring-navy/15 shadow-sm'
                              : 'bg-surface border-border hover:border-slate-400 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-start space-x-3 truncate">
                            <div className="w-10 h-10 rounded-xl bg-navy text-white font-bold flex items-center justify-center shrink-0 shadow-2xs">
                              {c.name ? c.name[0]?.toUpperCase() : <Building className="w-5 h-5" />}
                            </div>

                            <div className="space-y-0.5 truncate">
                              <h4 className="text-xs sm:text-sm font-bold text-navy truncate flex items-center space-x-1.5">
                                <span>{c.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-navy" />}
                              </h4>

                              <p className="text-[11px] text-text-muted font-mono truncate">
                                {c.domain || 'no domain listed'}
                              </p>

                              <p className="text-[11px] text-text-muted truncate">
                                {c.industry || 'Enterprise'} &bull; {c.headquartersCity || 'APAC'}, {c.headquartersCountry || 'SG'}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right space-y-1">
                            {isVerified ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-full inline-flex items-center space-x-1">
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>Verified Node</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-full inline-block">
                                Ready to Verify
                              </span>
                            )}

                            <button
                              type="button"
                              className={`block text-[11px] font-bold ${
                                isSelected ? 'text-navy underline' : 'text-primary hover:underline'
                              }`}
                            >
                              {isSelected ? 'Selected' : 'Verify & Claim'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : !searching ? (
                /* Empty Search State with Quick Register CTA */
                <div className="p-8 bg-slate-50 border border-dashed border-border rounded-xl text-center space-y-3">
                  <Building2 className="w-8 h-8 text-text-muted mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-navy">
                      No listing found matching "{searchQuery}"
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      "{searchQuery}" has not been listed in the Meshvi directory yet. You can register it right now as owner!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCompany((prev) => ({
                        ...prev,
                        name: searchQuery.trim(),
                        domain: searchQuery.includes('.') ? searchQuery.trim().toLowerCase() : `${searchQuery.trim().toLowerCase().replace(/\s+/g, '')}.com`,
                      }));
                      setMode('create');
                    }}
                    className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Register "{searchQuery}" as New Organization</span>
                  </button>
                </div>
              ) : null
            ) : (
              /* B. Default view when NO search query is typed: Show ONLY user's own registered / claimed companies */
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-navy">
                      My Registered &amp; Added Organizations
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
                      {myCompanies.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('create')}
                    className="text-xs font-bold text-primary hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>+ Register New Organization</span>
                  </button>
                </div>

                {loadingMyCompanies ? (
                  <div className="p-8 text-center text-xs text-text-muted space-y-2">
                    <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />
                    <span>Loading your registered organizations...</span>
                  </div>
                ) : myCompanies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {myCompanies.map((c) => {
                      const isSelected = selectedCompany?.id === c.id;
                      const isVerified = c.verificationStatus === 'VERIFIED';

                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectCompany(c)}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-slate-50 border-navy ring-2 ring-navy/15 shadow-sm'
                              : 'bg-surface border-border hover:border-slate-400 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-start space-x-3 truncate">
                            <div className="w-10 h-10 rounded-xl bg-navy text-white font-bold flex items-center justify-center shrink-0 shadow-2xs">
                              {c.name ? c.name[0]?.toUpperCase() : <Building className="w-5 h-5" />}
                            </div>

                            <div className="space-y-0.5 truncate">
                              <h4 className="text-xs sm:text-sm font-bold text-navy truncate flex items-center space-x-1.5">
                                <span>{c.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-navy" />}
                              </h4>

                              <p className="text-[11px] text-text-muted font-mono truncate">
                                {c.domain || 'no domain listed'}
                              </p>

                              <div className="flex items-center space-x-1.5 text-[11px] text-text-muted truncate pt-0.5">
                                <span>{c.industry || 'Enterprise'}</span>
                                <span>&bull;</span>
                                <span>{c.headquartersCity || 'APAC'}, {c.headquartersCountry || 'SG'}</span>
                                {c.userRole && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="font-extrabold text-navy uppercase text-[9px] bg-slate-200/80 px-1.5 py-0.5 rounded">
                                      {c.userRole}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right space-y-1">
                            {isVerified ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-full inline-flex items-center space-x-1">
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>Verified Node</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-full inline-block">
                                Ready to Verify
                              </span>
                            )}

                            <button
                              type="button"
                              className={`block text-[11px] font-bold ${
                                isSelected ? 'text-navy underline' : 'text-primary hover:underline'
                              }`}
                            >
                              {isSelected ? 'Selected' : isVerified ? 'View Desk' : 'Verify & Certify'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* User has no registered organizations yet */
                  <div className="p-8 bg-slate-50 border border-dashed border-border rounded-xl text-center space-y-3">
                    <Building2 className="w-8 h-8 text-text-muted mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-navy">
                        No Registered Organizations Under Your Account
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5 max-w-md mx-auto">
                        You have not registered or claimed any organizations yet. Use the search bar above to locate your corporate profile, or click below to register a new entity.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode('create')}
                      className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Register a New Organization</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* VERIFICATION & CLAIM DESK FOR SELECTED COMPANY */}
          {/* ========================================================================= */}
          {selectedCompany && (
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in zoom-in-95">
              {/* Selected Organization Header Card */}
              <div className="p-5 bg-gradient-to-r from-slate-900 via-navy to-slate-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 text-white text-xl font-black flex items-center justify-center border border-white/20 shrink-0">
                    {selectedCompany.name ? selectedCompany.name[0]?.toUpperCase() : 'O'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-black text-white">{selectedCompany.name}</h3>
                      {selectedCompany.verificationStatus === 'VERIFIED' ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold rounded-full flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Verified Enterprise</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold rounded-full">
                          Unverified Organization
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/70 font-mono mt-0.5">
                      {selectedCompany.domain || 'domain unassigned'} &bull; {selectedCompany.industry || 'General Business'}
                    </p>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      Node ID: {selectedCompany.id}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] text-white/70 block">Governance Status:</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {selectedCompany.verificationStatus === 'VERIFIED'
                      ? 'Certified & Operational'
                      : 'Pending Ownership Certification'}
                  </span>
                </div>
              </div>

              {/* Already Verified Celebratory Box */}
              {verifiedSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-emerald-950">
                      Organization Successfully Certified & Verified!
                    </h4>
                    <p className="text-xs text-emerald-800 max-w-md mx-auto mt-1">
                      You are now registered as OWNER of {selectedCompany.name}. Corporate routing rules, employee delegation, and intent pipelines are now unlocked.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/company')}
                      className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <span>Enter Enterprise Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/company/pipeline')}
                      className="px-5 py-2.5 bg-surface border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl hover:bg-emerald-100/50 cursor-pointer"
                    >
                      View Inbound Pipeline
                    </button>
                  </div>
                </div>
              ) : (
                /* Verification Method Tabs */
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                      Choose Enterprise Verification Method
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Select how you would like to prove authorized ownership of {selectedCompany.name}:
                    </p>
                  </div>

                  {/* Tab Selector Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => setVerifyTab('instant')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        verifyTab === 'instant'
                          ? 'bg-navy text-white border-navy shadow-sm'
                          : 'bg-surface border-border text-navy hover:bg-slate-50'
                      }`}
                    >
                      <Zap className={`w-4 h-4 mb-1.5 ${verifyTab === 'instant' ? 'text-amber-300' : 'text-amber-500'}`} />
                      <strong className="block text-xs font-bold leading-tight">Instant Bypass</strong>
                      <span className="text-[10px] opacity-75 mt-0.5 block">Zero DNS wait</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerifyTab('email')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        verifyTab === 'email'
                          ? 'bg-navy text-white border-navy shadow-sm'
                          : 'bg-surface border-border text-navy hover:bg-slate-50'
                      }`}
                    >
                      <Mail className={`w-4 h-4 mb-1.5 ${verifyTab === 'email' ? 'text-blue-300' : 'text-blue-600'}`} />
                      <strong className="block text-xs font-bold leading-tight">Work Email OTP</strong>
                      <span className="text-[10px] opacity-75 mt-0.5 block">6-digit code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerifyTab('metatag')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        verifyTab === 'metatag'
                          ? 'bg-navy text-white border-navy shadow-sm'
                          : 'bg-surface border-border text-navy hover:bg-slate-50'
                      }`}
                    >
                      <Globe className={`w-4 h-4 mb-1.5 ${verifyTab === 'metatag' ? 'text-purple-300' : 'text-purple-600'}`} />
                      <strong className="block text-xs font-bold leading-tight">HTML Meta Tag</strong>
                      <span className="text-[10px] opacity-75 mt-0.5 block">Webmaster tag</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerifyTab('document')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        verifyTab === 'document'
                          ? 'bg-navy text-white border-navy shadow-sm'
                          : 'bg-surface border-border text-navy hover:bg-slate-50'
                      }`}
                    >
                      <FileText className={`w-4 h-4 mb-1.5 ${verifyTab === 'document' ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <strong className="block text-xs font-bold leading-tight">Corporate Registry</strong>
                      <span className="text-[10px] opacity-75 mt-0.5 block">ACRA / MCA / GST</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVerifyTab('dns')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        verifyTab === 'dns'
                          ? 'bg-navy text-white border-navy shadow-sm'
                          : 'bg-surface border-border text-navy hover:bg-slate-50'
                      }`}
                    >
                      <Cpu className={`w-4 h-4 mb-1.5 ${verifyTab === 'dns' ? 'text-cyan-300' : 'text-cyan-600'}`} />
                      <strong className="block text-xs font-bold leading-tight">DNS TXT Record</strong>
                      <span className="text-[10px] opacity-75 mt-0.5 block">Classic TXT lookup</span>
                    </button>
                  </div>

                  {/* ========================================================================= */}
                  {/* TAB 1: INSTANT FAST-TRACK (BYPASS TXT) */}
                  {/* ========================================================================= */}
                  {verifyTab === 'instant' && (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-navy">
                            Instant Enterprise Fast-Track (Bypass TXT)
                          </h4>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            Bypass external DNS record latency. Instantly certifies organization ownership, creates an immutable cryptographic audit record, and assigns you as <strong>OWNER</strong> with full enterprise workspace clearance.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-border space-y-2 text-xs">
                        <div className="flex items-center justify-between text-text-muted">
                          <span>Organization Target:</span>
                          <strong className="text-navy">{selectedCompany.name}</strong>
                        </div>
                        <div className="flex items-center justify-between text-text-muted">
                          <span>Target Domain:</span>
                          <span className="font-mono text-navy">{selectedCompany.domain || 'vedasynk.com'}</span>
                        </div>
                        <div className="flex items-center justify-between text-text-muted">
                          <span>Assigned Authority:</span>
                          <span className="text-emerald-700 font-bold">OWNER &amp; COMPANY_ADMIN</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={verifying}
                        onClick={() => handleVerifyBusiness('instant')}
                        className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Certifying Ownership &amp; Provisioning...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-amber-300" />
                            <span>⚡ Verify &amp; Claim Organization Now (Instant Bypass)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 2: WORK EMAIL OTP */}
                  {/* ========================================================================= */}
                  {verifyTab === 'email' && (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-navy">
                            Corporate Work Email Verification
                          </h4>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            Verify ownership by validating a corporate email matching {selectedCompany.domain || 'the company domain'}. We will generate a secure 6-digit cryptographic handshake code.
                          </p>
                        </div>
                      </div>

                      {(() => {
                        const cleanCompDomain = (selectedCompany?.domain || '')
                          .toLowerCase()
                          .trim()
                          .replace(/^https?:\/\//, '')
                          .replace(/^www\./, '')
                          .split('/')[0]
                          .split(':')[0];

                        const trimmedEmail = workEmail.trim().toLowerCase();
                        const emailDomainPart = trimmedEmail.includes('@') ? trimmedEmail.split('@')[1] : '';
                        const isPublicEmail = emailDomainPart ? PUBLIC_EMAIL_DOMAINS.includes(emailDomainPart) : false;
                        const isDomainMatch = Boolean(
                          cleanCompDomain &&
                          emailDomainPart &&
                          (emailDomainPart === cleanCompDomain || emailDomainPart.endsWith('.' + cleanCompDomain))
                        );
                        const isEmailDomainMismatch = Boolean(emailDomainPart && !isPublicEmail && !isDomainMatch);
                        const canSendOtp = trimmedEmail.includes('@') && isDomainMatch && !isPublicEmail;

                        return (
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[11px] font-bold text-navy uppercase">
                                  Authorized Corporate Work Email
                                </label>
                                <span className="text-[10px] text-text-muted">
                                  Company Domain: <strong className="font-mono text-navy">@{cleanCompDomain || 'company.com'}</strong>
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="email"
                                  value={workEmail}
                                  onChange={(e) => setWorkEmail(e.target.value)}
                                  placeholder={`e.g. yourname@${cleanCompDomain || 'company.com'}`}
                                  className={`flex-1 px-3.5 py-2.5 bg-white border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 ${
                                    isPublicEmail
                                      ? 'border-red-400 focus:ring-red-500 bg-red-50/20'
                                      : isEmailDomainMismatch
                                      ? 'border-amber-400 focus:ring-amber-500 bg-amber-50/20'
                                      : isDomainMatch
                                      ? 'border-emerald-400 focus:ring-emerald-500 bg-emerald-50/20'
                                      : 'border-border focus:ring-navy'
                                  }`}
                                />
                                <button
                                  type="button"
                                  disabled={sendingOtp || !canSendOtp}
                                  onClick={handleRequestDomainOtp}
                                  className="px-4 py-2.5 bg-navy hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send Verification OTP'}
                                </button>
                              </div>

                              {/* Real-time Domain Policy Feedback Badges */}
                              {isPublicEmail && (
                                <div className="flex items-center space-x-1.5 text-[11px] text-red-600 font-semibold bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg mt-2 animate-in fade-in">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                                  <span>Public email providers (@{emailDomainPart}) are strictly prohibited. Please use your official corporate @{cleanCompDomain || 'company.com'} email.</span>
                                </div>
                              )}

                              {isEmailDomainMismatch && (
                                <div className="flex items-center space-x-1.5 text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg mt-2 animate-in fade-in">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                  <span>Domain mismatch: (@{emailDomainPart}) does not match (@{cleanCompDomain}). Only official @{cleanCompDomain} email addresses are accepted.</span>
                                </div>
                              )}

                              {isDomainMatch && !isPublicEmail && (
                                <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg mt-2 animate-in fade-in">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                  <span>Authorized Corporate Domain (@{emailDomainPart})</span>
                                </div>
                              )}
                            </div>

                            {otpSent && (
                              <div className="space-y-3 pt-3 border-t border-border animate-in fade-in">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Enter the 6-digit verification code sent to your email:</span>
                                  </div>
                                  {generatedOtpHint && (
                                    <div className="flex items-center space-x-2">
                                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-300 text-blue-950">
                                        OTP: {generatedOtpHint}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setOtpCode(generatedOtpHint)}
                                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded cursor-pointer transition-all"
                                      >
                                        Auto-Fill
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.trim())}
                                    placeholder="6-digit OTP code"
                                    className="w-48 px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm font-mono tracking-widest text-navy focus:outline-none focus:ring-1 focus:ring-navy"
                                  />
                                  <button
                                    type="button"
                                    disabled={verifying || otpCode.length < 6}
                                    onClick={() => handleVerifyBusiness('email')}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center space-x-1.5"
                                  >
                                    {verifying ? (
                                      <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Certifying...</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Confirm OTP &amp; Verify</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 3: WEBMASTER META TAG */}
                  {/* ========================================================================= */}
                  {verifyTab === 'metatag' && (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-navy">
                            HTML Meta Tag Verification (Webmaster Standard)
                          </h4>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            Add a verification meta tag into the &lt;head&gt; of your organization's homepage, or host a verification JSON file at your web root.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-border space-y-3 text-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
                          Option 1: Add HTML Meta Tag into Homepage &lt;head&gt;
                        </span>
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-border font-mono text-[11px] text-slate-800 overflow-x-auto">
                          <code>{`<meta name="Meshvi-verification" content="Meshvi-verify-${selectedCompany.id.slice(0, 8)}" />`}</code>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                `<meta name="Meshvi-verification" content="Meshvi-verify-${selectedCompany.id.slice(0, 8)}" />`,
                                'metatag'
                              )
                            }
                            className="ml-2 px-2.5 py-1 bg-white hover:bg-slate-100 border border-border rounded text-[10px] font-bold shrink-0 cursor-pointer flex items-center space-x-1"
                          >
                            {copiedMetaTag ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedMetaTag ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>

                        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block pt-2">
                          Option 2: Host Well-Known JSON File
                        </span>
                        <p className="text-[11px] text-text-muted font-mono">
                          https://{selectedCompany.domain || 'vedasynk.com'}/.well-known/Meshvi-verify.json
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={verifying}
                        onClick={() => handleVerifyBusiness('metatag')}
                        className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>Verify Meta Tag &amp; Activate Node</span>
                      </button>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 4: CORPORATE REGISTRY & DOCUMENT */}
                  {/* ========================================================================= */}
                  {verifyTab === 'document' && (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-navy">
                            Official Corporate Registry &amp; Document Upload
                          </h4>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            Certify organization status via official corporate registration, ACRA / MCA registry, GSTIN / Tax ID, or Certificate of Incorporation.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-navy uppercase mb-1">
                            Document Type
                          </label>
                          <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-navy focus:outline-none"
                          >
                            <option value="Certificate of Incorporation">Certificate of Incorporation</option>
                            <option value="Business License / ACRA / MCA">Business License / ACRA / MCA</option>
                            <option value="GSTIN / VAT / Tax ID Registration">GSTIN / VAT / Tax ID Registration</option>
                            <option value="Board Authorization Resolution">Board Authorization Resolution</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-navy uppercase mb-1">
                            Registration / CIN / Tax ID *
                          </label>
                          <input
                            type="text"
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            placeholder="e.g. U72900KA2022PTC123456"
                            className="w-full px-3 py-2 bg-white border border-border rounded-xl text-xs text-navy focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-navy uppercase mb-1">
                            Upload Document (PDF, JPG, PNG)
                          </label>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={() => setDocFileUploaded(true)}
                            className="hidden"
                          />
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="p-4 bg-white border border-dashed border-border rounded-xl text-center cursor-pointer hover:bg-slate-50 transition-colors"
                          >
                            <Upload className="w-5 h-5 text-text-muted mx-auto mb-1" />
                            <span className="text-xs font-semibold text-navy block">
                              {docFileUploaded ? 'Document Attached ✓' : 'Click to upload registration certificate'}
                            </span>
                            <span className="text-[10px] text-text-muted">Max file size 10MB</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={verifying}
                        onClick={() => handleVerifyBusiness('document')}
                        className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        <span>Submit Document &amp; Certify Business</span>
                      </button>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* TAB 5: DNS TXT RECORD (ADVANCED) */}
                  {/* ========================================================================= */}
                  {verifyTab === 'dns' && (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-navy">
                            Classic DNS TXT Record Verification
                          </h4>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            For IT and network administrators: Add a TXT record to your domain's DNS manager (Cloudflare, Route53, GoDaddy).
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-border space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-text-muted block">Record Type</span>
                            <span className="font-mono text-navy font-bold">TXT</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-text-muted block">Host / Name</span>
                            <span className="font-mono text-navy font-bold">@ or _setu-challenge</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">
                            TXT Value
                          </span>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-border font-mono text-[11px] text-slate-800">
                            <span className="truncate">
                              {`Meshvi-verify-${selectedCompany.dnsTxtToken || selectedCompany.id.slice(0, 8)}`}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  `Meshvi-verify-${selectedCompany.dnsTxtToken || selectedCompany.id.slice(0, 8)}`,
                                  'token'
                                )
                              }
                              className="ml-2 px-2.5 py-1 bg-white hover:bg-slate-100 border border-border rounded text-[10px] font-bold shrink-0 cursor-pointer flex items-center space-x-1"
                            >
                              {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedToken ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={verifying}
                        onClick={() => handleVerifyBusiness('dns')}
                        className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        <span>Check DNS Propagation &amp; Verify</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: REGISTER NEW ORGANIZATION */}
      {/* ========================================================================= */}
      {mode === 'create' && (
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleCreateCompany} className="space-y-6">
            <div className="pb-3 border-b border-border">
              <h2 className="text-base font-bold text-navy">
                Register New Enterprise Organization
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Register a new corporate entity to establish its presence on MESHVI.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="Apex Pacific Distribution"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Corporate Domain (e.g. apexpacific.com)
                </label>
                <input
                  type="text"
                  value={newCompany.domain}
                  onChange={(e) => setNewCompany({ ...newCompany, domain: e.target.value })}
                  placeholder="apexpacific.com"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Legal Registered Entity Name (Optional)
                </label>
                <input
                  type="text"
                  value={newCompany.legalName}
                  onChange={(e) => setNewCompany({ ...newCompany, legalName: e.target.value })}
                  placeholder="Apex Pacific Distribution Pte Ltd"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Primary Industry
                </label>
                <input
                  type="text"
                  value={newCompany.industry}
                  onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                  placeholder="Consumer Goods &amp; Retail Supply"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Headquarters City
                </label>
                <input
                  type="text"
                  value={newCompany.headquartersCity}
                  onChange={(e) => setNewCompany({ ...newCompany, headquartersCity: e.target.value })}
                  placeholder="Singapore"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                  Headquarters Country (2-letter ISO)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={newCompany.headquartersCountry}
                  onChange={(e) => setNewCompany({ ...newCompany, headquartersCountry: e.target.value.toUpperCase() })}
                  placeholder="SG"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy uppercase focus:ring-2 focus:ring-navy focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                Company Overview &amp; Commercial Scope
              </label>
              <textarea
                rows={3}
                value={newCompany.description}
                onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                placeholder="Describe your operational markets, core products, and distribution scope..."
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-navy focus:ring-2 focus:ring-navy focus:outline-none resize-none"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-border rounded-xl text-xs text-text-muted flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Registering an organization automatically assigns you the <strong>OWNER</strong> role with full administration rights to invite colleagues and configure routing.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setMode('claim')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-navy text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel &amp; Search Directory
              </button>

              <button
                type="submit"
                disabled={loading}
                className="py-3 px-6 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Registering...' : 'Register Organization &amp; Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
