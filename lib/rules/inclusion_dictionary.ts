/**
 * @file inclusion_dictionary.ts
 * @description Diccionario de traducción de términos financieros a lenguaje ciudadano.
 */

export const INCLUSION_DICTIONARY: Record<string, { citizen_term: string; description: string }> = {
  "CAE": {
    citizen_term: "Costo Real del Préstamo",
    description: "Es el número que te dice cuánto te cuesta realmente pedir plata, sumando intereses y gastos."
  },
  "UF": {
    citizen_term: "Valor en Cuotas Ajustables",
    description: "Una medida que sube con los precios. 1 UF son aproximadamente $37.000 pesos hoy."
  },
  "Art. 17 H": {
    citizen_term: "Derecho a Elegir tu Seguro",
    description: "La ley que prohíbe que el banco te obligue a tomar sus propios seguros."
  },
  "Venta Atada": {
    citizen_term: "Venta Amarrada o Forzada",
    description: "Cuando te dicen que para darte un beneficio tienes que comprar otra cosa que no quieres."
  },
  "Spread": {
    citizen_term: "Ganancia del Banco",
    description: "La diferencia entre lo que el banco cobra y lo que le cuesta la plata."
  },
  "Cobranza Extrajudicial": {
    citizen_term: "Acoso por Deuda",
    description: "Cuando te llaman muchas veces o en horarios molestos para pedir que pagues, lo cual tiene límites legales."
  }
};


export function getDictionaryPrompt(): string {
  const terms = Object.entries(INCLUSION_DICTIONARY)
    .map(([tech, data]) => `- ${tech}: Úsalo como "${data.citizen_term}" (${data.description})`)
    .join("\n");

  return `
## DICCIONARIO DE INCLUSIÓN (TRADUCCIÓN CIUDADANA)
Cuando te dirijas al usuario, especialmente si es adulto mayor, traduce estos términos:
${terms}
  `.trim();
}
