import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, Platform } from 'react-native';
import { MaterialList } from '../../components/material-list';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';

jest.mock('../../hooks/use-app-theme');
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
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockDownloadMaterial = jest.fn();
jest.mock('../../services/offline', () => ({
  downloadMaterial: (...args: any[]) => mockDownloadMaterial(...args),
  removeOfflineMaterial: jest.fn(),
  useOfflineIndex: () => ({}),
  offlineSupported: true,
}));

jest.mock('../../hooks/use-is-online', () => ({
  useIsOnline: () => true,
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

  it('triggers offline download when the cloud button is pressed', () => {
    const { getAllByLabelText } = render(
      <MaterialList items={mockItems as any} courseCode="ES" />,
    );

    const downloadBtns = getAllByLabelText('Descarregar para offline');
    fireEvent.press(downloadBtns[0]);
    expect(mockDownloadMaterial).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', file_url: 'https://example.com/exame.pdf' }),
    );
  });

  it('renders the offline download button only for items with PDF', () => {
    const { getAllByLabelText } = render(<MaterialList items={mockItems as any} />);

    const downloadBtns = getAllByLabelText('Descarregar para offline');
    expect(downloadBtns).toHaveLength(1);
  });

  it('renders details button for each item', () => {
    const { getAllByLabelText } = render(<MaterialList items={mockItems as any} />);
    expect(getAllByLabelText('Detalhes do material')).toHaveLength(mockItems.length);
  });

  it('renders solved indicator only for items with is_solved AND pdf_solved', () => {
    const items = [
      { id: 's1', title: 'Resolvido', type: 'exam', pdf: 'a.pdf', pdf_solved: 'b.pdf', is_solved: true },
      { id: 'u1', title: 'Não resolvido', type: 'exam', pdf: 'a.pdf', is_solved: false },
      { id: 'f1', title: 'Flag sem ficheiro', type: 'exam', pdf: 'a.pdf', is_solved: true },
    ];
    const { queryAllByTestId } = render(<MaterialList items={items as any} />);
    expect(queryAllByTestId('checkmark-circle')).toHaveLength(1);
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
        params: {
          pdf: 'https://example.com/exame.pdf',
          pdf_solved: '',
          local_pdf: '',
          local_pdf_solved: '',
          title: 'Exame 2022',
        },
      });
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('navigates to pdf-viewer with both pdf and pdf_solved when a dual-version material row is pressed on native', () => {
      const pushMock = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

      const items = [
        { id: '4', title: 'Exame Resolvido', type: 'exam', pdf: 'https://example.com/exame_unsolved.pdf', pdf_solved: 'https://example.com/exame_solved.pdf' }
      ];

      const { getByLabelText } = render(<MaterialList items={items as any} />);

      fireEvent.press(getByLabelText('Exame Resolvido'));

      expect(pushMock).toHaveBeenCalledWith({
        pathname: '/pdf-viewer',
        params: {
          pdf: 'https://example.com/exame_unsolved.pdf',
          pdf_solved: 'https://example.com/exame_solved.pdf',
          local_pdf: '',
          local_pdf_solved: '',
          title: 'Exame Resolvido',
        },
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

    it('opens solved URL directly when a material row with only solved PDF is pressed on web', () => {
      const pushMock = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

      const originalOS = Platform.OS;
      Platform.OS = 'web';

      const items = [
        { id: '5', title: 'Apenas Resolvido', type: 'exam', pdf_solved: 'https://example.com/exame_solved.pdf' }
      ];

      const { getByLabelText } = render(<MaterialList items={items as any} />);

      fireEvent.press(getByLabelText('Apenas Resolvido'));

      expect(Linking.openURL).toHaveBeenCalledWith('https://example.com/exame_solved.pdf');
      expect(pushMock).not.toHaveBeenCalled();

      Platform.OS = originalOS;
    });

    it('navigates to pdf-viewer with only pdf_solved when a solved-only material is pressed on native', () => {
      const pushMock = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

      const items = [
        { id: '6', title: 'Apenas Resolvido Native', type: 'exam', pdf_solved: 'https://example.com/exame_solved.pdf' }
      ];

      const { getByLabelText } = render(<MaterialList items={items as any} />);

      fireEvent.press(getByLabelText('Apenas Resolvido Native'));

      expect(pushMock).toHaveBeenCalledWith({
        pathname: '/pdf-viewer',
        params: {
          pdf: '',
          pdf_solved: 'https://example.com/exame_solved.pdf',
          local_pdf: '',
          local_pdf_solved: '',
          title: 'Apenas Resolvido Native',
        },
      });
      expect(Linking.openURL).not.toHaveBeenCalled();
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
