module.exports = {
  preset: 'jest-expo',

  // 👇 BẮT BUỘC với Expo 50+
  testEnvironment: 'jsdom',

  setupFiles: ['<rootDir>/jest.setup.js'],

  collectCoverage: true,
  collectCoverageFrom: ['screens/**/*.{ts,tsx}'],

  // 👇 FIX toàn bộ lỗi Expo + ESM
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?|expo-modules-core|expo-.*|@react-navigation)/)',
  ],
};