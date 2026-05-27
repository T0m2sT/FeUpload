import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

export type OfflineEntry = {
  materialId: string;
  title: string;
  courseCode: string;
  type: string;
  localUri: string; // Relative filename
  localUriSolved?: string; // Relative filename
  sizeBytes: number;
  downloadedAt: string;
  remoteUri?: string;
  remoteUriSolved?: string;
};

// Helper to resolve relative filename to absolute URI
export function resolveLocalUri(filename: string): string {
  if (Platform.OS === 'web') return filename;
  const file = new File(materialsDir(), filename);
  return file.uri;
}

type Index = Record<string, OfflineEntry>;

const INDEX_KEY = 'offline:index:v1';
const SUBDIR = 'materials';

const listeners = new Set<(idx: Index) => void>();
let cached: Index | null = null;

// Map of materialId to currently created object URLs (web only)
const objectUrlMap = new Map<string, string>();

// Simple IndexedDB helpers for storing blobs on the web
async function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('feupload-offline-db', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('offline-files')) {
        db.createObjectStore('offline-files');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, blob: Blob) {
  const db = await openIdb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('offline-files', 'readwrite');
    const store = tx.objectStore('offline-files');
    const rq = store.put(blob, key);
    rq.onsuccess = () => resolve();
    rq.onerror = () => reject(rq.error);
  });
}

async function idbGet(key: string): Promise<Blob | null> {
  const db = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline-files', 'readonly');
    const store = tx.objectStore('offline-files');
    const rq = store.get(key);
    rq.onsuccess = () => resolve(rq.result ?? null);
    rq.onerror = () => reject(rq.error);
  });
}

async function idbDelete(key: string) {
  const db = await openIdb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('offline-files', 'readwrite');
    const store = tx.objectStore('offline-files');
    const rq = store.delete(key);
    rq.onsuccess = () => resolve();
    rq.onerror = () => reject(rq.error);
  });
}

// Hydrate index entries on web by creating object URLs for stored blobs
async function hydrateIndexForWeb(idx: Index): Promise<Index> {
  if (Platform.OS !== 'web') return idx;
  // Revoke object URLs that are no longer present
  const next = { ...idx } as Index;
  // Revoke any object URLs not in next
  for (const [k, url] of objectUrlMap.entries()) {
    if (!next[k]) {
      try { URL.revokeObjectURL(url); } catch {}
      objectUrlMap.delete(k);
    }
  }

  // Create object URLs for entries that have stored blobs
  await Promise.all(Object.keys(next).map(async (id) => {
    const entry = next[id];
    if (!entry) return;
    // if we already have an object URL keep it
    if (objectUrlMap.has(id)) {
      entry.localUri = objectUrlMap.get(id)!;
      return;
    }
    // try main file
    const blob = await idbGet(id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      objectUrlMap.set(id, url);
      entry.localUri = url;
    } else {
      // try solved variant
      const blobSolved = await idbGet(id + '_solved');
      if (blobSolved) {
        const url = URL.createObjectURL(blobSolved);
        objectUrlMap.set(id, url);
        entry.localUri = url;
      }
    }
  }));

  return next;
}


async function readIndex(): Promise<Index> {
  if (cached) return cached;
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  const base = raw ? (JSON.parse(raw) as Index) : {};
  
  // Migration: sanitize absolute paths to relative filenames
  let needsWrite = false;
  for (const id in base) {
    const entry = base[id];
    if (entry.localUri.startsWith('/')) {
      entry.localUri = entry.localUri.split('/').pop()!;
      needsWrite = true;
    }
    if (entry.localUriSolved && entry.localUriSolved.startsWith('/')) {
      entry.localUriSolved = entry.localUriSolved.split('/').pop()!;
      needsWrite = true;
    }
  }
  if (needsWrite) await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(base));

  // On web, try to rehydrate object URLs from IndexedDB
  if (Platform.OS === 'web') {
    cached = await hydrateIndexForWeb(base);
  } else {
    cached = base;
  }
  return cached;
}

async function writeIndex(next: Index) {
  // Persist raw index (without object URLs) so it's portable across platforms
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(next));
  // Hydrate for web consumers so localUri points to object URLs created from blobs
  if (Platform.OS === 'web') {
    cached = await hydrateIndexForWeb(next);
  } else {
    cached = next;
  }
  listeners.forEach((fn) => fn(cached!));
}

function materialsDir(): Directory {
  const dir = new Directory(Paths.document, SUBDIR);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

async function downloadOne(url: string, filename: string): Promise<{ uri: string; size: number }> {
  const dir = materialsDir();
  const file = new File(dir, filename);
  if (file.exists) {
    file.delete();
  }
  const downloadedFile = await File.downloadFileAsync(url, file);
  return { uri: downloadedFile.uri, size: downloadedFile.size ?? 0 };
}

export const offlineSupported = Platform.OS !== 'web';

export async function downloadMaterial(input: {
  id: string;
  title: string;
  class_code: string;
  type: string;
  file_url: string;
  file_url_solved?: string | null;
}): Promise<OfflineEntry | undefined> {
  if (Platform.OS === 'web') {
    // Persist blobs into IndexedDB and register the index so web can list them
    try {
      const mainResp = await fetch(input.file_url);
      const mainBlob = await mainResp.blob();
      await idbPut(input.id, mainBlob);

      let solvedBlob: Blob | null = null;
      if (input.file_url_solved) {
        try {
          const sResp = await fetch(input.file_url_solved);
          solvedBlob = await sResp.blob();
          await idbPut(input.id + '_solved', solvedBlob);
        } catch {
          // ignore solved download errors
        }
      }

      const size = (mainBlob?.size ?? 0) + (solvedBlob?.size ?? 0);
      const entry: OfflineEntry = {
        materialId: input.id,
        title: input.title,
        courseCode: input.class_code,
        type: input.type,
        localUri: '', // will be hydrated from IndexedDB when index is read
        localUriSolved: undefined,
        sizeBytes: size,
        downloadedAt: new Date().toISOString(),
        remoteUri: input.file_url,
        remoteUriSolved: input.file_url_solved ?? undefined,
      };

      const idx = await readIndex();
      await writeIndex({ ...idx, [input.id]: entry });
      return entry;
    } catch (e) {
      console.error('Failed to download/store file on web:', e);
      // Fallback: trigger direct download
      const urls = [input.file_url, input.file_url_solved].filter(Boolean) as string[];
      for (const url of urls) {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `${input.title}${url === input.file_url_solved ? '_resolucao' : ''}.pdf`;
        a.click();
        window.URL.revokeObjectURL(objectUrl);
      }
      return;
    }
  }

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
    localUri: baseName,
    localUriSolved: solved ? solvedName : undefined,
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

  if (Platform.OS !== 'web') {
    const tryDelete = (filename?: string) => {
      if (!filename) return;
      try {
        const f = new File(materialsDir(), filename);
        if (f.exists) f.delete();
      } catch {
        // Best-effort cleanup; ignore filesystem errors.
      }
    };
    tryDelete(entry.localUri);
    tryDelete(entry.localUriSolved);
  } else {
    // Remove stored blobs and revoke any created object URL
    try { await idbDelete(materialId); } catch {}
    try { await idbDelete(materialId + '_solved'); } catch {}
    const url = objectUrlMap.get(materialId);
    if (url) {
      try { URL.revokeObjectURL(url); } catch {}
      objectUrlMap.delete(materialId);
    }
  }

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

/** Force a refresh/notification of the current index (useful when components need to ensure UI updates) */
export async function refreshOfflineIndex() {
  const idx = await readIndex();
  listeners.forEach((fn) => fn(idx));
}

/** Test helper – not part of the public API. */
export function __resetOfflineForTests() {
  cached = null;
  listeners.clear();
}
