import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MeshviColors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { apiRequest } from '../../services/api';
import { CreatePartnershipPostModal } from '../../components/CreatePartnershipPostModal';

const { width, height } = Dimensions.get('window');

export interface DealTeaser {
  scope: string;
  volumeThreshold: string;
  geographicReach: string;
  capitalRequired?: string;
  fileName?: string;
  isGated: boolean;
}

export interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
}

export interface PartnershipPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  authorAvatar?: string | null;
  imageUrl?: string | null;
  dealTeaser?: DealTeaser;
  title: string;
  content: string;
  visibility: 'CONNECTIONS_ONLY' | 'PUBLIC';
  tags: string[];
  likesCount: number;
  commentsCount: number;
  resharesCount: number;
  impressionsCount: number;
  isLiked?: boolean;
  createdAt: string;
  comments?: CommentItem[];
}

const INITIAL_POSTS: PartnershipPost[] = [
  {
    id: 'post-1',
    authorId: 'user-elena',
    authorName: 'Dr. Elena Rostova',
    authorRole: 'Chief Commercial Officer & Partner',
    authorCompany: 'Nordic Biologics & Wellness',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    dealTeaser: {
      scope: 'Commercial cold-chain distribution & clinical diagnostic co-marketing',
      volumeThreshold: '$6M - $15M Annual Turnover Commitment',
      geographicReach: 'Singapore, Malaysia, Japan (APAC Transit Corridors)',
      capitalRequired: '$3.5M Co-Investment Allocation',
      fileName: 'Nordic_Bio_APAC_Licensing_Spec_Sheet.pdf',
      isGated: true,
    },
    title: 'Seeking Bilateral Distribution & Licensing Partner in APAC Region',
    content:
      'Nordic Biologics is expanding into Southeast Asia. We are seeking vetted commercial distribution partners, hospital networks, and clinical research groups for bilateral co-marketing of certified metabolic screening protocols.\n\nLooking for entities with established cold-chain retail logistics and regulatory clearance across SG, MY, and JP.',
    visibility: 'PUBLIC',
    tags: ['healthcare', 'distribution', 'apac', 'licensing', 'b2bcommerce'],
    likesCount: 28,
    commentsCount: 2,
    resharesCount: 4,
    impressionsCount: 430,
    isLiked: false,
    createdAt: '2h ago',
    comments: [
      {
        id: 'c-1',
        authorName: 'Srikanth',
        content: 'Elena, Apex Industries has active consumer retail logistics across Singapore and Malaysia. Tagging @Priya Sharma to review cold-chain compliance.',
        createdAt: '1h ago',
      },
      {
        id: 'c-2',
        authorName: 'Oliver Bose',
        content: 'High-synergy collaboration. Bilateral clinical dossier is ready for NDA review.',
        createdAt: '30m ago',
      },
    ],
  },
  {
    id: 'post-2',
    authorId: 'user-srikanth',
    authorName: 'Srikanth',
    authorRole: 'Verified Business Executive',
    authorCompany: 'Apex Industries Ltd',
    authorAvatar: null,
    dealTeaser: {
      scope: 'Airport VIP Lounges, Automated Kiosks & Gourmet Beverage Concessions',
      volumeThreshold: '2.4M Passengers Annual Transit Footprint',
      geographicReach: 'Singapore Changi, Dubai DXB & Regional Asian Hubs',
      capitalRequired: '$8.0M Tendering Allocation',
      fileName: 'Apex_Airport_Concessions_Teaser.pdf',
      isGated: false,
    },
    title: 'Joint Venture Proposal: Airport Retail Concessions & Luxury Beverage Sourcing',
    content:
      'Apex Industries is finalizing long-term concession tenders for regional airport lounges. We are seeking verified counterparties for cold brew beverage sourcing, organic confectionery, and automated contactless retail kiosks.\n\nPrefer suppliers with bilateral intent and minimum 3 years of enterprise fulfillment.',
    visibility: 'PUBLIC',
    tags: ['retail', 'airports', 'concessions', 'beverage', 'jointventure'],
    likesCount: 19,
    commentsCount: 1,
    resharesCount: 2,
    impressionsCount: 310,
    isLiked: true,
    createdAt: '5h ago',
    comments: [
      {
        id: 'c-3',
        authorName: 'Alexander Chen',
        content: 'We represent two premium beverage manufacturers in Taiwan and Vietnam ready to fulfill airport volumes. Tagging @Bhavana Lee for cross-border freight routes.',
        createdAt: '3h ago',
      },
    ],
  },
  {
    id: 'post-3',
    authorId: 'user-alex',
    authorName: 'Alexander Chen',
    authorRole: 'Managing Director & Global Sourcing Lead',
    authorCompany: 'Apex Global Logistics',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    dealTeaser: {
      scope: 'Tier-1 bonded warehouse node integration & container routing',
      volumeThreshold: '$40M Retail Distribution Contract Pipeline',
      geographicReach: '14 Bonded Nodes Across ASEAN & GCC',
      capitalRequired: '$5.0M Liquidity Allocation',
      fileName: 'Apex_Global_Logistics_SLA.pdf',
      isGated: true,
    },
    title: 'Cross-Border Supply Chain Distribution Corridor Alliance',
    content:
      'Seeking Tier-1 logistics routing software integration and cold-chain distributors across 14 bonded warehouse nodes in Singapore, Malaysia, and Dubai.\n\nDirect access to $40M retail distribution pipelines with expedited customs clearance and bilateral SLA guarantees.',
    visibility: 'CONNECTIONS_ONLY',
    tags: ['logistics', 'supplychain', 'crossborder', 'coldchain', 'apac'],
    likesCount: 34,
    commentsCount: 3,
    resharesCount: 6,
    impressionsCount: 520,
    isLiked: false,
    createdAt: 'Yesterday',
    comments: [],
  },
];

const PRESEEDED_HASHTAGS = [
  'partnership',
  'jointventure',
  'b2bcommerce',
  'supplychain',
  'apac',
  'crossborder',
  'healthcare',
  'retail',
  'distribution',
  'enterprise',
];

const CORPORATE_BANNER_PRESETS = [
  {
    id: 'supply-chain',
    label: 'Supply Chain & Logistics',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cross-border',
    label: 'Cross-Border JV & Trade',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tech-cloud',
    label: 'Enterprise Infrastructure',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pharma-health',
    label: 'Pharma & Biotech Corridors',
    url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
  },
];

interface PartnershipsScreenProps {
  onNavigateTab?: (tab: string, initialQuery?: string, partner?: any) => void;
  onBack?: () => void;
}

export const PartnershipsScreen: React.FC<PartnershipsScreenProps> = ({ onNavigateTab, onBack }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showSuccess, showError } = useModal();

  const [posts, setPosts] = useState<PartnershipPost[]>(INITIAL_POSTS);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONNECTIONS_ONLY' | 'PUBLIC'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Saved / Bookmarked Post IDs
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<string>>(new Set());
  const [initiatedPostIds, setInitiatedPostIds] = useState<Set<string>>(new Set());

  // 75% Details Modal Target Post
  const [detailsModalTarget, setDetailsModalTarget] = useState<PartnershipPost | null>(null);
  const [commentInputText, setCommentInputText] = useState('');

  // Initiate Modal Target
  const [initiateModalTarget, setInitiateModalTarget] = useState<PartnershipPost | null>(null);
  const [initiateProposalNote, setInitiateProposalNote] = useState('');
  const [initiateSmartDraftIndex, setInitiateSmartDraftIndex] = useState(0);
  const [isSubmittingInitiate, setIsSubmittingInitiate] = useState(false);

  // Create Mandate Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Guidelines & Analytics Modals
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [analyticsTargetPost, setAnalyticsTargetPost] = useState<PartnershipPost | null>(null);
  const [selectedMenuPostId, setSelectedMenuPostId] = useState<string | null>(null);

  const currentUserName = user?.profile?.displayName || user?.name || 'Srikanth';

  // Autocomplete Suggestions computation
  const searchSuggestions = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return null;

    const cleanQ = trimmed.replace(/^#+/, '').toLowerCase();
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
    const postTags = posts.flatMap((p) => p.tags.map((t) => t.replace(/^#/, '')));
    const allTags = Array.from(new Set([...postTags, ...defaultCorporateTags]));

    const matchingTags = allTags
      .filter((t) => {
        if (!cleanQ) return true; // user typed '#' -> show trending hashtags!
        return t.toLowerCase().includes(cleanQ);
      })
      .map((tag) => ({
        tag: `#${tag}`,
        rawTag: tag,
        count: posts.filter((p) =>
          p.tags.some((t) => t.replace(/^#/, '').toLowerCase() === tag.toLowerCase())
        ).length,
      }))
      .slice(0, 6);

    const matchingPosts = cleanQ
      ? posts
          .filter(
            (p) =>
              p.title.toLowerCase().includes(cleanQ) ||
              p.content.toLowerCase().includes(cleanQ) ||
              p.tags.some((t) => t.toLowerCase().includes(cleanQ))
          )
          .slice(0, 3)
      : [];

    return {
      tags: matchingTags,
      posts: matchingPosts,
      hasAny: matchingTags.length > 0 || matchingPosts.length > 0,
    };
  }, [searchQuery, posts]);

  // Execute Search: Queries live backend database AND filters local posts
  const executeSearch = async (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : searchQuery).trim();
    if (!q) {
      setPosts(INITIAL_POSTS);
      return;
    }

    setLoadingSearch(true);
    try {
      const res = await apiRequest<any>(`/search?q=${encodeURIComponent(q)}&limit=10`);
      const rawResults = res.data?.results || res.data?.matches || (Array.isArray(res.data) ? res.data : []);

      const backendPosts: PartnershipPost[] = rawResults.map((r: any, idx: number) => {
        const p = r.profile || r;
        return {
          id: `search-post-${p.id || idx}`,
          authorId: p.userId || p.id || `auth-${idx}`,
          authorName: p.displayName || p.name || 'Verified Decision Maker',
          authorRole: p.currentTitle || p.headline || 'Executive Partner',
          authorCompany: p.company?.name || p.companyName || 'Corporate Partner',
          authorAvatar: p.avatarUrl,
          title: r.explanation?.matchReason || p.headline || `Mandate: Strategic Partnership with ${p.company?.name || 'Enterprise'}`,
          content: r.laymanTransparency?.whyConnectRationale || p.summary || 'Seeking reciprocal commercial alignment across global trading corridors.',
          visibility: 'PUBLIC',
          tags: [p.industry ? p.industry.toLowerCase().replace(/[^a-z]/g, '') : 'partnership', 'b2bcommerce'],
          likesCount: 14 + idx * 3,
          commentsCount: 1,
          resharesCount: 2,
          impressionsCount: 280,
          createdAt: 'Recently Active',
        };
      });

      // Filter local posts too
      const localMatches = INITIAL_POSTS.filter(
        (p) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.content.toLowerCase().includes(q.toLowerCase()) ||
          p.authorName.toLowerCase().includes(q.toLowerCase()) ||
          p.authorCompany.toLowerCase().includes(q.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
      );

      const merged = [...localMatches, ...backendPosts];
      setPosts(merged.length > 0 ? merged : INITIAL_POSTS);
    } catch {
      // Fallback local filter
    } finally {
      setLoadingSearch(false);
    }
  };

  // Filter Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (hiddenPostIds.has(post.id)) return false;

      // Tab filter
      if (activeTab === 'CONNECTIONS_ONLY' && post.visibility !== 'CONNECTIONS_ONLY') return false;
      if (activeTab === 'PUBLIC' && post.visibility !== 'PUBLIC') return false;

      // Tag filter (normalized for #)
      if (
        selectedTag &&
        !post.tags.some(
          (t) => t.replace(/^#/, '').toLowerCase() === selectedTag.replace(/^#/, '').toLowerCase()
        )
      ) {
        return false;
      }

      // Search Query filter (instant local filter)
      if (searchQuery.trim() && !selectedTag) {
        const q = searchQuery.toLowerCase().replace(/^#+/, '').trim();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchContent = post.content.toLowerCase().includes(q);
        const matchAuthor = post.authorName.toLowerCase().includes(q) || post.authorCompany.toLowerCase().includes(q);
        const matchTag = post.tags.some((t) => t.toLowerCase().replace(/^#+/, '').includes(q));
        if (!matchTitle && !matchContent && !matchAuthor && !matchTag) return false;
      }

      return true;
    });
  }, [posts, activeTab, selectedTag, searchQuery, hiddenPostIds]);

  // Toggle Like
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );
  };

  // Toggle Save / Bookmark
  const handleToggleSave = (postId: string) => {
    setSavedPostIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(postId)) {
        updated.delete(postId);
        showSuccess('Bookmark Removed', 'Mandate removed from your saved list.');
      } else {
        updated.add(postId);
        showSuccess('Mandate Saved', 'Mandate bookmarked to your executive dossier.');
      }
      return updated;
    });
    setSelectedMenuPostId(null);
  };

  // Hide Post
  const handleHidePost = (postId: string) => {
    setHiddenPostIds((prev) => new Set([...prev, postId]));
    setSelectedMenuPostId(null);
    showSuccess('Mandate Hidden', 'This mandate has been removed from your active feed.');
  };

  // Add Comment to Target Post
  const handleAddComment = (postId: string) => {
    if (!commentInputText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      authorName: user?.profile?.displayName || user?.name || 'Executive Member',
      content: commentInputText.trim(),
      createdAt: 'Just now',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = [...(p.comments || []), newComment];
          const updatedPost = {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: updatedComments,
          };
          if (detailsModalTarget?.id === postId) {
            setDetailsModalTarget(updatedPost);
          }
          return updatedPost;
        }
        return p;
      })
    );
    setCommentInputText('');
  };

  // Open Initiate Modal
  const handleOpenInitiateModal = (post: PartnershipPost) => {
    setInitiateModalTarget(post);
    setInitiateSmartDraftIndex(0);
    setInitiateProposalNote(
      `Hi ${post.authorName}, our commercial roadmap at ${user?.profile?.currentCompanyName || 'our enterprise'} closely aligns with your mandate "${post.title}". We would like to initiate a confidential bilateral discussion.`
    );
  };

  // Cycle Smart Drafts
  const handleCycleInitiateDraft = () => {
    if (!initiateModalTarget) return;
    const drafts = [
      `Hi ${initiateModalTarget.authorName}, we reviewed your mandate "${initiateModalTarget.title}". We have verified fulfillment capacity in this corridor and would value discussing terms.`,
      `Hi ${initiateModalTarget.authorName}, our executive leadership at ${user?.profile?.currentCompanyName || 'our enterprise'} is actively evaluating JVs in this space. Ready to exchange reciprocal agendas.`,
      `Hi ${initiateModalTarget.authorName}, following your mandate with high synergy. Would like to initiate a confidential Deal Room handshake.`,
    ];
    const nextIdx = (initiateSmartDraftIndex + 1) % drafts.length;
    setInitiateSmartDraftIndex(nextIdx);
    setInitiateProposalNote(drafts[nextIdx]);
  };

  // Submit Initiate Partnership Proposal
  const handleSubmitInitiateProposal = async () => {
    if (!initiateModalTarget) return;
    if (!initiateProposalNote.trim()) {
      showError('Note Required', 'Please enter a proposal note explaining your bilateral fit.');
      return;
    }

    setIsSubmittingInitiate(true);
    const res = await apiRequest('/connections', {
      method: 'POST',
      body: {
        recipientProfileId: initiateModalTarget.authorId,
        businessReason: initiateProposalNote.trim(),
        opportunityPitch: `Bilateral Mandate JV: ${initiateModalTarget.title}`,
        mutualGoals: `Partnership Mandate | ${initiateModalTarget.authorCompany}`,
      },
    });

    setIsSubmittingInitiate(false);
    setInitiatedPostIds((prev: Set<string>) => new Set([...prev, initiateModalTarget.id]));
    setInitiateModalTarget(null);

    showSuccess(
      '🤝 Partnership Proposal Dispatched',
      `Your verified JV proposal has been transmitted directly to ${initiateModalTarget.authorName} at ${initiateModalTarget.authorCompany}.`
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ======================================================== */}
        {/* 1. TOP HEADER & ACTION COMMANDS                          */}
        {/* ======================================================== */}
        <View style={styles.headerSection}>
          <View style={styles.headerTitleRow}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Feather name="arrow-left" size={17} color={MeshviColors.primary} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1, marginLeft: onBack ? 8 : 0 }}>
              <View style={styles.headerBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.headerBadgeText}>ENTERPRISE DEAL EXCHANGE</Text>
              </View>
              <Text style={styles.headerTitle}>Partnerships & Mandates</Text>
              <Text style={styles.headerSubtitle}>
                Publish reciprocal mandates, discover bilateral JVs, and initiate verified deals.
              </Text>
            </View>
          </View>

          {/* Quick Header Buttons */}
          <View style={styles.headerButtonsRow}>
            <TouchableOpacity
              style={styles.guidelinesBtn}
              onPress={() => setIsGuidelinesOpen(true)}
              activeOpacity={0.75}
            >
              <Feather name="shield" size={12} color={MeshviColors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.guidelinesText}>Guidelines</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.postMandateBtn}
              onPress={() => setIsCreateModalOpen(true)}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.postMandateText}>+ Post Mandate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 2. FILTER TABS (All Mandates / 1st-Degree / Global)       */}
        {/* ======================================================== */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]}
            onPress={() => setActiveTab('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === 'ALL' && styles.tabBtnTextActive]}>
              All Mandates ({filteredPosts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'CONNECTIONS_ONLY' && styles.tabBtnActive]}
            onPress={() => setActiveTab('CONNECTIONS_ONLY')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === 'CONNECTIONS_ONLY' && styles.tabBtnTextActive]}>
              1st-Degree
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'PUBLIC' && styles.tabBtnActive]}
            onPress={() => setActiveTab('PUBLIC')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === 'PUBLIC' && styles.tabBtnTextActive]}>
              Global Exchange
            </Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* 3. SEARCH & MANDATE HASHTAGS                            */}
        {/* ======================================================== */}
        <View style={{ zIndex: 100, marginBottom: 10 }}>
          <View style={styles.searchBarWrap}>
            <Feather name="search" size={14} color={MeshviColors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hashtags (#search, #supplychain), mandates..."
              placeholderTextColor={MeshviColors.textMuted}
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChangeText={(text) => {
                setSearchQuery(text);
                setIsSearchFocused(true);
                if (text.length > 2) executeSearch(text);
              }}
              returnKeyType="search"
              onSubmitEditing={() => {
                setIsSearchFocused(false);
                executeSearch();
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                  setIsSearchFocused(false);
                  executeSearch('');
                }}
                style={{ padding: 4 }}
              >
                <Feather name="x" size={14} color={MeshviColors.textMuted} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.searchExecuteBtn}
              onPress={() => {
                setIsSearchFocused(false);
                executeSearch();
              }}
              activeOpacity={0.8}
            >
              {loadingSearch ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="arrow-right" size={13} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Autocomplete Suggestions Dropdown */}
          {isSearchFocused && searchSuggestions && searchSuggestions.hasAny && (
            <View style={styles.suggestionsDropdown}>
              {searchSuggestions.tags.length > 0 && (
                <View style={styles.suggestionSection}>
                  <View style={styles.suggestionSectionHeader}>
                    <Feather name="hash" size={11} color={MeshviColors.accent} style={{ marginRight: 4 }} />
                    <Text style={styles.suggestionSectionTitle}>HASHTAGS</Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {searchSuggestions.tags.map((item) => (
                      <TouchableOpacity
                        key={item.tag}
                        style={styles.hashtagSuggestionChip}
                        onPress={() => {
                          setSearchQuery(item.tag);
                          setSelectedTag(item.rawTag);
                          setIsSearchFocused(false);
                          executeSearch(item.tag);
                        }}
                      >
                        <Text style={styles.hashtagSuggestionText}>{item.tag}</Text>
                        {item.count > 0 && (
                          <Text style={styles.hashtagSuggestionCount}>({item.count})</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {searchSuggestions.posts.length > 0 && (
                <View style={[styles.suggestionSection, { borderTopWidth: 1, borderTopColor: MeshviColors.border, paddingTop: 8, marginTop: 4 }]}>
                  <View style={styles.suggestionSectionHeader}>
                    <Feather name="file-text" size={11} color={MeshviColors.accent} style={{ marginRight: 4 }} />
                    <Text style={styles.suggestionSectionTitle}>COMMERCIAL MANDATES</Text>
                  </View>
                  {searchSuggestions.posts.map((post) => (
                    <TouchableOpacity
                      key={post.id}
                      style={styles.mandateSuggestionRow}
                      onPress={() => {
                        setIsSearchFocused(false);
                        setDetailsModalTarget(post);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.mandateSuggestionTitle} numberOfLines={1}>{post.title}</Text>
                        <Text style={styles.mandateSuggestionMeta} numberOfLines={1}>{post.authorName} &bull; {post.authorCompany}</Text>
                      </View>
                      <Feather name="chevron-right" size={13} color={MeshviColors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Horizontal Hashtags Chips */}
        <View style={styles.hashtagsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedTag && (
              <TouchableOpacity
                style={styles.activeTagChip}
                onPress={() => setSelectedTag(null)}
                activeOpacity={0.75}
              >
                <Text style={styles.activeTagText}>#{selectedTag} ✕</Text>
              </TouchableOpacity>
            )}
            {PRESEEDED_HASHTAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.hashtagChip, selectedTag === tag && styles.hashtagChipSelected]}
                onPress={() => {
                  const newTag = selectedTag === tag ? null : tag;
                  setSelectedTag(newTag);
                  if (newTag) executeSearch(newTag);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.hashtagText, selectedTag === tag && styles.hashtagTextSelected]}>
                  #{tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ======================================================== */}
        {/* 4. FEED OF ULTRA-COMPACT MANDATE CARDS                  */}
        {/*    (Only First Block & Actions; No bulky inline clutter) */}
        {/* ======================================================== */}
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyFeedBox}>
            <Feather name="inbox" size={32} color={MeshviColors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyFeedTitle}>No Mandates Found</Text>
            <Text style={styles.emptyFeedSub}>Try clearing your search query or selecting a different filter.</Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedTag(null);
                setActiveTab('ALL');
                executeSearch('');
              }}
              style={styles.resetFiltersBtn}
            >
              <Text style={styles.resetFiltersText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPosts.map((post) => {
            const isSaved = savedPostIds.has(post.id);
            const isInitiated = initiatedPostIds.has(post.id);
            const isOwnPost =
              post.authorId === (user?.id || 'curr-user') ||
              post.authorName.toLowerCase() === currentUserName.toLowerCase() ||
              post.authorName === 'Srikanth';

            return (
              <TouchableOpacity
                key={post.id}
                style={styles.compactPostCard}
                onPress={() => setDetailsModalTarget(post)}
                activeOpacity={0.88}
              >
                {/* Author Header */}
                <View style={styles.authorHeaderRow}>
                  <View style={styles.authorIdentityRow}>
                    {post.authorAvatar ? (
                      <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
                    ) : (
                      <View style={styles.authorInitialsCircle}>
                        <Text style={styles.authorInitialsText}>
                          {post.authorName
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </Text>
                      </View>
                    )}

                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.authorName} numberOfLines={1}>{post.authorName}</Text>
                        <MaterialCommunityIcons name="check-decagram" size={13} color="#166534" style={{ marginLeft: 3 }} />
                      </View>
                      <Text style={styles.authorRoleCompany} numberOfLines={1}>
                        {post.authorRole} &bull; {post.authorCompany}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.postMetaRight}>
                    <View style={styles.visibilityBadge}>
                      <Feather
                        name={post.visibility === 'PUBLIC' ? 'globe' : 'lock'}
                        size={10}
                        color={MeshviColors.accent}
                      />
                      <Text style={styles.visibilityText}>
                        {post.visibility === 'PUBLIC' ? 'Global' : '1st-Degree'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => setSelectedMenuPostId(selectedMenuPostId === post.id ? null : post.id)}
                      style={{ padding: 4 }}
                    >
                      <Feather name="more-horizontal" size={16} color={MeshviColors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3-Dots Action Popover */}
                {selectedMenuPostId === post.id && (
                  <View style={styles.menuPopover}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleToggleSave(post.id)}
                    >
                      <Feather name="bookmark" size={13} color={isSaved ? '#166534' : MeshviColors.textPrimary} />
                      <Text style={styles.menuItemText}>{isSaved ? 'Remove Bookmark' : 'Save Mandate'}</Text>
                    </TouchableOpacity>
                    {isOwnPost && (
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setAnalyticsTargetPost(post);
                          setSelectedMenuPostId(null);
                        }}
                      >
                        <Feather name="bar-chart-2" size={13} color={MeshviColors.accent} />
                        <Text style={[styles.menuItemText, { color: MeshviColors.accent, fontWeight: '700' }]}>View Analytics</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => handleHidePost(post.id)}
                    >
                      <Feather name="eye-off" size={13} color="#B42318" />
                      <Text style={[styles.menuItemText, { color: '#B42318' }]}>Hide Mandate</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Mandate Title */}
                <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>

                {/* Optional Attached Media Banner */}
                {post.imageUrl && (
                  <View style={styles.postCardBannerContainer}>
                    <Image source={{ uri: post.imageUrl }} style={styles.postCardBannerImage} />
                  </View>
                )}

                {/* Compact 2-Line Excerpt (No bulky clutter in card) */}
                <Text style={styles.compactPostExcerpt} numberOfLines={2}>
                  {post.content.replace(/\n/g, ' ')}
                </Text>

                {/* Compact Hashtag Chips */}
                <View style={styles.postTagsRow}>
                  {post.tags.slice(0, 3).map((t) => (
                    <View key={t} style={styles.postTagPill}>
                      <Text style={styles.postTagText}>#{t}</Text>
                    </View>
                  ))}
                  {post.tags.length > 3 && (
                    <View style={styles.postTagPill}>
                      <Text style={styles.postTagText}>+{post.tags.length - 3}</Text>
                    </View>
                  )}
                </View>

                {/* Card Action Footer: View Details & Initiate Deal */}
                <View style={styles.postActionsFooter}>
                  <View style={styles.socialStatsRow}>
                    <TouchableOpacity
                      style={styles.socialBtn}
                      onPress={() => handleToggleLike(post.id)}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name="heart"
                        size={14}
                        color={post.isLiked ? '#EF4444' : MeshviColors.textMuted}
                      />
                      <Text style={[styles.socialBtnText, post.isLiked && { color: '#EF4444' }]}>
                        {post.likesCount}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailsTextBtn}
                      onPress={() => setDetailsModalTarget(post)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.detailsText}>View Details ➔</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Right: Initiate Partnership CTA */}
                  {isInitiated ? (
                    <View style={styles.initiatedBadge}>
                      <Feather name="check" size={12} color="#166534" style={{ marginRight: 4 }} />
                      <Text style={styles.initiatedBadgeText}>Proposal Sent</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.initiateBtn}
                      onPress={() => handleOpenInitiateModal(post)}
                      activeOpacity={0.85}
                    >
                      <Feather name="user-check" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
                      <Text style={styles.initiateBtnText}>Initiate Deal</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ======================================================== */}
      {/* 75% SLIDING DETAILS MODAL                                */}
      {/* (Shows full content, deal teaser, and comments thread)    */}
      {/* ======================================================== */}
      <Modal
        visible={!!detailsModalTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalTarget(null)}
      >
        <View style={styles.detailsOverlay}>
          <View style={styles.detailsSheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Modal Header */}
            <View style={styles.detailsHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={styles.visibilityBadge}>
                  <Feather
                    name={detailsModalTarget?.visibility === 'PUBLIC' ? 'globe' : 'lock'}
                    size={10}
                    color={MeshviColors.accent}
                  />
                  <Text style={styles.visibilityText}>
                    {detailsModalTarget?.visibility === 'PUBLIC' ? 'Public Mandate' : '1st-Degree Only'}
                  </Text>
                </View>
                <Text style={styles.detailsModalTitle} numberOfLines={2}>
                  {detailsModalTarget?.title}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setDetailsModalTarget(null)}
                style={styles.detailsCloseBtn}
              >
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Details Body */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Author Info */}
              <View style={styles.detailsAuthorCard}>
                {detailsModalTarget?.authorAvatar ? (
                  <Image source={{ uri: detailsModalTarget.authorAvatar }} style={styles.authorAvatar} />
                ) : (
                  <View style={styles.authorInitialsCircle}>
                    <Text style={styles.authorInitialsText}>
                      {detailsModalTarget?.authorName
                        ?.split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </Text>
                  </View>
                )}
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.authorName}>{detailsModalTarget?.authorName}</Text>
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#166534" style={{ marginLeft: 4 }} />
                  </View>
                  <Text style={styles.authorRoleCompany}>
                    {detailsModalTarget?.authorRole} &bull; {detailsModalTarget?.authorCompany}
                  </Text>
                </View>
              </View>

              {/* Optional Visual Banner */}
              {detailsModalTarget?.imageUrl && (
                <View style={styles.detailsModalBannerContainer}>
                  <Image source={{ uri: detailsModalTarget.imageUrl }} style={styles.detailsModalBannerImage} />
                </View>
              )}

              {/* Author-Only Analytics Banner */}
              {Boolean(
                detailsModalTarget &&
                (detailsModalTarget.authorId === (user?.id || 'curr-user') ||
                 detailsModalTarget.authorName.toLowerCase() === currentUserName.toLowerCase() ||
                 detailsModalTarget.authorName === 'Srikanth')
              ) && (
                <TouchableOpacity
                  style={styles.analyticsButtonBanner}
                  onPress={() => {
                    setAnalyticsTargetPost(detailsModalTarget);
                    setDetailsModalTarget(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Feather name="bar-chart-2" size={14} color="#0F766E" />
                  <Text style={styles.analyticsButtonBannerText}>
                    View Mandate Analytics ({detailsModalTarget?.impressionsCount || 0} impressions)
                  </Text>
                </TouchableOpacity>
              )}

              {/* Full Mandate Scope Description */}
              <Text style={styles.sectionHeaderTitle}>MANDATE SCOPE & DESCRIPTION</Text>
              <Text style={styles.detailsFullContent}>{detailsModalTarget?.content}</Text>

              {/* Executive Deal Teaser Box */}
              {detailsModalTarget?.dealTeaser && (
                <View style={styles.dealTeaserBox}>
                  <View style={styles.dealTeaserHeader}>
                    <MaterialCommunityIcons name="file-certificate" size={15} color={MeshviColors.accent} />
                    <Text style={styles.dealTeaserTitle}>EXECUTIVE DEAL TEASER</Text>
                  </View>
                  <Text style={styles.dealTeaserScope}>
                    <Text style={{ fontWeight: '800' }}>Scope: </Text>{detailsModalTarget.dealTeaser.scope}
                  </Text>
                  <View style={styles.dealTeaserGrid}>
                    <View style={styles.teaserGridCol}>
                      <Text style={styles.teaserColLabel}>VOLUME COMMITTED</Text>
                      <Text style={styles.teaserColValue}>{detailsModalTarget.dealTeaser.volumeThreshold}</Text>
                    </View>
                    <View style={styles.teaserGridCol}>
                      <Text style={styles.teaserColLabel}>CORRIDORS</Text>
                      <Text style={styles.teaserColValue}>{detailsModalTarget.dealTeaser.geographicReach}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Tags */}
              <View style={[styles.postTagsRow, { marginVertical: 12 }]}>
                {detailsModalTarget?.tags.map((t) => (
                  <View key={t} style={styles.postTagPill}>
                    <Text style={styles.postTagText}>#{t}</Text>
                  </View>
                ))}
              </View>

              {/* Comments Thread */}
              <Text style={styles.sectionHeaderTitle}>EXECUTIVE INQUIRIES & COMMENTS</Text>
              {detailsModalTarget?.comments && detailsModalTarget.comments.length > 0 ? (
                detailsModalTarget.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItemRow}>
                    <View style={styles.commentAvatarCircle}>
                      <Text style={styles.commentAvatarText}>
                        {comment.authorName[0]?.toUpperCase() || 'E'}
                      </Text>
                    </View>
                    <View style={styles.commentBubble}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                        <Text style={styles.commentTime}>{comment.createdAt}</Text>
                      </View>
                      <Text style={styles.commentBody}>{comment.content}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noCommentsText}>No inquiries posted yet.</Text>
              )}

              {/* Add Comment Field */}
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Post professional inquiry..."
                  placeholderTextColor="#94A3B8"
                  value={commentInputText}
                  onChangeText={setCommentInputText}
                />
                <TouchableOpacity
                  style={styles.commentPostBtn}
                  onPress={() => detailsModalTarget && handleAddComment(detailsModalTarget.id)}
                >
                  <Feather name="send" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Bottom Sticky Action: Initiate Deal */}
            <View style={styles.detailsStickyFooter}>
              {initiatedPostIds.has(detailsModalTarget?.id || '') ? (
                <View style={[styles.initiatedBadge, { flex: 1, height: 44, justifyContent: 'center' }]}>
                  <Feather name="check" size={14} color="#166534" style={{ marginRight: 6 }} />
                  <Text style={[styles.initiatedBadgeText, { fontSize: 13 }]}>Proposal Sent</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.detailsInitiateCta}
                  onPress={() => {
                    const target = detailsModalTarget;
                    setDetailsModalTarget(null);
                    if (target) handleOpenInitiateModal(target);
                  }}
                  activeOpacity={0.88}
                >
                  <Feather name="user-check" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.detailsInitiateCtaText}>Initiate Deal Proposal</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 1: INITIATE PARTNERSHIP PROPOSAL MODAL             */}
      {/* ======================================================== */}
      <Modal
        visible={!!initiateModalTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setInitiateModalTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>Initiate Partnership Handshake</Text>
                <Text style={styles.modalSheetSub}>
                  Recipient: <Text style={{ fontWeight: '800', color: MeshviColors.textPrimary }}>{initiateModalTarget?.authorName}</Text> ({initiateModalTarget?.authorCompany})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setInitiateModalTarget(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Target Mandate Headline Box */}
            <View style={styles.initiateTargetBox}>
              <Text style={styles.initiateTargetTitle}>{initiateModalTarget?.title}</Text>
              <Text style={styles.initiateTargetCompany}>
                Verified Signatory: {initiateModalTarget?.authorRole}
              </Text>
            </View>

            {/* Smart Draft Cycle Button */}
            <TouchableOpacity onPress={handleCycleInitiateDraft} style={styles.smartDraftBtn} activeOpacity={0.7}>
              <MaterialCommunityIcons name="star-four-points" size={14} color={MeshviColors.accent} />
              <Text style={styles.smartDraftText}>Apply Pre-Crafted Draft #{initiateSmartDraftIndex + 1}</Text>
            </TouchableOpacity>

            {/* Proposal Message Input */}
            <TextInput
              style={styles.proposalTextInput}
              multiline
              numberOfLines={4}
              value={initiateProposalNote}
              onChangeText={setInitiateProposalNote}
              placeholder="State your commercial alignment, business objective, or partnership mandate..."
              placeholderTextColor="#94A3B8"
              maxLength={350}
            />

            {/* Modal Actions */}
            <View style={styles.modalActionButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setInitiateModalTarget(null)}
                disabled={isSubmittingInitiate}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSendBtn}
                onPress={handleSubmitInitiateProposal}
                disabled={isSubmittingInitiate}
                activeOpacity={0.88}
              >
                {isSubmittingInitiate ? (
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
      {/* MODAL 2: CREATE PARTNERSHIP POST MODAL (EXACT WEB REPLICA) */}
      {/* ======================================================== */}
      <CreatePartnershipPostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={(newPost) => {
          setPosts([newPost, ...posts]);
        }}
      />

      {/* ======================================================== */}
      {/* MODAL 3: PARTNERSHIP GUIDELINES MODAL                    */}
      {/* ======================================================== */}
      <Modal
        visible={isGuidelinesOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsGuidelinesOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>B2B Mandate Guidelines</Text>
                <Text style={styles.modalSheetSub}>Meshvi Governance Standards & Anti-Spam Protocol</Text>
              </View>
              <TouchableOpacity onPress={() => setIsGuidelinesOpen(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.guidelinesList}>
              <View style={styles.guidelineItem}>
                <Feather name="check-circle" size={16} color="#166534" style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidelineHeading}>Verified Reciprocal Mandates Only</Text>
                  <Text style={styles.guidelineBody}>Every post must represent a tangible corporate intent, tender, distribution alliance, or co-investment scope.</Text>
                </View>
              </View>

              <View style={styles.guidelineItem}>
                <Feather name="shield" size={16} color={MeshviColors.accent} style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidelineHeading}>Zero Cold Agency Pitching</Text>
                  <Text style={styles.guidelineBody}>Offshore staff augmentation, speculative lead-gen blasts, and unsolicited mass InMail are mathematically blocked.</Text>
                </View>
              </View>

              <View style={styles.guidelineItem}>
                <Feather name="lock" size={16} color="#4F46E5" style={{ marginRight: 10, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidelineHeading}>Confidential Deal Corridors</Text>
                  <Text style={styles.guidelineBody}>Detailed spec sheets and financials remain encrypted until mutual NDA and bilateral agendas are ratified.</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalSendBtn, { width: '100%', marginTop: 14 }]}
              onPress={() => setIsGuidelinesOpen(false)}
            >
              <Text style={styles.modalSendText}>Understood & Acknowledged</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: POST ANALYTICS MODAL                            */}
      {/* ======================================================== */}
      <Modal
        visible={!!analyticsTargetPost}
        transparent
        animationType="fade"
        onRequestClose={() => setAnalyticsTargetPost(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSheetTitle}>Mandate Performance Analytics</Text>
                <Text style={styles.modalSheetSub} numberOfLines={1}>
                  {analyticsTargetPost?.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAnalyticsTargetPost(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={18} color={MeshviColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCol}>
                <Text style={styles.analyticsLabel}>TOTAL IMPRESSIONS</Text>
                <Text style={styles.analyticsBigVal}>{analyticsTargetPost?.impressionsCount || 0}</Text>
                <Text style={styles.analyticsSub}>Verified C-Suite Feeds</Text>
              </View>
              <View style={styles.analyticsCol}>
                <Text style={styles.analyticsLabel}>DEAL INQUIRIES</Text>
                <Text style={styles.analyticsBigVal}>{analyticsTargetPost?.commentsCount || 0}</Text>
                <Text style={styles.analyticsSub}>Direct Handshakes</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalSendBtn, { width: '100%', marginTop: 14 }]}
              onPress={() => setAnalyticsTargetPost(null)}
            >
              <Text style={styles.modalSendText}>Close Analytics</Text>
            </TouchableOpacity>
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

  /* HEADER */
  headerSection: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMint,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: MeshviColors.accent,
    marginRight: 4,
  },
  headerBadgeText: {
    color: MeshviColors.accent,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    color: MeshviColors.textMuted,
    fontSize: 11.5,
    marginTop: 3,
    lineHeight: 16,
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  guidelinesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  guidelinesText: {
    color: MeshviColors.textPrimary,
    fontSize: 11.5,
    fontWeight: '700',
  },
  postMandateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: MeshviColors.accent,
  },
  postMandateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* TABS */
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: MeshviColors.surfaceMint,
  },
  tabBtnText: {
    color: MeshviColors.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: MeshviColors.accent,
    fontWeight: '800',
  },

  /* SEARCH & HASHTAGS */
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 42,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    color: MeshviColors.textPrimary,
    fontSize: 12,
  },
  searchExecuteBtn: {
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
  },
  searchExecuteText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  hashtagsRow: {
    marginBottom: 12,
  },
  activeTagChip: {
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  hashtagChip: {
    backgroundColor: MeshviColors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  hashtagChipSelected: {
    backgroundColor: MeshviColors.surfaceMint,
    borderColor: MeshviColors.accent,
  },
  hashtagText: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  hashtagTextSelected: {
    color: MeshviColors.accent,
    fontWeight: '800',
  },

  /* EMPTY FEED */
  emptyFeedBox: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginTop: 10,
  },
  emptyFeedTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  emptyFeedSub: {
    color: MeshviColors.textMuted,
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 4,
  },
  resetFiltersBtn: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: MeshviColors.surfaceMint,
  },
  resetFiltersText: {
    color: MeshviColors.accent,
    fontSize: 11.5,
    fontWeight: '800',
  },

  /* COMPACT POST CARD */
  compactPostCard: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
    position: 'relative',
  },
  authorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authorIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  authorInitialsCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: MeshviColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitialsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  authorName: {
    color: MeshviColors.textPrimary,
    fontSize: 12.5,
    fontWeight: '800',
  },
  authorRoleCompany: {
    color: MeshviColors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  postMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  visibilityText: {
    color: MeshviColors.textSecondary,
    fontSize: 9.5,
    fontWeight: '700',
    marginLeft: 3,
  },

  /* MENU POPOVER */
  menuPopover: {
    position: 'absolute',
    top: 44,
    right: 12,
    backgroundColor: MeshviColors.surface,
    borderRadius: 12,
    paddingVertical: 4,
    width: 150,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuItemText: {
    color: MeshviColors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 8,
  },

  postTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
    lineHeight: 18,
    marginBottom: 4,
  },
  compactPostExcerpt: {
    color: MeshviColors.textSecondary,
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 8,
  },

  /* TAGS ROW */
  postTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10,
  },
  postTagPill: {
    backgroundColor: MeshviColors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  postTagText: {
    color: MeshviColors.accent,
    fontSize: 9.5,
    fontWeight: '700',
  },

  /* ENGAGEMENT FOOTER */
  postActionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  socialStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialBtnText: {
    color: MeshviColors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  detailsTextBtn: {
    paddingVertical: 2,
  },
  detailsText: {
    color: MeshviColors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  initiatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  initiatedBadgeText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '800',
  },
  initiateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  initiateBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  /* 75% DETAILS MODAL */
  detailsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  detailsSheetContainer: {
    backgroundColor: MeshviColors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    maxHeight: height * 0.78,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: MeshviColors.border,
    marginBottom: 12,
  },
  detailsModalTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  detailsCloseBtn: {
    padding: 6,
  },
  detailsAuthorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  sectionHeaderTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailsFullContent: {
    color: MeshviColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  dealTeaserBox: {
    backgroundColor: 'rgba(15, 118, 110, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 118, 110, 0.2)',
    marginBottom: 10,
  },
  dealTeaserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dealTeaserTitle: {
    color: MeshviColors.accent,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  dealTeaserScope: {
    color: MeshviColors.textPrimary,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
  },
  dealTeaserGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 118, 110, 0.15)',
    paddingTop: 6,
    gap: 8,
  },
  teaserGridCol: {
    flex: 1,
  },
  teaserColLabel: {
    color: MeshviColors.textMuted,
    fontSize: 8.5,
    fontWeight: '800',
  },
  teaserColValue: {
    color: MeshviColors.accent,
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 1,
  },
  commentItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentAvatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: MeshviColors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    color: MeshviColors.accent,
    fontSize: 10,
    fontWeight: '900',
  },
  commentBubble: {
    flex: 1,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 10,
    padding: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  commentAuthor: {
    color: MeshviColors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  commentTime: {
    color: MeshviColors.textMuted,
    fontSize: 9.5,
  },
  commentBody: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  noCommentsText: {
    color: MeshviColors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  commentInput: {
    flex: 1,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 11.5,
    color: MeshviColors.textPrimary,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginRight: 6,
  },
  commentPostBtn: {
    backgroundColor: MeshviColors.accent,
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsStickyFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: MeshviColors.border,
  },
  detailsInitiateCta: {
    backgroundColor: MeshviColors.accent,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsInitiateCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* INITIATE & CREATE MODALS */
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
    maxHeight: '88%',
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
  initiateTargetBox: {
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  initiateTargetTitle: {
    color: MeshviColors.textPrimary,
    fontSize: 12.5,
    fontWeight: '800',
  },
  initiateTargetCompany: {
    color: MeshviColors.textMuted,
    fontSize: 10.5,
    marginTop: 2,
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
    marginBottom: 14,
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
  visibilityOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  visibilityOptionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: MeshviColors.surfaceMuted,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  visibilityOptionSelected: {
    backgroundColor: MeshviColors.accent,
    borderColor: MeshviColors.accent,
  },
  visibilityOptionText: {
    color: MeshviColors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
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

  /* GUIDELINES */
  guidelinesList: {
    gap: 12,
    marginVertical: 10,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guidelineHeading: {
    color: MeshviColors.textPrimary,
    fontSize: 12.5,
    fontWeight: '800',
  },
  guidelineBody: {
    color: MeshviColors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },

  /* ANALYTICS */
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 14,
  },
  analyticsCol: {
    flex: 1,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  analyticsLabel: {
    color: MeshviColors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  analyticsBigVal: {
    color: MeshviColors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    marginVertical: 4,
  },
  analyticsSub: {
    color: MeshviColors.accent,
    fontSize: 10,
    fontWeight: '700',
  },

  /* SEARCH SUGGESTIONS DROPDOWN */
  suggestionsDropdown: {
    backgroundColor: MeshviColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    marginTop: 6,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionSection: {
    paddingVertical: 4,
  },
  suggestionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  suggestionSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: MeshviColors.textMuted,
    letterSpacing: 0.6,
  },
  hashtagSuggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  hashtagSuggestionText: {
    fontSize: 11,
    fontWeight: '700',
    color: MeshviColors.accent,
  },
  hashtagSuggestionCount: {
    fontSize: 10,
    color: MeshviColors.textMuted,
    marginLeft: 3,
  },
  mandateSuggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: MeshviColors.border,
  },
  mandateSuggestionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  mandateSuggestionMeta: {
    fontSize: 10,
    color: MeshviColors.textMuted,
    marginTop: 1,
  },

  /* IMAGE UPLOAD & PREVIEW */
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MeshviColors.border,
    borderStyle: 'dashed',
  },
  imagePickerBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  presetImageBtn: {
    width: 100,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: MeshviColors.border,
    backgroundColor: MeshviColors.surface,
  },
  presetImageThumb: {
    width: '100%',
    height: 48,
    backgroundColor: '#E2E8F0',
  },
  presetImageLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
    padding: 3,
  },
  imagePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: MeshviColors.surfaceMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MeshviColors.border,
  },
  imagePreviewThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  imagePreviewText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: MeshviColors.textPrimary,
  },
  imagePreviewSub: {
    fontSize: 9.5,
    color: '#166534',
    fontWeight: '600',
  },
  imageRemoveBtn: {
    padding: 6,
  },

  /* POST BANNER */
  postCardBannerContainer: {
    width: '100%',
    height: 110,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  postCardBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsModalBannerContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 10,
  },
  detailsModalBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  /* DETAILS MODAL ANALYTICS BANNER */
  analyticsButtonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 8,
    gap: 6,
  },
  analyticsButtonBannerText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F766E',
  },
});
