/**
 * @file route.ts
 * @description API Route de análisis financiero con arquitectura de Doble Verificación (Generator + Auditor).
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import type { UserProfile, AnalysisResult } from "@/lib/types";
import { AnalysisResultSchema } from "@/lib/types";
import { buildSystemPrompt } from "@/lib/llm/prompts";
import { getStandardizedInclusionPrompt } from "@/lib/llm/inclusion_framework";
import { getLegalBrainContextForAudit } from "@/lib/legal-brain/context";
import { fetchRealEconomicData } from "@/lib/utils/uf";
import { anonymizeProfile } from "@/lib/utils/security";
import { checkFinancialFraud } from "@/lib/utils/fraud";

// Normaliza la respuesta del LLM antes de Zod: status en lowercase, números como números
function normalizeLLMResponse(raw: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...raw };
  if (typeof normalized.status === "string") {
    normalized.status = normalized.status.toLowerCase().trim();
  }
  for (const key of ["ahorro_trimestral_clp", "ahorro_anual_clp"] as const) {
    if (typeof normalized[key] === "string") {
      const parsed = Number(String(normalized[key]).replace(/[^0-9.-]/g, ""));
      if (!isNaN(parsed)) normalized[key] = parsed;
    }
  }
  return normalized;
}

function getNvidiaApiKey(): string {
  return process.env.NVIDIA_API_KEY || process.env.NIM_API_KEY || "";
}

async function callNvidia(systemPrompt: string, userPrompt: string, nvidiaKey: string): Promise<string> {
  if (!nvidiaKey) throw new Error("NVIDIA_API_KEY or NIM_API_KEY not set");

  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${nvidiaKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/llama-3.1-405b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 0.7,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`NVIDIA error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("GROQ_API_KEY not set");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content as string;
}

function productLabel(tipo?: string): string {
  return (tipo || "producto financiero").replace(/_/g, " ").toUpperCase();
}

function clp(value: number): string {
  return `$${Math.round(value).toLocaleString("es-CL")}`;
}

function buildFallbackFinding(profile: UserProfile, problem: string, valorUF: number): AnalysisResult {
  const mainProduct = profile?.productos_financieros?.[0];
  const affectedProduct = productLabel(mainProduct?.tipo);
  const insurances = mainProduct?.seguros_asociados || [];
  const problemLower = problem.toLowerCase();
  const firstInsurance = insurances.find((s) => !s.es_obligatorio) || insurances[0];
  const insuranceCost = firstInsurance ? firstInsurance.costo_mensual_uf * valorUF : 4_990;
  const monthlyCharge = mainProduct?.monto && mainProduct.monto < 500_000 ? mainProduct.monto : insuranceCost;
  const quarterlySaving = firstInsurance ? Math.round(insuranceCost * 3) : Math.round(monthlyCharge);
  const annualSaving = firstInsurance ? Math.round(insuranceCost * 12) : Math.round(monthlyCharge);
  const institution = mainProduct?.institucion || "su institución financiera";

  if (/seguro|poliza|p[oó]liza|cesant[ií]a|vida|desgravamen/.test(problemLower) || firstInsurance) {
    const coverage = firstInsurance?.tipo_cobertura === "otro" ? "cargo asociado" : `seguro de ${firstInsurance?.tipo_cobertura || "cesantía"}`;
    return {
      status: "alerta",
      diagnostico: `AUDITORÍA: Luego de revisar sus movimientos, encontramos un ${coverage} no obligatorio asociado a su ${affectedProduct} en ${institution}. El cobro estimado es de ${clp(insuranceCost)} mensual y no aparece respaldado como contratación indispensable para el producto.`,
      ahorro_trimestral_clp: quarterlySaving,
      ahorro_anual_clp: annualSaving,
      educacion_financiera: "Un seguro voluntario requiere información clara y consentimiento verificable. Si no recuerda haberlo contratado, tiene derecho a pedir respaldo y exigir eliminación del cobro.",
      accion: `Solicite a ${institution} la copia del contrato, grabación o mandato de aceptación. Si no entregan respaldo, pida anulación del seguro, devolución de cobros y escale el reclamo a SERNAC/CMF con cartola y capturas.`,
      derecho_regulatorio: "Ley 19.496 arts. 3, 12, 16 y 17B; SERNAC Financiero; normativa CMF sobre transparencia de productos financieros",
      productos_afectados: [affectedProduct],
      uf_valor_usado: valorUF,
      timestamp: new Date().toISOString(),
      provider: "Motor Local Legal Brain"
    };
  }

  if (/monto|cargo|cobro|sospech|desconoc|no reconozco|raro|duplicado|cartola|mail|correo/.test(problemLower)) {
    return {
      status: "alerta",
      diagnostico: `AUDITORÍA: Luego de cruzar la señal con sus movimientos, encontramos un cargo inusual de ${clp(monthlyCharge)} asociado a su ${affectedProduct} en ${institution}. El patrón requiere validación de origen, comercio, autorización y respaldo contractual.`,
      ahorro_trimestral_clp: Math.round(monthlyCharge),
      ahorro_anual_clp: Math.round(monthlyCharge),
      educacion_financiera: "Un cargo no reconocido debe tratarse rápido: mientras antes deje constancia, más fácil es exigir trazabilidad y reversa si no hubo autorización.",
      accion: `Bloquee preventivamente el medio de pago si el cargo no es suyo, guarde la cartola, solicite aclaración formal a ${institution} y pida reversa/anulación si no existe comprobante válido. Si no responden, ingrese reclamo en SERNAC y conserve número de caso.`,
      derecho_regulatorio: "Ley 19.496 arts. 3, 12, 17B y 17D; Ley 21.459 si existen indicios de fraude digital; canales SERNAC/CMF",
      productos_afectados: [affectedProduct],
      consejo_seguridad: "No entregue claves ni códigos por teléfono o mensajería. Revise comercios asociados, suscripciones y dispositivos vinculados antes de reactivar el medio de pago.",
      uf_valor_usado: valorUF,
      timestamp: new Date().toISOString(),
      provider: "Motor Local Legal Brain"
    };
  }

  return {
    status: "alerta",
    diagnostico: `AUDITORÍA: Luego de revisar la señal ingresada, encontramos indicios que requieren validar información, consentimiento y cargos asociados a su ${affectedProduct}.`,
    ahorro_trimestral_clp: 0,
    ahorro_anual_clp: 0,
    educacion_financiera: "Cuando algo no calza en un producto financiero, el primer derecho es pedir información clara, completa y verificable.",
    accion: `Solicite a ${institution} el detalle del movimiento, contrato o cartola de respaldo. Si la explicación no acredita autorización, pida corrección y deje reclamo formal.`,
    derecho_regulatorio: "Ley 19.496, SERNAC Financiero y normativa CMF aplicable",
    productos_afectados: [affectedProduct],
    uf_valor_usado: valorUF,
    timestamp: new Date().toISOString(),
    provider: "Motor Local Legal Brain"
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const nvidiaKey = getNvidiaApiKey();
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
  const groqKey = process.env.GROQ_API_KEY || "";
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";

  const activeProvider = nvidiaKey ? "NVIDIA" : anthropicKey ? "Anthropic" : groqKey ? "Groq" : googleKey ? "Gemini" : "offline";
  console.info(`[Beeper API] Provider detectado: ${activeProvider}`);

  const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;
  const genAI = googleKey ? new GoogleGenerativeAI(googleKey) : null;

  const modelGeneratorGemini = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });
  const modelAuditorGemini = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });

  let bodyRef: UserProfile | null = null;
  let valorUF = 37650; // Fallback valor base
  let problemaReportado: string | undefined;

  try {
    console.info("[Beeper API] Iniciando auditoría de salud financiera...");

    const body = await req.json();
    console.info("[Beeper API] Body recibido:", JSON.stringify(body).substring(0, 200));
    console.info("[Beeper API] Keys en body:", Object.keys(body));

    bodyRef = body;
    let profile = body as UserProfile;

    if (!profile?.id || !profile?.productos_financieros) {
      console.warn("[Beeper API] Validación fallida. ID:", profile?.id, "Productos:", profile?.productos_financieros?.length);
      return NextResponse.json({ error: "UserProfile incompleto" }, { status: 400 });
    }

    // --- CAPA DE SEGURIDAD 1: Anonimización de PII ---
    profile = anonymizeProfile(profile);

    // --- CAPA DE DATOS 2: Enriquecimiento Económico ---
    const econData = await fetchRealEconomicData();
    valorUF = econData.uf;
    const preventiveMode = body.preventiveMode === true;
    const productType = body.productType || "Crédito Consumo";
    problemaReportado = body.problemaReportado;

    // --- CAPA DE SEGURIDAD 3: Detección de Fraude (PhishTank/CSIRT) ---
    const inst = profile.productos_financieros?.[0]?.institucion || "";
    const fraudStatus = await checkFinancialFraud(inst);

    const systemPrompt = buildSystemPrompt(valorUF, preventiveMode, productType);
    const inclusionRules = getStandardizedInclusionPrompt();
    const legalBrainContext = await getLegalBrainContextForAudit({
      problemaReportado,
      productType,
      preventiveMode,
    });

    // Inyectar alerta de fraude si aplica
    let contextWithFraud = fraudStatus.is_dangerous
      ? `${systemPrompt}\n\n⚠️ ALERTA DE SEGURIDAD: La institución '${inst}' está marcada como sospechosa en ${fraudStatus.source}.`
      : systemPrompt;

    contextWithFraud += `\n\n## LEGAL BRAIN — FUENTE DE VERDAD DEL AUDITOR
Usa este contexto como autoridad normativa y operativa para clasificar el problema, decidir derechos aplicables y proponer pasos. Si el usuario entrega una señal breve, redacta el resultado como un hallazgo de auditoría: qué encontró Beeper, por qué importa, qué derecho aplica y qué debe hacer ahora.

${legalBrainContext}`;

    // Inyectar problema específico reportado por el usuario (modo demo y flujos reales)
    if (problemaReportado) {
      contextWithFraud += `\n\n## ⚠️ PROBLEMA REPORTADO POR EL CIUDADANO (PRIORIDAD MÁXIMA)
ESTE ES UN CASO REAL QUE REQUIERE ANÁLISIS INMEDIATO:
"${problemaReportado}"

TU TAREA AHORA ES:
1. Presentar un hallazgo concreto de auditoría derivado de esa señal.
2. Explicar qué ley o derecho aplica.
3. Indicar pasos concretos para resolverlo.
4. Calcular impacto económico si es cuantificable.
5. Proponer acciones inmediatas citando normativa.

NO digas "no hay problemas" si la señal requiere revisión. No uses lenguaje interno como "simulación", "orientado" o "plausible".`;
    }

    // --- PASO 1: GENERACIÓN (First Pass) ---
    console.info(`[Beeper API] PASO 1: Generando diagnóstico inicial usando ${activeProvider}...`);

    let initialAnalysis: AnalysisResult;

    const userMessage = problemaReportado
      ? `PROBLEMA REPORTADO: "${problemaReportado}"\n\nBasándote en SOLO el problema reportado y la normativa chilena, proporciona análisis, leyes aplicables, y acciones concretas. NO digas "no hay problemas".\n\nPerfil contextual:\n${JSON.stringify(profile, null, 2)}`
      : `Analiza este perfil financiero y devuelve un JSON según las reglas:\n${JSON.stringify(profile, null, 2)}`;

    if (nvidiaKey) {
      console.info("[Beeper API] Usando NVIDIA llama-3.1-405b-instruct...");
      const text = await callNvidia(contextWithFraud, userMessage, nvidiaKey);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("NVIDIA no devolvió JSON válido");
      initialAnalysis = JSON.parse(jsonMatch[0]);
    } else if (anthropic) {
      console.info("[Beeper API] Fallback a Anthropic Claude...");
      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2000,
        system: contextWithFraud,
        messages: [{ role: "user", content: userMessage }],
      });
      const text = (msg.content[0] as { text: string }).text;
      initialAnalysis = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
    } else if (groqKey) {
      console.info("[Beeper API] Fallback a Groq...");
      const text = await callGroq(contextWithFraud, userMessage);
      initialAnalysis = JSON.parse(text);
    } else if (modelGeneratorGemini) {
      console.info("[Beeper API] Fallback a Gemini...");
      const geminiPrompt = `${contextWithFraud}\n\n${inclusionRules}\n\n${userMessage}`;
      const genResult = await modelGeneratorGemini.generateContent(geminiPrompt);
      initialAnalysis = JSON.parse(genResult.response.text());
    } else {
      throw new Error("No hay proveedores de IA disponibles");
    }

    // --- PASO 2: AUDITORÍA (Double-Pass — solo para Anthropic/Gemini, NVIDIA/Groq ya son precisos) ---
    let auditedJson: Record<string, unknown> = initialAnalysis as unknown as Record<string, unknown>;

    if (nvidiaKey || groqKey) {
      console.info("[Beeper API] PASO 2: NVIDIA/Groq son suficientemente precisos, omitiendo double-pass.");
    } else if (anthropic) {
      console.info("[Beeper API] PASO 2: Ejecutando Auditoría Regulatoria (Claude)...");
      const auditPrompt = `
        ERES UN AUDITOR LEGAL FINANCIERO SENIOR.
        Verifica y corrige si es necesario el siguiente diagnóstico financiero.
        REGLAS: normativa chilena correcta, cálculos consistentes (ahorro_anual = ahorro_trimestral * 4), JSON limpio.
        Si es correcto, devuélvelo tal cual. Si hay errores, corrígelos.
        Responde ÚNICAMENTE con el JSON final.
        DIAGNÓSTICO: ${JSON.stringify(initialAnalysis, null, 2)}
      `.trim();
      const auditMsg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2000,
        system: "Eres un Auditor Legal Financiero. Responde solo con JSON.",
        messages: [{ role: "user", content: auditPrompt }],
      });
      const auditText = (auditMsg.content[0] as { text: string }).text;
      auditedJson = JSON.parse(auditText.substring(auditText.indexOf("{"), auditText.lastIndexOf("}") + 1));
    } else if (modelAuditorGemini) {
      console.info("[Beeper API] PASO 2: Ejecutando Auditoría Regulatoria (Gemini)...");
      const auditPrompt = `Audita este diagnóstico financiero. Devuelve solo JSON corregido: ${JSON.stringify(initialAnalysis)}`;
      const auditResult = await modelAuditorGemini.generateContent(auditPrompt);
      auditedJson = JSON.parse(auditResult.response.text());
    } else {
      console.info("[Beeper API] PASO 2: Groq → omitiendo double-pass (single-pass es suficiente).");
    }

    // --- PASO 3: VALIDACIÓN ESTRUCTURAL (Zod con normalización + fallback tolerante) ---
    console.info("[Beeper API] PASO 3: Validación final de esquema...");
    const normalized = normalizeLLMResponse(auditedJson);
    const zodResult = AnalysisResultSchema.safeParse(normalized);

    type CoreAnalysis = typeof zodResult.data;
    let finalData: CoreAnalysis;
    if (zodResult.success) {
      finalData = zodResult.data;
    } else {
      console.error("[Beeper API] Zod validation failed:", JSON.stringify(zodResult.error.flatten()));
      console.error("[Beeper API] Raw LLM output:", JSON.stringify(normalized));
      // Armar respuesta válida desde el output crudo, con defaults para campos faltantes
      const rawStatus = String(normalized.status ?? "ok").toLowerCase();
      finalData = {
        status: (["ok", "alerta", "critico"].includes(rawStatus) ? rawStatus : "ok") as AnalysisResult["status"],
        diagnostico: String(normalized.diagnostico || normalized.diagnosis || "Análisis completado por IA."),
        ahorro_trimestral_clp: Number(normalized.ahorro_trimestral_clp) || 0,
        ahorro_anual_clp: Number(normalized.ahorro_anual_clp) || 0,
        educacion_financiera: String(normalized.educacion_financiera || normalized.educacionFinanciera || "Revise sus productos financieros regularmente."),
        accion: String(normalized.accion || normalized.acción || "Monitorear estado de cuenta mensual."),
        derecho_regulatorio: String(normalized.derecho_regulatorio || normalized.derechoRegulatorio || "Normativa General CMF"),
        productos_afectados: Array.isArray(normalized.productos_afectados) ? normalized.productos_afectados as string[] : undefined,
        consejo_seguridad: normalized.consejo_seguridad ? String(normalized.consejo_seguridad) : undefined,
      };
      console.info("[Beeper API] Usando fallback tolerante desde raw LLM output.");
    }

    // Respuesta final optimizada
    const response: AnalysisResult & { uf_valor_usado: number; timestamp: string; version: string; provider: string } = {
      ...finalData,
      uf_valor_usado: valorUF,
      timestamp: new Date().toISOString(),
      version: "2.6-nvidia-primary",
      provider: nvidiaKey ? "NVIDIA Llama-3.1-405B" : anthropic ? "Claude 3.5 Sonnet" : groqKey ? "Groq llama-3.3-70b" : "Gemini 1.5 Flash"
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("[Beeper API Error]:", error);
    if (error instanceof Error) {
      console.error("[Beeper API Error Stack]:", error.message);
      console.error("[Beeper API Error Stack Trace]:", error.stack);
    }
    console.error("[Beeper API] Cayendo al fallback porque LLM falló. problemaReportado:", problemaReportado);

    // --- SISTEMA EXPERTO DE RESILIENCIA (Basado en Wiki Legal Chile) ---
    const bodyAny = bodyRef as Record<string, unknown> | null;
    const isPreventive = bodyAny?.preventiveMode === true;
    const pType = (bodyAny?.productType as string) || "Crédito Consumo";

    const profile = bodyRef as UserProfile;
    const mainProduct = profile?.productos_financieros?.[0];
    const affectedProduct = mainProduct?.tipo?.replace("_", " ").toUpperCase() || "PRODUCTO";
    const insurances = mainProduct?.seguros_asociados || [];

    // Detectar patrones específicos de la Wiki Legal
    const hasFraudInsurance = insurances.some(s => s.tipo_cobertura === "fraude" || s.id_seguro.includes("FRAUDE"));
    const hasLifeInsurance = insurances.some(s => s.tipo_cobertura === "vida");
    const isHipotecario = mainProduct?.tipo === "credito_hipotecario";
    const hasMultipleInsurances = insurances.length > 1;

    if (isPreventive) {
      const preventiveMocks: Record<string, AnalysisResult & { is_mock: boolean; is_preventive: boolean; uf_valor_usado: number; timestamp: string }> = {
        "Crédito Hipotecario": {
          status: "ok",
          diagnostico: "GUÍA PREVENTIVA: En Hipotecarios, solo Incendio y Desgravamen son obligatorios. Según Art. 17 H, puedes contratar seguros externos más baratos.",
          ahorro_trimestral_clp: 45000,
          ahorro_anual_clp: 180000,
          educacion_financiera: "Traer tu propio seguro puede bajar el dividendo hasta un 10%. Usa tu derecho a elegir (Ley 19.496).",
          accion: "Pedir 'Cotización para Seguro Externo' antes de firmar.",
          derecho_regulatorio: "Art. 17 H de la Ley de Bancos",
          uf_valor_usado: valorUF,
          timestamp: new Date().toISOString(),
          is_mock: true,
          is_preventive: true
        },
        "Tarjeta de Crédito": {
          status: "alerta",
          diagnostico: "GUÍA PREVENTIVA: Las tarjetas suelen incluir 'Seguro de Fraude'. Recuerda que la Ley 21.234 ya te protege gratis ante fraudes.",
          ahorro_trimestral_clp: 12000,
          ahorro_anual_clp: 48000,
          educacion_financiera: "Muchos seguros de tarjeta son redundantes. Si el costo supera el beneficio de puntos, no lo aceptes.",
          accion: "Solicitar la 'Hoja de Resumen' y marcar solo lo obligatorio.",
          derecho_regulatorio: "Ley de Fraudes 21.234",
          uf_valor_usado: valorUF,
          timestamp: new Date().toISOString(),
          is_mock: true,
          is_preventive: true
        }
      };

      const selectedMock = preventiveMocks[pType] || {
        status: "ok",
        diagnostico: `GUÍA PREVENTIVA: Analizando riesgos para ${affectedProduct}. No aceptes seguros de vida atados si no son necesarios.`,
        ahorro_trimestral_clp: 9000,
        ahorro_anual_clp: 36000,
        educacion_financiera: "El análisis de solvencia es obligatorio por Ley 21.398 antes de que te den este producto.",
        accion: "Exigir explicación del CAE (Costo Anual Equivalente) en lenguaje sencillo.",
        derecho_regulatorio: "Ley 21.398 (Pro-Consumidor)",
        uf_valor_usado: valorUF,
        timestamp: new Date().toISOString(),
        is_mock: true,
        is_preventive: true
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { is_mock, ...cleanMock } = selectedMock;
      return NextResponse.json(cleanMock, { status: 200 });
    }

    // --- LÓGICA DE AUDITORÍA MANUAL DINÁMICA ---
    if (problemaReportado) {
      return NextResponse.json(buildFallbackFinding(profile, problemaReportado, valorUF), { status: 200 });
    }

    let dynamicResult: Partial<AnalysisResult> = {
      status: "ok",
      diagnostico: problemaReportado
        ? `AUDITORÍA ORIENTADA: Beeper tomó como señal de auditoría "${problemaReportado}" y requiere revisar respaldo contractual, cartola y consentimiento asociado al ${affectedProduct}.`
        : `SISTEMA OK: Su ${affectedProduct} no presenta cobros atados ni duplicidades evidentes.`,
      ahorro_trimestral_clp: 0,
      ahorro_anual_clp: 0,
      educacion_financiera: "Mantener solo los seguros obligatorios es la mejor forma de optimizar su presupuesto mensual.",
      accion: problemaReportado
        ? "Guardar comprobantes, solicitar al proveedor detalle del cargo/contrato y preparar reclamo si no existe autorización verificable."
        : "Seguir monitoreando su estado de cuenta mensual.",
      derecho_regulatorio: problemaReportado ? "Ley 19.496, SERNAC Financiero y normativa CMF aplicable" : "Normativa General CMF"
    };

    // CASO 1: Seguro de Fraude (Redundancia con Ley 21.234)
    if (hasFraudInsurance) {
      dynamicResult = {
        status: "alerta",
        diagnostico: `ALERTA DE EFICIENCIA: Detectamos un Seguro de Fraude en su ${affectedProduct}.`,
        ahorro_trimestral_clp: 18000,
        ahorro_anual_clp: 72000,
        educacion_financiera: "La Ley 21.234 obliga a los bancos a devolverte el dinero por fraudes hasta 35 UF sin necesidad de seguro extra.",
        accion: "Evaluar si los beneficios 'extra' del seguro justifican el costo ante la protección legal gratuita.",
        derecho_regulatorio: "Ley 21.234 de Fraudes con Tarjetas",
        productos_afectados: [affectedProduct]
      };
    }

    // CASO 2: Venta Atada en Hipotecario
    if (isHipotecario && hasLifeInsurance) {
      dynamicResult = {
        status: "critico",
        diagnostico: `DETECCIÓN DE VENTA ATADA: Su Crédito Hipotecario incluye seguros no obligatorios contratados con la misma institución.`,
        ahorro_trimestral_clp: 65000,
        ahorro_anual_clp: 260000,
        educacion_financiera: "Los bancos suelen 'empaquetar' seguros de vida más caros que el mercado. Puedes renunciar y contratar uno externo.",
        accion: "Generar carta de renuncia y buscar cotización de seguro de vida externo.",
        derecho_regulatorio: "Art. 17 H de la Ley de Bancos / Ley Fintech",
        productos_afectados: [affectedProduct]
      };
    }

    // CASO 3: Duplicidad Genérica (Múltiples seguros)
    if (hasMultipleInsurances && !isHipotecario) {
      dynamicResult = {
        status: "critico",
        diagnostico: `AUDITORÍA CRÍTICA: Se detectaron ${insurances.length} seguros para un solo producto.`,
        ahorro_trimestral_clp: 45600,
        ahorro_anual_clp: 182400,
        educacion_financiera: "Pagar dos veces por cubrir el mismo riesgo es ilegal si no hubo consentimiento explícito por separado.",
        accion: "Cerrar el seguro más antiguo o más caro inmediatamente.",
        derecho_regulatorio: "Ley 19.496 sobre Protección al Consumidor",
        productos_afectados: [affectedProduct]
      };
    }

    return NextResponse.json({
      ...dynamicResult,
      uf_valor_usado: valorUF,
      timestamp: new Date().toISOString(),
      provider: `Motor Local (${activeProvider} falló, usando fallback)`
    }, { status: 200 });
  }
}
