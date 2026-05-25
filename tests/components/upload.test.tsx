import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import UploadScreen from '../../app/(tabs)/upload';

jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    background: '#000', surface: '#111', surfaceBorder: '#222', surfaceElevated: '#1a1a1a',
    textPrimary: '#fff', textSecondary: '#aaa', textMuted: '#666',
    accent: '#f00', accentBorder: '#900', accentDim: '#300', accentGlow: '#f00',
    error: '#e00', success: '#0e0', isDark: true,
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
  useFocusEffect: (cb: any) => {
    const React = require('react');
    React.useEffect(() => {
      const cleanup = cb();
      return typeof cleanup === 'function' ? cleanup : undefined;
    }, []);
  },
}));

const mockPickFile = jest.fn();
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: (...args: any[]) => mockPickFile(...args),
}));

jest.mock('@/lib/supabase', () => {
  const mockCourses = [
    { id: 'c1', code: 'ES', name: 'Engenharia de Software', year: 2, semester: 2 },
  ];
  const order = jest.fn().mockResolvedValue({ data: mockCourses, error: null });
  const select = jest.fn(() => ({ order }));
  return {
    supabase: {
      from: jest.fn(() => ({ select })),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
      },
    },
  };
});

const mockUploadMaterial = jest.fn().mockResolvedValue({ id: 'm1' });
const mockUploadMaterialFile = jest
  .fn()
  .mockImplementation((_uri, name) => Promise.resolve(`https://cdn.example/${name}`));
jest.mock('@/services/materials', () => ({
  uploadMaterial: (...args: any[]) => mockUploadMaterial(...args),
  uploadMaterialFile: (...args: any[]) => mockUploadMaterialFile(...args),
}));

function pickFileOnce(name = 'main.pdf') {
  mockPickFile.mockResolvedValueOnce({
    canceled: false,
    assets: [{ uri: `file://${name}`, name, mimeType: 'application/pdf', size: 1024 }],
  });
}

async function fillRequiredFields(getByText: any) {
  // Open the Cadeira dropdown and pick the only course.
  fireEvent.press(getByText('Cadeira'));
  await waitFor(() => getByText('Engenharia de Software'));
  fireEvent.press(getByText('Engenharia de Software'));
}

async function selectType(getByText: any, label: string) {
  fireEvent.press(getByText('Tipo'));
  await waitFor(() => getByText(label));
  fireEvent.press(getByText(label));
}

describe('UploadScreen — "Tem soluções?" toggle (#110)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides the toggle for notes/summary types', async () => {
    const { getByText, queryByText } = render(<UploadScreen />);
    await selectType(getByText, 'Apontamentos');
    expect(queryByText('Tem soluções?')).toBeNull();

    await selectType(getByText, 'Resumo');
    expect(queryByText('Tem soluções?')).toBeNull();
  });

  it('shows the toggle for exam/exercise and reveals the solution picker when on', async () => {
    const { getByText, queryByText, getByLabelText } = render(<UploadScreen />);
    await selectType(getByText, 'Exame');

    expect(getByText('Tem soluções?')).toBeTruthy();
    expect(queryByText('Resolução / Soluções')).toBeNull();

    fireEvent(getByLabelText('Material com soluções'), 'valueChange', true);
    await waitFor(() => expect(getByText('Resolução / Soluções')).toBeTruthy());
  });

  it('clears the picked solution file when the toggle is turned off', async () => {
    const { getByText, getByLabelText, queryByText } = render(<UploadScreen />);
    await selectType(getByText, 'Exame');

    fireEvent(getByLabelText('Material com soluções'), 'valueChange', true);
    pickFileOnce('answers.pdf');
    await act(async () => {
      fireEvent.press(getByText('Escolher resolução'));
    });
    await waitFor(() => expect(getByText('answers.pdf')).toBeTruthy());

    fireEvent(getByLabelText('Material com soluções'), 'valueChange', false);
    await waitFor(() => expect(queryByText('answers.pdf')).toBeNull());
  });

  it('submits is_solved=true only when toggle is on AND a solution file is picked', async () => {
    const { getByText, getByLabelText } = render(<UploadScreen />);
    await fillRequiredFields(getByText);
    await selectType(getByText, 'Exame');

    // Title
    fireEvent.changeText(getByLabelText('Título do material'), 'Exame 2024');

    // Main file
    pickFileOnce('exam.pdf');
    await act(async () => {
      fireEvent.press(getByText('Escolher ficheiro *'));
    });

    // Toggle ON + answers file
    fireEvent(getByLabelText('Material com soluções'), 'valueChange', true);
    pickFileOnce('answers.pdf');
    await act(async () => {
      fireEvent.press(getByText('Escolher resolução'));
    });

    await act(async () => {
      fireEvent.press(getByLabelText('Enviar material'));
    });

    await waitFor(() => expect(mockUploadMaterial).toHaveBeenCalled());
    const arg = mockUploadMaterial.mock.calls[0][0];
    expect(arg.is_solved).toBe(true);
    expect(arg.file_url_solved).toBe('https://cdn.example/answers.pdf');
    expect(arg.file_url).toBe('https://cdn.example/exam.pdf');
  });

  it('submits is_solved=false when only the main file is provided', async () => {
    const { getByText, getByLabelText } = render(<UploadScreen />);
    await fillRequiredFields(getByText);
    await selectType(getByText, 'Apontamentos');

    fireEvent.changeText(getByLabelText('Título do material'), 'Apontamentos');

    pickFileOnce('notes.pdf');
    await act(async () => {
      fireEvent.press(getByText('Escolher ficheiro *'));
    });

    await act(async () => {
      fireEvent.press(getByLabelText('Enviar material'));
    });

    await waitFor(() => expect(mockUploadMaterial).toHaveBeenCalled());
    const arg = mockUploadMaterial.mock.calls[0][0];
    expect(arg.is_solved).toBe(false);
    expect(arg.file_url_solved).toBeUndefined();
  });
});
