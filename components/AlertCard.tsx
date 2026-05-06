/**
 * @file AlertCard.tsx
 * @description Renderiza el resultado del análisis financiero en la pantalla LCD. Refactorizado para modularidad.
 */

import React, { useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import { getCyberTip, CyberTip } from "@/lib/utils/cybersecurity";
import { GoogleWalletButton } from "./GoogleWalletButton";
import { WalletPassPreview } from "./WalletPassPreview";

// Sub-componentes modularizados
import { AhorroStats } from "./AlertView/AhorroStats";
import { VoiceReporter } from "./AlertView/VoiceReporter";
import { RenunciationLetter } from "./AlertView/RenunciationLetter";
import { CyberTipView } from "./AlertView/CyberTipView";

interface AlertCardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function AlertCard({ result, onReset }: AlertCardProps) {
  const [activeView, setActiveView] = useState<"main" | "cyber" | "letter">("main");
  const [showPass, setShowPass] = useState(false);
  const [currentTip, setCurrentTip] = useState<CyberTip | null>(null);

  const getStatusText = (status: string) => {
    switch (status) {
      case "critico": return "!!! CRITICO !!!";
      case "alerta": return "!! ALERTA !!";
      default: return "SISTEMA OK";
    }
  };

  const handleCyberQuery = () => {
    let tip: CyberTip;
    if (result.consejo_seguridad) {
      tip = { titulo: "CONSEJO PROTECTIVO", consejo: result.consejo_seguridad };
    } else {
      tip = getCyberTip(result.productos_afectados?.[0]?.includes("TARJETA") ? "tarjeta_credito" : "default");
    }
    setCurrentTip(tip);
    setActiveView("cyber");
  };

  // Renderizado condicional de vistas secundarias
  if (activeView === "cyber" && currentTip) {
    return <CyberTipView tip={currentTip} onBack={() => setActiveView("main")} />;
  }

  if (activeView === "letter") {
    return <RenunciationLetter result={result} onBack={() => setActiveView("main")} />;
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar animate-in fade-in">
      {/* Header */}
      <div className="border-b-2 border-[#1a2f1a] pb-3 flex justify-between items-center">
        <div className="text-[20px] font-black tracking-widest uppercase">
          {getStatusText(result.status)}
        </div>
        <VoiceReporter result={result} />
      </div>

      {/* Info de Proveedor */}
      <div className="flex justify-between items-center bg-[#1a2f1a]/5 px-2 py-1 rounded border border-[#1a2f1a]/10">
        <div className="text-[8px] font-black text-[#1a2f1a]/60 uppercase tracking-tighter">
          PROCESADO POR:
        </div>
        <div className="text-[8px] font-black text-[#1a2f1a] uppercase">
          {result.provider || "Motor Estándar"}
        </div>
      </div>

      {/* Estadísticas de Ahorro */}
      <AhorroStats 
        ahorroTrimestral={result.ahorro_trimestral_clp} 
        ahorroAnual={result.ahorro_anual_clp} 
      />

      {/* Diagnóstico */}
      <div className="mt-2">
        <div className="lcd-label mb-1">DETECCIÓN DEL SISTEMA:</div>
        <div className="text-[14px] leading-snug font-bold border-l-4 border-[#1a2f1a] pl-3 py-1">
          {result.diagnostico}
        </div>
      </div>

      {/* Educación Financiera */}
      <div className="mt-2 bg-[#1a2f1a] bg-opacity-10 p-3 rounded-xl border border-black/5">
        <div className="lcd-label !text-[#1a2f1a] mb-1">CONSEJO PARA TI:</div>
        <div className="text-[12px] leading-relaxed font-medium">
          {result.educacion_financiera}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="mt-auto flex flex-col gap-2 pt-4">
        <GoogleWalletButton 
          userName="USUARIO PROTEGIDO"
          savings={`$${result.ahorro_anual_clp.toLocaleString("es-CL")}`}
          status={result.status === "ok" ? "Protegido" : result.status === "alerta" ? "Alerta" : "En Riesgo"}
          onSave={() => setShowPass(true)} 
        />
        
        <button 
          onClick={handleCyberQuery}
          className="w-full border-2 border-[#1a2f1a] text-[11px] py-2.5 px-2 rounded-xl uppercase font-black hover:bg-[#1a2f1a] hover:text-[#d4e8b0] transition-all shadow-sm active:scale-95"
        >
          🛡️ CONSEJO DE SEGURIDAD
        </button>

        <div className="flex gap-2">
          <button 
            onClick={onReset}
            className="flex-1 border-2 border-[#1a2f1a] text-[11px] py-2.5 rounded-xl uppercase font-black hover:bg-[#1a2f1a] hover:text-[#d4e8b0] transition-all active:scale-95"
          >
            NUEVO
          </button>
          <button 
            onClick={() => setActiveView("letter")}
            className="flex-[2] bg-[#1a2f1a] text-[#d4e8b0] text-[11px] py-2.5 rounded-xl uppercase font-black hover:opacity-90 transition-opacity shadow-lg active:scale-95"
          >
            SOLICITAR RENUNCIA
          </button>
        </div>
      </div>

      {showPass && (
        <WalletPassPreview 
          userName="USUARIO PROTEGIDO"
          savings={`$${result.ahorro_anual_clp.toLocaleString("es-CL")}`}
          status={result.status === "ok" ? "Protegido" : result.status === "alerta" ? "Alerta" : "En Riesgo"}
          onClose={() => setShowPass(false)}
        />
      )}
    </div>
  );
}
