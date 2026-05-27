import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import MaterialDetailScreen from '../../app/material/[id]';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';
import { supabase } from '../../lib/supabase';

jest.mock('../../hooks/use-app-theme');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));
jest.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

describe('MaterialDetailScreen - Flashcards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
    (useRouter as jest.Mock).mockReturnValue({});
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'm1' });
  });

  it('generates and displays flashcards', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { questions: [{ question: 'Q1', answer: 'A1' }] },
      error: null,
    });

    const { getByText, findByText } = render(<MaterialDetailScreen />);
    fireEvent.press(getByText('Gerar fichas de estudo'));

    await waitFor(() => expect(supabase.functions.invoke).toHaveBeenCalledWith('study-questions', expect.anything()));
    expect(await findByText('Q1')).toBeDefined();
    
    fireEvent.press(getByText('Q1')); // Flip
    expect(await findByText('A1')).toBeDefined();
  });
});
