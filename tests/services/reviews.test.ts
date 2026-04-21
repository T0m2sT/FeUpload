import { getReviewsByMaterial, createReview, deleteReview } from '../../services/reviews';
import { buildSupabaseMock } from '../utils';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

function getFrom() {
  return jest.requireMock('../../lib/supabase').supabase.from as jest.Mock;
}

describe('reviews service', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = buildSupabaseMock();
    getFrom().mockReturnValue(mockChain);
  });

  describe('getReviewsByMaterial', () => {
    it('fetches reviews for a material', async () => {
      const mockData = [{ id: 'r1', rating: 5 }];
      mockChain._data = mockData;

      const result = await getReviewsByMaterial('m1');

      expect(getFrom()).toHaveBeenCalledWith('reviews');
      expect(mockChain.select).toHaveBeenCalledWith('*, profiles(name)');
      expect(mockChain.eq).toHaveBeenCalledWith('material_id', 'm1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockChain._error = new Error('Query failed');
      await expect(getReviewsByMaterial('m1')).rejects.toThrow('Query failed');
    });

    it('returns empty array when no reviews exist', async () => {
      mockChain._data = [];
      const result = await getReviewsByMaterial('m-no-reviews');
      expect(result).toEqual([]);
    });
  });

  describe('createReview', () => {
    it('creates a new review with all fields', async () => {
      const newReview = { material_id: 'm1', user_id: 'u1', rating: 4, content: 'Good' };
      mockChain._data = { id: 'r1', ...newReview };

      const result = await createReview(newReview);

      expect(getFrom()).toHaveBeenCalledWith('reviews');
      expect(mockChain.insert).toHaveBeenCalledWith(newReview);
      expect(result).toEqual({ id: 'r1', ...newReview });
    });

    it('creates a review without optional content', async () => {
      const newReview = { material_id: 'm1', user_id: 'u1', rating: 3 };
      mockChain._data = { id: 'r2', ...newReview };
      await createReview(newReview);
      expect(mockChain.insert).toHaveBeenCalledWith(newReview);
    });

    it('throws error when creation fails', async () => {
      mockChain._error = new Error('Insert failed');
      await expect(createReview({ material_id: 'm1', user_id: 'u1', rating: 4 })).rejects.toThrow('Insert failed');
    });

    it('accepts minimum rating of 1', async () => {
      mockChain._data = {};
      await expect(createReview({ material_id: 'm1', user_id: 'u1', rating: 1 })).resolves.not.toThrow();
    });

    it('accepts maximum rating of 5', async () => {
      mockChain._data = {};
      await expect(createReview({ material_id: 'm1', user_id: 'u1', rating: 5 })).resolves.not.toThrow();
    });
  });

  describe('deleteReview', () => {
    it('deletes a review by id', async () => {
      await deleteReview('r1');
      expect(getFrom()).toHaveBeenCalledWith('reviews');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'r1');
    });

    it('throws error when deletion fails', async () => {
      mockChain._error = new Error('Delete failed');
      await expect(deleteReview('r1')).rejects.toThrow('Delete failed');
    });
  });
});
