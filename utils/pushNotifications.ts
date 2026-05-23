import { Platform } from "react-native";
import { notificationService } from "../services/notificationService";

/**
 * Registers the device's Expo push token with the backend.
 * Requires `expo-notifications` to be installed.
 * No-ops gracefully if the package is unavailable or permissions are denied.
 */
export async function registerPushToken(): Promise<void> {
  try {
    // Dynamic require so the app doesn't crash if expo-notifications is not installed
    const Notifications = require("expo-notifications");
    const Constants = require("expo-constants").default;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    const projectId: string | undefined =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token: string = tokenData.data;
    const platform: string = Platform.OS; // "ios" | "android"

    await notificationService.registerPushToken({ token, platform });
  } catch (err) {
    // expo-notifications not installed, permissions denied, or network error — silently skip
    if (__DEV__)
      console.warn("[pushNotifications] registerPushToken failed:", err);
  }
}

/**
 * Removes the device's push token from the backend on logout.
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    const Notifications = require("expo-notifications");

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    const Constants = require("expo-constants").default;
    const projectId: string | undefined =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token: string = tokenData.data;

    await notificationService.removePushToken({ token });
  } catch {
    // Silently skip
  }
}

/**
 * Sets up a listener for notification taps so deep-links work
 * even when the app is in the background/foreground.
 *
 * Returns a cleanup function — call it on unmount / logout.
 */
export function setupNotificationResponseListener(
  navigate: (screen: string, params?: Record<string, unknown>) => void,
): () => void {
  try {
    const Notifications = require("expo-notifications");

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        const data = response?.notification?.request?.content?.data;
        const payload = data?.notification ?? data;
        const deepLink: string | undefined =
          payload?.deepLink || data?.deepLink;
        if (!deepLink) return;

        const eventMapMatch = deepLink.match(/\/events\/([^/?#\s]+)\/map/);
        const focusTaskMatch = deepLink.match(/focusTask=([^&#\s]+)/);
        const eventMatch = deepLink.match(/\/events\/([^/?#\s]+)/);
        const taskMatch = deepLink.match(/\/tasks\/([^/?#\s]+)/);

        if (eventMapMatch) {
          navigate("MapViewStaff", {
            eventId: eventMapMatch[1],
            taskId: focusTaskMatch?.[1],
          });
        } else if (taskMatch) {
          navigate("TaskDetailStaff", { taskId: taskMatch[1] });
        } else if (eventMatch) {
          navigate("EventDetail", { eventId: eventMatch[1] });
        }
      },
    );

    return () => subscription?.remove();
  } catch {
    return () => {};
  }
}
