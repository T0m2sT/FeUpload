import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import RatingsScreen from '../../app/ratings';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';
import {
  deleteReview,
  getReviewsByMaterial,
  refreshMaterialRating,
  updateReview,
} from '../../services/reviews';

jest.mock('../../hooks/use-app-theme');
jest.mock('../../services/reviews', () => ({
  getReviewsByMaterial: jest.fn(),
  updateReview: jest.fn(),
  deleteReview: jest.fn(),
  refreshMaterialRating: jest.fn(),
}));
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (effect: () => void | (() => void)) => {
      React.useEffect(() => effect(), [effect]);
    },
  };
});
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

function getSupabaseAuth() {
  return jest.requireMock('../../lib/supabase').supabase.auth;
}

describe('RatingsScreen', () => {
  const backMock = jest.fn();
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
    (useRouter as jest.Mock).mockReturnValue({ back: backMock, push: pushMock });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      materialId: 'm1',
      materialTitle: 'Slides',
      courseCode: 'ESOF',
    });
    getSupabaseAuth().getUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    (getReviewsByMaterial as jest.Mock).mockResolvedValue([
      { id: 'r1', user_id: 'u1', rating: 4, content: 'bom', profiles: { name: 'Tomás Teixeira' } },
      { id: 'r2', user_id: 'u2', rating: 5, content: 'excelente', profiles: { name: 'João' } },
    ]);
    (updateReview as jest.Mock).mockResolvedValue({});
    (deleteReview as jest.Mock).mockResolvedValue({});
    (refreshMaterialRating as jest.Mock).mockResolvedValue(4);
  });

  it('renders loaded reviews and average value', async () => {
    const { getByText } = render(<RatingsScreen />);
    await waitFor(() => expect(getByText('Tomás Teixeira')).toBeDefined());
    expect(getByText('4.5')).toBeDefined();
    expect(getByText('Avaliações de Material')).toBeDefined();
  });

  it('shows edit button for own review and opens editor', async () => {
    const { getByText } = render(<RatingsScreen />);
    await waitFor(() => expect(getByText('Editar Avaliação')).toBeDefined());
    fireEvent.press(getByText('Editar Avaliação'));
    expect(getByText('Guardar Alterações')).toBeDefined();
  });

  it('navigates to evaluation screen when user has no review', async () => {
    (getReviewsByMaterial as jest.Mock).mockResolvedValueOnce([
      { id: 'r2', user_id: 'u2', rating: 5, content: 'excelente', profiles: { name: 'João' } },
    ]);
    const { getByText } = render(<RatingsScreen />);
    await waitFor(() => expect(getByText('Avaliar Material')).toBeDefined());
    fireEvent.press(getByText('Avaliar Material'));
    expect(pushMock).toHaveBeenCalled();
  });
});
