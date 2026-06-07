import apiClient from "./api-client";

export const getAlerts = async (params?: { resolved?: string; severity?: string; page?: number }) => {
  const { data } = await apiClient.get("/alerts", { params });
  return data;
};
export const resolveAlert = async (id: string) => {
  const { data } = await apiClient.put(`/alerts/${id}/resolve`);
  return data;
};
