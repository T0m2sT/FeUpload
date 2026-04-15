import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';

const COURSES = ['Engenharia de Software', 'Bases de Dados', 'Redes de Computadores', 'Sistemas Operativos', 'Algoritmos'];
const YEARS   = ['2025/2026', '2024/2025', '2023/2024', '2022/2023', '2021/2022'];
const TYPES   = ['Exame', 'Ficha', 'Resumo', 'Outro'];

type DropdownKey = 'course' | 'year' | 'type' | null;

const LABELS = ['Exam', 'Exercises']

export default function UploadScreen() {
  const t = useAppTheme();
  const router = useRouter();
  const s = makeStyles(t);

  const [course,   setCourse]   = useState('');
  const [year,     setYear]     = useState('2024/2025');
  const [type,     setType]     = useState('');
  const [fileName, setFileName] = useState('');
  const [open,     setOpen]     = useState<DropdownKey>(null);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);

  const toggle = (key: DropdownKey) => setOpen((prev) => (prev === key ? null : key));

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword',
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        setFileName(result.assets[0].name);
      }
    } catch {
      setError('Não foi possível aceder ao ficheiro.');
    }
  };

  const submit = () => {
    setError('');
    if (!course)   return setError('Por favor seleciona uma cadeira.');
    if (!year)     return setError('Por favor seleciona o ano.');
    if (!type)     return setError('Por favor seleciona o tipo de material.');
    if (!fileName) return setError('Por favor seleciona um ficheiro.');
    setDone(true);
  };

  const reset = () => {
    setCourse(''); setYear('2024/2025'); setType(''); setFileName('');
    setError(''); setDone(false);
  };

  if (done) {
    return (
      <View style={[s.container, s.centered]}>
        <View style={[
          s.successIcon,
          t.isDark && { shadowColor: t.success, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } },
        ]}>
          <Ionicons name="checkmark" size={32} color={t.success} />
        </View>
        <Text style={s.successTitle}>Enviado!</Text>
        <Text style={s.successSub}>O material foi submetido com sucesso.</Text>
        <View style={s.successDetails}>
          {[['Cadeira', course], ['Ano', year], ['Tipo', type], ['Ficheiro', fileName]].map(([label, value]) => (
            <View key={label} style={s.detailRow}>
              <Text style={s.detailLabel}>{label}</Text>
              <Text style={s.detailValue}>{value}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={s.submitBtn} onPress={reset}>
          <Text style={s.submitBtnText}>Enviar Outro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} accessibilityLabel="Voltar">
            <Ionicons name="arrow-back" size={20} color={t.accent} />
          </TouchableOpacity>
          <Text style={s.heading}>Enviar Material</Text>
        </View>

        {error ? (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={t.error} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form fields */}
        <View style={s.formCard}>
          {/* Cadeira */}
          <TouchableOpacity style={s.fieldRow} onPress={() => toggle('course')} accessibilityLabel="Selecionar cadeira">
            <Text style={s.fieldLabel}>Cadeira</Text>
            <View style={s.fieldRight}>
              <Text style={course ? s.fieldValue : s.fieldPlaceholder}>{course || 'Selecionar'}</Text>
              <Ionicons name={open === 'course' ? 'chevron-up' : 'chevron-down'} size={14} color={t.textSecondary} />
            </View>
          </TouchableOpacity>
          {open === 'course' && (
            <View style={s.dropdown}>
              {COURSES.map((c) => (
                <TouchableOpacity key={c} style={s.dropItem} onPress={() => { setCourse(c); setOpen(null); }}>
                  <Text style={[s.dropText, course === c && s.dropTextActive]}>{c}</Text>
                  {course === c && <Ionicons name="checkmark" size={14} color={t.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={s.divider} />

          {/* Ano */}
          <TouchableOpacity style={s.fieldRow} onPress={() => toggle('year')} accessibilityLabel="Selecionar ano">
            <Text style={s.fieldLabel}>Ano</Text>
            <View style={s.fieldRight}>
              <Text style={s.fieldValue}>{year}</Text>
              <Ionicons name={open === 'year' ? 'chevron-up' : 'chevron-down'} size={14} color={t.textSecondary} />
            </View>
          </TouchableOpacity>
          {open === 'year' && (
            <View style={s.dropdown}>
              {YEARS.map((y) => (
                <TouchableOpacity key={y} style={s.dropItem} onPress={() => { setYear(y); setOpen(null); }}>
                  <Text style={[s.dropText, year === y && s.dropTextActive]}>{y}</Text>
                  {year === y && <Ionicons name="checkmark" size={14} color={t.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={s.divider} />

          {/* Tipo */}
          <TouchableOpacity style={s.fieldRow} onPress={() => toggle('type')} accessibilityLabel="Selecionar tipo">
            <Text style={s.fieldLabel}>Tipo</Text>
            <View style={s.fieldRight}>
              <Text style={type ? s.fieldValue : s.fieldPlaceholder}>{type || 'Selecionar'}</Text>
              <Ionicons name={open === 'type' ? 'chevron-up' : 'chevron-down'} size={14} color={t.textSecondary} />
            </View>
          </TouchableOpacity>
          {open === 'type' && (
            <View style={s.dropdown}>
              {TYPES.map((tp) => (
                <TouchableOpacity key={tp} style={s.dropItem} onPress={() => { setType(tp); setOpen(null); }}>
                  <Text style={[s.dropText, type === tp && s.dropTextActive]}>{tp}</Text>
                  {type === tp && <Ionicons name="checkmark" size={14} color={t.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* File picker */}
        <TouchableOpacity
          style={[s.filePicker, fileName && s.filePickerActive]}
          onPress={pickFile}
          accessibilityRole="button"
          accessibilityLabel="Escolher ficheiro"
        >
          <View style={[s.fileIconWrap, fileName && s.fileIconWrapActive]}>
            <Ionicons
              name={fileName ? 'document-attach' : 'cloud-upload-outline'}
              size={24}
              color={fileName ? t.accent : t.textSecondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.filePickerLabel, fileName && { color: t.accent }]}>
              {fileName || 'Escolher ficheiro'}
            </Text>
            <Text style={s.filePickerSub}>
              {fileName ? 'Toca para substituir' : 'PDF, DOC, Imagem'}
            </Text>
          </View>
          {fileName && <Ionicons name="close-circle" size={18} color={t.textSecondary} onPress={() => setFileName('')} />}
        </TouchableOpacity>

        <TouchableOpacity style={s.submitBtn} onPress={submit} accessibilityLabel="Enviar">
          <Ionicons name="cloud-upload-outline" size={18} color={t.isDark ? t.background : '#fff'} style={{ marginRight: 8 }} />
          <Text style={s.submitBtnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function makeStyles(t: AppPalette) {
  return StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: t.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      paddingTop: Platform.OS === 'ios' ? 60 : 48,
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 28,
    },
    backBtn: {
      padding: 2,
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      color: t.textPrimary,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: t.isDark ? 'rgba(224,82,82,0.10)' : '#fff0f0',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(224,82,82,0.25)' : '#f5c6c6',
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: t.error,
      fontSize: 13,
      flex: 1,
    },
    formCard: {
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      marginBottom: 16,
      overflow: 'hidden',
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 16,
    },
    fieldLabel: {
      fontSize: 15,
      color: t.textPrimary,
      fontWeight: '500',
    },
    fieldRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    fieldValue: {
      fontSize: 14,
      color: t.textSecondary,
    },
    fieldPlaceholder: {
      fontSize: 14,
      color: t.textMuted,
    },
    divider: {
      height: 1,
      backgroundColor: t.surfaceBorder,
      marginHorizontal: 16,
    },
    dropdown: {
      backgroundColor: t.surfaceElevated,
      borderTopWidth: 1,
      borderTopColor: t.surfaceBorder,
    },
    dropItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: t.surfaceBorder,
    },
    dropText: {
      fontSize: 14,
      color: t.textSecondary,
    },
    dropTextActive: {
      color: t.accent,
      fontWeight: '600',
    },
    filePicker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      borderStyle: 'dashed',
      padding: 18,
      marginBottom: 20,
    },
    filePickerActive: {
      borderColor: t.accentBorder,
      borderStyle: 'solid',
      backgroundColor: t.accentDim,
    },
    fileIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: t.surfaceBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileIconWrapActive: {
      backgroundColor: t.accentDim,
    },
    filePickerLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: t.textSecondary,
      marginBottom: 2,
    },
    filePickerSub: {
      fontSize: 12,
      color: t.textMuted,
    },
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.accent,
      borderRadius: 12,
      padding: 16,
      shadowColor: t.isDark ? t.accentGlow : 'transparent',
      shadowOpacity: t.isDark ? 0.55 : 0,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    submitBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: t.isDark ? t.background : '#fff',
    },
    // Success state
    successIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: t.isDark ? 'rgba(62,207,142,0.12)' : '#f0fff8',
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(62,207,142,0.30)' : '#a8e6cf',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    successTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: t.textPrimary,
      marginBottom: 6,
    },
    successSub: {
      fontSize: 14,
      color: t.textSecondary,
      marginBottom: 24,
    },
    successDetails: {
      width: '100%',
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      marginBottom: 28,
      overflow: 'hidden',
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: t.surfaceBorder,
    },
    detailLabel: {
      fontSize: 13,
      color: t.textSecondary,
    },
    detailValue: {
      fontSize: 13,
      color: t.textPrimary,
      fontWeight: '500',
      flex: 1,
      textAlign: 'right',
    },
  });
}
