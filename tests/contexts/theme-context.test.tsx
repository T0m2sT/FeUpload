import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider, useThemeContext } from '../../contexts/theme-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette } from '../../constants/theme';
import { Text } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('react-native', () => {
  const React = require('react');
  return {
    useColorScheme: jest.fn(),
    Text: ({ children, testID, ...props }: any) => React.createElement('Text', { testID, ...props }, children),
    StyleSheet: {
      create: (s: any) => s,
      flatten: (s: any) => s,
    },
    Platform: {
      select: jest.fn((options) => options.default || options.ios),
      OS: 'ios',
    },
  };
});

const Consumer = () => {
  const { preference, palette, setPreference } = useThemeContext();
  return (
    <>
      <Text testID="preference">{preference}</Text>
      <Text testID="isDark">{palette.isDark.toString()}</Text>
      <Text testID="setLight" onPress={() => setPreference('light')}>Set Light</Text>
    </>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (useColorScheme as jest.Mock).mockReturnValue('dark');
  });

  it('loads preference from storage on mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('light');
    
    const { getByTestId } = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('preference').props.children).toBe('light');
    });
    expect(getByTestId('isDark').props.children).toBe('false');
  });

  it('uses system scheme if preference is system', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
    
    const { getByTestId } = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('preference').props.children).toBe('system');
    });
    expect(getByTestId('isDark').props.children).toBe('false');
  });

  it('updates preference and saves to storage', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    await act(async () => {
      getByTestId('setLight').props.onPress();
    });

    expect(getByTestId('preference').props.children).toBe('light');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@feupload/theme', 'light');
  });

  it('defaults to dark if system scheme is unavailable', async () => {
    (useColorScheme as jest.Mock).mockReturnValue(null);
    
    const { getByTestId } = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isDark').props.children).toBe('true');
    });
  });
});
