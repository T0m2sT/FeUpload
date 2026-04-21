import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

jest.mock('../../hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

describe('useThemeColor', () => {
  it('returns light color when theme is light', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe(Colors.light.text);
  });

  it('returns dark color when theme is dark', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe(Colors.dark.text);
  });

  it('returns override color from props if provided', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { result } = renderHook(() => useThemeColor({ light: 'red' }, 'text'));
    expect(result.current).toBe('red');
  });

  it('defaults to light theme if useColorScheme returns null', () => {
    (useColorScheme as jest.Mock).mockReturnValue(null);
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe(Colors.light.text);
  });
});
