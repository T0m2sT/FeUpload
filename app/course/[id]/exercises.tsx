import { useLocalSearchParams, useRouter } from 'expo-router';
import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import { COURSES } from '@/constants/courses';


export default function CourseExercisesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const course = COURSES[id ?? ''];
  const items = course?.materials.filter((m) => m.type === 'Ficha') ?? [];

  return (
    <CourseSectionShell
      courseId={id ?? ''}
      courseCode={course?.code ?? ''}
      courseName={course?.name ?? ''}
      activeKey="exercises"
      onUpload={() => router.push('/upload')}
    >
      <MaterialList items={items} emptyMessage="Sem fichas disponíveis." />
    </CourseSectionShell>
  );
}
