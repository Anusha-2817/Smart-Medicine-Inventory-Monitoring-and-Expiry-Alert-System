import apiClient from "./api-client";

export const getSuppliers = async (params?: { search?: string; page?: number; limit?: number }) => {
  const { data } = await apiClient.get("/suppliers", { params });
  return data;
};
export const createSupplier = async (body: Record<string, unknown>) => {
  const { data } = await apiClient.post("/suppliers", body);
  return data.data;
};
export const updateSupplier = async (id: string, body: Record<string, unknown>) => {
  const { data } = await apiClient.put(`/suppliers/${id}`, body);
  return data.data;
};
export const deleteSupplier = async (id: string) => {
  const { data } = await apiClient.delete(`/suppliers/${id}`);
  return data;
};
