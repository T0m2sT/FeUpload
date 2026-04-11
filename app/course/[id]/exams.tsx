import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/use-app-theme';
import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import { COURSES } from '@/constants/courses';

export default function CourseExamsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const t = useAppTheme();
  const course = COURSES[id ?? ''];
  const items = course?.materials.filter((m) => m.type === 'Exame') ?? [];

  return (
    <CourseSectionShell
      courseId={id ?? ''}
      courseCode={course?.code ?? ''}
      courseName={course?.name ?? ''}
      activeKey="exams"
      onUpload={() => router.push('/upload')}
    >
      <MaterialList items={items} emptyMessage="Sem exames disponíveis." />
    </CourseSectionShell>
  );
}
