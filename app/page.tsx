"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { OnboardingView, BEEPER_PROFILE_KEY } from "@/components/OnboardingView";
import type { BeeperUserProfile } from "@/components/OnboardingView";

export default function Home() {
  const [profile, setProfile] = useState<BeeperUserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(BEEPER_PROFILE_KEY);
    if (stored) {
      try { setProfile(JSON.parse(stored)); } catch { /* json inválido */ }
    }
    setLoaded(true);
  }, []);

  const handleReset = () => {
    localStorage.removeItem(BEEPER_PROFILE_KEY);
    localStorage.removeItem("beeper_last_result");
    setProfile(null);
  };

  // Evita hydration mismatch (localStorage solo existe en cliente)
  if (!loaded) return null;

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

        {/* LCD Screen */}
        <div className="lcd-screen">
          <div className="scanline-effect" />
          <div className="lcd-content justify-center gap-5">

            {!profile ? (
              <OnboardingView onComplete={setProfile} />
            ) : (
              <>
                <div className="text-center">
                  <div className="lcd-label text-[11px]">BIENVENIDO/A</div>
                  <div className="text-[14px] font-black uppercase" style={{ color: "var(--lcd-dark)" }}>
                    {profile.nombre.split(" ")[0]}
                  </div>
                </div>

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

                {/* Footer + Reset */}
                <div className="text-center mt-auto">
                  <div className="text-[9px] font-bold opacity-30 uppercase tracking-widest" style={{ color: "var(--lcd-dark)" }}>
                    Inclusión Financiera · Chile 2026
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-2 text-[8px] font-bold opacity-20 hover:opacity-70 transition-opacity uppercase tracking-widest"
                    style={{ color: "var(--lcd-dark)" }}
                  >
                    ↩ CAMBIAR PERFIL
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
