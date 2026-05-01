import {
  isValidCourse,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidStudentId,
  normalizeCourse,
  normalizeEmail,
  normalizeSpaces,
  normalizeStudentId,
  parseOptionalInteger,
} from '../../lib/validation';

describe('validation helpers', () => {
  it('normalizes spaces and email', () => {
    expect(normalizeSpaces('  Tomás   Teixeira  ')).toBe('Tomás Teixeira');
    expect(normalizeEmail('  USER@FE.UP.PT ')).toBe('user@fe.up.pt');
  });

  it('validates email, name and password constraints', () => {
    expect(isValidEmail('user@fe.up.pt')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidName('Tomás Teixeira')).toBe(true);
    expect(isValidName('Tomás_123')).toBe(false);
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('short')).toBe(false);
  });

  it('validates and normalizes profile fields', () => {
    expect(normalizeStudentId('  UP202312345 ')).toBe('up202312345');
    expect(isValidStudentId('up202312345')).toBe(true);
    expect(isValidStudentId('@@bad')).toBe(false);

    expect(normalizeCourse('  LEIC  ')).toBe('LEIC');
    expect(isValidCourse('LEIC')).toBe(true);
    expect(isValidCourse('@@')).toBe(false);

    expect(parseOptionalInteger('')).toBeNull();
    expect(parseOptionalInteger('2')).toBe(2);
    expect(Number.isNaN(parseOptionalInteger('2a') as number)).toBe(true);
  });
});
