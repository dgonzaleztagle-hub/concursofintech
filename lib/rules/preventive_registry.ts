/**
 * @file preventive_registry.ts
 * @description Registro de consejos preventivos dinámicos por tipo de producto.
 */

export interface PreventiveAdvice {
  product: string;
  questions: string[];
  red_flags: string[];
  law_tip: string;
}

export const PREVENTIVE_ADVICE_REGISTRY: Record<string, PreventiveAdvice> = {
  "Crédito Consumo": {
    product: "Crédito de Consumo",
    questions: [
      "¿Cuál es la CAE (Costo Anual Equivalente)?",
      "¿Este seguro es obligatorio o voluntario?",
      "¿Puedo pagar el crédito antes (prepago) sin multa?"
    ],
    red_flags: [
      "Si te dicen que el seguro baja la tasa, es una 'Venta Atada'.",
      "Si la CAE supera el 30% anual, busca otra cotización."
    ],
    law_tip: "Tienes 10 días para retractarte sin dar explicaciones (Derecho de Retracto)."
  },
  "Tarjeta de Crédito": {
    product: "Tarjeta de Crédito",
    questions: [
      "¿Cuál es el costo de mantención mensual?",
      "¿Me cobran si no uso la tarjeta?",
      "¿Qué seguros vienen activados por defecto?"
    ],
    red_flags: [
      "Cobros por 'Seguro de Fraude' que ya están cubiertos por ley.",
      "Comisiones de administración que superan los $5.000 mensuales."
    ],
    law_tip: "No pueden obligarte a contratar un seguro para entregarte la tarjeta."
  },
  "Crédito Hipotecario": {
    product: "Crédito Hipotecario",
    questions: [
      "¿Puedo traer mis propios seguros de incendio y desgravamen?",
      "¿Cuál es el costo total del crédito (CTC)?",
      "¿La tasa es fija, variable o mixta?"
    ],
    red_flags: [
      "Obligarte a abrir una cuenta corriente con saldo mínimo para darte el crédito.",
      "Seguros de vida 'adicionales' que no son obligatorios por ley."
    ],
    law_tip: "Según el Art. 17 H, puedes contratar tus seguros con cualquier aseguradora externa."
  },
  "Cuenta Corriente": {
    product: "Cuenta Corriente",
    questions: [
      "¿Hay costo de mantención si deposito mi sueldo?",
      "¿Cuánto cuesta cada giro en cajero automático?",
      "¿La línea de crédito se activa sola?"
    ],
    red_flags: [
      "Cobros por 'paquetes' de productos que no pediste.",
      "Seguros de 'protección de tarjeta' que ya deberían ser gratuitos."
    ],
    law_tip: "El banco debe informarte por escrito cualquier cambio en las comisiones con 60 días de aviso."
  }
};

export function getPreventivePrompt(productType: string): string {
  const advice = PREVENTIVE_ADVICE_REGISTRY[productType] || PREVENTIVE_ADVICE_REGISTRY["Crédito Consumo"];
  
  return `
## MODO PREVENTIVO: COACH DE NEGOCIACIÓN
El usuario está frente a un ejecutivo bancario evaluando un [${advice.product}].
Tu objetivo es empoderarlo antes de que firme.

### Preguntas Críticas que el usuario DEBE hacer:
${advice.questions.map(q => `- ${q}`).join("\n")}

### Señales de Alerta (Red Flags):
${advice.red_flags.map(f => `- ${f}`).join("\n")}

### Tip Legal de Oro:
${advice.law_tip}

Instrucción: Sé breve, usa un tono de "aliado secreto" y usa el Diccionario de Inclusión.
`.trim();
}
