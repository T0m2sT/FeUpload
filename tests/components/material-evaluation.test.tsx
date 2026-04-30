import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import MaterialEvaluationScreen from '../../app/material-evaluation';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';

jest.mock('../../hooks/use-app-theme');
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

describe('MaterialEvaluationScreen', () => {
  const backMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
    (useRouter as jest.Mock).mockReturnValue({ back: backMock });
  });

  it('renders the screen title', () => {
    const { getByText } = render(<MaterialEvaluationScreen />);
    expect(getByText('Avaliar')).toBeDefined();
  });

  it('renders the material card info', () => {
    const { getByText } = render(<MaterialEvaluationScreen />);
    expect(getByText('Slides Tópicos 1, 2 e 3')).toBeDefined();
    expect(getByText('Cadeira: ESOF')).toBeDefined();
  });

  it('renders the initial rating as Bom (3/5)', () => {
    const { getByText } = render(<MaterialEvaluationScreen />);
    expect(getByText('Bom (3/5)')).toBeDefined();
  });

  it('updates rating label when a star is pressed', () => {
    const { getByLabelText, getByText } = render(<MaterialEvaluationScreen />);
    fireEvent.press(getByLabelText('Classificação 5'));
    expect(getByText('Excelente (5/5)')).toBeDefined();
  });

  it('updates rating label to Fraco when 1 star is pressed', () => {
    const { getByLabelText, getByText } = render(<MaterialEvaluationScreen />);
    fireEvent.press(getByLabelText('Classificação 1'));
    expect(getByText('Fraco (1/5)')).toBeDefined();
  });

  it('shows character counter as comment is typed', () => {
    const { getByText, getByPlaceholderText } = render(<MaterialEvaluationScreen />);
    const input = getByPlaceholderText('Escreve o teu comentário sobre este documento ...');
    fireEvent.changeText(input, 'Bom material');
    expect(getByText('12 / 500')).toBeDefined();
  });

  it('renders the publish button', () => {
    const { getByText } = render(<MaterialEvaluationScreen />);
    expect(getByText('Publicar Avaliação')).toBeDefined();
  });

  it('navigates back when back button is pressed', () => {
    const { getByLabelText } = render(<MaterialEvaluationScreen />);
    fireEvent.press(getByLabelText('Voltar'));
    expect(backMock).toHaveBeenCalled();
  });
});
