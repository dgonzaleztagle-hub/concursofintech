import React from "react";

interface AhorroStatsProps {
  ahorroTrimestral: number;
  ahorroAnual: number;
}

export function AhorroStats({ ahorroTrimestral, ahorroAnual }: AhorroStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-[#1a2f1a] p-2 rounded-lg">
        <div className="text-[9px] text-[#d4e8b0] uppercase font-bold text-center opacity-70">AHORRO 3M</div>
        <div className="text-[18px] text-[#d4e8b0] font-black text-center">
          ${ahorroTrimestral.toLocaleString("es-CL")}
        </div>
      </div>
      <div className="bg-[#1a2f1a] p-2 rounded-lg">
        <div className="text-[9px] text-[#d4e8b0] uppercase font-bold text-center opacity-70">AHORRO ANUAL</div>
        <div className="text-[18px] text-[#d4e8b0] font-black text-center">
          ${ahorroAnual.toLocaleString("es-CL")}
        </div>
      </div>
    </div>
  );
}
