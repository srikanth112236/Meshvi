import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Country } from 'country-state-city';
import {
  User,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import {
  getAllCountryPhoneInfos,
  validatePhoneNumber,
  parseExistingPhoneNumber,
  getPhoneRuleForCountry,
  cleanSubscriberDigits,
  formatSubscriberDigits,
} from '../../utils/phoneUtils';

// Compact Authority Options
const AUTHORITY_LEVELS = [
  {
    id: 'C-Level / Founder',
    title: 'Founder / C-Level',
    subtitle: 'Strategic decisions',
    icon: Building2,
  },
  {
    id: 'VP / Managing Director',
    title: 'VP / Director',
    subtitle: 'Department leadership',
    icon: Briefcase,
  },
  {
    id: 'Director / Head of Dept',
    title: 'Manager / Head',
    subtitle: 'Team decisions',
    icon: UsersIcon,
  },
  {
    id: 'Lead / Principal Specialist',
    title: 'Professional',
    subtitle: 'Specialist / Evaluator',
    icon: User,
  },
];

function UsersIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// 8 Compact Department Options
const DEPARTMENT_CHIPS = [
  { value: 'Commercial Partnerships & Alliances', label: 'Commercial & Partnerships' },
  { value: 'Technology, AI & Platform Engineering', label: 'Technology & AI' },
  { value: 'Procurement & Strategic Sourcing', label: 'Procurement' },
  { value: 'Corporate Strategy & M&A', label: 'Corporate Strategy' },
  { value: 'Enterprise Sales & Business Development', label: 'Sales & Growth' },
  { value: 'Supply Chain, Logistics & Distribution', label: 'Supply Chain' },
  { value: 'Finance, Treasury & Trade Operations', label: 'Finance & Treasury' },
  { value: 'Executive Leadership & Board', label: 'Executive Leadership' },
];

const DEFAULT_FIREWALL_TAGS = [
  'Unsolicited Lead Gen Agencies',
  'Offshore Staff Augmentation',
  'Generic SEO & Content Services',
  'Fractional Recruitment Pitchers',
  'Cold Financial Advisory Sales',
  'Automated InMail Mass Blasts',
];

const ALL_COUNTRIES = Country.getAllCountries().map((c) => ({
  name: c.name,
  isoCode: c.isoCode,
  flag: c.flag,
}));

const ALL_PHONE_COUNTRIES = getAllCountryPhoneInfos();

export const OnboardingPage: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Wizard Step: 1 (Identity), 2 (Company & Authority), 3 (Review & Intent), 4 (Workspace Initialization)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // -------------------------------------------------------------
  // Step 1: Personal Profile
  // -------------------------------------------------------------
  const [displayName, setDisplayName] = useState(
    user?.profile?.displayName || (user as any)?.name || ''
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || user?.avatarUrl || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email] = useState(user?.email || '');

  // Phone state with international validation
  const [phoneNumber, setPhoneNumber] = useState(
    (user as any)?.phoneNumber || user?.profile?.phoneNumber || ''
  );
  const [phoneCountryIso, setPhoneCountryIso] = useState('IN');
  const [phoneDialCode, setPhoneDialCode] = useState('+91');
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [phoneSearchQuery, setPhoneSearchQuery] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneDropdownRef = useRef<HTMLDivElement>(null);

  // Professional designation & bio (compact, replaces lengthy headlines)
  const [currentTitle, setCurrentTitle] = useState(user?.profile?.currentTitle || 'VP of Partnerships');
  const [bio, setBio] = useState(user?.profile?.summary || '');

  // -------------------------------------------------------------
  // Step 2: Company Affiliation & Authority
  // -------------------------------------------------------------
  const [currentCompany, setCurrentCompany] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Country & City
  const [countryCode, setCountryCode] = useState('IN');
  const [selectedCountryName, setSelectedCountryName] = useState('India');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');

  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Authority & Departments
  const [seniority, setSeniority] = useState('C-Level / Founder');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    'Commercial Partnerships & Alliances',
    'Technology, AI & Platform Engineering',
  ]);

  // -------------------------------------------------------------
  // Step 3: Intent & Final Review
  // -------------------------------------------------------------
  const [lookingFor, setLookingFor] = useState(
    'Strategic partnerships and enterprise distribution opportunities.'
  );
  const [offering, setOffering] = useState(
    'Technology solutions and business collaboration opportunities.'
  );
  const [firewallTags, setFirewallTags] = useState<string[]>(DEFAULT_FIREWALL_TAGS);

  // Modals for editing intent & preferences in Step 3
  const [editingIntentType, setEditingIntentType] = useState<'LOOKING_FOR' | 'OFFERING' | 'PREFERENCES' | null>(null);
  const [tempTextValue, setTempTextValue] = useState('');

  // -------------------------------------------------------------
  // Step 4: Workspace Provisioning Live State
  // -------------------------------------------------------------
  const [provisioningStatus, setProvisioningStatus] = useState<{
    profile: 'pending' | 'active' | 'complete';
    company: 'pending' | 'active' | 'complete';
    departments: 'pending' | 'active' | 'complete';
    workspace: 'pending' | 'active' | 'complete';
  }>({
    profile: 'complete',
    company: 'complete',
    departments: 'active',
    workspace: 'pending',
  });

  // Phone validation & Country Info
  const phoneValidation = useMemo(() => {
    return validatePhoneNumber(phoneNumber, phoneCountryIso, phoneDialCode);
  }, [phoneNumber, phoneCountryIso, phoneDialCode]);

  const currentPhoneRule = useMemo(() => {
    return getPhoneRuleForCountry(phoneCountryIso);
  }, [phoneCountryIso]);

  const selectedPhoneCountry = useMemo(() => {
    return ALL_PHONE_COUNTRIES.find((c) => c.isoCode === phoneCountryIso) || {
      isoCode: phoneCountryIso,
      name: 'Selected',
      flag: '🌐',
      dialCode: phoneDialCode,
    };
  }, [phoneCountryIso, phoneDialCode]);

  const filteredPhoneCountries = useMemo(() => {
    if (!phoneSearchQuery.trim()) return ALL_PHONE_COUNTRIES.slice(0, 50);
    const q = phoneSearchQuery.toLowerCase();
    return ALL_PHONE_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.isoCode.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    ).slice(0, 50);
  }, [phoneSearchQuery]);

  // Outside click listener for custom dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(e.target as Node)) {
        setPhoneDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial load
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
          if (p.summary) setBio(p.summary);
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
          if (p.countryCode) {
            setCountryCode(p.countryCode);
            const foundC = ALL_COUNTRIES.find((c) => c.isoCode === p.countryCode);
            if (foundC) setSelectedCountryName(foundC.name);
          }
          if (p.city) setSelectedCity(p.city);

          const rawPhone = p.user?.phoneNumber || p.phoneNumber || (user as any)?.phoneNumber || '';
          if (rawPhone) {
            const parsed = parseExistingPhoneNumber(rawPhone, p.countryCode || 'IN');
            setPhoneCountryIso(parsed.countryIso);
            setPhoneDialCode(parsed.dialCode);
            setPhoneNumber(parsed.subscriberDigits);
          }

          if (p.intents && p.intents.length > 0) {
            const lk = p.intents.find((i: any) => i.intentType === 'LOOKING_FOR');
            const of = p.intents.find((i: any) => i.intentType === 'OFFERING');
            const nl = p.intents.filter((i: any) => i.intentType === 'NOT_LOOKING_FOR').map((i: any) => i.description);
            if (lk?.description) setLookingFor(lk.description);
            if (of?.description) setOffering(of.description);
            if (nl.length > 0) setFirewallTags(nl);
          }
        }
      } catch (err) {
        console.warn('Could not load profile:', err);
      }
    };
    loadProfile();
  }, [token]);

  const filteredCountries = useMemo(() => {
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
        c.isoCode.toLowerCase().includes(countrySearchQuery.toLowerCase())
    ).slice(0, 30);
  }, [countrySearchQuery]);

  // Department Toggle (Up to 5)
  const toggleDepartment = (deptValue: string) => {
    if (selectedDepartments.includes(deptValue)) {
      if (selectedDepartments.length === 1) {
        showToast({ title: 'Minimum 1 Required', message: 'You must select at least one primary department.', type: 'info' });
        return;
      }
      setSelectedDepartments(selectedDepartments.filter((d) => d !== deptValue));
    } else {
      if (selectedDepartments.length >= 5) {
        showToast({ title: 'Limit Reached', message: 'You can select up to 5 departments.', type: 'info' });
        return;
      }
      setSelectedDepartments([...selectedDepartments, deptValue]);
    }
  };

  // Avatar Upload
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({ title: 'Invalid File', message: 'Please select an image file (JPG, PNG, WEBP).', type: 'error' });
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
          setAvatarUrl(data.data.avatarUrl);
          showToast({ title: 'Photo Uploaded', message: 'Profile portrait updated.', type: 'success' });
        }
      } catch (err) {
        console.warn('Avatar upload error:', err);
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Progress or Finalize Onboarding
  const saveProgress = async (complete: boolean = false) => {
    setLoading(true);
    setError('');

    const phoneVal = validatePhoneNumber(phoneNumber, phoneCountryIso, phoneDialCode);

    const sanitizedIntents = [
      ...(lookingFor?.trim() ? [{ intentType: 'LOOKING_FOR', description: lookingFor.trim() }] : []),
      ...(offering?.trim() ? [{ intentType: 'OFFERING', description: offering.trim() }] : []),
      ...firewallTags.filter(Boolean).map((t) => ({ intentType: 'NOT_LOOKING_FOR', description: t.trim() })),
    ];

    const payload = {
      displayName: displayName.trim(),
      avatarUrl: avatarUrl.trim(),
      headline: currentTitle.trim(),
      summary: bio.trim() || `Executive in ${selectedDepartments.join(', ')} at ${currentCompany || 'Enterprise'}.`,
      currentTitle: currentTitle.trim(),
      currentCompanyName: currentCompany.trim() || 'Vedasynk Technologies',
      currentCompanyId: companyId || undefined,
      department: selectedDepartments[0] || 'Commercial Partnerships & Alliances',
      function: selectedDepartments.join('; '),
      seniority,
      industry: 'Enterprise Software & Technology',
      city: selectedCity || 'Bengaluru',
      countryCode: countryCode || 'IN',
      phoneNumber: phoneVal.isValid
        ? phoneVal.formattedNumber
        : phoneNumber.trim()
        ? `${phoneDialCode} ${phoneNumber.trim()}`
        : undefined,
      intents: sanitizedIntents,
      isCompleted: complete,
    };

    try {
      let res = await fetch('/api/v1/profiles/me/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data = await res.json();

      if (!res.ok && data.error && JSON.stringify(data.error).includes('phoneNumber should not exist')) {
        const fallbackPayload = { ...payload };
        delete (fallbackPayload as any).phoneNumber;
        res = await fetch('/api/v1/profiles/me/onboarding', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(fallbackPayload),
        });
        data = await res.json();
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to save profile information.');
      }

      await refreshUser();
      return true;
    } catch (err: any) {
      setError(err.message || 'Error saving onboarding details.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 1 Next
  const handleStep1Next = async () => {
    setPhoneTouched(true);
    if (!displayName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    const val = validatePhoneNumber(phoneNumber, phoneCountryIso, phoneDialCode);
    if (!val.isValid) {
      setPhoneError(val.errorMessage || currentPhoneRule.errorMessage || 'Please enter a valid mobile number.');
      return;
    }
    if (!currentTitle.trim()) {
      setError('Please enter your professional designation.');
      return;
    }

    setError('');
    const ok = await saveProgress(false);
    if (ok) setStep(2);
  };

  // Handle Step 2 Next
  const handleStep2Next = async () => {
    if (!currentCompany.trim()) {
      setError('Please provide your company or organization name.');
      return;
    }
    if (selectedDepartments.length === 0) {
      setError('Please select at least one department interest.');
      return;
    }

    setError('');
    const ok = await saveProgress(false);
    if (ok) setStep(3);
  };

  // Handle Final Authorization & Workspace Launch (Actual backend execution)
  const handleLaunchWorkspace = async () => {
    setError('');
    setStep(4);

    // Operational stage 1 & 2 complete
    setProvisioningStatus({
      profile: 'complete',
      company: 'complete',
      departments: 'active',
      workspace: 'pending',
    });

    // Run backend operations
    const success = await saveProgress(true);

    if (success) {
      setProvisioningStatus({
        profile: 'complete',
        company: 'complete',
        departments: 'complete',
        workspace: 'active',
      });

      // Final workspace handshake
      setTimeout(() => {
        setProvisioningStatus({
          profile: 'complete',
          company: 'complete',
          departments: 'complete',
          workspace: 'complete',
        });

        setTimeout(async () => {
          await refreshUser();
          navigate('/app/search', { replace: true });
        }, 800);
      }, 700);
    } else {
      setStep(3);
      setError('Could not complete workspace initialization. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F9FC] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans selection:bg-blue-100">
      {/* Main Card Container (960px - 1040px) */}
      <div className="w-full max-w-[1040px] min-h-[640px] bg-white rounded-[24px] sm:rounded-[28px] shadow-[0_20px_50px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* ========================================================= */}
        {/* LEFT BLUE SIDEBAR (Stepper, Brand Logo & Watermark)        */}
        {/* ========================================================= */}
        <div className="md:col-span-4 lg:col-span-4 bg-gradient-to-b from-[#078BCC] via-[#0575AD] to-[#102B45] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric line curves watermark */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
            viewBox="0 0 400 700"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="360" cy="180" r="160" />
            <circle cx="360" cy="180" r="220" />
            <circle cx="360" cy="520" r="180" />
            <circle cx="40" cy="620" r="140" />
          </svg>

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
              <img
                src="/meshvi-logo-white.png"
                alt="Meshvi"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Stepper Steps (Vertical Progress Indicator) */}
          <div className="relative z-10 my-8 sm:my-10 space-y-6">
            {/* Step 1 */}
            <div className="flex items-start space-x-3.5 group cursor-default">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all shadow-sm ${
                  step === 1
                    ? 'bg-white text-[#078BCC] ring-4 ring-white/20'
                    : step > 1
                    ? 'bg-emerald-400 text-slate-900'
                    : 'bg-white/20 text-white/70'
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4 stroke-[2.5]" /> : <User className="w-4 h-4" />}
              </div>
              <div className="pt-0.5">
                <p className={`text-xs font-bold leading-tight ${step === 1 ? 'text-white' : 'text-white/80'}`}>
                  Your personal details
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Personal profile & identity
                </p>
              </div>
            </div>

            {/* Connecting Line 1 */}
            <div className="ml-4.5 w-0.5 h-6 bg-white/20 -my-3" />

            {/* Step 2 */}
            <div className="flex items-start space-x-3.5 group cursor-default">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all shadow-sm ${
                  step === 2
                    ? 'bg-white text-[#078BCC] ring-4 ring-white/20'
                    : step > 2
                    ? 'bg-emerald-400 text-slate-900'
                    : 'bg-white/20 text-white/70'
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Building2 className="w-4 h-4" />}
              </div>
              <div className="pt-0.5">
                <p className={`text-xs font-bold leading-tight ${step === 2 ? 'text-white' : 'text-white/80'}`}>
                  Your company details
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Business affiliation & scope
                </p>
              </div>
            </div>

            {/* Connecting Line 2 */}
            <div className="ml-4.5 w-0.5 h-6 bg-white/20 -my-3" />

            {/* Step 3 */}
            <div className="flex items-start space-x-3.5 group cursor-default">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all shadow-sm ${
                  step === 3 || step === 4
                    ? 'bg-white text-[#078BCC] ring-4 ring-white/20'
                    : 'bg-white/20 text-white/70'
                }`}
              >
                {step === 4 ? <Check className="w-4 h-4 stroke-[2.5]" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <div className="pt-0.5">
                <p className={`text-xs font-bold leading-tight ${step >= 3 ? 'text-white' : 'text-white/80'}`}>
                  Your role & review
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Intent & final authorization
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-white/60">
            <span>All rights reserved @Meshvi</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT CONTENT PANEL (Clean, Compact, Minimalist Cards)     */}
        {/* ========================================================= */}
        <div className="md:col-span-8 lg:col-span-8 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white relative">
          {/* Subtle concentric circles watermark on the right edge */}
          <svg
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-5 text-slate-900"
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="200" cy="0" r="80" />
            <circle cx="200" cy="0" r="140" />
            <circle cx="200" cy="0" r="200" />
          </svg>

          {/* Top Step Counter & Header */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#078BCC] tracking-wide uppercase">
                {step === 1 && 'Step 1/3 · Personal profile'}
                {step === 2 && 'Step 2/3 · Business affiliation'}
                {step === 3 && 'Step 3/3 · Final verification'}
                {step === 4 && 'Setting up your workspace'}
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-400">
                0{Math.min(step, 3)} / 03
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {step === 1 && 'Your identity'}
              {step === 2 && 'Company & role'}
              {step === 3 && 'Review your profile'}
              {step === 4 && 'Preparing your Meshvi workspace'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {step === 1 && 'A few details to establish your verified business identity.'}
              {step === 2 && 'Tell us about your organization and your operational authority.'}
              {step === 3 && 'Review your verified profile and authorize your professional workspace.'}
              {step === 4 && 'Setting up your professional network and business preferences.'}
            </p>

            <div className="w-full border-t border-slate-100 my-4" />
          </div>

          {/* Global Error Notice */}
          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 1: PERSONAL PROFILE & IDENTITY                           */}
          {/* ------------------------------------------------------------- */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Inline Profile Photo Upload Component */}
              <div className="flex items-center space-x-4 p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
                <div className="relative w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-full bg-slate-200 border-2 border-white shadow-xs overflow-hidden shrink-0 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-800">Profile photo</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG or WEBP · Optional</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#078BCC] hover:text-[#0679B2] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{avatarUrl ? 'Change photo' : 'Upload photo'}</span>
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Two Column Grid for Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full name *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full h-11 px-3.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#078BCC] focus:ring-2 focus:ring-[#078BCC]/15 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Account email</label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Verified email</span>
                    </span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    className="w-full h-11 px-3.5 bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-500 cursor-not-allowed select-none"
                  />
                </div>
              </div>

              {/* Two Column Grid for Mobile Number & Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Mobile Phone Number with Country Dropdown */}
                <div className="relative" ref={phoneDropdownRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Mobile number *
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentPhoneRule.maxLength ? `Max ${currentPhoneRule.maxLength} digits` : ''}
                    </span>
                  </div>
                  <div
                    className={`flex rounded-lg border bg-slate-50/70 focus-within:bg-white transition-all ${
                      phoneTouched && !phoneValidation.isValid
                        ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                        : phoneTouched && phoneValidation.isValid
                        ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/20'
                        : 'border-slate-200 focus-within:border-[#078BCC] focus-within:ring-2 focus-within:ring-[#078BCC]/15'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                      className="flex items-center space-x-1.5 px-2.5 border-r border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-l-lg transition-colors shrink-0 cursor-pointer"
                    >
                      <span className="text-sm leading-none">{selectedPhoneCountry?.flag || '🌐'}</span>
                      <span className="font-mono">{phoneDialCode}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    <input
                      type="tel"
                      value={phoneNumber}
                      maxLength={currentPhoneRule.maxLength || 15}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const cleaned = cleanSubscriberDigits(raw, phoneDialCode);
                        const truncated = currentPhoneRule.maxLength ? cleaned.slice(0, currentPhoneRule.maxLength) : cleaned;
                        setPhoneNumber(truncated);
                        setPhoneTouched(true);
                        const res = validatePhoneNumber(truncated, phoneCountryIso, phoneDialCode);
                        if (!res.isValid) {
                          setPhoneError(res.errorMessage || currentPhoneRule.errorMessage);
                        } else {
                          setPhoneError('');
                        }
                      }}
                      onBlur={() => {
                        setPhoneTouched(true);
                        const res = validatePhoneNumber(phoneNumber, phoneCountryIso, phoneDialCode);
                        if (!res.isValid) {
                          setPhoneError(res.errorMessage || currentPhoneRule.errorMessage);
                        } else {
                          setPhoneError('');
                        }
                      }}
                      placeholder={currentPhoneRule.placeholder || 'Enter mobile number'}
                      className="w-full h-11 px-3 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                    {phoneTouched && phoneValidation.isValid && (
                      <div className="flex items-center pr-3 text-emerald-600 shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {phoneTouched && !phoneValidation.isValid ? (
                    <p className="text-[10px] text-red-600 mt-1 leading-tight flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>{phoneError || phoneValidation.errorMessage || currentPhoneRule.errorMessage}</span>
                    </p>
                  ) : phoneTouched && phoneValidation.isValid ? (
                    <p className="text-[10px] text-emerald-600 mt-1 leading-tight flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Valid: {phoneValidation.formattedNumber}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                      Prefix <span className="font-mono text-slate-500 font-semibold">{phoneDialCode}</span> · Example: <span className="font-mono text-slate-500">{currentPhoneRule.formatExample}</span>
                    </p>
                  )}

                  {/* Phone Country Dropdown */}
                  {phoneDropdownOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-60 overflow-y-auto">
                      <input
                        type="text"
                        value={phoneSearchQuery}
                        onChange={(e) => setPhoneSearchQuery(e.target.value)}
                        placeholder="Search country or code..."
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-1.5 focus:outline-none focus:border-[#078BCC]"
                        autoFocus
                      />
                      <div className="space-y-0.5">
                        {filteredPhoneCountries.map((c) => (
                          <button
                            key={`${c.isoCode}-${c.dialCode}`}
                            type="button"
                            onClick={() => {
                              setPhoneCountryIso(c.isoCode);
                              setPhoneDialCode(c.dialCode);
                              setPhoneDropdownOpen(false);
                              const rule = getPhoneRuleForCountry(c.isoCode);
                              const cleaned = cleanSubscriberDigits(phoneNumber, c.dialCode);
                              const truncated = rule.maxLength ? cleaned.slice(0, rule.maxLength) : cleaned;
                              setPhoneNumber(truncated);
                              if (truncated.length > 0) {
                                const res = validatePhoneNumber(truncated, c.isoCode, c.dialCode);
                                if (!res.isValid) {
                                  setPhoneError(res.errorMessage || rule.errorMessage);
                                } else {
                                  setPhoneError('');
                                }
                              }
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md transition-colors ${
                              c.isoCode === phoneCountryIso
                                ? 'bg-[#078BCC]/10 text-[#078BCC] font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center space-x-2 truncate pr-2">
                              <span className="text-sm leading-none">{c.flag}</span>
                              <span className="truncate">{c.name}</span>
                            </span>
                            <span className="font-mono text-slate-400 shrink-0">{c.dialCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Professional Designation */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Professional designation *
                  </label>
                  <input
                    type="text"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder="e.g. Founder, CEO, Director, VP"
                    className="w-full h-11 px-3.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#078BCC] focus:ring-2 focus:ring-[#078BCC]/15 transition-all"
                  />
                </div>
              </div>

              {/* Professional Bio (Optional, 300 char limit) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <label className="text-[11px] font-semibold text-slate-700">Professional bio</label>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {bio.length} / 300
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={300}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Briefly describe your professional background and core expertise..."
                  className="w-full p-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#078BCC] focus:ring-2 focus:ring-[#078BCC]/15 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: COMPANY AFFILIATION & AUTHORITY LEVEL                 */}
          {/* ------------------------------------------------------------- */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Row 1: Company Name & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Direct Company Name Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Company name *
                  </label>
                  <input
                    type="text"
                    value={currentCompany}
                    onChange={(e) => {
                      setCurrentCompany(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. Vedasynk Technologies"
                    className="w-full h-11 px-3.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#078BCC] focus:ring-2 focus:ring-[#078BCC]/15 transition-all"
                  />
                </div>

                {/* Company Website */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Company website</label>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={companyDomain}
                    onChange={(e) => setCompanyDomain(e.target.value)}
                    placeholder="www.company.com"
                    className="w-full h-11 px-3.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#078BCC] focus:ring-2 focus:ring-[#078BCC]/15 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Country & Operating City (Side by Side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Country Dropdown */}
                <div className="relative" ref={countryDropdownRef}>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Country *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="w-full h-11 px-3.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <span>{selectedCountryName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {countryDropdownOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-52 overflow-y-auto">
                      <input
                        type="text"
                        value={countrySearchQuery}
                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                        placeholder="Search country..."
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg mb-1.5 focus:outline-none focus:border-[#078BCC]"
                      />
                      <div className="space-y-0.5">
                        {filteredCountries.map((c) => (
                          <button
                            key={c.isoCode}
                            type="button"
                            onClick={() => {
                              setSelectedCountryName(c.name);
                              setCountryCode(c.isoCode);
                              setCountryDropdownOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Operating City */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Operating city *
                  </label>
                  <input
                    type="text"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full h-11 px-3.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#078BCC] focus:ring-2 focus:ring-[#078BCC]/15 transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Authority Level (4 compact options) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Your authority level
                </label>
                <p className="text-[10px] text-slate-400 mb-2">Select your current business responsibility.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AUTHORITY_LEVELS.map((auth) => {
                    const isSelected = seniority === auth.id;
                    return (
                      <button
                        key={auth.id}
                        type="button"
                        onClick={() => setSeniority(auth.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#078BCC]/10 border-[#078BCC] text-slate-900 shadow-2xs ring-1 ring-[#078BCC]'
                            : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70 text-slate-700'
                        }`}
                      >
                        <p className="text-xs font-bold leading-tight truncate">{auth.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{auth.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Department Interests (Compact Selectable Chips, Up to 5) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Department interests ({selectedDepartments.length}/5)
                  </label>
                  <span className="text-[10px] text-slate-400">Select relevant areas</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEPARTMENT_CHIPS.map((dept) => {
                    const isSelected = selectedDepartments.includes(dept.value);
                    return (
                      <button
                        key={dept.value}
                        type="button"
                        onClick={() => toggleDepartment(dept.value)}
                        className={`px-2.5 py-2 rounded-lg border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-normal'
                        }`}
                      >
                        <span className="text-[11px] truncate mr-1">{dept.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#078BCC] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3: BUSINESS INTENT & FINAL REVIEW                        */}
          {/* ------------------------------------------------------------- */}
          {step === 3 && (
            <div className="space-y-3.5">
              {/* Compact Verified Executive Profile Card */}
              <div className="p-3.5 bg-gradient-to-r from-slate-900 to-[#102B45] text-white rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-11 h-11 min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px] rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-sm text-white overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      displayName.charAt(0).toUpperCase() || 'M'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-bold text-white truncate">{displayName}</span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded shrink-0">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>Verified</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">
                      {currentTitle} · {currentCompany || 'Vedasynk Technologies'}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{selectedCity}, {selectedCountryName}</span>
                      {phoneNumber && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-slate-300">
                            {selectedPhoneCountry?.flag} {phoneDialCode} {formatSubscriberDigits(phoneNumber, phoneCountryIso)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px] justify-end">
                  {selectedDepartments.slice(0, 2).map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 bg-white/10 border border-white/15 rounded-md text-[9px] font-medium text-slate-200 truncate"
                    >
                      {d.split('&')[0]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Two Concise Intent Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* What I'm Looking For */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-800">What I'm looking for</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIntentType('LOOKING_FOR');
                        setTempTextValue(lookingFor);
                      }}
                      className="text-[10px] font-semibold text-[#078BCC] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {lookingFor}
                  </p>
                </div>

                {/* What I Can Offer */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-800">What I can offer</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingIntentType('OFFERING');
                        setTempTextValue(offering);
                      }}
                      className="text-[10px] font-semibold text-[#078BCC] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {offering}
                  </p>
                </div>
              </div>

              {/* Connection Preferences Chips */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-800">Connection preferences</span>
                  <button
                    type="button"
                    onClick={() => setEditingIntentType('PREFERENCES')}
                    className="text-[10px] font-semibold text-[#078BCC] hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 shadow-2xs">
                    Warm introductions
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 shadow-2xs">
                    Verified businesses
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 shadow-2xs">
                    Deal rooms active
                  </span>
                  <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-[11px] font-medium text-blue-700">
                    {firewallTags.length} Spam filters active
                  </span>
                </div>
              </div>

              {/* Ready to launch box */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Ready to launch</p>
                  <p className="text-[11px] text-slate-500">
                    Review your information and authorize your professional workspace.
                  </p>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#078BCC] shrink-0" />
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 4: WORKSPACE INITIALIZATION (Real Backend Progress)     */}
          {/* ------------------------------------------------------------- */}
          {step === 4 && (
            <div className="py-6 space-y-4 max-w-md mx-auto w-full animate-fade-in">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs space-y-3">
                {/* Checklist Item 1 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">Profile and identity</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Complete
                  </span>
                </div>

                {/* Checklist Item 2 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">Company affiliation</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Complete
                  </span>
                </div>

                {/* Checklist Item 3 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    {provisioningStatus.departments === 'complete' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-[#078BCC] border-t-transparent rounded-full animate-spin" />
                    )}
                    <span className="font-semibold text-slate-800">Department permissions</span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      provisioningStatus.departments === 'complete'
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-blue-700 bg-blue-50'
                    }`}
                  >
                    {provisioningStatus.departments === 'complete' ? 'Complete' : 'In progress'}
                  </span>
                </div>

                {/* Checklist Item 4 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    {provisioningStatus.workspace === 'complete' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : provisioningStatus.workspace === 'active' ? (
                      <div className="w-4 h-4 border-2 border-[#078BCC] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                    <span className="font-semibold text-slate-800">Workspace setup</span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      provisioningStatus.workspace === 'complete'
                        ? 'text-emerald-700 bg-emerald-50'
                        : provisioningStatus.workspace === 'active'
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-slate-400 bg-slate-100'
                    }`}
                  >
                    {provisioningStatus.workspace === 'complete'
                      ? 'Complete'
                      : provisioningStatus.workspace === 'active'
                      ? 'In progress'
                      : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500 animate-pulse">
                  Synchronizing cryptographic executive keys and active deal rooms...
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* BOTTOM NAVIGATION ACTIONS                                     */}
          {/* ------------------------------------------------------------- */}
          {step < 4 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as any)}
                  className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-center transition-all shadow-2xs active:scale-95"
                  title="Previous Step"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div />
              )}

              {step === 1 && (
                <button
                  type="button"
                  onClick={handleStep1Next}
                  disabled={loading}
                  className="h-11 px-6 bg-[#078BCC] hover:bg-[#0679B2] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Saving...' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={handleStep2Next}
                  disabled={loading}
                  className="h-11 px-6 bg-[#078BCC] hover:bg-[#0679B2] text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Saving...' : 'Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={handleLaunchWorkspace}
                  disabled={loading}
                  className="h-11 px-6 bg-[#078BCC] hover:bg-[#0679B2] text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Authorizing...' : 'Authorize & launch Meshvi'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* COMPACT MODALS FOR STEP 3 EDIT ACTIONS                    */}
      {/* ========================================================= */}
      {editingIntentType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingIntentType === 'LOOKING_FOR' && "Edit 'What I'm looking for'"}
                {editingIntentType === 'OFFERING' && "Edit 'What I can offer'"}
                {editingIntentType === 'PREFERENCES' && 'Connection & Anti-Spam Preferences'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingIntentType(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editingIntentType === 'PREFERENCES' ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Select which types of engagements to filter and authorize in your workspace.
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {DEFAULT_FIREWALL_TAGS.map((tag) => {
                    const isBlocked = firewallTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isBlocked) {
                            setFirewallTags(firewallTags.filter((t) => t !== tag));
                          } else {
                            setFirewallTags([...firewallTags, tag]);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                          isBlocked
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>Block: {tag}</span>
                        {isBlocked && <Check className="w-3.5 h-3.5 text-rose-600" />}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setEditingIntentType(null)}
                  className="w-full py-2 bg-[#078BCC] hover:bg-[#0679B2] text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  Save Preferences
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={tempTextValue}
                  onChange={(e) => setTempTextValue(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#078BCC] resize-none"
                  placeholder="Enter details..."
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingIntentType === 'LOOKING_FOR') setLookingFor(tempTextValue);
                      if (editingIntentType === 'OFFERING') setOffering(tempTextValue);
                      setEditingIntentType(null);
                    }}
                    className="flex-1 py-2 bg-[#078BCC] hover:bg-[#0679B2] text-white text-xs font-semibold rounded-lg shadow-xs"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingIntentType(null)}
                    className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
