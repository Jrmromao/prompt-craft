const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/e2e/prompt-creation.test.ts',
    '<rootDir>/__tests__/e2e/prompt-workflow.test.ts',
    '<rootDir>/__tests__/e2e/competitive-features.test.ts',
    '<rootDir>/__tests__/e2e/playground.integration.test.ts',
    '<rootDir>/__tests__/e2e/feedback-widget.spec.ts',
    '<rootDir>/__tests__/integration/feedback-flow.test.ts',
    '<rootDir>/__tests__/unit/feedback.service.test.ts',
    '<rootDir>/__tests__/api/feedback.test.ts',
    '<rootDir>/__tests__/components/FeedbackWidget.test.tsx',
    '<rootDir>/e2e/',
    '<rootDir>/__tests__/.backup/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(uncrypto|@upstash|react-markdown|@clerk)/)',
  ],
  collectCoverageFrom: [
    'lib/services/**/*.ts',
    'app/api/**/*.ts',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
