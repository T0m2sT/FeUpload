import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

export type OfflineEntry = {
  materialId: string;
  title: string;
  courseCode: string;
  type: string;
  localUri: string;
  localUriSolved?: string;
  sizeBytes: number;
  downloadedAt: string;
  remoteUri?: string;
  remoteUriSolved?: string;
};

type Index = Record<string, OfflineEntry>;

const INDEX_KEY = 'offline:index:v1';
const SUBDIR = 'materials';

const listeners = new Set<(idx: Index) => void>();
let cached: Index | null = null;

async function readIndex(): Promise<Index> {
  if (cached) return cached;
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  cached = raw ? (JSON.parse(raw) as Index) : {};
  return cached;
}

async function writeIndex(next: Index) {
  cached = next;
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(next));
  listeners.forEach((fn) => fn(next));
}

function materialsDir(): Directory {
  const dir = new Directory(Paths.document, SUBDIR);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

async function downloadOne(url: string, filename: string): Promise<{ uri: string; size: number }> {
  const dir = materialsDir();
  const file = await File.downloadFileAsync(url, new File(dir, filename));
  return { uri: file.uri, size: file.size ?? 0 };
}

export const offlineSupported = Platform.OS !== 'web';

export async function downloadMaterial(input: {
  id: string;
  title: string;
  class_code: string;
  type: string;
  file_url: string;
  file_url_solved?: string | null;
}): Promise<OfflineEntry> {
  if (!offlineSupported) {
    throw new Error('Downloads offline só estão disponíveis no telemóvel.');
  }
  const baseName = `${input.id}.pdf`;
  const solvedName = `${input.id}_solved.pdf`;

  const main = await downloadOne(input.file_url, baseName);
  let solved: { uri: string; size: number } | null = null;
  if (input.file_url_solved) {
    try {
      solved = await downloadOne(input.file_url_solved, solvedName);
    } catch {
      // If the solution download fails, keep the main file but skip the solved variant.
    }
  }

  const entry: OfflineEntry = {
    materialId: input.id,
    title: input.title,
    courseCode: input.class_code,
    type: input.type,
    localUri: main.uri,
    localUriSolved: solved?.uri,
    sizeBytes: main.size + (solved?.size ?? 0),
    downloadedAt: new Date().toISOString(),
    remoteUri: input.file_url,
    remoteUriSolved: input.file_url_solved ?? undefined,
  };

  const idx = await readIndex();
  await writeIndex({ ...idx, [input.id]: entry });
  return entry;
}

export async function removeOfflineMaterial(materialId: string): Promise<void> {
  const idx = await readIndex();
  const entry = idx[materialId];
  if (!entry) return;

  const tryDelete = (uri?: string) => {
    if (!uri) return;
    try {
      const f = new File(uri);
      if (f.exists) f.delete();
    } catch {
      // Best-effort cleanup; ignore filesystem errors.
    }
  };
  tryDelete(entry.localUri);
  tryDelete(entry.localUriSolved);

  const next = { ...idx };
  delete next[materialId];
  await writeIndex(next);
}

export async function getOfflineEntry(materialId: string): Promise<OfflineEntry | null> {
  const idx = await readIndex();
  return idx[materialId] ?? null;
}

export async function listOfflineMaterials(): Promise<OfflineEntry[]> {
  const idx = await readIndex();
  return Object.values(idx).sort((a, b) => b.downloadedAt.localeCompare(a.downloadedAt));
}

export function useOfflineIndex(): Index {
  const [idx, setIdx] = useState<Index>(cached ?? {});
  useEffect(() => {
    let active = true;
    readIndex().then((i) => { if (active) setIdx(i); });
    const listener = (next: Index) => setIdx(next);
    listeners.add(listener);
    return () => { active = false; listeners.delete(listener); };
  }, []);
  return idx;
}

/** Test helper – not part of the public API. */
export function __resetOfflineForTests() {
  cached = null;
  listeners.clear();
}
