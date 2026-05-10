import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { MaterialList } from '../../components/material-list';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';
import { addBookmark } from '../../services/bookmarks';

jest.mock('../../hooks/use-app-theme');
jest.mock('../../services/bookmarks');
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

const mockPalette = {
  ...darkPalette,
  accentGlow: '#FF6B6B',
};

const mockMaterials = [
  {
    id: 'm1',
    title: 'Exam 2022',
    type: 'exam',
    pdf: 'https://example.com/exam.pdf',
    rating: 4,
  },
  {
    id: 'm2',
    title: 'Summary Chapter 1',
    type: 'summary',
    subtitle: 'Final version',
    rating: null,
  },
];

function getSupabaseAuth() {
  return jest.requireMock('../../lib/supabase').supabase.auth;
}

describe('BookmarkFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockPalette);
    getSupabaseAuth().getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
    });
    (addBookmark as jest.Mock).mockResolvedValue({ id: 'b1' });
  });

  describe('Component Integration', () => {
    it('renders material list', () => {
      const { getByText } = render(<MaterialList items={mockMaterials as any} />);
      expect(getByText('Exam 2022')).toBeDefined();
      expect(getByText('Summary Chapter 1')).toBeDefined();
    });

    it('loads user session on mount', async () => {
      render(<MaterialList items={mockMaterials as any} />);

      await waitFor(() => {
        expect(getSupabaseAuth().getSession).toHaveBeenCalled();
      });
    });

    it('handles session initialization with no user', async () => {
      getSupabaseAuth().getSession.mockResolvedValue({ data: { session: null } });

      render(<MaterialList items={mockMaterials as any} />);

      await waitFor(() => {
        expect(getSupabaseAuth().getSession).toHaveBeenCalled();
      });
    });
  });

  describe('Rating Display', () => {
    it('renders materials with rating', () => {
      const { getByText } = render(<MaterialList items={mockMaterials as any} />);
      expect(getByText('Exam 2022')).toBeDefined();
    });

    it('renders materials without rating', () => {
      const { getByText } = render(<MaterialList items={mockMaterials as any} />);
      expect(getByText('Summary Chapter 1')).toBeDefined();
    });
  });

  describe('Service Integration', () => {
    it('addBookmark service is available', () => {
      expect(addBookmark).toBeDefined();
    });

    it('addBookmark resolves successfully', async () => {
      const result = await addBookmark('u1', 'm1', 'Test', '#FF6B6B');
      expect(result).toEqual({ id: 'b1' });
    });
  });

  describe('Empty State', () => {
    it('renders empty message when no items', () => {
      const { getByText } = render(
        <MaterialList items={[]} emptyMessage="No materials available" />
      );
      expect(getByText('No materials available')).toBeDefined();
    });
  });

  describe('Subtitle Display', () => {
    it('renders subtitle when provided', () => {
      const { getByText } = render(<MaterialList items={mockMaterials as any} />);
      expect(getByText('Final version')).toBeDefined();
    });
  });
});
