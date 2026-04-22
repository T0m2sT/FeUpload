import { getMaterialsByCourse, getMaterialsByType, uploadMaterial } from '../../services/materials';
import { buildSupabaseMock } from '../utils';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

function getFrom() {
  return jest.requireMock('../../lib/supabase').supabase.from as jest.Mock;
}

describe('materials service', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = buildSupabaseMock();
    getFrom().mockReturnValue(mockChain);
  });

  describe('getMaterialsByCourse', () => {
    it('fetches materials for a course', async () => {
      const mockData = [{ id: 'm1', title: 'Exame 2023' }];
      mockChain._data = mockData;

      const result = await getMaterialsByCourse('c1');

      expect(getFrom()).toHaveBeenCalledWith('materials');
      expect(mockChain.select).toHaveBeenCalledWith('*, profiles(name)');
      expect(mockChain.eq).toHaveBeenCalledWith('course_id', 'c1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockChain._error = new Error('Query error');
      await expect(getMaterialsByCourse('c1')).rejects.toThrow('Query error');
    });

    it('returns empty array when course has no materials', async () => {
      mockChain._data = [];
      const result = await getMaterialsByCourse('c-empty');
      expect(result).toEqual([]);
    });

    it('passes any courseId to the eq filter', async () => {
      mockChain._data = [];
      await getMaterialsByCourse('course-xyz');
      expect(mockChain.eq).toHaveBeenCalledWith('course_id', 'course-xyz');
    });
  });

  describe('getMaterialsByType', () => {
    it('fetches materials by type', async () => {
      const mockData = [{ id: 'm1', type: 'exam' }];
      mockChain._data = mockData;

      const result = await getMaterialsByType('exam');

      expect(getFrom()).toHaveBeenCalledWith('materials');
      expect(mockChain.select).toHaveBeenCalledWith('*, courses(code, name), profiles(name)');
      expect(mockChain.eq).toHaveBeenCalledWith('type', 'exam');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockChain._error = new Error('Type query failed');
      await expect(getMaterialsByType('exam')).rejects.toThrow('Type query failed');
    });

    const types = ['exam', 'exercise', 'notes', 'summary'] as const;
    types.forEach((type) => {
      it(`filters correctly for type "${type}"`, async () => {
        mockChain._data = [];
        await getMaterialsByType(type);
        expect(mockChain.eq).toHaveBeenCalledWith('type', type);
      });
    });

    it('orders results by created_at descending', async () => {
      mockChain._data = [];
      await getMaterialsByType('notes');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });

  describe('uploadMaterial', () => {
    it('uploads a new material', async () => {
      const newMaterial = {
        title: 'Summary',
        type: 'summary' as const,
        course_id: 'c1',
        user_id: 'u1',
      };
      mockChain._data = { id: 'm1', ...newMaterial };

      const result = await uploadMaterial(newMaterial);

      expect(getFrom()).toHaveBeenCalledWith('materials');
      expect(mockChain.insert).toHaveBeenCalledWith(newMaterial);
      expect(mockChain.single).toHaveBeenCalled();
      expect(result).toEqual({ id: 'm1', ...newMaterial });
    });

    it('throws error when upload fails', async () => {
      mockChain._error = new Error('Upload failed');
      await expect(
        uploadMaterial({ title: 'S', type: 'summary', course_id: 'c1', user_id: 'u1' })
      ).rejects.toThrow('Upload failed');
    });

    it('includes optional fields when provided', async () => {
      const withOptionals = {
        title: 'Exam',
        type: 'exam' as const,
        course_id: 'c1',
        user_id: 'u1',
        academic_year: '2024/2025',
        file_url: 'https://example.com/file.pdf',
        description: 'Final exam',
      };
      mockChain._data = { id: 'm2', ...withOptionals };
      await uploadMaterial(withOptionals);
      expect(mockChain.insert).toHaveBeenCalledWith(withOptionals);
    });
  });
});
