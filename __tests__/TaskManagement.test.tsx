import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock services
jest.mock("../services/taskService", () => ({
  taskService: {
    getEventTasks: jest.fn().mockResolvedValue({ data: [] }),
    createTask: jest.fn().mockResolvedValue({ data: { _id: "t1" } }),
    getTaskDetail: jest.fn().mockResolvedValue({ data: { _id: "t1", title: "Test Task" } }),
  },
}));

jest.mock("../services/eventService", () => ({
  eventService: {
    getEventDetail: jest.fn().mockResolvedValue({ data: { groups: [] } }),
  },
}));

import EventsTasksOrg from "../screens/organizer/EventsTasks";
import AddTask from "../screens/organizer/AddTask";
import TaskDetailScreen from "../screens/organizer/TaskDetail";

describe("Task Management Simple Tests", () => {
  it("1. EventsTasksOrg render thành công", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <EventsTasksOrg route={{ params: { eventId: "e1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("2. AddTask render thành công", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <AddTask route={{ params: { eventId: "e1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("3. TaskDetailScreen render thành công", () => {
    const { toJSON } = render(
      <NavigationContainer>
        <TaskDetailScreen route={{ params: { taskId: "t1" } }} />
      </NavigationContainer>
    );
    expect(toJSON()).toBeTruthy();
  });
});