import apiClient from "./api-client";

export const getMedicines = async (params?: { search?: string; category?: string; status?: string; page?: number; limit?: number }) => {
  const { data } = await apiClient.get("/medicines", { params });
  return data;
};

export const getMedicine = async (id: string) => {
  const { data } = await apiClient.get(`/medicines/${id}`);
  return data.data;
};

export const createMedicine = async (body: Record<string, unknown>) => {
  const { data } = await apiClient.post("/medicines", body);
  return data.data;
};

export const updateMedicine = async (id: string, body: Record<string, unknown>) => {
  const { data } = await apiClient.put(`/medicines/${id}`, body);
  return data.data;
};

export const deleteMedicine = async (id: string) => {
  const { data } = await apiClient.delete(`/medicines/${id}`);
  return data;
};
