/**
 * @file LoadingBeeper.tsx
 * @description Animación de carga con estilo retro LCD.
 */

import React, { useState, useEffect } from "react";

export function LoadingBeeper() {
  const [dots, setDots] = useState("");
  const [step, setStep] = useState(0);

  const steps = [
    "Iniciando Conexión Segura...",
    "Consultando CMF (Comisión Mercado Financiero)...",
    "Sincronizando Valores UF (Banco Central)...",
    "Cruzando Datos con Ley 19.496...",
    "Buscando Seguros Duplicados...",
    "Detectando Ventas Atadas...",
    "Generando Reporte de Ahorro...",
    "Finalizando Auditoría Pro..."
  ];

  useEffect(() => {
    const intervalDots = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    
    const intervalSteps = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 1200);

    return () => {
      clearInterval(intervalDots);
      clearInterval(intervalSteps);
    };
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 animate-in fade-in duration-500">
      <div className="text-center">
        <div className="lcd-text-large tracking-widest blink mb-2">
          AUDITANDO{dots}
        </div>
        <div className="text-[12px] font-black uppercase text-[#1a2f1a] bg-[#1a2f1a] bg-opacity-10 px-3 py-1 rounded-lg min-h-[40px] flex items-center justify-center italic">
          {steps[step]}
        </div>
      </div>
      
      {/* Barra de progreso moderna-retro */}
      <div className="w-full h-3 bg-black bg-opacity-5 rounded-full overflow-hidden border border-[#1a2f1a] border-opacity-20 p-[2px]">
        <div 
          className="h-full bg-[#1a2f1a] rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${((step + 1) / steps.length) * 100}%` }} 
        />
      </div>

      <div className="text-[10px] uppercase font-bold tracking-tighter opacity-40">
        Oriundo Security Protocol Active
      </div>
    </div>
  );
}
