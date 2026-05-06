import React from "react";
import { AnalysisResult } from "@/lib/types";
import { generateNormalizedLetter } from "@/lib/utils/letters";
import { downloadLetterPDF } from "@/lib/utils/pdf";

interface RenunciationLetterProps {
  result: AnalysisResult;
  onBack: () => void;
}

export function RenunciationLetter({ result, onBack }: RenunciationLetterProps) {
  const letter = generateNormalizedLetter(result, "USUARIO PROTEGIDO");

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden animate-in slide-in-from-bottom-5">
      <div className="border-b-2 border-[#1a2f1a] pb-1">
        <div className="text-[14px] font-black uppercase text-center">CARTA DE RENUNCIA</div>
      </div>
      
      <div className="flex-1 bg-white bg-opacity-20 p-3 rounded-xl overflow-y-auto custom-scrollbar text-[10px] leading-tight font-mono">
        <div className="space-y-4">
          <div className="whitespace-pre-wrap font-bold border-b border-black/10 pb-2 mb-2">
            {letter.header}
          </div>
          <div className="italic leading-relaxed">
            {letter.body}
          </div>
          <div className="whitespace-pre-wrap pt-4 border-t border-black/10 mt-4 text-[9px] opacity-80">
            {letter.footer}
          </div>
        </div>
        <p className="mb-4 italic">Cualquier impedimento será reportado a la CMF y SERNAC.</p>
        <p className="mt-4 text-center">_________________________</p>
        <p className="text-center font-bold">FIRMA DEL TITULAR</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={onBack}
          className="border-2 border-[#1a2f1a] py-2 text-[10px] font-black rounded-xl hover:bg-black hover:text-white transition-all active:scale-95"
        >
          VOLVER
        </button>
        <button 
          onClick={() => downloadLetterPDF(letter, `Reclamo_${result.productos_afectados?.[0] || 'Financiero'}.pdf`)}
          className="bg-red-700 text-white py-2 text-[10px] font-black rounded-xl flex items-center justify-center gap-1 hover:bg-red-800 transition-all shadow-lg active:scale-95"
        >
          <span>📄</span> PDF
        </button>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(letter.fullText);
            alert("Copiado al portapapeles.");
          }}
          className="bg-[#1a2f1a] text-[#d4e8b0] py-2 text-[10px] font-black rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-95"
        >
          COPIAR
        </button>
      </div>
    </div>
  );
}
