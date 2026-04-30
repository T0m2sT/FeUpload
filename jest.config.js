module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  collectCoverageFrom: [
    'services/**/*.ts',
    'hooks/**/*.ts',
    'contexts/**/*.tsx',
    'constants/**/*.ts',
    'components/**/*.tsx',
    '!**/*.d.ts',
  ],
  coverageReporters: ['json', 'json-summary', 'lcov'],
};
