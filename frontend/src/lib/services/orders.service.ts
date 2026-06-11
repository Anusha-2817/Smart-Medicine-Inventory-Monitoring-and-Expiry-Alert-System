import apiClient from "./api-client";

export const getOrders = async (params?: { status?: string; page?: number }) => {
  const { data } = await apiClient.get("/orders", { params });
  return data;
};
export const getOrder = async (id: string) => {
  const { data } = await apiClient.get(`/orders/${id}`);
  return data.data;
};
export const createOrder = async (body: Record<string, unknown>) => {
  const { data } = await apiClient.post("/orders", body);
  return data.data;
};
export const updateOrderStatus = async (id: string, status: string) => {
  const { data } = await apiClient.put(`/orders/${id}/status`, { status });
  return data.data;
};
export const deleteOrder = async (id: string) => {
  const { data } = await apiClient.delete(`/orders/${id}`);
  return data;
};
