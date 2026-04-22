import { getSubscriptions, subscribe, unsubscribe } from '../../services/subscriptions';
import { buildSupabaseMock } from '../utils';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

function getFrom() {
  return jest.requireMock('../../lib/supabase').supabase.from as jest.Mock;
}

describe('subscriptions service', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = buildSupabaseMock();
    getFrom().mockReturnValue(mockChain);
  });

  describe('getSubscriptions', () => {
    it('fetches subscriptions for a user', async () => {
      const mockData = [{ id: 's1', course_id: 'c1' }];
      mockChain._data = mockData;

      const result = await getSubscriptions('u1');

      expect(getFrom()).toHaveBeenCalledWith('subscriptions');
      expect(mockChain.select).toHaveBeenCalledWith('*, courses(*)');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'u1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockChain._error = new Error('Query failed');
      await expect(getSubscriptions('u1')).rejects.toThrow('Query failed');
    });

    it('returns empty array when user has no subscriptions', async () => {
      mockChain._data = [];
      const result = await getSubscriptions('u-new');
      expect(result).toEqual([]);
    });
  });

  describe('subscribe', () => {
    it('subscribes a user to a course', async () => {
      const mockData = { id: 's1', user_id: 'u1', course_id: 'c1' };
      mockChain._data = mockData;

      const result = await subscribe('u1', 'c1');

      expect(getFrom()).toHaveBeenCalledWith('subscriptions');
      expect(mockChain.insert).toHaveBeenCalledWith({ user_id: 'u1', course_id: 'c1' });
      expect(result).toEqual(mockData);
    });

    it('throws error when subscribe fails', async () => {
      mockChain._error = new Error('Insert failed');
      await expect(subscribe('u1', 'c1')).rejects.toThrow('Insert failed');
    });

    it('calls select and single after insert', async () => {
      mockChain._data = {};
      await subscribe('u1', 'c1');
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.single).toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('unsubscribes a user from a course', async () => {
      await unsubscribe('u1', 'c1');
      expect(getFrom()).toHaveBeenCalledWith('subscriptions');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'u1');
      expect(mockChain.eq).toHaveBeenCalledWith('course_id', 'c1');
    });

    it('throws error when unsubscribe fails', async () => {
      mockChain._error = new Error('Delete failed');
      await expect(unsubscribe('u1', 'c1')).rejects.toThrow('Delete failed');
    });
  });
});
