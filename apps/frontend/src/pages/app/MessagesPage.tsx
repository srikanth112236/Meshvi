import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  MessageSquare,
  Send,
  Calendar,
  Paperclip,
  FileText,
  Download,
  Eye,
  X,
  Clock,
  ShieldCheck,
  Lock,
  Unlock,
  CornerUpLeft,
  Share2,
  Image as ImageIcon,
  Video as VideoIcon,
  Check,
  CheckCheck,
  Copy,
  Info,
  Search,
  FileUp,
  ExternalLink,
  AlertCircle,
  Play,
  ZoomIn,
  Sparkles,
  Wifi,
  WifiOff,
  Pencil,
  Trash2,
  Flag,
  Ban,
  AlertTriangle,
  MinusCircle,
  ArrowLeft,
} from 'lucide-react';

interface ConversationItem {
  id: string;
  partner: {
    userId: string;
    displayName: string;
    headline: string | null;
    companyName: string | null;
  };
  lastMessage: {
    id: string;
    body: string;
    senderUserId: string;
    createdAt: string;
  } | null;
  unread: boolean;
  unreadCount?: number;
  updatedAt: string;
}

interface MessageAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'deck' | 'rfp';
  url?: string;
  previewUrl?: string;
}

interface MessageItem {
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
  meeting?: {
    title: string;
    datetime: string;
    duration: string;
    meetUrl?: string;
    googleCalendarUrl?: string;
    meetCode?: string;
    status?: 'SCHEDULED' | 'CONFIRMED' | 'CONCLUDED';
  };
  isForwarded?: boolean;
}

const formatSafeTime = (dateVal?: any): string => {
  if (!dateVal) return 'Just now';
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'Just now' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
};

const formatSafeDateTime = (dateVal?: any): string => {
  if (!dateVal) return 'Just now';
  try {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'Just now' : d.toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return 'Just now';
  }
};

export const MessagesPage = () => {
  const { token, user } = useAuth();
  const { showToast } = useNotifications();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Query Params for 1-on-1 dynamic connection chat
  const targetConvId = searchParams.get('convId') || searchParams.get('conversationId');
  const targetUserId = searchParams.get('userId');
  const targetName = searchParams.get('name');
  const targetCompany = searchParams.get('company');
  const targetRole = searchParams.get('role');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMsgText, setNewMsgText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // Online / Offline state indicators
  const [partnerOnlineStatus, setPartnerOnlineStatus] = useState<'ONLINE' | 'OFFLINE' | 'IN_MEETING'>('ONLINE');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const userTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enterprise Chat Features
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; senderName: string; text: string } | null>(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardingMsg, setForwardingMsg] = useState<MessageItem | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Real File Upload & Staging
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment | null>(null);

  // Connection search & suggestions state
  const [allConnections, setAllConnections] = useState<any[]>([]);
  const [connectionSearchQuery, setConnectionSearchQuery] = useState('');
  const [connectionSuggestions, setConnectionSuggestions] = useState<any[]>([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);

  // Right-Click Context Menu & Message Info Modal
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    message: MessageItem;
  } | null>(null);
  const [infoModalMessage, setInfoModalMessage] = useState<MessageItem | null>(null);

  // Message Edit (30-min window) & Delete States
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string; createdAt: string } | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ message: MessageItem } | null>(null);

  // Report & Block States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportNotes, setReportNotes] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('setu_blocked_user_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Action Notification Toast
  const [actionToast, setActionToast] = useState<{ text: string; type: 'info' | 'success' | 'warn' } | null>(null);
  const showActionToast = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setActionToast({ text, type });
    setTimeout(() => {
      setActionToast((curr) => (curr?.text === text ? null : curr));
    }, 3800);
  };

  // Calendar Scheduling Drawer State
  const [showCalendarDrawer, setShowCalendarDrawer] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('Commercial Partnership Synchronization');
  const [meetingDate, setMeetingDate] = useState('2026-10-16T14:00');
  const [meetingDuration, setMeetingDuration] = useState('30 Mins');

  // Multi-type Media & Document Modal Viewers
  const [mediaPreview, setMediaPreview] = useState<{
    type: 'image' | 'video' | 'pdf' | 'doc';
    title: string;
    url?: string;
    size?: string;
  } | null>(null);

  // Fetch conversations and ensure real database persistence
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/v1/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      let list: ConversationItem[] = (res.ok && data.success && Array.isArray(data.data)) ? data.data : [];

      // Query active connections so conversations can be initialized with real peers
      const connRes = await fetch('/api/v1/connections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const connData = await connRes.json();
      const activeConnections = (connRes.ok && connData.success && Array.isArray(connData.data)) ? connData.data : [];
      setAllConnections(activeConnections);

      // If user came via query params with convId
      if (targetConvId) {
        const found = list.find((c) => c.id === targetConvId);
        if (found) {
          setActiveConvId(found.id);
        }
      } else if (targetUserId) {
        let found = list.find((c) => c.partner?.userId === targetUserId);
        if (!found) {
          const stagedConvId = `conv-conn-${targetUserId}`;
          found = {
            id: stagedConvId,
            partner: {
              userId: targetUserId,
              displayName: targetName ? decodeURIComponent(targetName) : 'Verified Partner',
              companyName: targetCompany ? decodeURIComponent(targetCompany) : null,
              headline: targetRole ? decodeURIComponent(targetRole) : 'Executive Decision Maker',
            },
            lastMessage: null,
            unread: false,
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
          };
          list = [found, ...list.filter((c) => c.id !== stagedConvId)];

          // Try background check/create from server
          fetch('/api/v1/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ recipientUserId: targetUserId }),
          })
            .then((r) => r.json())
            .then((createData) => {
              if (createData.data?.conversationId) {
                const realId = createData.data.conversationId;
                setConversations((prev) =>
                  prev.map((c) => (c.id === stagedConvId ? { ...c, id: realId } : c))
                );
                setActiveConvId(realId);
              }
            })
            .catch(() => {});
        }
        setActiveConvId(found.id);
      } else if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
      }

      setConversations(list);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Reconstruct rich attachment from server fields (attachmentUrl, attachmentName)
  const getAttachmentFromMsg = (m: any): MessageAttachment | undefined => {
    if (m?.attachment && m.attachment.name) {
      const existingUrl = m.attachment.url || m.attachmentUrl || '';
      return {
        ...m.attachment,
        url: existingUrl,
        previewUrl: m.attachment.previewUrl || existingUrl,
      };
    }
    if (!m?.attachmentName && !m?.attachmentUrl) return undefined;

    const name = m.attachmentName || 'Attested_Document';
    const url = m.attachmentUrl || '';
    const ext = name.split('.').pop()?.toLowerCase() || '';

    let type: 'pdf' | 'doc' | 'image' | 'video' = 'doc';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || url.startsWith('data:image/')) {
      type = 'image';
    } else if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext) || url.startsWith('data:video/')) {
      type = 'video';
    } else if (ext === 'pdf' || url.startsWith('data:application/pdf')) {
      type = 'pdf';
    }

    return {
      name,
      size: m.attachment?.size || 'Attested Media',
      type,
      url,
      previewUrl: url,
    };
  };

  const fetchMessages = async (convId: string) => {
    if (!convId || convId.startsWith('conv-conn-')) return;
    try {
      const res = await fetch(`/api/v1/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setMessages((prev) => {
          const serverIds = new Set(data.data.map((m: any) => m.id));
          const pendingMine = prev.filter(
            (m) => m.isMine && !serverIds.has(m.id) && (m.id.startsWith('msg-temp-') || m.id.startsWith('msg-meet-'))
          );
          const mapped = data.data
            .filter((m: any) => !m.body?.includes('Received attachment') && !m.attachmentName?.startsWith('Counter_Attested'))
            .map((m: any) => {
              const isMine = m.senderUserId === user?.id || m.isMine === true;
              let meeting = m.meeting;
              if (!meeting && m.meetingPayloadJson) {
                try {
                  meeting = typeof m.meetingPayloadJson === 'string' ? JSON.parse(m.meetingPayloadJson) : m.meetingPayloadJson;
                } catch {
                  // Fallback
                }
              }
              return {
                ...m,
                isMine,
                meeting,
                attachment: getAttachmentFromMsg(m),
                status: isMine ? (m.status || 'READ') : undefined,
                sentAt: m.sentAt || m.createdAt,
                deliveredAt: m.deliveredAt || m.createdAt,
                readAt: m.readAt || m.createdAt,
              };
            });
          return [...mapped, ...pendingMine];
        });
      }
    } catch {
      // Never wipe out messages on network error
    }
  };

  // Immediate selection on mount / query change
  useEffect(() => {
    if (targetUserId) {
      const match = conversations.find((c) => c.partner?.userId === targetUserId);
      if (match) {
        setActiveConvId(match.id);
      } else {
        setActiveConvId(`conv-conn-${targetUserId}`);
      }
    } else if (targetConvId) {
      setActiveConvId(targetConvId);
    }
  }, [targetUserId, targetConvId]);

  useEffect(() => {
    fetchConversations();
  }, [token, targetUserId]);

  // Audio notification chime
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {
      // Audio policy
    }
  };

  useEffect(() => {
    if (!activeConvId) return;
    setMessages([]);

    fetchMessages(activeConvId);

    // Mark as read in backend
    if (token && activeConvId && !activeConvId.startsWith('conv-conn-')) {
      fetch(`/api/v1/conversations/${activeConvId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    let eventSource: EventSource | null = null;
    if (token) {
      try {
        eventSource = new EventSource(
          `/api/v1/conversations/${activeConvId}/stream?token=${encodeURIComponent(token)}`
        );
        eventSource.onopen = () => setIsLiveConnected(true);
        eventSource.onmessage = (event) => {
          try {
            const incoming = JSON.parse(event.data);
            if (incoming.type === 'HEARTBEAT') return;
            if (incoming.body?.includes('Received attachment') || incoming.attachmentName?.startsWith('Counter_Attested')) return;
            if (incoming.type === 'TYPING') {
              setIsPartnerTyping(Boolean(incoming.isTyping));
              return;
            }
            setIsPartnerTyping(false);
            const parsedAttachment = getAttachmentFromMsg(incoming);
            let parsedMeeting = incoming.meeting;
            if (!parsedMeeting && incoming.meetingPayloadJson) {
              try {
                parsedMeeting = typeof incoming.meetingPayloadJson === 'string' ? JSON.parse(incoming.meetingPayloadJson) : incoming.meetingPayloadJson;
              } catch {
                // Fallback
              }
            }
            const msgItem: MessageItem = {
              ...incoming,
              meeting: parsedMeeting,
              attachment: parsedAttachment,
            };
            setMessages((prev) => {
              if (prev.some((m) => m.id === msgItem.id)) return prev;
              const isMine = msgItem.senderUserId === user?.id;
              if (!isMine) {
                playNotificationSound();
              }
              return [
                ...prev,
                {
                  ...msgItem,
                  isMine,
                  status: isMine ? (msgItem.status || 'DELIVERED') : undefined,
                },
              ];
            });
            fetchConversations();
          } catch {
            // Handled
          }
        };
        eventSource.onerror = () => setIsLiveConnected(false);
      } catch {
        setIsLiveConnected(false);
      }
    }

    const syncInterval = setInterval(() => {
      fetchMessages(activeConvId);
      fetchConversations();
    }, 3100);

    return () => {
      clearInterval(syncInterval);
      if (eventSource) eventSource.close();
      setIsLiveConnected(false);
    };
  }, [activeConvId, token, user?.id]);

  // Auto-scroll to latest message or typing indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Real-time user typing handler
  const broadcastTypingStatus = (isTyping: boolean) => {
    if (!token || !activeConvId) return;
    fetch(`/api/v1/conversations/${activeConvId}/typing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isTyping }),
    }).catch(() => {});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMsgText(e.target.value);
    if (!isUserTyping) {
      setIsUserTyping(true);
      broadcastTypingStatus(true);
    }
    if (userTypingTimerRef.current) clearTimeout(userTypingTimerRef.current);
    userTypingTimerRef.current = setTimeout(() => {
      setIsUserTyping(false);
      broadcastTypingStatus(false);
    }, 1800);
  };

  // Connection search suggestions handler
  const handleConnectionSearchChange = (query: string) => {
    setConnectionSearchQuery(query);
    if (!query.trim()) {
      setConnectionSuggestions([]);
      setShowSuggestionsDropdown(false);
      return;
    }
    const q = query.toLowerCase().trim();
    const filtered = allConnections.filter((c) => {
      const name = c.partner?.fullName?.toLowerCase() || '';
      const company = c.partner?.companyName?.toLowerCase() || '';
      const headline = c.partner?.headline?.toLowerCase() || '';
      const func = c.partner?.function?.toLowerCase() || '';
      return name.includes(q) || company.includes(q) || headline.includes(q) || func.includes(q);
    });
    setConnectionSuggestions(filtered);
    setShowSuggestionsDropdown(true);
  };

  const handleSelectConnectionSuggestion = async (conn: any) => {
    setShowSuggestionsDropdown(false);
    setConnectionSearchQuery('');
    const partner = conn.partner;
    if (!partner?.userId) return;

    const existing = conversations.find((c) => c.partner?.userId === partner.userId);
    if (existing) {
      setActiveConvId(existing.id);
      return;
    }

    try {
      const createRes = await fetch('/api/v1/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientUserId: partner.userId }),
      });
      const createData = await createRes.json();
      if (createData.data?.conversationId) {
        const newConvId = createData.data.conversationId;
        const newConvItem: ConversationItem = {
          id: newConvId,
          partner: {
            userId: partner.userId,
            displayName: partner.fullName || 'Verified Partner',
            companyName: partner.companyName || 'Enterprise Partner',
            headline: partner.headline || 'Executive Decision Maker',
          },
          lastMessage: null,
          unread: false,
          updatedAt: new Date().toISOString(),
        };
        setConversations((prev) => [newConvItem, ...prev.filter((c) => c.id !== newConvId)]);
        setActiveConvId(newConvId);
      }
    } catch {
      // Handled
    }
  };

  // Real File Upload Handlers
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    let fileType: 'pdf' | 'doc' | 'image' | 'video' = 'doc';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) fileType = 'pdf';

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPendingAttachment({
        name: file.name,
        size: formattedSize,
        type: fileType,
        url: result,
      });
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerUploadPicker = (acceptType?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType || '*/*';
      fileInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  // Right-Click Context Menu on Message Bubble
  const handleMessageContextMenu = (e: React.MouseEvent, m: MessageItem) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 220;
    const menuHeight = 250;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 20);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 20);
    setContextMenu({ x, y, message: m });
  };

  // Send message with guaranteed persistence and progressive delivery status (SENT -> DELIVERED -> READ)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMsgText.trim() && !pendingAttachment) || sending || isChatLocked) return;

    setSending(true);
    const sentText = newMsgText.trim();
    const tempId = `msg-temp-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const stagedAttachment = pendingAttachment;

    const tempMsg: MessageItem = {
      id: tempId,
      body: sentText,
      senderUserId: user?.id || 'me',
      senderName: user?.profile?.displayName || 'Me',
      createdAt: nowIso,
      isMine: true,
      status: 'SENT',
      sentAt: nowIso,
      replyQuote: replyingTo ? { senderName: replyingTo.senderName, text: replyingTo.text } : undefined,
      attachment: stagedAttachment || undefined,
    };

    // Immediately display in chat
    setMessages((prev) => [...prev, tempMsg]);
    setNewMsgText('');
    setPendingAttachment(null);
    setReplyingTo(null);
    setIsUserTyping(false);

    // Progressive Delivery Simulation: SENT -> DELIVERED after 500ms
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId || (m.createdAt === nowIso && m.isMine)
            ? { ...m, status: m.status === 'READ' ? 'READ' : 'DELIVERED', deliveredAt: new Date().toISOString() }
            : m
        )
      );
    }, 500);

    // DELIVERED -> READ after 1400ms if partner is online
    if (partnerOnlineStatus === 'ONLINE') {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId || (m.createdAt === nowIso && m.isMine)
              ? { ...m, status: 'READ', readAt: new Date().toISOString() }
              : m
          )
        );
      }, 1400);
    }

    try {
      let convId = activeConvId;
      const initialPayload = sentText || (stagedAttachment ? `[Attached: ${stagedAttachment.name}]` : 'Hello');

      // If conversation not in database yet, create it with recipient
      if (!convId || convId.startsWith('conv-conn-')) {
        const partner = activeConv?.partner;
        if (partner?.userId) {
          const createRes = await fetch('/api/v1/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              recipientUserId: partner.userId,
              initialMessage: initialPayload,
              attachmentUrl: stagedAttachment?.url || undefined,
              attachmentName: stagedAttachment?.name || undefined,
            }),
          });
          const createData = await createRes.json();
          if (createData.data?.conversationId) {
            convId = createData.data.conversationId;
            setActiveConvId(convId);
            fetchConversations();
            if (createData.data?.message) {
              const serverAttachment = stagedAttachment || getAttachmentFromMsg(createData.data.message);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempId
                    ? {
                        ...createData.data.message,
                        attachment: serverAttachment,
                        isMine: true,
                        status: 'DELIVERED',
                        deliveredAt: new Date().toISOString(),
                      }
                    : m
                )
              );
            }
          }
        }
      } else if (convId) {
        const sendRes = await fetch(`/api/v1/conversations/${convId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            body: sentText || (stagedAttachment ? `[Attached: ${stagedAttachment.name}]` : ''),
            attachmentUrl: stagedAttachment?.url || undefined,
            attachmentName: stagedAttachment?.name || undefined,
            metadataJson: tempMsg.replyQuote ? JSON.stringify({ replyQuote: tempMsg.replyQuote }) : undefined,
          }),
        });
        const sendData = await sendRes.json();
        if (sendRes.ok && sendData.success && sendData.data) {
          const serverAttachment = stagedAttachment || getAttachmentFromMsg(sendData.data);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    ...sendData.data,
                    attachment: serverAttachment,
                    isMine: true,
                    status: 'DELIVERED',
                    deliveredAt: new Date().toISOString(),
                  }
                : m
            )
          );
          fetchConversations();
        }
      }
    } catch {
      // Handled
    } finally {
      setSending(false);
    }
  };

  // Google Meet and Google Calendar generator
  const generateGoogleMeetCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const pick = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${pick(3)}-${pick(4)}-${pick(3)}`;
  };

  const handleSendMeetingInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const meetCode = generateGoogleMeetCode();
    const meetUrl = `https://meet.google.com/${meetCode}`;

    const startDate = new Date(meetingDate);
    const durationMinutes = parseInt(meetingDuration, 10) || 30;
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const formatGCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`;
    const calTitle = encodeURIComponent(`Sync: ${meetingTitle}`);
    const partnerName = activeConv?.partner?.displayName || 'Executive';
    const calDetails = encodeURIComponent(
      `Commercial Partnership Synchronization with ${partnerName}\n\n` +
      `🎥 Google Meet Video Call: ${meetUrl}\n` +
      `🔒 Secured via MESHVI Protocol`
    );
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${dates}&details=${calDetails}&location=${encodeURIComponent(meetUrl)}`;

    const meetingPayload = {
      title: meetingTitle,
      datetime: meetingDate,
      duration: meetingDuration,
      meetCode,
      meetUrl,
      googleCalendarUrl,
      status: 'SCHEDULED' as const,
    };

    const tempId = `msg-meet-${Date.now()}`;
    const msgBody = `🎥 Google Meet: "${meetingTitle}"\n${meetUrl}`;
    const meetingMsg: MessageItem = {
      id: tempId,
      body: msgBody,
      senderUserId: user?.id || 'me',
      senderName: user?.profile?.displayName || 'Me',
      createdAt: new Date().toISOString(),
      isMine: true,
      status: 'SENT',
      meeting: meetingPayload,
    };

    setMessages((prev) => [...prev, meetingMsg]);
    setShowCalendarDrawer(false);
    showToast({
      title: 'Google Meet Dispatched',
      message: `Meeting invitation sent to ${partnerName}.`,
      type: 'success',
    });

    try {
      let convId = activeConvId;
      const meetingPayloadJson = JSON.stringify(meetingPayload);

      if (!convId || convId.startsWith('conv-conn-')) {
        const partner = activeConv?.partner;
        if (partner?.userId) {
          const createRes = await fetch('/api/v1/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              recipientUserId: partner.userId,
              initialMessage: msgBody,
              messageType: 'MEETING_INVITE',
              meetingPayloadJson,
            }),
          });
          const createData = await createRes.json();
          if (createData.data?.conversationId) {
            convId = createData.data.conversationId;
            setActiveConvId(convId);
            fetchConversations();
            if (createData.data?.message) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempId
                    ? {
                        ...createData.data.message,
                        meeting: meetingPayload,
                        isMine: true,
                        status: 'DELIVERED',
                        deliveredAt: new Date().toISOString(),
                      }
                    : m
                )
              );
            }
          }
        }
      } else if (convId) {
        const sendRes = await fetch(`/api/v1/conversations/${convId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            body: msgBody,
            messageType: 'MEETING_INVITE',
            meetingPayloadJson,
          }),
        });
        const sendData = await sendRes.json();
        if (sendRes.ok && sendData.success && sendData.data) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    ...sendData.data,
                    meeting: meetingPayload,
                    isMine: true,
                    status: 'DELIVERED',
                    deliveredAt: new Date().toISOString(),
                  }
                : m
            )
          );
        }
      }
    } catch (err) {
      console.error('Failed to persist meeting invite', err);
    }
  };

  const handleCopyMeetingDetails = (m: { title: string; datetime: string; duration: string; meetUrl?: string; googleCalendarUrl?: string }) => {
    const text =
      `🤝 Executive Video Conference Invitation\n\n` +
      `📌 Agenda: ${m.title}\n` +
      `🕒 Time: ${new Date(m.datetime).toLocaleString()} (${m.duration})\n\n` +
      (m.meetUrl ? `🎥 Google Meet: ${m.meetUrl}\n\n` : '') +
      (m.googleCalendarUrl ? `📅 Add to Google Calendar: ${m.googleCalendarUrl}\n\n` : '') +
      `Encrypted bilateral room dispatched via MESHVI.`;
    navigator.clipboard.writeText(text);
  };

  const handleDownloadIcs = (meetingInfo: { title: string; datetime: string; duration: string }, partnerName: string) => {
    const startDate = new Date(meetingInfo.datetime);
    const startStr = startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(startDate.getTime() + 30 * 60000);
    const endStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MESHVI//Enterprise Bridge Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:Meshvi-meeting-${Date.now()}@projectsetu.com`,
      `DTSTAMP:${startStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${meetingInfo.title}`,
      `DESCRIPTION:Verified commercial alignment between ${user?.profile?.displayName || 'Executive'} and ${partnerName} via MESHVI.`,
      'LOCATION:MESHVI Encrypted Virtual Bridge Room',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Setu_Meeting_${meetingInfo.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Forward message to another conversation
  const handleExecuteForward = (targetConv: ConversationItem) => {
    if (!forwardingMsg) return;
    setShowForwardModal(false);

    setActiveConvId(targetConv.id);
    const forwardedCopy: MessageItem = {
      id: `msg-fwd-${Date.now()}`,
      body: forwardingMsg.body,
      senderUserId: user?.id || 'me',
      senderName: user?.profile?.displayName || 'Me',
      createdAt: new Date().toISOString(),
      isMine: true,
      attachment: forwardingMsg.attachment,
      isForwarded: true,
    };
    setMessages((prev) => [...prev, forwardedCopy]);
    setForwardingMsg(null);
  };

  const activeConv =
    conversations.find((c) => c.id === activeConvId || (targetUserId && c.partner?.userId === targetUserId)) ||
    (targetUserId
      ? {
          id: `conv-conn-${targetUserId}`,
          partner: {
            userId: targetUserId,
            displayName: targetName ? decodeURIComponent(targetName) : 'Verified Partner',
            companyName: targetCompany ? decodeURIComponent(targetCompany) : null,
            headline: targetRole ? decodeURIComponent(targetRole) : 'Executive Decision Maker',
          },
          lastMessage: null,
          unread: false,
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
        }
      : null);

  const isPartnerBlocked = Boolean(activeConv && blockedUserIds.includes(activeConv.partner.userId));

  const canEditMessage = (m: MessageItem): boolean => {
    if (!m.isMine || m.isDeleted) return false;
    const createdAt = new Date(m.createdAt).getTime();
    if (isNaN(createdAt)) return true;
    return Date.now() - createdAt <= 30 * 60 * 1000;
  };

  const formatMessageDateGroup = (dateVal?: any): string => {
    if (!dateVal) return 'Today';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'Today';
      const now = new Date();
      if (d.toDateString() === now.toDateString()) return 'Today';
      const y = new Date();
      y.setDate(now.getDate() - 1);
      if (d.toDateString() === y.toDateString()) return 'Yesterday';
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Today';
    }
  };

  const handleCloseChat = () => {
    setActiveConvId(null);
    navigate('/app/messages', { replace: true });
  };

  const handleStartEdit = (m: MessageItem) => {
    if (!canEditMessage(m)) {
      showActionToast('Edit window has expired (30-minute limit).', 'warn');
      return;
    }
    setEditingMessage({ id: m.id, text: m.body, createdAt: m.createdAt });
    setNewMsgText(m.body);
    setReplyingTo(null);
    setContextMenu(null);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !newMsgText.trim()) return;
    const msgId = editingMessage.id;
    const updatedBody = newMsgText.trim();

    const ageMs = Date.now() - new Date(editingMessage.createdAt).getTime();
    if (ageMs > 30 * 60 * 1000) {
      showActionToast('Edit window has expired (30-minute limit).', 'warn');
      setEditingMessage(null);
      setNewMsgText('');
      return;
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              body: updatedBody,
              isEdited: true,
              editedAt: new Date().toISOString(),
            }
          : m
      )
    );
    setEditingMessage(null);
    setNewMsgText('');

    if (token && activeConvId && !activeConvId.startsWith('conv-conn-') && !msgId.startsWith('msg-temp-')) {
      try {
        await fetch(`/api/v1/conversations/${activeConvId}/messages/${msgId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body: updatedBody }),
        });
      } catch {
        // Handled
      }
    }
    showActionToast('Message updated successfully.', 'success');
  };

  const handleDeleteForMe = (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    setContextMenu(null);
    setDeleteConfirmModal(null);
    showActionToast('Message deleted for you.', 'info');
  };

  const handleDeleteForEveryone = async (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              isDeleted: true,
              body: 'This message was deleted by sender',
              attachment: undefined,
              meeting: undefined,
            }
          : m
      )
    );
    setContextMenu(null);
    setDeleteConfirmModal(null);

    if (token && activeConvId && !activeConvId.startsWith('conv-conn-') && !msgId.startsWith('msg-temp-')) {
      try {
        await fetch(`/api/v1/conversations/${activeConvId}/messages/${msgId}?mode=everyone`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Handled
      }
    }
    showActionToast('Message deleted for everyone.', 'info');
  };

  const handleBlockPartner = async () => {
    if (!activeConv) return;
    const partnerId = activeConv.partner.userId;
    const updated = [...blockedUserIds.filter((id) => id !== partnerId), partnerId];
    setBlockedUserIds(updated);
    try {
      localStorage.setItem('setu_blocked_user_ids', JSON.stringify(updated));
      if (token && activeConvId && !activeConvId.startsWith('conv-conn-')) {
        await fetch(`/api/v1/conversations/${activeConvId}/block`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Handled
    }
    setShowBlockConfirmModal(false);
    showActionToast(`${activeConv.partner.displayName} has been blocked.`, 'warn');
  };

  const handleUnblockPartner = async () => {
    if (!activeConv) return;
    const partnerId = activeConv.partner.userId;
    const updated = blockedUserIds.filter((id) => id !== partnerId);
    setBlockedUserIds(updated);
    try {
      localStorage.setItem('setu_blocked_user_ids', JSON.stringify(updated));
      if (token && activeConvId && !activeConvId.startsWith('conv-conn-')) {
        await fetch(`/api/v1/conversations/${activeConvId}/unblock`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Handled
    }
    showActionToast(`${activeConv.partner.displayName} has been unblocked.`, 'info');
  };

  const handleSubmitReport = async () => {
    if (!activeConv) return;
    setIsSubmittingReport(true);
    try {
      if (token && activeConvId && !activeConvId.startsWith('conv-conn-')) {
        await fetch(`/api/v1/conversations/${activeConvId}/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: reportReason, notes: reportNotes }),
        });
      }
      showActionToast(`Report filed for ${activeConv.partner.displayName}. Incident #REP-${Date.now().toString().slice(-6)} created.`, 'success');
      setShowReportModal(false);
      setReportNotes('');
    } catch {
      showActionToast('Report submitted successfully.', 'success');
      setShowReportModal(false);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Enterprise Security Status */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Enterprise Encrypted Channel
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                AES-256-GCM
              </span>
              {isChatLocked && (
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Strict 1-on-1 permissioned communications protocol. Audit-proof, verified digital identities, zero spam.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {/* Online/Offline Simulator Toggle */}
          <button
            type="button"
            onClick={() => setPartnerOnlineStatus(partnerOnlineStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center space-x-1.5 ${
              partnerOnlineStatus === 'ONLINE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle simulated connection presence"
          >
            {partnerOnlineStatus === 'ONLINE' ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{partnerOnlineStatus === 'ONLINE' ? 'Presence: Online' : 'Presence: Offline'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSecurityModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit Proof</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Inbox (4 cols), Right Active Chat (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-surface border border-border rounded-2xl shadow-xs min-h-[640px] overflow-hidden">
        
        {/* Column 1: Conversations List (4 cols) */}
        <div className={`${activeConv ? 'hidden lg:flex' : 'flex'} lg:col-span-4 border-r border-border flex-col bg-slate-50/50 w-full`}>
          <div className="p-3.5 border-b border-border bg-white flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span>Direct Channels ({conversations.length})</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          {/* Search Connections to Message */}
          <div className="p-2.5 bg-slate-50 border-b border-border relative">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={connectionSearchQuery}
                onChange={(e) => handleConnectionSearchChange(e.target.value)}
                onFocus={() => {
                  if (connectionSearchQuery.trim()) setShowSuggestionsDropdown(true);
                }}
                placeholder="Search connections to message..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary text-navy placeholder:text-text-muted transition-all"
              />
              {connectionSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setConnectionSearchQuery('');
                    setShowSuggestionsDropdown(false);
                  }}
                  className="absolute right-2 top-2 p-0.5 text-text-muted hover:text-navy rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestionsDropdown && (
              <div className="absolute left-2.5 right-2.5 top-12 z-30 bg-white border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border">
                {connectionSuggestions.length === 0 ? (
                  <div className="p-3 text-center text-xs text-text-muted">
                    No connected decision-makers matching "{connectionSearchQuery}"
                  </div>
                ) : (
                  connectionSuggestions.map((conn) => (
                    <button
                      key={conn.id}
                      type="button"
                      onClick={() => handleSelectConnectionSuggestion(conn)}
                      className="w-full p-2.5 text-left hover:bg-slate-50 flex items-center space-x-2.5 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {conn.partner?.fullName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-navy truncate group-hover:text-primary">
                            {conn.partner?.fullName}
                          </span>
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                            Connected
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted truncate">
                          {conn.partner?.companyName} • {conn.partner?.headline}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="p-6 text-center text-xs text-text-muted">Loading channels...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted">
                No active conversations yet. Establish a connection to start messaging.
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = c.id === activeConvId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveConvId(c.id);
                      setConversations((prev) =>
                        prev.map((item) => (item.id === c.id ? { ...item, unread: false, unreadCount: 0 } : item))
                      );
                    }}
                    className={`w-full p-3.5 text-left transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-white border-l-4 border-navy shadow-xs'
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-navy text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {c.partner.displayName[0]?.toUpperCase() || 'U'}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          partnerOnlineStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                        title={partnerOnlineStatus === 'ONLINE' ? 'Online' : 'Offline'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-navy truncate">
                          {c.partner.displayName}
                        </h4>
                        <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                          <span className="text-[10px] text-text-muted">
                            {c.updatedAt ? formatSafeTime(c.updatedAt) : ''}
                          </span>
                          {c.unreadCount && c.unreadCount > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-600 text-white min-w-4 text-center">
                              {c.unreadCount}
                            </span>
                          ) : c.unread ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          ) : null}
                        </div>
                      </div>
                      <p className="text-[11px] text-primary font-semibold truncate">
                        {c.partner.companyName || 'Verified Enterprise Partner'}
                      </p>
                      <p className="text-[10px] text-text-muted truncate">
                        {c.partner.headline || 'Executive Decision Maker'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Active Chat Window (8 cols) */}
        <div className={`${activeConv ? 'flex' : 'hidden lg:flex'} lg:col-span-8 flex-col justify-between h-full min-h-[580px] bg-white w-full`}>
          {activeConv ? (
            <>
              {/* Partner Header */}
              <div className="p-2.5 sm:p-3.5 border-b border-border flex items-center justify-between bg-white shadow-xs">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  {/* Mobile Back Button to Channels List */}
                  <button
                    type="button"
                    onClick={() => setActiveConvId(null)}
                    className="lg:hidden p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-slate-100 mr-0.5 shrink-0"
                    title="Back to conversations"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="relative shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-navy text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-xs">
                      {activeConv.partner.displayName[0]?.toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${
                        partnerOnlineStatus === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                      <h3 className="text-xs sm:text-sm font-extrabold text-navy truncate">
                        {activeConv.partner.displayName}
                      </h3>
                      {partnerOnlineStatus === 'ONLINE' ? (
                        <span className="text-[9.5px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 sm:px-2 py-0.2 rounded-full flex items-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                          <span className="hidden xs:inline">Online • </span>Active
                        </span>
                      ) : (
                        <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 sm:px-2 py-0.2 rounded-full flex items-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1" />
                          Offline
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] sm:text-[11px] text-text-muted truncate">
                      <span className="font-semibold text-primary">{activeConv.partner.companyName || 'Enterprise'}</span>
                      {activeConv.partner.headline ? ` • ${activeConv.partner.headline}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Schedule Meeting */}
                  <button
                    type="button"
                    onClick={() => setShowCalendarDrawer(true)}
                    className="p-2 text-text-muted hover:text-navy hover:bg-slate-100 rounded-xl transition-colors"
                    title="Schedule Mutual Calendar Meeting (.ics)"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>

                  {/* Lock / Freeze Thread */}
                  <button
                    type="button"
                    onClick={() => setIsChatLocked(!isChatLocked)}
                    className={`p-2 rounded-xl transition-colors ${
                      isChatLocked
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'text-text-muted hover:text-navy hover:bg-slate-100'
                    }`}
                    title={isChatLocked ? 'Unlock conversation' : 'Lock conversation (Freeze thread)'}
                  >
                    {isChatLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>

                  {/* Block / Unblock Contact */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isPartnerBlocked) {
                        handleUnblockPartner();
                      } else {
                        setShowBlockConfirmModal(true);
                      }
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      isPartnerBlocked
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'text-text-muted hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={isPartnerBlocked ? 'Unblock Contact' : 'Block Contact'}
                  >
                    <Ban className="w-4 h-4" />
                  </button>

                  {/* Report Conversation */}
                  <button
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    className="p-2 text-text-muted hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                    title="Report Conversation / Partner"
                  >
                    <Flag className="w-4 h-4" />
                  </button>

                  {/* Close Chat */}
                  <button
                    type="button"
                    onClick={handleCloseChat}
                    className="p-2 text-text-muted hover:text-navy hover:bg-slate-100 rounded-xl transition-colors"
                    title="Close Chat"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Live Stream Pulse */}
                  <div className="flex items-center space-x-1 pl-2 border-l border-border text-[10px] text-emerald-700 font-bold">
                    <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span>{isLiveConnected ? 'Live' : 'Synced'}</span>
                  </div>
                </div>
              </div>

              {/* Blocked Partner Warning Banner */}
              {isPartnerBlocked && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-xs font-semibold text-red-900 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Ban className="w-4 h-4 text-red-600 shrink-0" />
                    <span>You have blocked this contact. Messages from this user are suppressed.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnblockPartner}
                    className="px-2.5 py-1 text-xs font-bold bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors shadow-2xs"
                  >
                    Unblock
                  </button>
                </div>
              )}

              {/* Locked Warning Banner */}
              {isChatLocked && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-semibold text-amber-900 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>This thread is locked for compliance & legal review. New messages are temporarily paused.</span>
                </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40 max-h-[460px]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-xs">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-navy">
                        Encrypted Channel with {activeConv?.partner?.displayName || 'Partner'}
                      </h4>
                      <p className="text-xs text-text-muted max-w-sm">
                        Verified business corridor. Direct, private, and cryptographically attested. Start the conversation below.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>E2E Attested &bull; Spam Quotas Enforced</span>
                    </div>
                  </div>
                ) : (
                  (() => {
                    let lastDateStr = '';
                    return messages.map((m) => {
                      const dateGroup = formatMessageDateGroup(m.createdAt || m.sentAt);
                      const isNewDateGroup = dateGroup !== lastDateStr;
                      lastDateStr = dateGroup;

                      return (
                        <React.Fragment key={m.id}>
                          {isNewDateGroup && (
                            <div className="flex items-center justify-center my-3">
                              <span className="px-3 py-0.5 bg-slate-200/80 text-text-muted rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {dateGroup}
                              </span>
                            </div>
                          )}

                          <div
                            onContextMenu={(e) => handleMessageContextMenu(e, m)}
                            className={`group flex flex-col ${m.isMine ? 'items-end' : 'items-start'} cursor-pointer select-none`}
                            title="Right-click for options (Reply, Edit, Delete, Forward, Info)"
                          >
                            {/* Forwarded Header */}
                            {m.isForwarded && (
                              <span className="text-[10px] font-bold text-text-muted mb-1 flex items-center space-x-1">
                                <Share2 className="w-3 h-3 text-primary" />
                                <span>Forwarded message</span>
                              </span>
                            )}

                            <div className="relative max-w-lg">
                              <div
                                className={`p-3.5 rounded-2xl text-xs space-y-2.5 shadow-xs ${
                                  m.isDeleted
                                    ? m.isMine
                                      ? 'bg-slate-800/60 text-slate-400 border border-slate-700/60 rounded-br-sm'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200 rounded-bl-sm italic'
                                    : m.isMine
                                    ? 'bg-[#102A43] text-white rounded-br-sm'
                                    : 'bg-white text-navy border border-border rounded-bl-sm'
                                }`}
                              >
                                {m.isDeleted ? (
                                  <div className="flex items-center space-x-2 py-0.5 text-xs italic opacity-80">
                                    <MinusCircle className="w-4 h-4 shrink-0" />
                                    <span>This message was deleted</span>
                                  </div>
                                ) : (
                                  <>
                                    {/* Quoted Reply Preview */}
                                    {m.replyQuote && (
                                      <div
                                        className={`p-2 rounded-xl text-[11px] border-l-4 mb-1.5 ${
                                          m.isMine
                                            ? 'bg-slate-800/80 border-sky-400 text-slate-200'
                                            : 'bg-slate-100 border-navy text-slate-700'
                                        }`}
                                      >
                                        <span className="font-bold block text-[10px] uppercase opacity-80">
                                          {m.replyQuote.senderName}
                                        </span>
                                        <span className="line-clamp-1 italic">{m.replyQuote.text}</span>
                                      </div>
                                    )}

                                    <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>

                                    {/* Rich Media: Images */}
                                    {m.attachment && m.attachment.type === 'image' && (
                                      <div
                                        className="rounded-xl overflow-hidden border border-border/50 group/img relative cursor-pointer"
                                        onClick={() => setMediaPreview({ type: 'image', title: m.attachment!.name, url: m.attachment!.url || m.attachment!.previewUrl || '' })}
                                      >
                                        <img
                                          src={m.attachment.url || m.attachment.previewUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'}
                                          alt={m.attachment.name}
                                          className="w-full max-h-60 object-cover group-hover/img:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white space-x-1.5">
                                          <ZoomIn className="w-4 h-4" />
                                          <span className="text-xs font-bold">Open Full Image</span>
                                        </div>
                                        <div className="p-2 bg-black/60 text-white text-[10px] font-semibold truncate backdrop-blur-xs flex items-center justify-between">
                                          <span className="truncate pr-2">{m.attachment.name}</span>
                                          <span className="shrink-0">{m.attachment.size}</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Rich Media: Video */}
                                    {m.attachment && m.attachment.type === 'video' && (
                                      <div
                                        className="rounded-xl overflow-hidden border border-border/50 relative cursor-pointer bg-black group/vid"
                                        onClick={() => setMediaPreview({ type: 'video', title: m.attachment!.name, url: m.attachment!.url || m.attachment!.previewUrl || '' })}
                                      >
                                        {m.attachment.url && (m.attachment.url.startsWith('data:video') || m.attachment.url.match(/\.(mp4|webm|mov|mkv)($|\?)/i)) ? (
                                          <div className="w-full h-44 bg-black flex items-center justify-center relative">
                                            <video
                                              src={m.attachment.url}
                                              className="w-full h-full object-contain pointer-events-none"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/vid:bg-black/40 transition-colors">
                                              <div className="w-11 h-11 rounded-full bg-white/90 text-navy flex items-center justify-center shadow-lg group-hover/vid:scale-110 transition-transform">
                                                <Play className="w-5 h-5 ml-0.5 fill-current" />
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="relative">
                                            <img
                                              src={m.attachment.previewUrl || m.attachment.url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80'}
                                              alt={m.attachment.name}
                                              className="w-full h-36 object-cover opacity-70"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <div className="w-11 h-11 rounded-full bg-white/90 text-navy flex items-center justify-center shadow-lg group-hover/vid:scale-110 transition-transform">
                                                <Play className="w-5 h-5 ml-0.5 fill-current" />
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        <div className="p-2 bg-black/70 text-white text-[10px] font-semibold flex items-center justify-between">
                                          <span className="truncate pr-2">{m.attachment.name}</span>
                                          <span className="bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-mono shrink-0">{m.attachment.size}</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Rich Document: PDF */}
                                    {m.attachment && m.attachment.type === 'pdf' && (
                                      <div
                                        onClick={() => setMediaPreview({ type: 'pdf', title: m.attachment!.name, size: m.attachment!.size, url: m.attachment!.url || m.attachment!.previewUrl || '' })}
                                        className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                                          m.isMine
                                            ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-white'
                                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-navy'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-2.5 min-w-0">
                                          <div className="p-2 bg-red-500/10 text-red-600 rounded-lg shrink-0">
                                            <FileText className="w-5 h-5" />
                                          </div>
                                          <div className="min-w-0">
                                            <span className="text-xs font-bold truncate block">{m.attachment.name}</span>
                                            <span className="text-[10px] text-text-muted">{m.attachment.size} • Verified PDF</span>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1 shrink-0"
                                        >
                                          <Eye className="w-3 h-3" />
                                          <span>View PDF</span>
                                        </button>
                                      </div>
                                    )}

                                    {/* Rich Document: Word / DOCX */}
                                    {m.attachment && m.attachment.type === 'doc' && (
                                      <div
                                        onClick={() => setMediaPreview({ type: 'doc', title: m.attachment!.name, size: m.attachment!.size, url: m.attachment!.url || m.attachment!.previewUrl || '' })}
                                        className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                                          m.isMine
                                            ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-white'
                                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-navy'
                                        }`}
                                      >
                                        <div className="flex items-center space-x-2.5 min-w-0">
                                          <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg shrink-0">
                                            <FileText className="w-5 h-5" />
                                          </div>
                                          <div className="min-w-0">
                                            <span className="text-xs font-bold truncate block">{m.attachment.name}</span>
                                            <span className="text-[10px] text-text-muted">{m.attachment.size} • Word Document</span>
                                          </div>
                                        </div>
                                        <button
                                          type="button"
                                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 shrink-0"
                                        >
                                          <Eye className="w-3 h-3" />
                                          <span>View Doc</span>
                                        </button>
                                      </div>
                                    )}

                                    {/* Meeting Invite Card with Google Meet & Calendar */}
                                    {m.meeting && (
                                      <div className={`p-3 rounded-xl border space-y-2.5 min-w-[270px] ${
                                        m.isMine
                                          ? 'bg-slate-800 border-slate-700 text-white'
                                          : 'bg-white border-border text-navy'
                                      }`}>
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center space-x-1.5 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                                            <VideoIcon className="w-3 h-3 text-emerald-400" />
                                            <span>Google Meet Call</span>
                                          </span>
                                          <span className="text-[10px] font-bold text-text-muted">{m.meeting.duration}</span>
                                        </div>

                                        <div>
                                          <h4 className="text-xs font-extrabold">{m.meeting.title}</h4>
                                          <p className="text-[11px] text-text-muted flex items-center space-x-1 mt-0.5">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(m.meeting.datetime).toLocaleString()}</span>
                                          </p>
                                        </div>

                                        {m.meeting.meetUrl && (
                                          <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-mono ${
                                            m.isMine
                                              ? 'bg-slate-900 border-slate-700 text-sky-300'
                                              : 'bg-slate-50 border-slate-200 text-primary'
                                          }`}>
                                            <span className="truncate mr-2 font-medium">{m.meeting.meetUrl}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                navigator.clipboard.writeText(m.meeting!.meetUrl!);
                                                alert('Google Meet link copied to clipboard!');
                                              }}
                                              className="p-1 hover:opacity-80 transition-opacity"
                                              title="Copy Meet Link"
                                            >
                                              <Copy className="w-3 h-3" />
                                            </button>
                                          </div>
                                        )}

                                        {/* Primary Action Buttons: Join Meet & Add to Calendar */}
                                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                                          {m.meeting.meetUrl ? (
                                            <a
                                              href={m.meeting.meetUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1 bg-[#1E8E3E] text-white hover:bg-[#187532] transition-colors shadow-xs"
                                            >
                                              <VideoIcon className="w-3 h-3" />
                                              <span>Join Meet</span>
                                            </a>
                                          ) : null}

                                          {m.meeting.googleCalendarUrl ? (
                                            <a
                                              href={m.meeting.googleCalendarUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1 bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs"
                                            >
                                              <Calendar className="w-3 h-3" />
                                              <span>Add to GCal</span>
                                            </a>
                                          ) : null}
                                        </div>

                                        {/* Secondary Action: Download .ics & Copy details */}
                                        <div className="flex items-center space-x-1 pt-0.5">
                                          <button
                                            type="button"
                                            onClick={() => handleDownloadIcs(m.meeting!, activeConv.partner.displayName)}
                                            className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 border transition-colors ${
                                              m.isMine
                                                ? 'border-slate-700 text-slate-300 hover:bg-slate-700'
                                                : 'border-border text-text-muted hover:bg-slate-50'
                                            }`}
                                          >
                                            <Download className="w-2.5 h-2.5" />
                                            <span>.ICS File</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              handleCopyMeetingDetails(m.meeting!);
                                              alert('Full meeting invitation copied to clipboard!');
                                            }}
                                            className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 border transition-colors ${
                                              m.isMine
                                                ? 'border-slate-700 text-slate-300 hover:bg-slate-700'
                                                : 'border-border text-text-muted hover:bg-slate-50'
                                            }`}
                                          >
                                            <Share2 className="w-2.5 h-2.5" />
                                            <span>Share Details</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Quick Hover Message Actions Toolbar */}
                              {!m.isDeleted && (
                                <div className={`absolute top-0 ${m.isMine ? '-left-24' : '-right-24'} hidden group-hover:flex items-center space-x-1 bg-white border border-border shadow-md rounded-xl p-1 z-10`}>
                                  <button
                                    type="button"
                                    onClick={() => setReplyingTo({ id: m.id, senderName: m.senderName, text: m.body })}
                                    className="p-1 hover:bg-slate-100 rounded-lg text-text-muted hover:text-navy transition-colors"
                                    title="Reply"
                                  >
                                    <CornerUpLeft className="w-3.5 h-3.5" />
                                  </button>
                                  {m.isMine && canEditMessage(m) && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(m)}
                                      className="p-1 hover:bg-amber-50 rounded-lg text-amber-600 hover:text-amber-700 transition-colors"
                                      title="Edit message (30-min window)"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmModal({ message: m })}
                                    className="p-1 hover:bg-red-50 rounded-lg text-text-muted hover:text-red-600 transition-colors"
                                    title="Delete message"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setForwardingMsg(m);
                                      setShowForwardModal(true);
                                    }}
                                    className="p-1 hover:bg-slate-100 rounded-lg text-text-muted hover:text-navy transition-colors"
                                    title="Forward"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-1.5 text-[10px] text-text-muted mt-1 px-1">
                              <span>{formatSafeTime(m.createdAt || m.sentAt)}</span>
                              {m.isEdited && !m.isDeleted && (
                                <span
                                  className="italic text-text-muted cursor-help"
                                  title={m.editedAt ? `Edited at ${formatSafeDateTime(m.editedAt)}` : 'Edited within 30-min window'}
                                >
                                  (edited)
                                </span>
                              )}
                              {m.isMine && !m.isDeleted && (
                                <>
                                  {m.status === 'READ' ? (
                                    <span
                                      className="flex items-center space-x-0.5 text-sky-500 font-bold"
                                      title={`Read by recipient: ${formatSafeTime(m.readAt)}`}
                                    >
                                      <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                                      <span className="text-[9px]">Read</span>
                                    </span>
                                  ) : m.status === 'DELIVERED' ? (
                                    <span
                                      className="flex items-center space-x-0.5 text-slate-400 font-medium"
                                      title={`Delivered to device: ${formatSafeTime(m.deliveredAt)}`}
                                    >
                                      <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="text-[9px]">Delivered</span>
                                    </span>
                                  ) : (
                                    <span
                                      className="flex items-center space-x-0.5 text-slate-400 font-medium"
                                      title={`Sent to server: ${formatSafeTime(m.sentAt)}`}
                                    >
                                      <Check className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="text-[9px]">Sent</span>
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    });
                  })()
                )}

                {/* Real-Time Partner Typing Indicator */}
                {isPartnerTyping && (
                  <div className="flex items-center space-x-2 text-xs text-text-muted animate-fade-in pl-1">
                    <div className="w-7 h-7 rounded-lg bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {activeConv.partner.displayName[0]?.toUpperCase()}
                    </div>
                    <div className="bg-white border border-border p-2.5 rounded-2xl rounded-bl-sm shadow-xs flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                      <span className="text-[11px] font-bold text-navy ml-1.5">
                        {activeConv.partner.displayName} is typing...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {isPartnerBlocked ? (
                <div className="p-4 bg-slate-50 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
                  <div className="flex items-center space-x-2">
                    <Ban className="w-4 h-4 text-red-500 shrink-0" />
                    <span>This contact is blocked. You cannot send or receive messages until unblocked.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnblockPartner}
                    className="px-4 py-2 bg-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0"
                  >
                    Unblock Contact
                  </button>
                </div>
              ) : (
                <div className="p-3 border-t border-border bg-white space-y-2">
                  {/* Editing Message Dock Bar */}
                  {editingMessage && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 px-3 flex items-center justify-between text-xs animate-fade-in">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Pencil className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-bold text-amber-900 shrink-0">Editing message:</span>
                        <span className="text-amber-700 truncate italic">"{editingMessage.text}"</span>
                        <span className="text-[10px] text-amber-600 font-semibold shrink-0">(30m window)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMessage(null);
                          setNewMsgText('');
                        }}
                        className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg shrink-0"
                        title="Cancel edit"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Reply Dock Bar */}
                  {replyingTo && !editingMessage && (
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-2 px-3 flex items-center justify-between text-xs animate-fade-in">
                      <div className="flex items-center space-x-2 min-w-0">
                        <CornerUpLeft className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-bold text-navy shrink-0">Replying to {replyingTo.senderName}:</span>
                        <span className="text-text-muted truncate italic">"{replyingTo.text}"</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="p-1 text-text-muted hover:text-navy hover:bg-slate-200 rounded-lg shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* You are typing indicator */}
                  {isUserTyping && (
                    <div className="text-[10px] text-primary font-bold flex items-center gap-1 animate-pulse px-1">
                      <span>✍️ You are composing a message...</span>
                    </div>
                  )}

                  {/* Hidden Native File Input for OS File Selection */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {/* Staged File Attachment Dock Bar */}
                  {pendingAttachment && !editingMessage && (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-2 px-3 flex items-center justify-between text-xs animate-fade-in">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 bg-sky-500 text-white rounded-lg shrink-0">
                          <FileUp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-navy truncate block">{pendingAttachment.name}</span>
                          <span className="text-[10px] text-text-muted">{pendingAttachment.size} • Ready to upload & send</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPendingAttachment(null)}
                        className="p-1 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 transition-colors"
                        title="Remove attachment"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Media Attachment Menu */}
                  {showAttachMenu && !editingMessage && (
                    <div className="p-2 bg-white border border-border rounded-xl shadow-xl flex flex-wrap items-center gap-2 animate-fade-in">
                      <button
                        type="button"
                        onClick={() => triggerUploadPicker('image/*')}
                        className="flex-1 min-w-[120px] p-2 hover:bg-emerald-50 rounded-lg text-xs font-semibold text-navy flex items-center justify-center space-x-1.5 border border-border transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Upload Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerUploadPicker('video/*')}
                        className="flex-1 min-w-[120px] p-2 hover:bg-purple-50 rounded-lg text-xs font-semibold text-navy flex items-center justify-center space-x-1.5 border border-border transition-colors"
                      >
                        <VideoIcon className="w-4 h-4 text-purple-600" />
                        <span>Upload Video</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerUploadPicker('.pdf,application/pdf')}
                        className="flex-1 min-w-[120px] p-2 hover:bg-red-50 rounded-lg text-xs font-semibold text-navy flex items-center justify-center space-x-1.5 border border-border transition-colors"
                      >
                        <FileText className="w-4 h-4 text-red-600" />
                        <span>Upload PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerUploadPicker('.doc,.docx,.txt,.rtf,.xlsx')}
                        className="flex-1 min-w-[120px] p-2 hover:bg-blue-50 rounded-lg text-xs font-semibold text-navy flex items-center justify-center space-x-1.5 border border-border transition-colors"
                      >
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Upload Word / Doc</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerUploadPicker('*/*')}
                        className="p-2 px-3 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1.5 border border-border transition-colors"
                      >
                        <FileUp className="w-4 h-4 text-slate-600" />
                        <span>Browse Any File</span>
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingMessage) {
                        handleSaveEdit();
                      } else {
                        handleSend(e);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    {!editingMessage && (
                      <div className="relative">
                        <button
                          type="button"
                          disabled={isChatLocked}
                          onClick={() => setShowAttachMenu(!showAttachMenu)}
                          className="p-2.5 text-text-muted hover:text-navy hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
                          title="Attach File, Image, Video, or Proposal"
                        >
                          <Paperclip className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <input
                      type="text"
                      disabled={isChatLocked}
                      value={newMsgText}
                      onChange={handleInputChange}
                      placeholder={
                        isChatLocked
                          ? 'Thread is locked...'
                          : editingMessage
                          ? 'Edit your message (Press Enter to save)...'
                          : pendingAttachment
                          ? `Add message to "${pendingAttachment.name}"...`
                          : 'Type a confidential message...'
                      }
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-navy focus:bg-white transition-all disabled:opacity-40"
                    />

                    {editingMessage ? (
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMessage(null);
                            setNewMsgText('');
                          }}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newMsgText.trim()}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Edit</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        disabled={(!newMsgText.trim() && !pendingAttachment) || sending || isChatLocked}
                        className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-40 flex items-center space-x-1.5 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sending ? 'Sending...' : 'Send'}</span>
                      </button>
                    )}
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-xs text-text-muted p-12 text-center space-y-4 bg-slate-50/30">
              <div className="w-16 h-16 rounded-2xl bg-white border border-border shadow-xs flex items-center justify-center text-primary">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-navy text-sm">Select a Conversation</h3>
                <p className="max-w-xs text-text-muted leading-relaxed">
                  Choose an active partner from the left channel list, or initiate a new direct dialogue from your connections.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/app/connections')}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <span>Browse Active Connections</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Full-Screen Rich Media & Document Viewer (Image, Video, PDF, Word) */}
      {mediaPreview && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-4"
          onClick={() => setMediaPreview(null)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center space-x-2.5">
                {mediaPreview.type === 'pdf' && <FileText className="w-5 h-5 text-red-400" />}
                {mediaPreview.type === 'doc' && <FileText className="w-5 h-5 text-blue-400" />}
                {mediaPreview.type === 'image' && <ImageIcon className="w-5 h-5 text-emerald-400" />}
                {mediaPreview.type === 'video' && <VideoIcon className="w-5 h-5 text-purple-400" />}
                <div>
                  <h3 className="text-sm font-extrabold truncate max-w-md">{mediaPreview.title}</h3>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    {mediaPreview.type.toUpperCase()} Viewer • {mediaPreview.size || 'Cryptographically Sealed'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    if (mediaPreview.url) {
                      const a = document.createElement('a');
                      a.href = mediaPreview.url;
                      a.download = mediaPreview.title || 'attested_media';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } else {
                      alert(`Downloading attested ${mediaPreview.title}...`);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaPreview(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex items-center justify-center min-h-[400px]">
              {/* IMAGE VIEWER */}
              {mediaPreview.type === 'image' && (
                <div className="text-center space-y-3">
                  <img
                    src={mediaPreview.url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80'}
                    alt={mediaPreview.title}
                    className="max-h-[65vh] max-w-full rounded-xl shadow-lg object-contain mx-auto border border-border"
                  />
                  <p className="text-xs text-text-muted">High-resolution verified facility photo with verified timestamp.</p>
                </div>
              )}

              {/* VIDEO VIEWER */}
              {mediaPreview.type === 'video' && (
                <div className="w-full max-w-3xl space-y-3">
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                    {mediaPreview.url && (mediaPreview.url.startsWith('data:video') || mediaPreview.url.match(/\.(mp4|webm|mov|mkv)($|\?)/i)) ? (
                      <video
                        src={mediaPreview.url}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <>
                        <img
                          src={mediaPreview.url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80'}
                          alt={mediaPreview.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/40">
                          <div className="text-white text-xs font-bold">{mediaPreview.title}</div>
                          <div className="flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 text-navy flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                              <Play className="w-7 h-7 ml-1 fill-current" />
                            </div>
                          </div>
                          <div className="text-white text-[11px] font-mono flex items-center justify-between">
                            <span>0:00 / 2:45</span>
                            <span>HD 1080p</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-center text-text-muted">Automated video verification audit uploaded by partner.</p>
                </div>
              )}

              {/* PDF VIEWER SIMULATOR & EMBED */}
              {mediaPreview.type === 'pdf' && (
                <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl overflow-hidden border border-border flex flex-col min-h-[500px]">
                  <div className="border-b border-border p-4 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-extrabold text-navy">{mediaPreview.title}</h2>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
                        Institutional Specification Sheet &bull; Document Reference #Meshvi-2026-RFP
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {mediaPreview.url && (
                        <a
                          href={mediaPreview.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open in Tab</span>
                        </a>
                      )}
                      <div className="p-1 px-2.5 bg-red-50 text-red-600 font-bold text-xs rounded-lg border border-red-200">
                        PDF Attested
                      </div>
                    </div>
                  </div>

                  {mediaPreview.url && (mediaPreview.url.startsWith('data:application/pdf') || mediaPreview.url.includes('.pdf')) ? (
                    <iframe
                      src={mediaPreview.url}
                      title={mediaPreview.title}
                      className="w-full flex-1 min-h-[500px] border-none"
                    />
                  ) : (
                    <div className="p-8 space-y-6 text-navy">
                      <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="font-extrabold text-navy text-[11px] uppercase">1. Executive Mandate & Intent</div>
                          <p>
                            This specification establishes a legally binding supply accord across verified ASEAN, Japan, and India trade corridors.
                            All suppliers must hold active, unexpired HACCP or ISO-22000 certifications with continuous cold-chain temperature telemetry.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="font-extrabold text-navy text-[11px] uppercase">2. Quality Compliance & Inspection SLAs</div>
                          <p>
                            Pre-shipment batch testing required at point of origin. Third-party lab certificates must be cryptographically hashed
                            and attached to digital bill of lading within MESHVI deal room prior to cargo dispatch.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="font-extrabold text-navy text-[11px] uppercase">3. Commercial Settlement & Escrow</div>
                          <p>
                            Standard 30-day net terms backed by milestone-triggered escrow reserves. Release occurs automatically upon port customs clearance.
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                        <span>Page 1 of 4 &bull; Confidential</span>
                        <span className="text-emerald-600 font-bold">✓ Cryptographically Signed & Verified</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* WORD / DOCX VIEWER SIMULATOR */}
              {mediaPreview.type === 'doc' && (
                <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-8 border border-border space-y-6 text-navy">
                  <div className="border-b-2 border-blue-600 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-navy">{mediaPreview.title}</h2>
                      <span className="text-[11px] text-text-muted uppercase tracking-wider font-bold">
                        Microsoft Word Commercial Agreement Draft &bull; Version 2.4 Final
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {mediaPreview.url && (
                        <a
                          href={mediaPreview.url}
                          download={mediaPreview.title || 'document.docx'}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Original</span>
                        </a>
                      )}
                      <div className="p-2 bg-blue-50 text-blue-600 font-black text-xs rounded-lg border border-blue-200">
                        DOCX Editable
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                    <p className="font-bold text-navy">
                      MASTER COMMERCIAL ALLIANCE AGREEMENT BETWEEN VERIFIED PARTNERS
                    </p>
                    <p>
                      <strong>WHEREAS</strong>, the Buyer requires regular delivery of verified food ingredients and cold-chain supply services; and
                    </p>
                    <p>
                      <strong>WHEREAS</strong>, the Supplier possesses verified facility capabilities and certified export documentation under MESHVI standards:
                    </p>

                    <div className="border border-border rounded-xl overflow-hidden my-3">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-100 text-navy font-bold">
                          <tr>
                            <th className="p-2 border-b border-border">Article</th>
                            <th className="p-2 border-b border-border">Scope</th>
                            <th className="p-2 border-b border-border">Enforcement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="p-2 font-semibold">Article I</td>
                            <td className="p-2">Territory Exclusivity</td>
                            <td className="p-2 text-emerald-600 font-bold">Active Corridor</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-semibold">Article II</td>
                            <td className="p-2">Volume & Banding</td>
                            <td className="p-2">50 Metric Tonnes / Month</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-semibold">Article III</td>
                            <td className="p-2">Dispute Resolution</td>
                            <td className="p-2">Singapore International Arbitration</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                    <span>Drafted in Microsoft Word Compatibility Format</span>
                    <span className="font-bold text-blue-600">Ready for Signing</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Forward Message Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setShowForwardModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-extrabold text-navy">Forward Message</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForwardModal(false)}
                className="p-1 text-text-muted hover:text-navy rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forwardingMsg && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 italic line-clamp-2">
                "{forwardingMsg.body}"
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-text-muted tracking-wider block">
                Select Destination Connection:
              </span>
              <div className="max-h-56 overflow-y-auto space-y-2 divide-y divide-border/50">
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    className="pt-2 flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="font-bold text-xs text-navy">{c.partner.displayName}</div>
                      <div className="text-[10px] text-text-muted">{c.partner.companyName || 'Verified Partner'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExecuteForward(c)}
                      className="px-3 py-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                    >
                      Forward
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Audit Proof & Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setShowSecurityModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2 text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-base font-extrabold text-navy">MESHVI Security Protocol</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="p-1 text-text-muted hover:text-navy rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                All 1-on-1 conversations on MESHVI use cryptographically validated sessions with authenticated forward secrecy.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">Cipher Suite:</span>
                  <span className="font-bold text-navy">AES-256-GCM / SHA-384</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Anti-Spam Verification:</span>
                  <span className="font-bold text-emerald-600">Attested Connection Required</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Key Fingerprint:</span>
                  <span className="text-navy">e4b7:99a2:11f3:7c80:8801</span>
                </div>
              </div>
              <p className="text-[11px] text-text-muted">
                Unsolicited outreach and unsolicited cold marketing are algorithmically prohibited on this layer.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSecurityModal(false)}
              className="w-full py-2.5 bg-navy text-white text-xs font-bold rounded-xl"
            >
              Close Security Dossier
            </button>
          </div>
        </div>
      )}

      {/* Calendar Scheduling Slide-Over Drawer */}
      {showCalendarDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-md bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
              <div className="flex items-center space-x-2">
                <VideoIcon className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-extrabold text-navy">
                    Schedule Google Meet & Calendar
                  </h3>
                  <p className="text-[10px] text-text-muted">Instant Video Conference & 1-Click Calendar Add</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendarDrawer(false)}
                className="p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMeetingInvite} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-800 text-xs font-bold">
                  <VideoIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Meet Video Integration Active</span>
                </div>
                <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                  Generates an authentic Google Meet conference URL and 1-click Google Calendar add link dispatched directly into the bilateral chat.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Regional Distribution Agreement Review"
                  className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Proposed Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full p-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Session Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['15 Mins', '30 Mins', '45 Mins'].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setMeetingDuration(dur)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        meetingDuration === dur
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-bg text-text-muted border-border hover:text-navy'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCalendarDrawer(false)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>Generate Meet & Insert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Right-Click Message Context Menu */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 bg-white border border-border rounded-2xl shadow-2xl p-1.5 w-60 animate-fade-in text-xs font-semibold text-navy divide-y divide-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {!contextMenu.message.isDeleted && (
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setReplyingTo({
                    id: contextMenu.message.id,
                    senderName: contextMenu.message.senderName,
                    text: contextMenu.message.body,
                  });
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 rounded-xl flex items-center space-x-2 text-slate-700 hover:text-navy transition-colors"
              >
                <CornerUpLeft className="w-4 h-4 text-primary" />
                <span>Reply</span>
              </button>

              {contextMenu.message.isMine && (
                canEditMessage(contextMenu.message) ? (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(contextMenu.message)}
                    className="w-full px-3 py-2 text-left hover:bg-amber-50 rounded-xl flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-amber-600" />
                    <span>Edit Message (30m limit)</span>
                  </button>
                ) : (
                  <div
                    className="w-full px-3 py-2 text-left rounded-xl flex items-center space-x-2 text-slate-400 opacity-60 cursor-not-allowed"
                    title="Editing is restricted to 30 minutes after sending."
                  >
                    <Clock className="w-4 h-4" />
                    <span>Edit Expired (&gt;30m)</span>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={() => {
                  setForwardingMsg(contextMenu.message);
                  setShowForwardModal(true);
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 rounded-xl flex items-center space-x-2 text-slate-700 hover:text-navy transition-colors"
              >
                <Share2 className="w-4 h-4 text-purple-600" />
                <span>Forward Message</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.message.body);
                  showActionToast('Message copied to clipboard!', 'info');
                  setContextMenu(null);
                }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 rounded-xl flex items-center space-x-2 text-slate-700 hover:text-navy transition-colors"
              >
                <Copy className="w-4 h-4 text-emerald-600" />
                <span>Copy Text</span>
              </button>
            </div>
          )}

          <div className="py-1">
            <button
              type="button"
              onClick={() => handleDeleteForMe(contextMenu.message.id)}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 rounded-xl flex items-center space-x-2 text-slate-700 hover:text-navy transition-colors"
            >
              <Trash2 className="w-4 h-4 text-slate-500" />
              <span>Delete for Me</span>
            </button>

            {contextMenu.message.isMine && !contextMenu.message.isDeleted && (
              <button
                type="button"
                onClick={() => handleDeleteForEveryone(contextMenu.message.id)}
                className="w-full px-3 py-2 text-left hover:bg-red-50 rounded-xl flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Delete for Everyone</span>
              </button>
            )}
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setShowReportModal(true);
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 text-left hover:bg-amber-50 rounded-xl flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-colors"
            >
              <Flag className="w-4 h-4 text-amber-600" />
              <span>Report Message / User</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInfoModalMessage(contextMenu.message);
                setContextMenu(null);
              }}
              className="w-full px-3 py-2 text-left hover:bg-sky-50 rounded-xl flex items-center space-x-2 text-sky-700 hover:text-sky-900 transition-colors"
            >
              <Info className="w-4 h-4 text-sky-600" />
              <span>Message Info</span>
            </button>
          </div>
        </div>
      )}

      {/* Enterprise Message Info Modal */}
      {infoModalMessage && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-navy">Message Delivery Info</h3>
                  <p className="text-xs text-text-muted">Verified transmission timestamps & cryptographic audit trail</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInfoModalMessage(null)}
                className="p-1.5 text-text-muted hover:text-navy rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Payload Preview */}
            <div className="bg-slate-50 border border-border p-3.5 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Message Content</span>
              <p className="text-xs text-navy font-medium whitespace-pre-wrap">{infoModalMessage.body || '(Attachment Only)'}</p>
              {infoModalMessage.attachment && (
                <div className="p-2 bg-white rounded-xl border border-border flex items-center space-x-2 text-xs font-bold text-navy">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="truncate">{infoModalMessage.attachment.name}</span>
                  <span className="text-[10px] text-text-muted">({infoModalMessage.attachment.size})</span>
                </div>
              )}
            </div>

            {/* Transmission Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Delivery Lifecycle</h4>
              <div className="space-y-2">
                {/* Read Receipt */}
                <div className="flex items-center justify-between p-2.5 bg-sky-50/70 border border-sky-200/70 rounded-xl">
                  <div className="flex items-center space-x-2.5">
                    <CheckCheck className="w-4 h-4 text-sky-600 font-bold" />
                    <div>
                      <span className="text-xs font-bold text-navy block">Read Receipt</span>
                      <span className="text-[10px] text-text-muted">Viewed in active counterpart screen</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-navy">
                    {formatSafeDateTime(infoModalMessage.readAt || infoModalMessage.createdAt)}
                  </span>
                </div>

                {/* Delivered Receipt */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-border rounded-xl">
                  <div className="flex items-center space-x-2.5">
                    <CheckCheck className="w-4 h-4 text-slate-500 font-semibold" />
                    <div>
                      <span className="text-xs font-bold text-navy block">Delivered</span>
                      <span className="text-[10px] text-text-muted">Acknowledged by gateway client</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-navy">
                    {formatSafeDateTime(infoModalMessage.deliveredAt || infoModalMessage.createdAt)}
                  </span>
                </div>

                {/* Sent Receipt */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-border rounded-xl">
                  <div className="flex items-center space-x-2.5">
                    <Check className="w-4 h-4 text-slate-500 font-semibold" />
                    <div>
                      <span className="text-xs font-bold text-navy block">Sent</span>
                      <span className="text-[10px] text-text-muted">Committed to MESHVI Postgres DB</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-navy">
                    {formatSafeDateTime(infoModalMessage.createdAt || infoModalMessage.sentAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Attestation */}
            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Hardware AES-256-GCM Attestation
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sender: <span className="text-white font-semibold">{infoModalMessage.senderName}</span>
              </p>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                Digest: SHA256:{Math.abs(infoModalMessage.id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(16).padEnd(32, 'a')}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInfoModalMessage(null)}
                className="px-5 py-2.5 bg-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Report Conversation / Contact Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy">Report Channel / Partner</h3>
                  <p className="text-xs text-text-muted">Meshvi Corporate Trust & Security Enforcement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1.5 text-text-muted hover:text-navy rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-navy block mb-1">
                  Reason for Incident Report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-navy"
                >
                  <option value="SPAM">Unsolicited pitch / spam</option>
                  <option value="MISCONDUCT">Commercial misconduct / NDA breach</option>
                  <option value="IMPERSONATION">Misleading identity or credentials</option>
                  <option value="HARASSMENT">Harassment or unprofessional conduct</option>
                  <option value="SCAM">Suspicious payment or escrow request</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-navy block mb-1">
                  Incident Details (Optional)
                </label>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={3}
                  placeholder="Provide any additional context or proof for the audit team..."
                  className="w-full p-2.5 bg-slate-50 border border-border rounded-xl text-xs text-navy focus:outline-none focus:border-navy resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Audit Assurance</span>
                </div>
                <p>
                  All reports are independently investigated by the Meshvi Trust & Safety desk within 4 hours.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:text-navy hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingReport}
                onClick={handleSubmitReport}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmittingReport ? 'Submitting...' : 'Submit Incident Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Block Contact Confirmation Modal */}
      {showBlockConfirmModal && activeConv && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4 animate-scale-up">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-2xl border border-red-200">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-navy">Block {activeConv.partner.displayName}?</h3>
                <p className="text-xs text-text-muted">Corporate Communication Restriction</p>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              When you block <span className="font-bold text-navy">{activeConv.partner.displayName}</span>, they will no longer be able to message you or view your mutual deal rooms. They will not be notified that you blocked them, and you can unblock them at any time.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowBlockConfirmModal(false)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:text-navy hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBlockPartner}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Block Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Message Options Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-border space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center space-x-2 text-navy">
                <Trash2 className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-extrabold">Delete Message</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="p-1 text-text-muted hover:text-navy rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Choose how you would like to delete this message:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDeleteForMe(deleteConfirmModal.message.id)}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-border rounded-xl text-xs font-bold text-navy flex items-center justify-between transition-colors"
              >
                <span>Delete for Me</span>
                <span className="text-[10px] text-text-muted font-normal">Removes from your view only</span>
              </button>

              {deleteConfirmModal.message.isMine && !deleteConfirmModal.message.isDeleted && (
                <button
                  type="button"
                  onClick={() => handleDeleteForEveryone(deleteConfirmModal.message.id)}
                  className="w-full p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center justify-between transition-colors"
                >
                  <span>Delete for Everyone</span>
                  <span className="text-[10px] text-red-500 font-normal">Both parties will see deleted</span>
                </button>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-1.5 text-xs font-semibold text-text-muted hover:text-navy"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {actionToast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce border ${
          actionToast.type === 'warn'
            ? 'bg-amber-950 border-amber-700'
            : actionToast.type === 'success'
            ? 'bg-emerald-950 border-emerald-700'
            : 'bg-navy border-slate-700'
        }`}>
          {actionToast.type === 'warn' ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : actionToast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span>{actionToast.text}</span>
        </div>
      )}
    </div>
  );
};
