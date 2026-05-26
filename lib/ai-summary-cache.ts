const cache = new Map<string, string>();

export function getCachedSummary(id: string): string | undefined {
  return cache.get(id);
}

export function setCachedSummary(id: string, summary: string): void {
  cache.set(id, summary);
}
