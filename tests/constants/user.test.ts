import { user } from '../../constants/user';

describe('user constant', () => {
  it('has all required fields', () => {
    expect(typeof user.name).toBe('string');
    expect(user.name.length).toBeGreaterThan(0);
    expect(typeof user.email).toBe('string');
    expect(user.email.length).toBeGreaterThan(0);
    expect(typeof user.course).toBe('string');
    expect(user.course.length).toBeGreaterThan(0);
    expect(typeof user.year).toBe('number');
    expect(typeof user.semester).toBe('number');
    expect(typeof user.studentId).toBe('string');
    expect(user.studentId.length).toBeGreaterThan(0);
  });

  it('name is correct', () => {
    expect(user.name).toBe('Rafael');
  });

  it('email is valid format', () => {
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(user.email).toBe('rafael@fe.up.pt');
  });

  it('course is LEIC', () => {
    expect(user.course).toBe('LEIC');
  });

  it('year is 2', () => {
    expect(user.year).toBe(2);
  });

  it('year is a positive number', () => {
    expect(user.year).toBeGreaterThan(0);
    expect(user.year).toBeLessThanOrEqual(5);
  });

  it('semester is 2', () => {
    expect(user.semester).toBe(2);
  });

  it('semester is valid (1 or 2)', () => {
    expect([1, 2]).toContain(user.semester);
  });

  it('studentId is in correct format', () => {
    expect(user.studentId).toMatch(/^up\d+$/);
  });

  it('studentId starts with "up"', () => {
    expect(user.studentId).toMatch(/^up/);
  });

  it('studentId followed by numbers', () => {
    expect(user.studentId).toBe('up202312345');
  });

  it('all string fields are non-empty', () => {
    expect(user.name).toBeTruthy();
    expect(user.email).toBeTruthy();
    expect(user.course).toBeTruthy();
    expect(user.studentId).toBeTruthy();
  });

  it('all numeric fields are non-zero', () => {
    expect(user.year).toBeTruthy();
    expect(user.semester).toBeTruthy();
  });
});
