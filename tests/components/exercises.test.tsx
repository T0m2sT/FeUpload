import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CourseExercisesScreen from '../../app/course/[id]/exercises';
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

const mockExercisesData = [
  {
    id: 'ex1',
    title: 'Ficha Prática 1',
    description: 'Ficha sobre Git',
    file_url: 'https://example.com/ex1.pdf',
    rating: 3,
    created_at: '2026-05-18T10:00:00.000Z',
  },
  {
    id: 'ex2',
    title: 'Ficha Prática 2',
    description: 'Ficha sobre TypeScript',
    file_url: 'https://example.com/ex2.pdf',
    rating: 5,
    created_at: '2026-05-19T10:00:00.000Z',
  },
  {
    id: 'ex3',
    title: 'Ficha Prática 3',
    description: 'Ficha sobre React Native',
    file_url: 'https://example.com/ex3.pdf',
    rating: 3,
    created_at: '2026-05-20T10:00:00.000Z',
  },
];

describe('CourseExercisesScreen Sorting & Filters', () => {
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
    (getMaterialsByClassCodeAndType as jest.Mock).mockResolvedValue(mockExercisesData);
  });

  it('renders sorting buttons and course title', async () => {
    const { getByText } = render(<CourseExercisesScreen />);
    
    expect(getByText('Ordenar por:')).toBeDefined();
    expect(getByText('Avaliação')).toBeDefined();
    expect(getByText('Data')).toBeDefined();

    await waitFor(() => {
      expect(getByText('Ficha Prática 1')).toBeDefined();
      expect(getByText('Ficha Prática 2')).toBeDefined();
      expect(getByText('Ficha Prática 3')).toBeDefined();
    });
  });

  it('sorts exercises by rating by default (with date fallback for equal ratings)', async () => {
    const { getAllByLabelText } = render(<CourseExercisesScreen />);

    await waitFor(() => {
      // By default (Rating):
      // ex2 (Rating 5) should be first.
      // ex3 (Rating 3, newer date 2026-05-20) should be second.
      // ex1 (Rating 3, older date 2026-05-18) should be third.
      const rowElements = getAllByLabelText(/Ficha Prática \d/);
      expect(rowElements).toHaveLength(3);
      expect(rowElements[0].props.accessibilityLabel).toBe('Ficha Prática 2'); // ex2
      expect(rowElements[1].props.accessibilityLabel).toBe('Ficha Prática 3'); // ex3
      expect(rowElements[2].props.accessibilityLabel).toBe('Ficha Prática 1'); // ex1
    });
  });

  it('sorts exercises by date descending when clicking Data button', async () => {
    const { getByText, getAllByLabelText } = render(<CourseExercisesScreen />);

    await waitFor(() => {
      expect(getByText('Ficha Prática 1')).toBeDefined();
    });

    // Press the Date button
    fireEvent.press(getByText('Data'));

    // By Date (descending):
    // ex3 (2026-05-20) should be first.
    // ex2 (2026-05-19) should be second.
    // ex1 (2026-05-18) should be third.
    const rowElements = getAllByLabelText(/Ficha Prática \d/);
    expect(rowElements[0].props.accessibilityLabel).toBe('Ficha Prática 3'); // ex3
    expect(rowElements[1].props.accessibilityLabel).toBe('Ficha Prática 2'); // ex2
    expect(rowElements[2].props.accessibilityLabel).toBe('Ficha Prática 1'); // ex1
  });

  it('sorts back to rating when clicking Avaliação button after sorting by Data', async () => {
    const { getByText, getAllByLabelText } = render(<CourseExercisesScreen />);

    await waitFor(() => {
      expect(getByText('Ficha Prática 1')).toBeDefined();
    });

    // Press Date, then back to Rating
    fireEvent.press(getByText('Data'));
    fireEvent.press(getByText('Avaliação'));

    const rowElements = getAllByLabelText(/Ficha Prática \d/);
    expect(rowElements[0].props.accessibilityLabel).toBe('Ficha Prática 2'); // ex2
    expect(rowElements[1].props.accessibilityLabel).toBe('Ficha Prática 3'); // ex3
    expect(rowElements[2].props.accessibilityLabel).toBe('Ficha Prática 1'); // ex1
  });
});
