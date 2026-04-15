import { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCourseById } from '../../services/courses';
import { getMaterialsByCourse } from '../../services/materials';

const TYPE_COLORS: Record<string, string> = {
  notes: '#4CAF50',
  exam: '#F44336',
  exercise: '#FF9800',
  summary: '#2196F3',
};

type Course = { id: string; code: string; name: string; year: number };
type Material = { id: string; title: string; type: string };

export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getCourseById(id), getMaterialsByCourse(id)])
      .then(([c, m]) => {
        setCourse(c);
        setMaterials(m);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

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
        data={materials}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No materials yet.</Text>}
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
  empty: {
    textAlign: 'center',
    color: '#687076',
    marginTop: 40,
    fontSize: 14,
  },
});
