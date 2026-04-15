import { Platform } from 'react-native';

// ─── Palette tokens ──────────────────────────────────────────────────────────

export type AppPalette = {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceBorder: string;

  // Brand / accent
  accent: string;
  accentDim: string;
  accentBorder: string;
  accentGlow: string; // shadow color

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Semantic
  error: string;
  success: string;
  warning: string;

  // Material type badges
  badgeExam: string;
  badgeNotes: string;
  badgeExercises: string;

  // Tab bar
  tabBackground: string;
  tabBorder: string;
  tabActive: string;
  tabInactive: string;

  // Misc
  isDark: boolean;
};

// Dark — derived from the Desktop terminal screenshots:
// pure black bg, #1fc8fc cyan accent, dark panels
export const darkPalette: AppPalette = {
  background: '#0a0a0a',
  surface: '#131313',
  surfaceElevated: '#1c1c1c',
  surfaceBorder: '#252525',

  accent: '#1fc8fc',
  accentDim: 'rgba(31,200,252,0.10)',
  accentBorder: 'rgba(31,200,252,0.30)',
  accentGlow: 'rgba(31,200,252,0.45)',

  textPrimary: '#e6e6e6',
  textSecondary: '#7a7a8a',
  textMuted: '#444455',

  error: '#e05252',
  success: '#3ecf8e',
  warning: '#f5a623',

  badgeExam: '#e05252',
  badgeNotes: '#3ecf8e',
  badgeExercises: '#f5a623',

  tabBackground: '#0e0e0e',
  tabBorder: '#1e1e1e',
  tabActive: '#1fc8fc',
  tabInactive: '#484858',

  isDark: true,
};

// Light — warm off-white + slate (matches the mockup light frames) with cyan accent
export const lightPalette: AppPalette = {
  background: '#f5f3f0',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceBorder: '#e0ddd8',

  accent: '#0099cc',
  accentDim: 'rgba(0,153,204,0.08)',
  accentBorder: 'rgba(0,153,204,0.25)',
  accentGlow: 'rgba(0,153,204,0.20)',

  textPrimary: '#111111',
  textSecondary: '#666677',
  textMuted: '#aaaaaa',

  error: '#c0392b',
  success: '#27ae60',
  warning: '#e67e22',

  badgeExam: '#c0392b',
  badgeNotes: '#27ae60',
  badgeExercises: '#e67e22',

  tabBackground: '#ffffff',
  tabBorder: '#e0ddd8',
  tabActive: '#0099cc',
  tabInactive: '#aaaaaa',

  isDark: false,
};

// ─── Legacy Colors (kept for _layout ThemeProvider) ───────────────────────────

const tintColorLight = lightPalette.accent;
const tintColorDark = darkPalette.accent;

export const Colors = {
  light: {
    text: lightPalette.textPrimary,
    background: lightPalette.background,
    tint: tintColorLight,
    icon: lightPalette.textSecondary,
    tabIconDefault: lightPalette.tabInactive,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: darkPalette.textPrimary,
    background: darkPalette.background,
    tint: tintColorDark,
    icon: darkPalette.textSecondary,
    tabIconDefault: darkPalette.tabInactive,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
