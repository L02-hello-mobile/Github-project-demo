import AsyncStorage from "@react-native-async-storage/async-storage";

// Lấy URL từ file .env, fallback về localhost nếu không tìm thấy
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api";

export const apiCall = async (endpoint: string, method: string = "GET", body: any = null) => {
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
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    throw error;
  }
};