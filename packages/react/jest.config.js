module.exports = {
  roots: ['<rootDir>/src', '<rootDir>'],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@simplux/async$': '<rootDir>/../async/index.ts',
    '^@simplux/core$': '<rootDir>/../core/index.ts',
    '^@simplux/testing$': '<rootDir>/../testing/index.ts',
    '^@simplux/react$': '<rootDir>/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts?(x)', '<rootDir>/e2e.spec.tsx'],
  testPathIgnorePatterns: ['node_modules'],
}
