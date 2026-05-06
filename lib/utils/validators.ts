/**
 * @file validators.ts
 * @description Validaciones para el perfil de usuario.
 */

import { UserProfile } from "../types";

export function validateUserProfile(profile: unknown): profile is UserProfile {
  if (!profile || typeof profile !== "object") return false;
  
  const p = profile as Record<string, unknown>;
  
  return (
    typeof p.id === "string" &&
    Array.isArray(p.productos_financieros) &&
    p.productos_financieros.every((prod: unknown) => {
      const pr = prod as Record<string, unknown>;
      return typeof pr.id_producto === "string" && typeof pr.tipo === "string";
    })
  );
}
