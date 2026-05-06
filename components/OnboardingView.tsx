"use client";

import React, { useState } from "react";
import { formatRut, isValidRut } from "@/lib/utils/rut";

export interface BeeperUserProfile {
  nombre: string;
  rut: string;
  whatsapp: string;
}

export const BEEPER_PROFILE_KEY = "beeper_user_profile";

interface OnboardingViewProps {
  onComplete: (data: BeeperUserProfile) => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");

  const handleRutChange = (v: string) => {
    const fmt = formatRut(v);
    if (fmt.length <= 12) setRut(fmt);
  };

  const handleSubmit = () => {
    if (!nombre.trim()) { setError("Ingresa tu nombre"); return; }
    if (!isValidRut(rut)) { setError("RUT inválido"); return; }
    if (!whatsapp.trim()) { setError("Ingresa tu WhatsApp"); return; }
    setError("");
    const data: BeeperUserProfile = { nombre: nombre.trim(), rut, whatsapp: whatsapp.trim() };
    localStorage.setItem(BEEPER_PROFILE_KEY, JSON.stringify(data));
    onComplete(data);
  };

  return (
    <div className="flex flex-col gap-4 h-full justify-center animate-in fade-in">
      <div className="text-center">
        <div className="lcd-text-large tracking-[0.2em] blink mb-1">BEEPER</div>
        <div className="text-[12px] font-black uppercase opacity-70 leading-tight">
          Configuración Inicial
        </div>
      </div>

      <div className="text-[10px] font-bold opacity-50 text-center uppercase leading-relaxed">
        Solo tú usas este dispositivo.<br />Tu información se guarda solo aquí.
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <div className="lcd-label mb-1">NOMBRE COMPLETO:</div>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Juan Pérez"
            className="modern-input"
            autoComplete="name"
          />
        </div>
        <div>
          <div className="lcd-label mb-1">TU RUT:</div>
          <input
            type="text"
            value={rut}
            onChange={e => handleRutChange(e.target.value)}
            placeholder="12.345.678-9"
            className="modern-input"
            inputMode="numeric"
          />
        </div>
        <div>
          <div className="lcd-label mb-1">WHATSAPP:</div>
          <input
            type="tel"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            placeholder="+56 9 1234 5678"
            className="modern-input"
            inputMode="tel"
          />
        </div>
      </div>

      {error && (
        <div className="text-[10px] font-black text-red-700 text-center uppercase animate-in fade-in">
          ⚠ {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="modern-button w-full mt-2"
      >
        ✓ [ GUARDAR Y CONTINUAR ]
      </button>
    </div>
  );
}
