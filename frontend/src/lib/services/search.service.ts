import apiClient from "./api-client";

export const getGlobalSearch = async (query: string) => {
  if (!query) return null;
  const { data } = await apiClient.get("/search", { params: { q: query } });
  return data;
};
