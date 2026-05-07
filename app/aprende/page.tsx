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

interface MentorMessage {
  role: "player" | "mentor";
  text: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getNarracion(e?: Escenario | null): string {
  return e?.narracion || e?.narración || "";
}

function getOpciones(e?: Escenario | null): string[] {
  if (!e?.opciones) return [];
  return e.opciones.map(o => (typeof o === "string" ? o : o.texto));
}

function assertGameResponse(res: Response, data: { message?: string }) {
  if (!res.ok) throw new Error(data.message || "Game Master no disponible");
  if (typeof data.message === "string" && /unauthorized|authentication|api error|status.*401/i.test(data.message)) {
    throw new Error("Game Master no disponible");
  }
}

function clampStat(value: unknown, min: number, max: number, fallback: number) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
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

function conceptLabel(concepto: string) {
  return concepto.replace(/_/g, " ");
}

function MentorChat({
  messages,
  input,
  suggestions,
  loading,
  onInputChange,
  onAsk,
}: {
  messages: MentorMessage[];
  input: string;
  suggestions: string[];
  loading: boolean;
  onInputChange: (value: string) => void;
  onAsk: (question?: string) => void;
}) {
  return (
    <div className="w-full space-y-2">
      <div className="lcd-label text-[9px]">MENTOR POST-PARTIDA</div>
      <div className="rounded-lg p-2 space-y-2" style={{ background: "rgba(26,47,26,0.07)", border: "1px solid rgba(26,47,26,0.22)" }}>
        <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
          {messages.length === 0 ? (
            <p className="text-[10px] leading-relaxed opacity-70" style={{ color: "var(--lcd-dark)" }}>
              Pregunta algo sobre lo que acabas de vivir en esta partida.
            </p>
          ) : messages.map((m, idx) => (
            <div
              key={`${m.role}-${idx}`}
              className="rounded-md px-2 py-1.5 text-[10px] leading-relaxed"
              style={{
                background: m.role === "mentor" ? "rgba(26,47,26,0.12)" : "rgba(255,255,255,0.24)",
                color: "var(--lcd-dark)",
              }}
            >
              <span className="font-black uppercase opacity-60">{m.role === "mentor" ? "Mentor" : "Tú"}: </span>
              {m.text}
            </div>
          ))}
          {loading && (
            <p className="text-[10px] font-bold animate-pulse opacity-60" style={{ color: "var(--lcd-dark)" }}>
              Pensando con tu historial...
            </p>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => onAsk(s)}
                disabled={loading}
                className="rounded-full px-2 py-1 text-[9px] font-bold disabled:opacity-50"
                style={{ background: "rgba(26,47,26,0.12)", color: "var(--lcd-dark)" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-1">
          <input
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") onAsk();
            }}
            disabled={loading}
            className="flex-1 rounded-md px-2 py-2 text-[10px] font-bold outline-none disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(26,47,26,0.25)",
              color: "var(--lcd-dark)",
            }}
            placeholder="Pregunta sobre tu partida..."
          />
          <button
            onClick={() => onAsk()}
            disabled={loading || input.trim().length === 0}
            className="rounded-md px-3 text-[10px] font-black disabled:opacity-40"
            style={{ background: "var(--lcd-dark)", color: "#d7f0b9" }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function ResumenFinal({ gameState, salud, mentorMessages, mentorInput, mentorSuggestions, mentorLoading, onMentorInputChange, onMentorAsk, onReiniciar }: {
  gameState: GameState;
  salud: SaludFinanciera | null;
  mentorMessages: MentorMessage[];
  mentorInput: string;
  mentorSuggestions: string[];
  mentorLoading: boolean;
  onMentorInputChange: (value: string) => void;
  onMentorAsk: (question?: string) => void;
  onReiniciar: () => void;
}) {
  const { puntuacionTotal, conceptosAprendidos, decisiones, saldo, deudas, relacionesFamilia, relacionesAmigos } = gameState;
  const puntuacion = puntuacionTotal;
  const conceptos = conceptosAprendidos;
  const nivel = puntuacion >= 600 ? "EXPERTO FINANCIERO" : puntuacion >= 350 ? "EN CAMINO" : "APRENDIZ";
  const cierre = deudas > saldo
    ? "Terminaste con presión financiera: aprendiste que resolver el momento puede salir caro si deja deuda."
    : "Terminaste con margen financiero: aprendiste a elegir sin perder tanto control del dinero.";

  return (
    <div className="lcd-content gap-3">
      <div className="text-center">
        <div className="lcd-text-large" style={{ fontSize: "20px" }}>GAME OVER</div>
        <div className="lcd-label text-[10px] mt-1">{nivel}</div>
      </div>

      <p className="text-[11px] leading-relaxed text-center" style={{ color: "var(--lcd-dark)" }}>{cierre}</p>

      <div className="grid grid-cols-2 gap-2 w-full">
        {[
          ["PUNTOS", puntuacion.toLocaleString("es-CL")],
          ["SALUD", salud?.valor ?? "-"],
          ["SALDO", `$${saldo.toLocaleString("es-CL")}`],
          ["DEUDA", `$${deudas.toLocaleString("es-CL")}`],
          ["FAMILIA", relacionesFamilia],
          ["AMIGOS", relacionesAmigos],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md px-2 py-1.5 text-center" style={{ background: "rgba(26,47,26,0.1)", color: "var(--lcd-dark)" }}>
            <div className="text-[8px] font-black opacity-50">{label}</div>
            <div className="text-[12px] font-black">{value}</div>
          </div>
        ))}
      </div>

      {conceptos.length > 0 && (
        <div className="w-full">
          <div className="lcd-label text-[9px] mb-2">CONCEPTOS APRENDIDOS ({conceptos.length}):</div>
          <div className="flex flex-wrap gap-1">
            {conceptos.map(c => (
              <span key={c} className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(26,47,26,0.15)", color: "var(--lcd-dark)" }}>
                {conceptLabel(c)}
              </span>
            ))}
          </div>
        </div>
      )}

      {decisiones.length > 0 && (
        <div className="w-full">
          <div className="lcd-label text-[9px] mb-1">DECISIONES CLAVE:</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {decisiones.slice(-4).map(d => (
              <div key={`${d.turno}-${d.textoJugador}`} className="text-[10px] leading-snug" style={{ color: "var(--lcd-dark)" }}>
                <span className="font-black">T{d.turno}</span> · {conceptLabel(d.conceptoIdentificado)} · +{d.puntos} pts
              </div>
            ))}
          </div>
        </div>
      )}

      <MentorChat
        messages={mentorMessages}
        input={mentorInput}
        suggestions={mentorSuggestions}
        loading={mentorLoading}
        onInputChange={onMentorInputChange}
        onAsk={onMentorAsk}
      />

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
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorInput, setMentorInput] = useState("");
  const [mentorMessages, setMentorMessages] = useState<MentorMessage[]>([]);
  const [mentorSuggestions, setMentorSuggestions] = useState([
    "¿Qué aprendí?",
    "¿Dónde me equivoqué?",
    "¿Cómo lo aplico?"
  ]);
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
      assertGameResponse(res, data);

      const primerEscenario: Escenario = data.escenario || {
        narracion: data.message,
        opciones: [],
      };

      setGameState({
        edad,
        turno: 1,
        saldo: (data.saludFinanciera?.saldo) ?? (edad <= 12 ? 50000 : 100000),
        deudas: clampStat(data.saludFinanciera?.deudas, 0, 500000, 0),
        relacionesFamilia: clampStat(data.saludFinanciera?.relacionesFamilia, 0, 100, 75),
        relacionesAmigos: clampStat(data.saludFinanciera?.relacionesAmigos, 0, 100, 70),
        puntuacionTotal: 0,
        conceptosAprendidos: [],
        decisiones: [],
        objetivoActual: data.objetivoActual,
      });
      setSalud(data.saludFinanciera || { valor: 70, alerta: null });
      setCurrentScenario(primerEscenario);
      setFeedback(null);
      setPausaVisible(true);
      setMentorInput("");
      setMentorMessages([]);
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
      assertGameResponse(res, data);

      const puntos = clampStat(data.puntos, 0, 100, 40);
      const saldoNuevo = clampStat(data.saldoNuevo, 0, 300000, gameState.saldo);
      const deudasNuevas = clampStat(data.deudasNuevas, 0, 500000, gameState.deudas);
      const familiaNew = Math.max(0, Math.min(100, data.relacionesFamiliaNueva ?? gameState.relacionesFamilia));
      const amigosNew = Math.max(0, Math.min(100, data.relacionesAmigosNueva ?? gameState.relacionesAmigos));
      const conceptoId = typeof data.conceptoEnsenado === "string"
        ? data.conceptoEnsenado
        : data.conceptoEnsenado?.id || currentScenario.concepto || "dinero";

      setGameState(prev => prev ? {
        ...prev,
        turno: Math.min(10, prev.turno + 1),
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
    if (
      (feedback && gameState.turno >= 10) ||
      gameState.turno > 10 ||
      (gameState.saldo <= 0 && gameState.deudas > 200000 && gameState.relacionesFamilia < 20)
    ) {
      setFeedback(null);
      setPhase("finished");
      setMentorSuggestions([
        "¿Qué aprendí?",
        "¿Cuál fue mi mejor decisión?",
        "¿Cómo evito deuda?"
      ]);
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
    setMentorInput("");
    setMentorMessages([]);
    setMentorSuggestions([
      "¿Qué aprendí?",
      "¿Dónde me equivoqué?",
      "¿Cómo lo aplico?"
    ]);
    setPhase("select");
  };

  const handleMentorAsk = async (question?: string) => {
    if (!gameState || mentorLoading) return;
    const pregunta = (question || mentorInput).trim();
    if (!pregunta) return;

    setMentorInput("");
    setMentorLoading(true);
    setMentorMessages(prev => [...prev, { role: "player", text: pregunta }]);

    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fase: "mentor",
          edad: gameState.edad,
          preguntaMentor: pregunta,
          historialDecisiones: gameState.decisiones,
          conceptosAprendidosArray: gameState.conceptosAprendidos,
          saldoActual: gameState.saldo,
          deudasActuales: gameState.deudas,
          relacionesFamilia: gameState.relacionesFamilia,
          relacionesAmigos: gameState.relacionesAmigos,
          puntuacionTotal: gameState.puntuacionTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok || typeof data.answer !== "string") throw new Error("Mentor no disponible");

      setMentorMessages(prev => [...prev, { role: "mentor", text: data.answer }]);
      if (Array.isArray(data.suggestions)) {
        setMentorSuggestions(data.suggestions.filter((s: unknown): s is string => typeof s === "string").slice(0, 3));
      }
    } catch (err) {
      console.error(err);
      setMentorMessages(prev => [...prev, {
        role: "mentor",
        text: "Puedo ayudarte con lo que ocurrió en esta partida: saldo, deuda, decisiones y conceptos aprendidos. Prueba preguntarme qué decisión fue más importante."
      }]);
    } finally {
      setMentorLoading(false);
    }
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
              gameState={gameState}
              salud={salud}
              mentorMessages={mentorMessages}
              mentorInput={mentorInput}
              mentorSuggestions={mentorSuggestions}
              mentorLoading={mentorLoading}
              onMentorInputChange={setMentorInput}
              onMentorAsk={handleMentorAsk}
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
