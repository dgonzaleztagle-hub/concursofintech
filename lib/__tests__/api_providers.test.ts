import { describe, it, expect } from "vitest";

// Simulación de la lógica de decisión del provider en route.ts
const getProviderChoice = (anthropicKey: string, googleKey: string) => {
  if (anthropicKey && anthropicKey !== "sk-ant-xxx") return "Claude 3.5 Sonnet";
  if (googleKey && googleKey !== "AIzaSy-xxx") return "Gemini 1.5 Flash";
  return "Motor de Resiliencia";
};

describe("Multi-Provider API Logic", () => {
  it("debería elegir Claude como primario si la clave es válida", () => {
    const choice = getProviderChoice("sk-ant-api03-valid", "AIzaSy-valid");
    expect(choice).toBe("Claude 3.5 Sonnet");
  });

  it("debería hacer fallback a Gemini si Claude no tiene clave válida", () => {
    const choice = getProviderChoice("sk-ant-xxx", "AIzaSy-valid");
    expect(choice).toBe("Gemini 1.5 Flash");
  });

  it("debería usar el Motor de Resiliencia si no hay claves configuradas", () => {
    const choice = getProviderChoice("", "");
    expect(choice).toBe("Motor de Resiliencia");
  });
});
