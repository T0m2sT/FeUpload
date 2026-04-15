import { useLocalSearchParams, useRouter } from 'expo-router';
import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import { COURSES } from '@/constants/courses';

export default function CourseSummariesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const course = COURSES[id ?? ''];
  const items = course?.materials.filter((m) => m.type === 'Resumo') ?? [];

  return (
    <CourseSectionShell
      courseId={id ?? ''}
      courseCode={course?.code ?? ''}
      courseName={course?.name ?? ''}
      activeKey="summaries"
      onUpload={() => router.push('/upload')}
    >
      <MaterialList items={items} emptyMessage="Sem resumos disponíveis." />
    </CourseSectionShell>
  );
}
