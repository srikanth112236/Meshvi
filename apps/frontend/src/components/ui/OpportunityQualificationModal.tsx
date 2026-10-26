import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface QuestionStep {
  id: string;
  title: string;
  subtitle: string;
  category: 'productCategory' | 'certificationTier' | 'targetFacility' | 'engagementType';
  options: { label: string; description: string; badge?: string }[];
}

interface OpportunityQualificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawQuery: string;
  onQualificationComplete: (passport: any) => void;
}

export const OpportunityQualificationModal: React.FC<OpportunityQualificationModalProps> = ({
  isOpen,
  onClose,
  rawQuery,
  onQualificationComplete,
}) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [sectorTitle, setSectorTitle] = useState('Commercial Opportunity Intelligence');
  const [steps, setSteps] = useState<QuestionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch dynamic, query-contextual qualification interview steps whenever modal opens
  useEffect(() => {
    if (!isOpen || !token) return;

    let isMounted = true;
    setLoadingQuestions(true);
    setCurrentStepIndex(0);

    const fetchSteps = async () => {
      try {
        const queryParam = encodeURIComponent(rawQuery || 'commercial partnership');
        const res = await fetch(`/api/v1/search/qualification-questions?q=${queryParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (isMounted && res.ok && data.success && data.data?.steps?.length > 0) {
          setSectorTitle(data.data.sector || 'Opportunity Sector Matching');
          setSteps(data.data.steps);
          // Pre-select first option for each step
          const defaults: Record<string, string> = {};
          data.data.steps.forEach((s: QuestionStep) => {
            if (s.options?.[0]) {
              defaults[s.category] = s.options[0].label;
            }
          });
          setSelectedAnswers(defaults);
        }
      } catch {
        // Fallback handled gracefully
      } finally {
        if (isMounted) setLoadingQuestions(false);
      }
    };

    fetchSteps();

    return () => {
      isMounted = false;
    };
  }, [isOpen, token, rawQuery]);

  if (!isOpen) return null;

  const currentStep = steps[currentStepIndex];
  const isLastStep = steps.length > 0 && currentStepIndex === steps.length - 1;

  const handleSelectOption = (category: string, optionLabel: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [category]: optionLabel,
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmitQualification();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQualification = async () => {
    setSubmitting(true);
    try {
      const payload = {
        rawQuery: rawQuery || 'commercial partnerships',
        productCategory: selectedAnswers.productCategory,
        certificationTier: selectedAnswers.certificationTier,
        targetFacility: selectedAnswers.targetFacility || selectedAnswers.engagementType,
        engagementType: selectedAnswers.engagementType,
      };

      const res = await fetch('/api/v1/search/qualify-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          title: 'Opportunity Passport Generated',
          message: 'High-precision targets locked with corporate mandate alignment.',
          type: 'success',
        });
        onQualificationComplete(data.data);
        onClose();
      } else {
        showToast({
          title: 'Qualification Alert',
          message: data.message || 'Failed to qualify commercial opportunity.',
          type: 'warning',
        });
      }
    } catch {
      showToast({
        title: 'Network Error',
        message: 'Could not connect to the Opportunity Engine.',
        type: 'warning',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[82vh]">
        {/* Compact Header */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                  Commercial Opportunity Qualification
                </h3>
                <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Precision Gate
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center space-x-1">
                <Compass className="w-3 h-3 text-neutral-400" />
                <span>Sector: <strong>{sectorTitle}</strong></span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Progress Segments */}
        <div className="w-full bg-neutral-100 h-1 flex">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-full transition-all duration-300 ${
                idx <= currentStepIndex ? 'bg-black flex-1' : 'bg-neutral-200 flex-1'
              } ${idx !== steps.length - 1 ? 'border-r border-white' : ''}`}
            />
          ))}
        </div>

        {/* Query Context Pill */}
        <div className="px-5 py-2 bg-neutral-50/40 flex items-center justify-between text-[11px] text-neutral-600 border-b border-neutral-100">
          <div className="flex items-center space-x-1.5 truncate pr-2">
            <span className="font-semibold text-neutral-700">Intent:</span>
            <span className="px-2 py-0.5 bg-neutral-100 rounded text-neutral-800 font-mono text-[10.5px] truncate">
              "{rawQuery || 'Commercial Opportunity'}"
            </span>
          </div>
          {steps.length > 0 && (
            <span className="text-neutral-400 text-[10px] shrink-0 font-medium">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          )}
        </div>

        {/* Body Questions */}
        <div className="px-5 py-4 overflow-y-auto space-y-3.5 flex-1">
          {loadingQuestions ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-black mx-auto" />
              <p className="text-xs text-neutral-500 font-medium">
                Tailoring contextual qualification criteria for your objective...
              </p>
            </div>
          ) : !currentStep ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No qualification parameters required. You can proceed with standard discovery.
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 leading-tight">
                  {currentStep.title}
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">{currentStep.subtitle}</p>
              </div>

              <div className="space-y-2">
                {currentStep.options.map((opt, i) => {
                  const isSelected = selectedAnswers[currentStep.category] === opt.label;
                  return (
                    <div
                      key={i}
                      onClick={() => handleSelectOption(currentStep.category, opt.label)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start space-x-3 ${
                        isSelected
                          ? 'border-black bg-neutral-50/80 shadow-xs ring-1 ring-black'
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/40'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-black fill-white" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-xs font-bold text-neutral-900 truncate">
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 shrink-0">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Compact Differentiator Note */}
              <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-start space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                <p className="text-[10.5px] text-amber-900 leading-snug">
                  <strong>Meshvi Precision Guarantee:</strong> Bypasses unqualified keyword spam (cleaners, crew, interns). Aligns directly with authorized corporate mandate desks and buying committees.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Compact Footer Navigation */}
        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || submitting || loadingQuestions}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
              currentStepIndex === 0 || loadingQuestions
                ? 'opacity-40 cursor-not-allowed border-neutral-200 text-neutral-400'
                : 'border-neutral-200 hover:bg-neutral-100 text-neutral-700'
            }`}
          >
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={submitting || loadingQuestions || !currentStep}
            className="px-4 py-2 text-xs font-bold bg-black text-white hover:bg-neutral-800 rounded-xl transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
          >
            {submitting ? (
              <span>Generating Passport...</span>
            ) : isLastStep ? (
              <>
                <span>Lock Intent & Issue Passport</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
