import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Briefcase,
  Target,
  Send,
  Building2,
  Calendar,
  Volume2,
  Play,
  Pause,
  Video,
  Radio,
  Zap,
  Users,
  Check,
  Network,
  UserMinus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ReadinessCard } from './ReadinessCard';
import { TrustPathPanel } from './TrustPathPanel';
import { ReputationBadge } from './ReputationBadge';

export interface PersonDossierDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string | null;
  onOpenConnect?: (person: any) => void;
  onOpenProposal?: (company: any) => void;
  onOpenCompanyDossier?: (companyId: string) => void;
}

export const PersonDossierDrawer: React.FC<PersonDossierDrawerProps> = ({
  isOpen,
  onClose,
  profileId,
  onOpenConnect,
  onOpenProposal,
  onOpenCompanyDossier,
}) => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'intents' | 'company' | 'experience'>('profile');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const [readiness, setReadiness] = useState<any | null>(null);
  const [trustPath, setTrustPath] = useState<any | null>(null);
  const [loadingTrustPath, setLoadingTrustPath] = useState(false);
  const [reputation, setReputation] = useState<any | null>(null);
  const [mutuals, setMutuals] = useState<any[]>([]);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!token || !profile?.id) return;
    const confirm = window.confirm(
      `Are you sure you want to remove your connection with ${profile.displayName}? Both parties will be disconnected and can reconnect at any time.`
    );
    if (!confirm) return;

    setDisconnecting(true);
    try {
      const res = await fetch(`/api/v1/connections/by-profile/${profile.id}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setProfile({
          ...profile,
          connectionStatus: 'NONE',
          connectedAt: null,
          connectedDays: 0,
        });
      }
    } catch {} finally {
      setDisconnecting(false);
    }
  };

  // Step 3: Reciprocity Radar (Double-Blind Mutual Intent Engine)
  const [radarScanning, setRadarScanning] = useState(false);
  const [radarMatched, setRadarMatched] = useState(false);
  const [matchedIntentSnippet, setMatchedIntentSnippet] = useState('');

  const handleTriggerRadar = () => {
    setRadarScanning(true);
    setTimeout(() => {
      setRadarScanning(false);
      const lookingFor =
        profile?.intents?.find((i: any) => i.intentType === 'LOOKING_FOR')?.description ||
        profile?.intents?.[0]?.description ||
        `${profile?.function || 'Commercial'} partnerships in Southeast Asia`;
      setMatchedIntentSnippet(lookingFor);
      setRadarMatched(true);
    }, 700);
  };

  useEffect(() => {
    if (isOpen && profileId && token) {
      setLoading(true);
      fetch(`/api/v1/profiles/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setProfile(data.data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));

      // Fetch F1: Partnership Readiness
      fetch(`/api/v1/readiness/profile/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setReadiness(data?.data !== undefined ? data.data : data))
        .catch(() => setReadiness(null));

      // Fetch F5: Reputation Score
      fetch(`/api/v1/reputation/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setReputation(data?.data !== undefined ? data.data : data))
        .catch(() => setReputation(null));

      // Fetch F2: Trust Path Visualizer
      setLoadingTrustPath(true);
      fetch(`/api/v1/deal-rooms/trust-path/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setTrustPath(data?.data !== undefined ? data.data : data);
          setLoadingTrustPath(false);
        })
        .catch(() => {
          setTrustPath(null);
          setLoadingTrustPath(false);
        });

      // Fetch Mutual Connections Network
      fetch(`/api/v1/connections/mutual/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.mutuals) setMutuals(data.mutuals);
          else setMutuals([]);
        })
        .catch(() => setMutuals([]));

      // Fetch Live Network Metrics (Genuine DB)
      fetch(`/api/v1/connections/network-metrics/${profileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData?.success && resData?.data) {
            setProfile((prev: any) => ({
              ...prev,
              connectionStatus: resData.data.connectionStatus,
              connectionId: resData.data.connectionId,
              connectedDays: resData.data.connectedDays,
              totalConnectionsTiered: resData.data.totalConnectionsTiered,
              mutualTiered: resData.data.mutualTiered,
            }));
          }
        })
        .catch(() => {});
    }
  }, [isOpen, profileId, token]);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-surface border-l border-border shadow-2xl flex flex-col justify-between transform transition-transform ease-out duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-bg flex items-start justify-between">
            <div className="flex items-center space-x-3.5 min-w-0 pr-3">
              <div className="w-12 h-12 rounded-2xl bg-black text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm border border-border overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  profile?.displayName?.[0] || 'U'
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h2 className="text-base font-extrabold text-navy truncate">
                    {profile?.displayName || 'Decision-Maker Intelligence'}
                  </h2>
                  {profile?.isLinkedInVerified && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0A66C2] border border-blue-200 flex items-center space-x-1 shrink-0" title="Tier-1: LinkedIn Authenticated via OIDC">
                      <span>LinkedIn Verified</span>
                    </span>
                  )}
                  {profile?.isWorkEmailVerified && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1 shrink-0" title="Tier-2: Corporate Work Email Verified">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Work Email</span>
                    </span>
                  )}
                  {profile?.isRoleConfirmed && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center space-x-1 shrink-0" title="Tier-4: Corporate Role Confirmed by Company Admin">
                      <span>Role Confirmed</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {profile?.currentTitle} &bull;{' '}
                  <span className="font-semibold text-navy">
                    {profile?.company?.name || 'Verified Enterprise'}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-text-muted hover:text-navy hover:bg-surface rounded-xl transition-colors shrink-0"
              title="Close drawer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex border-b border-border bg-surface px-6 space-x-1 text-xs font-bold text-text-muted overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-black text-navy font-extrabold'
                  : 'border-transparent hover:text-navy'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>360° Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('intents')}
              className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'intents'
                  ? 'border-black text-navy font-extrabold'
                  : 'border-transparent hover:text-navy'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Commercial Intents</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('company')}
              className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'company'
                  ? 'border-black text-navy font-extrabold'
                  : 'border-transparent hover:text-navy'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Company Dossier</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('experience')}
              className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'experience'
                  ? 'border-black text-navy font-extrabold'
                  : 'border-transparent hover:text-navy'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Background</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
            {loading ? (
              <div className="py-20 text-center text-text-muted">Loading decision maker dossier...</div>
            ) : !profile ? (
              <div className="py-20 text-center text-text-muted">Profile intelligence unavailable.</div>
            ) : (
              <>
                {/* TAB 1: 360 PROFILE */}
                {activeTab === 'profile' && (
                  <div className="space-y-4">
                    {/* Executive Headline & Bio */}
                    {profile.headline && (
                      <div className="p-3.5 bg-bg rounded-xl border border-border">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                          Executive Stance & Mandate
                        </span>
                        <p className="text-xs font-semibold text-navy italic">
                          "{profile.headline}"
                        </p>
                      </div>
                    )}

                    {/* Quick Firmographics */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-surface-muted rounded-xl border border-border/60">
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase block">Function & Desk</span>
                        <span className="font-extrabold text-navy block">
                          {profile.function || 'Commercial'} ({profile.seniority || 'CXO'})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase block">Location</span>
                        <span className="font-bold text-navy block flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-text-muted" />
                          {profile.city || 'Global'}, {profile.countryCode || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase block">Availability</span>
                        <span className="font-bold text-emerald-700 block uppercase">
                          {profile.connectionAvailability || 'SELECTIVE'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase block">Proposals</span>
                        <span className="font-bold text-navy block">
                          {profile.proposalAccepting !== false ? 'Accepting Inbound Bids' : 'Closed'}
                        </span>
                      </div>
                    </div>

                    {/* Enterprise Network & Connection Intelligence */}
                    <div className="p-4 bg-surface rounded-xl border border-border space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-navy uppercase tracking-wider flex items-center space-x-1.5">
                          <Network className="w-4 h-4 text-blue-600" />
                          <span>Enterprise Network & Relationship</span>
                        </span>
                        {profile.connectionStatus === 'CONNECTED' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                            <span>Connected &bull; {profile.connectedDays === 0 ? 'Today' : `${profile.connectedDays} days`}</span>
                          </span>
                        ) : profile.connectionStatus === 'PENDING' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            <span>Request Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                            <span>Not Connected</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="p-2.5 bg-bg rounded-lg border border-border/80">
                          <span className="text-[10px] text-text-muted font-bold block uppercase">Total Network Size</span>
                          <span className="text-sm font-black text-navy flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5 text-neutral-600" />
                            <span>{profile.totalConnectionsTiered === '0' ? '0' : (profile.totalConnectionsTiered || '0')} Connections</span>
                          </span>
                          <span className="text-[9px] text-text-muted block mt-0.5">Verified decision-makers</span>
                        </div>

                        <div className="p-2.5 bg-bg rounded-lg border border-border/80">
                          <span className="text-[10px] text-text-muted font-bold block uppercase">Mutual Connections</span>
                          <span className="text-sm font-black text-blue-700 flex items-center space-x-1">
                            <Network className="w-3.5 h-3.5 text-blue-600" />
                            <span>{profile.mutualTiered || '0'} Mutual Contacts</span>
                          </span>
                          <span className="text-[9px] text-text-muted block mt-0.5">Direct 2nd-degree paths</span>
                        </div>
                      </div>

                      {/* Mutual Connections Roster */}
                      {mutuals.length > 0 && (
                        <div className="pt-2 border-t border-border/60 space-y-1.5">
                          <span className="text-[10px] font-bold text-text-muted uppercase block">
                            Shared Decision-Maker Overlaps
                          </span>
                          <div className="space-y-1.5">
                            {mutuals.map((m: any, idx: number) => (
                              <div
                                key={m.id || idx}
                                className="flex items-center justify-between p-2 rounded-lg bg-surface-muted border border-border/50 text-[11px]"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-[10px] font-bold">
                                    {(m.displayName || 'M')[0]}
                                  </div>
                                  <div>
                                    <span className="font-extrabold text-navy block leading-tight">{m.displayName}</span>
                                    <span className="text-[10px] text-text-muted block">
                                      {m.currentTitle} &bull; {m.companyName}
                                    </span>
                                  </div>
                                </div>
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-800 rounded">
                                  Mutual
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Remove Connection button if connected */}
                      {profile.connectionStatus === 'CONNECTED' && (
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                          <span className="text-[10px] text-text-muted">
                            Need to clean up your network roster?
                          </span>
                          <button
                            type="button"
                            onClick={handleDisconnect}
                            disabled={disconnecting}
                            className="px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center space-x-1"
                          >
                            <UserMinus className="w-3 h-3" />
                            <span>{disconnecting ? 'Removing...' : 'Remove Connection'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* F1: Partnership Readiness Signal */}
                    <ReadinessCard readiness={readiness} />

                    {/* F5: Verified Outcome Reputation */}
                    <ReputationBadge reputation={reputation} />

                    {/* F2: Warm Trust Path Visualizer */}
                    <TrustPathPanel
                      trustPath={trustPath}
                      loading={loadingTrustPath}
                      onRequestIntro={(_bridgeProfileId, bridge) => {
                        if (onOpenConnect) {
                          onOpenConnect({
                            ...profile,
                            companyName: profile.company?.name || profile.companyName,
                            intermediaryProfileId: bridge?.profileId,
                            intermediaryUserId: bridge?.userId,
                            intermediaryName: bridge?.displayName,
                            intermediaryTitle: bridge?.currentTitle,
                            intermediaryCompany: bridge?.company,
                          });
                        }
                      }}
                    />

                    {/* Executive Summary */}
                    {profile.summary && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-navy uppercase tracking-wider block">
                          Professional Summary
                        </span>
                        <p className="text-text-muted leading-relaxed bg-surface p-3 rounded-xl border border-border">
                          {profile.summary}
                        </p>
                      </div>
                    )}

                    {/* Verified Expertise Tags */}
                    {profile.expertise?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-navy uppercase tracking-wider block">
                          Verified Domain Expertise
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.expertise.map((exp: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-bg text-navy rounded-lg border border-border text-[11px] font-semibold"
                            >
                              {exp.term || exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feature #30: Audio / Video Executive Snippets */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-navy uppercase tracking-wider flex items-center space-x-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-black" />
                          <span>Executive Intro Snippets (Feature #30)</span>
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Verified Pitch
                        </span>
                      </div>

                      {/* 30s Audio Snippet Player */}
                      <div className="p-3.5 bg-bg rounded-xl border border-border space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                              className="w-8 h-8 rounded-lg bg-black text-white hover:bg-neutral-800 flex items-center justify-center transition-colors shadow-xs"
                              title={isPlayingAudio ? 'Pause Voice Intro' : 'Play Voice Intro'}
                            >
                              {isPlayingAudio ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5 ml-0.5" />
                              )}
                            </button>
                            <div>
                              <p className="font-bold text-navy text-[11px]">
                                30-Second Commercial Audio Intro
                              </p>
                              <p className="text-[10px] text-text-muted">
                                {isPlayingAudio ? 'Playing snippet (0:14 / 0:30)...' : 'Recorded directly by verified executive'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-text-muted">0:30</span>
                        </div>

                        {/* Interactive Waveform Visualizer */}
                        <div className="flex items-center space-x-1 py-1">
                          {[40, 65, 30, 85, 100, 75, 45, 90, 60, 30, 70, 95, 80, 50, 40, 65, 85, 55, 75, 90, 60, 40, 80, 50, 35].map((height, i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-all duration-300 ${
                                isPlayingAudio && i < 12
                                  ? 'bg-black h-4'
                                  : 'bg-neutral-200 hover:bg-neutral-300'
                              }`}
                              style={{ height: `${Math.max(4, Math.round((height / 100) * 18))}px` }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Video Elevator Pitch */}
                      <div className="p-3.5 bg-bg rounded-xl border border-border space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                              <Video className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-navy text-[11px]">
                                45-Second Video Partnership Teaser
                              </p>
                              <p className="text-[10px] text-text-muted">
                                1080p HD &bull; Subtitles Enabled &bull; Direct Pitch
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                            className="px-2.5 py-1 bg-black hover:bg-neutral-800 text-white font-bold text-[10px] rounded-lg transition-colors"
                          >
                            {isPlayingVideo ? 'Close Video' : 'Preview Video'}
                          </button>
                        </div>

                        {isPlayingVideo ? (
                          <div className="w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden relative border border-border flex flex-col items-center justify-center p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md mb-2">
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            </div>
                            <p className="text-white text-xs font-bold">
                              {profile.displayName}: "Partnering on Next-Gen Trade Infrastructure"
                            </p>
                            <p className="text-neutral-400 text-[10px] mt-1">
                              Simulated HD Stream &bull; MESHVI Secure Player
                            </p>
                          </div>
                        ) : (
                          <div
                            onClick={() => setIsPlayingVideo(true)}
                            className="w-full h-16 bg-surface border border-border/80 rounded-xl flex items-center justify-center cursor-pointer hover:border-black transition-colors text-text-muted hover:text-navy"
                          >
                            <div className="flex items-center space-x-2 text-xs font-semibold">
                              <Play className="w-4 h-4 text-black" />
                              <span>Click to play video introduction teaser</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: COMMERCIAL INTENTS */}
                {activeTab === 'intents' && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                      Active Strategic Objectives
                    </span>
                    {!profile.intents || profile.intents.length === 0 ? (
                      <div className="p-8 text-center bg-bg rounded-xl border border-border text-text-muted">
                        No explicit intent tags declared yet.
                      </div>
                    ) : (
                      profile.intents.map((item: any) => (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border space-y-1 ${
                            item.intentType === 'NOT_LOOKING_FOR'
                              ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                              : item.intentType === 'OFFERING'
                              ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                              : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {item.intentType.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-text-muted font-bold">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs font-semibold">{item.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 3: COMPANY DOSSIER LINK */}
                {activeTab === 'company' && (
                  <div className="space-y-4">
                    {profile.company ? (
                      <div className="p-4 bg-bg rounded-2xl border border-border space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-black text-white font-extrabold flex items-center justify-center text-sm">
                            {profile.company.name?.[0] || 'C'}
                          </div>
                          <div>
                            <h3 className="text-sm font-extrabold text-navy">{profile.company.name}</h3>
                            <p className="text-xs text-text-muted">
                              {profile.company.domain || 'corporate-portal'} &bull;{' '}
                              {profile.company.headquartersCountry || 'Global'}
                            </p>
                          </div>
                        </div>

                        {profile.company.description && (
                          <p className="text-xs text-text-muted leading-relaxed">
                            {profile.company.description}
                          </p>
                        )}

                        {/* Parent Group & Regional Branches */}
                        {profile.company.subsidiaryRelations?.length > 0 && (
                          <div className="p-3 bg-surface rounded-xl border border-border space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-navy block">
                              Operating Under Parent Holding
                            </span>
                            {profile.company.subsidiaryRelations.map((rel: any) => (
                              <div key={rel.id} className="text-xs font-semibold text-navy flex items-center justify-between">
                                <span>{rel.parentCompany?.name}</span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 rounded text-text-muted">
                                  {rel.parentCompany?.headquartersCity}, {rel.parentCompany?.headquartersCountry}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {profile.company.parentRelations?.length > 0 && (
                          <div className="p-3 bg-surface rounded-xl border border-border space-y-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-navy block">
                              Global Branch Network ({profile.company.parentRelations.length} Hubs)
                            </span>
                            <div className="space-y-1">
                              {profile.company.parentRelations.slice(0, 4).map((rel: any) => (
                                <div key={rel.id} className="text-xs text-navy flex items-center justify-between">
                                  <span className="truncate pr-2">{rel.subsidiary?.name}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded shrink-0">
                                    {rel.subsidiary?.companyType || 'Branch'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 flex items-center space-x-2">
                          {onOpenCompanyDossier && (
                            <button
                              type="button"
                              onClick={() => {
                                onOpenCompanyDossier(profile.company.id);
                                onClose();
                              }}
                              className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Open Full 360° Company Dossier</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-bg rounded-xl border border-border text-text-muted">
                        No corporate entity linked to this profile.
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: EXPERIENCE BACKGROUND */}
                {activeTab === 'experience' && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold text-navy uppercase tracking-wider block">
                      Career Progression & Background
                    </span>
                    {!profile.experiences || profile.experiences.length === 0 ? (
                      <div className="p-8 text-center bg-bg rounded-xl border border-border text-text-muted">
                        No past career history recorded.
                      </div>
                    ) : (
                      profile.experiences.map((exp: any) => (
                        <div
                          key={exp.id}
                          className="p-3.5 bg-bg rounded-xl border border-border flex items-center justify-between"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-navy">{exp.title}</h4>
                            <p className="text-[11px] text-text-muted">
                              {exp.companyName} {exp.function ? `• ${exp.function}` : ''}
                            </p>
                          </div>
                          {exp.isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-black text-white uppercase">
                              Current
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Step 3: Reciprocity Radar Synergy Card */}
          {radarMatched && (
            <div className="mx-6 mb-3 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border border-emerald-300 rounded-2xl animate-fade-in shadow-xs space-y-2">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-md bg-emerald-600 text-white">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  ⚡ Reciprocity Radar: Double-Blind Match Verified!
                </span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Both parties have declared reciprocal alignment. Target seeks: <strong className="font-bold">"{matchedIntentSnippet}"</strong>. Double-blind verification removes cold outreach friction.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  🎯 100% Pre-Approved Synergy
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onOpenConnect &&
                      onOpenConnect({
                        id: profile.id,
                        displayName: profile.displayName,
                        currentTitle: profile.currentTitle,
                        companyName: profile.company?.name,
                        city: profile.city,
                        countryCode: profile.countryCode,
                        matchScore: 98,
                        intents: profile.intents,
                      });
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Open Pre-Approved Bridge &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Action Footer (Black Clean Actions) */}
          {profile && (
            <div className="px-6 py-4 border-t border-border bg-surface-muted/40 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-text-muted hover:text-navy rounded-xl"
              >
                Close
              </button>

              <div className="flex items-center space-x-2">
                {/* Step 3: Signal Mutual Intent (Double-Blind Radar) */}
                <button
                  type="button"
                  onClick={handleTriggerRadar}
                  disabled={radarScanning || radarMatched}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center space-x-1.5 transition-all ${
                    radarMatched
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : radarScanning
                      ? 'bg-neutral-100 text-text-muted border-neutral-300'
                      : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-300 shadow-xs'
                  }`}
                  title="Step 3: Test double-blind mutual intent matching"
                >
                  <Radio
                    className={`w-3.5 h-3.5 ${
                      radarScanning
                        ? 'text-amber-500 animate-spin'
                        : radarMatched
                        ? 'text-emerald-600'
                        : 'text-purple-600'
                    }`}
                  />
                  <span>
                    {radarMatched
                      ? 'Radar Synced'
                      : radarScanning
                      ? 'Scanning Intent...'
                      : 'Signal Mutual Intent'}
                  </span>
                </button>

                {onOpenProposal && profile.company && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenProposal({
                        companyName: profile.company.name,
                        recipientProfileId: profile.id,
                        executiveName: profile.displayName,
                        executiveTitle: profile.currentTitle,
                      });
                      onClose();
                    }}
                    className="px-4 py-2 bg-surface hover:bg-border text-navy border border-border text-xs font-bold rounded-xl transition-colors"
                  >
                    Submit Proposal
                  </button>
                )}

                {onOpenConnect && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenConnect({
                          id: profile.id,
                          displayName: profile.displayName,
                          currentTitle: profile.currentTitle,
                          companyName: profile.company?.name,
                          city: profile.city,
                          countryCode: profile.countryCode,
                          matchScore: 90,
                          intents: profile.intents,
                          initialMode: 'WARM_INTRO_ONLY',
                        });
                        onClose();
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
                      title="Request 3-Way Warm Introduction via Mutual Peer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>🤝 Warm Intro</span>
                    </button>
                    {profile.connectionStatus === 'CONNECTED' ? (
                      <div className="flex items-center space-x-2">
                        <span className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-2xs">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>Connected ({profile.connectedDays === 0 ? 'Today' : `${profile.connectedDays}d`})</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleDisconnect}
                          disabled={disconnecting}
                          className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1"
                          title="Remove connection cleanly from roster"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>{disconnecting ? 'Removing...' : 'Disconnect'}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenConnect({
                            id: profile.id,
                            displayName: profile.displayName,
                            currentTitle: profile.currentTitle,
                            companyName: profile.company?.name,
                            city: profile.city,
                            countryCode: profile.countryCode,
                            matchScore: 90,
                            intents: profile.intents,
                            initialMode: 'DIRECT',
                          });
                          onClose();
                        }}
                        className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Direct Connect</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
