import { axiosClient } from './axiosClient';
import type { AppointmentResponse, TriageCreate, TriageResponse } from '../types/api.types';

export const nurseService = {
  /**
   * Fetches all appointments and filters only those with WAITING status.
   * Maps to: GET /appointments/
   */
  getWaitingAppointments: async (): Promise<AppointmentResponse[]> => {
    const response = await axiosClient.get<AppointmentResponse[]>('/appointments/');
    return response.data.filter(appt => appt.status === 'WAITING');
  },

  /**
   * Registers vital signs (triage) for a specific appointment.
   * Maps to: POST /triage/{appointment_id}
   */
  registerTriage: async (
    appointmentId: string,
    triageData: TriageCreate
  ): Promise<TriageResponse> => {
    const response = await axiosClient.post<TriageResponse>(
      `/triage/${appointmentId}`,
      triageData
    );
    return response.data;
  },

  /**
   * Retrieves existing triage data for a specific appointment.
   * Maps to: GET /triage/{appointment_id}
   */
  getTriageByAppointment: async (appointmentId: string): Promise<TriageResponse> => {
    const response = await axiosClient.get<TriageResponse>(`/triage/${appointmentId}`);
    return response.data;
  },
};