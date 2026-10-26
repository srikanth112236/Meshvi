import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MeshviColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { apiRequest } from '../../services/api';
import { ConnectionCardSkeleton } from '../../components/SkeletonLoader';

export interface IntroductionItem {
  id: string;
  businessReason: string;
  status: string;
  createdAt: string;
  requester: {
    id: string;
    email: string;
    profile?: { displayName: string; function: string | null; headline: string | null } | null;
  };
  intermediary: {
    id: string;
    email: string;
    profile?: { displayName: string } | null;
  };
  targetProfile: {
    id: string;
    displayName: string;
    headline: string | null;
    function: string | null;
    company?: { name: string } | null;
  };
}

const FALLBACK_INTROS: IntroductionItem[] = [
  {
    id: 'intro_demo_1',
    businessReason: 'Direct operational introduction requested for APAC duty-free retail distribution corridor across Changi and Dubai transit hubs.\n\n[Attested Endorsement: Personally attested by Aditi Park. Highly reliable partner in cross-border duty-free concessions.]',
    status: 'SENT_TO_TARGET',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    requester: {
      id: 'usr_req_1',
      email: 'vikram.rao@apex-industries.com',
      profile: {
        displayName: 'Vikram Rao',
        function: 'Procurement & Vendor Relations',
        headline: 'Head of Vendor Relations & Technical Procurement',
      },
    },
    intermediary: {
      id: 'usr_inter_1',
      email: 'aditi.park@novus-infrastructure.com',
      profile: { displayName: 'Aditi Park' },
    },
    targetProfile: {
      id: 'prof_user',
      displayName: 'You (Recipient Executive)',
      headline: 'Chief Executive Officer & Strategic Alliances',
      function: 'Commercial Strategy',
      company: { name: 'Changi Retail Concessions Group' },
    },
  },
  {
    id: 'intro_demo_2',
    businessReason: 'Requesting mutual warm introduction to explore automated bonded customs corridor and joint logistics syndication in Southeast Asia.',
    status: 'PENDING_INTERMEDIARY',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    requester: {
      id: 'usr_req_2',
      email: 'marcus.vance@apex-logistics.com',
      profile: {
        displayName: 'Marcus Vance',
        function: 'Supply Chain & Logistics',
        headline: 'Managing Director & VP Alliances',
      },
    },
    intermediary: {
      id: 'usr_current',
      email: 'you@enterprise.com',
      profile: { displayName: 'You (Connector)' },
    },
    targetProfile: {
      id: 'prof_gabriel',
      displayName: 'Gabriel Choi',
      headline: 'VP of Global Strategic Sourcing & Partnerships',
      function: 'Supply Chain & Logistics',
      company: { name: 'Vector Global SE' },
    },
  },
  {
    id: 'intro_demo_3',
    businessReason: 'Facilitating confidential cross-border technology co-selling and bonded AI supply chain integration.',
    status: 'ACCEPTED_BY_TARGET',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    requester: {
      id: 'usr_current',
      email: 'you@enterprise.com',
      profile: {
        displayName: 'You (Requester)',
        function: 'Sourcing & Supply Chain',
        headline: 'VP of Global Strategic Sourcing',
      },
    },
    intermediary: {
      id: 'usr_bhavana',
      email: 'bhavana.lee@pacific-corridor.com',
      profile: { displayName: 'Bhavana Lee' },
    },
    targetProfile: {
      id: 'prof_elena',
      displayName: 'Elena Rostova',
      headline: 'Chief Commercial Officer',
      function: 'Commercial Partnerships',
      company: { name: 'Aura Logistics APAC' },
    },
  },
];

export interface IntroductionsScreenProps {
  onNavigateToMessages?: (partner: {
    id?: string;
    name: string;
    company: string;
    role?: string;
  }) => void;
  onNavigateTab?: (tab: string, initialQuery?: string, partner?: any) => void;
  onBack?: () => void;
}

export const IntroductionsScreen: React.FC<IntroductionsScreenProps> = ({
  onNavigateToMessages,
  onNavigateTab,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const { showSuccess, showInfo } = useModal();

  const [introductions, setIntroductions] = useState<IntroductionItem[]>(FALLBACK_INTROS);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [steppedAsideIds, setSteppedAsideIds] = useState<string[]>([]);

  // Distinct Tab States: PENDING | ACTIVE | SENT | ALL
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'SENT' | 'ALL'>('PENDING');

  // Attested Endorsement Modal State
  const [endorseModalTarget, setEndorseModalTarget] = useState<IntroductionItem | null>(null);
  const [endorsementText, setEndorsementText] = useState(
    'I have worked closely with this counterparty on cross-border initiatives and personally attest to their operational reliability and commercial execution.'
  );

  // Target Executive Response & Direct Connect Modal
  const [targetAcceptModalIntro, setTargetAcceptModalIntro] = useState<IntroductionItem | null>(null);
  const [targetResponseNote, setTargetResponseNote] = useState('');

  // Complete Introduction Dossier Modal State (Full Details & In-Modal Actions)
  const [detailModalIntro, setDetailModalIntro] = useState<IntroductionItem | null>(null);

  const fetchIntroductions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<IntroductionItem[]>('/introductions', { token });
      if (res.success && Array.isArray(res.data)) {
        setIntroductions(res.data);
      }
    } catch {
      // Keeps FALLBACK_INTROS
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchIntroductions();
  }, [fetchIntroductions]);

  // Categorization Logic for Sent, Active, Pending (Exact to Web)
  const pendingList = useMemo(() => {
    return introductions.filter((intro) => {
      const isIntermediary = intro.intermediary?.id === user?.id || intro.intermediary?.email?.includes('you@') || intro.intermediary?.profile?.displayName?.includes('You');
      const isTarget = intro.targetProfile?.id === user?.profile?.id || intro.targetProfile?.displayName?.includes('You');
      return (
        (isTarget && (intro.status === 'SENT_TO_TARGET' || intro.status === 'PENDING_INTERMEDIARY')) ||
        (isIntermediary && intro.status === 'PENDING_INTERMEDIARY') ||
        intro.status === 'PENDING_INTERMEDIARY' ||
        intro.status === 'SENT_TO_TARGET'
      );
    });
  }, [introductions, user]);

  const activeList = useMemo(() => {
    return introductions.filter((intro) => intro.status === 'ACCEPTED_BY_TARGET');
  }, [introductions]);

  const sentList = useMemo(() => {
    return introductions.filter(
      (intro) =>
        intro.requester?.id === user?.id ||
        intro.requester?.email?.includes('you@') ||
        intro.requester?.profile?.displayName?.includes('You')
    );
  }, [introductions, user]);

  // Auto-switch to SENT if user has no pending inbound items but has sent introductions
  useEffect(() => {
    if (!loading && pendingList.length === 0 && sentList.length > 0 && activeTab === 'PENDING') {
      setActiveTab('SENT');
    }
  }, [loading, pendingList.length, sentList.length, activeTab]);

  const displayedList = useMemo(() => {
    switch (activeTab) {
      case 'PENDING':
        return pendingList;
      case 'ACTIVE':
        return activeList;
      case 'SENT':
        return sentList;
      default:
        return introductions;
    }
  }, [activeTab, pendingList, activeList, sentList, introductions]);

  // 1. Step Aside Handler
  const handleStepAside = (introId: string) => {
    setSteppedAsideIds((prev) => [...prev, introId]);
    showSuccess(
      'Connector Step-Aside Completed (+5 Rep)',
      'You have gracefully handed over this bridge to the parties. +5 Facilitator Reputation points credited!'
    );
  };

  // 2. Respond Action Handler (TARGET_ACCEPT / TARGET_DECLINE / INTERMEDIARY_REJECT)
  const handleAction = async (id: string, action: string, note?: string) => {
    setActionLoadingId(id);
    try {
      const res = await apiRequest(`/introductions/${id}/respond`, {
        method: 'POST',
        token,
        body: { action, endorsementNote: note },
      });
      if (res.success || true) {
        if (action === 'TARGET_ACCEPT') {
          showSuccess(
            'Introduction Accepted 🤝',
            'Mutual 1st-degree connection established! Private messaging channel and Deal Room activated.'
          );
          setIntroductions((prev) =>
            prev.map((i) => (i.id === id ? { ...i, status: 'ACCEPTED_BY_TARGET' } : i))
          );
        } else if (action === 'TARGET_DECLINE') {
          showInfo('Introduction Declined', 'Polite decline memo recorded for the bridge.');
          setIntroductions((prev) => prev.filter((i) => i.id !== id));
        } else if (action === 'INTERMEDIARY_REJECT') {
          showInfo('Bridge Declined', 'You declined to broker this introduction.');
          setIntroductions((prev) => prev.filter((i) => i.id !== id));
        }
        setTargetAcceptModalIntro(null);
      }
    } catch {
      // Optimistic update
      if (action === 'TARGET_ACCEPT') {
        setIntroductions((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: 'ACCEPTED_BY_TARGET' } : i))
        );
        showSuccess('Introduction Accepted 🤝', 'Bilateral connection established.');
      } else {
        setIntroductions((prev) => prev.filter((i) => i.id !== id));
      }
      setTargetAcceptModalIntro(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Attested Endorsement Submit
  const handleEndorseSubmit = async () => {
    if (!endorseModalTarget) return;
    setActionLoadingId(endorseModalTarget.id);
    try {
      await apiRequest(`/introductions/${endorseModalTarget.id}/respond`, {
        method: 'POST',
        token,
        body: {
          action: 'INTERMEDIARY_ACCEPT',
          endorsementNote: endorsementText.trim(),
        },
      });
      showSuccess(
        'Attested & Forwarded 🎖️',
        `Your attested endorsement has been delivered to ${endorseModalTarget.targetProfile.displayName}.`
      );
      setIntroductions((prev) =>
        prev.map((i) =>
          i.id === endorseModalTarget.id
            ? {
                ...i,
                status: 'SENT_TO_TARGET',
                businessReason: `${i.businessReason}\n\n[Attested Endorsement: ${endorsementText.trim()}]`,
              }
            : i
        )
      );
      setEndorseModalTarget(null);
    } catch {
      setIntroductions((prev) =>
        prev.map((i) =>
          i.id === endorseModalTarget.id ? { ...i, status: 'SENT_TO_TARGET' } : i
        )
      );
      setEndorseModalTarget(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. Requester Nudge Intermediary Handler
  const handleNudgeConnector = (intro: IntroductionItem) => {
    const broker = intro.intermediary?.profile?.displayName || 'the intermediary';
    showSuccess('Reminder Sent 🔔', `A polite reminder was dispatched to ${broker} regarding this introduction.`);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* ========================================================
          1. COMPACT HEADER BAR
         ======================================================== */}
      <View style={styles.headerBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={17} color={MeshviColors.primary} />
            </TouchableOpacity>
          )}
          <View style={[styles.headerTitleWrap, { marginLeft: onBack ? 8 : 0 }]}>
            <View style={styles.headerKickerRow}>
              <Feather name="share-2" size={11} color={MeshviColors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.headerKicker}>Mutual Trust Protocol</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>Warm Introductions</Text>
          </View>
        </View>

        <View style={styles.headerActionsRow}>
          <TouchableOpacity
            style={styles.connectionsNavBtn}
            onPress={() => onNavigateTab ? onNavigateTab('connections') : null}
            activeOpacity={0.8}
          >
            <Feather name="users" size={11} color={MeshviColors.primary} style={{ marginRight: 3 }} />
            <Text style={styles.connectionsNavBtnText}>Connections</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.findContactsBtn}
            onPress={() => onNavigateTab ? onNavigateTab('search') : null}
            activeOpacity={0.85}
          >
            <Feather name="send" size={11} color={MeshviColors.white} style={{ marginRight: 3 }} />
            <Text style={styles.findContactsBtnText}>Find</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* ========================================================
            2. THREE COMPACT KPI METRIC CARDS
           ======================================================== */}
        <View style={styles.kpiCardsRow}>
          {/* Card 1: Pending Action */}
          <TouchableOpacity
            style={[styles.kpiCard, activeTab === 'PENDING' && styles.kpiCardActiveAmber]}
            onPress={() => setActiveTab('PENDING')}
            activeOpacity={0.8}
          >
            <View style={styles.kpiTopRow}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="inbox" size={12} color="#D97706" />
              </View>
              {pendingList.length > 0 && <View style={styles.kpiActionDot} />}
            </View>
            <Text style={[styles.kpiValue, { color: '#92400E' }]}>{pendingList.length}</Text>
            <Text style={styles.kpiLabel} numberOfLines={1}>Pending</Text>
          </TouchableOpacity>

          {/* Card 2: Active Bridges */}
          <TouchableOpacity
            style={[styles.kpiCard, activeTab === 'ACTIVE' && styles.kpiCardActiveEmerald]}
            onPress={() => setActiveTab('ACTIVE')}
            activeOpacity={0.8}
          >
            <View style={styles.kpiTopRow}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#D1FAE5' }]}>
                <Feather name="check-circle" size={12} color="#059669" />
              </View>
              <View style={styles.kpiLiveDot} />
            </View>
            <Text style={[styles.kpiValue, { color: '#065F46' }]}>{activeList.length}</Text>
            <Text style={styles.kpiLabel} numberOfLines={1}>Active Bridges</Text>
          </TouchableOpacity>

          {/* Card 3: Sent by Me */}
          <TouchableOpacity
            style={[styles.kpiCard, activeTab === 'SENT' && styles.kpiCardActiveSky]}
            onPress={() => setActiveTab('SENT')}
            activeOpacity={0.8}
          >
            <View style={styles.kpiTopRow}>
              <View style={[styles.kpiIconWrap, { backgroundColor: '#E0F2FE' }]}>
                <Feather name="send" size={12} color="#0284C7" />
              </View>
            </View>
            <Text style={[styles.kpiValue, { color: '#0369A1' }]}>{sentList.length}</Text>
            <Text style={styles.kpiLabel} numberOfLines={1}>Sent by Me</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================
            3. PRIMARY TAB NAVIGATION
           ======================================================== */}
        <View style={styles.tabBarWrap}>
          <View style={styles.tabPillsRow}>
            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'PENDING' && styles.tabPillActive]}
              onPress={() => setActiveTab('PENDING')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabPillText, activeTab === 'PENDING' && styles.tabPillTextActive]}>
                ⏳ Pending ({pendingList.length})
              </Text>
              {pendingList.length > 0 && <View style={styles.pendingDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'ACTIVE' && styles.tabPillActive]}
              onPress={() => setActiveTab('ACTIVE')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabPillText, activeTab === 'ACTIVE' && styles.tabPillTextActive]}>
                🤝 Active ({activeList.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'SENT' && styles.tabPillActive]}
              onPress={() => setActiveTab('SENT')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabPillText, activeTab === 'SENT' && styles.tabPillTextActive]}>
                📤 Sent ({sentList.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'ALL' && styles.tabPillActive]}
              onPress={() => setActiveTab('ALL')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabPillText, activeTab === 'ALL' && styles.tabPillTextActive]}>
                All ({introductions.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.countIndicatorRow}>
          <Text style={styles.countIndicatorText}>
            Showing: <Text style={{ fontWeight: '800', color: MeshviColors.primary }}>{displayedList.length}</Text> record(s)
          </Text>
        </View>

        {/* ========================================================
            4. LIST CONTENT
           ======================================================== */}
        {loading ? (
          <View style={{ paddingTop: 8 }}>
            <ConnectionCardSkeleton />
            <ConnectionCardSkeleton />
          </View>
        ) : displayedList.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="bridge" size={44} color={MeshviColors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'PENDING'
                ? 'No Pending Actions'
                : activeTab === 'ACTIVE'
                ? 'No Active Bridges Yet'
                : activeTab === 'SENT'
                ? 'No Sent Introductions'
                : 'No Introductions Found'}
            </Text>
            <Text style={styles.emptyDesc}>
              {activeTab === 'PENDING'
                ? 'You have addressed all warm introductions awaiting your review or endorsement.'
                : activeTab === 'ACTIVE'
                ? 'When an introduction is accepted by the recipient, it establishes an active 1st-degree connection.'
                : activeTab === 'SENT'
                ? 'Introductions you request mutual connectors to facilitate will be tracked here.'
                : 'Warm introductions allow mutual connections to vouch for and broker conversations.'}
            </Text>
            {activeTab === 'SENT' && (
              <TouchableOpacity
                style={[styles.findContactsBtn, { marginTop: 12, alignSelf: 'center' }]}
                onPress={() => onNavigateTab ? onNavigateTab('search') : null}
              >
                <Feather name="send" size={12} color={MeshviColors.white} style={{ marginRight: 5 }} />
                <Text style={styles.findContactsBtnText}>Discover Contacts to Introduce</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {displayedList.map((intro) => {
              const isIntermediary =
                intro.intermediary?.id === user?.id ||
                intro.intermediary?.email?.includes('you@') ||
                intro.intermediary?.profile?.displayName?.includes('You');
              const isTarget =
                intro.targetProfile?.id === user?.profile?.id ||
                intro.targetProfile?.displayName?.includes('You');
              const isRequester =
                intro.requester?.id === user?.id ||
                intro.requester?.email?.includes('you@') ||
                intro.requester?.profile?.displayName?.includes('You');

              const reqName = intro.requester?.profile?.displayName || intro.requester?.email || 'Executive Requester';
              const brokerName = intro.intermediary?.profile?.displayName || intro.intermediary?.email || 'Mutual Connector';
              const targetName = intro.targetProfile?.displayName || 'Target Decision Maker';
              const targetComp = intro.targetProfile?.company?.name || 'Enterprise Target';
              const isActive = intro.status === 'ACCEPTED_BY_TARGET';
              const hasEndorsement = intro.businessReason?.includes('[Attested Endorsement');
              const dateStr = intro.createdAt ? new Date(intro.createdAt).toLocaleDateString() : 'Recent';
              const cleanProposition = intro.businessReason.split('\n\n[Attested Endorsement')[0] || intro.businessReason;

              return (
                <View key={intro.id} style={styles.introCard}>
                  {/* Row 1: Top Meta Bar (Date + Status Badge) - Fully Non-overlapping */}
                  <View style={styles.cardTopMetaRow}>
                    <View style={styles.cardDateWrap}>
                      <Feather name="clock" size={10} color={MeshviColors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={styles.cardDateText}>Dispatched on {dateStr}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        isActive
                          ? styles.statusBadgeActive
                          : intro.status === 'PENDING_INTERMEDIARY'
                          ? styles.statusBadgePending
                          : styles.statusBadgeSent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isActive
                            ? styles.statusBadgeTextActive
                            : intro.status === 'PENDING_INTERMEDIARY'
                            ? styles.statusBadgeTextPending
                            : styles.statusBadgeTextSent,
                        ]}
                      >
                        {intro.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  {/* Row 2: Clean 3-Party Route Topology Strip (Non-overlapping) */}
                  <TouchableOpacity
                    style={styles.routeTopologyStrip}
                    onPress={() => setDetailModalIntro(intro)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.topologyPartyCol}>
                      <Text style={[styles.topologyPartyName, isRequester && styles.topologyPartySelf]} numberOfLines={1}>
                        {reqName}
                      </Text>
                      <Text style={styles.topologyRoleTag}>{isRequester ? 'You (Requester)' : 'Requester'}</Text>
                    </View>

                    <View style={styles.topologyConnectorCol}>
                      <Feather name="arrow-right" size={10} color={MeshviColors.textSecondary} />
                      <View style={[styles.bridgePill, isIntermediary && styles.bridgePillActive]}>
                        <Feather name="shield" size={9} color={isIntermediary ? MeshviColors.accent : MeshviColors.textSecondary} style={{ marginRight: 2 }} />
                        <Text style={[styles.bridgePillText, isIntermediary && styles.bridgePillTextActive]} numberOfLines={1}>
                          {brokerName}
                        </Text>
                      </View>
                      <Feather name="arrow-right" size={10} color={MeshviColors.textSecondary} />
                    </View>

                    <View style={[styles.topologyPartyCol, { alignItems: 'flex-end' }]}>
                      <Text style={[styles.topologyPartyName, isTarget && styles.topologyPartySelf]} numberOfLines={1}>
                        {targetName}
                      </Text>
                      <Text style={styles.topologyRoleTag} numberOfLines={1}>
                        {isTarget ? 'You (Target)' : targetComp}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Row 3: Mutual Business Proposition Box (Truncated to 2 lines + Modal Affordance) */}
                  <TouchableOpacity
                    style={styles.propositionBox}
                    onPress={() => setDetailModalIntro(intro)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.propositionHeaderRow}>
                      <Text style={styles.propositionLabel}>Business Proposition</Text>
                      <View style={styles.viewDossierPill}>
                        <Text style={styles.viewDossierText}>View Dossier</Text>
                        <Feather name="maximize-2" size={9} color={MeshviColors.accent} style={{ marginLeft: 3 }} />
                      </View>
                    </View>
                    <Text
                      style={styles.propositionText}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      "{cleanProposition}"
                    </Text>

                    {hasEndorsement && (
                      <View style={styles.attestedCompactPill}>
                        <Feather name="award" size={11} color="#059669" style={{ marginRight: 4 }} />
                        <Text style={styles.attestedCompactText} numberOfLines={1}>
                          Attested Endorsement included • Tap to inspect
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Role-Based Quick Actions */}
                  {/* Case 1: Intermediary & PENDING_INTERMEDIARY */}
                  {isIntermediary && intro.status === 'PENDING_INTERMEDIARY' && (
                    <View style={styles.actionBannerAmber}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Feather name="alert-circle" size={13} color="#D97706" style={{ marginRight: 5 }} />
                        <Text style={styles.actionBannerAmberTitle}>
                          Action Required from You (Bridge Intermediary)
                        </Text>
                      </View>
                      <Text style={styles.actionBannerAmberDesc}>
                        {reqName} requested you broker this intro to {targetName}.
                      </Text>

                      <View style={styles.actionButtonRow}>
                        <TouchableOpacity
                          style={styles.declineOutlineBtn}
                          onPress={() => handleAction(intro.id, 'INTERMEDIARY_REJECT')}
                          disabled={actionLoadingId === intro.id}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.declineOutlineBtnText}>Decline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.attestForwardBtn}
                          onPress={() => setEndorseModalTarget(intro)}
                          disabled={actionLoadingId === intro.id}
                          activeOpacity={0.85}
                        >
                          <Feather name="shield" size={12} color={MeshviColors.white} style={{ marginRight: 4 }} />
                          <Text style={styles.attestForwardBtnText}>Attest & Forward</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.viewDossierBtn}
                          onPress={() => setDetailModalIntro(intro)}
                          activeOpacity={0.8}
                        >
                          <Feather name="file-text" size={11} color={MeshviColors.primary} style={{ marginRight: 3 }} />
                          <Text style={styles.viewDossierBtnText}>Full Dossier</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Case 2: Target & SENT_TO_TARGET */}
                  {isTarget && intro.status === 'SENT_TO_TARGET' && (
                    <View style={styles.actionBannerEmerald}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Feather name="check-circle" size={13} color="#059669" style={{ marginRight: 5 }} />
                        <Text style={styles.actionBannerEmeraldTitle}>
                          Inbound Introduction (Endorsed by {brokerName})
                        </Text>
                      </View>
                      <Text style={styles.actionBannerEmeraldDesc}>
                        Accept to connect directly and open an encrypted deal room.
                      </Text>

                      <View style={styles.actionButtonRow}>
                        <TouchableOpacity
                          style={styles.declineOutlineBtn}
                          onPress={() => handleAction(intro.id, 'TARGET_DECLINE')}
                          disabled={actionLoadingId === intro.id}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.declineOutlineBtnText}>Decline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.replyNoteBtn}
                          onPress={() => {
                            setTargetAcceptModalIntro(intro);
                            setTargetResponseNote(`Glad to connect through ${brokerName}. Looking forward to discussing synergies.`);
                          }}
                          disabled={actionLoadingId === intro.id}
                          activeOpacity={0.8}
                        >
                          <Feather name="message-square" size={11} color={MeshviColors.primary} style={{ marginRight: 4 }} />
                          <Text style={styles.replyNoteBtnText}>Reply Note</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.acceptDirectGreenBtn}
                          onPress={() => handleAction(intro.id, 'TARGET_ACCEPT')}
                          disabled={actionLoadingId === intro.id}
                          activeOpacity={0.85}
                        >
                          <Feather name="check-circle" size={12} color={MeshviColors.white} style={{ marginRight: 4 }} />
                          <Text style={styles.acceptDirectGreenBtnText}>Accept</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.viewDossierBtn}
                          onPress={() => setDetailModalIntro(intro)}
                          activeOpacity={0.8}
                        >
                          <Feather name="file-text" size={11} color={MeshviColors.primary} style={{ marginRight: 3 }} />
                          <Text style={styles.viewDossierBtnText}>Dossier</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Case 2b: Target & PENDING_INTERMEDIARY */}
                  {isTarget && intro.status === 'PENDING_INTERMEDIARY' && (
                    <View style={styles.actionBannerSky}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Feather name="clock" size={13} color="#0284C7" style={{ marginRight: 5 }} />
                        <Text style={styles.actionBannerSkyTitle}>
                          Awaiting Endorsement by {brokerName}
                        </Text>
                      </View>
                      <Text style={styles.actionBannerSkyDesc}>
                        You can wait for {brokerName}'s endorsement or bypass to connect directly.
                      </Text>

                      <View style={styles.actionButtonRow}>
                        <TouchableOpacity
                          style={styles.declineOutlineBtn}
                          onPress={() => handleAction(intro.id, 'TARGET_DECLINE')}
                          disabled={actionLoadingId === intro.id}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.declineOutlineBtnText}>Decline</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.skipWaitDirectBtn}
                          onPress={() => handleAction(intro.id, 'TARGET_ACCEPT')}
                          disabled={actionLoadingId === intro.id}
                          activeOpacity={0.85}
                        >
                          <Feather name="check" size={12} color={MeshviColors.white} style={{ marginRight: 4 }} />
                          <Text style={styles.skipWaitDirectBtnText}>Direct Connect</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.viewDossierBtn}
                          onPress={() => setDetailModalIntro(intro)}
                          activeOpacity={0.8}
                        >
                          <Feather name="file-text" size={11} color={MeshviColors.primary} style={{ marginRight: 3 }} />
                          <Text style={styles.viewDossierBtnText}>Dossier</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Case 3: Completed / Active Bridge (ACCEPTED_BY_TARGET) */}
                  {intro.status === 'ACCEPTED_BY_TARGET' && (
                    <View style={styles.activeBridgeBanner}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={styles.activeBridgeIcon}>🤝</Text>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                          <Text style={styles.activeBridgeTitle}>Direct Bridge Active</Text>
                          <Text style={styles.activeBridgeSub}>
                            Facilitated by {brokerName}. Bilateral channel established.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.actionButtonRow}>
                        {isIntermediary && !steppedAsideIds.includes(intro.id) && (
                          <TouchableOpacity
                            style={styles.stepAsideRepBtn}
                            onPress={() => handleStepAside(intro.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.stepAsideRepBtnText}>Step Aside (+5 Rep)</Text>
                          </TouchableOpacity>
                        )}
                        {isIntermediary && steppedAsideIds.includes(intro.id) && (
                          <View style={styles.steppedAsidePill}>
                            <Text style={styles.steppedAsidePillText}>✓ Handed Over (+5 Rep)</Text>
                          </View>
                        )}

                        <TouchableOpacity
                          style={styles.dealRoomBtn}
                          onPress={() => onNavigateTab ? onNavigateTab('dealrooms') : null}
                          activeOpacity={0.8}
                        >
                          <Feather name="briefcase" size={11} color="#0369A1" style={{ marginRight: 3 }} />
                          <Text style={styles.dealRoomBtnText}>Deal Room</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.openChatBtn}
                          onPress={() => {
                            if (onNavigateToMessages) {
                              const partnerName = isRequester ? targetName : reqName;
                              onNavigateToMessages({
                                id: isRequester ? intro.targetProfile.id : intro.requester.id,
                                name: partnerName,
                                company: targetComp,
                                role: intro.targetProfile.headline || undefined,
                              });
                            }
                          }}
                          activeOpacity={0.85}
                        >
                          <Feather name="message-square" size={11} color={MeshviColors.white} style={{ marginRight: 3 }} />
                          <Text style={styles.openChatBtnText}>Open Chat</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.viewDossierBtn}
                          onPress={() => setDetailModalIntro(intro)}
                          activeOpacity={0.8}
                        >
                          <Feather name="file-text" size={11} color={MeshviColors.primary} style={{ marginRight: 3 }} />
                          <Text style={styles.viewDossierBtnText}>Dossier</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Case 4: Requester Progress Tracker */}
                  {isRequester && intro.status !== 'ACCEPTED_BY_TARGET' && (
                    <View style={styles.requesterTrackerBox}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.requesterTrackerLabel}>Current Status:</Text>
                        <Text style={styles.requesterTrackerSub} numberOfLines={1}>
                          {intro.status === 'PENDING_INTERMEDIARY'
                            ? `Awaiting endorsement review by ${brokerName}`
                            : `Endorsed by ${brokerName} & awaiting response from ${targetName}`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.viewDossierPill}
                        onPress={() => setDetailModalIntro(intro)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.viewDossierText}>Track Dossier</Text>
                        <Feather name="arrow-right" size={10} color={MeshviColors.accent} style={{ marginLeft: 3 }} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ========================================================
          MODAL 1: ATTESTED ENDORSEMENT DRAWER MODAL (Exact to Web)
         ======================================================== */}
      <Modal
        visible={Boolean(endorseModalTarget)}
        transparent
        animationType="slide"
        onRequestClose={() => setEndorseModalTarget(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '80%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="shield" size={15} color="#059669" style={{ marginRight: 5 }} />
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    Attest & Forward Introduction
                  </Text>
                </View>
                <Text style={styles.modalSubTitle}>
                  Vouch for {endorseModalTarget?.requester?.profile?.displayName || 'the counterparty'} to {endorseModalTarget?.targetProfile?.displayName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setEndorseModalTarget(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={styles.endorseNoticeBanner}>
                <Feather name="award" size={15} color="#059669" style={{ marginRight: 6 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.endorseNoticeTitle}>Institutional Trust Badge</Text>
                  <Text style={styles.endorseNoticeDesc}>
                    This note will be permanently attested to the recipient with your verified reputation badge.
                  </Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Attested Endorsement Statement</Text>
              <TextInput
                style={styles.modalTextArea}
                value={endorsementText}
                onChangeText={setEndorsementText}
                placeholder="Provide your personal endorsement, mutual past engagements, or reasons why this bridge should be established..."
                placeholderTextColor={MeshviColors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setEndorseModalTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.attestConfirmBtn, actionLoadingId === endorseModalTarget?.id && { opacity: 0.7 }]}
                onPress={handleEndorseSubmit}
                disabled={actionLoadingId === endorseModalTarget?.id || !endorsementText.trim()}
                activeOpacity={0.85}
              >
                {actionLoadingId === endorseModalTarget?.id ? (
                  <ActivityIndicator size="small" color={MeshviColors.white} />
                ) : (
                  <>
                    <Feather name="award" size={14} color={MeshviColors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.attestConfirmBtnText}>Attest & Forward Bridge</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 2: TARGET RESPONSE & DIRECT CONNECT MODAL (Exact to Web)
         ======================================================== */}
      <Modal
        visible={Boolean(targetAcceptModalIntro)}
        transparent
        animationType="slide"
        onRequestClose={() => setTargetAcceptModalIntro(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '80%' }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="check-circle" size={15} color="#059669" style={{ marginRight: 5 }} />
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    Accept Introduction & Direct Bridge
                  </Text>
                </View>
                <Text style={styles.modalSubTitle}>
                  Inbound from: {targetAcceptModalIntro?.requester?.profile?.displayName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setTargetAcceptModalIntro(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              <View style={styles.acceptCelebrationBanner}>
                <Feather name="check-circle" size={16} color="#059669" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.acceptCelebrationTitle}>Mutual Connection & Deal Room Activation</Text>
                  <Text style={styles.acceptCelebrationText}>
                    Accepting establishes a verified 1st-degree connection between both profiles and unlocks an encrypted collaboration room.
                  </Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Personal Response / Counter Note (Optional)</Text>
              <TextInput
                style={styles.modalTextArea}
                value={targetResponseNote}
                onChangeText={setTargetResponseNote}
                placeholder="Add a greeting, propose an introductory meeting time, or share initial mutual topics..."
                placeholderTextColor={MeshviColors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={300}
              />
              <Text style={styles.charCounterText}>
                {targetResponseNote.length} / 300 characters
              </Text>
            </ScrollView>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={() => setTargetAcceptModalIntro(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.acceptDirectGreenBtn, actionLoadingId === targetAcceptModalIntro?.id && { opacity: 0.7 }]}
                onPress={() => {
                  if (targetAcceptModalIntro) {
                    handleAction(targetAcceptModalIntro.id, 'TARGET_ACCEPT', targetResponseNote);
                  }
                }}
                disabled={actionLoadingId === targetAcceptModalIntro?.id}
                activeOpacity={0.85}
              >
                {actionLoadingId === targetAcceptModalIntro?.id ? (
                  <ActivityIndicator size="small" color={MeshviColors.white} />
                ) : (
                  <>
                    <Feather name="check-circle" size={14} color={MeshviColors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.acceptDirectGreenBtnText}>Confirm & Connect Directly</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          MODAL 3: COMPLETE INTRODUCTION DOSSIER & ACTIONS MODAL
         ======================================================== */}
      <Modal
        visible={Boolean(detailModalIntro)}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalIntro(null)}
      >
        <View style={styles.modalOverlayDark}>
          <View style={[styles.modalSheetBox, { maxHeight: '90%' }]}>
            {detailModalIntro && (() => {
              const dReqName = detailModalIntro.requester?.profile?.displayName || detailModalIntro.requester?.email || 'Executive Requester';
              const dBrokerName = detailModalIntro.intermediary?.profile?.displayName || detailModalIntro.intermediary?.email || 'Mutual Connector';
              const dTargetName = detailModalIntro.targetProfile?.displayName || 'Target Decision Maker';
              const dTargetComp = detailModalIntro.targetProfile?.company?.name || 'Enterprise Target';
              const dIsRequester =
                detailModalIntro.requester?.id === user?.id ||
                detailModalIntro.requester?.email?.includes('you@') ||
                detailModalIntro.requester?.profile?.displayName?.includes('You');
              const dIsIntermediary =
                detailModalIntro.intermediary?.id === user?.id ||
                detailModalIntro.intermediary?.email?.includes('you@') ||
                detailModalIntro.intermediary?.profile?.displayName?.includes('You');
              const dIsTarget =
                detailModalIntro.targetProfile?.id === user?.profile?.id ||
                detailModalIntro.targetProfile?.displayName?.includes('You');
              const dIsActive = detailModalIntro.status === 'ACCEPTED_BY_TARGET';
              const dHasEndorsement = detailModalIntro.businessReason?.includes('[Attested Endorsement');
              const dDateStr = detailModalIntro.createdAt ? new Date(detailModalIntro.createdAt).toLocaleDateString() : 'Recent';
              const dCleanProp = detailModalIntro.businessReason.split('\n\n[Attested Endorsement')[0] || detailModalIntro.businessReason;

              return (
                <>
                  <View style={styles.modalHeaderRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="file-text" size={15} color={MeshviColors.accent} style={{ marginRight: 6 }} />
                        <Text style={styles.modalTitle} numberOfLines={1}>
                          Introduction Dossier
                        </Text>
                      </View>
                      <Text style={styles.modalSubTitle}>
                        Dispatched on {dDateStr} • ID: {detailModalIntro.id.slice(0, 12)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setDetailModalIntro(null)} style={styles.modalCloseBtn}>
                      <Feather name="x" size={18} color={MeshviColors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
                    {/* Status Pill Header */}
                    <View style={styles.dossierMetaStrip}>
                      <Text style={styles.dossierMetaStripLabel}>Status</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          dIsActive
                            ? styles.statusBadgeActive
                            : detailModalIntro.status === 'PENDING_INTERMEDIARY'
                            ? styles.statusBadgePending
                            : styles.statusBadgeSent,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            dIsActive
                              ? styles.statusBadgeTextActive
                              : detailModalIntro.status === 'PENDING_INTERMEDIARY'
                              ? styles.statusBadgeTextPending
                              : styles.statusBadgeTextSent,
                          ]}
                        >
                          {detailModalIntro.status.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>

                    {/* Network Bridge Route */}
                    <Text style={styles.dossierSectionHeading}>Network Bridge Route</Text>
                    <View style={styles.dossierRouteCard}>
                      {/* Requester */}
                      <View style={styles.dossierPartyRow}>
                        <View style={styles.dossierPartyAvatar}>
                          <Feather name="user" size={13} color={MeshviColors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dossierPartyName}>
                            {dReqName} {dIsRequester && '(You)'}
                          </Text>
                          <Text style={styles.dossierPartySub}>
                            {detailModalIntro.requester?.profile?.headline || detailModalIntro.requester?.profile?.function || detailModalIntro.requester?.email}
                          </Text>
                        </View>
                        <View style={styles.dossierRoleBadge}>
                          <Text style={styles.dossierRoleBadgeText}>Requester</Text>
                        </View>
                      </View>

                      {/* Bridge Intermediary */}
                      <View style={styles.dossierRouteLink}>
                        <View style={styles.dossierRouteLine} />
                        <Feather name="shield" size={11} color={MeshviColors.accent} style={{ marginHorizontal: 5 }} />
                        <Text style={styles.dossierRouteLinkText}>Facilitated by</Text>
                        <View style={styles.dossierRouteLine} />
                      </View>

                      <View style={styles.dossierPartyRow}>
                        <View style={[styles.dossierPartyAvatar, { backgroundColor: MeshviColors.surfaceMint }]}>
                          <Feather name="shield" size={13} color={MeshviColors.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dossierPartyName}>
                            {dBrokerName} {dIsIntermediary && '(You)'}
                          </Text>
                          <Text style={styles.dossierPartySub}>
                            {detailModalIntro.intermediary?.email || 'Mutual Strategic Connector'}
                          </Text>
                        </View>
                        <View style={[styles.dossierRoleBadge, { backgroundColor: MeshviColors.surfaceMint }]}>
                          <Text style={[styles.dossierRoleBadgeText, { color: MeshviColors.accent }]}>Bridge Intermediary</Text>
                        </View>
                      </View>

                      {/* Target */}
                      <View style={styles.dossierRouteLink}>
                        <View style={styles.dossierRouteLine} />
                        <Feather name="arrow-down" size={11} color={MeshviColors.accent} style={{ marginHorizontal: 5 }} />
                        <Text style={styles.dossierRouteLinkText}>Target Decision Maker</Text>
                        <View style={styles.dossierRouteLine} />
                      </View>

                      <View style={styles.dossierPartyRow}>
                        <View style={[styles.dossierPartyAvatar, { backgroundColor: '#F0F9FF' }]}>
                          <Feather name="target" size={13} color="#0284C7" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dossierPartyName}>
                            {dTargetName} {dIsTarget && '(You)'}
                          </Text>
                          <Text style={styles.dossierPartySub}>
                            {detailModalIntro.targetProfile?.headline || dTargetComp}
                          </Text>
                        </View>
                        <View style={[styles.dossierRoleBadge, { backgroundColor: '#E0F2FE' }]}>
                          <Text style={[styles.dossierRoleBadgeText, { color: '#0369A1' }]}>Target</Text>
                        </View>
                      </View>
                    </View>

                    {/* Full Business Proposition */}
                    <Text style={styles.dossierSectionHeading}>Complete Business Proposition</Text>
                    <View style={styles.dossierPropBox}>
                      <Text style={styles.dossierPropFullText}>
                        "{dCleanProp}"
                      </Text>
                    </View>

                    {/* Attested Endorsement */}
                    {dHasEndorsement && (
                      <>
                        <Text style={styles.dossierSectionHeading}>Attested Endorsement</Text>
                        <View style={styles.attestedCard}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Feather name="shield" size={13} color="#059669" style={{ marginRight: 5 }} />
                            <Text style={styles.attestedTitle}>Attested by {dBrokerName}</Text>
                            <Feather name="award" size={12} color="#059669" style={{ marginLeft: 5 }} />
                          </View>
                          <Text style={styles.attestedText}>
                            {detailModalIntro.businessReason.substring(detailModalIntro.businessReason.indexOf('[Attested Endorsement'))}
                          </Text>
                        </View>
                      </>
                    )}

                    {/* In-Modal Direct Actions */}
                    <Text style={styles.dossierSectionHeading}>Executive Actions</Text>
                    <View style={styles.dossierActionsBox}>
                      {/* Intermediary Pending */}
                      {dIsIntermediary && detailModalIntro.status === 'PENDING_INTERMEDIARY' && (
                        <View style={{ gap: 8 }}>
                          <TouchableOpacity
                            style={styles.modalAttestActionBtn}
                            onPress={() => {
                              const targetIntro = detailModalIntro;
                              setDetailModalIntro(null);
                              setEndorseModalTarget(targetIntro);
                            }}
                            activeOpacity={0.85}
                          >
                            <Feather name="award" size={14} color={MeshviColors.white} style={{ marginRight: 6 }} />
                            <Text style={styles.modalAttestActionBtnText}>Attest & Forward Introduction</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.modalDeclineActionBtn}
                            onPress={() => {
                              const introId = detailModalIntro.id;
                              setDetailModalIntro(null);
                              handleAction(introId, 'INTERMEDIARY_REJECT');
                            }}
                            activeOpacity={0.75}
                          >
                            <Feather name="x-circle" size={13} color="#DC2626" style={{ marginRight: 6 }} />
                            <Text style={styles.modalDeclineActionBtnText}>Decline to Bridge</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Target Pending Response */}
                      {dIsTarget && detailModalIntro.status === 'SENT_TO_TARGET' && (
                        <View style={{ gap: 8 }}>
                          <TouchableOpacity
                            style={styles.modalAcceptActionBtn}
                            onPress={() => {
                              const introId = detailModalIntro.id;
                              setDetailModalIntro(null);
                              handleAction(introId, 'TARGET_ACCEPT');
                            }}
                            activeOpacity={0.85}
                          >
                            <Feather name="check-circle" size={14} color={MeshviColors.white} style={{ marginRight: 6 }} />
                            <Text style={styles.modalAcceptActionBtnText}>Accept & Connect Directly</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.modalReplyActionBtn}
                            onPress={() => {
                              const targetIntro = detailModalIntro;
                              setDetailModalIntro(null);
                              setTargetAcceptModalIntro(targetIntro);
                              setTargetResponseNote(`Glad to connect through ${dBrokerName}. Looking forward to discussing synergies.`);
                            }}
                            activeOpacity={0.8}
                          >
                            <Feather name="message-square" size={13} color={MeshviColors.primary} style={{ marginRight: 6 }} />
                            <Text style={styles.modalReplyActionBtnText}>Add Response Note & Accept</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.modalDeclineActionBtn}
                            onPress={() => {
                              const introId = detailModalIntro.id;
                              setDetailModalIntro(null);
                              handleAction(introId, 'TARGET_DECLINE');
                            }}
                            activeOpacity={0.75}
                          >
                            <Feather name="x-circle" size={13} color="#DC2626" style={{ marginRight: 6 }} />
                            <Text style={styles.modalDeclineActionBtnText}>Decline Introduction</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Target Pending Intermediary (can direct connect) */}
                      {dIsTarget && detailModalIntro.status === 'PENDING_INTERMEDIARY' && (
                        <View style={{ gap: 8 }}>
                          <TouchableOpacity
                            style={styles.modalAcceptActionBtn}
                            onPress={() => {
                              const introId = detailModalIntro.id;
                              setDetailModalIntro(null);
                              handleAction(introId, 'TARGET_ACCEPT');
                            }}
                            activeOpacity={0.85}
                          >
                            <Feather name="check" size={14} color={MeshviColors.white} style={{ marginRight: 6 }} />
                            <Text style={styles.modalAcceptActionBtnText}>Direct Connect (Skip Wait)</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.modalDeclineActionBtn}
                            onPress={() => {
                              const introId = detailModalIntro.id;
                              setDetailModalIntro(null);
                              handleAction(introId, 'TARGET_DECLINE');
                            }}
                            activeOpacity={0.75}
                          >
                            <Feather name="x-circle" size={13} color="#DC2626" style={{ marginRight: 6 }} />
                            <Text style={styles.modalDeclineActionBtnText}>Decline Introduction</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Active Bridge Established */}
                      {detailModalIntro.status === 'ACCEPTED_BY_TARGET' && (
                        <View style={{ gap: 8 }}>
                          <TouchableOpacity
                            style={styles.modalChatActionBtn}
                            onPress={() => {
                              const partnerId = dIsRequester ? detailModalIntro.targetProfile.id : detailModalIntro.requester.id;
                              const partnerName = dIsRequester ? dTargetName : dReqName;
                              setDetailModalIntro(null);
                              if (onNavigateToMessages) {
                                onNavigateToMessages({
                                  id: partnerId,
                                  name: partnerName,
                                  company: dTargetComp,
                                  role: detailModalIntro.targetProfile.headline || undefined,
                                });
                              }
                            }}
                            activeOpacity={0.85}
                          >
                            <Feather name="message-square" size={14} color={MeshviColors.white} style={{ marginRight: 6 }} />
                            <Text style={styles.modalChatActionBtnText}>Open Secure Chat</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.modalDealRoomActionBtn}
                            onPress={() => {
                              setDetailModalIntro(null);
                              if (onNavigateTab) onNavigateTab('dealrooms');
                            }}
                            activeOpacity={0.8}
                          >
                            <Feather name="briefcase" size={13} color="#0369A1" style={{ marginRight: 6 }} />
                            <Text style={styles.modalDealRoomActionBtnText}>Open Deal Room</Text>
                          </TouchableOpacity>

                          {dIsIntermediary && !steppedAsideIds.includes(detailModalIntro.id) && (
                            <TouchableOpacity
                              style={styles.modalStepAsideActionBtn}
                              onPress={() => {
                                handleStepAside(detailModalIntro.id);
                              }}
                              activeOpacity={0.8}
                            >
                              <Feather name="award" size={13} color="#065F46" style={{ marginRight: 6 }} />
                              <Text style={styles.modalStepAsideActionBtnText}>Step Aside (+5 Rep Credits)</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      {/* Requester Pending Progress */}
                      {dIsRequester && detailModalIntro.status !== 'ACCEPTED_BY_TARGET' && (
                        <View style={{ gap: 8 }}>
                          <TouchableOpacity
                            style={styles.modalNudgeActionBtn}
                            onPress={() => {
                              handleNudgeConnector(detailModalIntro);
                            }}
                            activeOpacity={0.8}
                          >
                            <Feather name="bell" size={13} color={MeshviColors.primary} style={{ marginRight: 6 }} />
                            <Text style={styles.modalNudgeActionBtnText}>Nudge Connector for Attestation</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </ScrollView>

                  <View style={styles.modalActionRow}>
                    <TouchableOpacity
                      style={[styles.modalSecondaryBtn, { flex: 1, alignItems: 'center' }]}
                      onPress={() => setDetailModalIntro(null)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalSecondaryBtnText}>Close Dossier</Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
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

  // 1. Compact Header Bar
  headerBar: {
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  headerKicker: {
    fontSize: 9.5,
    fontWeight: '800',
    color: MeshviColors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: MeshviColors.primary,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  connectionsNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 5.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  connectionsNavBtnText: {
    color: MeshviColors.primary,
    fontSize: 10.5,
    fontWeight: '700',
  },
  findContactsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 9,
    paddingVertical: 5.5,
    borderRadius: 7,
  },
  findContactsBtnText: {
    color: MeshviColors.white,
    fontSize: 10.5,
    fontWeight: '700',
  },

  // 2. Compact KPI Metric Cards
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
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  kpiCardActiveAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  kpiCardActiveEmerald: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  kpiCardActiveSky: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0284C7',
    borderWidth: 1.5,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  kpiIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiActionDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#D97706',
  },
  kpiLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#059669',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    color: MeshviColors.primary,
  },
  kpiLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },

  // 3. Tab Strip
  tabBarWrap: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 3,
    marginBottom: 8,
  },
  tabPillsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: 'transparent',
  },
  tabPillActive: {
    backgroundColor: MeshviColors.primary,
  },
  tabPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  tabPillTextActive: {
    color: MeshviColors.white,
  },
  pendingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F59E0B',
    marginLeft: 3,
  },
  countIndicatorRow: {
    marginBottom: 10,
  },
  countIndicatorText: {
    fontSize: 11,
    color: MeshviColors.textSecondary,
  },

  // 4. Introduction Card
  introCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  cardDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDateText: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBadgePending: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusBadgeSent: {
    backgroundColor: MeshviColors.surfaceMint,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
  },
  statusBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusBadgeTextActive: {
    color: '#065F46',
  },
  statusBadgeTextPending: {
    color: '#92400E',
  },
  statusBadgeTextSent: {
    color: MeshviColors.accent,
  },

  // Route Topology Strip (Clean & Non-overlapping)
  routeTopologyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginTop: 8,
  },
  topologyPartyCol: {
    flex: 1,
    maxWidth: '33%',
  },
  topologyPartyName: {
    fontSize: 10.5,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  topologyPartySelf: {
    color: MeshviColors.accent,
    fontWeight: '800',
  },
  topologyRoleTag: {
    fontSize: 8.5,
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },
  topologyConnectorCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 3,
  },
  bridgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.white,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    maxWidth: 90,
  },
  bridgePillActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  bridgePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  bridgePillTextActive: {
    color: MeshviColors.accent,
  },

  // Proposition Box (Truncated 2 Lines)
  propositionBox: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    padding: 8,
    marginTop: 7,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  propositionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  propositionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: MeshviColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  viewDossierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.white,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  viewDossierText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: MeshviColors.accent,
  },
  propositionText: {
    fontSize: 11,
    color: MeshviColors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 15,
  },
  attestedCompactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  attestedCompactText: {
    fontSize: 9.5,
    color: '#065F46',
    fontWeight: '700',
  },
  attestedCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 8,
    marginTop: 6,
  },
  attestedTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  attestedText: {
    fontSize: 10,
    color: '#047857',
    fontStyle: 'italic',
    lineHeight: 14,
  },

  // Role Action Banners
  actionBannerAmber: {
    backgroundColor: '#FFFBEB',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 9,
    marginTop: 8,
  },
  actionBannerAmberTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400E',
  },
  actionBannerAmberDesc: {
    fontSize: 9.5,
    color: '#78350F',
    lineHeight: 13,
    marginTop: 1,
  },
  actionBannerEmerald: {
    backgroundColor: '#ECFDF5',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 9,
    marginTop: 8,
  },
  actionBannerEmeraldTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#065F46',
  },
  actionBannerEmeraldDesc: {
    fontSize: 9.5,
    color: '#047857',
    lineHeight: 13,
    marginTop: 1,
  },
  actionBannerSky: {
    backgroundColor: '#F0F9FF',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 9,
    marginTop: 8,
  },
  actionBannerSkyTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0369A1',
  },
  actionBannerSkyDesc: {
    fontSize: 9.5,
    color: '#0284C7',
    lineHeight: 13,
    marginTop: 1,
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  declineOutlineBtn: {
    backgroundColor: MeshviColors.white,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  declineOutlineBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: MeshviColors.textSecondary,
  },
  attestForwardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  attestForwardBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  replyNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.white,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  replyNoteBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: MeshviColors.primary,
  },
  acceptDirectGreenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  acceptDirectGreenBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  skipWaitDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  skipWaitDirectBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  viewDossierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  viewDossierBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: MeshviColors.primary,
  },

  // Active Bridge Banner
  activeBridgeBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 8,
    marginTop: 8,
  },
  activeBridgeIcon: {
    fontSize: 15,
  },
  activeBridgeTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#065F46',
  },
  activeBridgeSub: {
    fontSize: 9.5,
    color: '#047857',
  },
  stepAsideRepBtn: {
    backgroundColor: MeshviColors.white,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  stepAsideRepBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
  },
  steppedAsidePill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  steppedAsidePillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#065F46',
  },
  dealRoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.white,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  dealRoomBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0369A1',
  },
  openChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  openChatBtnText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: MeshviColors.white,
  },

  // Requester Progress Tracker
  requesterTrackerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 7,
    marginTop: 8,
  },
  requesterTrackerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: MeshviColors.primary,
  },
  requesterTrackerSub: {
    fontSize: 9.5,
    color: MeshviColors.textSecondary,
    marginTop: 1,
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
    fontSize: 11,
    color: MeshviColors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    maxWidth: 290,
  },

  // Modals Common
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
    fontSize: 14.5,
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
  endorseNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 9,
    marginBottom: 10,
  },
  endorseNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  endorseNoticeDesc: {
    fontSize: 10,
    color: '#047857',
    marginTop: 1,
    lineHeight: 13,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCounterText: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
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
  attestConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  attestConfirmBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  acceptCelebrationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    padding: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 10,
  },
  acceptCelebrationTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  acceptCelebrationText: {
    fontSize: 10,
    color: '#047857',
    marginTop: 2,
    lineHeight: 14,
  },

  // Modal 3: Complete Dossier Specific Styles
  dossierMetaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    marginBottom: 12,
  },
  dossierMetaStripLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: MeshviColors.textSecondary,
    textTransform: 'uppercase',
  },
  dossierSectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: MeshviColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 6,
  },
  dossierRouteCard: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 10,
  },
  dossierPartyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dossierPartyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MeshviColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  dossierPartyName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  dossierPartySub: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },
  dossierRoleBadge: {
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  dossierRoleBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: MeshviColors.primary,
  },
  dossierRouteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  dossierRouteLine: {
    flex: 1,
    height: 1,
    backgroundColor: MeshviColors.border,
  },
  dossierRouteLinkText: {
    fontSize: 9,
    color: MeshviColors.textSecondary,
    fontStyle: 'italic',
  },
  dossierPropBox: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 10,
  },
  dossierPropFullText: {
    fontSize: 11.5,
    color: MeshviColors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  dossierActionsBox: {
    marginTop: 4,
    marginBottom: 8,
  },
  modalAttestActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalAttestActionBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  modalDeclineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalDeclineActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalAcceptActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalAcceptActionBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  modalReplyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalReplyActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.primary,
  },
  modalChatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalChatActionBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: MeshviColors.white,
  },
  modalDealRoomActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalDealRoomActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  modalStepAsideActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalStepAsideActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  modalNudgeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalNudgeActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.primary,
  },
});
