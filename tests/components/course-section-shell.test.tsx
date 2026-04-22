import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CourseSectionShell } from '../../components/course-section-shell';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useRouter } from 'expo-router';
import { darkPalette } from '../../constants/theme';
import { Text } from 'react-native';

jest.mock('../../hooks/use-app-theme');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const DEFAULT_PROPS = {
  courseId: 'c1',
  courseCode: 'ESOF',
  courseName: 'Engenharia de Software',
  activeKey: 'exams' as const,
};

describe('CourseSectionShell', () => {
  const mockReplace = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace, push: mockPush });
  });

  it('renders course name, code and children', () => {
    const { getByText } = render(
      <CourseSectionShell {...DEFAULT_PROPS}>
        <Text>Content Area</Text>
      </CourseSectionShell>
    );

    expect(getByText('Engenharia de Software')).toBeDefined();
    expect(getByText('Content Area')).toBeDefined();
    expect(getByText('ESOF')).toBeDefined();
  });

  it('renders all tab labels', () => {
    const { getByText } = render(
      <CourseSectionShell {...DEFAULT_PROPS}>
        <Text>Content</Text>
      </CourseSectionShell>
    );

    expect(getByText('Exames')).toBeDefined();
    expect(getByText('Exercícios')).toBeDefined();
    expect(getByText('Resumos')).toBeDefined();
    expect(getByText('Dicas')).toBeDefined();
    expect(getByText('Fórum')).toBeDefined();
  });

  it('navigates to exercises tab using replace', () => {
    const { getByText } = render(
      <CourseSectionShell {...DEFAULT_PROPS}>
        <Text>Content</Text>
      </CourseSectionShell>
    );

    fireEvent.press(getByText('Exercícios'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/course/[id]/exercises',
      params: { id: 'c1', name: 'Engenharia de Software', description: '' },
    });
  });

  it('navigates to summaries tab using replace', () => {
    const { getByText } = render(
      <CourseSectionShell {...DEFAULT_PROPS}>
        <Text>Content</Text>
      </CourseSectionShell>
    );

    fireEvent.press(getByText('Resumos'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/course/[id]/summaries',
      params: { id: 'c1', name: 'Engenharia de Software', description: '' },
    });
  });

  it('navigates to tips tab using replace', () => {
    const { getByText } = render(
      <CourseSectionShell {...DEFAULT_PROPS}>
        <Text>Content</Text>
      </CourseSectionShell>
    );

    fireEvent.press(getByText('Dicas'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/course/[id]/tips',
      params: { id: 'c1', name: 'Engenharia de Software', description: '' },
    });
  });

  it('navigates to threads tab using replace', () => {
    const { getByText } = render(
      <CourseSectionShell {...DEFAULT_PROPS}>
        <Text>Content</Text>
      </CourseSectionShell>
    );

    fireEvent.press(getByText('Fórum'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/course/[id]/threads',
      params: { id: 'c1', name: 'Engenharia de Software', description: '' },
    });
  });

  it('does not navigate when pressing the already-active tab', () => {
    const { getByText } = render(
      <CourseSectionShell {...DEFAULT_PROPS}>
        <Text>Content</Text>
      </CourseSectionShell>
    );

    fireEvent.press(getByText('Exames'));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('navigates back to course index when clicking back button', () => {
    const { getByLabelText } = render(
      <CourseSectionShell {...DEFAULT_PROPS}>
        <Text>Content</Text>
      </CourseSectionShell>
    );

    fireEvent.press(getByLabelText('Voltar para cadeira'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/course/[id]',
      params: { id: 'c1', name: 'Engenharia de Software', description: '' },
    });
  });

  it('navigates to home when pressing logo', () => {
    const { getByLabelText } = render(
      <CourseSectionShell {...DEFAULT_PROPS}>
        <Text>Content</Text>
      </CourseSectionShell>
    );

    fireEvent.press(getByLabelText('Ir para o início'));
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('triggers onUpload callback when pressing upload button', () => {
    const mockUpload = jest.fn();
    const { getByLabelText } = render(
      <CourseSectionShell {...DEFAULT_PROPS} onUpload={mockUpload}>
        <Text>Content</Text>
      </CourseSectionShell>
    );

    fireEvent.press(getByLabelText('Enviar material'));
    expect(mockUpload).toHaveBeenCalled();
  });

  it('does not render upload button when onUpload is not provided', () => {
    const { queryByLabelText } = render(
      <CourseSectionShell {...DEFAULT_PROPS}>
        <Text>Content</Text>
      </CourseSectionShell>
    );

    expect(queryByLabelText('Enviar material')).toBeNull();
  });

  it('uses courseDescription in navigation params when provided', () => {
    const { getByText } = render(
      <CourseSectionShell {...DEFAULT_PROPS} courseDescription="Engenharia de Software moderna">
        <Text>Content</Text>
      </CourseSectionShell>
    );

    fireEvent.press(getByText('Exercícios'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/course/[id]/exercises',
      params: { id: 'c1', name: 'Engenharia de Software', description: 'Engenharia de Software moderna' },
    });
  });

  it('passes courseId correctly to navigation calls', () => {
    const { getByText } = render(
      <CourseSectionShell
        courseId="c99"
        courseCode="BD"
        courseName="Bases de Dados"
        activeKey="exams"
      >
        <Text>Content</Text>
      </CourseSectionShell>
    );

    fireEvent.press(getByText('Resumos'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/course/[id]/summaries',
      params: { id: 'c99', name: 'Bases de Dados', description: '' },
    });
  });
});
