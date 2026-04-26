module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',

  setupFiles: ['<rootDir>/jest.setup.js'],

  collectCoverage: true,
  collectCoverageFrom: ['screens/**/*.{ts,tsx}'],

  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?|expo-modules-core|expo-.*|@react-navigation)/)',
  ],

  // 🔥 THÊM ĐOẠN NÀY
  moduleNameMapper: {
    '^expo/src/winter/runtime.native$': '<rootDir>/__mocks__/emptyMock.js',
    '^expo/src/winter/installGlobal$': '<rootDir>/__mocks__/emptyMock.js',
  },
};