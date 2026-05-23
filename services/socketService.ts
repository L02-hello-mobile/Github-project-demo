import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "http://10.0.2.2:4000";

let socket: Socket | null = null;
let _primaryNotifCb: ((data: any) => void) | null = null;
let _additionalNotifCbs: Array<(data: any) => void> = [];

function _applyNotifListeners() {
  if (!socket) return;
  socket.off("notification:new");
  if (_primaryNotifCb) socket.on("notification:new", _primaryNotifCb);
  _additionalNotifCbs.forEach((cb) => socket!.on("notification:new", cb));
}

export const socketService = {
  connect: async (): Promise<void> => {
    // Avoid duplicate connections
    if (socket?.connected) return;
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;
    socket = io(SOCKET_URL, { auth: { token } });
    socket.on("connect", () => {
      console.log("[Socket] connected");
      _applyNotifListeners();
    });
    socket.on("disconnect", (reason) =>
      console.log("[Socket] disconnected:", reason),
    );
    socket.on("connect_error", (err) =>
      console.warn("[Socket] connect error:", err.message),
    );
  },

  disconnect: (): void => {
    socket?.disconnect();
    socket = null;
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

  /** Replace previous listener for this event before adding to avoid stacking */
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

  /** Add an additional listener without removing existing ones */
  addNotificationListener: (cb: (data: any) => void): void => {
    _additionalNotifCbs.push(cb);
    socket?.on("notification:new", cb);
  },

  /** Remove a specific listener */
  removeNotificationListener: (cb: (data: any) => void): void => {
    _additionalNotifCbs = _additionalNotifCbs.filter((c) => c !== cb);
    socket?.off("notification:new", cb);
  },

  off: (event: string): void => {
    socket?.off(event);
  },

  /** Re-connect if the socket is not currently connected (safe to call anytime) */
  reconnectIfNeeded: async (): Promise<void> => {
    if (socket?.connected) return;
    await socketService.connect();
  },

  /** Exposed for unit-testing only — do not call in production code */
  _getSocket: (): Socket | null => socket,
};
