/**
 * Unit tests for socketService
 * socket.io-client is fully mocked so no real network connection is made.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Mock socket.io-client ─────────────────────────────────────────────────

const mockSocketOn = jest.fn();
const mockSocketOff = jest.fn();
const mockSocketEmit = jest.fn();
const mockSocketDisconnect = jest.fn();

const mockSocket = {
  on: mockSocketOn,
  off: mockSocketOff,
  emit: mockSocketEmit,
  disconnect: mockSocketDisconnect,
  connected: true,
};

const mockIo = jest.fn(() => mockSocket);

jest.mock("socket.io-client", () => ({
  io: (...args: any[]) => mockIo(...args),
}));

// ─── Mock AsyncStorage ─────────────────────────────────────────────────────

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// ─── Import service AFTER mocks ────────────────────────────────────────────

import { socketService } from "../services/socketService";

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("socketService", () => {
  beforeEach(() => {
    // Disconnect first to reset singleton, THEN clear mocks so the
    // cleanup disconnect call isn't counted in the test assertions
    socketService.disconnect();
    jest.clearAllMocks();
  });

  // ── connect ──────────────────────────────────────────────────────────────

  it("1. connect() gọi io() với SOCKET_URL và auth token", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("test-token-123");

    await socketService.connect();

    expect(mockIo).toHaveBeenCalledTimes(1);
    const [url, opts] = mockIo.mock.calls[0];
    expect(url).toContain("5001"); // default URL contains port 5001
    expect(opts.auth.token).toBe("test-token-123");
  });

  it("2. connect() không gọi io() khi không có token", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    await socketService.connect();

    expect(mockIo).not.toHaveBeenCalled();
  });

  it("3. connect() không tạo socket mới khi đã connected", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("token");

    // First connection
    await socketService.connect();
    expect(mockIo).toHaveBeenCalledTimes(1);

    // Second call — socket.connected = true → should be skipped
    await socketService.connect();
    expect(mockIo).toHaveBeenCalledTimes(1); // still just 1
  });

  it("4. connect() đăng ký các listener connect/disconnect/connect_error", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");

    await socketService.connect();

    const registeredEvents = mockSocketOn.mock.calls.map((c) => c[0]);
    expect(registeredEvents).toContain("connect");
    expect(registeredEvents).toContain("disconnect");
    expect(registeredEvents).toContain("connect_error");
  });

  // ── disconnect ────────────────────────────────────────────────────────────

  it("5. disconnect() gọi socket.disconnect() và reset socket về null", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();

    socketService.disconnect();

    expect(mockSocketDisconnect).toHaveBeenCalledTimes(1);
    expect(socketService.isConnected()).toBe(false);
    expect(socketService._getSocket()).toBeNull();
  });

  it("6. disconnect() không crash khi socket chưa khởi tạo", () => {
    // socket is null after beforeEach disconnect
    expect(() => socketService.disconnect()).not.toThrow();
  });

  // ── isConnected ───────────────────────────────────────────────────────────

  it("7. isConnected() trả về false khi chưa kết nối", () => {
    expect(socketService.isConnected()).toBe(false);
  });

  it("8. isConnected() trả về true sau khi connect()", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    expect(socketService.isConnected()).toBe(true);
  });

  // ── joinEvent / leaveEvent ────────────────────────────────────────────────

  it("9. joinEvent() emit 'join-event' với eventId", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();

    socketService.joinEvent("event123");

    expect(mockSocketEmit).toHaveBeenCalledWith("join-event", "event123");
  });

  it("10. leaveEvent() emit 'leave-event' với eventId", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();

    socketService.leaveEvent("event456");

    expect(mockSocketEmit).toHaveBeenCalledWith("leave-event", "event456");
  });

  it("11. joinEvent() không crash khi socket chưa kết nối", () => {
    expect(() => socketService.joinEvent("event123")).not.toThrow();
  });

  it("12. leaveEvent() không crash khi socket chưa kết nối", () => {
    expect(() => socketService.leaveEvent("event123")).not.toThrow();
  });

  // ── Listener registration ─────────────────────────────────────────────────

  it("13. onTaskStatusUpdated() đăng ký listener 'task:status-updated'", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    const cb = jest.fn();

    socketService.onTaskStatusUpdated(cb);

    const onCalls = mockSocketOn.mock.calls.filter(
      (c) => c[0] === "task:status-updated",
    );
    expect(onCalls.length).toBeGreaterThan(0);
    expect(onCalls[onCalls.length - 1][1]).toBe(cb);
  });

  it("14. onTaskDeleted() đăng ký listener 'task:deleted'", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    const cb = jest.fn();

    socketService.onTaskDeleted(cb);

    const onCalls = mockSocketOn.mock.calls.filter(
      (c) => c[0] === "task:deleted",
    );
    expect(onCalls.length).toBeGreaterThan(0);
    expect(onCalls[onCalls.length - 1][1]).toBe(cb);
  });

  it("15. onTaskUpdated() đăng ký listener 'task:updated'", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    const cb = jest.fn();

    socketService.onTaskUpdated(cb);

    const onCalls = mockSocketOn.mock.calls.filter(
      (c) => c[0] === "task:updated",
    );
    expect(onCalls[onCalls.length - 1][1]).toBe(cb);
  });

  it("16. onEventDeleted() đăng ký listener 'event:deleted'", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    const cb = jest.fn();

    socketService.onEventDeleted(cb);

    const onCalls = mockSocketOn.mock.calls.filter(
      (c) => c[0] === "event:deleted",
    );
    expect(onCalls[onCalls.length - 1][1]).toBe(cb);
  });

  it("17. onNewNotification() đăng ký listener 'notification:new'", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();
    const cb = jest.fn();

    socketService.onNewNotification(cb);

    const onCalls = mockSocketOn.mock.calls.filter(
      (c) => c[0] === "notification:new",
    );
    expect(onCalls[onCalls.length - 1][1]).toBe(cb);
  });

  it("18. Gọi on*() nhiều lần sẽ off trước để tránh listener stack", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();

    socketService.onTaskStatusUpdated(jest.fn());
    socketService.onTaskStatusUpdated(jest.fn()); // second call

    // socket.off should have been called for "task:status-updated"
    const offCalls = mockSocketOff.mock.calls.filter(
      (c) => c[0] === "task:status-updated",
    );
    expect(offCalls.length).toBeGreaterThanOrEqual(1);
  });

  // ── off ───────────────────────────────────────────────────────────────────

  it("19. off() gọi socket.off(event)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");
    await socketService.connect();

    socketService.off("task:status-updated");

    expect(mockSocketOff).toHaveBeenCalledWith("task:status-updated");
  });

  it("20. off() không crash khi socket chưa kết nối", () => {
    expect(() => socketService.off("task:status-updated")).not.toThrow();
  });

  // ── Graceful no-ops when not connected ────────────────────────────────────

  it("21. onTaskStatusUpdated() không crash khi socket null", () => {
    expect(() => socketService.onTaskStatusUpdated(jest.fn())).not.toThrow();
  });

  it("22. onNewNotification() không crash khi socket null", () => {
    expect(() => socketService.onNewNotification(jest.fn())).not.toThrow();
  });
});
