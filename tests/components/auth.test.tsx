import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import AuthScreen from '../../app/auth';
import { useThemeContext } from '../../contexts/theme-context';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  },
}));
jest.mock('../../contexts/theme-context');
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

function getSupabaseAuth() {
  return jest.requireMock('../../lib/supabase').supabase.auth;
}

const mockPalette = {
  background: '#000', surface: '#111', surfaceBorder: '#222',
  textPrimary: '#fff', textSecondary: '#aaa', textMuted: '#666',
  accent: '#f00', error: '#e00', isDark: true,
};

describe('AuthScreen', () => {
  const replaceMock = jest.fn();
  const setPreferenceMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeContext as jest.Mock).mockReturnValue({
      palette: mockPalette,
      preference: 'dark',
      setPreference: setPreferenceMock,
    });
    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });
  });

  it('renders login form by default', () => {
    const { getByPlaceholderText, getByText } = render(<AuthScreen />);
    expect(getByPlaceholderText('Email')).toBeDefined();
    expect(getByPlaceholderText('Palavra-passe')).toBeDefined();
    expect(getByText('Entrar')).toBeDefined();
  });

  it('switches to sign-up mode and shows name field', () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.press(getByText('Ainda não tens conta? Regista-te'));
    expect(getByPlaceholderText('Nome')).toBeDefined();
    expect(getByText('Registar')).toBeDefined();
  });

  it('shows error when submitting empty fields', async () => {
    const { getByText } = render(<AuthScreen />);
    fireEvent.press(getByText('Entrar'));
    await waitFor(() => expect(getByText('Por favor preenche todos os campos.')).toBeDefined());
  });

  it('shows error for invalid email format', async () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'not-an-email');
    fireEvent.changeText(getByPlaceholderText('Palavra-passe'), 'password123');
    fireEvent.press(getByText('Entrar'));
    await waitFor(() => expect(getByText('Indica um endereço de email válido.')).toBeDefined());
  });

  it('shows error when signing up without a name', async () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.press(getByText('Ainda não tens conta? Regista-te'));
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@fe.up.pt');
    fireEvent.changeText(getByPlaceholderText('Palavra-passe'), 'password123');
    fireEvent.press(getByText('Registar'));
    await waitFor(() => expect(getByText('Indica o teu nome.')).toBeDefined());
  });

  it('calls signInWithPassword and navigates on successful login', async () => {
    getSupabaseAuth().signInWithPassword.mockResolvedValue({ error: null });

    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@fe.up.pt');
    fireEvent.changeText(getByPlaceholderText('Palavra-passe'), 'password');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(getSupabaseAuth().signInWithPassword).toHaveBeenCalledWith({
        email: 'user@fe.up.pt',
        password: 'password',
      });
      expect(replaceMock).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('shows supabase error message on failed login', async () => {
    getSupabaseAuth().signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });

    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@fe.up.pt');
    fireEvent.changeText(getByPlaceholderText('Palavra-passe'), 'wrong');
    fireEvent.press(getByText('Entrar'));

    await waitFor(() => expect(getByText('Invalid credentials')).toBeDefined());
  });

  it('calls signUp and navigates to complete-profile on success', async () => {
    getSupabaseAuth().signUp.mockResolvedValue({ error: null });

    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.press(getByText('Ainda não tens conta? Regista-te'));
    fireEvent.changeText(getByPlaceholderText('Nome'), 'Tomas');
    fireEvent.changeText(getByPlaceholderText('Email'), 'tomas@fe.up.pt');
    fireEvent.changeText(getByPlaceholderText('Palavra-passe'), 'password');
    fireEvent.press(getByText('Registar'));

    await waitFor(() => {
      expect(getSupabaseAuth().signUp).toHaveBeenCalledWith({
        email: 'tomas@fe.up.pt',
        password: 'password',
        options: { data: { name: 'Tomas', profileComplete: false } },
      });
      expect(replaceMock).toHaveBeenCalledWith('/complete-profile');
    });
  });

  it('shows error when signing up with a weak password', async () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.press(getByText('Ainda não tens conta? Regista-te'));
    fireEvent.changeText(getByPlaceholderText('Nome'), 'Tomas');
    fireEvent.changeText(getByPlaceholderText('Email'), 'tomas@fe.up.pt');
    fireEvent.changeText(getByPlaceholderText('Palavra-passe'), 'short');
    fireEvent.press(getByText('Registar'));
    await waitFor(() => expect(getByText('A palavra-passe tem de ter pelo menos 8 caracteres.')).toBeDefined());
  });

  it('normalizes email and name before sign up', async () => {
    getSupabaseAuth().signUp.mockResolvedValue({ error: null });

    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.press(getByText('Ainda não tens conta? Regista-te'));
    fireEvent.changeText(getByPlaceholderText('Nome'), '  Tomás   Teixeira  ');
    fireEvent.changeText(getByPlaceholderText('Email'), '  TOMAS@FE.UP.PT ');
    fireEvent.changeText(getByPlaceholderText('Palavra-passe'), 'password123');
    fireEvent.press(getByText('Registar'));

    await waitFor(() => {
      expect(getSupabaseAuth().signUp).toHaveBeenCalledWith({
        email: 'tomas@fe.up.pt',
        password: 'password123',
        options: { data: { name: 'Tomás Teixeira', profileComplete: false } },
      });
    });
  });
});
