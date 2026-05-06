"use client";

import { useState } from "react";
import Link from "next/link";

// ─── types ───────────────────────────────────────────────────────────────────

type Opcion = string | { id: string; texto: string; consecuenciaHint?: string };

interface Escenario {
  narracion?: string;
  narración?: string;
  opciones?: Opcion[];
  concepto?: string;
  ubicacion?: string;
  turno?: number;
  personajes?: Array<{ nombre: string; rol?: string; estadoEmocional?: string }>;
}

interface PausaEducativa {
  concepto: string;
  quienExplica: string;
  explicacion: string;
  preguntaReflexiva: string;
}

interface ObjetivoTurno {
  descripcion: string;
  recompensa: string;
  consecuenciaSiFalla: string;
}

interface SaludFinanciera {
  valor: number;
  alerta: string | null;
}

interface GameState {
  edad: number;
  turno: number;
  saldo: number;
  deudas: number;
  relacionesFamilia: number;
  relacionesAmigos: number;
  puntuacionTotal: number;
  conceptosAprendidos: string[];
  decisiones: Array<{ turno: number; textoJugador: string; conceptoIdentificado: string; puntos: number }>;
  objetivoActual?: ObjetivoTurno;
}

interface FeedbackState {
  message: string;
  puntos: number;
  pausa?: PausaEducativa;
  objetivo?: ObjetivoTurno;
  objetivoLogrado?: boolean;
  nextScenario?: Escenario;
  nextSalud?: SaludFinanciera;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getNarracion(e?: Escenario | null): string {
  return e?.narracion || e?.narración || "";
}

function getOpciones(e?: Escenario | null): string[] {
  if (!e?.opciones) return [];
  return e.opciones.map(o => (typeof o === "string" ? o : o.texto));
}

function saludColor(v: number) {
  if (v >= 60) return "#1a2f1a";
  if (v >= 35) return "#7a5c00";
  return "#7a0000";
}

function saludBgColor(v: number) {
  if (v >= 60) return "#1a2f1a";
  if (v >= 35) return "#b58a00";
  return "#c0392b";
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatRow({ saldo, deudas, familia, amigos, turno }: {
  saldo: number; deudas: number; familia: number; amigos: number; turno: number;
}) {
  return (
    <div className="flex justify-between text-[10px] font-bold font-mono opacity-80 px-1" style={{ color: "var(--lcd-dark)" }}>
      <span>💰 ${saldo.toLocaleString("es-CL")}</span>
      {deudas > 0 && <span style={{ color: "#c0392b" }}>💸 ${deudas.toLocaleString("es-CL")}</span>}
      <span>👨‍👩‍👦 {familia}</span>
      <span>👥 {amigos}</span>
      <span>📍 {turno}/10</span>
    </div>
  );
}

function SaludBar({ salud }: { salud: SaludFinanciera }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold uppercase opacity-60" style={{ color: "var(--lcd-dark)" }}>Salud</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(26,47,26,0.15)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(2, salud.valor)}%`, background: saludBgColor(salud.valor) }}
          />
        </div>
        <span className="text-[9px] font-black" style={{ color: saludColor(salud.valor) }}>{salud.valor}</span>
      </div>
      {salud.alerta && (
        <div className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: "rgba(192,57,43,0.15)", color: "#c0392b", border: "1px solid rgba(192,57,43,0.3)" }}>
          ⚠️ {salud.alerta}
        </div>
      )}
    </div>
  );
}

function ObjetivoPanel({ objetivo }: { objetivo: ObjetivoTurno }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: "rgba(26,47,26,0.08)", border: "1px solid rgba(26,47,26,0.25)" }}>
      <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--lcd-dark)", opacity: 0.5 }}>🎯 OBJETIVO</p>
      <p className="text-[11px] font-bold leading-snug" style={{ color: "var(--lcd-dark)" }}>{objetivo.descripcion}</p>
    </div>
  );
}

function PausaPanel({ pausa, onClose }: { pausa: PausaEducativa; onClose: () => void }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(26,47,26,0.08)", border: "2px solid rgba(26,47,26,0.4)" }}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-black uppercase" style={{ color: "var(--lcd-dark)", opacity: 0.7 }}>
          💡 {pausa.quienExplica} te explica
        </p>
        <button onClick={onClose} className="text-[10px] font-bold opacity-50 hover:opacity-100" style={{ color: "var(--lcd-dark)" }}>✕</button>
      </div>
      <p className="text-[11px] leading-relaxed mb-2" style={{ color: "var(--lcd-dark)" }}>&ldquo;{pausa.explicacion}&rdquo;</p>
      <p className="text-[10px] italic opacity-70" style={{ color: "var(--lcd-dark)" }}>→ {pausa.preguntaReflexiva}</p>
    </div>
  );
}

// ─── age selector ─────────────────────────────────────────────────────────────

function AgeSelector({ onSelect, loading }: { onSelect: (age: number) => void; loading: boolean }) {
  return (
    <div className="lcd-content justify-center gap-5">
      <div className="text-center">
        <div className="lcd-text-large" style={{ fontSize: "24px" }}>FINANZAS</div>
        <div className="lcd-label text-[10px] mt-1">SURVIVAL GAME</div>
      </div>

      <div className="text-[11px] text-center font-bold opacity-70" style={{ color: "var(--lcd-dark)" }}>
        El dinero real duele de verdad.<br />¿Estás listo para manejarlo?
      </div>

      <div className="space-y-3 w-full">
        <div className="lcd-label text-[10px] mb-2">SELECCIONA TU PERFIL:</div>
        {[
          { label: "Soy del colegio", sub: "Misiones con mesada y amigos", age: 10 },
          { label: "Soy adolescente", sub: "Trabajo, deudas y decisiones reales", age: 13 },
        ].map(opt => (
          <button
            key={opt.age}
            onClick={() => onSelect(opt.age)}
            disabled={loading}
            className="w-full text-left rounded-xl p-3 transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: "rgba(26,47,26,0.08)",
              border: "2px solid rgba(26,47,26,0.3)",
              color: "var(--lcd-dark)",
            }}
          >
            <div className="text-[12px] font-black">{opt.label}</div>
            <div className="text-[10px] opacity-60 font-bold">{opt.sub}</div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center text-[11px] font-bold animate-pulse" style={{ color: "var(--lcd-dark)", opacity: 0.6 }}>
          El Game Master está preparando tu historia...
        </div>
      )}

      <Link href="/" className="text-center text-[10px] font-bold opacity-40 hover:opacity-70 mt-auto" style={{ color: "var(--lcd-dark)" }}>
        ← Volver al menú
      </Link>
    </div>
  );
}

// ─── summary ─────────────────────────────────────────────────────────────────

function ResumenFinal({ puntuacion, conceptos, onReiniciar }: {
  puntuacion: number; conceptos: string[]; onReiniciar: () => void;
}) {
  const nivel = puntuacion >= 600 ? "EXPERTO FINANCIERO" : puntuacion >= 350 ? "EN CAMINO" : "APRENDIZ";
  return (
    <div className="lcd-content justify-center gap-4">
      <div className="text-center">
        <div className="lcd-text-large" style={{ fontSize: "20px" }}>FIN</div>
        <div className="lcd-label text-[10px] mt-1">{nivel}</div>
      </div>

      <div className="text-center">
        <div className="text-[28px] font-black" style={{ color: "var(--lcd-dark)" }}>{puntuacion}</div>
        <div className="text-[10px] font-bold opacity-60" style={{ color: "var(--lcd-dark)" }}>PUNTOS TOTALES</div>
      </div>

      {conceptos.length > 0 && (
        <div className="w-full">
          <div className="lcd-label text-[9px] mb-2">CONCEPTOS APRENDIDOS ({conceptos.length}):</div>
          <div className="flex flex-wrap gap-1">
            {conceptos.map(c => (
              <span key={c} className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(26,47,26,0.15)", color: "var(--lcd-dark)" }}>
                {c.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      <button onClick={onReiniciar} className="modern-button w-full mt-auto" style={{ fontSize: "13px" }}>
        ↺ JUGAR DE NUEVO
      </button>
      <Link href="/" className="text-center text-[10px] font-bold opacity-40 hover:opacity-70" style={{ color: "var(--lcd-dark)" }}>
        ← Menú principal
      </Link>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function AprendePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Escenario | null>(null);
  const [salud, setSalud] = useState<SaludFinanciera | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [pausaVisible, setPausaVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"select" | "playing" | "finished">("select");

  // ── init ───────────────────────────────────────────────────────────────────
  const initGame = async (edad: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fase: "init", edad }),
      });
      const data = await res.json();

      const primerEscenario: Escenario = data.escenario || {
        narracion: data.message,
        opciones: [],
      };

      setGameState({
        edad,
        turno: 1,
        saldo: (data.saludFinanciera?.saldo) ?? (edad <= 12 ? 50000 : 100000),
        deudas: 0,
        relacionesFamilia: 75,
        relacionesAmigos: 70,
        puntuacionTotal: 0,
        conceptosAprendidos: [],
        decisiones: [],
        objetivoActual: data.objetivoActual,
      });
      setSalud(data.saludFinanciera || { valor: 70, alerta: null });
      setCurrentScenario(primerEscenario);
      setFeedback(null);
      setPausaVisible(true);
      setPhase("playing");
    } catch (err) {
      console.error(err);
      alert("Error iniciando el juego. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // ── responder ──────────────────────────────────────────────────────────────
  const handleResponder = async (respuesta: string) => {
    if (!gameState || !currentScenario) return;
    setLoading(true);
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fase: "evaluar_decision",
          edad: gameState.edad,
          turno: gameState.turno,
          conceptoActual: currentScenario.concepto,
          respuestaJugador: respuesta,
          historialDecisiones: gameState.decisiones,
          saldoActual: gameState.saldo,
          deudasActuales: gameState.deudas,
          relacionesFamilia: gameState.relacionesFamilia,
          relacionesAmigos: gameState.relacionesAmigos,
          conceptosAprendidosArray: gameState.conceptosAprendidos,
          objetivoActual: gameState.objetivoActual?.descripcion,
        }),
      });
      const data = await res.json();

      const puntos = data.puntos ?? 40;
      const saldoNuevo = data.saldoNuevo ?? gameState.saldo;
      const deudasNuevas = data.deudasNuevas ?? gameState.deudas;
      const familiaNew = Math.max(0, Math.min(100, data.relacionesFamiliaNueva ?? gameState.relacionesFamilia));
      const amigosNew = Math.max(0, Math.min(100, data.relacionesAmigosNueva ?? gameState.relacionesAmigos));
      const conceptoId = typeof data.conceptoEnsenado === "string"
        ? data.conceptoEnsenado
        : data.conceptoEnsenado?.id || currentScenario.concepto || "dinero";

      setGameState(prev => prev ? {
        ...prev,
        turno: prev.turno + 1,
        puntuacionTotal: prev.puntuacionTotal + puntos,
        saldo: saldoNuevo,
        deudas: deudasNuevas,
        relacionesFamilia: familiaNew,
        relacionesAmigos: amigosNew,
        conceptosAprendidos: Array.from(new Set([...prev.conceptosAprendidos, conceptoId])),
        decisiones: [...prev.decisiones, {
          turno: prev.turno,
          textoJugador: respuesta,
          conceptoIdentificado: conceptoId,
          puntos,
        }],
        objetivoActual: data.objetivoActual,
      } : prev);

      if (data.saludFinanciera) setSalud(data.saludFinanciera);

      setFeedback({
        message: data.message,
        puntos,
        pausa: data.pausaEducativa,
        objetivo: data.objetivoActual,
        objetivoLogrado: data.objetivoLogrado,
        nextScenario: data.escenario || undefined,
        nextSalud: data.saludFinanciera,
      });
      setPausaVisible(true);
    } catch (err) {
      console.error(err);
      setFeedback({ message: "El narrador necesita un momento... intenta de nuevo.", puntos: 0 });
    } finally {
      setLoading(false);
    }
  };

  // ── siguiente ──────────────────────────────────────────────────────────────
  const handleSiguiente = () => {
    if (!gameState) return;
    if (gameState.turno > 10 || (gameState.saldo <= 0 && gameState.deudas > 200000 && gameState.relacionesFamilia < 20)) {
      setFeedback(null);
      setPhase("finished");
      return;
    }
    if (feedback?.nextScenario) {
      setCurrentScenario(feedback.nextScenario);
      if (feedback.nextSalud) setSalud(feedback.nextSalud);
    }
    setFeedback(null);
    setPausaVisible(true);
  };

  const handleReiniciar = () => {
    setGameState(null);
    setCurrentScenario(null);
    setSalud(null);
    setFeedback(null);
    setPhase("select");
  };

  // ── renders ────────────────────────────────────────────────────────────────
  return (
    <main>
      <div className="beeper-device">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="lcd-text-large" style={{ fontSize: "18px", color: "var(--lcd-dark)" }}>FINANZAS</div>
            <div className="text-[11px] font-black opacity-50 uppercase tracking-widest" style={{ color: "var(--lcd-dark)" }}>
              Survival Game
            </div>
          </div>
          {phase === "playing" && gameState ? (
            <div className="flex flex-col items-end gap-1">
              <div className="text-[11px] font-black" style={{ color: "var(--lcd-dark)" }}>{gameState.puntuacionTotal} pts</div>
              <button
                onClick={handleReiniciar}
                className="text-[9px] font-black uppercase opacity-40 hover:opacity-80 transition-opacity"
                style={{ color: "var(--lcd-dark)" }}
              >
                ✕ Salir
              </button>
            </div>
          ) : (
            <Link href="/" className="text-[10px] font-bold opacity-30 hover:opacity-60" style={{ color: "var(--lcd-dark)" }}>
              ← Inicio
            </Link>
          )}
        </div>

        {/* Stats (solo en juego) */}
        {phase === "playing" && gameState && (
          <div className="space-y-1.5">
            <StatRow
              saldo={gameState.saldo}
              deudas={gameState.deudas}
              familia={gameState.relacionesFamilia}
              amigos={gameState.relacionesAmigos}
              turno={gameState.turno}
            />
            {salud && <SaludBar salud={salud} />}
          </div>
        )}

        {/* LCD Screen */}
        <div className="lcd-screen" style={{ height: "auto", minHeight: "360px", maxHeight: "460px", overflowY: "auto" }}>
          <div className="scanline-effect" />

          {/* SELECT AGE */}
          {phase === "select" && (
            <AgeSelector onSelect={initGame} loading={loading} />
          )}

          {/* FINISHED */}
          {phase === "finished" && gameState && (
            <ResumenFinal
              puntuacion={gameState.puntuacionTotal}
              conceptos={gameState.conceptosAprendidos}
              onReiniciar={handleReiniciar}
            />
          )}

          {/* PLAYING */}
          {phase === "playing" && gameState && (
            <div className="lcd-content gap-3" style={{ minHeight: "100%" }}>

              {/* Objetivo (solo cuando NO hay feedback) */}
              {!feedback && gameState.objetivoActual && (
                <ObjetivoPanel objetivo={gameState.objetivoActual} />
              )}

              {feedback ? (
                /* ── FEEDBACK ── */
                <div className="space-y-3 flex-1">
                  {/* Consecuencias */}
                  <div>
                    <div className="lcd-label text-[9px] mb-1">QUÉ PASÓ</div>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--lcd-dark)" }}>
                      {feedback.message}
                    </p>
                  </div>

                  {/* Pausa educativa */}
                  {feedback.pausa && pausaVisible && (
                    <PausaPanel pausa={feedback.pausa} onClose={() => setPausaVisible(false)} />
                  )}

                  {/* Resultado objetivo */}
                  <div className="flex items-center justify-between">
                    <div>
                      {feedback.objetivoLogrado === true && (
                        <span className="text-[11px] font-black" style={{ color: "var(--lcd-dark)" }}>🏆 Objetivo logrado</span>
                      )}
                      {feedback.objetivoLogrado === false && (
                        <span className="text-[11px] font-bold" style={{ color: "#c0392b" }}>❌ Objetivo no logrado</span>
                      )}
                    </div>
                    <span className="text-[12px] font-black" style={{ color: "var(--lcd-dark)" }}>+{feedback.puntos} pts</span>
                  </div>

                  {/* Próximo objetivo */}
                  {feedback.objetivo && (
                    <div className="rounded-lg px-3 py-2" style={{ background: "rgba(26,47,26,0.06)", border: "1px solid rgba(26,47,26,0.2)" }}>
                      <p className="text-[9px] font-black uppercase opacity-50 mb-1" style={{ color: "var(--lcd-dark)" }}>🎯 PRÓXIMO OBJETIVO</p>
                      <p className="text-[11px] font-bold" style={{ color: "var(--lcd-dark)" }}>{feedback.objetivo.descripcion}</p>
                      <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--lcd-dark)" }}>Si lo logras: {feedback.objetivo.recompensa}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* ── ESCENARIO ── */
                <div className="flex-1">
                  <div className="lcd-label text-[9px] mb-2">TURNO {gameState.turno} · NARRADOR</div>
                  <p className="text-[11px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--lcd-dark)" }}>
                    {getNarracion(currentScenario) || "El juego continúa..."}
                  </p>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Buttons (fuera del LCD — área GameBoy) */}
        {phase === "playing" && gameState && (
          <div className="space-y-2">
            {feedback ? (
              <button
                onClick={handleSiguiente}
                disabled={loading}
                className="modern-button w-full disabled:opacity-50"
                style={{ fontSize: "13px" }}
              >
                {loading ? "Cargando..." : "Continuar →"}
              </button>
            ) : loading ? (
              <div className="text-center text-[11px] font-bold animate-pulse py-3" style={{ color: "var(--lcd-dark)", opacity: 0.6 }}>
                El Game Master está pensando...
              </div>
            ) : (
              <div className="space-y-2">
                <div className="lcd-label text-[9px]">¿QUÉ HACES?</div>
                {getOpciones(currentScenario).map((op, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleResponder(op)}
                    disabled={loading}
                    className="w-full text-left rounded-xl px-4 py-3 text-[12px] font-bold transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      background: "rgba(26,47,26,0.08)",
                      border: "2px solid rgba(26,47,26,0.3)",
                      color: "var(--lcd-dark)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(26,47,26,0.18)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(26,47,26,0.08)")}
                  >
                    <span className="font-black mr-2">{String.fromCharCode(65 + idx)})</span>
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
