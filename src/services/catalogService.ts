import { apiClient } from "./apiClient";
import type { SpecialtyResponse } from "../types/reception";

export const catalogService = {
  getSpecialties: () =>
    apiClient.get<SpecialtyResponse[]>("/catalogs/specialties"),
};