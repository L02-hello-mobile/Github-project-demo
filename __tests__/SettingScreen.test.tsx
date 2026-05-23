import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SettingScreen from "../screens/common/SettingScreen";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("../services/notificationService", () => ({
  notificationService: {
    getSettings: jest.fn().mockResolvedValue({
      data: { all: true, reminder: false, task: true },
    }),
    updateSettings: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock("../services/socketService", () => ({
  socketService: {
    disconnect: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../utils/pushNotifications", () => ({
  unregisterPushToken: jest.fn().mockResolvedValue(undefined),
  registerPushToken: jest.fn().mockResolvedValue(undefined),
  setupNotificationResponseListener: jest.fn(() => () => {}),
}));

const { notificationService } = require("../services/notificationService");
const { socketService } = require("../services/socketService");
const { unregisterPushToken } = require("../utils/pushNotifications");

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
};

const SAMPLE_USER = {
  _id: "u1",
  fullName: "Nguyễn Văn An",
  email: "an.nguyen@example.com",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SettingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    notificationService.getSettings.mockResolvedValue({
      data: { all: true, reminder: false, task: true },
    });
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("1. Màn hình render không bị crash", async () => {
    const { toJSON } = render(<SettingScreen navigation={mockNavigation} />);
    await waitFor(() => expect(toJSON()).toBeTruthy());
  });

  it("2. Hiển thị tiêu đề CÀI ĐẶT", async () => {
    const { getByText } = render(<SettingScreen navigation={mockNavigation} />);
    await waitFor(() => expect(getByText("CÀI ĐẶT")).toBeTruthy());
  });

  it("3. Hiển thị các mục cài đặt chính", async () => {
    const { getByText } = render(<SettingScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(getByText("Đổi mật khẩu")).toBeTruthy();
      expect(getByText("Đăng xuất")).toBeTruthy();
      expect(getByText("Tất cả thông báo")).toBeTruthy();
      expect(getByText("Nhắc việc (5 phút trước)")).toBeTruthy();
      expect(getByText("Task được giao")).toBeTruthy();
    });
  });

  // ── User data ──────────────────────────────────────────────────────────────

  it("4. Hiển thị tên người dùng từ AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(SAMPLE_USER),
    );
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByTestId("setting-user-name").props.children).toBe(
        "Nguyễn Văn An",
      );
    });
  });

  it("5. Hiển thị email người dùng từ AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(SAMPLE_USER),
    );
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByTestId("setting-user-email").props.children).toBe(
        "an.nguyen@example.com",
      );
    });
  });

  it("6. Hiển thị trạng thái loading khi chưa có userData", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByTestId("setting-user-name").props.children).toBe(
        "Đang tải...",
      );
    });
  });

  // ── Notification settings ──────────────────────────────────────────────────

  it("7. Gọi getSettings khi component mount", async () => {
    render(<SettingScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(notificationService.getSettings).toHaveBeenCalledTimes(1);
    });
  });

  it("8. Không crash khi getSettings thất bại", async () => {
    notificationService.getSettings.mockRejectedValueOnce(
      new Error("Network error"),
    );
    const { getByText } = render(<SettingScreen navigation={mockNavigation} />);
    await waitFor(() => expect(getByText("CÀI ĐẶT")).toBeTruthy());
  });

  // ── Toggle interactions ────────────────────────────────────────────────────

  it("9. Toggle 'Tất cả thông báo' gọi updateSettings({ all: false })", async () => {
    render(<SettingScreen navigation={mockNavigation} />);
    await waitFor(() =>
      expect(notificationService.getSettings).toHaveBeenCalled(),
    );

    const toggle = await waitFor(
      () =>
        require("@testing-library/react-native").screen?.getByTestId?.(
          "toggle-notif-all",
        ) ?? null,
    );

    // Use getByTestId directly
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await waitFor(() =>
      expect(notificationService.getSettings).toHaveBeenCalled(),
    );
    await act(async () => {
      fireEvent.press(getByTestId("toggle-notif-all"));
    });
    await waitFor(() => {
      expect(notificationService.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ all: expect.any(Boolean) }),
      );
    });
  });

  it("10. Toggle 'Nhắc việc' gọi updateSettings({ reminder: ... })", async () => {
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await waitFor(() =>
      expect(notificationService.getSettings).toHaveBeenCalled(),
    );
    await act(async () => {
      fireEvent.press(getByTestId("toggle-notif-reminder"));
    });
    await waitFor(() => {
      expect(notificationService.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ reminder: expect.any(Boolean) }),
      );
    });
  });

  it("11. Toggle 'Task được giao' gọi updateSettings({ task: ... })", async () => {
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await waitFor(() =>
      expect(notificationService.getSettings).toHaveBeenCalled(),
    );
    await act(async () => {
      fireEvent.press(getByTestId("toggle-notif-task"));
    });
    await waitFor(() => {
      expect(notificationService.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ task: expect.any(Boolean) }),
      );
    });
  });

  it("12. Toggle không crash khi updateSettings thất bại", async () => {
    notificationService.updateSettings.mockRejectedValueOnce(
      new Error("Server error"),
    );
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await waitFor(() =>
      expect(notificationService.getSettings).toHaveBeenCalled(),
    );
    await act(async () => {
      expect(() =>
        fireEvent.press(getByTestId("toggle-notif-all")),
      ).not.toThrow();
    });
  });

  // ── Logout ─────────────────────────────────────────────────────────────────

  it("13. Đăng xuất xoá AsyncStorage", async () => {
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await act(async () => {
      fireEvent.press(getByTestId("btn-logout"));
    });
    await waitFor(() => {
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        "userToken",
        "userData",
      ]);
    });
  });

  it("14. Đăng xuất gọi socketService.disconnect()", async () => {
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await act(async () => {
      fireEvent.press(getByTestId("btn-logout"));
    });
    await waitFor(() => {
      expect(socketService.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  it("15. Đăng xuất navigate về Start", async () => {
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await act(async () => {
      fireEvent.press(getByTestId("btn-logout"));
    });
    await waitFor(() => {
      expect(mockNavigation.replace).toHaveBeenCalledWith("Start");
    });
  });

  it("16. Đăng xuất gọi unregisterPushToken()", async () => {
    const { getByTestId } = render(
      <SettingScreen navigation={mockNavigation} />,
    );
    await act(async () => {
      fireEvent.press(getByTestId("btn-logout"));
    });
    await waitFor(() => {
      expect(unregisterPushToken).toHaveBeenCalledTimes(1);
    });
  });
});
