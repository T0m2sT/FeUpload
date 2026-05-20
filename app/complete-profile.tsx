import { useThemeContext } from '@/contexts/theme-context';
import { COURSE_OPTIONS, SEMESTER_OPTIONS, YEAR_OPTIONS } from '@/constants/academics';
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
      setValues((v) => ({
        ...v,
        name: meta?.name ?? v.name,
        course: meta?.course != null ? String(meta.course) : v.course,
        year: meta?.year != null ? String(meta.year) : v.year,
        semester: meta?.semester != null ? String(meta.semester) : v.semester,
      }));
    });
  }, []);

  const set = (key: string) => (val: string) => setValues((v) => ({ ...v, [key]: val }));

  const courseOptions = COURSE_OPTIONS;

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
    if (!Number.isNaN(parsedYear) && parsedYear !== null && (parsedYear < 1 || parsedYear > 3)) {
      setError('Year must be 1, 2, or 3.');
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

        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: t.textSecondary }]}>Full name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: t.surface, borderColor: t.surfaceBorder, color: t.textPrimary }]}
            placeholder="e.g. Rafael Silva"
            placeholderTextColor={t.textMuted}
            value={values.name}
            onChangeText={set('name')}
            autoCapitalize="words"
            selectionColor={t.accent}
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: t.textSecondary }]}>Student number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: t.surface, borderColor: t.surfaceBorder, color: t.textPrimary }]}
            placeholder="e.g. up202312345"
            placeholderTextColor={t.textMuted}
            value={values.studentId}
            onChangeText={set('studentId')}
            autoCapitalize="none"
            selectionColor={t.accent}
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: t.textSecondary }]}>Course</Text>
          <View style={styles.optionRow}>
            {courseOptions.map((course) => {
              const active = values.course === course;
              return (
                <TouchableOpacity
                  key={course}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: active ? t.accent : t.surface,
                      borderColor: active ? t.accent : t.surfaceBorder,
                    },
                  ]}
                  onPress={() => set('course')(course)}
                  accessibilityLabel={`Course ${course}`}
                >
                  <Text style={[styles.optionText, { color: active ? (t.isDark ? '#000' : '#fff') : t.textSecondary }]}>
                    {course}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: t.textSecondary }]}>Year</Text>
          <View style={styles.optionRow}>
            {YEAR_OPTIONS.map((year) => {
              const key = String(year);
              const active = values.year === key;
              return (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: active ? t.accent : t.surface,
                      borderColor: active ? t.accent : t.surfaceBorder,
                    },
                  ]}
                  onPress={() => set('year')(key)}
                  accessibilityLabel={`Year ${year}`}
                >
                  <Text style={[styles.optionText, { color: active ? (t.isDark ? '#000' : '#fff') : t.textSecondary }]}>
                    {year}º
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: t.textSecondary }]}>Semester</Text>
          <View style={styles.optionRow}>
            {SEMESTER_OPTIONS.map((semester) => {
              const key = String(semester);
              const active = values.semester === key;
              return (
                <TouchableOpacity
                  key={semester}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: active ? t.accent : t.surface,
                      borderColor: active ? t.accent : t.surfaceBorder,
                    },
                  ]}
                  onPress={() => set('semester')(key)}
                  accessibilityLabel={`Semester ${semester}`}
                >
                  <Text style={[styles.optionText, { color: active ? (t.isDark ? '#000' : '#fff') : t.textSecondary }]}>
                    {semester}º
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
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
