import { CourseSectionShell } from '@/components/course-section-shell';
import { MaterialList } from '@/components/material-list';
import { Material } from '@/constants/courses';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';



export default function CourseExamsScreen() {
  const { id, name, description } = useLocalSearchParams<{
    id: string | string[];
    name?: string | string[];
    description?: string | string[];
  }>();
  const router = useRouter();
  const courseId = Array.isArray(id) ? id[0] : id;
  const courseCode = (courseId ?? 'XX').toUpperCase();
  const courseNameParam = Array.isArray(name) ? name[0] : name;
  const courseDescription = Array.isArray(description) ? description[0] : description;
  
  const [exams, setExams] = useState<Material[]>([]);
  
  useEffect(() => {
      const fetchExams = async () => {
        if (!courseId) {
          setExams([]);
          return;
        }

        const { data, error } = await supabase
          .from('materials')
          .select('id, title, file_url, academic_year, class_code, type')
          .eq('type', 'exam')
          .eq('class_code', courseCode);
  
        if (error) {
          console.log(error);
          setExams([]);
          return;
        }

        const mappedExams: Material[] = (data ?? []).map((exam) => ({
          id: exam.id,
          title: exam.title,
          type: 'exam',
          subtitle: exam.academic_year ?? undefined,
          pdf: exam.file_url ?? undefined,
        }));

        setExams(mappedExams);
      };
  
      fetchExams();
    }, [courseCode, courseId]);

  return (
    <CourseSectionShell
      courseId={courseCode}
      courseCode={courseCode}
      courseName={courseNameParam ?? 'Undefined'}
      courseDescription={courseDescription}
      activeKey="exams"
      onUpload={() => router.push('/upload')}
    >
      <MaterialList items={exams} emptyMessage="Sem exames disponíveis." courseCode={courseCode} />
    </CourseSectionShell>
  );
}
