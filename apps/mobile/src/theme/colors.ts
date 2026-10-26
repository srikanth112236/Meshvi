export const MeshviColors = {
  primary: '#172B4D',       // Primary Navy
  accent: '#0F766E',        // Action Teal
  accentPressed: '#115E59', // Action Teal Pressed

  background: '#F7F8FA',    // Canvas Background
  surface: '#FFFFFF',       // Card & Sheet Surface
  surfaceMuted: '#F0F4F8',  // Neutral Chip & Inset Surface
  surfaceMint: '#DCEFEA',   // Soft Mint Highlight

  textPrimary: '#172B4D',   // Deep Navy Text
  textSecondary: '#475569', // Slate Secondary Text
  textMuted: '#64748B',     // Slate Muted Text

  border: '#E2E8F0',        // Subtle Divider & Border
  success: '#166534',       // Verified Green
  warning: '#92400E',       // Amber Alert
  danger: '#B42318',        // Crimson Blocked

  white: '#FFFFFF',
};

export const COLORS = {
  // Action Teal Primary & Mint Accents
  primary: MeshviColors.accent,               // '#0F766E' Action Teal
  primaryHover: MeshviColors.accentPressed,    // '#115E59'
  primarySoft: MeshviColors.surfaceMint,      // '#DCEFEA' Soft Mint
  primaryLight: MeshviColors.surfaceMint,     // '#DCEFEA' Soft Mint
  primaryBorder: '#99F6E4',
  primaryGlow: 'rgba(15, 118, 110, 0.12)',

  // Deep Navy Primary Branding
  navy: MeshviColors.primary,                 // '#172B4D' Primary Navy
  navyLight: '#253858',
  navySlate: '#344563',
  obsidian: MeshviColors.primary,

  // Canvas & Surfaces (Light Enterprise Mode)
  background: MeshviColors.background,        // '#F7F8FA'
  backgroundPure: '#FFFFFF',
  surface: MeshviColors.surface,              // '#FFFFFF'
  surfaceMuted: MeshviColors.surfaceMuted,    // '#F0F4F8'
  surfaceSubtle: MeshviColors.background,
  surfaceElevated: '#FFFFFF',
  card: MeshviColors.surface,                 // '#FFFFFF'
  cardAlt: MeshviColors.surfaceMuted,         // '#F0F4F8'

  // Borders & Dividers
  border: MeshviColors.border,                // '#E2E8F0'
  borderLight: '#F1F5F9',
  borderStrong: '#CBD5E1',
  borderPrimary: MeshviColors.surfaceMint,

  // High-Grade Executive Status Colors
  emerald: MeshviColors.success,              // '#166534'
  emeraldSoft: MeshviColors.surfaceMint,      // '#DCEFEA'
  emeraldBorder: '#A7F3D0',
  emeraldText: '#166534',

  rose: MeshviColors.danger,                  // '#B42318'
  roseSoft: '#FEF2F2',
  roseBorder: '#FECDD3',
  roseText: '#991B1B',

  amber: MeshviColors.warning,                // '#92400E'
  amberSoft: '#FEF3C7',
  amberBorder: '#FDE68A',
  amberText: '#92400E',

  sky: MeshviColors.accent,                   // '#0F766E'
  skySoft: MeshviColors.surfaceMint,
  skyBorder: '#99F6E4',

  // Executive Typography Hierarchy
  text: MeshviColors.textPrimary,             // '#172B4D' Deep Navy
  textSecondary: MeshviColors.textSecondary,  // '#475569' Slate
  textMuted: MeshviColors.textMuted,          // '#64748B'
  textLight: '#94A3B8',
  textWhite: '#FFFFFF',
  textInverted: '#FFFFFF',

  white: '#FFFFFF',
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  modal: {
    shadowColor: '#172B4D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
};
