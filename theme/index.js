/**
 * StudyZen Design System
 * Light brown minimalist aesthetic — warm neutrals, beige, terracotta
 */

export const Colors = {
  // Backgrounds
  bg: '#F5EFE6',           // soft warm beige — main background
  bgCard: '#FDF8F2',       // near-white cream — card surfaces
  bgMuted: '#EDE3D8',      // muted beige — input backgrounds

  // Brand
  primary: '#6B4226',      // deep chocolate brown — main actions
  primaryLight: '#8B5E3C', // lighter brown — hover/pressed
  accent: '#C0714F',       // terracotta — highlights, progress

  // Text
  textDark: '#3E2723',     // near-black brown
  textMid: '#6D4C41',      // mid brown body text
  textSoft: '#A1887F',     // soft brown — placeholders, captions

  // UI
  border: '#E0D0C0',       // subtle warm border
  shadow: '#C4A882',       // shadow color for cards
  toggleOn: '#C0714F',     // terracotta toggles
  toggleOff: '#D7C4AF',    // muted off state

  // Status/Accents
  success: '#7A9E7E',      // sage green
  warning: '#D4956A',      // warm orange
  white: '#FFFFFF',
};

export const Typography = {
  fontSizeXS: 11,
  fontSizeSM: 13,
  fontSizeMD: 15,
  fontSizeLG: 18,
  fontSizeXL: 24,
  fontSizeXXL: 32,
  fontSizeHero: 40,

  weightLight: '300',
  weightRegular: '400',
  weightMedium: '500',
  weightSemiBold: '600',
  weightBold: '700',
  weightBlack: '800',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radii = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#C4A882',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  button: {
    shadowColor: '#6B4226',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#C4A882',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
};
