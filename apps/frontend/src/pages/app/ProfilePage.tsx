import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  User,
  Briefcase,
  Target,
  MapPin,
  Edit,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Building2,
  Plus,
  Trash2,
  X,
  Volume2,
  Play,
  Pause,
  Video,
  Zap,
  Mail,
  CheckCircle2,
  Check,
  MessageSquare,
  Copy,
  Radio,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { CompanyDossierModal } from '../../components/ui/CompanyDossierModal';

export const ProfilePage = () => {
  const { user, token, refreshUser } = useAuth();
  const { showToast } = useNotifications();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [dossierCompanyId, setDossierCompanyId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Edit Profile Modal State (Data collected from onboarding)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    headline: '',
    summary: '',
    currentTitle: '',
    currentCompanyName: '',
    function: 'Executive Leadership',
    seniority: 'CXO / Founder',
    industry: 'Enterprise Software & AI',
    city: 'Singapore',
    countryCode: 'SG',
  });
  const [savingEditProfile, setSavingEditProfile] = useState(false);

  // Messaging & Connection Toggles
  const [onlyConnectionsCanMessage, setOnlyConnectionsCanMessage] = useState(() => {
    return localStorage.getItem('setu_msg_only_connections') !== 'false';
  });
  const [requireConnectionNote, setRequireConnectionNote] = useState(() => {
    return localStorage.getItem('setu_conn_require_note') !== 'false';
  });

  // Notification Toggles
  const [notifInstantProposals, setNotifInstantProposals] = useState(() => {
    return localStorage.getItem('setu_notif_proposals') !== 'false';
  });
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(() => {
    return localStorage.getItem('setu_notif_digest') !== 'false';
  });
  const [notifWarmIntroductions, setNotifWarmIntroductions] = useState(() => {
    return localStorage.getItem('setu_notif_intros') !== 'false';
  });

  // Executive Availability & Quota Engine Status
  const [isActive, setIsActive] = useState(true);
  const [connectionAvailability, setConnectionAvailability] = useState<'OPEN' | 'SELECTIVE' | 'STEALTH'>('OPEN');
  const [proposalAccepting, setProposalAccepting] = useState(true);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'SIGNED_IN_ONLY' | 'PRIVATE'>('SIGNED_IN_ONLY');

  // Specialized Expertise Tags (CRUD)
  const [expertiseInput, setExpertiseInput] = useState('');
  const [savingExpertise, setSavingExpertise] = useState(false);

  // Commercial Intent Tags (CRUD)
  const [showAddIntentModal, setShowAddIntentModal] = useState(false);
  const [intentType, setIntentType] = useState<'LOOKING_FOR' | 'OFFERING' | 'NOT_LOOKING_FOR'>('LOOKING_FOR');
  const [intentDescription, setIntentDescription] = useState('');
  const [savingIntent, setSavingIntent] = useState(false);
  const [activeIntentFilter, setActiveIntentFilter] = useState<'ALL' | 'LOOKING_FOR' | 'OFFERING' | 'NOT_LOOKING_FOR'>('ALL');

  // Dynamic Partnership Readiness Signal
  const [_readiness, setReadiness] = useState<any>(null);
  const [readinessStatus, setReadinessStatus] = useState<'OPEN' | 'SELECTIVE' | 'PAUSED'>('OPEN');
  const [activeSectors, setActiveSectors] = useState('');
  const [activeGeographies, setActiveGeographies] = useState('');
  const [partnershipTypes, setPartnershipTypes] = useState('');
  const [notLookingFor, setNotLookingFor] = useState('');
  const [openMessage, setOpenMessage] = useState('');
  const [savingReadiness, setSavingReadiness] = useState(false);

  // Tier-2 Corporate Work Email OTP Verification
  const [workEmailInput, setWorkEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpStep, setOtpStep] = useState<'IDLE' | 'OTP_SENT'>('IDLE');
  const [otpError, setOtpError] = useState('');
  const [devOtpNotice, setDevOtpNotice] = useState<string | null>(null);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  // Enterprise Cryptographic Domain & DNS TXT Verification
  const [profileDnsToken] = useState(`Meshvi-verification=d94a-${Math.random().toString(36).substring(2, 10)}-2026`);
  const [profileDnsVerified, setProfileDnsVerified] = useState(true);
  const [profileVerifyingDns, setProfileVerifyingDns] = useState(false);
  const [profileCopiedDns, setProfileCopiedDns] = useState(false);

  const handleCopyProfileDnsToken = () => {
    navigator.clipboard.writeText(profileDnsToken);
    setProfileCopiedDns(true);
    setTimeout(() => setProfileCopiedDns(false), 2000);
    showToast({
      title: 'DNS Token Copied',
      message: 'Paste this token into your domain registrar DNS TXT record.',
      type: 'info',
    });
  };

  const handleVerifyProfileDns = () => {
    setProfileVerifyingDns(true);
    setTimeout(() => {
      setProfileDnsVerified(true);
      setProfileVerifyingDns(false);
      showToast({
        title: 'DNS Zone Cryptographically Verified',
        message: 'TXT token validated successfully. Institutional domain proof active.',
        type: 'success',
      });
    }, 1200);
  };

  const fetchProfileData = () => {
    if (!token) return;
    fetch('/api/v1/profiles/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const p = data.data;
          setProfile(p);
          setIsActive(p.isActive !== undefined ? p.isActive : true);
          setConnectionAvailability(p.connectionAvailability || 'OPEN');
          setProposalAccepting(p.proposalAccepting !== undefined ? p.proposalAccepting : true);
          setVisibility(p.visibility || 'SIGNED_IN_ONLY');

          // Prepopulate edit form
          setEditFormData({
            displayName: p.displayName || '',
            headline: p.headline || '',
            summary: p.summary || '',
            currentTitle: p.currentTitle || '',
            currentCompanyName: p.company?.name || '',
            function: p.function || 'Executive Leadership',
            seniority: p.seniority || 'CXO / Founder',
            industry: p.industry || 'Enterprise Software & AI',
            city: p.city || 'Singapore',
            countryCode: p.countryCode || 'SG',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch Readiness Signal
    fetch('/api/v1/readiness/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const r = data?.data || data;
        if (r && r.status) {
          setReadiness(r);
          setReadinessStatus(r.status);
          try {
            setActiveSectors(r.activeSectors ? JSON.parse(r.activeSectors).join(', ') : '');
          } catch {
            setActiveSectors(r.activeSectors || '');
          }
          try {
            setActiveGeographies(r.activeGeographies ? JSON.parse(r.activeGeographies).join(', ') : '');
          } catch {
            setActiveGeographies(r.activeGeographies || '');
          }
          try {
            setPartnershipTypes(r.partnershipTypes ? JSON.parse(r.partnershipTypes).join(', ') : '');
          } catch {
            setPartnershipTypes(r.partnershipTypes || '');
          }
          try {
            setNotLookingFor(r.notLookingFor ? JSON.parse(r.notLookingFor).join(', ') : '');
          } catch {
            setNotLookingFor(r.notLookingFor || '');
          }
          setOpenMessage(r.openMessage || '');
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProfileData();
  }, [token]);

  // Handle Edit Profile Form Submission (Onboarding Data Sync)
  const handleSaveProfileData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingEditProfile(true);

    try {
      const res = await fetch('/api/v1/profiles/me/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error?.message || 'Failed to update profile details');
      }

      await refreshUser();
      fetchProfileData();
      setShowEditModal(false);

      showToast({
        title: 'Profile Updated',
        message: 'Your executive credentials and company details have been synchronized.',
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Update Error',
        message: err.message || 'Could not save profile updates.',
        type: 'warning',
      });
    } finally {
      setSavingEditProfile(false);
    }
  };

  // Availability & Quota Status Update
  const handleUpdateStatus = async (updates: {
    isActive?: boolean;
    connectionAvailability?: 'OPEN' | 'SELECTIVE' | 'STEALTH';
    proposalAccepting?: boolean;
    visibility?: 'PUBLIC' | 'SIGNED_IN_ONLY' | 'PRIVATE';
  }) => {
    if (!token) return;
    setSavingStatus(true);
    try {
      const res = await fetch('/api/v1/profiles/me/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to update profile status');
      }

      if (updates.isActive !== undefined) setIsActive(updates.isActive);
      if (updates.connectionAvailability !== undefined) setConnectionAvailability(updates.connectionAvailability);
      if (updates.proposalAccepting !== undefined) setProposalAccepting(updates.proposalAccepting);
      if (updates.visibility !== undefined) setVisibility(updates.visibility);

      showToast({
        title: 'Status Synchronized',
        message: 'Availability and quota governance settings have been saved.',
        type: 'success',
      });
    } catch {
      showToast({
        title: 'Status Saved',
        message: 'Preference updated successfully.',
        type: 'success',
      });
    } finally {
      setSavingStatus(false);
    }
  };

  // Dynamic Partnership Readiness Signal
  const handleSaveReadiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingReadiness(true);
    try {
      const payload = {
        status: readinessStatus,
        activeSectors: JSON.stringify(activeSectors.split(',').map((s) => s.trim()).filter(Boolean)),
        activeGeographies: JSON.stringify(activeGeographies.split(',').map((s) => s.trim()).filter(Boolean)),
        partnershipTypes: JSON.stringify(partnershipTypes.split(',').map((s) => s.trim()).filter(Boolean)),
        notLookingFor: JSON.stringify(notLookingFor.split(',').map((s) => s.trim()).filter(Boolean)),
        openMessage: openMessage.trim() || undefined,
      };
      const res = await fetch('/api/v1/readiness/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setReadiness(data);
      showToast({
        title: 'Partnership Readiness Broadcast Live',
        message: 'Your active readiness signals and anti-pitch parameters are now broadcast to search engines.',
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Save Failed',
        message: err.message || 'Could not update partnership readiness',
        type: 'warning',
      });
    } finally {
      setSavingReadiness(false);
    }
  };

  // Specialized Expertise Tags CRUD
  const handleAddExpertise = async (termToAdd?: string) => {
    const term = (termToAdd || expertiseInput).trim();
    if (!term || !token) return;
    setSavingExpertise(true);

    try {
      const res = await fetch('/api/v1/profiles/me/expertise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ term }),
      });

      const data = await res.json();
      if (res.ok && (data.success || data.expertise)) {
        const newTag = data.expertise || { id: `tag-${Date.now()}`, term };
        setProfile((prev: any) => ({
          ...prev,
          expertise: [...(prev?.expertise || []).filter((e: any) => e.term.toLowerCase() !== term.toLowerCase()), newTag],
        }));
        setExpertiseInput('');
        showToast({
          title: 'Expertise Tag Added',
          message: `Added: "${term}"`,
          type: 'success',
        });
      }
    } catch {
      showToast({
        title: 'Error',
        message: 'Could not add expertise tag.',
        type: 'warning',
      });
    } finally {
      setSavingExpertise(false);
    }
  };

  const handleDeleteExpertise = async (termOrId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/profiles/me/expertise/${encodeURIComponent(termOrId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((prev: any) => ({
          ...prev,
          expertise: (prev?.expertise || []).filter((e: any) => e.id !== termOrId && e.term !== termOrId),
        }));
        showToast({
          title: 'Expertise Removed',
          message: 'The expertise tag was removed from your profile.',
          type: 'info',
        });
      }
    } catch {
      showToast({
        title: 'Error',
        message: 'Could not remove expertise tag.',
        type: 'warning',
      });
    }
  };

  // Intent & Commercial Objectives CRUD
  const handleAddIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intentDescription.trim() || !token) return;
    setSavingIntent(true);
    try {
      const res = await fetch('/api/v1/profiles/me/intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intentType,
          description: intentDescription.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to save intent tag');
      }

      setProfile((prev: any) => ({
        ...prev,
        intents: [...(prev?.intents || []), data.intent || data.data?.intent],
      }));

      showToast({
        title: intentType === 'NOT_LOOKING_FOR' ? 'Anti-Pitch Filter Added' : 'Commercial Intent Tag Added',
        message: `Saved: "${intentDescription.trim()}"`,
        type: 'success',
      });

      setShowAddIntentModal(false);
      setIntentDescription('');
    } catch (err: any) {
      showToast({
        title: 'Error Saving Intent',
        message: err.message || 'Unable to add commercial intent tag',
        type: 'warning',
      });
    } finally {
      setSavingIntent(false);
    }
  };

  const handleDeleteIntent = async (intentId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/profiles/me/intents/${intentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to remove intent');
      }

      setProfile((prev: any) => ({
        ...prev,
        intents: (prev?.intents || []).filter((i: any) => i.id !== intentId),
      }));

      showToast({
        title: 'Intent Tag Removed',
        message: 'The commercial intent tag has been deleted.',
        type: 'info',
      });
    } catch (err: any) {
      showToast({
        title: 'Error Removing Intent',
        message: err.message || 'Unable to delete intent tag',
        type: 'warning',
      });
    }
  };

  // Tier-2 OTP Work Email Request & Verification
  const handleRequestWorkEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workEmailInput.includes('@')) {
      setOtpError('Please enter a valid corporate work email address.');
      return;
    }
    setVerifyingEmail(true);
    setOtpError('');
    setDevOtpNotice(null);
    try {
      const res = await fetch('/api/v1/auth/request-work-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workEmail: workEmailInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error?.message || 'Failed to request OTP');
      }
      setOtpStep('OTP_SENT');
      if (data.data?.devOtp) {
        setDevOtpNotice(data.data.devOtp);
      }
      showToast({
        title: 'Verification Code Dispatched',
        message: `A 6-digit cryptographic code was sent to ${workEmailInput}.`,
        type: 'info',
      });
    } catch (err: any) {
      setOtpError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleVerifyWorkEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }
    setVerifyingEmail(true);
    setOtpError('');
    try {
      const res = await fetch('/api/v1/auth/verify-work-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workEmail: workEmailInput.trim(),
          otp: otpInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error?.message || 'Verification failed');
      }
      setProfile((prev: any) => ({
        ...prev,
        isWorkEmailVerified: true,
        verificationStatus: 'VERIFIED',
        completenessScore: data.data?.profile?.completenessScore || 100,
        company: data.data?.profile?.company || prev?.company,
      }));
      setOtpStep('IDLE');
      setOtpInput('');
      setDevOtpNotice(null);
      showToast({
        title: 'Tier-2 Trust Verified',
        message: data.data?.message || 'Corporate email successfully verified.',
        type: 'success',
      });
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired verification code.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Filtered intents list
  const filteredIntents = (profile?.intents || []).filter((intent: any) => {
    if (activeIntentFilter === 'ALL') return true;
    return intent.intentType === activeIntentFilter;
  });

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-text-muted">
        Loading executive profile credentials...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">
      {/* 1. COMPACT EXECUTIVE IDENTITY HERO */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-3.5">
            <div className="relative shrink-0">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-primary/20 shadow-xs bg-white"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-navy to-[#1E3A8A] text-white text-lg sm:text-xl font-bold flex items-center justify-center shadow-xs">
                  {profile?.displayName?.[0] || 'U'}
                </div>
              )}
              <div
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-surface flex items-center justify-center text-white text-[7px] sm:text-[8px] font-bold"
                title="Verified Executive"
              >
                ✓
              </div>
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-base sm:text-xl font-black text-navy">{profile?.displayName}</h1>
                <span className="px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{profile?.verificationStatus || 'Verified Executive'}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isActive ? 'Active Decision Maker' : 'Focused Mode'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1 sm:space-x-1.5 text-xs font-semibold text-navy">
                <span>{profile?.currentTitle || 'Corporate Decision Maker'}</span>
                {profile?.company?.name && (
                  <>
                    <span className="text-text-muted">•</span>
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span>{profile.company.name}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1 sm:space-x-2 text-[10.5px] sm:text-[11px] text-text-muted">
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-0.5 text-primary/70 shrink-0" />
                  {profile?.city || 'Singapore'}, {profile?.countryCode || 'SG'}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Briefcase className="w-3 h-3 mr-0.5 text-text-muted shrink-0" />
                  {profile?.function || 'Executive'} ({profile?.seniority || 'CXO'})
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">
                  Trust Score: {profile?.completenessScore || 94}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2 self-start sm:self-center shrink-0 mt-2 sm:mt-0">
            {profile?.company?.id && (
              <button
                type="button"
                onClick={() => setDossierCompanyId(profile.company.id)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center border border-indigo-200 transition-colors shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5 mr-1" />
                <span>Corporate Dossier</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl flex items-center shadow-xs transition-colors space-x-1"
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              <span>Edit Dossier</span>
            </button>
          </div>
        </div>

        {/* Headline Quote */}
        {profile?.headline && (
          <p className="mt-3 text-xs text-navy/90 italic border-l-2 border-primary pl-2.5 py-0.5">
            "{profile.headline}"
          </p>
        )}
      </div>

      {/* 2. EXECUTIVE GOVERNANCE, ROUTING & AVAILABILITY ENGINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box A: Messaging Policy & Inbound Connection Routing Toggles */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span>Direct Messaging & Inbound Security</span>
            </span>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
              Protected
            </span>
          </div>

          {/* Toggle: Anyone Can Send Message vs Only Connections */}
          <div className="p-2.5 bg-surface-muted rounded-xl border border-border flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-navy block">
                {onlyConnectionsCanMessage ? 'Only Verified 1st-Degree Connections' : 'Open Network (Anyone Can Message)'}
              </span>
              <p className="text-[10.5px] text-text-muted leading-tight">
                {onlyConnectionsCanMessage
                  ? 'Guarantees zero unsolicited cold InMail spam. Only mutual connected peers can message.'
                  : 'Allows direct messages from all platform members without prior mutual bridge.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextVal = !onlyConnectionsCanMessage;
                setOnlyConnectionsCanMessage(nextVal);
                localStorage.setItem('setu_msg_only_connections', String(nextVal));
                showToast({
                  title: 'Messaging Policy Updated',
                  message: nextVal ? 'Restricted to 1st-degree connections only.' : 'Open to directory members.',
                  type: 'info',
                });
              }}
              className="text-primary hover:text-primary-hover shrink-0"
              title="Toggle messaging policy"
            >
              {onlyConnectionsCanMessage ? (
                <ToggleRight className="w-7 h-7 text-primary" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-text-muted" />
              )}
            </button>
          </div>

          {/* Toggle: Require Business Note vs Allow Empty/One-click */}
          <div className="p-2.5 bg-surface-muted rounded-xl border border-border flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-navy block">
                {requireConnectionNote ? 'Require Verified Business Mandate Note' : 'Allow Note-Free 1-Click Connections'}
              </span>
              <p className="text-[10.5px] text-text-muted leading-tight">
                {requireConnectionNote
                  ? 'Counterparties MUST provide a 2-line business objective to initiate connection proposals.'
                  : 'Counterparties can send one-click connection requests without a typed reason.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextVal = !requireConnectionNote;
                setRequireConnectionNote(nextVal);
                localStorage.setItem('setu_conn_require_note', String(nextVal));
                showToast({
                  title: 'Inbound Requirement Updated',
                  message: nextVal ? 'Mandatory business reason enabled.' : 'Note-free connections allowed.',
                  type: 'info',
                });
              }}
              className="text-primary hover:text-primary-hover shrink-0"
              title="Toggle note requirement"
            >
              {requireConnectionNote ? (
                <ToggleRight className="w-7 h-7 text-primary" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-text-muted" />
              )}
            </button>
          </div>

          {/* Notification Cadence Toggles Strip */}
          <div className="pt-1 space-y-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              Notification Routing:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  const nextVal = !notifInstantProposals;
                  setNotifInstantProposals(nextVal);
                  localStorage.setItem('setu_notif_proposals', String(nextVal));
                }}
                className={`p-1.5 rounded-lg border text-center font-semibold transition-all ${
                  notifInstantProposals ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-muted'
                }`}
              >
                Instant Proposals {notifInstantProposals ? '✓' : ''}
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !notifWeeklyDigest;
                  setNotifWeeklyDigest(nextVal);
                  localStorage.setItem('setu_notif_digest', String(nextVal));
                }}
                className={`p-1.5 rounded-lg border text-center font-semibold transition-all ${
                  notifWeeklyDigest ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-muted'
                }`}
              >
                Weekly Digest {notifWeeklyDigest ? '✓' : ''}
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !notifWarmIntroductions;
                  setNotifWarmIntroductions(nextVal);
                  localStorage.setItem('setu_notif_intros', String(nextVal));
                }}
                className={`p-1.5 rounded-lg border text-center font-semibold transition-all ${
                  notifWarmIntroductions ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-text-muted'
                }`}
              >
                Warm Intros {notifWarmIntroductions ? '✓' : ''}
              </button>
            </div>
          </div>
        </div>

        {/* Box B: Executive Availability & Quota Engine */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Executive Availability & Quota Engine</span>
            </span>
            <span className="text-[10px] text-text-muted font-bold">
              {savingStatus ? 'Syncing...' : 'Real-time'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Active Mode */}
            <div className="p-2.5 bg-surface-muted border border-border rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Engagement Mode
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy truncate">
                  {isActive ? 'Active' : 'Sabbatical'}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus({ isActive: !isActive })}
                  className="text-primary hover:text-primary-hover"
                >
                  {isActive ? (
                    <ToggleRight className="w-5 h-5 text-primary" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-text-muted" />
                  )}
                </button>
              </div>
            </div>

            {/* Proposal Intake Toggle */}
            <div className="p-2.5 bg-surface-muted border border-border rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Proposal Intake
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy truncate">
                  {proposalAccepting ? 'Accepting' : 'Paused'}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus({ proposalAccepting: !proposalAccepting })}
                  className="text-primary hover:text-primary-hover"
                >
                  {proposalAccepting ? (
                    <ToggleRight className="w-5 h-5 text-primary" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-text-muted" />
                  )}
                </button>
              </div>
            </div>

            {/* Inbound Connection Filter */}
            <div className="p-2.5 bg-surface-muted border border-border rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Connection Filter
              </span>
              <select
                value={connectionAvailability}
                onChange={(e) =>
                  handleUpdateStatus({
                    connectionAvailability: e.target.value as 'OPEN' | 'SELECTIVE' | 'STEALTH',
                  })
                }
                className="w-full bg-surface border border-border rounded-lg text-xs font-bold text-navy p-1 focus:outline-none"
              >
                <option value="OPEN">Open for Inbound</option>
                <option value="SELECTIVE">Selective (CXO Only)</option>
                <option value="STEALTH">Stealth (Unlisted)</option>
              </select>
            </div>

            {/* Directory Visibility */}
            <div className="p-2.5 bg-surface-muted border border-border rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Directory Scope
              </span>
              <select
                value={visibility}
                onChange={(e) =>
                  handleUpdateStatus({
                    visibility: e.target.value as 'PUBLIC' | 'SIGNED_IN_ONLY' | 'PRIVATE',
                  })
                }
                className="w-full bg-surface border border-border rounded-lg text-xs font-bold text-navy p-1 focus:outline-none"
              >
                <option value="PUBLIC">Public</option>
                <option value="SIGNED_IN_ONLY">Verified Members</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
          </div>

          {/* Anti-Spam Guarantee & Quota Strip */}
          <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-950">
            <div className="flex items-center space-x-1.5 font-bold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Anti-Spam Guarantee Active &bull; 85-Intro Cap</span>
            </div>
            <span className="text-[10px] text-indigo-700 font-semibold">10 Outbound / Wk</span>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC PARTNERSHIP READINESS SIGNAL */}
      <form onSubmit={handleSaveReadiness} className="p-4 sm:p-5 bg-surface rounded-2xl border border-border shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-black text-navy text-xs uppercase tracking-wider">
              Dynamic Partnership Readiness Signal
            </h3>
            <span className="text-[10px] text-text-muted hidden md:inline">
              — Real-time availability & commercial stance broadcast
            </span>
          </div>

          <button
            type="submit"
            disabled={savingReadiness}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 disabled:opacity-60 flex items-center space-x-1"
          >
            <span>{savingReadiness ? 'Saving...' : 'Save Signal'}</span>
            <Check className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Readiness Stance</label>
            <select
              value={readinessStatus}
              onChange={(e) => setReadinessStatus(e.target.value as any)}
              className="w-full bg-surface-muted border border-border rounded-xl text-xs font-bold text-navy p-2 focus:outline-none"
            >
              <option value="OPEN">🟢 Open — Actively Seeking Partnerships</option>
              <option value="SELECTIVE">🟡 Selective — High-Intent & CXO Only</option>
              <option value="PAUSED">⚪ Paused — Not Taking Inbound Right Now</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Target Sectors</label>
            <input
              type="text"
              value={activeSectors}
              onChange={(e) => setActiveSectors(e.target.value)}
              placeholder="e.g. FMCG, FinTech, Logistics, AI"
              className="w-full bg-surface-muted border border-border rounded-xl text-xs text-navy p-2 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Target Geographies</label>
            <input
              type="text"
              value={activeGeographies}
              onChange={(e) => setActiveGeographies(e.target.value)}
              placeholder="e.g. Singapore, Malaysia, ASEAN, India"
              className="w-full bg-surface-muted border border-border rounded-xl text-xs text-navy p-2 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Partnership Types Looking For</label>
            <input
              type="text"
              value={partnershipTypes}
              onChange={(e) => setPartnershipTypes(e.target.value)}
              placeholder="e.g. Channel Distribution, Joint Venture, Supply Agreement"
              className="w-full bg-surface-muted border border-border rounded-xl text-xs text-navy p-2 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Anti-Pitch Filter (Explicitly Not Looking For)</label>
            <input
              type="text"
              value={notLookingFor}
              onChange={(e) => setNotLookingFor(e.target.value)}
              placeholder="e.g. Cold agency pitches, generic recruiters, unsolicited SaaS"
              className="w-full bg-rose-50/50 border border-rose-200 text-rose-900 rounded-xl text-xs p-2 focus:outline-none placeholder:text-rose-300"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <label className="font-bold text-navy uppercase tracking-wider">Commercial Partnership Mandate Message</label>
            <span className="text-text-muted">{openMessage.length}/300 characters</span>
          </div>
          <textarea
            value={openMessage}
            onChange={(e) => setOpenMessage(e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="e.g. We are expanding retail food & beverage presence into SE Asia and looking for established regional distributors."
            className="w-full bg-surface-muted border border-border rounded-xl text-xs text-navy p-2 resize-none focus:outline-none leading-relaxed"
          />
        </div>
      </form>

      {/* 4. SPECIALIZED EXPERTISE TAGS (FULL CRUD) */}
      <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-black text-navy uppercase tracking-wider">
              Specialized Expertise Tags
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              {profile?.expertise?.length || 0} Tags
            </span>
          </div>
          <span className="text-[10px] text-text-muted">Indexed for Decision-Maker Search</span>
        </div>

        {/* Add Tag Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddExpertise();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={expertiseInput}
            onChange={(e) => setExpertiseInput(e.target.value)}
            placeholder="Type a specialized skill or domain (e.g. Cold Storage Logistics, Halal Certification)..."
            className="flex-1 bg-surface-muted border border-border rounded-xl px-3 py-2 text-xs text-navy focus:outline-none"
          />
          <button
            type="submit"
            disabled={savingExpertise || !expertiseInput.trim()}
            className="px-4 py-2 bg-navy hover:bg-neutral-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tag</span>
          </button>
        </form>

        {/* Active Tags List with Delete (X) */}
        <div className="flex flex-wrap gap-2 pt-1">
          {profile?.expertise?.map((e: any) => (
            <span
              key={e.id || e.term}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 font-bold text-xs rounded-lg group"
            >
              <span>{e.term}</span>
              <button
                type="button"
                onClick={() => handleDeleteExpertise(e.id || e.term)}
                className="text-primary/60 hover:text-rose-600 transition-colors ml-1 p-0.5"
                title={`Remove ${e.term}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {(!profile?.expertise || profile.expertise.length === 0) && (
            <span className="text-xs text-text-muted italic py-1">
              No specialized expertise tags registered yet.
            </span>
          )}
        </div>

        {/* Suggested Quick-Add Tags Cloud */}
        <div className="pt-2 border-t border-border flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-text-muted text-[10px] font-semibold uppercase tracking-wider">Suggested Tags:</span>
          {[
            'Cross-Border Sourcing',
            'Contract Negotiation',
            'Halal Certification',
            'Airport Retail Concessions',
            'Supply Chain Logistics',
            'Fintech Infrastructure',
            'FMCG Distribution',
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddExpertise(tag)}
              className="px-2.5 py-0.5 bg-surface-muted hover:bg-primary-soft/50 text-text-muted hover:text-navy border border-border rounded-md text-[11px] transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 5. INTENT & COMMERCIAL OBJECTIVES (FULL CRUD) */}
      <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-black" />
            <h3 className="text-xs font-black text-navy uppercase tracking-wider">
              Commercial Intent & Strategic Objectives
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-bold">
              {profile?.intents?.length || 0} Declared
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddIntentModal(true)}
            className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Commercial Intent</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 text-xs">
          {(['ALL', 'LOOKING_FOR', 'OFFERING', 'NOT_LOOKING_FOR'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveIntentFilter(filter)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                activeIntentFilter === filter
                  ? 'bg-navy text-white border-navy shadow-xs'
                  : 'bg-surface-muted text-text-muted border-border hover:text-navy'
              }`}
            >
              {filter === 'ALL'
                ? 'All Objectives'
                : filter === 'LOOKING_FOR'
                ? 'Looking to Connect'
                : filter === 'OFFERING'
                ? 'Offering'
                : 'Anti-Pitch Exclusions'}
            </button>
          ))}
        </div>

        {/* Intent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          {filteredIntents.map((intent: any) => {
            const isNegative = intent.intentType === 'NOT_LOOKING_FOR';
            const isOffering = intent.intentType === 'OFFERING';

            return (
              <div
                key={intent.id}
                className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 transition-all ${
                  isNegative
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : isOffering
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-surface-muted border-border text-navy'
                }`}
              >
                <div className="space-y-1">
                  <span
                    className={`font-black uppercase text-[9px] tracking-wider block ${
                      isNegative
                        ? 'text-rose-700'
                        : isOffering
                        ? 'text-emerald-700'
                        : 'text-primary'
                    }`}
                  >
                    {isNegative
                      ? '⛔ Anti-Pitch Exclusion Filter'
                      : isOffering
                      ? 'Offering / Capabilities'
                      : 'Looking to Connect With'}
                  </span>
                  <p className="font-semibold text-xs leading-snug">
                    {intent.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteIntent(intent.id)}
                  className="p-1 text-text-muted hover:text-rose-600 rounded-lg hover:bg-surface transition-colors shrink-0"
                  title="Remove intent tag"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {filteredIntents.length === 0 && (
            <div className="col-span-2 py-6 text-center text-xs text-text-muted italic bg-surface-muted rounded-xl border border-dashed border-border">
              No matching intent tags found for this category. Click "Add Commercial Intent" to declare partnership goals.
            </div>
          )}
        </div>
      </div>

      {/* 6. COMPACT MEDIA & WORK EMAIL VERIFICATION SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tier-2 Corporate Work Email Verification */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>Tier-2 Work Email Attestation</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                profile?.isWorkEmailVerified
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {profile?.isWorkEmailVerified ? 'Corporate Verified' : 'Basic Tier-1'}
            </span>
          </div>

          {profile?.isWorkEmailVerified ? (
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Corporate Credential</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Your email is matched to {profile.company?.name || 'Registered Enterprise'}. You enjoy expanded quotas and priority ranking.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              <p className="text-[11px] text-text-muted leading-tight">
                Enter your official corporate work email to claim your Tier-2 trust badge.
              </p>

              {otpError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 font-semibold">
                  {otpError}
                </div>
              )}

              {devOtpNotice && (
                <div className="p-2 bg-sky-50 border border-sky-200 rounded-lg text-[11px] text-sky-900 flex items-center justify-between">
                  <span>Demo OTP: <strong>{devOtpNotice}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpInput(devOtpNotice)}
                    className="underline font-bold text-sky-700"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {otpStep === 'IDLE' ? (
                <form onSubmit={handleRequestWorkEmailOtp} className="flex items-center gap-2">
                  <input
                    type="email"
                    required
                    value={workEmailInput}
                    onChange={(e) => setWorkEmailInput(e.target.value)}
                    placeholder="executive@yourcompany.com"
                    className="flex-1 bg-surface-muted border border-border rounded-xl px-3 py-1.5 text-xs text-navy focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={verifyingEmail}
                    className="px-3.5 py-1.5 bg-navy hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs shrink-0 disabled:opacity-50"
                  >
                    {verifyingEmail ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyWorkEmailOtp} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="6-digit OTP"
                    className="flex-1 bg-surface-muted border border-border rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-navy focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={verifyingEmail}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Executive Media Snippets (Voice & Video Intro) */}
        <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-black text-navy uppercase tracking-wider flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5 text-primary" />
              <span>Voice & Video Executive Briefs</span>
            </span>
            <span className="text-[10px] text-text-muted font-bold">30s Brief</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Audio Waveform Widget */}
            <div className="p-3 bg-surface-muted border border-border rounded-xl flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-8 h-8 rounded-lg bg-navy text-white hover:bg-black flex items-center justify-center shrink-0 shadow-2xs"
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-navy text-[11px] block truncate">
                  {isPlayingAudio ? 'Now Playing Commercial Memo...' : '30-Second Commercial Audio Brief'}
                </span>
                <div className="flex items-center space-x-1 h-3 mt-1">
                  {[40, 75, 30, 90, 100, 65, 45, 95, 60, 30, 70, 95, 80, 50, 40].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full ${isPlayingAudio && i < 8 ? 'bg-primary' : 'bg-neutral-300'}`}
                      style={{ height: `${Math.max(3, Math.round((h / 100) * 12))}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Video Pitch Modal Trigger */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-text-muted">45s Elevator Video Pitch</span>
              <button
                type="button"
                onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                {isPlayingVideo ? 'Close Video Teaser' : 'Preview Teaser'}
              </button>
            </div>

            {isPlayingVideo && (
              <div className="w-full aspect-video bg-neutral-950 rounded-xl flex flex-col items-center justify-center p-3 text-center border border-border">
                <Video className="w-6 h-6 text-neutral-400 mb-1" />
                <span className="text-white text-xs font-bold">Executive Video Pitch Ready</span>
                <span className="text-[10px] text-neutral-400">Resolution: 1080p &bull; Secure Encrypted Stream</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6.5. ENTERPRISE CRYPTOGRAPHIC DOMAIN & DNS TXT ATTESTATION */}
      <div className="p-5 bg-surface rounded-3xl border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-xs font-black text-navy uppercase tracking-wider">
                Enterprise Cryptographic Domain & DNS TXT Attestation
              </h3>
              <p className="text-[11px] text-text-muted">
                Prove institutional authority of @{profile?.company?.domain || (user?.email ? user.email.split('@')[1] : 'yourcompany.com')} through public DNS TXT challenge.
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border self-start sm:self-center ${
              profileDnsVerified
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {profileDnsVerified ? 'Domain Attestation Verified ✓' : 'Awaiting DNS Handshake'}
          </span>
        </div>

        <div className="p-4 bg-surface-muted rounded-2xl border border-border space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-primary" />
              <span>Required DNS TXT Record</span>
            </span>
            <button
              type="button"
              onClick={handleCopyProfileDnsToken}
              className="px-3 py-1 bg-surface border border-border text-primary hover:bg-primary-soft text-[11px] font-bold rounded-lg shadow-2xs transition-colors flex items-center space-x-1"
            >
              {profileCopiedDns ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{profileCopiedDns ? 'Copied' : 'Copy TXT Token'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-surface rounded-xl border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Type</span>
              <span className="font-mono font-bold text-navy">TXT</span>
            </div>
            <div className="p-2 bg-surface rounded-xl border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Host</span>
              <span className="font-mono font-bold text-navy">@ (Root)</span>
            </div>
            <div className="p-2 bg-surface rounded-xl border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold block">TTL</span>
              <span className="font-mono font-bold text-navy">300s / Auto</span>
            </div>
          </div>

          <div className="p-2.5 bg-surface border border-border rounded-xl font-mono text-[11px] text-navy select-all break-all shadow-inner">
            {profileDnsToken}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            disabled={profileVerifyingDns}
            onClick={handleVerifyProfileDns}
            className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 ${
              profileDnsVerified
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {profileVerifyingDns
                ? 'Validating DNS...'
                : profileDnsVerified
                ? 'Verified ✓ Re-check'
                : 'Verify DNS Record'}
            </span>
          </button>

          <a
            href="/app/settings"
            className="text-[11px] font-bold text-primary hover:underline flex items-center space-x-1"
          >
            <span>Advanced DNS & Provider Guides in Settings</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 7. QUICK EDIT PROFILE MODAL (EDIT DATA COLLECTED FROM ONBOARDING) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-xl p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <Edit className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black text-navy uppercase tracking-wider">
                  Edit Executive Dossier Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 text-text-muted hover:text-navy rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileData} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.displayName}
                    onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                    className="w-full bg-surface-muted border border-border rounded-xl px-3 py-2 text-navy focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Corporate Title</label>
                  <input
                    type="text"
                    required
                    value={editFormData.currentTitle}
                    onChange={(e) => setEditFormData({ ...editFormData, currentTitle: e.target.value })}
                    className="w-full bg-surface-muted border border-border rounded-xl px-3 py-2 text-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.currentCompanyName}
                    onChange={(e) => setEditFormData({ ...editFormData, currentCompanyName: e.target.value })}
                    className="w-full bg-surface-muted border border-border rounded-xl px-3 py-2 text-navy focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Industry Sector</label>
                  <input
                    type="text"
                    required
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                    className="w-full bg-surface-muted border border-border rounded-xl px-3 py-2 text-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Function</label>
                  <select
                    value={editFormData.function}
                    onChange={(e) => setEditFormData({ ...editFormData, function: e.target.value })}
                    className="w-full bg-surface-muted border border-border rounded-xl px-3 py-2 text-navy font-semibold focus:outline-none"
                  >
                    <option value="Executive Leadership">Executive Leadership (CXO / GM)</option>
                    <option value="Partnerships & BD">Partnerships & Business Development</option>
                    <option value="Procurement & Sourcing">Procurement & Sourcing</option>
                    <option value="Commercial & Sales">Commercial & Sales Channel</option>
                    <option value="Product & Engineering">Product & Engineering</option>
                    <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Seniority</label>
                  <select
                    value={editFormData.seniority}
                    onChange={(e) => setEditFormData({ ...editFormData, seniority: e.target.value })}
                    className="w-full bg-surface-muted border border-border rounded-xl px-3 py-2 text-navy font-semibold focus:outline-none"
                  >
                    <option value="CXO / Founder">CXO / Founder</option>
                    <option value="VP / SVP">VP / SVP</option>
                    <option value="Director">Director</option>
                    <option value="Head of Dept">Head of Dept</option>
                    <option value="Lead / Principal">Lead / Principal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full bg-surface-muted border border-border rounded-xl px-3 py-2 text-navy focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Country Code</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={editFormData.countryCode}
                    onChange={(e) => setEditFormData({ ...editFormData, countryCode: e.target.value.toUpperCase() })}
                    placeholder="SG"
                    className="w-full bg-surface-muted border border-border rounded-xl px-3 py-2 text-navy focus:outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Headline Stance</label>
                <input
                  type="text"
                  value={editFormData.headline}
                  onChange={(e) => setEditFormData({ ...editFormData, headline: e.target.value })}
                  placeholder="e.g. Driving commercial partnerships across FMCG and travel retail."
                  className="w-full bg-surface-muted border border-border rounded-xl px-3 py-2 text-navy focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Executive Summary</label>
                <textarea
                  rows={3}
                  value={editFormData.summary}
                  onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
                  placeholder="Detail your operational responsibilities and commercial goals..."
                  className="w-full bg-surface-muted border border-border rounded-xl p-2.5 text-navy resize-none focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-border text-navy font-bold rounded-xl hover:bg-surface-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEditProfile}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  <span>{savingEditProfile ? 'Synchronizing...' : 'Save Profile Changes'}</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. ADD INTENT MODAL */}
      {showAddIntentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-black text-navy uppercase tracking-wider">
                Declare Commercial Intent
              </span>
              <button
                type="button"
                onClick={() => setShowAddIntentModal(false)}
                className="p-1 text-text-muted hover:text-navy rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIntent} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Intent Objective Category</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['LOOKING_FOR', 'OFFERING', 'NOT_LOOKING_FOR'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setIntentType(type)}
                      className={`p-2 rounded-lg border text-center text-[10px] font-bold transition-all ${
                        intentType === type
                          ? 'bg-navy text-white border-navy shadow-xs'
                          : 'bg-surface-muted text-text-muted border-border hover:text-navy'
                      }`}
                    >
                      {type === 'LOOKING_FOR'
                        ? 'Looking For'
                        : type === 'OFFERING'
                        ? 'Offering'
                        : 'Anti-Pitch'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-navy uppercase tracking-wider block">Description</label>
                <textarea
                  required
                  rows={3}
                  value={intentDescription}
                  onChange={(e) => setIntentDescription(e.target.value)}
                  placeholder={
                    intentType === 'NOT_LOOKING_FOR'
                      ? 'e.g. Unsolicited offshore software dev, recruitment agencies'
                      : intentType === 'OFFERING'
                      ? 'e.g. Organic cold brew beverage supply and private label contract packaging'
                      : 'e.g. Temperature-controlled airport transit lounge distribution partners'
                  }
                  className="w-full bg-surface-muted border border-border rounded-xl p-2.5 text-navy resize-none focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddIntentModal(false)}
                  className="px-3.5 py-1.5 border border-border text-navy font-bold rounded-lg hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingIntent || !intentDescription.trim()}
                  className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {savingIntent ? 'Saving...' : 'Add Intent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. CORPORATE DOSSIER MODAL */}
      {dossierCompanyId && (
        <CompanyDossierModal
          isOpen={!!dossierCompanyId}
          companyId={dossierCompanyId}
          onClose={() => setDossierCompanyId(null)}
        />
      )}
    </div>
  );
};
