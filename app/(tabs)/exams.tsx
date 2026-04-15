import { useEffect, useState } from 'react';
import { FlatList, Linking, Text, TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { getMaterialsByType } from '../../services/materials';

type Exam = {
  id: string;
  title: string;
  file_url: string | null;
  academic_year: string | null;
  courses: { code: string; name: string } | null;
  profiles: { name: string } | null;
};

export default function ExamsScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMaterialsByType('exam')
      .then(setExams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openPDF = (url: string) => {
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Exams</Text>
      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No exams uploaded yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => item.file_url && openPDF(item.file_url)}
            style={styles.card}
            disabled={!item.file_url}
          >
            <Text style={styles.title}>{item.title}</Text>
            {item.courses && <Text style={styles.meta}>{item.courses.code}</Text>}
            {item.academic_year && <Text style={styles.meta}>{item.academic_year}</Text>}
          </TouchableOpacity>
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
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#11181C',
  },
  card: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  meta: {
    fontSize: 12,
    color: '#687076',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#687076',
    marginTop: 40,
    fontSize: 14,
  },
});
