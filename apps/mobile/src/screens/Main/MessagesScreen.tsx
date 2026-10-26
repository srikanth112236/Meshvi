import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Share,
  Clipboard,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MeshviColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { apiRequest } from '../../services/api';
import {
  createGoogleMeetSession,
  openGoogleMeet,
  openGoogleCalendar,
  shareMeetingInvite,
  copyMeetingInviteToClipboard,
  generateGoogleMeetCode,
} from '../../services/googleMeetService';

export interface MessageAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'deck' | 'rfp';
  url?: string;
  previewUrl?: string;
}

export interface MessageMeeting {
  id?: string;
  title: string;
  datetime: string;
  duration: string;
  meetCode?: string;
  meetUrl?: string;
  googleCalendarUrl?: string;
  status?: 'Confirmed' | 'Pending' | 'Completed';
  platform?: string;
}

export interface MessageItem {
  id: string;
  body: string;
  senderUserId: string;
  senderName: string;
  createdAt: string;
  isMine: boolean;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  editedAt?: string;
  isEdited?: boolean;
  deletedAt?: string;
  isDeleted?: boolean;
  replyQuote?: {
    senderName: string;
    text: string;
  };
  attachment?: MessageAttachment;
  meeting?: MessageMeeting;
  isForwarded?: boolean;
}

export interface ActiveDealSync {
  id: string;
  title: string;
  status: string;
  dealValue?: string;
  corridor?: string;
  currentMilestone: string;
  progressPercent: number;
  milestones: { title: string; completed: boolean }[];
}

export interface ConversationItem {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerRole: string;
  partnerCompany: string;
  partnerAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  onlineStatus?: 'ONLINE' | 'OFFLINE' | 'IN_MEETING';
  ndaStatus?: 'SIGNED' | 'MUTUAL_REVIEW';
  activeDeal?: ActiveDealSync;
}

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv-elena',
    partnerId: 'usr-elena-01',
    partnerName: 'Elena Rostova',
    partnerRole: 'Chief Commercial Officer',
    partnerCompany: 'Aura Logistics APAC',
    partnerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'I have uploaded the mutual NDA countersignature to the Deal Room.',
    lastMessageTime: '12m ago',
    unreadCount: 1,
    online: true,
    onlineStatus: 'ONLINE',
    ndaStatus: 'SIGNED',
    activeDeal: {
      id: 'deal-elena-01',
      title: 'Cross-Border Bonded Warehouse Distribution Agreement',
      status: 'TERMS_ALIGNMENT',
      dealValue: '$450,000 / Year',
      corridor: 'ASEAN - Singapore - Dubai Hub',
      currentMilestone: 'Milestone 2: Technical API Integration & Sourcing Audit',
      progressPercent: 65,
      milestones: [
        { title: 'Mutual NDA & Compliance Attestation Executed', completed: true },
        { title: 'Technical HACCP & Quality Specifications Verified', completed: true },
        { title: 'Commercial Pricing Bands & Delivery Terms Alignment', completed: false },
        { title: 'Master Service Agreement (MSA) Escrow Execution', completed: false },
      ],
    },
  },
  {
    id: 'conv-vikram',
    partnerId: 'usr-vikram-02',
    partnerName: 'Vikram Sethi',
    partnerRole: 'VP Corporate Strategy & M&A',
    partnerCompany: 'Vertex Nexus Global',
    partnerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'Looking forward to reviewing the secondary liquidity term sheet tomorrow.',
    lastMessageTime: '2h ago',
    unreadCount: 0,
    online: true,
    onlineStatus: 'IN_MEETING',
    ndaStatus: 'MUTUAL_REVIEW',
    activeDeal: {
      id: 'deal-vikram-02',
      title: 'Institutional Trade Liquidity Accord',
      status: 'LEGAL_REVIEW',
      dealValue: '$50,000,000 Facility',
      corridor: 'Direct Institutional Corridor',
      currentMilestone: 'Milestone 1: Escrow Protocol & Legal Review',
      progressPercent: 35,
      milestones: [
        { title: 'Mutual NDA & Corporate Lineage Verification', completed: true },
        { title: 'Escrow Protocol & Legal Review', completed: false },
        { title: 'Liquidity Facility Allocation Agreement', completed: false },
      ],
    },
  },
  {
    id: 'conv-sarah',
    partnerId: 'usr-sarah-03',
    partnerName: 'Sarah Jenkins',
    partnerRole: 'Director of Strategic Sourcing',
    partnerCompany: 'Novus Retail Group',
    partnerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    lastMessage: 'Our procurement team approved the bilateral exploratory agenda.',
    lastMessageTime: '1d ago',
    unreadCount: 0,
    online: false,
    onlineStatus: 'OFFLINE',
    ndaStatus: 'SIGNED',
    activeDeal: {
      id: 'deal-sarah-03',
      title: 'Retail Channel Vendor Qualification Fast-Track',
      status: 'PROCUREMENT_ACTIVE',
      dealValue: '$1,200,000 Pipeline',
      corridor: 'ASEAN Modern Trade Corridor',
      currentMilestone: 'Milestone 3: Modern Trade Shelf Placement',
      progressPercent: 80,
      milestones: [
        { title: 'Vendor Prequalification Audit', completed: true },
        { title: 'Logistics SLA & Price Band Alignment', completed: true },
        { title: 'Modern Trade Shelf Placement', completed: false },
      ],
    },
  },
];

const INITIAL_MESSAGES_MAP: Record<string, MessageItem[]> = {
  'conv-elena': [
    {
      id: 'm1',
      body: 'Hello Rajiv, our commercial alliances committee has reviewed your cross-border supply chain orchestration mandate.',
      senderUserId: 'usr-elena-01',
      senderName: 'Elena Rostova',
      createdAt: '10:14 AM',
      isMine: false,
      status: 'READ',
      sentAt: '10:14:02 AM',
      deliveredAt: '10:14:05 AM',
      readAt: '10:14:22 AM',
    },
    {
      id: 'm2',
      body: 'Excellent Elena. We have 450+ verified enterprise buyer accounts ready to route through your 8 APAC bonded warehouse hubs.',
      senderUserId: 'me',
      senderName: 'Rajiv Menon',
      createdAt: '10:18 AM',
      isMine: true,
      status: 'READ',
      sentAt: '10:18:10 AM',
      deliveredAt: '10:18:12 AM',
      readAt: '10:18:30 AM',
    },
    {
      id: 'm3',
      body: 'Here is our mutual bilateral NDA and data attestation agreement with cryptographic hash verification.',
      senderUserId: 'usr-elena-01',
      senderName: 'Elena Rostova',
      createdAt: '10:22 AM',
      isMine: false,
      status: 'READ',
      sentAt: '10:22:04 AM',
      deliveredAt: '10:22:06 AM',
      readAt: '10:22:15 AM',
      attachment: {
        name: 'Aura_Meshvi_Bilateral_NDA_Executed.pdf',
        size: '1.4 MB',
        type: 'pdf',
      },
    },
    {
      id: 'm4',
      body: 'I have uploaded the mutual NDA countersignature to the Deal Room.',
      senderUserId: 'usr-elena-01',
      senderName: 'Elena Rostova',
      createdAt: '10:25 AM',
      isMine: false,
      status: 'READ',
      sentAt: '10:25:00 AM',
      deliveredAt: '10:25:02 AM',
      readAt: '10:25:18 AM',
    },
  ],
  'conv-vikram': [
    {
      id: 'mv1',
      body: 'Hi Rajiv, following up on our discussion regarding the $50M liquidity deployment facility for corporate JV distribution infrastructure.',
      senderUserId: 'usr-vikram-02',
      senderName: 'Vikram Sethi',
      createdAt: 'Yesterday',
      isMine: false,
      status: 'READ',
    },
    {
      id: 'mv2',
      body: 'Looking forward to reviewing the secondary liquidity term sheet tomorrow.',
      senderUserId: 'usr-vikram-02',
      senderName: 'Vikram Sethi',
      createdAt: '08:45 AM',
      isMine: false,
      status: 'READ',
    },
  ],
  'conv-sarah': [
    {
      id: 'ms1',
      body: 'Our procurement team approved the bilateral exploratory agenda.',
      senderUserId: 'usr-sarah-03',
      senderName: 'Sarah Jenkins',
      createdAt: 'Oct 24',
      isMine: false,
      status: 'READ',
    },
  ],
};

const QUICK_REPLIES = [
  'Approved bilateral agenda ✓',
  'Countersigned in Deal Room',
  'Available for 1-click slot lock',
  'Reviewing technical compliance',
  'Please share the NDA draft',
];

const PRESET_ATTACHMENTS: MessageAttachment[] = [
  { name: 'Commercial_RFP_Specification_Tier1.pdf', size: '2.4 MB', type: 'rfp' },
  { name: 'Executive_Investor_Deck_Q3.pdf', size: '4.8 MB', type: 'deck' },
  { name: 'Mutual_Bilateral_NDA_Attestation.pdf', size: '1.2 MB', type: 'pdf' },
  { name: 'Technical_HACCP_ISO_Compliance.pdf', size: '1.6 MB', type: 'doc' },
  { name: 'Regional_Facility_Node_Diagram.png', size: '3.1 MB', type: 'image' },
];

export interface MessagesScreenProps {
  targetPartner?: {
    id?: string;
    name: string;
    company: string;
    role?: string;
    avatar?: string;
  } | null;
  onClearTargetPartner?: () => void;
  onNavigateTab?: (tab: string, initialQuery?: string, partner?: any) => void;
  onBack?: () => void;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({
  targetPartner,
  onClearTargetPartner,
  onNavigateTab,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const { showSuccess, showConfirm, showInfo } = useModal();

  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, MessageItem[]>>(INITIAL_MESSAGES_MAP);
  const [inputDraft, setInputDraft] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Staged Attachment & Reply Quotes
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; senderName: string; text: string } | null>(null);

  // Modals
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedMessageForAction, setSelectedMessageForAction] = useState<MessageItem | null>(null);
  const [showMsgInfoModal, setShowMsgInfoModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportNote, setReportNote] = useState('');
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string } | null>(null);

  // Google Meet & Calendar Meeting Form
  const [meetingTitle, setMeetingTitle] = useState('Commercial Partnership Synchronization');
  const [meetingDatePreset, setMeetingDatePreset] = useState<'TODAY' | 'TOMORROW' | 'NEXT_MON'>('TOMORROW');
  const [meetingTimeSlot, setMeetingTimeSlot] = useState('02:00 PM');
  const [meetingDuration, setMeetingDuration] = useState('30 Mins');
  const [activeMeetCode, setActiveMeetCode] = useState('qmv-rtws-kpa');

  const scrollViewRef = useRef<any>(null);

  // Dynamic targeting from Search or Connections
  useEffect(() => {
    if (targetPartner) {
      const existing = conversations.find(
        (c) =>
          c.partnerName.toLowerCase() === targetPartner.name.toLowerCase() ||
          (targetPartner.id && c.partnerId === targetPartner.id)
      );

      if (existing) {
        setActiveConvId(existing.id);
      } else {
        const newId = `conv-${Date.now()}`;
        const newConv: ConversationItem = {
          id: newId,
          partnerId: targetPartner.id || `usr-${Date.now()}`,
          partnerName: targetPartner.name,
          partnerRole: targetPartner.role || 'Executive Decision Maker',
          partnerCompany: targetPartner.company,
          partnerAvatar:
            targetPartner.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          lastMessage: 'Bilateral communication corridor initialized.',
          lastMessageTime: 'Just now',
          unreadCount: 0,
          online: true,
          onlineStatus: 'ONLINE',
          ndaStatus: 'MUTUAL_REVIEW',
          activeDeal: {
            id: `deal-${Date.now()}`,
            title: `Bilateral Sourcing Accord with ${targetPartner.company}`,
            status: 'SCOPE_ALIGNMENT',
            dealValue: '$350,000 Initial Pipeline',
            corridor: 'Direct Verified Corridor',
            currentMilestone: 'Milestone 1: Commercial Scope Alignment',
            progressPercent: 25,
            milestones: [
              { title: 'Commercial Scope Alignment', completed: false },
              { title: 'Volume Banding & Logistics SLA', completed: false },
            ],
          },
        };
        setConversations((prev) => [newConv, ...prev]);
        setMessagesMap((prev) => ({
          ...prev,
          [newId]: [
            {
              id: `msg-${Date.now()}`,
              body: `Hello ${user?.profile?.displayName || 'Rajiv'}, I received your bilateral introductory mandate regarding our enterprise distribution scope.`,
              senderUserId: targetPartner.id || 'target-partner',
              senderName: targetPartner.name,
              createdAt: 'Just now',
              isMine: false,
              status: 'READ',
            },
          ],
        }));
        setActiveConvId(newId);
      }
    }
  }, [targetPartner]);

  // Scroll to bottom on message change
  useEffect(() => {
    if (activeConvId) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [activeConvId, messagesMap, partnerTyping]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Sync real backend messages for active conversation
  const fetchBackendMessages = useCallback(async (convId: string) => {
    if (!token || !convId || convId.startsWith('conv-conn-')) return;
    try {
      const res = await apiRequest<any[]>(`/conversations/${convId}/messages`, {
        method: 'GET',
        token,
      });

      if (res.success && Array.isArray(res.data)) {
        setMessagesMap((prev) => {
          const currentList = prev[convId] || [];
          const serverIds = new Set(res.data!.map((m: any) => m.id));
          const pendingLocal = currentList.filter(
            (m) => m.isMine && !serverIds.has(m.id) && m.id.startsWith('m-')
          );

          const mapped: MessageItem[] = res.data!.map((m: any) => {
            const isMine = m.senderUserId === user?.id || m.isMine === true;
            let meeting: MessageMeeting | undefined = undefined;
            if (m.meeting) {
              meeting = m.meeting;
            } else if (m.meetingPayloadJson) {
              try {
                meeting =
                  typeof m.meetingPayloadJson === 'string'
                    ? JSON.parse(m.meetingPayloadJson)
                    : m.meetingPayloadJson;
              } catch {
                // Ignore parse errors
              }
            }

            let attachment: MessageAttachment | undefined = undefined;
            if (m.attachmentName || m.attachmentUrl) {
              attachment = {
                name: m.attachmentName || 'Attested_Document',
                url: m.attachmentUrl || '',
                type: 'doc',
                size: 'Attested Media',
              };
            }

            return {
              id: m.id,
              body: m.body || '',
              senderUserId: m.senderUserId,
              senderName: isMine ? 'You' : m.sender?.name || activeConv?.partnerName || 'Partner',
              createdAt: m.createdAt
                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now',
              isMine,
              status: isMine ? (m.status || 'READ') : undefined,
              meeting,
              attachment,
            };
          });

          return {
            ...prev,
            [convId]: [...mapped, ...pendingLocal],
          };
        });
      }
    } catch {
      // Fallback
    }
  }, [token, user?.id, activeConv?.partnerName]);

  useEffect(() => {
    if (activeConvId) {
      fetchBackendMessages(activeConvId);
      const interval = setInterval(() => {
        fetchBackendMessages(activeConvId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeConvId, fetchBackendMessages]);

  const currentMessages = activeConvId ? messagesMap[activeConvId] || [] : [];

  // Send Message (Text or Attachment or Meeting)
  const handleSendMessage = (textToSend?: string, attachmentToSend?: MessageAttachment, meetingToSend?: MessageMeeting) => {
    const text = (textToSend !== undefined ? textToSend : inputDraft).trim();
    const attach = attachmentToSend || pendingAttachment;
    if ((!text && !attach && !meetingToSend) || !activeConvId) return;

    const newMsgId = `m-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: MessageItem = {
      id: newMsgId,
      body: text,
      senderUserId: 'me',
      senderName: user?.profile?.displayName || 'You',
      createdAt: timeStr,
      isMine: true,
      status: 'SENT',
      sentAt: timeStr,
      replyQuote: replyingTo ? { senderName: replyingTo.senderName, text: replyingTo.text } : undefined,
      attachment: attach || undefined,
      meeting: meetingToSend || undefined,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }));

    setInputDraft('');
    setPendingAttachment(null);
    setReplyingTo(null);

    // Update conversation snippet
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              lastMessage: attach ? `Sent file: ${attach.name}` : meetingToSend ? `Meeting: ${meetingToSend.title}` : text,
              lastMessageTime: 'Just now',
              unreadCount: 0,
            }
          : c
      )
    );

    // Progressive delivery simulation: SENT -> DELIVERED -> READ
    setTimeout(() => {
      setMessagesMap((prev) => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map((m) =>
          m.id === newMsgId ? { ...m, status: 'DELIVERED', deliveredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m
        ),
      }));
    }, 600);

    setTimeout(() => {
      setMessagesMap((prev) => ({
        ...prev,
        [activeConvId]: (prev[activeConvId] || []).map((m) =>
          m.id === newMsgId ? { ...m, status: 'READ', readAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m
        ),
      }));
    }, 1300);

    // Call API if connected
    if (token) {
      apiRequest(`/conversations/${activeConvId}/messages`, {
        method: 'POST',
        token,
        body: {
          body: text,
          messageType: meetingToSend ? 'MEETING_INVITE' : attach ? 'PROPOSAL' : 'TEXT',
          attachmentUrl: attach?.url,
          attachmentName: attach?.name,
          meetingPayloadJson: meetingToSend ? JSON.stringify(meetingToSend) : undefined,
        },
      })
        .then(() => {
          fetchBackendMessages(activeConvId);
        })
        .catch(() => {});
    }
  };

  // Open Schedule Google Meet Modal
  const handleOpenScheduleMeeting = () => {
    setActiveMeetCode(generateGoogleMeetCode());
    setShowMeetingModal(true);
  };

  // Schedule Google Meet & Calendar Submit
  const handleSendMeetingInvite = () => {
    if (!meetingTitle.trim() || !activeConvId) return;

    const session = createGoogleMeetSession({
      title: meetingTitle.trim(),
      datePreset: meetingDatePreset,
      timeSlot: meetingTimeSlot,
      durationStr: meetingDuration,
      partnerName: activeConv?.partnerName,
    });

    const meeting: MessageMeeting = {
      title: session.title,
      datetime: session.datetime,
      duration: session.duration,
      meetCode: session.meetCode,
      meetUrl: session.meetUrl,
      googleCalendarUrl: session.googleCalendarUrl,
      status: 'Confirmed',
      platform: 'Google Meet',
    };

    handleSendMessage(`🎥 Google Meet Scheduled: "${session.title}" on ${session.datetime}`, undefined, meeting);
    setShowMeetingModal(false);
    showSuccess('Google Meet Dispatched', `Meeting link & Calendar invite sent to ${activeConv?.partnerName}.`);
  };

  // Copy Message Text
  const handleCopyText = (text: string) => {
    Clipboard.setString(text);
    setSelectedMessageForAction(null);
    showInfo('Copied', 'Message copied to clipboard.');
  };

  // Forward Message Submit
  const handleForwardToConversation = (targetConv: ConversationItem) => {
    if (!selectedMessageForAction) return;
    const newMsg: MessageItem = {
      ...selectedMessageForAction,
      id: `fwd-${Date.now()}`,
      createdAt: 'Just now',
      isMine: true,
      isForwarded: true,
      status: 'SENT',
    };
    setMessagesMap((prev) => ({
      ...prev,
      [targetConv.id]: [...(prev[targetConv.id] || []), newMsg],
    }));
    setShowForwardModal(false);
    setSelectedMessageForAction(null);
    showSuccess('Message Forwarded', `Forwarded to ${targetConv.partnerName}.`);
  };

  // Edit Message Submit
  const handleSaveEdit = () => {
    if (!editingMessage || !activeConvId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).map((m) =>
        m.id === editingMessage.id ? { ...m, body: editingMessage.text, isEdited: true } : m
      ),
    }));
    setEditingMessage(null);
    showInfo('Message Edited', 'Message has been updated.');
  };

  // Delete Message Submit
  const handleDeleteMessage = (msgId: string) => {
    if (!activeConvId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeConvId]: (prev[activeConvId] || []).filter((m) => m.id !== msgId),
    }));
    setSelectedMessageForAction(null);
    showInfo('Message Deleted', 'Message removed from thread.');
  };

  // Report & Block User Submit
  const handleReportAndBlock = () => {
    if (!activeConv) return;
    showSuccess(
      'User Reported',
      `Report filed for ${activeConv.partnerName} (${reportReason}). Counterparty removed from priority queues.`
    );
    setShowReportModal(false);
    setActiveConvId(null);
  };

  // Filter Conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(
      (c) =>
        c.partnerName.toLowerCase().includes(q) ||
        c.partnerCompany.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // ==========================================================
  // VIEW 1: ACTIVE CONVERSATION CORRIDOR
  // ==========================================================
  if (activeConvId && activeConv) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: Math.max(insets.top, 10), paddingBottom: Math.max(insets.bottom, 6) }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Chat Header Bar (Exact Web Replica) */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setActiveConvId(null);
              if (onClearTargetPartner) onClearTargetPartner();
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={18} color={MeshviColors.primary} />
          </TouchableOpacity>

          <View style={styles.chatHeaderInfo}>
            <View style={styles.avatarInitialSmall}>
              <Text style={styles.avatarInitialSmallText}>
                {activeConv.partnerName[0]?.toUpperCase() || 'P'}
              </Text>
              {activeConv.online && <View style={styles.onlineDotHeader} />}
            </View>

            <View style={{ flex: 1, minWidth: 0, marginLeft: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.chatPartnerName} numberOfLines={1}>
                  {activeConv.partnerName}
                </Text>
                <Feather name="shield" size={11} color={MeshviColors.accent} style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.chatPartnerSub} numberOfLines={1}>
                {activeConv.partnerRole} • {activeConv.partnerCompany}
              </Text>
            </View>
          </View>

          {/* Header Action Shortcuts */}
          <View style={styles.chatHeaderActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleOpenScheduleMeeting}
              activeOpacity={0.7}
            >
              <Feather name="video" size={15} color={MeshviColors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={handleOpenScheduleMeeting}
              activeOpacity={0.7}
            >
              <Feather name="calendar" size={14} color={MeshviColors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => setShowReportModal(true)}
              activeOpacity={0.7}
            >
              <Feather name="more-vertical" size={15} color={MeshviColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Message Stream */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Security Clearance Note */}
          <View style={styles.securityNoteCard}>
            <Feather name="lock" size={12} color="#059669" style={{ marginRight: 6 }} />
            <Text style={styles.securityNoteText}>
              Encrypted B2B Channel. Messages, agendas, and files are protected under bilateral NDA protocols.
            </Text>
          </View>

          {currentMessages.map((msg) => {
            const isMine = msg.isMine;

            return (
              <TouchableOpacity
                key={msg.id}
                style={[styles.msgRow, isMine ? styles.msgRowMine : styles.msgRowPartner]}
                onLongPress={() => setSelectedMessageForAction(msg)}
                activeOpacity={0.92}
              >
                {!isMine && (
                  <View style={styles.partnerAvatarMsg}>
                    <Text style={styles.partnerAvatarMsgText}>
                      {activeConv.partnerName[0]?.toUpperCase() || 'P'}
                    </Text>
                  </View>
                )}

                <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubblePartner]}>
                  {/* Quoted Reply Banner */}
                  {msg.replyQuote && (
                    <View style={[styles.quoteBanner, isMine ? styles.quoteBannerMine : styles.quoteBannerPartner]}>
                      <Text style={[styles.quoteSenderName, isMine && { color: MeshviColors.surfaceMint }]}>
                        {msg.replyQuote.senderName}
                      </Text>
                      <Text style={[styles.quoteSnippet, isMine && { color: '#E2E8F0' }]} numberOfLines={1}>
                        "{msg.replyQuote.text}"
                      </Text>
                    </View>
                  )}

                  {/* Forwarded Tag */}
                  {msg.isForwarded && (
                    <View style={styles.forwardedRow}>
                      <Feather name="corner-up-right" size={9} color={isMine ? '#CBD5E1' : MeshviColors.textSecondary} />
                      <Text style={[styles.forwardedText, isMine && { color: '#CBD5E1' }]}>Forwarded</Text>
                    </View>
                  )}

                  {/* Body Text */}
                  {Boolean(msg.body) && (
                    <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextPartner]}>
                      {msg.body}
                    </Text>
                  )}

                  {/* Attachment Card */}
                  {msg.attachment && (
                    <TouchableOpacity
                      style={[styles.attachCard, isMine ? styles.attachCardMine : styles.attachCardPartner]}
                      onPress={() => Share.share({ title: msg.attachment?.name, message: `Attachment: ${msg.attachment?.name} (${msg.attachment?.size})` })}
                      activeOpacity={0.8}
                    >
                      <Feather
                        name="file-text"
                        size={18}
                        color={isMine ? MeshviColors.white : MeshviColors.accent}
                        style={{ marginRight: 8 }}
                      />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[styles.attachName, isMine ? styles.attachTextWhite : styles.attachTextDark]} numberOfLines={1}>
                          {msg.attachment.name}
                        </Text>
                        <Text style={[styles.attachMeta, isMine ? styles.attachMetaWhite : styles.attachMetaDark]}>
                          {msg.attachment.size} • {msg.attachment.type.toUpperCase()}
                        </Text>
                      </View>
                      <Feather name="download" size={14} color={isMine ? MeshviColors.white : MeshviColors.accent} />
                    </TouchableOpacity>
                  )}

                  {/* Interactive Google Meet & Calendar Meeting Card */}
                  {msg.meeting && (
                    <View style={[styles.meetingCard, isMine ? styles.meetingCardMine : styles.meetingCardPartner]}>
                      {/* Platform & Status Header */}
                      <View style={styles.meetingHeaderRow}>
                        <View style={styles.meetBrandingPill}>
                          <MaterialCommunityIcons name="video" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.meetBrandingText}>Google Meet</Text>
                        </View>
                        <View style={styles.meetingStatusPill}>
                          <Text style={styles.meetingStatusText}>
                            {msg.meeting.status || 'Confirmed'}
                          </Text>
                        </View>
                      </View>

                      {/* Title & Timing */}
                      <Text style={[styles.meetingTitle, isMine && { color: '#FFFFFF' }]}>{msg.meeting.title}</Text>
                      <View style={styles.meetingTimeRow}>
                        <Feather name="clock" size={11} color={isMine ? '#E2E8F0' : '#059669'} style={{ marginRight: 4 }} />
                        <Text style={[styles.meetingTime, isMine && { color: '#E2E8F0' }]}>
                          {msg.meeting.datetime} • {msg.meeting.duration}
                        </Text>
                      </View>

                      {/* Google Meet Link Display Box */}
                      {msg.meeting.meetUrl && (
                        <View style={[styles.meetUrlContainer, isMine && { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)' }]}>
                          <MaterialCommunityIcons name="link-variant" size={13} color={isMine ? '#FFFFFF' : '#0F766E'} style={{ marginRight: 6 }} />
                          <Text style={[styles.meetUrlText, isMine && { color: '#FFFFFF' }]} numberOfLines={1}>{msg.meeting.meetUrl}</Text>
                          <TouchableOpacity
                            onPress={() => {
                              copyMeetingInviteToClipboard(msg.meeting!.meetUrl || '');
                              showSuccess('Link Copied', 'Google Meet link copied to clipboard.');
                            }}
                            style={styles.meetCopyBtn}
                            activeOpacity={0.7}
                          >
                            <Feather name="copy" size={12} color={isMine ? '#FFFFFF' : '#0F766E'} />
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Primary Actions: Join Google Meet & Add to Calendar */}
                      <View style={styles.meetingPrimaryActionsRow}>
                        {msg.meeting.meetUrl && (
                          <TouchableOpacity
                            style={styles.joinMeetBtn}
                            onPress={() => openGoogleMeet(msg.meeting!.meetUrl!)}
                            activeOpacity={0.85}
                          >
                            <MaterialCommunityIcons name="video" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                            <Text style={styles.joinMeetBtnText}>Join Google Meet</Text>
                          </TouchableOpacity>
                        )}

                        {msg.meeting.googleCalendarUrl && (
                          <TouchableOpacity
                            style={styles.addToGCalBtn}
                            onPress={() => openGoogleCalendar(msg.meeting!.googleCalendarUrl!)}
                            activeOpacity={0.85}
                          >
                            <Feather name="calendar" size={12} color="#0F172A" style={{ marginRight: 4 }} />
                            <Text style={styles.addToGCalBtnText}>Add to Calendar</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Secondary Actions: Share Across & Copy Full Invitation */}
                      <View style={[styles.meetingSecondaryActionsRow, isMine && { borderTopColor: 'rgba(255, 255, 255, 0.2)' }]}>
                        <TouchableOpacity
                          style={styles.meetingSecondaryBtn}
                          onPress={() =>
                            shareMeetingInvite({
                              title: msg.meeting!.title,
                              datetime: msg.meeting!.datetime,
                              duration: msg.meeting!.duration,
                              meetUrl: msg.meeting!.meetUrl || '',
                              googleCalendarUrl: msg.meeting!.googleCalendarUrl,
                              partnerName: activeConv?.partnerName || 'Partner',
                            })
                          }
                          activeOpacity={0.7}
                        >
                          <Feather name="share-2" size={11} color={isMine ? '#E2E8F0' : MeshviColors.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={[styles.meetingSecondaryBtnText, isMine && { color: '#E2E8F0' }]}>Share Across</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.meetingSecondaryBtn}
                          onPress={() => {
                            copyMeetingInviteToClipboard({
                              title: msg.meeting!.title,
                              datetime: msg.meeting!.datetime,
                              duration: msg.meeting!.duration,
                              meetUrl: msg.meeting!.meetUrl || '',
                              googleCalendarUrl: msg.meeting!.googleCalendarUrl,
                            });
                            showSuccess('Invite Copied', 'Full invitation details copied to clipboard.');
                          }}
                          activeOpacity={0.7}
                        >
                          <Feather name="clipboard" size={11} color={isMine ? '#E2E8F0' : MeshviColors.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={[styles.meetingSecondaryBtnText, isMine && { color: '#E2E8F0' }]}>Copy Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Timestamp & Delivery Status */}
                  <View style={styles.bubbleMetaRow}>
                    <Text style={[styles.metaTime, isMine ? styles.metaTimeMine : styles.metaTimePartner]}>
                      {msg.createdAt} {msg.isEdited ? '• (edited)' : ''}
                    </Text>
                    {isMine && (
                      <View style={{ marginLeft: 4 }}>
                        {msg.status === 'READ' ? (
                          <Feather name="check-circle" size={11} color="#A7F3D0" />
                        ) : msg.status === 'DELIVERED' ? (
                          <Feather name="check" size={11} color="#CBD5E1" />
                        ) : (
                          <Feather name="clock" size={11} color="#94A3B8" />
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Partner Typing Indicator */}
          {partnerTyping && (
            <View style={styles.typingRow}>
              <View style={styles.partnerAvatarMsg}>
                <Text style={styles.partnerAvatarMsgText}>{activeConv.partnerName[0]?.toUpperCase()}</Text>
              </View>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>{activeConv.partnerName} is typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Replies Strip (Exact Web Feature) */}
        <View style={styles.quickRepliesStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {QUICK_REPLIES.map((reply) => (
              <TouchableOpacity
                key={reply}
                style={styles.quickReplyChip}
                onPress={() => handleSendMessage(reply)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Staged Reply Banner */}
        {replyingTo && (
          <View style={styles.replyingDraftBanner}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.replyingDraftLabel}>Replying to {replyingTo.senderName}</Text>
              <Text style={styles.replyingDraftText} numberOfLines={1}>"{replyingTo.text}"</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={14} color={MeshviColors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Staged Attachment Banner */}
        {pendingAttachment && (
          <View style={styles.stagedAttachBanner}>
            <Feather name="file" size={14} color={MeshviColors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.stagedAttachName} numberOfLines={1}>
              {pendingAttachment.name} ({pendingAttachment.size})
            </Text>
            <TouchableOpacity onPress={() => setPendingAttachment(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={14} color={MeshviColors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Compose Input Bar (Exact Web Replica) */}
        <View style={[styles.composeBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => setShowAttachModal(true)}
            activeOpacity={0.7}
          >
            <Feather name="paperclip" size={16} color={MeshviColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachBtn}
            onPress={handleOpenScheduleMeeting}
            activeOpacity={0.7}
          >
            <Feather name="calendar" size={16} color={MeshviColors.textSecondary} />
          </TouchableOpacity>

          <TextInput
            style={styles.composeInput}
            value={inputDraft}
            onChangeText={setInputDraft}
            placeholder="Type an encrypted message..."
            placeholderTextColor={MeshviColors.textSecondary}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (inputDraft.trim().length > 0 || pendingAttachment !== null) && styles.sendBtnActive,
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputDraft.trim() && !pendingAttachment}
            activeOpacity={0.85}
          >
            <Feather
              name="send"
              size={15}
              color={inputDraft.trim().length > 0 || pendingAttachment !== null ? MeshviColors.white : MeshviColors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* ========================================================
            MODAL A: ATTACHMENT PICKER MODAL
           ======================================================== */}
        <Modal
          visible={showAttachModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAttachModal(false)}
        >
          <View style={styles.modalOverlayDark}>
            <View style={styles.modalSheetBox}>
              <View style={styles.modalHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Share Enterprise Document</Text>
                  <Text style={styles.modalSubTitle}>Verified B2B attachments with checksum logging</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAttachModal(false)} style={styles.modalCloseBtn}>
                  <Feather name="x" size={18} color={MeshviColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 8, marginTop: 12 }}>
                {PRESET_ATTACHMENTS.map((att) => (
                  <TouchableOpacity
                    key={att.name}
                    style={styles.attachmentOptionRow}
                    onPress={() => {
                      setPendingAttachment(att);
                      setShowAttachModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.attachIconSquare}>
                      <Feather name="file-text" size={16} color={MeshviColors.accent} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                      <Text style={styles.attachOptionName} numberOfLines={1}>{att.name}</Text>
                      <Text style={styles.attachOptionMeta}>{att.size} • Verified Format</Text>
                    </View>
                    <Feather name="plus-circle" size={16} color={MeshviColors.accent} />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.modalActionRow, { marginTop: 14 }]}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => setShowAttachModal(false)}
                >
                  <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ========================================================
            MODAL B: SCHEDULE VIDEO MEETING (Google Meet & Calendar)
           ======================================================== */}
        <Modal
          visible={showMeetingModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMeetingModal(false)}
        >
          <View style={styles.modalOverlayDark}>
            <View style={styles.modalSheetBox}>
              <View style={styles.modalHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Schedule Video Meeting</Text>
                  <Text style={styles.modalSubTitle}>Google Meet & Calendar Integration</Text>
                </View>
                <TouchableOpacity onPress={() => setShowMeetingModal(false)} style={styles.modalCloseBtn}>
                  <Feather name="x" size={18} color={MeshviColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.fieldLabel}>Meeting Agenda / Title</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={meetingTitle}
                    onChangeText={setMeetingTitle}
                    placeholder="e.g. Commercial Partnership Synchronization"
                    placeholderTextColor={MeshviColors.textSecondary}
                  />

                  {/* Date Presets */}
                  <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Date</Text>
                  <View style={styles.modalPresetRow}>
                    {[
                      { key: 'TODAY', label: 'Today' },
                      { key: 'TOMORROW', label: 'Tomorrow' },
                      { key: 'NEXT_MON', label: 'Next Monday' },
                    ].map((d) => (
                      <TouchableOpacity
                        key={d.key}
                        style={[styles.modalPresetChip, meetingDatePreset === d.key && styles.modalPresetChipActive]}
                        onPress={() => setMeetingDatePreset(d.key as any)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.modalPresetChipText, meetingDatePreset === d.key && styles.modalPresetChipTextActive]}>
                          {d.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Time Slots */}
                  <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Time Slot (SGT)</Text>
                  <View style={styles.modalPresetRow}>
                    {['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'].map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.modalPresetChip, meetingTimeSlot === t && styles.modalPresetChipActive]}
                        onPress={() => setMeetingTimeSlot(t)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.modalPresetChipText, meetingTimeSlot === t && styles.modalPresetChipTextActive]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Duration */}
                  <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Duration</Text>
                  <View style={styles.durationRow}>
                    {['15 Mins', '30 Mins', '45 Mins', '60 Mins'].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.durationChip, meetingDuration === d && styles.durationChipActive]}
                        onPress={() => setMeetingDuration(d)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.durationChipText, meetingDuration === d && styles.durationChipTextActive]}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Google Meet Preview Box */}
                  <View style={styles.googleMeetPreviewCard}>
                    <View style={styles.googleMeetIconBox}>
                      <MaterialCommunityIcons name="video" size={17} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.googleMeetPreviewTitle}>Google Meet Conference Room</Text>
                      <Text style={styles.googleMeetPreviewUrl}>meet.google.com/{activeMeetCode}</Text>
                      <Text style={styles.meetingSecurityText}>
                        1-Click Google Calendar event link will be generated & shared with {activeConv?.partnerName || 'partner'}.
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => setShowMeetingModal(false)}
                >
                  <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleSendMeetingInvite}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="video" size={15} color={MeshviColors.white} style={{ marginRight: 5 }} />
                  <Text style={styles.modalPrimaryBtnText}>Schedule Google Meet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ========================================================
            MODAL C: MESSAGE ACTION SHEET
           ======================================================== */}
        <Modal
          visible={Boolean(selectedMessageForAction)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMessageForAction(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlayDark}
            activeOpacity={1}
            onPress={() => setSelectedMessageForAction(null)}
          >
            <View style={styles.modalSheetBox}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Message Options</Text>
                <TouchableOpacity onPress={() => setSelectedMessageForAction(null)} style={styles.modalCloseBtn}>
                  <Feather name="x" size={18} color={MeshviColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 6, marginTop: 10 }}>
                {/* Reply */}
                <TouchableOpacity
                  style={styles.actionSheetRow}
                  onPress={() => {
                    if (selectedMessageForAction) {
                      setReplyingTo({
                        id: selectedMessageForAction.id,
                        senderName: selectedMessageForAction.senderName,
                        text: selectedMessageForAction.body,
                      });
                      setSelectedMessageForAction(null);
                    }
                  }}
                >
                  <Feather name="corner-up-left" size={16} color={MeshviColors.accent} />
                  <Text style={styles.actionSheetText}>Reply</Text>
                </TouchableOpacity>

                {/* Copy */}
                <TouchableOpacity
                  style={styles.actionSheetRow}
                  onPress={() => {
                    if (selectedMessageForAction?.body) {
                      handleCopyText(selectedMessageForAction.body);
                    }
                  }}
                >
                  <Feather name="copy" size={16} color={MeshviColors.primary} />
                  <Text style={styles.actionSheetText}>Copy Text</Text>
                </TouchableOpacity>

                {/* Forward */}
                <TouchableOpacity
                  style={styles.actionSheetRow}
                  onPress={() => {
                    setShowForwardModal(true);
                  }}
                >
                  <Feather name="corner-up-right" size={16} color={MeshviColors.primary} />
                  <Text style={styles.actionSheetText}>Forward Message</Text>
                </TouchableOpacity>

                {/* Delivery Info */}
                <TouchableOpacity
                  style={styles.actionSheetRow}
                  onPress={() => {
                    setShowMsgInfoModal(true);
                  }}
                >
                  <Feather name="info" size={16} color={MeshviColors.primary} />
                  <Text style={styles.actionSheetText}>Message Info & Delivery Audit</Text>
                </TouchableOpacity>

                {/* Edit Message (if mine) */}
                {selectedMessageForAction?.isMine && (
                  <TouchableOpacity
                    style={styles.actionSheetRow}
                    onPress={() => {
                      if (selectedMessageForAction) {
                        setEditingMessage({ id: selectedMessageForAction.id, text: selectedMessageForAction.body });
                        setSelectedMessageForAction(null);
                      }
                    }}
                  >
                    <Feather name="edit-2" size={16} color={MeshviColors.primary} />
                    <Text style={styles.actionSheetText}>Edit Message</Text>
                  </TouchableOpacity>
                )}

                {/* Delete Message (if mine) */}
                {selectedMessageForAction?.isMine && (
                  <TouchableOpacity
                    style={[styles.actionSheetRow, { borderTopWidth: 1, borderTopColor: '#FEE2E2' }]}
                    onPress={() => {
                      if (selectedMessageForAction) {
                        handleDeleteMessage(selectedMessageForAction.id);
                      }
                    }}
                  >
                    <Feather name="trash-2" size={16} color="#E11D48" />
                    <Text style={[styles.actionSheetText, { color: '#E11D48' }]}>Delete Message</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ========================================================
            MODAL D: MESSAGE INFO & DELIVERY AUDIT TRAIL
           ======================================================== */}
        <Modal
          visible={showMsgInfoModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowMsgInfoModal(false);
            setSelectedMessageForAction(null);
          }}
        >
          <View style={styles.modalOverlayDark}>
            <View style={styles.modalSheetBox}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Delivery Audit Trail</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowMsgInfoModal(false);
                    setSelectedMessageForAction(null);
                  }}
                  style={styles.modalCloseBtn}
                >
                  <Feather name="x" size={18} color={MeshviColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10, marginTop: 14 }}>
                <View style={styles.auditRow}>
                  <Feather name="check" size={15} color="#059669" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.auditLabel}>Dispatched to Meshvi Core</Text>
                    <Text style={styles.auditTime}>{selectedMessageForAction?.sentAt || selectedMessageForAction?.createdAt || 'Just now'}</Text>
                  </View>
                </View>

                <View style={styles.auditRow}>
                  <Feather name="check-circle" size={15} color="#059669" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.auditLabel}>Delivered to Device</Text>
                    <Text style={styles.auditTime}>{selectedMessageForAction?.deliveredAt || 'Confirmed'}</Text>
                  </View>
                </View>

                <View style={styles.auditRow}>
                  <Feather name="eye" size={15} color="#059669" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.auditLabel}>Read by Counterparty</Text>
                    <Text style={styles.auditTime}>{selectedMessageForAction?.readAt || 'Confirmed'}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.modalActionRow, { marginTop: 14 }]}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => {
                    setShowMsgInfoModal(false);
                    setSelectedMessageForAction(null);
                  }}
                >
                  <Text style={styles.modalSecondaryBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ========================================================
            MODAL E: FORWARD MESSAGE MODAL
           ======================================================== */}
        <Modal
          visible={showForwardModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowForwardModal(false);
            setSelectedMessageForAction(null);
          }}
        >
          <View style={styles.modalOverlayDark}>
            <View style={styles.modalSheetBox}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Forward to Counterparty</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowForwardModal(false);
                    setSelectedMessageForAction(null);
                  }}
                  style={styles.modalCloseBtn}
                >
                  <Feather name="x" size={18} color={MeshviColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 8, marginTop: 12 }}>
                {conversations
                  .filter((c) => c.id !== activeConvId)
                  .map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.forwardTargetRow}
                      onPress={() => handleForwardToConversation(c)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.avatarInitialSmall}>
                        <Text style={styles.avatarInitialSmallText}>{c.partnerName[0]?.toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.forwardTargetName}>{c.partnerName}</Text>
                        <Text style={styles.forwardTargetSub}>{c.partnerCompany}</Text>
                      </View>
                      <Feather name="send" size={14} color={MeshviColors.accent} />
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* ========================================================
            MODAL F: EDIT MESSAGE IN-PLACE MODAL
           ======================================================== */}
        <Modal
          visible={Boolean(editingMessage)}
          transparent
          animationType="slide"
          onRequestClose={() => setEditingMessage(null)}
        >
          <View style={styles.modalOverlayDark}>
            <View style={styles.modalSheetBox}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Edit Message</Text>
                <TouchableOpacity onPress={() => setEditingMessage(null)} style={styles.modalCloseBtn}>
                  <Feather name="x" size={18} color={MeshviColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.modalInput, { minHeight: 80, textAlignVertical: 'top', marginTop: 12 }]}
                value={editingMessage?.text || ''}
                onChangeText={(t) => setEditingMessage((prev) => (prev ? { ...prev, text: t } : null))}
                multiline
              />

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => setEditingMessage(null)}
                >
                  <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.modalPrimaryBtnText}>Save Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ========================================================
            MODAL G: REPORT / BLOCK USER MODAL
           ======================================================== */}
        <Modal
          visible={showReportModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReportModal(false)}
        >
          <View style={styles.modalOverlayDark}>
            <View style={styles.modalSheetBox}>
              <View style={styles.modalHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Governance & Compliance Notice</Text>
                  <Text style={styles.modalSubTitle}>File a report regarding {activeConv.partnerName}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowReportModal(false)} style={styles.modalCloseBtn}>
                  <Feather name="x" size={18} color={MeshviColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Report Classification</Text>
                {['SPAM', 'COMMERCIAL_MISREPRESENTATION', 'UNSOLICITED_SOLICITATION', 'HARASSMENT'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.reportOptionRow, reportReason === r && styles.reportOptionRowActive]}
                    onPress={() => setReportReason(r)}
                  >
                    <Text style={[styles.reportOptionText, reportReason === r && styles.reportOptionTextActive]}>
                      {r.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}

                <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, { minHeight: 60, textAlignVertical: 'top' }]}
                  value={reportNote}
                  onChangeText={setReportNote}
                  placeholder="Additional context for governance audit..."
                  placeholderTextColor={MeshviColors.textSecondary}
                  multiline
                />
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalSecondaryBtn}
                  onPress={() => setShowReportModal(false)}
                >
                  <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineSubmitBtn}
                  onPress={handleReportAndBlock}
                >
                  <Text style={styles.declineSubmitBtnText}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }

  // ==========================================================
  // VIEW 2: CONVERSATION DIRECTORY LIST (Exact Web Replica)
  // ==========================================================
  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1, marginRight: 8 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.headerBackBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={17} color={MeshviColors.primary} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1, marginLeft: onBack ? 8 : 0 }}>
            <View style={styles.headerKickerRow}>
              <Feather name="lock" size={12} color={MeshviColors.accent} style={{ marginRight: 5 }} />
              <Text style={styles.headerKicker}>Encrypted Executive Corridors</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Messages</Text>
              <View style={styles.headerCountBadge}>
                <Text style={styles.headerCountBadgeText}>{conversations.length}</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              Direct bilateral communications with verified counterparties.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.findContactsBtn}
          onPress={() => onNavigateTab ? onNavigateTab('search') : null}
          activeOpacity={0.85}
        >
          <Feather name="send" size={12} color={MeshviColors.white} style={{ marginRight: 4 }} />
          <Text style={styles.findContactsBtnText}>Find Contacts</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarWrap}>
        <View style={styles.searchBar}>
          <Feather name="search" size={14} color={MeshviColors.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations by name, company, or message..."
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
      </View>

      {/* Conversation Thread List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="message-square" size={44} color={MeshviColors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>No Conversations Found</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? `No threads match "${searchQuery}".`
                : 'You do not have any active message threads yet. Connect with decision makers to open direct communication channels.'}
            </Text>
            <TouchableOpacity
              style={[styles.findContactsBtn, { marginTop: 12, alignSelf: 'center' }]}
              onPress={() => onNavigateTab ? onNavigateTab('search') : null}
            >
              <Feather name="send" size={12} color={MeshviColors.white} style={{ marginRight: 4 }} />
              <Text style={styles.findContactsBtnText}>Discover Decision Makers</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {filteredConversations.map((conv) => {
              const hasUnread = conv.unreadCount > 0;

              return (
                <TouchableOpacity
                  key={conv.id}
                  style={[styles.convCard, hasUnread && styles.convCardUnread]}
                  onPress={() => setActiveConvId(conv.id)}
                  activeOpacity={0.88}
                >
                  {/* Left Avatar with status dot */}
                  <View style={styles.avatarInitialBox}>
                    <Text style={styles.avatarInitialText}>
                      {conv.partnerName[0]?.toUpperCase() || 'P'}
                    </Text>
                    {conv.online && (
                      <View
                        style={[
                          styles.onlineDot,
                          conv.onlineStatus === 'IN_MEETING' && { backgroundColor: '#F59E0B' },
                        ]}
                      />
                    )}
                  </View>

                  {/* Middle Details */}
                  <View style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 6 }}>
                        <Text style={[styles.convPartnerName, hasUnread && { fontWeight: '900' }]} numberOfLines={1}>
                          {conv.partnerName}
                        </Text>
                        <Feather name="shield" size={11} color={MeshviColors.accent} style={{ marginLeft: 4 }} />
                      </View>
                      <Text style={styles.convTimeText}>{conv.lastMessageTime}</Text>
                    </View>

                    <Text style={styles.convPartnerRole} numberOfLines={1}>
                      {conv.partnerRole} • {conv.partnerCompany}
                    </Text>

                    <Text
                      style={[styles.convLastMessage, hasUnread && styles.convLastMessageUnread]}
                      numberOfLines={1}
                    >
                      {conv.lastMessage}
                    </Text>
                  </View>

                  {/* Right Badges */}
                  {hasUnread && (
                    <View style={styles.unreadPill}>
                      <Text style={styles.unreadPillText}>{conv.unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingTop: 8,
  },

  // Header Card
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
  headerBackBtn: {
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
  headerCountBadge: {
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    marginLeft: 6,
  },
  headerCountBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: MeshviColors.accent,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  findContactsBtnText: {
    color: MeshviColors.white,
    fontSize: 10.5,
    fontWeight: '700',
  },

  // Search Bar
  searchBarWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: MeshviColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
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

  // Conversation Directory Card
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  convCardUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: '#93C5FD',
    borderLeftWidth: 3,
    borderLeftColor: MeshviColors.accent,
  },
  avatarInitialBox: {
    width: 44,
    height: 44,
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
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: MeshviColors.white,
  },
  convPartnerName: {
    fontSize: 13,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  convPartnerRole: {
    fontSize: 11,
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },
  convLastMessage: {
    fontSize: 11.5,
    color: MeshviColors.textSecondary,
    marginTop: 3,
  },
  convLastMessageUnread: {
    color: MeshviColors.textPrimary,
    fontWeight: '700',
  },
  convTimeText: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
  },
  unreadPill: {
    backgroundColor: MeshviColors.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  unreadPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: MeshviColors.white,
  },

  // Active Chat Header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  avatarInitialSmall: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: MeshviColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialSmallText: {
    color: MeshviColors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  onlineDotHeader: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: MeshviColors.white,
  },
  chatPartnerName: {
    fontSize: 13,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  chatPartnerSub: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },
  chatHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBtnActive: {
    backgroundColor: MeshviColors.accent,
    borderColor: MeshviColors.accent,
  },

  // Deal Room Telemetry Card
  dealTelemetryCard: {
    backgroundColor: '#F0F9FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dealTelemetryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dealTelemetryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369A1',
  },
  dealTelemetryValue: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  dealProgressBarTrack: {
    height: 4,
    backgroundColor: '#BAE6FD',
    borderRadius: 2,
    marginVertical: 4,
    overflow: 'hidden',
  },
  dealProgressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  dealTelemetryBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dealTelemetryMilestone: {
    fontSize: 9.5,
    color: '#0369A1',
    flex: 1,
    marginRight: 8,
  },
  openDealRoomLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openDealRoomLinkText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369A1',
  },

  // Messages Stream
  messagesScroll: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 16,
  },
  securityNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 8,
    marginBottom: 12,
  },
  securityNoteText: {
    fontSize: 10,
    color: '#065F46',
    flex: 1,
    lineHeight: 14,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  msgRowMine: {
    justifyContent: 'flex-end',
  },
  msgRowPartner: {
    justifyContent: 'flex-start',
  },
  partnerAvatarMsg: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: MeshviColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  partnerAvatarMsgText: {
    color: MeshviColors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: {
    backgroundColor: MeshviColors.primary,
    borderBottomRightRadius: 2,
  },
  bubblePartner: {
    backgroundColor: MeshviColors.surface,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  bubbleTextMine: {
    color: MeshviColors.white,
  },
  bubbleTextPartner: {
    color: MeshviColors.textPrimary,
  },
  bubbleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
  },
  metaTime: {
    fontSize: 9.5,
  },
  metaTimeMine: {
    color: '#CBD5E1',
  },
  metaTimePartner: {
    color: MeshviColors.textSecondary,
  },

  // Quotes & Forward
  quoteBanner: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    borderLeftWidth: 3,
  },
  quoteBannerMine: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftColor: MeshviColors.accent,
  },
  quoteBannerPartner: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderLeftColor: MeshviColors.primary,
  },
  quoteSenderName: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.primary,
  },
  quoteSnippet: {
    fontSize: 10.5,
    color: MeshviColors.textSecondary,
  },
  forwardedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 3,
  },
  forwardedText: {
    fontSize: 9.5,
    fontStyle: 'italic',
    color: MeshviColors.textSecondary,
  },

  // Attachment Card
  attachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  attachCardMine: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  attachCardPartner: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  attachName: {
    fontSize: 11,
    fontWeight: '800',
  },
  attachMeta: {
    fontSize: 9.5,
    marginTop: 1,
  },
  attachTextWhite: {
    color: MeshviColors.white,
  },
  attachTextDark: {
    color: MeshviColors.textPrimary,
  },
  attachMetaWhite: {
    color: '#CBD5E1',
  },
  attachMetaDark: {
    color: MeshviColors.textSecondary,
  },

  // Meeting Card
  meetingCard: {
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    minWidth: 260,
  },
  meetingCardMine: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  meetingCardPartner: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  meetingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  meetBrandingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F766E',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  meetBrandingText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  meetingStatusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  meetingStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
  },
  meetingTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  meetingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  meetingTime: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
  },
  meetUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 118, 110, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 8,
  },
  meetUrlText: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F766E',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  meetCopyBtn: {
    padding: 3,
    marginLeft: 4,
  },
  meetingPrimaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  joinMeetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 7,
    paddingVertical: 7,
  },
  joinMeetBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  addToGCalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 7,
    paddingVertical: 7,
  },
  addToGCalBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  meetingSecondaryActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  meetingSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  meetingSecondaryBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: MeshviColors.textSecondary,
  },
  modalPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  modalPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  modalPresetChipActive: {
    backgroundColor: MeshviColors.textPrimary,
    borderColor: MeshviColors.textPrimary,
  },
  modalPresetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  modalPresetChipTextActive: {
    color: '#FFFFFF',
  },
  googleMeetPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  googleMeetIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleMeetPreviewTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#065F46',
  },
  googleMeetPreviewUrl: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 1,
  },

  // Typing
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typingBubble: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  typingText: {
    fontSize: 10.5,
    fontStyle: 'italic',
    color: MeshviColors.textSecondary,
  },

  // Quick Replies
  quickRepliesStrip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: MeshviColors.surface,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  quickReplyChip: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  quickReplyText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: MeshviColors.textPrimary,
  },

  // Draft Banners
  replyingDraftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 118, 110, 0.2)',
  },
  replyingDraftLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.accent,
  },
  replyingDraftText: {
    fontSize: 10.5,
    color: MeshviColors.textPrimary,
  },
  stagedAttachBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  stagedAttachName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    flex: 1,
  },

  // Compose Bar
  composeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
    gap: 6,
  },
  attachBtn: {
    padding: 7,
    borderRadius: 7,
    backgroundColor: MeshviColors.surfaceMuted,
  },
  composeInput: {
    flex: 1,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    fontSize: 12,
    color: MeshviColors.textPrimary,
    maxHeight: 88,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: MeshviColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: MeshviColors.accent,
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

  // Modals
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
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: MeshviColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: MeshviColors.textPrimary,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  durationChip: {
    flex: 1,
    backgroundColor: MeshviColors.surfaceMuted,
    paddingVertical: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  durationChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: MeshviColors.textPrimary,
  },
  durationChipTextActive: {
    color: MeshviColors.accent,
    fontWeight: '800',
  },
  meetingSecurityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 12,
  },
  meetingSecurityText: {
    fontSize: 10,
    color: '#065F46',
    flex: 1,
    lineHeight: 14,
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

  // Attachment Options
  attachmentOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  attachIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: MeshviColors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachOptionName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  attachOptionMeta: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },

  // Action Sheet Rows
  actionSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 10,
  },
  actionSheetText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },

  // Audit Rows
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  auditLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  auditTime: {
    fontSize: 10,
    color: MeshviColors.textSecondary,
    marginTop: 1,
  },

  // Forward Row
  forwardTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  forwardTargetName: {
    fontSize: 12,
    fontWeight: '800',
    color: MeshviColors.textPrimary,
  },
  forwardTargetSub: {
    fontSize: 10.5,
    color: MeshviColors.textSecondary,
  },

  // Report Options
  reportOptionRow: {
    padding: 9,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    backgroundColor: MeshviColors.surfaceMuted,
    marginBottom: 6,
  },
  reportOptionRowActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#E11D48',
  },
  reportOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  reportOptionTextActive: {
    color: '#E11D48',
  },
  declineSubmitBtn: {
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
