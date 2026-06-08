import apiClient from "./api-client";

export const getMovements = async (params?: { page?: number; limit?: number }) => {
  const { data } = await apiClient.get("/stock-movements", { params });
  return data;
};

export const createMovement = async (body: {
  batchId: string;
  movementType: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "EXPIRED" | "RETURNED";
  quantity: number;
  notes?: string;
}) => {
  const { data } = await apiClient.post("/stock-movements", body);
  return data.data;
};
