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

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: ({ name, testID }: any) => React.createElement('Ionicons', { testID: testID || name }),
    MaterialIcons: ({ name, testID }: any) => React.createElement('MaterialIcons', { testID: testID || name }),
  };
});
