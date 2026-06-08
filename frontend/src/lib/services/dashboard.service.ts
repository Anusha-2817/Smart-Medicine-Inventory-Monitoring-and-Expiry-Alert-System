import apiClient from "./api-client";

export const getDashboardStats = async () => {
  const { data } = await apiClient.get("/dashboard/stats");
  return data.data;
};
