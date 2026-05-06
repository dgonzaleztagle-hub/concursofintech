/**
 * @file BankConnectionView.tsx
 * @description Interfaz simulada de conexión bancaria (Open Banking) para la demo.
 */

import React, { useState, useEffect } from "react";

interface BankConnectionViewProps {
  onConnected: () => void;
  onCancel: () => void;
}

const BANKS = [
  { id: "estado", name: "Banco Estado", color: "#f37021", logo: "🏦" },
  { id: "santander", name: "Santander", color: "#ec0000", logo: "🔴" },
  { id: "chile", name: "Banco de Chile", color: "#003b71", logo: "🔵" },
  { id: "bci", name: "BCI", color: "#a5cd39", logo: "🟢" },
];

export function BankConnectionView({ onConnected, onCancel }: BankConnectionViewProps) {
  const [step, setStep] = useState<"select" | "auth" | "sync">("select");
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step === "auth") {
      const timer = setTimeout(() => setStep("sync"), 2000);
      return () => clearTimeout(timer);
    }
    if (step === "sync") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(onConnected, 1000);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step, onConnected]);

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-md rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header de Seguridad */}
      <div className="bg-[#1a2f1a] p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-black tracking-widest uppercase">
            Protocolo de Conexión
          </span>
          <span className="bg-green-500 text-[8px] px-1.5 py-0.5 rounded-full text-black font-bold animate-pulse">
            AES-256
          </span>
        </div>
        <button onClick={onCancel} className="text-white/60 hover:text-white text-xs font-black uppercase">
          Salir
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {step === "select" && (
          <>
            <h2 className="text-xl font-black text-[#1a2f1a] mb-2 leading-tight uppercase">
              Vincular Institución
            </h2>
            <p className="text-[10px] text-gray-500 font-bold mb-6 uppercase tracking-wider">
              Seleccione su banco para sincronizar productos financieros
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {BANKS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => {
                    setSelectedBank(bank);
                    setStep("auth");
                  }}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-[#1a2f1a] transition-all hover:bg-white active:scale-95 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{bank.logo}</span>
                  <span className="text-[10px] font-black text-gray-700 uppercase">{bank.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-auto bg-gray-100 p-3 rounded-lg flex items-start gap-3">
              <span className="text-lg">🛡️</span>
              <p className="text-[8px] text-gray-500 font-bold uppercase leading-relaxed">
                Al continuar, autorizas a Beeper Financiero Pro (Oriundo S.A.) a solicitar una llave de lectura de tus cartolas bancarias. Tus credenciales nunca son guardadas.
              </p>
            </div>
          </>
        )}

        {step === "auth" && selectedBank && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4 animate-bounce">
              {selectedBank.logo}
            </div>
            <h3 className="text-lg font-black text-[#1a2f1a] mb-1 uppercase">Autenticando</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase">
              Conectando con el portal de {selectedBank.name}...
            </p>
          </div>
        )}

        {step === "sync" && selectedBank && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-[200px] mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-[#1a2f1a] uppercase tracking-widest">
                  Sincronizando
                </span>
                <span className="text-[12px] font-black text-[#1a2f1a]">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#1a2f1a] transition-all duration-100" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className={`text-[8px] font-bold uppercase transition-opacity ${progress > 20 ? 'opacity-100' : 'opacity-0'}`}>
                ✓ Verificando Identidad...
              </div>
              <div className={`text-[8px] font-bold uppercase transition-opacity ${progress > 50 ? 'opacity-100' : 'opacity-0'}`}>
                ✓ Leyendo Seguros de Cesantía...
              </div>
              <div className={`text-[8px] font-bold uppercase transition-opacity ${progress > 80 ? 'opacity-100' : 'opacity-0'}`}>
                ✓ Analizando Ley 19.496...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Industrial */}
      <div className="bg-gray-100 p-2 border-t border-gray-200 text-center">
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Powered by Oriundo Open Banking Engine
        </span>
      </div>
    </div>
  );
}
