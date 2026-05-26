/**
 * Label Filtering Logic Tests
 * Tests for filtering threads by labels
 */

interface ThreadRow {
  id: string;
  title: string;
  label: string;
}

function filterThreadsByLabels(threads: ThreadRow[], selectedLabels: Set<string>): ThreadRow[] {
  return threads.filter(thread => selectedLabels.has(thread.label));
}

describe('Label Filtering', () => {
  const mockThreads: ThreadRow[] = [
    { id: 't1', title: 'How to debug?', label: 'Question' },
    { id: 't2', title: 'Final project submission', label: 'Project' },
    { id: 't3', title: 'Study tips', label: 'Advice' },
    { id: 't4', title: 'Course announcement', label: 'Other' },
    { id: 't5', title: 'Where to submit?', label: 'Question' },
    { id: 't6', title: 'Team formation', label: 'Project' },
  ];

  describe('filterThreadsByLabels', () => {
    it('returns all threads when all labels are selected', () => {
      const allLabels = new Set(['Question', 'Project', 'Advice', 'Other']);
      const result = filterThreadsByLabels(mockThreads, allLabels);
      expect(result).toHaveLength(6);
      expect(result).toEqual(mockThreads);
    });

    it('filters threads by single label', () => {
      const questionOnly = new Set(['Question']);
      const result = filterThreadsByLabels(mockThreads, questionOnly);
      expect(result).toHaveLength(2);
      expect(result.every(t => t.label === 'Question')).toBe(true);
      expect(result[0].id).toBe('t1');
      expect(result[1].id).toBe('t5');
    });

    it('filters threads by multiple labels', () => {
      const questionsAndProjects = new Set(['Question', 'Project']);
      const result = filterThreadsByLabels(mockThreads, questionsAndProjects);
      expect(result).toHaveLength(4);
      expect(result.every(t => t.label === 'Question' || t.label === 'Project')).toBe(true);
    });

    it('returns empty array when no labels match', () => {
      const noLabels = new Set<string>();
      const result = filterThreadsByLabels(mockThreads, noLabels);
      expect(result).toHaveLength(0);
    });

    it('filters threads by Advice label', () => {
      const adviceOnly = new Set(['Advice']);
      const result = filterThreadsByLabels(mockThreads, adviceOnly);
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Advice');
      expect(result[0].id).toBe('t3');
    });

    it('filters threads by Other label', () => {
      const otherOnly = new Set(['Other']);
      const result = filterThreadsByLabels(mockThreads, otherOnly);
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Other');
      expect(result[0].id).toBe('t4');
    });

    it('preserves thread order when filtering', () => {
      const projectsOnly = new Set(['Project']);
      const result = filterThreadsByLabels(mockThreads, projectsOnly);
      expect(result[0].id).toBe('t2');
      expect(result[1].id).toBe('t6');
    });

    it('handles empty thread array', () => {
      const allLabels = new Set(['Question', 'Project', 'Advice', 'Other']);
      const result = filterThreadsByLabels([], allLabels);
      expect(result).toHaveLength(0);
    });
  });

  describe('Label Toggle Logic', () => {
    it('toggles label selection on', () => {
      const filters = new Set<string>();
      filters.add('Question');
      expect(filters.has('Question')).toBe(true);
      expect(filters.size).toBe(1);
    });

    it('toggles label selection off', () => {
      const filters = new Set(['Question', 'Project']);
      filters.delete('Question');
      expect(filters.has('Question')).toBe(false);
      expect(filters.size).toBe(1);
    });

    it('maintains default state with all labels selected', () => {
      const labels = ['Question', 'Project', 'Advice', 'Other'];
      const defaultFilters = new Set(labels);
      expect(defaultFilters.size).toBe(4);
      expect(Array.from(defaultFilters).sort()).toEqual(labels.sort());
    });

    it('correctly identifies when no filters are selected', () => {
      const filters = new Set<string>();
      expect(filters.size).toBe(0);
    });

    it('does not add duplicate labels', () => {
      const filters = new Set<string>();
      filters.add('Question');
      filters.add('Question');
      expect(filters.size).toBe(1);
    });
  });

  describe('Thread Label Structure', () => {
    it('validates thread has required label field', () => {
      const thread = mockThreads[0];
      expect(thread).toHaveProperty('label');
      expect(typeof thread.label).toBe('string');
    });

    it('ensures all threads have valid label values', () => {
      const validLabels = ['Question', 'Project', 'Advice', 'Other'];
      mockThreads.forEach(thread => {
        expect(validLabels).toContain(thread.label);
      });
    });
  });
});
