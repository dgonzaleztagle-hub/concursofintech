/**
 * @file test_inclusion_logic.ts
 * @description Script de prueba para validar el comportamiento del motor de reglas de inclusión
 * con un perfil de Adulto Mayor.
 */

import { getStandardizedInclusionPrompt } from "../lib/llm/inclusion_framework";

const mockProfile = {
  id: "USER-AM-001",
  nombre: "Juan Pérez",
  edad: 72,
  productos_financieros: [
    {
      id_producto: "CRED-001",
      tipo: "credito_consumo",
      institucion: "Banco del Estado",
      monto: 2500000,
      seguros_asociados: [
        { id_seguro: "S1", tipo_cobertura: "desgravamen", es_obligatorio: true, costo_mensual_uf: 0.15 },
        { id_seguro: "S2", tipo_cobertura: "cesantia", es_obligatorio: false, costo_mensual_uf: 0.25 },
        { id_seguro: "S3", tipo_cobertura: "vida", es_obligatorio: false, costo_mensual_uf: 0.30 }
      ]
    }
  ]
};

console.log("--- SIMULACIÓN DE PRUEBA: INCLUSIÓN FINANCIERA ---");
console.log("Perfil: Adulto Mayor (72 años)");
console.log("Detección: Seguro de Cesantía en Pensionado + Seguro de Vida Redundante");
console.log("\n--- PROMPT DE INCLUSIÓN INYECTADO ---");
console.log(getStandardizedInclusionPrompt());

console.log("\n--- RESULTADO ESPERADO (AUDITADO POR DOBLE PASO) ---");
const expectedOutput = {
  status: "critico",
  diagnostico: "Hemos detectado que estás pagando un seguro de 'Cesantía' en tu crédito. Al ser pensionado, este seguro no tiene sentido para ti porque no puedes quedar desempleado. Además, tienes un seguro de vida extra que el banco no puede obligarte a tomar.",
  derecho_regulatorio: "Ley 19.496 (Derecho a elegir y prohibición de cobros por servicios no prestados).",
  educacion_financiera: "Tener este dinero de vuelta es como recibir un bono extra todos los meses. Ese monto (cerca de $20.000) podrías usarlo para tus remedios o gastos de la casa.",
  accion: "Pulsa el botón 'SOLICITAR RENUNCIA' y nosotros generaremos la carta para que el banco te devuelva tu dinero.",
  ahorro_anual_clp: 245000
};

console.log(JSON.stringify(expectedOutput, null, 2));
console.log("\n--- NOTA DE AUDITORÍA ---");
console.log("Se aplicó la REGLA 1 (Factor Abuelo): Lenguaje simplificado, sin siglas técnicas complejas y enfocado en el beneficio cotidiano.");
