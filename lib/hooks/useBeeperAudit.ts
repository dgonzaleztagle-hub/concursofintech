/**
 * @file useBeeperAudit.ts
 * @description Custom hook para manejar la lógica de auditoría del Beeper Financiero.
 */

import { useState, useEffect, useCallback } from "react";
import { UserProfile, AnalysisResult, ProductoFinanciero, SeguroAsociado } from "../types/financial";
import { formatRut, isValidRut } from "../utils/rut";
import { saveSecurely, loadSecurely } from "../utils/security";
import { BEEPER_PROFILE_KEY } from "@/components/OnboardingView";
import type { BeeperUserProfile } from "@/components/OnboardingView";

export type AppState = "idle" | "connecting" | "scanning" | "result" | "error" | "sovereignty" | "preventive" | "demo_select";

export const DEMO_SCENARIOS: Array<{
  id: string;
  icon: string;
  label: string;
  detail: string;
  buildProfile: (base: UserProfile) => UserProfile;
  problemaReportado: string;
}> = [
  {
    id: "seguro_no_reconocido",
    icon: "🔍",
    label: "Tengo un seguro que no reconozco",
    detail: "Aparece un cobro mensual por seguro que no recuerdo haber contratado",
    problemaReportado: "El cliente reporta un cobro mensual por seguro que no recuerda haber autorizado. Revisar si existe consentimiento informado.",
    buildProfile: (base) => ({
      ...base,
      fuente_datos: "manual" as const,
      productos_financieros: [{
        id_producto: "TC-DEMO-001",
        tipo: "tarjeta_credito" as const,
        institucion: "Banco Falabella",
        monto: 1_200_000,
        seguros_asociados: [{
          id_seguro: "SEG-MISTERIO",
          tipo_cobertura: "cesantia" as const,
          es_obligatorio: false,
          costo_mensual_uf: 0.18,
          institucion_aseguradora: "Cardif Chile",
        }]
      }]
    }),
  },
  {
    id: "cobro_duplicado",
    icon: "⚠️",
    label: "Hay un cobro duplicado en mi estado de cuenta",
    detail: "El mismo seguro aparece cobrado dos veces en distintas fechas del mes",
    problemaReportado: "El cliente detectó dos cobros por el mismo concepto de seguro en el mismo mes. Posible duplicidad o doble contratación sin consentimiento.",
    buildProfile: (base) => ({
      ...base,
      fuente_datos: "manual" as const,
      productos_financieros: [{
        id_producto: "TC-DEMO-002",
        tipo: "tarjeta_credito" as const,
        institucion: "Banco BCI",
        monto: 800_000,
        seguros_asociados: [
          {
            id_seguro: "SEG-CESANTIA-A",
            tipo_cobertura: "cesantia" as const,
            es_obligatorio: false,
            costo_mensual_uf: 0.14,
            institucion_aseguradora: "Seguros BCI",
          },
          {
            id_seguro: "SEG-CESANTIA-B",
            tipo_cobertura: "cesantia" as const,
            es_obligatorio: false,
            costo_mensual_uf: 0.14,
            institucion_aseguradora: "Seguros BCI",
          }
        ]
      }]
    }),
  },
  {
    id: "hipotecario_seguros",
    icon: "🏠",
    label: "Me incluyeron seguros en mi crédito hipotecario",
    detail: "Al firmar el hipotecario me incluyeron seguros que no pedí explícitamente",
    problemaReportado: "Cliente firmó crédito hipotecario con seguros adicionales (vida, desgravamen, incendio) contratados en el banco sin cotizar alternativas. Posible venta atada.",
    buildProfile: (base) => ({
      ...base,
      fuente_datos: "manual" as const,
      productos_financieros: [{
        id_producto: "HIP-DEMO-001",
        tipo: "credito_hipotecario" as const,
        institucion: "Banco Santander",
        monto: 92_000_000,
        tasa_anual: 4.8,
        plazo_meses: 240,
        seguros_asociados: [
          {
            id_seguro: "SEG-DESGRAVAMEN",
            tipo_cobertura: "desgravamen" as const,
            es_obligatorio: true,
            costo_mensual_uf: 0.22,
            institucion_aseguradora: "Seguros Santander",
          },
          {
            id_seguro: "SEG-INCENDIO",
            tipo_cobertura: "incendio" as const,
            es_obligatorio: true,
            costo_mensual_uf: 0.18,
            institucion_aseguradora: "Seguros Santander",
          },
          {
            id_seguro: "SEG-VIDA-ATADO",
            tipo_cobertura: "vida" as const,
            es_obligatorio: false,
            costo_mensual_uf: 0.35,
            institucion_aseguradora: "Seguros Santander",
          }
        ]
      }]
    }),
  },
  {
    id: "no_se_obligatorio",
    icon: "📋",
    label: "No sé cuáles de mis seguros son obligatorios",
    detail: "Tengo varios seguros y no sé cuáles puedo cancelar sin problemas",
    problemaReportado: "Cliente no tiene claridad sobre qué seguros son legalmente obligatorios y cuáles son opcionales. Solicita orientación para optimizar sus gastos financieros.",
    buildProfile: (base) => ({
      ...base,
      fuente_datos: "manual" as const,
      productos_financieros: [{
        id_producto: "CC-DEMO-001",
        tipo: "credito_consumo" as const,
        institucion: "Banco Estado",
        monto: 6_500_000,
        tasa_anual: 21.5,
        plazo_meses: 36,
        seguros_asociados: [
          {
            id_seguro: "SEG-VIDA-CC",
            tipo_cobertura: "vida" as const,
            es_obligatorio: false,
            costo_mensual_uf: 0.12,
            institucion_aseguradora: "Seguros Estado",
          },
          {
            id_seguro: "SEG-CESANTIA-CC",
            tipo_cobertura: "cesantia" as const,
            es_obligatorio: false,
            costo_mensual_uf: 0.10,
            institucion_aseguradora: "Seguros Estado",
          }
        ]
      }]
    }),
  },
];

function buildBaseProfile(userProfile: BeeperUserProfile | null): UserProfile {
  return {
    id: userProfile?.rut || "USR-001",
    nombre: userProfile?.nombre || "Usuario Beeper",
    rut: userProfile?.rut,
    productos_financieros: [
      {
        id_producto: "PROD-001",
        tipo: "credito_consumo",
        institucion: "Banco Estado",
        monto: 5_000_000,
        tasa_anual: 18.5,
        plazo_meses: 48,
        seguros_asociados: [
          {
            id_seguro: "SEG-001",
            tipo_cobertura: "cesantia",
            es_obligatorio: false,
            costo_mensual_uf: 0.15,
            institucion_aseguradora: "Seguros Estado",
          },
        ],
      },
      {
        id_producto: "PROD-002",
        tipo: "tarjeta_credito",
        institucion: "Banco Santander",
        monto: 800_000,
        seguros_asociados: [
          {
            id_seguro: "SEG-002",
            tipo_cobertura: "cesantia",
            es_obligatorio: false,
            costo_mensual_uf: 0.12,
            institucion_aseguradora: "RSA Seguros",
          },
        ],
      },
    ],
    fecha_consulta: new Date().toISOString(),
    fuente_datos: "api",
  };
}

function buildAuditProfileFromProblem(userProfile: BeeperUserProfile | null, problemInput: string): UserProfile {
  const baseProfile = buildBaseProfile(userProfile);
  const problem = problemInput.toLowerCase();
  const isInsurance = /seguro|poliza|p[oó]liza|cesant[ií]a|vida|desgravamen/.test(problem);
  const isMortgage = /hipotec|dividendo|vivienda/.test(problem);
  const isStatement = /cartola|mail|correo|estado de cuenta|comprobante/.test(problem);
  const isSuspiciousCharge = /monto|cargo|cobro|sospech|desconoc|no reconozco|raro|duplicado/.test(problem);
  const isFraud = /fraude|estafa|phishing|hack|clonad|robo/.test(problem);

  if (isMortgage) {
    return {
      ...baseProfile,
      fuente_datos: "manual",
      productos_financieros: [{
        id_producto: "AUDIT-HIPOTECARIO-001",
        tipo: "credito_hipotecario",
        institucion: "Banco Santander",
        monto: 92_000_000,
        tasa_anual: 4.8,
        plazo_meses: 240,
        seguros_asociados: [
          {
            id_seguro: "SEG-DESGRAVAMEN-OBLIGATORIO",
            tipo_cobertura: "desgravamen",
            es_obligatorio: true,
            costo_mensual_uf: 0.22,
            institucion_aseguradora: "Seguros Santander",
          },
          {
            id_seguro: "SEG-VIDA-ADICIONAL",
            tipo_cobertura: "vida",
            es_obligatorio: false,
            costo_mensual_uf: 0.35,
            institucion_aseguradora: "Seguros Santander",
          },
        ],
      }],
    };
  }

  if (isInsurance) {
    return {
      ...baseProfile,
      fuente_datos: "manual",
      productos_financieros: [{
        id_producto: "AUDIT-TC-SEGURO-001",
        tipo: "tarjeta_credito",
        institucion: "Banco BCI",
        monto: 1_200_000,
        seguros_asociados: [{
          id_seguro: isFraud ? "SEG-FRAUDE-NO-RECONOCIDO" : "SEG-CESANTIA-NO-RECONOCIDO",
          tipo_cobertura: isFraud ? "fraude" : "cesantia",
          es_obligatorio: false,
          costo_mensual_uf: 0.18,
          institucion_aseguradora: "Cardif Chile",
        }],
      }],
    };
  }

  if (isStatement || isSuspiciousCharge || isFraud) {
    return {
      ...baseProfile,
      fuente_datos: "manual",
      productos_financieros: [{
        id_producto: "AUDIT-TC-CARGO-001",
        tipo: "tarjeta_credito",
        institucion: "Banco Estado",
        monto: 89_990,
        seguros_asociados: [{
          id_seguro: isFraud ? "SEG-FRAUDE-WALLET" : "SEG-CARGO-SOSPECHOSO",
          tipo_cobertura: isFraud ? "fraude" : "otro",
          es_obligatorio: false,
          costo_mensual_uf: 0.12,
          institucion_aseguradora: "Proveedor asociado",
        }],
      }],
    };
  }

  return baseProfile;
}

export function useBeeperAudit() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [rut, setRut] = useState<string>("");
  const [mode, setMode] = useState<"auto" | "manual" | "preventive">("auto");
  const [manualProduct, setManualProduct] = useState<string>("Tarjeta de Crédito");
  const [manualInsurance, setManualInsurance] = useState<string>("Cesantía");
  const [showWalletAlert, setShowWalletAlert] = useState(false);
  const [userProfile, setUserProfile] = useState<BeeperUserProfile | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string>(DEMO_SCENARIOS[0].id);
  const [customProblem, setCustomProblem] = useState<string>("");
  const [consents, setConsents] = useState({
    audit: true,
    portability: true,
    transparency: true
  });

  // Cargar perfil guardado y caché de auditoría
  useEffect(() => {
    const storedProfile = localStorage.getItem(BEEPER_PROFILE_KEY);
    if (storedProfile) {
      try {
        const parsed: BeeperUserProfile = JSON.parse(storedProfile);
        setUserProfile(parsed);
        setRut(parsed.rut); // Pre-llena el RUT
      } catch { /* json inválido */ }
    }

    const savedData = loadSecurely("beeper_last_result");
    if (savedData) {
      setResult(savedData as AnalysisResult);
      setState("result");
    }
  }, []);

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value);
    if (formatted.length <= 12) setRut(formatted);
  };

  const runLocalMock = useCallback(() => {
    // Motor de Resiliencia Local — fallback sin conexión
    const affectedProduct = manualProduct.toUpperCase();
    const isHipotecario = manualProduct === "Crédito Hipotecario";
    const isFraude = manualInsurance === "Fraude";

    let mockData: AnalysisResult = {
      status: "ok",
      diagnostico: `Su ${affectedProduct} no presenta riesgos críticos inmediatos detectados localmente.`,
      ahorro_trimestral_clp: 0,
      ahorro_anual_clp: 0,
      educacion_financiera: "El Beeper protege sus derechos usando reglas locales basadas en la normativa vigente.",
      accion: "Revisar su estado de cuenta mensual buscando cobros duplicados.",
      derecho_regulatorio: "Normativa General CMF",
      uf_valor_usado: 37650,
      timestamp: new Date().toISOString(),
      provider: "Motor Local"
    };

    if (isFraude) {
      mockData = {
        ...mockData,
        status: "alerta",
        diagnostico: `ALERTA: Detectamos un posible Seguro de Fraude en su ${affectedProduct}.`,
        ahorro_trimestral_clp: 15000,
        ahorro_anual_clp: 60000,
        educacion_financiera: "La Ley 21.234 ya le protege ante fraudes de forma gratuita. Este seguro podría ser redundante.",
        accion: "Verificar si el banco le cobró por este seguro sin su consentimiento.",
        derecho_regulatorio: "Ley 21.234 (Fraudes)"
      };
    }

    if (isHipotecario) {
      mockData = {
        ...mockData,
        status: "critico",
        diagnostico: `CRÍTICO: En Hipotecarios, solo Incendio y Desgravamen son obligatorios.`,
        ahorro_trimestral_clp: 45000,
        ahorro_anual_clp: 180000,
        educacion_financiera: "Usted tiene derecho a elegir su propia aseguradora (Art. 17 H Ley de Bancos).",
        accion: "Exigir la póliza individual de sus seguros.",
        derecho_regulatorio: "Art. 17 H Ley de Bancos"
      };
    }

    setTimeout(() => {
      setResult(mockData);
      saveSecurely("beeper_last_result", mockData);
      setState("result");
    }, 1500);
  }, [manualProduct, manualInsurance]);

  const handleDemoConfirm = useCallback(async () => {
    const problem = customProblem.trim();
    const profile = buildAuditProfileFromProblem(userProfile, problem);

    setState("scanning");
    setErrorMsg("");
    setShowWalletAlert(false);
    const walletTimer = window.setTimeout(() => setShowWalletAlert(true), 700);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          ...profile,
          problemaReportado: problem,
          demoMode: true,
        }),
      });

      clearTimeout(timeoutId);
      clearTimeout(walletTimer);
      setShowWalletAlert(false);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Error de Servidor`);
      }

      const data = await response.json();
      setResult(data);
      saveSecurely("beeper_last_result", data);
      setState("result");
    } catch (err) {
      clearTimeout(timeoutId);
      clearTimeout(walletTimer);
      setShowWalletAlert(false);
      const isNetworkError = err instanceof TypeError || (err instanceof Error && err.name === "AbortError");
      if (isNetworkError) {
        runLocalMock();
      } else {
        setErrorMsg(err instanceof Error ? err.message : "ERR: SEÑAL PERDIDA");
        setState("error");
      }
    }
  }, [customProblem, userProfile, runLocalMock]);

  const handleScan = useCallback(async () => {
    if (mode === "auto" && !isValidRut(rut)) {
      alert("Por favor, ingresa un RUT válido");
      return;
    }

    // En modo auto, mostrar selector demo antes de escanear
    if (mode === "auto") {
      setState("demo_select");
      return;
    }

    setState("scanning");
    setErrorMsg("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const baseProfile = buildBaseProfile(userProfile);
      let profileToSend = baseProfile;

      if (mode === "manual" || mode === "preventive") {
        const productTypeMap: Record<string, string> = {
          "Tarjeta de Crédito": "tarjeta_credito",
          "Crédito Consumo": "credito_consumo",
          "Crédito Hipotecario": "credito_hipotecario",
          "Cuenta Corriente": "cuenta_corriente",
        };

        profileToSend = {
          ...baseProfile,
          id: mode === "preventive" ? "PREVENTIVE-MODE" : (userProfile?.rut || "USR-001"),
          fuente_datos: "manual",
          productos_financieros: [
            {
              id_producto: "MANUAL-001",
              tipo: (productTypeMap[manualProduct] || "tarjeta_credito") as ProductoFinanciero["tipo"],
              institucion: "Banco Genérico",
              monto: manualProduct === "Crédito Hipotecario" ? 80_000_000 : 500_000,
              seguros_asociados: [
                {
                  id_seguro: "SEG-MANUAL",
                  tipo_cobertura: (manualInsurance.toLowerCase() === "fraude" ? "otro" : manualInsurance.toLowerCase()) as SeguroAsociado["tipo_cobertura"],
                  es_obligatorio: false,
                  costo_mensual_uf: 0.15,
                  institucion_aseguradora: "Aseguradora X",
                }
              ],
            },
          ],
        };

        if (manualInsurance === "Fraude") {
          profileToSend.productos_financieros[0].monto = 25_000_000;
        }
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          ...profileToSend,
          preventiveMode: mode === "preventive",
          productType: manualProduct
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Error de Servidor`);
      }

      const data = await response.json();
      setResult(data);
      saveSecurely("beeper_last_result", data);
      setState("result");
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("[useBeeperAudit] Error:", err);

      const isNetworkError = err instanceof TypeError || (err instanceof Error && err.name === "AbortError");

      if (isNetworkError) {
        console.warn("[useBeeperAudit] Sin conexión — Motor de Resiliencia Local activado.");
        runLocalMock();
      } else {
        setErrorMsg(err instanceof Error ? err.message : "ERR: SEÑAL PERDIDA");
        setState("error");
      }
    }
  }, [mode, rut, manualProduct, manualInsurance, runLocalMock, userProfile]);

  const reset = () => {
    localStorage.removeItem("beeper_last_result");
    setState("idle");
    setResult(null);
    setErrorMsg("");
    setRut(userProfile?.rut || ""); // Mantiene el RUT del perfil
    console.log("[Security] Resultado de auditoría eliminado.");
  };

  const startConnecting = () => {
    setState("connecting");
    setErrorMsg("");
  };

  const completeConnection = () => {
    setState("scanning");
    setMode("auto");
    handleScan();
  };

  const handleWalletAlertClick = () => {
    setShowWalletAlert(false);
    startConnecting();
  };

  return {
    state,
    result,
    errorMsg,
    rut,
    mode,
    manualProduct,
    manualInsurance,
    showWalletAlert,
    userProfile,
    selectedDemoId,
    setSelectedDemoId,
    customProblem,
    setCustomProblem,
    setMode,
    setManualProduct,
    setManualInsurance,
    setShowWalletAlert,
    handleRutChange,
    handleScan,
    handleDemoConfirm,
    startConnecting,
    completeConnection,
    reset,
    handleWalletAlertClick,
    consents,
    setConsents,
    toggleSovereignty: () => setState(prev => prev === "sovereignty" ? "idle" : "sovereignty"),
    togglePreventive: () => setMode("preventive"),
    exportData: () => {
      const nombre = userProfile?.nombre || "Usuario Beeper";
      const rutMasked = userProfile?.rut?.replace(/\d(?=\d{4})/g, "*") || "***";
      const data = {
        document_type: "PASAPORTE_FINANCIERO_CIUDADANO",
        version: "2.5",
        legal_basis: "Ley 19.628 (Protección de Datos) / Ley 19.496 (Derechos del Consumidor)",
        issued_by: "Oriundo Beeper Division",
        issued_at: new Date().toISOString(),
        subject: {
          name: nombre,
          rut_masked: rutMasked,
        },
        audit_results: result ? {
          diagnostico: result.diagnostico,
          ahorro_estimado_anual: result.ahorro_anual_clp,
          status: result.status,
          productos: result.productos_afectados
        } : "No se encontraron auditorías recientes",
        consent_log: consents,
        hash_verificacion: Math.random().toString(36).substring(2, 15)
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pasaporte_financiero_${nombre.replace(/ /g, "_")}.json`;
      a.click();
    }
  };
}
