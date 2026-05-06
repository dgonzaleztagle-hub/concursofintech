/**
 * @file GoogleWalletButton.tsx
 * @description Botón optimizado para sincronización real con la API de Google Wallet.
 */

import React, { useState } from "react";

interface GoogleWalletButtonProps {
  userName: string;
  savings: string;
  status: "Protegido" | "En Riesgo" | "Alerta";
  onSave: () => void;
}

export function GoogleWalletButton({ userName, savings, status, onSave }: GoogleWalletButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    
    try {
      const response = await fetch("/api/wallet/pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, savings, status }),
      });

      if (!response.ok) throw new Error("Error en la sincronización");

      const data = await response.json();
      console.log("[Wallet] Pase generado con éxito:", data.objectId);
      
      // Si tenemos una URL real, redirigimos
      if (data.saveUrl && !data.isMock) {
        window.open(data.saveUrl, "_blank");
      }
      
      onSave();

    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con Google Wallet");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`w-full relative overflow-hidden bg-black text-white py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${
          isSyncing ? "opacity-80 cursor-wait" : "hover:bg-gray-900"
        }`}
      >
        {isSyncing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
              Firmando JWT Google...
            </span>
          </div>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 5H5C3.89 5 3.01 5.89 3.01 7L3 17C3 18.11 3.89 19 5 19H19C20.11 19 21 18.11 21 17V7C21 5.89 20.11 5 19 5ZM19 17H5V13H19V17ZM19 11H5V7H19V11Z" fill="white"/>
              <circle cx="17" cy="9" r="1.5" fill="#4285F4"/>
              <circle cx="17" cy="15" r="1.5" fill="#34A853"/>
            </svg>
            <span className="text-[11px] font-black uppercase tracking-tight">Add to Google Wallet</span>
          </>
        )}
        
        {/* Shimmer Effect */}
        {!isSyncing && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:animate-[shimmer_2s_infinite]"></div>
        )}
      </button>
      
      {error && (
        <span className="text-[9px] text-red-500 font-bold text-center uppercase tracking-tighter">
          {error}
        </span>
      )}
    </div>
  );
}
