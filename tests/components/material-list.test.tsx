import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MaterialList } from '../../components/material-list';
import { useAppTheme } from '../../hooks/use-app-theme';
import { Linking } from 'react-native';
import { darkPalette } from '../../constants/theme';

jest.mock('../../hooks/use-app-theme');

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
});
