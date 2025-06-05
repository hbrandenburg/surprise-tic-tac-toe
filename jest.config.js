module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
  collectCoverageFrom: [
    'index.html',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  verbose: true
};