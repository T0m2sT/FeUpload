import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import PdfViewer from '../../app/pdf-viewer';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';
import { supabase } from '../../lib/supabase';

jest.mock('../../hooks/use-app-theme');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Stack: { Screen: () => null },
}));
jest.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));
jest.mock('../../hooks/use-is-online', () => ({
  useIsOnline: jest.fn(() => true),
}));

describe('PdfViewer - Q&A', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ pdf: 'url' });
  });

  it('sends question and displays answer', async () => {
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { answer: 'Answer 1' },
      error: null,
    });

    const { getByPlaceholderText, getByText, getByLabelText } = render(<PdfViewer />);
    
    // Open QA
    fireEvent.press(getByLabelText('chatbubble-ellipses-outline'));
    
    // Ask question
    fireEvent.changeText(getByPlaceholderText('Faz uma pergunta...'), 'Question 1');
    fireEvent.press(getByLabelText('arrow-up'));

    await waitFor(() => expect(supabase.functions.invoke).toHaveBeenCalled());
    expect(await waitFor(() => getByText('Answer 1'))).toBeDefined();
  });
});
