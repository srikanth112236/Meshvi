import { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  Handshake,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  Building2,
} from 'lucide-react';

interface AnimatedProductShowcaseProps {
  onWatchVideoClick?: () => void;
}

export const AnimatedProductShowcase = ({ onWatchVideoClick }: AnimatedProductShowcaseProps) => {
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance loop every 4 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
    }, 4200);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="relative rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none -z-0" />

      {/* Modern Window Title Bar */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[11px] text-slate-400 hidden sm:inline">
            meshvi.com / verified-intent-engine
          </span>
        </div>

        {/* Phase Step Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          {[
            { id: 0, label: '01 · Search Intent' },
            { id: 1, label: '02 · Verified Matches' },
            { id: 2, label: '03 · Private Deal Room' },
          ].map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id as 0 | 1 | 2)}
              className={`px-3 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                activeStep === step.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="hidden md:inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span>DNS Verified</span>
          </span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative z-10 p-6 sm:p-10 min-h-[380px] sm:min-h-[420px] flex flex-col justify-between">
        {/* STEP 0: NATURAL LANGUAGE INTENT SEARCH */}
        {activeStep === 0 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="max-w-xl space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-primary-light">
                Step 1: State the outcome
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Find by What You Need, Not Keywords.
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Describe what your business needs in normal English. Meshvi automatically connects you with verified decision-makers.
              </p>
            </div>

            {/* Glowing Search Bar Simulation */}
            <div className="rounded-2xl p-4 sm:p-5 bg-slate-900/90 border border-primary/40 shadow-xl space-y-3">
              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 text-sm sm:text-base font-semibold text-white font-mono tracking-tight">
                  <span className="text-white">Looking for certified aerospace & titanium forging suppliers with AS9100 Rev D in India or the UK</span>
                  <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="font-mono text-[11px]">Intent: Commercial Sourcing &bull; Cluster: Aerospace &bull; Region: India &amp; UK</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-3 py-1 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>Parse Matches &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: VERIFIED MATCH DOSSIERS */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-400">
                  Step 2: Transparent 100-Point Match
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Verified Decision-Makers. Zero Hallucinations.
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                3 Confirmed Matches
              </span>
            </div>

            {/* Match Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Profile 1 */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Dr. Vikram Malhotra</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <p className="text-[11px] text-slate-400">COO &bull; Bharat Precision Metallurgy</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                    96% Match
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>Bengaluru &bull; AS9100 Rev D</span>
                  </div>
                  <div className="text-emerald-400/90 text-[10px]">
                    Seeking: Tier-1 OEM Supply Contracts
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="w-full py-1.5 bg-primary/20 hover:bg-primary text-white text-[11px] font-bold rounded-lg border border-primary/30 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>Request Handshake</span>
                </button>
              </div>

              {/* Profile 2 */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-primary transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Alistair Sterling</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    </h4>
                    <p className="text-[11px] text-slate-400">VP Supply Chain &bull; Sterling Alloys UK</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary-light text-[10px] font-black border border-primary/30">
                    93% Match
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>Sheffield &bull; Titanium Forging</span>
                  </div>
                  <div className="text-primary-light/90 text-[10px]">
                    Seeking: Asia-Pacific Raw Materials
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg border border-slate-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>Request Handshake</span>
                </button>
              </div>

              {/* Profile 3 */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-primary transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Sarah Jenkins</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    </h4>
                    <p className="text-[11px] text-slate-400">Head of Alliances &bull; Pacific CleanTech</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary-light text-[10px] font-black border border-primary/30">
                    91% Match
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span>Sydney &bull; Clean Energy Grid</span>
                  </div>
                  <div className="text-primary-light/90 text-[10px]">
                    Seeking: Commercial Battery Storage
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg border border-slate-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>Request Handshake</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BILATERAL DEAL ROOM & MNDA */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="max-w-xl space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400">
                Step 3: Direct Commercial Execution
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                From Introduction to Signed Deal in a Private Room.
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Both sides agreed to connect. Keep all promises, agreements, and files safely in one secure room.
              </p>
            </div>

            {/* Deal Room Active Card */}
            <div className="rounded-2xl p-5 sm:p-6 bg-slate-900/90 border border-emerald-500/40 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-emerald-400 font-bold">Deal Room #DR-8821 &bull; Active</div>
                    <div className="text-sm sm:text-base font-bold text-white">Aerospace Titanium Forging Supply Agreement</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center space-x-1">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Mutual NDA Signed</span>
                  </span>
                </div>
              </div>

              {/* Milestones Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">Milestone 2 of 4: Spec &amp; Metallurgy Sample Audit</span>
                  <span className="text-emerald-400 font-mono font-bold">50% Completed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-primary w-1/2 rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono text-slate-400">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Party A</span>
                  <span className="text-white font-bold">Apex Dynamics</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Party B</span>
                  <span className="text-white font-bold">Bharat Precision</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Corridor</span>
                  <span className="text-white font-bold">India &bull; UK</span>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block">Security</span>
                  <span className="text-emerald-400 font-bold">Encrypted Vault</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Banner & Video Call-to-Action */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero cold spam &bull; Both sides must agree &bull; Verified business profiles</span>
          </div>

          <div className="flex items-center space-x-3">
            {onWatchVideoClick && (
              <button
                type="button"
                onClick={onWatchVideoClick}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-light" />
                <span>Watch 30s Animated Video</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveStep(((activeStep + 1) % 3) as 0 | 1 | 2)}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>Next Phase</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
