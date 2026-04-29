import api from "./api";

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  isRead: boolean;
}

const API_BASE = "/Notifications";

export const notificationService = {
  getNotifications: async (): Promise<NotificationDto[]> => {
    const res = await api.get(API_BASE);
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get(`${API_BASE}/unread-count`);
    return res.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.post(`${API_BASE}/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post(`${API_BASE}/read-all`);
  },
};
