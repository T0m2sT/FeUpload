import { useColorScheme } from '../../hooks/use-color-scheme';
import { useColorScheme as useRNColorScheme } from 'react-native';

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

describe('useColorScheme (native re-export)', () => {
  it('returns the color scheme from react-native', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('dark');
    expect(useColorScheme()).toBe('dark');
  });

  it('returns light when react-native returns light', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('light');
    expect(useColorScheme()).toBe('light');
  });

  it('returns null when react-native returns null', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue(null);
    expect(useColorScheme()).toBeNull();
  });
});
