import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Globe,
  Lock,
  MessageSquare,
  Hash,
  Send,
  CheckCircle2,
  Share2,
  Building2,
  Users,
  UserCheck,
  UserPlus,
  X,
  Handshake,
  TrendingUp,
  Layers,
  Inbox,
  MoreVertical,
  Edit3,
  Archive,
  Trash2,
  Bookmark,
  EyeOff,
  Flag,
  FileText,
  HelpCircle,
  MapPin,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  PartnershipPost,
  NetworkPerson,
  NetworkCompany,
  NETWORK_PEOPLE,
  NETWORK_COMPANIES,
  getStoredPosts,
  saveStoredPosts,
  getRegisteredHashtags,
  addPartnershipRequest,
  getStoredPartnershipRequests,
  getSavedPostIds,
  toggleSavePostId,
  getHiddenPostIds,
  addHiddenPostId,
  removeHiddenPostId,
  deleteStoredPost,
  toggleArchiveStoredPost,
} from '../../data/partnershipsData';
import { CreatePartnershipPostModal } from '../../components/ui/CreatePartnershipPostModal';
import { EditPartnershipPostModal } from '../../components/ui/EditPartnershipPostModal';
import { ReportPostModal } from '../../components/ui/ReportPostModal';
import { PostAnalyticsModal } from '../../components/ui/PostAnalyticsModal';
import { ReshareModal } from '../../components/ui/ReshareModal';
import { InitiatePartnershipModal } from '../../components/ui/InitiatePartnershipModal';
import { ExecutiveTeaserModal } from '../../components/ui/ExecutiveTeaserModal';
import { PartnershipGuidelinesModal } from '../../components/ui/PartnershipGuidelinesModal';
import { PartnershipDetailModal } from '../../components/ui/PartnershipDetailModal';

interface KanbanDeal {
  id: string;
  title: string;
  amount: number;
  stage: 'QUALIFIED' | 'DISCOVERY' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';
  probability: number;
  age: string;
  company: string;
  dueDate: string;
  avatarInitials: string;
  notes?: string;
}

const INITIAL_DEALS: KanbanDeal[] = [
  {
    id: 'deal-1',
    title: 'Product Launch – Kinetic Labs',
    amount: 22000,
    stage: 'QUALIFIED',
    probability: 20,
    age: '4d',
    company: 'Kinetic Labs',
    dueDate: 'Mar 30',
    avatarInitials: 'KL',
  },
  {
    id: 'deal-2',
    title: 'Brand Strategy – Arcadia Ventures',
    amount: 8000,
    stage: 'DISCOVERY',
    probability: 40,
    age: '2d',
    company: 'Arcadia Ventures',
    dueDate: 'Mar 31',
    avatarInitials: 'AV',
  },
  {
    id: 'deal-3',
    title: 'Website Redesign – Bloom Studio',
    amount: 12500,
    stage: 'PROPOSAL_SENT',
    probability: 70,
    age: '3d',
    company: 'Bloom Studio',
    dueDate: 'Apr 1',
    avatarInitials: 'BS',
  },
  {
    id: 'deal-4',
    title: 'Health Portal – Meridian',
    amount: 55000,
    stage: 'PROPOSAL_SENT',
    probability: 30,
    age: 'now',
    company: 'Meridian Health',
    dueDate: 'Apr 4',
    avatarInitials: 'MH',
  },
  {
    id: 'deal-5',
    title: 'Event Platform – Riviera',
    amount: 15000,
    stage: 'PROPOSAL_SENT',
    probability: 50,
    age: '1d',
    company: 'Riviera Hospitality',
    dueDate: 'Apr 3',
    avatarInitials: 'RH',
  },
  {
    id: 'deal-6',
    title: 'Logistics App – Atlas Freight',
    amount: 41000,
    stage: 'PROPOSAL_SENT',
    probability: 60,
    age: '2d',
    company: 'Atlas Freight',
    dueDate: 'Mar 29',
    avatarInitials: 'AF',
  },
  {
    id: 'deal-7',
    title: 'IP Portfolio Review – Summit Legal',
    amount: 9500,
    stage: 'NEGOTIATION',
    probability: 100,
    age: 'now',
    company: 'Summit Legal',
    dueDate: 'Apr 2',
    avatarInitials: 'SL',
  },
  {
    id: 'deal-8',
    title: 'Lab Management System – Helix',
    amount: 28000,
    stage: 'NEGOTIATION',
    probability: 15,
    age: 'now',
    company: 'Helix Biotech',
    dueDate: 'Apr 1',
    avatarInitials: 'HB',
  },
  {
    id: 'deal-9',
    title: 'Office Renovation Plans – Norden',
    amount: 45000,
    stage: 'WON',
    probability: 80,
    age: 'now',
    company: 'Norden Architecture',
    dueDate: 'Apr 3',
    avatarInitials: 'NA',
  },
  {
    id: 'deal-10',
    title: 'Annual Retainer – Tidewater',
    amount: 36000,
    stage: 'WON',
    probability: 100,
    age: 'now',
    company: 'Tidewater Consulting',
    dueDate: 'Mar 25',
    avatarInitials: 'TC',
  },
  {
    id: 'deal-11',
    title: 'Digital Transformation – Canopy',
    amount: 32000,
    stage: 'WON',
    probability: 75,
    age: 'now',
    company: 'Canopy Digital',
    dueDate: 'Mar 31',
    avatarInitials: 'CD',
  },
  {
    id: 'deal-12',
    title: 'Financial Dashboard – Cobalt',
    amount: 15000,
    stage: 'LOST',
    probability: 0,
    age: 'now',
    company: 'Cobalt Financial',
    dueDate: 'Mar 15',
    avatarInitials: 'CF',
    notes: 'Budget constraints — chose in-house solution',
  },
];

export const PartnershipsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  // Top Consolidated Destination Tab: FEED | DEALS | REQUESTS
  const [mainNavTab, setMainNavTab] = useState<'FEED' | 'DEALS' | 'REQUESTS'>(() => {
    const tabParam = searchParams.get('tab')?.toUpperCase();
    if (tabParam === 'DEALS' || tabParam === 'PIPELINE') return 'DEALS';
    if (tabParam === 'REQUESTS') return 'REQUESTS';
    return 'FEED';
  });

  // Kanban Deals State (Screenshot 4)
  const [deals, setDeals] = useState<KanbanDeal[]>(() => {
    try {
      const stored = localStorage.getItem('meshvi_kanban_deals');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return INITIAL_DEALS;
  });
  const [dealFilter, setDealFilter] = useState<'PIPELINE' | 'CLOSED'>('PIPELINE');
  const [newDealModalStage, setNewDealModalStage] = useState<string | null>(null);
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealCompany, setNewDealCompany] = useState('');
  const [newDealAmount, setNewDealAmount] = useState('25000');

  const [posts, setPosts] = useState<PartnershipPost[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONNECTIONS_ONLY' | 'PUBLIC'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<NetworkPerson | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<NetworkCompany | null>(null);

  // Search Autocomplete State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // 3-Dots Dropdown & Action States
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const menuContainerRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTargetPost, setEditTargetPost] = useState<PartnershipPost | null>(null);
  const [reportTargetPost, setReportTargetPost] = useState<PartnershipPost | null>(null);
  const [analyticsPost, setAnalyticsPost] = useState<PartnershipPost | null>(null);
  const [reshareTarget, setReshareTarget] = useState<PartnershipPost | null>(null);
  const [initiatePartnerPost, setInitiatePartnerPost] = useState<PartnershipPost | null>(null);
  const [teaserTargetPost, setTeaserTargetPost] = useState<PartnershipPost | null>(null);
  const [detailTargetPost, setDetailTargetPost] = useState<PartnershipPost | null>(null);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  // Comment Thread & @mention state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [activeMentionPostId, setActiveMentionPostId] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string>('');

  // Deep linking highlight
  const targetPostId = searchParams.get('postId');
  const postRefs = useRef<Record<string, HTMLElement | null>>({});

  // Requests counter
  const [requestsCount, setRequestsCount] = useState<number>(0);

  const currentUserName = user?.profile?.displayName || user?.email?.split('@')[0] || 'Srikanth';

  useEffect(() => {
    const loaded = getStoredPosts();
    setPosts(loaded);
    setRequestsCount(getStoredPartnershipRequests().length);
    setSavedPostIds(getSavedPostIds());
    setHiddenPostIds(getHiddenPostIds());
  }, []);

  // Handle deep-link scrolling
  useEffect(() => {
    if (targetPostId && posts.length > 0) {
      const el = postRefs.current[targetPostId];
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [targetPostId, posts]);

  // Click outside search autocomplete listener & 3-dots menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (openMenuPostId) {
        const el = menuContainerRef.current[openMenuPostId];
        if (el && !el.contains(e.target as Node)) {
          setOpenMenuPostId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuPostId]);

  const handlePostCreated = (newPost: PartnershipPost) => {
    setPosts((prev) => [newPost, ...prev]);
    showToast({
      title: 'Partnership Post Published',
      message: `"${newPost.title}" is now active and broadcast to your selected audience.`,
      type: 'success',
    });
  };

  const handlePostUpdated = (updatedPost: PartnershipPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setEditTargetPost(null);
    showToast({
      title: 'Partnership Post Updated ✓',
      message: `"${updatedPost.title}" was successfully modified.`,
      type: 'success',
    });
  };

  const handleDeletePost = (post: PartnershipPost) => {
    setOpenMenuPostId(null);
    if (!confirm(`Are you sure you want to delete "${post.title}"? This cannot be undone.`)) {
      return;
    }
    deleteStoredPost(post.id);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    showToast({
      title: 'Post Deleted',
      message: `"${post.title}" was removed from the network.`,
      type: 'warning',
    });
  };

  const handleToggleArchivePost = (post: PartnershipPost) => {
    setOpenMenuPostId(null);
    const isNowArchived = toggleArchiveStoredPost(post.id);
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, isArchived: isNowArchived } : p))
    );
    showToast({
      title: isNowArchived ? 'Post Archived 📦' : 'Post Unarchived ✓',
      message: isNowArchived
        ? `"${post.title}" is now archived and hidden from public discovery.`
        : `"${post.title}" is restored and active in the network feed.`,
      type: 'info',
    });
  };

  const handleToggleSavePost = (postId: string) => {
    setOpenMenuPostId(null);
    const isSaved = toggleSavePostId(postId);
    setSavedPostIds(getSavedPostIds());
    showToast({
      title: isSaved ? 'Post Saved to Vault 💾' : 'Post Removed from Saved',
      message: isSaved ? 'Added to your executive saved mandates vault.' : 'Removed from saved items.',
      type: 'success',
    });
  };

  const handleHidePost = (post: PartnershipPost) => {
    setOpenMenuPostId(null);
    addHiddenPostId(post.id);
    setHiddenPostIds(getHiddenPostIds());
    showToast({
      title: 'Post Hidden 👁️‍🗨️',
      message: `"${post.title}" has been hidden from your current feed.`,
      type: 'info',
    });
  };

  const handleUnhidePost = (postId: string) => {
    removeHiddenPostId(postId);
    setHiddenPostIds(getHiddenPostIds());
    showToast({
      title: 'Post Restored',
      message: 'Post is visible in your feed again.',
      type: 'success',
    });
  };

  const handleToggleComments = (postId: string) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Mention autocomplete in comment input
  const handleCommentChange = (postId: string, text: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: text }));

    const lastAtIdx = text.lastIndexOf('@');
    if (lastAtIdx !== -1) {
      const queryAfterAt = text.slice(lastAtIdx + 1);
      if (!queryAfterAt.includes('\n') && queryAfterAt.length <= 20) {
        setActiveMentionPostId(postId);
        setMentionQuery(queryAfterAt.toLowerCase());
        return;
      }
    }
    setActiveMentionPostId(null);
    setMentionQuery('');
  };

  const handleSelectMention = (postId: string, person: NetworkPerson) => {
    const currentText = commentInputs[postId] || '';
    const lastAtIdx = currentText.lastIndexOf('@');
    if (lastAtIdx !== -1) {
      const updated = currentText.slice(0, lastAtIdx) + `@${person.name} `;
      setCommentInputs((prev) => ({ ...prev, [postId]: updated }));
    }
    setActiveMentionPostId(null);
    setMentionQuery('');
  };

  const handleCreateNewDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle.trim() || !newDealCompany.trim()) return;
    const stage = (newDealModalStage as any) || 'QUALIFIED';
    const newDeal: KanbanDeal = {
      id: `deal-${Date.now()}`,
      title: newDealTitle.trim(),
      company: newDealCompany.trim(),
      amount: Number(newDealAmount) || 20000,
      stage: stage,
      probability: stage === 'WON' ? 100 : stage === 'PROPOSAL_SENT' ? 60 : 30,
      age: 'now',
      dueDate: 'Apr 30',
      avatarInitials: newDealCompany.trim().slice(0, 2).toUpperCase(),
    };
    const updated = [newDeal, ...deals];
    setDeals(updated);
    try {
      localStorage.setItem('meshvi_kanban_deals', JSON.stringify(updated));
    } catch { /* ignore */ }
    setNewDealModalStage(null);
    setNewDealTitle('');
    setNewDealCompany('');
    setNewDealAmount('25000');
    showToast({
      title: 'Deal Created ✓',
      message: `"${newDeal.title}" added to ${stage} stage.`,
      type: 'success',
    });
  };

  const handleAddComment = (post: PartnershipPost, e: React.FormEvent) => {
    e.preventDefault();
    const text = (commentInputs[post.id] || '').trim();
    if (!text) return;

    const tagged: string[] = [];
    NETWORK_PEOPLE.forEach((p) => {
      if (text.includes(`@${p.name}`)) {
        tagged.push(p.name);
      }
    });

    const newComment = {
      id: `c-${Date.now()}`,
      authorName: currentUserName,
      authorAvatar: user?.profile?.avatarUrl || null,
      content: text,
      createdAt: new Date().toISOString(),
      taggedPeople: tagged.length > 0 ? tagged : undefined,
    };

    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === post.id) {
          const newComments = [...(p.comments || []), newComment];
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: newComments,
          };
        }
        return p;
      });
      saveStoredPosts(updated);
      return updated;
    });

    setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
    setActiveMentionPostId(null);

    // Bilateral Notifications
    showToast({
      title: 'Comment Dispatched to Author',
      message: `${post.authorName} was notified of your comment on "${post.title}".`,
      type: 'info',
    });

    if (tagged.length > 0) {
      tagged.forEach((taggedName) => {
        showToast({
          title: 'Connection Tagged & Alerted',
          message: `@${taggedName} received an alert regarding "${post.title}".`,
          type: 'opportunity',
        });
      });
    }
  };

  const handleInitiatePartnershipSubmit = (
    reasonType: 'PARTNERSHIP' | 'CONNECTION',
    proposalNote: string
  ) => {
    if (!initiatePartnerPost) return;

    const authorPerson = NETWORK_PEOPLE.find(
      (p) => p.name === initiatePartnerPost.authorName
    );
    const isConn = Boolean(authorPerson?.isActiveConnection);

    addPartnershipRequest({
      postId: initiatePartnerPost.id,
      postTitle: initiatePartnerPost.title,
      postAuthorCompany: initiatePartnerPost.authorCompany,
      direction: 'OUTGOING',
      senderName: currentUserName,
      senderRole: user?.profile?.currentTitle || 'Verified Business Executive',
      senderCompany: user?.profile?.company?.name || 'Apex Industries Ltd',
      senderAvatar: user?.profile?.avatarUrl || null,
      recipientName: initiatePartnerPost.authorName,
      recipientRole: initiatePartnerPost.authorRole,
      recipientCompany: initiatePartnerPost.authorCompany,
      recipientAvatar: initiatePartnerPost.authorAvatar || null,
      reasonType,
      proposalNote,
      status: 'PENDING',
      isAlreadyConnected: isConn,
    });

    setRequestsCount((prev) => prev + 1);

    showToast({
      title: isConn ? 'Partnership Request Dispatched 🤝' : 'Proposal & Connection Request Sent 🤝',
      message: `Your proposal has been delivered to ${initiatePartnerPost.authorName} (${initiatePartnerPost.authorCompany}). Track in Requests.`,
      type: 'success',
    });
  };

  const handleConnectWithPerson = (person: NetworkPerson) => {
    showToast({
      title: 'Connection Request Sent 🤝',
      message: `Bilateral connection invitation delivered to ${person.name} (${person.company}).`,
      type: 'success',
    });
  };

  const handleSharePostLink = (post: PartnershipPost) => {
    const url = `${window.location.origin}/app/partnerships?postId=${post.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast({
          title: 'Public Link Copied!',
          message: `Shareable URL for "${post.title}" copied to clipboard. Ready to paste on LinkedIn, Slack, or email.`,
          type: 'success',
        });
      }).catch(() => {
        prompt('Copy partnership post URL:', url);
      });
    } else {
      prompt('Copy partnership post URL:', url);
    }
  };

  const handleReshareSubmit = (commentary: string) => {
    if (!reshareTarget) return;

    const newResharedPost: PartnershipPost = {
      id: `post-reshare-${Date.now()}`,
      authorId: user?.id || 'current-user',
      authorName: currentUserName,
      authorRole: user?.profile?.currentTitle || 'Verified Business Executive',
      authorCompany: user?.profile?.company?.name || 'Corporate Enterprise',
      authorAvatar: user?.profile?.avatarUrl || null,
      title: `Reshared: ${reshareTarget.title}`,
      content: commentary || `Endorsing this partnership request from ${reshareTarget.authorName}.`,
      visibility: reshareTarget.visibility,
      tags: reshareTarget.tags,
      likesCount: 0,
      commentsCount: 0,
      resharesCount: 0,
      impressionsCount: 1,
      isLiked: false,
      originalPostId: reshareTarget.id,
      originalPost: reshareTarget,
      reshareCommentary: commentary || null,
      createdAt: new Date().toISOString(),
      comments: [],
    };

    setPosts((prev) => {
      const updatedTargetList = prev.map((p) => {
        if (p.id === reshareTarget.id) {
          return { ...p, resharesCount: p.resharesCount + 1 };
        }
        return p;
      });
      const finalPosts = [newResharedPost, ...updatedTargetList];
      saveStoredPosts(finalPosts);
      return finalPosts;
    });

    showToast({
      title: 'Post Reshared',
      message: `Successfully reshared "${reshareTarget.title}" to your enterprise network.`,
      type: 'success',
    });

    setReshareTarget(null);
  };

  // Autocomplete Suggestions computation
  const searchSuggestions = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return null;

    const isHashSearch = trimmed.startsWith('#');
    const cleanQ = trimmed.replace(/^#+/, '').toLowerCase();

    const registered = getRegisteredHashtags().map((h) => h.tag.replace(/^#/, ''));
    const postTags = posts.flatMap((p) => p.tags.map((t) => t.replace(/^#/, '')));
    const defaultCorporateTags = [
      'search',
      'supplychain',
      'jointventure',
      'crossborder',
      'fintech',
      'pharmaceuticals',
      'logistics',
      'licensing',
      'distribution',
      'manufacturing',
      'infrastructure',
      'mergers',
      'privateequity',
      'compliance',
      'greentech',
    ];
    const allTags = Array.from(new Set([...postTags, ...registered, ...defaultCorporateTags]));

    const matchingTags = allTags
      .filter((t) => {
        if (!cleanQ) return true; // user typed '#' -> show trending corporate tags
        return t.toLowerCase().includes(cleanQ);
      })
      .map((tag) => ({
        tag: `#${tag}`,
        rawTag: tag,
        count: posts.filter((p) =>
          p.tags.some((t) => t.replace(/^#/, '').toLowerCase() === tag.toLowerCase())
        ).length,
      }))
      .slice(0, 8);

    const matchingPosts = cleanQ
      ? posts
          .filter(
            (p) =>
              p.title.toLowerCase().includes(cleanQ) ||
              p.content.toLowerCase().includes(cleanQ) ||
              p.tags.some((t) => t.toLowerCase().includes(cleanQ))
          )
          .slice(0, 4)
      : [];

    const matchingPeople = cleanQ
      ? NETWORK_PEOPLE.filter(
          (person) =>
            person.name.toLowerCase().includes(cleanQ) ||
            person.company.toLowerCase().includes(cleanQ) ||
            person.role.toLowerCase().includes(cleanQ)
        ).slice(0, 4)
      : [];

    const matchingCompanies = cleanQ
      ? NETWORK_COMPANIES.filter(
          (comp) =>
            comp.name.toLowerCase().includes(cleanQ) ||
            comp.industry.toLowerCase().includes(cleanQ)
        ).slice(0, 3)
      : [];

    return {
      isHashSearch,
      tags: matchingTags,
      posts: matchingPosts,
      people: matchingPeople,
      companies: matchingCompanies,
      hasAny:
        matchingTags.length > 0 ||
        matchingPosts.length > 0 ||
        matchingPeople.length > 0 ||
        matchingCompanies.length > 0,
    };
  }, [searchQuery, posts]);

  // Mention Autocomplete suggestions in comments
  const mentionSuggestions = useMemo(() => {
    if (!activeMentionPostId) return [];
    return NETWORK_PEOPLE.filter(
      (p) =>
        p.name.toLowerCase().includes(mentionQuery) ||
        p.company.toLowerCase().includes(mentionQuery)
    ).slice(0, 4);
  }, [activeMentionPostId, mentionQuery]);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    // Hide posts hidden by current user
    if (hiddenPostIds.includes(post.id)) return false;

    // Filter archived posts unless specifically searching or mine
    const isOwnPost = post.authorId === (user?.id || 'current-user') || post.authorName.toLowerCase() === currentUserName.toLowerCase();
    if (post.isArchived && !isOwnPost) return false;

    if (activeTab === 'CONNECTIONS_ONLY' && post.visibility !== 'CONNECTIONS_ONLY') return false;
    if (activeTab === 'PUBLIC' && post.visibility !== 'PUBLIC') return false;

    if (
      selectedTag &&
      !post.tags.some(
        (t) => t.replace(/^#/, '').toLowerCase() === selectedTag.replace(/^#/, '').toLowerCase()
      )
    ) {
      return false;
    }

    if (selectedPerson) {
      const matchAuthor = post.authorName.toLowerCase() === selectedPerson.name.toLowerCase();
      const taggedInPost = (post.comments || []).some((c) =>
        c.taggedPeople?.includes(selectedPerson.name)
      );
      if (!matchAuthor && !taggedInPost) return false;
    }

    if (selectedCompany) {
      if (post.authorCompany.toLowerCase() !== selectedCompany.name.toLowerCase()) {
        return false;
      }
    }

    if (searchQuery.trim() && !selectedPerson && !selectedCompany && !selectedTag) {
      const q = searchQuery.toLowerCase().replace(/^#+/, '').trim();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchContent = post.content.toLowerCase().includes(q);
      const matchAuthor = post.authorName.toLowerCase().includes(q);
      const matchCompany = post.authorCompany.toLowerCase().includes(q);
      const matchTag = post.tags.some((t) => t.toLowerCase().replace(/^#+/, '').includes(q));
      if (!matchTitle && !matchContent && !matchAuthor && !matchCompany && !matchTag) {
        return false;
      }
    }

    return true;
  });

  // Extract trending tags
  const tagCounts: Record<string, number> = {};
  posts.forEach((p) => {
    p.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const trendingTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9);

  const clearAllFilters = () => {
    setSelectedTag(null);
    setSelectedPerson(null);
    setSelectedCompany(null);
    setSearchQuery('');
    if (targetPostId) {
      setSearchParams({});
    }
  };

  const renderCommentWithMentions = (content: string) => {
    const parts = content.split(/(@[A-Za-z0-9. _-]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={i}
            className="inline-flex items-center px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold text-[11px] border border-primary/20"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const totalPublicCount = posts.filter((p) => p.visibility === 'PUBLIC' && !hiddenPostIds.includes(p.id)).length;
  const totalConnCount = posts.filter((p) => p.visibility === 'CONNECTIONS_ONLY' && !hiddenPostIds.includes(p.id)).length;

  const STAGES = [
    { key: 'QUALIFIED' as const, label: 'Qualified', dotColor: 'bg-slate-700' },
    { key: 'DISCOVERY' as const, label: 'Discovery', dotColor: 'bg-indigo-600' },
    { key: 'PROPOSAL_SENT' as const, label: 'Proposal Sent', dotColor: 'bg-amber-500' },
    { key: 'NEGOTIATION' as const, label: 'Negotiation', dotColor: 'bg-rose-500' },
    { key: 'WON' as const, label: 'Won', dotColor: 'bg-emerald-500' },
    { key: 'LOST' as const, label: 'Lost', dotColor: 'bg-slate-400' },
  ];

  return (
    <div className="space-y-3 sm:space-y-3.5 max-w-6xl mx-auto pb-10 pt-1">
      {/* Top Partnerships Sub-Tabs (Consolidated Architecture) */}
      <div className="flex items-center space-x-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => {
            setMainNavTab('FEED');
            setSearchParams({});
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            mainNavTab === 'FEED'
              ? 'bg-navy text-white shadow-xs'
              : 'text-text-muted hover:text-navy hover:bg-surface-muted'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Opportunities Feed ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMainNavTab('DEALS');
            setSearchParams({ tab: 'deals' });
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
            mainNavTab === 'DEALS'
              ? 'bg-navy text-white shadow-xs'
              : 'text-text-muted hover:text-navy hover:bg-surface-muted'
          }`}
        >
          <Handshake className="w-3.5 h-3.5" />
          <span>My Deals (Pipeline)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800">
            {deals.length}
          </span>
        </button>

        <Link
          to="/app/partnerships/requests"
          className="px-4 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-navy hover:bg-surface-muted transition-colors flex items-center space-x-2"
        >
          <Inbox className="w-3.5 h-3.5 text-primary" />
          <span>Sent Requests</span>
          {requestsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary">
              {requestsCount}
            </span>
          )}
        </Link>
      </div>

      {mainNavTab === 'DEALS' ? (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Deals Top Header & Metric Bar (Screenshot 4) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-border/80 shadow-2xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-black text-navy tracking-tight">Deals</h2>
                <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setDealFilter('PIPELINE')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      dealFilter === 'PIPELINE' ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-navy'
                    }`}
                  >
                    Pipeline
                  </button>
                  <button
                    type="button"
                    onClick={() => setDealFilter('CLOSED')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      dealFilter === 'CLOSED' ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-navy'
                    }`}
                  >
                    Closed
                  </button>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                <span className="font-bold text-navy">{deals.length} deals</span> &bull;{' '}
                <span className="font-bold text-emerald-700">${deals.reduce((a, b) => a + b.amount, 0).toLocaleString()} total value</span>
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center space-x-1.5 border border-slate-200">
                <span>Sales Pipeline</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <button
                type="button"
                onClick={() => setNewDealModalStage('QUALIFIED')}
                className="px-4 py-2 bg-navy hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Deal</span>
              </button>
            </div>
          </div>

          {/* Kanban Board Columns (Horizontal layout matching Screenshot 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
            {STAGES.filter(st => {
              if (dealFilter === 'PIPELINE') return st.key !== 'WON' && st.key !== 'LOST';
              if (dealFilter === 'CLOSED') return st.key === 'WON' || st.key === 'LOST';
              return true;
            }).map((st) => {
              const stageDeals = deals.filter((d) => d.stage === st.key);
              const stageTotal = stageDeals.reduce((a, b) => a + b.amount, 0);

              return (
                <div key={st.key} className="bg-slate-50/70 border border-border/80 rounded-2xl p-3 flex flex-col justify-between space-y-3 min-w-[210px]">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${st.dotColor}`} />
                        <span className="text-xs font-extrabold text-navy">{st.label}</span>
                        <span className="text-[10px] font-bold text-slate-400">{stageDeals.length}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">
                        ${Math.round(stageTotal / 1000)}k
                      </span>
                    </div>

                    <div className="space-y-2.5 mt-3">
                      {stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-white border border-border/70 hover:border-primary/50 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-navy group-hover:text-primary transition-colors line-clamp-1">
                              {deal.title}
                            </h4>
                            <MoreVertical className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          <div className="flex items-center space-x-2 text-[11px]">
                            <span className="font-extrabold text-navy">${deal.amount.toLocaleString()}</span>
                            <span className="text-slate-400 font-semibold">{deal.probability}%</span>
                            <span className="text-slate-400">{deal.age}</span>
                          </div>

                          <div className="text-[10.5px] text-text-muted flex items-center space-x-1">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{deal.company}</span>
                          </div>

                          {deal.notes && (
                            <p className="text-[10px] text-rose-500 italic line-clamp-2 leading-snug">
                              {deal.notes}
                            </p>
                          )}

                          <div className="pt-1.5 border-t border-border/60 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{deal.dueDate}</span>
                            </span>
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center justify-center shadow-2xs">
                              {deal.avatarInitials}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNewDealModalStage(st.key)}
                    className="w-full py-2 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-white text-xs font-semibold text-text-muted hover:text-primary transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Deal</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Simple New Deal Modal */}
          {newDealModalStage && (
            <div className="fixed inset-0 bg-navy/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-navy">Add New Deal ({newDealModalStage})</h3>
                  <button onClick={() => setNewDealModalStage(null)} className="p-1 text-slate-400 hover:text-navy">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateNewDealSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">Deal Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Enterprise Cloud Migration"
                      value={newDealTitle}
                      onChange={(e) => setNewDealTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">Company / Account *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Global Logistics"
                      value={newDealCompany}
                      onChange={(e) => setNewDealCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">Estimated Value ($) *</label>
                    <input
                      type="number"
                      required
                      value={newDealAmount}
                      onChange={(e) => setNewDealAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewDealModalStage(null)}
                      className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:text-navy cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Create Deal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 1. Header Banner & Link to Requests Tracker */}
          <div className="bg-surface border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9.5px] font-bold uppercase tracking-wider flex items-center space-x-1">
              <Handshake className="w-2.5 h-2.5" />
              <span>B2B Relationship Engine</span>
            </span>
            <span className="text-[11px] text-text-muted">• Partnerships & Connections</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-navy tracking-tight">
            Partnership Posts & Activities
          </h1>
          <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
            Discover commercial co-ventures, licensing tenders, and supply chain requests from verified executives.
          </p>
        </div>

        {/* Action Group: Requests Tracker Page + Post Button */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 z-10 w-full sm:w-auto">
          <Link
            to="/app/partnerships/requests"
            className="px-3 py-1.5 bg-surface hover:bg-surface-muted text-navy font-semibold text-xs rounded-lg border border-border transition-colors flex items-center space-x-1.5 shadow-2xs"
          >
            <Inbox className="w-3.5 h-3.5 text-primary" />
            <span>Requests Tracker</span>
            {requestsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-bold">
                {requestsCount}
              </span>
            )}
          </Link>

          {/* Info / Guidelines Modal Button */}
          <button
            onClick={() => setIsGuidelinesOpen(true)}
            className="px-2.5 py-1.5 bg-surface hover:bg-surface-muted text-navy font-semibold text-xs rounded-lg border border-border hover:border-primary/40 transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            title="Partnership Mandate Guidelines & Standards"
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Guidelines</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Post Partnership Request</span>
            <span className="sm:hidden">Post Request</span>
          </button>
        </div>
      </div>

      {/* Hidden Posts Bar Notice (if any posts were hidden) */}
      {hiddenPostIds.length > 0 && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-700">
            <EyeOff className="w-4 h-4 text-slate-500" />
            <span>You have {hiddenPostIds.length} hidden post(s) in this session.</span>
          </div>
          <button
            onClick={() => {
              hiddenPostIds.forEach((id) => handleUnhidePost(id));
            }}
            className="text-primary hover:underline font-bold text-xs"
          >
            Restore All Hidden Posts
          </button>
        </div>
      )}

      {/* 2. Unified Discovery & Filter Console */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Row A: Search Input + 3 Clean Category Tabs: All Requests, Only Connections, Public */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box with 2-char autocomplete */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hashtags (#apac), counterparties, companies..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full pl-9 pr-8 py-2.5 bg-surface-muted/60 border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-navy text-xs"
              >
                ✕
              </button>
            )}

            {/* Suggestions Popover */}
            {isSearchFocused && searchSuggestions && searchSuggestions.hasAny && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface border border-border rounded-2xl shadow-xl z-40 overflow-hidden divide-y divide-border animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
                {searchSuggestions.tags.length > 0 && (
                  <div className="p-2">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center space-x-1">
                      <Hash className="w-3 h-3 text-primary" />
                      <span>Hashtags</span>
                    </div>
                    {searchSuggestions.tags.map((item) => (
                      <button
                        key={item.tag}
                        onClick={() => {
                          setSearchQuery(item.tag);
                          setSelectedTag(item.rawTag);
                          setIsSearchFocused(false);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-surface-muted flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <span className="font-bold text-primary group-hover:underline">
                          {item.tag}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {item.count > 0 ? `${item.count} ${item.count === 1 ? 'mandate' : 'mandates'}` : 'Search hashtag'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchSuggestions.posts.length > 0 && (
                  <div className="p-2">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-primary" />
                      <span>Commercial Mandates</span>
                    </div>
                    {searchSuggestions.posts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => {
                          setSearchQuery(post.title);
                          setIsSearchFocused(false);
                          const el = postRefs.current[post.id];
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="w-full p-2 rounded-lg text-left hover:bg-surface-muted flex items-start justify-between transition-colors gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-navy truncate">{post.title}</div>
                          <div className="text-[10px] text-text-muted truncate">
                            {post.authorName} • {post.authorCompany}
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold shrink-0">
                          View
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchSuggestions.people.length > 0 && (
                  <div className="p-2">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center space-x-1">
                      <Users className="w-3 h-3 text-indigo-600" />
                      <span>People & Connections</span>
                    </div>
                    {searchSuggestions.people.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => {
                          setSelectedPerson(person);
                          setIsSearchFocused(false);
                        }}
                        className="w-full p-2 rounded-lg text-left hover:bg-surface-muted flex items-center justify-between transition-colors gap-2"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {person.avatar ? (
                            <img
                              src={person.avatar}
                              alt={person.name}
                              className="w-7 h-7 rounded-lg object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {person.name[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-navy truncate">{person.name}</div>
                            <div className="text-[10px] text-text-muted truncate">
                              {person.role} • {person.company}
                            </div>
                          </div>
                        </div>

                        {person.isActiveConnection ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0 flex items-center space-x-1">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Connection</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold shrink-0">
                            Counterparty
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {searchSuggestions.companies.length > 0 && (
                  <div className="p-2">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-primary" />
                      <span>Companies</span>
                    </div>
                    {searchSuggestions.companies.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => {
                          setSelectedCompany(comp);
                          setIsSearchFocused(false);
                        }}
                        className="w-full p-2 rounded-lg text-left hover:bg-surface-muted flex items-center justify-between transition-colors gap-2"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 font-bold text-xs">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-navy truncate">{comp.name}</div>
                            <div className="text-[10px] text-text-muted truncate">
                              {comp.industry} • {comp.location}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-primary font-bold shrink-0">
                          {comp.verifiedMembersCount} members
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3 Clean Tabs: All Requests, Only Connections, Public */}
          <div className="inline-flex p-1 bg-surface-muted border border-border rounded-xl self-start lg:self-auto shadow-2xs">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'ALL'
                  ? 'bg-surface text-navy shadow-xs border border-border'
                  : 'text-text-muted hover:text-navy'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Requests</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'ALL' ? 'bg-primary/10 text-primary' : 'bg-surface text-text-muted'}`}>
                {filteredPosts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('CONNECTIONS_ONLY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'CONNECTIONS_ONLY'
                  ? 'bg-surface text-navy shadow-xs border border-border'
                  : 'text-text-muted hover:text-navy'
              }`}
            >
              <Lock className="w-3 h-3 text-indigo-600" />
              <span>Only Connections</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                {totalConnCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('PUBLIC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'PUBLIC'
                  ? 'bg-surface text-navy shadow-xs border border-border'
                  : 'text-text-muted hover:text-navy'
              }`}
            >
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>Global Exchange</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                {totalPublicCount}
              </span>
            </button>
          </div>
        </div>

        {/* Row B: Sector & Trending Topics Pill Rack */}
        <div className="pt-2.5 border-t border-border/80 flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 text-text-muted text-xs font-bold mr-1 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] uppercase tracking-wider text-navy font-bold">Deal Focus & Sectors:</span>
          </div>

          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              selectedTag === null
                ? 'bg-navy text-white border-navy shadow-xs'
                : 'bg-surface-muted border-border text-text-muted hover:text-navy'
            }`}
          >
            All Sectors
          </button>

          {trendingTags.map(([tag, count]) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-surface border-border text-navy hover:border-primary/40 hover:bg-surface-muted'
                }`}
              >
                <span>#{tag}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-surface-muted text-text-muted'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep Link Notice (if viewing shared post) */}
      {targetPostId && (
        <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold text-navy">
              Viewing shared partnership post <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[11px] font-mono">{targetPostId}</code>
            </span>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="text-primary hover:underline font-bold text-xs flex items-center space-x-1"
          >
            <span>View All Posts</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Filter Bar if user filtered by tag, person, company */}
      {(selectedPerson || selectedCompany || selectedTag) && (
        <div className="p-3.5 bg-surface rounded-xl border border-border shadow-xs flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-text-muted font-medium">Active filter:</span>
            {selectedPerson && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-surface-muted text-navy border border-border font-bold text-xs">
                {selectedPerson.isActiveConnection ? (
                  <span className="inline-flex items-center text-emerald-700 space-x-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Connection: {selectedPerson.name}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center text-slate-700 space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Counterparty: {selectedPerson.name}</span>
                  </span>
                )}
              </span>
            )}
            {selectedCompany && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
                <Building2 className="w-3.5 h-3.5" />
                <span>Company: {selectedCompany.name}</span>
              </span>
            )}
            {selectedTag && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
                <Hash className="w-3.5 h-3.5" />
                <span>#{selectedTag}</span>
              </span>
            )}
          </div>
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-text-muted hover:text-navy flex items-center space-x-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {/* Network Counterparty Notice Banner (if person clicked is NOT an active connection) */}
      {selectedPerson && !selectedPerson.isActiveConnection && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-bold text-navy flex items-center space-x-1.5">
              <span>Network Counterparty Profile: {selectedPerson.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">2nd Degree</span>
            </div>
            <div className="text-text-muted text-[11px]">
              {selectedPerson.role} at <strong>{selectedPerson.company}</strong>. Review public requests, join discussions, or connect directly.
            </div>
          </div>
          <button
            onClick={() => handleConnectWithPerson(selectedPerson)}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Connect & Request Bilateral Access</span>
          </button>
        </div>
      )}

      {/* 3. Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center text-text-muted mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy">No partnership posts match your filter</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Try resetting your search query or focus sector, or broadcast your own partnership request to the network.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={clearAllFilters}
                className="px-3.5 py-2 bg-surface hover:bg-surface-muted text-navy font-bold text-xs rounded-xl border border-border transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Request</span>
              </button>
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isCommentsOpen = Boolean(openComments[post.id]);
            const commentsList = post.comments || [];
            const isTargetHighlight = targetPostId === post.id;
            const authorPerson = NETWORK_PEOPLE.find((p) => p.name === post.authorName);
            void authorPerson;
            const isOwnPost =
              post.authorId === (user?.id || 'current-user') ||
              post.authorName.toLowerCase() === currentUserName.toLowerCase() ||
              post.authorName === 'Srikanth';
            const isSaved = savedPostIds.includes(post.id);
            const isMenuOpen = openMenuPostId === post.id;
            const categoryLabel = (post.dealTeaser as any)?.category || post.dealTeaser?.scope || 'Strategic Co-Venture';

            return (
              <article
                key={post.id}
                ref={(el) => (postRefs.current[post.id] = el)}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 ${
                  isTargetHighlight
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-border/80 hover:border-primary/40'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-5 items-stretch">
                  {/* Left Visual Category Graphic or Preview (Screenshot 3 style) */}
                  <div className="w-full md:w-52 h-40 md:h-auto rounded-xl bg-gradient-to-br from-[#102B45] via-[#1E3A8A] to-[#078BCC] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden shrink-0 shadow-inner group">
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2 shadow-sm text-2xl">
                      {categoryLabel.toLowerCase().includes('invest') ? '💼' : categoryLabel.toLowerCase().includes('prod') ? '🚀' : '🤝'}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-sky-200 text-center line-clamp-1">
                      {categoryLabel}
                    </span>
                    <span className="text-[10px] text-white/80 mt-1 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-300" />
                      <span className="truncate max-w-[140px]">{post.dealTeaser?.geographicReach || 'Cross-Border'}</span>
                    </span>
                  </div>

                  {/* Right Content & Actions */}
                  <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                    <div className="space-y-2">
                      {/* Top Header: Category Square & 3-Dots Menu */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-xs bg-[#078BCC]" />
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-navy">
                            {categoryLabel}
                          </span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-[10.5px] font-semibold text-text-muted">
                            {post.visibility === 'PUBLIC' ? 'Global Exchange' : 'Only Connections'}
                          </span>
                        </div>

                        {/* Three-Dots Menu */}
                        <div
                          ref={(el) => (menuContainerRef.current[post.id] = el)}
                          className="relative"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuPostId((prev) => (prev === post.id ? null : post.id))
                            }
                            className="p-1 rounded-lg text-text-muted hover:text-navy hover:bg-slate-100 transition-colors cursor-pointer"
                            title="More Post Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-xl shadow-xl z-30 py-1 divide-y divide-border text-xs animate-in fade-in zoom-in-95 duration-100">
                              {isOwnPost ? (
                                <>
                                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted bg-slate-50">
                                    Manage Your Post
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuPostId(null);
                                      setEditTargetPost(post);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 text-navy font-medium"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-primary" />
                                    <span>Edit Post</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleArchivePost(post)}
                                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 text-navy font-medium"
                                  >
                                    <Archive className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{post.isArchived ? 'Unarchive Post' : 'Archive Post'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePost(post)}
                                    className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center space-x-2 text-rose-600 font-bold"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Post</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSavePost(post.id)}
                                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 text-navy font-medium"
                                  >
                                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-primary text-primary' : 'text-text-muted'}`} />
                                    <span>{isSaved ? 'Remove from Saved' : 'Save Post'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleHidePost(post)}
                                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 text-navy font-medium"
                                  >
                                    <EyeOff className="w-3.5 h-3.5 text-text-muted" />
                                    <span>Hide Post</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuPostId(null);
                                      setReportTargetPost(post);
                                    }}
                                    className="w-full px-3 py-2 text-left hover:bg-rose-50 flex items-center space-x-2 text-rose-600 font-bold"
                                  >
                                    <Flag className="w-3.5 h-3.5" />
                                    <span>Report Post</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => setDetailTargetPost(post)}
                        className="text-base sm:text-lg font-black text-navy hover:text-primary transition-colors cursor-pointer line-clamp-1 tracking-tight"
                      >
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p
                        onClick={() => setDetailTargetPost(post)}
                        className="text-xs text-text-muted line-clamp-2 leading-relaxed cursor-pointer hover:text-slate-800"
                      >
                        {post.content}
                      </p>

                      {/* Sector / Topic Tags Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {tag.replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer: Publisher Identity & Action Buttons */}
                    <div className="pt-3 border-t border-border/80 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {post.authorAvatar ? (
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {post.authorName[0]?.toUpperCase() || 'E'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-bold text-navy truncate">{post.authorName}</span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          </div>
                          <div className="text-[10.5px] text-text-muted truncate">
                            {post.authorRole} &bull; {post.authorCompany}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSavePost(post.id)}
                          className="p-1.5 rounded-xl border border-border hover:bg-slate-50 text-slate-500 hover:text-navy transition-colors cursor-pointer"
                          title={isSaved ? 'Remove from Saved' : 'Save Mandate'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleComments(post.id)}
                          className="p-1.5 rounded-xl border border-border hover:bg-slate-50 text-slate-500 hover:text-navy transition-colors flex items-center space-x-1 text-xs cursor-pointer"
                          title="Comments"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-[10px] font-bold">{post.commentsCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDetailTargetPost(post)}
                          className="px-3 py-1.5 rounded-xl border border-border hover:bg-slate-50 text-navy font-bold text-xs transition-colors cursor-pointer"
                        >
                          <span>Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInitiatePartnerPost(post)}
                          className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Initiate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Thread Drawer with @mention tagging */}
                {isCommentsOpen && (
                  <div className="pt-3 border-t border-border/60 space-y-3">
                    {commentsList.length > 0 ? (
                      <div className="space-y-2">
                        {commentsList.map((c) => (
                          <div key={c.id} className="p-2.5 rounded-xl bg-surface-muted/50 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-navy">{c.authorName}</span>
                              <span className="text-[10px] text-text-muted">
                                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-text leading-relaxed">
                              {renderCommentWithMentions(c.content)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted italic">No comments yet. Start the conversation!</p>
                    )}

                    {/* Comment input form with @mention autocomplete */}
                    <div className="relative">
                      {activeMentionPostId === post.id && mentionSuggestions.length > 0 && (
                        <div className="absolute bottom-full mb-1.5 left-0 right-0 bg-surface border border-border rounded-xl shadow-xl z-30 overflow-hidden divide-y divide-border animate-in zoom-in-95 duration-100">
                          <div className="px-3 py-1.5 bg-surface-muted/60 text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1">
                            <Users className="w-3 h-3 text-primary" />
                            <span>Tag Connection or Counterparty</span>
                          </div>
                          {mentionSuggestions.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectMention(post.id, p)}
                              className="w-full p-2.5 text-left hover:bg-surface-muted flex items-center justify-between transition-colors gap-2"
                            >
                              <div className="flex items-center space-x-2 min-w-0">
                                {p.avatar ? (
                                  <img
                                    src={p.avatar}
                                    alt={p.name}
                                    className="w-6 h-6 rounded-md object-cover border border-border shrink-0"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-md bg-navy text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {p.name[0]}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-navy truncate">@{p.name}</div>
                                  <div className="text-[10px] text-text-muted truncate">
                                    {p.role} • {p.company}
                                  </div>
                                </div>
                              </div>
                              {p.isActiveConnection ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  Active 🤝
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  Network
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      <form onSubmit={(e) => handleAddComment(post, e)} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type comment or @mention a connection (e.g. @Elena)..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => handleCommentChange(post.id, e.target.value)}
                          className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-xs"
                        />
                        <button
                          type="submit"
                          disabled={!(commentInputs[post.id] || '').trim()}
                          className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-40 flex items-center space-x-1 shrink-0"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
      </>
    )}

      {/* Modals */}
      <CreatePartnershipPostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <EditPartnershipPostModal
        post={editTargetPost}
        isOpen={Boolean(editTargetPost)}
        onClose={() => setEditTargetPost(null)}
        onPostUpdated={handlePostUpdated}
      />

      <ReportPostModal
        post={reportTargetPost}
        isOpen={Boolean(reportTargetPost)}
        onClose={() => setReportTargetPost(null)}
        reporterName={currentUserName}
        reporterEmail={user?.email}
        onReportSubmitted={() => {
          showToast({
            title: 'Report Submitted to Platform Admin 🛡️',
            message: 'Our platform integrity team has received your report for review.',
            type: 'warning',
          });
        }}
      />

      <ReshareModal
        post={reshareTarget}
        isOpen={Boolean(reshareTarget)}
        onClose={() => setReshareTarget(null)}
        onReshareSubmit={handleReshareSubmit}
      />

      <PostAnalyticsModal
        post={analyticsPost}
        isOpen={Boolean(analyticsPost)}
        onClose={() => setAnalyticsPost(null)}
      />

      <InitiatePartnershipModal
        post={initiatePartnerPost}
        isOpen={Boolean(initiatePartnerPost)}
        onClose={() => setInitiatePartnerPost(null)}
        isAlreadyConnected={
          initiatePartnerPost
            ? Boolean(NETWORK_PEOPLE.find((p) => p.name === initiatePartnerPost.authorName)?.isActiveConnection)
            : false
        }
        onSubmit={handleInitiatePartnershipSubmit}
      />

      <ExecutiveTeaserModal
        post={teaserTargetPost}
        isOpen={Boolean(teaserTargetPost)}
        onClose={() => setTeaserTargetPost(null)}
        onInitiatePartnership={(p) => {
          setTeaserTargetPost(null);
          setInitiatePartnerPost(p);
        }}
      />

      <PartnershipDetailModal
        post={detailTargetPost}
        isOpen={Boolean(detailTargetPost)}
        onClose={() => setDetailTargetPost(null)}
        onInitiatePartnership={(p) => {
          setDetailTargetPost(null);
          setInitiatePartnerPost(p);
        }}
        onShareLink={handleSharePostLink}
      />

      <PartnershipGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />
    </div>
  );
};
