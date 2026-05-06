"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div className="beeper-device">
        {/* Header */}
        <div className="text-center">
          <div className="lcd-text-large tracking-[0.2em]" style={{ color: "var(--lcd-dark)" }}>
            BEEPER
          </div>
          <div className="text-[14px] font-black opacity-60 uppercase tracking-widest">
            Financiero
          </div>
        </div>

        {/* LCD Screen — menú de selección */}
        <div className="lcd-screen">
          <div className="scanline-effect" />
          <div className="lcd-content justify-center gap-5">

            <div className="text-center">
              <div className="lcd-label text-[11px]">SELECCIONA MÓDULO</div>
            </div>

            {/* Botones lado a lado */}
            <div className="flex gap-3 w-full">
              {/* Juego */}
              <Link href="/aprende" className="flex-1 group">
                <div className="flex flex-col items-center gap-2 bg-[#1a2f1a] bg-opacity-10 border-2 border-[#1a2f1a] border-opacity-30 rounded-xl p-4 transition-all group-hover:bg-opacity-20 group-hover:border-opacity-60 group-active:scale-95 text-center h-full">
                  <span className="text-3xl">🎮</span>
                  <div className="text-[12px] font-black uppercase tracking-wide leading-tight" style={{ color: "var(--lcd-dark)" }}>
                    Aprende
                  </div>
                  <div className="text-[9px] font-bold opacity-50 leading-tight" style={{ color: "var(--lcd-dark)" }}>
                    Historia interactiva
                  </div>
                </div>
              </Link>

              {/* Auditor — limpia caché al entrar */}
              <Link
                href="/auditor"
                className="flex-1 group"
                onClick={() => localStorage.removeItem("beeper_last_result")}
              >
                <div className="flex flex-col items-center gap-2 bg-[#1a2f1a] bg-opacity-10 border-2 border-[#1a2f1a] border-opacity-30 rounded-xl p-4 transition-all group-hover:bg-opacity-20 group-hover:border-opacity-60 group-active:scale-95 text-center h-full">
                  <span className="text-3xl">🔍</span>
                  <div className="text-[12px] font-black uppercase tracking-wide leading-tight" style={{ color: "var(--lcd-dark)" }}>
                    Auditar
                  </div>
                  <div className="text-[9px] font-bold opacity-50 leading-tight" style={{ color: "var(--lcd-dark)" }}>
                    Detecta abusos
                  </div>
                </div>
              </Link>
            </div>

            {/* Footer */}
            <div className="text-center mt-auto">
              <div className="text-[9px] font-bold opacity-30 uppercase tracking-widest" style={{ color: "var(--lcd-dark)" }}>
                Inclusión Financiera · Chile 2026
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
