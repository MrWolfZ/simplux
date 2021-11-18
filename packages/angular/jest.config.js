module.exports = {
  roots: ['<rootDir>/src', '<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^@simplux/core$': '<rootDir>/../core/index.ts',
    '^@simplux/angular$': '<rootDir>/index.ts',
    '^(.*)\\.js$': '$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules',
    '<rootDir>/test-d',
    '<rootDir>/dist',
  ],
  transform: {
    '\\.tsx?$': 'ts-jest',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts?(x)', '<rootDir>/e2e.spec.ts?(x)'],
  reporters: [
    '@jest/reporters/build/SummaryReporter.js',
    ['jest-silent-reporter', { useDots: true, showWarnings: true }],
  ],
  testEnvironment: 'jsdom',
}
