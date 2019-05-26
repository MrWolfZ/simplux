module.exports = {
  roots: [
    '<rootDir>/src',
    '<rootDir>',
  ],
  moduleFileExtensions: [
    'js',
    'ts',
  ],
  moduleNameMapper: {
    '^@simplux/core$': '<rootDir>/../core/index.ts',
    '^@simplux/react$': '<rootDir>/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/src/**/*.spec.tsx?',
    '<rootDir>/e2e.spec.ts',
  ],
  testPathIgnorePatterns: [
    'node_modules'
  ],
};
