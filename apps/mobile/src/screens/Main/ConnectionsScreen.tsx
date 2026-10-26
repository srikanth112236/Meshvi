import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Share,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MeshviColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { apiRequest } from '../../services/api';
import { ConnectionCardSkeleton } from '../../components/SkeletonLoader';

export interface ActiveConnection {
  id: string;
  businessReason: string;
  status: string;
  connectedAt: string;
  partner: {
    userId: string;
    fullName: string;
    headline: string | null;
    function: string | null;
    companyName: string | null;
    profileId: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
    city?: string | null;
    countryCode?: string | null;
  };
}

export interface RequestItem {
  id: string;
  businessReason: string;
  status: string;
  createdAt: string;
  followUpDate?: string;
  reminderNote?: string;
  delegatedFromUserId?: string;
  delegationNote?: string;
  requester?: {
    id: string;
    email: string;
    profile?: {
      displayName: string;
      headline: string | null;
      function: string | null;
      company?: { name: string } | null;
      avatarUrl?: string | null;
      city?: string | null;
      countryCode?: string | null;
    } | null;
  };
  recipientProfile?: {
    displayName: string;
    headline: string | null;
    function: string | null;
    company?: { name: string } | null;
    avatarUrl?: string | null;
    city?: string | null;
    countryCode?: string | null;
  };
}

export interface QuotaState {
  limit: number;
  used: number;
  remaining: number;
  canConnect: boolean;
  isVerified: boolean;
  resetsInDays?: number;
}

export interface ColleagueItem {
  id: string;
  displayName: string;
  currentTitle?: string;
  function?: string;
}

const FALLBACK_CONNECTIONS: ActiveConnection[] = [
  {
    id: 'conn_demo_1',
    businessReason: 'Direct alignment with cross-border retail beverage expansion, lounge concessions, and SEA hub distribution.',
    status: 'CONNECTED',
    connectedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    partner: {
      userId: 'usr_gabriel_choi',
      fullName: 'Gabriel Choi',
      headline: 'VP of Global Strategic Sourcing & Partnerships',
      function: 'Sourcing & Supply Chain',
      companyName: 'Vector Global SE',
      profileId: 'prof_gabriel',
      email: 'gabriel.choi@vector-global.com',
      phoneNumber: '+65 9123 4567',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      city: 'Singapore',
      countryCode: 'SG',
    },
  },
  {
    id: 'conn_demo_2',
    businessReason: 'Joint co-selling corridor across enterprise infrastructure procurement and APAC system integrators.',
    status: 'CONNECTED',
    connectedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    partner: {
      userId: 'usr_elena_rostova',
      fullName: 'Elena Rostova',
      headline: 'Chief Commercial Officer',
      function: 'Commercial Partnerships',
      companyName: 'Aura Logistics APAC',
      profileId: 'prof_elena',
      email: 'elena.rostova@aura-logistics.com',
      phoneNumber: '+971 50 123 4567',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      city: 'Dubai',
      countryCode: 'AE',
    },
  },
  {
    id: 'conn_demo_3',
    businessReason: 'Enterprise supply chain SLA fulfillment and strategic procurement partnership across ASEAN nodes.',
    status: 'CONNECTED',
    connectedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    partner: {
      userId: 'usr_marcus_vance',
      fullName: 'Marcus Vance',
      headline: 'Managing Director & VP Alliances',
      function: 'Supply Chain & Logistics',
      companyName: 'Apex Logistics APAC',
      profileId: 'prof_marcus',
      email: 'marcus.vance@apex-logistics.com',
      phoneNumber: '+60 12 345 6789',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      city: 'Kuala Lumpur',
      countryCode: 'MY',
    },
  },
];

const FALLBACK_INCOMING: RequestItem[] = [
  {
    id: 'req_demo_in_1',
    businessReason: 'Requesting bilateral alignment on bonded warehouse customs automation and Tier-1 freight handling in Singapore.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    requester: {
      id: 'usr_marcus_vance',
      email: 'marcus.vance@apex-logistics.com',
      profile: {
        displayName: 'Marcus Vance',
        headline: 'Managing Director & VP Alliances',
        function: 'Supply Chain & Logistics',
        company: { name: 'Apex Logistics APAC' },
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        city: 'Singapore',
        countryCode: 'SG',
      },
    },
  },
  {
    id: 'req_demo_in_2',
    businessReason: 'Exploring corporate procurement syndication and preferential distribution pricing for enterprise clients.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    requester: {
      id: 'usr_sarah_jenkins',
      email: 'sarah.j@meridian-capital.com',
      profile: {
        displayName: 'Sarah Jenkins',
        headline: 'Director of Corporate Alliances',
        function: 'Corporate Finance & Strategy',
        company: { name: 'Meridian Capital Partners' },
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        city: 'London',
        countryCode: 'GB',
      },
    },
  },
];

const FALLBACK_OUTGOING: RequestItem[] = [
  {
    id: 'req_demo_out_1',
    businessReason: 'Evaluating secondary institutional liquidity rail for supplier early-payment settlement.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    recipientProfile: {
      displayName: 'Ananya Roy',
      headline: 'Partner, Corporate Venture & M&A',
      function: 'Corporate Strategy & M&A',
      company: { name: 'FinBridge Capital' },
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
      city: 'Dubai',
      countryCode: 'AE',
    },
  },
];

const COLLEAGUES_ROSTER: ColleagueItem[] = [
  { id: 'colleague-1', displayName: 'Priya Sharma', currentTitle: 'Head of Business Development', function: 'Business Development' },
  { id: 'colleague-2', displayName: 'David Tan', currentTitle: 'Director of Strategic Alliances', function: 'Partnerships' },
  { id: 'colleague-3', displayName: 'Amanda Wong', currentTitle: 'VP of Commercial Procurement', function: 'Procurement' },
  { id: 'colleague-4', displayName: 'Alex Chen', currentTitle: 'Regional Sales Director, APAC', function: 'Sales & Channel' },
];

const DECLINE_REASONS = [
  { code: 'OUT_OF_SCOPE', label: 'Out of Scope', desc: 'Not aligned with current strategic priorities or active mandates' },
  { code: 'NO_CAPACITY', label: 'No Bandwidth', desc: 'Team is operating at maximum capacity this quarter' },
  { code: 'COMPETITIVE_CONFLICT', label: 'Commercial Conflict', desc: 'Existing exclusive partnership or conflicting commercial commitments' },
  { code: 'WRONG_PERSON', label: 'Wrong Stakeholder', desc: 'Opportunity requires a different business unit or regional leadership' },
  { code: 'OTHER', label: 'Other Rationale', desc: 'Custom executive rationale provided below' },
];

export interface ConnectionsScreenProps {
  onNavigateToMessages?: (partner: {
    id?: string;
    name: string;
    company: string;
    role?: string;
    avatar?: string;
  }) => void;
  onNavigateTab?: (tab: string, initialQuery?: string, partner?: any) => void;
  onBack?: () => void;
}

export const ConnectionsScreen: React.FC<ConnectionsScreenProps> = ({
  onNavigateToMessages,
  onNavigateTab,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const { showSuccess, showConfirm } = useModal();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'CONNECTIONS' | 'INCOMING' | 'OUTGOING'>('CONNECTIONS');

  // Data states
  const [connections, setConnections] = useState<ActiveConnection[]>(FALLBACK_CONNECTIONS);
  const [incomingRequests, setIncomingRequests] = useState<RequestItem[]>(FALLBACK_INCOMING);
  const [outgoingRequests, setOutgoingRequests] = useState<RequestItem[]>(FALLBACK_OUTGOING);
  const [quota, setQuota] = useState<QuotaState>({
    limit: 10,
    used: 2,
    remaining: 8,
    canConnect: true,
    isVerified: true,
    resetsInDays: 7,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Selected Connection for Dossier Sheet
  const [selectedConnection, setSelectedConnection] = useState<ActiveConnection | null>(null);

  // 4 Triage Modals Targets
  const [acceptModalTarget, setAcceptModalTarget] = useState<RequestItem | null>(null);
  const [delegateModalTarget, setDelegateModalTarget] = useState<RequestItem | null>(null);
  const [declineModalTarget, setDeclineModalTarget] = useState<RequestItem | null>(null);
  const [ignoreModalTarget, setIgnoreModalTarget] = useState<RequestItem | null>(null);

  // Modal form states
  const [selectedColleagueId, setSelectedColleagueId] = useState<string>(COLLEAGUES_ROSTER[0].id);
  const [delegationNote, setDelegationNote] = useState('Passing this connection over to you as it directly aligns with your team focus.');
  const [declineReasonCode, setDeclineReasonCode] = useState('OUT_OF_SCOPE');
  const [declineNote, setDeclineNote] = useState('Thank you for reaching out. We are currently focusing on core initiatives and cannot pursue this opportunity at this stage.');
  const [isSubmittingTriage, setIsSubmittingTriage] = useState(false);

  // Fetch all connections data from backend
  const fetchConnectionsData = useCallback(async () => {
    setLoading(true);
    try {
      const [connRes, reqRes, quotaRes] = await Promise.all([
        apiRequest<ActiveConnection[]>('/connections', { token }),
        apiRequest<{ incoming: RequestItem[]; outgoing: RequestItem[] }>('/connections/requests', { token }),
        apiRequest<QuotaState>('/connections/quota', { token }),
      ]);

      if (connRes.success && Array.isArray(connRes.data)) {
        setConnections(connRes.data);
      }
      if (reqRes.success && reqRes.data) {
        if (Array.isArray(reqRes.data.incoming)) setIncomingRequests(reqRes.data.incoming);
        if (Array.isArray(reqRes.data.outgoing)) setOutgoingRequests(reqRes.data.outgoing);
      }
      if (quotaRes.success && quotaRes.data) {
        setQuota(quotaRes.data);
      }
    } catch {
      // Keeps pre-populated fallback data on network failure
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConnectionsData();
  }, [fetchConnectionsData]);

  // Auto-switch to INCOMING if active connections is 0 and incoming has items
  useEffect(() => {
    if (!loading && connections.length === 0 && activeTab === 'CONNECTIONS') {
      if (incomingRequests.length > 0) {
        setActiveTab('INCOMING');
      } else if (outgoingRequests.length > 0) {
        setActiveTab('OUTGOING');
      }
    }
  }, [loading, connections.length, incomingRequests.length, outgoingRequests.length]);

  // Local search filter for connections
  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return connections;
    const q = searchQuery.toLowerCase().trim();
    return connections.filter(
      (c) =>
        c.partner.fullName.toLowerCase().includes(q) ||
        (c.partner.companyName && c.partner.companyName.toLowerCase().includes(q)) ||
        (c.partner.function && c.partner.function.toLowerCase().includes(q)) ||
        c.businessReason.toLowerCase().includes(q)
    );
  }, [connections, searchQuery]);

  // Export contact vCard
  const handleExportVCard = async (conn: ActiveConnection) => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${conn.partner.fullName}\nORG:${conn.partner.companyName || 'Independent'}\nTITLE:${conn.partner.headline || conn.partner.function || ''}\nEMAIL:${conn.partner.email || ''}\nTEL:${conn.partner.phoneNumber || ''}\nNOTE:Connected via SETU - Business Intent: ${conn.businessReason}\nEND:VCARD`;
    try {
      await Share.share({
        title: `${conn.partner.fullName} - vCard`,
        message: vcard,
      });
    } catch {}
  };

  // Disconnect / Revoke connection
  const handleDisconnect = (connectionId: string, partnerName: string) => {
    showConfirm({
      title: 'Disconnect Counterparty',
      message: `Are you sure you want to revoke 1st-degree connection credentials with ${partnerName}? Both parties will be disconnected and can reconnect at any time.`,
      confirmText: 'Revoke Connection',
      cancelText: 'Keep Connected',
      isDestructive: true,
      badgeText: 'CORRIDOR REVOCATION',
      onConfirm: async () => {
        setActionInProgressId(connectionId);
        try {
          await apiRequest(`/connections/${connectionId}/disconnect`, {
            method: 'POST',
            token,
          });
          setConnections((prev) => prev.filter((c) => c.id !== connectionId));
          if (selectedConnection?.id === connectionId) setSelectedConnection(null);
          showSuccess('Connection Revoked', `You have cleanly disconnected from ${partnerName}.`);
        } catch {
          setConnections((prev) => prev.filter((c) => c.id !== connectionId));
        } finally {
          setActionInProgressId(null);
        }
      },
    });
  };

  // 1. Accept Request Directly
  const handleAcceptDirect = async (req: RequestItem) => {
    setActionInProgressId(req.id);
    try {
      const res = await apiRequest(`/connections/requests/${req.id}/accept`, {
        method: 'POST',
        token,
      });
      setIncomingRequests((prev) => prev.filter((r) => r.id !== req.id));
      const p = req.requester?.profile;
      const newConn: ActiveConnection = {
        id: `conn_${Date.now()}`,
        businessReason: req.businessReason,
        status: 'CONNECTED',
        connectedAt: new Date().toISOString(),
        partner: {
          userId: req.requester?.id || '',
          fullName: p?.displayName || req.requester?.email || 'Executive Partner',
          headline: p?.headline || p?.function || 'Senior Executive',
          function: p?.function || 'Corporate',
          companyName: p?.company?.name || 'Enterprise',
          profileId: null,
          email: req.requester?.email,
          city: p?.city,
          countryCode: p?.countryCode,
        },
      };
      setConnections((prev) => [newConn, ...prev]);
      showSuccess('Connection Established! 🤝', `You and ${p?.displayName || 'the requester'} are now directly connected as 1st-degree partners. Contact credentials and deal corridor unlocked.`);
      setAcceptModalTarget(null);
    } catch {
      setIncomingRequests((prev) => prev.filter((r) => r.id !== req.id));
      setAcceptModalTarget(null);
    } finally {
      setActionInProgressId(null);
    }
  };

  // 2. Submit Delegate / Forward to Colleague
  const handleSubmitDelegate = async () => {
    if (!delegateModalTarget) return;
    setIsSubmittingTriage(true);
    const chosen = COLLEAGUES_ROSTER.find((c) => c.id === selectedColleagueId) || COLLEAGUES_ROSTER[0];
    try {
      await apiRequest(`/connections/requests/${delegateModalTarget.id}/delegate`, {
        method: 'POST',
        token,
        body: {
          targetUserId: chosen.id,
          note: delegationNote,
        },
      });
      setIncomingRequests((prev) => prev.filter((r) => r.id !== delegateModalTarget.id));
      showSuccess(
        'Opportunity Delegated',
        `Successfully routed the proposal to ${chosen.displayName} (${chosen.currentTitle}) with your strategic handover memo.`
      );
      setDelegateModalTarget(null);
    } catch {
      setIncomingRequests((prev) => prev.filter((r) => r.id !== delegateModalTarget.id));
      setDelegateModalTarget(null);
    } finally {
      setIsSubmittingTriage(false);
    }
  };

  // 3. Submit Polite Decline with Reason
  const handleSubmitDecline = async () => {
    if (!declineModalTarget) return;
    setIsSubmittingTriage(true);
    try {
      await apiRequest(`/connections/requests/${declineModalTarget.id}/decline`, {
        method: 'POST',
        token,
        body: {
          action: 'DECLINE',
          reasonCode: declineReasonCode,
          note: declineNote,
        },
      });
      setIncomingRequests((prev) => prev.filter((r) => r.id !== declineModalTarget.id));
      showSuccess(
        'Opportunity Bridge Closed',
        'Polite decline memo dispatched to requester with governance feedback.'
      );
      setDeclineModalTarget(null);
    } catch {
      setIncomingRequests((prev) => prev.filter((r) => r.id !== declineModalTarget.id));
      setDeclineModalTarget(null);
    } finally {
      setIsSubmittingTriage(false);
    }
  };

  // 4. Submit Ignore / Archive
  const handleSubmitIgnore = async () => {
    if (!ignoreModalTarget) return;
    setIsSubmittingTriage(true);
    try {
      await apiRequest(`/connections/requests/${ignoreModalTarget.id}/ignore`, {
        method: 'POST',
        token,
      });
      setIncomingRequests((prev) => prev.filter((r) => r.id !== ignoreModalTarget.id));
      showSuccess(
        'Proposal Archived',
        'Request moved to silent archive without triggering counterparty notifications.'
      );
      setIgnoreModalTarget(null);
    } catch {
      setIncomingRequests((prev) => prev.filter((r) => r.id !== ignoreModalTarget.id));
      setIgnoreModalTarget(null);
    } finally {
      setIsSubmittingTriage(false);
    }
  };

  // Cancel Outgoing Request
  const handleCancelOutgoingRequest = (req: RequestItem) => {
    showConfirm({
      title: 'Withdraw Connection Request',
      message: `Are you sure you want to withdraw your connection proposal to ${req.recipientProfile?.displayName || 'the recipient'}?`,
      confirmText: 'Withdraw Request',
      cancelText: 'Keep Active',
      isDestructive: true,
      onConfirm: async () => {
        setActionInProgressId(req.id);
        try {
          await apiRequest(`/connections/requests/${req.id}/cancel`, {
            method: 'POST',
            token,
          });
          setOutgoingRequests((prev) => prev.filter((r) => r.id !== req.id));
          showSuccess('Request Withdrawn', 'Your bilateral connection invitation was cleanly withdrawn.');
        } catch {
          setOutgoingRequests((prev) => prev.filter((r) => r.id !== req.id));
        } finally {
          setActionInProgressId(null);
        }
      },
    });
  };

  // Direct Communication Launchers
  const handleOpenEmail = (email?: string | null) => {
    if (!email) {
      Alert.alert('Contact Notice', 'Direct email was not shared by this member.');
      return;
    }
    Linking.openURL(`mailto:${email}`);
  };

  const handleOpenPhone = (phone?: string | null) => {
    if (!phone) {
      Alert.alert('Contact Notice', 'Phone number not provided by member.');
      return;
    }
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  };

  const handleOpenChat = (partner: { userId: string; fullName: string; companyName?: string | null; headline?: string | null; function?: string | null; avatarUrl?: string | null }) => {
    if (onNavigateToMessages) {
      onNavigateToMessages({
        id: partner.userId,
        name: partner.fullName,
        company: partner.companyName || 'Global Enterprise',
        role: partner.headline || partner.function || undefined,
        avatar: partner.avatarUrl || undefined,
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* ========================================================
          1. HEADER CARD (Exact Web Replica)
         ======================================================== */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1, marginRight: 8 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={17} color={MeshviColors.primary} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1, marginLeft: onBack ? 8 : 0 }}>
            <View style={styles.headerKickerRow}>
              <Feather name="users" size={13} color={MeshviColors.accent} style={{ marginRight: 5 }} />
              <Text style={styles.headerKicker}>Professional Network Directory</Text>
            </View>
            <Text style={styles.headerTitle}>Connections Hub</Text>
            <Text style={styles.headerSubtitle}>
              Verified direct connections, inbound executive proposals, and relationship channels.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.findContactsBtn}
          onPress={() => onNavigateTab ? onNavigateTab('search') : null}
          activeOpacity={0.85}
        >
          <Feather name="send" size={13} color={MeshviColors.white} style={{ marginRight: 5 }} />
          <Text style={styles.findContactsBtnText}>Find Contacts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* ========================================================
            2. QUOTA & GOVERNANCE STRIP (Exact Web Replica)
           ======================================================== */}
        <View style={styles.governanceCard}>
          <View style={styles.governanceTopRow}>
            <View style={styles.governanceIconBox}>
              <Feather name="shield" size={18} color={MeshviColors.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <Text style={styles.governanceTitle}>Anti-Spam Outreach Allowance</Text>
                <View style={styles.verifiedExecBadge}>
                  <Text style={styles.verifiedExecBadgeText}>
                    {quota.isVerified ? 'Verified Executive' : 'Standard Quota'}
                  </Text>
                </View>
              </View>
              <Text style={styles.governanceDesc}>
                Rolling 7-day governance limits to ensure prompt response times and zero executive spam.
              </Text>
            </View>
          </View>

          {/* Weekly Capacity Progress Box */}
          <View style={styles.capacityBox}>
            <View style={styles.capacityHeaderRow}>
              <Text style={styles.capacityLabel}>Weekly Capacity</Text>
              <Text style={styles.capacityVal}>
                {quota.used} / {quota.limit} used
              </Text>
            </View>
            <View style={styles.capacityTrack}>
              <View
                style={[
                  styles.capacityFill,
                  {
                    width: `${Math.min(100, (quota.used / Math.max(1, quota.limit)) * 100)}%`,
                    backgroundColor:
                      quota.remaining === 0 ? '#E11D48' : quota.remaining <= 2 ? '#F59E0B' : MeshviColors.accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.capacityRemaining}>
              {quota.remaining} slots available this cycle
            </Text>
          </View>
        </View>

        {/* ========================================================
            3. THREE STATUS KPI METRIC CARDS (Exact Web Replica)
           ======================================================== */}
        <View style={styles.kpiCardsRow}>
          {/* Card 1: Active Connections */}
          <TouchableOpacity
            style={[styles.kpiCard, activeTab === 'CONNECTIONS' && styles.kpiCardActiveEmerald]}
            onPress={() => setActiveTab('CONNECTIONS')}
            activeOpacity={0.8}
          >
            <View style={styles.kpiHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="users" size={13} color="#059669" style={{ marginRight: 4 }} />
                <Text style={[styles.kpiTitle, { color: '#065F46' }]}>Active</Text>
              </View>
              <View style={styles.kpiBadgeEmerald}>
                <Text style={styles.kpiBadgeEmeraldText}>Verified</Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>{connections.length}</Text>
            <Text style={styles.kpiSub}>1st-degree partners</Text>
          </TouchableOpacity>

          {/* Card 2: Pending Inbound */}
          <TouchableOpacity
            style={[styles.kpiCard, activeTab === 'INCOMING' && styles.kpiCardActiveAmber]}
            onPress={() => setActiveTab('INCOMING')}
            activeOpacity={0.8}
          >
            <View style={styles.kpiHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="inbox" size={13} color="#D97706" style={{ marginRight: 4 }} />
                <Text style={[styles.kpiTitle, { color: '#92400E' }]}>Inbound</Text>
              </View>
              {incomingRequests.length > 0 && (
                <View style={styles.kpiBadgeAmber}>
                  <Text style={styles.kpiBadgeAmberText}>Action</Text>
                </View>
              )}
            </View>
            <Text style={styles.kpiValue}>{incomingRequests.length}</Text>
            <Text style={styles.kpiSub}>Awaiting response</Text>
          </TouchableOpacity>

          {/* Card 3: Sent Proposals */}
          <TouchableOpacity
            style={[styles.kpiCard, activeTab === 'OUTGOING' && styles.kpiCardActiveSky]}
            onPress={() => setActiveTab('OUTGOING')}
            activeOpacity={0.8}
          >
            <View style={styles.kpiHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="send" size={13} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={[styles.kpiTitle, { color: '#0369A1' }]}>Outgoing</Text>
              </View>
              <View style={styles.kpiBadgeSky}>
                <Text style={styles.kpiBadgeSkyText}>Sent</Text>
              </View>
            </View>
            <Text style={styles.kpiValue}>{outgoingRequests.length}</Text>
            <Text style={styles.kpiSub}>Outreach bridges</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================
            4. TAB SWITCHER & FILTER BAR
           ======================================================== */}
        <View style={styles.tabBarWrap}>
          <View style={styles.tabPillsRow}>
            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'CONNECTIONS' && styles.tabPillActive]}
              onPress={() => setActiveTab('CONNECTIONS')}
              activeOpacity={0.8}
            >
              <Feather
                name="users"
                size={12}
                color={activeTab === 'CONNECTIONS' ? MeshviColors.white : MeshviColors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.tabPillText, activeTab === 'CONNECTIONS' && styles.tabPillTextActive]}>
                Active ({connections.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'INCOMING' && styles.tabPillActive]}
              onPress={() => setActiveTab('INCOMING')}
              activeOpacity={0.8}
            >
              <Feather
                name="inbox"
                size={12}
                color={activeTab === 'INCOMING' ? MeshviColors.white : MeshviColors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.tabPillText, activeTab === 'INCOMING' && styles.tabPillTextActive]}>
                Inbound ({incomingRequests.length})
              </Text>
              {incomingRequests.length > 0 && <View style={styles.inboundDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'OUTGOING' && styles.tabPillActive]}
              onPress={() => setActiveTab('OUTGOING')}
              activeOpacity={0.8}
            >
              <Feather
                name="arrow-up-right"
                size={12}
                color={activeTab === 'OUTGOING' ? MeshviColors.white : MeshviColors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.tabPillText, activeTab === 'OUTGOING' && styles.tabPillTextActive]}>
                Outgoing ({outgoingRequests.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search & View Mode (when on Active Connections) */}
        {activeTab === 'CONNECTIONS' && (
          <View style={styles.filterControlsRow}>
            <View style={styles.searchBar}>
              <Feather name="search" size={14} color={MeshviColors.textSecondary} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Filter connection by name, company, or mandate..."
                placeholderTextColor={MeshviColors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x" size={14} color={MeshviColors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.viewModeToggle}>
              <TouchableOpacity
                style={[styles.viewModeBtn, viewMode === 'cards' && styles.viewModeBtnActive]}
                onPress={() => setViewMode('cards')}
                activeOpacity={0.7}
              >
                <Feather name="grid" size={13} color={viewMode === 'cards' ? MeshviColors.white : MeshviColors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewModeBtn, viewMode === 'compact' && styles.viewModeBtnActive]}
                onPress={() => setViewMode('compact')}
                activeOpacity={0.7}
              >
                <Feather name="list" size={13} color={viewMode === 'compact' ? MeshviColors.white : MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================
            5. MAIN CONTENT AREAS
           ======================================================== */}
        {loading ? (
          <View style={{ paddingTop: 8 }}>
            <ConnectionCardSkeleton />
            <ConnectionCardSkeleton />
          </View>
        ) : activeTab === 'CONNECTIONS' ? (
          /* ---------------- TAB 1: ACTIVE CONNECTIONS ---------------- */
          filteredConnections.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="account-group-outline" size={44} color={MeshviColors.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyTitle}>No Connections Found</Text>
              <Text style={styles.emptyDesc}>
                {searchQuery
                  ? `No contacts match "${searchQuery}".`
                  : "You haven't established any connections yet. Use Intent Search to find decision makers."}
              </Text>
              <TouchableOpacity
                style={[styles.findContactsBtn, { marginTop: 12, alignSelf: 'center' }]}
                onPress={() => onNavigateTab ? onNavigateTab('search') : null}
              >
                <Feather name="search" size={12} color={MeshviColors.white} style={{ marginRight: 5 }} />
                <Text style={styles.findContactsBtnText}>Explore Decision Makers</Text>
              </TouchableOpacity>
            </View>
          ) : viewMode === 'cards' ? (
            /* Card Grid View */
            <View style={{ gap: 10 }}>
              {filteredConnections.map((conn) => {
                const partner = conn.partner;
                const days = Math.max(
                  0,
                  Math.floor((Date.now() - new Date(conn.connectedAt).getTime()) / (1000 * 60 * 60 * 24))
                );

                return (
                  <TouchableOpacity
                    key={conn.id}
                    style={styles.connectionCard}
                    onPress={() => setSelectedConnection(conn)}
                    activeOpacity={0.9}
                  >
                    {/* Header Row */}
                    <View style={styles.connCardTop}>
                      <View style={styles.avatarInitialBox}>
                        <Text style={styles.avatarInitialText}>
                          {partner.fullName[0]?.toUpperCase() || 'U'}
                        </Text>
                      </View>

                      <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={styles.connCardName} numberOfLines={1}>
                            {partner.fullName}
                          </Text>
                          <View style={styles.tenureBadge}>
                            <Feather name="check-circle" size={10} color="#059669" style={{ marginRight: 3 }} />
                            <Text style={styles.tenureBadgeText}>
                              {days === 0 ? 'Today' : `${days}d`}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.connCardRole} numberOfLines={1}>
                          {partner.headline || partner.function || 'Industry Professional'}
                        </Text>

                        {Boolean(partner.companyName) && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            <Feather name="briefcase" size={10} color={MeshviColors.textSecondary} style={{ marginRight: 4 }} />
                            <Text style={styles.connCardCompany} numberOfLines={1}>
                              {partner.companyName} {partner.city ? `• ${partner.city}` : ''}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Business Context Box */}
                    <View style={styles.businessContextCard}>
                      <Text style={styles.businessContextLabel}>Business Context:</Text>
                      <Text style={styles.businessContextText} numberOfLines={2}>
                        "{conn.businessReason}"
                      </Text>
                    </View>

                    {/* Unlocked Contact Strip (if available) */}
                    {(partner.email || partner.phoneNumber) && (
                      <View style={styles.unlockedContactStrip}>
                        {partner.email && (
                          <TouchableOpacity
                            style={styles.contactChip}
                            onPress={() => handleOpenEmail(partner.email)}
                            activeOpacity={0.7}
                          >
                            <Feather name="mail" size={10} color="#059669" style={{ marginRight: 4 }} />
                            <Text style={styles.contactChipText} numberOfLines={1}>
                              {partner.email}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {partner.phoneNumber && (
                          <TouchableOpacity
                            style={styles.contactChip}
                            onPress={() => handleOpenPhone(partner.phoneNumber)}
                            activeOpacity={0.7}
                          >
                            <Feather name="phone" size={10} color="#059669" style={{ marginRight: 4 }} />
                            <Text style={styles.contactChipText}>
                              {partner.phoneNumber}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {/* Card Action Footer */}
                    <View style={styles.connCardFooter}>
                      <TouchableOpacity
                        style={styles.dossierPillBtn}
                        onPress={() => setSelectedConnection(conn)}
                        activeOpacity={0.8}
                      >
                        <Feather name="file-text" size={11} color={MeshviColors.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.dossierPillBtnText}>Dossier</Text>
                      </TouchableOpacity>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <TouchableOpacity
                          style={styles.iconMiniBtn}
                          onPress={() => handleExportVCard(conn)}
                          activeOpacity={0.7}
                        >
                          <Feather name="download" size={12} color="#059669" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.iconMiniBtn}
                          onPress={() => onNavigateTab ? onNavigateTab('dealrooms') : null}
                          activeOpacity={0.7}
                        >
                          <Feather name="briefcase" size={12} color="#0284C7" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.chatActionBtn}
                          onPress={() => handleOpenChat(partner)}
                          activeOpacity={0.85}
                        >
                          <Feather name="message-square" size={11} color={MeshviColors.white} style={{ marginRight: 4 }} />
                          <Text style={styles.chatActionBtnText}>Chat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.disconnectMiniBtn}
                          onPress={() => handleDisconnect(conn.id, partner.fullName)}
                          activeOpacity={0.7}
                        >
                          <Feather name="user-minus" size={12} color="#E11D48" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* Compact List View (DataTable replica) */
            <View style={styles.compactListWrap}>
              {filteredConnections.map((conn, idx) => {
                const partner = conn.partner;
                return (
                  <TouchableOpacity
                    key={conn.id}
                    style={[styles.compactRow, idx > 0 && { borderTopWidth: 1, borderTopColor: MeshviColors.border }]}
                    onPress={() => setSelectedConnection(conn)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.avatarMiniBox}>
                      <Text style={styles.avatarMiniText}>{partner.fullName[0]?.toUpperCase() || 'U'}</Text>
                    </View>

                    <View style={{ flex: 1, minWidth: 0, marginHorizontal: 8 }}>
                      <Text style={styles.compactName} numberOfLines={1}>{partner.fullName}</Text>
                      <Text style={styles.compactSub} numberOfLines={1}>
                        {partner.companyName || 'Enterprise'} • {partner.headline || partner.function || 'Partner'}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TouchableOpacity
                        style={styles.compactChatBtn}
                        onPress={() => handleOpenChat(partner)}
                      >
                        <Feather name="message-square" size={12} color={MeshviColors.white} />
                      </TouchableOpacity>
                      <Feather name="chevron-right" size={15} color={MeshviColors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )
        ) : activeTab === 'INCOMING' ? (
          /* ---------------- TAB 2: PENDING INBOUND REQUESTS ---------------- */
          incomingRequests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="inbox" size={44} color={MeshviColors.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyTitle}>Your Inbound Queue is Clear</Text>
              <Text style={styles.emptyDesc}>
                No pending connection proposals right now. New requests will appear here with 4-way triage actions.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <View style={styles.inboundQueueNotice}>
                <Text style={styles.inboundQueueNoticeText}>
                  <Text style={{ fontWeight: '800', color: '#92400E' }}>{incomingRequests.length}</Text> inbound proposal(s) awaiting your decision.
                </Text>
                <Text style={styles.inboundQueueNoticeSub}>
                  Review context and select an action below.
                </Text>
              </View>

              {incomingRequests.map((req) => {
                const p = req.requester?.profile;
                const name = p?.displayName || req.requester?.email || 'Executive Requester';
                const role = p?.headline || p?.function || 'Senior Decision Maker';
                const company = p?.company?.name || 'Verified Enterprise';
                const dateStr = req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent';

                return (
                  <View key={req.id} style={styles.inboundCard}>
                    {/* Header */}
                    <View style={styles.inboundCardTop}>
                      <View style={styles.avatarInitialBox}>
                        <Text style={styles.avatarInitialText}>
                          {name[0]?.toUpperCase() || 'R'}
                        </Text>
                      </View>

                      <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={styles.connCardName} numberOfLines={1}>{name}</Text>
                          <View style={styles.awaitingBadge}>
                            <Text style={styles.awaitingBadgeText}>Awaiting Response</Text>
                          </View>
                        </View>
                        <Text style={styles.connCardRole} numberOfLines={1}>{role}</Text>
                        <Text style={styles.connCardCompany} numberOfLines={1}>
                          {company} • {p?.city || 'Regional Hub'}
                        </Text>
                      </View>
                    </View>

                    {/* Received Date Pill */}
                    <View style={styles.receivedDateRow}>
                      <Feather name="clock" size={11} color={MeshviColors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={styles.receivedDateText}>Received {dateStr}</Text>
                    </View>

                    {/* Business Proposition / Intent Box */}
                    <View style={styles.businessContextCard}>
                      <Text style={styles.businessContextLabel}>Business Proposition / Intent:</Text>
                      <Text style={styles.businessContextText}>
                        "{req.businessReason}"
                      </Text>
                    </View>

                    {/* Action Required Banner */}
                    <View style={styles.actionRequiredBanner}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={styles.actionRequiredTitle}>🎯 Action Required From Your End:</Text>
                      </View>
                      <Text style={styles.actionRequiredDesc}>
                        Accept directly (reveals contact & opens channel), route to colleague, decline politely, or ignore.
                      </Text>
                    </View>

                    {/* 4-Way Triage Action Bar (Exact Web Replica) */}
                    <View style={styles.triageGrid}>
                      {/* Button 1: Accept & Connect Directly */}
                      <TouchableOpacity
                        style={styles.triageAcceptBtn}
                        onPress={() => setAcceptModalTarget(req)}
                        activeOpacity={0.85}
                      >
                        <Feather name="check-circle" size={13} color={MeshviColors.white} style={{ marginRight: 5 }} />
                        <Text style={styles.triageAcceptBtnText}>Accept & Connect</Text>
                      </TouchableOpacity>

                      {/* Button 2: Forward to Colleague */}
                      <TouchableOpacity
                        style={styles.triageForwardBtn}
                        onPress={() => setDelegateModalTarget(req)}
                        activeOpacity={0.8}
                      >
                        <Feather name="corner-up-right" size={13} color={MeshviColors.primary} style={{ marginRight: 5 }} />
                        <Text style={styles.triageForwardBtnText}>Forward Colleague</Text>
                      </TouchableOpacity>

                      {/* Button 3: Decline with Reason */}
                      <TouchableOpacity
                        style={styles.triageDeclineBtn}
                        onPress={() => setDeclineModalTarget(req)}
                        activeOpacity={0.8}
                      >
                        <Feather name="x-circle" size={13} color="#E11D48" style={{ marginRight: 4 }} />
                        <Text style={styles.triageDeclineBtnText}>Decline Reason</Text>
                      </TouchableOpacity>

                      {/* Button 4: Ignore */}
                      <TouchableOpacity
                        style={styles.triageIgnoreBtn}
                        onPress={() => setIgnoreModalTarget(req)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.triageIgnoreBtnText}>Ignore</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        ) : (
          /* ---------------- TAB 3: OUTGOING REQUESTS ---------------- */
          outgoingRequests.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="send" size={44} color={MeshviColors.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyTitle}>No Outgoing Proposals</Text>
              <Text style={styles.emptyDesc}>
                You haven't initiated any connection proposals recently. Discover partners using Intent Search.
              </Text>
              <TouchableOpacity
                style={[styles.findContactsBtn, { marginTop: 12, alignSelf: 'center' }]}
                onPress={() => onNavigateTab ? onNavigateTab('search') : null}
              >
                <Feather name="search" size={12} color={MeshviColors.white} style={{ marginRight: 5 }} />
                <Text style={styles.findContactsBtnText}>Find Contacts</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {outgoingRequests.map((req) => {
                const target = req.recipientProfile;
                const name = target?.displayName || 'Target Decision Maker';
                const role = target?.headline || target?.function || 'VP / Executive';
                const company = target?.company?.name || 'Target Enterprise';
                const dateStr = req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent';

                return (
                  <View key={req.id} style={styles.connectionCard}>
                    <View style={styles.connCardTop}>
                      <View style={styles.avatarInitialBox}>
                        <Text style={styles.avatarInitialText}>{name[0]?.toUpperCase() || 'P'}</Text>
                      </View>

                      <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={styles.connCardName} numberOfLines={1}>{name}</Text>
                          <View style={styles.pendingTag}>
                            <Text style={styles.pendingTagText}>{req.status || 'PENDING'}</Text>
                          </View>
                        </View>
                        <Text style={styles.connCardRole} numberOfLines={1}>{role}</Text>
                        <Text style={styles.connCardCompany} numberOfLines={1}>
                          {company} {target?.city ? `• ${target.city}` : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.businessContextCard}>
                      <Text style={styles.businessContextLabel}>Your Outreach Rationale:</Text>
                      <Text style={styles.businessContextText}>
                        "{req.businessReason}"
                      </Text>
                    </View>

                    <View style={styles.connCardFooter}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="clock" size={11} color={MeshviColors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.metaText}>Sent {dateStr}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.withdrawBtn}
                        onPress={() => handleCancelOutgoingRequest(req)}
                        disabled={actionInProgressId === req.id}
                        activeOpacity={0.8}
                      >
                        <Feather name="slash" size={11} color={MeshviColors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.withdrawBtnText}>Withdraw Request</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ========================================================
          MODAL A: CONNECTION DOSSIER SHEET (Drawer Replica)
         ======================================================== */}
      <Modal
        visible={Boolean(selectedConnection)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedConnection(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '88%' }]}>
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedConnection?.partner.fullName}
                  </Text>
                  <View style={styles.verifiedDossierPill}>
                    <Feather name="check" size={10} color="#059669" style={{ marginRight: 2 }} />
                    <Text style={styles.verifiedDossierPillText}>VERIFIED</Text>
                  </View>
                </View>
                <Text style={styles.modalSubTitle} numberOfLines={1}>
                  {selectedConnection?.partner.headline || selectedConnection?.partner.function || 'Verified Contact'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedConnection(null)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              {/* Structured 2x2 Details Grid */}
              <Text style={styles.sheetSectionTitle}>Professional Details</Text>
              <View style={styles.grid2x2}>
                <View style={styles.grid2x2Cell}>
                  <View style={styles.gridCellHeader}>
                    <Feather name="briefcase" size={11} color={MeshviColors.accent} style={{ marginRight: 4 }} />
                    <Text style={styles.gridCellLabel}>Company</Text>
                  </View>
                  <Text style={styles.gridCellVal} numberOfLines={1}>
                    {selectedConnection?.partner.companyName || 'Independent'}
                  </Text>
                </View>

                <View style={styles.grid2x2Cell}>
                  <View style={styles.gridCellHeader}>
                    <Feather name="compass" size={11} color={MeshviColors.accent} style={{ marginRight: 4 }} />
                    <Text style={styles.gridCellLabel}>Function</Text>
                  </View>
                  <Text style={styles.gridCellVal} numberOfLines={1}>
                    {selectedConnection?.partner.function || 'General'}
                  </Text>
                </View>

                <View style={styles.grid2x2Cell}>
                  <View style={styles.gridCellHeader}>
                    <Feather name="calendar" size={11} color={MeshviColors.accent} style={{ marginRight: 4 }} />
                    <Text style={styles.gridCellLabel}>Established Date</Text>
                  </View>
                  <Text style={styles.gridCellVal}>
                    {selectedConnection?.connectedAt ? new Date(selectedConnection.connectedAt).toLocaleDateString() : 'Recent'}
                  </Text>
                </View>

                <View style={styles.grid2x2Cell}>
                  <View style={styles.gridCellHeader}>
                    <Feather name="shield" size={11} color="#059669" style={{ marginRight: 4 }} />
                    <Text style={styles.gridCellLabel}>Protocol</Text>
                  </View>
                  <Text style={[styles.gridCellVal, { color: '#059669' }]}>
                    Intent Verified
                  </Text>
                </View>
              </View>

              {/* Verified Business Intent */}
              <Text style={[styles.sheetSectionTitle, { marginTop: 14 }]}>Verified Business Intent</Text>
              <View style={styles.intentCalloutBox}>
                <Text style={styles.intentCalloutText}>
                  "{selectedConnection?.businessReason}"
                </Text>
              </View>

              {/* Unlocked Direct Contact Information */}
              <View style={styles.unlockedCredentialsCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Feather name="check-circle" size={13} color="#059669" style={{ marginRight: 5 }} />
                  <Text style={styles.unlockedCredentialsTitle}>Unlocked Direct Contact Details</Text>
                </View>
                <Text style={styles.unlockedCredentialsSub}>
                  Connection established! Verified contact credentials unlocked:
                </Text>

                <View style={{ gap: 8, marginTop: 8 }}>
                  {/* Email row */}
                  <View style={styles.credentialRow}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.credentialTypeLabel}>Direct Email</Text>
                      <Text style={styles.credentialValueText} numberOfLines={1}>
                        {selectedConnection?.partner.email || 'Email not shared'}
                      </Text>
                    </View>
                    {selectedConnection?.partner.email && (
                      <TouchableOpacity
                        style={styles.credentialActionBtn}
                        onPress={() => handleOpenEmail(selectedConnection.partner.email)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.credentialActionBtnText}>Email</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Phone row */}
                  <View style={styles.credentialRow}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.credentialTypeLabel}>Direct Phone</Text>
                      <Text style={styles.credentialValueText} numberOfLines={1}>
                        {selectedConnection?.partner.phoneNumber || 'Phone not provided by member'}
                      </Text>
                    </View>
                    {selectedConnection?.partner.phoneNumber && (
                      <TouchableOpacity
                        style={styles.credentialActionBtn}
                        onPress={() => handleOpenPhone(selectedConnection.partner.phoneNumber)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.credentialActionBtnText}>Call</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Meshvi Deal Room Card */}
              <TouchableOpacity
                style={styles.dealRoomPromoCard}
                onPress={() => {
                  setSelectedConnection(null);
                  if (onNavigateTab) onNavigateTab('dealrooms');
                }}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="briefcase" size={13} color="#0369A1" style={{ marginRight: 5 }} />
                    <Text style={styles.dealRoomPromoTitle}>SETU Deal Room</Text>
                  </View>
                  <Text style={styles.dealRoomPromoSub}>
                    Milestones, mutual goals & deal closing
                  </Text>
                </View>
                <Feather name="arrow-up-right" size={15} color="#0369A1" />
              </TouchableOpacity>
            </ScrollView>

            {/* Bottom Footer Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setSelectedConnection(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Close</Text>
              </TouchableOpacity>

              {selectedConnection && (
                <TouchableOpacity
                  style={styles.exportVCardBtn}
                  onPress={() => handleExportVCard(selectedConnection)}
                  activeOpacity={0.8}
                >
                  <Feather name="download" size={13} color={MeshviColors.accent} style={{ marginRight: 5 }} />
                  <Text style={styles.exportVCardBtnText}>Export vCard</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => {
                  if (selectedConnection) {
                    const p = selectedConnection.partner;
                    setSelectedConnection(null);
                    handleOpenChat(p);
                  }
                }}
                activeOpacity={0.85}
              >
                <Feather name="message-square" size={13} color={MeshviColors.white} style={{ marginRight: 5 }} />
                <Text style={styles.modalPrimaryBtnText}>Open Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 1: ACCEPT & CONNECT DIRECTLY MODAL
         ======================================================== */}
      <Modal
        visible={Boolean(acceptModalTarget)}
        transparent
        animationType="slide"
        onRequestClose={() => setAcceptModalTarget(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '80%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  Accept Connection Proposal
                </Text>
                <Text style={styles.modalSubTitle}>
                  Inbound from: {acceptModalTarget?.requester?.profile?.displayName || acceptModalTarget?.requester?.email}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAcceptModalTarget(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={styles.acceptCelebrationBanner}>
                <Feather name="check-circle" size={18} color="#059669" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.acceptCelebrationTitle}>Unlock Bilateral Network Channel</Text>
                  <Text style={styles.acceptCelebrationText}>
                    Accepting establishes an encrypted 1st-degree partnership, unlocks direct contact credentials, and activates an enterprise Deal Room.
                  </Text>
                </View>
              </View>

              <Text style={[styles.sheetSectionTitle, { marginTop: 12 }]}>Proposal Intent</Text>
              <View style={styles.intentCalloutBox}>
                <Text style={styles.intentCalloutText}>
                  "{acceptModalTarget?.businessReason}"
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setAcceptModalTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.triageAcceptBtn}
                onPress={() => {
                  if (acceptModalTarget) handleAcceptDirect(acceptModalTarget);
                }}
                activeOpacity={0.85}
              >
                <Feather name="check-circle" size={14} color={MeshviColors.white} style={{ marginRight: 6 }} />
                <Text style={styles.triageAcceptBtnText}>Confirm & Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 2: FORWARD / DELEGATE TO COLLEAGUE MODAL
         ======================================================== */}
      <Modal
        visible={Boolean(delegateModalTarget)}
        transparent
        animationType="slide"
        onRequestClose={() => setDelegateModalTarget(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '85%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  Forward to Team Member
                </Text>
                <Text style={styles.modalSubTitle}>
                  Delegate {delegateModalTarget?.requester?.profile?.displayName}'s proposal
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDelegateModalTarget(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              <Text style={styles.fieldLabel}>Select Internal Stakeholder</Text>
              <View style={{ gap: 6, marginBottom: 12 }}>
                {COLLEAGUES_ROSTER.map((c) => {
                  const isSelected = selectedColleagueId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.colleagueSelectCard, isSelected && styles.colleagueSelectCardActive]}
                      onPress={() => setSelectedColleagueId(c.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.colleagueRadioCircle, isSelected && styles.colleagueRadioCircleActive]}>
                        {isSelected && <View style={styles.colleagueRadioDot} />}
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={[styles.colleagueName, isSelected && { color: MeshviColors.accent }]}>
                          {c.displayName}
                        </Text>
                        <Text style={styles.colleagueRole}>{c.currentTitle}</Text>
                      </View>
                      <View style={styles.tagPill}>
                        <Text style={styles.tagPillText}>{c.function}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Handover Memorandum</Text>
              <TextInput
                style={styles.modalTextArea}
                value={delegationNote}
                onChangeText={setDelegationNote}
                placeholder="Add context for why this is routed to your colleague..."
                placeholderTextColor={MeshviColors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setDelegateModalTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, isSubmittingTriage && { opacity: 0.7 }]}
                onPress={handleSubmitDelegate}
                disabled={isSubmittingTriage}
                activeOpacity={0.85}
              >
                {isSubmittingTriage ? (
                  <ActivityIndicator size="small" color={MeshviColors.white} />
                ) : (
                  <>
                    <Feather name="corner-up-right" size={13} color={MeshviColors.white} style={{ marginRight: 5 }} />
                    <Text style={styles.modalPrimaryBtnText}>Route Proposal</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 3: DECLINE WITH REASON MODAL
         ======================================================== */}
      <Modal
        visible={Boolean(declineModalTarget)}
        transparent
        animationType="slide"
        onRequestClose={() => setDeclineModalTarget(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '85%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  Decline Opportunity Request
                </Text>
                <Text style={styles.modalSubTitle}>
                  Inbound from: {declineModalTarget?.requester?.profile?.displayName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDeclineModalTarget(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              <Text style={styles.fieldLabel}>Governance Reason Code</Text>
              <View style={{ gap: 6, marginBottom: 12 }}>
                {DECLINE_REASONS.map((r) => {
                  const isSelected = declineReasonCode === r.code;
                  return (
                    <TouchableOpacity
                      key={r.code}
                      style={[styles.colleagueSelectCard, isSelected && styles.declineCardActive]}
                      onPress={() => setDeclineReasonCode(r.code)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.colleagueRadioCircle, isSelected && { borderColor: '#E11D48' }]}>
                        {isSelected && <View style={[styles.colleagueRadioDot, { backgroundColor: '#E11D48' }]} />}
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={[styles.colleagueName, isSelected && { color: '#E11D48' }]}>{r.label}</Text>
                        <Text style={styles.colleagueRole}>{r.desc}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Polite Decline Memo</Text>
              <TextInput
                style={styles.modalTextArea}
                value={declineNote}
                onChangeText={setDeclineNote}
                placeholder="Polite message to counterparty..."
                placeholderTextColor={MeshviColors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setDeclineModalTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.declineSubmitBtn, isSubmittingTriage && { opacity: 0.7 }]}
                onPress={handleSubmitDecline}
                disabled={isSubmittingTriage}
                activeOpacity={0.85}
              >
                {isSubmittingTriage ? (
                  <ActivityIndicator size="small" color={MeshviColors.white} />
                ) : (
                  <>
                    <Feather name="x-circle" size={13} color={MeshviColors.white} style={{ marginRight: 5 }} />
                    <Text style={styles.declineSubmitBtnText}>Dispatch Decline</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 4: IGNORE REQUEST MODAL
         ======================================================== */}
      <Modal
        visible={Boolean(ignoreModalTarget)}
        transparent
        animationType="slide"
        onRequestClose={() => setIgnoreModalTarget(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '60%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.modalTitle}>Archive Proposal</Text>
                <Text style={styles.modalSubTitle}>
                  Quietly archive without notification
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIgnoreModalTarget(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ marginVertical: 16 }}>
              <Text style={{ fontSize: 13, color: MeshviColors.textPrimary, lineHeight: 20 }}>
                Are you sure you want to quietly archive the request from <Text style={{ fontWeight: '800' }}>{ignoreModalTarget?.requester?.profile?.displayName || 'the requester'}</Text>?
              </Text>
              <Text style={{ fontSize: 11.5, color: MeshviColors.textSecondary, marginTop: 6, lineHeight: 16 }}>
                The proposal will be removed from your active queue. The requester will not receive an explicit decline notification.
              </Text>
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setIgnoreModalTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleSubmitIgnore}
                disabled={isSubmittingTriage}
                activeOpacity={0.85}
              >
                <Text style={styles.modalPrimaryBtnText}>Confirm Archive</Text>
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
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // 1. Header Card
  headerCard: {
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginTop: 2,
  },
  headerKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerKicker: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: MeshviColors.primary,
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: MeshviColors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
    maxWidth: '92%',
  },
  findContactsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: MeshviColors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  findContactsBtnText: {
    color: MeshviColors.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // 2. Governance Strip
  governanceCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  governanceTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  governanceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: MeshviColors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  governanceTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: MeshviColors.primary,
  },
  verifiedExecBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  verifiedExecBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4338CA',
  },
  governanceDesc: {
    fontSize: 10.5,
    color: MeshviColors.textSecondary,
    marginTop: 3,
    lineHeight: 14,
  },
  capacityBox: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 9,
    marginTop: 10,
  },
  capacityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  capacityLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
    textTransform: 'uppercase',
  },
  capacityVal: {
    fontSize: 11,
    fontWeight: '800',
    color: MeshviColors.primary,
  },
  capacityTrack: {
    height: 5,
    backgroundColor: MeshviColors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
  },
  capacityRemaining: {
    fontSize: 9.5,
    color: MeshviColors.textSecondary,
    marginTop: 4,
  },

  // 3. Three KPI Metric Cards
  kpiCardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: MeshviColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 10,
  },
  kpiCardActiveEmerald: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  kpiCardActiveAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  kpiCardActiveSky: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0284C7',
    borderWidth: 1.5,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  kpiBadgeEmerald: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 4.5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  kpiBadgeEmeraldText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#065F46',
  },
  kpiBadgeAmber: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 4.5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  kpiBadgeAmberText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  kpiBadgeSky: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 4.5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  kpiBadgeSkyText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#0369A1',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: MeshviColors.primary,
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 9.5,
    color: MeshviColors.textSecondary,
    marginTop: 2,
  },

  // 4. Tab Strip
  tabBarWrap: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 4,
    marginBottom: 10,
  },
  tabPillsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: 'transparent',
  },
  tabPillActive: {
    backgroundColor: MeshviColors.primary,
  },
  tabPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  tabPillTextActive: {
    color: MeshviColors.white,
  },
  inboundDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginLeft: 4,
  },

  // Search & View Mode
  filterControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingHorizontal: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 11.5,
    color: MeshviColors.textPrimary,
    paddingVertical: 0,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: MeshviColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 2,
  },
  viewModeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewModeBtnActive: {
    backgroundColor: MeshviColors.accent,
  },

  // Cards
  connectionCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  connCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarInitialBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: MeshviColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    color: MeshviColors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  connCardName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  tenureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tenureBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  connCardRole: {
    fontSize: 11.5,
    color: MeshviColors.textSecondary,
    marginTop: 2,
  },
  connCardCompany: {
    fontSize: 11,
    color: MeshviColors.textSecondary,
    fontWeight: '600',
  },
  businessContextCard: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 8,
    marginTop: 8,
  },
  businessContextLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: MeshviColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  businessContextText: {
    fontSize: 11,
    color: MeshviColors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 15,
  },
  unlockedContactStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  contactChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  connCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  dossierPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  dossierPillBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.primary,
  },
  iconMiniBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 6,
  },
  chatActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.white,
  },
  disconnectMiniBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Compact List Mode
  compactListWrap: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    overflow: 'hidden',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  avatarMiniBox: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: MeshviColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: MeshviColors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  compactName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  compactSub: {
    fontSize: 10.5,
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },
  compactChatBtn: {
    backgroundColor: MeshviColors.accent,
    padding: 6,
    borderRadius: 6,
  },

  // Inbound Card Styles
  inboundCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inboundCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  awaitingBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  awaitingBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
  },
  receivedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  receivedDateText: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
  },
  actionRequiredBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 7,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  actionRequiredTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400E',
  },
  actionRequiredDesc: {
    fontSize: 10,
    color: '#78350F',
    lineHeight: 14,
    marginTop: 1,
  },
  triageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  triageAcceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },
  triageAcceptBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  triageForwardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
  },
  triageForwardBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.primary,
  },
  triageDeclineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 7,
  },
  triageDeclineBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  triageIgnoreBtn: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 7,
    backgroundColor: MeshviColors.surfaceMuted,
    justifyContent: 'center',
  },
  triageIgnoreBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: MeshviColors.textSecondary,
  },

  // Outbound / Pending
  pendingTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  pendingTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: MeshviColors.textSecondary,
  },
  metaText: {
    fontSize: 10.5,
    color: MeshviColors.textSecondary,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  withdrawBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  inboundQueueNotice: {
    backgroundColor: '#FFFBEB',
    borderRadius: 9,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  inboundQueueNoticeText: {
    fontSize: 11.5,
    color: '#78350F',
  },
  inboundQueueNoticeSub: {
    fontSize: 10.5,
    color: '#92400E',
    marginTop: 2,
  },

  // Empty State
  emptyCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: MeshviColors.primary,
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 11.5,
    color: MeshviColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    maxWidth: 280,
  },

  // Modals General
  modalOverlayDark: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheetBox: {
    backgroundColor: MeshviColors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: MeshviColors.primary,
  },
  modalSubTitle: {
    fontSize: 11,
    color: MeshviColors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  sheetSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: MeshviColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  grid2x2Cell: {
    width: '48.5%',
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 8,
  },
  gridCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  gridCellLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  gridCellVal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  intentCalloutBox: {
    backgroundColor: MeshviColors.surfaceMint,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.25)',
    padding: 10,
  },
  intentCalloutText: {
    fontSize: 11.5,
    color: MeshviColors.accent,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  unlockedCredentialsCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 10,
    marginTop: 12,
  },
  unlockedCredentialsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unlockedCredentialsSub: {
    fontSize: 10.5,
    color: '#047857',
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MeshviColors.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  credentialTypeLabel: {
    fontSize: 9,
    color: MeshviColors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  credentialValueText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  credentialActionBtn: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  credentialActionBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  dealRoomPromoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 10,
    marginTop: 12,
  },
  dealRoomPromoTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0369A1',
  },
  dealRoomPromoSub: {
    fontSize: 10,
    color: '#0284C7',
    marginTop: 1,
  },
  verifiedDossierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginLeft: 6,
  },
  verifiedDossierPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#065F46',
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
  },
  modalSecondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  modalSecondaryBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalPrimaryBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  exportVCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  exportVCardBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: MeshviColors.accent,
  },
  acceptCelebrationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  acceptCelebrationTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#065F46',
  },
  acceptCelebrationText: {
    fontSize: 10.5,
    color: '#047857',
    marginTop: 2,
    lineHeight: 14,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: MeshviColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalTextArea: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: MeshviColors.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  colleagueSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    borderRadius: 8,
    padding: 9,
  },
  colleagueSelectCardActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  declineCardActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#E11D48',
  },
  colleagueRadioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: MeshviColors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colleagueRadioCircleActive: {
    borderColor: MeshviColors.accent,
  },
  colleagueRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MeshviColors.accent,
  },
  colleagueName: {
    fontSize: 12,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  colleagueRole: {
    fontSize: 10.5,
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },
  tagPill: {
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  tagPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  declineSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E11D48',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  declineSubmitBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.white,
  },
});
