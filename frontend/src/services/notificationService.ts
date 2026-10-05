import { apiRequest } from "./api";
import { getToken } from "./authStorage";

export type NotificationItem = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
};

function getAuthHeaders() {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");
  return { Authorization: `Bearer ${token}` };
}

export async function getNotifications(): Promise<{
  notifications: NotificationItem[];
  unread_count: number;
  total: number;
}> {
  return apiRequest("/notifications", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export async function markNotificationRead(
  notificationId: string
): Promise<{ message: string }> {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
}

export async function markAllNotificationsRead(): Promise<{
  message: string;
  count: number;
}> {
  return apiRequest("/notifications/mark-all-read", {
    method: "POST",
    headers: getAuthHeaders(),
  });
}
