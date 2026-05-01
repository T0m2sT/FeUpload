import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import MaterialEvaluationScreen from '../../app/material-evaluation';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';
import { createReview, getReviewsByMaterial, refreshMaterialRating } from '../../services/reviews';

jest.mock('../../hooks/use-app-theme');
jest.mock('../../services/reviews', () => ({
  getReviewsByMaterial: jest.fn(),
  createReview: jest.fn(),
  refreshMaterialRating: jest.fn(),
}));
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

function getSupabaseAuth() {
  return jest.requireMock('../../lib/supabase').supabase.auth;
}

describe('MaterialEvaluationScreen', () => {
  const backMock = jest.fn();
  const replaceMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
    (useRouter as jest.Mock).mockReturnValue({ back: backMock, replace: replaceMock });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      materialId: 'm1',
      materialTitle: 'Slides Tópicos 1, 2 e 3',
      courseCode: 'ESOF',
    });
    (getReviewsByMaterial as jest.Mock).mockResolvedValue([{ rating: 4 }, { rating: 2 }]);
    (createReview as jest.Mock).mockResolvedValue({ id: 'r1' });
    (refreshMaterialRating as jest.Mock).mockResolvedValue(3);
    getSupabaseAuth().getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  it('renders selected material info and initial rating label', async () => {
    const { getByText } = render(<MaterialEvaluationScreen />);
    await waitFor(() => expect(getByText('Slides Tópicos 1, 2 e 3')).toBeDefined());
    expect(getByText('Cadeira: ESOF')).toBeDefined();
    expect(getByText('Bom (3/5)')).toBeDefined();
  });

  it('updates rating label when a star is pressed', async () => {
    const { getByLabelText, getByText } = render(<MaterialEvaluationScreen />);
    fireEvent.press(getByLabelText('Classificação 5'));
    await waitFor(() => expect(getByText('Excelente (5/5)')).toBeDefined());
  });

  it('submits review and navigates back to ratings', async () => {
    const { getByText, getByPlaceholderText } = render(<MaterialEvaluationScreen />);
    fireEvent.changeText(getByPlaceholderText('Escreve o teu comentário sobre este documento ...'), 'Bom material');
    fireEvent.press(getByText('Publicar Avaliação'));

    await waitFor(() => {
      expect(createReview).toHaveBeenCalledWith({
        material_id: 'm1',
        user_id: 'u1',
        rating: 3,
        content: 'Bom material',
      });
      expect(refreshMaterialRating).toHaveBeenCalledWith('m1');
      expect(replaceMock).toHaveBeenCalled();
    });
  });
});
