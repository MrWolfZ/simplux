module.exports = {
  roots: ['<rootDir>/src', '<rootDir>'],
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: {
    '^@simplux/core$': '<rootDir>/../core/index.ts',
    '^@simplux/testing$': '<rootDir>/index.ts',
  },
  transform: {
    '\\.tsx?$': '../../jest.transform.cjs',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts?(x)', '<rootDir>/e2e.spec.ts'],
  testPathIgnorePatterns: ['node_modules'],
}
