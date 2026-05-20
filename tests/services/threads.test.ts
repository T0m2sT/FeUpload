import { getThreadsByCourse, createThread, getReplies, createReply } from '../../services/threads';
import { buildSupabaseMock } from '../utils';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

function getFrom() {
  return jest.requireMock('../../lib/supabase').supabase.from as jest.Mock;
}

describe('threads service', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = buildSupabaseMock();
    getFrom().mockReturnValue(mockChain);
  });

  describe('getThreadsByCourse', () => {
    it('fetches threads for a course', async () => {
      const mockData = [{ id: 't1', title: 'Question' }];
      mockChain._data = mockData;

      const result = await getThreadsByCourse('c1');

      expect(getFrom()).toHaveBeenCalledWith('threads');
      expect(mockChain.select).toHaveBeenCalledWith('*, profiles(name)');
      expect(mockChain.eq).toHaveBeenCalledWith('course_id', 'c1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockChain._error = new Error('Query failed');
      await expect(getThreadsByCourse('c1')).rejects.toThrow('Query failed');
    });

    it('returns empty array when no threads exist', async () => {
      mockChain._data = [];
      const result = await getThreadsByCourse('c-quiet');
      expect(result).toEqual([]);
    });
  });

  describe('createThread', () => {
    it('creates a new thread', async () => {
      const newThread = { title: 'T', body: 'B', course_id: 'c1', user_id: 'u1' };
      mockChain._data = { id: 't1', ...newThread };

      const result = await createThread(newThread);

      expect(getFrom()).toHaveBeenCalledWith('threads');
      expect(mockChain.insert).toHaveBeenCalledWith(newThread);
      expect(result).toEqual({ id: 't1', ...newThread });
    });

    it('creates a thread with a label', async () => {
      const newThread = { title: 'T', body: 'B', course_id: 'c1', user_id: 'u1', label: 'Question' };
      mockChain._data = { id: 't1', ...newThread };

      const result = await createThread(newThread);

      expect(getFrom()).toHaveBeenCalledWith('threads');
      expect(mockChain.insert).toHaveBeenCalledWith(newThread);
      expect(result.label).toEqual('Question');
    });

    it('throws error when creation fails', async () => {
      mockChain._error = new Error('Insert failed');
      await expect(
        createThread({ title: 'T', body: 'B', course_id: 'c1', user_id: 'u1' })
      ).rejects.toThrow('Insert failed');
    });

    it('passes all required fields to insert', async () => {
      const newThread = { title: 'Title', body: 'Body text', course_id: 'c2', user_id: 'u2' };
      mockChain._data = {};
      await createThread(newThread);
      expect(mockChain.insert).toHaveBeenCalledWith(newThread);
    });

    it('supports all label types', async () => {
      const labels = ['Question', 'Project', 'Advice', 'Other'];
      
      for (const label of labels) {
        mockChain._data = {};
        jest.clearAllMocks();
        getFrom().mockReturnValue(mockChain);
        
        const newThread = { title: 'T', body: 'B', course_id: 'c1', user_id: 'u1', label };
        mockChain._data = { id: `t-${label}`, ...newThread };
        
        const result = await createThread(newThread);
        expect(result.label).toEqual(label);
      }
    });
  });

  describe('getReplies', () => {
    it('fetches replies for a thread', async () => {
      const mockData = [{ id: 'r1', body: 'Reply' }];
      mockChain._data = mockData;

      const result = await getReplies('t1');

      expect(getFrom()).toHaveBeenCalledWith('thread_replies');
      expect(mockChain.select).toHaveBeenCalledWith('*, profiles(name)');
      expect(mockChain.eq).toHaveBeenCalledWith('thread_id', 't1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockChain._error = new Error('Replies query failed');
      await expect(getReplies('t1')).rejects.toThrow('Replies query failed');
    });

    it('returns empty array when thread has no replies', async () => {
      mockChain._data = [];
      const result = await getReplies('t-no-replies');
      expect(result).toEqual([]);
    });

    it('orders replies chronologically (ascending)', async () => {
      mockChain._data = [];
      await getReplies('t1');
      // getReplies uses order('created_at') without ascending:false, meaning ascending
      expect(mockChain.order).toHaveBeenCalledWith('created_at');
    });
  });

  describe('createReply', () => {
    it('creates a new reply', async () => {
      const newReply = { thread_id: 't1', user_id: 'u1', body: 'B' };
      mockChain._data = { id: 'r1', ...newReply };

      const result = await createReply(newReply);

      expect(getFrom()).toHaveBeenCalledWith('thread_replies');
      expect(mockChain.insert).toHaveBeenCalledWith(newReply);
      expect(result).toEqual({ id: 'r1', ...newReply });
    });

    it('throws error when creation fails', async () => {
      mockChain._error = new Error('Reply insert failed');
      await expect(
        createReply({ thread_id: 't1', user_id: 'u1', body: 'B' })
      ).rejects.toThrow('Reply insert failed');
    });
  });
});
