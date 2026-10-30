import { useEffect, useRef, useState } from 'react';
import { X, ChevronRight, Sparkles } from 'lucide-react';

export interface TourStepDef {
  id: string;
  title: string;
  description: string;
  target: string;
}

interface FeatureTourProps {
  steps: TourStepDef[];
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
}

export const FeatureTour = ({ steps, open, onClose, onComplete }: FeatureTourProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const rafRef = useRef<number | null>(null);

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);

    const measure = () => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({
          top: r.top,
          left: r.left,
          width: Math.max(r.width, 8),
          height: Math.max(r.height, 8),
          bottom: r.bottom,
        });
      } else {
        setRect(null);
      }
    };

    // Wait a tick for the target to be mounted / animations to settle
    rafRef.current = window.requestAnimationFrame(() => window.requestAnimationFrame(measure));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, step?.id, onClose]);

  if (!open) return null;

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      onComplete?.();
    }
  };

  const spotlightTop = rect ? rect.top - 14 : 0;
  const spotlightLeft = rect ? rect.left - 14 : 0;
  const spotlightW = rect ? rect.width + 28 : 0;
  const spotlightH = rect ? rect.height + 28 : 0;
  const tooltipTop = rect ? rect.bottom + 18 : 120;

  const progress = steps.length > 1 ? Math.round(((stepIndex) / (steps.length - 1)) * 100) : 100;

  return (
    <div className="fixed inset-0 z-[120]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Spotlight */}
      {rect && (
        <div
          className="absolute rounded-2xl bg-transparent transition-all duration-300"
          style={{ top: spotlightTop, left: spotlightLeft, width: spotlightW, height: spotlightH }}
        >
          <div className="absolute -inset-2 rounded-2xl ring-2 ring-primary/70 bg-primary/10" />
        </div>
      )}
      {/* Tooltip */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[min(92vw,420px)] bg-surface rounded-2xl border border-border shadow-2xl p-5 z-10"
        style={{ top: tooltipTop }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-text-muted">
                Step {stepIndex + 1} of {steps.length}
              </p>
              <h3 className="text-sm font-black text-navy tracking-tight">{step.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-navy p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
            aria-label="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-text-muted leading-relaxed mt-3">{step.description}</p>

        <div className="mt-4 h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-bold text-text-muted hover:text-navy border border-border rounded-xl transition-colors"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
          >
            {stepIndex < steps.length - 1 ? (
              <span className="flex items-center space-x-1.5">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span>Finish</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
