import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, Platform } from 'react-native';
import { MaterialList } from '../../components/material-list';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';

jest.mock('../../hooks/use-app-theme');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockItems = [
  { id: '1', title: 'Exame 2022', type: 'Exame', pdf: 'https://example.com/exame.pdf', rating: 4 },
  { id: '2', title: 'Resumo Cap 1', type: 'Resumo', subtitle: 'Versão final' },
  { id: '3', title: 'Dica sem PDF', type: 'Dica' },
];

describe('MaterialList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
  });

  it('renders empty message when items are empty', () => {
    const { getByText } = render(<MaterialList items={[]} emptyMessage="Nada aqui" />);
    expect(getByText('Nada aqui')).toBeDefined();
  });

  it('renders default empty message when none provided', () => {
    const { getByText } = render(<MaterialList items={[]} />);
    expect(getByText('Sem conteúdo disponível.')).toBeDefined();
  });

  it('renders list of items correctly', () => {
    const { getByText, getByLabelText } = render(<MaterialList items={mockItems as any} />);

    expect(getByText('Exame 2022')).toBeDefined();
    expect(getByText('Resumo Cap 1')).toBeDefined();
    expect(getByText('Versão final')).toBeDefined();
    expect(getByLabelText('Exame 2022')).toBeDefined();
  });

  it('does not render subtitle when absent', () => {
    const { queryByText } = render(<MaterialList items={[{ id: '1', title: 'T', type: 'Dica' }] as any} />);
    // No subtitle text element should exist beyond the title
    expect(queryByText('undefined')).toBeNull();
  });

  it('opens URL when clicking download button', () => {
    const { getAllByLabelText } = render(<MaterialList items={mockItems as any} />);

    const downloadBtns = getAllByLabelText('Download');
    fireEvent.press(downloadBtns[0]);
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/exame.pdf');
  });

  it('renders download button only for items with PDF', () => {
    const { getAllByLabelText } = render(<MaterialList items={mockItems as any} />);

    // Only items with PDF have a Download button - mockItems has 1 PDF item
    const downloadBtns = getAllByLabelText('Download');
    expect(downloadBtns).toHaveLength(1);
  });

  it('renders favorite button for each item', () => {
    const { getAllByLabelText } = render(<MaterialList items={mockItems as any} />);
    expect(getAllByLabelText('Favoritar')).toHaveLength(mockItems.length);
  });

  describe('openPDF', () => {
    it('navigates to pdf-viewer when a material row is pressed on native', () => {
      //Opening with native library
      const pushMock = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

      const { getByLabelText } = render(<MaterialList items={mockItems as any} />);

      fireEvent.press(getByLabelText('Exame 2022'));

      expect(pushMock).toHaveBeenCalledWith({
        pathname: '/pdf-viewer',
        params: { pdf: 'https://example.com/exame.pdf', title: "Exame 2022"},
      });
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('opens URL directly when a material row is pressed on web', () => {
      //Opening with browser
      const pushMock = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

      const originalOS = Platform.OS;
      Platform.OS = 'web';

      const { getByLabelText } = render(<MaterialList items={mockItems as any} />);

      fireEvent.press(getByLabelText('Exame 2022'));

      expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/exame.pdf');
      expect(pushMock).not.toHaveBeenCalled();

      Platform.OS = originalOS;
    });

    it('does nothing when a material row without PDF is pressed', () => {
      //There is no pdf
      const pushMock = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

      const { getByLabelText } = render(<MaterialList items={mockItems as any} />);

      // Press the row for 'Dica sem PDF'
      fireEvent.press(getByLabelText('Dica sem PDF'));

      expect(pushMock).not.toHaveBeenCalled();
      expect(Linking.openURL).not.toHaveBeenCalled();
    });
  });
});
