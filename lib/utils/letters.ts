/**
 * @file letters.ts
 * @description Utilidad para la normalización y generación de cartas legales de renuncia y reclamo.
 */

import { AnalysisResult } from "../types";

export interface LetterTemplate {
  header: string;
  body: string;
  footer: string;
  fullText: string;
}

/**
 * Normaliza y genera una carta legal basada en el resultado del análisis.
 */
export function generateNormalizedLetter(result: AnalysisResult, userName: string = "Titular del Producto"): LetterTemplate {
  const fecha = new Date().toLocaleDateString("es-CL", { day: 'numeric', month: 'long', year: 'numeric' });
  const ciudad = "Santiago"; // Podría ser dinámico si tuviéramos la data

  const isCard = result.productos_afectados?.[0]?.toLowerCase().includes("tarjeta");
  const isLoan = result.productos_afectados?.[0]?.toLowerCase().includes("consumo");
  const isMortgage = result.productos_afectados?.[0]?.toLowerCase().includes("hipotecario");

  let asunto = "RENUNCIA VOLUNTARIA A SEGUROS Y RECLAMO POR VENTA ATADA";
  let cuerpo = "";
  const productoStr = result.productos_afectados?.[0] || "Producto No Especificado";

  if (isCard) {
    asunto = "RECLAMO POR DUPLICIDAD DE SEGUROS EN TARJETA DE CRÉDITO";
    cuerpo = `Por la presente, denuncio formalmente la existencia de cobros por seguros redundantes asociados a mi tarjeta [${productoStr}]. 
    He detectado una duplicidad de coberturas de cesantía/fraude, lo cual contraviene las buenas prácticas de transparencia exigidas por la CMF. 
    Solicito la cancelación inmediata de la póliza excedente y la devolución de las primas cobradas en exceso de acuerdo con la Ley 19.496.`;
  } else if (isLoan) {
    asunto = "SOLICITUD DE DESVINCULACIÓN DE SEGUROS VOLUNTARIOS EN CRÉDITO DE CONSUMO";
    cuerpo = `De mi consideración, vengo en solicitar la desvinculación inmediata del seguro de vida/cesantía asociado a mi crédito [${productoStr}], dado su carácter estrictamente VOLUNTARIO. 
    Hago valer mi derecho a la libertad de contratación consagrado en la normativa vigente, rechazando cualquier condicionamiento de mi tasa de interés o 'venta atada' por parte de su institución.`;
  } else if (isMortgage) {
    asunto = "NOTIFICACIÓN DE REEMPLAZO DE POLIZA EXTERNA - CRÉDITO HIPOTECARIO";
    cuerpo = `Informo mi decisión de reemplazar la póliza de desgravamen/incendio vigente en mi crédito [${productoStr}] por una contratada de forma externa. 
    Adjunto el certificado de cobertura correspondiente y solicito se proceda al cambio de beneficiario sin cargos adicionales ni dilaciones, según lo estipulado por la CMF para el mercado hipotecario.`;
  } else {
    cuerpo = `Mediante esta misiva, solicito la baja inmediata de los servicios/seguros detectados como ineficientes en mi auditoría personal para el producto [${productoStr}]: ${result.diagnostico}. 
    Exijo que se detenga cualquier cobro relacionado de forma inmediata y se me entregue un comprobante de la gestión.`;
  }


  const header = `
${ciudad}, ${fecha}

A: Servicio de Atención al Cliente
DE: ${userName}
REF: ${asunto}
  `.trim();

  const footer = `
Sin otro particular, espero una resolución favorable en un plazo máximo de 10 días hábiles. 
Hago presente que, de persistir los cobros o de no mediar respuesta, elevaré este reclamo a la Comisión para el Mercado Financiero (CMF) y al SERNAC.

Atentamente,

_________________________
${userName}
RUT: [Ingresar RUT]
  `.trim();

  return {
    header,
    body: cuerpo.trim(),
    footer,
    fullText: `${header}\n\n${cuerpo.trim()}\n\n${footer}`
  };
}
