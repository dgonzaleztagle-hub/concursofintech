/**
 * @file apiMockAdapter.ts
 * @description Adaptador mock para simular una respuesta de API externa.
 */

import { UserProfile } from "../types";

export async function getApiProfile(id: string): Promise<UserProfile> {
  console.info(`[apiMockAdapter] Obteniendo perfil para ID: ${id}`);
  
  return {
    id,
    nombre: "María González Fuentes",
    rut: "12.345.678-9",
    productos_financieros: [
      {
        id_producto: "PROD-001",
        tipo: "credito_consumo",
        institucion: "Banco Estado",
        monto: 5000000,
        tasa_anual: 18.5,
        plazo_meses: 48,
        seguros_asociados: [
          {
            id_seguro: "SEG-001",
            tipo_cobertura: "cesantia",
            es_obligatorio: false,
            costo_mensual_uf: 0.15,
            institucion_aseguradora: "Seguros Estado",
          },
        ],
      },
      {
        id_producto: "PROD-002",
        tipo: "tarjeta_credito",
        institucion: "Banco Santander",
        monto: 800000,
        seguros_asociados: [
          {
            id_seguro: "SEG-002",
            tipo_cobertura: "cesantia",
            es_obligatorio: false,
            costo_mensual_uf: 0.12,
            institucion_aseguradora: "RSA Seguros",
          },
        ],
      },
    ],
    fecha_consulta: new Date().toISOString(),
    fuente_datos: "api",
  };
}
