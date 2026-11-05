import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Handshake,
  MessageSquare,
  Users,
  Network,
  TrendingUp,
  FileText,
  Sparkles,
  User,
  Settings,
  BookOpen,
  Building2,
  ShieldCheck,
  Shield,
  Route,
  Layers,
  Home,
  Compass,
  CheckCircle2,
  Briefcase,
  Mail,
  HelpCircle,
  Scale,
  ArrowRight,
  X,
  Command,
  CornerDownLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface PageItem {
  id: string;
  title: string;
  path: string;
  category: 'Member Hub' | 'Company Portal' | 'Admin Ops' | 'Public Website';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
  requiredRole?: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';
}

const ALL_AVAILABLE_PAGES: PageItem[] = [
  // 1. Member Hub Pages
  {
    id: 'member-home',
    title: 'Dashboard & Command Center',
    path: '/app/home',
    category: 'Member Hub',
    description: 'Executive overview, stats, recent mandates & recommended matches',
    icon: LayoutDashboard,
    keywords: ['home', 'dashboard', 'overview', 'stats', 'activity', 'feed'],
    requiredRole: 'USER',
  },
  {
    id: 'member-search',
    title: 'Search & Executive Discovery',
    path: '/app/search',
    category: 'Member Hub',
    description: 'Discover verified decision makers, suppliers, and commercial partners',
    icon: Search,
    keywords: ['search', 'directory', 'decision makers', 'executives', 'procurement', 'people', 'companies', 'find'],
    requiredRole: 'USER',
  },
  {
    id: 'member-partnerships',
    title: 'Bilateral Deal Rooms & Partnerships',
    path: '/app/partnerships',
    category: 'Member Hub',
    description: 'Active commercial deal rooms, mutual NDAs, and escrow negotiations',
    icon: Handshake,
    keywords: ['deal rooms', 'deals', 'partnerships', 'nda', 'negotiation', 'contracts'],
    requiredRole: 'USER',
  },
  {
    id: 'member-partnership-requests',
    title: 'Partnership Requests & Inbound Proposals',
    path: '/app/partnerships/requests',
    category: 'Member Hub',
    description: 'Incoming and outgoing commercial partnership proposals and RFPs',
    icon: FileText,
    keywords: ['requests', 'proposals', 'inbound', 'outbound', 'tenders', 'rfps'],
    requiredRole: 'USER',
  },
  {
    id: 'member-messages',
    title: 'Direct Business Messaging',
    path: '/app/messages',
    category: 'Member Hub',
    description: 'Spam-free bilateral communications with verified counterparties',
    icon: MessageSquare,
    keywords: ['messages', 'chat', 'inbox', 'conversations', 'direct message'],
    requiredRole: 'USER',
  },
  {
    id: 'member-connections',
    title: 'Verified Connections & Handshakes',
    path: '/app/connections',
    category: 'Member Hub',
    description: 'Active corporate bridges, mutual connections, and handshakes',
    icon: Users,
    keywords: ['connections', 'network', 'handshakes', 'peers', 'directory', 'contacts'],
    requiredRole: 'USER',
  },
  {
    id: 'member-introductions',
    title: 'Warm Introductions Network',
    path: '/app/introductions',
    category: 'Member Hub',
    description: 'Request and steward warm introductions through trusted mutual peers',
    icon: Network,
    keywords: ['introductions', 'referrals', 'warm intro', 'bridge', 'connector'],
    requiredRole: 'USER',
  },
  {
    id: 'member-opportunities',
    title: 'Commercial Synergy Graph & Opportunities',
    path: '/app/opportunities',
    category: 'Member Hub',
    description: 'Explore live enterprise commercial opportunities and buying committees',
    icon: TrendingUp,
    keywords: ['opportunities', 'graph', 'synergy', 'mandates', 'commercial'],
    requiredRole: 'USER',
  },
  {
    id: 'member-reverse-marketplace',
    title: 'Reverse Sourcing RFPs & Tenders Vault',
    path: '/app/reverse-marketplace',
    category: 'Member Hub',
    description: 'Corporate buyers sourcing specific products and qualified suppliers',
    icon: FileText,
    keywords: ['rfp', 'tenders', 'sourcing', 'vault', 'procurement', 'reverse marketplace'],
    requiredRole: 'USER',
  },
  {
    id: 'member-ai-assistant',
    title: 'AI Commercial Matcher & Sourcing Assistant',
    path: '/app/ai-assistant',
    category: 'Member Hub',
    description: 'AI-assisted sourcing, semantic search, and match refinement',
    icon: Sparkles,
    keywords: ['ai', 'assistant', 'bot', 'copilot', 'smart search', 'matcher'],
    requiredRole: 'USER',
  },
  {
    id: 'member-profile',
    title: 'My Professional Dossier & Focus Areas',
    path: '/app/profile',
    category: 'Member Hub',
    description: 'Manage verified executive credentials, scope, and contact settings',
    icon: User,
    keywords: ['profile', 'dossier', 'identity', 'bio', 'resume', 'my account'],
    requiredRole: 'USER',
  },
  {
    id: 'member-settings',
    title: 'Account & Privacy Settings',
    path: '/app/settings',
    category: 'Member Hub',
    description: 'Pitch firewall presets, notification rules, and security controls',
    icon: Settings,
    keywords: ['settings', 'privacy', 'security', 'preferences', 'password', 'notifications', 'firewall'],
    requiredRole: 'USER',
  },
  {
    id: 'member-guide',
    title: 'Member User Guide & Playbook',
    path: '/app/guide',
    category: 'Member Hub',
    description: 'How to maximize deal flow, anti-spam protocols, and verified handshakes',
    icon: BookOpen,
    keywords: ['guide', 'help', 'tutorial', 'playbook', 'docs', 'manual'],
    requiredRole: 'USER',
  },

  // 2. Company Portal Pages
  {
    id: 'company-dashboard',
    title: 'Corporate Dashboard & Overview',
    path: '/company',
    category: 'Company Portal',
    description: 'Enterprise overview, mandate metrics, and commercial team status',
    icon: Building2,
    keywords: ['company', 'enterprise', 'corporate', 'organization', 'portal'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-search',
    title: 'Corporate Sourcing Engine',
    path: '/company/search',
    category: 'Company Portal',
    description: 'High-volume corporate supplier discovery and executive search',
    icon: Search,
    keywords: ['company search', 'corporate sourcing', 'suppliers', 'vendors'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-pipeline',
    title: 'Inbound Sourcing & Proposal Pipeline',
    path: '/company/pipeline',
    category: 'Company Portal',
    description: 'Manage inbound proposals, evaluate pitches, and triage opportunities',
    icon: Network,
    keywords: ['pipeline', 'inbound', 'proposals', 'leads', 'deals', 'funnel'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-proposals',
    title: 'Corporate Proposals & Tenders',
    path: '/company/proposals',
    category: 'Company Portal',
    description: 'Track responses to enterprise tenders and RFP submissions',
    icon: FileText,
    keywords: ['proposals', 'tenders', 'rfps', 'bids', 'submissions'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-connections',
    title: 'Enterprise Verified Network',
    path: '/company/connections',
    category: 'Company Portal',
    description: 'Corporate-level partner ecosystem and verified institutional connections',
    icon: Users,
    keywords: ['company connections', 'corporate partners', 'institutional network'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-team',
    title: 'Team, Signatories & Decision Makers',
    path: '/company/team',
    category: 'Company Portal',
    description: 'Manage executive team members, department scopes, and signing tiers',
    icon: Users,
    keywords: ['team', 'staff', 'colleagues', 'members', 'signatories', 'governance'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-mandates',
    title: 'Corporate Strategic Mandates',
    path: '/company/mandates',
    category: 'Company Portal',
    description: 'Publish active commercial procurement mandates and buying criteria',
    icon: ShieldCheck,
    keywords: ['mandates', 'procurement goals', 'buying intent', 'requirements'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-matcher',
    title: 'B2B Corporate AI Matcher',
    path: '/company/ai-matcher',
    category: 'Company Portal',
    description: 'Autonomous enterprise synergy matching across global trade corridors',
    icon: Sparkles,
    keywords: ['ai matcher', 'matcher', 'synergy', 'automated matching', 'recommendations'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-routing',
    title: 'Inbound Gateways & Sourcing Routing',
    path: '/company/routing',
    category: 'Company Portal',
    description: 'Automated rules for routing incoming supplier pitches to department leads',
    icon: Route,
    keywords: ['routing', 'gateways', 'triage', 'rules', 'delegation'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-lineage',
    title: 'Corporate Hierarchy & Entity Lineage',
    path: '/company/lineage',
    category: 'Company Portal',
    description: 'Parent-subsidiary corporate tree, global entities, and holding structures',
    icon: Layers,
    keywords: ['hierarchy', 'lineage', 'subsidiaries', 'parent', 'structure', 'entities'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-claim',
    title: 'Verify & Claim Company Dossier',
    path: '/company/claim',
    category: 'Company Portal',
    description: 'DNS and corporate domain verification for organization ownership',
    icon: Shield,
    keywords: ['claim', 'verify', 'dns verification', 'ownership', 'corporate domain'],
    requiredRole: 'COMPANY_ADMIN',
  },
  {
    id: 'company-guide',
    title: 'Company Portal Operations Handbook',
    path: '/company/guide',
    category: 'Company Portal',
    description: 'Best practices for managing enterprise mandates and commercial teams',
    icon: BookOpen,
    keywords: ['company guide', 'handbook', 'enterprise docs', 'help'],
    requiredRole: 'COMPANY_ADMIN',
  },

  // 3. Admin Ops Portal Pages
  {
    id: 'admin-dashboard',
    title: 'Ops Telemetry & Performance Dashboard',
    path: '/admin/dashboard',
    category: 'Admin Ops',
    description: 'Real-time system health, active users, search throughput, and telemetry',
    icon: Settings,
    keywords: ['admin dashboard', 'ops', 'telemetry', 'health', 'metrics', 'stats'],
    requiredRole: 'SUPER_ADMIN',
  },
  {
    id: 'admin-verification',
    title: 'Identity & Corporate Verification Queue',
    path: '/admin/verification',
    category: 'Admin Ops',
    description: 'Review and approve pending executive identities and DNS domain claims',
    icon: ShieldCheck,
    keywords: ['verification', 'queue', 'approval', 'review', 'kyc', 'dns approval'],
    requiredRole: 'SUPER_ADMIN',
  },
  {
    id: 'admin-users',
    title: 'User Directory & Access Governance',
    path: '/admin/users',
    category: 'Admin Ops',
    description: 'Manage registered users, roles, quotas, suspensions, and elevations',
    icon: Users,
    keywords: ['admin users', 'governance', 'roles', 'permissions', 'accounts'],
    requiredRole: 'SUPER_ADMIN',
  },
  {
    id: 'admin-companies',
    title: 'Company Registry & Data Stewardship',
    path: '/admin/companies',
    category: 'Admin Ops',
    description: 'Maintain verified enterprise database, deduplication, and sector tags',
    icon: Building2,
    keywords: ['admin companies', 'registry', 'database', 'dedup', 'stewardship'],
    requiredRole: 'SUPER_ADMIN',
  },
  {
    id: 'admin-ai-console',
    title: 'AI Engine Console & Vector Diagnostics',
    path: '/admin/ai-console',
    category: 'Admin Ops',
    description: 'Inspect vector embedding indexes, semantic ranking weights, and test prompts',
    icon: Sparkles,
    keywords: ['ai console', 'vector', 'embeddings', 'semantic', 'prompting'],
    requiredRole: 'SUPER_ADMIN',
  },
  {
    id: 'admin-imports',
    title: 'Bulk Data Imports & Ingestion Engine',
    path: '/admin/imports',
    category: 'Admin Ops',
    description: 'Import enterprise directories, CSV datasets, and run bulk migrations',
    icon: Layers,
    keywords: ['imports', 'csv', 'ingestion', 'bulk upload', 'seed', 'sync'],
    requiredRole: 'SUPER_ADMIN',
  },
  {
    id: 'admin-moderation',
    title: 'Trust, Safety & Content Moderation',
    path: '/admin/moderation',
    category: 'Admin Ops',
    description: 'Review flagged pitches, spam reports, and audit firewall blocks',
    icon: Shield,
    keywords: ['moderation', 'reports', 'flags', 'trust', 'safety', 'bans'],
    requiredRole: 'SUPER_ADMIN',
  },
  {
    id: 'admin-audit-logs',
    title: 'Immutable Security & Audit Trail',
    path: '/admin/audit-logs',
    category: 'Admin Ops',
    description: 'Inspect chronological system events, admin actions, and authentication logs',
    icon: FileText,
    keywords: ['audit logs', 'security logs', 'history', 'events', 'trail'],
    requiredRole: 'SUPER_ADMIN',
  },
  {
    id: 'admin-guide',
    title: 'Admin Operations Handbook',
    path: '/admin/guide',
    category: 'Admin Ops',
    description: 'Standard operating procedures for MESHVI system administrators',
    icon: BookOpen,
    keywords: ['admin guide', 'sop', 'admin docs', 'operations'],
    requiredRole: 'SUPER_ADMIN',
  },

  // 4. Public Website Pages
  {
    id: 'public-home',
    title: 'MESHVI Platform Home',
    path: '/',
    category: 'Public Website',
    description: 'Main landing page for MESHVI anti-spam commercial network',
    icon: Home,
    keywords: ['home', 'landing', 'main', 'meshvi', 'welcome'],
  },
  {
    id: 'public-how-it-works',
    title: 'How It Works (Bilateral Handshakes)',
    path: '/how-it-works',
    category: 'Public Website',
    description: 'Explanation of double opt-in protocol, zero cold spam, and verified routing',
    icon: Compass,
    keywords: ['how it works', 'explainer', 'methodology', 'protocol'],
  },
  {
    id: 'public-why-meshvi',
    title: 'Why MESHVI',
    path: '/why-meshvi',
    category: 'Public Website',
    description: 'Key differentiators: bilateral trust, verified credentials, spam firewall',
    icon: CheckCircle2,
    keywords: ['why', 'benefits', 'features', 'comparison', 'value'],
  },
  {
    id: 'public-search-showcase',
    title: 'Search & Synergy Showcase',
    path: '/search-showcase',
    category: 'Public Website',
    description: 'Interactive demonstration of semantic commercial intent search',
    icon: Search,
    keywords: ['showcase', 'demo', 'preview', 'interactive'],
  },
  {
    id: 'public-for-companies',
    title: 'Solutions for Enterprises & Corporations',
    path: '/for-companies',
    category: 'Public Website',
    description: 'Enterprise procurement, supplier vetting, and commercial alliances',
    icon: Building2,
    keywords: ['enterprises', 'companies', 'corporate', 'b2b'],
  },
  {
    id: 'public-for-professionals',
    title: 'Solutions for Decision Makers & Executives',
    path: '/for-professionals',
    category: 'Public Website',
    description: 'Protect your time, set commercial boundaries, and monetize intent',
    icon: User,
    keywords: ['professionals', 'executives', 'leaders', 'decision makers'],
  },
  {
    id: 'public-use-cases',
    title: 'Commercial Use Cases & Scenarios',
    path: '/use-cases',
    category: 'Public Website',
    description: 'Real-world cross-border trade, retail concessions, and tech co-selling',
    icon: Briefcase,
    keywords: ['use cases', 'scenarios', 'examples', 'applications'],
  },
  {
    id: 'public-about',
    title: 'About MESHVI & Mission',
    path: '/about',
    category: 'Public Website',
    description: 'Our mission to eliminate commercial spam and restore high-trust trade',
    icon: Building2,
    keywords: ['about', 'mission', 'story', 'team', 'company'],
  },
  {
    id: 'public-contact',
    title: 'Contact Corporate Support',
    path: '/contact',
    category: 'Public Website',
    description: 'Reach our institutional team for inquiries, press, and partnership help',
    icon: Mail,
    keywords: ['contact', 'support', 'inquiry', 'reach us', 'email'],
  },
  {
    id: 'public-faq',
    title: 'Frequently Asked Questions (FAQ)',
    path: '/faq',
    category: 'Public Website',
    description: 'Answers to common questions regarding membership, trust, and pricing',
    icon: HelpCircle,
    keywords: ['faq', 'questions', 'answers', 'help'],
  },
  {
    id: 'public-privacy',
    title: 'Privacy & Data Protection Policy',
    path: '/privacy',
    category: 'Public Website',
    description: 'Our zero data-scraping and privacy-first architectural guarantees',
    icon: ShieldCheck,
    keywords: ['privacy', 'gdpr', 'data', 'confidentiality', 'protection'],
  },
  {
    id: 'public-terms',
    title: 'Terms of Commercial Service',
    path: '/terms',
    category: 'Public Website',
    description: 'Legal terms and acceptable commercial use agreement',
    icon: FileText,
    keywords: ['terms', 'legal', 'tos', 'conditions'],
  },
  {
    id: 'public-legal',
    title: 'Legal Notice & Compliance Information',
    path: '/legal',
    category: 'Public Website',
    description: 'Corporate registration, jurisdiction, and legal compliance',
    icon: Scale,
    keywords: ['legal', 'notice', 'compliance', 'jurisdiction'],
  },
];

type CategoryFilter = 'ALL' | 'Member Hub' | 'Company Portal' | 'Admin Ops' | 'Public Website';

interface UniversalCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalCommandBar: React.FC<UniversalCommandBarProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const userRoles = user?.roles || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isCompanyAdmin = userRoles.includes('COMPANY_ADMIN');

  // Filter available pages by user permissions
  const accessiblePages = useMemo(() => {
    return ALL_AVAILABLE_PAGES.filter((page) => {
      if (!page.requiredRole) return true;
      if (page.requiredRole === 'SUPER_ADMIN') return isSuperAdmin;
      if (page.requiredRole === 'COMPANY_ADMIN') return isSuperAdmin || isCompanyAdmin;
      if (page.requiredRole === 'USER') return true;
      return true;
    });
  }, [isSuperAdmin, isCompanyAdmin]);

  // Filter pages by category and search query
  const filteredPages = useMemo(() => {
    let pages = accessiblePages;

    if (selectedCategory !== 'ALL') {
      pages = pages.filter((p) => p.category === selectedCategory);
    }

    const q = query.trim().toLowerCase();
    if (!q) return pages;

    return pages.filter((page) => {
      if (page.title.toLowerCase().includes(q)) return true;
      if (page.path.toLowerCase().includes(q)) return true;
      if (page.description.toLowerCase().includes(q)) return true;
      if (page.category.toLowerCase().includes(q)) return true;
      return page.keywords.some((k) => k.toLowerCase().includes(q));
    });
  }, [accessiblePages, selectedCategory, query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredPages.length, selectedCategory, query]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeItem = listRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard navigation: Arrow Up, Arrow Down, Enter, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (filteredPages.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredPages.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredPages.length) % filteredPages.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const targetPage = filteredPages[selectedIndex];
        if (targetPage) {
          navigate(targetPage.path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredPages, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  const handleSelectPage = (path: string) => {
    navigate(path);
    onClose();
  };

  const categoryCounts = {
    ALL: accessiblePages.length,
    'Member Hub': accessiblePages.filter((p) => p.category === 'Member Hub').length,
    'Company Portal': accessiblePages.filter((p) => p.category === 'Company Portal').length,
    'Admin Ops': accessiblePages.filter((p) => p.category === 'Admin Ops').length,
    'Public Website': accessiblePages.filter((p) => p.category === 'Public Website').length,
  };

  const availableCategories: CategoryFilter[] = ['ALL', 'Member Hub'];
  if (isCompanyAdmin || isSuperAdmin) availableCategories.push('Company Portal');
  if (isSuperAdmin) availableCategories.push('Admin Ops');
  availableCategories.push('Public Website');

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 p-2 sm:p-4 bg-navy/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200/90 flex items-center space-x-3 bg-white">
          <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search available pages (e.g. 'deal rooms', 'pipeline', 'search', 'settings')..."
            className="flex-1 bg-transparent text-sm font-semibold text-navy placeholder:text-slate-400 focus:outline-none"
          />
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="hidden sm:inline text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200">
              ESC to close
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-navy rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center space-x-1.5 overflow-x-auto text-xs shrink-0">
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-navy text-white shadow-2xs'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-200/60'
                }`}
              >
                <span>{cat === 'ALL' ? 'All Pages' : cat}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div ref={listRef} className="p-2 space-y-1 overflow-y-auto flex-1 text-xs">
          {filteredPages.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Compass className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-navy">No available pages found</p>
              <p className="text-xs text-slate-400">
                No matching routes for "{query}". Try searching for "search", "deals", "settings", or "dashboard".
              </p>
            </div>
          ) : (
            filteredPages.map((page, idx) => {
              const isSelected = idx === selectedIndex;
              const isCurrentPage = location.pathname === page.path;
              const IconComp = page.icon;

              return (
                <button
                  key={page.id}
                  type="button"
                  data-active={isSelected}
                  onClick={() => handleSelectPage(page.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all group cursor-pointer ${
                    isSelected
                      ? 'bg-primary-soft/60 border border-primary/30 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-primary text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-navy'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold text-xs truncate ${
                            isSelected ? 'text-primary' : 'text-navy group-hover:text-primary'
                          }`}
                        >
                          {page.title}
                        </span>
                        {isCurrentPage && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700 uppercase">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 leading-tight">
                        {page.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80 hidden sm:inline">
                      {page.path}
                    </span>
                    {isSelected ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-primary bg-white px-2 py-0.5 rounded-md border border-primary/30 shadow-2xs">
                        <span>Go</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 border-t border-slate-200/90 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Command className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-navy">Quick Page Navigator</span>
            <span className="text-slate-400">&bull;</span>
            <span>{filteredPages.length} available pages</span>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-navy shadow-2xs">
                &uarr; &darr;
              </kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-navy shadow-2xs">
                &crarr;
              </kbd>
              <span>open</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-navy shadow-2xs">
                esc
              </kbd>
              <span>close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
