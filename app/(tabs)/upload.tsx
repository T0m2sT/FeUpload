import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AppPalette } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { uploadMaterial, uploadMaterialFile } from '@/services/materials';
import { suggestTagsFromFilename, type MaterialType } from '@/lib/tag-suggestions';

// ─── Types ───────────────────────────────────────────────────────────────────
type DropdownKey = 'course' | 'year' | 'type' | 'courseYear' | 'courseSemester' | null;

type Course = {
  id: string;
  code: string;
  name: string;
  year: number;
  semester: number;
};

type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ACADEMIC_YEARS = [
  '2025/2026',
  '2024/2025',
  '2023/2024',
  '2022/2023',
  '2021/2022',
];

const TYPE_OPTIONS: { label: string; value: MaterialType }[] = [
  { label: 'Exame', value: 'exam' },
  { label: 'Ficha / Exercícios', value: 'exercise' },
  { label: 'Resumo', value: 'summary' },
  { label: 'Apontamentos', value: 'notes' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function UploadScreen() {
  const t = useAppTheme();
  const router = useRouter();
  const s = makeStyles(t);
  const { preselect } = useLocalSearchParams<{ preselect?: string }>();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState<Course | null>(null);
  const [year, setYear] = useState('2024/2025');
  const [materialType, setMaterialType] = useState<MaterialType | null>(null);
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [pickedFileSolved, setPickedFileSolved] = useState<PickedFile | null>(null);
  const [courseYear, setCourseYear] = useState<number | null>(null);
  const [courseSemester, setCourseSemester] = useState<number | null>(null);
  const [open, setOpen] = useState<DropdownKey>(null);

  // Async state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // ── Load courses ────────────────────────────────────────────────────────────
  const preselectCode = Array.isArray(preselect) ? preselect[0] : preselect;

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingCourses(true);
      try {
        const { data, error: err } = await supabase
          .from('courses')
          .select('id, code, name, year, semester')
          .order('name');
        if (err) throw err;
        if (active) {
          const loaded = data ?? [];
          setCourses(loaded);
          if (preselectCode) {
            const match = loaded.find((c) => c.code === preselectCode.toUpperCase());
            if (match) {
              setCourse(match);
              setCourseYear(match.year);
              setCourseSemester(match.semester);
            }
          }
        }
      } catch {
        // Silently fall back – user sees an empty list
      } finally {
        if (active) setLoadingCourses(false);
      }
    };
    load();
    return () => { active = false; };
  }, [preselectCode]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const toggle = (key: DropdownKey) =>
    setOpen((prev) => (prev === key ? null : key));

  const pickFile = async (version: 'unsolved' | 'solved') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/*',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        const picked = {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/octet-stream',
          size: asset.size ?? undefined,
        };
        if (version === 'unsolved') {
          setPickedFile(picked);
          const tags = suggestTagsFromFilename(asset.name);
          if (!title && tags.title) setTitle(tags.title);
          if (!materialType && tags.type) setMaterialType(tags.type);
          if (tags.year) setYear(tags.year);
        } else {
          setPickedFileSolved(picked);
        }
      }
    } catch {
      setError('Não foi possível aceder ao ficheiro.');
    }
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'Por favor indica um título.';
    if (!course)       return 'Por favor seleciona uma cadeira.';
    if (!year)         return 'Por favor seleciona o ano letivo.';
    if (!materialType) return 'Por favor seleciona o tipo de material.';
    if (!pickedFile)   return 'Por favor seleciona um ficheiro.';
    return null;
  };

  const submit = async () => {
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) { setError('Sessão expirada. Por favor volta a iniciar sessão.'); return; }

    setUploading(true);
    try {
      // 1. Upload files to Supabase Storage
      let fileUrl: string | undefined;
      let fileUrlSolved: string | undefined;

      const uploadPromises = [];
      if (pickedFile) {
        uploadPromises.push(
          uploadMaterialFile(
            pickedFile.uri,
            pickedFile.name,
            pickedFile.mimeType,
            course!.year,
            course!.semester,
            course!.code,
          ).then((url) => {
            fileUrl = url;
          })
        );
      }
      if (pickedFileSolved) {
        uploadPromises.push(
          uploadMaterialFile(
            pickedFileSolved.uri,
            pickedFileSolved.name,
            pickedFileSolved.mimeType,
            course!.year,
            course!.semester,
            course!.code,
          ).then((url) => {
            fileUrlSolved = url;
          })
        );
      }

      await Promise.all(uploadPromises);

      // 2. Insert the material record
      await uploadMaterial({
        title: title.trim(),
        description: description.trim() || undefined,
        type: materialType!,
        class_code: course!.code,
        user_id: user.id,
        academic_year: year,
        file_url: fileUrl,
        file_url_solved: fileUrlSolved,
        is_solved: false,
      });

      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar material.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setTitle('');
    setDescription('');
    setCourse(null);
    setCourseYear(null);
    setCourseSemester(null);
    setYear('');
    setMaterialType(null);
    setPickedFile(null);
    setPickedFileSolved(null);
    setError('');
    setDone(false);
    setOpen(null);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <View style={[s.container, s.centered]}>
        <View style={[
          s.successIcon,
          t.isDark && {
            shadowColor: t.success,
            shadowOpacity: 0.5,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}>
          <Ionicons name="checkmark" size={32} color={t.success} />
        </View>
        <Text style={s.successTitle}>Enviado!</Text>
        <Text style={s.successSub}>O material foi submetido com sucesso.</Text>
        <View style={s.successDetails}>
          {([
            ['Título',   title],
            ['Cadeira',  course?.name ?? ''],
            ['Ano',      year],
            ['Tipo',     TYPE_OPTIONS.find((o) => o.value === materialType)?.label ?? ''],
            ['Ficheiro', pickedFile?.name ?? ''],
            pickedFileSolved ? ['Resolução', pickedFileSolved.name] : null,
          ].filter(Boolean) as [string, string][]).map(([label, value]) => (
            <View key={label} style={s.detailRow}>
              <Text style={s.detailLabel}>{label}</Text>
              <Text style={s.detailValue} numberOfLines={1}>{value}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={s.submitBtn} onPress={reset} accessibilityLabel="Enviar outro material">
          <Ionicons name="add-circle-outline" size={18} color={t.isDark ? t.background : '#fff'} style={{ marginRight: 8 }} />
          <Text style={s.submitBtnText}>Enviar Outro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.submitBtn, s.secondaryBtn]} onPress={() => router.back()} accessibilityLabel="Voltar">
          <Text style={[s.submitBtnText, { color: t.textSecondary }]}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  const typeLabel = TYPE_OPTIONS.find((o) => o.value === materialType)?.label;

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={s.backBtn}
            accessibilityLabel="Voltar"
          >
            <Ionicons name="arrow-back" size={20} color={t.accent} />
          </TouchableOpacity>
          <Text style={s.heading}>Enviar Material</Text>
        </View>

        {/* Error banner */}
        {error ? (
          <View style={s.errorBox} accessibilityRole="alert">
            <Ionicons name="alert-circle-outline" size={16} color={t.error} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Title ── */}
        <Text style={s.sectionLabel}>Título *</Text>
        <TextInput
          style={s.textInput}
          placeholder="ex: Exame 2023 – 1ª Época"
          placeholderTextColor={t.textMuted}
          value={title}
          onChangeText={setTitle}
          returnKeyType="done"
          accessibilityLabel="Título do material"
        />

        {/* ── Description ── */}
        <Text style={s.sectionLabel}>Descrição (opcional)</Text>
        <TextInput
          style={[s.textInput, s.textArea]}
          placeholder="Breve descrição do conteúdo…"
          placeholderTextColor={t.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          accessibilityLabel="Descrição do material"
        />

        {/* ── Dropdowns ── */}
        <Text style={s.sectionLabel}>Detalhes</Text>
        <View style={s.formCard}>
          {/* Ano Curricular */}
          <TouchableOpacity
            style={s.fieldRow}
            onPress={() => toggle('courseYear')}
            accessibilityLabel="Selecionar ano curricular"
          >
            <Text style={s.fieldLabel}>Ano Curricular</Text>
            <View style={s.fieldRight}>
              <Text style={courseYear ? s.fieldValue : s.fieldPlaceholder}>
                {courseYear ? `${courseYear}º Ano` : 'Todos'}
              </Text>
              <Ionicons
                name={open === 'courseYear' ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={t.textSecondary}
              />
            </View>
          </TouchableOpacity>
          {open === 'courseYear' && (
            <View style={s.dropdown}>
              {[null, 1, 2, 3].map((y) => (
                <TouchableOpacity
                  key={String(y)}
                  style={s.dropItem}
                  onPress={() => {
                    setCourseYear(y);
                    setCourse(null);
                    setOpen(null);
                  }}
                  accessibilityLabel={y ? `${y}º Ano` : 'Todos os anos'}
                >
                  <Text style={[s.dropText, courseYear === y && s.dropTextActive]}>
                    {y ? `${y}º Ano` : 'Todos'}
                  </Text>
                  {courseYear === y && <Ionicons name="checkmark" size={14} color={t.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={s.divider} />

          {/* Semestre */}
          <TouchableOpacity
            style={s.fieldRow}
            onPress={() => toggle('courseSemester')}
            accessibilityLabel="Selecionar semestre"
          >
            <Text style={s.fieldLabel}>Semestre</Text>
            <View style={s.fieldRight}>
              <Text style={courseSemester ? s.fieldValue : s.fieldPlaceholder}>
                {courseSemester ? `${courseSemester}º Semestre` : 'Todos'}
              </Text>
              <Ionicons
                name={open === 'courseSemester' ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={t.textSecondary}
              />
            </View>
          </TouchableOpacity>
          {open === 'courseSemester' && (
            <View style={s.dropdown}>
              {[null, 1, 2].map((sVal) => (
                <TouchableOpacity
                  key={String(sVal)}
                  style={s.dropItem}
                  onPress={() => {
                    setCourseSemester(sVal);
                    setCourse(null);
                    setOpen(null);
                  }}
                  accessibilityLabel={sVal ? `${sVal}º Semestre` : 'Todos os semestres'}
                >
                  <Text style={[s.dropText, courseSemester === sVal && s.dropTextActive]}>
                    {sVal ? `${sVal}º Semestre` : 'Todos'}
                  </Text>
                  {courseSemester === sVal && <Ionicons name="checkmark" size={14} color={t.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={s.divider} />

          {/* Cadeira */}
          <TouchableOpacity
            style={s.fieldRow}
            onPress={() => toggle('course')}
            accessibilityLabel="Selecionar cadeira"
          >
            <Text style={s.fieldLabel}>Cadeira</Text>
            <View style={s.fieldRight}>
              {loadingCourses ? (
                <ActivityIndicator size="small" color={t.accent} />
              ) : (
                <>
                  <Text
                    style={course ? s.fieldValue : s.fieldPlaceholder}
                    numberOfLines={1}
                  >
                    {course ? `${course.code} – ${course.name}` : 'Selecionar'}
                  </Text>
                  <Ionicons
                    name={open === 'course' ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={t.textSecondary}
                  />
                </>
              )}
            </View>
          </TouchableOpacity>
          {open === 'course' && (
            <View style={s.dropdown}>
              {courses.length === 0 ? (
                <Text style={[s.dropText, { padding: 14 }]}>Sem cadeiras disponíveis.</Text>
              ) : (
                (() => {
                  const filtered = courses.filter((c) => {
                    const matchYear = !courseYear || c.year === courseYear;
                    const matchSemester = !courseSemester || c.semester === courseSemester;
                    return matchYear && matchSemester;
                  });

                  if (filtered.length === 0) {
                    return (
                      <Text style={[s.dropText, { padding: 16, textAlign: 'center', opacity: 0.6 }]}>
                        Nenhuma cadeira encontrada para os filtros selecionados.
                      </Text>
                    );
                  }

                  return filtered.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={s.dropItem}
                      onPress={() => { setCourse(c); setOpen(null); }}
                      accessibilityLabel={`${c.code} ${c.name}`}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[s.dropText, course?.id === c.id && s.dropTextActive]}>
                          {c.name}
                        </Text>
                        <Text style={s.dropSubText}>{c.code}</Text>
                      </View>
                      {course?.id === c.id && (
                        <Ionicons name="checkmark" size={14} color={t.accent} />
                      )}
                    </TouchableOpacity>
                  ));
                })()
              )}
            </View>
          )}

          <View style={s.divider} />

          {/* Ano letivo */}
          <TouchableOpacity
            style={s.fieldRow}
            onPress={() => toggle('year')}
            accessibilityLabel="Selecionar ano letivo"
          >
            <Text style={s.fieldLabel}>Ano letivo</Text>
            <View style={s.fieldRight}>
              <Text style={s.fieldValue}>{year}</Text>
              <Ionicons
                name={open === 'year' ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={t.textSecondary}
              />
            </View>
          </TouchableOpacity>
          {open === 'year' && (
            <View style={s.dropdown}>
              {ACADEMIC_YEARS.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={s.dropItem}
                  onPress={() => { setYear(y); setOpen(null); }}
                  accessibilityLabel={y}
                >
                  <Text style={[s.dropText, year === y && s.dropTextActive]}>{y}</Text>
                  {year === y && <Ionicons name="checkmark" size={14} color={t.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={s.divider} />

          {/* Tipo */}
          <TouchableOpacity
            style={s.fieldRow}
            onPress={() => toggle('type')}
            accessibilityLabel="Selecionar tipo de material"
          >
            <Text style={s.fieldLabel}>Tipo</Text>
            <View style={s.fieldRight}>
              <Text style={materialType ? s.fieldValue : s.fieldPlaceholder}>
                {typeLabel ?? 'Selecionar'}
              </Text>
              <Ionicons
                name={open === 'type' ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={t.textSecondary}
              />
            </View>
          </TouchableOpacity>
          {open === 'type' && (
            <View style={s.dropdown}>
              {TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={s.dropItem}
                  onPress={() => { setMaterialType(opt.value); setOpen(null); }}
                  accessibilityLabel={opt.label}
                >
                  <Text style={[s.dropText, materialType === opt.value && s.dropTextActive]}>
                    {opt.label}
                  </Text>
                  {materialType === opt.value && (
                    <Ionicons name="checkmark" size={14} color={t.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── File picker ── */}
        <Text style={s.sectionLabel}>Ficheiro Principal (Sem Resolução) *</Text>
        <TouchableOpacity
          style={[s.filePicker, pickedFile && s.filePickerActive]}
          onPress={() => pickFile('unsolved')}
          accessibilityRole="button"
          accessibilityLabel="Escolher ficheiro principal"
        >
          <View style={[s.fileIconWrap, pickedFile && s.fileIconWrapActive]}>
            <Ionicons
              name={pickedFile ? 'document-attach' : 'cloud-upload-outline'}
              size={24}
              color={pickedFile ? t.accent : t.textSecondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[s.filePickerLabel, pickedFile && { color: t.accent }]}
              numberOfLines={1}
            >
              {pickedFile ? pickedFile.name : 'Escolher ficheiro *'}
            </Text>
            <Text style={s.filePickerSub}>
              {pickedFile
                ? pickedFile.size
                  ? `${(pickedFile.size / 1024).toFixed(1)} KB  ·  Toca para substituir`
                  : 'Toca para substituir'
                : 'PDF, DOC, Imagem'}
            </Text>
          </View>
          {pickedFile && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); setPickedFile(null); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Remover ficheiro principal"
            >
              <Ionicons name="close-circle" size={20} color={t.textSecondary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* ── Solved File picker ── */}
        <Text style={s.sectionLabel}>Resolução / Soluções (Opcional)</Text>
        <TouchableOpacity
          style={[s.filePicker, pickedFileSolved && s.filePickerActive]}
          onPress={() => pickFile('solved')}
          accessibilityRole="button"
          accessibilityLabel="Escolher resolução"
        >
          <View style={[s.fileIconWrap, pickedFileSolved && s.fileIconWrapActive]}>
            <Ionicons
              name={pickedFileSolved ? 'document-attach' : 'checkmark-circle-outline'}
              size={24}
              color={pickedFileSolved ? t.accent : t.textSecondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[s.filePickerLabel, pickedFileSolved && { color: t.accent }]}
              numberOfLines={1}
            >
              {pickedFileSolved ? pickedFileSolved.name : 'Escolher resolução'}
            </Text>
            <Text style={s.filePickerSub}>
              {pickedFileSolved
                ? pickedFileSolved.size
                  ? `${(pickedFileSolved.size / 1024).toFixed(1)} KB  ·  Toca para substituir`
                  : 'Toca para substituir'
                : 'PDF da resolução ou gabarito'}
            </Text>
          </View>
          {pickedFileSolved && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); setPickedFileSolved(null); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Remover resolução"
            >
              <Ionicons name="close-circle" size={20} color={t.textSecondary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[s.submitBtn, uploading && s.submitBtnDisabled]}
          onPress={submit}
          disabled={uploading}
          accessibilityLabel="Enviar material"
          accessibilityRole="button"
        >
          {uploading ? (
            <ActivityIndicator size="small" color={t.isDark ? t.background : '#fff'} style={{ marginRight: 8 }} />
          ) : (
            <Ionicons
              name="cloud-upload-outline"
              size={18}
              color={t.isDark ? t.background : '#fff'}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={s.submitBtnText}>
            {uploading ? 'A enviar…' : 'Enviar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
      marginBottom: 24,
    },
    backBtn: {
      padding: 2,
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      color: t.textPrimary,
    },

    // Error
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

    // Section label
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: t.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
      marginBottom: 8,
    },

    // Text inputs
    textInput: {
      backgroundColor: t.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: t.textPrimary,
      marginBottom: 16,
    },
    textArea: {
      minHeight: 72,
      textAlignVertical: 'top',
    },

    // Form card
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
      maxWidth: '60%',
    },
    fieldValue: {
      fontSize: 14,
      color: t.textSecondary,
      textAlign: 'right',
      flexShrink: 1,
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
    dropSubText: {
      fontSize: 11,
      color: t.textMuted,
      marginTop: 2,
    },
    dropTextActive: {
      color: t.accent,
      fontWeight: '600',
    },

    // File picker
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
      marginBottom: 24,
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

    // Submit button
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.accent,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: t.isDark ? t.accentGlow : 'transparent',
      shadowOpacity: t.isDark ? 0.55 : 0,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    submitBtnDisabled: {
      opacity: 0.7,
    },
    submitBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: t.isDark ? t.background : '#fff',
    },
    secondaryBtn: {
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.surfaceBorder,
      shadowOpacity: 0,
      elevation: 0,
    },

    // Success
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
      marginLeft: 8,
    },
  });
}
