import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CourseNavBar } from '../../components/course-nav-bar';
import { useAppTheme } from '../../hooks/use-app-theme';
import { useRouter } from 'expo-router';
import { darkPalette } from '../../constants/theme';

jest.mock('../../hooks/use-app-theme');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('CourseNavBar', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders all navigation items', () => {
    const { getByText } = render(<CourseNavBar courseId="c1" />);

    expect(getByText('Exames')).toBeDefined();
    expect(getByText('Exercícios')).toBeDefined();
    expect(getByText('Resumos')).toBeDefined();
    expect(getByText('Dicas')).toBeDefined();
  });

  it('navigates to exams route when pressed', () => {
    const { getByLabelText } = render(<CourseNavBar courseId="c1" />);

    fireEvent.press(getByLabelText('Exames'));
    expect(mockPush).toHaveBeenCalledWith('/course/c1/exams');
  });

  it('navigates to exercises route when pressed', () => {
    const { getByLabelText } = render(<CourseNavBar courseId="c1" />);

    fireEvent.press(getByLabelText('Exercícios'));
    expect(mockPush).toHaveBeenCalledWith('/course/c1/exercises');
  });

  it('navigates to summaries route when pressed', () => {
    const { getByLabelText } = render(<CourseNavBar courseId="c1" />);

    fireEvent.press(getByLabelText('Resumos'));
    expect(mockPush).toHaveBeenCalledWith('/course/c1/summaries');
  });

  it('navigates to tips route when pressed', () => {
    const { getByLabelText } = render(<CourseNavBar courseId="c1" />);

    fireEvent.press(getByLabelText('Dicas'));
    expect(mockPush).toHaveBeenCalledWith('/course/c1/tips');
  });

  it('uses the courseId in the navigation path', () => {
    const { getByLabelText } = render(<CourseNavBar courseId="course-abc" />);

    fireEvent.press(getByLabelText('Exames'));
    expect(mockPush).toHaveBeenCalledWith('/course/course-abc/exams');
  });

  it('highlights the active item with accent color', () => {
    const { getByText } = render(<CourseNavBar courseId="c1" activeKey="exams" />);

    expect(getByText('Exames').props.style).toContainEqual({ color: darkPalette.tabActive });
  });

  it('applies inactive color to non-active items', () => {
    const { getByText } = render(<CourseNavBar courseId="c1" activeKey="exams" />);

    expect(getByText('Exercícios').props.style).toContainEqual({ color: darkPalette.tabInactive });
    expect(getByText('Resumos').props.style).toContainEqual({ color: darkPalette.tabInactive });
    expect(getByText('Dicas').props.style).toContainEqual({ color: darkPalette.tabInactive });
  });

  it('applies inactive color to all items when no activeKey is set', () => {
    const { getByText } = render(<CourseNavBar courseId="c1" />);

    expect(getByText('Exames').props.style).toContainEqual({ color: darkPalette.tabInactive });
    expect(getByText('Exercícios').props.style).toContainEqual({ color: darkPalette.tabInactive });
  });
});
