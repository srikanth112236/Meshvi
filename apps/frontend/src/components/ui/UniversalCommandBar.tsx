import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Building2,
  MessageSquare,
  Sparkles,
  Network,
  Settings,
  ArrowRight,
  X,
  Command,
  FileText,
  Handshake,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UniversalCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalCommandBar: React.FC<UniversalCommandBarProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Universal Escape key dismissal (Gap 260)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  const [results, setResults] = useState<{
    navigation: any[];
    companies: any[];
    people: any[];
  }>({
    navigation: [],
    companies: [],
    people: [],
  });

  const userRoles = user?.roles || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isCompanyAdmin = userRoles.includes('COMPANY_ADMIN');

  const adminActions = [
    {
      id: 'admin-dashboard',
      title: 'Telemetry & Ops Dashboard',
      category: 'Admin Ops',
      icon: Settings,
      action: () => navigate('/admin/dashboard'),
    },
    {
      id: 'admin-users',
      title: 'User Directory & Governance',
      category: 'Admin Ops',
      icon: Users,
      action: () => navigate('/admin/users'),
    },
    {
      id: 'admin-companies',
      title: 'Company Registry & Hierarchy',
      category: 'Admin Ops',
      icon: Building2,
      action: () => navigate('/admin/companies'),
    },
    {
      id: 'admin-audit',
      title: 'System Audit Logs',
      category: 'Admin Ops',
      icon: Network,
      action: () => navigate('/admin/audit-logs'),
    },
  ];

  const companyActions = [
    {
      id: 'company-orgs',
      title: 'My Organizations & Dossiers',
      category: 'Company Portal',
      icon: Building2,
      action: () => navigate('/company'),
    },
    {
      id: 'company-team',
      title: 'Team & Decision Makers',
      category: 'Company Portal',
      icon: Users,
      action: () => navigate('/company/team'),
    },
    {
      id: 'company-pipeline',
      title: 'Inbound Sourcing & Proposal Pipeline',
      category: 'Company Portal',
      icon: Network,
      action: () => navigate('/company/pipeline'),
    },
    {
      id: 'company-mandates',
      title: 'Corporate Mandate Registry',
      category: 'Company Portal',
      icon: ShieldCheck,
      action: () => navigate('/company/mandates'),
    },
    {
      id: 'company-matcher',
      title: 'B2B AI Matcher',
      category: 'Company Portal',
      icon: Sparkles,
      action: () => navigate('/company/ai-matcher'),
    },
  ];

  const memberActions = [
    {
      id: 'nav-search',
      title: 'Intent Search Engine',
      category: 'Member Hub',
      icon: Search,
      action: () => navigate('/app/search'),
    },
    {
      id: 'nav-ai',
      title: 'AI Commercial Assistant',
      category: 'Member Hub',
      icon: Sparkles,
      action: () => navigate('/app/ai-assistant'),
    },
    {
      id: 'nav-connections',
      title: 'Active Connections & Bridges',
      category: 'Member Hub',
      icon: Users,
      action: () => navigate('/app/connections'),
    },
    {
      id: 'nav-rfps',
      title: 'Reverse Sourcing RFPs & Tenders Vault',
      category: 'Member Hub',
      icon: FileText,
      action: () => navigate('/app/rfps'),
    },
    {
      id: 'nav-deal-rooms',
      title: 'Deal Rooms & Bilateral Agreements (m-NDA)',
      category: 'Member Hub',
      icon: Handshake,
      action: () => navigate('/app/deal-rooms'),
    },
    {
      id: 'nav-introductions',
      title: 'Warm Introductions Network',
      category: 'Member Hub',
      icon: Network,
      action: () => navigate('/app/introductions'),
    },
    {
      id: 'nav-messages',
      title: 'Direct Business Messaging',
      category: 'Member Hub',
      icon: MessageSquare,
      action: () => navigate('/app/messages'),
    },
    {
      id: 'nav-profile',
      title: 'My Professional Dossier & Focus Areas',
      category: 'Member Hub',
      icon: User,
      action: () => navigate('/app/profile'),
    },
    {
      id: 'nav-settings',
      title: 'Account & Privacy Settings',
      category: 'Member Hub',
      icon: Settings,
      action: () => navigate('/app/settings'),
    },
  ];

  const staticActions = isSuperAdmin
    ? adminActions
    : isCompanyAdmin
    ? [...companyActions, ...memberActions]
    : memberActions;

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || !token) {
      setResults({
        navigation: staticActions,
        companies: [],
        people: [],
      });
      return;
    }

    const filteredNav = staticActions.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );

    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/v1/search?q=${encodeURIComponent(query)}&limit=4`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.matches) {
            const matches = data.data.matches;
            const companiesMap = new Map();
            const peopleList: any[] = [];

            matches.forEach((m: any) => {
              if (m.companyName && !companiesMap.has(m.companyName)) {
                companiesMap.set(m.companyName, {
                  name: m.companyName,
                  industry: m.industry,
                  profileId: m.profileId,
                });
              }
              if (m.displayName) {
                peopleList.push({
                  id: m.profileId,
                  name: m.displayName,
                  title: m.currentTitle,
                  company: m.companyName,
                });
              }
            });

            setResults({
              navigation: filteredNav,
              companies: Array.from(companiesMap.values()).slice(0, 3),
              people: peopleList.slice(0, 3),
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, token]);

  if (!isOpen) return null;

  const handleSelect = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-navy/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Command Search Bar Header */}
        <div className="p-4 border-b border-border flex items-center space-x-3 bg-bg">
          <Search className="w-5 h-5 text-text-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, verified people, or companies... (Ctrl+K)"
            autoFocus
            className="flex-1 bg-transparent text-sm font-semibold text-navy placeholder:text-text-muted focus:outline-none"
          />
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] font-black px-2 py-0.5 bg-surface-muted text-text-muted rounded border border-border">
              ESC
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-text-muted hover:text-navy rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Command Results Body */}
        <div className="p-3 space-y-4 overflow-y-auto flex-1 text-xs">
          {loading && (
            <div className="py-4 text-center text-text-muted text-[11px]">
              Querying platform intelligence...
            </div>
          )}

          {/* Quick Navigation Commands */}
          {results.navigation.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2">
                Actions & Quick Links
              </span>
              <div className="space-y-0.5">
                {results.navigation.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.action)}
                    className="w-full p-2.5 rounded-xl hover:bg-surface-muted/60 flex items-center justify-between text-left transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-navy group-hover:text-primary">
                        {item.title}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* People Results */}
          {results.people.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 flex items-center space-x-1">
                <Users className="w-3 h-3 text-primary" />
                <span>Verified Professionals</span>
              </span>
              <div className="space-y-0.5">
                {results.people.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() =>
                      handleSelect(() =>
                        navigate(`/app/search?q=${encodeURIComponent(person.name)}`)
                      )
                    }
                    className="w-full p-2.5 rounded-xl hover:bg-surface-muted/60 flex items-center justify-between text-left transition-colors group"
                  >
                    <div>
                      <span className="font-bold text-navy block group-hover:text-primary">
                        {person.name}
                      </span>
                      <span className="text-[10px] text-text-muted block">
                        {person.title} &bull; {person.company}
                      </span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded uppercase">
                      Verified
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Companies Results */}
          {results.companies.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 flex items-center space-x-1">
                <Building2 className="w-3 h-3 text-indigo-600" />
                <span>Enterprise Entities</span>
              </span>
              <div className="space-y-0.5">
                {results.companies.map((co) => (
                  <button
                    key={co.name}
                    type="button"
                    onClick={() =>
                      handleSelect(() =>
                        navigate(`/app/search?q=${encodeURIComponent(co.name)}`)
                      )
                    }
                    className="w-full p-2.5 rounded-xl hover:bg-surface-muted/60 flex items-center justify-between text-left transition-colors group"
                  >
                    <div>
                      <span className="font-bold text-navy block group-hover:text-indigo-600">
                        {co.name}
                      </span>
                      <span className="text-[10px] text-text-muted block">
                        {co.industry}
                      </span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded uppercase">
                      Entity
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Info */}
        <div className="p-3 border-t border-border bg-bg flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center space-x-1.5">
            <Command className="w-3.5 h-3.5 text-primary" />
            <span>Universal Command Bar</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px]">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded font-black text-navy">
              Ctrl + K
            </kbd>
            <span>anywhere to launch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
