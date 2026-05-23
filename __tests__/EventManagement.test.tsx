import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import CreateEvent from "../screens/organizer/CreateEvent";
import EventDetailScreen from "../screens/organizer/EventDetailScreen";
import MemberList from "../screens/organizer/MemberList";

// ─── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("../services/eventService", () => ({
  eventService: {
    createEvent: jest.fn(),
    getEventDetail: jest.fn(),
    getEventProgress: jest.fn(),
    inviteMember: jest.fn(),
    removeMember: jest.fn(),
    uploadMap: jest.fn(),
  },
}));

jest.mock("../services/uploadService", () => ({
  uploadService: {
    uploadImage: jest.fn(),
  },
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

const { eventService } = require("../services/eventService");

// ─── CreateEvent ──────────────────────────────────────────────────────────────
describe("CreateEvent", () => {
  const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it("1. Render Step 1 không bị crash", () => {
    const { toJSON } = render(<CreateEvent navigation={mockNav} />);
    expect(toJSON()).toBeTruthy();
  });

  it("2. Hiển thị lỗi khi tên sự kiện trống", async () => {
    const { getByText } = render(<CreateEvent navigation={mockNav} />);
    await act(async () => {
      fireEvent.press(getByText("Tiếp tục"));
    });
    await waitFor(() => {
      expect(getByText("Vui lòng nhập tên sự kiện")).toBeTruthy();
    });
  });

  it("3. Gọi eventService.createEvent khi nhấn Tiếp tục ở Step 1", async () => {
    eventService.createEvent.mockResolvedValueOnce({
      data: { _id: "evt001" },
    });
    const { getByPlaceholderText, getByText } = render(
      <CreateEvent navigation={mockNav} />,
    );
    fireEvent.changeText(getByPlaceholderText("Tên sự kiện"), "Tech Summit");
    await act(async () => {
      fireEvent.press(getByText("Tiếp tục"));
    });
    expect(eventService.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Tech Summit" }),
    );
  });

  it("4. Hiển thị lỗi khi createEvent thất bại", async () => {
    eventService.createEvent.mockResolvedValueOnce({
      message: "Server error",
    });
    const { getByPlaceholderText, getByText } = render(
      <CreateEvent navigation={mockNav} />,
    );
    fireEvent.changeText(getByPlaceholderText("Tên sự kiện"), "Test Event");
    await act(async () => {
      fireEvent.press(getByText("Tiếp tục"));
    });
    await waitFor(() => {
      expect(getByText("Server error")).toBeTruthy();
    });
  });

  it("5. Nút QUAY LẠI gọi navigation.goBack ở step 1", () => {
    const { getByText } = render(<CreateEvent navigation={mockNav} />);
    fireEvent.press(getByText("QUAY LẠI"));
    expect(mockNav.goBack).toHaveBeenCalled();
  });
});

// ─── EventDetailScreen ────────────────────────────────────────────────────────
describe("EventDetailScreen", () => {
  const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it("1. Render không bị crash khi không có eventId", async () => {
    const { toJSON } = render(
      <EventDetailScreen navigation={mockNav} route={{ params: {} }} />,
    );
    await waitFor(() => expect(toJSON()).toBeTruthy());
  });

  it("2. Fetch và hiển thị tên sự kiện từ API", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: { _id: "e1", name: "Hội chợ việc làm 2026", groups: [] },
    });
    eventService.getEventProgress.mockResolvedValueOnce({
      data: { percentage: 65 },
    });
    const { getByText } = render(
      <EventDetailScreen
        navigation={mockNav}
        route={{ params: { eventId: "e1" } }}
      />,
    );
    await waitFor(() => {
      expect(getByText("Hội chợ việc làm 2026")).toBeTruthy();
    });
  });

  it("3. Hiển thị groups từ API", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: {
        _id: "e1",
        name: "Event",
        groups: [
          { _id: "g1", name: "Nhóm Kỹ thuật", taskCount: 5 },
          { _id: "g2", name: "Nhóm Hậu cần", taskCount: 3 },
        ],
      },
    });
    eventService.getEventProgress.mockResolvedValueOnce({
      data: { percentage: 40 },
    });
    const { getByText } = render(
      <EventDetailScreen
        navigation={mockNav}
        route={{ params: { eventId: "e1" } }}
      />,
    );
    await waitFor(() => {
      expect(getByText("Nhóm Kỹ thuật")).toBeTruthy();
      expect(getByText("Nhóm Hậu cần")).toBeTruthy();
    });
  });

  it("4. Navigate sang EventsTasks_Org với eventId và groupId khi bấm group card", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: {
        _id: "e1",
        name: "Event",
        groups: [{ _id: "g1", name: "Nhóm A" }],
      },
    });
    eventService.getEventProgress.mockResolvedValueOnce({
      data: { percentage: 0 },
    });
    const { getByText } = render(
      <EventDetailScreen
        navigation={mockNav}
        route={{ params: { eventId: "e1" } }}
      />,
    );
    await waitFor(() => expect(getByText("Nhóm A")).toBeTruthy());
    fireEvent.press(getByText("Nhóm A"));
    expect(mockNav.navigate).toHaveBeenCalledWith("EventsTasks_Org", {
      eventId: "e1",
      groupId: "g1",
    });
  });

  it("5. Hiển thị fallback 'Sự kiện' khi không có dữ liệu", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({ data: {} });
    eventService.getEventProgress.mockResolvedValueOnce({ data: {} });
    const { getByText } = render(
      <EventDetailScreen
        navigation={mockNav}
        route={{ params: { eventId: "e1" } }}
      />,
    );
    await waitFor(() => {
      expect(getByText("Sự kiện")).toBeTruthy();
    });
  });
});

// ─── MemberList ───────────────────────────────────────────────────────────────
describe("MemberList", () => {
  const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it("1. Render không bị crash khi không có eventId", async () => {
    const { toJSON } = render(
      <MemberList navigation={mockNav} route={{ params: {} }} />,
    );
    await waitFor(() => expect(toJSON()).toBeTruthy());
  });

  it("2. Fetch và hiển thị danh sách thành viên từ API", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: {
        members: [
          {
            user: { _id: "u1", fullName: "Nguyễn Văn A", email: "a@test.com" },
            role: "ORGANIZER",
            status: "ACCEPTED",
          },
          {
            user: { _id: "u2", fullName: "Trần Thị B", email: "b@test.com" },
            role: "STAFF",
            status: "PENDING",
          },
        ],
      },
    });
    const { getByText } = render(
      <MemberList navigation={mockNav} route={{ params: { eventId: "e1" } }} />,
    );
    await waitFor(() => {
      expect(getByText("Nguyễn Văn A")).toBeTruthy();
      expect(getByText("Trần Thị B")).toBeTruthy();
    });
  });

  it("3. Hiển thị trạng thái 'Đã xác nhận' và 'Chờ xác nhận' đúng", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: {
        members: [
          {
            user: { _id: "u1", fullName: "User A" },
            role: "STAFF",
            status: "ACCEPTED",
          },
          {
            user: { _id: "u2", fullName: "User B" },
            role: "STAFF",
            status: "PENDING",
          },
        ],
      },
    });
    const { getByText } = render(
      <MemberList navigation={mockNav} route={{ params: { eventId: "e1" } }} />,
    );
    await waitFor(() => {
      expect(getByText("Đã xác nhận")).toBeTruthy();
      expect(getByText("Chờ xác nhận")).toBeTruthy();
    });
  });

  it("4. Gọi eventService.inviteMember khi xác nhận lời mời", async () => {
    eventService.getEventDetail.mockResolvedValue({ data: { members: [] } });
    eventService.inviteMember.mockResolvedValue({ success: true });

    const { getByText, getByPlaceholderText } = render(
      <MemberList navigation={mockNav} route={{ params: { eventId: "e1" } }} />,
    );
    await waitFor(() => expect(getByText("Thêm thành viên")).toBeTruthy());

    // Open invite modal
    fireEvent.press(getByText("Thêm thành viên"));

    // Type email and submit using onSubmitEditing
    const emailInput = getByPlaceholderText("Nhập email để thêm");
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent(emailInput, "submitEditing");

    // Confirm
    await act(async () => {
      fireEvent.press(getByText("XÁC NHẬN"));
    });

    expect(eventService.inviteMember).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@example.com", eventId: "e1" }),
    );
  });

  it("5. Filter thành viên theo tab 'Đã xác nhận'", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: {
        members: [
          {
            user: { _id: "u1", fullName: "Accepted User" },
            role: "STAFF",
            status: "ACCEPTED",
          },
          {
            user: { _id: "u2", fullName: "Pending User" },
            role: "STAFF",
            status: "PENDING",
          },
        ],
      },
    });
    const { getAllByText, getByText, queryByText } = render(
      <MemberList navigation={mockNav} route={{ params: { eventId: "e1" } }} />,
    );
    await waitFor(() => expect(getByText("Accepted User")).toBeTruthy());

    // Press the filter tab (first occurrence of "Đã xác nhận" is the filter btn)
    fireEvent.press(getAllByText("Đã xác nhận")[0]);

    await waitFor(() => {
      expect(getByText("Accepted User")).toBeTruthy();
      expect(queryByText("Pending User")).toBeNull();
    });
  });
});
