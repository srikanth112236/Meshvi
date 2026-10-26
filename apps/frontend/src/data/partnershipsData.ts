export interface NetworkPerson {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string | null;
  isActiveConnection: boolean;
  email?: string;
}

export interface NetworkCompany {
  id: string;
  name: string;
  industry: string;
  location: string;
  verifiedMembersCount: number;
  linkedPeople: string[];
}

export interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
  taggedPeople?: string[];
}

export interface ExecutiveBadge {
  type: 'SIGNATORY' | 'FULFILLMENT' | 'SLA' | 'CUSTOM';
  label: string;
}

export interface DealTeaser {
  scope: string;
  volumeThreshold: string;
  geographicReach: string;
  capitalRequired?: string;
  fileName?: string;
  specSheetFileName?: string;
  isGated: boolean;
  unlockedUserIds?: string[];
}

export interface PartnershipPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorCompany: string;
  authorAvatar?: string | null;
  authorBadges?: ExecutiveBadge[];
  dealTeaser?: DealTeaser;
  title: string;
  content: string;
  imageUrl?: string | null;
  visibility: 'CONNECTIONS_ONLY' | 'PUBLIC';
  tags: string[];
  likesCount: number;
  commentsCount: number;
  resharesCount: number;
  impressionsCount: number;
  isLiked?: boolean;
  originalPostId?: string | null;
  originalPost?: PartnershipPost | null;
  reshareCommentary?: string | null;
  createdAt: string;
  comments?: CommentItem[];
  isArchived?: boolean;
  isSaved?: boolean;
  analytics?: {
    uniqueViewers: number;
    dailyViews: Array<{ date: string; views: number }>;
  };
}

export interface HashtagItem {
  tag: string;
  category: string;
  isCustom?: boolean;
}

export interface ReportedPostItem {
  id: string;
  postId: string;
  postTitle: string;
  postAuthorName: string;
  postAuthorCompany: string;
  postContentSnippet: string;
  reporterName: string;
  reporterEmail?: string;
  reason: 'INAPPROPRIATE' | 'SPAM' | 'MISLEADING' | 'IP_VIOLATION' | 'OTHER';
  details: string;
  status: 'PENDING_REVIEW' | 'RESOLVED_DISMISSED' | 'POST_REMOVED';
  createdAt: string;
  reviewedAt?: string;
  adminActionNote?: string;
}

export interface PartnershipRequestItem {
  id: string;
  postId?: string;
  postTitle: string;
  postAuthorCompany: string;
  direction: 'INCOMING' | 'OUTGOING';
  senderName: string;
  senderRole: string;
  senderCompany: string;
  senderAvatar?: string | null;
  recipientName: string;
  recipientRole: string;
  recipientCompany: string;
  recipientAvatar?: string | null;
  reasonType: 'PARTNERSHIP' | 'CONNECTION';
  proposalNote: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_DISCUSSION' | 'DECLINED';
  createdAt: string;
  isAlreadyConnected: boolean;
}

// Pre-seeded enterprise B2B & partnership hashtags
export const PRESEEDED_HASHTAGS: HashtagItem[] = [
  // Strategic Alliances
  { tag: 'partnership', category: 'Strategic Alliances' },
  { tag: 'jointventure', category: 'Strategic Alliances' },
  { tag: 'licensing', category: 'Strategic Alliances' },
  { tag: 'bilateral', category: 'Strategic Alliances' },
  { tag: 'strategicalliance', category: 'Strategic Alliances' },
  { tag: 'channelpartner', category: 'Strategic Alliances' },
  { tag: 'cobranding', category: 'Strategic Alliances' },
  { tag: 'mergers', category: 'Strategic Alliances' },
  { tag: 'consortium', category: 'Strategic Alliances' },
  { tag: 'franchise', category: 'Strategic Alliances' },
  { tag: 'oem', category: 'Strategic Alliances' },
  { tag: 'whitelabel', category: 'Strategic Alliances' },
  { tag: 'coinvestment', category: 'Strategic Alliances' },

  // Commerce, Retail, FMCG
  { tag: 'fmcg', category: 'Commerce & FMCG' },
  { tag: 'b2bcommerce', category: 'Commerce & FMCG' },
  { tag: 'retail', category: 'Commerce & FMCG' },
  { tag: 'concessions', category: 'Commerce & FMCG' },
  { tag: 'airports', category: 'Commerce & FMCG' },
  { tag: 'dutyfree', category: 'Commerce & FMCG' },
  { tag: 'wholesale', category: 'Commerce & FMCG' },
  { tag: 'beverage', category: 'Commerce & FMCG' },
  { tag: 'foodtech', category: 'Commerce & FMCG' },
  { tag: 'cpg', category: 'Commerce & FMCG' },
  { tag: 'luxuryretail', category: 'Commerce & FMCG' },
  { tag: 'ecommerce', category: 'Commerce & FMCG' },
  { tag: 'distribution', category: 'Commerce & FMCG' },

  // Supply Chain & Logistics
  { tag: 'logistics', category: 'Logistics & Supply Chain' },
  { tag: 'freight', category: 'Logistics & Supply Chain' },
  { tag: 'supplychain', category: 'Logistics & Supply Chain' },
  { tag: 'coldchain', category: 'Logistics & Supply Chain' },
  { tag: 'warehousing', category: 'Logistics & Supply Chain' },
  { tag: 'crossborder', category: 'Logistics & Supply Chain' },
  { tag: 'shipping', category: 'Logistics & Supply Chain' },
  { tag: 'procurement', category: 'Logistics & Supply Chain' },
  { tag: 'aircargo', category: 'Logistics & Supply Chain' },
  { tag: 'maritime', category: 'Logistics & Supply Chain' },

  // Technology & AI
  { tag: 'ai', category: 'Technology & AI' },
  { tag: 'enterprise', category: 'Technology & AI' },
  { tag: 'saas', category: 'Technology & AI' },
  { tag: 'fintech', category: 'Technology & AI' },
  { tag: 'automation', category: 'Technology & AI' },
  { tag: 'cloud', category: 'Technology & AI' },
  { tag: 'deeptech', category: 'Technology & AI' },
  { tag: 'cybersecurity', category: 'Technology & AI' },

  // Healthcare & Life Sciences
  { tag: 'healthcare', category: 'Healthcare & Life Sciences' },
  { tag: 'biotech', category: 'Healthcare & Life Sciences' },
  { tag: 'pharma', category: 'Healthcare & Life Sciences' },
  { tag: 'medtech', category: 'Healthcare & Life Sciences' },
  { tag: 'clinicaltrials', category: 'Healthcare & Life Sciences' },
  { tag: 'lifesciences', category: 'Healthcare & Life Sciences' },

  // Corridors & Global Trade
  { tag: 'apac', category: 'Global Trade & Corridors' },
  { tag: 'asean', category: 'Global Trade & Corridors' },
  { tag: 'emea', category: 'Global Trade & Corridors' },
  { tag: 'latam', category: 'Global Trade & Corridors' },
  { tag: 'globaltrade', category: 'Global Trade & Corridors' },
  { tag: 'exportimport', category: 'Global Trade & Corridors' },
  { tag: 'singapore', category: 'Global Trade & Corridors' },
  { tag: 'india', category: 'Global Trade & Corridors' },

  // Tenders & Capital
  { tag: 'tenders', category: 'Tenders & Capital' },
  { tag: 'rfp', category: 'Tenders & Capital' },
  { tag: 'privateequity', category: 'Tenders & Capital' },
  { tag: 'venturecapital', category: 'Tenders & Capital' },
  { tag: 'syndicate', category: 'Tenders & Capital' },
];

const STORAGE_KEY_POSTS = 'project_setu_partnership_posts_v4';
const STORAGE_KEY_HASHTAGS = 'project_setu_hashtags_registry_v1';
const STORAGE_KEY_REQUESTS = 'project_setu_partnership_requests_v1';
const STORAGE_KEY_REPORTED = 'project_setu_reported_posts_v1';
const STORAGE_KEY_SAVED_POSTS = 'project_setu_saved_posts_ids_v1';
const STORAGE_KEY_HIDDEN_POSTS = 'project_setu_hidden_posts_ids_v1';

export const INITIAL_REPORTED_POSTS: ReportedPostItem[] = [
  {
    id: 'rep-1',
    postId: 'post-legacy-mock',
    postTitle: 'Unverified Wholesale Aviation Sourcing Request',
    postAuthorName: 'Anonymous Broker',
    postAuthorCompany: 'Global Intermediaries Ltd',
    postContentSnippet: 'Promising 100% tax rebate concessions without formal regulatory registration...',
    reporterName: 'Srikanth',
    reporterEmail: 'srikanth@apexind.com',
    reason: 'MISLEADING',
    details: 'Unlicensed entity claiming airport concession tenders without civil aviation clearance.',
    status: 'PENDING_REVIEW',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export const NETWORK_PEOPLE: NetworkPerson[] = [
  {
    id: 'user-elena',
    name: 'Dr. Elena Rostova',
    role: 'Chief Commercial Officer & Partner',
    company: 'Nordic Biologics & Wellness',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    isActiveConnection: true,
    email: 'elena.rostova@nordicbio.com',
  },
  {
    id: 'user-alex',
    name: 'Alexander Chen',
    role: 'Managing Director & Global Sourcing Lead',
    company: 'Apex Global Logistics',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    isActiveConnection: true,
    email: 'alexander.chen@apexgl.com',
  },
  {
    id: 'user-oliver',
    name: 'Oliver Bose',
    role: 'VP Regulatory & Bilateral Compliance',
    company: 'Nordic Biologics & Wellness',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    isActiveConnection: true,
    email: 'oliver.bose@nordicbio.com',
  },
  {
    id: 'user-priya',
    name: 'Priya Sharma',
    role: 'Global Trade & Procurement Lead',
    company: 'Apex Industries Ltd',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&q=80',
    isActiveConnection: true,
    email: 'priya.sharma@apexind.com',
  },
  {
    id: 'user-vikram',
    name: 'Vikram Rao',
    role: 'Head of Vendor Relations & Technical Procurement',
    company: 'Apex Industries Ltd',
    avatar: null,
    isActiveConnection: false,
    email: 'vikram.rao@apexind.com',
  },
  {
    id: 'user-bhavana',
    name: 'Bhavana Lee',
    role: 'Director of Business Development & Regional Channels',
    company: 'Pacific Trans-Corridor Logistics',
    avatar: null,
    isActiveConnection: false,
    email: 'bhavana.lee@pacificcorridor.sg',
  },
  {
    id: 'user-sandeep',
    name: 'Sandeep Dubois',
    role: 'Chief Executive Officer & Strategic Alliances',
    company: 'Changi Retail Concessions Group',
    avatar: null,
    isActiveConnection: false,
    email: 'sandeep.dubois@changiretail.com',
  },
];

export const NETWORK_COMPANIES: NetworkCompany[] = [
  {
    id: 'comp-nordic',
    name: 'Nordic Biologics & Wellness',
    industry: 'Healthcare & Life Sciences',
    location: 'Stockholm, Sweden & Singapore',
    verifiedMembersCount: 42,
    linkedPeople: ['Dr. Elena Rostova', 'Oliver Bose'],
  },
  {
    id: 'comp-apex',
    name: 'Apex Industries Ltd',
    industry: 'Diversified Conglomerate & Retail',
    location: 'Mumbai, India & London, UK',
    verifiedMembersCount: 156,
    linkedPeople: ['Srikanth', 'Priya Sharma', 'Vikram Rao'],
  },
  {
    id: 'comp-apex-logistics',
    name: 'Apex Global Logistics',
    industry: 'Freight, Logistics & Supply Chain',
    location: 'Singapore & Hong Kong',
    verifiedMembersCount: 88,
    linkedPeople: ['Alexander Chen'],
  },
  {
    id: 'comp-pacific',
    name: 'Pacific Trans-Corridor Logistics',
    industry: 'Cross-Border Logistics & Infrastructure',
    location: 'Singapore & Tokyo',
    verifiedMembersCount: 64,
    linkedPeople: ['Bhavana Lee'],
  },
  {
    id: 'comp-changi',
    name: 'Changi Retail Concessions Group',
    industry: 'Duty-Free & Airport Retail Concessions',
    location: 'Singapore',
    verifiedMembersCount: 29,
    linkedPeople: ['Sandeep Dubois'],
  },
];

export const INITIAL_PARTNERSHIP_POSTS: PartnershipPost[] = [
  {
    id: 'post-1',
    authorId: 'user-elena',
    authorName: 'Dr. Elena Rostova',
    authorRole: 'Chief Commercial Officer & Partner',
    authorCompany: 'Nordic Biologics & Wellness',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    authorBadges: [
      { type: 'SIGNATORY', label: 'Authorized Commercial Signatory' },
      { type: 'FULFILLMENT', label: 'Verified Annual Fulfillment: $25M+' },
      { type: 'SLA', label: 'Response SLA: < 12 Hours' },
    ],
    dealTeaser: {
      scope: 'Commercial cold-chain distribution & clinical diagnostic co-marketing',
      volumeThreshold: '$6M - $15M Annual Turnover Commitment',
      geographicReach: 'Singapore, Malaysia, Japan (APAC Transit Corridors)',
      capitalRequired: '$3.5M Co-Investment Allocation',
      fileName: 'Nordic_Bio_APAC_Licensing_Spec_Sheet.pdf',
      isGated: true,
      unlockedUserIds: [],
    },
    title: 'Seeking Bilateral Distribution & Licensing Partner in APAC Region',
    content:
      'Nordic Biologics is expanding into Southeast Asia. We are seeking vetted commercial distribution partners, hospital networks, and clinical research groups for bilateral co-marketing of certified metabolic screening protocols.\n\nLooking for entities with established cold-chain retail logistics and regulatory clearance across SG, MY, and JP.',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    visibility: 'PUBLIC',
    tags: ['healthcare', 'distribution', 'apac', 'licensing', 'b2bcommerce'],
    likesCount: 28,
    commentsCount: 2,
    resharesCount: 4,
    impressionsCount: 430,
    isLiked: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    comments: [
      {
        id: 'c-1',
        authorName: 'Srikanth',
        content: 'Elena, Apex Industries has active consumer retail logistics across Singapore and Malaysia. Tagging @Priya Sharma to review cold-chain compliance.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        taggedPeople: ['Priya Sharma'],
      },
      {
        id: 'c-2',
        authorName: 'Oliver Bose',
        content: 'High-synergy collaboration. Bilateral clinical dossier is ready for NDA review.',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
    analytics: {
      uniqueViewers: 194,
      dailyViews: [
        { date: 'Oct 19', views: 78 },
        { date: 'Oct 20', views: 112 },
        { date: 'Oct 21', views: 140 },
        { date: 'Oct 22', views: 100 },
      ],
    },
  },
  {
    id: 'post-2',
    authorId: 'user-srikanth',
    authorName: 'Srikanth',
    authorRole: 'Verified Business Executive',
    authorCompany: 'Apex Industries Ltd',
    authorAvatar: null,
    authorBadges: [
      { type: 'SIGNATORY', label: 'Authorized Commercial Signatory' },
      { type: 'FULFILLMENT', label: 'Verified Annual Fulfillment: $50M+' },
      { type: 'SLA', label: 'Response SLA: < 6 Hours' },
    ],
    dealTeaser: {
      scope: 'Airport VIP Lounges, Automated Kiosks & Gourmet Beverage Concessions',
      volumeThreshold: '2.4M Passengers Annual Transit Footprint',
      geographicReach: 'Singapore Changi, Dubai DXB & Regional Asian Hubs',
      capitalRequired: '$8.0M Tendering Allocation',
      fileName: 'Apex_Airport_Concessions_Teaser.pdf',
      isGated: false,
      unlockedUserIds: [],
    },
    title: 'Joint Venture Proposal: Airport Retail Concessions & Luxury Beverage Sourcing',
    content:
      'Apex Industries is finalizing long-term concession tenders for regional airport lounges. We are seeking verified counterparties for cold brew beverage sourcing, organic confectionery, and automated contactless retail kiosks.\n\nPrefer suppliers with bilateral intent and minimum 3 years of enterprise fulfillment.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?w=800&q=80',
    visibility: 'PUBLIC',
    tags: ['retail', 'airports', 'concessions', 'beverage', 'jointventure'],
    likesCount: 19,
    commentsCount: 1,
    resharesCount: 2,
    impressionsCount: 310,
    isLiked: true,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    comments: [
      {
        id: 'c-3',
        authorName: 'Alexander Chen',
        content: 'We represent two premium beverage manufacturers in Taiwan and Vietnam ready to fulfill airport volumes. Tagging @Bhavana Lee for cross-border freight routes.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        taggedPeople: ['Bhavana Lee'],
      },
    ],
    analytics: {
      uniqueViewers: 142,
      dailyViews: [
        { date: 'Oct 20', views: 90 },
        { date: 'Oct 21', views: 120 },
        { date: 'Oct 22', views: 100 },
      ],
    },
  },
  {
    id: 'post-3',
    authorId: 'user-alex',
    authorName: 'Alexander Chen',
    authorRole: 'Managing Director & Global Sourcing Lead',
    authorCompany: 'Apex Global Logistics',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    authorBadges: [
      { type: 'SIGNATORY', label: 'Authorized Commercial Signatory' },
      { type: 'FULFILLMENT', label: 'Verified Annual Fulfillment: $15M+' },
      { type: 'SLA', label: 'Response SLA: < 24 Hours' },
    ],
    dealTeaser: {
      scope: 'AI Container Routing & Multimodal Dispatch Infrastructure',
      volumeThreshold: '120,000 TEU / Year Routing Scale',
      geographicReach: 'Singapore, Hong Kong, Rotterdam & Long Beach Corridors',
      capitalRequired: 'Bilateral SaaS Enterprise Pilot',
      fileName: 'Apex_Logistics_AI_Routing_Teaser.pdf',
      isGated: true,
      unlockedUserIds: [],
    },
    title: 'Confidential Bilateral Intent: Enterprise AI Logistics & Freight Optimization',
    content:
      'Direct bilateral initiative for connected partners: We are shortlisting 3 AI logistics automation platforms for our container routing infrastructure. Strictly private to 1st-degree verified network counterparties.',
    visibility: 'CONNECTIONS_ONLY',
    tags: ['logistics', 'ai', 'freight', 'procurement', 'enterprise'],
    likesCount: 12,
    commentsCount: 0,
    resharesCount: 1,
    impressionsCount: 118,
    isLiked: false,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    comments: [],
    analytics: {
      uniqueViewers: 65,
      dailyViews: [
        { date: 'Oct 21', views: 55 },
        { date: 'Oct 22', views: 63 },
      ],
    },
  },
  {
    id: 'post-4',
    authorId: 'user-bhavana',
    authorName: 'Bhavana Lee',
    authorRole: 'Director of Business Development & Regional Channels',
    authorCompany: 'Pacific Trans-Corridor Logistics',
    authorAvatar: null,
    authorBadges: [
      { type: 'SIGNATORY', label: 'Verified Channel Director' },
      { type: 'FULFILLMENT', label: 'Verified Annual Fulfillment: $10M+' },
      { type: 'SLA', label: 'Response SLA: < 24 Hours' },
    ],
    dealTeaser: {
      scope: 'Cross-border cold-chain pharma forwarding tender',
      volumeThreshold: '400+ Reefer Containers / Quarter',
      geographicReach: 'ASEAN Transit Corridors (Singapore, Vietnam, Thailand)',
      capitalRequired: 'Bilateral RFP Tender',
      fileName: 'Pacific_ColdChain_Expansion_Teaser.pdf',
      isGated: true,
      unlockedUserIds: [],
    },
    title: 'Cross-Border Cold Chain Expansion Tender: Changi & regional transit corridors',
    content:
      'Pacific Trans-Corridor is opening bilateral RFPs for specialized temperature-controlled freight forwarding across ASEAN transit corridors. Open to co-venture tenders with pharmaceutical and duty-free concessionaires.',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    visibility: 'PUBLIC',
    tags: ['logistics', 'coldchain', 'crossborder', 'apac', 'freight'],
    likesCount: 15,
    commentsCount: 1,
    resharesCount: 3,
    impressionsCount: 220,
    isLiked: false,
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    comments: [
      {
        id: 'c-4',
        authorName: 'Dr. Elena Rostova',
        content: 'This aligns with our Q1 expansion. Tagging @Alexander Chen for multimodal container synergy.',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        taggedPeople: ['Alexander Chen'],
      },
    ],
    analytics: {
      uniqueViewers: 110,
      dailyViews: [
        { date: 'Oct 21', views: 95 },
        { date: 'Oct 22', views: 125 },
      ],
    },
  },
];

export const INITIAL_PARTNERSHIP_REQUESTS: PartnershipRequestItem[] = [
  {
    id: 'req-1',
    postId: 'post-1',
    postTitle: 'Seeking Bilateral Distribution & Licensing Partner in APAC Region',
    postAuthorCompany: 'Nordic Biologics & Wellness',
    direction: 'OUTGOING',
    senderName: 'Srikanth',
    senderRole: 'Verified Business Executive',
    senderCompany: 'Apex Industries Ltd',
    recipientName: 'Dr. Elena Rostova',
    recipientRole: 'Chief Commercial Officer & Partner',
    recipientCompany: 'Nordic Biologics & Wellness',
    recipientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    reasonType: 'PARTNERSHIP',
    proposalNote: 'Proposing regional distribution synergy across our established Singapore & Malaysian pharmaceutical logistics cold-chain hubs.',
    status: 'IN_DISCUSSION',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    isAlreadyConnected: true,
  },
  {
    id: 'req-2',
    postId: 'post-2',
    postTitle: 'Joint Venture Proposal: Airport Retail Concessions & Luxury Beverage Sourcing',
    postAuthorCompany: 'Apex Industries Ltd',
    direction: 'INCOMING',
    senderName: 'Bhavana Lee',
    senderRole: 'Director of Business Development',
    senderCompany: 'Pacific Trans-Corridor Logistics',
    senderAvatar: null,
    recipientName: 'Srikanth',
    recipientRole: 'Verified Business Executive',
    recipientCompany: 'Apex Industries Ltd',
    reasonType: 'CONNECTION',
    proposalNote: 'We want to introduce our automated transit retail equipment and supply contracts for Changi & regional airport terminals.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    isAlreadyConnected: false,
  },
  {
    id: 'req-3',
    postId: 'post-3',
    postTitle: 'Confidential Bilateral Intent: Enterprise AI Logistics & Freight Optimization',
    postAuthorCompany: 'Apex Global Logistics',
    direction: 'OUTGOING',
    senderName: 'Srikanth',
    senderRole: 'Verified Business Executive',
    senderCompany: 'Apex Industries Ltd',
    recipientName: 'Alexander Chen',
    recipientRole: 'Managing Director & Global Sourcing Lead',
    recipientCompany: 'Apex Global Logistics',
    recipientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    reasonType: 'PARTNERSHIP',
    proposalNote: 'We have proprietary freight dispatch routing algorithms ready for enterprise container fleet deployment.',
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isAlreadyConnected: true,
  },
];

export function getStoredPosts(): PartnershipPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_PARTNERSHIP_POSTS;
}

export function saveStoredPosts(posts: PartnershipPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
  } catch {
    // quota
  }
}

export function getRegisteredHashtags(): HashtagItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HASHTAGS);
    if (raw) {
      const parsed: HashtagItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingTags = new Set(parsed.map((h) => h.tag.toLowerCase()));
        const missingPreseeded = PRESEEDED_HASHTAGS.filter(
          (h) => !existingTags.has(h.tag.toLowerCase())
        );
        return [...parsed, ...missingPreseeded];
      }
    }
  } catch {
    // fallback
  }
  return PRESEEDED_HASHTAGS;
}

export function registerNewHashtag(rawTag: string, category: string = 'User Created'): HashtagItem {
  const cleanTag = rawTag.replace(/^#/, '').trim().toLowerCase();
  const currentList = getRegisteredHashtags();
  
  const existing = currentList.find((h) => h.tag.toLowerCase() === cleanTag);
  if (existing) {
    return existing;
  }

  const newItem: HashtagItem = {
    tag: cleanTag,
    category,
    isCustom: true,
  };

  const updatedList = [newItem, ...currentList];
  try {
    localStorage.setItem(STORAGE_KEY_HASHTAGS, JSON.stringify(updatedList));
  } catch {
    // storage fallback
  }

  return newItem;
}

export function getStoredPartnershipRequests(): PartnershipRequestItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_PARTNERSHIP_REQUESTS;
}

export function saveStoredPartnershipRequests(reqs: PartnershipRequestItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(reqs));
  } catch {
    // fallback
  }
}

export function addPartnershipRequest(item: Omit<PartnershipRequestItem, 'id' | 'createdAt'>): PartnershipRequestItem {
  const fullItem: PartnershipRequestItem = {
    ...item,
    id: `req-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const current = getStoredPartnershipRequests();
  const updated = [fullItem, ...current];
  saveStoredPartnershipRequests(updated);
  return fullItem;
}

// Reported Posts Functions
export function getStoredReportedPosts(): ReportedPostItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTED);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_REPORTED_POSTS;
}

export function saveStoredReportedPosts(reports: ReportedPostItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REPORTED, JSON.stringify(reports));
  } catch {
    // fallback
  }
}

export function submitReportedPost(
  report: Omit<ReportedPostItem, 'id' | 'createdAt' | 'status'>
): ReportedPostItem {
  const fullReport: ReportedPostItem = {
    ...report,
    id: `rep-${Date.now()}`,
    status: 'PENDING_REVIEW',
    createdAt: new Date().toISOString(),
  };

  const current = getStoredReportedPosts();
  const updated = [fullReport, ...current];
  saveStoredReportedPosts(updated);
  return fullReport;
}

export function updateReportStatus(
  reportId: string,
  newStatus: 'RESOLVED_DISMISSED' | 'POST_REMOVED',
  adminActionNote?: string
): void {
  const current = getStoredReportedPosts();
  const updated = current.map((r) => {
    if (r.id === reportId) {
      return {
        ...r,
        status: newStatus,
        reviewedAt: new Date().toISOString(),
        adminActionNote,
      };
    }
    return r;
  });
  saveStoredReportedPosts(updated);
}

// Saved Posts Functions
export function getSavedPostIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_POSTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function toggleSavePostId(postId: string): boolean {
  const current = getSavedPostIds();
  const exists = current.includes(postId);
  const updated = exists ? current.filter((id) => id !== postId) : [...current, postId];
  try {
    localStorage.setItem(STORAGE_KEY_SAVED_POSTS, JSON.stringify(updated));
  } catch {
    // fallback
  }
  return !exists;
}

// Hidden Posts Functions
export function getHiddenPostIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HIDDEN_POSTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function addHiddenPostId(postId: string): void {
  const current = getHiddenPostIds();
  if (!current.includes(postId)) {
    const updated = [...current, postId];
    try {
      localStorage.setItem(STORAGE_KEY_HIDDEN_POSTS, JSON.stringify(updated));
    } catch {
      // fallback
    }
  }
}

export function removeHiddenPostId(postId: string): void {
  const current = getHiddenPostIds();
  const updated = current.filter((id) => id !== postId);
  try {
    localStorage.setItem(STORAGE_KEY_HIDDEN_POSTS, JSON.stringify(updated));
  } catch {
    // fallback
  }
}

// Post Management Functions
export function deleteStoredPost(postId: string): void {
  const posts = getStoredPosts();
  const updated = posts.filter((p) => p.id !== postId);
  saveStoredPosts(updated);
}

export function toggleArchiveStoredPost(postId: string): boolean {
  const posts = getStoredPosts();
  let nextArchivedState = false;
  const updated = posts.map((p) => {
    if (p.id === postId) {
      nextArchivedState = !p.isArchived;
      return { ...p, isArchived: nextArchivedState };
    }
    return p;
  });
  saveStoredPosts(updated);
  return nextArchivedState;
}

export function updateStoredPost(
  postId: string,
  updates: Partial<Pick<PartnershipPost, 'title' | 'content' | 'imageUrl' | 'tags' | 'visibility'>>
): PartnershipPost | null {
  const posts = getStoredPosts();
  let updatedPost: PartnershipPost | null = null;
  const updated = posts.map((p) => {
    if (p.id === postId) {
      updatedPost = { ...p, ...updates };
      return updatedPost;
    }
    return p;
  });
  if (updatedPost) {
    saveStoredPosts(updated);
  }
  return updatedPost;
}

export function unlockTeaserForPost(postId: string, userId: string): boolean {
  const posts = getStoredPosts();
  let success = false;
  const updated = posts.map((p) => {
    if (p.id === postId && p.dealTeaser) {
      const current = p.dealTeaser.unlockedUserIds || [];
      if (!current.includes(userId)) {
        p.dealTeaser = {
          ...p.dealTeaser,
          unlockedUserIds: [...current, userId],
        };
      }
      success = true;
    }
    return p;
  });
  if (success) {
    saveStoredPosts(updated);
  }
  return success;
}
