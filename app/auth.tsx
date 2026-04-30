import { useThemeContext } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const { palette: t, preference, setPreference } = useThemeContext();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    const next = preference === 'dark' || (preference === 'system' && t.isDark) ? 'light' : 'dark';
    setPreference(next);
  };

  const handleAuth = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/(tabs)');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim(), profileComplete: false } },
        });
        if (error) throw error;
        router.replace('/complete-profile');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.wrapper, { backgroundColor: t.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Theme toggle */}
      <TouchableOpacity style={styles.themeBtn} onPress={toggleTheme} accessibilityLabel="Toggle theme">
        <Ionicons name={t.isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={t.accent} />
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={[styles.logo, { color: t.accent }]}>FeUpload</Text>
        <Text style={[styles.subtitle, { color: t.textSecondary }]}>
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </Text>

        {error ? <Text style={[styles.error, { color: t.error }]}>{error}</Text> : null}

        {!isLogin && (
          <TextInput
            style={[styles.input, { backgroundColor: t.surface, borderColor: t.surfaceBorder, color: t.textPrimary }]}
            placeholder="Name"
            placeholderTextColor={t.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            selectionColor={t.accent}
          />
        )}

        <TextInput
          style={[styles.input, { backgroundColor: t.surface, borderColor: t.surfaceBorder, color: t.textPrimary }]}
          placeholder="Email"
          placeholderTextColor={t.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          selectionColor={t.accent}
        />

        <TextInput
          style={[styles.input, { backgroundColor: t.surface, borderColor: t.surfaceBorder, color: t.textPrimary }]}
          placeholder="Password"
          placeholderTextColor={t.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          selectionColor={t.accent}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: t.accent }, loading && { opacity: 0.6 }]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: t.isDark ? '#000' : '#fff' }]}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }}>
          <Text style={[styles.toggle, { color: t.accent }]}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  themeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 16,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
  toggle: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
});
