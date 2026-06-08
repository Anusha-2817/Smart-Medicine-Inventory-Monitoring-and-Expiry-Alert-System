import apiClient from "./api-client";

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, password });
  return data;
};

export const getProfile = async () => {
  const { data } = await apiClient.get("/auth/profile");
  return data;
};
