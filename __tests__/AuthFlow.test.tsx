import React from "react";
import { TextInput } from "react-native";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../screens/common/LoginScreen";
import SignUpScreen from "../screens/common/SignUpScreen";
import ForgotPasswordScreen from "../screens/common/ForgotPasswordScreen";

// Mock authService
jest.mock("../services/authService", () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    forgotPassword: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import { authService } from "../services/authService";

const mockNavigation = {
  replace: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
});

// ─── LOGIN SCREEN ────────────────────────────────────────────────────────────

describe("LoginScreen", () => {
  it("1. Render thành công", () => {
    const { toJSON } = render(<LoginScreen navigation={mockNavigation} />);
    expect(toJSON()).toBeTruthy();
  });

  it("2. Hiển thị tiêu đề Chào mừng trở lại", () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    expect(getByText("Chào mừng trở lại")).toBeTruthy();
  });

  it("3. Hiển thị lỗi khi bỏ trống email hoặc mật khẩu", async () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    const loginBtn = getByText("Đăng nhập");
    await act(async () => {
      fireEvent.press(loginBtn);
    });
    expect(getByText("Vui lòng nhập email và mật khẩu")).toBeTruthy();
  });

  it("4. Đăng nhập thành công → lưu token và navigate Main", async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { token: "fake-token-123", _id: "user1", fullName: "Test User" },
    });

    const { UNSAFE_getAllByType, getByText } = render(
      <LoginScreen navigation={mockNavigation} />,
    );

    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "test@example.com"); // email
    fireEvent.changeText(inputs[1], "password123"); // password

    await act(async () => {
      fireEvent.press(getByText("Đăng nhập"));
    });

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "userToken",
        "fake-token-123",
      );
      expect(mockNavigation.replace).toHaveBeenCalledWith("Main");
    });
  });

  it("5. Đăng nhập thất bại → hiển thị lỗi từ API", async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({
      success: false,
      message: "Email hoặc mật khẩu không đúng",
    });

    const { UNSAFE_getAllByType, getByText } = render(
      <LoginScreen navigation={mockNavigation} />,
    );

    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "bad@example.com");
    fireEvent.changeText(inputs[1], "wrongpass");

    await act(async () => {
      fireEvent.press(getByText("Đăng nhập"));
    });

    await waitFor(() => {
      expect(getByText("Email hoặc mật khẩu không đúng")).toBeTruthy();
      expect(mockNavigation.replace).not.toHaveBeenCalled();
    });
  });

  it("6. Lỗi kết nối server → hiển thị thông báo lỗi", async () => {
    (authService.login as jest.Mock).mockRejectedValueOnce(
      new Error("Network Error"),
    );

    const { UNSAFE_getAllByType, getByText } = render(
      <LoginScreen navigation={mockNavigation} />,
    );

    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "test@example.com");
    fireEvent.changeText(inputs[1], "password123");

    await act(async () => {
      fireEvent.press(getByText("Đăng nhập"));
    });

    await waitFor(() => {
      expect(getByText("Lỗi kết nối server")).toBeTruthy();
    });
  });

  it("7. Navigate sang màn hình Quên mật khẩu", () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Quên mật khẩu?"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("ForgotPassword");
  });

  it("8. Navigate sang màn hình Đăng ký", () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    fireEvent.press(getByText("Đăng ký"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("SignUp");
  });
});

// ─── SIGNUP SCREEN ───────────────────────────────────────────────────────────

describe("SignUpScreen", () => {
  it("1. Render thành công", () => {
    const { toJSON } = render(<SignUpScreen navigation={mockNavigation} />);
    expect(toJSON()).toBeTruthy();
  });

  it("2. Hiển thị lỗi khi mật khẩu không khớp", async () => {
    const { UNSAFE_getAllByType, getByText } = render(
      <SignUpScreen navigation={mockNavigation} />,
    );

    // inputs: [0]=firstName, [1]=lastName, [2]=email, [3]=password, [4]=confirmPassword
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "Nguyen");
    fireEvent.changeText(inputs[1], "Van A");
    fireEvent.changeText(inputs[2], "a@b.com");
    fireEvent.changeText(inputs[3], "password123");
    fireEvent.changeText(inputs[4], "different456");

    await act(async () => {
      fireEvent.press(getByText("Đăng ký"));
    });

    await waitFor(() => {
      expect(getByText("Mật khẩu xác nhận không khớp")).toBeTruthy();
    });
  });

  it("3. Đăng ký thành công → lưu token và navigate Main", async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        token: "register-token-abc",
        _id: "user2",
        fullName: "Nguyen Van A",
      },
    });

    const { UNSAFE_getAllByType, getByText } = render(
      <SignUpScreen navigation={mockNavigation} />,
    );

    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "Nguyen");
    fireEvent.changeText(inputs[1], "Van A");
    fireEvent.changeText(inputs[2], "nguyen@example.com");
    fireEvent.changeText(inputs[3], "password123");
    fireEvent.changeText(inputs[4], "password123");

    await act(async () => {
      fireEvent.press(getByText("Đăng ký"));
    });

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith(
        "Nguyen Van A",
        "nguyen@example.com",
        "password123",
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "userToken",
        "register-token-abc",
      );
      expect(mockNavigation.replace).toHaveBeenCalledWith("Main");
    });
  });

  it("4. Đăng ký thất bại → hiển thị lỗi từ API", async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({
      success: false,
      message: "Email đã được sử dụng",
    });

    const { UNSAFE_getAllByType, getByText } = render(
      <SignUpScreen navigation={mockNavigation} />,
    );

    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "Nguyen");
    fireEvent.changeText(inputs[1], "Van B");
    fireEvent.changeText(inputs[2], "existing@example.com");
    fireEvent.changeText(inputs[3], "password123");
    fireEvent.changeText(inputs[4], "password123");

    await act(async () => {
      fireEvent.press(getByText("Đăng ký"));
    });

    await waitFor(() => {
      expect(getByText("Email đã được sử dụng")).toBeTruthy();
      expect(mockNavigation.replace).not.toHaveBeenCalled();
    });
  });

  it("5. Mật khẩu quá ngắn → hiển thị lỗi", async () => {
    const { UNSAFE_getAllByType, getByText } = render(
      <SignUpScreen navigation={mockNavigation} />,
    );

    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "A");
    fireEvent.changeText(inputs[1], "B");
    fireEvent.changeText(inputs[2], "a@b.com");
    fireEvent.changeText(inputs[3], "123");
    fireEvent.changeText(inputs[4], "123");

    await act(async () => {
      fireEvent.press(getByText("Đăng ký"));
    });

    await waitFor(() => {
      expect(getByText("Mật khẩu phải có ít nhất 6 ký tự")).toBeTruthy();
    });
  });
});

// ─── FORGOT PASSWORD SCREEN ──────────────────────────────────────────────────

describe("ForgotPasswordScreen", () => {
  it("1. Render thành công", () => {
    const { toJSON } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("2. Hiển thị tiêu đề Quên mật khẩu?", () => {
    const { getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );
    expect(getByText("Quên mật khẩu?")).toBeTruthy();
  });

  it("3. Nhấn Gửi khi email trống → không gọi service", async () => {
    const { getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} />,
    );

    await act(async () => {
      fireEvent.press(getByText("Gửi"));
    });

    expect(authService.forgotPassword).not.toHaveBeenCalled();
  });
});
