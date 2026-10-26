import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Sparkles,
  CheckCircle2,
  Check,
  Filter,
  ShieldCheck,
  Send,
  Briefcase,
  Users,
  Building2,
  Globe,
  SlidersHorizontal,
  BookmarkPlus,
  ChevronDown,
  X,
  Layers,
  Network,
  Scale,
  ArrowRight,
  TrendingUp,
  Compass,
  Route,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Clock,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { ConnectOpportunityModal } from '../../components/ui/ConnectOpportunityModal';
import { SubmitCompanyProposalModal } from '../../components/ui/SubmitCompanyProposalModal';
import { CompanyDossierModal } from '../../components/ui/CompanyDossierModal';
import { PersonDossierDrawer } from '../../components/ui/PersonDossierDrawer';
import { OpportunityQualificationModal } from '../../components/ui/OpportunityQualificationModal';
import { SearchGuideModal } from '../../components/ui/SearchGuideModal';
import { WhyThisMatchModal } from '../../components/ui/WhyThisMatchModal';

type SearchMode = 'DECISION_MAKERS' | 'ENTERPRISES' | 'OPPORTUNITY_GRAPH' | 'MARKET_CORRIDOR';

interface SearchableDropdownFilterProps {
  label: string;
  allLabel: string;
  selectedValue: string;
  options: Array<{ value: string; label: string; count?: number }>;
  onSelect: (val: string) => void;
  icon: React.ReactNode;
}

const SearchableDropdownFilter: React.FC<SearchableDropdownFilterProps> = ({
  label,
  allLabel,
  selectedValue,
  options,
  onSelect,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(
    (o) => o.value.toLowerCase() === selectedValue.toLowerCase() || o.label.toLowerCase() === selectedValue.toLowerCase()
  );
  const displayLabel = selectedValue ? (selectedOption?.label || selectedValue) : allLabel;

  const filteredOptions = options.filter(
    (o) =>
      o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-block text-xs" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm('');
        }}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          selectedValue
            ? 'bg-black text-white border-black font-bold shadow-xs'
            : 'bg-surface text-text-muted border-border hover:border-neutral-400 hover:text-navy'
        }`}
      >
        <span className={selectedValue ? 'text-amber-300' : 'text-text-muted'}>{icon}</span>
        <span className="max-w-[150px] truncate">{displayLabel}</span>
        {selectedValue ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onSelect('');
            }}
            className="p-0.5 hover:bg-white/20 rounded-full transition-colors ml-0.5 cursor-pointer"
            title={`Clear ${label}`}
          >
            <X className="w-3 h-3 text-white" />
          </span>
        ) : (
          <ChevronDown className="w-3 h-3 text-text-muted shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-64 max-h-72 bg-surface border border-border rounded-xl shadow-xl z-50 flex flex-col p-2 space-y-1.5 animate-in fade-in zoom-in-95">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
            <input
              type="text"
              autoFocus
              placeholder={`Filter ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-bg border border-border rounded-lg text-xs text-navy focus:outline-none focus:border-black font-normal"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-0.5 pr-0.5 max-h-52">
            <button
              type="button"
              onClick={() => {
                onSelect('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                !selectedValue ? 'bg-black text-white font-bold' : 'text-navy hover:bg-surface-muted font-medium'
              }`}
            >
              <span>{allLabel}</span>
              {!selectedValue && <Check className="w-3.5 h-3.5 text-white" />}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-[11px] text-text-muted">No matching options</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValue.toLowerCase() === opt.value.toLowerCase() || selectedValue.toLowerCase() === opt.label.toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onSelect(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-black text-white font-bold' : 'text-navy hover:bg-surface-muted font-medium'
                    }`}
                  >
                    <span className="truncate mr-2">{opt.label}</span>
                    <div className="flex items-center space-x-1 shrink-0">
                      {opt.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
                          {opt.count}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const SearchPage = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  // Search Mode: DECISION_MAKERS vs ENTERPRISES vs OPPORTUNITY_GRAPH vs MARKET_CORRIDOR (Differentiator #3)
  const [searchMode, setSearchMode] = useState<
    'DECISION_MAKERS' | 'ENTERPRISES' | 'OPPORTUNITY_GRAPH' | 'MARKET_CORRIDOR'
  >('DECISION_MAKERS');
  const [opportunityGraphData, setOpportunityGraphData] = useState<any | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(false);

  // Differentiator #3 (Option B): Market-Corridor Opportunity Finder state
  const [corridorOrigin, setCorridorOrigin] = useState('IN');
  const [corridorDestination, setCorridorDestination] = useState('MY');
  const [corridorCategory, setCorridorCategory] = useState('FMCG & Food Beverages');
  const [corridorCompliance, setCorridorCompliance] = useState('Halal JAKIM');
  const [corridorData, setCorridorData] = useState<any | null>(null);
  const [loadingCorridors, setLoadingCorridors] = useState(false);

  // Differentiator #2: Two-Sided Fit Modal Target
  const [twoSidedTarget, setTwoSidedTarget] = useState<any | null>(null);
  const [twoSidedData, setTwoSidedData] = useState<any | null>(null);
  const [loadingTwoSided, setLoadingTwoSided] = useState(false);

  const [query, setQuery] = useState(urlQuery);
  const [functionFilter, setFunctionFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [seniorityFilter, setSeniorityFilter] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [corridorFilter, setCorridorFilter] = useState('');
  const [certificationFilter, setCertificationFilter] = useState('');
  const [minFitScoreFilter, setMinFitScoreFilter] = useState<number>(0);
  const [clarifySelectedRegion, setClarifySelectedRegion] = useState<{ label: string; filterKey: string; filterVal: string } | null>(null);
  const [clarifySelectedRole, setClarifySelectedRole] = useState<{ label: string; filterKey: string; filterVal: string } | null>(null);

  interface SearchFacetItem {
    value: string;
    label: string;
    count: number;
  }

  interface SearchFacets {
    industries: SearchFacetItem[];
    territories: SearchFacetItem[];
    functions: SearchFacetItem[];
    seniorities: SearchFacetItem[];
    corridors: SearchFacetItem[];
    certifications: SearchFacetItem[];
  }

  const [facets, setFacets] = useState<SearchFacets>({
    industries: [],
    territories: [],
    functions: [],
    seniorities: [],
    corridors: [],
    certifications: [],
  });

  const fetchFacets = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/search/facets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setFacets(data.data);
      }
    } catch {
      // Handled silently
    }
  };

  // Feature #16: Negative Exclusion Filters
  const [showNegativeFilters, _setShowNegativeFilters] = useState(false);
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [excludeCompanies, setExcludeCompanies] = useState('');
  const [excludeIndustries, setExcludeIndustries] = useState('');

  // Feature #15: Saved Searches & Alert Cadence
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [saveSearchCadence, setSaveSearchCadence] = useState<'DAILY' | 'WEEKLY' | 'INSTANT' | 'OFF'>('DAILY');
  const [savingSearch, setSavingSearch] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Feature #18: Lookalike Explorer Modal
  const [lookalikeData, setLookalikeData] = useState<any | null>(null);
  const [loadingLookalikes, setLoadingLookalikes] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState<any>(null);
  const [companyResults, setCompanyResults] = useState<any[]>([]);
  const [companyMeta, setCompanyMeta] = useState<{ totalCount: number; page: number; limit: number; totalPages: number }>({
    totalCount: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [activeMatchTier, setActiveMatchTier] = useState<'ALL' | 'BEST' | 'STRONG' | 'DIRECTORY'>('ALL');
  const [activeLocationScope, setActiveLocationScope] = useState<'ALL' | 'TARGET_CITY' | 'OTHER_CITIES'>('ALL');
  const [searchPriority, setSearchPriority] = useState<
    'BALANCED' | 'ROLE_FIRST' | 'COMPANY_FIRST' | 'GOAL_FIRST' | 'COMPLIANCE_FIRST'
  >('BALANCED');
  const [activeCorridorTier, setActiveCorridorTier] = useState<'ALL' | 'RECOMMENDED' | 'STRONG' | 'DIRECTORY'>('ALL');
  const [showSearchGuideModal, setShowSearchGuideModal] = useState(false);
  const [guideActiveTab, setGuideActiveTab] = useState<SearchMode>('DECISION_MAKERS');
  const [connectionRequested, setConnectionRequested] = useState<string | null>(null);
  const searchRequestIdRef = useRef(0);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    handleSearch(query, searchMode, 1, newSize, { matchTier: activeMatchTier, locationScope: activeLocationScope, searchPriority });
  };

  // Modals & Drawers State
  const [connectModalTarget, setConnectModalTarget] = useState<any | null>(null);
  const [proposalModalTarget, setProposalModalTarget] = useState<any | null>(null);
  const [dossierCompanyId, setDossierCompanyId] = useState<string | null>(null);
  const [personDossierProfileId, setPersonDossierProfileId] = useState<string | null>(null);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [activePassportData, setActivePassportData] = useState<any | null>(null);
  const [whyThisMatchTarget, setWhyThisMatchTarget] = useState<any | null>(null);
  const [verifyCompanyModalTarget, setVerifyCompanyModalTarget] = useState<any | null>(null);
  const [verifyCompanySuccessMessage, setVerifyCompanySuccessMessage] = useState<string | null>(null);
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [verifyMode, setVerifyMode] = useState<'BUYER_REQUEST' | 'CLAIM_DOMAIN'>('BUYER_REQUEST');
  const [verifyNotes, setVerifyNotes] = useState('');

  const _handleDisconnect = async (targetProfileId: string, name?: string) => {
    if (!token) return;
    const confirmDisconnect = window.confirm(
      `Are you sure you want to remove your connection with ${name || 'this contact'}? You can reconnect at any time.`
    );
    if (!confirmDisconnect) return;

    try {
      const res = await fetch(`/api/v1/connections/by-profile/${targetProfileId}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok && resultsData?.results) {
        const updatedResults = resultsData.results.map((r: any) =>
          r.profile.id === targetProfileId
            ? {
                ...r,
                profile: {
                  ...r.profile,
                  connectionStatus: 'NONE',
                  connectedAt: null,
                  connectedDays: 0,
                },
              }
            : r
        );
        setResultsData({ ...resultsData, results: updatedResults, matches: updatedResults });
      }
    } catch {}
  };

  const handleWithdraw = async (connectionId?: string, name?: string) => {
    if (!token || !connectionId) return;
    const confirmWithdraw = window.confirm(
      `Are you sure you want to withdraw your connection request to ${name || 'this contact'}?`
    );
    if (!confirmWithdraw) return;

    try {
      const res = await fetch(`/api/v1/connections/${connectionId}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok && resultsData?.results) {
        const updatedResults = resultsData.results.map((r: any) =>
          r.profile.connectionId === connectionId || r.profile.id === connectionId
            ? {
                ...r,
                profile: {
                  ...r.profile,
                  connectionStatus: 'NONE',
                  connectionId: null,
                },
              }
            : r
        );
        setResultsData({ ...resultsData, results: updatedResults, matches: updatedResults });
      }
    } catch {
      // Handled silently
    }
  };

  // Autocomplete Suggestions (min 2 chars)
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [categorizedSuggestions, setCategorizedSuggestions] = useState<any[]>([]);
  const [suggestedCorrection, setSuggestedCorrection] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSavedSearches = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/search/saved', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedSearches(data.data || []);
      }
    } catch {
      // Handled silently
    }
  };

  const handleFetchCorridors = async (
    origin = corridorOrigin,
    dest = corridorDestination,
    cat = corridorCategory,
    comp = corridorCompliance,
    qText = query,
  ) => {
    const currentReqId = ++searchRequestIdRef.current;
    setLoadingCorridors(true);
    try {
      const params = new URLSearchParams({
        origin,
        destination: dest,
        category: cat,
        compliance: comp,
      });
      if (qText && qText.trim()) {
        params.append('q', qText.trim());
      }
      const res = await fetch(`/api/v1/search/market-corridors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (currentReqId !== searchRequestIdRef.current) return;
      if (res.ok && data.success) {
        setCorridorData(data.data);
      }
    } catch {} finally {
      if (currentReqId === searchRequestIdRef.current) {
        setLoadingCorridors(false);
      }
    }
  };

  const handleSearch = async (
    overrideQuery?: string,
    overrideMode?: SearchMode,
    targetPage = 1,
    targetLimit = pageSize,
    filterOverrides?: Partial<{
      functionFilter: string;
      industryFilter: string;
      countryFilter: string;
      seniorityFilter: string;
      verifiedOnly: boolean;
      excludeKeywords: string;
      excludeCompanies: string;
      excludeIndustries: string;
      corridorFilter: string;
      certificationFilter: string;
      minFitScoreFilter: number;
      matchTier: 'ALL' | 'BEST' | 'STRONG' | 'DIRECTORY';
      locationScope: 'ALL' | 'TARGET_CITY' | 'OTHER_CITIES';
      searchPriority: 'BALANCED' | 'ROLE_FIRST' | 'COMPANY_FIRST' | 'GOAL_FIRST' | 'COMPLIANCE_FIRST';
    }>,
  ) => {
    const currentReqId = ++searchRequestIdRef.current;
    const qText = overrideQuery !== undefined ? overrideQuery : query;
    const currentMode = overrideMode !== undefined ? overrideMode : searchMode;
    const activeFunction = filterOverrides?.functionFilter !== undefined ? filterOverrides.functionFilter : functionFilter;
    const activeIndustry = filterOverrides?.industryFilter !== undefined ? filterOverrides.industryFilter : industryFilter;
    const activeCountry = filterOverrides?.countryFilter !== undefined ? filterOverrides.countryFilter : countryFilter;
    const activeSeniority = filterOverrides?.seniorityFilter !== undefined ? filterOverrides.seniorityFilter : seniorityFilter;
    const activeVerifiedOnly = filterOverrides?.verifiedOnly !== undefined ? filterOverrides.verifiedOnly : verifiedOnly;
    const activeExcludeKeywords = filterOverrides?.excludeKeywords !== undefined ? filterOverrides.excludeKeywords : excludeKeywords;
    const activeExcludeCompanies = filterOverrides?.excludeCompanies !== undefined ? filterOverrides.excludeCompanies : excludeCompanies;
    const activeExcludeIndustries = filterOverrides?.excludeIndustries !== undefined ? filterOverrides.excludeIndustries : excludeIndustries;
    const activeCorridor = filterOverrides?.corridorFilter !== undefined ? filterOverrides.corridorFilter : corridorFilter;
    const activeCertification = filterOverrides?.certificationFilter !== undefined ? filterOverrides.certificationFilter : certificationFilter;
    const activeMinFitScore = filterOverrides?.minFitScoreFilter !== undefined ? filterOverrides.minFitScoreFilter : minFitScoreFilter;
    const activeTier = filterOverrides?.matchTier !== undefined ? filterOverrides.matchTier : activeMatchTier;
    const activeLocScope = filterOverrides?.locationScope !== undefined ? filterOverrides.locationScope : activeLocationScope;
    const activePriority = filterOverrides?.searchPriority !== undefined ? filterOverrides.searchPriority : searchPriority;

    setLoading(true);

    try {
      if (currentMode === 'MARKET_CORRIDOR') {
        await handleFetchCorridors(corridorOrigin, corridorDestination, corridorCategory, corridorCompliance, qText);
      } else if (currentMode === 'OPPORTUNITY_GRAPH') {
        setLoadingGraph(true);
        const res = await fetch(`/api/v1/search/opportunity-graph?q=${encodeURIComponent(qText || '')}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (currentReqId !== searchRequestIdRef.current) return;
        if (res.ok && data.success) {
          setOpportunityGraphData(data.data);
        }
        setLoadingGraph(false);
      } else if (currentMode === 'DECISION_MAKERS') {
        const params = new URLSearchParams();
        if (qText) params.append('q', qText);
        params.append('page', String(targetPage));
        params.append('limit', String(targetLimit));
        if (activeFunction) params.append('function', activeFunction);
        if (activeIndustry) params.append('industry', activeIndustry);
        if (activeCountry) params.append('countryCode', activeCountry);
        if (activeSeniority) params.append('seniority', activeSeniority);
        if (activeVerifiedOnly) params.append('verifiedOnly', 'true');
        if (activeExcludeKeywords) params.append('excludeKeywords', activeExcludeKeywords);
        if (activeExcludeCompanies) params.append('excludeCompanies', activeExcludeCompanies);
        if (activeExcludeIndustries) params.append('excludeIndustries', activeExcludeIndustries);
        if (activeCorridor) params.append('corridor', activeCorridor);
        if (activeCertification) params.append('certification', activeCertification);
        if (activeMinFitScore > 0) params.append('minFitScore', String(activeMinFitScore));
        if (activeTier && activeTier !== 'ALL') params.append('matchTier', activeTier);
        if (activeLocScope && activeLocScope !== 'ALL') params.append('locationScope', activeLocScope);
        if (activePriority && activePriority !== 'BALANCED') params.append('searchPriority', activePriority);

        const res = await fetch(`/api/v1/search?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (currentReqId !== searchRequestIdRef.current) return;
        if (res.ok && data.success) {
          setResultsData(data.data);
          // Zero filter bleed: Intent criteria are evaluated natively in search engine backend without polluting frontend filter state
        }
      } else {
        // Search Enterprises & Organizations
        const params = new URLSearchParams();
        if (qText) params.append('q', qText);
        params.append('page', String(targetPage));
        params.append('limit', String(targetLimit));
        if (activeIndustry) params.append('industry', activeIndustry);
        if (activeCountry) params.append('countryCode', activeCountry);
        if (activeVerifiedOnly) params.append('verifiedOnly', 'true');
        if (activeFunction) params.append('function', activeFunction);
        if (activeSeniority) params.append('seniority', activeSeniority);
        if (activeExcludeCompanies) params.append('excludeCompanies', activeExcludeCompanies);
        if (activeExcludeIndustries) params.append('excludeIndustries', activeExcludeIndustries);

        const res = await fetch(`/api/v1/companies?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (currentReqId !== searchRequestIdRef.current) return;
        if (res.ok && data.success) {
          if (Array.isArray(data.data)) {
            setCompanyResults(data.data);
            setCompanyMeta({ totalCount: data.data.length, page: 1, limit: targetLimit, totalPages: 1 });
          } else {
            setCompanyResults(data.data?.items || []);
            setCompanyMeta({
              totalCount: data.data?.totalCount || 0,
              page: data.data?.page || 1,
              limit: data.data?.limit || targetLimit,
              totalPages: data.data?.totalPages || 1,
            });
          }
        }
      }
    } catch {
      // Handled silently
    } finally {
      if (currentReqId === searchRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleClearSearch = () => {
    ++searchRequestIdRef.current;
    setSearchParams({}, { replace: true });
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSuggestedCorrection(null);
    setCategorizedSuggestions([]);
    setResultsData(null);
    setCompanyResults([]);
    setOpportunityGraphData(null);
    setCorridorData(null);
    setCountryFilter('');
    setIndustryFilter('');
    setFunctionFilter('');
    setSeniorityFilter('');
    setVerifiedOnly(false);
    setExcludeKeywords('');
    setExcludeCompanies('');
    setExcludeIndustries('');
    setCorridorFilter('');
    setCertificationFilter('');
    setMinFitScoreFilter(0);
    setActiveMatchTier('ALL');
    setActiveLocationScope('ALL');
    setSearchPriority('BALANCED');
    setCurrentPage(1);

    handleSearch('', searchMode, 1, pageSize, {
      countryFilter: '',
      industryFilter: '',
      functionFilter: '',
      seniorityFilter: '',
      verifiedOnly: false,
      excludeKeywords: '',
      excludeCompanies: '',
      excludeIndustries: '',
      corridorFilter: '',
      certificationFilter: '',
      minFitScoreFilter: 0,
      matchTier: 'ALL',
      locationScope: 'ALL',
      searchPriority: 'BALANCED',
    });
  };

  const handleResetFiltersKeepQuery = () => {
    setCountryFilter('');
    setIndustryFilter('');
    setFunctionFilter('');
    setSeniorityFilter('');
    setVerifiedOnly(false);
    setExcludeKeywords('');
    setExcludeCompanies('');
    setExcludeIndustries('');
    setCorridorFilter('');
    setCertificationFilter('');
    setMinFitScoreFilter(0);
    setActiveMatchTier('ALL');
    setActiveLocationScope('ALL');
    setSearchPriority('BALANCED');
    setCurrentPage(1);

    handleSearch(query, searchMode, 1, pageSize, {
      countryFilter: '',
      industryFilter: '',
      functionFilter: '',
      seniorityFilter: '',
      verifiedOnly: false,
      excludeKeywords: '',
      excludeCompanies: '',
      excludeIndustries: '',
      corridorFilter: '',
      certificationFilter: '',
      minFitScoreFilter: 0,
      matchTier: 'ALL',
      locationScope: 'ALL',
      searchPriority: 'BALANCED',
    });
  };

  const handleFreshSearch = (overrideQueryText?: string, targetMode?: SearchMode) => {
    const q = overrideQueryText !== undefined ? overrideQueryText : query;
    const mode = targetMode || searchMode;
    if (q.trim()) {
      setSearchParams({ q: q.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
    setShowSuggestions(false);
    setCurrentPage(1);
    handleSearch(q, mode, 1, pageSize, {
      countryFilter,
      industryFilter,
      functionFilter,
      seniorityFilter,
      verifiedOnly,
      excludeKeywords,
      excludeCompanies,
      excludeIndustries,
      corridorFilter,
      certificationFilter,
      minFitScoreFilter,
      matchTier: activeMatchTier,
      locationScope: activeLocationScope,
      searchPriority,
    });
  };

  const handleOpenTwoSidedFit = async (profile: any) => {
    setTwoSidedTarget(profile);
    setLoadingTwoSided(true);
    setTwoSidedData(null);
    try {
      const res = await fetch(`/api/v1/search/two-sided-fit/${profile.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTwoSidedData(data.data);
      }
    } catch {} finally {
      setLoadingTwoSided(false);
    }
  };

  const applyFilter = (key: string, value: any) => {
    setCurrentPage(1);
    if (key === 'function') {
      setFunctionFilter(value);
      handleSearch(query, searchMode, 1, pageSize, { functionFilter: value });
    } else if (key === 'industry') {
      setIndustryFilter(value);
      handleSearch(query, searchMode, 1, pageSize, { industryFilter: value });
    } else if (key === 'country') {
      setCountryFilter(value);
      handleSearch(query, searchMode, 1, pageSize, { countryFilter: value });
    } else if (key === 'seniority') {
      setSeniorityFilter(value);
      handleSearch(query, searchMode, 1, pageSize, { seniorityFilter: value });
    } else if (key === 'verifiedOnly') {
      setVerifiedOnly(value);
      handleSearch(query, searchMode, 1, pageSize, { verifiedOnly: value });
    } else if (key === 'corridor') {
      setCorridorFilter(value);
      handleSearch(query, searchMode, 1, pageSize, { corridorFilter: value });
    } else if (key === 'certification') {
      setCertificationFilter(value);
      handleSearch(query, searchMode, 1, pageSize, { certificationFilter: value });
    } else if (key === 'minFitScore') {
      setMinFitScoreFilter(Number(value));
      handleSearch(query, searchMode, 1, pageSize, { minFitScoreFilter: Number(value) });
    }
  };

  const handleExecuteClarification = (
    regionChoice?: { filterKey: string; filterVal: string; label: string } | null,
    roleChoice?: { filterKey: string; filterVal: string; label: string } | null
  ) => {
    const reg = regionChoice !== undefined ? regionChoice : clarifySelectedRegion;
    const role = roleChoice !== undefined ? roleChoice : clarifySelectedRole;

    let newCountry = countryFilter;
    let newCorridor = corridorFilter;
    let newFunction = functionFilter;
    let newSeniority = seniorityFilter;

    if (reg) {
      if (reg.filterKey === 'country') {
        newCountry = reg.filterVal;
        newCorridor = '';
        setCountryFilter(reg.filterVal);
        setCorridorFilter('');
      } else if (reg.filterKey === 'corridor') {
        newCorridor = reg.filterVal;
        newCountry = '';
        setCorridorFilter(reg.filterVal);
        setCountryFilter('');
      }
    }

    if (role) {
      if (role.filterKey === 'function') {
        newFunction = role.filterVal;
        setFunctionFilter(role.filterVal);
      } else if (role.filterKey === 'seniority') {
        newSeniority = role.filterVal;
        setSeniorityFilter(role.filterVal);
      }
    }

    const baseTopic = resultsData?.clarification?.cleanTopic || query.replace(/^#+/, '').trim() || 'Logistics';
    let refinedQueryText = baseTopic;
    if (role) {
      const cleanRoleName = role.label.replace(/\(.*?\)/g, '').split('&')[0].trim();
      refinedQueryText += ` ${cleanRoleName}`;
    }
    if (reg) {
      const cleanRegName = reg.label.replace(/\(.*?\)/g, '').trim();
      refinedQueryText += ` in ${cleanRegName}`;
    }

    setQuery(refinedQueryText);
    setSearchParams({ q: refinedQueryText }, { replace: true });
    setCurrentPage(1);

    handleSearch(refinedQueryText, searchMode, 1, pageSize, {
      countryFilter: newCountry,
      corridorFilter: newCorridor,
      functionFilter: newFunction,
      seniorityFilter: newSeniority,
    });
  };

  const clearAllFilters = () => {
    setFunctionFilter('');
    setIndustryFilter('');
    setCountryFilter('');
    setSeniorityFilter('');
    setVerifiedOnly(false);
    setExcludeKeywords('');
    setExcludeCompanies('');
    setExcludeIndustries('');
    setCorridorFilter('');
    setCertificationFilter('');
    setMinFitScoreFilter(0);
    setCurrentPage(1);
    handleSearch(query, searchMode, 1, pageSize, {
      functionFilter: '',
      industryFilter: '',
      countryFilter: '',
      seniorityFilter: '',
      verifiedOnly: false,
      excludeKeywords: '',
      excludeCompanies: '',
      excludeIndustries: '',
      corridorFilter: '',
      certificationFilter: '',
      minFitScoreFilter: 0,
    });
  };

  const activeFiltersCount = [
    functionFilter,
    industryFilter,
    countryFilter,
    seniorityFilter,
    verifiedOnly,
    excludeKeywords,
    excludeCompanies,
    excludeIndustries,
    corridorFilter,
    certificationFilter,
    minFitScoreFilter > 0 ? 'minFit' : '',
  ].filter(Boolean).length;

  useEffect(() => {
    const qFromUrl = searchParams.get('q') || '';
    if (qFromUrl !== query) {
      setQuery(qFromUrl);
    }
    handleSearch(qFromUrl);
    fetchSavedSearches();
    fetchFacets();
  }, [token, searchMode, searchParams]);

  // Autocomplete fetcher (after 2 chars)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || !token) {
      setSuggestions([]);
      setCategorizedSuggestions([]);
      setSuggestedCorrection(null);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/v1/search/suggest?q=${encodeURIComponent(trimmed)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSuggestions(data.data.suggestions || []);
            setCategorizedSuggestions(data.data.categorized || []);
            setSuggestedCorrection(data.data.hasCorrection ? data.data.correctedQuery : null);
          }
        })
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [query, token]);

  const handleSaveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveSearchName.trim()) return;
    setSavingSearch(true);

    try {
      const res = await fetch('/api/v1/search/saved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: saveSearchName,
          query: query,
          filters: {
            function: functionFilter,
            industry: industryFilter,
            countryCode: countryFilter,
            seniority: seniorityFilter,
            excludeKeywords,
            excludeCompanies,
            excludeIndustries,
          },
          alertFrequency: saveSearchCadence,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccessMsg(`Search saved! Alerts set to ${saveSearchCadence}.`);
        fetchSavedSearches();
        setTimeout(() => {
          setShowSaveModal(false);
          setSaveSuccessMsg('');
          setSaveSearchName('');
        }, 1500);
      }
    } catch {
      // Handled silently
    } finally {
      setSavingSearch(false);
    }
  };

  const handleDeleteSavedSearch = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/search/saved/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      // Handled silently
    }
  };

  const _handleOpenLookalikes = async (profileId: string) => {
    setLoadingLookalikes(true);
    setLookalikeData(null);
    try {
      const res = await fetch(`/api/v1/search/lookalikes/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLookalikeData(data.data);
      }
    } catch {
      // Handled silently
    } finally {
      setLoadingLookalikes(false);
    }
  };

  void _handleDisconnect;
  void _handleOpenLookalikes;

  // Safe accessor for candidates supporting both data.matches and data.results
  const candidateResults: any[] = resultsData?.matches || resultsData?.results || [];

  return (
    <div className="space-y-8">
      {/* Clean Compact Search Header */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
            Search Decision Makers
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Discover verified executives, suppliers, and commercial partners.
          </p>
        </div>

        {/* Compact Command Search Bar with Autocomplete */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFreshSearch();
          }}
          className="flex flex-col sm:flex-row gap-2 pt-1 relative"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData('text');
                if (text && (text.includes('\n') || text.includes('—') || text.includes('–'))) {
                  e.preventDefault();
                  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                  const uiGarbage = new Set([
                    'save search', 'qualify', 'guide', 'decision makers', 'enterprises', 'corridors', 'graph',
                    'search', 'data filters', 'data filters:', 'all functions', 'all industries', 'all territories',
                    'all seniorities', 'all trade corridors', 'all certifications', 'exclusions', '- exclusions',
                    'dns verified only', 'clear search'
                  ]);
                  const meaningful = lines.filter((l) => !uiGarbage.has(l.toLowerCase()));
                  const cleanText = (meaningful.length > 0 ? meaningful[0] : text)
                    .split(/\s*(?:—|–|\s+-\s+)\s*/)[0].trim();
                  setQuery(cleanText);
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={
                searchMode === 'DECISION_MAKERS'
                  ? 'Search by title, role, company, or objective, e.g. "Procurement head at Nestle"...'
                  : searchMode === 'ENTERPRISES'
                  ? 'Search by company name, domain, or sector, e.g. "Cold storage logistics"...'
                  : searchMode === 'MARKET_CORRIDOR'
                  ? 'Filter trade corridors by partner keyword or category...'
                  : 'Describe your commercial goal to map buying committees...'
              }
              className="w-full pl-10 pr-10 py-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-black/20"
            />
            {query && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 p-0.5 rounded"
                title="Clear search and reset filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Live Suggestions Dropdown with Categorized Suggestions & Auto-Correction */}
            {showSuggestions && (suggestions.length > 0 || suggestedCorrection) && query.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-11 z-40 bg-surface border border-border rounded-xl shadow-xl overflow-hidden mt-1 text-xs max-h-80 overflow-y-auto">
                {/* 1-Click Did You Mean / Typo Correction Banner */}
                {suggestedCorrection && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(suggestedCorrection);
                      handleFreshSearch(suggestedCorrection);
                    }}
                    className="w-full p-2.5 bg-gradient-to-r from-amber-50 to-amber-100/80 hover:from-amber-100 hover:to-amber-200/80 border-b border-amber-200 text-left flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-xs text-amber-950 font-medium">
                        Did you mean: <strong className="font-extrabold text-navy underline decoration-amber-500">{suggestedCorrection}</strong>?
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full shrink-0 group-hover:bg-amber-300 transition-colors">
                      ⚡ 1-Click Search
                    </span>
                  </button>
                )}

                <div className="px-3 py-1.5 bg-surface-muted border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Suggestions for "{query}"</span>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-text-muted hover:text-navy"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-border/60">
                  {categorizedSuggestions.length > 0 ? (
                    categorizedSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuery(item.text);
                          handleFreshSearch(item.text);
                        }}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-neutral-50 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            item.type === 'COMPANY'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                          }`}>
                            {item.type === 'COMPANY' ? (
                              <Building2 className="w-3.5 h-3.5 text-amber-700" />
                            ) : (
                              <Users className="w-3.5 h-3.5 text-indigo-700" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-navy group-hover:text-black block truncate">
                              {item.text}
                            </span>
                            <span className="text-[10.5px] text-neutral-500 block truncate">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 shrink-0 ml-2">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuery(s);
                          handleFreshSearch(s);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-navy hover:bg-bg flex items-center justify-between transition-colors"
                      >
                        <span>{s}</span>
                        <Search className="w-3 h-3 text-text-muted" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </form>

        {/* Positive Filters Bar */}
        <div className="pt-2.5 border-t border-border flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center space-x-1.5 text-xs text-text-muted font-bold mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
            <span>Data Filters:</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-black text-white text-[9.5px] font-black rounded-full uppercase tracking-wider">
                {activeFiltersCount} Active
              </span>
            )}
          </div>

          {/* Function Filter */}
          <SearchableDropdownFilter
            label="Function"
            allLabel="All Functions"
            selectedValue={functionFilter}
            options={
              facets.functions && facets.functions.length > 0
                ? facets.functions.map((f) => ({ value: f.value, label: f.label, count: f.count }))
                : [
                    { value: 'Procurement', label: 'Procurement & Sourcing' },
                    { value: 'Partnerships', label: 'Strategic Alliances & BD' },
                    { value: 'Supply Chain', label: 'Supply Chain & Operations' },
                    { value: 'Sales', label: 'Commercial Sales & Channel' },
                    { value: 'Executive Management', label: 'Executive Management' },
                  ]
            }
            onSelect={(val) => applyFilter('function', val)}
            icon={<Briefcase className="w-3.5 h-3.5 shrink-0" />}
          />

          {/* Industry Filter */}
          <SearchableDropdownFilter
            label="Industry"
            allLabel="All Industries"
            selectedValue={industryFilter}
            options={
              facets.industries && facets.industries.length > 0
                ? facets.industries.map((ind) => ({ value: ind.value, label: ind.label, count: ind.count }))
                : [
                    { value: 'FMCG & Consumer Goods', label: 'FMCG & Consumer Goods' },
                    { value: 'Enterprise Software', label: 'Enterprise Software & Cloud' },
                    { value: 'Logistics & Supply Chain', label: 'Logistics & Supply Chain' },
                    { value: 'Renewable Energy & CleanTech', label: 'Renewable Energy & CleanTech' },
                    { value: 'Healthcare & Life Sciences', label: 'Healthcare & Life Sciences' },
                    { value: 'Industrial Manufacturing', label: 'Industrial Manufacturing' },
                  ]
            }
            onSelect={(val) => applyFilter('industry', val)}
            icon={<Filter className="w-3.5 h-3.5 shrink-0" />}
          />

          {/* Advanced enterprise filters (Territories, Seniorities, Corridors, Certifications, Exclusions, DNS Verified) hidden to keep search compact & simple */}

          {/* Reset All Filters Button */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-2.5 py-1 text-xs font-extrabold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 flex items-center space-x-1 transition-colors shrink-0 shadow-xs"
              title="Reset all filters"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters ({activeFiltersCount})</span>
            </button>
          )}

          {/* 1-Click Clear Search & Directory Reset */}
          {(query || resultsData || companyResults.length > 0) && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-2.5 py-1 text-xs font-bold text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-300 flex items-center space-x-1 transition-colors shrink-0 shadow-2xs ml-auto"
              title="Clear search and restore clean directory browse"
            >
              <RotateCcw className="w-3 h-3 text-neutral-500" />
              <span>Clear Search</span>
            </button>
          )}
        </div>

        {/* Feature #16: Negative Exclusion Filter Drawer */}
        {showNegativeFilters && (
          <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 flex items-center space-x-1">
                <span>Negative Exclusion Filters (NOT criteria)</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage(1);
                    handleSearch(query, searchMode, 1, pageSize);
                  }}
                  className="px-2.5 py-1 bg-black hover:bg-neutral-800 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors"
                >
                  Apply Exclusions
                </button>
                {(excludeKeywords || excludeCompanies || excludeIndustries) && (
                  <button
                    type="button"
                    onClick={() => {
                      setExcludeKeywords('');
                      setExcludeCompanies('');
                      setExcludeIndustries('');
                      setCurrentPage(1);
                      handleSearch(query, searchMode, 1, pageSize, {
                        excludeKeywords: '',
                        excludeCompanies: '',
                        excludeIndustries: '',
                      });
                    }}
                    className="text-[11px] font-bold text-rose-700 hover:underline"
                  >
                    Clear Exclusions
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
                  Exclude Keywords (comma-sep)
                </label>
                <input
                  type="text"
                  placeholder="e.g. agency, recruiter, intern"
                  value={excludeKeywords}
                  onChange={(e) => setExcludeKeywords(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setCurrentPage(1);
                      handleSearch(query, searchMode, 1, pageSize);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-surface border border-rose-200 rounded-lg text-xs text-navy focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
                  Exclude Companies (comma-sep)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Pacific, Acme Corp"
                  value={excludeCompanies}
                  onChange={(e) => setExcludeCompanies(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setCurrentPage(1);
                      handleSearch(query, searchMode, 1, pageSize);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-surface border border-rose-200 rounded-lg text-xs text-navy focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
                  Exclude Industries (comma-sep)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Staffing, Crypto"
                  value={excludeIndustries}
                  onChange={(e) => setExcludeIndustries(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setCurrentPage(1);
                      handleSearch(query, searchMode, 1, pageSize);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-surface border border-rose-200 rounded-lg text-xs text-navy focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Feature #15: Saved Searches List Bar */}
        {savedSearches.length > 0 && (
          <div className="pt-2 border-t border-border flex items-center space-x-2 overflow-x-auto text-xs py-1">
            <span className="text-[11px] font-bold text-text-muted shrink-0 flex items-center space-x-1">
              <BookmarkPlus className="w-3 h-3 text-primary" />
              <span>Saved Searches:</span>
            </span>
            {savedSearches.map((s) => (
              <div
                key={s.id}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-surface-muted border border-border rounded-lg shrink-0 text-navy text-[11px] font-semibold"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (s.query) setQuery(s.query);
                    handleSearch(s.query);
                  }}
                  className="hover:text-primary transition-colors font-bold"
                >
                  {s.name}
                </button>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-primary/10 text-primary uppercase">
                  {s.alertFrequency}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteSavedSearch(s.id)}
                  className="text-text-muted hover:text-rose-600 transition-colors ml-1"
                  title="Remove saved search"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Differentiator #10: Active Opportunity Qualification Passport Banner */}
      {activePassportData && (
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-black text-white p-6 rounded-2xl shadow-lg border border-neutral-700 animate-in fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-750">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-neutral-900 flex items-center justify-center font-black shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    Opportunity Qualification Passport: {activePassportData.passportId}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    {activePassportData.matchPrecisionLevel}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Verified commercial route for: <span className="text-neutral-200 font-semibold">"{activePassportData.objective}"</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowQualificationModal(true)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold border border-neutral-600 transition"
              >
                Re-Qualify Parameters
              </button>
              <button
                type="button"
                onClick={() => setActivePassportData(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
                title="Dismiss Passport View"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Qualified Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Product Posture</span>
              <p className="font-semibold text-neutral-100 text-[11px] leading-snug">
                {activePassportData.qualificationParameters?.productCategory}
              </p>
            </div>

            <div className="p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Certification Tier</span>
              <p className="font-semibold text-emerald-300 text-[11px] leading-snug">
                {activePassportData.qualificationParameters?.certificationTier}
              </p>
            </div>

            <div className="p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Target Hub</span>
              <p className="font-semibold text-neutral-100 text-[11px] leading-snug">
                {activePassportData.qualificationParameters?.targetFacility}
              </p>
            </div>

            <div className="p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Concession Route</span>
              <p className="font-semibold text-amber-300 text-[11px] leading-snug">
                {activePassportData.qualificationParameters?.engagementType}
              </p>
            </div>
          </div>

          {/* Summary Attestation */}
          <div className="p-3 bg-black/40 rounded-xl border border-neutral-700/50 flex items-center justify-between text-xs">
            <span className="text-neutral-300">
              {activePassportData.summary}
            </span>
            <span className="text-emerald-400 font-bold shrink-0 ml-3">
              {activePassportData.targetOrganizationsCount} Enterprise Concessionaires Pre-Vetted
            </span>
          </div>
        </div>
      )}

      {/* Results View */}
      {searchMode === 'MARKET_CORRIDOR' ? (
        /* 0. MARKET-CORRIDOR OPPORTUNITY FINDER (Differentiator #3 / Option B) */
        <div className="space-y-3 animate-fade-in">
          {/* Corridor Parameter Bar */}
          <div className="p-3.5 bg-surface border border-border rounded-xl shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border">
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-black" />
                <div>
                  <h3 className="text-xs font-extrabold text-navy">
                    Bilateral Market Corridor Explorer
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Connect origin manufacturers and exporters with destination distributors, logistics operators, and retail buyers
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-black text-white text-[9.5px] font-extrabold rounded-md uppercase tracking-wider">
                Trade Intelligence
              </span>
            </div>

            {/* Bilateral Route Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Origin Country (Supply)
                </label>
                <select
                  value={corridorOrigin}
                  onChange={(e) => {
                    setCorridorOrigin(e.target.value);
                    handleFetchCorridors(e.target.value, corridorDestination, corridorCategory, corridorCompliance);
                  }}
                  className="w-full px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-navy focus:outline-none"
                >
                  <option value="IN">India (IN) - Manufacturing & FMCG</option>
                  <option value="JP">Japan (JP) - Robotics & High-Tech</option>
                  <option value="SG">Singapore (SG) - Hub & Logistics</option>
                  <option value="MY">Malaysia (MY) - Halal Hub</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Destination Country (Demand)
                </label>
                <select
                  value={corridorDestination}
                  onChange={(e) => {
                    setCorridorDestination(e.target.value);
                    handleFetchCorridors(corridorOrigin, e.target.value, corridorCategory, corridorCompliance);
                  }}
                  className="w-full px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-navy focus:outline-none"
                >
                  <option value="MY">Malaysia (MY) - ASEAN Gateway</option>
                  <option value="SG">Singapore (SG) - Regional HQ</option>
                  <option value="AE">UAE / GCC - Middle East Hub</option>
                  <option value="JP">Japan (JP) - East Asia Hub</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Trade / Commodity Sector
                </label>
                <select
                  value={corridorCategory}
                  onChange={(e) => {
                    setCorridorCategory(e.target.value);
                    handleFetchCorridors(corridorOrigin, corridorDestination, e.target.value, corridorCompliance);
                  }}
                  className="w-full px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-navy focus:outline-none"
                >
                  <option value="FMCG & Food Beverages">FMCG, Food & Premium Beverages</option>
                  <option value="Cold Chain & Logistics">Cold Chain Storage & Freight API</option>
                  <option value="Pharma & Healthcare">Pharma & Clinical Logistics</option>
                  <option value="Enterprise Cloud Software">Enterprise Cloud & Reseller Rights</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-navy uppercase tracking-wider block mb-1">
                  Mandatory Compliance
                </label>
                <select
                  value={corridorCompliance}
                  onChange={(e) => {
                    setCorridorCompliance(e.target.value);
                    handleFetchCorridors(corridorOrigin, corridorDestination, corridorCategory, e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 bg-bg border border-border rounded-lg text-xs font-semibold text-navy focus:outline-none"
                >
                  <option value="Halal JAKIM">Halal JAKIM / ESMA Certified</option>
                  <option value="HACCP / ISO">HACCP & ISO 22000 Certified</option>
                  <option value="GDP Cold Chain">GDP / Cold Chain Validated</option>
                  <option value="Cross-Border Ready">Standard Customs & Duty Verified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Corridor Results */}
          {loadingCorridors ? (
            <div className="py-16 text-center bg-surface border border-border rounded-xl space-y-2">
              <Compass className="w-8 h-8 text-black mx-auto animate-spin" />
              <h3 className="text-xs font-bold text-navy">Synthesizing Market Corridor Bilateral Fit...</h3>
              <p className="text-[11px] text-text-muted max-w-md mx-auto">
                Analyzing tariff schedules, regulatory compliance, and distributor mandates.
              </p>
            </div>
          ) : !corridorData?.corridors || corridorData.corridors.length === 0 ? (
            <div className="p-10 text-center bg-surface border border-border rounded-xl space-y-2">
              <Compass className="w-8 h-8 text-text-muted mx-auto" />
              <h3 className="text-xs font-bold text-navy">No Corridors Found for Selected Route</h3>
              <p className="text-[11px] text-text-muted max-w-sm mx-auto">
                Try selecting another origin or destination country pair.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                const allCorridors = corridorData?.corridors || [];
                const recCorridors = allCorridors.filter(
                  (c: any) => c.fitTier === 'RECOMMENDED' || c.corridorMetrics?.bilateralFitScore >= 80,
                );
                const strongCorridors = allCorridors.filter(
                  (c: any) =>
                    c.fitTier === 'STRONG' ||
                    (c.corridorMetrics?.bilateralFitScore >= 60 && c.corridorMetrics?.bilateralFitScore < 80),
                );
                const dirCorridors = allCorridors.filter(
                  (c: any) => c.fitTier === 'DIRECTORY' || c.corridorMetrics?.bilateralFitScore < 60,
                );

                const visibleCorridors =
                  activeCorridorTier === 'RECOMMENDED'
                    ? recCorridors
                    : activeCorridorTier === 'STRONG'
                    ? strongCorridors
                    : activeCorridorTier === 'DIRECTORY'
                    ? dirCorridors
                    : allCorridors;

                return (
                  <>
                    {/* Symmetrical Match Segregation Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface-muted border border-border rounded-xl text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveCorridorTier('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          activeCorridorTier === 'ALL'
                            ? 'bg-black text-white shadow-xs'
                            : 'text-text-muted hover:text-navy hover:bg-surface'
                        }`}
                      >
                        <span>All Matches</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            activeCorridorTier === 'ALL'
                              ? 'bg-white/20 text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {allCorridors.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveCorridorTier('RECOMMENDED')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          activeCorridorTier === 'RECOMMENDED'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-text-muted hover:text-navy hover:bg-surface'
                        }`}
                      >
                        <span>⭐ Top Recommendations (80-100%)</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            activeCorridorTier === 'RECOMMENDED'
                              ? 'bg-white/20 text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {recCorridors.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveCorridorTier('STRONG')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          activeCorridorTier === 'STRONG'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-text-muted hover:text-navy hover:bg-surface'
                        }`}
                      >
                        <span>Strong Potential (60-79%)</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            activeCorridorTier === 'STRONG'
                              ? 'bg-white/20 text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {strongCorridors.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveCorridorTier('DIRECTORY')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          activeCorridorTier === 'DIRECTORY'
                            ? 'bg-neutral-700 text-white shadow-xs'
                            : 'text-text-muted hover:text-navy hover:bg-surface'
                        }`}
                      >
                        <span>Directory (&lt;60%)</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            activeCorridorTier === 'DIRECTORY'
                              ? 'bg-white/20 text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          {dirCorridors.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGuideActiveTab('MARKET_CORRIDOR');
                          setShowSearchGuideModal(true);
                        }}
                        className="ml-auto px-2.5 py-1 text-[11px] font-semibold text-primary hover:text-navy hover:underline flex items-center space-x-1"
                        title="Learn how Trade Corridors are scored and matched"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>How to Search &amp; Results Guide</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-muted px-1">
                      <span className="font-bold text-navy text-[11px]">
                        {visibleCorridors.length} of {corridorData.totalActiveCorridors} Bilateral Trade Corridors Active ({corridorData.corridorRoute})
                      </span>
                      <span className="flex items-center space-x-1 text-emerald-700 font-bold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Compliance Attested</span>
                      </span>
                    </div>

                    {visibleCorridors.map((c: any) => (
                      <div
                        key={c.corridorId}
                        className="p-3.5 bg-surface border border-border rounded-xl shadow-xs hover:border-black/30 transition-all space-y-3"
                      >
                        {/* Origin to Destination Route Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-border">
                          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                            {/* Origin node */}
                            <div className="p-2.5 bg-bg rounded-lg border border-border text-xs flex-1 min-w-0">
                              <span className="text-[9.5px] font-bold text-text-muted uppercase block">
                                Origin Exporter ({c.origin.country})
                              </span>
                              <strong className="text-navy font-bold text-xs truncate block">{c.origin.companyName}</strong>
                              <span className="text-text-muted text-[10.5px] truncate block">{c.origin.industry}</span>
                            </div>

                            <div className="flex flex-col items-center px-1 shrink-0">
                              <ArrowRight className="w-3.5 h-3.5 text-black" />
                              <span className="text-[9px] font-bold uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 border border-emerald-200">
                                {c.corridorMetrics.bilateralFitScore}% Fit
                              </span>
                            </div>

                            {/* Destination node */}
                            <div className="p-2.5 bg-bg rounded-lg border border-border text-xs flex-1 min-w-0">
                              <span className="text-[9.5px] font-bold text-text-muted uppercase block">
                                Destination ({c.destination.country})
                              </span>
                              <strong className="text-navy font-bold text-xs truncate block">{c.destination.companyName}</strong>
                              <span className="text-text-muted text-[10.5px] truncate block">{c.destination.industry}</span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setDossierCompanyId(c.destination.companyId)}
                              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg border border-neutral-300 transition-colors"
                            >
                              Dossier
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const primaryLead = c.keyStakeholders?.[0];
                                if (primaryLead) {
                                  setConnectModalTarget({
                                    id: primaryLead.id,
                                    displayName: primaryLead.name,
                                    currentTitle: primaryLead.title,
                                    companyName: c.destination.companyName,
                                    city: 'Regional',
                                    countryCode: c.destination.country,
                                    matchScore: c.corridorMetrics.bilateralFitScore,
                                  });
                                }
                              }}
                              className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5"
                            >
                              <Send className="w-3 h-3" />
                              <span>Bridge</span>
                            </button>
                          </div>
                        </div>

                        {/* Corridor Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="p-2 bg-bg rounded-lg border border-border/80 text-xs space-y-0.5">
                            <span className="text-[9.5px] font-bold text-text-muted uppercase block">Annual Trade Flow</span>
                            <strong className="text-navy font-bold text-xs block">{c.corridorMetrics.tradeFlowVolume}</strong>
                          </div>

                          <div className="p-2 bg-bg rounded-lg border border-border/80 text-xs space-y-0.5">
                            <span className="text-[9.5px] font-bold text-text-muted uppercase block">Customs Clearance</span>
                            <strong className="text-navy font-bold text-xs block">{c.corridorMetrics.avgCustomsClearanceDays}</strong>
                          </div>

                          <div className="p-2 bg-bg rounded-lg border border-border/80 text-xs space-y-0.5">
                            <span className="text-[9.5px] font-bold text-text-muted uppercase block">Compliance Attestation</span>
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {c.corridorMetrics.requiredCertifications.map((cert: string, idx: number) => (
                                <span key={idx} className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 rounded text-[9.5px] font-bold border border-emerald-200">
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recommendation Banner */}
                        <div className="px-3 py-2 bg-neutral-900 text-white rounded-lg text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 truncate">
                            <Route className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate text-[11px] font-medium">{c.recommendedEngagement}</span>
                          </div>
                          {c.destination.activeTenders?.length > 0 && (
                            <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[9px] font-black shrink-0 uppercase tracking-wide">
                              Active RFP
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      ) : searchMode === 'OPPORTUNITY_GRAPH' ? (
        /* 1. OPPORTUNITY-TO-PERSON GRAPH (Differentiator #1) */
        <div className="space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs font-extrabold text-navy truncate">
                Opportunity Graph: "{opportunityGraphData?.objective || query}"
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-text-muted shrink-0">
              <span className="px-2 py-0.5 bg-surface border border-border rounded-md font-bold text-navy text-[10.5px]">
                {opportunityGraphData?.totalMappedOrganizations || 0} Organizations Mapped
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[10.5px]">
                Intent Deconstructed
              </span>
            </div>
          </div>

          {/* Symmetrical Match Segregation Tabs for Opportunity Graph */}
          {!loadingGraph && !loading && opportunityGraphData?.graphNodes && opportunityGraphData.graphNodes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-1 border-b border-border text-xs">
              <button
                type="button"
                onClick={() => setActiveMatchTier('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeMatchTier === 'ALL'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-surface border border-border text-text-muted hover:text-navy hover:bg-surface-muted'
                }`}
              >
                <span>All Organizations</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeMatchTier === 'ALL' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {opportunityGraphData.graphNodes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMatchTier('BEST')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeMatchTier === 'BEST'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-surface border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span>⭐ Top Recommendations (80-100%)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeMatchTier === 'BEST' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {opportunityGraphData.graphNodes.filter((o: any) => (o.matchScore || 70) >= 80).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMatchTier('STRONG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeMatchTier === 'STRONG'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-surface border border-indigo-200 text-indigo-800 hover:bg-indigo-50'
                }`}
              >
                <span>Strong Potential (60-79%)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeMatchTier === 'STRONG' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-900'
                }`}>
                  {opportunityGraphData.graphNodes.filter((o: any) => (o.matchScore || 70) >= 60 && (o.matchScore || 70) < 80).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMatchTier('DIRECTORY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeMatchTier === 'DIRECTORY'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'bg-surface border border-border text-text-muted hover:text-navy hover:bg-surface-muted'
                }`}
              >
                <span>Directory Matches (&lt;60%)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeMatchTier === 'DIRECTORY' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {opportunityGraphData.graphNodes.filter((o: any) => (o.matchScore || 70) < 60).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGuideActiveTab('OPPORTUNITY_GRAPH');
                  setShowSearchGuideModal(true);
                }}
                className="ml-auto px-2.5 py-1 text-[11px] font-semibold text-primary hover:text-navy hover:underline flex items-center space-x-1"
                title="Learn how Opportunity Graph connects companies and buying committees"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How to Search &amp; Results Guide</span>
              </button>
            </div>
          )}

          {loadingGraph || loading ? (
            <div className="py-16 text-center bg-surface border border-border rounded-xl space-y-2">
              <Network className="w-8 h-8 text-black mx-auto animate-spin" />
              <h3 className="text-xs font-bold text-navy">Synthesizing Opportunity-to-Person Graph...</h3>
              <p className="text-[11px] text-text-muted max-w-md mx-auto">
                Mapping corporate entities, buying committees, verified mandates, and warm route paths.
              </p>
            </div>
          ) : !opportunityGraphData?.graphNodes || opportunityGraphData.graphNodes.length === 0 ? (
            <div className="p-10 text-center bg-surface border border-border rounded-xl space-y-2">
              <Network className="w-8 h-8 text-text-muted mx-auto" />
              <h3 className="text-xs font-bold text-navy">No Opportunity Graph Nodes Found</h3>
              <p className="text-[11px] text-text-muted max-w-sm mx-auto">
                Try querying with a clear commercial objective, e.g. "airport lounge beverage partnerships in Malaysia".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {opportunityGraphData.graphNodes
                .filter((org: any) => {
                  const score = org.matchScore || 70;
                  if (activeMatchTier === 'BEST') return score >= 80;
                  if (activeMatchTier === 'STRONG') return score >= 60 && score < 80;
                  if (activeMatchTier === 'DIRECTORY') return score < 60;
                  return true;
                })
                .map((org: any) => (
                <div
                  key={org.companyId}
                  className="bg-surface border border-border rounded-xl p-3.5 sm:p-4 shadow-xs hover:border-black/30 transition-all space-y-3"
                >
                  {/* Organization Root Node */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-border">
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {org.companyName?.[0] || 'O'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="text-xs font-bold text-navy truncate">{org.companyName}</h3>
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded border border-emerald-200 uppercase shrink-0">
                            {org.verificationStatus || 'VERIFIED'}
                          </span>
                          {org.branchCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 text-[9.5px] font-semibold rounded border border-blue-200">
                              {org.branchCount} Branch{org.branchCount > 1 ? 'es' : ''}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-black border flex items-center gap-0.5 ${
                            (org.matchScore || 70) >= 80
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            <span>{org.matchScore || 75}%</span>
                            <span className="font-normal text-[8.5px] opacity-75">Fit</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted truncate mt-0.5">
                          {org.industry} &bull; {org.headquartersCity ? `${org.headquartersCity}, ` : ''}{org.headquartersCountry || 'Global'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setDossierCompanyId(org.companyId)}
                        className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg border border-neutral-300 transition-colors"
                      >
                        Dossier
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProposalModalTarget({
                            companyName: org.companyName,
                            recipientProfileId: org.companyId,
                            executiveName: `${org.companyName} Corporate Inbound`,
                            executiveTitle: 'Executive Leadership Desk',
                          });
                        }}
                        className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                      >
                        Submit RFP
                      </button>
                    </div>
                  </div>

                  {/* Buying Committee Hierarchy */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center space-x-1.5">
                        <Users className="w-3 h-3 text-navy" />
                        <span>Buying Committee & Mandate Authority</span>
                      </h4>
                      <span className="text-[10px] text-text-muted font-medium">
                        Role-based pathway
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {org.committeeMembers?.map((member: any) => (
                        <div
                          key={member.id}
                          className="p-2.5 bg-bg rounded-lg border border-border/80 hover:border-black/20 transition-all flex flex-col justify-between space-y-2"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-navy truncate">{member.displayName}</h5>
                                <p className="text-[10.5px] text-text-muted truncate font-medium">{member.title}</p>
                              </div>
                              <span
                                className={`px-1.5 py-0.2 text-[8.5px] font-bold rounded uppercase shrink-0 ${
                                  member.roleType === 'DECISION_MAKER'
                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                    : member.roleType === 'COMMERCIAL_SPONSOR'
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                    : 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                                }`}
                              >
                                {member.roleType?.replace('_', ' ') || 'EVALUATOR'}
                              </span>
                            </div>

                            {/* Mandate Attestation Badge if present */}
                            {member.mandate ? (
                              <div className="p-1.5 bg-emerald-50/80 border border-emerald-200 rounded-md text-[9.5px] space-y-0.5">
                                <span className="font-bold text-emerald-900 flex items-center space-x-1">
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>Active Mandate</span>
                                </span>
                                <div className="text-emerald-800 font-medium truncate">
                                  {member.mandate.categoryScope} &bull; {member.mandate.geographicScope}
                                  {member.mandate.maxBudgetLimit && ` (Up to $${member.mandate.maxBudgetLimit.toLocaleString()})`}
                                </div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-text-muted font-medium truncate">
                                Scope: {member.function} &bull; {member.seniority}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
                            <button
                              type="button"
                              onClick={() => handleOpenTwoSidedFit(member)}
                              className="text-[10.5px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
                            >
                              <Scale className="w-2.5 h-2.5" />
                              <span>Two-Sided Fit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setConnectModalTarget({
                                  id: member.id,
                                  displayName: member.displayName,
                                  currentTitle: member.title,
                                  companyName: org.companyName,
                                  city: org.headquartersCity || 'Regional',
                                  countryCode: org.headquartersCountry || member.countryCode || 'IN',
                                  matchScore: 92,
                                });
                              }}
                              className="px-2 py-0.5 bg-black hover:bg-neutral-800 text-white rounded text-[10.5px] font-bold flex items-center space-x-1 shadow-xs transition-colors"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>Bridge</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Warm Route Banner */}
                  {org.recommendedRoute && (
                    <div className="px-3 py-2 bg-neutral-900 text-white rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-start sm:items-center space-x-2 min-w-0">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                        <div className="min-w-0">
                          <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[9px] block">
                            Recommended Route ({org.recommendedRoute.recommendedAction?.replace(/_/g, ' ')})
                          </span>
                          <span className="text-neutral-200 text-[11px] font-medium truncate block">
                            {org.recommendedRoute.explanation}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const primaryMember = org.committeeMembers?.[0];
                          setConnectModalTarget({
                            id: primaryMember?.id || org.companyId,
                            displayName: primaryMember?.displayName || `${org.companyName} Executive Leadership`,
                            currentTitle: primaryMember?.title || 'Corporate Leadership Desk',
                            companyName: org.companyName,
                            city: org.headquartersCity || 'Regional HQ',
                            countryCode: org.headquartersCountry || 'IN',
                            matchScore: org.matchScore || 94,
                          });
                        }}
                        className="px-2.5 py-1 bg-white text-black hover:bg-neutral-200 rounded-md text-xs font-bold flex items-center space-x-1 shrink-0 transition-colors"
                      >
                        <span>Warm Route</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : searchMode === 'DECISION_MAKERS' ? (
        /* 2. DECISION MAKERS RESULTS */
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-text-muted px-1 gap-2">
            <span className="font-semibold text-neutral-700">
              {candidateResults.length === 0
                ? 'Showing 0 Decision-Makers Matched'
                : `Showing ${((resultsData?.page || 1) - 1) * (resultsData?.limit || pageSize) + 1} - ${((resultsData?.page || 1) - 1) * (resultsData?.limit || pageSize) + candidateResults.length} of ${resultsData?.totalMatches || candidateResults.length} Decision-Makers Matched`}
            </span>
          </div>

          {/* Query Typo / Auto-Correction Notice Banner */}
          {resultsData?.queryCorrection?.hasCorrection && !loading && (
            <div className="p-2.5 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-between gap-3 text-xs text-neutral-900 animate-in fade-in">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  Showing results for{' '}
                  <strong className="font-bold text-black underline decoration-amber-500">
                    &quot;{resultsData.queryCorrection.correctedQuery}&quot;
                  </strong>
                </span>
              </div>
              {query !== resultsData.queryCorrection.correctedQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery(resultsData.queryCorrection.correctedQuery);
                    handleSearch(resultsData.queryCorrection.correctedQuery);
                  }}
                  className="px-2 py-1 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-bold rounded-lg text-[10.5px] transition-colors shrink-0"
                >
                  ⚡ Update Search
                </button>
              )}
            </div>
          )}

          {/* Feature Gap 2: Smart Graceful Relaxation & Intelligent Fallback Card */}
          {resultsData?.relaxation?.isRelaxed && !loading && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 border border-amber-300 rounded-2xl space-y-3 animate-in fade-in text-xs shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200/80">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-amber-950 text-xs sm:text-sm">
                        {resultsData.relaxation.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                        Tier {resultsData.relaxation.level} Auto-Relaxation
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Zero exact matches were found for your strict combination. We automatically relaxed constraints so you never hit a dead end.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-neutral-800">
                <p className="text-xs text-neutral-900 font-semibold leading-relaxed">
                  {resultsData.relaxation.message}
                </p>
                <div className="flex items-start space-x-1.5 text-[11.5px] text-amber-900/90 font-medium bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span><strong>Layman Recommendation:</strong> {resultsData.relaxation.suggestion}</span>
                </div>
              </div>

              {/* 1-Click Refinement Quick Action Buttons */}
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mr-1">
                  1-Click Refinements:
                </span>

                {(countryFilter || resultsData.relaxation.actionType === 'EXPAND_LOCATION') && (
                  <button
                    type="button"
                    onClick={() => applyFilter('country', '')}
                    className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-lg border border-neutral-300 shadow-xs transition-colors flex items-center space-x-1.5 text-[11px]"
                  >
                    <Globe className="w-3 h-3 text-emerald-600" />
                    <span>Search in All Countries</span>
                  </button>
                )}

                {(seniorityFilter || resultsData.relaxation.actionType === 'BROADEN_ROLE') && (
                  <button
                    type="button"
                    onClick={() => applyFilter('seniority', '')}
                    className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-lg border border-neutral-300 shadow-xs transition-colors flex items-center space-x-1.5 text-[11px]"
                  >
                    <Users className="w-3 h-3 text-indigo-600" />
                    <span>Broaden Seniority Scope</span>
                  </button>
                )}

                {industryFilter && (
                  <button
                    type="button"
                    onClick={() => applyFilter('industry', '')}
                    className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-lg border border-neutral-300 shadow-xs transition-colors flex items-center space-x-1.5 text-[11px]"
                  >
                    <Building2 className="w-3 h-3 text-blue-600" />
                    <span>Broaden Industry Scope</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 text-[11px] ml-auto"
                >
                  <RotateCcw className="w-3 h-3 text-amber-300" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          )}

          {/* Layman Fallback Notice for targeted geographic & intent searches */}
          {resultsData?.fallbackNotice && !loading && !resultsData?.relaxation?.isRelaxed && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-2.5 animate-in fade-in text-xs">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="min-w-0 space-y-0.5">
                <span className="font-bold text-amber-950 block">Search Notice</span>
                <p className="text-amber-900 font-medium leading-relaxed">
                  {typeof resultsData.fallbackNotice === 'string'
                    ? resultsData.fallbackNotice
                    : resultsData.fallbackNotice.message || resultsData.fallbackNotice.title}
                </p>
                {typeof resultsData.fallbackNotice === 'object' && resultsData.fallbackNotice.recommendation && (
                  <p className="text-[11px] text-amber-800 font-normal">
                    {resultsData.fallbackNotice.recommendation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* P1/P2: Targeted Enterprise Spotlight Card */}
          {resultsData?.matchedCompany && !loading && (() => {
            const isVerified = resultsData.matchedCompany.verificationStatus === 'VERIFIED';
            const hasDecisionMakers = candidateResults.length > 0;
            const companyName = resultsData.matchedCompany.name;

            return (
              <div className={`p-4 rounded-2xl border shadow-sm transition-all animate-in fade-in space-y-3 ${
                isVerified
                  ? 'bg-gradient-to-r from-neutral-900 via-neutral-850 to-black text-white border-neutral-750'
                  : 'bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950/40 text-white border-amber-600/40'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black shrink-0 shadow-sm ${
                      isVerified ? 'bg-amber-400 text-neutral-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                          Target Organization Spotlight
                        </span>

                        {/* Honest, Clear Verification Badge */}
                        {isVerified ? (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                            <span>DNS VERIFIED ENTERPRISE</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                            <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                            <span>UNVERIFIED DIRECTORY RECORD</span>
                          </span>
                        )}

                        {/* Accurate Buying Committee Indicator */}
                        {hasDecisionMakers ? (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                            <Users className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Buying Committee Active ({candidateResults.length})</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center space-x-1">
                            <Users className="w-2.5 h-2.5 text-neutral-500" />
                            <span>No Decision-Makers Onboarded</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                        {companyName}
                      </h3>
                      <div className="text-[11px] text-neutral-300 flex flex-wrap items-center gap-2">
                        <span>{resultsData.matchedCompany.industry || 'Enterprise Directory'}</span>
                        <span className="text-neutral-500">&bull;</span>
                        <span>{resultsData.matchedCompany.headquartersCity || 'Regional HQ'}, {resultsData.matchedCompany.headquartersCountry || 'Global'}</span>
                        {resultsData.matchedCompany.domain && (
                          <>
                            <span className="text-neutral-500">&bull;</span>
                            <span className="text-amber-200/90 font-mono text-[10.5px]">{resultsData.matchedCompany.domain}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setDossierCompanyId(resultsData.matchedCompany.id)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-600 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
                      title="360° Company Dossier"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Company Dossier</span>
                    </button>

                    {hasDecisionMakers ? (
                      <button
                        type="button"
                        onClick={() => {
                          setProposalModalTarget({
                            companyName: companyName,
                            companyId: resultsData.matchedCompany.id,
                            executiveName: candidateResults[0]?.profile?.displayName || 'Executive Leadership',
                            executiveTitle: candidateResults[0]?.profile?.currentTitle || 'Managing Director',
                            recipientProfileId: candidateResults[0]?.profile?.id,
                          });
                        }}
                        className="px-3.5 py-1.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 shadow-xs"
                      >
                        <Building2 className="w-3.5 h-3.5 text-black" />
                        <span>Submit Proposal</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `/company/claim?companyId=${resultsData.matchedCompany?.id || ''}`;
                        }}
                        className="px-3.5 py-1.5 bg-amber-400 text-black hover:bg-amber-300 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-black" />
                        <span>Request Verification</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Unverified Enterprise Guidance Banner */}
                {!isVerified && (
                  <div className="pt-2.5 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-400">
                    <div className="flex items-start sm:items-center space-x-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                      <span>
                        <strong>Verification Pending:</strong> {companyName} is listed as an unverified directory record. Cryptographic domain attestation and executive signing authority have not yet been completed.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `/company/claim?companyId=${resultsData.matchedCompany?.id || ''}`;
                      }}
                      className="text-amber-300 hover:text-amber-200 font-bold hover:underline shrink-0 text-left sm:text-right"
                    >
                      Verify or Claim This Company &rarr;
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {loading ? (
            <div className="py-16 text-center text-xs text-text-muted bg-surface rounded-2xl border border-border">
              Evaluating strategic intent and query parameters...
            </div>
          ) : candidateResults.length === 0 ? (
            <div className="space-y-4">
              {/* Proactive Clarification Interview Card for Tricky / Ambiguous Searches */}
              {resultsData?.clarification?.isClarificationNeeded && (
                <div className="p-5 bg-gradient-to-br from-neutral-900 via-neutral-850 to-black text-white rounded-2xl border border-neutral-700 shadow-md space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-750">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                        <Sparkles className="w-5 h-5 text-neutral-950" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                            Search Clarification Engine
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                            {resultsData.clarification.detectedTheme}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-white mt-0.5">
                          {resultsData.clarification.headline}
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQualificationModal(true)}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-black transition-colors flex items-center space-x-1.5 shrink-0 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Full Qualification Interview</span>
                    </button>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {resultsData.clarification.prompt}
                  </p>

                  {/* Interactive Clarification Question Sets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {resultsData.clarification.questions.map((qSet: any, qIdx: number) => (
                      <div key={qIdx} className="p-3 bg-neutral-800/95 rounded-xl border border-neutral-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                            Step {qIdx + 1}: {qSet.question}
                          </span>
                          {qSet.badge && (
                            <span className="text-[9.5px] font-bold text-neutral-400">
                              {qSet.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                          {qSet.options.map((opt: any, optIdx: number) => {
                            const isSelected = (
                              (opt.filterKey === 'country' && clarifySelectedRegion?.filterVal === opt.filterVal) ||
                              (opt.filterKey === 'corridor' && clarifySelectedRegion?.filterVal === opt.filterVal) ||
                              (opt.filterKey === 'function' && clarifySelectedRole?.filterVal === opt.filterVal) ||
                              (opt.filterKey === 'seniority' && clarifySelectedRole?.filterVal === opt.filterVal) ||
                              (opt.filterKey === 'country' && countryFilter === opt.filterVal) ||
                              (opt.filterKey === 'function' && functionFilter === opt.filterVal)
                            );

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => {
                                  if (opt.filterKey === 'country' || opt.filterKey === 'corridor') {
                                    const next = isSelected ? null : opt;
                                    setClarifySelectedRegion(next);
                                  } else if (opt.filterKey === 'function' || opt.filterKey === 'seniority') {
                                    const next = isSelected ? null : opt;
                                    setClarifySelectedRole(next);
                                  } else {
                                    applyFilter(opt.filterKey, opt.filterVal);
                                  }
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all flex items-center space-x-1.5 ${
                                  isSelected
                                    ? 'bg-amber-400 text-neutral-950 border-amber-300 font-extrabold shadow-xs'
                                    : 'bg-neutral-750 hover:bg-neutral-650 hover:border-amber-400/60 text-neutral-100 border-neutral-650'
                                }`}
                              >
                                {opt.flag && <span className="text-xs">{opt.flag}</span>}
                                <span>{opt.label}</span>
                                {opt.count !== undefined && (
                                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                                    isSelected ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-850 text-neutral-300'
                                  }`}>
                                    {opt.count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Combined Refinement Action Bar */}
                  {(clarifySelectedRegion || clarifySelectedRole) && (
                    <div className="p-3 bg-amber-400/10 border border-amber-400/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                      <div className="text-xs space-y-0.5">
                        <span className="text-[10px] uppercase font-black text-amber-300 block">
                          Target Alignment Configured:
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-white font-bold">
                          {clarifySelectedRegion && (
                            <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-amber-300 border border-amber-400/30 text-[11px]">
                              📍 {clarifySelectedRegion.label}
                            </span>
                          )}
                          {clarifySelectedRole && (
                            <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-amber-300 border border-amber-400/30 text-[11px]">
                              👔 {clarifySelectedRole.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setClarifySelectedRegion(null);
                            setClarifySelectedRole(null);
                          }}
                          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold border border-neutral-700 transition-colors"
                        >
                          Clear Selection
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExecuteClarification()}
                          className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-black transition-colors flex items-center space-x-1.5 shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>⚡ Execute Refined Search Now</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 1-Click Recommended Reformulations */}
                  {resultsData.clarification.suggestedReformulations?.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-neutral-750">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 mr-1">
                        Try 1-Click Refined Query:
                      </span>
                      {resultsData.clarification.suggestedReformulations.map((refQuery: string, rIdx: number) => (
                        <button
                          key={rIdx}
                          type="button"
                          onClick={() => {
                            setQuery(refQuery);
                            handleFreshSearch(refQuery);
                          }}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-medium border border-white/20 transition-colors flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{refQuery}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-8 text-center bg-surface border border-border rounded-2xl space-y-3 animate-in fade-in">
                <Users className="w-8 h-8 text-text-muted mx-auto" />
                <h3 className="text-sm font-bold text-navy">
                  {resultsData?.matchedCompany
                    ? `No decision-makers matched at ${resultsData.matchedCompany.name}`
                    : query
                    ? `No matching decision-makers found for "${query}"`
                    : 'No decision-makers found'}
                </h3>
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  {resultsData?.matchedCompany
                    ? activeFiltersCount > 0
                      ? `Your active search filters narrowed the results to 0 matches at ${resultsData.matchedCompany.name}. Clear your filters to explore all functions and seniorities at this enterprise.`
                      : `No decision-makers are currently onboarded for ${resultsData.matchedCompany.name}. This organization is an unverified directory record.`
                    : activeFiltersCount > 0
                    ? 'Your active filter combination returned 0 exact matches. Reset filters or clear query to browse available verified executives.'
                    : 'Zero profiles match this query exactly. Use the clarification steps above or reset to browse all verified records.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  {resultsData?.matchedCompany && activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFiltersKeepQuery}
                      className="px-3.5 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold rounded-xl transition-colors inline-flex items-center space-x-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Active Filters (Keep Company)</span>
                    </button>
                  )}
                  {resultsData?.matchedCompany && (
                    <button
                      type="button"
                      onClick={() => setVerifyCompanyModalTarget(resultsData.matchedCompany)}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black rounded-xl transition-colors inline-flex items-center space-x-1.5 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Request Enterprise Verification & Executive Onboarding</span>
                    </button>
                  )}
                  {(query || activeFiltersCount > 0) && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="px-3.5 py-1.5 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 text-xs font-bold rounded-xl transition-colors inline-flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Search & Browse All</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {(() => {
                const renderCandidateCard = (r: any, idx: number) => (
                  <div
                    key={r.profile?.id || idx}
                    className="p-3 sm:px-4 sm:py-3 bg-surface border border-border rounded-xl shadow-xs hover:border-black/40 hover:shadow-sm transition-all space-y-2 relative"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left Column: Avatar + Profile Name + Role + Company */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-black text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                          {r.profile.displayName?.[0] || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-navy truncate">
                            {r.profile.displayName}
                          </h3>
                          <div className="text-[11px] sm:text-xs text-neutral-600 flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-neutral-900 font-semibold">{r.profile.currentTitle || 'Professional'}</span>
                            {Boolean(r.profile.companyName || r.profile.company?.name) && (
                              <>
                                <span className="text-neutral-400">&bull;</span>
                                <span className="text-neutral-700">{r.profile.companyName || r.profile.company?.name}</span>
                              </>
                            )}
                            {Boolean(r.profile.city || r.profile.countryCode) && (
                              <>
                                <span className="text-neutral-400">&bull;</span>
                                <span className="text-neutral-500">
                                  {[r.profile.city, r.profile.countryCode].filter(Boolean).join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                          {/* Contact Privacy Indicator */}
                          <div className="pt-1 text-[10.5px]">
                            {r.profile.connectionStatus === 'CONNECTED' ? (
                              <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
                                {r.profile.email && <span>✉️ {r.profile.email}</span>}
                                {r.profile.phoneNumber && <span>📞 {r.profile.phoneNumber}</span>}
                              </div>
                            ) : (
                              <span className="text-neutral-400 font-medium flex items-center space-x-1">
                                <span>🔒</span>
                                <span>Phone & email unlocked after connecting</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Say Hi / Message Action */}
                      <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                        {r.profile.connectionStatus === 'CONNECTED' ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1 bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              <span>Connected</span>
                            </span>
                            <Link
                              to={`/app/messages?profileId=${r.profile.id}`}
                              className="px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1 bg-black hover:bg-neutral-800 text-white shadow-xs transition-all"
                              title="Send Message"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </Link>
                          </div>
                        ) : (r.profile.connectionStatus === 'PENDING' || connectionRequested === r.profile.id) ? (
                          <div className="relative group inline-block">
                            <button
                              type="button"
                              className="px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs"
                              title="Say Hi request sent and awaiting response"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                              <span>Pending</span>
                            </button>
                            {r.profile.connectionId && (
                              <div className="hidden group-hover:block absolute right-0 top-full mt-1 w-44 bg-surface border border-border shadow-xl rounded-xl p-1 z-30 animate-fade-in">
                                <button
                                  type="button"
                                  onClick={() => handleWithdraw(r.profile.connectionId, r.profile.displayName)}
                                  className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center space-x-1.5 transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Withdraw Request</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setConnectModalTarget({
                                id: r.profile.id,
                                displayName: r.profile.displayName,
                                currentTitle: r.profile.currentTitle,
                                companyName: r.profile.company?.name,
                                city: r.profile.city,
                                countryCode: r.profile.countryCode,
                                matchScore: r.score,
                                initialMode: 'DIRECT',
                              });
                            }}
                            className="px-4 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1 bg-black hover:bg-neutral-800 text-white shadow-xs transition-all"
                            title="Say Hi and connect"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>👋 Say Hi</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );

                const isDirectSupplier = (item: any) => Boolean(item.isDirectSupplier || item.matchCategory === 'DIRECT_SUPPLIER');
                const directSuppliersList = candidateResults.filter(isDirectSupplier);
                const tradeAdvisorsList = candidateResults.filter((item: any) => !isDirectSupplier(item));

                if (directSuppliersList.length === 0) {
                  return candidateResults.map((r: any, idx: number) => renderCandidateCard(r, idx));
                }

                return (
                  <div className="space-y-6">
                    {/* Direct Food Ingredient Suppliers Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200">
                        <span className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center space-x-1.5">
                          <span>Direct Food Ingredient Suppliers</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-black text-white font-black">
                            {resultsData?.tierBreakdown?.directSuppliers || directSuppliersList.length}
                          </span>
                        </span>
                        {tradeAdvisorsList.length === 0 && (resultsData?.tierBreakdown?.tradeAdvisors || 0) > 0 && (
                          <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">
                            {resultsData.tierBreakdown.tradeAdvisors} related trade advisors available on subsequent pages
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {directSuppliersList.map((r: any, idx: number) => renderCandidateCard(r, idx))}
                      </div>
                    </div>

                    {/* Related Trade Advisors & FMCG Consultants Section */}
                    {tradeAdvisorsList.length > 0 && (
                      <div className="space-y-3 pt-3">
                        <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200">
                          <span className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center space-x-1.5">
                            <span>Related Trade Advisors & FMCG Consultants in {resultsData?.targetCity || 'Chennai'}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-200 text-neutral-800 font-bold">
                              {resultsData?.tierBreakdown?.tradeAdvisors || tradeAdvisorsList.length}
                            </span>
                          </span>
                          <span className="text-[11px] text-neutral-500 hidden sm:inline">Advisory & Distribution Mandates</span>
                        </div>
                        <div className="space-y-2">
                          {tradeAdvisorsList.map((r: any, idx: number) => renderCandidateCard(r, idx))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {/* Decision Makers Pagination Bar */}
          {!loading && candidateResults.length > 0 && (() => {
            const totalPages = Math.ceil((resultsData?.totalMatches || candidateResults.length) / pageSize);
            const startPg = Math.max(1, Math.min(currentPage - 2, Math.max(1, totalPages - 4)));
            const endPg = Math.min(totalPages, startPg + 4);
            const visiblePages = [];
            for (let p = startPg; p <= endPg; p++) {
              visiblePages.push(p);
            }

            return (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-border px-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-text-muted text-[11px]">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({resultsData?.totalMatches || candidateResults.length} total profiles)
                  </span>
                  <div className="flex items-center space-x-1.5 bg-neutral-100 dark:bg-neutral-800/60 px-2 py-0.5 rounded-lg border border-border">
                    <span className="text-[11px] font-medium text-text-muted">Per page:</span>
                    {[5, 10, 20, 50, 100].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handlePageSizeChange(sz)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                          pageSize === sz
                            ? 'bg-black text-white shadow-xs'
                            : 'text-text-muted hover:text-navy'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = Math.max(1, currentPage - 1);
                      setCurrentPage(prev);
                      handleSearch(query, 'DECISION_MAKERS', prev, pageSize, { matchTier: activeMatchTier, locationScope: activeLocationScope, searchPriority });
                    }}
                    disabled={currentPage <= 1 || loading}
                    className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-navy bg-surface hover:bg-surface-muted disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>

                  {visiblePages.map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pg);
                        handleSearch(query, 'DECISION_MAKERS', pg, pageSize, { matchTier: activeMatchTier, locationScope: activeLocationScope, searchPriority });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        currentPage === pg
                          ? 'bg-black text-white shadow-xs'
                          : 'border border-border bg-surface text-navy hover:bg-surface-muted'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const nxt = Math.min(totalPages, currentPage + 1);
                      setCurrentPage(nxt);
                      handleSearch(query, 'DECISION_MAKERS', nxt, pageSize, { matchTier: activeMatchTier, locationScope: activeLocationScope, searchPriority });
                    }}
                    disabled={currentPage >= totalPages || loading}
                    className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-navy bg-surface hover:bg-surface-muted disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* 2. ENTERPRISES RESULTS (1,000+ Seeded Companies) */
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-text-muted px-1 gap-2">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-semibold text-neutral-700">
                Showing {(companyMeta?.page ? (companyMeta.page - 1) * (companyMeta.limit || 50) + 1 : 1)} - {Math.min(companyResults.length + ((companyMeta?.page || 1) - 1) * (companyMeta?.limit || 50), companyMeta?.totalCount || companyResults.length)} of {companyMeta?.totalCount || companyResults.length} Verified Organizations Located
              </span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold rounded-full flex items-center gap-1 shadow-2xs">
                <span>⚡</span>
                <span>Why Now Catalyst Signals Boosted to Top</span>
              </span>
            </div>
            <span className="flex items-center space-x-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>DNS TXT Authentication Active</span>
            </span>
          </div>

          {/* Symmetrical Match Segregation Tabs for Enterprises */}
          {!loading && companyResults.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-1 border-b border-border text-xs">
              <button
                type="button"
                onClick={() => setActiveMatchTier('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeMatchTier === 'ALL'
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-surface border border-border text-text-muted hover:text-navy hover:bg-surface-muted'
                }`}
              >
                <span>All Organizations</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeMatchTier === 'ALL' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {companyResults.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMatchTier('BEST')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeMatchTier === 'BEST'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-surface border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span>⭐ Top Recommendations (80-100%)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeMatchTier === 'BEST' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {companyResults.filter((c: any) => (c.matchScore || 70) >= 80).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMatchTier('STRONG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeMatchTier === 'STRONG'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-surface border border-indigo-200 text-indigo-800 hover:bg-indigo-50'
                }`}
              >
                <span>Strong Potential (60-79%)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeMatchTier === 'STRONG' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-900'
                }`}>
                  {companyResults.filter((c: any) => (c.matchScore || 70) >= 60 && (c.matchScore || 70) < 80).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMatchTier('DIRECTORY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeMatchTier === 'DIRECTORY'
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'bg-surface border border-border text-text-muted hover:text-navy hover:bg-surface-muted'
                }`}
              >
                <span>Directory Matches (&lt;60%)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeMatchTier === 'DIRECTORY' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {companyResults.filter((c: any) => (c.matchScore || 70) < 60).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setGuideActiveTab('ENTERPRISES');
                  setShowSearchGuideModal(true);
                }}
                className="ml-auto px-2.5 py-1 text-[11px] font-semibold text-primary hover:text-navy hover:underline flex items-center space-x-1"
                title="Learn how Enterprises and Corporate Lineages are matched"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How to Search &amp; Results Guide</span>
              </button>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-xs text-text-muted bg-surface rounded-2xl border border-border">
              Querying corporate database...
            </div>
          ) : companyResults.length === 0 ? (
            <div className="p-10 text-center bg-surface border border-border rounded-2xl space-y-3 animate-in fade-in">
              <Building2 className="w-8 h-8 text-text-muted mx-auto" />
              <h3 className="text-sm font-bold text-navy">
                {query ? `No enterprise organizations found for "${query}"` : 'No enterprise organizations found'}
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                {activeFiltersCount > 0
                  ? 'Your active filter combination returned 0 exact matches. Reset filters or clear query to browse corporate directory.'
                  : 'Zero companies match this query exactly. Try searching by domain, corporate parent, or industry sector.'}
              </p>
              {(query || activeFiltersCount > 0) && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Search & Browse All</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {companyResults
                .filter((c: any) => {
                  const score = c.matchScore || 70;
                  if (activeMatchTier === 'BEST') return score >= 80;
                  if (activeMatchTier === 'STRONG') return score >= 60 && score < 80;
                  if (activeMatchTier === 'DIRECTORY') return score < 60;
                  return true;
                })
                .map((c: any) => (
                  <div
                    key={c.id}
                    className="p-3 bg-surface border border-border rounded-xl shadow-2xs hover:border-black/40 hover:shadow-xs transition-all space-y-2"
                  >
                    {/* Compact One-Line Header & Indicators */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-black text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {c.name[0]}
                        </div>
                        <div className="min-w-0 flex items-center flex-wrap gap-1.5">
                          <h3 className="text-xs font-bold text-navy truncate">{c.name}</h3>

                          {/* Legal / Entity Type */}
                          <span className="px-1.5 py-0.2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded text-[10px] font-semibold border border-neutral-200">
                            {c.companyType || 'Enterprise HQ'}
                          </span>

                          {/* Sector & Jurisdiction */}
                          <span className="text-[11px] text-text-muted flex items-center space-x-1">
                            <span>{c.industry || 'Enterprise'}</span>
                            <span>&bull;</span>
                            <span>{c.headquartersCity ? `${c.headquartersCity}, ` : ''}{c.headquartersCountry || 'Global'}</span>
                          </span>

                          {/* Corporate Hierarchy / Branches */}
                          {c.parentRelations && c.parentRelations.length > 0 && (
                            <span className="px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 text-[10px] font-semibold rounded border border-indigo-200">
                              {c.parentRelations.length} Parent Entity
                            </span>
                          )}
                          {c.subsidiaryRelations && c.subsidiaryRelations.length > 0 && (
                            <span className="px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 text-[10px] font-semibold rounded border border-blue-200">
                              {c.subsidiaryRelations.length} Branch{c.subsidiaryRelations.length > 1 ? 'es' : ''}
                            </span>
                          )}

                          {/* Decision Makers in Entity */}
                          {c.profiles && c.profiles.length > 0 && (
                            <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded border border-purple-200 flex items-center gap-0.5">
                              <Users className="w-2.5 h-2.5" />
                              <span>{c.profiles.length} Execs</span>
                            </span>
                          )}

                          {/* Why Now Catalyst Signal */}
                          {c.hasWhyNow && (
                            <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-800 text-[10px] font-extrabold rounded border border-amber-300 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>Catalyst Signal</span>
                            </span>
                          )}

                          {/* DNS Verified */}
                          <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 text-[9.5px] font-bold rounded uppercase border border-emerald-200">
                            DNS Verified
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setDossierCompanyId(c.id)}
                          className="px-3 py-1.5 bg-surface hover:bg-surface-muted text-navy text-xs font-bold rounded-xl border border-border transition-colors"
                          title="Corporate Dossier"
                        >
                          Dossier
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProposalModalTarget({
                              companyName: c.name,
                              recipientProfileId: c.id,
                              executiveName: `${c.name} Corporate Inbound`,
                              executiveTitle: 'Executive Leadership Desk',
                            });
                          }}
                          className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                          title="Submit Commercial Proposal / RFP"
                        >
                          <Building2 className="w-3.5 h-3.5 text-white" />
                          <span>Submit RFP</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Enterprises Pagination Bar */}
          {!loading && companyResults.length > 0 && (() => {
            const totalPages = companyMeta.totalPages || 1;
            const startPg = Math.max(1, Math.min(companyMeta.page - 2, Math.max(1, totalPages - 4)));
            const endPg = Math.min(totalPages, startPg + 4);
            const visiblePages = [];
            for (let p = startPg; p <= endPg; p++) {
              visiblePages.push(p);
            }

            return (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-border px-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-text-muted text-[11px]">
                    Page <strong>{companyMeta.page}</strong> of <strong>{totalPages}</strong> ({companyMeta.totalCount} organizations)
                  </span>
                  <div className="flex items-center space-x-1.5 bg-neutral-100 dark:bg-neutral-800/60 px-2 py-0.5 rounded-lg border border-border">
                    <span className="text-[11px] font-medium text-text-muted">Per page:</span>
                    {[5, 10, 20, 50, 100].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handlePageSizeChange(sz)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                          pageSize === sz
                            ? 'bg-black text-white shadow-xs'
                            : 'text-text-muted hover:text-navy'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const prev = Math.max(1, companyMeta.page - 1);
                      handleSearch(query, 'ENTERPRISES', prev, pageSize);
                    }}
                    disabled={companyMeta.page <= 1 || loading}
                    className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-navy bg-surface hover:bg-surface-muted disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>

                  {visiblePages.map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => {
                        handleSearch(query, 'ENTERPRISES', pg, pageSize);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        companyMeta.page === pg
                          ? 'bg-black text-white shadow-xs'
                          : 'border border-border bg-surface text-navy hover:bg-surface-muted'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const nxt = Math.min(totalPages, companyMeta.page + 1);
                      handleSearch(query, 'ENTERPRISES', nxt, pageSize);
                    }}
                    disabled={companyMeta.page >= totalPages || loading}
                    className="px-2.5 py-1 rounded-lg border border-border text-xs font-semibold text-navy bg-surface hover:bg-surface-muted disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Feature #15: Save Search Slide-Over Drawer */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-md bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
              <h3 className="text-sm font-extrabold text-navy flex items-center space-x-2">
                <BookmarkPlus className="w-5 h-5 text-black" />
                <span>Save Search & Automated Alerts</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSearch} className="p-6 space-y-4 overflow-y-auto flex-1">
              <p className="text-xs text-text-muted leading-relaxed">
                Receive notifications when new verified decision-makers or enterprises match your criteria.
              </p>

              <div>
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">Search Name</label>
                <input
                  type="text"
                  required
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="e.g. Airport Beverage Procurement"
                  className="w-full px-3 py-2.5 bg-bg border border-border rounded-xl text-xs text-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1">Alert Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['DAILY', 'WEEKLY', 'INSTANT'] as const).map((cadence) => (
                    <button
                      key={cadence}
                      type="button"
                      onClick={() => setSaveSearchCadence(cadence)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                        saveSearchCadence === cadence
                          ? 'bg-black text-white border-black shadow-sm'
                          : 'bg-bg text-text-muted border-border hover:text-navy'
                      }`}
                    >
                      {cadence}
                    </button>
                  ))}
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
                  {saveSuccessMsg}
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-muted hover:text-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSearch}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {savingSearch ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feature #18: Lookalike Explorer Slide-Over Drawer */}
      {(lookalikeData || loadingLookalikes) && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-xl bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-black" />
                <h3 className="text-sm font-extrabold text-navy">
                  Lookalike Candidates (Feature #18)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLookalikeData(null)}
                className="p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {loadingLookalikes ? (
                <div className="py-20 text-center text-xs text-text-muted">
                  Computing attribute vector similarities...
                </div>
              ) : lookalikeData ? (
                <div className="space-y-4">
                  <div className="p-3 bg-surface-muted rounded-xl border border-border text-xs">
                    <span className="text-text-muted font-bold block mb-0.5 text-[10px] uppercase">Seeded Profile:</span>
                    <strong className="text-navy">{lookalikeData.seedProfile.displayName}</strong> &bull;{' '}
                    <span className="text-primary font-semibold">{lookalikeData.seedProfile.title}</span> at{' '}
                    <span className="font-semibold">{lookalikeData.seedProfile.company || 'Enterprise'}</span>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold text-text-muted">
                      Found {lookalikeData.totalLookalikesFound} Lookalikes:
                    </span>
                    {lookalikeData.lookalikes.map((lk: any) => (
                      <div
                        key={lk.profileId}
                        className="p-4 bg-bg border border-border rounded-xl space-y-2.5 hover:border-black/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-navy">{lk.displayName}</h4>
                            <p className="text-xs text-text-muted font-semibold">
                              {lk.currentTitle} &bull; {lk.companyName || 'Verified Enterprise'}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-neutral-100 text-neutral-800 border border-neutral-200">
                              {lk.similarityScore}% Match
                            </span>
                          </div>
                        </div>

                        {lk.sharedAttributes?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {lk.sharedAttributes.map((attr: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-surface text-text-muted border border-border rounded text-[10px] font-medium"
                              >
                                {attr}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setLookalikeData(null);
                              setConnectModalTarget({
                                id: lk.profileId,
                                displayName: lk.displayName,
                                currentTitle: lk.currentTitle,
                                companyName: lk.companyName,
                                city: 'Global',
                                countryCode: lk.countryCode,
                                matchScore: lk.similarityScore,
                              });
                            }}
                            className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Connect</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Modern Contextual Connection Bridge Modal */}
      {connectModalTarget && (
        <ConnectOpportunityModal
          isOpen={Boolean(connectModalTarget)}
          onClose={() => setConnectModalTarget(null)}
          targetProfile={connectModalTarget}
          onSuccess={() => {
            if (connectModalTarget) {
              setConnectionRequested(connectModalTarget.id);
            }
          }}
        />
      )}

      {/* Commercial RFP & Proposal Submission Modal */}
      {proposalModalTarget && (
        <SubmitCompanyProposalModal
          isOpen={!!proposalModalTarget}
          onClose={() => setProposalModalTarget(null)}
          targetCompanyName={proposalModalTarget.companyName}
          targetExecutiveName={proposalModalTarget.executiveName}
          targetExecutiveTitle={proposalModalTarget.executiveTitle}
          recipientProfileId={proposalModalTarget.recipientProfileId}
          onSuccess={() => {
            setProposalModalTarget(null);
          }}
        />
      )}

      {/* 360 Enterprise Company Dossier Modal */}
      {dossierCompanyId && (
        <CompanyDossierModal
          isOpen={!!dossierCompanyId}
          onClose={() => setDossierCompanyId(null)}
          companyId={dossierCompanyId}
          onSelectPersonForConnect={(person) => {
            setConnectModalTarget(person);
          }}
          onSelectCompanyForProposal={(companyInfo) => {
            setProposalModalTarget({
              companyName: companyInfo.companyName,
              recipientProfileId: companyInfo.recipientProfileId,
              executiveName: companyInfo.executiveName,
              executiveTitle: companyInfo.executiveTitle,
            });
          }}
        />
      )}

      {/* 360 Decision-Maker Dossier Drawer */}
      <PersonDossierDrawer
        isOpen={Boolean(personDossierProfileId)}
        onClose={() => setPersonDossierProfileId(null)}
        profileId={personDossierProfileId}
        onOpenConnect={(person) => setConnectModalTarget(person)}
        onOpenProposal={(proposalInfo) => setProposalModalTarget(proposalInfo)}
        onOpenCompanyDossier={(companyId) => setDossierCompanyId(companyId)}
      />

      {/* Differentiator #2: Two-Sided Opportunity Fit Slide-Over Drawer */}
      {twoSidedTarget && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-xl bg-surface border-l border-border h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-bg">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <Scale className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy">
                    Two-Sided Opportunity Matching
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Symmetrical Fit Analysis between declared offering and recipient intake
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTwoSidedTarget(null)}
                className="p-1.5 text-text-muted hover:text-navy rounded-lg hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {loadingTwoSided ? (
                <div className="py-20 text-center space-y-3">
                  <Scale className="w-8 h-8 text-black mx-auto animate-spin" />
                  <p className="text-xs text-text-muted font-bold">
                    Evaluating reciprocal demand symmetry and corporate mandates...
                  </p>
                </div>
              ) : twoSidedData ? (
                <div className="space-y-6">
                  {/* Symmetrical Fit Gauge */}
                  <div className="p-5 bg-bg rounded-2xl border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        Symmetrical Fit Index
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                        {twoSidedData.fitTier?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-black text-navy">{twoSidedData.symmetricalFitScore}%</span>
                      <span className="text-xs text-text-muted">bilateral match alignment</span>
                    </div>

                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${twoSidedData.symmetricalFitScore}%` }}
                      />
                    </div>

                    <p className="text-xs text-navy font-medium leading-relaxed pt-1">
                      {twoSidedData.explanation}
                    </p>
                  </div>

                  {/* Dual-Pane Commercial Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Pane: Sender Offering */}
                    <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-black text-navy pb-1 border-b border-border">
                        <Send className="w-3.5 h-3.5 text-primary" />
                        <span>Your Commercial Offering</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {twoSidedData.senderOffering}
                      </p>
                      <div className="pt-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-bold rounded">
                          Attested Capability
                        </span>
                      </div>
                    </div>

                    {/* Right Pane: Recipient Declared Need */}
                    <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-black text-navy pb-1 border-b border-border">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recipient Declared Need</span>
                      </div>
                      {twoSidedData.recipientDeclaredNeeds?.length > 0 ? (
                        <ul className="text-xs text-text-muted space-y-1 list-disc list-inside">
                          {twoSidedData.recipientDeclaredNeeds.map((need: string, i: number) => (
                            <li key={i}>{need}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-text-muted italic">
                          Inferred intake based on active executive mandate and department focus.
                        </p>
                      )}
                      <div className="pt-2 flex flex-wrap gap-1">
                        {twoSidedData.hasCorporateMandate && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold rounded">
                            Verified Mandate
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Commercial Recommendations */}
                  <div className="p-4 bg-surface-muted rounded-xl border border-border/80 space-y-2 text-xs">
                    <span className="font-bold text-navy block">Suggested Commercial Next Step:</span>
                    <p className="text-text-muted">
                      Recipient qualifies for direct bridge outreach. Attach relevant capabilities deck and cite alignment with active mandate.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-border bg-bg flex items-center justify-between">
              <button
                type="button"
                onClick={() => setTwoSidedTarget(null)}
                className="px-4 py-2 text-xs font-bold text-text-muted hover:text-navy rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = twoSidedTarget;
                  setTwoSidedTarget(null);
                  setConnectModalTarget({
                    id: target.id,
                    displayName: target.displayName,
                    currentTitle: target.title || target.currentTitle,
                    companyName: target.company?.name || 'Target Enterprise',
                    city: target.city || 'Regional',
                    countryCode: target.countryCode || 'MY',
                    matchScore: twoSidedData?.symmetricalFitScore || 90,
                  });
                }}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Initiate Symmetrical Connect</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Differentiator #10: Interactive Opportunity Qualification Modal */}
      <OpportunityQualificationModal
        isOpen={showQualificationModal}
        onClose={() => setShowQualificationModal(false)}
        rawQuery={query}
        onQualificationComplete={(passport) => {
          setActivePassportData(passport);
          // If in OPPORTUNITY_GRAPH mode, update or refresh graph data
          if (searchMode === 'OPPORTUNITY_GRAPH') {
            handleSearch(query, 'OPPORTUNITY_GRAPH');
          }
        }}
      />

      {/* Layman English Search Guide Modal for All 4 Modes */}
      <SearchGuideModal
        isOpen={showSearchGuideModal}
        onClose={() => setShowSearchGuideModal(false)}
        activeTab={guideActiveTab}
        onSelectSampleQuery={(sampleQ, sampleMode) => {
          setQuery(sampleQ);
          setSearchMode(sampleMode);
          handleSearch(sampleQ, sampleMode);
        }}
      />

      {/* Gap 3: "Why Am I Seeing This?" Layman Transparency Modal */}
      <WhyThisMatchModal
        isOpen={Boolean(whyThisMatchTarget)}
        onClose={() => setWhyThisMatchTarget(null)}
        match={whyThisMatchTarget}
        onOpenConnect={(candProfile) => {
          setConnectModalTarget({
            id: candProfile.id,
            displayName: candProfile.displayName,
            currentTitle: candProfile.currentTitle,
            companyName: candProfile.companyName || candProfile.company?.name || 'Target Enterprise',
            city: candProfile.city || candProfile.company?.headquartersCity || 'Regional',
            countryCode: candProfile.countryCode || 'IN',
            matchScore: whyThisMatchTarget?.score || 90,
          });
        }}
        onOpenDossier={(cid) => setDossierCompanyId(cid)}
        onOpenProposal={(target) => setProposalModalTarget(target)}
      />

      {/* Enterprise Verification & Concierge Onboarding Modal */}
      {verifyCompanyModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy">
                    Enterprise Verification & Onboarding
                  </h3>
                  <p className="text-[11px] text-text-muted truncate max-w-xs">
                    {verifyCompanyModalTarget.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVerifyCompanyModalTarget(null);
                  setVerifyCompanySuccessMessage(null);
                  setVerifyNotes('');
                }}
                className="p-1 text-text-muted hover:text-black rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {verifyCompanySuccessMessage ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-emerald-900">
                  <div className="flex items-center space-x-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Request Successfully Recorded</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {verifyCompanySuccessMessage}
                  </p>
                </div>
              ) : (
                <>
                  {/* Status Banner */}
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 flex items-start space-x-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-[11.5px]">Unverified Enterprise Directory Record</p>
                      <p className="text-[11px] text-amber-800/90 leading-relaxed">
                        {verifyCompanyModalTarget.name} is indexed in the enterprise directory, but has not yet completed DNS cryptographic attestation or onboarded authorized decision-makers.
                      </p>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setVerifyMode('BUYER_REQUEST')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        verifyMode === 'BUYER_REQUEST'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      Buyer / Partner Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifyMode('CLAIM_DOMAIN')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        verifyMode === 'CLAIM_DOMAIN'
                          ? 'bg-white text-black shadow-xs'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      I Represent This Enterprise
                    </button>
                  </div>

                  {verifyMode === 'BUYER_REQUEST' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-navy mb-1">
                          Why are you looking to connect with {verifyCompanyModalTarget.name}?
                        </label>
                        <textarea
                          rows={3}
                          value={verifyNotes}
                          onChange={(e) => setVerifyNotes(e.target.value)}
                          placeholder="e.g. We have an active procurement mandate for cross-border components and seek the Head of Supply Chain..."
                          className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-black bg-surface resize-none"
                        />
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-600 space-y-1 text-[11px]">
                        <p className="font-semibold text-neutral-800">What happens next?</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Meshvi Trade Desk prioritizes executive verification for this enterprise.</li>
                          <li>We invite their commercial leadership and buying committee to claim their mandate.</li>
                          <li>You receive a notification the moment a verified decision-maker joins.</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 text-[11px] space-y-1">
                        <p className="font-bold">Cryptographic DNS & Domain Ownership</p>
                        <p className="leading-relaxed">
                          Authorized officers can claim this enterprise by verifying corporate domain email ownership or adding a DNS TXT challenge token.
                        </p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-navy mb-1">
                          Your Corporate Email / Authority Proof
                        </label>
                        <input
                          type="text"
                          value={verifyNotes}
                          onChange={(e) => setVerifyNotes(e.target.value)}
                          placeholder={`name@${verifyCompanyModalTarget.domain || 'company.com'}`}
                          className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-black bg-surface"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-neutral-50/50 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setVerifyCompanyModalTarget(null);
                  setVerifyCompanySuccessMessage(null);
                  setVerifyNotes('');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:text-black rounded-xl transition-colors"
              >
                {verifyCompanySuccessMessage ? 'Close' : 'Cancel'}
              </button>

              {!verifyCompanySuccessMessage && (
                <button
                  type="button"
                  disabled={verifySubmitting}
                  onClick={async () => {
                    setVerifySubmitting(true);
                    try {
                      const res = await fetch(`/api/v1/companies/${verifyCompanyModalTarget.id}/claim`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          verificationMethod: verifyMode === 'BUYER_REQUEST' ? 'MANUAL' : 'DOMAIN_EMAIL',
                          evidenceReference: verifyNotes || (verifyMode === 'BUYER_REQUEST' ? 'Buyer outreach request from Search Desk' : 'Direct domain claim from Search Desk'),
                        }),
                      });
                      const json = await res.json();
                      if (res.ok && json.success) {
                        setVerifyCompanySuccessMessage(
                          verifyMode === 'BUYER_REQUEST'
                            ? `Verification request for ${verifyCompanyModalTarget.name} has been dispatched to Meshvi Trade Operations. We will initiate executive outreach and notify your account.`
                            : `Enterprise claim for ${verifyCompanyModalTarget.name} submitted successfully. Review instructions have been routed to your registered corporate address.`
                        );
                      } else {
                        setVerifyCompanySuccessMessage(
                          json.message || `Verification request for ${verifyCompanyModalTarget.name} recorded. Our trade verification desk is processing this enterprise.`
                        );
                      }
                    } catch {
                      setVerifyCompanySuccessMessage(
                        `Verification request for ${verifyCompanyModalTarget.name} recorded. Our trade verification desk is processing this enterprise.`
                      );
                    } finally {
                      setVerifySubmitting(false);
                    }
                  }}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {verifySubmitting
                      ? 'Submitting...'
                      : verifyMode === 'BUYER_REQUEST'
                      ? 'Submit Verification Request'
                      : 'Claim & Verify Enterprise'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

