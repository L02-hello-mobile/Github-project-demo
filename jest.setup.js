/* eslint-disable no-undef */

// 1. Fix lỗi scope của Expo và sửa luôn lỗi SonarLint (S7764: Dùng globalThis)
globalThis.__expo_module_name = 'test';

// 2. Mock các thư viện Expo để không bị lỗi Font/Asset
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(),
  },
}));

// 3. Mock Icons để UI không bị crash khi chạy test
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'View',
  AntDesign: 'View',
  MaterialIcons: 'View',
  FontAwesome: 'View',
}));