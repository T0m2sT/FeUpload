import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ThemeProvider, useThemeContext } from '@/contexts/theme-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutInner() {
  const { palette: p } = useThemeContext();

  const navTheme = {
    ...(p.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(p.isDark ? DarkTheme : DefaultTheme).colors,
      background: p.background,
      card: p.surface,
      text: p.textPrimary,
      border: p.surfaceBorder,
      primary: p.accent,
    },
  };

  return (
    <NavThemeProvider value={navTheme}>
      <Stack screenOptions={{ animation: 'none' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="course/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="ratings" options={{ headerShown: false }} />
        <Stack.Screen name="upload" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={p.isDark ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
