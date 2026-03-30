import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const COURSES = [
  { id: '1', name: 'Engenharia de Software', code: 'ESOF', year: '2' },
  { id: '2', name: 'Base de Dados', code: 'BD', year: '2' },
  { id: '3', name: 'Laboratório de Computadores', code: 'LCOM', year: '2' },
  { id: '4', name: 'Algoritmos e Estruturas de Dados', code: 'AED', year: '2' },
  { id: '5', name: 'Sistemas Operativos', code: 'SO', year: '2' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courses</Text>
      <FlatList
        data={COURSES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/course/${item.id}`)}
            testID={`course-${item.id}`}
            accessibilityLabel={item.name}
          >
            <Text style={styles.courseCode}>{item.code}</Text>
            <Text style={styles.courseName}>{item.name}</Text>
            <Text style={styles.courseYear}>Year {item.year}</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#11181C',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0a7ea4',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 4,
  },
  courseYear: {
    fontSize: 12,
    color: '#687076',
  },
});
