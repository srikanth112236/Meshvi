import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
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
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

interface OnboardingChecklistWidgetProps {
  connectionsCount?: number;      // Mutually accepted connections (Goal: >= 3)
  sentRequestsCount?: number;     // Sent connection requests (Goal: >= 5)
  onOpenCreatePost?: () => void;
  className?: string;
}

export const OnboardingChecklistWidget: React.FC<OnboardingChecklistWidgetProps> = ({
  connectionsCount = 0,
  sentRequestsCount = 0,
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
  // Step 1: Profile Completeness
  const isProfileComplete = Boolean(
    profile?.displayName &&
    (profile?.headline || profile?.summary || profile?.currentTitle) &&
    (profile?.industry || profile?.function || profile?.company?.name)
  );

  // Step 2: At least 5 connection requests sent
  const localSent = Number(localStorage.getItem('meshvi_sent_requests_count') || 0);
  const effectiveSentRequests = Math.max(sentRequestsCount, localSent);
  const sentTarget = 5;
  const isSentComplete = effectiveSentRequests >= sentTarget;
  const sentProgressPercent = Math.min(100, Math.round((effectiveSentRequests / sentTarget) * 100));

  // Step 3: At least 3 accepted connections
  const localAccepted = Number(localStorage.getItem('meshvi_accepted_connections_count') || (localStorage.getItem('meshvi_has_connected') === 'true' ? 1 : 0));
  const effectiveAcceptedConnections = Math.max(connectionsCount, localAccepted);
  const acceptedTarget = 3;
  const isAcceptedComplete = effectiveAcceptedConnections >= acceptedTarget;
  const acceptedProgressPercent = Math.min(100, Math.round((effectiveAcceptedConnections / acceptedTarget) * 100));

  // Overall milestone tracking
  const completedSteps =
    (isProfileComplete ? 1 : 0) +
    (isSentComplete ? 1 : 0) +
    (isAcceptedComplete ? 1 : 0);
  const remainingSteps = Math.max(0, 3 - completedSteps);
  const overallProgressPercent = Math.round((completedSteps / 3) * 100);

  // Sync priority verified state and trigger celebration once all 3 are completed
  useEffect(() => {
    if (completedSteps === 3) {
      const alreadyAwarded = localStorage.getItem('meshvi_priority_verified') === 'true';
      localStorage.setItem('meshvi_priority_verified', 'true');
      if (!alreadyAwarded) {
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#078BCC', '#10B981', '#F59E0B', '#3B82F6'],
          });
        } catch {
          // Confetti silent fail safe
        }
      }
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
      badge: isProfileComplete ? '✓ Completed' : 'Step 1/3',
      reward: '+33% Visibility',
      isCompleted: isProfileComplete,
      progressLabel: isProfileComplete ? '100% Complete' : 'Profile Incomplete',
      progressPercent: isProfileComplete ? 100 : 35,
      actionLabel: isProfileComplete ? 'Review Profile' : 'Complete Profile',
      actionIcon: <UserCheck className="w-3.5 h-3.5" />,
      onClick: () => navigate('/app/profile'),
    },
    {
      id: 2,
      title: 'Send 5 Connection Requests',
      tagline: 'Reach out to at least 5 decision-makers to start your executive pipeline',
      badge: isSentComplete ? '✓ Completed' : `${effectiveSentRequests}/5 Sent`,
      reward: '+33% Reach',
      isCompleted: isSentComplete,
      progressLabel: `${effectiveSentRequests} of ${sentTarget} sent`,
      progressPercent: sentProgressPercent,
      actionLabel: isSentComplete ? 'Send More Requests' : `Find Leaders (${effectiveSentRequests}/${sentTarget})`,
      actionIcon: <Send className="w-3.5 h-3.5" />,
      onClick: () => navigate('/app/search'),
    },
    {
      id: 3,
      title: 'Connect with 3 Accepted Peers',
      tagline: 'Establish at least 3 accepted mutual connections to activate Priority Verified status',
      badge: isAcceptedComplete ? '✓ Unlocked' : `${effectiveAcceptedConnections}/3 Accepted`,
      reward: 'Unlocks Badge',
      isCompleted: isAcceptedComplete,
      progressLabel: `${effectiveAcceptedConnections} of ${acceptedTarget} accepted`,
      progressPercent: acceptedProgressPercent,
      actionLabel: isAcceptedComplete ? 'View Your Network' : `View Network (${effectiveAcceptedConnections}/${acceptedTarget})`,
      actionIcon: <Users className="w-3.5 h-3.5" />,
      onClick: () => navigate('/app/connections'),
    },
  ];

  return (
    <>
      <div
        className={`w-full bg-gradient-to-r from-sky-50/90 via-white to-blue-50/70 border border-sky-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs transition-all relative overflow-hidden ${className}`}
      >
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-sky-200/35 blur-2xl pointer-events-none" />

        {/* Top Header & Gamified Status */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2.5 min-w-0">
            {/* Gamification Icon */}
            <div
              onClick={() => setShowBadgeModal(true)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs cursor-pointer transition-transform hover:scale-105 ${
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
                <h2 className="text-xs sm:text-sm font-extrabold text-[#142B45] tracking-tight">
                  Profile Progress
                </h2>

                {remainingSteps > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                    <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-500 shrink-0" />
                    <span>
                      Complete {remainingSteps} more milestone{remainingSteps > 1 ? 's' : ''} to unlock Priority Verified Badge
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Priority Verified Badge Unlocked</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                {completedSteps === 3
                  ? '🎉 Congratulations! Your profile is Priority Verified and enjoys 3x search visibility across all member searches.'
                  : `Finish these 3 milestones to build credibility and unlock priority recommendations.`}
              </p>
            </div>
          </div>

          {/* Right Section: Interactive Badge Pill & Progress Bar */}
          <div className="flex items-center justify-between sm:justify-end space-x-2.5 w-full sm:w-auto shrink-0 sm:self-center pt-1 sm:pt-0">
            {/* Clickable Priority Badge Pill */}
            <button
              type="button"
              onClick={() => setShowBadgeModal(true)}
              className={`px-2.5 py-1 rounded-xl border flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs ${
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
                  <span className="text-[9.5px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md">
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
                style={{ width: `${Math.max(10, overallProgressPercent)}%` }}
              />
            </div>

            {/* Collapse & Dismiss Actions */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-all cursor-pointer"
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

        {/* 3 Milestone Cards */}
        {!isCollapsed && (
          <div className="mt-3 pt-3 border-t border-sky-100/90 grid grid-cols-1 md:grid-cols-3 gap-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`rounded-xl p-3 border transition-all flex flex-col justify-between ${
                  step.isCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:border-sky-300 hover:shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0">
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-amber-500 text-amber-700 bg-amber-50 flex items-center justify-center text-[9px] font-black shrink-0">
                          {step.id}
                        </div>
                      )}
                      <span
                        className={`text-xs font-bold truncate ${
                          step.isCompleted ? 'text-emerald-950 line-through opacity-85' : 'text-[#142B45]'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                        step.isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100/80 text-amber-800 border border-amber-200/80'
                      }`}
                    >
                      {step.reward}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-tight">
                    {step.tagline}
                  </p>

                  {/* Specific Progress Track for Step 2 and Step 3 */}
                  <div className="space-y-1 pt-0.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span>{step.progressLabel}</span>
                      <span className={step.isCompleted ? 'text-emerald-700 font-bold' : 'text-[#078BCC] font-bold'}>
                        {step.badge}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          step.isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-[#078BCC] to-[#36C4E8]'
                        }`}
                        style={{ width: `${Math.max(6, step.progressPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={step.onClick}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      step.isCompleted
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-200'
                        : 'bg-[#078BCC] hover:bg-[#0679B2] text-white shadow-2xs hover:shadow-[#078BCC]/25'
                    }`}
                  >
                    {step.actionIcon}
                    <span className="truncate">{step.actionLabel}</span>
                    {!step.isCompleted && <ArrowRight className="w-3.5 h-3.5 ml-0.5 shrink-0" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Priority Verified Badge Perks Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowBadgeModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-3.5">
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
                <h3 className="text-lg font-black text-[#142B45]">
                  Priority Verified Badge
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {completedSteps === 3
                    ? 'Your account has unlocked all Priority privileges on the platform!'
                    : `Complete ${remainingSteps} more milestone${remainingSteps > 1 ? 's' : ''} to activate your executive badge.`}
                </p>
              </div>

              {/* Progress Pill inside Modal */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Milestone Progress:</span>
                <span className="font-bold text-[#078BCC]">{completedSteps}/3 Milestones Done ({overallProgressPercent}%)</span>
              </div>

              {/* 3 Specific Milestones Breakdown */}
              <div className="text-left space-y-2 p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {isProfileComplete ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                    <span>1. Profile Details Completed</span>
                  </span>
                  <span className={`text-[10px] font-bold ${isProfileComplete ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {isProfileComplete ? '✓ Complete' : 'Incomplete'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {isSentComplete ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                    <span>2. Send 5 Connection Requests</span>
                  </span>
                  <span className={`text-[10px] font-bold ${isSentComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {effectiveSentRequests}/5 Sent
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {isAcceptedComplete ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                    <span>3. Connect with 3 Accepted Peers</span>
                  </span>
                  <span className={`text-[10px] font-bold ${isAcceptedComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {effectiveAcceptedConnections}/3 Accepted
                  </span>
                </div>
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
                    <strong className="text-[#142B45]">3x Search Visibility:</strong> Your profile is highlighted in searches by corporate buyers and decision-makers.
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-[#142B45]">Priority Recommendations:</strong> Featured in weekly executive match briefings delivered directly to enterprise leaders.
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-[#142B45]">Direct Verified Credibility:</strong> Displays the golden priority seal on your profile, boosting connection acceptance rates.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(false)}
                  className="w-full py-2.5 bg-[#078BCC] hover:bg-[#0679B2] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {completedSteps === 3 ? 'Close' : 'Continue Milestones'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
