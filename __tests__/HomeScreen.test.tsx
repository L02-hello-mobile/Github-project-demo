import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import HomeScreen from "../screens/common/HomeScreen";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("../services/eventService", () => ({
  eventService: {
    getMyEvents: jest.fn().mockResolvedValue({ success: true, data: [] }),
    getEventProgress: jest.fn().mockResolvedValue({ data: { percentage: 0 } }),
    respondInvite: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock("../services/notificationService", () => ({
  notificationService: {
    getUnreadCount: jest.fn().mockResolvedValue({ data: { count: 0 } }),
  },
}));

jest.mock("@expo/vector-icons", () => ({ Ionicons: "View" }));

const AsyncStorage = require("@react-native-async-storage/async-storage");
const { eventService } = require("../services/eventService");

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    eventService.getMyEvents.mockResolvedValue({ success: true, data: [] });
  });

  it("1. Màn hình render thành công không bị crash", async () => {
    const { toJSON } = render(<HomeScreen />);
    await waitFor(() => expect(toJSON()).toBeTruthy());
  });

  it("2. Hiển thị tên người dùng fallback khi chưa đăng nhập", async () => {
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText("Người dùng")).toBeTruthy();
    });
  });

  it("3. Hiển thị tên người dùng từ AsyncStorage", async () => {
    AsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({ _id: "u1", fullName: "Nguyễn Văn Test" }),
    );
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText("Nguyễn Văn Test")).toBeTruthy();
    });
  });

  it("4. Hiển thị 'Chưa có sự kiện nào' khi API trả về mảng rỗng", async () => {
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText("Chưa có sự kiện nào")).toBeTruthy();
    });
  });

  it("5. Hiển thị danh sách sự kiện từ API", async () => {
    AsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({ _id: "u1", fullName: "Test User" }),
    );
    eventService.getMyEvents.mockResolvedValueOnce({
      success: true,
      data: [
        {
          _id: "e1",
          name: "Job Fair 2026",
          members: [
            { user: { _id: "u1" }, status: "ACCEPTED", role: "ORGANIZER" },
          ],
        },
      ],
    });
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText("Job Fair 2026")).toBeTruthy();
    });
  });

  it("6. Xử lý nút bấm Xem nhiệm vụ", async () => {
    const mockNav = { navigate: jest.fn() };
    const { getByTestId } = render(<HomeScreen navigation={mockNav} />);
    await waitFor(() => expect(getByTestId("btn-action")).toBeTruthy());
    fireEvent.press(getByTestId("btn-action"));
    expect(mockNav.navigate).toHaveBeenCalledWith("Calendar");
  });

  it("7. Navigate sang EventDetail với eventId khi bấm sự kiện", async () => {
    AsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({ _id: "u1", fullName: "Test" }),
    );
    eventService.getMyEvents.mockResolvedValueOnce({
      success: true,
      data: [
        {
          _id: "event123",
          name: "Tech Summit",
          members: [{ user: { _id: "u1" }, status: "ACCEPTED", role: "STAFF" }],
        },
      ],
    });
    const mockNav = { navigate: jest.fn() };
    const { getByText } = render(<HomeScreen navigation={mockNav} />);
    await waitFor(() => expect(getByText("Tech Summit")).toBeTruthy());
    fireEvent.press(getByText("Tech Summit"));
    expect(mockNav.navigate).toHaveBeenCalledWith("EventDetail", {
      eventId: "event123",
    });
  });
});
