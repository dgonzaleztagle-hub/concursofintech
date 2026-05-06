import { getRulesByCategory } from "../rules/registry";

/**
 * Genera el set de reglas estandarizadas para el prompt del LLM enfocadas en inclusión.
 */
export function getStandardizedInclusionPrompt(): string {
  const inclusionRules = getRulesByCategory("INCLUSION");
  
  const rulesText = inclusionRules
    .map(r => `[${r.name}]: ${r.mandato}`)
    .join("\n");

  return `
## CORE BUSINESS RULES: INCLUSIÓN FINANCIERA (MCP STANDARD)
Eres un auditor que prioriza la inclusión financiera. Debes seguir estas reglas estandarizadas obligatoriamente:
${rulesText}
  `.trim();
}

