import { apiClient } from "./apiClient";
import type { StaffResponse, StaffCreatePayload, StaffUpdatePayload } from "../types/reception";

export const staffService = {
  getAll: (skip = 0, limit = 50) =>
    apiClient.get<StaffResponse[]>(`/staff/?skip=${skip}&limit=${limit}`),

  create: (data: StaffCreatePayload) =>
    apiClient.post<StaffResponse>("/staff/", data),

  update: (id: string, data: StaffUpdatePayload) =>
    apiClient.patch<StaffResponse>(`/staff/${id}`, data),
};