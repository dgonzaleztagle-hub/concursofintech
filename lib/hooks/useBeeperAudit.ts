/**
 * @file useBeeperAudit.ts
 * @description Custom hook para manejar la lógica de auditoría del Beeper Financiero.
 */

import { useState, useEffect, useCallback } from "react";
import { UserProfile, AnalysisResult, ProductoFinanciero, SeguroAsociado } from "../types/financial";
import { formatRut, isValidRut } from "../utils/rut";
import { saveSecurely, loadSecurely } from "../utils/security";

export type AppState = "idle" | "connecting" | "scanning" | "result" | "error" | "sovereignty" | "preventive";

// Datos Mock base para la demo
const DEMO_PROFILE: UserProfile = {
  id: "USR-001",
  nombre: "María González Fuentes",
  rut: "12.345.678-9",
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

export function useBeeperAudit() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [rut, setRut] = useState<string>("");
  const [mode, setMode] = useState<"auto" | "manual" | "preventive">("auto");
  const [manualProduct, setManualProduct] = useState<string>("Tarjeta de Crédito");
  const [manualInsurance, setManualInsurance] = useState<string>("Cesantía");
  const [showWalletAlert, setShowWalletAlert] = useState(false);
  const [consents, setConsents] = useState({
    audit: true,
    portability: true,
    transparency: true
  });

  // Cargar caché cifrada
  useEffect(() => {
    const savedData = loadSecurely("beeper_last_result");
    if (savedData) {
      setResult(savedData);
      setState("result");
    }
  }, []);

  // Simulación de Wallet
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state === "idle") setShowWalletAlert(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [state]);

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value);
    if (formatted.length <= 12) setRut(formatted);
  };

  const runLocalMock = useCallback(() => {
    // Motor de Resiliencia Local (Copia la lógica del servidor para offline)
    const affectedProduct = manualProduct.toUpperCase();
    const isHipotecario = manualProduct === "Crédito Hipotecario";
    const isFraude = manualInsurance === "Fraude";

    let mockData: AnalysisResult = {
      status: "ok",
      diagnostico: `[OFFLINE] Su ${affectedProduct} no presenta riesgos críticos inmediatos.`,
      ahorro_trimestral_clp: 0,
      ahorro_anual_clp: 0,
      educacion_financiera: "Incluso sin conexión, el Beeper protege sus derechos usando las reglas de la Wiki Legal.",
      accion: "Revisar su estado de cuenta mensual buscando cobros duplicados.",
      derecho_regulatorio: "Normativa General CMF",
      timestamp: new Date().toISOString(),
      is_mock: true,
      provider: "Motor Offline Local"
    };

    if (isFraude) {
      mockData = {
        ...mockData,
        status: "alerta",
        diagnostico: `[OFFLINE] ALERTA: Detectamos un posible Seguro de Fraude en su ${affectedProduct}.`,
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
        diagnostico: `[OFFLINE] CRÍTICO: En Hipotecarios, solo Incendio y Desgravamen son obligatorios.`,
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
    }, 1500); // Pequeño delay para feedback visual
  }, [manualProduct, manualInsurance]);

  const handleScan = useCallback(async () => {
    if (mode === "auto" && !isValidRut(rut)) {
      alert("Por favor, ingresa un RUT válido");
      return;
    }

    setState("scanning");
    setErrorMsg("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      let profileToSend = DEMO_PROFILE;

      if (mode === "manual" || mode === "preventive") {
        const productTypeMap: Record<string, string> = {
          "Tarjeta de Crédito": "tarjeta_credito",
          "Crédito Consumo": "credito_consumo",
          "Crédito Hipotecario": "credito_hipotecario",
          "Cuenta Corriente": "cuenta_corriente",
        };

        profileToSend = {
          ...DEMO_PROFILE,
          id: mode === "preventive" ? "PREVENTIVE-MODE" : "USR-001",
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
      
      // Si es un error de red o timeout, usamos el Motor de Resiliencia Offline
      const isNetworkError = err instanceof TypeError || (err instanceof Error && err.name === "AbortError");
      
      if (isNetworkError) {
        console.warn("[useBeeperAudit] Iniciando Motor de Resiliencia Offline...");
        runLocalMock();
      } else {
        setErrorMsg(err instanceof Error ? err.message : "ERR: SEÑAL PERDIDA");
        setState("error");
      }
    }
  }, [mode, rut, manualProduct, manualInsurance, runLocalMock]);

  const reset = () => {
    // Borrado Seguro de Huella Digital
    localStorage.removeItem("beeper_last_result");
    localStorage.clear(); // Limpia cualquier otro residuo de la sesión
    
    setState("idle");
    setResult(null);
    setErrorMsg("");
    setRut("");
    
    // Feedback visual opcional
    console.log("[Security] Huella Digital eliminada por el usuario.");
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
    setMode,
    setManualProduct,
    setManualInsurance,
    setShowWalletAlert,
    handleRutChange,
    handleScan,
    startConnecting,
    completeConnection,
    reset,
    handleWalletAlertClick,
    consents,
    setConsents,
    toggleSovereignty: () => setState(prev => prev === "sovereignty" ? "idle" : "sovereignty"),
    togglePreventive: () => setMode("preventive"),
    exportData: () => {
      const data = {
        document_type: "PASAPORTE_FINANCIERO_CIUDADANO",
        version: "2.5",
        legal_basis: "Ley 19.628 (Protección de Datos) / Ley 19.496 (Derechos del Consumidor)",
        issued_by: "Oriundo Beeper Division",
        issued_at: new Date().toISOString(),
        subject: {
          name: DEMO_PROFILE.nombre,
          rut_masked: DEMO_PROFILE.rut?.replace(/\d(?=\d{4})/g, "*"),
        },
        audit_results: result ? {
          diagnostico: result.diagnostico,
          ahorro_estimado_anual: result.ahorro_anual_clp,
          status: result.status,
          productos: result.productos_afectados
        } : "No se encontraron auditorías recientes",
        consent_log: consents,
        hash_verificacion: Math.random().toString(36).substring(2, 15) // Simulación de firma digital
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pasaporte_financiero_${DEMO_PROFILE.nombre.replace(/ /g, "_")}.json`;
      a.click();
    }
  };
}
