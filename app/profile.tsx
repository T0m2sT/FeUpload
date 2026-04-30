import type { AppPalette } from '@/constants/theme';
import { useThemeContext, type ThemePreference } from '@/contexts/theme-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView, StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

type Profile = {
  name: string;
  email: string;
  studentId: string;
  course: string;
  year: string;
  semester: string;
};

type SectionRowProps = {
  label: string;
  value: string;
  editable?: boolean;
  onChangeText?: (v: string) => void;
  t: AppPalette;
  s: ReturnType<typeof makeStyles>;
};

function FieldRow({ label, value, editable, onChangeText, t, s }: SectionRowProps) {
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      {editable ? (
        <TextInput
          style={s.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={t.textMuted}
          selectionColor={t.accent}
        />
      ) : (
        <Text style={s.fieldValue}>{value || '—'}</Text>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const t = useAppTheme();
  const router = useRouter();
  const s = makeStyles(t);

  const { preference, setPreference } = useThemeContext();
  const [profile, setProfile] = useState<Profile>({
    name: '', email: '', studentId: '', course: '', year: '', semester: '',
  });
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) { setLoading(false); return; }
      const meta = u.user_metadata ?? {};
      supabase.from('profiles').select('name, email').eq('id', u.id).single().then(({ data: p }) => {
        setProfile({
          name: p?.name ?? meta.name ?? u.email?.split('@')[0] ?? '',
          email: p?.email ?? u.email ?? '',
          studentId: meta.studentId ?? '',
          course: meta.course ?? '',
          year: meta.year ?? '',
          semester: meta.semester ?? '',
        });
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  const update = (key: keyof Profile) => (value: string) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await Promise.all([
      supabase.from('profiles').update({ name: profile.name }).eq('id', user.id),
      supabase.auth.updateUser({
        data: {
          name: profile.name,
          studentId: profile.studentId,
          course: profile.course,
          year: profile.year,
          semester: profile.semester,
        },
      }),
    ]);
    setEditing(false);
  };

  if (loading) {
    return (
      <View style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={t.accent} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={t.accent} />
          </TouchableOpacity>
          <Text style={s.heading}>Perfil</Text>
          <TouchableOpacity
            onPress={() => editing ? handleSave() : setEditing(true)}
            style={s.editBtn}
            accessibilityLabel={editing ? 'Guardar' : 'Editar'}
          >
            <Ionicons name={editing ? 'checkmark' : 'pencil-outline'} size={18} color={t.accent} />
            <Text style={s.editBtnText}>{editing ? 'Guardar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={[
            s.avatar,
            t.isDark && {
              shadowColor: t.accentGlow,
              shadowOpacity: 0.5,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}>
            <Text style={s.avatarInitial}>{(profile.name || '?').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.avatarName}>{profile.name}</Text>
          <Text style={s.avatarSub}>{profile.email}</Text>
        </View>

        {/* Personal info */}
        <Text style={s.sectionLabel}>Informação Pessoal</Text>
        <View style={s.card}>
          <FieldRow label="Nome"        value={profile.name}      editable={editing} onChangeText={update('name')}      t={t} s={s} />
          <View style={s.divider} />
          <FieldRow label="Email"       value={profile.email}     editable={false}                                       t={t} s={s} />
          <View style={s.divider} />
          <FieldRow label="Nº de aluno" value={profile.studentId} editable={editing} onChangeText={update('studentId')} t={t} s={s} />
        </View>

        {/* Academic info */}
        <Text style={s.sectionLabel}>Informação Académica</Text>
        <View style={s.card}>
          <FieldRow label="Curso"    value={profile.course}   editable={editing} onChangeText={update('course')}   t={t} s={s} />
          <View style={s.divider} />
          <FieldRow label="Ano"      value={profile.year}     editable={editing} onChangeText={update('year')}     t={t} s={s} />
          <View style={s.divider} />
          <FieldRow label="Semestre" value={profile.semester} editable={editing} onChangeText={update('semester')} t={t} s={s} />
        </View>

        {/* Appearance */}
        <Text style={s.sectionLabel}>Aparência</Text>
        <View style={s.card}>
          {([ ['system', 'Sistema', 'phone-portrait-outline'], ['light', 'Claro', 'sunny-outline'], ['dark', 'Escuro', 'moon-outline'] ] as [ThemePreference, string, string][]).map(([key, label, icon], index, arr) => (
            <React.Fragment key={key}>
              <TouchableOpacity
                style={s.themeRow}
                onPress={() => setPreference(key)}
                accessibilityRole="radio"
                accessibilityState={{ checked: preference === key }}
              >
                <Ionicons name={icon as any} size={17} color={preference === key ? t.accent : t.textSecondary} style={s.themeIcon} />
                <Text style={[s.themeLabel, preference === key && s.themeLabelActive]}>{label}</Text>
                {preference === key && (
                  <Ionicons name="checkmark" size={17} color={t.accent} />
                )}
              </TouchableOpacity>
              {index < arr.length - 1 && <View style={s.divider} />}
            </React.Fragment>
          ))}
        </View>

        <Text style={s.sectionLabel}>Definições</Text>
        <View style={s.card}>
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Notificações</Text>
              <Text style={s.toggleSub}>Avisos sobre novos materiais</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: t.surfaceBorder, true: t.accentBorder }}
              thumbColor={notificationsEnabled ? t.accent : t.textMuted}
            />
          </View>
          <View style={s.divider} />
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Text style={s.toggleLabel}>Sincronização Offline</Text>
              <Text style={s.toggleSub}>Guardar materiais para acesso offline</Text>
            </View>
            <Switch
              value={offlineSyncEnabled}
              onValueChange={setOfflineSyncEnabled}
              trackColor={{ false: t.surfaceBorder, true: t.accentBorder }}
              thumbColor={offlineSyncEnabled ? t.accent : t.textMuted}
            />
          </View>
        </View>

        {/* Danger zone */}
        <Text style={s.sectionLabel}>Conta</Text>
        <View style={s.card}>
          <TouchableOpacity onPress={async () => { await supabase.auth.signOut(); router.replace('/auth'); }} style={s.dangerRow}>
            <Ionicons name="log-out-outline" size={18} color={t.error} />
            <Text style={[s.dangerText]}>Terminar sessão</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.background,
    },
    container: {
      paddingTop: Platform.OS === 'ios' ? 60 : 48,
      paddingHorizontal: 20,
      paddingBottom: 48,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 28,
    },
    backBtn: {
      padding: 2,
      marginRight: 12,
    },
    heading: {
      flex: 1,
      fontSize: 24,
      fontWeight: 'bold',
      color: t.textPrimary,
    },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: t.accentDim,
      borderWidth: 1,
      borderColor: t.accentBorder,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    editBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.accent,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: t.accentDim,
      borderWidth: 2,
      borderColor: t.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    avatarInitial: {
      fontSize: 32,
      fontWeight: 'bold',
      color: t.accent,
    },
    avatarName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: t.textPrimary,
      marginBottom: 4,
    },
    avatarSub: {
      fontSize: 13,
      color: t.textSecondary,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
      marginTop: 20,
    },
    card: {
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      overflow: 'hidden',
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    fieldLabel: {
      fontSize: 15,
      color: t.textPrimary,
      fontWeight: '500',
      flex: 1,
    },
    fieldValue: {
      fontSize: 14,
      color: t.textSecondary,
      flex: 2,
      textAlign: 'right',
    },
    fieldInput: {
      fontSize: 14,
      color: t.accent,
      flex: 2,
      textAlign: 'right',
      padding: 0,
    },
    divider: {
      height: 1,
      backgroundColor: t.surfaceBorder,
      marginHorizontal: 16,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
    },
    toggleInfo: {
      flex: 1,
    },
    toggleLabel: {
      fontSize: 15,
      fontWeight: '500',
      color: t.textPrimary,
      marginBottom: 2,
    },
    toggleSub: {
      fontSize: 12,
      color: t.textSecondary,
    },
    dangerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 15,
      paddingHorizontal: 16,
    },
    dangerText: {
      fontSize: 15,
      color: t.error,
      fontWeight: '500',
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 10,
    },
    themeIcon: {
      width: 20,
    },
    themeLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: t.textPrimary,
    },
    themeLabelActive: {
      color: t.accent,
      fontWeight: '600',
    },
  });
}
