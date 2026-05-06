import React from "react";
import { AnalysisResult } from "@/lib/types";

interface VoiceReporterProps {
  result: AnalysisResult;
}

export function VoiceReporter({ result }: VoiceReporterProps) {
  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `${result.diagnostico}. Tip de educación: ${result.educacion_financiera}. Acción recomendada: ${result.accion}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-CL";
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Tu navegador no soporta lectura de voz.");
    }
  };

  return (
    <button 
      onClick={handleSpeak}
      title="Escuchar Reporte"
      className="bg-[#1a2f1a] text-[#d4e8b0] px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg active:scale-95"
    >
      <span className="text-[18px]">🔊</span>
      <span className="text-[10px] font-bold uppercase">Oír Reporte</span>
    </button>
  );
}
