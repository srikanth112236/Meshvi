import { useEffect, useRef, useState } from 'react';
import {
  X,
  Play,
  Pause,
  Search,
  Handshake,
  CheckCircle2,
  Building2,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Users,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowRight,
  Plus,
  Lock,
  Mail,
  Phone,
  CalendarDays,
} from 'lucide-react';

interface AudioKit {
  ctx: AudioContext;
  master: GainNode;
  timer: number;
}

interface Chapter {
  id: string;
  title: string;
  caption: string;
  duration: number;
  beats: { at: number; label: string }[];
}

/* ============================================================
   SIX DEMOS — 15 seconds each, light Meshvi theme.
   Storyboards are authored on a 0–30s scale and played at 2×
   inside the 15s slot so every step still reads clearly.
   ============================================================ */

const DEMO_CHAPTERS: Chapter[] = [
  {
    id: 'story',
    title: 'MESHVI in 15 seconds',
    caption:
      'Meet MESHVI: intent-first B2B relationship discovery. Verified executives, bilateral intent, zero cold spam.',
    duration: 15,
    beats: [
      { at: 0, label: 'Meet MESHVI' },
      { at: 5, label: 'Why MESHVI' },
      { at: 11, label: 'The verified network' },
      { at: 17, label: 'How it works' },
      { at: 24, label: 'Start connecting' },
    ],
  },
  {
    id: 'mandate',
    title: 'Search by mandate',
    caption:
      'HOW TO: describe the outcome you need, press Enter, and review the ranked decision-makers.',
    duration: 15,
    beats: [
      { at: 0, label: 'Step 1 · Describe the outcome' },
      { at: 4, label: 'Type your mandate' },
      { at: 11, label: 'Press Enter' },
      { at: 14, label: 'Intent parsed' },
      { at: 20, label: 'Review ranked matches' },
    ],
  },
  {
    id: 'company',
    title: 'Search by company or person',
    caption:
      'HOW TO: type a company or person, pick from the typeahead, and open the verified profile instantly.',
    duration: 15,
    beats: [
      { at: 0, label: 'Step 1 · Search a name' },
      { at: 3, label: 'Type "Apex"' },
      { at: 7, label: 'Pick from the typeahead' },
      { at: 15, label: 'Open the profile' },
      { at: 20, label: 'Verified dossier' },
    ],
  },
  {
    id: 'filters',
    title: 'Search with intent filters',
    caption:
      'HOW TO: start broad, then layer industry, region, intent and live-signal filters — watch 4,218 people narrow to 24 ranked matches.',
    duration: 15,
    beats: [
      { at: 0, label: 'Step 1 · Start broad' },
      { at: 4, label: 'Industry: FMCG' },
      { at: 8, label: 'Region: APAC' },
      { at: 12, label: 'Intent: Strategic' },
      { at: 16, label: 'Signal: Expansion' },
      { at: 19, label: 'Ranked matches' },
      { at: 25, label: 'Why this match' },
    ],
  },
  {
    id: 'connect',
    title: 'Close a connection',
    caption:
      'HOW TO: find a verified match, attach intent and send a protected request — contact details unlock on acceptance, then the relationship workspace opens.',
    duration: 30,
    beats: [
      { at: 0, label: 'Step 1 · Find the match' },
      { at: 5, label: 'Step 2 · Verified intent + note' },
      { at: 11, label: 'Step 3 · Contact details stay locked' },
      { at: 16, label: 'Step 4 · Request accepted' },
      { at: 21, label: 'Step 5 · Relationship workspace' },
      { at: 27, label: 'Protected end-to-end' },
    ],
  },
  {
    id: 'intro',
    title: 'Warm introductions',
    caption:
      'HOW TO: request an intro through a mutual peer; once accepted, the warm bridge opens with full context.',
    duration: 15,
    beats: [
      { at: 0, label: 'Step 1 · Find a mutual peer' },
      { at: 4, label: 'Select the peer' },
      { at: 8, label: 'Request the intro' },
      { at: 14, label: 'Peer accepts' },
      { at: 19, label: 'Warm bridge opens' },
    ],
  },
];

/* ============================================================
   THE FULL TOUR — a separate film, 5 scenes × 18s = 1:30
   Storyboards stay authored on a 0–30s scale and are compressed
   into the 18s slots, so no content is removed — only time.
   ============================================================ */

const TOUR_CHAPTERS: Chapter[] = [
  {
    id: 'tour-broken',
    title: 'The problem',
    caption: 'Cold outreach is broken. 3% reply rate, 97% ignored — no context, no trust.',
    duration: 18,
    beats: [
      { at: 0, label: 'The problem' },
      { at: 5, label: 'The numbers' },
      { at: 13, label: 'What it costs' },
      { at: 21, label: 'What buyers want' },
    ],
  },
  {
    id: 'tour-intent',
    title: 'The shift',
    caption: 'Intent changes everything. Both sides opt in before anyone is contacted.',
    duration: 18,
    beats: [
      { at: 0, label: 'The shift' },
      { at: 6, label: 'Bilateral intent' },
      { at: 13, label: 'Why it works' },
      { at: 21, label: 'Relevance, not noise' },
    ],
  },
  {
    id: 'tour-network',
    title: 'The network',
    caption: 'A verified network of 4,200+ executives across 38 industries and 26 countries.',
    duration: 18,
    beats: [
      { at: 0, label: 'The network' },
      { at: 4, label: 'Verified people' },
      { at: 15, label: 'Global reach' },
      { at: 21, label: 'Peer-verified' },
    ],
  },
  {
    id: 'tour-flow',
    title: 'How it works',
    caption: 'Describe the outcome. Match verified peers. Connect with context and intent.',
    duration: 18,
    beats: [
      { at: 0, label: 'How it works' },
      { at: 4, label: '01 · Describe' },
      { at: 10, label: '02 · Match' },
      { at: 16, label: '03 · Connect' },
      { at: 24, label: 'Zero guesswork' },
    ],
  },
  {
    id: 'tour-start',
    title: 'Start',
    caption: 'MESHVI — who do you need to connect with? Verified intent. Real relationships.',
    duration: 18,
    beats: [
      { at: 0, label: 'MESHVI' },
      { at: 3, label: 'Who do you need?' },
      { at: 10, label: 'Start connecting' },
      { at: 17, label: 'Verified intent' },
      { at: 24, label: 'Your next move' },
    ],
  },
];

const SPEEDS = [1, 1.4, 2, 3];

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const seg = (t: number, start: number, end: number) =>
  clamp((t - start) / Math.max(0.001, end - start));
const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ---------- Shared primitives (light theme) ---------- */

const Shell = ({ tone, children }: { tone: string; children: React.ReactNode }) => (
  <div className={`absolute inset-0 ${tone}`}>
    <div className="absolute inset-0 p-4 sm:p-7 pb-16 sm:pb-20 flex flex-col justify-center overflow-hidden">
      {children}
    </div>
  </div>
);

/* Modern app-window frame used by all six product demos. */
const Frame = ({
  tone,
  breadcrumb,
  badge,
  children,
}: {
  tone: string;
  breadcrumb: string;
  badge?: string;
  children: React.ReactNode;
}) => (
  <div className={`absolute inset-0 ${tone}`}>
    <div
      className="absolute inset-0 opacity-50"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(16,42,67,0.10) 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    />
    <div className="absolute inset-0 p-3 pb-16 sm:p-5 sm:pb-20">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/85 shadow-[0_24px_70px_rgba(16,42,67,0.12)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-border/70 bg-white/80 px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex shrink-0 gap-1">
              <span className="h-2 w-2 rounded-full bg-[#FCA5A5]" />
              <span className="h-2 w-2 rounded-full bg-[#FCD34D]" />
              <span className="h-2 w-2 rounded-full bg-[#86EFAC]" />
            </span>
            <span className="ml-1 truncate text-[9px] font-semibold text-text-muted sm:text-[10px]">
              app.meshvi.org <span className="text-border">/</span>{' '}
              <span className="font-bold text-navy">{breadcrumb}</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {badge && (
              <span className="hidden items-center gap-1 rounded-full border border-border bg-white px-2 py-0.5 text-[8px] font-bold text-text-muted sm:inline-flex">
                {badge}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[8px] font-bold text-success">
              <ShieldCheck className="h-2.5 w-2.5" />
              Verified
            </span>
            <img src="/meshvi-mark.png" alt="" className="h-4 w-4 object-contain" />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-3 sm:p-4">{children}</div>
      </div>
    </div>
  </div>
);

const Kicker = ({ children, tone = 'text-primary' }: { children: React.ReactNode; tone?: string }) => (
  <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${tone}`}>{children}</p>
);

const Caret = () => (
  <span className="inline-block w-px h-3 bg-primary ml-0.5 align-middle animate-pulse" />
);

const StepStrip = ({
  steps,
  t,
  times,
}: {
  steps: string[];
  t: number;
  times: number[];
}) => (
  <div className="flex flex-wrap items-center gap-1">
    {steps.map((s, i) => {
      const done = t >= times[i];
      const current = !done && (i === 0 || t >= times[i - 1]);
      return (
        <span
          key={s}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] font-semibold transition-colors ${
            done
              ? 'bg-[#DCFCE7] text-success border-[#86EFAC]'
              : current
                ? 'bg-primary-soft text-primary border-[#7DD3FC]'
                : 'bg-surface-muted text-text-muted border-border'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white/70 flex items-center justify-center text-[7px] leading-none">
            {done ? '✓' : i + 1}
          </span>
          {s}
        </span>
      );
    })}
  </div>
);

/* Demo canvas: every demo is designed at 1152×648 and scaled like a real video,
   so the composition never clips on smaller players. */
const STAGE_W = 1152;
const STAGE_H = 648;

const ScaledStage = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setScale(Math.min(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-white">
      <div
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* ============================================================
   DEMO 1 — BRAND FILM
   ============================================================ */

const StoryScreen = ({ t }: { t: number }) => {
  const brand = seg(t, 0, 2.5);
  const cards = seg(t, 5, 6);
  const nodes = seg(t, 11, 13);
  const steps = seg(t, 17, 19);
  const closing = t >= 24;

  return (
    <Frame
      tone="bg-gradient-to-br from-[#F0F9FF] via-white to-[#E0F2FE]"
      breadcrumb="MESHVI / Brand"
      badge="Brand film"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center">
        <div style={{ opacity: brand, transform: `translateY(${(1 - brand) * 12}px)` }}>
          <img
            src="/meshvi-logo-full.png"
            alt="Meshvi"
            className="mx-auto h-12 object-contain sm:h-14"
          />
          <p className="mt-1.5 text-[12px] text-text-muted">Who do you need to connect with?</p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-3 gap-2.5">
          {[
            { icon: ShieldCheck, title: 'Verified executives', sub: 'Peer-verified decision makers' },
            { icon: Handshake, title: 'Bilateral intent', sub: 'Both sides opt in first' },
            { icon: Zap, title: 'Zero cold spam', sub: 'No scraping, no noise' },
          ].map(({ icon: Icon, title, sub }, i) => (
            <div
              key={title}
              className="rounded-xl border border-border/80 bg-white p-3 text-left shadow-sm"
              style={{ opacity: clamp((cards - i * 0.25) * 3) }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <p className="mt-2 text-[11px] font-bold text-navy">{title}</p>
              <p className="text-[9px] text-text-muted">{sub}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2" style={{ opacity: nodes }}>
          {['You', 'Peer', 'Partner'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="text-center">
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-[10px] font-bold text-navy shadow-sm">
                  {label[0]}
                </span>
                <span className="mt-1 block text-[8px] text-text-muted">{label}</span>
              </div>
              {i < 2 && <span className="mb-4 h-0.5 w-8 rounded bg-primary/30" />}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5" style={{ opacity: steps }}>
          {['1 · Describe intent', '2 · Match verified peers', '3 · Connect with context'].map((step) => (
            <span
              key={step}
              className="rounded-full border border-border bg-white px-2.5 py-1 text-[9px] font-semibold text-text-muted"
            >
              {step}
            </span>
          ))}
        </div>

        <p
          className={`text-[11px] font-bold text-success transition-opacity duration-500 ${
            closing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          B2B relationship discovery, reimagined.
        </p>
      </div>
    </Frame>
  );
};

/* ============================================================
   DEMO 2 — COMMAND CONSOLE (search by mandate)
   ============================================================ */

const MANDATE_ROWS = [
  { name: 'Apex Industries Ltd', meta: 'Enterprise gateway · Singapore', fit: 94 },
  { name: 'NovaPay Systems', meta: 'Payments platform · Jakarta', fit: 88 },
  { name: 'Meridian Fintech', meta: 'Digital banking · Sydney', fit: 83 },
  { name: 'Bayside Commerce', meta: 'Retail treasury · Bangkok', fit: 79 },
];

const MandateScreen = ({ t }: { t: number }) => {
  const query = 'Enterprise fintech gateway with APAC expansion';
  const typed = query.slice(0, Math.floor(seg(t, 4, 10) * query.length));
  const submitted = t >= 11;
  const parsed = t >= 14;
  const results = t >= 20;
  const highlight = t >= 27;

  return (
    <Frame
      tone="bg-gradient-to-br from-[#F8FAFC] via-white to-[#E0F2FE]"
      breadcrumb="Search / Mandate"
      badge="Intent engine"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary">
            Search by mandate
          </p>
          <h3 className="mt-0.5 text-base font-black text-navy">Describe the outcome you need</h3>
        </div>
        <StepStrip
          steps={['Describe', 'Press Enter', 'Review matches']}
          t={t}
          times={[4, 11, 20]}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.55fr_1fr] gap-3">
        <div className="flex min-h-0 flex-col gap-2.5">
          <div
            className={`rounded-xl border bg-white px-4 py-3 shadow-sm transition-all ${
              submitted ? 'border-primary ring-4 ring-primary/10' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 shrink-0 text-primary" />
              <span className="truncate text-[13px] font-medium text-navy">
                {typed || <span className="text-text-muted">Describe the outcome you need…</span>}
                {typed && !submitted && <Caret />}
              </span>
              <kbd className="ml-auto shrink-0 rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[9px] font-black text-text-muted">
                ⏎
              </kbd>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border/80 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between px-1 pb-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">
                Ranked matches
              </p>
              <span className="text-[9px] font-semibold text-text-muted">
                {results
                  ? '4 of 1,284 · by bilateral fit'
                  : submitted
                    ? 'Searching…'
                    : 'Waiting for mandate'}
              </span>
            </div>

            <div className="space-y-2">
              {MANDATE_ROWS.map((row, i) => {
                const appear = results ? seg(t, 20 + i * 1.6, 21.4 + i * 1.6) : 0;
                const hot = highlight && i === 0;

                return results ? (
                  <div
                    key={row.name}
                    className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
                      hot ? 'border-[#BBF7D0] bg-[#F0FDF4]' : 'border-border/70 bg-white'
                    }`}
                    style={{ opacity: appear, transform: `translateY(${(1 - appear) * 8}px)` }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-[9px] font-black text-primary">
                      {row.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-navy">{row.name}</p>
                      <p className="truncate text-[9px] text-text-muted">{row.meta}</p>
                    </div>
                    <div className="w-20 shrink-0 text-right">
                      <p className={`text-[11px] font-black ${hot ? 'text-success' : 'text-primary'}`}>
                        {row.fit}%
                      </p>
                      <div className="mt-0.5 h-1 rounded-full bg-surface-muted">
                        <span
                          className={`block h-full rounded-full ${hot ? 'bg-success' : 'bg-primary'}`}
                          style={{ width: `${row.fit}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={row.name}
                    className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-surface-muted/30 px-2.5 py-2"
                  >
                    <span className="h-7 w-7 shrink-0 animate-pulse rounded-lg bg-surface-muted" />
                    <div className="flex-1 space-y-1.5">
                      <span className="block h-2 w-2/3 animate-pulse rounded bg-surface-muted" />
                      <span className="block h-1.5 w-1/2 animate-pulse rounded bg-surface-muted" />
                    </div>
                    <span className="h-2 w-8 animate-pulse rounded bg-surface-muted" />
                  </div>
                );
              })}
            </div>

            {results && (
              <p className="mt-auto pt-2 text-[9px] text-text-muted">
                Ranked by role, region, intent and live signals — not keywords.
              </p>
            )}
            {!results && (
              <p className="mt-auto pt-2 text-[9px] text-text-muted">
                Scanning 4,218 verified profiles…
              </p>
            )}
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-2.5">
          <div className="rounded-xl border border-border/80 bg-white p-3 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">
              Parsed intent
            </p>
            <div className="mt-2 space-y-2">
              {[
                ['Role', 'Enterprise'],
                ['Region', 'APAC'],
                ['Goal', 'Expansion'],
                ['Fit threshold', '80%+'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-[9px] uppercase tracking-wide text-text-muted">{label}</span>
                  {parsed ? (
                    <span className="rounded-md border border-[#BAE6FD] bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold text-primary">
                      {value}
                    </span>
                  ) : (
                    <span className="h-3 w-14 animate-pulse rounded bg-surface-muted" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-surface-muted/40 p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">
              Why it works
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
              Natural language becomes structured intent, then ranks verified decision-makers by
              bilateral fit.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-white p-3 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">
              Signals checked
            </p>
            <div className="mt-2 space-y-1.5">
              {['Role & seniority', 'Region & corridor', 'Stated intent', 'Live expansion signals'].map(
                (signal) => (
                  <div key={signal} className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3 w-3 ${parsed ? 'text-success' : 'text-border'}`}
                    />
                    <span className={`text-[9px] ${parsed ? 'text-navy' : 'text-text-muted'}`}>
                      {signal}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mt-auto rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-primary">Tip</p>
            <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
              Add a region, role or goal to sharpen the match. Press ⏎ to run.
            </p>
          </div>
        </aside>
      </div>
    </Frame>
  );
};

/* ============================================================
   DEMO 3 — PROFILE DOSSIER (search by company)
   ============================================================ */

const CompanyScreen = ({ t }: { t: number }) => {
  const typed = 'Apex'.slice(0, Math.floor(seg(t, 3, 6) * 4));
  const showSuggest = t >= 7 && t < 15;
  const dossier = t >= 15;

  const suggestions = [
    { name: 'Apex Industries Ltd', meta: 'Company · Singapore · 94% fit', icon: Building2 },
    { name: 'Apex Pacific Holdings', meta: 'Company · Sydney · 87% fit', icon: Building2 },
    { name: 'Priya Raman', meta: 'Group Director · Apex Industries', icon: Users },
  ];

  return (
    <Frame
      tone="bg-gradient-to-br from-[#F8FAFC] via-white to-[#E0F2FE]"
      breadcrumb="Search / Company"
      badge="Verified directory"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary">
            Search by company or person
          </p>
          <h3 className="mt-0.5 text-base font-black text-navy">Type a name, open the verified profile</h3>
        </div>
        <StepStrip
          steps={['Type a name', 'Pick a result', 'Open profile']}
          t={t}
          times={[3, 12, 15]}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.1fr_1fr] gap-3">
        <div className="flex min-h-0 flex-col gap-2.5">
          <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 shrink-0 text-primary" />
              <span className="truncate text-[13px] font-medium text-navy">
                {typed || <span className="text-text-muted">Company or person…</span>}
                {typed && !dossier && <Caret />}
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-border/80 bg-white p-3 shadow-sm">
            <p className="px-1 pb-2 text-[9px] font-black uppercase tracking-wider text-text-muted">
              {showSuggest ? 'Suggestions' : dossier ? 'Selected result' : 'Start typing'}
            </p>
            <div className="space-y-1.5">
              {suggestions.map((row, i) => {
                const appear = t >= 7 ? seg(t, 7 + i * 0.8, 8.4 + i * 0.8) : 0.4;
                const selected = t >= 12 && i === 0;
                const Icon = row.icon;
                return (
                  <div
                    key={row.name}
                    className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors ${
                      selected ? 'border-[#BAE6FD] bg-primary-soft' : 'border-border/60 bg-white'
                    }`}
                    style={{ opacity: appear }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-muted">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-bold text-navy">{row.name}</p>
                      <p className="truncate text-[9px] text-text-muted">{row.meta}</p>
                    </div>
                    {selected && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 rounded-lg border border-border/60 bg-surface-muted/40 p-2.5">
              <p className="text-[8px] font-black uppercase tracking-wider text-text-muted">Tip</p>
              <p className="mt-1 text-[9px] leading-relaxed text-text-muted">
                Search by company, person or domain. Only verified profiles appear.
              </p>
            </div>

            <p className="mt-auto pt-2 text-[9px] text-text-muted">
              Verified profiles only — no scraped contacts.
            </p>
          </div>
        </div>

        <aside className="min-h-0">
          <div
            className={`flex h-full flex-col rounded-xl border bg-white p-3.5 shadow-sm ${
              dossier ? 'border-border/80' : 'border-dashed border-border'
            }`}
          >
            {dossier ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#BAE6FD] bg-primary-soft text-[13px] font-black text-primary">
                    AI
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-[13px] font-black text-navy">Apex Industries Ltd</p>
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-1.5 py-0.5 text-[8px] font-bold text-success">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Verified
                      </span>
                    </div>
                    <p className="text-[9px] text-text-muted">
                      Enterprise gateway · Singapore · 94% fit
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {[
                    ['Revenue', '$2.4B'],
                    ['Region', 'APAC'],
                    ['Intent', 'Expansion'],
                  ].map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-surface-muted/60 px-2 py-1.5">
                      <p className="text-[8px] uppercase text-text-muted">{key}</p>
                      <p className="text-[10px] font-bold text-navy">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-lg border border-border/70 bg-surface-muted/30 p-2.5">
                  <p className="text-[8px] font-black uppercase tracking-wider text-text-muted">
                    Why you match
                  </p>
                  <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
                    Reciprocal APAC expansion intent and a verified enterprise gateway portfolio.
                  </p>
                </div>

                <div className="mt-3 rounded-lg border border-border/70 bg-white p-2.5">
                  <p className="text-[8px] font-black uppercase tracking-wider text-text-muted">
                    Intent signals
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {['APAC expansion', 'Channel partnerships', 'Enterprise gateway'].map((signal) => (
                      <span
                        key={signal}
                        className="rounded-full border border-border bg-surface-muted/50 px-2 py-0.5 text-[8px] text-text-muted"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[9px] text-text-muted">
                  <Users className="h-3 w-3 text-primary" />
                  <span>3 mutual peers · verified by 2</span>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-2">
                  <ShieldCheck className="h-3 w-3 shrink-0 text-success" />
                  <span className="text-[9px] font-semibold text-success">
                    Domain verified · Companies House · 2 peer endorsements
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  <span className="text-[9px] text-text-muted">Decision-maker · verified profile</span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[9px] font-bold text-white">
                    Open profile
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-text-muted">
                  <Building2 className="h-5 w-5" />
                </span>
                <p className="text-[11px] font-bold text-navy">No profile selected</p>
                <p className="max-w-[220px] text-[9px] text-text-muted">
                  Pick a company or person to open the verified dossier.
                </p>
                <div className="mt-2 w-full space-y-1.5 opacity-60">
                  <span className="mx-auto block h-2 w-3/4 animate-pulse rounded bg-surface-muted" />
                  <span className="mx-auto block h-2 w-1/2 animate-pulse rounded bg-surface-muted" />
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </Frame>
  );
};

/* ============================================================
   DEMO 4 — INTENT FILTERS (live refining search)
   ============================================================ */

const FILTER_STEPS = [
  { key: 'Industry', value: 'FMCG', at: 4 },
  { key: 'Region', value: 'APAC', at: 8 },
  { key: 'Intent', value: 'Strategic', at: 12 },
  { key: 'Signal', value: 'Expansion', at: 16 },
];

const FILTER_RESULTS = [
  { name: 'Apex Industries Ltd', meta: 'Enterprise gateway · Singapore', base: 61, final: 94, initials: 'AI' },
  { name: 'Northwind Retail Group', meta: 'FMCG distribution · SEA', base: 57, final: 89, initials: 'NR' },
  { name: 'Chirp Beverages', meta: 'Cold brew · Jakarta', base: 53, final: 83, initials: 'CB' },
];

// 4,218 people narrow to 24 as each intent filter lands.
const matchCountAt = (t: number) => {
  const steps = [
    { at: 4, from: 4218, to: 1240 },
    { at: 8, from: 1240, to: 386 },
    { at: 12, from: 386, to: 92 },
    { at: 16, from: 92, to: 24 },
  ];
  let value = 4218;
  for (const step of steps) {
    if (t < step.at) break;
    const p = seg(t, step.at, step.at + 1.4);
    const eased = 1 - Math.pow(1 - p, 3);
    value = Math.round(step.from + (step.to - step.from) * eased);
  }
  return value;
};

const FiltersScreen = ({ t }: { t: number }) => {
  const query = 'distribution partners in APAC';
  const typed = query.slice(0, Math.floor(seg(t, 0, 2.2) * query.length));
  const typedDone = typed.length === query.length;
  const count = matchCountAt(t);
  const refining = t >= 3 && t < 17;
  const ranked = t >= 17;
  const showWhy = t >= 22;
  const scoreProgress = 1 - Math.pow(1 - seg(t, 4, 17), 2);

  const funnel = [
    { label: 'All people', value: 4218, at: 0 },
    { label: '+ Industry', value: 1240, at: 4 },
    { label: '+ Region', value: 386, at: 8 },
    { label: '+ Intent', value: 92, at: 12 },
    { label: '+ Signal', value: 24, at: 16 },
  ];

  return (
    <Frame
      tone="bg-gradient-to-br from-[#F8FAFC] via-white to-[#E0F2FE]"
      breadcrumb="Search / Filters"
      badge="Live refining"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary">
            Search with intent filters
          </p>
          <h3 className="mt-0.5 text-base font-black text-navy">Layer filters, watch the matches sharpen</h3>
        </div>
        <StepStrip
          steps={['Start broad', 'Layer filters', 'Ranked matches']}
          t={t}
          times={[0, 4, 17]}
        />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 shadow-sm">
        <Search className="h-5 w-5 shrink-0 text-primary" />
        <span className="truncate text-[13px] font-medium text-navy">
          {typed || <span className="text-text-muted">Search people, companies, intent…</span>}
          {!typedDone && <Caret />}
        </span>
        <span
          className={`ml-auto shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-black tabular-nums transition-colors ${
            ranked
              ? 'border-[#BBF7D0] bg-[#F0FDF4] text-success'
              : 'border-[#BAE6FD] bg-primary-soft text-primary'
          }`}
        >
          {count.toLocaleString()} {ranked ? 'matches' : 'people'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-0.5 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-text-muted">
          <SlidersHorizontal className="h-3 w-3 text-primary" />
          Filters
        </span>
        {FILTER_STEPS.map((f, i) => {
          const on = t >= f.at;
          const pulse = on && t < f.at + 0.9;
          return (
            <span
              key={f.key}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] transition-all duration-300 ${
                on
                  ? 'border-[#BAE6FD] bg-primary-soft text-primary shadow-sm'
                  : 'border-dashed border-border bg-white text-text-muted'
              } ${pulse ? 'scale-105' : 'scale-100'}`}
              style={{ opacity: on ? 1 : clamp(seg(t, 0.4 + i * 0.15, 1.1 + i * 0.15)) }}
            >
              {on ? (
                <>
                  <span className="text-[8px] font-black uppercase text-primary/60">{f.key}</span>
                  <span className="font-bold">{f.value}</span>
                  <X className="h-2.5 w-2.5 text-primary/60" />
                </>
              ) : (
                <>
                  <Plus className="h-2.5 w-2.5" />
                  {f.key}
                </>
              )}
            </span>
          );
        })}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.5fr_1fr] gap-3">
        <div className="flex min-h-0 flex-col rounded-xl border border-border/80 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">
              {ranked ? 'Ranked by bilateral intent fit' : 'Refining matches…'}
            </p>
            {refining && (
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                live signals
              </span>
            )}
            {ranked && (
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-success">
                <CheckCircle2 className="h-3 w-3" />
                top 24 of 4,218
              </span>
            )}
          </div>

          <div className="space-y-2">
            {FILTER_RESULTS.map((r, i) => {
              const appear = seg(t, 2.6 + i * 0.5, 3.4 + i * 0.5);
              const score = Math.round(r.base + (r.final - r.base) * scoreProgress);
              const top = ranked && i === 0;
              return (
                <div
                  key={r.name}
                  className={`rounded-lg border px-2.5 py-2 transition-colors ${
                    top ? 'border-[#BBF7D0] bg-[#F0FDF4]' : 'border-border/70 bg-white'
                  }`}
                  style={{ opacity: appear, transform: `translateY(${(1 - appear) * 8}px)` }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 shrink-0 text-[9px] font-black ${top ? 'text-success' : 'text-text-muted'}`}>
                      {i + 1}
                    </span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[8px] font-black ${
                        top
                          ? 'border-[#BBF7D0] bg-[#F0FDF4] text-success'
                          : 'border-[#BAE6FD] bg-primary-soft text-primary'
                      }`}
                    >
                      {r.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="truncate text-[11px] font-bold text-navy">{r.name}</p>
                        <CheckCircle2 className={`h-3 w-3 shrink-0 ${top ? 'text-success' : 'text-primary'}`} />
                      </div>
                      <p className="truncate text-[9px] text-text-muted">{r.meta}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {FILTER_STEPS.map((f) =>
                          t >= f.at ? (
                            <span
                              key={f.key}
                              className={`rounded border px-1 py-[1px] text-[7px] font-bold ${
                                top
                                  ? 'border-[#BBF7D0] bg-white/70 text-success'
                                  : 'border-border bg-surface-muted text-text-muted'
                              }`}
                            >
                              {f.value}
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>
                    <div className="w-14 shrink-0 text-right">
                      <p className={`text-[11px] font-black tabular-nums ${top ? 'text-success' : 'text-primary'}`}>
                        {score}%
                      </p>
                      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-surface-muted">
                        <span
                          className={`block h-full transition-all duration-200 ${top ? 'bg-success' : 'bg-primary'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {top && showWhy && (
                    <p className="mt-1 pl-5 text-[8px] font-semibold text-success">
                      Why: APAC expansion signal · strategic distribution intent · 94% bilateral fit
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="flex min-h-0 flex-col rounded-xl border border-border/80 bg-white p-3 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">
            Refinement funnel
          </p>
          <div className="mt-2 space-y-2.5">
            {funnel.map((step) => {
              const applied = t >= step.at;
              const width = Math.max(4, Math.sqrt(step.value / 4218) * 100);
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-semibold ${applied ? 'text-navy' : 'text-text-muted'}`}>
                      {step.label}
                    </span>
                    <span className={`text-[9px] font-black tabular-nums ${applied ? 'text-primary' : 'text-text-muted'}`}>
                      {step.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className={`block h-full rounded-full transition-all duration-500 ${
                        step.value === 24 ? 'bg-success' : 'bg-primary'
                      }`}
                      style={{ width: `${applied ? width : 0}%`, opacity: applied ? 1 : 0 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto rounded-lg border border-[#BAE6FD] bg-[#F0F9FF] p-2.5">
            <p className="text-[8px] font-black uppercase tracking-wider text-primary">Live signals</p>
            <p className="mt-1 text-[9px] leading-relaxed text-text-muted">
              Every filter is a verified signal — hiring, expansion, intent. No guessing.
            </p>
          </div>
        </aside>
      </div>
    </Frame>
  );
};

/* ============================================================
   DEMO 5 — CONNECT JOURNEY (match → request → privacy → relationship)
   ============================================================ */

const JOURNEY = [
  { label: 'Match', at: 0 },
  { label: 'Request', at: 5 },
  { label: 'Privacy', at: 11 },
  { label: 'Accept', at: 16 },
  { label: 'Deal', at: 21 },
];

const ContactRows = ({ unlocked }: { unlocked: boolean }) => (
  <div className="overflow-hidden rounded-lg border border-border/70">
    {[
      { icon: Mail, label: 'Email', masked: '••••••••@apexindustries.com', real: 'priya.raman@apexindustries.com' },
      { icon: Phone, label: 'Phone', masked: '+65 •••• ••••', real: '+65 8123 4477' },
      { icon: CalendarDays, label: 'Calendar', masked: 'cal.meshvi/••••••', real: 'cal.meshvi/priya-raman' },
    ].map(({ icon: Icon, label, masked, real }, index) => (
      <div
        key={label}
        className={`flex items-center gap-2 px-2.5 py-1.5 ${index > 0 ? 'border-t border-border/50' : ''}`}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
            unlocked ? 'bg-[#F0FDF4] text-success' : 'bg-surface-muted text-text-muted'
          }`}
        >
          <Icon className="h-2.5 w-2.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[7px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
          <p className={`truncate text-[9px] font-semibold ${unlocked ? 'text-navy' : 'text-text-muted'}`}>
            {unlocked ? real : masked}
          </p>
        </div>
        {unlocked ? (
          <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
        ) : (
          <Lock className="h-3 w-3 shrink-0 text-warning" />
        )}
      </div>
    ))}
  </div>
);

const ConnectScreen = ({ t }: { t: number }) => {
  const message = 'Would you explore a joint APAC distribution partnership?';
  const typed = message.slice(0, Math.floor(seg(t, 6, 9.2) * message.length));
  const typedDone = typed.length === message.length;
  const selected = t >= 2.4;
  const pressing = t >= 9.4 && t < 10.2;
  const sent = t >= 10;
  const unlocked = t >= 18;

  const helper =
    t < 5
      ? 'Start from a verified match — no guessing.'
      : t < 11
        ? 'Attach verified intent and a short note.'
        : t < 16
          ? 'Contact details stay locked until they accept.'
          : t < 21
            ? 'Accepted — verified details unlock with consent.'
            : 'Now it is a real relationship, not a cold request.';

  return (
    <Frame
      tone="bg-gradient-to-br from-[#F7FAFC] via-white to-[#F0FDF4]"
      breadcrumb="Connections / Request"
      badge="Protected intro"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary">
            Close a connection
          </p>
          <h3 className="mt-0.5 text-base font-black text-navy">From verified match to real relationship</h3>
        </div>

        <div className="flex items-center">
          {JOURNEY.map((step, i) => {
            const nextAt = JOURNEY[i + 1]?.at ?? 99;
            const done = t >= nextAt;
            const active = t >= step.at && !done;
            return (
              <div key={step.label} className={`flex items-center ${i < JOURNEY.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[6px] font-black transition-colors ${
                      done
                        ? 'bg-success text-white'
                        : active
                          ? 'bg-primary text-white'
                          : 'border border-border bg-surface-muted text-text-muted'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <span
                    className={`text-[8px] font-bold ${
                      active ? 'text-primary' : done ? 'text-success' : 'text-text-muted'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < JOURNEY.length - 1 && (
                  <span className={`mx-1 h-px w-5 ${done ? 'bg-success/30' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.5fr_1fr] gap-3">
        <div className="flex min-h-0 flex-col gap-2">
          <p className="px-0.5 text-[10px] text-text-muted">{helper}</p>

          {/* Stage 1 — find the verified match */}
          {t < 5 && (
            <div
              className="flex flex-1 flex-col justify-center gap-3 rounded-2xl border border-border/80 bg-white p-4 shadow-sm"
              style={{ opacity: seg(t, 0, 0.7) }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#BAE6FD] bg-gradient-to-br from-primary-soft to-white text-[13px] font-black text-primary">
                  AI
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[14px] font-bold text-navy">Apex Industries Ltd</p>
                    <span className="inline-flex shrink-0 items-center gap-0.5 text-[8px] font-bold text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  </div>
                  <p className="truncate text-[10px] text-text-muted">
                    Enterprise gateway · Singapore · 94% fit
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {['FMCG', 'APAC', 'Expansion'].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-surface-muted px-2 py-0.5 text-[8px] font-semibold text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    className={`rounded-lg px-3 py-2 text-[10px] font-bold transition-all ${
                      selected
                        ? 'border border-[#BBF7D0] bg-[#F0FDF4] text-success'
                        : 'bg-primary text-white shadow-sm'
                    }`}
                  >
                    {selected ? '✓ Connect' : 'Connect'}
                  </button>
                  {!selected && t >= 1.6 && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-primary" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-surface-muted/60 px-3 py-2 text-[9px] text-text-muted">
                <ShieldCheck className="h-3 w-3 shrink-0 text-success" />
                <span>Mutual intent is checked before anyone can contact you.</span>
              </div>

              <p className={`text-[9px] font-semibold text-primary ${selected ? 'opacity-100' : 'opacity-0'}`}>
                Protected request opened — no contact details shared yet.
              </p>
            </div>
          )}

          {/* Stage 2 — request with verified intent */}
          {t >= 5 && t < 11 && (
            <div
              className="flex flex-1 flex-col gap-2.5 rounded-2xl border border-border/80 bg-white p-4 shadow-sm"
              style={{ opacity: seg(t, 5, 5.7) }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-navy">Connection request</p>
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[8px] font-bold text-primary">
                  Bilateral intent
                </span>
              </div>

              <div className="rounded-xl border border-primary/10 bg-primary-soft/50 px-3 py-2">
                <p className="text-[7px] font-bold uppercase tracking-wider text-primary/70">
                  Verified intent
                </p>
                <p className="text-[10px] font-semibold text-navy">
                  Joint APAC distribution partnership · cold-brew retail
                </p>
              </div>

              <div className="min-h-[42px] flex-1 rounded-xl border border-border/80 bg-surface-muted/30 px-3 py-2.5">
                <p className="text-[10px] text-navy">
                  {typed || <span className="text-text-muted">Add a short note…</span>}
                  {!typedDone && <Caret />}
                </p>
              </div>

              <p className="flex items-center gap-1.5 text-[9px] text-text-muted">
                <Lock className="h-3 w-3 text-warning" />
                Contact details stay private until they accept.
              </p>

              <div
                className={`rounded-xl py-2.5 text-center text-[10px] font-bold transition-all ${
                  sent
                    ? 'border border-[#BBF7D0] bg-[#F0FDF4] text-success'
                    : 'bg-primary text-white shadow-sm'
                } ${pressing ? 'scale-[0.98]' : ''}`}
              >
                {sent ? '✓ Request sent' : 'Send connection request'}
              </div>
            </div>
          )}

          {/* Stage 3 — waiting for acceptance */}
          {t >= 11 && t < 16 && (
            <div
              className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-border/80 bg-white p-4 text-center shadow-sm"
              style={{ opacity: seg(t, 11, 11.7) }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#FDE68A] bg-[#FFFBEB]">
                <Lock className="h-5 w-5 text-warning" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-navy">Request sent — waiting for acceptance</p>
                <p className="mt-1 text-[10px] text-text-muted">
                  Priya Raman · Group Director, Apex Industries Ltd
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-surface-muted/70 px-3 py-1.5 text-[9px] font-semibold text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Contact details stay locked until she accepts
              </div>
              <p className="max-w-sm text-[9px] leading-relaxed text-text-muted">
                MESHVI brokers the introduction. No scraping, no leaks — details unlock the moment
                both sides consent.
              </p>
            </div>
          )}

          {/* Stage 4 — accepted */}
          {t >= 16 && t < 21 && (
            <div
              className="flex flex-1 flex-col justify-center gap-3 rounded-2xl border border-[#BBF7D0] bg-white p-4 shadow-sm"
              style={{ opacity: seg(t, 16, 16.7) }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#BBF7D0] bg-[#F0FDF4]">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-navy">Priya Raman accepted</p>
                  <p className="text-[9px] text-text-muted">Group Director · Apex Industries Ltd</p>
                </div>
                <span className="shrink-0 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[8px] font-bold text-success">
                  Connected
                </span>
              </div>

              <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4]/60 p-3">
                <p className="text-[10px] font-bold text-success">Verified details unlocked with consent</p>
                <p className="mt-1 text-[9px] leading-relaxed text-text-muted">
                  Email, phone and calendar are now visible in the consent panel — no scraping, no
                  guesswork.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-surface-muted/50 px-3 py-2">
                <span className="text-[9px] font-semibold text-navy">Next: open the relationship workspace</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
          )}

          {/* Stage 5 — relationship workspace */}
          {t >= 21 && (
            <div
              className="flex flex-1 flex-col gap-2.5 rounded-2xl border border-border/80 bg-white p-4 shadow-sm"
              style={{ opacity: seg(t, 21, 21.8) }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-navy">Relationship workspace</p>
                  <p className="text-[9px] text-text-muted">Apex Industries · shared deal room</p>
                </div>
                <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[8px] font-bold text-success">
                  Deal room open
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-start">
                  <div className="max-w-[82%] rounded-2xl rounded-bl-md bg-surface-muted px-3 py-1.5">
                    <p className="text-[10px] text-navy">Happy to explore. Thursday 3pm works?</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[82%] rounded-2xl rounded-br-md border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1.5">
                    <p className="text-[10px] text-[#14532D]">Booked — sending the deck now.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-surface-muted/50 px-3 py-2">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                <p className="text-[10px] font-semibold text-navy">Intro call · Thu, 3:00 PM SGT</p>
                <span className="ml-auto text-[8px] font-semibold text-success">Confirmed</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['Share deck', 'Add to pipeline', 'Schedule follow-up'].map((action) => (
                  <span
                    key={action}
                    className="rounded-full border border-border bg-white px-2.5 py-1 text-[8px] font-semibold text-navy"
                  >
                    {action}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between rounded-xl border border-border/70 bg-surface-muted/40 px-3 py-2">
                <span className="text-[9px] font-semibold text-navy">Deal room · 3 files · 2 members</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary">
                  Open workspace
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>

              <p className="text-[9px] text-text-muted" style={{ opacity: seg(t, 26, 27) }}>
                From verified match to real relationship — protected at every step.
              </p>
            </div>
          )}
        </div>

        {/* Consent & details panel — persistent across the journey */}
        <aside className="flex min-h-0 flex-col gap-2.5">
          <div className="rounded-xl border border-border/80 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">
                Contact details
              </p>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold ${
                  unlocked
                    ? 'border-[#BBF7D0] bg-[#F0FDF4] text-success'
                    : 'border-[#FDE68A] bg-[#FFFBEB] text-warning'
                }`}
              >
                {unlocked ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Lock className="h-2.5 w-2.5" />}
                {unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
            <div className="mt-2">
              <ContactRows unlocked={unlocked} />
            </div>
            <p className="mt-2 text-[9px] leading-relaxed text-text-muted">
              Shared only after both sides accept. No scraping, no leaks.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-white p-3 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">
              Consent timeline
            </p>
            <div className="mt-2 space-y-2">
              {[
                ['Request sent', 5],
                ['Intent verified', 5],
                ['Accepted', 16],
                ['Details unlocked', 18],
              ].map(([label, at]) => {
                const done = t >= (at as number);
                return (
                  <div key={label as string} className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[7px] font-black ${
                        done ? 'bg-success text-white' : 'border border-border bg-surface-muted text-text-muted'
                      }`}
                    >
                      {done ? '✓' : '·'}
                    </span>
                    <span className={`text-[9px] font-semibold ${done ? 'text-navy' : 'text-text-muted'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-auto rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] p-3">
            <p className="text-[9px] font-bold text-primary">Protected by design</p>
            <p className="mt-1 text-[9px] leading-relaxed text-text-muted">
              You control every step. Details unlock only with explicit consent.
            </p>
          </div>
        </aside>
      </div>
    </Frame>
  );
};

/* ============================================================
   DEMO 6 — NETWORK GRAPH (warm introductions)
   ============================================================ */

const IntroScreen = ({ t }: { t: number }) => {
  const nodesIn = seg(t, 0, 2);
  const peerPick = t >= 4;
  const requestIn = t >= 8;
  const accepted = t >= 14;
  const bridge = t >= 19;

  return (
    <Frame
      tone="bg-gradient-to-br from-[#FFFBEB] via-white to-[#FEF3C7]"
      breadcrumb="Introductions / Warm path"
      badge="Peer brokered"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary">
            Warm introductions
          </p>
          <h3 className="mt-0.5 text-base font-black text-navy">Reach the right person through a mutual peer</h3>
        </div>
        <StepStrip
          steps={['Pick mutual peer', 'Request intro', 'Bridge opens']}
          t={t}
          times={[4, 8, 19]}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.15fr_1fr] gap-3">
        <div className="flex min-h-0 flex-col rounded-xl border border-border/80 bg-white p-3 shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">
            Path through your network
          </p>

          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center" style={{ opacity: nodesIn }}>
              {[
                { label: 'You', sub: 'Verified member', active: false },
                { label: 'Mutual peer', sub: '2 shared connections', active: peerPick },
                { label: 'Target', sub: 'Apex Industries', active: bridge },
              ].map((node, i) => (
                <div key={node.label} className="flex flex-col items-center">
                  <div className="text-center">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-full border text-[12px] font-black transition-all duration-300 ${
                        node.active
                          ? i === 1
                            ? 'border-[#FDE68A] bg-[#FFFBEB] text-warning shadow-[0_0_0_6px_rgba(253,230,138,0.35)]'
                            : 'border-[#BBF7D0] bg-[#F0FDF4] text-success shadow-[0_0_0_6px_rgba(187,247,208,0.35)]'
                          : 'border-border bg-white text-navy shadow-sm'
                      }`}
                    >
                      {node.label[0]}
                    </span>
                    <p className="mt-1 text-[10px] font-bold text-navy">{node.label}</p>
                    <p className="text-[8px] text-text-muted">{node.sub}</p>
                  </div>

                  {i < 2 && (
                    <div className="my-1.5 h-10 w-0.5 overflow-hidden rounded-full bg-border">
                      <span
                        className={`block w-full ${i === 0 ? 'bg-warning/70' : 'bg-success/70'}`}
                        style={{
                          height: `${seg(t, 9 + i * 4, 12 + i * 4) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[9px] text-text-muted">
            {bridge ? 'Warm bridge open — shared context attached' : 'Verified peer path · no cold outreach'}
          </p>
        </div>

        <aside className="flex min-h-0 flex-col gap-2.5">
          {!bridge ? (
            <div
              className="flex flex-1 flex-col gap-2.5 rounded-xl border border-border/80 bg-white p-3 shadow-sm"
              style={{ opacity: seg(t, 8, 9) }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-navy">Intro request</p>
                <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[8px] font-bold text-primary">
                  Peer brokered
                </span>
              </div>

              <div className="rounded-lg border border-border/70 bg-surface-muted/40 p-2.5">
                <p className="text-[9px] text-navy">
                  “Would you introduce me to Apex Industries? Verified joint expansion intent.”
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-surface-muted/60 px-2.5 py-2 text-[9px] text-text-muted">
                <ShieldCheck className="h-3 w-3 shrink-0 text-success" />
                <span>Your peer sees the intent before accepting.</span>
              </div>

              <div className="mt-auto">
                {accepted ? (
                  <div className="flex items-center justify-center gap-1.5 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] py-2 text-[10px] font-bold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mutual peer accepted
                  </div>
                ) : (
                  <div className="rounded-lg bg-primary py-2 text-center text-[10px] font-bold text-white">
                    Request introduction
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="flex flex-1 flex-col gap-2.5 rounded-xl border border-[#BBF7D0] bg-white p-3 shadow-sm"
              style={{ opacity: seg(t, 19, 20.5) }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-navy">Warm bridge opened</p>
                <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-2 py-0.5 text-[8px] font-bold text-success">
                  Connected
                </span>
              </div>

              <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4]/60 p-2.5">
                <p className="text-[9px] font-bold text-success">Shared context attached</p>
                <p className="mt-1 text-[9px] leading-relaxed text-text-muted">
                  APAC distribution · strategic intent · 94% fit · verified by your mutual peer.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-surface-muted/50 px-2.5 py-2">
                <span className="text-[9px] font-semibold text-navy">Open the conversation</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
              </div>

              <div className="rounded-lg border border-border/60 bg-surface-muted/40 p-2.5">
                <p className="text-[8px] font-black uppercase tracking-wider text-text-muted">
                  Note from your peer
                </p>
                <p className="mt-1 text-[9px] leading-relaxed text-navy">
                  “Happy to introduce you — strong fit on APAC distribution.”
                </p>
              </div>

              <p className="mt-auto text-[9px] text-text-muted">
                Warm, contextual and consented — the way intros should work.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-border/80 bg-white p-3 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">
              How warm intros work
            </p>
            <div className="mt-2 space-y-1.5">
              {[
                ['Pick a verified mutual peer', peerPick],
                ['They review your intent', requestIn],
                ['The bridge opens with context', bridge],
              ].map(([label, done]) => (
                <div key={label as string} className="flex items-center gap-2">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[7px] font-black ${
                      done ? 'bg-success text-white' : 'border border-border bg-surface-muted text-text-muted'
                    }`}
                  >
                    {done ? '✓' : '·'}
                  </span>
                  <span className={`text-[9px] font-semibold ${done ? 'text-navy' : 'text-text-muted'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Frame>
  );
};

/* ============================================================
   THE FULL TOUR — a separate cinematic film, 5 scenes × 18s
   ============================================================ */

const TourBroken = ({ t }: { t: number }) => (
  <Shell tone="bg-white">
    <div className="text-center space-y-4">
      <Kicker tone="text-danger">The problem</Kicker>
      <h2 className="text-2xl sm:text-4xl font-black text-navy leading-[1.05]">
        Cold outreach
        <br />
        is broken.
      </h2>
      <div
        className="flex items-center justify-center gap-8 sm:gap-12"
        style={{ opacity: seg(t, 5, 8) }}
      >
        {[
          ['3%', 'reply rate', 'text-danger'],
          ['97%', 'ignored', 'text-navy'],
          ['0', 'shared context', 'text-text-muted'],
        ].map(([n, l, c]) => (
          <div key={l}>
            <p className={`text-lg sm:text-2xl font-black ${c}`}>{n}</p>
            <p className="text-[8px] uppercase tracking-wider text-text-muted">{l}</p>
          </div>
        ))}
      </div>
      <div
        className="max-w-sm mx-auto rounded-xl border border-border bg-surface-muted px-3 py-2"
        style={{ opacity: seg(t, 13, 15) }}
      >
        <p className="text-[9px] text-text-muted">
          Every ignored message costs time, budget and trust.
        </p>
      </div>
      <p
        className="text-[9px] font-semibold text-navy max-w-xs mx-auto"
        style={{ opacity: seg(t, 21, 23) }}
      >
        Buyers don't want more noise. They want relevance.
      </p>
    </div>
  </Shell>
);

const TourIntent = ({ t }: { t: number }) => (
  <Shell tone="bg-gradient-to-br from-[#F0F9FF] via-white to-[#E0F2FE]">
    <div className="text-center space-y-4">
      <Kicker>The shift</Kicker>
      <h2 className="text-2xl sm:text-4xl font-black text-navy leading-[1.05]">
        Intent changes
        <br />
        everything.
      </h2>
      <div
        className="flex items-center justify-center gap-3 sm:gap-4"
        style={{ opacity: seg(t, 6, 8) }}
      >
        <span className="px-2.5 py-1.5 rounded-full bg-white border border-border text-[9px] font-bold text-navy shadow-sm">
          What you offer
        </span>
        <div className="relative w-10 sm:w-14 h-px bg-primary/40">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
        </div>
        <span className="px-2.5 py-1.5 rounded-full bg-primary-soft border border-[#7DD3FC] text-[9px] font-bold text-primary">
          What they need
        </span>
      </div>
      <div
        className="max-w-sm mx-auto rounded-xl border border-border bg-white px-3 py-2 shadow-sm"
        style={{ opacity: seg(t, 13, 15) }}
      >
        <p className="text-[9px] text-text-muted">
          Bilateral intent — both sides opt in before anyone is contacted.
        </p>
      </div>
      <div
        className="flex items-center justify-center gap-2 max-w-sm mx-auto"
        style={{ opacity: seg(t, 21, 23) }}
      >
        <span className="flex-1 rounded-lg bg-surface-muted border border-border px-2 py-1.5 text-[8px] text-text-muted">
          Cold outreach · guessing
        </span>
        <ArrowRight className="w-3 h-3 text-primary shrink-0" />
        <span className="flex-1 rounded-lg bg-primary-soft border border-[#7DD3FC] px-2 py-1.5 text-[8px] font-semibold text-primary">
          MESHVI · mutual intent
        </span>
      </div>
    </div>
  </Shell>
);

const TourNetwork = ({ t }: { t: number }) => (
  <Shell tone="bg-white">
    <div className="text-center space-y-4">
      <Kicker>The network</Kicker>
      <h2 className="text-2xl sm:text-4xl font-black text-navy leading-[1.05]">
        A verified
        <br />
        network.
      </h2>
      <div className="grid grid-cols-4 gap-1.5 max-w-xs sm:max-w-sm mx-auto">
        {['AP', 'NP', 'MF', 'AX', 'BR', 'KL', 'SD', 'VT'].map((s, i) => (
          <span
            key={s}
            className="h-7 sm:h-8 rounded-md bg-white border border-border flex items-center justify-center text-[8px] font-bold text-navy shadow-sm"
            style={{ opacity: seg(t, 4 + i * 0.7, 5.4 + i * 0.7) }}
          >
            {s}
          </span>
        ))}
      </div>
      <p className="text-[9px] text-text-muted" style={{ opacity: seg(t, 15, 17) }}>
        4,200+ verified executives · 38 industries · 26 countries
      </p>
      <div
        className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] border border-[#86EFAC] px-2.5 py-1"
        style={{ opacity: seg(t, 21, 23) }}
      >
        <ShieldCheck className="w-3 h-3 text-success" />
        <p className="text-[8px] font-semibold text-success">Verified by peers, not scraped</p>
      </div>
    </div>
  </Shell>
);

const TourFlow = ({ t }: { t: number }) => (
  <Shell tone="bg-gradient-to-br from-[#F0FDF4] via-white to-white">
    <div className="space-y-4 text-center">
      <Kicker tone="text-success">How it works</Kicker>
      <h2 className="text-xl sm:text-3xl font-black text-navy">Describe. Match. Connect.</h2>
      <div className="space-y-2 max-w-sm mx-auto">
        {[
          ['01', 'Describe', 'the outcome you need'],
          ['02', 'Match', 'verified peers, ranked by fit'],
          ['03', 'Connect', 'with context and intent'],
        ].map(([n, title, sub], i) => {
          const a = seg(t, 4 + i * 6, 6 + i * 6);
          return (
            <div
              key={n}
              className="flex items-center gap-3 text-left rounded-lg bg-white border border-border px-2.5 py-1.5 shadow-sm"
              style={{ opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}
            >
              <span className="text-base font-black text-success/40">{n}</span>
              <div>
                <p className="text-[11px] font-black text-navy">{title}</p>
                <p className="text-[8px] text-text-muted">{sub}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] font-semibold text-success" style={{ opacity: seg(t, 24, 26) }}>
        Zero cold spam. Zero guesswork.
      </p>
    </div>
  </Shell>
);

const TourStart = ({ t }: { t: number }) => (
  <Shell tone="bg-gradient-to-br from-[#F0F9FF] via-white to-[#E0F2FE]">
    <div className="text-center space-y-3">
      <div
        className="relative inline-flex items-center justify-center"
        style={{ opacity: seg(t, 0, 2) }}
      >
        <span className="absolute w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
        <img
          src="/meshvi-logo-full.png"
          alt="Meshvi"
          className="relative h-8 sm:h-10 object-contain"
        />
      </div>
      <h2 className="text-xl sm:text-3xl font-black text-navy leading-tight">
        Who do you need
        <br />
        to connect with?
      </h2>
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-[10px] font-black transition-all duration-500"
        style={{
          opacity: seg(t, 10, 12),
          transform: `translateY(${(1 - seg(t, 10, 12)) * 8}px)`,
        }}
      >
        Start connecting <ArrowRight className="w-3 h-3" />
      </span>
      <p className="text-[8px] text-text-muted" style={{ opacity: seg(t, 17, 19) }}>
        Verified intent. Real relationships. Zero cold spam.
      </p>
      <p
        className="text-[8px] font-black uppercase tracking-[0.3em] text-primary"
        style={{ opacity: seg(t, 24, 26) }}
      >
        MESHVI
      </p>
    </div>
  </Shell>
);

/* ---------- Screen routing ---------- */

const DemoScreen = ({ chapter, t }: { chapter: Chapter; t: number }) => {
  switch (chapter.id) {
    case 'story':
      return <StoryScreen t={t} />;
    case 'mandate':
      return <MandateScreen t={t} />;
    case 'company':
      return <CompanyScreen t={t} />;
    case 'filters':
      return <FiltersScreen t={t} />;
    case 'connect':
      return <ConnectScreen t={t} />;
    case 'intro':
      return <IntroScreen t={t} />;
    default:
      return null;
  }
};

const TourScene = ({ chapter, t }: { chapter: Chapter; t: number }) => {
  switch (chapter.id) {
    case 'tour-broken':
      return <TourBroken t={t} />;
    case 'tour-intent':
      return <TourIntent t={t} />;
    case 'tour-network':
      return <TourNetwork t={t} />;
    case 'tour-flow':
      return <TourFlow t={t} />;
    case 'tour-start':
      return <TourStart t={t} />;
    default:
      return null;
  }
};

/* ---------- Player ---------- */

interface ProductDemoPlayerProps {
  open: boolean;
  initialChapter?: number;
  /** 'single' = one 15s demo; 'full' = the separate 2:30 tour. */
  mode?: 'single' | 'full';
  onClose: () => void;
}

export const ProductDemoPlayer = ({
  open,
  initialChapter = 0,
  mode = 'full',
  onClose,
}: ProductDemoPlayerProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(() => localStorage.getItem('setu_demo_muted') === '1');
  const [isFs, setIsFs] = useState(false);

  const audioRef = useRef<AudioKit | null>(null);
  const speedRef = useRef(1);
  const screenRef = useRef<HTMLDivElement | null>(null);

  const isFull = mode === 'full';
  const selectedDemo = Math.min(Math.max(initialChapter, 0), DEMO_CHAPTERS.length - 1);
  const list = isFull ? TOUR_CHAPTERS : [DEMO_CHAPTERS[selectedDemo]];
  const total = list.reduce((sum, c) => sum + c.duration, 0);

  // Current scene + local time on a continuous timeline
  let sceneIndex = 0;
  let sceneStart = 0;
  for (let i = 0; i < list.length; i++) {
    if (elapsed >= sceneStart) sceneIndex = i;
    sceneStart += list[i].duration;
  }
  sceneStart = list
    .slice(0, sceneIndex)
    .reduce((sum, c) => sum + c.duration, 0);
  const chapter = list[sceneIndex];
  const localT = Math.max(0, Math.min(elapsed - sceneStart, chapter.duration));
  // Storyboards are authored on a 30s scale — compressed to each chapter's slot
  const boardT = localT * (30 / chapter.duration);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  /* ---------- Generated music (no external files) ---------- */

  const ensureAudio = (): AudioKit | null => {
    if (audioRef.current) {
      const kit = audioRef.current;
      if (kit.ctx.state === 'closed') {
        audioRef.current = null;
      } else {
        if (kit.ctx.state === 'suspended') void kit.ctx.resume();
        return kit;
      }
    }

    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;

    const ctx = new AudioCtor();
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    const mix = ctx.createBiquadFilter();
    mix.type = 'lowpass';
    mix.frequency.value = 3200;
    mix.Q.value = 0.4;
    mix.connect(master);

    const tone = (
      freq: number,
      at: number,
      dur: number,
      vol: number,
      type: OscillatorType
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(vol, at + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(gain);
      gain.connect(mix);
      osc.start(at);
      osc.stop(at + dur + 0.05);
    };

    const kick = (at: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, at);
      osc.frequency.exponentialRampToValueAtTime(50, at + 0.12);
      gain.gain.setValueAtTime(0.2, at);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
      osc.connect(gain);
      gain.connect(mix);
      osc.start(at);
      osc.stop(at + 0.25);
    };

    const chords = [
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 349.23],
      [130.81, 196.0, 246.94, 329.63],
      [196.0, 246.94, 293.66, 392.0],
    ];
    const eighth = 60 / 92 / 2;
    const state = { next: ctx.currentTime + 0.08, step: 0 };

    const schedule = () => {
      if (ctx.state !== 'running') return;
      if (state.next < ctx.currentTime) state.next = ctx.currentTime + 0.03;
      while (state.next < ctx.currentTime + 0.2) {
        const bar = Math.floor(state.step / 8) % chords.length;
        const chord = chords[bar];
        const local = state.step % 8;

        if (local === 0) {
          chord.forEach((f) => tone(f / 2, state.next, eighth * 7.4, 0.03, 'sine'));
          tone(chord[0] / 2, state.next, 0.65, 0.075, 'sine');
        }
        if (local === 4) tone(chord[0] / 2, state.next, 0.5, 0.06, 'sine');
        if (local === 0 || local === 3 || local === 6) kick(state.next);

        const arp = chord[(local + state.step) % chord.length] * 2;
        tone(arp, state.next, 0.24, 0.026, 'triangle');

        state.next += eighth;
        state.step += 1;
      }
    };

    schedule();
    const timer = window.setInterval(schedule, 60);

    audioRef.current = { ctx, master, timer };
    return audioRef.current;
  };

  const playChime = (freq: number) => {
    const kit = audioRef.current;
    if (!kit) return;
    const { ctx, master } = kit;
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    osc.stop(now + 1);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem('setu_demo_muted', next ? '1' : '0');
    if (next) {
      void audioRef.current?.ctx.suspend();
    } else {
      const kit = ensureAudio();
      void kit?.ctx.resume();
    }
  };

  /* ---------- Clock, timeline, lifecycle ---------- */

  useEffect(() => {
    if (!open) return;
    setElapsed(0);
    setPlaying(true);
    // The full tour opens at 2×; individual demos open at 1×.
    setSpeed(isFull ? 2 : 1);
  }, [open, initialChapter, mode, isFull]);

  useEffect(() => {
    if (!open || !playing) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      acc += (now - last) / 1000;
      last = now;
      if (acc >= 1 / 60) {
        const step = acc;
        acc = 0;
        setElapsed((e) => e + step * speedRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, playing]);

  // Continuous loop when the video ends
  useEffect(() => {
    if (!open) return;
    if (elapsed >= total) setElapsed(0);
  }, [elapsed, open, total]);

  useEffect(() => {
    if (!open) return;
    if (muted || !playing) {
      void audioRef.current?.ctx.suspend();
      return;
    }
    const kit = ensureAudio();
    void kit?.ctx.resume();
  }, [open, muted, playing]);

  useEffect(() => {
    if (open) return;
    void audioRef.current?.ctx.suspend();
  }, [open]);

  useEffect(() => {
    if (!open || muted) return;
    playChime(520 + sceneIndex * 40);
  }, [open, sceneIndex, muted]);

  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(
    () => () => {
      const kit = audioRef.current;
      if (kit) {
        window.clearInterval(kit.timer);
        void kit.ctx.close();
      }
    },
    []
  );

  const handleClose = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || document.fullscreenElement) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const progress = clamp(elapsed / total);
  const beat = chapter.beats.reduce((acc, b) => (boardT >= b.at ? b : acc), chapter.beats[0]);

  const cycleSpeed = () => {
    setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void screenRef.current?.requestFullscreen();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-navy/45 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-6xl bg-white border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={() => {
          if (!muted) {
            const kit = ensureAudio();
            void kit?.ctx.resume();
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="flex items-center space-x-2 min-w-0">
            <img
              src="/meshvi-logo-full.png"
              alt="Meshvi"
              className="h-4 object-contain shrink-0"
            />
            <span className="h-3 w-px bg-border shrink-0" />
            <p className="text-[10px] font-semibold text-navy truncate">
              {isFull ? 'The MESHVI tour' : chapter.title}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="text-text-muted hover:text-navy p-1 rounded-md hover:bg-surface-muted transition-colors"
              aria-label={isFs ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFs ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="text-text-muted hover:text-navy p-1 rounded-md hover:bg-surface-muted transition-colors"
              aria-label="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video surface */}
        <div ref={screenRef} className="relative aspect-video bg-white overflow-hidden">
          {isFull ? (
            <TourScene chapter={chapter} t={boardT} />
          ) : (
            <ScaledStage>
              <DemoScreen chapter={chapter} t={boardT} />
            </ScaledStage>
          )}

          {!playing && (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-navy/10"
              aria-label="Play"
            >
              <span className="w-12 h-12 rounded-full bg-white shadow-lg border border-border flex items-center justify-center">
                <Play className="w-5 h-5 text-primary fill-primary" />
              </span>
            </button>
          )}

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white via-white/85 to-transparent px-4 pb-2 pt-5 pointer-events-none">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-primary">
              {beat.label}
            </p>
            <p className="text-[10px] text-text-muted line-clamp-1">{chapter.caption}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 py-3 space-y-2.5 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
              <span
                className="block h-full bg-primary"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-bold tabular-nums text-text-muted shrink-0">
              {fmt(elapsed)} / {fmt(total)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-colors"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              <button
                type="button"
                onClick={cycleSpeed}
                className="ml-1 px-2 py-1 rounded-md text-[10px] font-bold text-text-muted hover:text-navy hover:bg-surface-muted transition-colors flex items-center space-x-1"
                aria-label={`Playback speed ${speed}x`}
              >
                <Zap className="w-3 h-3" />
                <span>{speed}×</span>
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="px-2 py-1 rounded-md text-text-muted hover:text-navy hover:bg-surface-muted transition-colors"
                aria-label={muted ? 'Unmute demo sound' : 'Mute demo sound'}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            <span className="text-[9px] font-semibold text-text-muted">
              {isFull ? 'Full tour · 5 scenes · 1:30 · 2× default' : `Demo · ${fmt(total)} · 1× default`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
