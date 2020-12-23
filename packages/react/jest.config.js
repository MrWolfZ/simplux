module.exports = {
  roots: ['<rootDir>/src', '<rootDir>'],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@simplux/core$': '<rootDir>/../core/index.ts',
    '^@simplux/testing$': '<rootDir>/../testing/index.ts',
    '^@simplux/react$': '<rootDir>/index.ts',
  },
  transform: {
    '\\.tsx?$': '../../jest.transform.cjs',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts?(x)', '<rootDir>/e2e.spec.tsx'],
  testPathIgnorePatterns: ['node_modules'],
}
