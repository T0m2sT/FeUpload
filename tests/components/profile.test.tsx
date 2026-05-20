import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import ProfileScreen from '../../app/profile';
import { darkPalette } from '../../constants/theme';
import { useThemeContext } from '../../contexts/theme-context';
import { useAppTheme } from '../../hooks/use-app-theme';

jest.mock('../../hooks/use-app-theme');
jest.mock('../../contexts/theme-context');
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

function getSupabase() {
  return jest.requireMock('../../lib/supabase').supabase;
}

describe('ProfileScreen', () => {
  const backMock = jest.fn();
  const replaceMock = jest.fn();
  const setPreferenceMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
    (useThemeContext as jest.Mock).mockReturnValue({
      preference: 'dark',
      setPreference: setPreferenceMock,
    });
    (useRouter as jest.Mock).mockReturnValue({ back: backMock, replace: replaceMock });

    const getUser = getSupabase().auth.getUser as jest.Mock;
    getUser
      .mockResolvedValueOnce({
        data: {
          user: {
            id: 'u1',
            email: 'tomas@fe.up.pt',
            user_metadata: {
              name: 'Tomás Teixeira',
              studentId: 'up202300001',
              course: '',
              year: '2',
              semester: '2',
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          user: {
            id: 'u1',
            email: 'tomas@fe.up.pt',
            user_metadata: {},
          },
        },
      });

    (getSupabase().auth.updateUser as jest.Mock).mockResolvedValue({
      data: {
        user: {
          user_metadata: {
            studentId: 'up202300001',
            course: 'LEIC',
            year: '2',
            semester: '2',
          },
        },
      },
      error: null,
    });

    (getSupabase().from as jest.Mock).mockImplementation((table: string) => {
      if (table !== 'profiles') {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: { name: 'Tomás Teixeira', email: 'tomas@fe.up.pt' },
                error: null,
              }),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      };
    });
  });

  it('updates course when saving profile edits', async () => {
    const { getByText } = render(<ProfileScreen />);

    await waitFor(() => expect(getByText('Perfil')).toBeDefined());

    fireEvent.press(getByText('Editar'));
    fireEvent.press(getByText('LEIC'));
    fireEvent.press(getByText('Guardar'));

    await waitFor(() => {
      expect(getSupabase().auth.updateUser).toHaveBeenCalledWith({
        data: expect.objectContaining({ course: 'LEIC' }),
      });
      expect(getByText('LEIC')).toBeDefined();
    });
  });
});
