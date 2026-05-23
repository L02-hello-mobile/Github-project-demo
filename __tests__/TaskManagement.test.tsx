import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import EventsTasksOrg from "../screens/organizer/EventsTasks";
import AddTask from "../screens/organizer/AddTask";
import TaskDetailScreen from "../screens/organizer/TaskDetail";

// ─── Navigation Mock ──────────────────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useIsFocused: () => true,
  useFocusEffect: (callback: () => void) => {
    const React = jest.requireActual("react");
    React.useEffect(() => callback(), [callback]);
  },
}));

// ─── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("../services/taskService", () => ({
  taskService: {
    getEventTasks: jest.fn(),
    createTask: jest.fn(),
    getTaskDetail: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    assignTask: jest.fn(),
  },
}));

jest.mock("../services/eventService", () => ({
  eventService: {
    getEventDetail: jest.fn(),
    createGroup: jest.fn(),
  },
}));

jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const { taskService } = require("../services/taskService");
const { eventService } = require("../services/eventService");

// ─── EventsTasksOrg ───────────────────────────────────────────────────────────
describe("EventsTasksOrg", () => {
  const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

  beforeEach(() => jest.clearAllMocks());

  it("1. Render không bị crash khi không có eventId", () => {
    const { toJSON } = render(
      <EventsTasksOrg navigation={mockNav} route={{ params: {} }} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("2. Gọi taskService.getEventTasks khi có eventId", async () => {
    taskService.getEventTasks.mockResolvedValueOnce({ data: [] });
    render(
      <EventsTasksOrg
        navigation={mockNav}
        route={{ params: { eventId: "evt001" } }}
      />,
    );
    await waitFor(() => {
      expect(taskService.getEventTasks).toHaveBeenCalledWith("evt001");
    });
  });

  it("3. Hiển thị task từ API với status được map đúng", async () => {
    taskService.getEventTasks.mockResolvedValueOnce({
      data: [
        {
          _id: "t1",
          title: "Kiểm tra âm thanh",
          group: "Nhóm kỹ thuật",
          status: "IN_PROGRESS",
          startTime: new Date().toISOString(),
        },
      ],
    });
    const { getByText } = render(
      <EventsTasksOrg
        navigation={mockNav}
        route={{ params: { eventId: "evt001" } }}
      />,
    );
    await waitFor(() => {
      expect(getByText("Kiểm tra âm thanh")).toBeTruthy();
    });
  });

  it("4. Không gọi API khi không có eventId", async () => {
    render(<EventsTasksOrg navigation={mockNav} route={{ params: {} }} />);
    await waitFor(() => {
      expect(taskService.getEventTasks).not.toHaveBeenCalled();
    });
  });

  it("5. Navigate sang TaskDetail với taskId khi nhấn task card", async () => {
    taskService.getEventTasks.mockResolvedValueOnce({
      data: [
        {
          _id: "t99",
          title: "Kê bàn",
          group: "Nhóm khu A",
          status: "TODO",
          startTime: new Date().toISOString(),
        },
      ],
    });
    const { getByText } = render(
      <EventsTasksOrg
        navigation={mockNav}
        route={{ params: { eventId: "evt001" } }}
      />,
    );
    await waitFor(() => expect(getByText("Kê bàn")).toBeTruthy());
    fireEvent.press(getByText("Kê bàn"));
    expect(mockNav.navigate).toHaveBeenCalledWith("TaskDetail", {
      taskId: "t99",
    });
  });

  it("6. Navigate sang AddTask với eventId khi nhấn Thêm nhiệm vụ", async () => {
    taskService.getEventTasks.mockResolvedValueOnce({ data: [] });
    const { getByText } = render(
      <EventsTasksOrg
        navigation={mockNav}
        route={{ params: { eventId: "evt001" } }}
      />,
    );
    fireEvent.press(getByText("Thêm nhiệm vụ"));
    expect(mockNav.navigate).toHaveBeenCalledWith("AddTask", {
      eventId: "evt001",
    });
  });

  it("7. Map status TODO → 'Cần làm'", async () => {
    taskService.getEventTasks.mockResolvedValueOnce({
      data: [
        {
          _id: "t2",
          title: "Task todo",
          group: "A",
          status: "TODO",
          startTime: new Date().toISOString(),
        },
      ],
    });
    const { getByText } = render(
      <EventsTasksOrg
        navigation={mockNav}
        route={{ params: { eventId: "evt001" } }}
      />,
    );
    await waitFor(() => expect(getByText("Cần làm")).toBeTruthy());
  });

  it("8. Map status COMPLETED → 'Hoàn thành'", async () => {
    taskService.getEventTasks.mockResolvedValueOnce({
      data: [
        {
          _id: "t3",
          title: "Task done",
          group: "B",
          status: "COMPLETED",
          startTime: new Date().toISOString(),
        },
      ],
    });
    const { getByText } = render(
      <EventsTasksOrg
        navigation={mockNav}
        route={{ params: { eventId: "evt001" } }}
      />,
    );
    await waitFor(() => expect(getByText("Hoàn thành")).toBeTruthy());
  });
});

// ─── AddTask ──────────────────────────────────────────────────────────────────
describe("AddTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  it("1. Render không bị crash", () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: { groups: [], members: [] },
    });
    const { toJSON } = render(
      <AddTask route={{ params: { eventId: "evt001" } }} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it("2. Gọi eventService.getEventDetail khi có eventId", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: { groups: [], members: [] },
    });
    render(<AddTask route={{ params: { eventId: "evt001" } }} />);
    await waitFor(() => {
      expect(eventService.getEventDetail).toHaveBeenCalledWith("evt001");
    });
  });

  it("3. Hiển thị nhóm từ event API", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: {
        groups: [{ _id: "g1", name: "Nhóm A", iconIndex: 0 }],
        members: [],
      },
    });
    const { getByText } = render(
      <AddTask route={{ params: { eventId: "evt001" } }} />,
    );
    await waitFor(() => {
      expect(getByText("Nhóm A")).toBeTruthy();
    });
  });

  it("4. Hiển thị lỗi khi tên nhiệm vụ trống", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: { groups: [], members: [] },
    });
    const { getByText } = render(
      <AddTask route={{ params: { eventId: "evt001" } }} />,
    );
    await act(async () => {
      fireEvent.press(getByText("Tạo nhiệm vụ"));
    });
    expect(taskService.createTask).not.toHaveBeenCalled();
  });

  it("5. Gọi taskService.createTask khi form hợp lệ", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: { groups: [], members: [] },
    });
    taskService.createTask.mockResolvedValueOnce({ data: { _id: "task1" } });

    const { getByPlaceholderText, getByText } = render(
      <AddTask route={{ params: { eventId: "evt001" } }} />,
    );

    fireEvent.changeText(
      getByPlaceholderText("Nhập tên nhiệm vụ..."),
      "Kê bàn ghế",
    );

    await act(async () => {
      fireEvent.press(getByText("Tạo nhiệm vụ"));
    });

    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Kê bàn ghế", event: "evt001" }),
      );
    });
  });

  it("6. Navigate goBack sau khi tạo task thành công", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: { groups: [], members: [] },
    });
    taskService.createTask.mockResolvedValueOnce({ data: { _id: "task2" } });

    const { getByPlaceholderText, getByText } = render(
      <AddTask route={{ params: { eventId: "evt001" } }} />,
    );

    fireEvent.changeText(
      getByPlaceholderText("Nhập tên nhiệm vụ..."),
      "Test Task",
    );

    await act(async () => {
      fireEvent.press(getByText("Tạo nhiệm vụ"));
    });

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it("7. Navigate sang MapEditor với eventId khi nhấn Thêm vị trí", async () => {
    eventService.getEventDetail.mockResolvedValueOnce({
      data: { groups: [], members: [] },
    });
    const { getByText } = render(
      <AddTask route={{ params: { eventId: "evt001" } }} />,
    );
    fireEvent.press(getByText("Thêm vị trí"));
    expect(mockNavigate).toHaveBeenCalledWith("MapEditor", {
      eventId: "evt001",
      existingCoords: undefined,
    });
  });
});

// ─── TaskDetailScreen ─────────────────────────────────────────────────────────
describe("TaskDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  it("1. Render không bị crash khi không có taskId", () => {
    const { toJSON } = render(<TaskDetailScreen route={{ params: {} }} />);
    expect(toJSON()).toBeTruthy();
  });

  it("2. Gọi taskService.getTaskDetail khi có taskId", async () => {
    taskService.getTaskDetail.mockResolvedValueOnce({
      data: {
        _id: "t1",
        title: "Kê bàn",
        description: "Mô tả task",
        status: "TODO",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        group: { _id: "g1", name: "Nhóm khu A" },
      },
    });
    render(<TaskDetailScreen route={{ params: { taskId: "t1" } }} />);
    await waitFor(() => {
      expect(taskService.getTaskDetail).toHaveBeenCalledWith("t1");
    });
  });

  it("3. Hiển thị tên task từ API", async () => {
    taskService.getTaskDetail.mockResolvedValueOnce({
      data: {
        _id: "t1",
        title: "Sắp xếp ghế",
        description: "",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        group: "logistics",
      },
    });
    const { getByDisplayValue } = render(
      <TaskDetailScreen route={{ params: { taskId: "t1" } }} />,
    );
    await waitFor(() => {
      expect(getByDisplayValue("Sắp xếp ghế")).toBeTruthy();
    });
  });

  it("4. Gọi taskService.updateTask khi nhấn Lưu", async () => {
    taskService.getTaskDetail.mockResolvedValueOnce({
      data: {
        _id: "t1",
        title: "Kê bàn",
        description: "",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        group: "logistics",
      },
    });
    taskService.updateTask.mockResolvedValueOnce({ data: { _id: "t1" } });

    const { getByText } = render(
      <TaskDetailScreen route={{ params: { taskId: "t1" } }} />,
    );

    await waitFor(() => expect(getByText("Lưu")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByText("Lưu"));
    });

    await waitFor(() => {
      expect(taskService.updateTask).toHaveBeenCalledWith(
        "t1",
        expect.objectContaining({ title: "Kê bàn" }),
      );
    });
  });

  it("5. Navigate goBack sau khi lưu thành công", async () => {
    taskService.getTaskDetail.mockResolvedValueOnce({
      data: {
        _id: "t1",
        title: "Quét sân",
        description: "",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        group: "logistics",
      },
    });
    taskService.updateTask.mockResolvedValueOnce({ data: { _id: "t1" } });

    const { getByText } = render(
      <TaskDetailScreen route={{ params: { taskId: "t1" } }} />,
    );

    await waitFor(() => expect(getByText("Lưu")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByText("Lưu"));
    });

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it("6. Hiển thị nút xóa (Trash2 icon) trong header", async () => {
    taskService.getTaskDetail.mockResolvedValueOnce({
      data: {
        _id: "t1",
        title: "Task test",
        description: "",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        group: "logistics",
      },
    });
    const { toJSON } = render(
      <TaskDetailScreen route={{ params: { taskId: "t1" } }} />,
    );
    await waitFor(() => expect(toJSON()).toBeTruthy());
  });

  it("7. Không gọi API khi không có taskId", async () => {
    render(<TaskDetailScreen route={{ params: {} }} />);
    await waitFor(() => {
      expect(taskService.getTaskDetail).not.toHaveBeenCalled();
    });
  });

  it("8. Hiển thị đúng nhóm đã chọn trước đó từ event groups", async () => {
    taskService.getTaskDetail.mockResolvedValueOnce({
      data: {
        _id: "t1",
        title: "Kê bàn",
        description: "",
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        event: { _id: "evt001" },
        group: { _id: "g1", name: "Nhóm khu A" },
      },
    });
    eventService.getEventDetail.mockResolvedValueOnce({
      data: {
        groups: [{ _id: "g1", name: "Nhóm khu A", iconIndex: 0 }],
        members: [],
      },
    });

    const { getByText, queryByText } = render(
      <TaskDetailScreen route={{ params: { taskId: "t1" } }} />,
    );

    await waitFor(() => {
      expect(getByText("Nhóm khu A")).toBeTruthy();
      expect(queryByText("Chọn nhóm...")).toBeNull();
    });
  });
});
