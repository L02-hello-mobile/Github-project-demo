import React from "react";
import { render, act } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

// === GLOBAL MOCKS ===
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock lucide-react-native
jest.mock("lucide-react-native", () => {
  const MockIcon = () => null;
  return {
    MapPin: MockIcon, Plus: MockIcon, Minus: MockIcon, Users: MockIcon,
    ImageIcon: MockIcon, Calendar: MockIcon, BriefcaseIcon: MockIcon,
    ChevronDown: MockIcon, Search: MockIcon, Package: MockIcon,
    Wrench: MockIcon, Camera: MockIcon, Shield: MockIcon,
    ClipboardList: MockIcon, Trash2: MockIcon, ChevronLeft: MockIcon,
    Mail: MockIcon, Info: MockIcon,
  };
});

// Mock services
jest.mock("../services/taskService", () => ({
  taskService: {
    getEventTasks: jest.fn().mockResolvedValue({ data: [] }),
    getTaskDetail: jest.fn().mockResolvedValue({ data: { title: "Test Task" } }),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    assignTask: jest.fn(),
    getMyTasks: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

jest.mock("../services/eventService", () => ({
  eventService: {
    getEventDetail: jest.fn().mockResolvedValue({ 
      data: { name: "Test Event", groups: [], members: [] } 
    }),
    getEventProgress: jest.fn().mockResolvedValue({ data: { percentage: 50 } }),
    createEvent: jest.fn().mockResolvedValue({ data: { _id: "e1" } }),
    createGroup: jest.fn(),
    inviteMember: jest.fn(),
    removeMember: jest.fn(),
    getMyEvents: jest.fn().mockResolvedValue({ data: [] }),
    uploadMap: jest.fn(),
  },
}));

jest.mock("../services/uploadService", () => ({
  uploadService: {
    uploadImage: jest.fn().mockResolvedValue({ data: { imageUrl: "https://example.com/map.jpg" } }),
  },
}));

jest.mock("../services/socketService", () => ({
  socketService: {
    joinEvent: jest.fn(),
    leaveEvent: jest.fn(),
    onTaskStatusUpdated: jest.fn(),
    onTaskUpdated: jest.fn(),
    onTaskDeleted: jest.fn(),
    off: jest.fn(),
  },
}));

jest.mock("../context/SocketNotificationContext", () => ({
  useSocketNotification: () => ({ unreadCount: 0 }),
}));

// === IMPORT SCREENS ===
import CreateEvent from "../screens/organizer/CreateEvent";
import EventDetailScreen from "../screens/organizer/EventDetailScreen";
import EventsTasksOrg from "../screens/organizer/EventsTasks";
import AddTask from "../screens/organizer/AddTask";
import TaskDetail_Org from "../screens/organizer/TaskDetail";
import MemberList from "../screens/organizer/MemberList";
import AddLocation from "../screens/organizer/AddLocation";

import MapList_Staff from "../screens/staff/MapList";
import MapView_Staff from "../screens/staff/MapView";
import TaskDetail_Staff from "../screens/staff/TaskDetail";
import TodayTask from "../screens/staff/TodayTask";

const mockNav = { navigate: jest.fn(), goBack: jest.fn() };

describe("ALL SCREENS - HIGH COVERAGE", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("CreateEvent renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <CreateEvent navigation={mockNav} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("EventDetailScreen renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <EventDetailScreen navigation={mockNav} route={{ params: { eventId: "e1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("EventsTasksOrg renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <EventsTasksOrg navigation={mockNav} route={{ params: { eventId: "e1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("AddTask renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <AddTask route={{ params: { eventId: "e1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("TaskDetail_Org renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <TaskDetail_Org route={{ params: { taskId: "t1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("MemberList renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <MemberList navigation={mockNav} route={{ params: { eventId: "e1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("AddLocation renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <AddLocation route={{ params: { eventId: "e1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("MapList_Staff renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <MapList_Staff navigation={mockNav} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("MapView_Staff renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <MapView_Staff route={{ params: { eventId: "e1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("TaskDetail_Staff renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <TaskDetail_Staff route={{ params: { taskId: "t1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("TodayTask renders", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <TodayTask navigation={mockNav} route={{ params: {} }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });
});