import React from "react";
import { Text, View } from "react-native";
import { render, waitFor, act } from "@testing-library/react-native";
import {
  SocketNotificationProvider,
  useSocketNotification,
} from "../context/SocketNotificationContext";

jest.mock("../services/socketService", () => ({
  socketService: {
    addNotificationListener: jest.fn(),
    removeNotificationListener: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    reconnectIfNeeded: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../services/notificationService", () => ({
  notificationService: {
    getUnreadCount: jest.fn().mockResolvedValue({ data: { count: 0 } }),
  },
}));

const { socketService } = require("../services/socketService");

function TestConsumer() {
  const { toastMessage, unreadCount } = useSocketNotification();
  return (
    <View>
      <Text testID="toast-msg">{toastMessage ?? "null"}</Text>
      <Text testID="unread-count">{unreadCount}</Text>
    </View>
  );
}

describe("SocketNotificationContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("1. Provider render thành công", () => {
    const { toJSON } = render(
      <SocketNotificationProvider>
        <TestConsumer />
      </SocketNotificationProvider>
    );
    expect(toJSON()).toBeTruthy();
  });

  it("2. Trạng thái ban đầu unreadCount = 0", () => {
    const { getByTestId } = render(
      <SocketNotificationProvider>
        <TestConsumer />
      </SocketNotificationProvider>
    );
    expect(getByTestId("unread-count").props.children).toBe(0);
  });

  it("3. Nhận notification mới tăng unreadCount", async () => {
    let capturedCb: any = null;
    (socketService.addNotificationListener as jest.Mock).mockImplementation((cb) => {
      capturedCb = cb;
    });

    const { getByTestId } = render(
      <SocketNotificationProvider>
        <TestConsumer />
      </SocketNotificationProvider>
    );

    await act(async () => {
      capturedCb?.({ message: "Task mới được giao" });
    });

    await waitFor(() => {
      expect(getByTestId("unread-count").props.children).toBe(1);
    });
  });
});