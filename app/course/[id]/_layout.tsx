import { Stack } from 'expo-router';

export default function CourseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Zero-duration transition so switching between Exames/Exercícios/Resumos/Dicas
        // feels instantaneous — the chrome stays fixed, only the list changes.
        animation: 'none',
      }}
    />
  );
}
