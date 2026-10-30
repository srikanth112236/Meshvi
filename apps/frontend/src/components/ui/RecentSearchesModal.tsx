import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, History, ArrowRight, Trash2, Clock } from 'lucide-react';
import { useSearchHistory } from '../../context/SearchHistoryContext';
import { formatSearchTime, formatSearchDateTime } from '../../utils/formatSearchTime';

interface RecentSearchesModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (query: string, sessionId?: string) => void;
}

export const RecentSearchesModal = ({ open, onClose, onSelect }: RecentSearchesModalProps) => {
  const { recent, clearSearches, removeSearch } = useSearchHistory();
  const [filter, setFilter] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setFilter('');
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const q = filter.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return recent;
    return recent.filter((entry) => {
      if (entry.query.toLowerCase().includes(q)) return true;
      return entry.results.some((result) =>
        [result.name, result.company, result.headline, result.location]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      );
    });
  }, [recent, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-start sm:items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-navy/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl max-h-[85vh] bg-white border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <History className="w-3.5 h-3.5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-navy tracking-tight">Recent searches</h2>
              <p className="text-[10px] text-text-muted truncate">
                {recent.length} saved · queries and matched results
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-navy hover:bg-surface-muted rounded-lg transition-colors shrink-0"
            aria-label="Close recent searches"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2.5 border-b border-border bg-surface-muted/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search queries, people, companies…"
              className="w-full pl-8 pr-8 py-2 bg-white border border-border rounded-lg text-xs text-navy placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {filter && (
              <button
                type="button"
                onClick={() => setFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-navy"
                aria-label="Clear search filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {recent.length === 0 ? (
            <div className="py-10 px-6 text-center space-y-1.5">
              <History className="w-6 h-6 text-text-muted mx-auto" />
              <p className="text-xs font-bold text-navy">No recent searches yet</p>
              <p className="text-[11px] text-text-muted">
                Run a search and it will appear here with its results.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 px-6 text-center space-y-1.5">
              <Search className="w-6 h-6 text-text-muted mx-auto" />
              <p className="text-xs font-bold text-navy">No matches for “{filter.trim()}”</p>
              <p className="text-[11px] text-text-muted">
                Try a query, a person, a company, or a location.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((entry) => {
                const queryMatches = !!q && entry.query.toLowerCase().includes(q);
                const resultMatchOnly = !!q && !queryMatches;
                const shownResults = resultMatchOnly
                  ? [
                      ...entry.results.filter((r) =>
                        [r.name, r.company, r.headline, r.location]
                          .filter(Boolean)
                          .some((v) => String(v).toLowerCase().includes(q))
                      ),
                      ...entry.results.filter(
                        (r) =>
                          ![r.name, r.company, r.headline, r.location]
                            .filter(Boolean)
                            .some((v) => String(v).toLowerCase().includes(q))
                      ),
                    ].slice(0, 3)
                  : entry.results.slice(0, 3);

                return (
                  <div
                    key={entry.id}
                    className="group rounded-xl hover:bg-surface-muted/70 transition-colors"
                  >
                    <div className="flex items-start gap-1 px-2 py-2">
                      <button
                        type="button"
                        onClick={() => onSelect(entry.query, entry.id)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-xs font-bold text-navy truncate">{entry.query}</p>
                          {entry.queries && entry.queries.length > 1 && (
                            <span className="shrink-0 rounded border border-primary/20 bg-primary-soft px-1.5 py-0.2 text-[8.5px] font-bold text-primary">
                              {entry.queries.length} in thread
                            </span>
                          )}
                          {resultMatchOnly && (
                            <span className="shrink-0 rounded border border-primary/20 bg-primary-soft px-1 py-0.5 text-[8px] font-black uppercase tracking-wider text-primary">
                              Result match
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-text-muted">
                          <span
                            className="inline-flex items-center gap-1"
                            title={formatSearchDateTime(entry.at)}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            {formatSearchTime(entry.at)}
                          </span>
                          <span>·</span>
                          <span>
                            {entry.count} result{entry.count === 1 ? '' : 's'}
                          </span>
                        </div>

                        {shownResults.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {shownResults.map((result) => (
                              <span
                                key={result.id}
                                className="inline-flex max-w-[180px] items-center gap-1 rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[9px] text-text-muted"
                              >
                                <span className="w-1 h-1 shrink-0 rounded-full bg-primary" />
                                <span className="truncate">
                                  {result.name}
                                  {result.company ? ` · ${result.company}` : ''}
                                </span>
                                {typeof result.score === 'number' && (
                                  <span className="shrink-0 font-bold text-primary">{result.score}%</span>
                                )}
                              </span>
                            ))}
                            {entry.results.length > 3 && (
                              <span className="self-center text-[9px] text-text-muted">
                                +{entry.results.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onSelect(entry.query, entry.id)}
                          className="p-1.5 rounded-md text-text-muted hover:text-primary hover:bg-surface transition-colors"
                          title="Run this search"
                          aria-label={`Run search ${entry.query}`}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSearch(entry.id)}
                          className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/5 transition-all opacity-0 group-hover:opacity-100"
                          title="Remove this search"
                          aria-label={`Remove search ${entry.query}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-muted/30">
          <p className="text-[10px] text-text-muted">
            {q
              ? `${filtered.length} match${filtered.length === 1 ? '' : 'es'}`
              : `${recent.length} search${recent.length === 1 ? '' : 'es'} saved`}
          </p>
          {recent.length > 0 && (
            <button
              type="button"
              onClick={clearSearches}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-text-muted hover:text-danger transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
