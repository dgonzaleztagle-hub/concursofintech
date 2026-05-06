/**
 * @file financial.ts
 * @description Tipos de datos canónicos para el dominio financiero de Beeper Financiero.
 * Estos tipos son la fuente de verdad para toda la aplicación.
 */

export interface SeguroAsociado {
  id_seguro: string;
  tipo_cobertura: "cesantia" | "desgravamen" | "incendio" | "sismos" | "vida" | "accidentes" | "fraude" | "otro";
  es_obligatorio: boolean;
  costo_mensual_uf: number;
  institucion_aseguradora?: string;
  fecha_inicio?: string;
  fecha_termino?: string;
}

export interface ProductoFinanciero {
  id_producto: string;
  tipo: "credito_consumo" | "credito_hipotecario" | "tarjeta_credito" | "cuenta_corriente" | "credito_automotriz" | "leasing" | "otro";
  institucion: string;
  monto: number;
  tasa_anual?: number;
  plazo_meses?: number;
  seguros_asociados: SeguroAsociado[];
}

export interface UserProfile {
  id: string;
  nombre: string;
  rut?: string;
  email?: string;
  productos_financieros: ProductoFinanciero[];
  fecha_consulta: string;          // ISO 8601
  fuente_datos: "excel" | "api" | "database" | "manual";
}

import { z } from "zod";

// Respuesta del Motor LLM
export type AlertStatus = "ok" | "alerta" | "critico";

export interface AnalysisResult {
  diagnostico: string;
  derecho_regulatorio: string;
  accion: string;
  ahorro_trimestral_clp: number;
  ahorro_anual_clp: number;
  educacion_financiera: string;
  consejo_seguridad?: string;
  status: AlertStatus;
  productos_afectados?: string[];
  uf_valor_usado: number;
  timestamp: string;
  is_mock?: boolean;
  is_preventive?: boolean;
  provider?: string;
}

// Esquema Zod para validación de la respuesta del LLM
export const AnalysisResultSchema = z.object({
  diagnostico: z.string(),
  derecho_regulatorio: z.string(),
  accion: z.string(),
  ahorro_trimestral_clp: z.number(),
  ahorro_anual_clp: z.number(),
  educacion_financiera: z.string(),
  consejo_seguridad: z.string().optional(),
  status: z.enum(["ok", "alerta", "critico"]),
  productos_afectados: z.array(z.string()).optional(),
});
