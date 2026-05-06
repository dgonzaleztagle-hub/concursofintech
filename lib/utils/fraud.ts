/**
 * @file fraud.ts
 * @description Utilidades para detección de fraude y phishing financiero.
 */

export interface FraudAlert {
  is_dangerous: boolean;
  reason?: string;
  source: "PhishTank" | "CSIRT" | "CMF";
}

/**
 * Simula la consulta a PhishTank o CSIRT para una URL o Institución.
 */
export async function checkFinancialFraud(target: string): Promise<FraudAlert> {
  // En producción: fetch("https://check.phishtank.com/check", { body: target })
  
  const suspiciousKeywords = ["pago-estado", "banco-linea", "actualiza-datos", "seguridad-santander"];
  const lowerTarget = target.toLowerCase();
  
  const isSuspicious = suspiciousKeywords.some(kw => lowerTarget.includes(kw));
  
  if (isSuspicious) {
    return {
      is_dangerous: true,
      reason: "URL detectada en campañas de phishing activas reportadas por CSIRT.",
      source: "CSIRT"
    };
  }
  
  return {
    is_dangerous: false,
    source: "CMF"
  };
}
