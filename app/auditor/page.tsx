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
import { useBeeperAudit } from "@/lib/hooks/useBeeperAudit";

export default function AuditorPage() {
  const {
    state,
    result,
    errorMsg,
    showWalletAlert,
    customProblem,
    setCustomProblem,
    handleDemoConfirm,
    reset,
    consents,
    setConsents,
    toggleSovereignty,
    exportData
  } = useBeeperAudit();

  const signalLabel = customProblem.trim() || "movimiento financiero a revisar";

  return (
    <main className="min-h-screen overflow-hidden relative">
      {/* Simulación de Notificación Push de Billetera */}
      {showWalletAlert && (
        <div
          className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[320px] bg-white text-black p-4 rounded-2xl shadow-2xl border-l-8 border-green-500 cursor-pointer animate-in slide-in-from-top-10 duration-500 hover:scale-105 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">💳</div>
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Billetera / Banco / Cartola — Señal Beeper</div>
              <div className="text-[14px] font-bold leading-tight">Priorizando auditoría por: &quot;{signalLabel}&quot;.</div>
              <div className="text-[12px] text-green-600 font-bold mt-1">Cruzando señal con Legal Brain.</div>
            </div>
          </div>
        </div>
      )}

      <BeeperScreen
        isPulsing={state === "result" && result?.status !== "ok"}
        onSovereigntyClick={toggleSovereignty}
        backHref="/"
      >
        {state === "idle" && (
          <div className="flex flex-col h-full gap-4 animate-in fade-in">
            <div className="text-center mb-4">
              <div className="lcd-text-large tracking-[0.2em] blink mb-1">
                BEEPER
              </div>
              <div className="text-[16px] font-black opacity-80">
                AUDITOR AUTOMÁTICO
              </div>
            </div>

            <div className="text-[12px] text-center font-bold opacity-70 uppercase leading-relaxed px-2">
              Indica qué quieres que Beeper revise en tus movimientos, wallet, banco o cartolas.
            </div>

            <div className="flex-1 flex flex-col">
              <div className="lcd-label mb-2">SEÑAL DE AUDITORÍA:</div>
              <textarea
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
                placeholder="Ej: monto sospechoso, seguro no reconocido, cobro duplicado, cartola extraña..."
                className="w-full flex-1 resize-none rounded-xl border-2 border-black border-opacity-15 bg-black bg-opacity-5 p-3 text-[12px] font-bold leading-relaxed placeholder:opacity-30 placeholder:font-normal focus:outline-none focus:border-opacity-40 focus:bg-white focus:bg-opacity-30 transition-all"
                style={{ minHeight: "170px" }}
              />
              <div className="text-[9px] opacity-30 text-right mt-1 font-bold">
                {customProblem.length} caracteres
              </div>
            </div>

            <button
              onClick={handleDemoConfirm}
              disabled={customProblem.trim().length < 4}
              className={`modern-button w-full mt-auto ${customProblem.trim().length < 4 ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              🚀 [ INICIAR AUDITORÍA ]
            </button>
          </div>
        )}

        {state === "demo_select" && (
          <div className="flex flex-col h-full gap-3 animate-in slide-in-from-right-5">
            {/* Header */}
            <div className="text-center">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">MODO DEMO</div>
              <div className="text-[13px] font-black uppercase leading-tight">
                ¿Qué problema<br />quieres auditar?
              </div>
            </div>

            <div className="text-[10px] font-bold opacity-60 text-center leading-relaxed">
              Describe tu situación con tus propias palabras.<br />El cerebro analizará el caso real.
            </div>

            {/* Textarea libre */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
                placeholder="Ej: Me aparece un cobro mensual de $4.990 por un seguro que no recuerdo haber contratado en mi tarjeta de crédito..."
                className="w-full flex-1 resize-none rounded-xl border-2 border-black border-opacity-15 bg-black bg-opacity-5 p-3 text-[11px] font-bold leading-relaxed placeholder:opacity-30 placeholder:font-normal focus:outline-none focus:border-opacity-40 focus:bg-white focus:bg-opacity-30 transition-all"
                style={{ minHeight: "160px" }}
              />
              <div className="text-[9px] opacity-30 text-right mt-1 font-bold">
                {customProblem.length} caracteres
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              <button
                onClick={reset}
                className="flex-1 py-2 text-[10px] font-black uppercase opacity-50 hover:opacity-80 transition-opacity border border-current rounded-xl"
              >
                ← Volver
              </button>
              <button
                onClick={handleDemoConfirm}
                disabled={customProblem.trim().length < 10}
                className={`flex-[2] modern-button !py-2 ${customProblem.trim().length < 10 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                🧠 [ ANALIZAR ]
              </button>
            </div>
          </div>
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
