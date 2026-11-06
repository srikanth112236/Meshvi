import { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Handshake,
  Search,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';

interface AnimatedVideoModalProps {
  open: boolean;
  onClose: () => void;
  videoSrc?: string;
}

export const AnimatedVideoModal = ({ open, onClose, videoSrc }: AnimatedVideoModalProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSecond, setCurrentSecond] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [useVideoTag, setUseVideoTag] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setCurrentSecond(0);
      setIsPlaying(true);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Check if an actual video file is provided and playable
  useEffect(() => {
    if (videoSrc) {
      setUseVideoTag(true);
    }
  }, [videoSrc]);

  // Video playback timer (30s animation loop)
  useEffect(() => {
    if (!open || !isPlaying || useVideoTag) return;
    const timer = setInterval(() => {
      setCurrentSecond((prev) => (prev >= 30 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, isPlaying, useVideoTag]);

  if (!open) return null;

  // 4 Video Scenes:
  // 0s - 6s: The Spam Problem
  // 7s - 16s: Natural Language Intent Engine
  // 17s - 24s: Bilateral Double-Opt-In
  // 25s - 30s: Deal Room & Close
  const getScene = () => {
    if (currentSecond <= 6) return 'friction';
    if (currentSecond <= 16) return 'intent';
    if (currentSecond <= 24) return 'handshake';
    return 'dealroom';
  };

  const scene = getScene();

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newSecond = Math.round(percentage * 30);
    setCurrentSecond(newSecond);
    if (videoRef.current) {
      videoRef.current.currentTime = (percentage * (videoRef.current.duration || 30));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">
              MESHVI &bull; Animated Product Film (30s)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-primary-light" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close video (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative aspect-video w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden select-none">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

          {/* Real Video Fallback / Player */}
          {useVideoTag && videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover rounded-2xl"
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentSecond(Math.round(videoRef.current.currentTime));
                }
              }}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <>
              {/* SCENE 1: THE SPAM PROBLEM (0:00 - 0:06) */}
              {scene === 'friction' && (
                <div className="text-center space-y-4 max-w-lg animate-fadeIn z-10">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>The Problem</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    Cold Emails &amp; InMails Are Broken By Noise.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    Automated sales sequences and scrapped contact lists have flooded executive inboxes.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <span className="px-3 py-1 rounded-lg bg-rose-950/60 text-rose-300 font-mono text-xs border border-rose-800/80">
                      +99 Unsolicited InMails
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 font-mono text-xs border border-slate-800">
                      &lt;1% Response Rate
                    </span>
                  </div>
                </div>
              )}

              {/* SCENE 2: THE INTENT ENGINE (0:07 - 0:16) */}
              {scene === 'intent' && (
                <div className="text-center space-y-5 max-w-2xl animate-fadeIn z-10">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary-light text-xs font-bold border border-primary/30">
                    <Search className="w-3.5 h-3.5" />
                    <span>Intent-First Search</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Search Strategic Outcomes.<br />Not Job Titles.
                  </h2>
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-primary/40 shadow-2xl space-y-3 text-left">
                    <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Natural Language Query</div>
                    <div className="text-sm sm:text-base font-semibold text-white font-mono flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                      <span>"Looking for AS9100 Rev D titanium forging suppliers in India or UK"</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Corporate DNS Verified</span>
                      </span>
                      <span className="text-primary-light font-bold">96% Match Confidence</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 3: BILATERAL DOUBLE-OPT-IN (0:17 - 0:24) */}
              {scene === 'handshake' && (
                <div className="text-center space-y-5 max-w-xl animate-fadeIn z-10">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    <Handshake className="w-3.5 h-3.5" />
                    <span>Both Sides Agree First</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Zero Cold Spam.<br />Both Sides Consent First.
                  </h2>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-1">
                      <div className="text-xs font-bold text-white">Your Commercial Note</div>
                      <div className="text-[10px] text-emerald-400 font-mono">Mandatory Business Rationale</div>
                    </div>
                    <div className="text-primary font-bold text-xl">&harr;</div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 text-left space-y-1 shadow-lg shadow-emerald-500/10">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Counterparty Accepted</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">Verified Mutual Consent</div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 4: THE DEAL ROOM (0:25 - 0:30) */}
              {scene === 'dealroom' && (
                <div className="text-center space-y-4 max-w-xl animate-fadeIn z-10">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Executed Deals</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    From Match to Signed Deals in a Private Room.
                  </h2>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 text-left space-y-2.5 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span>Deal Room #DR-8821 &bull; Aerospace Supply</span>
                      </span>
                      <span className="text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>MNDA Executed</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-emerald-400 rounded-full" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Milestone 3 of 4 &bull; Commercial Audit &amp; Escrow Verification
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Video Scrubber & Playback Controls */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/80 flex flex-col gap-2">
          {/* Interactive Timeline Bar */}
          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative cursor-pointer group"
          >
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-200"
              style={{ width: `${(currentSecond / 30) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    if (isPlaying) videoRef.current.pause();
                    else videoRef.current.play();
                  }
                  setIsPlaying(!isPlaying);
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentSecond(0);
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-slate-400 text-[11px]">
                0:{currentSecond < 10 ? `0${currentSecond}` : currentSecond} / 0:30
              </span>
            </div>

            {/* Quick Scene Jump Markers */}
            <div className="hidden sm:flex items-center space-x-1.5 text-[10.5px] font-mono">
              <button
                type="button"
                onClick={() => setCurrentSecond(0)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  scene === 'friction' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Noise
              </button>
              <button
                type="button"
                onClick={() => setCurrentSecond(7)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  scene === 'intent' ? 'bg-primary/20 text-primary-light font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Intent
              </button>
              <button
                type="button"
                onClick={() => setCurrentSecond(17)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  scene === 'handshake' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Double-Opt-In
              </button>
              <button
                type="button"
                onClick={() => setCurrentSecond(25)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  scene === 'dealroom' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                4. Deal Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
