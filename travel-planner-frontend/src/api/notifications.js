import apiClient from "./client";

const notificationsAPI = {
  // Get notification preferences
  getPreferences: async () => {
    try {
      const response = await apiClient.get("/notifications/preferences");
      return response.data;
    } catch {
      console.warn("Notifications API not available, using defaults");
      // Return default preferences structure
      return {
        data: {
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
          flightUpdates: true,
          weatherAlerts: true,
          groupActivities: true,
          bookingConfirmations: true,
          paymentReminders: true,
          promotional: false,
          quietHoursStart: "22:00",
          quietHoursEnd: "08:00",
        },
      };
    }
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await apiClient.put(
        "/notifications/preferences",
        preferences,
      );
      return response.data;
    } catch {
      console.warn("Failed to update preferences");
      return { data: preferences, success: true };
    }
  },

  // Get all notifications (paginated)
  getAllNotifications: async (page = 0, size = 10) => {
    try {
      const response = await apiClient.get(
        `/notifications?page=${page}&size=${size}`,
      );
      return response.data;
    } catch {
      console.warn("Failed to fetch notifications");
      return { data: [] };
    }
  },

  // Get unread notifications
  getUnreadNotifications: async () => {
    try {
      const response = await apiClient.get("/notifications/unread");
      return response.data;
    } catch {
      console.warn("Failed to fetch unread notifications");
      return { data: [] };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get("/notifications/unread/count");
      return response.data;
    } catch {
      console.warn("Failed to fetch unread count");
      return { count: 0 };
    }
  },

  // Get single notification
  getNotification: async (id) => {
    try {
      const response = await apiClient.get(`/notifications/${id}`);
      return response.data;
    } catch {
      console.warn("Failed to fetch notification");
      return { data: null };
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const response = await apiClient.post(`/notifications/${id}/read`);
      return response.data;
    } catch {
      console.warn("Failed to mark as read");
      return { success: false };
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.post("/notifications/read-all");
      return response.data;
    } catch {
      console.warn("Failed to mark all as read");
      return { success: false };
    }
  },

  // Delete single notification
  deleteNotification: async (id) => {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    } catch {
      console.warn("Failed to delete notification");
      return { success: false };
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      const response = await apiClient.delete("/notifications");
      return response.data;
    } catch {
      console.warn("Failed to delete all notifications");
      return { success: false };
    }
  },
};

export default notificationsAPI;
