import { apiCall } from "./api";
import { apiUpload } from "./api";

export const eventService = {
  // CRUD Event
  createEvent: async (data: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
  }) => {
    return await apiCall("/events", "POST", data);
  },

  getMyEvents: async () => {
    return await apiCall("/events", "GET");
  },

  getEventDetail: async (eventId: string) => {
    return await apiCall(`/events/${eventId}`, "GET");
  },

  updateEvent: async (
    eventId: string,
    data: {
      name?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    },
  ) => {
    return await apiCall(`/events/${eventId}`, "PUT", data);
  },

  deleteEvent: async (eventId: string) => {
    return await apiCall(`/events/${eventId}`, "DELETE");
  },

  // Map
  uploadMap: async (eventId: string, data: { mapImageUrl: string }) => {
    return await apiCall(`/events/${eventId}/map`, "PATCH", data);
  },

  // Progress
  getEventProgress: async (eventId: string) => {
    return await apiCall(`/events/${eventId}/progress`, "GET");
  },

  // Members — Chỉ invite qua email (KHÔNG có join code)
  inviteMember: async (data: {
    eventId: string;
    email: string;
    role?: string;
  }) => {
    return await apiCall("/events/invite", "POST", data);
  },

  respondInvite: async (data: { eventId: string; accept: boolean }) => {
    return await apiCall("/events/respond", "POST", data);
  },

  removeMember: async (eventId: string, userId: string) => {
    return await apiCall(`/events/${eventId}/members/${userId}`, "DELETE");
  },

  // Groups
  createGroup: async (
    eventId: string,
    data: { name: string; iconIndex?: number },
  ) => {
    return await apiCall(`/events/${eventId}/groups`, "POST", data);
  },

  updateGroup: async (
    eventId: string,
    groupId: string,
    data: { name?: string; iconIndex?: number },
  ) => {
    return await apiCall(`/events/${eventId}/groups/${groupId}`, "PUT", data);
  },

  deleteGroup: async (eventId: string, groupId: string) => {
    return await apiCall(`/events/${eventId}/groups/${groupId}`, "DELETE");
  },
};
