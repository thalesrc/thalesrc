/* eslint-disable */
export default {
  displayName: 'hermes',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/hermes',
  setupFilesAfterEnv: ['<rootDir>/setup-test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/*/index.ts',
    '!src/broadcast/*', // Remove these lines later
    '!src/chrome/*',
    '!src/iframe/*',
    '!src/worker/*',
  ],
};
