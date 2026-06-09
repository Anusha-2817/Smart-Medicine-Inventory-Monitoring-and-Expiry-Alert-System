import apiClient from "./api-client";

export interface ImportResult {
  success: boolean;
  uploaded: number;
  imported: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export const importMedicines = async (file: File): Promise<ImportResult> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post("/import/medicines", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const importInventory = async (file: File): Promise<ImportResult> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post("/import/inventory", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const importSuppliers = async (file: File): Promise<ImportResult> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post("/import/suppliers", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getImportHistory = async (params?: { page?: number; limit?: number }) => {
  const { data } = await apiClient.get("/import/history", { params });
  return data;
};

export const downloadTemplate = (type: "medicines" | "inventory" | "suppliers") => {
  const token = localStorage.getItem("medistock_token");
  fetch(`/api/export/${type}-template`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.blob())
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${type}_template.csv`;
      a.click();
    });
};
