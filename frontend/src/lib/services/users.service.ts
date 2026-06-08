import apiClient from "./api-client";

export const getUsers = async (params?: { search?: string; page?: number; limit?: number }) => {
  const { data } = await apiClient.get("/users", { params });
  return data;
};

export const createUser = async (body: Record<string, unknown>) => {
  const { data } = await apiClient.post("/users", body);
  return data.data;
};

export const updateUser = async (id: string, body: Record<string, unknown>) => {
  const { data } = await apiClient.put(`/users/${id}`, body);
  return data.data;
};

export const deleteUser = async (id: string) => {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
};
