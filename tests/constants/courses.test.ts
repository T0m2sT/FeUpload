import type { Course, Material, Thread, ThreadReply } from '../../constants/courses';

describe('courses types', () => {
  it('Material type accepts valid exam', () => {
    const m: Material = { id: 'm1', title: 'Exam 2024', type: 'exam' };
    expect(m.type).toBe('exam');
  });

  it('Material type accepts all valid type values', () => {
    const types: Material['type'][] = ['exam', 'exercise', 'summary', 'notes'];
    types.forEach((type) => {
      const m: Material = { id: '1', title: 'T', type };
      expect(m.type).toBe(type);
    });
  });

  it('Material optional fields are truly optional', () => {
    const m: Material = { id: 'm1', title: 'Minimal', type: 'notes' };
    expect(m.subtitle).toBeUndefined();
    expect(m.rating).toBeUndefined();
    expect(m.pdf).toBeUndefined();
  });

  it('Material rating can be set', () => {
    const m: Material = { id: 'm1', title: 'Rated', type: 'exam', rating: 4 };
    expect(m.rating).toBe(4);
  });

  it('ThreadReply has all required fields', () => {
    const r: ThreadReply = { id: 'r1', author: 'alice', body: 'Hello', createdAt: '2025-01-01' };
    expect(r.id).toBe('r1');
    expect(r.author).toBe('alice');
  });

  it('Thread has all required fields', () => {
    const t: Thread = {
      id: 't1',
      title: 'Question',
      author: 'bob',
      body: 'Body text',
      createdAt: '2025-01-01',
      replyCount: 0,
      replies: [],
    };
    expect(t.id).toBe('t1');
    expect(Array.isArray(t.replies)).toBe(true);
  });

  it('Course has all required fields', () => {
    const c: Course = {
      id: 'c1',
      name: 'Test Course',
      code: 'TC',
      materials: [],
      threads: [],
    };
    expect(c.code).toBe('TC');
    expect(Array.isArray(c.materials)).toBe(true);
    expect(Array.isArray(c.threads)).toBe(true);
  });
});
