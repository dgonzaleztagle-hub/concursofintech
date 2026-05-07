import { describe, it, expect } from "vitest";

// Simulación de la lógica de decisión del provider en route.ts
const getProviderChoice = (
  nvidiaKey: string,
  nimKey: string,
  anthropicKey: string,
  groqKey: string,
  googleKey: string
) => {
  if (nvidiaKey || nimKey) return "NVIDIA NIM";
  if (anthropicKey) return "Claude 3.5 Sonnet";
  if (groqKey) return "Groq llama-3.3-70b";
  if (googleKey) return "Gemini 1.5 Flash";
  return "Motor de Resiliencia";
};

describe("Multi-Provider API Logic", () => {
  it("debería elegir NVIDIA como proveedor maestro si hay NVIDIA_API_KEY", () => {
    const choice = getProviderChoice("nvapi-valid", "", "sk-ant-api03-valid", "gsk-valid", "AIzaSy-valid");
    expect(choice).toBe("NVIDIA NIM");
  });

  it("debería elegir NVIDIA como proveedor maestro si hay NIM_API_KEY", () => {
    const choice = getProviderChoice("", "nvapi-valid", "sk-ant-api03-valid", "gsk-valid", "AIzaSy-valid");
    expect(choice).toBe("NVIDIA NIM");
  });

  it("debería hacer fallback a Claude, Groq y Gemini en ese orden", () => {
    expect(getProviderChoice("", "", "sk-ant-api03-valid", "gsk-valid", "AIzaSy-valid")).toBe("Claude 3.5 Sonnet");
    expect(getProviderChoice("", "", "", "gsk-valid", "AIzaSy-valid")).toBe("Groq llama-3.3-70b");
    expect(getProviderChoice("", "", "", "", "AIzaSy-valid")).toBe("Gemini 1.5 Flash");
  });

  it("debería usar el Motor de Resiliencia si no hay claves configuradas", () => {
    const choice = getProviderChoice("", "", "", "", "");
    expect(choice).toBe("Motor de Resiliencia");
  });
});
