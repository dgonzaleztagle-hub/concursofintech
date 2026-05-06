import { describe, it, expect } from "vitest";
import { getStandardizedInclusionPrompt } from "../llm/inclusion_framework";
import { BUSINESS_RULES_REGISTRY } from "../rules/registry";

describe("Framework de Inclusión Financiera", () => {
  it("Debe contener las reglas críticas de Factor Abuelo y Micro-Retail", () => {
    const ids = BUSINESS_RULES_REGISTRY.map(r => r.id);
    expect(ids).toContain("RULE_FACTOR_ABUELO");
    expect(ids).toContain("RULE_MICRO_RETAIL");
  });

  it("Debe generar un prompt que incluya el mandato de accesibilidad cognitiva", () => {
    const prompt = getStandardizedInclusionPrompt();
    expect(prompt).toContain("Factor Abuelo");
    expect(prompt).toContain("Accesibilidad Cognitiva");
  });

  it("Debe priorizar las reglas correctamente", () => {
    const inclusionRules = BUSINESS_RULES_REGISTRY.filter(r => r.category === "INCLUSION");
    const sorted = [...inclusionRules].sort((a, b) => a.priority - b.priority);
    expect(sorted[0].priority).toBe(1); // Alta prioridad para Factor Abuelo
  });
});

