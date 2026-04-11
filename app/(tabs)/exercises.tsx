// Exercises are now course-scoped: /course/[id]/exercises
// This route is kept so expo-router doesn't error on the tab definition,
// but it immediately redirects to home.
import { Redirect } from 'expo-router';
export default function ExercisesRedirect() {
  return <Redirect href="/" />;
}
