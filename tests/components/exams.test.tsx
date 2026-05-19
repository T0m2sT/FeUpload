import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CourseExamsScreen from '../../app/course/[id]/exams';
import { getMaterialsByClassCodeAndType } from '../../services/materials';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../../hooks/use-app-theme';
import { darkPalette } from '../../constants/theme';

jest.mock('../../hooks/use-app-theme');
jest.mock('../../services/materials', () => ({
  getMaterialsByClassCodeAndType: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  const React = require('react');
  rn.FlatList = ({ data, renderItem, ListEmptyComponent }: any) => {
    if (!data || data.length === 0) {
      return ListEmptyComponent ? (React.isValidElement(ListEmptyComponent) ? ListEmptyComponent : (typeof ListEmptyComponent === 'function' ? ListEmptyComponent() : null)) : null;
    }
    return (
      <rn.ScrollView>
        {data.map((item: any, index: number) => renderItem({ item, index }))}
      </rn.ScrollView>
    );
  };
  return rn;
});

const mockExamsData = [
  {
    id: 'e1',
    title: 'Exame 2022',
    academic_year: '2021/2022',
    file_url: 'https://example.com/e1.pdf',
    file_url_solved: 'https://example.com/e1_solved.pdf',
    is_solved: true,
    rating: 4,
    created_at: '2026-05-18T10:00:00.000Z',
  },
  {
    id: 'e2',
    title: 'Exame 2023',
    academic_year: '2022/2023',
    file_url: 'https://example.com/e2.pdf',
    rating: 5,
    created_at: '2026-05-19T10:00:00.000Z',
  },
  {
    id: 'e3',
    title: 'Exame 2024',
    academic_year: '2023/2024',
    file_url: 'https://example.com/e3.pdf',
    rating: 4,
    created_at: '2026-05-20T10:00:00.000Z',
  },
];

describe('CourseExamsScreen Sorting & Filters', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: 'esof',
      name: 'Engenharia de Software',
      description: 'Cadeira de Engenharia de Software',
    });
    (getMaterialsByClassCodeAndType as jest.Mock).mockResolvedValue(mockExamsData);
  });

  it('renders sorting buttons and course title', async () => {
    const { getByText } = render(<CourseExamsScreen />);
    
    expect(getByText('Ordenar por:')).toBeDefined();
    expect(getByText('Avaliação')).toBeDefined();
    expect(getByText('Data')).toBeDefined();

    await waitFor(() => {
      expect(getByText('Exame 2022')).toBeDefined();
      expect(getByText('Exame 2023')).toBeDefined();
      expect(getByText('Exame 2024')).toBeDefined();
    });
  });

  it('sorts exams by rating by default (with date fallback for equal ratings)', async () => {
    const { getAllByLabelText } = render(<CourseExamsScreen />);

    await waitFor(() => {
      // By default (Rating):
      // e2 (Rating 5) should be first.
      // e3 (Rating 4, newer date 2026-05-20) should be second.
      // e1 (Rating 4, older date 2026-05-18) should be third.
      const examRows = getAllByLabelText(/Exame \d{4}/);
      expect(examRows).toHaveLength(3);
      expect(examRows[0].props.accessibilityLabel).toBe('Exame 2023'); // e2
      expect(examRows[1].props.accessibilityLabel).toBe('Exame 2024'); // e3
      expect(examRows[2].props.accessibilityLabel).toBe('Exame 2022'); // e1
    });
  });

  it('sorts exams by date descending when clicking Data button', async () => {
    const { getByText, getAllByLabelText } = render(<CourseExamsScreen />);

    await waitFor(() => {
      expect(getByText('Exame 2022')).toBeDefined();
    });

    // Press the Date button
    fireEvent.press(getByText('Data'));

    // By Date (descending):
    // e3 (2026-05-20) should be first.
    // e2 (2026-05-19) should be second.
    // e1 (2026-05-18) should be third.
    const examRows = getAllByLabelText(/Exame \d{4}/);
    expect(examRows[0].props.accessibilityLabel).toBe('Exame 2024'); // e3
    expect(examRows[1].props.accessibilityLabel).toBe('Exame 2023'); // e2
    expect(examRows[2].props.accessibilityLabel).toBe('Exame 2022'); // e1
  });

  it('sorts back to rating when clicking Avaliação button after sorting by Data', async () => {
    const { getByText, getAllByLabelText } = render(<CourseExamsScreen />);

    await waitFor(() => {
      expect(getByText('Exame 2022')).toBeDefined();
    });

    // Press Date, then back to Rating
    fireEvent.press(getByText('Data'));
    fireEvent.press(getByText('Avaliação'));

    const examRows = getAllByLabelText(/Exame \d{4}/);
    expect(examRows[0].props.accessibilityLabel).toBe('Exame 2023'); // e2
    expect(examRows[1].props.accessibilityLabel).toBe('Exame 2024'); // e3
    expect(examRows[2].props.accessibilityLabel).toBe('Exame 2022'); // e1
  });
});
