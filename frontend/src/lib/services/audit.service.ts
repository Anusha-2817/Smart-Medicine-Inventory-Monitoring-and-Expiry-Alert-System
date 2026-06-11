import apiClient from "./api-client";

export const getAuditSummary = async (filters: any = {}) => {
  const { data } = await apiClient.get("/audit/summary", { params: filters });
  return data.data;
};

export const getAuditAnalytics = async (filters: any = {}) => {
  const { data } = await apiClient.get("/audit/analytics", { params: filters });
  return data.data;
};

export const getAuditAnomalies = async () => {
  const { data } = await apiClient.get("/audit/anomalies");
  return data.data;
};

export const getAuditMovements = async (filters: any) => {
  const { data } = await apiClient.get("/audit/movements", { params: filters });
  return data.data;
};
