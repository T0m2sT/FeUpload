import { getCourses, getCourseById } from '../../services/courses';
import { buildSupabaseMock } from '../utils';

jest.mock('../../lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

function getFrom() {
  return jest.requireMock('../../lib/supabase').supabase.from as jest.Mock;
}

describe('courses service', () => {
  let mockChain: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChain = buildSupabaseMock();
    getFrom().mockReturnValue(mockChain);
  });

  describe('getCourses', () => {
    it('returns list of courses on success', async () => {
      const courses = [
        { id: '1', name: 'Algoritmos', code: 'AED' },
        { id: '2', name: 'Bases de Dados', code: 'BD' },
      ];
      mockChain._data = courses;

      const result = await getCourses();

      expect(getFrom()).toHaveBeenCalledWith('courses');
      expect(result).toEqual(courses);
    });

    it('throws when query fails', async () => {
      mockChain._error = new Error('Connection failed');
      await expect(getCourses()).rejects.toThrow('Connection failed');
    });

    it('orders by name', async () => {
      mockChain._data = [];
      await getCourses();
      expect(mockChain.order).toHaveBeenCalledWith('name');
    });

    it('selects all fields', async () => {
      mockChain._data = [];
      await getCourses();
      expect(mockChain.select).toHaveBeenCalledWith('*');
    });

    it('returns empty array when no courses exist', async () => {
      mockChain._data = [];
      const result = await getCourses();
      expect(result).toEqual([]);
    });
  });

  describe('getCourseById', () => {
    it('returns course when found', async () => {
      const course = { id: 'c1', name: 'Engenharia de Software', code: 'ESOF' };
      mockChain._data = course;

      const result = await getCourseById('c1');

      expect(getFrom()).toHaveBeenCalledWith('courses');
      expect(result).toEqual(course);
    });

    it('throws when course not found', async () => {
      mockChain._error = new Error('Not found');
      await expect(getCourseById('nonexistent')).rejects.toThrow('Not found');
    });

    it('filters by the provided id', async () => {
      mockChain._data = {};
      await getCourseById('abc-123');
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'abc-123');
    });

    it('uses single() to return one record', async () => {
      mockChain._data = {};
      await getCourseById('c1');
      expect(mockChain.single).toHaveBeenCalled();
    });
  });
});
