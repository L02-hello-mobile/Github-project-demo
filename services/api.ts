import AsyncStorage from "@react-native-async-storage/async-storage";

// Lấy URL từ file .env, fallback về localhost nếu không tìm thấy
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api";

const TIMEOUT_MS = 10000; // 10 giây
const UPLOAD_TIMEOUT_MS = 30000; // 30 giây cho upload file

export const apiCall = async (
  endpoint: string,
  method: string = "GET",
  body: any = null,
) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // Tự động lấy token từ máy lên
    const token = await AsyncStorage.getItem("userToken");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const config: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // Body rỗng hoặc không phải JSON (HTML error page khi server crash)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return null;
    }
    if (!response.ok) {
      throw new Error(data?.message || `HTTP ${response.status}`);
    }
    return data;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.error(`API Timeout at ${endpoint}`);
      throw new Error("Request timeout — kiểm tra kết nối server");
    }
    console.error(`API Error at ${endpoint}:`, error);
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

export const apiUpload = async (endpoint: string, formData: FormData) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  try {
    const token = await AsyncStorage.getItem("userToken");
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // KHÔNG set Content-Type — fetch tự thêm multipart boundary
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
      signal: controller.signal,
    });
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return null;
    }
    if (!response.ok) {
      throw new Error(data?.message || `HTTP ${response.status}`);
    }
    return data;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.error(`Upload Timeout at ${endpoint}`);
      throw new Error("Request timeout — kiểm tra kết nối server");
    }
    console.error(`Upload Error at ${endpoint}:`, error);
    throw error;
  } finally {
    clearTimeout(timer);
  }
};
