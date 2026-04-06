import { Text, View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COURSES: Record<string, { name: string; code: string; materials: { id: string; title: string; type: string }[] }> = {
  '1': {
    name: 'Engenharia de Software',
    code: 'ESOF',
    materials: [
      { id: 'm1', title: 'Lecture Notes — Agile Methods', type: 'Notes' },
      { id: 'm2', title: 'Exam 2024/2025', type: 'Exam' },
      { id: 'm3', title: 'Exercise Sheet 1', type: 'Exercises' },
    ],
  },
  '2': {
    name: 'Base de Dados',
    code: 'BD',
    materials: [
      { id: 'm1', title: 'ER Diagram Guide', type: 'Notes' },
      { id: 'm2', title: 'Exam 2023/2024', type: 'Exam' },
    ],
  },
  '3': {
    name: 'Laboratório de Computadores',
    code: 'LCOM',
    materials: [
      { id: 'm1', title: 'TCP/IP Summary', type: 'Notes' },
      { id: 'm2', title: 'Lab 1 — Serial Port', type: 'Exercises' },
    ],
  },
  '4': {
    name: 'Algoritmos e Estruturas de Dados',
    code: 'AED',
    materials: [
      { id: 'm1', title: 'Sorting Algorithms Cheatsheet', type: 'Notes' },
      { id: 'm2', title: 'Exam 2024/2025', type: 'Exam' },
    ],
  },
  '5': {
    name: 'Sistemas Operativos',
    code: 'SO',
    materials: [
      { id: 'm1', title: 'Process Management Notes', type: 'Notes' },
      { id: 'm2', title: 'Exam 2023/2024', type: 'Exam' },
    ],
  },
};

const TYPE_COLORS: Record<string, string> = {
  Notes: '#4CAF50',
  Exam: '#F44336',
  Exercises: '#FF9800',
};

export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const course = COURSES[id ?? ''];

  if (!course) {
    return (
      <View style={styles.container}>
        <Text>Course not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#0a7ea4" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text testID="course-code" style={styles.code}>{course.code}</Text>
      <Text testID="course-name" style={styles.title}>{course.name}</Text>
      <Text testID="section-header" style={styles.sectionHeader}>Study Materials</Text>

      <FlatList
        data={course.materials}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.materialCard} testID={`material-${item.id}`} accessibilityLabel={item.title}>
            <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[item.type] ?? '#999' }]}>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
            <Text style={styles.materialTitle}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    color: '#0a7ea4',
    fontSize: 16,
    marginLeft: 4,
  },
  code: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0a7ea4',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#687076',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  materialCard: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  materialTitle: {
    fontSize: 14,
    color: '#11181C',
    flex: 1,
  },
});
