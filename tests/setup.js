import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-symbols
jest.mock('expo-symbols', () => {
  const React = require('react');
  return {
    SymbolView: ({ testID, children }: any) => React.createElement('SymbolView', { testID }, children),
  };
});

// Mock NetInfo — native bridge isn't loaded in tests
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => () => {}),
    fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
    useNetInfo: () => ({ isConnected: true, isInternetReachable: true }),
  },
}));

// Mock expo-file-system (new SDK 54 class-based API)
jest.mock('expo-file-system', () => {
  class MockFile {
    uri = '';
    constructor() {}
    get exists() { return false; }
    get size() { return 0; }
    delete() {}
    static downloadFileAsync() { return Promise.reject(new Error('not available in tests')); }
  }
  class MockDirectory {
    uri = '';
    constructor() {}
    get exists() { return true; }
    create() {}
  }
  return { File: MockFile, Directory: MockDirectory, Paths: { document: { uri: 'file:///doc' } } };
});

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: ({ name, testID }: any) => React.createElement('Ionicons', { testID: testID || name }),
    MaterialIcons: ({ name, testID }: any) => React.createElement('MaterialIcons', { testID: testID || name }),
  };
});
