import apiClient from "./api-client";

export const getNotifications = async (params?: { page?: number }) => {
  const { data } = await apiClient.get("/notifications", { params });
  return data;
};
export const getUnreadCount = async () => {
  const { data } = await apiClient.get("/notifications/unread-count");
  return data.count as number;
};
export const markAsRead = async (id: string) => {
  const { data } = await apiClient.put(`/notifications/${id}/read`);
  return data;
};
export const markAllAsRead = async () => {
  const { data } = await apiClient.put("/notifications/mark-all-read");
  return data;
};
