import { darkPalette, lightPalette, Colors, type AppPalette } from '../../constants/theme';

const PALETTE_KEYS: (keyof AppPalette)[] = [
  'background', 'surface', 'surfaceElevated', 'surfaceBorder',
  'accent', 'accentDim', 'accentBorder', 'accentGlow',
  'textPrimary', 'textSecondary', 'textMuted',
  'error', 'success', 'warning',
  'badgeExam', 'badgeNotes', 'badgeExercises',
  'tabBackground', 'tabBorder', 'tabActive', 'tabInactive',
  'isDark',
];

describe('darkPalette', () => {
  it('has all required palette keys', () => {
    PALETTE_KEYS.forEach((key) => {
      expect(darkPalette).toHaveProperty(key);
    });
  });

  it('isDark flag is true', () => {
    expect(darkPalette.isDark).toBe(true);
  });

  it('background is dark (low luminance)', () => {
    expect(darkPalette.background).toBe('#0a0a0a');
  });

  it('accent is cyan', () => {
    expect(darkPalette.accent).toBe('#1fc8fc');
  });

  it('tabActive matches accent', () => {
    expect(darkPalette.tabActive).toBe(darkPalette.accent);
  });

  it('error, success, warning are distinct colors', () => {
    const colors = new Set([darkPalette.error, darkPalette.success, darkPalette.warning]);
    expect(colors.size).toBe(3);
  });

  it('badgeExam matches error color', () => {
    expect(darkPalette.badgeExam).toBe(darkPalette.error);
  });

  it('badgeNotes matches success color', () => {
    expect(darkPalette.badgeNotes).toBe(darkPalette.success);
  });

  it('badgeExercises matches warning color', () => {
    expect(darkPalette.badgeExercises).toBe(darkPalette.warning);
  });

  it('all string values are non-empty', () => {
    PALETTE_KEYS.filter((k) => k !== 'isDark').forEach((key) => {
      expect(typeof darkPalette[key]).toBe('string');
      expect((darkPalette[key] as string).length).toBeGreaterThan(0);
    });
  });
});

describe('lightPalette', () => {
  it('has all required palette keys', () => {
    PALETTE_KEYS.forEach((key) => {
      expect(lightPalette).toHaveProperty(key);
    });
  });

  it('isDark flag is false', () => {
    expect(lightPalette.isDark).toBe(false);
  });

  it('background is light', () => {
    expect(lightPalette.background).toBe('#f5f3f0');
  });

  it('accent is blue', () => {
    expect(lightPalette.accent).toBe('#0099cc');
  });

  it('tabActive matches accent', () => {
    expect(lightPalette.tabActive).toBe(lightPalette.accent);
  });

  it('error, success, warning are distinct colors', () => {
    const colors = new Set([lightPalette.error, lightPalette.success, lightPalette.warning]);
    expect(colors.size).toBe(3);
  });

  it('isDark differs from darkPalette', () => {
    expect(lightPalette.isDark).not.toBe(darkPalette.isDark);
  });

  it('background differs from dark palette', () => {
    expect(lightPalette.background).not.toBe(darkPalette.background);
  });

  it('all string values are non-empty', () => {
    PALETTE_KEYS.filter((k) => k !== 'isDark').forEach((key) => {
      expect(typeof lightPalette[key]).toBe('string');
      expect((lightPalette[key] as string).length).toBeGreaterThan(0);
    });
  });
});

describe('Colors (legacy)', () => {
  it('has light and dark variants', () => {
    expect(Colors).toHaveProperty('light');
    expect(Colors).toHaveProperty('dark');
  });

  it('light variant has required keys', () => {
    ['text', 'background', 'tint', 'icon', 'tabIconDefault', 'tabIconSelected'].forEach((key) => {
      expect(Colors.light).toHaveProperty(key);
    });
  });

  it('dark variant has required keys', () => {
    ['text', 'background', 'tint', 'icon', 'tabIconDefault', 'tabIconSelected'].forEach((key) => {
      expect(Colors.dark).toHaveProperty(key);
    });
  });

  it('light tint matches lightPalette accent', () => {
    expect(Colors.light.tint).toBe(lightPalette.accent);
  });

  it('dark tint matches darkPalette accent', () => {
    expect(Colors.dark.tint).toBe(darkPalette.accent);
  });

  it('light and dark backgrounds are different', () => {
    expect(Colors.light.background).not.toBe(Colors.dark.background);
  });

  it('light text matches lightPalette textPrimary', () => {
    expect(Colors.light.text).toBe(lightPalette.textPrimary);
  });

  it('dark text matches darkPalette textPrimary', () => {
    expect(Colors.dark.text).toBe(darkPalette.textPrimary);
  });
});
