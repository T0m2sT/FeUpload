import { getBookmarks, addBookmark, removeBookmark } from '../../services/bookmarks';
import { buildSupabaseMock } from '../utils';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

function getFrom() {
  return jest.requireMock('../../lib/supabase').supabase.from as jest.Mock;
}

describe('bookmarks service', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = buildSupabaseMock();
    getFrom().mockReturnValue(mockChain);
  });

  describe('getBookmarks', () => {
    it('fetches bookmarks for a user', async () => {
      const mockData = [{ id: '1', material_id: 'm1' }];
      mockChain._data = mockData;

      const result = await getBookmarks('u1');

      expect(getFrom()).toHaveBeenCalledWith('bookmarks');
      expect(mockChain.select).toHaveBeenCalledWith('*, materials(title, type, courses(code, name))');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'u1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockChain._error = new Error('DB Error');
      await expect(getBookmarks('u1')).rejects.toThrow('DB Error');
    });

    it('returns empty array when user has no bookmarks', async () => {
      mockChain._data = [];
      const result = await getBookmarks('u-empty');
      expect(result).toEqual([]);
    });

    it('passes any userId to the eq filter', async () => {
      mockChain._data = [];
      await getBookmarks('user-xyz');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-xyz');
    });
  });

  describe('addBookmark', () => {
    it('inserts a bookmark with all fields', async () => {
      const mockData = { id: 'b1', user_id: 'u1', material_id: 'm1' };
      mockChain._data = mockData;

      const result = await addBookmark('u1', 'm1', 'My Bookmark', 'blue');

      expect(getFrom()).toHaveBeenCalledWith('bookmarks');
      expect(mockChain.insert).toHaveBeenCalledWith({
        user_id: 'u1',
        material_id: 'm1',
        name: 'My Bookmark',
        color: 'blue',
      });
      expect(result).toEqual(mockData);
    });

    it('inserts a bookmark without optional name and color', async () => {
      mockChain._data = { id: 'b2' };
      await addBookmark('u1', 'm1');
      expect(mockChain.insert).toHaveBeenCalledWith({
        user_id: 'u1',
        material_id: 'm1',
        name: undefined,
        color: undefined,
      });
    });

    it('throws error when adding bookmark fails', async () => {
      mockChain._error = new Error('Insert failed');
      await expect(addBookmark('u1', 'm1')).rejects.toThrow('Insert failed');
    });

    it('calls select and single after insert', async () => {
      mockChain._data = {};
      await addBookmark('u1', 'm1');
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.single).toHaveBeenCalled();
    });
  });

  describe('removeBookmark', () => {
    it('deletes a bookmark', async () => {
      mockChain._data = null;
      mockChain._error = null;

      await removeBookmark('u1', 'm1');

      expect(getFrom()).toHaveBeenCalledWith('bookmarks');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'u1');
      expect(mockChain.eq).toHaveBeenCalledWith('material_id', 'm1');
    });

    it('throws error when removing bookmark fails', async () => {
      mockChain._error = new Error('Delete failed');
      await expect(removeBookmark('u1', 'm1')).rejects.toThrow('Delete failed');
    });
  });
});
