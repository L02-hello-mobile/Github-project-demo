import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock socket.io-client
const mockSocketOn = jest.fn();
const mockSocketOff = jest.fn();
const mockSocketEmit = jest.fn();
const mockSocketDisconnect = jest.fn();
const mockRemoveAllListeners = jest.fn();

const mockSocket = {
  on: mockSocketOn,
  off: mockSocketOff,
  emit: mockSocketEmit,
  disconnect: mockSocketDisconnect,
  removeAllListeners: mockRemoveAllListeners,
  connected: false,
};

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => mockSocket),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import { socketService } from "../services/socketService";

describe("socketService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.connected = false;
    // Reset socket instance
    socketService.disconnect();
  });

  afterEach(() => {
    socketService.disconnect();
  });

  it("1. connect() gọi io() khi có token", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("fake-token-123");
    await socketService.connect();
    expect(require("socket.io-client").io).toHaveBeenCalled();
  });

  it("2. connect() không gọi io() khi không có token", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    await socketService.connect();
    expect(require("socket.io-client").io).not.toHaveBeenCalled();
  });

  it("3. disconnect() không crash", () => {
    expect(() => socketService.disconnect()).not.toThrow();
  });

  it("4. isConnected() trả về false khi chưa connect", () => {
    expect(socketService.isConnected()).toBe(false);
  });

  it("5. joinEvent() emit đúng", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    socketService.joinEvent("event123");
    expect(mockSocketEmit).toHaveBeenCalledWith("join-event", "event123");
  });

  it("6. leaveEvent() emit đúng", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    socketService.leaveEvent("event456");
    expect(mockSocketEmit).toHaveBeenCalledWith("leave-event", "event456");
  });

  it("7. onNewNotification() đăng ký listener", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    const callback = jest.fn();
    socketService.onNewNotification(callback);
    expect(mockSocketOn).toHaveBeenCalledWith("notification:new", expect.any(Function));
  });

  it("8. addNotificationListener() hoạt động", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    const callback = jest.fn();
    socketService.addNotificationListener(callback);
    expect(mockSocketOn).toHaveBeenCalledWith("notification:new", callback);
  });

  it("9. removeNotificationListener() hoạt động", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    const callback = jest.fn();
    socketService.addNotificationListener(callback);
    socketService.removeNotificationListener(callback);
    expect(mockSocketOff).toHaveBeenCalledWith("notification:new", callback);
  });

  it("10. reconnectIfNeeded() gọi connect khi chưa connected", async () => {
    const connectSpy = jest.spyOn(socketService, "connect");
    await socketService.reconnectIfNeeded();
    expect(connectSpy).toHaveBeenCalled();
  });
});