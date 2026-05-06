/**
 * @file rut.ts
 * @description Utilidades para el manejo y validación de RUT chileno.
 */

/**
 * Formatea un string como RUT: 12.345.678-9
 */
export const formatRut = (value: string): string => {
  const cleanValue = value.replace(/[^0-9kK]/g, "");
  if (cleanValue.length <= 1) return cleanValue;
  
  const result = cleanValue.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + cleanValue.slice(-1);
  return result.toUpperCase();
};

/**
 * Valida si un string tiene un formato de RUT válido con Módulo 11
 */
export const isValidRut = (rut: string): boolean => {
  if (!rut || typeof rut !== "string") return false;
  
  const clean = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  if (clean.length < 8) return false;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDv = 11 - (sum % 11);
  const dvChar = expectedDv === 11 ? "0" : expectedDv === 10 ? "K" : expectedDv.toString();
  
  return dv === dvChar;
};

