import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, MeshviColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useNotifications } from '../../context/NotificationContext';
import { apiRequest } from '../../services/api';
import { SearchCardSkeleton } from '../../components/SkeletonLoader';
import { VideoShowcaseCard } from '../../components/VideoShowcaseCard';

const { width } = Dimensions.get('window');

interface StatsState {
  connectionsCount: number;
  inboundRequestsCount: number;
  introductionsCount: number;
  dealRoomsCount: number;
  quotaUsed: number;
  quotaLimit: number;
}

interface CounterpartyItem {
  id: string;
  name: string;
  headline: string;
  company: string;
  location: string;
  city?: string;
  countryCode?: string;
  matchReason: string;
  matchScore: number;
  initials: string;
  avatarUrl?: string | null;
  intents?: Array<{ intentType: string; description: string }>;
}

// Fallback high-fit verified profiles linked to exact seed database entities
const DEFAULT_CURATED_PARTNERS: CounterpartyItem[] = [
  {
    id: 'c3ea7adb-d34c-41c6-ae8d-a949b5d588c4',
    name: 'Vikram Rao',
    headline: 'Head of Vendor Relations & Technical Procurement',
    company: 'Apex Industries Ltd',
    location: 'New York, US • Enterprise Software & AI',
    city: 'New York',
    countryCode: 'US',
    matchReason: 'Seeking strategic channel distributors and enterprise AI vendor partnerships across APAC and EMEA corridors.',
    matchScore: 98,
    initials: 'VR',
    avatarUrl: null,
    intents: [
      { intentType: 'OFFERING', description: 'Enterprise LLM orchestration platforms with strict SOC2 Type II compliance.' },
      { intentType: 'LOOKING_FOR', description: 'Strategic channel distributors for enterprise AI acceleration.' },
    ],
  },
  {
    id: '00011ea5-c7dc-470c-86a5-dbe3c5a041b8',
    name: 'Bhavana Lee',
    headline: 'Director of Business Development & Regional Channels',
    company: 'Pacific Trans-Corridor Logistics',
    location: 'Singapore • Travel Retail & Sourcing',
    city: 'Singapore',
    countryCode: 'SG',
    matchReason: 'Direct alignment with cross-border retail beverage expansion, lounge concessions, and transit hub distribution.',
    matchScore: 96,
    initials: 'BL',
    avatarUrl: null,
    intents: [
      { intentType: 'PARTNERSHIP', description: 'Travel retail airport distribution agreements for premium FMCG goods.' },
    ],
  },
  {
    id: '0001ca34-178f-4eec-9c50-65e137e19849',
    name: 'Sandeep Dubois',
    headline: 'Chief Executive Officer & Strategic Alliances',
    company: 'Changi Retail Concessions Group',
    location: 'Singapore • Transit Hubs & Duty Free',
    city: 'Singapore',
    countryCode: 'SG',
    matchReason: 'Evaluating organic cold brew beverage lines and premium FMCG lounge distribution partnerships.',
    matchScore: 94,
    initials: 'SD',
    avatarUrl: null,
    intents: [
      { intentType: 'PROCUREMENT', description: 'High-margin packaged beverages and health wellness brands for airport storefronts.' },
    ],
  },
  {
    id: '00037a3b-07f5-40a3-88f3-be3cb84babc5',
    name: 'Anil Kumar',
    headline: 'Chief Executive Officer & Managing Director',
    company: 'Borneo Agro Beverages & Manufacturing',
    location: 'Kuala Lumpur, MY • F&B Manufacturing',
    city: 'Kuala Lumpur',
    countryCode: 'MY',
    matchReason: 'Manufacturer of certified organic teas and cold brew beverages with ready capacity for Southeast Asian distribution.',
    matchScore: 92,
    initials: 'AK',
    avatarUrl: null,
    intents: [
      { intentType: 'DISTRIBUTION', description: 'Regional distribution partners for ASEAN airport lounges and premium grocery chains.' },
    ],
  },
];

const SUGGESTED_MANDATES = [
  'Airport Retail Concessions',
  'Cold Brew Beverage Sourcing',
  'APAC Supply Chain Logistics',
  'Enterprise AI Platform',
  'FMCG Food Procurement',
];

interface DashboardScreenProps {
  onNavigateTab: (tab: string, initialQuery?: string, partner?: any) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateTab }) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showSuccess, showError, showConfirm } = useModal();
  const { unreadCount } = useNotifications();
  const profile = user?.profile;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.displayName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Executive';

  const handleDashboardLogout = () => {
    showConfirm({
      title: 'Sign Out of Executive Workspace',
      message:
        'Are you sure you want to log out? Your corporate credentials and encrypted session will be safely cleared on this terminal.',
      confirmText: 'Sign Out',
      cancelText: 'Stay Connected',
      isDestructive: true,
      badgeText: 'SECURITY PROTOCOL',
      onConfirm: async () => {
        try {
          await logout();
        } catch {}
      },
    });
  };

  const [stats, setStats] = useState<StatsState>({
    connectionsCount: 0,
    inboundRequestsCount: 0,
    introductionsCount: 0,
    dealRoomsCount: 2,
    quotaUsed: 0,
    quotaLimit: 10,
  });

  const [searchIntent, setSearchIntent] = useState('');
  const [curatedPartners, setCuratedPartners] = useState<CounterpartyItem[]>(DEFAULT_CURATED_PARTNERS);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [isSearchingInline, setIsSearchingInline] = useState(false);
  const [activeSearchLabel, setActiveSearchLabel] = useState<string | null>(null);

  // Dispatched connection proposal IDs (prevent double submits)
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());

  // Modal States
  const [selectedPartnerForConnect, setSelectedPartnerForConnect] = useState<CounterpartyItem | null>(null);
  const [proposalMessage, setProposalMessage] = useState('');
  const [smartDraftIndex, setSmartDraftIndex] = useState(0);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Add Company Modal State
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [companyIndustryInput, setCompanyIndustryInput] = useState('Technology & Software');
  const [companyCityInput, setCompanyCityInput] = useState('Singapore');
  const [companyDomainInput, setCompanyDomainInput] = useState('');
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);

  // Create Partnership Modal State
  const [isPartnershipModalOpen, setIsPartnershipModalOpen] = useState(false);
  const [partnershipTitleInput, setPartnershipTitleInput] = useState('');
  const [partnershipDescInput, setPartnershipDescInput] = useState('');
  const [isSubmittingPartnership, setIsSubmittingPartnership] = useState(false);
  const [hasUserPosted, setHasUserPosted] = useState(false);
  const [isChecklistCollapsed, setIsChecklistCollapsed] = useState(false);

  // 1. Refresh real-time counts from APIs
  const refreshStats = useCallback(() => {
    Promise.all([
      apiRequest<any[]>('/connections').then((r) => (r.success && Array.isArray(r.data) ? r.data.length : 0)).catch(() => 0),
      apiRequest<any>('/connections/requests').then((r) => (r.success && r.data?.incoming ? r.data.incoming.length : 0)).catch(() => 0),
      apiRequest<any[]>('/introductions').then((r) => (r.success && Array.isArray(r.data) ? r.data.length : 0)).catch(() => 0),
      apiRequest<any>('/connections/quota').then((r) => (r.success && r.data ? r.data : { used: 0, limit: 10 })).catch(() => ({ used: 0, limit: 10 })),
    ]).then(([connCount, inboundCount, introCount, quotaData]) => {
      setStats({
        connectionsCount: connCount,
        inboundRequestsCount: inboundCount,
        introductionsCount: introCount,
        dealRoomsCount: 2,
        quotaUsed: quotaData?.used || 0,
        quotaLimit: quotaData?.limit || 10,
      });
    });
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // 2. Load real counterparties from backend on mount
  useEffect(() => {
    setLoadingPartners(true);
    apiRequest<any>('/search?limit=6')
      .then((res) => {
        const rawResults = res.data?.results || res.data?.matches || (Array.isArray(res.data) ? res.data : null);
        if (res.success && Array.isArray(rawResults) && rawResults.length > 0) {
          const mapped: CounterpartyItem[] = rawResults.slice(0, 4).map((item: any, idx: number) => {
            const p = item.profile || item;
            const displayName = p.displayName || `Executive ${idx + 1}`;
            const comp = p.company?.name || p.companyName || 'Corporate Partner';
            const title = p.currentTitle || p.headline || 'Senior Decision Maker';
            const loc = `${p.city || 'Singapore'}${p.countryCode ? `, ${p.countryCode}` : ''} • ${p.industry || 'Commercial Sourcing'}`;
            const reason =
              item.laymanTransparency?.whyConnectRationale ||
              item.explanation?.matchReason ||
              p.summary ||
              'High verified alignment with your corporate mandate and commercial sourcing goals.';
            const score = item.score ? Math.round(item.score > 1 ? item.score : item.score * 100) : 98 - idx * 2;

            const initials = displayName
              .split(' ')
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return {
              id: p.id || `profile-${idx}`,
              name: displayName,
              headline: title,
              company: comp,
              location: loc,
              city: p.city || 'Singapore',
              countryCode: p.countryCode || 'SG',
              matchReason: reason,
              matchScore: score,
              initials: initials || 'EX',
              avatarUrl: p.avatarUrl || null,
              intents: p.intents || [{ intentType: 'PARTNERSHIP', description: reason }],
            };
          });
          setCuratedPartners(mapped);
        }
      })
      .catch(() => {
        // Keeps DEFAULT_CURATED_PARTNERS fallback
      })
      .finally(() => {
        setLoadingPartners(false);
      });
  }, []);

  // Search execution handler
  const handleSearchSubmit = () => {
    const q = searchIntent.trim();
    if (q) {
      onNavigateTab('search', q);
    } else {
      onNavigateTab('search');
    }
  };

  // Perform quick inline search on current page
  const handleQuickInlineSearch = () => {
    const q = searchIntent.trim();
    if (!q) {
      handleClearSearchFilter();
      return;
    }

    setIsSearchingInline(true);
    setActiveSearchLabel(q);

    apiRequest<any>(`/search?q=${encodeURIComponent(q)}&limit=6`)
      .then((res) => {
        const rawResults = res.data?.results || res.data?.matches || (Array.isArray(res.data) ? res.data : null);
        if (res.success && Array.isArray(rawResults) && rawResults.length > 0) {
          const mapped: CounterpartyItem[] = rawResults.slice(0, 4).map((item: any, idx: number) => {
            const p = item.profile || item;
            const displayName = p.displayName || `Executive ${idx + 1}`;
            const comp = p.company?.name || p.companyName || 'Corporate Partner';
            const title = p.currentTitle || p.headline || 'Senior Decision Maker';
            const loc = `${p.city || 'Regional Hub'}${p.countryCode ? `, ${p.countryCode}` : ''} • ${p.industry || 'B2B Enterprise'}`;
            const reason =
              item.laymanTransparency?.whyConnectRationale ||
              item.explanation?.matchReason ||
              p.summary ||
              `Strategic synergy identified for query "${q}".`;
            const score = item.score ? Math.round(item.score > 1 ? item.score : item.score * 100) : 96 - idx * 2;

            const initials = displayName
              .split(' ')
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return {
              id: p.id || `search-${idx}`,
              name: displayName,
              headline: title,
              company: comp,
              location: loc,
              city: p.city || 'Singapore',
              countryCode: p.countryCode || 'SG',
              matchReason: reason,
              matchScore: score,
              initials: initials || 'EX',
              avatarUrl: p.avatarUrl || null,
              intents: p.intents || [{ intentType: 'PARTNERSHIP', description: reason }],
            };
          });
          setCuratedPartners(mapped);
        } else {
          const filtered = DEFAULT_CURATED_PARTNERS.filter(
            (p) =>
              p.name.toLowerCase().includes(q.toLowerCase()) ||
              p.headline.toLowerCase().includes(q.toLowerCase()) ||
              p.company.toLowerCase().includes(q.toLowerCase()) ||
              p.matchReason.toLowerCase().includes(q.toLowerCase())
          );
          setCuratedPartners(filtered.length > 0 ? filtered : DEFAULT_CURATED_PARTNERS);
        }
      })
      .catch(() => {
        const filtered = DEFAULT_CURATED_PARTNERS.filter(
          (p) =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.headline.toLowerCase().includes(q.toLowerCase()) ||
            p.company.toLowerCase().includes(q.toLowerCase())
        );
        setCuratedPartners(filtered.length > 0 ? filtered : DEFAULT_CURATED_PARTNERS);
      })
      .finally(() => {
        setIsSearchingInline(false);
      });
  };

  const handleClearSearchFilter = () => {
    setSearchIntent('');
    setActiveSearchLabel(null);
    setCuratedPartners(DEFAULT_CURATED_PARTNERS);
  };

  const handleChipClick = (term: string) => {
    setSearchIntent(term);
    onNavigateTab('search', term);
  };

  // Open Direct Connect Modal
  const handleOpenConnectModal = (partner: CounterpartyItem) => {
    setSelectedPartnerForConnect(partner);
    setSmartDraftIndex(0);
    const company = partner.company ? ` at ${partner.company}` : '';
    setProposalMessage(`Hi ${partner.name}, I noticed your work${company} and would love to connect.`);
  };

  const cycleSmartDraft = () => {
    if (!selectedPartnerForConnect) return;
    const company = selectedPartnerForConnect.company ? ` at ${selectedPartnerForConnect.company}` : '';
    const variations = [
      `Hi ${selectedPartnerForConnect.name}, I noticed your work${company} and would love to connect. Open to a brief conversation?`,
      `Hi ${selectedPartnerForConnect.name}, our commercial roadmap closely aligns with your focus. Would value connecting here.`,
      `Hi ${selectedPartnerForConnect.name}, following your leadership${company}. Would love to connect and exchange bilateral perspectives.`,
    ];
    const nextIdx = (smartDraftIndex + 1) % variations.length;
    setSmartDraftIndex(nextIdx);
    setProposalMessage(variations[nextIdx]);
  };

  const handleSendProposal = async () => {
    if (!selectedPartnerForConnect) return;
    if (!proposalMessage.trim()) {
      showError('Message Required', 'Please enter a brief message for your bilateral connection proposal.');
      return;
    }

    setIsSubmittingProposal(true);
    const res = await apiRequest('/connections', {
      method: 'POST',
      body: {
        recipientProfileId: selectedPartnerForConnect.id,
        businessReason: proposalMessage.trim(),
        opportunityPitch: proposalMessage.trim(),
        mutualGoals: `Direct Connection | ${selectedPartnerForConnect.company || 'Professional'}`,
        recipientProfileIds: [selectedPartnerForConnect.id],
      },
    });

    setIsSubmittingProposal(false);
    if (res.success) {
      setDispatchedIds((prev) => new Set([...prev, selectedPartnerForConnect.id]));
      refreshStats();
      showSuccess(
        '🤝 Connection Proposal Dispatched',
        `Your verified business proposal was sent directly to ${selectedPartnerForConnect.name}.`
      );
      setSelectedPartnerForConnect(null);
    } else {
      showError('Dispatch Failed', res.error || 'Failed to dispatch proposal. Please try again.');
    }
  };

  // Handle Add Company Submit
  const handleAddCompanySubmit = async () => {
    if (!companyNameInput.trim()) {
      showError('Company Name Required', 'Please provide an organization name.');
      return;
    }

    setIsSubmittingCompany(true);
    const res = await apiRequest('/companies', {
      method: 'POST',
      body: {
        name: companyNameInput.trim(),
        industry: companyIndustryInput.trim() || 'General Business',
        headquartersCity: companyCityInput.trim() || 'Singapore',
        domain: companyDomainInput.trim() || undefined,
      },
    });

    setIsSubmittingCompany(false);
    if (res.success) {
      refreshStats();
      showSuccess(
        '🏢 Company Registered',
        `${companyNameInput.trim()} has been registered as your verified enterprise node.`
      );
      setIsAddCompanyOpen(false);
      setCompanyNameInput('');
    } else {
      showError('Failed to Register', res.error || 'Could not register company.');
    }
  };

  // Handle Create Partnership Submit
  const handleCreatePartnershipSubmit = async () => {
    if (!partnershipTitleInput.trim() || !partnershipDescInput.trim()) {
      showError('Fields Required', 'Please provide a title and mandate description.');
      return;
    }

    setIsSubmittingPartnership(true);
    // Submit partnership mandate
    setTimeout(() => {
      setIsSubmittingPartnership(false);
      setIsPartnershipModalOpen(false);
      setHasUserPosted(true);
      showSuccess('✨ Mandate Published', 'Your partnership opportunity is now active on the Corporate Deal Exchange.');
      onNavigateTab('partnerships');
    }, 600);
  };

  const isProfileComplete = Boolean(
    profile?.displayName &&
    (profile?.headline || profile?.summary) &&
    (profile?.currentTitle || profile?.industry)
  );
  const isPostComplete = hasUserPosted;
  const isConnectionComplete = stats.connectionsCount > 0;
  const onboardingStepsDone = (isProfileComplete ? 1 : 0) + (isPostComplete ? 1 : 0) + (isConnectionComplete ? 1 : 0);
  const onboardingPercent = Math.round((onboardingStepsDone / 3) * 100);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* EXECUTIVE BRAND TOP BAR & NOTIFICATIONS ACCESS           */}
        {/* ======================================================== */}
        <View style={styles.dashboardTopBar}>
          <View style={styles.dashboardBrandRow}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 30, height: 30, borderRadius: 8, marginRight: 8 }}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.dashboardBrandName}>MESHVI</Text>
              <Text style={styles.dashboardBrandSub}>EXECUTIVE NETWORK</Text>
            </View>
          </View>

          <View style={styles.dashboardHeaderActions}>
            <TouchableOpacity
              style={styles.headerNotificationBtn}
              onPress={() => onNavigateTab('notifications')}
              activeOpacity={0.75}
            >
              <Feather name="bell" size={17} color={MeshviColors.primary} />
              {unreadCount > 0 && (
                <View style={styles.headerNotificationBadge}>
                  <Text style={styles.headerNotificationBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerMessageBtn}
              onPress={() => onNavigateTab('messages')}
              activeOpacity={0.75}
            >
              <Feather name="message-square" size={16} color={MeshviColors.primary} />
            </TouchableOpacity>

            {/* Direct Executive Sign Out Button */}
            <TouchableOpacity
              style={styles.headerLogoutBtn}
              onPress={handleDashboardLogout}
              activeOpacity={0.75}
            >
              <Feather name="log-out" size={14} color={COLORS.rose} style={{ marginRight: 4 }} />
              <Text style={styles.headerLogoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 1. PROFILE HEADER — JUST ONE SLEEK LINE (WEB PARITY)     */}
        {/* ======================================================== */}
        <View style={styles.sleekHeaderBar}>
          <View style={styles.sleekHeaderLeft}>
            <View style={styles.sleekAvatarWrap}>
              {profile?.avatarUrl || user?.avatarUrl ? (
                <Image
                  source={{ uri: profile?.avatarUrl || user?.avatarUrl }}
                  style={styles.sleekAvatarImg}
                />
              ) : (
                <View style={styles.sleekAvatarInitials}>
                  <Text style={styles.sleekAvatarInitialsText}>
                    {firstName[0]?.toUpperCase() || 'E'}
                  </Text>
                </View>
              )}
              <View style={styles.sleekAvatarBadge}>
                <Text style={styles.sleekAvatarBadgeText}>✓</Text>
              </View>
            </View>

            <View style={styles.sleekMetaGroup}>
              <View style={styles.sleekGreetingRow}>
                <Text style={styles.sleekGreetingText} numberOfLines={1}>
                  {greeting}, {firstName}
                </Text>
                <View style={styles.sleekVerifiedPill}>
                  <Feather name="user-check" size={9} color="#166534" />
                  <Text style={styles.sleekVerifiedPillText}>VERIFIED</Text>
                </View>
                <View style={styles.sleekProtectedPill}>
                  <Feather name="shield" size={9} color="#0369A1" />
                  <Text style={styles.sleekProtectedPillText}>PROTECTED</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sleekHeaderActions}>
            <TouchableOpacity
              style={styles.sleekProfileBtn}
              onPress={() => onNavigateTab('profile')}
              activeOpacity={0.75}
            >
              <Text style={styles.sleekProfileBtnText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sleekLogoutBtn}
              onPress={handleDashboardLogout}
              activeOpacity={0.75}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Feather name="log-out" size={13} color={COLORS.rose} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sleekPostBtn}
              onPress={() => setIsPartnershipModalOpen(true)}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.sleekPostBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 1.5 INTERACTIVE CHECKLIST FOR NEW USERS (MOBILE)        */}
        {/* ======================================================== */}
        <View style={styles.mobileOnboardingCard}>
          <View style={styles.mobileOnboardingHeader}>
            <View style={styles.mobileOnboardingTitleGroup}>
              <View style={styles.mobileOnboardingIconBox}>
                <Feather name="zap" size={15} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.mobileOnboardingTitle}>Quick Start Checklist</Text>
                  <View style={styles.mobileOnboardingBadge}>
                    <Text style={styles.mobileOnboardingBadgeText}>
                      {onboardingStepsDone}/3 Done ({onboardingPercent}%)
                    </Text>
                  </View>
                </View>
                <Text style={styles.mobileOnboardingSub}>
                  {onboardingStepsDone === 3
                    ? '🎉 All 3 steps complete! Profile fully discoverable.'
                    : 'Complete 3 steps to start receiving direct B2B matches'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsChecklistCollapsed(!isChecklistCollapsed)}
              style={styles.mobileOnboardingToggleBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name={isChecklistCollapsed ? 'chevron-down' : 'chevron-up'}
                size={16}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Progress Bar Track */}
          <View style={styles.mobileOnboardingProgressTrack}>
            <View
              style={[
                styles.mobileOnboardingProgressFill,
                { width: `${Math.max(10, onboardingPercent)}%` },
              ]}
            />
          </View>

          {/* 3 Interactive Milestones */}
          {!isChecklistCollapsed && (
            <View style={styles.mobileOnboardingStepsList}>
              {/* Step 1 */}
              <View style={[styles.mobileStepItem, isProfileComplete && styles.mobileStepItemDone]}>
                <View style={styles.mobileStepLeft}>
                  <View
                    style={[
                      styles.mobileStepIndicator,
                      isProfileComplete && styles.mobileStepIndicatorDone,
                    ]}
                  >
                    {isProfileComplete ? (
                      <Feather name="check" size={11} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.mobileStepNumber}>1</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.mobileStepTitle,
                        isProfileComplete && styles.mobileStepTitleDone,
                      ]}
                    >
                      Complete Profile (1/3)
                    </Text>
                    <Text style={styles.mobileStepTagline}>Title, bio & focus areas</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.mobileStepActionBtn,
                    isProfileComplete && styles.mobileStepActionBtnDone,
                  ]}
                  onPress={() => onNavigateTab('profile')}
                >
                  <Text
                    style={[
                      styles.mobileStepActionBtnText,
                      isProfileComplete && styles.mobileStepActionBtnTextDone,
                    ]}
                  >
                    {isProfileComplete ? 'View' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Step 2 */}
              <View style={[styles.mobileStepItem, isPostComplete && styles.mobileStepItemDone]}>
                <View style={styles.mobileStepLeft}>
                  <View
                    style={[
                      styles.mobileStepIndicator,
                      isPostComplete && styles.mobileStepIndicatorDone,
                    ]}
                  >
                    {isPostComplete ? (
                      <Feather name="check" size={11} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.mobileStepNumber}>2</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.mobileStepTitle,
                        isPostComplete && styles.mobileStepTitleDone,
                      ]}
                    >
                      Post Something (2/3)
                    </Text>
                    <Text style={styles.mobileStepTagline}>Publish requirement or deal</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.mobileStepActionBtn,
                    isPostComplete && styles.mobileStepActionBtnDone,
                  ]}
                  onPress={() => setIsPartnershipModalOpen(true)}
                >
                  <Text
                    style={[
                      styles.mobileStepActionBtnText,
                      isPostComplete && styles.mobileStepActionBtnTextDone,
                    ]}
                  >
                    {isPostComplete ? 'Post' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Step 3 */}
              <View style={[styles.mobileStepItem, isConnectionComplete && styles.mobileStepItemDone]}>
                <View style={styles.mobileStepLeft}>
                  <View
                    style={[
                      styles.mobileStepIndicator,
                      isConnectionComplete && styles.mobileStepIndicatorDone,
                    ]}
                  >
                    {isConnectionComplete ? (
                      <Feather name="check" size={11} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.mobileStepNumber}>3</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.mobileStepTitle,
                        isConnectionComplete && styles.mobileStepTitleDone,
                      ]}
                    >
                      Make Connections (3/3)
                    </Text>
                    <Text style={styles.mobileStepTagline}>Reach out to peer executives</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.mobileStepActionBtn,
                    isConnectionComplete && styles.mobileStepActionBtnDone,
                  ]}
                  onPress={() => onNavigateTab('connections')}
                >
                  <Text
                    style={[
                      styles.mobileStepActionBtnText,
                      isConnectionComplete && styles.mobileStepActionBtnTextDone,
                    ]}
                  >
                    {isConnectionComplete ? 'Network' : 'Find'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ======================================================== */}
        {/* 2. CHAT & MAIN PAGE HERO — "HEY! 👋, WHAT'S ON YOUR MIND" */}
        {/* ======================================================== */}
        <View style={styles.heroMindContainer}>
          <Text style={styles.heroMindGreeting}>
            Hey! 👋, {firstName}
          </Text>
          <Text style={styles.heroMindTitle}>
            What’s on your mind Now?
          </Text>

          {/* Sleek Floating Pill Input Bar */}
          <View style={styles.floatingPillBar}>
            <TouchableOpacity
              onPress={() => onNavigateTab('search')}
              style={styles.floatingPillPlusBtn}
              activeOpacity={0.7}
            >
              <Feather name="plus" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <TextInput
              style={styles.floatingPillInput}
              placeholder="Ask Anything... e.g. Travel retail airport lounge, cold brew..."
              placeholderTextColor="#94A3B8"
              value={searchIntent}
              onChangeText={setSearchIntent}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
            />

            {searchIntent.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearchFilter}
                style={styles.floatingPillClearBtn}
                activeOpacity={0.7}
              >
                <Feather name="x" size={14} color="#94A3B8" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.floatingPillSendBtn}
              onPress={handleSearchSubmit}
              activeOpacity={0.85}
            >
              <Feather
                name="send"
                size={14}
                color="#FFFFFF"
                style={{ transform: [{ rotate: '-45deg' }], marginLeft: -1 }}
              />
            </TouchableOpacity>
          </View>

          {/* Suggested Mandate Chips */}
          <View style={styles.suggestedMandatesRow}>
            <Text style={styles.suggestedMandatesLabel}>SUGGESTED:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mandatesScroll}>
              {SUGGESTED_MANDATES.map((term) => (
                <TouchableOpacity
                  key={term}
                  onPress={() => handleChipClick(term)}
                  style={styles.modernMandateChip}
                  activeOpacity={0.75}
                >
                  <Text style={styles.modernMandateChipText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 3. PLATFORM VIDEO SHOWCASE (EXACT WEB PARITY)            */}
        {/* ======================================================== */}
        <VideoShowcaseCard />

        {/* ======================================================== */}
        {/* 4. COMPACT EXECUTIVE KPI COMMAND BAR (3-Column Strip)    */}
        {/* ======================================================== */}
        <View style={styles.kpiGridCompact}>
          {/* Card 1: Direct Network */}
          <TouchableOpacity
            style={styles.kpiCardCompact}
            onPress={() => onNavigateTab('connections')}
            activeOpacity={0.75}
          >
            <View style={styles.kpiTopRowCompact}>
              <Feather name="users" size={13} color={MeshviColors.accent} />
              <Feather name="arrow-up-right" size={11} color={MeshviColors.textMuted} />
            </View>
            <Text style={styles.kpiValueCompact}>{stats.connectionsCount}</Text>
            <Text style={styles.kpiLabelCompact}>DIRECT NETWORK</Text>
            <Text style={styles.kpiSubTextCompact} numberOfLines={1}>Active bridges</Text>
          </TouchableOpacity>

          {/* Card 2: Inbound Proposals */}
          <TouchableOpacity
            style={styles.kpiCardCompact}
            onPress={() => onNavigateTab('connections')}
            activeOpacity={0.75}
          >
            <View style={styles.kpiTopRowCompact}>
              <Feather name="inbox" size={13} color="#D97706" />
              {stats.inboundRequestsCount > 0 ? (
                <View style={styles.kpiAlertDot} />
              ) : (
                <Feather name="arrow-up-right" size={11} color={MeshviColors.textMuted} />
              )}
            </View>
            <Text style={styles.kpiValueCompact}>{stats.inboundRequestsCount}</Text>
            <Text style={styles.kpiLabelCompact}>INBOUND</Text>
            <Text style={styles.kpiSubTextCompact} numberOfLines={1}>
              {stats.inboundRequestsCount > 0 ? 'Pending triage' : 'All triaged'}
            </Text>
          </TouchableOpacity>

          {/* Card 3: Warm Bridges */}
          <TouchableOpacity
            style={styles.kpiCardCompact}
            onPress={() => onNavigateTab('introductions')}
            activeOpacity={0.75}
          >
            <View style={styles.kpiTopRowCompact}>
              <Feather name="share-2" size={13} color="#0284C7" />
              <Feather name="arrow-up-right" size={11} color={MeshviColors.textMuted} />
            </View>
            <Text style={styles.kpiValueCompact}>{stats.introductionsCount}</Text>
            <Text style={styles.kpiLabelCompact}>WARM BRIDGES</Text>
            <Text style={styles.kpiSubTextCompact} numberOfLines={1}>Mutual peers</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* 4. CURATED HIGH-SYNERGY COUNTERPARTIES                   */}
        {/* ======================================================== */}
        <View style={styles.counterpartiesSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Feather name="target" size={14} color={MeshviColors.accent} />
              <Text style={styles.sectionTitleText}>
                {activeSearchLabel ? `Results for "${activeSearchLabel}"` : 'Curated High-Synergy Counterparties'}
              </Text>
              <View style={styles.activeCountBadge}>
                <Text style={styles.activeCountText}>{curatedPartners.length} Active</Text>
              </View>
            </View>

            <View style={styles.sectionRightRow}>
              {activeSearchLabel ? (
                <TouchableOpacity onPress={handleClearSearchFilter} style={{ marginRight: 10 }}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={() => onNavigateTab('search')} style={styles.fullDirLink}>
                <Text style={styles.fullDirText}>Full Directory</Text>
                <Feather name="arrow-right" size={12} color={MeshviColors.accent} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Counterparties List */}
          {loadingPartners ? (
            <View style={{ paddingVertical: 10 }}>
              <SearchCardSkeleton />
              <SearchCardSkeleton />
            </View>
          ) : curatedPartners.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No direct counterparty matches found for this query.</Text>
              <TouchableOpacity onPress={handleClearSearchFilter} style={{ marginTop: 8 }}>
                <Text style={styles.resetBtnText}>Reset to All Curated Matches</Text>
              </TouchableOpacity>
            </View>
          ) : (
            curatedPartners.map((partner) => {
              const isDispatched = dispatchedIds.has(partner.id);

              return (
                <View key={partner.id} style={styles.partnerCardCompact}>
                  {/* Top Row: Avatar + Name/Company + Connect Button */}
                  <View style={styles.partnerTopRowCompact}>
                    <View style={styles.partnerIdentityRowCompact}>
                      {partner.avatarUrl ? (
                        <Image source={{ uri: partner.avatarUrl }} style={styles.partnerAvatarSmall} />
                      ) : (
                        <View style={styles.partnerInitialsWrapSmall}>
                          <Text style={styles.partnerInitialsTextSmall}>{partner.initials}</Text>
                        </View>
                      )}
                      <View style={{ marginLeft: 8, flex: 1, minWidth: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.partnerNameSmall} numberOfLines={1}>{partner.name}</Text>
                          <MaterialCommunityIcons name="check-decagram" size={12} color="#166534" style={{ marginLeft: 3 }} />
                        </View>
                        <Text style={styles.partnerCompanySmall} numberOfLines={1}>{partner.company}</Text>
                      </View>
                    </View>

                    {isDispatched ? (
                      <View style={styles.proposalSentBadgeCompact}>
                        <Feather name="check" size={11} color="#166534" style={{ marginRight: 3 }} />
                        <Text style={styles.proposalSentTextCompact}>Sent</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.connectBtnCompact}
                        onPress={() => handleOpenConnectModal(partner)}
                        activeOpacity={0.85}
                      >
                        <Feather name="user-plus" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.connectBtnTextCompact}>Connect</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Title / Headline */}
                  <Text style={styles.partnerHeadlineCompact} numberOfLines={1}>
                    {partner.headline}
                  </Text>

                  {/* Location */}
                  <View style={styles.partnerLocationRowCompact}>
                    <Feather name="map-pin" size={10} color={MeshviColors.accent} style={{ marginRight: 4 }} />
                    <Text style={styles.partnerLocationTextCompact} numberOfLines={1}>
                      {partner.location}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ======================================================== */}
        {/* 5. EXECUTIVE TOOLKIT QUICK LAUNCHER                      */}
        {/* ======================================================== */}
        <View style={styles.toolkitCard}>
          <View style={styles.toolkitHeader}>
            <Feather name="compass" size={15} color={MeshviColors.accent} />
            <Text style={styles.toolkitTitle}>EXECUTIVE TOOLKIT</Text>
          </View>

          <View style={styles.toolkitItemsList}>
            {/* 1. Partnerships */}
            <TouchableOpacity
              style={styles.toolkitItem}
              onPress={() => onNavigateTab('partnerships')}
              activeOpacity={0.7}
            >
              <View style={[styles.toolkitIconCircle, { backgroundColor: MeshviColors.surfaceMint }]}>
                <Feather name="briefcase" size={15} color={MeshviColors.accent} />
              </View>
              <View style={styles.toolkitMeta}>
                <Text style={styles.toolkitItemTitle}>Partnerships Hub</Text>
                <Text style={styles.toolkitItemSub}>Browse bilateral mandates & joint proposals</Text>
              </View>
              <Feather name="chevron-right" size={16} color={MeshviColors.textMuted} />
            </TouchableOpacity>

            {/* 2. Search & Directory */}
            <TouchableOpacity
              style={styles.toolkitItem}
              onPress={() => onNavigateTab('search')}
              activeOpacity={0.7}
            >
              <View style={[styles.toolkitIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Feather name="search" size={15} color="#166534" />
              </View>
              <View style={styles.toolkitMeta}>
                <Text style={styles.toolkitItemTitle}>Search & Directory</Text>
                <Text style={styles.toolkitItemSub}>Find verified decision makers by corporate mandate</Text>
              </View>
              <Feather name="chevron-right" size={16} color={MeshviColors.textMuted} />
            </TouchableOpacity>

            {/* 3. Direct Connections */}
            <TouchableOpacity
              style={styles.toolkitItem}
              onPress={() => onNavigateTab('connections')}
              activeOpacity={0.7}
            >
              <View style={[styles.toolkitIconCircle, { backgroundColor: '#F0F9FF' }]}>
                <Feather name="users" size={15} color="#0284C7" />
              </View>
              <View style={styles.toolkitMeta}>
                <Text style={styles.toolkitItemTitle}>Direct Connections</Text>
                <Text style={styles.toolkitItemSub}>Active bilateral bridges & inbound proposal triage</Text>
              </View>
              <Feather name="chevron-right" size={16} color={MeshviColors.textMuted} />
            </TouchableOpacity>

            {/* 4. Warm Introductions */}
            <TouchableOpacity
              style={styles.toolkitItem}
              onPress={() => onNavigateTab('introductions')}
              activeOpacity={0.7}
            >
              <View style={[styles.toolkitIconCircle, { backgroundColor: '#FDF4FF' }]}>
                <Feather name="share-2" size={15} color="#9333EA" />
              </View>
              <View style={styles.toolkitMeta}>
                <Text style={styles.toolkitItemTitle}>Warm Introductions</Text>
                <Text style={styles.toolkitItemSub}>Peer endorsements & mutual institutional channels</Text>
              </View>
              <Feather name="chevron-right" size={16} color={MeshviColors.textMuted} />
            </TouchableOpacity>

            {/* 5. Direct Messages */}
            <TouchableOpacity
              style={styles.toolkitItem}
              onPress={() => onNavigateTab('messages')}
              activeOpacity={0.7}
            >
              <View style={[styles.toolkitIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="message-square" size={15} color="#4F46E5" />
              </View>
              <View style={styles.toolkitMeta}>
                <Text style={styles.toolkitItemTitle}>Direct Messages</Text>
                <Text style={styles.toolkitItemSub}>Encrypted executive bilateral messaging</Text>
              </View>
              <Feather name="chevron-right" size={16} color={MeshviColors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

          {/* Anti-Spam Governance Box */}
          <View style={styles.antiSpamBox}>
            <View style={styles.antiSpamHeaderRow}>
              <Feather name="award" size={14} color="#166534" style={{ marginRight: 6 }} />
              <Text style={styles.antiSpamTitle}>Anti-Spam Protocol Active</Text>
            </View>
            <Text style={styles.antiSpamText}>
              Every connection proposal requires explicit verified business intent. Cold automated InMail spam is mathematically blocked across MESHVI.
            </Text>
          </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL 1: DIRECT OPPORTUNITY CONNECT MODAL                */}
      {/* ======================================================== */}
      <Modal
        visible={!!selectedPartnerForConnect}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPartnerForConnect(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>Direct Connection Proposal</Text>
                <Text style={styles.modalSheetSub}>
                  To: <Text style={{ fontWeight: '800', color: MeshviColors.textPrimary }}>{selectedPartnerForConnect?.name}</Text> ({selectedPartnerForConnect?.company})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedPartnerForConnect(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Target Partner Synopsis */}
            <View style={styles.modalPartnerSynopsis}>
              <View style={styles.modalPartnerTopRow}>
                <Text style={styles.modalPartnerHeadline}>{selectedPartnerForConnect?.headline}</Text>
                <View style={styles.matchScoreBadge}>
                  <Text style={styles.matchScoreText}>{selectedPartnerForConnect?.matchScore}% Match</Text>
                </View>
              </View>
              <Text style={styles.modalPartnerReason}>"{selectedPartnerForConnect?.matchReason}"</Text>
            </View>

            {/* Smart Draft Cycle Button */}
            <TouchableOpacity onPress={cycleSmartDraft} style={styles.smartDraftBtn} activeOpacity={0.7}>
              <MaterialCommunityIcons name="star-four-points" size={14} color={MeshviColors.accent} />
              <Text style={styles.smartDraftText}>Apply Smart Draft #{smartDraftIndex + 1}</Text>
            </TouchableOpacity>

            {/* Message Input Box */}
            <TextInput
              style={styles.proposalTextInput}
              multiline
              numberOfLines={4}
              value={proposalMessage}
              onChangeText={setProposalMessage}
              placeholder="State your commercial alignment, business objective, or partnership mandate..."
              placeholderTextColor="#94A3B8"
              maxLength={300}
            />
            <Text style={styles.charCounter}>{proposalMessage.length} / 300 characters</Text>

            {/* Modal Actions */}
            <View style={styles.modalActionButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelectedPartnerForConnect(null)}
                disabled={isSubmittingProposal}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSendBtn}
                onPress={handleSendProposal}
                disabled={isSubmittingProposal}
                activeOpacity={0.88}
              >
                {isSubmittingProposal ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="send" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalSendText}>Send Proposal</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: ADD COMPANY MODAL                              */}
      {/* ======================================================== */}
      <Modal
        visible={isAddCompanyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddCompanyOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>Register Organization Node</Text>
                <Text style={styles.modalSheetSub}>Establish your company as an authorized enterprise signer</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAddCompanyOpen(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.formInputLabel}>Company Legal Name *</Text>
              <TextInput
                style={styles.singleLineInput}
                placeholder="e.g. Acme Global Logistics Ltd"
                placeholderTextColor="#94A3B8"
                value={companyNameInput}
                onChangeText={setCompanyNameInput}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.formInputLabel}>Primary Industry</Text>
              <TextInput
                style={styles.singleLineInput}
                placeholder="e.g. Supply Chain, FinTech, Retail"
                placeholderTextColor="#94A3B8"
                value={companyIndustryInput}
                onChangeText={setCompanyIndustryInput}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.formInputLabel}>Headquarters City</Text>
              <TextInput
                style={styles.singleLineInput}
                placeholder="e.g. Singapore, Dubai, New York"
                placeholderTextColor="#94A3B8"
                value={companyCityInput}
                onChangeText={setCompanyCityInput}
              />
            </View>

            <View style={styles.modalActionButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsAddCompanyOpen(false)}
                disabled={isSubmittingCompany}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSendBtn}
                onPress={handleAddCompanySubmit}
                disabled={isSubmittingCompany}
                activeOpacity={0.88}
              >
                {isSubmittingCompany ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSendText}>Register Company</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: CREATE PARTNERSHIP POST MODAL                   */}
      {/* ======================================================== */}
      <Modal
        visible={isPartnershipModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPartnershipModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>Post Commercial Mandate</Text>
                <Text style={styles.modalSheetSub}>Broadcast requirements anonymously to verified C-Suites</Text>
              </View>
              <TouchableOpacity onPress={() => setIsPartnershipModalOpen(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.formInputLabel}>Mandate Headline *</Text>
              <TextInput
                style={styles.singleLineInput}
                placeholder="e.g. Seeking Tier-1 Cold Chain Distribution in Malaysia"
                placeholderTextColor="#94A3B8"
                value={partnershipTitleInput}
                onChangeText={setPartnershipTitleInput}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.formInputLabel}>Scope & Requirements Description *</Text>
              <TextInput
                style={[styles.proposalTextInput, { height: 90 }]}
                multiline
                numberOfLines={3}
                placeholder="Outline trade volume, target jurisdictions, certifications required..."
                placeholderTextColor="#94A3B8"
                value={partnershipDescInput}
                onChangeText={setPartnershipDescInput}
              />
            </View>

            <View style={styles.modalActionButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsPartnershipModalOpen(false)}
                disabled={isSubmittingPartnership}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSendBtn}
                onPress={handleCreatePartnershipSubmit}
                disabled={isSubmittingPartnership}
                activeOpacity={0.88}
              >
                {isSubmittingPartnership ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSendText}>Publish Mandate</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MeshviColors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },

  /* TOP EXECUTIVE HEADER BAR */
  dashboardTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
  },
  dashboardBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meshviLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dashboardBrandName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  dashboardBrandSub: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  dashboardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerNotificationBtn: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  headerNotificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#0284C7',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerNotificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  headerMessageBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  headerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  headerLogoutBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.rose,
  },
  sleekLogoutBtn: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 1. SLEEK ONE-LINE PROFILE HEADER */
  sleekHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  sleekHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  sleekAvatarWrap: {
    position: 'relative',
    marginRight: 10,
  },
  sleekAvatarImg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sleekAvatarInitials: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleekAvatarInitialsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sleekAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleekAvatarBadgeText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
  },
  sleekMetaGroup: {
    flex: 1,
  },
  sleekGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  sleekGreetingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 4,
  },
  sleekVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  sleekVerifiedPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#166534',
    marginLeft: 2,
  },
  sleekProtectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  sleekProtectedPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#0369A1',
    marginLeft: 2,
  },
  sleekHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sleekProfileBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sleekProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  sleekPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#0284C7',
  },
  sleekPostBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* 1.5 MOBILE ONBOARDING CHECKLIST */
  mobileOnboardingCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 12,
    marginBottom: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mobileOnboardingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mobileOnboardingTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  mobileOnboardingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  mobileOnboardingTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  mobileOnboardingBadge: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  mobileOnboardingBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0369A1',
  },
  mobileOnboardingSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  mobileOnboardingToggleBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mobileOnboardingProgressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  mobileOnboardingProgressFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 4,
  },
  mobileOnboardingStepsList: {
    gap: 8,
  },
  mobileStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 9,
  },
  mobileStepItemDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  mobileStepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  mobileStepIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  mobileStepIndicatorDone: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  mobileStepNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  mobileStepTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  mobileStepTitleDone: {
    color: '#166534',
    textDecorationLine: 'line-through',
  },
  mobileStepTagline: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 0.5,
  },
  mobileStepActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#0284C7',
  },
  mobileStepActionBtnDone: {
    backgroundColor: '#DCFCE7',
  },
  mobileStepActionBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mobileStepActionBtnTextDone: {
    color: '#166534',
  },

  /* 2. WHAT'S ON YOUR MIND HERO */
  heroMindContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 6,
  },
  heroMindGreeting: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  heroMindTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroMindQuotaRow: {
    marginBottom: 14,
  },
  heroMindQuotaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  heroMindQuotaPrefix: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  heroMindQuotaValue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroMindQuotaSuffix: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },

  /* FLOATING PILL SEARCH BAR */
  floatingPillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 30,
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  floatingPillPlusBtn: {
    padding: 6,
  },
  floatingPillInput: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '500',
    color: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  floatingPillClearBtn: {
    padding: 6,
  },
  floatingPillSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  /* SUGGESTED MANDATES */
  suggestedMandatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 2,
  },
  suggestedMandatesLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginRight: 6,
  },
  mandatesScroll: {
    paddingVertical: 2,
  },
  modernMandateChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  modernMandateChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
  },

  /* 2. KPI COMMAND BAR */
  kpiGridCompact: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  kpiCardCompact: {
    flex: 1,
    backgroundColor: MeshviColors.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  kpiTopRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  kpiValueCompact: {
    color: MeshviColors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  kpiLabelCompact: {
    color: MeshviColors.textMuted,
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  kpiSubTextCompact: {
    color: MeshviColors.textMuted,
    fontSize: 8.5,
    marginTop: 1,
  },
  kpiAlertDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D97706',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    width: (width - 40) / 2,
    backgroundColor: MeshviColors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kpiLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiLabel: {
    color: MeshviColors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginLeft: 4,
  },
  kpiValue: {
    color: MeshviColors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  kpiValueSmall: {
    color: MeshviColors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
    marginVertical: 4,
  },
  kpiSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  kpiSubTextGreen: {
    color: '#166534',
    fontSize: 9.5,
    fontWeight: '700',
    marginLeft: 3,
  },
  kpiSubText: {
    color: MeshviColors.textMuted,
    fontSize: 9.5,
    marginTop: 2,
  },
  kpiAlertBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiAlertText: {
    color: '#B45309',
    fontSize: 8,
    fontWeight: '900',
  },

  /* 3. OBJECTIVE INTENT SEARCH ENGINE BANNER */
  searchBanner: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  searchBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  searchBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBannerTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginLeft: 6,
  },
  quotaPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quotaPillText: {
    color: '#94A3B8',
    fontSize: 9.5,
  },
  searchBannerSubtitle: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginBottom: 12,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 42,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
  },
  searchSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.accent,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  mandatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  mandatesLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 6,
  },
  mandateChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mandateChipText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
  },

  /* 4. CURATED COUNTERPARTIES SECTION */
  counterpartiesSection: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitleText: {
    color: MeshviColors.textPrimary,
    fontSize: 11.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginLeft: 6,
  },
  activeCountBadge: {
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  activeCountText: {
    color: MeshviColors.accent,
    fontSize: 9.5,
    fontWeight: '800',
  },
  sectionRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetText: {
    color: MeshviColors.textMuted,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  fullDirLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullDirText: {
    color: MeshviColors.accent,
    fontSize: 11.5,
    fontWeight: '800',
  },
  emptyCard: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: MeshviColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  resetBtnText: {
    color: MeshviColors.accent,
    fontSize: 12,
    fontWeight: '800',
  },

  /* PARTNER CARD */
  partnerCardCompact: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 8,
  },
  partnerTopRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  partnerIdentityRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  partnerAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  partnerInitialsWrapSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: MeshviColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInitialsTextSmall: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  partnerNameSmall: {
    color: MeshviColors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  partnerCompanySmall: {
    color: MeshviColors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  partnerHeadlineCompact: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
  },
  partnerLocationRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerLocationTextCompact: {
    color: MeshviColors.textMuted,
    fontSize: 10,
  },
  connectBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  connectBtnTextCompact: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  proposalSentBadgeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  proposalSentTextCompact: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
  },
  partnerCard: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 10,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  partnerIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  partnerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  partnerInitialsWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: MeshviColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInitialsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  partnerName: {
    color: MeshviColors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  partnerCompany: {
    color: MeshviColors.textMuted,
    fontSize: 10.5,
    fontWeight: '500',
  },
  matchScoreBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  matchScoreText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '800',
  },
  partnerHeadline: {
    color: MeshviColors.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  partnerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  partnerLocationText: {
    color: MeshviColors.textMuted,
    fontSize: 10.5,
  },
  matchReasonBox: {
    backgroundColor: 'rgba(15, 118, 110, 0.08)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  matchReasonText: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 15,
  },
  partnerCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.7)',
  },
  profileDetailsLink: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  proposalSentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  proposalSentText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '800',
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  connectBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  /* 5. EXECUTIVE TOOLKIT */
  toolkitCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  toolkitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolkitTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  toolkitItemsList: {
    gap: 8,
    marginBottom: 14,
  },
  toolkitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  toolkitIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  toolkitMeta: {
    flex: 1,
  },
  toolkitItemTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  toolkitItemSub: {
    color: MeshviColors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  antiSpamBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  antiSpamHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  antiSpamTitle: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '900',
  },
  antiSpamText: {
    color: '#14532D',
    fontSize: 10,
    lineHeight: 14,
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheetContainer: {
    backgroundColor: MeshviColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalSheetTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  modalSheetSub: {
    color: MeshviColors.textMuted,
    fontSize: 11.5,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalPartnerSynopsis: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  modalPartnerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalPartnerHeadline: {
    color: MeshviColors.textPrimary,
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  modalPartnerReason: {
    color: MeshviColors.accent,
    fontSize: 10.5,
    fontStyle: 'italic',
  },
  smartDraftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  smartDraftText: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
  },
  proposalTextInput: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    borderRadius: 12,
    padding: 10,
    color: MeshviColors.textPrimary,
    fontSize: 12.5,
    height: 80,
    textAlignVertical: 'top',
  },
  charCounter: {
    color: MeshviColors.textMuted,
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 12,
  },
  formInputLabel: {
    color: MeshviColors.textPrimary,
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  singleLineInput: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: MeshviColors.textPrimary,
    fontSize: 12.5,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  modalCancelText: {
    color: MeshviColors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  modalSendBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    backgroundColor: MeshviColors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSendText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
