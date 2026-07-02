import { apiClient } from "./apiClient";
import type { AppointmentResponse, AppointmentCreatePayload } from "../types/reception";

export const appointmentService = {
  getAll: (skip = 0, limit = 50) =>
    apiClient.get<AppointmentResponse[]>(`/appointments/?skip=${skip}&limit=${limit}`),

  create: (data: AppointmentCreatePayload) =>
    apiClient.post<AppointmentResponse>("/appointments/", data),

  cancel: (id: string, reason: string) =>
    apiClient.patch<AppointmentResponse>(`/appointments/${id}/cancel`, {
      cancellation_reason: reason,
    }),
};