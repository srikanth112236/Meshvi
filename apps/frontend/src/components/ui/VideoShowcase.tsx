import { useState } from 'react';
import {
  Play,
  Sparkles,
  Clock,
  Film,
  Search,
  Building2,
  Users,
} from 'lucide-react';
import { ProductDemoPlayer } from './ProductDemoPlayer';

type TileKind = 'search' | 'company' | 'filters' | 'chat' | 'network' | 'story';

interface DemoTile {
  title: string;
  desc: string;
  chapter: number;
  meta: string;
  badge?: string;
  tone: string;
  kind: TileKind;
}

const DEMO_TILES: DemoTile[] = [
  {
    title: 'Search by mandate',
    desc: 'Describe the outcome — the console parses intent',
    chapter: 1,
    meta: '0:15',
    badge: 'How to search',
    tone: 'from-[#F0F9FF] via-white to-[#E0F2FE]',
    kind: 'search',
  },
  {
    title: 'Search by company',
    desc: 'Typeahead to a verified company dossier',
    chapter: 2,
    meta: '0:15',
    badge: 'How to search',
    tone: 'from-[#F8FAFC] via-white to-[#E0F2FE]',
    kind: 'company',
  },
  {
    title: 'Search with filters',
    desc: 'Layer intent filters — 4,218 people narrow to 24 matches',
    chapter: 3,
    meta: '0:15',
    badge: 'How to search',
    tone: 'from-[#F1F5F9] via-white to-[#E0F2FE]',
    kind: 'filters',
  },
  {
    title: 'Close a connection',
    desc: 'Match → request → accept → relationship in 30s',
    chapter: 4,
    meta: '0:30',
    tone: 'from-[#F0FDF4] via-white to-[#DCFCE7]',
    kind: 'chat',
  },
  {
    title: 'Warm introductions',
    desc: 'A network graph through a mutual peer',
    chapter: 5,
    meta: '0:15',
    tone: 'from-[#FFFBEB] via-white to-[#FEF3C7]',
    kind: 'network',
  },
  {
    title: 'MESHVI in 15 seconds',
    desc: 'The brand film — story, not screenshots',
    chapter: 0,
    meta: '0:15',
    badge: 'Story',
    tone: 'from-[#E0F2FE] via-white to-[#BAE6FD]',
    kind: 'story',
  },
];

const TilePreview = ({ kind }: { kind: TileKind }) => {
  if (kind === 'story') {
    return <img src="/meshvi-logo-full.png" alt="" className="h-5 object-contain" />;
  }

  if (kind === 'search') {
    return (
      <div className="w-32 space-y-1">
        <div className="h-5 rounded-md border border-[#7DD3FC] bg-white flex items-center px-1.5 gap-1 shadow-sm">
          <Search className="w-2 h-2 text-primary" />
          <span className="h-1 flex-1 rounded bg-primary/25" />
        </div>
        <div className="h-1.5 rounded bg-primary/15" />
        <div className="h-1.5 rounded bg-primary/10 w-4/5" />
      </div>
    );
  }

  if (kind === 'company') {
    return (
      <div className="w-32 flex items-center gap-1.5">
        <span className="w-6 h-6 rounded-md bg-primary-soft border border-[#7DD3FC] flex items-center justify-center">
          <Building2 className="w-3 h-3 text-primary" />
        </span>
        <div className="flex-1 space-y-1">
          <span className="block h-1.5 w-3/4 rounded bg-primary/25" />
          <span className="block h-1 w-full rounded bg-navy/10" />
          <span className="block h-1 w-2/3 rounded bg-navy/10" />
        </div>
      </div>
    );
  }

  if (kind === 'filters') {
    return (
      <div className="w-32 space-y-1">
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-8 rounded bg-primary/35" />
          <span className="h-2.5 w-7 rounded bg-primary/20" />
          <span className="h-2.5 w-6 rounded bg-navy/10" />
        </div>
        <div className="h-2.5 rounded border border-[#7DD3FC] bg-white flex items-center px-1.5 gap-1">
          <span className="h-1 flex-1 rounded bg-primary/25" />
          <span className="h-1.5 w-5 rounded bg-primary/20" />
        </div>
        <div className="h-1.5 rounded bg-primary/20" />
        <div className="h-1.5 w-4/5 rounded bg-navy/10" />
      </div>
    );
  }

  if (kind === 'chat') {
    return (
      <div className="w-32 space-y-1">
        <span className="block h-3 w-4/5 rounded-full bg-navy/10 rounded-bl-sm" />
        <span className="ml-auto block h-3 w-3/5 rounded-full bg-[#86EFAC]/60 rounded-br-sm" />
        <span className="block h-2.5 w-2/3 rounded bg-success/15" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="w-5 h-5 rounded-full bg-[#FEF3C7] border border-warning/40 flex items-center justify-center">
        <Users className="w-2.5 h-2.5 text-warning" />
      </span>
      <span className="w-5 h-px bg-warning/40" />
      <span className="w-5 h-5 rounded-full bg-[#FEF3C7] border border-warning/30 flex items-center justify-center text-[6px] font-bold text-warning">
        M
      </span>
      <span className="w-5 h-px bg-warning/40" />
      <span className="w-5 h-5 rounded-full bg-white border border-border flex items-center justify-center text-[6px] font-bold text-navy">
        A
      </span>
    </div>
  );
};

export const VideoShowcase = () => {
  const [open, setOpen] = useState(false);
  const [startAt, setStartAt] = useState(0);
  const [mode, setMode] = useState<'single' | 'full'>('single');

  const playDemo = (chapter: number) => {
    setStartAt(chapter);
    setMode('single');
    setOpen(true);
  };

  const playFullTour = () => {
    setStartAt(0);
    setMode('full');
    setOpen(true);
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-sky-50 text-primary border border-sky-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-navy tracking-tight">Interactive Platform Demos & Video Showcase</h3>
            <p className="text-[11px] text-text-muted truncate">
              6 interactive decision-maker discovery demos &bull; 15s each &bull; 1:30 guided platform tour
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={playFullTour}
          className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
        >
          <Film className="w-3.5 h-3.5" />
          <span>Watch Full Tour (1:30)</span>
        </button>
      </div>

      {/* The tour is its own film — not the six demos stitched together */}
      <button
        type="button"
        onClick={playFullTour}
        className="group w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-50 via-white to-sky-50/60 border border-slate-200/90 hover:border-primary/40 transition-colors p-3.5 sm:p-4 text-left cursor-pointer"
      >
        <div className="absolute -right-6 -top-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-black text-navy">The MESHVI Platform Tour</p>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-primary text-white">Featured</span>
              </div>
              <p className="text-[11px] text-text-muted truncate">
                Full 1:30 cinematic walkthrough &bull; 5 interactive workspace scenes &bull; Audio narration included
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-white/90 border border-slate-200 px-2 py-0.5 rounded-md hidden sm:inline">1:30</span>
            <img
              src="/meshvi-logo-full.png"
              alt="Meshvi"
              className="h-6 object-contain hidden sm:block"
            />
          </div>
        </div>
      </button>

      {/* Six standalone demos — distinct visuals and flows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {DEMO_TILES.map((tile) => (
          <button
            key={tile.title}
            type="button"
            onClick={() => playDemo(tile.chapter)}
            className="group text-left rounded-xl border border-slate-200/90 hover:border-primary/50 overflow-hidden bg-white transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          >
            <div
              className={`relative aspect-[16/10] bg-gradient-to-br ${tile.tone} flex items-center justify-center`}
            >
              <TilePreview kind={tile.kind} />

              <span className="absolute inset-0 flex items-center justify-center bg-navy/0 group-hover:bg-navy/5 transition-colors">
                <span className="w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-border shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3.5 h-3.5 text-primary fill-primary ml-0.5" />
                </span>
              </span>

              {tile.badge && (
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-primary text-white text-[8px] font-black uppercase tracking-wider">
                  {tile.badge}
                </span>
              )}
              <span className="absolute bottom-2 right-2 text-[9px] font-bold text-navy/60 inline-flex items-center space-x-1 font-mono">
                <Clock className="w-2.5 h-2.5" />
                <span>{tile.meta}</span>
              </span>
            </div>
            <div className="p-2.5 space-y-0.5">
              <p className="text-xs font-bold text-navy truncate group-hover:text-primary transition-colors">{tile.title}</p>
              <p className="text-[11px] text-text-muted truncate">{tile.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <ProductDemoPlayer
        open={open}
        initialChapter={startAt}
        mode={mode}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};
