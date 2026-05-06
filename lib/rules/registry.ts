/**
 * @file registry.ts
 * @description Registro centralizado de reglas de negocio financieras y de inclusión.
 */

export interface BusinessRule {
  id: string;
  category: "REGULATORY" | "INCLUSION" | "SECURITY";
  name: string;
  description: string;
  law_reference?: string;
  mandato: string;
  priority: number;
}

export const BUSINESS_RULES_REGISTRY: BusinessRule[] = [
  {
    id: "RULE_VENTAS_ATADAS",
    category: "REGULATORY",
    name: "Derecho a Elegir (Ventas Atadas)",
    law_reference: "Ley 19.496 Art. 17 H",
    description: "Prohibición de condicionar créditos a seguros de la misma institución.",
    mandato: "Solo Desgravamen e Incendio son obligatorios en hipotecarios. Si detectas un seguro voluntario de la misma institución que el crédito, márcalo como ALERTA y explica que es un derecho elegir dónde contratarlo.",
    priority: 1
  },
  {
    id: "RULE_DUPLICIDAD",
    category: "REGULATORY",
    name: "Duplicidad de Seguros",
    law_reference: "Normativa CMF / SERNAC",
    description: "Detección de múltiples seguros con la misma cobertura.",
    mandato: "Dos seguros con la misma cobertura (ej. 2 de cesantía) son redundantes. Calcula el ahorro y tradúcelo a impacto social (ej. semanas de gastos básicos).",
    priority: 1
  },
  {
    id: "RULE_MICRO_RETAIL",
    category: "INCLUSION",
    name: "Auditoría de Micro-Retail",
    description: "Detección de abusos en tarjetas de casas comerciales.",
    mandato: "En tarjetas de retail, si la comisión de mantención supera el 10% del uso mensual, repórtalo como 'Abuso por Micro-Endeudamiento'.",
    priority: 2
  },
  {
    id: "RULE_FACTOR_ABUELO",
    category: "INCLUSION",
    name: "Factor Abuelo / Accesibilidad Cognitiva",
    description: "Adaptación del lenguaje para adultos mayores.",
    mandato: "Si el usuario es adulto mayor, evita siglas técnicas (CAE, UF) sin explicarlas. Usa un tono extremadamente empático y términos como 'Su ahorro' en lugar de 'Spread'.",
    priority: 1
  },
  {
    id: "RULE_ALIVIO_CARGA",
    category: "INCLUSION",
    name: "Alivio de Carga Financiera",
    law_reference: "Ley de Insolvencia y Reemprendimiento",
    description: "Sugerencia proactiva de soluciones legales a la deuda.",
    mandato: "Si la deuda supera el 40% del ingreso, sugiere la Ley de Insolvencia como un 'Reinicio Financiero' positivo.",
    priority: 2
  },
  {
    id: "RULE_LEY_FRAUDES",
    category: "REGULATORY",
    name: "Ley de Fraudes (Reembolso Obligatorio)",
    law_reference: "Ley 21.234",
    description: "Protección ante transacciones no autorizadas.",
    mandato: "Ante un fraude reportado, el banco debe devolver montos hasta 35 UF en 5 días hábiles. Si el banco dilata, repórtalo como infracción a la Ley 21.234.",
    priority: 1
  },
  {
    id: "RULE_COBRANZA_ABUSIVA",
    category: "REGULATORY",
    name: "Defensa ante Cobranza Abusiva",
    law_reference: "Ley 19.496 / SERNAC",
    description: "Regulación de llamadas y acoso por deuda.",
    mandato: "Las empresas solo pueden llamar una vez por semana para cobranza. No pueden contactar a terceros ni llamar fuera de horario (Lun-Vie 8-20h, Sáb 9-14h). Si hay acoso, genera una alerta de 'Derecho a la Privacidad'.",
    priority: 2
  }
];


export function getRulesByCategory(category: BusinessRule["category"]): BusinessRule[] {
  return BUSINESS_RULES_REGISTRY.filter(r => r.category === category).sort((a, b) => a.priority - b.priority);
}

export function getAllRulesPrompt(): string {
  return BUSINESS_RULES_REGISTRY
    .sort((a, b) => a.priority - b.priority)
    .map(r => `[${r.id}] ${r.name}: ${r.mandato} (Ref: ${r.law_reference || 'N/A'})`)
    .join("\n");
}
