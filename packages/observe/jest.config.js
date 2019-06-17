module.exports = {
  roots: ['<rootDir>/src', '<rootDir>'],
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: {
    '^@simplux/core$': '<rootDir>/../core/index.ts',
    '^@simplux/observe$': '<rootDir>/index.ts',
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/e2e.spec.ts'],
  testPathIgnorePatterns: ['node_modules'],
}