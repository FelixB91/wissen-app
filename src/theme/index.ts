/** Design tokens: the only place for colors, spacing and font sizes. */

export const colors = {
  background: '#FFFFFF',
  surface: '#F4F5F7',
  border: '#E1E3E8',
  text: '#16181D',
  textSecondary: '#5B616E',
  primary: '#208AEF',
  onPrimary: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fontSizes = {
  small: 14,
  body: 16,
  title: 24,
  hero: 32,
} as const;

export const radii = {
  md: 12,
  lg: 20,
} as const;

/** Maximum content width so tablet and desktop layouts stay readable. */
export const maxContentWidth = 720;

/** Breakpoint (px) from which the tablet layout applies. */
export const tabletBreakpoint = 768;
