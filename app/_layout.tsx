import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ThemeProvider, useThemeContext } from '@/contexts/theme-context';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export const unstable_settings = {
  anchor: 'auth',
};

function RootLayoutInner() {
  const { palette: p } = useThemeContext();
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    const profileComplete = session?.user?.user_metadata?.profileComplete !== false;
    const inTabs = segments[0] === '(tabs)';
    const onAuth = segments[0] === 'auth';
    const onComplete = segments[0] === 'complete-profile';

    if (!session && !onAuth) {
      router.replace('/auth');
    } else if (session && !profileComplete && !onComplete) {
      router.replace('/complete-profile');
    }
  }, [session, segments]);

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
        <Stack.Screen name="material-evaluation" options={{ headerShown: false }} />
        <Stack.Screen name="material/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="upload" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="pdf-viewer" options={{ headerBackVisible: false }} />
        <Stack.Screen name="auth" options={{ title: 'FeUpload', headerBackVisible: false }} />
        <Stack.Screen name="complete-profile" options={{ headerShown: false }} />
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
