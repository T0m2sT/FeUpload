import { useThemeContext } from '@/contexts/theme-context';
import type { AppPalette } from '@/constants/theme';

export function useAppTheme(): AppPalette {
  return useThemeContext().palette;
}
