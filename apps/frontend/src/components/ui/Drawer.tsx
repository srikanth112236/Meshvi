import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'success' | 'warning' | 'primary' | 'danger' | 'navy' | 'info';
  };
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  zIndex?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  width = 'md',
  zIndex = 'z-50',
}) => {
  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }[width];

  const badgeStyles = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    primary: 'bg-primary-soft text-primary border-primary/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    navy: 'bg-navy text-white border-navy',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  }[badge?.variant || 'primary'];

  return (
    <div className={`fixed inset-0 ${zIndex} overflow-hidden animate-in fade-in duration-200`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen ${widthClasses} bg-surface border-l border-border shadow-2xl flex flex-col justify-between transform transition-transform ease-out duration-300`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-surface-muted/50 flex items-start justify-between">
            <div className="space-y-1 pr-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-navy leading-tight">{title}</h2>
                {badge && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeStyles}`}
                  >
                    {badge.label}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-text-muted leading-relaxed">{subtitle}</p>}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-text-muted hover:text-navy hover:bg-surface-muted rounded-xl transition-colors shrink-0"
              title="Close panel (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">{children}</div>

          {/* Optional Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-border bg-surface-muted/30 flex items-center justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
