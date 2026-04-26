/* eslint-disable */

// ĐÂY LÀ DÒNG QUAN TRỌNG NHẤT - BẮT BUỘC DÙNG 'global'
global.__expo_module_name = 'test';

// Mock Icon để giữ nguyên 100% UI HomeScreen của bạn
jest.mock('@expo/vector-icons', () => {
  return {
    Ionicons: 'View',
  };
});