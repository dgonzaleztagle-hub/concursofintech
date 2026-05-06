/**
 * @file letters.test.ts
 * @description Pruebas para la normalización de cartas legales.
 */

import { describe, it, expect } from "vitest";
import { generateNormalizedLetter } from "../utils/letters";
import { AnalysisResult } from "../types";

describe("Normalización de Cartas Legales", () => {
  const mockResult: AnalysisResult = {
    diagnostico: "Seguro de cesantía duplicado",
    derecho_regulatorio: "Ley 19.496",
    accion: "Renunciar",
    ahorro_trimestral_clp: 30000,
    ahorro_anual_clp: 120000,
    educacion_financiera: "Ahorra dinero",
    status: "critico",
    productos_afectados: ["TARJETA DE CREDITO VISA"],
    uf_valor_usado: 37500.42,
    timestamp: new Date().toISOString()
  };

  it("Debe generar una carta con el asunto correcto para Tarjetas", () => {
    const letter = generateNormalizedLetter(mockResult);
    expect(letter.header).toContain("RECLAMO POR DUPLICIDAD");
  });

  it("Debe incluir el nombre del producto en el cuerpo de la carta", () => {
    const letter = generateNormalizedLetter(mockResult);
    expect(letter.body).toContain("TARJETA DE CREDITO VISA");
  });

  it("Debe incluir la advertencia legal de CMF/SERNAC en el footer", () => {
    const letter = generateNormalizedLetter(mockResult);
    expect(letter.footer).toContain("Comisión para el Mercado Financiero");
    expect(letter.footer).toContain("SERNAC");
  });

  it("Debe manejar casos donde no hay productos afectados especificados", () => {
    const emptyResult = { ...mockResult, productos_afectados: undefined };
    const letter = generateNormalizedLetter(emptyResult);
    expect(letter.body).toContain("Producto No Especificado");
  });
});
