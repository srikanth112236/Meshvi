import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Plus,
  Users,
  UserCheck,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredPosts } from '../../data/partnershipsData';

interface OnboardingChecklistWidgetProps {
  connectionsCount?: number;
  onOpenCreatePost?: () => void;
  className?: string;
}

export const OnboardingChecklistWidget: React.FC<OnboardingChecklistWidgetProps> = ({
  connectionsCount = 0,
  onOpenCreatePost,
  className = '',
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = user?.profile;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('meshvi_onboarding_checklist_dismissed') === 'true';
  });

  // Calculate real-time completion status for the 3 key milestones
  const isProfileComplete = Boolean(
    profile?.displayName &&
    (profile?.headline || profile?.summary) &&
    (profile?.currentTitle || profile?.industry)
  );

  const hasPosted = (() => {
    try {
      const posts = getStoredPosts();
      const userPostExists = posts.some(
        (p) => p.authorId === user?.id || (user?.email && p.authorId === user.email)
      );
      return userPostExists || localStorage.getItem('meshvi_has_posted') === 'true';
    } catch {
      return false;
    }
  })();

  const hasConnections = connectionsCount > 0 || localStorage.getItem('meshvi_has_connected') === 'true';

  const completedSteps = (isProfileComplete ? 1 : 0) + (hasPosted ? 1 : 0) + (hasConnections ? 1 : 0);
  const progressPercent = Math.round((completedSteps / 3) * 100);

  // Auto-hide if completely done and previously dismissed
  if (isDismissed && completedSteps === 3) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('meshvi_onboarding_checklist_dismissed', 'true');
  };

  const steps = [
    {
      id: 1,
      title: 'Complete Profile',
      tagline: 'Add your title, bio & expertise to unlock direct matching',
      badge: '1/3',
      isCompleted: isProfileComplete,
      actionLabel: isProfileComplete ? 'View Profile' : 'Complete Profile',
      actionIcon: <UserCheck className="w-3.5 h-3.5" />,
      onClick: () => navigate('/app/profile'),
    },
    {
      id: 2,
      title: 'Post Something',
      tagline: 'Publish a requirement, opportunity, or bilateral business need',
      badge: '2/3',
      isCompleted: hasPosted,
      actionLabel: hasPosted ? 'Post Again' : 'Post Requirement',
      actionIcon: <Plus className="w-3.5 h-3.5" />,
      onClick: () => {
        if (onOpenCreatePost) {
          onOpenCreatePost();
        } else {
          navigate('/app/partnerships?new=true');
        }
      },
    },
    {
      id: 3,
      title: 'Make Connections',
      tagline: 'Discover counterpart executives and send your first request',
      badge: '3/3',
      isCompleted: hasConnections,
      actionLabel: hasConnections ? 'View Network' : 'Find Connections',
      actionIcon: <Users className="w-3.5 h-3.5" />,
      onClick: () => navigate('/app/connections'),
    },
  ];

  return (
    <div
      className={`w-full bg-gradient-to-r from-sky-50/90 via-white to-indigo-50/80 border border-sky-200/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all relative overflow-hidden ${className}`}
    >
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-sky-200/30 blur-2xl pointer-events-none" />

      {/* Top Header & Progress Row */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-5 h-5 text-[#0284C7] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-extrabold text-navy tracking-tight">
                Quick Start Onboarding Checklist
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-[#0369A1] border border-sky-200">
                {completedSteps}/3 Done ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {completedSteps === 3
                ? "🎉 You've completed all onboarding milestones! Your profile is actively discoverable."
                : 'Complete these 3 simple steps to get matched with verified business leaders.'}
            </p>
          </div>
        </div>

        {/* Progress Bar & Actions */}
        <div className="flex items-center space-x-3 sm:self-center">
          <div className="flex-1 sm:w-44 bg-slate-200/80 rounded-full h-2.5 overflow-hidden border border-slate-300/40 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#38BDF8] via-[#0284C7] to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${Math.max(8, progressPercent)}%` }}
            />
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-400 hover:text-navy hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              title={isCollapsed ? 'Expand checklist' : 'Collapse checklist'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            {completedSteps === 3 && (
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                title="Dismiss checklist"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Interactive Checklist Cards */}
      {!isCollapsed && (
        <div className="mt-4 pt-3.5 border-t border-sky-100 grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                step.isCompleted
                  ? 'bg-emerald-50/50 border-emerald-200/70 shadow-2xs'
                  : 'bg-white/90 border-slate-200/80 hover:border-sky-300 hover:shadow-xs'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center text-[9px] font-black shrink-0">
                        {step.id}
                      </div>
                    )}
                    <span
                      className={`text-xs font-bold ${
                        step.isCompleted ? 'text-emerald-900 line-through opacity-85' : 'text-navy'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      step.isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {step.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {step.tagline}
                </p>
              </div>

              <div className="mt-3 pt-2">
                <button
                  type="button"
                  onClick={step.onClick}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    step.isCompleted
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                      : 'bg-sky-500 hover:bg-sky-600 text-white shadow-2xs hover:shadow-sky-500/20'
                  }`}
                >
                  {step.actionIcon}
                  <span>{step.actionLabel}</span>
                  {!step.isCompleted && <ArrowRight className="w-3 h-3 ml-0.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
