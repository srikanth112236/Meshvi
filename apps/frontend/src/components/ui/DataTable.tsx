import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Inbox,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  emptyTitle?: string;
  emptySubtitle?: string;
  actionsBar?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchFilter,
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 10,
  emptyTitle = 'No records found',
  emptySubtitle = 'There are no entries matching your current filter criteria.',
  actionsBar,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();

    if (searchFilter) {
      return data.filter((item) => searchFilter(item, q));
    }

    // Default shallow search across primitive properties
    return data.filter((item: any) => {
      return Object.values(item).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(q);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchFilter]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'string') {
        comparison = aVal.localeCompare(String(bVal));
      } else {
        comparison = aVal > bVal ? 1 : -1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination Math
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(startIdx, startIdx + pageSize);
  }, [sortedData, safeCurrentPage, pageSize]);

  const handleSort = (key: string, isSortable?: boolean) => {
    if (!isSortable) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const startEntry = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endEntry = Math.min(safeCurrentPage * pageSize, totalItems);

  return (
    <div className="space-y-4">
      {/* Top Controls: Search & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {searchable ? (
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-focus placeholder:text-text-muted transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-text-muted hover:text-navy"
              >
                &times;
              </button>
            )}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {actionsBar}
          <div className="flex items-center space-x-2 text-xs text-text-muted">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-surface border border-border rounded-xl text-xs text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-focus"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} rows
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-muted/70 text-text-muted font-bold border-b border-border select-none">
              <tr>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key, col.sortable)}
                      className={`p-3.5 tracking-wider uppercase text-[11px] font-bold ${
                        col.sortable ? 'cursor-pointer hover:text-navy hover:bg-surface-muted transition-colors' : ''
                      } ${col.className || ''}`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>{col.header}</span>
                        {col.sortable && (
                          <span className="shrink-0 text-text-muted">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-primary" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-muted">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-navy">{emptyTitle}</h4>
                      <p className="text-xs text-text-muted max-w-sm">{emptySubtitle}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, rowIdx) => {
                  const key = keyExtractor(item);
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={`transition-colors ${
                        onRowClick
                          ? 'cursor-pointer hover:bg-primary-soft/30 active:bg-primary-soft/50'
                          : 'hover:bg-surface-muted/40'
                      }`}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={`p-3.5 align-middle ${col.className || ''}`}>
                          {col.render ? col.render(item, rowIdx) : (item as any)[col.key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="px-5 py-3.5 border-t border-border bg-surface-muted/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
            <div>
              Showing <span className="font-bold text-navy">{startEntry}</span> to{' '}
              <span className="font-bold text-navy">{endEntry}</span> of{' '}
              <span className="font-bold text-navy">{totalItems}</span> entries
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(1)}
                className="p-1.5 rounded-lg border border-border bg-surface text-navy hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="First page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-border bg-surface text-navy hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="px-3 py-1 font-semibold text-navy bg-surface border border-border rounded-lg">
                Page {safeCurrentPage} of {totalPages}
              </div>

              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-border bg-surface text-navy hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-1.5 rounded-lg border border-border bg-surface text-navy hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Last page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
