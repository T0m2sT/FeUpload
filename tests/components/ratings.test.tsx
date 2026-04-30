import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import RatingsScreen from '../../app/ratings';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';

jest.mock('../../hooks/use-app-theme');
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

describe('RatingsScreen', () => {
  const backMock = jest.fn();
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
    (useRouter as jest.Mock).mockReturnValue({ back: backMock, push: pushMock });
  });

  it('renders the screen title', () => {
    const { getByText } = render(<RatingsScreen />);
    expect(getByText('Avaliações de Material')).toBeDefined();
  });

  it('renders the average rating value', () => {
    const { getByText } = render(<RatingsScreen />);
    expect(getByText('4.6')).toBeDefined();
  });

  it('renders all reviews', () => {
    const { getAllByText } = render(<RatingsScreen />);
    expect(getAllByText('João Baião').length).toBe(5);
    expect(getAllByText('Muito bom material!').length).toBe(5);
  });

  it('navigates back when back button is pressed', () => {
    const { getByLabelText } = render(<RatingsScreen />);
    fireEvent.press(getByLabelText('Voltar'));
    expect(backMock).toHaveBeenCalled();
  });

  it('navigates to material-evaluation when CTA is pressed', () => {
    const { getByText } = render(<RatingsScreen />);
    fireEvent.press(getByText('Avaliar Material'));
    expect(pushMock).toHaveBeenCalledWith('/material-evaluation');
  });
});
