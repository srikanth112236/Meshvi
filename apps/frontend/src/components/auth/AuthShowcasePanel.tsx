import React from 'react';
import { ShieldCheck, Sparkles, Building2, Users, CheckCircle2 } from 'lucide-react';

export const AuthShowcasePanel: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[620px] rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col justify-between p-8 sm:p-10 lg:p-12 select-none bg-gradient-to-b from-[#eaf2ff] via-[#d1e3fd] to-[#6a9ef8] border border-blue-200/40 shadow-inner">
      {/* Ambient background soft glow orbs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-blue-600/15 to-transparent pointer-events-none" />

      {/* Top Text Content */}
      <div className="relative z-10 max-w-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 border border-white/60 text-slate-800 text-[11px] font-bold shadow-2xs mb-3 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#078BCC]" />
          <span>Verified Executive Directory</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-slate-900 tracking-tight leading-[1.18]">
          Connect with Verified<br />
          Enterprise Leaders
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed font-normal">
          Directly reach verified CXOs, procurement heads, and decision makers. Spam-free executive matchmaking with mutual consent.
        </p>
      </div>

      {/* 3D Isometric Tile Grid & Floating 3D Logo Block */}
      <div className="absolute top-6 -right-12 sm:top-10 sm:-right-8 lg:top-8 lg:-right-4 w-[380px] h-[360px] sm:w-[440px] sm:h-[400px] pointer-events-none z-0">
        <div
          className="relative w-full h-full"
          style={{
            transform: 'perspective(1200px) rotateX(56deg) rotateZ(-36deg) skewX(2deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Glass Tiles Grid (Background Layer) */}
          <div className="grid grid-cols-3 gap-3.5 sm:gap-4 p-4">
            {/* Tile 1 */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/25 border border-white/60 shadow-[0_8px_20px_rgba(255,255,255,0.4)_inset,0_10px_25px_rgba(0,0,0,0.03)] backdrop-blur-md" />
            
            {/* Tile 2 (Under the floating block) */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/30 border border-white/70 shadow-[0_8px_20px_rgba(255,255,255,0.5)_inset,0_10px_25px_rgba(0,0,0,0.03)] backdrop-blur-md">
              {/* Cast shadow from the floating block above */}
              <div className="absolute inset-0 bg-blue-700/35 rounded-2xl sm:rounded-3xl blur-md transform translate-y-3 scale-95" />
            </div>

            {/* Tile 3 */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/20 border border-white/50 shadow-[0_8px_20px_rgba(255,255,255,0.3)_inset] backdrop-blur-md" />

            {/* Tile 4 */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/25 border border-white/60 shadow-[0_8px_20px_rgba(255,255,255,0.4)_inset] backdrop-blur-md" />

            {/* Tile 5 */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/30 border border-white/60 shadow-[0_8px_20px_rgba(255,255,255,0.4)_inset] backdrop-blur-md" />

            {/* Tile 6 */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/20 border border-white/50 shadow-[0_8px_20px_rgba(255,255,255,0.3)_inset] backdrop-blur-md" />

            {/* Tile 7 */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/15 border border-white/40 shadow-xs backdrop-blur-md" />

            {/* Tile 8 */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/20 border border-white/40 shadow-xs backdrop-blur-md" />

            {/* Tile 9 */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/15 border border-white/30 shadow-xs backdrop-blur-md" />
          </div>

          {/* Elevated 3D Cobalt Blue Block with Glowing Meshvi Mark */}
          <div
            className="absolute top-4 left-[118px] sm:top-5 sm:left-[136px] w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex items-center justify-center transition-transform"
            style={{
              transform: 'translateZ(38px)',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 55%, #1e3a8a 100%)',
              boxShadow: '0 24px 45px -8px rgba(29, 78, 216, 0.65), 0 10px 20px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -4px 8px rgba(0, 0, 0, 0.3)',
              border: '1.5px solid rgba(147, 197, 253, 0.7)',
            }}
          >
            {/* Glossy specular top reflection */}
            <div className="absolute top-1 inset-x-2 h-4 rounded-t-xl bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

            {/* Central White Mark (Meshvi Logo Mark) */}
            <div className="relative z-10 w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
              <img
                src="/meshvi-mark.png"
                alt="Meshvi Logo Mark"
                className="w-full h-full object-contain brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Frosted Glass Live Match Cards */}
      <div className="relative z-10 space-y-2.5 sm:space-y-3 mt-12 sm:mt-16">
        {/* Card 1: Active Executive Match */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/60 shadow-[0_8px_25px_rgba(15,23,42,0.06),0_1px_2px_rgba(255,255,255,0.6)_inset] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition-all hover:bg-white/50 group">
          <div className="flex items-center space-x-3 overflow-hidden pr-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#142B45] to-[#078BCC] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs sm:text-[13px] truncate">
                Procurement Head & Sourcing VP
              </div>
              <p className="text-[10.5px] text-slate-600 truncate mt-0.5">
                Global Enterprise Network &bull; 96% Match Fit
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10.5px] font-bold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Verified Peer</span>
          </div>
        </div>

        {/* Card 2: Enterprise Deal Room */}
        <div className="backdrop-blur-xl bg-white/30 border border-white/45 shadow-[0_8px_20px_rgba(15,23,42,0.04),0_1px_2px_rgba(255,255,255,0.4)_inset] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition-all hover:bg-white/40">
          <div className="flex items-center space-x-3 overflow-hidden pr-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/80 border border-white text-[#078BCC] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              <Building2 className="w-4 h-4 text-[#078BCC]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs sm:text-[13px] truncate">
                Enterprise Cloud & AI Director
              </div>
              <p className="text-[10.5px] text-slate-600 truncate mt-0.5">
                Infosys &bull; 2 Active Deal Rooms
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-[10.5px] font-bold text-blue-800">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Direct Access</span>
          </div>
        </div>

        {/* Card 3: Mutual Direct Connection */}
        <div className="backdrop-blur-xl bg-white/25 border border-white/35 shadow-[0_8px_20px_rgba(15,23,42,0.03)] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between transition-all opacity-95">
          <div className="flex items-center space-x-3 overflow-hidden pr-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-xs truncate">
                VP Strategic Partnerships
              </div>
              <p className="text-[10px] text-slate-600 truncate">
                Direct communication coordinates unlocked
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 shrink-0 px-2 py-0.5 rounded-full bg-white/60 text-[10px] font-bold text-slate-700 border border-white">
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
