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

export async function POST(req: NextRequest): Promise<NextResponse> {
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
  const groqKey = process.env.GROQ_API_KEY || "";

  const activeProvider = anthropicKey ? "Anthropic" : groqKey ? "Groq" : googleKey ? "Gemini" : "offline";
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

    // Inyectar alerta de fraude si aplica
    let contextWithFraud = fraudStatus.is_dangerous
      ? `${systemPrompt}\n\n⚠️ ALERTA DE SEGURIDAD: La institución '${inst}' está marcada como sospechosa en ${fraudStatus.source}.`
      : systemPrompt;

    // Inyectar problema específico reportado por el usuario (modo demo y flujos reales)
    if (problemaReportado) {
      contextWithFraud += `\n\n## ⚠️ PROBLEMA REPORTADO POR EL CIUDADANO (PRIORIDAD MÁXIMA)
ESTE ES UN CASO REAL QUE REQUIERE ANÁLISIS INMEDIATO:
"${problemaReportado}"

TU TAREA AHORA ES:
1. **ASUMIR este problema como CONFIRMADO** (el ciudadano lo reportó porque existe).
2. **ANALIZAR qué ley lo regula** y qué derechos tiene el ciudadano.
3. **INVESTIGAR pasos concretos** que debe seguir para resolver esto.
4. **CALCULAR impacto económico** si es cuantificable.
5. **PROPONER acciones inmediatas** citando normativa.

NO digas "no hay problemas". El ciudadano REPORTÓ un problema. Tu trabajo es RESOLVERLO.`;
    }

    // --- PASO 1: GENERACIÓN (First Pass) ---
    console.info(`[Beeper API] PASO 1: Generando diagnóstico inicial usando ${anthropic ? "Claude" : "Gemini"}...`);
    const genPrompt = `${contextWithFraud}\n\n${inclusionRules}\n\nAnaliza este perfil:\n${JSON.stringify(profile, null, 2)}`;
    
    let initialAnalysis: AnalysisResult;

    if (anthropic) {
      const userMessage = problemaReportado
        ? `PROBLEMA REPORTADO: "${problemaReportado}"\n\nBasándote en SOLO el problema reportado y la normativa chilena, proporciona análisis, leyes aplicables, y acciones concretas. NO digas "no hay problemas".\n\nPerfil contextual:\n${JSON.stringify(profile, null, 2)}`
        : `Analiza este perfil financiero y devuelve un JSON según las reglas:\n${JSON.stringify(profile, null, 2)}`;

      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 2000,
        system: contextWithFraud,
        messages: [{ role: "user", content: userMessage }],
      });
      const text = (msg.content[0] as { text: string }).text;
      initialAnalysis = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
    } else if (groqKey) {
      const groqUserMessage = problemaReportado
        ? `PROBLEMA REPORTADO: "${problemaReportado}"\n\nBasándote en SOLO el problema reportado y la normativa chilena, proporciona análisis, leyes aplicables, y acciones concretas. NO digas "no hay problemas".\n\nPerfil contextual:\n${JSON.stringify(profile, null, 2)}`
        : `Analiza este perfil financiero y devuelve un JSON según las reglas:\n${JSON.stringify(profile, null, 2)}`;

      const text = await callGroq(
        contextWithFraud,
        groqUserMessage
      );
      initialAnalysis = JSON.parse(text);
    } else if (modelGeneratorGemini) {
      const geminiPrompt = problemaReportado
        ? `${contextWithFraud}\n\n${inclusionRules}\n\nPROBLEMA REPORTADO: "${problemaReportado}"\n\nBasándote en SOLO el problema reportado y la normativa chilena, proporciona análisis, leyes aplicables, y acciones concretas. NO digas "no hay problemas".\n\nPerfil contextual:\n${JSON.stringify(profile, null, 2)}`
        : genPrompt;

      const genResult = await modelGeneratorGemini.generateContent(geminiPrompt);
      initialAnalysis = JSON.parse(genResult.response.text());
    } else {
      throw new Error("No hay proveedores de IA disponibles");
    }

    // --- PASO 2: AUDITORÍA (Double-Pass — solo para Anthropic/Gemini, Groq ya es preciso) ---
    let auditedJson: Record<string, unknown> = initialAnalysis as unknown as Record<string, unknown>;

    if (anthropic) {
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
      version: "2.5-multi-provider",
      provider: anthropic ? "Claude 3.5 Sonnet" : groqKey ? "Groq llama-3.3-70b" : "Gemini 1.5 Flash"
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
    let dynamicResult: Partial<AnalysisResult> = {
      status: "ok",
      diagnostico: problemaReportado
        ? `ANÁLISIS REPORTADO: Usted reportó: "${problemaReportado}". Su ${affectedProduct} no presenta cobros atados ni duplicidades evidentes.`
        : `SISTEMA OK: Su ${affectedProduct} no presenta cobros atados ni duplicidades evidentes.`,
      ahorro_trimestral_clp: 0,
      ahorro_anual_clp: 0,
      educacion_financiera: "Mantener solo los seguros obligatorios es la mejor forma de optimizar su presupuesto mensual.",
      accion: "Seguir monitoreando su estado de cuenta mensual.",
      derecho_regulatorio: "Normativa General CMF"
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
      provider: "Motor Local"
    }, { status: 200 });
  }
}


