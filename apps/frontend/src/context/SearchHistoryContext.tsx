import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface RecentSearchResult {
  id: string;
  name: string;
  headline?: string;
  company?: string;
  location?: string;
  score?: number;
}

export interface RecentSearch {
  id: string; // Session / thread ID
  query: string; // Latest active search query
  initialQuery?: string; // First query of this search chat / thread
  queries: string[]; // All queries conducted in this session
  at: number;
  count: number;
  results: RecentSearchResult[];
}

export interface SearchHistoryValue {
  recent: RecentSearch[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  startNewSearchSession: () => string;
  addSearch: (
    query: string,
    results: RecentSearchResult[],
    totalCount?: number,
    targetSessionId?: string | null
  ) => string;
  removeSearch: (id: string) => void;
  clearSearches: () => void;
  getSession: (id: string) => RecentSearch | undefined;
}

const STORAGE_KEY = 'setu_recent_searches_v1';
const SESSION_KEY = 'setu_active_search_session_id';
const MAX_ENTRIES = 12;
const MAX_RESULTS = 6;

const SearchHistoryContext = createContext<SearchHistoryValue | undefined>(undefined);

const clip = (value: unknown, max = 120): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
};

const readHistory = (): RecentSearch[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.query === 'string' && item.query.trim())
      .map((item) => {
        const initialQuery = String(item.initialQuery || item.query).trim();
        const existingQueries: string[] = Array.isArray(item.queries) && item.queries.length > 0
          ? item.queries.map((q: any) => String(q).trim()).filter(Boolean)
          : [String(item.query).trim()];

        return {
          id: String(item.id || `${item.at || Date.now()}`),
          query: String(item.query).trim(),
          initialQuery,
          queries: existingQueries,
          at: Number(item.at) || Date.now(),
          count: Number(item.count) || 0,
          results: Array.isArray(item.results) ? item.results : [],
        };
      })
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
};

export const SearchHistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [recent, setRecent] = useState<RecentSearch[]>(readHistory);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  });

  const setActiveSessionId = useCallback((id: string | null) => {
    setActiveSessionIdState(id);
    try {
      if (id) {
        sessionStorage.setItem(SESSION_KEY, id);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Ignore sessionStorage issues
    }
  }, []);

  const startNewSearchSession = useCallback(() => {
    const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setActiveSessionId(newId);
    return newId;
  }, [setActiveSessionId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch {
      // Storage can be unavailable in private mode — history stays in memory.
    }
  }, [recent]);

  const addSearch = useCallback(
    (
      query: string,
      results: RecentSearchResult[],
      totalCount?: number,
      targetSessionId?: string | null
    ): string => {
      const cleanQuery = query.trim();
      if (!cleanQuery) return activeSessionId || '';

      const cleaned = (Array.isArray(results) ? results : [])
        .slice(0, MAX_RESULTS)
        .map((r, index) => ({
          id: String(r.id || index),
          name: clip(r.name, 80) || 'Untitled match',
          headline: clip(r.headline),
          company: clip(r.company, 80),
          location: clip(r.location, 80),
          score: typeof r.score === 'number' && Number.isFinite(r.score) ? r.score : undefined,
        }));

      const finalCount =
        typeof totalCount === 'number' && totalCount > 0 ? totalCount : cleaned.length;

      // Determine the session ID: reuse existing active/target session so multiple searches stay in the SAME chat!
      const effectiveSessionId =
        targetSessionId ||
        activeSessionId ||
        `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      setActiveSessionId(effectiveSessionId);

      setRecent((prev) => {
        const existingIdx = prev.findIndex((item) => item.id === effectiveSessionId);

        if (existingIdx >= 0) {
          // Update the EXISTING search session/chat thread instead of creating a new one!
          const existing = prev[existingIdx];
          const queryList = existing.queries || [existing.query];
          const updatedQueries = queryList.includes(cleanQuery)
            ? queryList
            : [...queryList, cleanQuery];

          const updatedEntry: RecentSearch = {
            ...existing,
            query: cleanQuery,
            queries: updatedQueries,
            at: Date.now(),
            count: finalCount,
            results: cleaned,
          };

          const remaining = prev.filter((_, idx) => idx !== existingIdx);
          return [updatedEntry, ...remaining].slice(0, MAX_ENTRIES);
        }

        // New search chat thread
        const newEntry: RecentSearch = {
          id: effectiveSessionId,
          query: cleanQuery,
          initialQuery: cleanQuery,
          queries: [cleanQuery],
          at: Date.now(),
          count: finalCount,
          results: cleaned,
        };

        return [
          newEntry,
          ...prev.filter((item) => item.id !== effectiveSessionId),
        ].slice(0, MAX_ENTRIES);
      });

      return effectiveSessionId;
    },
    [activeSessionId, setActiveSessionId]
  );

  const removeSearch = useCallback(
    (id: string) => {
      setRecent((prev) => prev.filter((item) => item.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    },
    [activeSessionId, setActiveSessionId]
  );

  const clearSearches = useCallback(() => {
    setRecent([]);
    setActiveSessionId(null);
  }, [setActiveSessionId]);

  const getSession = useCallback(
    (id: string) => {
      return recent.find((item) => item.id === id);
    },
    [recent]
  );

  const value = useMemo(
    () => ({
      recent,
      activeSessionId,
      setActiveSessionId,
      startNewSearchSession,
      addSearch,
      removeSearch,
      clearSearches,
      getSession,
    }),
    [
      recent,
      activeSessionId,
      setActiveSessionId,
      startNewSearchSession,
      addSearch,
      removeSearch,
      clearSearches,
      getSession,
    ]
  );

  return <SearchHistoryContext.Provider value={value}>{children}</SearchHistoryContext.Provider>;
};

export const useSearchHistory = (): SearchHistoryValue => {
  const context = useContext(SearchHistoryContext);
  if (!context) {
    throw new Error('useSearchHistory must be used inside SearchHistoryProvider');
  }
  return context;
};
