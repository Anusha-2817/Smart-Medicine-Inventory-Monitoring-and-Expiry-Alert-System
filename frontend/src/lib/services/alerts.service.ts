import apiClient from "./api-client";

export const getAlerts = async (params?: { resolved?: string; severity?: string; search?: string; page?: number }) => {
  const { data } = await apiClient.get("/alerts", { params });
  return data;
};

export const getAlertSummary = async () => {
  const { data } = await apiClient.get("/alerts/summary");
  return data.data; // assuming API returns { success: true, data: { unresolved, critical, warning, resolved } }
};

export const resolveAlert = async (id: string) => {
  const { data } = await apiClient.put(`/alerts/${id}/resolve`);
  return data;
};

export const resolveBulkAlerts = async (ids: string[]) => {
  const { data } = await apiClient.put(`/alerts/bulk-resolve`, { ids });
  return data;
};
