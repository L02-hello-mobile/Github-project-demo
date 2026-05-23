/**
 * Tests for SocketNotificationContext
 * Verifies the global toast and unread badge behaviour.
 */

import React from "react";
import { AppState, Text, View } from "react-native";
import { render, waitFor, act, fireEvent } from "@testing-library/react-native";
import {
  SocketNotificationProvider,
  useSocketNotification,
} from "../context/SocketNotificationContext";

// ─── Mock socketService ────────────────────────────────────────────────────

let capturedNotifCb: ((data: any) => void) | null = null;

jest.mock("../services/socketService", () => ({
  socketService: {
    addNotificationListener: jest.fn((cb: (data: any) => void) => {
      capturedNotifCb = cb;
    }),
    removeNotificationListener: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
  },
}));

jest.mock("../services/notificationService", () => ({
  notificationService: {
    getUnreadCount: jest.fn().mockResolvedValue({ data: { count: 0 } }),
  },
}));

const { socketService } = require("../services/socketService");
const { notificationService } = require("../services/notificationService");

// ─── Helper consumer component ─────────────────────────────────────────────

function TestConsumer() {
  const { toastMessage, unreadCount, markAsRead } = useSocketNotification();
  return (
    <View>
      <Text testID="toast-msg">{toastMessage ?? "null"}</Text>
      <Text testID="unread-count">{unreadCount}</Text>
      <Text testID="reset-btn" onPress={markAsRead}>
        reset
      </Text>
    </View>
  );
}

function renderWithProvider() {
  return render(
    <SocketNotificationProvider>
      <TestConsumer />
    </SocketNotificationProvider>,
  );
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("SocketNotificationContext", () => {
  let addEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedNotifCb = null;
    jest.useFakeTimers();
    addEventListenerSpy = jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation(() => ({ remove: jest.fn() }) as any);
  });

  afterEach(() => {
    jest.useRealTimers();
    addEventListenerSpy.mockRestore();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("1. Provider render children bình thường", () => {
    const { getByText } = render(
      <SocketNotificationProvider>
        <Text>Hello</Text>
      </SocketNotificationProvider>,
    );
    expect(getByText("Hello")).toBeTruthy();
  });

  it("2. Đăng ký notification:new listener khi mount", () => {
    renderWithProvider();
    expect(socketService.addNotificationListener).toHaveBeenCalledTimes(1);
  });

  it("3. Gỡ bỏ listener khi unmount", () => {
    const { unmount } = renderWithProvider();
    unmount();
    expect(socketService.removeNotificationListener).toHaveBeenCalledTimes(1);
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it("4. Trạng thái ban đầu: toast null, unreadCount = 0", () => {
    const { getByTestId } = renderWithProvider();
    expect(getByTestId("toast-msg").props.children).toBe("null");
    expect(getByTestId("unread-count").props.children).toBe(0);
  });

  it("5. Không hiển thị toast khi chưa nhận notification", () => {
    const { queryByTestId } = renderWithProvider();
    expect(queryByTestId("notification-toast")).toBeNull();
  });

  // ── Toast appearance ───────────────────────────────────────────────────────

  it("6. Toast xuất hiện khi nhận notification:new", async () => {
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      capturedNotifCb?.({ message: "Bạn được giao task mới" });
    });

    await waitFor(() => {
      expect(getByTestId("notification-toast")).toBeTruthy();
    });
  });

  it("7. Toast hiển thị đúng nội dung message", async () => {
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      capturedNotifCb?.({ message: "Task WRK-001 đã hoàn thành" });
    });

    await waitFor(() => {
      expect(getByTestId("toast-msg").props.children).toBe(
        "Task WRK-001 đã hoàn thành",
      );
    });
  });

  it("8. Dùng title khi message không có", async () => {
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      capturedNotifCb?.({ title: "Tiêu đề thông báo" });
    });

    await waitFor(() => {
      expect(getByTestId("toast-msg").props.children).toBe("Tiêu đề thông báo");
    });
  });

  it("9. Dùng fallback khi cả message và title đều không có", async () => {
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      capturedNotifCb?.({});
    });

    await waitFor(() => {
      expect(getByTestId("toast-msg").props.children).toBe(
        "Bạn có thông báo mới",
      );
    });
  });

  // ── Context values update ─────────────────────────────────────────────────

  it("10. toastMessage cập nhật khi nhận notification", async () => {
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      capturedNotifCb?.({ message: "Cập nhật sự kiện" });
    });

    await waitFor(() => {
      expect(getByTestId("toast-msg").props.children).toBe("Cập nhật sự kiện");
    });
  });

  it("11. unreadCount tăng lên 1 mỗi khi nhận notification", async () => {
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      capturedNotifCb?.({ message: "Thông báo 1" });
    });
    await waitFor(() =>
      expect(getByTestId("unread-count").props.children).toBe(1),
    );

    await act(async () => {
      capturedNotifCb?.({ message: "Thông báo 2" });
    });
    await waitFor(() =>
      expect(getByTestId("unread-count").props.children).toBe(2),
    );
  });

  // ── Auto dismiss ───────────────────────────────────────────────────────────

  it("12. Toast tự ẩn sau 3 giây", async () => {
    const { queryByTestId } = renderWithProvider();

    await act(async () => {
      capturedNotifCb?.({ message: "Sẽ biến mất sau 3s" });
    });

    await waitFor(() =>
      expect(queryByTestId("notification-toast")).toBeTruthy(),
    );

    // Advance past the 3-second timeout + fade-out duration
    await act(async () => {
      jest.advanceTimersByTime(3500);
    });

    await waitFor(() => expect(queryByTestId("notification-toast")).toBeNull());
  });

  // ── markAsRead ───────────────────────────────────────────────────────────

  it("13. markAsRead() đặt unreadCount về 0", async () => {
    const { getByTestId } = render(
      <SocketNotificationProvider>
        <TestConsumer />
      </SocketNotificationProvider>,
    );

    // Fire 2 notifications
    await act(async () => {
      capturedNotifCb?.({ message: "A" });
    });
    await act(async () => {
      capturedNotifCb?.({ message: "B" });
    });
    await waitFor(() =>
      expect(getByTestId("unread-count").props.children).toBe(2),
    );

    // Press reset
    await act(async () => {
      fireEvent.press(getByTestId("reset-btn"));
    });

    await waitFor(() =>
      expect(getByTestId("unread-count").props.children).toBe(0),
    );
  });

  it("14. Giữ unreadCount local khi API sync trả về count thấp hơn", async () => {
    let resolveUnreadCount: ((value: any) => void) | null = null;
    notificationService.getUnreadCount.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveUnreadCount = resolve;
        }),
    );

    const { getByTestId } = renderWithProvider();

    await act(async () => {
      capturedNotifCb?.({ message: "Thông báo đến khi đang ở Home" });
    });

    await waitFor(() =>
      expect(getByTestId("unread-count").props.children).toBe(1),
    );

    await act(async () => {
      resolveUnreadCount?.({ data: { count: 0 } });
    });

    await waitFor(() =>
      expect(getByTestId("unread-count").props.children).toBe(1),
    );
  });

  // ── Multiple rapid notifications ──────────────────────────────────────────

  it("15. Nhiều notification liên tiếp chỉ hiện toast cuối cùng", async () => {
    const { getByTestId } = renderWithProvider();

    await act(async () => {
      capturedNotifCb?.({ message: "Notification A" });
      capturedNotifCb?.({ message: "Notification B" });
      capturedNotifCb?.({ message: "Notification C - cuối" });
    });

    await waitFor(() => {
      expect(getByTestId("toast-msg").props.children).toBe(
        "Notification C - cuối",
      );
    });
  });

  it("16. Refresh unread count khi app quay lại active", async () => {
    notificationService.getUnreadCount
      .mockResolvedValueOnce({ data: { count: 0 } })
      .mockResolvedValueOnce({ data: { count: 3 } });

    const { getByTestId } = renderWithProvider();
    const appStateHandler = addEventListenerSpy.mock.calls[0][1];

    await act(async () => {
      appStateHandler("active");
    });

    await waitFor(() => {
      expect(getByTestId("unread-count").props.children).toBe(3);
    });
  });
});
