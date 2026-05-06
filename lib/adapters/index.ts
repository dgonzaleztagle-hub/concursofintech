/**
 * @file index.ts
 * @description Fachada para obtener perfiles de usuario desde distintas fuentes.
 */

import { UserProfile } from "../types";
import { getApiProfile } from "./apiMockAdapter";

export async function getProfile(id: string): Promise<UserProfile> {
  // Por ahora retornamos el mock de la API
  return getApiProfile(id);
}
