import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Copy,
  CheckCircle2,
  Cpu,
  Radio,
  Check,
  Plus,
  Trash2,
  Edit3,
  Search,
  Users,
  Mail,
  Globe,
  MapPin,
  Layers,
  ExternalLink,
  X,
  BadgeCheck,
  ChevronDown,
  Cloud,
  Loader2,
} from 'lucide-react';
import {
  INDUSTRY_LIST,
  COUNTRY_OPTIONS,
  COMPANY_SIZES,
  getRandomDepartments,
  DepartmentTemplate,
  ALL_DEPARTMENTS,
} from '../../data/industryDepartments';

interface ConfiguredDepartment {
  id: string;
  name: string;
  leadTitle: string;
  category: string;
  status: 'ACTIVE' | 'STANDBY';
  isCustom?: boolean;
}

interface InvitedTeammate {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'Department Lead' | 'Enterprise Admin' | 'Commercial Lead' | 'Team Member' | 'Executive Viewer';
  token: string;
  copied?: boolean;
}

export const CompanyOnboardingPage: React.FC = () => {
  const { token, refreshUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/company', { replace: true });
  }, [navigate]);

  // Wizard Step State (1 to 4: DNS is now in Profile & Settings!)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Server-Persisted Onboarding Draft States
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STEP 1: Legal Entity & Identity State
  // -------------------------------------------------------------
  const [companyName, setCompanyName] = useState('Borneo Agro Beverages');
  const [legalName, setLegalName] = useState('Borneo Agro Beverages Pte. Ltd.');
  const [domain, setDomain] = useState('borneoagro.my');
  const [websiteUrl, setWebsiteUrl] = useState('https://borneoagro.my');
  const [industry, setIndustry] = useState('FMCG & Consumer Goods');
  const [subIndustry, setSubIndustry] = useState('Food & Beverage Manufacturing');
  const [companySize, setCompanySize] = useState('51 - 200 employees (Mid-Market / Growth)');
  const [taxId, setTaxId] = useState('MY-UEN-202409812K');
  const [city, setCity] = useState('Kuala Lumpur');
  const [countryCode, setCountryCode] = useState('MY');

  // -------------------------------------------------------------
  // STEP 2: Departments & Delegation Leads State
  // -------------------------------------------------------------
  const [departments, setDepartments] = useState<ConfiguredDepartment[]>([
    {
      id: 'fmcg-01',
      name: 'Commercial Partnerships & Global Accounts',
      leadTitle: 'Head of Strategic Alliances',
      category: 'Commercial',
      status: 'ACTIVE',
    },
    {
      id: 'fmcg-02',
      name: 'Retail Distribution & Regional Channels',
      leadTitle: 'Regional Channel Director',
      category: 'Commercial',
      status: 'ACTIVE',
    },
    {
      id: 'fmcg-03',
      name: 'Supply Chain & Sourcing Operations',
      leadTitle: 'VP of Procurement',
      category: 'Supply Chain',
      status: 'ACTIVE',
    },
  ]);

  // Department Combobox & Suggestion States
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState('FMCG & Consumer Goods');
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [randomSuggestions, setRandomSuggestions] = useState<DepartmentTemplate[]>([]);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Add Custom Department Form State
  const [showCustomDeptForm, setShowCustomDeptForm] = useState(false);
  const [customDeptName, setCustomDeptName] = useState('');
  const [customDeptTitle, setCustomDeptTitle] = useState('');
  const [customDeptCategory, setCustomDeptCategory] = useState<string>('Operations');

  // Inline / Modal Edit Department State
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptTitle, setEditDeptTitle] = useState('');
  const [editDeptCategory, setEditDeptCategory] = useState('');

  // -------------------------------------------------------------
  // STEP 3: Team Invitations State
  // -------------------------------------------------------------
  const [invitedMembers, setInvitedMembers] = useState<InvitedTeammate[]>([
    {
      id: 'init-1',
      name: 'Farhan Azman',
      email: 'farhan@borneoagro.my',
      department: 'Commercial Partnerships & Global Accounts',
      role: 'Department Lead',
      token: 'Meshvi-team-7x4a29-init',
    },
  ]);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState('Commercial Partnerships & Global Accounts');
  const [inviteRole, setInviteRole] = useState<'Department Lead' | 'Enterprise Admin' | 'Commercial Lead' | 'Team Member' | 'Executive Viewer'>('Department Lead');
  const [inviteError, setInviteError] = useState('');

  // -------------------------------------------------------------
  // STEP 4: Narrative & Verification Submission State
  // -------------------------------------------------------------
  const [description, setDescription] = useState(
    'Sustainable agricultural producer of specialty cold brew teas, functional juices, and regional organic beverages across Southeast Asia.'
  );

  // -------------------------------------------------------------
  // 4-Stage Interactive Provisioning Screen State
  // -------------------------------------------------------------
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningProgress, setProvisioningProgress] = useState(0);
  const [provisioningStage, setProvisioningStage] = useState(1);
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  // Load server-persisted onboarding draft on mount
  useEffect(() => {
    if (!token) return;

    fetch('/api/v1/companies/onboarding-draft', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const draft = res.data;
          if (draft.step) setStep(draft.step);
          if (draft.data) {
            const d = draft.data;
            if (d.companyName) setCompanyName(d.companyName);
            if (d.legalName) setLegalName(d.legalName);
            if (d.domain) setDomain(d.domain);
            if (d.websiteUrl) setWebsiteUrl(d.websiteUrl);
            if (d.industry) {
              setIndustry(d.industry);
              setSelectedIndustryFilter(d.industry);
            }
            if (d.subIndustry) setSubIndustry(d.subIndustry);
            if (d.companySize) setCompanySize(d.companySize);
            if (d.taxId) setTaxId(d.taxId);
            if (d.city) setCity(d.city);
            if (d.countryCode) setCountryCode(d.countryCode);
            if (Array.isArray(d.departments) && d.departments.length > 0) {
              setDepartments(d.departments);
            }
            if (Array.isArray(d.invitedMembers)) {
              setInvitedMembers(d.invitedMembers);
            }
            if (d.description) setDescription(d.description);
          }
          if (draft.updatedAt) {
            const timeStr = new Date(draft.updatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            setLastSavedTime(timeStr);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load server onboarding draft:', err);
      })
      .finally(() => {
        setIsDraftLoaded(true);
      });
  }, [token]);

  // Debounced auto-save to backend whenever step or form state changes
  useEffect(() => {
    if (!isDraftLoaded || !token) return;

    const timeout = setTimeout(async () => {
      try {
        setIsSavingDraft(true);
        const payload = {
          step,
          data: {
            companyName,
            legalName,
            domain,
            websiteUrl,
            industry,
            subIndustry,
            companySize,
            taxId,
            city,
            countryCode,
            departments,
            invitedMembers,
            description,
          },
        };

        const res = await fetch('/api/v1/companies/onboarding-draft', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const nowStr = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          setLastSavedTime(nowStr);
        }
      } catch (saveErr) {
        console.warn('Auto-save onboarding draft failed:', saveErr);
      } finally {
        setIsSavingDraft(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [
    isDraftLoaded,
    token,
    step,
    companyName,
    legalName,
    domain,
    websiteUrl,
    industry,
    subIndustry,
    companySize,
    taxId,
    city,
    countryCode,
    departments,
    invitedMembers,
    description,
  ]);

  // Sync background department selections when default industry changes
  useEffect(() => {
    setRandomSuggestions(getRandomDepartments(8, selectedIndustryFilter));
  }, [selectedIndustryFilter]);

  // Click-outside listener for searchable combobox
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsComboboxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Live searchable combobox options (searches across 527 departments or background suggestions)
  const comboboxOptions = useMemo(() => {
    const query = deptSearchQuery.trim().toLowerCase();
    if (query) {
      return ALL_DEPARTMENTS.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.leadTitle.toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query) ||
          d.industry.toLowerCase().includes(query)
      ).slice(0, 25);
    }
    return randomSuggestions.length > 0
      ? randomSuggestions
      : getRandomDepartments(8, selectedIndustryFilter);
  }, [deptSearchQuery, randomSuggestions, selectedIndustryFilter]);

  // Keep invite department default synced with available departments
  useEffect(() => {
    if (departments.length > 0 && !departments.some((d) => d.name === inviteDept)) {
      setInviteDept(departments[0].name);
    }
  }, [departments, inviteDept]);

  // -------------------------------------------------------------
  // Validation Handlers
  // -------------------------------------------------------------
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!companyName.trim() || companyName.trim().length < 2) {
      errors.companyName = 'Company display name must be at least 2 characters.';
    }

    if (!legalName.trim() || legalName.trim().length < 3) {
      errors.legalName = 'Registered legal name is required for enterprise compliance.';
    }

    const domainClean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const domainRegex = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;
    if (!domainClean || !domainRegex.test(domainClean)) {
      errors.domain = 'Enter a valid corporate domain (e.g. company.com or brand.my).';
    }

    const urlRegex = /^https?:\/\/.+/i;
    if (!websiteUrl.trim() || !urlRegex.test(websiteUrl.trim())) {
      errors.websiteUrl = 'Official website URL must start with http:// or https://';
    }

    if (!city.trim() || city.trim().length < 2) {
      errors.city = 'City name is required.';
    }

    if (!countryCode.trim() || countryCode.trim().length !== 2) {
      errors.countryCode = 'Select a valid 2-letter country code.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Continue = () => {
    if (!validateStep1()) {
      showToast({
        title: 'Validation Error',
        message: 'Please resolve the highlighted fields to continue.',
        type: 'error',
      });
      return;
    }
    setError('');
    setSelectedIndustryFilter(industry);
    // Directly proceed to Step 2: Departments (DNS verification is now in Profile & Settings)
    setStep(2);
  };

  // -------------------------------------------------------------
  // Department Management
  // -------------------------------------------------------------
  const handleAddTemplateDepartment = (tpl: DepartmentTemplate) => {
    if (departments.some((d) => d.name.toLowerCase() === tpl.name.toLowerCase())) {
      showToast({
        title: 'Department Already Added',
        message: `"${tpl.name}" is already in your corporate roster.`,
        type: 'warning',
      });
      return;
    }

    setDepartments((prev) => [
      ...prev,
      {
        id: tpl.id,
        name: tpl.name,
        leadTitle: tpl.leadTitle,
        category: tpl.category,
        status: 'ACTIVE',
      },
    ]);

    showToast({
      title: 'Department Added',
      message: `${tpl.name} assigned with Lead: ${tpl.leadTitle}.`,
      type: 'success',
    });
  };

  const handleAddCustomDepartment = () => {
    const nameClean = customDeptName.trim();
    const titleClean = customDeptTitle.trim();

    if (!nameClean || !titleClean) {
      showToast({
        title: 'Missing Details',
        message: 'Both Department Name and Delegation Lead Title are required.',
        type: 'error',
      });
      return;
    }

    if (departments.some((d) => d.name.toLowerCase() === nameClean.toLowerCase())) {
      showToast({
        title: 'Duplicate Department',
        message: `"${nameClean}" is already added.`,
        type: 'warning',
      });
      return;
    }

    const newId = `custom-${Date.now().toString(36)}`;
    setDepartments((prev) => [
      ...prev,
      {
        id: newId,
        name: nameClean,
        leadTitle: titleClean,
        category: customDeptCategory,
        status: 'ACTIVE',
        isCustom: true,
      },
    ]);

    setCustomDeptName('');
    setCustomDeptTitle('');
    setShowCustomDeptForm(false);
    showToast({
      title: 'Custom Department Added',
      message: `${nameClean} configured with Lead: ${titleClean}.`,
      type: 'success',
    });
  };

  const handleStartEditDepartment = (dept: ConfiguredDepartment) => {
    setEditingDeptId(dept.id);
    setEditDeptName(dept.name);
    setEditDeptTitle(dept.leadTitle);
    setEditDeptCategory(dept.category);
  };

  const handleSaveEditDepartment = () => {
    if (!editDeptName.trim() || !editDeptTitle.trim()) {
      showToast({
        title: 'Invalid Input',
        message: 'Department name and lead title cannot be empty.',
        type: 'error',
      });
      return;
    }

    setDepartments((prev) =>
      prev.map((d) =>
        d.id === editingDeptId
          ? {
              ...d,
              name: editDeptName.trim(),
              leadTitle: editDeptTitle.trim(),
              category: editDeptCategory || d.category,
            }
          : d
      )
    );

    setEditingDeptId(null);
    showToast({
      title: 'Department Updated',
      message: 'Department details successfully updated.',
      type: 'success',
    });
  };

  const handleRemoveDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDepartmentsContinue = () => {
    if (departments.length < 3) {
      showToast({
        title: 'Minimum 3 Departments Required',
        message: `You currently have ${departments.length} department(s). Please add at least 3 departments to ensure reliable organizational routing.`,
        type: 'error',
      });
      return;
    }
    setError('');
    setStep(3); // Go to Step 3: Invite Team
  };

  // -------------------------------------------------------------
  // Team Invitation Management
  // -------------------------------------------------------------
  const handleAddTeammate = () => {
    setInviteError('');
    const nameClean = inviteName.trim();
    const emailClean = inviteEmail.trim().toLowerCase();

    if (!nameClean || nameClean.length < 2) {
      setInviteError('Please provide a valid teammate name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailClean || !emailRegex.test(emailClean)) {
      setInviteError('Please enter a valid email address.');
      return;
    }

    if (invitedMembers.some((m) => m.email.toLowerCase() === emailClean)) {
      setInviteError('This email is already staged for an invitation.');
      return;
    }

    const generatedToken = `Meshvi-team-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`;
    const newMember: InvitedTeammate = {
      id: `member-${Date.now()}`,
      name: nameClean,
      email: emailClean,
      department: inviteDept || (departments[0]?.name ?? 'Executive'),
      role: inviteRole,
      token: generatedToken,
    };

    setInvitedMembers((prev) => [...prev, newMember]);
    setInviteName('');
    setInviteEmail('');
    showToast({
      title: 'Teammate Invitation Staged',
      message: `${nameClean} (${inviteRole}) staged for ${newMember.department}.`,
      type: 'success',
    });
  };

  const handleRemoveTeammate = (id: string) => {
    setInvitedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCopyInviteLink = (inviteToken: string, index: number) => {
    const link = `${window.location.origin}/register?invite=${inviteToken}`;
    navigator.clipboard.writeText(link);
    setInvitedMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, copied: true } : m))
    );
    setTimeout(() => {
      setInvitedMembers((prev) =>
        prev.map((m, i) => (i === index ? { ...m, copied: false } : m))
      );
    }, 2000);
    showToast({
      title: 'Invite Link Copied',
      message: 'Direct onboarding registration link copied to clipboard.',
      type: 'info',
    });
  };

  // -------------------------------------------------------------
  // Timer for 4-Stage Interactive Provisioning Animation (Exact 30s with Auto-Redirect)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isProvisioning) return;

    setSecondsRemaining(30);
    setProvisioningProgress(0);
    setProvisioningStage(1);

    const TOTAL_DURATION_MS = 30000; // Exact 30 seconds
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
        // Automatically redirect to the respective dashboard once 30 seconds elapse
        setTimeout(async () => {
          await refreshUser();
          navigate('/company', { replace: true });
        }, 600);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isProvisioning, navigate, refreshUser]);

  // -------------------------------------------------------------
  // Final Submission to Backend
  // -------------------------------------------------------------
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: companyName.trim(),
          legalName: legalName.trim(),
          domain: domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, ''),
          websiteUrl: websiteUrl.trim(),
          industry: industry.trim(),
          subIndustry: subIndustry.trim(),
          companyType: 'Privately Held',
          headquartersCity: city.trim(),
          headquartersCountry: countryCode.trim().toUpperCase(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg =
          (Array.isArray(data.error) ? data.error.join(', ') : data.error?.message) ||
          (Array.isArray(data.message) ? data.message.join(', ') : data.message) ||
          'Failed to complete organization onboarding.';
        throw new Error(errorMsg);
      }

      const createdCompany = data.data;

      // Register departmental routing rules on backend if company created
      if (createdCompany?.id && token) {
        try {
          for (let i = 0; i < departments.length; i++) {
            const dept = departments[i];
            await fetch(`/api/v1/companies/${createdCompany.id}/routing-rules`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                department: dept.name,
                categoryTag: dept.category,
                priority: i + 1,
              }),
            });
          }
        } catch (ruleErr) {
          console.warn('Non-fatal: could not persist all routing rules directly:', ruleErr);
        }
      }

      await refreshUser();
      showToast({
        title: 'Organization Registered',
        message: `${companyName} is now active. DNS verification can be completed in Profile Settings.`,
        type: 'success',
      });

      // Launch interactive 4-stage provisioning animation
      setIsProvisioning(true);
      setProvisioningProgress(5);
    } catch (err: any) {
      setError(err.message || 'Onboarding registration failed. Please review your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Render Provisioning Screen if active
  // -------------------------------------------------------------
  if (isProvisioning) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-surface border border-border rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 animate-fade-in text-center">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 bg-primary-soft text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20 inline-block">
              Provisioning Enterprise Node • {provisioningProgress}%
              {secondsRemaining > 0 ? ` • ${secondsRemaining}s remaining` : ' • Redirecting...'}
            </span>
            <h2 className="text-2xl font-black text-navy tracking-tight">
              Configuring {companyName}
            </h2>
            <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
              Please wait while our decentralized consensus registers your enterprise credentials, provisions {departments.length} departmental delegation leads, and initializes organizational routing.
              {secondsRemaining > 0 ? ` Automatically redirecting to your dashboard in ${secondsRemaining}s.` : ' Finalizing node initialization and redirecting...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-border rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${provisioningProgress}%` }}
            />
          </div>

          {/* 4 Interactive Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                provisioningStage === 1
                  ? 'bg-primary-soft/50 border-primary text-navy ring-1 ring-primary'
                  : provisioningStage > 1
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                  : 'bg-surface-muted border-border text-text-muted opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                {provisioningStage > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Radio className="w-4 h-4 text-primary animate-pulse shrink-0" />
                )}
                <span className="text-xs font-bold">1. Corporate Identity Ledger</span>
              </div>
              <p className="text-[11px] mt-1 line-clamp-1">
                Registered @{domain} (DNS verification in Profile Settings)
              </p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                provisioningStage === 2
                  ? 'bg-primary-soft/50 border-primary text-navy ring-1 ring-primary'
                  : provisioningStage > 2
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                  : 'bg-surface-muted border-border text-text-muted opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                {provisioningStage > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Radio className="w-4 h-4 text-primary animate-pulse shrink-0" />
                )}
                <span className="text-xs font-bold">2. Departmental Roster</span>
              </div>
              <p className="text-[11px] mt-1 line-clamp-1">
                Mapped {departments.length} routing teams & delegation leads
              </p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                provisioningStage === 3
                  ? 'bg-primary-soft/50 border-primary text-navy ring-1 ring-primary'
                  : provisioningStage > 3
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                  : 'bg-surface-muted border-border text-text-muted opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                {provisioningStage > 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Radio className="w-4 h-4 text-primary animate-pulse shrink-0" />
                )}
                <span className="text-xs font-bold">3. Anti-Spam Governance</span>
              </div>
              <p className="text-[11px] mt-1 line-clamp-1">
                Rolling 7-day executive outreach quotas calibrated
              </p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                provisioningStage === 4
                  ? 'bg-primary-soft/50 border-primary text-navy ring-1 ring-primary'
                  : provisioningProgress >= 100
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                  : 'bg-surface-muted border-border text-text-muted opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                {provisioningProgress >= 100 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Radio className="w-4 h-4 text-primary animate-pulse shrink-0" />
                )}
                <span className="text-xs font-bold">4. Live Search & Deal Rooms</span>
              </div>
              <p className="text-[11px] mt-1 line-clamp-1">
                Synchronized indexing across regional directory
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={async () => {
                await refreshUser();
                navigate('/company', { replace: true });
              }}
              className="px-8 py-3 bg-navy hover:bg-neutral-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center space-x-2 mx-auto cursor-pointer"
            >
              <span>
                {provisioningProgress >= 100
                  ? 'Redirecting to Enterprise Dashboard...'
                  : `Enter Enterprise Dashboard Now (${secondsRemaining}s)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Main Onboarding Wizard View (4 Streamlined Steps)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-bg text-navy py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-soft/60 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Enterprise Organization Onboarding</span>
          </div>
          <h1 className="text-3xl font-black text-navy tracking-tight">
            Provision Your Corporate Network Node
          </h1>
          <p className="text-xs text-text-muted max-w-xl mx-auto leading-relaxed">
            Establish a verified company profile, configure departmental delegation leads, and invite your team to enable verified institutional introductions.
          </p>
          <div className="flex items-center justify-center space-x-2 pt-1 text-[11px]">
            {isSavingDraft ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-surface border border-border text-text-muted animate-pulse">
                <Loader2 className="w-3 h-3 text-primary animate-spin" />
                <span>Syncing progress to server...</span>
              </span>
            ) : lastSavedTime ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                <Cloud className="w-3 h-3 text-emerald-600" />
                <span>Progress saved to server • Step {step} of 4 • {lastSavedTime}</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-surface border border-border text-text-muted">
                <Cloud className="w-3 h-3 text-primary" />
                <span>Auto-saved to your secure server account</span>
              </span>
            )}
          </div>
        </div>

        {/* Step Indicator (4 Streamlined Steps) */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { num: 1, title: 'Identity', desc: 'Legal Entity' },
            { num: 2, title: 'Departments', desc: 'Min 3 Leads' },
            { num: 3, title: 'Invite Team', desc: 'Team Members' },
            { num: 4, title: 'Review', desc: 'Activate Node' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
              disabled={s.num > step}
              className={`p-3 rounded-2xl border text-center transition-all ${
                step === s.num
                  ? 'bg-navy text-white border-navy shadow-md font-bold'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/60 cursor-pointer'
                  : 'bg-surface text-text-muted border-border cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                {step > s.num ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider">Step {s.num}</span>
                )}
              </div>
              <div className="text-xs truncate font-semibold mt-0.5">{s.title}</div>
            </button>
          ))}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-danger text-xs flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Card Container */}
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* ========================================================= */}
          {/* STEP 1: IDENTITY & LEGAL ENTITY */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-navy flex items-center space-x-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <span>Legal Entity & Commercial Brand</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Provide verified operational company details for institutional counterparty compliance.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-muted text-text-muted text-[11px] font-bold rounded-lg border border-border">
                    Step 1 of 4
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Display Name */}
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Company Display Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (validationErrors.companyName) {
                        setValidationErrors((prev) => ({ ...prev, companyName: '' }));
                      }
                    }}
                    placeholder="e.g. Borneo Agro Beverages"
                    className={`w-full p-3 bg-bg border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 transition-all ${
                      validationErrors.companyName
                        ? 'border-danger focus:ring-danger'
                        : 'border-border focus:ring-primary'
                    }`}
                  />
                  {validationErrors.companyName && (
                    <p className="text-[11px] text-danger mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{validationErrors.companyName}</span>
                    </p>
                  )}
                </div>

                {/* Registered Legal Entity Name */}
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Registered Legal Entity Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={legalName}
                    onChange={(e) => {
                      setLegalName(e.target.value);
                      if (validationErrors.legalName) {
                        setValidationErrors((prev) => ({ ...prev, legalName: '' }));
                      }
                    }}
                    placeholder="e.g. Borneo Agro Beverages Pte. Ltd."
                    className={`w-full p-3 bg-bg border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 transition-all ${
                      validationErrors.legalName
                        ? 'border-danger focus:ring-danger'
                        : 'border-border focus:ring-primary'
                    }`}
                  />
                  {validationErrors.legalName && (
                    <p className="text-[11px] text-danger mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{validationErrors.legalName}</span>
                    </p>
                  )}
                </div>

                {/* Corporate Domain */}
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Corporate Domain <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value);
                        if (validationErrors.domain) {
                          setValidationErrors((prev) => ({ ...prev, domain: '' }));
                        }
                      }}
                      placeholder="e.g. borneoagro.my"
                      className={`w-full p-3 pl-8 bg-bg border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 transition-all ${
                        validationErrors.domain
                          ? 'border-danger focus:ring-danger'
                          : 'border-border focus:ring-primary'
                      }`}
                    />
                    <Globe className="w-4 h-4 text-text-muted absolute left-2.5 top-3.5" />
                  </div>
                  {validationErrors.domain ? (
                    <p className="text-[11px] text-danger mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{validationErrors.domain}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-text-muted mt-1">
                      Domain verification can be completed in Profile Settings post-launch.
                    </p>
                  )}
                </div>

                {/* Official Website URL */}
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Official Website URL <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={websiteUrl}
                      onChange={(e) => {
                        setWebsiteUrl(e.target.value);
                        if (validationErrors.websiteUrl) {
                          setValidationErrors((prev) => ({ ...prev, websiteUrl: '' }));
                        }
                      }}
                      placeholder="https://borneoagro.my"
                      className={`w-full p-3 pl-8 bg-bg border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 transition-all ${
                        validationErrors.websiteUrl
                          ? 'border-danger focus:ring-danger'
                          : 'border-border focus:ring-primary'
                      }`}
                    />
                    <ExternalLink className="w-4 h-4 text-text-muted absolute left-2.5 top-3.5" />
                  </div>
                  {validationErrors.websiteUrl && (
                    <p className="text-[11px] text-danger mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{validationErrors.websiteUrl}</span>
                    </p>
                  )}
                </div>

                {/* Industry Sector (20 Industries Dropdown) */}
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Industry Sector <span className="text-danger">*</span>
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      setSelectedIndustryFilter(e.target.value);
                      const foundMeta = INDUSTRY_LIST.find((ind) => ind.name === e.target.value);
                      if (foundMeta && foundMeta.subIndustries.length > 0) {
                        setSubIndustry(foundMeta.subIndustries[0]);
                      }
                    }}
                    className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {INDUSTRY_LIST.map((ind) => (
                      <option key={ind.id} value={ind.name}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-Industry Focus */}
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Sub-Industry Focus / Vertical
                  </label>
                  <input
                    type="text"
                    value={subIndustry}
                    onChange={(e) => setSubIndustry(e.target.value)}
                    placeholder="e.g. Food & Beverage Manufacturing"
                    className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Company Size / Employee Headcount
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    {COMPANY_SIZES.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Corporate Tax / Registration ID */}
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Corporate Registration / Tax ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="e.g. UEN, EIN, VAT, CIN number"
                    className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Headquarters Location (City & Country) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Headquarters Location <span className="text-danger">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            if (validationErrors.city) {
                              setValidationErrors((prev) => ({ ...prev, city: '' }));
                            }
                          }}
                          placeholder="Headquarters City (e.g. Kuala Lumpur)"
                          className={`w-full p-3 pl-8 bg-bg border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 transition-all ${
                            validationErrors.city
                              ? 'border-danger focus:ring-danger'
                              : 'border-border focus:ring-primary'
                          }`}
                        />
                        <MapPin className="w-4 h-4 text-text-muted absolute left-2.5 top-3.5" />
                      </div>
                      {validationErrors.city && (
                        <p className="text-[11px] text-danger mt-1">{validationErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <select
                        value={countryCode}
                        onChange={(e) => {
                          setCountryCode(e.target.value);
                          if (validationErrors.countryCode) {
                            setValidationErrors((prev) => ({ ...prev, countryCode: '' }));
                          }
                        }}
                        className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name} ({c.code}) - {c.continent}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Action */}
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <div className="text-[11px] text-text-muted flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Enterprise identity details are encrypted and tamper-resistant</span>
                </div>
                <button
                  type="button"
                  onClick={handleStep1Continue}
                  className="px-6 py-2.5 bg-navy hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2"
                >
                  <span>Continue to Departments</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: DEPARTMENTS & DELEGATION LEADS (500+ CATALOG & MIN 3) */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-navy flex items-center space-x-2">
                      <Layers className="w-5 h-5 text-primary" />
                      <span>Departmental Delegation Leads</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Configure corporate divisions so inbound institutional opportunities are routed to authorized executive leads.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        departments.length >= 3
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {departments.length >= 3
                        ? `${departments.length} Configured (Min 3 Met ✓)`
                        : `${departments.length} / 3 Departments Configured (Min 3 Required)`}
                    </span>
                    <span className="px-2.5 py-1 bg-surface-muted text-text-muted text-[11px] font-bold rounded-lg border border-border">
                      Step 2 of 4
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirement Alert if < 3 */}
              {departments.length < 3 && (
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Validation Requirement:</strong> You must configure at least 3 departments before proceeding to team invitations. Add {3 - departments.length} more below.
                    </span>
                  </div>
                </div>
              )}

              {/* Currently Configured Departments List with EDIT Capability */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy uppercase tracking-wider">
                    Configured Department Roster ({departments.length})
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Click pencil icon to edit department or delegation lead
                  </span>
                </div>

                <div className="space-y-2">
                  {departments.map((dept, idx) => (
                    <div
                      key={dept.id}
                      className="p-3.5 bg-surface-muted hover:bg-slate-100/80 border border-border rounded-2xl flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-lg bg-navy/5 text-navy font-bold text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-navy">{dept.name}</span>
                            <span className="px-2 py-0.5 bg-surface text-[10px] font-semibold text-text-muted border border-border rounded-md">
                              {dept.category}
                            </span>
                            {dept.isCustom && (
                              <span className="px-1.5 py-0.5 bg-primary-soft text-[10px] font-bold text-primary rounded-md">
                                Custom
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-text-muted flex items-center space-x-1 mt-0.5">
                            <span className="font-medium text-navy">Delegation Lead:</span>
                            <span>{dept.leadTitle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEditDepartment(dept)}
                          className="p-1.5 text-text-muted hover:text-primary hover:bg-surface rounded-lg border border-transparent hover:border-border transition-colors"
                          title="Edit Department & Delegation Lead"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDepartment(dept.id)}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-surface rounded-lg border border-transparent hover:border-border transition-colors"
                          title="Delete Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inline Edit Modal if an item is being edited */}
              {editingDeptId && (
                <div className="p-4 bg-primary-soft/30 border border-primary/30 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy flex items-center space-x-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-primary" />
                      <span>Edit Department & Delegation Lead</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingDeptId(null)}
                      className="p-1 text-text-muted hover:text-navy"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Department Name"
                      value={editDeptName}
                      onChange={(e) => setEditDeptName(e.target.value)}
                      className="p-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Delegation Lead Title"
                      value={editDeptTitle}
                      onChange={(e) => setEditDeptTitle(e.target.value)}
                      className="p-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex items-center space-x-2">
                      <select
                        value={editDeptCategory}
                        onChange={(e) => setEditDeptCategory(e.target.value)}
                        className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {['Commercial', 'Operations', 'Technology', 'R&D', 'Compliance', 'Supply Chain', 'Finance', 'Legal'].map(
                          (c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          )
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={handleSaveEditDepartment}
                        className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shrink-0 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Searchable Combobox to Add from 500+ Catalog or Custom */}
              <div className="p-4 bg-bg border border-border rounded-2xl space-y-3">
                <div className="relative" ref={comboboxRef}>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Add Additional Department</span>
                    <span className="text-[10px] text-text-muted font-normal lowercase">
                      500+ templates available across all industries
                    </span>
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                      <Search className="w-4 h-4 text-text-muted" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search or select a department (e.g. Legal, R&D, Procurement, Quality Assurance...)"
                      value={deptSearchQuery}
                      onChange={(e) => {
                        setDeptSearchQuery(e.target.value);
                        setIsComboboxOpen(true);
                      }}
                      onFocus={() => setIsComboboxOpen(true)}
                      className="w-full pl-10 pr-16 py-3 bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs text-navy placeholder:text-text-muted transition-all shadow-2xs"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center space-x-1">
                      {deptSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setDeptSearchQuery('')}
                          className="p-1 text-text-muted hover:text-navy rounded transition-colors"
                          title="Clear search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsComboboxOpen((prev) => !prev)}
                        className="p-1 text-text-muted hover:text-navy rounded transition-colors"
                        title="Toggle catalog list"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isComboboxOpen ? 'rotate-180 text-primary' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown Popover */}
                  {isComboboxOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-fade-in max-h-72 flex flex-col">
                      <div className="px-3.5 py-2 bg-surface-muted border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
                        <span>
                          {deptSearchQuery.trim()
                            ? `Matching Templates (${comboboxOptions.length})`
                            : `Recommended for ${selectedIndustryFilter}`}
                        </span>
                        <span className="text-primary font-semibold lowercase">click to add</span>
                      </div>

                      <div className="overflow-y-auto divide-y divide-border/40 py-1 max-h-56">
                        {comboboxOptions.length === 0 ? (
                          <div className="px-4 py-5 text-center text-xs text-text-muted">
                            No department found matching "{deptSearchQuery}".
                          </div>
                        ) : (
                          comboboxOptions.map((item) => {
                            const isAdded = departments.some(
                              (d) => d.name.toLowerCase() === item.name.toLowerCase()
                            );
                            return (
                              <button
                                key={item.id}
                                type="button"
                                disabled={isAdded}
                                onClick={() => {
                                  handleAddTemplateDepartment(item);
                                  setDeptSearchQuery('');
                                  setIsComboboxOpen(false);
                                }}
                                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors ${
                                  isAdded
                                    ? 'bg-emerald-50/50 text-text-muted cursor-not-allowed opacity-60'
                                    : 'hover:bg-primary-soft/40 cursor-pointer'
                                }`}
                              >
                                <div className="min-w-0 pr-3">
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`font-bold truncate ${
                                        isAdded ? 'text-emerald-800 line-through' : 'text-navy'
                                      }`}
                                    >
                                      {item.name}
                                    </span>
                                    <span className="px-1.5 py-0.5 bg-surface border border-border rounded text-[9px] font-semibold text-text-muted shrink-0">
                                      {item.category}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-primary/90 font-medium truncate mt-0.5">
                                    Lead: <span className="text-navy/80">{item.leadTitle}</span>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {isAdded ? (
                                    <span className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Added</span>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-bold text-primary hover:underline flex items-center space-x-1">
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Add</span>
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Bottom Select Option: Custom / Other Department */}
                      <div className="p-2 bg-surface-muted border-t border-border">
                        <button
                          type="button"
                          onClick={() => {
                            setIsComboboxOpen(false);
                            setShowCustomDeptForm(true);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg bg-surface hover:bg-primary-soft border border-dashed border-primary/40 text-primary text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <Plus className="w-3.5 h-3.5 text-primary" />
                            <span>+ Custom / Other Department</span>
                          </div>
                          <span className="text-[10px] text-text-muted font-normal">
                            Define custom title & delegation lead
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtitle helper / Quick toggle for custom department */}
                {!showCustomDeptForm && (
                  <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                    <span>Selecting any template automatically configures the delegation lead title.</span>
                    <button
                      type="button"
                      onClick={() => setShowCustomDeptForm(true)}
                      className="text-primary hover:underline font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Custom Department</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Add Custom Department Form (Opened only when selected or toggled) */}
              {showCustomDeptForm && (
                <div className="p-4 bg-surface border border-primary/30 rounded-2xl space-y-3 animate-fade-in shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy flex items-center space-x-1.5">
                      <Plus className="w-3.5 h-3.5 text-primary" />
                      <span>Define Custom Department & Delegation Lead</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomDeptForm(false)}
                      className="p-1 text-text-muted hover:text-navy rounded transition-colors"
                      title="Close custom form"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Department Name (e.g. Legal & Contracts)"
                      value={customDeptName}
                      onChange={(e) => setCustomDeptName(e.target.value)}
                      className="p-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Delegation Lead Title (e.g. General Counsel)"
                      value={customDeptTitle}
                      onChange={(e) => setCustomDeptTitle(e.target.value)}
                      className="p-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex items-center space-x-2">
                      <select
                        value={customDeptCategory}
                        onChange={(e) => setCustomDeptCategory(e.target.value)}
                        className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        {['Commercial', 'Operations', 'Technology', 'R&D', 'Compliance', 'Supply Chain', 'Finance', 'Legal'].map(
                          (cat) => (
                            <option key={cat} value={cat}>
                              {cat} Category
                            </option>
                          )
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCustomDepartment}
                        className="px-4 py-2.5 bg-navy hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shrink-0 transition-colors flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Action */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-border text-text-muted hover:text-navy text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Identity</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleDepartmentsContinue}
                    disabled={departments.length < 3}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 ${
                      departments.length >= 3
                        ? 'bg-navy hover:bg-neutral-800 text-white cursor-pointer'
                        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Next: Invite Team</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: INVITE TEAM (MODERN, CLEAN, BEST UI) */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-navy flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span>Invite Colleagues & Department Leads</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Generate verified invitation links to delegate departmental lead responsibilities and onboard team members.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-muted text-text-muted text-[11px] font-bold rounded-lg border border-border">
                    Step 3 of 4
                  </span>
                </div>
              </div>

              {/* Add Teammate Card */}
              <div className="p-5 bg-surface-muted rounded-2xl border border-border space-y-4">
                <span className="text-xs font-bold text-navy uppercase tracking-wider block">
                  Add Team Member to Invite
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Teammate Full Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maya Chen"
                      value={inviteName}
                      onChange={(e) => {
                        setInviteName(e.target.value);
                        if (inviteError) setInviteError('');
                      }}
                      className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Teammate Work Email */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder={`maya@${domain}`}
                        value={inviteEmail}
                        onChange={(e) => {
                          setInviteEmail(e.target.value);
                          if (inviteError) setInviteError('');
                        }}
                        className="w-full p-2.5 pl-8 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Mail className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-3.5" />
                    </div>
                  </div>

                  {/* Assigned Department */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                      Assigned Department
                    </label>
                    <select
                      value={inviteDept}
                      onChange={(e) => setInviteDept(e.target.value)}
                      className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Corporate Role */}
                  <div>
                    <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                      Organizational Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e: any) => setInviteRole(e.target.value)}
                      className="w-full p-2.5 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="Department Lead">Department Lead (Key Decision-Maker)</option>
                      <option value="Enterprise Admin">Enterprise Admin (Full Tenant Access)</option>
                      <option value="Commercial Lead">Commercial Lead (Deal Room Manager)</option>
                      <option value="Team Member">Team Member (General Collaborator)</option>
                      <option value="Executive Viewer">Executive Viewer (Read-Only Metrics)</option>
                    </select>
                  </div>
                </div>

                {inviteError && (
                  <p className="text-xs text-danger flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{inviteError}</span>
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-text-muted">
                    Team members receive encrypted single-use sign-in tokens tied to your corporate domain.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddTeammate}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Team Invitation</span>
                  </button>
                </div>
              </div>

              {/* Staged Invitations List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy uppercase tracking-wider">
                    Staged Invitations ({invitedMembers.length})
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Invitation links can be copied or emailed automatically
                  </span>
                </div>

                {invitedMembers.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-border rounded-2xl text-center space-y-2">
                    <Users className="w-8 h-8 text-text-muted mx-auto" />
                    <p className="text-xs font-bold text-navy">No team members staged yet</p>
                    <p className="text-[11px] text-text-muted max-w-sm mx-auto">
                      You can add colleagues above or skip this step to invite your colleagues anytime from the Enterprise Settings dashboard.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invitedMembers.map((member, idx) => (
                      <div
                        key={member.id}
                        className="p-3.5 bg-surface border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-border/80 transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-navy text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-navy">{member.name}</span>
                              <span className="px-2 py-0.5 bg-primary-soft text-[10px] font-bold text-primary rounded-md">
                                {member.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-text-muted flex items-center space-x-2 mt-0.5">
                              <span>{member.email}</span>
                              <span>•</span>
                              <span className="text-navy font-medium">{member.department}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleCopyInviteLink(member.token, idx)}
                            className="px-3.5 py-1.5 bg-surface-muted hover:bg-primary-soft text-primary text-xs font-bold rounded-xl border border-border hover:border-primary/30 transition-colors flex items-center space-x-1.5"
                          >
                            {member.copied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{member.copied ? 'Copied' : 'Copy Invite Link'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeammate(member.id)}
                            className="p-1.5 text-text-muted hover:text-danger hover:bg-surface-muted rounded-xl transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Action */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-border text-text-muted hover:text-navy text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Departments</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-navy hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <span>Review & Activate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: REVIEW & ACTIVATE NODE (COMPLETE DATA OVERVIEW) */}
          {/* ========================================================= */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-navy flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>Review & Activate Enterprise Node</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Confirm complete organization profile before publishing the enterprise tenant to the decentralized discovery index.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-muted text-text-muted text-[11px] font-bold rounded-lg border border-border">
                    Step 4 of 4
                  </span>
                </div>
              </div>

              {/* 1. Legal Entity & Brand Card */}
              <div className="p-4 bg-surface-muted rounded-2xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-navy text-white font-bold text-base flex items-center justify-center shadow-sm">
                      {companyName[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy flex items-center space-x-1.5">
                        <span>{companyName}</span>
                        <BadgeCheck className="w-4 h-4 text-primary" />
                      </h4>
                      <p className="text-[11px] text-text-muted">
                        @{domain} • <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">{websiteUrl}</a>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-3 py-1 text-xs font-bold text-primary hover:underline flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Step 1</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-text-muted block">Legal Name:</span>
                    <span className="font-semibold text-navy">{legalName}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Industry Sector:</span>
                    <span className="font-semibold text-navy">{industry}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Headquarters:</span>
                    <span className="font-semibold text-navy">{city}, {countryCode}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Company Scale:</span>
                    <span className="font-semibold text-navy truncate block">{companySize}</span>
                  </div>
                </div>
              </div>

              {/* 2. Security & DNS Attestation Notice (Profile & Settings) */}
              <div className="p-4 bg-surface-muted rounded-2xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Domain Attestation & DNS Configuration</span>
                  </span>
                  <span className="px-2.5 py-0.5 bg-primary-soft text-primary text-[10px] font-bold rounded-md border border-primary/20">
                    Configurable in Profile Settings
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-surface rounded-xl border border-border">
                    <span className="text-text-muted block">Corporate Domain</span>
                    <span className="font-mono font-bold text-navy">@{domain}</span>
                  </div>
                  <div className="p-2.5 bg-surface rounded-xl border border-border">
                    <span className="text-text-muted block">DNS TXT Handshake</span>
                    <span className="text-primary font-semibold">Available post-launch in Profile Settings</span>
                  </div>
                </div>
              </div>

              {/* 3. Departmental Delegation Roster Card */}
              <div className="p-4 bg-surface-muted rounded-2xl border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>Configured Departments ({departments.length} Active)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-3 py-1 text-xs font-bold text-primary hover:underline flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Step 2</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="p-2.5 bg-surface rounded-xl border border-border flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-navy block">{dept.name}</span>
                        <span className="text-[11px] text-text-muted">
                          Lead: <strong className="text-navy">{dept.leadTitle}</strong>
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-surface-muted text-[10px] font-semibold text-text-muted rounded-md border border-border">
                        {dept.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Invited Team Roster Card */}
              <div className="p-4 bg-surface-muted rounded-2xl border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Invited Team Members ({invitedMembers.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-3 py-1 text-xs font-bold text-primary hover:underline flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Step 3</span>
                  </button>
                </div>

                {invitedMembers.length === 0 ? (
                  <p className="text-[11px] text-text-muted italic">
                    Owner-only provisioning mode. You can invite team members anytime from Settings.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {invitedMembers.map((m) => (
                      <div
                        key={m.id}
                        className="p-2 bg-surface rounded-xl border border-border flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-navy">{m.name}</span>
                          <span className="text-text-muted ml-2">({m.email})</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px]">
                          <span className="text-primary font-medium">{m.department}</span>
                          <span className="px-2 py-0.5 bg-primary-soft text-primary font-bold rounded-md">
                            {m.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Public Corporate Narrative / Scope */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-navy">
                    Public Corporate Narrative / Scope
                  </label>
                  <span className="text-[11px] text-text-muted">{description.length} / 500 chars</span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                />
              </div>

              {/* 6. Readiness Verification Checklist */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                  Enterprise Node Readiness Check
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Corporate identity & legal credentials verified</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{departments.length} Departmental delegation leads configured</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Team invitations staged and indexed</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>DNS TXT verification available in Profile Settings</span>
                  </div>
                </div>
              </div>

              {/* Navigation Action */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border border-border text-text-muted hover:text-navy text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Team Invites</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {loading ? 'Activating Enterprise Node...' : 'Activate Enterprise Organization'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
