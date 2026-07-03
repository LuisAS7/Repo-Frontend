import { apiClient } from "./apiClient";
import type { PatientResponse, PatientCreatePayload } from "../types/reception";

export const patientService = {
  getAll: (skip = 0, limit = 50) =>
    apiClient.get<PatientResponse[]>(`/patients/?skip=${skip}&limit=${limit}`),

  create: (data: PatientCreatePayload) =>
    apiClient.post<PatientResponse>("/patients/", data),

  update: (patientId: string, data: Partial<Record<string, any>>) =>
    apiClient.patch<PatientResponse>(`/patients/${patientId}`, data),

  updateStatus: (patientId: string, isActive: boolean) =>
    apiClient.patch<PatientResponse>(`/patients/${patientId}/status`, { is_active: isActive }),
};