// Exercises are now course-scoped: /course/[id]/exercises
// This route is kept so expo-router doesn't error on the tab definition,
// but it immediately redirects to home.
import { Redirect } from 'expo-router';
export default function ExercisesRedirect() {
  return <Redirect href="/" />;
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
