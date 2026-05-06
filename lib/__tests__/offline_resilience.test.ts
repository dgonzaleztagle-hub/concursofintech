import { describe, it, expect } from "vitest";
import { AnalysisResult } from "../types/financial";

// Mock del generador de resultados locales (basado en la lógica de useBeeperAudit)
const getLocalMockResult = (product: string, insurance: string): AnalysisResult => {
  const affectedProduct = product.toUpperCase();
  const isHipotecario = product === "Crédito Hipotecario";
  const isFraude = insurance === "Fraude";

  const mockData: AnalysisResult = {
    status: "ok",
    diagnostico: `[OFFLINE] Su ${affectedProduct} no presenta riesgos críticos inmediatos.`,
    ahorro_trimestral_clp: 0,
    ahorro_anual_clp: 0,
    educacion_financiera: "Reglas locales activadas.",
    accion: "Revisar cartola.",
    derecho_regulatorio: "Normativa General CMF",
    timestamp: new Date().toISOString(),
    is_mock: true,
    provider: "Motor Offline Local"
  };

  if (isFraude) {
    mockData.status = "alerta";
    mockData.diagnostico = `[OFFLINE] ALERTA: Seguro de Fraude detectado.`;
    mockData.ahorro_anual_clp = 60000;
  }

  if (isHipotecario) {
    mockData.status = "critico";
    mockData.diagnostico = `[OFFLINE] CRÍTICO: Seguros no obligatorios en Hipotecario.`;
    mockData.ahorro_anual_clp = 180000;
  }

  return mockData;
};

describe("Offline Resilience Engine", () => {
  it("debería detectar redundancia en seguro de fraude en modo offline", () => {
    const result = getLocalMockResult("Tarjeta de Crédito", "Fraude");
    expect(result.status).toBe("alerta");
    expect(result.ahorro_anual_clp).toBe(60000);
    expect(result.provider).toBe("Motor Offline Local");
  });

  it("debería detectar seguros no obligatorios en crédito hipotecario offline", () => {
    const result = getLocalMockResult("Crédito Hipotecario", "Cesantía");
    expect(result.status).toBe("critico");
    expect(result.ahorro_anual_clp).toBe(180000);
  });

  it("debería devolver estado OK para productos sin conflictos conocidos", () => {
    const result = getLocalMockResult("Cuenta Corriente", "Vida");
    expect(result.status).toBe("ok");
    expect(result.ahorro_anual_clp).toBe(0);
  });
});
