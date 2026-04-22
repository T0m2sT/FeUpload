import { renderHook } from '@testing-library/react-native';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useThemeContext } from '../../contexts/theme-context';
import { darkPalette } from '../../constants/theme';

jest.mock('../../contexts/theme-context', () => ({
  useThemeContext: jest.fn(),
}));

describe('useAppTheme', () => {
  it('returns the palette from theme context', () => {
    (useThemeContext as jest.Mock).mockReturnValue({
      palette: darkPalette,
    });
    const { result } = renderHook(() => useAppTheme());
    expect(result.current).toBe(darkPalette);
  });
});
