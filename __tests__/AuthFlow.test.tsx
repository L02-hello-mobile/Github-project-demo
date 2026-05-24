import React from "react";
import { TextInput } from "react-native";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../screens/common/LoginScreen";
import SignUpScreen from "../screens/common/SignUpScreen";
import ForgotPasswordScreen from "../screens/common/ForgotPasswordScreen";

jest.mock("../services/authService", () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    forgotPassword: jest.fn(),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("@sentry/react-native", () => ({
  Native: { captureException: jest.fn() },
}));

import { authService } from "../services/authService";

const mockNavigation = {
  replace: jest.fn(),
  navigate: jest.fn(),
  goBack: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LoginScreen", () => {
  it("1. Render thành công", () => {
    const { toJSON } = render(<LoginScreen navigation={mockNavigation} />);
    expect(toJSON()).toBeTruthy();
  });

  it("2. Hiển thị tiêu đề Chào mừng trở lại", () => {
    const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
    expect(getByText("Chào mừng trở lại")).toBeTruthy();
  });

  it("3. Đăng nhập thành công", async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { token: "fake-token-123" },
    });

    const { UNSAFE_getAllByType, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "test@example.com");
    fireEvent.changeText(inputs[1], "123456");

    await act(async () => {
      fireEvent.press(getByText("Đăng nhập"));
    });

    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith("Main");
    });
  });
});

describe("SignUpScreen", () => {
  it("1. Render thành công", () => {
    const { toJSON } = render(<SignUpScreen navigation={mockNavigation} />);
    expect(toJSON()).toBeTruthy();
  });
});

describe("ForgotPasswordScreen", () => {
  it("1. Render thành công", () => {
    const { toJSON } = render(<ForgotPasswordScreen navigation={mockNavigation} />);
    expect(toJSON()).toBeTruthy();
  });
});