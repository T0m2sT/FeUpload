import { COURSES, type Course, type Material, type Thread, type ThreadReply } from '../../constants/courses';

describe('COURSES data structure', () => {
  it('contains at least one course', () => {
    expect(Object.keys(COURSES).length).toBeGreaterThan(0);
  });

  it('all course IDs match the id field inside the course', () => {
    Object.entries(COURSES).forEach(([key, course]) => {
      expect(course.id).toBe(key);
    });
  });

  it('every course has required fields', () => {
    Object.values(COURSES).forEach((course: Course) => {
      expect(typeof course.id).toBe('string');
      expect(course.id.length).toBeGreaterThan(0);
      expect(typeof course.name).toBe('string');
      expect(course.name.length).toBeGreaterThan(0);
      expect(typeof course.code).toBe('string');
      expect(course.code.length).toBeGreaterThan(0);
      expect(Array.isArray(course.materials)).toBe(true);
      expect(Array.isArray(course.threads)).toBe(true);
    });
  });

  it('every material has required fields', () => {
    Object.values(COURSES).forEach((course: Course) => {
      course.materials.forEach((material: Material) => {
        expect(typeof material.id).toBe('string');
        expect(material.id.length).toBeGreaterThan(0);
        expect(typeof material.title).toBe('string');
        expect(material.title.length).toBeGreaterThan(0);
        expect(['exam', 'exercise', 'summary', 'notes']).toContain(material.type);
      });
    });
  });

  it('material ratings are between 1 and 5 when defined', () => {
    Object.values(COURSES).forEach((course: Course) => {
      course.materials.forEach((material: Material) => {
        if (material.rating !== undefined) {
          expect(material.rating).toBeGreaterThanOrEqual(1);
          expect(material.rating).toBeLessThanOrEqual(5);
        }
      });
    });
  });

  it('every thread has required fields', () => {
    Object.values(COURSES).forEach((course: Course) => {
      course.threads.forEach((thread: Thread) => {
        expect(typeof thread.id).toBe('string');
        expect(thread.id.length).toBeGreaterThan(0);
        expect(typeof thread.title).toBe('string');
        expect(typeof thread.author).toBe('string');
        expect(typeof thread.body).toBe('string');
        expect(typeof thread.createdAt).toBe('string');
        expect(typeof thread.replyCount).toBe('number');
        expect(Array.isArray(thread.replies)).toBe(true);
      });
    });
  });

  it('thread replyCount matches actual replies array length', () => {
    Object.values(COURSES).forEach((course: Course) => {
      course.threads.forEach((thread: Thread) => {
        expect(thread.replyCount).toBe(thread.replies.length);
      });
    });
  });

  it('every thread reply has required fields', () => {
    Object.values(COURSES).forEach((course: Course) => {
      course.threads.forEach((thread: Thread) => {
        thread.replies.forEach((reply: ThreadReply) => {
          expect(typeof reply.id).toBe('string');
          expect(reply.id.length).toBeGreaterThan(0);
          expect(typeof reply.author).toBe('string');
          expect(typeof reply.body).toBe('string');
          expect(typeof reply.createdAt).toBe('string');
        });
      });
    });
  });

  it('ESOF course exists with correct code', () => {
    const esofKey = 'c1000000-0000-0000-0000-000000000001';
    expect(COURSES[esofKey]).toBeDefined();
    expect(COURSES[esofKey].code).toBe('ES');
  });

  it('BD course exists with correct code', () => {
    const bdKey = 'c1000000-0000-0000-0000-000000000002';
    expect(COURSES[bdKey]).toBeDefined();
    expect(COURSES[bdKey].code).toBe('BD');
  });

  it('material IDs are unique within a course', () => {
    Object.values(COURSES).forEach((course: Course) => {
      const ids = course.materials.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  it('thread IDs are unique within a course', () => {
    Object.values(COURSES).forEach((course: Course) => {
      const ids = course.threads.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  it('createdAt dates are parseable', () => {
    Object.values(COURSES).forEach((course: Course) => {
      course.threads.forEach((thread: Thread) => {
        const date = new Date(thread.createdAt);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });
  });
});
