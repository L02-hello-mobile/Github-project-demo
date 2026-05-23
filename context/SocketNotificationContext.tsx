import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

function formatNotifMessage(notif: any): string {
  const source = notif?.notification ?? notif;
  const taskName =
    (typeof source?.task === "object" && source?.task?.title) ||
    source?.taskName ||
    "";
  const eventName =
    (typeof source?.event === "object" && source?.event?.name) ||
    source?.eventName ||
    "";

  switch (source?.type) {
    case "TASK_ASSIGNED": {
      if (taskName && eventName)
        return `Nhiệm vụ "${taskName}" thuộc sự kiện "${eventName}" đã được giao cho bạn`;
      if (taskName) return `Nhiệm vụ "${taskName}" đã được giao cho bạn`;
      break;
    }
    case "TASK_REMINDER": {
      if (taskName) return `Nhắc nhở: Nhiệm vụ "${taskName}" sắp đến hạn`;
      break;
    }
    case "TASK_STATUS_CHANGED": {
      const status = source?.task?.status ?? source?.status;
      if (status === "OVERDUE" && taskName)
        return `Nhiệm vụ "${taskName}" đã quá thời hạn`;
      if (taskName) return `Nhiệm vụ "${taskName}" đã cập nhật trạng thái`;
      break;
    }
    case "EVENT_INVITE": {
      if (eventName) return `Bạn được mời tham gia sự kiện "${eventName}"`;
      break;
    }
  }
  return (
    source?.message ||
    source?.body ||
    source?.title ||
    notif?.message ||
    notif?.body ||
    notif?.title ||
    "Bạn có thông báo mới"
  );
}
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { socketService } from "../services/socketService";
import { notificationService } from "../services/notificationService";

// ─── Types ─────────────────────────────────────────────────────────────────

interface SocketNotificationContextValue {
  /** Current toast message, null when no toast is visible */
  toastMessage: string | null;
  /** Global unread notification count — updates in real-time */
  unreadCount: number;
  /** Call after user views notifications to reset badge */
  markAsRead: () => void;
  /** Force refresh unread count from API */
  refreshUnreadCount: () => void;
}

function extractUnreadCount(res: any): number {
  if (res == null) return 0;
  const raw = res?.data?.count ?? res?.count;
  if (raw == null) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

// ─── Context ───────────────────────────────────────────────────────────────

const SocketNotificationContext = createContext<SocketNotificationContextValue>(
  {
    toastMessage: null,
    unreadCount: 0,
    markAsRead: () => {},
    refreshUnreadCount: () => {},
  },
);

// ─── Provider ──────────────────────────────────────────────────────────────

const TOAST_VISIBLE_MS = 3000;

export function SocketNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncUnreadCount = useCallback((count: number) => {
    setUnreadCount((prev) => Math.max(prev, count));
  }, []);

  // Fetch initial unread count from API
  useEffect(() => {
    (async () => {
      try {
        const res = await notificationService.getUnreadCount();
        syncUnreadCount(extractUnreadCount(res));
      } catch {}
    })();
  }, [syncUnreadCount]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      syncUnreadCount(extractUnreadCount(res));
    } catch {}
  }, [syncUnreadCount]);

  const showToast = useCallback(
    (message: string) => {
      // Reset animation and set message
      fadeAnim.setValue(0);
      setToastMessage(message);
      setUnreadCount((c) => c + 1);

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToastMessage(null));
      }, TOAST_VISIBLE_MS);
    },
    [fadeAnim],
  );

  useEffect(() => {
    const handleNewNotification = (data: any) => {
      const notif = data?.notification ?? data;
      const msg = formatNotifMessage(notif);
      showToast(msg);

      // Fire a local system notification (banner + sound) so the user gets
      // an OS-level alert even when the app is in the foreground or background.
      const title: string =
        (typeof notif?.task === "object" && notif?.task?.title) ||
        notif?.taskName ||
        notif?.title ||
        "Thông báo mới";
      Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: msg,
          sound: true,
          // Android: must match the channel created in App.tsx
          ...(Platform.OS === "android" && { channelId: "default" }),
          data: notif,
        },
        trigger: null, // deliver immediately
      }).catch((err) => {
        if (__DEV__)
          console.warn("[SocketNotif] scheduleNotification failed:", err);
      });
    };

    socketService.addNotificationListener(handleNewNotification);

    return () => {
      socketService.removeNotificationListener(handleNewNotification);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showToast]);

  // Poll every 30 s while the app is in the foreground (fallback when socket
  // doesn't fire, e.g. Expo Go SDK 53 where remote push is unsupported)
  useEffect(() => {
    const POLL_MS = 30_000;
    const id = setInterval(() => {
      if (AppState.currentState === "active") {
        refreshUnreadCount();
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [refreshUnreadCount]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          refreshUnreadCount();
          // Re-attach socket listeners after the app resumes (socket may have
          // silently disconnected while in the background)
          socketService.reconnectIfNeeded();
        }
      },
    );

    return () => subscription.remove();
  }, [refreshUnreadCount]);

  const markAsRead = useCallback(() => setUnreadCount(0), []);

  return (
    <SocketNotificationContext.Provider
      value={{ toastMessage, unreadCount, markAsRead, refreshUnreadCount }}
    >
      <View style={{ flex: 1 }}>
        {children}

        {/* Global notification toast — floats above all screens */}
        {toastMessage !== null && (
          <Animated.View
            testID="notification-toast"
            style={[styles.toast, { opacity: fadeAnim }]}
            pointerEvents="none"
          >
            <View style={styles.toastRow}>
              <View style={styles.toastDot} />
              <Text style={styles.toastTitle}>Thông báo mới</Text>
            </View>
            <Text style={styles.toastMsg} numberOfLines={2}>
              {toastMessage}
            </Text>
          </Animated.View>
        )}
      </View>
    </SocketNotificationContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useSocketNotification(): SocketNotificationContextValue {
  return useContext(SocketNotificationContext);
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 40,
    left: 16,
    right: 16,
    backgroundColor: "#1F2937",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  toastRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366F1",
    marginRight: 6,
  },
  toastTitle: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  toastMsg: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 18,
  },
});
