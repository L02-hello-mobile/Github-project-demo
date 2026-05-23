import { apiCall } from "./api";

export const notificationService = {
  getNotifications: async () => {
    return await apiCall("/notifications", "GET");
  },

  getUnreadCount: async () => {
    return await apiCall("/notifications/unread-count", "GET");
  },

  markAllRead: async () => {
    return await apiCall("/notifications/read-all", "PUT");
  },

  getByEvent: async (eventId: string) => {
    return await apiCall(`/notifications/by-event/${eventId}`, "GET");
  },

  markRead: async (notifId: string) => {
    return await apiCall(`/notifications/${notifId}/read`, "PUT");
  },

  deleteNotification: async (notifId: string) => {
    return await apiCall(`/notifications/${notifId}`, "DELETE");
  },

  registerPushToken: async (data: { token: string; platform: string }) => {
    return await apiCall("/notifications/push-token", "POST", data);
  },

  removePushToken: async (data: { token: string }) => {
    return await apiCall("/notifications/push-token", "DELETE", data);
  },

  getSettings: async () => {
    return await apiCall("/notifications/settings", "GET");
  },

  updateSettings: async (data: Record<string, boolean>) => {
    return await apiCall("/notifications/settings", "PUT", data);
  },
};
