/**
 * @file cybersecurity.ts
 * @description Utilidades para entregar consejos de ciberseguridad contextuales.
 */

export interface CyberTip {
  titulo: string;
  consejo: string;
}

const TIPS: Record<string, CyberTip> = {
  default: {
    titulo: "SEGURIDAD GENERAL",
    consejo: "Nunca compartas tus claves dinámicas o coordenadas por teléfono, incluso si dicen ser de tu banco."
  },
  tarjeta_credito: {
    titulo: "FRAUDE EN TARJETAS",
    consejo: "Activa las notificaciones de compra en tiempo real. Si ves un cobro de $1 peso, bloquea tu tarjeta de inmediato: es una prueba de fraude."
  },
  credito_consumo: {
    titulo: "CRÉDITOS FALSOS",
    consejo: "Cuidado con ofertas de créditos inmediatos que piden un 'pago previo' por gastos operacionales. Los bancos reales descuentan los gastos del monto aprobado."
  },
  credito_hipotecario: {
    titulo: "ESCRITURAS SEGURAS",
    consejo: "Verifica siempre los datos de transferencia para el pie de tu vivienda directamente en la notaría o con tu ejecutivo oficial. No confíes en correos con cambios de cuenta de último minuto."
  },
  seguros: {
    titulo: "PÓLIZAS FANTASMA",
    consejo: "Revisa siempre que el número de póliza exista en el sitio oficial de la aseguradora. Algunos estafadores venden seguros inexistentes vía telefónica."
  }
};

/**
 * Retorna un consejo de ciberseguridad basado en el tipo de producto.
 */
export function getCyberTip(productType: string = "default"): CyberTip {
  return TIPS[productType] || TIPS.default;
}
