export type MaterialType = 'exam' | 'exercise' | 'notes' | 'summary';

type TagSuggestion = {
  title?: string;
  type?: MaterialType;
  year?: string;
};

const TYPE_PATTERNS: { pattern: RegExp; type: MaterialType }[] = [
  { pattern: /exam[e]?|teste|prova|epoch|época|recurso|normal|época/i, type: 'exam' },
  { pattern: /ficha|exerc[ií]c|worksheet|problem|lista/i, type: 'exercise' },
  { pattern: /resum[o]?|cheat.?sheet|apontamento|nota[s]?|summary|notes/i, type: 'summary' },
  { pattern: /apontamento|nota[s]?|slides?|teorica|teórica|lecture/i, type: 'notes' },
];

const YEAR_PATTERN = /20(\d{2})[_\-\/]?(?:20)?(\d{2})/;
const SINGLE_YEAR_PATTERN = /20(\d{2})/;

const ACADEMIC_YEARS = ['2025/2026', '2024/2025', '2023/2024', '2022/2023', '2021/2022'];

function normalizeFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')        // remove extension
    .replace(/[_\-\.]+/g, ' ')      // underscores/dashes/dots → spaces
    .trim();
}

function suggestType(name: string): MaterialType | undefined {
  for (const { pattern, type } of TYPE_PATTERNS) {
    if (pattern.test(name)) return type;
  }
  return undefined;
}

function suggestYear(name: string): string | undefined {
  const rangeMatch = name.match(YEAR_PATTERN);
  if (rangeMatch) {
    const y1 = `20${rangeMatch[1]}`;
    const y2 = rangeMatch[2].length === 2 ? `20${rangeMatch[2]}` : rangeMatch[2];
    const candidate = `${y1}/${y2}`;
    if (ACADEMIC_YEARS.includes(candidate)) return candidate;
  }
  const singleMatch = name.match(SINGLE_YEAR_PATTERN);
  if (singleMatch) {
    const y = parseInt(`20${singleMatch[1]}`, 10);
    // map calendar year to academic year (e.g. 2023 → 2023/2024)
    const candidate = `${y}/${y + 1}`;
    if (ACADEMIC_YEARS.includes(candidate)) return candidate;
    const prev = `${y - 1}/${y}`;
    if (ACADEMIC_YEARS.includes(prev)) return prev;
  }
  return undefined;
}

function suggestTitle(normalized: string): string {
  // Capitalize first letter of each word, limit length
  return normalized
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .slice(0, 80);
}

export function suggestTagsFromFilename(filename: string): TagSuggestion {
  const normalized = normalizeFilename(filename);
  return {
    title: suggestTitle(normalized),
    type: suggestType(normalized),
    year: suggestYear(normalized),
  };
}
