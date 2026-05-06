/**
 * @file WalletPassPreview.tsx
 * @description Simulación visual de un pase de Google Wallet para la demo en PC.
 */

import React from "react";

interface WalletPassPreviewProps {
  userName: string;
  savings: string;
  status: "Protegido" | "En Riesgo" | "Alerta";
  onClose: () => void;
}

export function WalletPassPreview({ userName, savings, status, onClose }: WalletPassPreviewProps) {
  const statusColors = {
    "Protegido": "bg-green-600",
    "En Riesgo": "bg-red-600",
    "Alerta": "bg-yellow-600"
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-[320px] bg-[#1a1a1a] rounded-[24px] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
        
        {/* Header del Pase */}
        <div className={`${statusColors[status]} p-6 flex justify-between items-start`}>
          <div>
            <div className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Sentinel Pass</div>
            <div className="text-white text-[20px] font-black uppercase tracking-tighter">ORIUNDO</div>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
             <span className="text-[18px]">🛡️</span>
          </div>
        </div>

        {/* Contenido del Pase */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <div>
              <div className="text-white/40 text-[9px] font-bold uppercase">TITULAR</div>
              <div className="text-white text-[14px] font-bold uppercase">{userName}</div>
            </div>
            <div className="text-right">
              <div className="text-white/40 text-[9px] font-bold uppercase">ESTADO</div>
              <div className={`font-black text-[14px] uppercase ${status === "Protegido" ? "text-green-400" : "text-yellow-400"}`}>
                {status}
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
            <div className="text-white/40 text-[9px] font-bold uppercase mb-1">AHORRO ANUAL ESTIMADO</div>
            <div className="text-white text-[32px] font-black tracking-tighter">
              {savings}
            </div>
          </div>

          {/* QR Code Simulado */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="bg-white p-3 rounded-xl">
               {/* Un QR simplificado con CSS */}
               <div className="w-24 h-24 grid grid-cols-4 grid-rows-4 gap-1">
                  {Array.from({length: 16}).map((_, i) => (
                    <div key={i} className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-gray-200'} rounded-[1px]`}></div>
                  ))}
               </div>
            </div>
            <div className="text-white/30 text-[8px] font-mono uppercase tracking-[0.2em]">BEEPER-ID-PASS-2026</div>
          </div>
        </div>

        {/* Botón Cerrar */}
        <button 
          onClick={onClose}
          className="w-full bg-white/10 py-4 text-white/60 text-[11px] font-black uppercase hover:bg-white/20 transition-all border-t border-white/5"
        >
          CERRAR VISTA PREVIA
        </button>
      </div>
    </div>
  );
}
