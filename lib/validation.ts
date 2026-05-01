export function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function isValidName(value: string) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,80}$/.test(value);
}

export function isValidPassword(value: string) {
  return value.length >= 8;
}

export function normalizeStudentId(value: string) {
  return value.trim().toLowerCase();
}

export function isValidStudentId(value: string) {
  return /^[a-z0-9]{5,20}$/.test(value);
}

export function normalizeCourse(value: string) {
  return normalizeSpaces(value);
}

export function isValidCourse(value: string) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ0-9 .-]{2,40}$/.test(value);
}

export function parseOptionalInteger(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;
  if (!/^\d+$/.test(normalized)) return NaN;
  return Number(normalized);
}
