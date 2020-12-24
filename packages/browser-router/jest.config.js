module.exports = {
  roots: ['<rootDir>/src', '<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^@simplux/core$': '<rootDir>/../core/index.ts',
    '^@simplux/router$': '<rootDir>/../router/index.ts',
    '^@simplux/browser-router$': '<rootDir>/index.ts',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules',
    '<rootDir>/test-d',
    '<rootDir>/dist',
  ],
  transform: {
    '\\.tsx?$': '../../jest.transform.cjs',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts?(x)', '<rootDir>/e2e.spec.ts'],
}