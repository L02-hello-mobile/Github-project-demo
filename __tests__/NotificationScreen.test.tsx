import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import NotificationScreen from "../screens/common/NotificationScreen";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("../services/notificationService", () => ({
  notificationService: {
    getNotifications: jest.fn(),
    markAllRead: jest.fn().mockResolvedValue({ success: true }),
    deleteNotification: jest.fn().mockResolvedValue({ success: true }),
    getUnreadCount: jest.fn().mockResolvedValue({ data: { count: 0 } }),
  },
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const { notificationService } = require("../services/notificationService");

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

const SAMPLE_NOTIFICATIONS = [
  {
    _id: "n1",
    message: "Task WRK-001 đã được cập nhật trạng thái.",
    createdAt: "2025-01-08T14:08:00.000Z",
    isRead: false,
  },
  {
    _id: "n2",
    message: "Bạn được giao nhiệm vụ mới.",
    createdAt: "2025-01-08T14:05:00.000Z",
    isRead: true,
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("NotificationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notificationService.getNotifications.mockResolvedValue({
      success: true,
      data: SAMPLE_NOTIFICATIONS,
    });
    notificationService.markAllRead.mockResolvedValue({ success: true });
    notificationService.deleteNotification.mockResolvedValue({ success: true });
  });

  // ── 1. Render ──────────────────────────────────────────────────────────────

  it("1. Màn hình render thành công không bị crash", async () => {
    const { toJSON } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => expect(toJSON()).toBeTruthy());
  });

  it("2. Hiển thị tiêu đề Thông báo", async () => {
    const { getByText } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByText("Thông báo")).toBeTruthy();
    });
  });

  // ── 2. Fetch & Render List ─────────────────────────────────────────────────

  it("3. Gọi getNotifications khi component mount", async () => {
    render(<NotificationScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalledTimes(1);
    });
  });

  it("4. Hiển thị danh sách thông báo từ API", async () => {
    const { getByText } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(
        getByText("Task WRK-001 đã được cập nhật trạng thái."),
      ).toBeTruthy();
      expect(getByText("Bạn được giao nhiệm vụ mới.")).toBeTruthy();
    });
  });

  it("5. Hiển thị empty state khi không có thông báo", async () => {
    notificationService.getNotifications.mockResolvedValueOnce({
      success: true,
      data: [],
    });
    const { getByTestId } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByTestId("empty-state")).toBeTruthy();
    });
  });

  it("6. Hiển thị empty state khi API trả về mảng rỗng", async () => {
    notificationService.getNotifications.mockResolvedValueOnce({ data: [] });
    const { getByText } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByText("Không có thông báo nào")).toBeTruthy();
    });
  });

  // ── 3. Mark All Read ───────────────────────────────────────────────────────

  it("7. Gọi markAllRead sau khi fetch thành công", async () => {
    render(<NotificationScreen navigation={mockNavigation} />);
    await waitFor(() => {
      expect(notificationService.markAllRead).toHaveBeenCalledTimes(1);
    });
  });

  it("8. Không crash khi markAllRead thất bại", async () => {
    notificationService.markAllRead.mockRejectedValueOnce(
      new Error("Network error"),
    );
    const { getByText } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByText("Thông báo")).toBeTruthy();
    });
  });

  // ── 4. Delete ──────────────────────────────────────────────────────────────

  it("9. Long press mở Alert xác nhận xoá", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getByTestId } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("notif-item-n1"));
    fireEvent(getByTestId("notif-item-n1"), "onLongPress");
    expect(alertSpy).toHaveBeenCalledWith(
      "Xoá thông báo",
      "Bạn có muốn xoá thông báo này?",
      expect.any(Array),
    );
  });

  it("10. Xoá thông báo gọi deleteNotification và loại khỏi danh sách", async () => {
    let alertCallback: (() => void) | undefined;
    jest.spyOn(Alert, "alert").mockImplementation((_title, _msg, buttons) => {
      const destructive = (buttons as any[])?.find(
        (b) => b.style === "destructive",
      );
      alertCallback = destructive?.onPress;
    });

    const { getByTestId, queryByTestId } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("notif-item-n1"));

    fireEvent(getByTestId("notif-item-n1"), "onLongPress");
    expect(alertCallback).toBeDefined();

    await act(async () => {
      alertCallback!();
    });

    await waitFor(() => {
      expect(notificationService.deleteNotification).toHaveBeenCalledWith("n1");
      expect(queryByTestId("notif-item-n1")).toBeNull();
    });
  });

  // ── 5. Navigation / Back ───────────────────────────────────────────────────

  it("11. Nút back gọi navigation.goBack()", async () => {
    const { getByTestId } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() =>
      expect(notificationService.getNotifications).toHaveBeenCalled(),
    );
    fireEvent.press(getByTestId("btn-back"));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  // ── 6. Deep Link Navigation ────────────────────────────────────────────────

  it("12. Tap thông báo có deepLink /events/:id/map navigate MapViewStaff", async () => {
    notificationService.getNotifications.mockResolvedValueOnce({
      data: [
        {
          _id: "n-map",
          message: "Xem bản đồ sự kiện",
          createdAt: new Date().toISOString(),
          isRead: false,
          deepLink: "/events/event123/map?focusTask=task456",
        },
      ],
    });
    const { getByTestId } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("notif-item-n-map"));
    fireEvent.press(getByTestId("notif-item-n-map"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("MapViewStaff", {
      eventId: "event123",
      taskId: "task456",
    });
  });

  it("13. Tap thông báo có deepLink /events/:id navigate EventDetail", async () => {
    notificationService.getNotifications.mockResolvedValueOnce({
      data: [
        {
          _id: "n-event",
          message: "Sự kiện mới",
          createdAt: new Date().toISOString(),
          isRead: false,
          deepLink: "/events/event789",
        },
      ],
    });
    const { getByTestId } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("notif-item-n-event"));
    fireEvent.press(getByTestId("notif-item-n-event"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("EventDetail", {
      eventId: "event789",
    });
  });

  it("14. Tap thông báo có deepLink /tasks/:id navigate TaskDetailStaff", async () => {
    notificationService.getNotifications.mockResolvedValueOnce({
      data: [
        {
          _id: "n-task",
          message: "Task mới được giao",
          createdAt: new Date().toISOString(),
          isRead: false,
          deepLink: "/tasks/task999",
        },
      ],
    });
    const { getByTestId } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("notif-item-n-task"));
    fireEvent.press(getByTestId("notif-item-n-task"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("TaskDetailStaff", {
      taskId: "task999",
    });
  });

  it("15. Tap thông báo không có deepLink không navigate", async () => {
    notificationService.getNotifications.mockResolvedValueOnce({
      data: [
        {
          _id: "n-noop",
          message: "Thông báo hệ thống",
          createdAt: new Date().toISOString(),
          isRead: true,
        },
      ],
    });
    const { getByTestId } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("notif-item-n-noop"));
    fireEvent.press(getByTestId("notif-item-n-noop"));
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });

  // ── 7. Unread visual style ─────────────────────────────────────────────────

  it("16. Thông báo chưa đọc hiển thị trong danh sách", async () => {
    const { getByTestId } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      expect(getByTestId("notif-item-n1")).toBeTruthy(); // n1 isRead: false
    });
  });

  // ── 8. Error handling ──────────────────────────────────────────────────────

  it("17. Không crash khi getNotifications ném lỗi", async () => {
    notificationService.getNotifications.mockRejectedValueOnce(
      new Error("Network error"),
    );
    const { getByText } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => {
      // Should show empty state after error
      expect(getByText("Không có thông báo nào")).toBeTruthy();
    });
  });

  it("18. Không crash khi deleteNotification ném lỗi", async () => {
    notificationService.deleteNotification.mockRejectedValueOnce(
      new Error("Server error"),
    );
    let alertCallback: (() => void) | undefined;
    jest.spyOn(Alert, "alert").mockImplementation((_title, _msg, buttons) => {
      const destructive = (buttons as any[])?.find(
        (b) => b.style === "destructive",
      );
      alertCallback = destructive?.onPress;
    });

    const { getByTestId } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() => getByTestId("notif-item-n1"));

    fireEvent(getByTestId("notif-item-n1"), "onLongPress");

    await act(async () => {
      alertCallback?.();
    });

    // Should still show the item (not removed because delete failed)
    await waitFor(() => {
      expect(getByTestId("notif-item-n1")).toBeTruthy();
    });
  });

  // ── 9. Pull to refresh ─────────────────────────────────────────────────────

  it("19. Pull-to-refresh gọi lại getNotifications", async () => {
    const { UNSAFE_getByType } = render(
      <NotificationScreen navigation={mockNavigation} />,
    );
    await waitFor(() =>
      expect(notificationService.getNotifications).toHaveBeenCalledTimes(1),
    );

    const { FlatList } = require("react-native");
    const list = UNSAFE_getByType(FlatList);
    await act(async () => {
      list.props.refreshControl.props.onRefresh();
    });

    await waitFor(() =>
      expect(notificationService.getNotifications).toHaveBeenCalledTimes(2),
    );
  });
});
