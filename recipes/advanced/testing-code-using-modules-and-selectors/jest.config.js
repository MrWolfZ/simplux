module.exports = {
  roots: ['<rootDir>/src', '<rootDir>'],
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: {
    '^(.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts': 'ts-jest',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testPathIgnorePatterns: ['node_modules'],
  testEnvironment: 'jsdom',
}
