import { useThemeContext } from '@/contexts/theme-context';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import {
  isValidCourse,
  isValidName,
  isValidStudentId,
  normalizeCourse,
  normalizeSpaces,
  normalizeStudentId,
  parseOptionalInteger,
} from '../lib/validation';

type Field = {
  key: string;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
};

const FIELDS: Field[] = [
  { key: 'name',      label: 'Full name',      placeholder: 'e.g. Rafael Silva',  autoCapitalize: 'words' },
  { key: 'studentId', label: 'Student number', placeholder: 'e.g. up202312345',   autoCapitalize: 'none' },
  { key: 'course',    label: 'Course',         placeholder: 'e.g. LEIC',          autoCapitalize: 'words' },
  { key: 'year',      label: 'Year',           placeholder: 'e.g. 2',             keyboardType: 'numeric' },
  { key: 'semester',  label: 'Semester',       placeholder: 'e.g. 2',             keyboardType: 'numeric' },
];

export default function CompleteProfileScreen() {
  const { palette: t } = useThemeContext();
  const router = useRouter();

  const [values, setValues] = useState<Record<string, string>>({
    name: '', studentId: '', course: '', year: '', semester: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      if (meta?.name) setValues((v) => ({ ...v, name: meta.name }));
    });
  }, []);

  const set = (key: string) => (val: string) => setValues((v) => ({ ...v, [key]: val }));

  const handleSave = async () => {
    const normalizedName = normalizeSpaces(values.name);
    const normalizedStudentId = normalizeStudentId(values.studentId);
    const normalizedCourse = normalizeCourse(values.course);
    const normalizedYear = values.year.trim();
    const normalizedSemester = values.semester.trim();
    const parsedYear = parseOptionalInteger(normalizedYear);
    const parsedSemester = parseOptionalInteger(normalizedSemester);

    if (!normalizedName || !normalizedStudentId || !normalizedCourse) {
      setError('Please fill in name, student number, and course.');
      return;
    }
    if (!isValidName(normalizedName)) {
      setError('Please enter a valid full name.');
      return;
    }
    if (!isValidStudentId(normalizedStudentId)) {
      setError('Please enter a valid student number.');
      return;
    }
    if (!isValidCourse(normalizedCourse)) {
      setError('Please enter a valid course.');
      return;
    }
    if (!Number.isNaN(parsedYear) && parsedYear !== null && (parsedYear < 1 || parsedYear > 6)) {
      setError('Year must be between 1 and 6.');
      return;
    }
    if (!Number.isNaN(parsedSemester) && parsedSemester !== null && (parsedSemester < 1 || parsedSemester > 2)) {
      setError('Semester must be 1 or 2.');
      return;
    }
    if (Number.isNaN(parsedYear) || Number.isNaN(parsedSemester)) {
      setError('Year and semester must be numeric.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update auth metadata
      await supabase.auth.updateUser({
        data: {
          name: normalizedName,
          studentId: normalizedStudentId,
          course: normalizedCourse,
          year: normalizedYear,
          semester: normalizedSemester,
          profileComplete: true,
        },
      });

      // Update profiles row
      await supabase
        .from('profiles')
        .update({ name: normalizedName })
        .eq('id', user.id);

      router.replace('/(tabs)');
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={[styles.heading, { color: t.textPrimary }]}>Complete your profile</Text>
        <Text style={[styles.sub, { color: t.textSecondary }]}>
          This information helps personalise your experience.
        </Text>

        {error ? <Text style={[styles.error, { color: t.error }]}>{error}</Text> : null}

        {FIELDS.map((f) => (
          <View key={f.key} style={styles.fieldWrap}>
            <Text style={[styles.label, { color: t.textSecondary }]}>{f.label}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.surface, borderColor: t.surfaceBorder, color: t.textPrimary }]}
              placeholder={f.placeholder}
              placeholderTextColor={t.textMuted}
              value={values[f.key]}
              onChangeText={set(f.key)}
              keyboardType={f.keyboardType ?? 'default'}
              autoCapitalize={f.autoCapitalize ?? 'sentences'}
              selectionColor={t.accent}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: t.accent }, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Get started'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={async () => { await supabase.auth.updateUser({ data: { profileComplete: true } }); router.replace('/(tabs)'); }} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: t.textMuted }]}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 72 : 56,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    marginBottom: 32,
    lineHeight: 22,
  },
  fieldWrap: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
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
  skipBtn: { alignItems: 'center', marginTop: 16 },
  skipText: { fontSize: 14 },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
});
