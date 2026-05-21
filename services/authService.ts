import { apiCall } from "./api";

export const authService = {
  // 1. Đăng nhập
  login: async (email: string, password: string) => {
    return await apiCall("/auth/login", "POST", { email, password });
  },
  
  // 2. Đăng ký
  register: async (fullName: string, email: string, password: string) => {
    return await apiCall("/auth/register", "POST", { fullName, email, password });
  },

  // 3. Quên mật khẩu (Chuẩn bị sẵn luồng cho BE)
  forgotPassword: async (email: string) => {
    // return await apiCall("/auth/forgot-password", "POST", { email });
    
    // Tạm thời giả lập thành công sau 1 giây
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  },

  // 4. Đặt lại mật khẩu (Chuẩn bị sẵn luồng cho BE)
  resetPassword: async (newPassword: string) => {
    // return await apiCall("/auth/reset-password", "POST", { newPassword });
    
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  }
};