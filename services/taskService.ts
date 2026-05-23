import { apiCall } from "./api";

export const taskService = {
  createTask: async (data: {
    event: string;
    title: string;
    group?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    assignees?: string[];
    mapCoordinates?: {
      x: number;
      y: number;
      label?: string;
      iconIndex?: number;
    };
  }) => {
    return await apiCall("/tasks", "POST", data);
  },

  getMyTasks: async (eventId?: string) => {
    const query = eventId ? `?eventId=${eventId}` : "";
    return await apiCall(`/tasks/my${query}`, "GET");
  },

  getEventTasks: async (eventId: string) => {
    return await apiCall(`/tasks/event/${eventId}`, "GET");
  },

  getTaskDetail: async (taskId: string) => {
    return await apiCall(`/tasks/${taskId}`, "GET");
  },

  updateTask: async (
    taskId: string,
    data: {
      title?: string;
      group?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      mapCoordinates?: {
        x: number;
        y: number;
        label?: string;
        iconIndex?: number;
      };
    },
  ) => {
    return await apiCall(`/tasks/${taskId}`, "PUT", data);
  },

  deleteTask: async (taskId: string) => {
    return await apiCall(`/tasks/${taskId}`, "DELETE");
  },

  updateTaskStatus: async (
    taskId: string,
    data: { status: string; proofImage?: string },
  ) => {
    return await apiCall(`/tasks/${taskId}/status`, "PUT", data);
  },

  assignTask: async (taskId: string, data: { assignees: string[] }) => {
    return await apiCall(`/tasks/${taskId}/assign`, "PATCH", data);
  },
};
