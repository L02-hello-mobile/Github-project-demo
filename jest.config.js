module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@sentry/.*|lucide-react-native)",
  ],
  collectCoverage: true,
  collectCoverageFrom: ["screens/**/*.{ts,tsx}", "context/**/*.{ts,tsx}"],
  coverageReporters: ["lcov", "text", "clover", "html"],
};