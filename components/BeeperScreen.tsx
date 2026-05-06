/**
 * @file BeeperScreen.tsx
 * @description Contenedor principal que simula el hardware de un beeper de los años 90 con pantalla LCD.
 */

import React from "react";
import Link from "next/link";

interface BeeperScreenProps {
  children: React.ReactNode;
  isPulsing?: boolean;
  onSovereigntyClick?: () => void;
  backHref?: string;
}

export function BeeperScreen({ children, isPulsing = false, onSovereigntyClick, backHref }: BeeperScreenProps) {
  return (
    <div className="beeper-container">
      <div className={`beeper-device ${isPulsing ? "pulse-modern" : ""}`}>
        {/* Marca decorativa superior */}
        <div className="flex justify-between items-center mb-2 px-2">
          {backHref ? (
            <Link href={backHref} className="text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-80 transition-opacity">
              ← INICIO
            </Link>
          ) : (
            <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">
              ORIUNDO BEEPER FINANCIERO
            </span>
          )}
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <button
              onClick={onSovereigntyClick}
              className="ml-2 w-6 h-6 flex items-center justify-center bg-black bg-opacity-10 rounded-full hover:bg-opacity-20 transition-all"
              title="Soberanía de Datos"
            >
              <span className="text-[12px]">🛡️</span>
            </button>
          </div>
        </div>

        {/* Pantalla LCD */}
        <div className="lcd-screen group">
          <div className="scanline-effect" />
          <div className="lcd-content relative z-10">
            {children}
          </div>
          {/* Reflejo de cristal superior */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20" />
        </div>

        {/* Branding inferior suave */}
        <div className="text-center mt-4">
          <div className="text-[12px] text-gray-400 font-medium tracking-widest uppercase italic">
            Beeper Financiero Pro v2.5
          </div>
        </div>
      </div>
    </div>
  );
}
