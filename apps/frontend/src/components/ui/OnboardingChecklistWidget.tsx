import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Lock,
  Zap,
  Award,
  Check,
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
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('meshvi_onboarding_checklist_dismissed') === 'true';
  });

  // Calculate real-time completion status for the 3 key milestones
  const isProfileComplete = Boolean(
    profile?.displayName &&
    (profile?.headline || profile?.summary || profile?.currentTitle) &&
    (profile?.industry || profile?.function || profile?.company?.name)
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
  const remainingSteps = Math.max(0, 3 - completedSteps);
  const progressPercent = Math.round((completedSteps / 3) * 100);

  // Sync priority verified state to local storage when all steps are completed
  useEffect(() => {
    if (completedSteps === 3) {
      localStorage.setItem('meshvi_priority_verified', 'true');
    }
  }, [completedSteps]);

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
      tagline: 'Add your title, company & bio to boost your directory relevance',
      badge: 'Step 1/3',
      reward: '+33% Visibility',
      isCompleted: isProfileComplete,
      actionLabel: isProfileComplete ? 'Review Profile' : 'Complete Profile',
      actionIcon: <UserCheck className="w-3.5 h-3.5" />,
      onClick: () => navigate('/app/profile'),
    },
    {
      id: 2,
      title: 'Post Business Requirement',
      tagline: 'Publish what you are seeking or offering for executive matchmaking',
      badge: 'Step 2/3',
      reward: '+33% Reach',
      isCompleted: hasPosted,
      actionLabel: hasPosted ? 'Create Another Post' : 'Post Requirement',
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
      title: 'Connect with a Business Leader',
      tagline: 'Send your first verified connection request to start networking',
      badge: 'Step 3/3',
      reward: 'Unlocks Badge',
      isCompleted: hasConnections,
      actionLabel: hasConnections ? 'View Your Network' : 'Find Connections',
      actionIcon: <Users className="w-3.5 h-3.5" />,
      onClick: () => navigate('/app/search'),
    },
  ];

  return (
    <>
      <div
        className={`w-full bg-gradient-to-r from-sky-50/90 via-white to-blue-50/70 border border-sky-200/90 rounded-xl p-3 sm:p-3.5 shadow-2xs transition-all relative overflow-hidden ${className}`}
      >
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-sky-200/35 blur-2xl pointer-events-none" />

        {/* Top Header & Gamified Status */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2.5 min-w-0">
            {/* Gamification Icon */}
            <div
              onClick={() => setShowBadgeModal(true)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-2xs cursor-pointer transition-transform hover:scale-105 ${
                completedSteps === 3
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-2 ring-emerald-300'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-700'
              }`}
              title="Click to view Priority Verified Badge perks"
            >
              {completedSteps === 3 ? (
                <ShieldCheck className="w-5 h-5 text-white" />
              ) : (
                <Award className="w-5 h-5 text-amber-600 animate-pulse" />
              )}
            </div>

            <div className="min-w-0">
              {/* Gamified Headline Tagline */}
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-extrabold text-navy tracking-tight">
                  Profile Progress
                </h2>

                {remainingSteps > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                    <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-500 shrink-0" />
                    <span>
                      Complete {remainingSteps} more step{remainingSteps > 1 ? 's' : ''} to unlock Priority Verified Badge
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Priority Verified Badge Unlocked</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                {completedSteps === 3
                  ? '🎉 Congratulations! Your profile is Priority Verified and enjoys 3x search visibility.'
                  : `Finish these quick steps to stand out and unlock priority recommendations.`}
              </p>
            </div>
          </div>

          {/* Right Section: Interactive Badge Pill & Progress Bar */}
          <div className="flex items-center space-x-2.5 shrink-0 sm:self-center">
            {/* Clickable Priority Badge Pill */}
            <button
              type="button"
              onClick={() => setShowBadgeModal(true)}
              className={`px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs ${
                completedSteps === 3
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 hover:opacity-95'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-400'
              }`}
            >
              {completedSteps === 3 ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="text-[11px] font-bold">Priority Verified</span>
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-800">Priority Badge</span>
                  <span className="text-[9.5px] font-black bg-amber-100 text-amber-900 px-1 py-0.2 rounded">
                    {completedSteps}/3
                  </span>
                </>
              )}
            </button>

            {/* Progress Bar */}
            <div className="w-24 sm:w-32 bg-slate-200/80 rounded-full h-2 overflow-hidden border border-slate-300/40 p-0.5 shrink-0">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  completedSteps === 3
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-amber-400 via-[#078BCC] to-[#0284C7]'
                }`}
                style={{ width: `${Math.max(10, progressPercent)}%` }}
              />
            </div>

            {/* Collapse & Dismiss Actions */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-slate-400 hover:text-navy hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                title={isCollapsed ? 'Expand checklist' : 'Collapse checklist'}
              >
                {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
              {completedSteps === 3 && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                  title="Dismiss checklist"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3 Step Cards */}
        {!isCollapsed && (
          <div className="mt-2.5 pt-2.5 border-t border-sky-100/80 grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`rounded-lg p-2.5 sm:p-3 border transition-all flex flex-col justify-between ${
                  step.isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200/80 shadow-2xs'
                    : 'bg-white/95 border-slate-200/80 hover:border-sky-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 text-amber-700 bg-amber-50 flex items-center justify-center text-[8.5px] font-black shrink-0">
                          {step.id}
                        </div>
                      )}
                      <span
                        className={`text-[11.5px] font-bold truncate ${
                          step.isCompleted ? 'text-emerald-900 line-through opacity-85' : 'text-navy'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    <span
                      className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0 ${
                        step.isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100/70 text-amber-800 border border-amber-200/60'
                      }`}
                    >
                      {step.reward}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-tight line-clamp-2">
                    {step.tagline}
                  </p>
                </div>

                <div className="mt-2 pt-1.5">
                  <button
                    type="button"
                    onClick={step.onClick}
                    className={`w-full py-1 px-2.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      step.isCompleted
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                        : 'bg-[#078BCC] hover:bg-[#0679B2] text-white shadow-2xs hover:shadow-[#078BCC]/20'
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

      {/* Priority Verified Badge Perks Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowBadgeModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-3">
              <div
                className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-md ${
                  completedSteps === 3
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-100'
                    : 'bg-amber-100 text-amber-700 ring-4 ring-amber-50'
                }`}
              >
                {completedSteps === 3 ? (
                  <ShieldCheck className="w-9 h-9" />
                ) : (
                  <Award className="w-9 h-9" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-black text-navy">
                  Priority Verified Badge
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {completedSteps === 3
                    ? 'Your account has unlocked all Priority privileges on Meshvi!'
                    : `Complete ${remainingSteps} more step${remainingSteps > 1 ? 's' : ''} to activate your executive badge.`}
                </p>
              </div>

              {/* Progress Pill inside Modal */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Milestone Progress:</span>
                <span className="font-bold text-[#078BCC]">{completedSteps}/3 Steps Done ({progressPercent}%)</span>
              </div>

              {/* Perks List */}
              <div className="text-left space-y-2.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Exclusive Privileges:
                </span>

                <div className="flex items-start space-x-2 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-navy">3x Search Visibility:</strong> Your profile is boosted to the top tier in director and founder searches.
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-navy">Weekly Recommendations Digest:</strong> Get featured in weekly match briefings sent to verified decision-makers.
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-navy">Direct Connection Priority:</strong> Requests from Priority Verified members have higher acceptance rates.
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(false)}
                  className="w-full py-2.5 bg-[#078BCC] hover:bg-[#0679B2] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {completedSteps === 3 ? 'Awesome' : 'Continue Progress'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
