import { Platform } from 'react-native';
import { 
  getMaterialsByCourse, 
  getMaterialsByType, 
  uploadMaterial, 
  uploadMaterialFile 
} from '../../services/materials';
import { buildSupabaseMock } from '../utils';

// Mock react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

// Mock supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}));

function getFrom() {
  return jest.requireMock('../../lib/supabase').supabase.from as jest.Mock;
}

function getStorageFrom() {
  return jest.requireMock('../../lib/supabase').supabase.storage.from as jest.Mock;
}

describe('materials service', () => {
  let mockChain: any;
  let mockStorage: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Database mock
    mockChain = buildSupabaseMock();
    getFrom().mockReturnValue(mockChain);

    // Storage mock
    mockStorage = {
      upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.com/file.pdf' } }),
    };
    getStorageFrom().mockReturnValue(mockStorage);
    
    // Default to android
    (Platform as any).OS = 'android';
    
    // Global fetch mock for web tests
    global.fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'application/pdf' })),
    });
  });

  describe('getMaterialsByCourse', () => {
    it('fetches materials for a course', async () => {
      const mockData = [{ id: 'm1', title: 'Exame 2023' }];
      mockChain._data = mockData;

      const result = await getMaterialsByCourse('c1');

      expect(getFrom()).toHaveBeenCalledWith('materials');
      expect(mockChain.select).toHaveBeenCalledWith('*, profiles(name)');
      expect(mockChain.eq).toHaveBeenCalledWith('class_code', 'c1');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockChain._error = new Error('Query error');
      await expect(getMaterialsByCourse('c1')).rejects.toThrow('Query error');
    });
  });

  describe('getMaterialsByType', () => {
    it('fetches materials by type', async () => {
      const mockData = [{ id: 'm1', type: 'exam' }];
      mockChain._data = mockData;

      const result = await getMaterialsByType('exam');

      expect(getFrom()).toHaveBeenCalledWith('materials');
      expect(mockChain.select).toHaveBeenCalledWith('*, courses(code, name), profiles(name)');
      expect(mockChain.eq).toHaveBeenCalledWith('type', 'exam');
      expect(result).toEqual(mockData);
    });

    it('throws error on failure', async () => {
      mockChain._error = new Error('Type query failed');
      await expect(getMaterialsByType('exam')).rejects.toThrow('Type query failed');
    });
  });

  describe('uploadMaterial', () => {
    it('uploads a new material', async () => {
      const newMaterial = {
        title: 'Summary',
        type: 'summary' as const,
        class_code: 'c1',
        user_id: 'u1',
      };
      mockChain._data = { id: 'm1', ...newMaterial };

      const result = await uploadMaterial(newMaterial);

      expect(getFrom()).toHaveBeenCalledWith('materials');
      expect(mockChain.insert).toHaveBeenCalledWith(newMaterial);
      expect(mockChain.single).toHaveBeenCalled();
      expect(result).toEqual({ id: 'm1', ...newMaterial });
    });

    it('throws error when upload fails', async () => {
      mockChain._error = new Error('Upload failed');
      await expect(
        uploadMaterial({ title: 'S', type: 'summary', class_code: 'c1', user_id: 'u1' })
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('uploadMaterialFile', () => {
    const fileParams = {
      uri: 'file://test.pdf',
      name: 'test.pdf',
      type: 'application/pdf',
      year: 1,
      semester: 2,
      code: 'ES',
    };

    it('uploads file using FormData on Native (Android/iOS)', async () => {
      (Platform as any).OS = 'android';
      
      const url = await uploadMaterialFile(
        fileParams.uri, 
        fileParams.name, 
        fileParams.type, 
        fileParams.year, 
        fileParams.semester, 
        fileParams.code
      );

      expect(getStorageFrom()).toHaveBeenCalledWith('LEIC');
      expect(mockStorage.upload).toHaveBeenCalledWith(
        expect.stringContaining('Y1/S2/ES/'),
        expect.any(FormData),
        expect.objectContaining({ contentType: 'application/pdf' })
      );
      expect(url).toBe('https://cdn.com/file.pdf');
    });

    it('uploads file using Blob on Web', async () => {
      (Platform as any).OS = 'web';
      
      const url = await uploadMaterialFile(
        'blob:http://localhost/123', 
        fileParams.name, 
        fileParams.type, 
        fileParams.year, 
        fileParams.semester, 
        fileParams.code
      );

      expect(global.fetch).toHaveBeenCalledWith('blob:http://localhost/123');
      expect(mockStorage.upload).toHaveBeenCalledWith(
        expect.stringContaining('Y1/S2/ES/'),
        expect.any(Blob),
        expect.objectContaining({ contentType: 'application/pdf' })
      );
      expect(url).toBe('https://cdn.com/file.pdf');
    });

    it('sanitizes filenames correctly', async () => {
      await uploadMaterialFile(
        fileParams.uri, 
        'Exame (Final)!.pdf', 
        fileParams.type, 
        fileParams.year, 
        fileParams.semester, 
        fileParams.code
      );

      expect(mockStorage.upload).toHaveBeenCalledWith(
        expect.stringContaining('_Exame__Final__.pdf'),
        expect.any(FormData),
        expect.any(Object)
      );
    });

    it('throws error when storage upload fails', async () => {
      mockStorage.upload.mockResolvedValue({ data: null, error: new Error('Storage error') });
      
      await expect(uploadMaterialFile(
        fileParams.uri, 
        fileParams.name, 
        fileParams.type, 
        fileParams.year, 
        fileParams.semester, 
        fileParams.code
      )).rejects.toThrow('Storage error');
    });
  });
});
