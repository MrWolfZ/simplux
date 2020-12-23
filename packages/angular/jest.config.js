module.exports = {
  roots: ['<rootDir>/src', '<rootDir>'],
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: {
    '^@simplux/core$': '<rootDir>/../core/index.ts',
    '^@simplux/angular$': '<rootDir>/index.ts',
  },
  transform: {
    '\\.tsx?$': '../../jest.transform.cjs',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/e2e.spec.ts'],
  testPathIgnorePatterns: ['node_modules'],
}
