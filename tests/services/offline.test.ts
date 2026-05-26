import AsyncStorage from '@react-native-async-storage/async-storage';

const mockDownloadFileAsync = jest.fn();
const mockFiles = new Map<string, { exists: boolean; size: number }>();

jest.mock('expo-file-system', () => {
  class MockFile {
    uri: string;
    constructor(...parts: any[]) {
      this.uri = parts
        .map((p) => (typeof p === 'string' ? p : p?.uri ?? ''))
        .filter(Boolean)
        .join('/');
    }
    get exists() { return mockFiles.get(this.uri)?.exists ?? false; }
    get size() { return mockFiles.get(this.uri)?.size ?? 0; }
    delete() { mockFiles.delete(this.uri); }
    static downloadFileAsync(...args: any[]) { return mockDownloadFileAsync(...args); }
  }
  class MockDirectory {
    uri: string;
    constructor(...parts: any[]) {
      this.uri = parts
        .map((p) => (typeof p === 'string' ? p : p?.uri ?? ''))
        .filter(Boolean)
        .join('/');
    }
    get exists() { return true; }
    create() { /* no-op */ }
  }
  return {
    File: MockFile,
    Directory: MockDirectory,
    Paths: { document: { uri: 'file:///doc' } },
  };
});

import {
  downloadMaterial,
  getOfflineEntry,
  listOfflineMaterials,
  removeOfflineMaterial,
  __resetOfflineForTests,
} from '../../services/offline';

const sampleMaterial = {
  id: 'mat-1',
  title: 'Exame 2024',
  class_code: 'ES',
  type: 'exam',
  file_url: 'https://cdn.example/exam.pdf',
};

describe('offline service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockFiles.clear();
    mockDownloadFileAsync.mockReset();
    __resetOfflineForTests();
  });

  it('downloads a material and writes an index entry', async () => {
    mockDownloadFileAsync.mockImplementation((_url, dest) => {
      mockFiles.set(dest.uri, { exists: true, size: 2048 });
      return Promise.resolve(dest);
    });

    const entry = await downloadMaterial(sampleMaterial);

    expect(entry.materialId).toBe('mat-1');
    expect(entry.localUri).toContain('mat-1.pdf');
    expect(entry.sizeBytes).toBe(2048);
    expect(entry.localUriSolved).toBeUndefined();

    const list = await listOfflineMaterials();
    expect(list).toHaveLength(1);
    expect(list[0].materialId).toBe('mat-1');
  });

  it('also downloads the solved variant when file_url_solved is provided', async () => {
    mockDownloadFileAsync.mockImplementation((_url, dest) => {
      mockFiles.set(dest.uri, { exists: true, size: 1024 });
      return Promise.resolve(dest);
    });

    const entry = await downloadMaterial({
      ...sampleMaterial,
      file_url_solved: 'https://cdn.example/exam_solved.pdf',
    });

    expect(mockDownloadFileAsync).toHaveBeenCalledTimes(2);
    expect(entry.localUriSolved).toContain('mat-1_solved.pdf');
    expect(entry.sizeBytes).toBe(2048);
  });

  it('keeps the main entry when the solved download fails', async () => {
    let call = 0;
    mockDownloadFileAsync.mockImplementation((_url, dest) => {
      call += 1;
      if (call === 1) {
        mockFiles.set(dest.uri, { exists: true, size: 1024 });
        return Promise.resolve(dest);
      }
      return Promise.reject(new Error('network'));
    });

    const entry = await downloadMaterial({
      ...sampleMaterial,
      file_url_solved: 'https://cdn.example/exam_solved.pdf',
    });

    expect(entry.localUri).toContain('mat-1.pdf');
    expect(entry.localUriSolved).toBeUndefined();
  });

  it('removeOfflineMaterial deletes files and clears the entry', async () => {
    mockDownloadFileAsync.mockImplementation((_url, dest) => {
      mockFiles.set(dest.uri, { exists: true, size: 100 });
      return Promise.resolve(dest);
    });

    await downloadMaterial(sampleMaterial);
    expect(await getOfflineEntry('mat-1')).not.toBeNull();
    expect(mockFiles.size).toBe(1);

    await removeOfflineMaterial('mat-1');

    expect(await getOfflineEntry('mat-1')).toBeNull();
    expect(mockFiles.size).toBe(0);
    expect(await listOfflineMaterials()).toHaveLength(0);
  });

  it('listOfflineMaterials returns entries sorted by downloadedAt descending', async () => {
    mockDownloadFileAsync.mockImplementation((_url, dest) => {
      mockFiles.set(dest.uri, { exists: true, size: 100 });
      return Promise.resolve(dest);
    });

    await downloadMaterial({ ...sampleMaterial, id: 'older' });
    // Force a later timestamp on the second download by advancing time.
    jest.useFakeTimers().setSystemTime(new Date('2099-01-01'));
    await downloadMaterial({ ...sampleMaterial, id: 'newer', title: 'New' });
    jest.useRealTimers();

    const list = await listOfflineMaterials();
    expect(list.map((e) => e.materialId)).toEqual(['newer', 'older']);
  });
});
