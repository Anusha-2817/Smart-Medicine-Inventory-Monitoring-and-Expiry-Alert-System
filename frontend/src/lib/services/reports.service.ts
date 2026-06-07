import apiClient from "./api-client";

export const getReportSummary = async () => {
  const { data } = await apiClient.get("/reports/summary");
  return data.data;
};

export const getInventoryReport = async () => {
  const { data } = await apiClient.get("/reports/inventory");
  return data.data;
};

export const getExpiryReport = async () => {
  const { data } = await apiClient.get("/reports/expiry");
  return data.data;
};

export const getSupplierReport = async () => {
  const { data } = await apiClient.get("/reports/suppliers");
  return data.data;
};

export const getMovementsReport = async () => {
  const { data } = await apiClient.get("/reports/stock-movements");
  return data.data;
};
