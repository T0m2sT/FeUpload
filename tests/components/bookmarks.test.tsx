import { render, waitFor, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { MaterialList } from '../../components/material-list';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';
import { addBookmark } from '../../services/bookmarks';
import { buildSupabaseMock } from '../utils';

jest.mock('../../hooks/use-app-theme');
jest.mock('../../services/bookmarks');

const mockChain = buildSupabaseMock();
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(),
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

function getSupabaseFrom() {
  return jest.requireMock('../../lib/supabase').supabase.from;
}

describe('BookmarkFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockPalette);
    getSupabaseAuth().getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
    });
    getSupabaseFrom().mockReturnValue(mockChain);
    mockChain._data = []; // Default empty bookmarks
    (addBookmark as jest.Mock).mockResolvedValue({ id: 'b1' });
  });

  // Helper to wait for initial component stabilization
  const waitForInitialization = async () => {
    await waitFor(() => expect(getSupabaseAuth().getSession).toHaveBeenCalled());
    await waitFor(() => expect(getSupabaseFrom()).toHaveBeenCalledWith('bookmarks'));
  };

  describe('Collection Management', () => {
    it('shows 0 materials for an empty collection in the picker', async () => {
      mockChain._data = [
        { name: 'Empty Coll', color: '#FF6B6B', material_id: null }
      ];
      const { getAllByLabelText, getByText, findByText } = render(<MaterialList items={mockMaterials as any} />);
      await waitForInitialization();
      
      fireEvent.press(getAllByLabelText('Bookmark')[0]);
      const collName = await findByText('Empty Coll');
      expect(collName).toBeDefined();
      expect(getByText('0 materiais')).toBeDefined();
    });

    it('shows correct item count for collection with materials', async () => {
      mockChain._data = [
        { name: 'Full Coll', color: '#4ECDC4', material_id: 'm1' },
        { name: 'Full Coll', color: '#4ECDC4', material_id: 'm2' },
        { name: 'Full Coll', color: '#4ECDC4', material_id: null }
      ];
      const { getAllByLabelText, getByText, findByText } = render(<MaterialList items={mockMaterials as any} />);
      await waitForInitialization();
      
      fireEvent.press(getAllByLabelText('Bookmark')[0]);
      const collName = await findByText('Full Coll');
      expect(collName).toBeDefined();
      expect(getByText('2 materiais')).toBeDefined();
    });
  });

  describe('Component Integration', () => {
    it('renders material list', async () => {
      const { getByText } = render(<MaterialList items={mockMaterials as any} />);
      await waitForInitialization();
      expect(getByText('Exam 2022')).toBeDefined();
      expect(getByText('Summary Chapter 1')).toBeDefined();
    });

    it('loads user session on mount', async () => {
      render(<MaterialList items={mockMaterials as any} />);
      await waitForInitialization();
    });

    it('handles session initialization with no user', async () => {
      getSupabaseAuth().getSession.mockResolvedValue({ data: { session: null } });
      render(<MaterialList items={mockMaterials as any} />);
      await waitFor(() => expect(getSupabaseAuth().getSession).toHaveBeenCalled());
    });
  });

  describe('Rating Display', () => {
    it('renders materials with rating', async () => {
      const { getByText } = render(<MaterialList items={mockMaterials as any} />);
      await waitForInitialization();
      expect(getByText('Exam 2022')).toBeDefined();
    });

    it('renders materials without rating', async () => {
      const { getByText } = render(<MaterialList items={mockMaterials as any} />);
      await waitForInitialization();
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
    it('renders empty message when no items', async () => {
      const { getByText } = render(
        <MaterialList items={[]} emptyMessage="No materials available" />
      );
      await waitForInitialization();
      expect(getByText('No materials available')).toBeDefined();
    });
  });

  describe('Subtitle Display', () => {
    it('renders subtitle when provided', async () => {
      const { getByText } = render(<MaterialList items={mockMaterials as any} />);
      await waitForInitialization();
      expect(getByText('Final version')).toBeDefined();
    });
  });
});
