import apiClient from "./api-client";

export const getInventory = async (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
  const { data } = await apiClient.get("/inventory", { params });
  return data;
};
export const getExpiring = async (days = 30) => {
  const { data } = await apiClient.get("/inventory/expiring", { params: { days } });
  return data.data;
};
export const createBatch = async (body: Record<string, unknown>) => {
  const { data } = await apiClient.post("/inventory", body);
  return data.data;
};
export const updateBatch = async (id: string, body: Record<string, unknown>) => {
  const { data } = await apiClient.put(`/inventory/${id}`, body);
  return data.data;
};
