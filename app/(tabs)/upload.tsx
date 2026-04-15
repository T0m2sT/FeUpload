import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getCourses } from '../../services/courses';
import { uploadMaterial } from '../../services/materials';
import { supabase } from '../../lib/supabase';

const YEARS = ['2025/2026', '2024/2025', '2023/2024', '2022/2023', '2021/2022'];

type Course = { id: string; code: string; name: string };

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [showCourseList, setShowCourseList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFilePick = () => {
    setFileName('exam_2025.pdf');
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitted(false);

    if (!title.trim()) {
      setError('Please enter a title for the exam.');
      return;
    }
    if (!selectedCourse) {
      setError('Please select a course.');
      return;
    }
    if (!selectedYear) {
      setError('Please select an academic year.');
      return;
    }
    if (!fileName) {
      setError('Please select a file to upload.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to upload.');
        return;
      }

      await uploadMaterial({
        title: title.trim(),
        type: 'exam',
        course_id: selectedCourse.id,
        user_id: user.id,
        academic_year: selectedYear,
      });

      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>Upload Successful!</Text>
          <Text style={styles.successDetail}>Title: {title}</Text>
          <Text style={styles.successDetail}>Course: {selectedCourse?.name}</Text>
          <Text style={styles.successDetail}>Year: {selectedYear}</Text>
          <Text style={styles.successDetail}>File: {fileName}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setTitle('');
              setSelectedCourse(null);
              setSelectedYear('');
              setFileName('');
              setSubmitted(false);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Upload Another Exam</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>Upload Exam</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Final Exam 2025"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          accessibilityLabel="Title"
        />

        <Text style={styles.label}>Course</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => {
            setShowCourseList(!showCourseList);
            setShowYearList(false);
          }}
          accessibilityRole="button"
          accessibilityLabel="Select course"
        >
          <Text style={selectedCourse ? styles.selectorText : styles.selectorPlaceholder}>
            {selectedCourse ? selectedCourse.name : 'Select a course'}
          </Text>
        </TouchableOpacity>
        {showCourseList && (
          <View style={styles.dropdown}>
            {courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedCourse(course);
                  setShowCourseList(false);
                }}
              >
                <Text style={styles.dropdownText}>{course.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Academic Year</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => {
            setShowYearList(!showYearList);
            setShowCourseList(false);
          }}
          accessibilityRole="button"
          accessibilityLabel="Select year"
        >
          <Text style={selectedYear ? styles.selectorText : styles.selectorPlaceholder}>
            {selectedYear || 'Select an academic year'}
          </Text>
        </TouchableOpacity>
        {showYearList && (
          <View style={styles.dropdown}>
            {YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedYear(year);
                  setShowYearList(false);
                }}
              >
                <Text style={styles.dropdownText}>{year}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>File</Text>
        <TouchableOpacity
          style={styles.fileButton}
          onPress={handleFilePick}
          accessibilityRole="button"
          accessibilityLabel="Pick file"
        >
          <Text style={styles.fileButtonText}>
            {fileName || 'Choose a file'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit"
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Uploading...' : 'Upload Exam'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#11181C',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
    color: '#11181C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  selectorText: {
    fontSize: 16,
    color: '#11181C',
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
    color: '#11181C',
  },
  fileButton: {
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f0f9fc',
  },
  fileButtonText: {
    fontSize: 16,
    color: '#0a7ea4',
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c6f6d5',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#276749',
    marginBottom: 16,
  },
  successDetail: {
    fontSize: 16,
    color: '#2d3748',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
