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
    expect(getByPlaceholderText('Password')).toBeDefined();
    expect(getByText('Sign In')).toBeDefined();
  });

  it('switches to sign-up mode and shows name field', () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.press(getByText("Don't have an account? Sign Up"));
    expect(getByPlaceholderText('Name')).toBeDefined();
    expect(getByText('Sign Up')).toBeDefined();
  });

  it('shows error when submitting empty fields', async () => {
    const { getByText } = render(<AuthScreen />);
    fireEvent.press(getByText('Sign In'));
    await waitFor(() => expect(getByText('Please fill in all fields.')).toBeDefined());
  });

  it('shows error for invalid email format', async () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'not-an-email');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign In'));
    await waitFor(() => expect(getByText('Please enter a valid email address.')).toBeDefined());
  });

  it('shows error when signing up without a name', async () => {
    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.press(getByText("Don't have an account? Sign Up"));
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@fe.up.pt');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign Up'));
    await waitFor(() => expect(getByText('Please enter your name.')).toBeDefined());
  });

  it('calls signInWithPassword and navigates on successful login', async () => {
    getSupabaseAuth().signInWithPassword.mockResolvedValue({ error: null });

    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'user@fe.up.pt');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Sign In'));

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
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => expect(getByText('Invalid credentials')).toBeDefined());
  });

  it('calls signUp and navigates to complete-profile on success', async () => {
    getSupabaseAuth().signUp.mockResolvedValue({ error: null });

    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.press(getByText("Don't have an account? Sign Up"));
    fireEvent.changeText(getByPlaceholderText('Name'), 'Tomas');
    fireEvent.changeText(getByPlaceholderText('Email'), 'tomas@fe.up.pt');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Sign Up'));

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
    fireEvent.press(getByText("Don't have an account? Sign Up"));
    fireEvent.changeText(getByPlaceholderText('Name'), 'Tomas');
    fireEvent.changeText(getByPlaceholderText('Email'), 'tomas@fe.up.pt');
    fireEvent.changeText(getByPlaceholderText('Password'), 'short');
    fireEvent.press(getByText('Sign Up'));
    await waitFor(() => expect(getByText('Password must have at least 8 characters.')).toBeDefined());
  });

  it('normalizes email and name before sign up', async () => {
    getSupabaseAuth().signUp.mockResolvedValue({ error: null });

    const { getByText, getByPlaceholderText } = render(<AuthScreen />);
    fireEvent.press(getByText("Don't have an account? Sign Up"));
    fireEvent.changeText(getByPlaceholderText('Name'), '  Tomás   Teixeira  ');
    fireEvent.changeText(getByPlaceholderText('Email'), '  TOMAS@FE.UP.PT ');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Sign Up'));

    await waitFor(() => {
      expect(getSupabaseAuth().signUp).toHaveBeenCalledWith({
        email: 'tomas@fe.up.pt',
        password: 'password123',
        options: { data: { name: 'Tomás Teixeira', profileComplete: false } },
      });
    });
  });
});
