module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/integration/**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(testcontainers|yaml|docker-compose)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  testTimeout: 60000, // 60 seconds for container startup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'lib/services/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ]
};
