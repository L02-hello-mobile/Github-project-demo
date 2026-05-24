import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SettingScreen from "../screens/common/SettingScreen";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("../services/notificationService", () => ({
  notificationService: {
    getSettings: jest.fn().mockResolvedValue({
      data: { allNotifications: true, taskReminder: true, taskAssigned: true },
    }),
    updateSettings: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock("../services/socketService", () => ({
  socketService: { disconnect: jest.fn() },
}));

const mockNavigation = { replace: jest.fn() };

const SAMPLE_USER = { fullName: "Nguyễn Văn Test", email: "test@example.com" };

describe("SettingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(SAMPLE_USER));
  });

  it("1. Render thành công", async () => {
    const { toJSON } = render(<SettingScreen navigation={mockNavigation} />);
    await waitFor(() => expect(toJSON()).toBeTruthy());
  });

  it("2. Hiển thị thông tin người dùng", async () => {
    const { getByTestId } = render(<SettingScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByTestId("setting-user-name")).toBeTruthy();
    });
  });

  it("3. Đăng xuất thành công", async () => {
    const { getByTestId } = render(<SettingScreen navigation={mockNavigation} />);
    await act(async () => {
      fireEvent.press(getByTestId("btn-logout"));
    });

    await waitFor(() => {
      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
      expect(mockNavigation.replace).toHaveBeenCalledWith("Start");
    });
  });
});