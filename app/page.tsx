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
          <div className="lcd-content justify-center gap-6">

            <div className="text-center">
              <div className="lcd-label text-[11px]">SELECCIONA MÓDULO</div>
            </div>

            {/* Opción 1: Juego educativo */}
            <Link href="/aprende" className="block w-full group">
              <div className="bg-[#1a2f1a] bg-opacity-10 border-2 border-[#1a2f1a] border-opacity-30 rounded-xl p-4 transition-all group-hover:bg-opacity-20 group-hover:border-opacity-60 group-active:scale-95">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <div className="text-[13px] font-black uppercase tracking-wide" style={{ color: "var(--lcd-dark)" }}>
                      Aprende Finanzas
                    </div>
                    <div className="text-[10px] font-bold opacity-60" style={{ color: "var(--lcd-dark)" }}>
                      Decisiones reales · Historia interactiva
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Divisor */}
            <div className="text-center">
              <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">— o —</span>
            </div>

            {/* Opción 2: Auditor Beeper */}
            <Link href="/auditor" className="block w-full group">
              <div className="bg-[#1a2f1a] bg-opacity-10 border-2 border-[#1a2f1a] border-opacity-30 rounded-xl p-4 transition-all group-hover:bg-opacity-20 group-hover:border-opacity-60 group-active:scale-95">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <div className="text-[13px] font-black uppercase tracking-wide" style={{ color: "var(--lcd-dark)" }}>
                      Audita tus Finanzas
                    </div>
                    <div className="text-[10px] font-bold opacity-60" style={{ color: "var(--lcd-dark)" }}>
                      Detecta abusos · Protege tu plata
                    </div>
                  </div>
                </div>
              </div>
            </Link>

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
