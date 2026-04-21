import { useLocalSearchParams, useRouter } from 'expo-router';
import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import { COURSES } from '@/constants/courses';

export default function CourseExercisesScreen() {
  const { id, name, description } = useLocalSearchParams<{
    id: string;
    name?: string | string[];
    description?: string | string[];
  }>();
  const router = useRouter();
  const courseCode = (id ?? '').toUpperCase();
  const courseNameParam = Array.isArray(name) ? name[0] : name;
  const courseDescription = Array.isArray(description) ? description[0] : description;
  const course =
    Object.values(COURSES).find((c) => c.code.toLowerCase() === courseCode.toLowerCase()) ??
    COURSES[id ?? ''];
  const items = course?.materials.filter((m) => m.type === 'Ficha') ?? [];

  return (
    <CourseSectionShell
      courseId={courseCode}
      courseCode={courseCode}
      courseName={courseNameParam ?? course?.name ?? courseCode}
      courseDescription={courseDescription}
      activeKey="exercises"
      onUpload={() => router.push('/upload')}
    >
      <MaterialList items={items} emptyMessage="Sem fichas disponíveis." />
    </CourseSectionShell>
  );
}
