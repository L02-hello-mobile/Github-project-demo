import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || "http://10.0.2.2:4000";

console.log("SOCKET_URL =", SOCKET_URL);

let socket: Socket | null = null;

let _primaryNotifCb: ((data: any) => void) | null = null;
let _additionalNotifCbs: Array<(data: any) => void> = [];

function _applyNotifListeners() {
  if (!socket) return;

  socket.off("notification:new");

  if (_primaryNotifCb) {
    socket.on("notification:new", _primaryNotifCb);
  }

  _additionalNotifCbs.forEach((cb) => {
    socket?.on("notification:new", cb);
  });
}

export const socketService = {
  connect: async (): Promise<void> => {
    try {
      // tránh tạo nhiều socket
      if (socket?.connected) {
        console.log("[Socket] already connected");
        return;
      }

      // cleanup socket cũ nếu có
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
      }

      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.warn("[Socket] No token found");
        return;
      }

      console.log("[Socket] Connecting to:", SOCKET_URL);

      socket = io(SOCKET_URL, {
        auth: { token },

        // dùng websocket thôi
        transports: ["websocket"],

        // timeout connect
        timeout: 5000,

        // tránh reconnect vô hạn
        reconnection: true,
        reconnectionAttempts: 2,
        reconnectionDelay: 2000,

        // luôn tạo connection mới
        forceNew: true,
      });

      socket.on("connect", () => {
        console.log("[Socket] connected");
        _applyNotifListeners();
      });

      socket.on("disconnect", (reason) => {
        console.log("[Socket] disconnected:", reason);
      });

      socket.on("connect_error", (err) => {
        console.warn("[Socket] connect error:", err.message);
      });
    } catch (error) {
      console.error("[Socket] connect failed:", error);
    }
  },

  disconnect: (): void => {
    socket?.removeAllListeners();
    socket?.disconnect();
    socket = null;

    console.log("[Socket] manually disconnected");
  },

  isConnected: (): boolean => {
    return socket?.connected ?? false;
  },

  joinEvent: (eventId: string): void => {
    socket?.emit("join-event", eventId);
  },

  leaveEvent: (eventId: string): void => {
    socket?.emit("leave-event", eventId);
  },

  onTaskStatusUpdated: (cb: (data: any) => void): void => {
    socket?.off("task:status-updated");
    socket?.on("task:status-updated", cb);
  },

  onTaskUpdated: (cb: (data: any) => void): void => {
    socket?.off("task:updated");
    socket?.on("task:updated", cb);
  },

  onTaskDeleted: (cb: (data: any) => void): void => {
    socket?.off("task:deleted");
    socket?.on("task:deleted", cb);
  },

  onEventDeleted: (cb: (data: any) => void): void => {
    socket?.off("event:deleted");
    socket?.on("event:deleted", cb);
  },

  onNewNotification: (cb: (data: any) => void): void => {
    _primaryNotifCb = cb;

    if (socket) {
      _applyNotifListeners();
    }
  },

  addNotificationListener: (cb: (data: any) => void): void => {
    _additionalNotifCbs.push(cb);
    socket?.on("notification:new", cb);
  },

  removeNotificationListener: (cb: (data: any) => void): void => {
    _additionalNotifCbs = _additionalNotifCbs.filter((c) => c !== cb);

    socket?.off("notification:new", cb);
  },

  off: (event: string): void => {
    socket?.off(event);
  },

  reconnectIfNeeded: async (): Promise<void> => {
    if (socket?.connected) return;

    console.log("[Socket] reconnecting...");
    await socketService.connect();
  },

  _getSocket: (): Socket | null => socket,
};