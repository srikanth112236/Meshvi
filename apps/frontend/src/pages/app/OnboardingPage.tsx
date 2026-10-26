import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Country, City } from 'country-state-city';
import {
  User,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  ShieldCheck,
  Building,
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  Loader2,
  Cpu,
  Radio,
  Users,
  ShieldAlert,
  ChevronDown,
  Search,
  Calendar,
  Lock,
  Edit2,
  X,
  MapPin,
  Globe,
} from 'lucide-react';

interface CompanySearchResult {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
}

interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

const DEPARTMENT_OPTIONS: CustomSelectOption[] = [
  { value: 'Commercial Partnerships & Alliances', label: 'Commercial Partnerships & Alliances', sublabel: 'Strategic JVs, retail distribution, commercial corridors' },
  { value: 'Corporate Strategy & M&A', label: 'Corporate Strategy & M&A', sublabel: 'Cross-border expansion, venture investments, market entry' },
  { value: 'Procurement & Strategic Sourcing', label: 'Procurement & Strategic Sourcing', sublabel: 'Vendor qualification, enterprise RFPs, contract negotiation' },
  { value: 'Supply Chain, Logistics & Distribution', label: 'Supply Chain, Logistics & Distribution', sublabel: 'Freight forwarding, cross-border fulfillment, warehouse routing' },
  { value: 'Technology, AI & Platform Engineering', label: 'Technology, AI & Platform Engineering', sublabel: 'Enterprise software, infrastructure, data systems' },
  { value: 'Enterprise Sales & Business Development', label: 'Enterprise Sales & Business Development', sublabel: 'B2B commercial growth, corporate account acquisition' },
  { value: 'Finance, Treasury & Trade Operations', label: 'Finance, Treasury & Trade Operations', sublabel: 'Trade finance, capital deployment, cash management' },
  { value: 'Executive Leadership & Board', label: 'Executive Leadership & Board', sublabel: 'C-Suite oversight, board stewardship, corporate steering' },
];

const SENIORITY_OPTIONS = [
  { value: 'C-Level / Founder', label: 'C-Level / Founder', badge: 'Tier 1 Budget Signer' },
  { value: 'VP / Managing Director', label: 'VP / Managing Director', badge: 'Tier 1 Commercial Lead' },
  { value: 'Director / Head of Dept', label: 'Director / Head of Dept', badge: 'Tier 2 Sourcing Lead' },
  { value: 'Lead / Principal Specialist', label: 'Lead / Principal Specialist', badge: 'Tier 3 Evaluator' },
];

const SUGGESTED_HEADLINES = [
  'Head of Commercial Partnerships & Strategic Alliances',
  'VP of Global Corporate Development & Cross-Border M&A',
  'Director of Strategic Sourcing & Enterprise Procurement',
  'Chief Technology Officer & Enterprise Architecture Lead',
];

const SUGGESTED_SEEKING = [
  'Enterprise retail channel distribution partners across APAC & GCC.',
  'Tier-1 SOC-2 compliant cloud infrastructure & AI integration providers.',
  'B2B co-marketing & co-selling alliances with zero direct product conflict.',
  'Cross-border trade finance & institutional liquidity partners.',
];

const SUGGESTED_OFFERING = [
  'Direct access to 450+ verified enterprise buyer accounts across regions.',
  'Proprietary supply chain orchestration and routing API architecture.',
  'Bilateral corporate venture capital & growth equity deployment rails.',
  'High-touch enterprise software sales integration & channel co-selling.',
];

const POPULAR_FIREWALL_PRESETS = [
  'Cold Crypto Pitching',
  'Automated Mass InMails',
  'Offshore Dev Shops',
  'Junior Hiring Headhunters',
];

const DEFAULT_FIREWALL_TAGS = [
  'Unsolicited Lead Gen Agencies',
  'Offshore Staff Augmentation',
  'Generic SEO & Content Services',
  'Fractional Recruitment Pitchers',
  'Cold Financial Advisory Sales',
  'Automated InMail Mass Blasts',
];

// Helper to get all countries memoized
const ALL_COUNTRIES = Country.getAllCountries().map((c) => ({
  name: c.name,
  isoCode: c.isoCode,
  flag: c.flag,
}));

export const OnboardingPage: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Wizard step state (1 to 5)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Identity & Photo
  const [displayName, setDisplayName] = useState(
    user?.profile?.displayName || (user as any)?.name || ''
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || user?.avatarUrl || '');
  const [headline, setHeadline] = useState(user?.profile?.headline || '');
  const [summary, setSummary] = useState(user?.profile?.summary || '');
  const [email] = useState(user?.email || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Corporate Affiliation & Scope
  const [currentTitle, setCurrentTitle] = useState(user?.profile?.currentTitle || 'VP of Partnerships');
  const [currentCompany, setCurrentCompany] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Multi-department select: UP TO 5
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    'Commercial Partnerships & Alliances',
  ]);

  const [seniority, setSeniority] = useState('VP / Managing Director');
  const [industry, setIndustry] = useState('Enterprise Software & Technology');

  // Country & City with custom dropdowns & automatic ISO code detection
  const [selectedCountryName, setSelectedCountryName] = useState('Singapore');
  const [countryCode, setCountryCode] = useState('SG');
  const [selectedCity, setSelectedCity] = useState('Singapore');

  // Search state for custom Country Dropdown
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Search state for custom City Dropdown
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Searchable Company Autocomplete
  const [companyQuery, setCompanyQuery] = useState('');
  const [companyResults, setCompanyResults] = useState<CompanySearchResult[]>([]);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [searchingCompanies, setSearchingCompanies] = useState(false);
  const companySearchRef = useRef<HTMLDivElement>(null);

  // Step 3: Commercial Business Intent
  const [lookingFor, setLookingFor] = useState(
    'Enterprise retail channel distribution partners and technology co-selling alliances across APAC.'
  );
  const [offering, setOffering] = useState(
    'Direct access to 450+ verified enterprise buyer accounts and proprietary supply chain orchestration API.'
  );

  // Step 4: Anti-Spam Pitch Firewall
  const [firewallTags, setFirewallTags] = useState<string[]>(DEFAULT_FIREWALL_TAGS);
  const [customTagInput, setCustomTagInput] = useState('');

  // Default Reception Protocol: CAN SELECT SINGLE OR BOTH!
  const [selectedProtocols, setSelectedProtocols] = useState<Array<'DEAL_ROOM' | 'SCHEDULED_CALL'>>([
    'DEAL_ROOM',
  ]);

  // Step 5: 5-Second Provisioning Animation
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningProgress, setProvisioningProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [provisioningStage, setProvisioningStage] = useState(1);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
      if (companySearchRef.current && !companySearchRef.current.contains(e.target as Node)) {
        setCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial Profile Load
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/v1/profiles/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const p = data.data;
          if (p.displayName) setDisplayName(p.displayName);
          if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
          if (p.headline) setHeadline(p.headline);
          if (p.summary) setSummary(p.summary);
          if (p.currentTitle) setCurrentTitle(p.currentTitle);
          if (p.company?.name || p.currentCompanyName) {
            setCurrentCompany(p.company?.name || p.currentCompanyName);
            if (p.company?.domain) setCompanyDomain(p.company.domain);
            if (p.companyId) setCompanyId(p.companyId);
          }
          if (p.function) {
            const depts = p.function.split(';').map((s: string) => s.trim()).filter(Boolean);
            if (depts.length > 0) setSelectedDepartments(depts.slice(0, 5));
          }
          if (p.seniority) setSeniority(p.seniority);
          if (p.industry) setIndustry(p.industry);
          if (p.countryCode) {
            setCountryCode(p.countryCode);
            const foundC = ALL_COUNTRIES.find((c) => c.isoCode === p.countryCode);
            if (foundC) setSelectedCountryName(foundC.name);
          }
          if (p.city) setSelectedCity(p.city);

          if (p.intents && p.intents.length > 0) {
            const lk = p.intents.find((i: any) => i.intentType === 'LOOKING_FOR');
            const of = p.intents.find((i: any) => i.intentType === 'OFFERING');
            const nl = p.intents.filter((i: any) => i.intentType === 'NOT_LOOKING_FOR').map((i: any) => i.description);
            if (lk) setLookingFor(lk.description);
            if (of) setOffering(of.description);
            if (nl.length > 0) setFirewallTags(nl);
          }
        }
      } catch (err) {
        console.warn('Could not load profile:', err);
      }
    };
    loadProfile();
  }, [token]);

  // Company Search Autocomplete (>2 chars)
  useEffect(() => {
    if (!companyQuery || companyQuery.trim().length < 2) {
      setCompanyResults([]);
      setCompanyDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingCompanies(true);
      try {
        const res = await fetch(`/api/v1/companies?query=${encodeURIComponent(companyQuery.trim())}&limit=5`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.items || data.data)) {
          const list = data.data.items || data.data;
          setCompanyResults(list);
          setCompanyDropdownOpen(true);
        }
      } catch (err) {
        console.error('Company search error:', err);
      } finally {
        setSearchingCompanies(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [companyQuery, token]);

  // Filtered Countries list for Custom Select
  const filteredCountries = ALL_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
    c.isoCode.toLowerCase().includes(countrySearchQuery.toLowerCase())
  ).slice(0, 40);

  // Cities for the automatically detected Country Code
  const availableCities = countryCode ? City.getCitiesOfCountry(countryCode) || [] : [];
  const filteredCities = availableCities.filter((city) =>
    city.name.toLowerCase().includes(citySearchQuery.toLowerCase())
  ).slice(0, 40);

  // Department Toggle Handler (Up to 5)
  const toggleDepartment = (deptValue: string) => {
    if (selectedDepartments.includes(deptValue)) {
      if (selectedDepartments.length === 1) {
        showToast({ title: 'Minimum 1 Required', message: 'You must retain at least one primary department.', type: 'info' });
        return;
      }
      setSelectedDepartments(selectedDepartments.filter((d) => d !== deptValue));
    } else {
      if (selectedDepartments.length >= 5) {
        showToast({ title: 'Department Cap Reached', message: 'You can select up to 5 departments.', type: 'info' });
        return;
      }
      setSelectedDepartments([...selectedDepartments, deptValue]);
    }
  };

  // Reception Protocol Toggle (Single or Both)
  const toggleProtocol = (proto: 'DEAL_ROOM' | 'SCHEDULED_CALL') => {
    if (selectedProtocols.includes(proto)) {
      if (selectedProtocols.length === 1) {
        showToast({ title: 'Protocol Required', message: 'At least one reception protocol must remain active.', type: 'info' });
        return;
      }
      setSelectedProtocols(selectedProtocols.filter((p) => p !== proto));
    } else {
      setSelectedProtocols([...selectedProtocols, proto]);
    }
  };

  // Avatar Upload with Instant Local Preview and Server Persist
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({ title: 'Invalid File', message: 'Please select an image file (PNG, JPG, WEBP).', type: 'error' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast({ title: 'File Too Large', message: 'Image size must be under 10MB.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      setUploadingAvatar(true);

      try {
        const res = await fetch('/api/v1/profiles/me/avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dataUrl, fileName: file.name }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.data?.avatarUrl) {
          const permanentUrl = data.data.avatarUrl;
          setAvatarUrl(permanentUrl);
          await fetch('/api/v1/profiles/me/onboarding', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ avatarUrl: permanentUrl }),
          });
          showToast({
            title: 'Avatar Saved',
            message: 'Your portrait is securely stored and persistent.',
            type: 'success',
          });
        }
      } catch (err: any) {
        console.warn('Avatar upload warning:', err);
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Progress or Complete
  const saveProgress = async (complete: boolean = false) => {
    setLoading(true);
    setError('');

    const sanitizedIntents = [
      ...(lookingFor?.trim() ? [{ intentType: 'LOOKING_FOR', description: lookingFor.trim() }] : []),
      ...(offering?.trim() ? [{ intentType: 'OFFERING', description: offering.trim() }] : []),
      ...firewallTags.filter(Boolean).map((t) => ({ intentType: 'NOT_LOOKING_FOR', description: t.trim() })),
    ];

    const payload = {
      displayName: displayName.trim(),
      avatarUrl: avatarUrl.trim(),
      headline: headline.trim(),
      summary: summary.trim() || `Verified executive in ${selectedDepartments.join(', ')} at ${currentCompany || 'Enterprise'}.`,
      currentTitle: currentTitle.trim(),
      currentCompanyName: currentCompany.trim(),
      currentCompanyId: companyId || undefined,
      department: selectedDepartments[0],
      function: selectedDepartments.join('; '),
      seniority,
      industry,
      city: selectedCity,
      countryCode,
      intents: sanitizedIntents,
      isCompleted: complete,
    };

    try {
      const res = await fetch('/api/v1/profiles/me/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.error || 'Failed to save onboarding data.');
      }

      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      if (complete) {
        setIsProvisioning(true);
        setProvisioningProgress(0);
        setSecondsRemaining(5);
      }
    } catch (err: any) {
      setError(err.message || 'Error saving onboarding details.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 5-Second Provisioning Countdown & Auto-Redirect
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isProvisioning) return;

    setSecondsRemaining(5);
    setProvisioningProgress(0);
    setProvisioningStage(1);

    const TOTAL_DURATION_MS = 5000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / TOTAL_DURATION_MS) * 100));
      const remaining = Math.max(0, Math.ceil((TOTAL_DURATION_MS - elapsed) / 1000));

      setProvisioningProgress(progress);
      setSecondsRemaining(remaining);

      if (progress < 25) setProvisioningStage(1);
      else if (progress < 55) setProvisioningStage(2);
      else if (progress < 85) setProvisioningStage(3);
      else setProvisioningStage(4);

      if (elapsed >= TOTAL_DURATION_MS) {
        clearInterval(interval);
        setProvisioningProgress(100);
        setSecondsRemaining(0);
        setTimeout(async () => {
          await refreshUser();
          navigate('/app/home', { replace: true });
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isProvisioning, navigate, refreshUser]);

  const handleNext = async () => {
    await saveProgress(false);
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const stepsList = [
    { num: 1, label: 'Identity' },
    { num: 2, label: 'Affiliation & Scope' },
    { num: 3, label: 'Intent' },
    { num: 4, label: 'Firewall' },
    { num: 5, label: 'Review & Launch' },
  ];

  // -------------------------------------------------------------
  // 5-Second Calibration Modal
  // -------------------------------------------------------------
  if (isProvisioning) {
    const stages = [
      {
        num: 1,
        title: 'Cryptographic Identity Ledger & Domain Handshake',
        desc: `Anchoring profile signature for ${displayName || 'Executive'} and sealing MESHVI credential.`,
        icon: ShieldCheck,
      },
      {
        num: 2,
        title: 'Departmental Roster & Bilateral Delegation',
        desc: `Allocating ${selectedDepartments.length} department domain scopes within ${currentCompany || 'Enterprise'}.`,
        icon: Users,
      },
      {
        num: 3,
        title: 'Anti-Spam Intent Vector Calibration',
        desc: `Calibrating ${firewallTags.length} negative boundary filters and locking protocol gates.`,
        icon: Cpu,
      },
      {
        num: 4,
        title: 'Live Directory & Deal Room Synchronization',
        desc: `Activating B2B Synergy Radar and opening bilateral deal room corridors.`,
        icon: Radio,
      },
    ];

    return (
      <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in text-center">
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Cpu className="w-7 h-7 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="px-3 py-0.5 bg-primary-soft text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20 inline-block">
              Calibrating Workspace • {provisioningProgress}% • {secondsRemaining}s
            </span>
            <h2 className="text-xl font-black text-navy tracking-tight">
              Initializing Node for {displayName || 'Your Profile'}
            </h2>
            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
              Configuring verified routes across {selectedDepartments.length} departments and sealing the anti-spam barrier.
            </p>
          </div>

          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-150"
              style={{ width: `${provisioningProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {stages.map((stg) => {
              const isPast = provisioningStage > stg.num || provisioningProgress >= 100;
              const isCurrent = provisioningStage === stg.num && provisioningProgress < 100;
              const IconComp = stg.icon;

              return (
                <div
                  key={stg.num}
                  className={`p-2.5 rounded-xl border transition-all text-xs ${
                    isCurrent
                      ? 'bg-primary-soft/50 border-primary text-navy ring-1 ring-primary'
                      : isPast
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-surface-muted border-border text-text-muted opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <IconComp className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />
                    )}
                    <span className="font-bold text-[11px] truncate">{stg.title}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={async () => {
              await refreshUser();
              navigate('/app/home', { replace: true });
            }}
            className="px-6 py-2.5 bg-navy hover:bg-neutral-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center space-x-2 mx-auto cursor-pointer"
          >
            <span>Launch Dashboard Now ({secondsRemaining}s)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen min-h-screen bg-bg flex flex-col justify-between p-3 sm:p-4 overflow-hidden select-none">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP COMPACT HEADER & STEPPER (Height: ~55px)                  */}
      {/* ------------------------------------------------------------- */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-2 border-b border-border shrink-0">
        <div className="flex items-center space-x-2.5">
          <img
            src="/meshvi-mark.png"
            alt="Meshvi"
            className="w-8 h-8 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black text-navy leading-none">MESHVI</span>
              <span className="px-2 py-0.2 bg-primary-soft text-primary text-[9px] font-extrabold uppercase rounded-full border border-primary/20">
                Executive Onboarding
              </span>
            </div>
            <p className="text-[10px] text-text-muted leading-tight mt-0.5">
              Verified Intent Infrastructure &bull; Step {step} of 5
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center space-x-1 px-2.5 py-1 bg-surface-muted hover:bg-surface text-navy rounded-lg text-xs font-bold border border-border shadow-2xs transition-colors cursor-pointer mr-1"
              title="Go back to previous step"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-primary" />
              <span>Back</span>
            </button>
          )}

          {/* Stepper Navigation Pills */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto">
          {stepsList.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                step === s.num
                  ? 'bg-navy text-white shadow-xs'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'text-text-muted hover:bg-surface-muted hover:text-navy'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold ${
                  step === s.num
                    ? 'bg-primary text-white'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-border text-text-muted'
                }`}
              >
                {step > s.num ? <Check className="w-2.5 h-2.5" /> : s.num}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </button>
          ))}
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN VIEWPORT CARD CONTAINER (Fixed Height, Zero Scroll Steps 1-4) */}
      {/* ------------------------------------------------------------- */}
      <main className="max-w-5xl w-full mx-auto flex-1 my-2 bg-surface border border-border rounded-2xl shadow-xs flex flex-col justify-between overflow-hidden">
        
        {/* Inner Step Body: Steps 1-4 NO SCROLL. Step 5 (Review) ALLOWS SCROLL */}
        <div className={`p-4 sm:p-5 flex-1 flex flex-col justify-start ${step === 5 ? 'overflow-y-auto max-h-[calc(100vh-140px)]' : 'overflow-hidden'}`}>

          {/* ======================================================== */}
          {/* STEP 1: EXECUTIVE IDENTITY & PHOTO                       */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="h-full flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-navy leading-tight">Executive Identity & Portrait</h2>
                    <p className="text-[11px] text-text-muted leading-tight">Your verified executive profile on the MESHVI network.</p>
                  </div>
                </div>
                {avatarUrl && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Photo Stored & Persistent</span>
                  </span>
                )}
              </div>

              {/* Avatar Uploader Row */}
              <div className="p-3 bg-surface-muted/50 border border-border rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="relative group shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-primary/40 shadow-xs bg-white"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-navy to-slate-800 text-white font-black text-lg flex items-center justify-center shadow-xs">
                        {displayName ? displayName[0]?.toUpperCase() : 'M'}
                      </div>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-navy/60 rounded-xl flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-navy flex items-center space-x-1">
                      <Camera className="w-3 h-3 text-primary" />
                      <span>Executive Headshot</span>
                    </span>
                    <p className="text-[11px] text-text-muted leading-snug mt-0.5">
                      Upload your corporate photo (PNG, JPG, WEBP).
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingAvatar ? 'Uploading...' : avatarUrl ? 'Change' : 'Upload'}</span>
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-2.5 py-1.5 border border-border hover:bg-rose-50 text-text-muted hover:text-rose-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="p-1.5 border border-border hover:bg-surface text-text-muted hover:text-navy rounded-lg text-xs cursor-pointer"
                    title="Paste Image URL"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {showUrlInput && (
                <div>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://... or paste image URL"
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-navy focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Name & Email Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                    Full Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Rajiv Menon"
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                    Primary Account Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-3 py-2 bg-surface-muted border border-border rounded-xl text-xs text-text-muted cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Headline with Auto-fill Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy">
                    Executive Headline *
                  </label>
                  <span className="text-[10px] text-text-muted">Click pill below to auto-fill</span>
                </div>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Head of Commercial Partnerships & Travel Retail Distribution"
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {SUGGESTED_HEADLINES.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHeadline(h)}
                      className="text-[10px] px-2 py-0.5 bg-surface-muted hover:bg-primary-soft hover:text-primary text-text-muted rounded-md border border-border transition-colors cursor-pointer"
                    >
                      + {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio Summary */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                  Executive Bio & Focus Summary
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="10+ years driving cross-border commercial alliances and enterprise distribution..."
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-1 focus:ring-primary focus:outline-none leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: AFFILIATION & SCOPE (Compact Grid, Zero Scroll)  */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="h-full flex flex-col justify-between space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/80">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-navy leading-tight">Corporate Affiliation & Clearance</h2>
                    <p className="text-[11px] text-text-muted leading-tight">Establish verified organization, seniority, and department scope.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full border border-primary/20">
                  {selectedDepartments.length}/5 Depts Selected
                </span>
              </div>

              {/* Company & Domain row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative" ref={companySearchRef}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                    Company / Organization *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={currentCompany}
                      onChange={(e) => {
                        setCurrentCompany(e.target.value);
                        setCompanyQuery(e.target.value);
                      }}
                      placeholder="Search or enter company..."
                      className="w-full px-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                    {searchingCompanies && (
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin absolute right-2.5 top-2" />
                    )}
                  </div>
                  {companyDropdownOpen && companyResults.length > 0 && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {companyResults.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setCurrentCompany(c.name);
                            if (c.domain) setCompanyDomain(c.domain);
                            setCompanyId(c.id);
                            setCompanyDropdownOpen(false);
                          }}
                          className="p-2 hover:bg-surface-muted cursor-pointer border-b border-border/40 text-xs"
                        >
                          <div className="font-bold text-navy">{c.name}</div>
                          <div className="text-[10px] text-text-muted">{c.domain || c.industry}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                    Corporate Domain / Website
                  </label>
                  <input
                    type="text"
                    value={companyDomain}
                    onChange={(e) => setCompanyDomain(e.target.value)}
                    placeholder="e.g. acme-global.com"
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Country & City CUSTOM DROPDOWNS with auto ISO code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Custom Country Dropdown */}
                <div className="relative" ref={countryDropdownRef}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1 flex items-center justify-between">
                    <span>Country *</span>
                    <span className="text-[10px] text-primary font-mono font-bold">Code: {countryCode || '--'}</span>
                  </label>
                  <div
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-navy flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{selectedCountryName || 'Select Country...'}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  </div>

                  {countryDropdownOpen && (
                    <div className="absolute z-40 left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-xl p-2 space-y-1.5 max-h-52 flex flex-col">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={countrySearchQuery}
                          onChange={(e) => setCountrySearchQuery(e.target.value)}
                          placeholder="Filter countries..."
                          className="w-full pl-8 pr-2 py-1.5 bg-surface-muted border border-border rounded-lg text-xs text-navy focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto flex-1 space-y-0.5">
                        {filteredCountries.map((c) => (
                          <div
                            key={c.isoCode}
                            onClick={() => {
                              setSelectedCountryName(c.name);
                              setCountryCode(c.isoCode);
                              // Auto pick first city or reset
                              const cities = City.getCitiesOfCountry(c.isoCode) || [];
                              if (cities.length > 0) setSelectedCity(cities[0].name);
                              else setSelectedCity(c.name);
                              setCountryDropdownOpen(false);
                            }}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-primary-soft text-xs text-navy flex items-center justify-between cursor-pointer"
                          >
                            <span className="truncate">{c.flag} {c.name}</span>
                            <span className="text-[10px] font-mono font-bold text-text-muted">{c.isoCode}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom City Dropdown */}
                <div className="relative" ref={cityDropdownRef}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                    Operating City *
                  </label>
                  <div
                    onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-navy flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{selectedCity || 'Select City...'}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  </div>

                  {cityDropdownOpen && (
                    <div className="absolute z-40 left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-xl p-2 space-y-1.5 max-h-52 flex flex-col">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={citySearchQuery}
                          onChange={(e) => setCitySearchQuery(e.target.value)}
                          placeholder="Search or enter city..."
                          className="w-full pl-8 pr-2 py-1.5 bg-surface-muted border border-border rounded-lg text-xs text-navy focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && citySearchQuery.trim()) {
                              setSelectedCity(citySearchQuery.trim());
                              setCityDropdownOpen(false);
                            }
                          }}
                        />
                      </div>
                      <div className="overflow-y-auto flex-1 space-y-0.5">
                        {citySearchQuery.trim() && (
                          <div
                            onClick={() => {
                              setSelectedCity(citySearchQuery.trim());
                              setCityDropdownOpen(false);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-primary-soft text-primary font-bold text-xs cursor-pointer"
                          >
                            Use custom: "{citySearchQuery.trim()}"
                          </div>
                        )}
                        {filteredCities.map((city) => (
                          <div
                            key={city.name}
                            onClick={() => {
                              setSelectedCity(city.name);
                              setCityDropdownOpen(false);
                            }}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-primary-soft text-xs text-navy flex items-center justify-between cursor-pointer"
                          >
                            <span>{city.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seniority Tier Cards */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
                  Signing Authority & Clearance Tier
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SENIORITY_OPTIONS.map((s) => {
                    const isSelected = seniority === s.value;
                    return (
                      <div
                        key={s.value}
                        onClick={() => setSeniority(s.value)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary-soft border-primary ring-1 ring-primary'
                            : 'bg-surface border-border hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-navy truncate">{s.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </div>
                        <span className="text-[9px] text-primary font-bold block mt-0.5 truncate">{s.badge}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Department Scope Cards: Multi-Select UP TO 5 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy">
                    Primary Department Scope (Select up to 5)
                  </label>
                  <span className="text-[10px] font-bold text-primary">
                    {selectedDepartments.length} of 5 selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {DEPARTMENT_OPTIONS.map((d) => {
                    const isSelected = selectedDepartments.includes(d.value);
                    return (
                      <div
                        key={d.value}
                        onClick={() => toggleDepartment(d.value)}
                        className={`px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary-soft/70 border-primary text-navy font-bold ring-1 ring-primary'
                            : 'bg-surface border-border text-text-muted hover:bg-surface-muted'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="text-[11px] font-bold truncate">{d.label}</div>
                          <div className="text-[9px] text-text-muted truncate">{d.sublabel}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary border-primary text-white' : 'border-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: COMMERCIAL INTENT (Compact & Balanced Spacing)   */}
          {/* ======================================================== */}
          {step === 3 && (
            <div className="flex flex-col justify-between space-y-3 animate-fade-in h-full">
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-border/80 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-navy leading-tight">Commercial Business Intent</h2>
                    <p className="text-[11px] text-text-muted leading-tight">Define your bilateral mandate to calibrate MESHVI's AI Synergy Radar.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full border border-primary/20">
                  Step 3 of 5 &bull; Bilateral Intent Vectors
                </span>
              </div>

              {/* Grid: Card 1 (Seeking) & Card 2 (Offering) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-hidden">
                {/* Card 1: What are you seeking */}
                <div className="p-3 bg-surface-muted/30 border border-border rounded-xl flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-navy flex items-center space-x-1.5">
                        <Search className="w-3.5 h-3.5 text-primary" />
                        <span>Seeking Mandate (Demand) *</span>
                      </label>
                      <span className="text-[10px] text-text-muted">Auto-fill preset below</span>
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={lookingFor}
                      onChange={(e) => setLookingFor(e.target.value)}
                      placeholder="e.g. Enterprise retail channel distribution partners across APAC..."
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted block mb-1">Quick Presets:</span>
                    <div className="flex flex-col space-y-1">
                      {SUGGESTED_SEEKING.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLookingFor(s)}
                          className="text-left text-[10px] px-2.5 py-1 bg-surface hover:bg-primary-soft hover:text-primary text-text-muted rounded-lg border border-border/80 transition-colors cursor-pointer truncate"
                          title={s}
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card 2: What you offer */}
                <div className="p-3 bg-surface-muted/30 border border-border rounded-xl flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-navy flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Value Proposition (Supply) *</span>
                      </label>
                      <span className="text-[10px] text-text-muted">Auto-fill preset below</span>
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={offering}
                      onChange={(e) => setOffering(e.target.value)}
                      placeholder="e.g. Direct access to 450+ verified enterprise buyer accounts..."
                      className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted block mb-1">Quick Presets:</span>
                    <div className="flex flex-col space-y-1">
                      {SUGGESTED_OFFERING.map((o, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setOffering(o)}
                          className="text-left text-[10px] px-2.5 py-1 bg-surface hover:bg-primary-soft hover:text-primary text-text-muted rounded-lg border border-border/80 transition-colors cursor-pointer truncate"
                          title={o}
                        >
                          + {o}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Synergy Guarantee strip */}
              <div className="p-2.5 bg-gradient-to-r from-navy via-slate-900 to-navy text-white rounded-xl border border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-200">
                    <strong className="text-white">MESHVI Synergy Radar:</strong> Counterparties are matched strictly by reciprocal intent alignment.
                  </span>
                </div>
                <span className="text-[10px] text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800 shrink-0">
                  AI Calibrated
                </span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: ANTI-SPAM FIREWALL (Compact & Balanced Spacing)  */}
          {/* ======================================================== */}
          {step === 4 && (
            <div className="flex flex-col justify-between space-y-3 animate-fade-in h-full">
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-border/80 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-200">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-navy leading-tight">Anti-Spam Pitch Firewall & Protocol</h2>
                    <p className="text-[11px] text-text-muted leading-tight">Inbound proposals matching blocked tags are intercepted before reaching your inbox.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {firewallTags.length} Interceptors Active
                </span>
              </div>

              {/* Card 1: Blocked Topic Tags Cloud & Add custom */}
              <div className="p-3 bg-surface-muted/30 border border-border rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-navy flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Active Blocked Topic Perimeter</span>
                  </span>
                  <span className="text-[10px] text-text-muted">Click ✕ to unblock</span>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-surface rounded-lg border border-border/60">
                  {firewallTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg text-[10px] font-bold shadow-2xs"
                    >
                      <span>✕ {tag}</span>
                      <button
                        type="button"
                        onClick={() => setFirewallTags(firewallTags.filter((t) => t !== tag))}
                        className="text-rose-400 hover:text-rose-700 ml-1 cursor-pointer"
                        title="Remove filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Add Presets + Custom Tag Input */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-text-muted">Quick add:</span>
                  {POPULAR_FIREWALL_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!firewallTags.includes(p)) setFirewallTags([...firewallTags, p]);
                      }}
                      className="text-[10px] px-2 py-0.5 bg-surface hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-text-muted rounded-md border border-border transition-colors cursor-pointer"
                    >
                      + {p}
                    </button>
                  ))}
                </div>

                <div className="flex space-x-2 pt-0.5">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customTagInput.trim()) {
                        e.preventDefault();
                        if (!firewallTags.includes(customTagInput.trim())) {
                          setFirewallTags([...firewallTags, customTagInput.trim()]);
                        }
                        setCustomTagInput('');
                      }
                    }}
                    placeholder="Type custom blocked keyword (e.g. Cold Crypto Pitch, Offshore Outbound)..."
                    className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs text-navy focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customTagInput.trim() && !firewallTags.includes(customTagInput.trim())) {
                        setFirewallTags([...firewallTags, customTagInput.trim()]);
                        setCustomTagInput('');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-navy hover:bg-neutral-800 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                  >
                    Add Interceptor
                  </button>
                </div>
              </div>

              {/* Card 2: Default Reception Protocol (Can select single or both) */}
              <div className="p-3 bg-surface-muted/30 border border-border rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-navy">
                    Default Reception Protocol (Single or Both Active)
                  </span>
                  <span className="text-[10px] text-primary font-bold bg-primary-soft px-2 py-0.5 rounded-full border border-primary/20">
                    {selectedProtocols.length === 2 ? 'Both Protocols Active ✓' : '1 Protocol Active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => toggleProtocol('DEAL_ROOM')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                      selectedProtocols.includes('DEAL_ROOM')
                        ? 'bg-primary-soft/80 border-primary ring-1 ring-primary'
                        : 'bg-surface border-border hover:bg-surface-muted'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-navy">Micro Deal Room First</span>
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-snug">
                        Require mutual agenda & bilateral NDA before releasing calendar slots.
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ml-2 ${
                      selectedProtocols.includes('DEAL_ROOM') ? 'bg-primary border-primary text-white' : 'border-border'
                    }`}>
                      {selectedProtocols.includes('DEAL_ROOM') && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  <div
                    onClick={() => toggleProtocol('SCHEDULED_CALL')}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                      selectedProtocols.includes('SCHEDULED_CALL')
                        ? 'bg-primary-soft/80 border-primary ring-1 ring-primary'
                        : 'bg-surface border-border hover:bg-surface-muted'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-navy">Direct Calendar Slot Lock</span>
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5 leading-snug">
                        Permit 1-click in-stream calendar slot locks upon verified mutual match.
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ml-2 ${
                      selectedProtocols.includes('SCHEDULED_CALL') ? 'bg-primary border-primary text-white' : 'border-border'
                    }`}>
                      {selectedProtocols.includes('SCHEDULED_CALL') && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Perimeter Seal Status */}
              <div className="p-2.5 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-semibold text-emerald-900">
                    <strong className="text-emerald-950">Inbound Shield Engaged:</strong> 100% of unsolicited pitches matching your {firewallTags.length} filters are rejected automatically.
                  </span>
                </div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                  Zero Spam
                </span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: REVIEW PAGE (BEST ENGAGING EXECUTIVE DOSSIER)   */}
          {/* ======================================================== */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-navy leading-tight">Executive Dossier & Credential Review</h2>
                    <p className="text-[11px] text-text-muted leading-tight">Review your complete verified node parameters before workspace initialization.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Executive Credential Dossier Card */}
              <div className="bg-gradient-to-br from-slate-900 via-navy to-slate-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                
                {/* Header Profile Identity */}
                <div className="flex items-start justify-between relative z-10 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/50 shadow-md bg-white"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-white/10 text-white font-black text-2xl flex items-center justify-center border border-white/20">
                          {displayName ? displayName[0]?.toUpperCase() : 'M'}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="Node Active" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-black text-white">{displayName || 'Executive Leader'}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/20 border border-primary/40 text-sky-300">
                          {seniority}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-300">{headline || 'Executive Focus'}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-0.5">
                        <span className="font-bold text-white">{currentCompany || 'Organization'}</span>
                        {companyDomain && <span>&bull; {companyDomain}</span>}
                        <span>&bull; {selectedCity}, {countryCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black rounded-full uppercase tracking-wider inline-block">
                      Verified Node ✓
                    </span>
                  </div>
                </div>

                {/* 5 Departments Scope Grid */}
                <div className="pt-4 mt-4 border-t border-white/10 relative z-10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Authorized Departmental Scope ({selectedDepartments.length}/5):</span>
                    <button type="button" onClick={() => setStep(2)} className="text-sky-300 hover:underline">Edit</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDepartments.map((dept) => (
                      <span key={dept} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 border border-white/15 text-white">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Intent & Firewall Dual Column */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Intent Column */}
                <div className="p-3.5 bg-surface-muted/60 border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-navy flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5 text-primary" />
                      <span>Commercial Intent Mandate</span>
                    </span>
                    <button type="button" onClick={() => setStep(3)} className="text-[10px] text-primary font-bold hover:underline">Edit</button>
                  </div>
                  <div className="text-xs text-text-muted leading-relaxed line-clamp-3">
                    <strong className="text-navy">Seeking:</strong> {lookingFor}
                  </div>
                  <div className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    <strong className="text-navy">Offering:</strong> {offering}
                  </div>
                </div>

                {/* Firewall Column */}
                <div className="p-3.5 bg-surface-muted/60 border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-navy flex items-center space-x-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Pitch Barrier & Protocols</span>
                    </span>
                    <button type="button" onClick={() => setStep(4)} className="text-[10px] text-primary font-bold hover:underline">Edit</button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {firewallTags.slice(0, 4).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 border border-rose-200 text-rose-800">
                        ✕ {t}
                      </span>
                    ))}
                    {firewallTags.length > 4 && (
                      <span className="text-[9px] font-bold text-text-muted self-center">
                        +{firewallTags.length - 4} more
                      </span>
                    )}
                  </div>
                  <div className="pt-1 text-[10px] text-text-muted">
                    <strong className="text-navy">Reception:</strong> {selectedProtocols.map(p => p === 'DEAL_ROOM' ? 'Micro Deal Room' : 'Calendar Slot Lock').join(' & ')}
                  </div>
                </div>
              </div>

              {/* Launch Action */}
              <div className="pt-2 text-center space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => saveProgress(true)}
                  className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 mx-auto cursor-pointer"
                >
                  <span>{loading ? 'Initializing Node...' : 'Authorize Identity & Initialize MESHVI Workspace (5s) →'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-text-muted">
                  Launches 5-second workspace initialization with calibrated routing.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ------------------------------------------------------------- */}
        {/* BOTTOM COMPACT ACTION BAR (Height: ~48px)                     */}
        {/* ------------------------------------------------------------- */}
        <footer className="px-4 py-2.5 bg-surface-muted/60 border-t border-border flex items-center justify-between shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-3.5 py-1.5 bg-surface hover:bg-surface-muted border border-border text-navy rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs hover:border-slate-300"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-primary" />
                <span>Back to Step {step - 1}</span>
              </button>
            ) : (
              <div className="text-[11px] text-text-muted font-medium">
                Step 1 of 5 &bull; Identity
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            {saveSuccess && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Draft Saved</span>
              </span>
            )}
            {error && (
              <span className="text-[11px] font-bold text-rose-600 max-w-[200px] truncate" title={error}>
                {error}
              </span>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={() => saveProgress(false)}
              className="px-3 py-1.5 border border-border hover:bg-surface text-text-muted hover:text-navy rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-1.5 bg-navy hover:bg-neutral-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => saveProgress(true)}
                className="px-5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <span>{loading ? 'Initializing...' : 'Authorize & Initialize Workspace (5s) →'}</span>
              </button>
            )}
          </div>
        </footer>

      </main>

    </div>
  );
};
