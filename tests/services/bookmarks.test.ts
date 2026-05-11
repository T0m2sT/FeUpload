import {
  getUserBookmarks,
  addBookmark,
  removeBookmark,
  deleteCollection,
  addItemToCollection,
  removeItemFromCollection,
} from '../../services/bookmarks';
import { buildSupabaseMock } from '../utils';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

function getFrom() {
  return jest.requireMock('../../lib/supabase').supabase.from as jest.Mock;
}

function getRpc() {
  return jest.requireMock('../../lib/supabase').supabase.rpc as jest.Mock;
}

describe('bookmarks service', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = buildSupabaseMock();
    getFrom().mockReturnValue(mockChain);
    getRpc().mockResolvedValue({ error: null });
  });

  describe('getUserBookmarks', () => {
    it('fetches user bookmarks with materials', async () => {
      const mockData = [
        {
          id: 'b1',
          user_id: 'u1',
          material_id: 'm1',
          name: 'Collection 1',
          color: '#FF6B6B',
          materials: { id: 'm1', title: 'Exam 2022' },
        },
      ];
      mockChain._data = mockData;

      const result = await getUserBookmarks('u1');

      expect(getFrom()).toHaveBeenCalledWith('bookmarks');
      expect(mockChain.select).toHaveBeenCalledWith(
        '*, materials(id, title, type, file_url, class_code, courses(code, name), reviews(rating))'
      );
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'u1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('returns null when user has no bookmarks', async () => {
      mockChain._data = null;
      const result = await getUserBookmarks('u-empty');
      expect(result).toBeNull();
    });

    it('throws error on database failure', async () => {
      mockChain._error = new Error('DB Error');
      await expect(getUserBookmarks('u1')).rejects.toThrow('DB Error');
    });
  });

  describe('addBookmark', () => {
    it('creates bookmark with all fields', async () => {
      const mockData = { id: 'b1', user_id: 'u1', material_id: 'm1', name: 'Coll 1', color: '#FF6B6B' };
      mockChain._data = mockData;

      const result = await addBookmark('u1', 'm1', 'Coll 1', '#FF6B6B');

      expect(getFrom()).toHaveBeenCalledWith('bookmarks');
      expect(mockChain.insert).toHaveBeenCalledWith({
        user_id: 'u1',
        material_id: 'm1',
        name: 'Coll 1',
        color: '#FF6B6B',
      });
      expect(result).toEqual(mockData);
    });

    it('uses default color when not provided', async () => {
      mockChain._data = { id: 'b1' };
      await addBookmark('u1', 'm1', 'Name');
      expect(mockChain.insert).toHaveBeenCalledWith({
        user_id: 'u1',
        material_id: 'm1',
        name: 'Name',
        color: '#FF6B6B',
      });
    });

    it('allows null material_id', async () => {
      mockChain._data = { id: 'b1' };
      await addBookmark('u1', null, 'Name', '#FF6B6B');
      expect(mockChain.insert).toHaveBeenCalledWith({
        user_id: 'u1',
        material_id: null,
        name: 'Name',
        color: '#FF6B6B',
      });
    });

    it('throws error on insertion failure', async () => {
      mockChain._error = new Error('Insert failed');
      await expect(addBookmark('u1', 'm1')).rejects.toThrow('Insert failed');
    });
  });

  describe('removeBookmark', () => {
    it('removes bookmark by id', async () => {
      await removeBookmark('b1');

      expect(getFrom()).toHaveBeenCalledWith('bookmarks');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'b1');
    });

    it('throws error on deletion failure', async () => {
      mockChain._error = new Error('Delete failed');
      await expect(removeBookmark('b1')).rejects.toThrow('Delete failed');
    });
  });

  describe('deleteCollection', () => {
    it('deletes collection by id', async () => {
      await deleteCollection('coll1');

      expect(getFrom()).toHaveBeenCalledWith('bookmark_collections');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'coll1');
    });

    it('throws error on deletion failure', async () => {
      mockChain._error = new Error('Delete failed');
      await expect(deleteCollection('coll1')).rejects.toThrow('Delete failed');
    });
  });

  describe('addItemToCollection', () => {
    it('adds item to collection and increments count', async () => {
      const mockData = { id: 'item1', collection_id: 'coll1', material_id: 'm1' };
      mockChain._data = mockData;

      const result = await addItemToCollection('coll1', 'm1');

      expect(getFrom()).toHaveBeenCalledWith('bookmark_collection_items');
      expect(mockChain.insert).toHaveBeenCalledWith({
        collection_id: 'coll1',
        material_id: 'm1',
      });
      expect(getRpc()).toHaveBeenCalledWith('increment_collection_count', { collection_id: 'coll1' });
      expect(result).toEqual(mockData);
    });

    it('throws error on insertion failure', async () => {
      mockChain._error = new Error('Insert failed');
      await expect(addItemToCollection('coll1', 'm1')).rejects.toThrow('Insert failed');
    });
  });

  describe('removeItemFromCollection', () => {
    it('removes item from collection and decrements count', async () => {
      await removeItemFromCollection('coll1', 'm1');

      expect(getFrom()).toHaveBeenCalledWith('bookmark_collection_items');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('collection_id', 'coll1');
      expect(mockChain.eq).toHaveBeenCalledWith('material_id', 'm1');
      expect(getRpc()).toHaveBeenCalledWith('decrement_collection_count', { collection_id: 'coll1' });
    });

    it('throws error on deletion failure', async () => {
      mockChain._error = new Error('Delete failed');
      await expect(removeItemFromCollection('coll1', 'm1')).rejects.toThrow('Delete failed');
    });
  });
});
