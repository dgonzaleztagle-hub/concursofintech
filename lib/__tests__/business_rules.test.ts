/**
 * @file business_rules.test.ts
 * @description Pruebas unitarias para validación de RUT y anonimización de datos.
 */

import { describe, it, expect } from "vitest";
import { formatRut, isValidRut } from "../utils/rut";
import { anonymizeProfile } from "../utils/security";
import { UserProfile } from "../types";

describe("Reglas de Negocio: Validación de RUT", () => {
  it("Debe formatear un RUT correctamente", () => {
    expect(formatRut("123456789")).toBe("12.345.678-9");
    expect(formatRut("12345678-9")).toBe("12.345.678-9");
  });

  it("Debe validar un RUT chileno legítimo (módulo 11)", () => {
    // 12.345.678-5 es un RUT válido para pruebas
    expect(isValidRut("12.345.678-5")).toBe(true);
  });

  it("Debe rechazar RUTs con formato inválido o dígitos incorrectos", () => {
    expect(isValidRut("123")).toBe(false);
    expect(isValidRut("12.345.678-9")).toBe(false); // Dígito verificador incorrecto ahora
  });

});

describe("Reglas de Negocio: Seguridad y Privacidad (PII Scrubbing)", () => {
  const mockProfile: UserProfile = {
    id: "USR-123",
    nombre: "Juan Pérez González",
    rut: "12.345.678-9",
    email: "juan.perez@empresa.com",
    productos_financieros: [],
    fecha_consulta: new Date().toISOString(),
    fuente_datos: "manual"
  };

  it("Debe anonimizar nombres y documentos sensibles antes de la salida al LLM", () => {
    const anonymized = anonymizeProfile(mockProfile);
    
    expect(anonymized.nombre).toBe("USUARIO_PROTEGIDO");
    expect(anonymized.rut).toBe("XX.XXX.XXX-X");
    expect(anonymized.email).toBe("email@protegido.cl");
    expect(anonymized.id).toBe("USR-123"); // ID interno se mantiene para re-mapeo
  });

  it("No debe filtrar datos si el perfil ya está anonimizado", () => {
    const alreadyAnon = anonymizeProfile(mockProfile);
    const doubleAnon = anonymizeProfile(alreadyAnon);
    expect(doubleAnon.nombre).toBe("USUARIO_PROTEGIDO");
  });
});

