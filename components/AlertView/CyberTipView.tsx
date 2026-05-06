import React from "react";
import { CyberTip } from "@/lib/utils/cybersecurity";

interface CyberTipViewProps {
  tip: CyberTip;
  onBack: () => void;
}

export function CyberTipView({ tip, onBack }: CyberTipViewProps) {
  return (
    <div className="flex flex-col h-full gap-4 items-center justify-center text-center animate-in fade-in">
      <div className="lcd-text-large tracking-tighter">SEGURIDAD</div>
      <div className="bg-[#1a2f1a] text-[#d4e8b0] px-3 py-1 text-[12px] font-black uppercase rounded shadow-lg">
        {tip.titulo}
      </div>
      <div className="text-[14px] leading-relaxed px-2 font-medium italic border-l-4 border-[#1a2f1a] py-2 bg-black/5 rounded-r-lg">
        &quot;{tip.consejo}&quot;
      </div>
      <button 
        onClick={onBack}
        className="mt-4 border-2 border-[#1a2f1a] px-8 py-2 font-black rounded-xl hover:bg-[#1a2f1a] hover:text-[#d4e8b0] transition-all active:scale-95 shadow-md"
      >
        [ VOLVER ]
      </button>
    </div>
  );
}
