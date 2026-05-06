/**
 * Beeper Financiero — Auditor (adultos / tercera edad)
 * Movido desde app/page.tsx para liberar la raíz como landing.
 */

"use client";

import React from "react";
import { BeeperScreen } from "@/components/BeeperScreen";
import { AlertCard } from "@/components/AlertCard";
import { LoadingBeeper } from "@/components/LoadingBeeper";
import { SovereigntyView } from "@/components/SovereigntyView";
import { BankConnectionView } from "@/components/BankConnectionView";
import { useBeeperAudit } from "@/lib/hooks/useBeeperAudit";

export default function AuditorPage() {
  const {
    state,
    result,
    errorMsg,
    rut,
    mode,
    manualProduct,
    manualInsurance,
    showWalletAlert,
    setMode,
    setManualProduct,
    setManualInsurance,
    setShowWalletAlert,
    handleRutChange,
    handleScan,
    startConnecting,
    completeConnection,
    reset,
    handleWalletAlertClick,
    consents,
    setConsents,
    toggleSovereignty,
    exportData
  } = useBeeperAudit();

  return (
    <main className="min-h-screen overflow-hidden relative">
      {/* Simulación de Notificación Push de Billetera */}
      {showWalletAlert && (
        <div
          onClick={handleWalletAlertClick}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[320px] bg-white text-black p-4 rounded-2xl shadow-2xl border-l-8 border-green-500 cursor-pointer animate-in slide-in-from-top-10 duration-500 hover:scale-105 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">💳</div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Billetera Virtual — Alerta Beeper</div>
              <div className="text-[14px] font-bold leading-tight">Detectamos un nuevo cobro de &quot;Seguro Cesantía&quot; en tu Tarjeta.</div>
              <div className="text-[12px] text-green-600 font-bold mt-1">Pulsa para auditar ahora.</div>
            </div>
          </div>
        </div>
      )}

      {/* Botón Secreto para Demo */}
      <button
        onClick={() => setShowWalletAlert(true)}
        className="fixed bottom-4 right-4 opacity-10 hover:opacity-100 text-[10px] text-white bg-gray-800 px-2 py-1 rounded"
      >
        [ SIMULAR EVENTO BILLETERA ]
      </button>

      <BeeperScreen
        isPulsing={state === "result" && result?.status !== "ok"}
        onSovereigntyClick={toggleSovereignty}
        backHref="/"
      >
        {state === "idle" && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-center mb-4">
              <div className="lcd-text-large tracking-[0.2em] blink mb-1">
                BEEPER
              </div>
              <div className="text-[16px] font-black opacity-80">
                FINANCIERO PRO
              </div>
            </div>

            <div className="flex bg-black bg-opacity-5 p-1 rounded-xl w-full gap-1">
              <button
                onClick={() => setMode("auto")}
                className={`flex-1 text-[10px] py-2 rounded-lg font-bold transition-all ${mode === "auto" ? "bg-[#1a2f1a] text-[#d4e8b0] shadow-md" : "text-[#1a2f1a] opacity-50 hover:opacity-100"}`}
              >
                AUTO
              </button>
              <button
                onClick={() => setMode("manual")}
                className={`flex-1 text-[10px] py-2 rounded-lg font-bold transition-all ${mode === "manual" ? "bg-[#1a2f1a] text-[#d4e8b0] shadow-md" : "text-[#1a2f1a] opacity-50 hover:opacity-100"}`}
              >
                MANUAL
              </button>
              <button
                onClick={() => setMode("preventive")}
                className={`flex-1 text-[10px] py-2 rounded-lg font-bold transition-all ${mode === "preventive" ? "bg-[#1a2f1a] text-[#d4e8b0] shadow-md" : "text-[#1a2f1a] opacity-50 hover:opacity-100"}`}
              >
                PREVENTIVO
              </button>
            </div>

            {mode === "auto" ? (
              <div className="w-full px-2 flex flex-col gap-6 mt-4">
                <div className="text-[12px] text-center font-bold opacity-70 uppercase leading-relaxed">
                  Escaneo inteligente de<br />abusos financieros
                </div>
                <div>
                  <div className="lcd-label mb-2">INGRESA TU RUT:</div>
                  <input
                    type="text"
                    value={rut}
                    onChange={(e) => handleRutChange(e.target.value)}
                    placeholder="12.345.678-9"
                    className="modern-input"
                  />
                </div>
                <div className="text-center py-2">
                  <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">— O TAMBIÉN —</span>
                </div>
                <button
                  onClick={startConnecting}
                  className="w-full bg-[#1a2f1a] text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group"
                >
                  <span className="text-lg group-hover:rotate-12 transition-transform">🏦</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Vincula tu Banco (Open Banking)
                  </span>
                </button>
              </div>
            ) : mode === "manual" ? (
              <div className="w-full px-2 flex flex-col gap-4 mt-2">
                <div className="text-[12px] text-center font-bold opacity-70 uppercase">
                  Auditoría de producto individual
                </div>
                <div>
                  <div className="lcd-label mb-1">TIPO DE PRODUCTO:</div>
                  <select
                    value={manualProduct}
                    onChange={(e) => setManualProduct(e.target.value)}
                    className="lcd-input"
                  >
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Crédito Consumo">Crédito Consumo</option>
                    <option value="Crédito Hipotecario">Crédito Hipotecario</option>
                    <option value="Cuenta Corriente">Cuenta Corriente</option>
                  </select>
                </div>
                <div>
                  <div className="lcd-label mb-1">SEGURO A REVISAR:</div>
                  <select
                    value={manualInsurance}
                    onChange={(e) => setManualInsurance(e.target.value)}
                    className="lcd-input"
                  >
                    <option value="Cesantía">Cesantía</option>
                    <option value="Vida">Vida</option>
                    <option value="Accidentes">Accidentes/Suscripciones</option>
                    <option value="Fraude">Fraude/Comisiones</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="w-full px-2 flex flex-col gap-3 mt-1 animate-in slide-in-from-right-5">
                <div className="text-[12px] text-center font-bold opacity-80 uppercase leading-tight">
                  ¿Te ofrecieron algo nuevo?<br />No firmes sin revisar:
                </div>
                <div>
                  <div className="lcd-label mb-1 text-[9px]">PRODUCTO A COTIZAR:</div>
                  <select
                    value={manualProduct}
                    onChange={(e) => setManualProduct(e.target.value)}
                    className="lcd-input !bg-white/40"
                  >
                    <option value="Crédito Consumo">Crédito Consumo</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Crédito Hipotecario">Crédito Hipotecario</option>
                    <option value="Cuenta Corriente">Cuenta Corriente</option>
                  </select>
                </div>
                <div className="bg-black bg-opacity-5 p-3 rounded-xl border border-black border-opacity-10">
                  <div className="lcd-label mb-1 uppercase text-[9px]">Checklist de Empoderamiento:</div>
                  <ul className="text-[10px] space-y-1 font-bold">
                    <li>• ¿Me informaron la CAE?</li>
                    <li>• ¿Me ofrecieron seguros voluntarios?</li>
                    <li>• ¿Puedo retractarme en 10 días?</li>
                  </ul>
                </div>
                <div className="text-[11px] font-black italic text-center text-green-800">
                  ¡Oriundo te protege antes de firmar!
                </div>
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={mode === "auto" && rut.length < 8}
              className={`modern-button w-full mt-auto ${mode === "auto" && rut.length < 8 ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              🚀 {mode === "preventive" ? "[ RECIBIR ORIENTACIÓN ]" : "[ INICIAR AUDITORÍA ]"}
            </button>
          </div>
        )}

        {state === "connecting" && (
          <BankConnectionView
            onConnected={completeConnection}
            onCancel={reset}
          />
        )}

        {state === "scanning" && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <LoadingBeeper />
            <button onClick={reset} className="text-[10px] font-bold uppercase opacity-40 hover:opacity-80 transition-opacity mt-2" style={{ color: "var(--lcd-dark)" }}>
              ✕ Cancelar
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center animate-in fade-in">
            <div className="lcd-text-large text-red-700 blink">
              ERROR
            </div>
            <div className="bg-red-700 bg-opacity-10 p-4 rounded-xl border-2 border-red-700 border-opacity-20">
              <div className="text-[14px] font-black uppercase text-red-900 leading-tight">
                {errorMsg}
              </div>
            </div>
            <button onClick={reset} className="modern-button w-full !bg-red-900">
              ↩️ VOLVER ATRÁS
            </button>
          </div>
        )}

        {state === "result" && result && (
          <AlertCard result={result} onReset={reset} />
        )}

        {state === "sovereignty" && (
          <SovereigntyView
            consents={consents}
            onToggleConsent={(key) => setConsents(prev => ({ ...prev, [key]: !prev[key] }))}
            onExport={exportData}
            onDeleteFootprint={reset}
            onBack={reset}
          />
        )}
      </BeeperScreen>
    </main>
  );
}
