export type Flashcard = { question: string; answer: string };

const summaryCache = new Map<string, string>();
const flashcardCache = new Map<string, Flashcard[]>();

export function getCachedSummary(id: string): string | undefined {
  return summaryCache.get(id);
}

export function setCachedSummary(id: string, summary: string): void {
  summaryCache.set(id, summary);
}

export function getCachedFlashcards(id: string): Flashcard[] | undefined {
  return flashcardCache.get(id);
}

export function setCachedFlashcards(id: string, cards: Flashcard[]): void {
  flashcardCache.set(id, cards);
}
