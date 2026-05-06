/**
 * @file uf.ts
 * @description Utilidades para el manejo de la Unidad de Fomento (UF) simulando conexión con Banco Central.
 */

const UF_BASE_CLP = 37_650; // Valor base actualizado

/**
 * Simula una llamada a la API del Banco Central o Mindicador.cl
 */
/**
 * Simula una llamada a la API del Banco Central o Mindicador.cl
 */
export async function fetchRealEconomicData(): Promise<{ uf: number; fecha: string }> {
  try {
    const response = await fetch("https://mindicador.cl/api/uf", {
      next: { revalidate: 3600 } // Cache por 1 hora
    });
    
    if (!response.ok) throw new Error("Error al consultar Mindicador");
    
    const data = await response.json();
    const valor = data.serie[0].valor;
    const fecha = data.serie[0].fecha.split("T")[0];
    
    console.info(`[Economic Data] UF obtenida exitosamente: $${valor} (${fecha})`);
    
    return {
      uf: valor,
      fecha: fecha
    };
  } catch (error) {
    console.warn("[Economic Data] Error en conexión real, usando fallback base:", error);
    return {
      uf: UF_BASE_CLP,
      fecha: new Date().toISOString().split("T")[0]
    };
  }
}

/**
 * Obtiene el valor actual de la UF.
 * Para el demo, lo mantenemos sincrónico pero con base actualizada.
 */
export function getUFValue(): number {
  return UF_BASE_CLP;
}

/**
 * Convierte un monto en UF a pesos chilenos (CLP).
 */
export function ufToCLP(uf: number, valorUF?: number): number {
  return Math.round(uf * (valorUF ?? getUFValue()));
}
