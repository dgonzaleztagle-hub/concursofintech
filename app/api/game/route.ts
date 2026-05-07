import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || process.env.NIM_API_KEY;

const PROVIDERS = [
  {
    name: "nim",
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    key: () => NVIDIA_API_KEY,
    model: "mistralai/mistral-nemotron",
    supportsJsonMode: false,
  },
  {
    name: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: () => GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    supportsJsonMode: true,
  },
];

const SYSTEM_PROMPT = `Eres el GAME MASTER de un juego de supervivencia financiera para jóvenes en Chile. Tu trabajo es crear una EXPERIENCIA NARRATIVA donde el jugador vive situaciones reales, toma decisiones financieras, y aprende conceptos a través de las consecuencias — nunca por lecciones directas.

═══════════════════════════════════════
## IDENTIDAD Y VOZ
═══════════════════════════════════════

No eres un profesor. Eres el narrador de una historia donde el jugador ES el protagonista. Tu voz es:
- Cinematográfica: describe emociones, tensión, atmósfera
- Empática: los personajes tienen razones válidas, nadie es villano
- Honesta: las consecuencias malas duelen, las buenas se celebran
- Simple: máximo lenguaje de 12 años, cero tecnicismos innecesarios

═══════════════════════════════════════
## MECÁNICA DE SUPERVIVENCIA FINANCIERA
═══════════════════════════════════════

El jugador tiene una SALUD FINANCIERA (0-100) compuesta de:
- Saldo disponible (positivo = bien, negativo = crisis)
- Nivel de deudas (sin deudas = bien, deuda espiral = crisis)
- Relaciones (familia 0-100, amigos 0-100)

ESTADOS CRÍTICOS que debes generar como escenarios de emergencia:
- Saldo < $20.000: crisis de liquidez → escenario de préstamo urgente
- Deuda > 2x saldo: espiral de deuda → escenario de consecuencias
- Familia < 30: crisis familiar → escenario de reparación de confianza
- Amigos < 20: aislamiento social → escenario de consecuencias relacionales

GAME OVER si saldo = 0 Y deuda > $200.000 Y familia < 20 → genera cierre dramático y emotivo.

═══════════════════════════════════════
## OBJETIVOS ENTRE ESCENAS (OBLIGATORIO)
═══════════════════════════════════════

Al final de CADA turno establece un micro-objetivo para el siguiente:
- Concreto y medible ("llega al turno X con $Y sin nuevas deudas")
- Con recompensa narrativa si se logra
- Con consecuencia narrativa si no se logra
- Crea tensión y dirección entre escenas

═══════════════════════════════════════
## PAUSAS EDUCATIVAS (EL CORAZÓN DEL JUEGO)
═══════════════════════════════════════

Las pausas educativas se activan SOLO cuando el jugador ACABA DE VIVIR el concepto. Nunca antes, nunca como lección programada.

ESTRUCTURA:
1. Un personaje (mamá, tío, amigo mayor, abuelo) lo explica en conversación casual
2. Usa el ejemplo EXACTO que acaba de vivir el jugador
3. Máximo 3 oraciones en lenguaje cotidiano
4. Termina con una pregunta reflexiva genuina (no retórica)

CORRECTO:
"Espera — ¿entiendes por qué debes devolver más de lo que te presté? Te di $100.000 hoy. Mientras tú los usas, yo no los puedo usar para nada. Esos $10.000 extra son el precio de haber usado mi plata. ¿Preferirías que alguien te prestara sin cobrar interés? ¿Por qué crees que casi nadie lo hace gratis?"

INCORRECTO:
"PAUSA EDUCATIVA: El interés es cuando pides dinero y pagas extra..."

═══════════════════════════════════════
## EVALUACIÓN DE OBJETIVOS (MATIZ IMPORTANTE)
═══════════════════════════════════════

Un objetivo NO se evalúa como "gastó = falló". Se evalúa según la SABIDURÍA de la decisión:
- Gastar impulsivamente en uno mismo cuando hay obligaciones pendientes = fallido
- Gastar en ayudar a otro cuando hay obligaciones pendientes = neutral o positivo
- Ahorrar bajo presión = logrado
- Pedir prestado para cubrir algo necesario = neutral
- Evitar deuda innecesaria = logrado

El objetivo mide RESPONSABILIDAD FINANCIERA. Ambas opciones pueden ser gastos — lo que importa es en QUÉ y POR QUÉ.

═══════════════════════════════════════
## DIRECCIÓN NARRATIVA (ARCO DE 10 TURNOS)
═══════════════════════════════════════

- Turnos 1-3: Establecimiento (recibe dinero, primeras decisiones de gastos simples)
- Turnos 4-6: Complicación (emerge un problema, necesita préstamo o enfrenta consecuencias anteriores)
- Turnos 7-8: Crisis (decisión difícil con consecuencias grandes)
- Turnos 9-10: Resolución (recuperación o colapso según decisiones previas)

Los personajes RECUERDAN. Las decisiones del turno 2 aparecen en el turno 6.

═══════════════════════════════════════
## SECUENCIA DE CONCEPTOS POR EDAD
═══════════════════════════════════════

EDAD 10-11: dinero → ingresos → gastos → necesidad_vs_deseo → ahorro → presupuesto → costo_oportunidad → gastos_hormiga

EDAD 12-13: Anterior + deuda → tipos_prestamo → interes_simple → interes_compuesto → tarjeta_credito → cuota_amortizacion → fondo_emergencia → valor_vs_precio

EDAD 14-16: Anterior + seguro → inflacion → activo_vs_pasivo → deuda_buena_vs_mala → historial_crediticio → impuesto → inversion → riesgo → diversificacion → fomo → publicidad → pension → roi → deuda_espiral → cae → derechos_financieros

═══════════════════════════════════════
## FORMATO DE RESPUESTA JSON (OBLIGATORIO)
═══════════════════════════════════════

Responde SIEMPRE como JSON puro válido. Sin markdown, sin texto fuera del JSON.

### FASE init:
{
  "narracion": "2-3 párrafos vívidos de la situación inicial y el dilema",
  "personajes": [{ "nombre": "string", "rol": "string", "estadoEmocional": "string" }],
  "opciones": [
    { "id": "opcion_a", "texto": "Qué hace el jugador", "consecuenciaHint": "Pista vaga" },
    { "id": "opcion_b", "texto": "Qué hace el jugador", "consecuenciaHint": "Pista vaga" }
  ],
  "conceptoEnsenado": "id_concepto",
  "ubicacion": "casa|colegio|mall|calle|banco|trabajo",
  "turno": 1,
  "saludFinanciera": { "valor": 70, "saldo": 100000, "deudas": 0, "relacionesFamilia": 75, "relacionesAmigos": 70, "alerta": null },
  "objetivoActual": { "descripcion": "string", "recompensa": "string", "consecuenciaSiFalla": "string" }
}

### FASE evaluar_decision:
{
  "narracion": "2-3 párrafos de consecuencias. Qué pasó, cómo reaccionaron los personajes.",
  "consecuencias": "Resumen del impacto",
  "conceptoEnsenado": "id_concepto",
  "pausaEducativa": {
    "concepto": "nombre",
    "quienExplica": "nombre y rol del personaje",
    "explicacion": "Explicación en voz del personaje, usando el ejemplo vivido. Máximo 3 oraciones.",
    "preguntaReflexiva": "Pregunta que hace pensar genuinamente"
  },
  "puntos": 0,
  "saldoNuevo": 0,
  "deudasNuevas": 0,
  "relacionesFamiliaNueva": 75,
  "relacionesAmigosNueva": 70,
  "saludFinancieraNueva": { "valor": 65, "alerta": null },
  "transicion": "Frase que conecta con el siguiente turno",
  "objetivoLogrado": true,
  "objetivoActual": { "descripcion": "Nuevo objetivo", "recompensa": "string", "consecuenciaSiFalla": "string" },
  "proximoConcepto": "id_concepto",
  "escenarioSiguiente": {
    "narracion": "Narración del siguiente escenario con contexto de lo que pasó",
    "personajes": [{ "nombre": "string", "rol": "string", "estadoEmocional": "string" }],
    "opciones": [
      { "id": "opcion_a", "texto": "string", "consecuenciaHint": "string" },
      { "id": "opcion_b", "texto": "string", "consecuenciaHint": "string" }
    ],
    "conceptoEnsenado": "id_concepto",
    "ubicacion": "string",
    "turno": 0
  }
}

═══════════════════════════════════════
## PRECIOS REALES CHILE (OBLIGATORIO — NO INVENTAR)
═══════════════════════════════════════

TRANSPORTE: pasaje metro/micro $800-$1.000 | Uber corto $3.000-$6.000
COMIDA: helado $800-$1.500 | colación colegio $2.000-$4.000 | almuerzo $5.000-$8.000
ENTRETENIMIENTO: cine $5.500-$8.000 | videojuego nuevo $45.000-$70.000 | videojuego usado $15.000-$30.000 | concierto local $15.000-$40.000
ROPA: zapatillas económicas $25.000-$45.000 | zapatillas de marca $70.000-$150.000 | jeans básico $20.000-$35.000 | parka $30.000-$90.000
TECH: celular básico $80.000-$150.000 | celular gama media $200.000-$400.000 | iPhone $500.000-$1.200.000
BICICLETAS: básica $80.000-$130.000 | urbana buena $150.000-$300.000
REGALOS: amigo básico $5.000-$15.000 | mamá/papá $10.000-$25.000
MESADAS: 10-12 años $20.000-$50.000/mes | 13-16 años $50.000-$150.000/mes
REFERENCIAS: SERNAC, CMF, DICOM, AFP, Falabella, Ripley, Mall Plaza, metro Red Metropolitana`;

interface Decision {
  turno: number;
  textoJugador: string;
  conceptoIdentificado: string;
  puntos: number;
}

interface GameRequest {
  fase: "init" | "evaluar_decision" | "mentor";
  edad?: number;
  turno?: number;
  conceptoActual?: string;
  respuestaJugador?: string;
  historialDecisiones?: Decision[];
  saldoActual?: number;
  deudasActuales?: number;
  relacionesFamilia?: number;
  relacionesAmigos?: number;
  conceptosAprendidosArray?: string[];
  objetivoActual?: string;
  preguntaMentor?: string;
  puntuacionTotal?: number;
}

function getSecuenciaConceptos(edad: number): string[] {
  const n1 = ["dinero", "ingresos", "gastos", "necesidad_vs_deseo", "ahorro", "presupuesto", "costo_oportunidad", "gastos_hormiga"];
  const n2 = ["deuda", "tipos_prestamo", "interes_simple", "interes_compuesto", "tarjeta_credito", "cuota_amortizacion", "fondo_emergencia", "valor_vs_precio"];
  const n3 = ["seguro", "inflacion", "activo_vs_pasivo", "deuda_buena_vs_mala", "historial_crediticio", "impuesto", "inversion", "riesgo", "diversificacion", "fomo", "publicidad", "pension", "roi", "deuda_espiral", "cae", "derechos_financieros"];
  if (edad <= 11) return n1;
  if (edad <= 13) return [...n1, ...n2];
  return [...n1, ...n2, ...n3];
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function inferDecisionProfile(decision: string) {
  const lower = decision.toLowerCase();
  const responsible = /l[ií]mite|necesario|guardar|ahorrar|comparar|presupuesto|primero|barata|barato|esperar|cotizar/.test(lower);
  const debtRisk = /pedir|prestado|cuotas|cr[eé]dito|tarjeta|deuda|fiado/.test(lower);
  const socialSpend = /mall|salir|amigos|grupo|invitar|videojuego|marca|r[aá]pido/.test(lower);
  const familyCare = /mam[aá]|pap[aá]|hermana|familia|casa|ayudar/.test(lower);
  return { responsible, debtRisk, socialSpend, familyCare };
}

function computeEconomy(input: GameRequest) {
  const turn = clampNumber(input.turno, 1, 10, 1);
  const saldo = clampNumber(input.saldoActual, 0, 300000, input.edad && input.edad <= 12 ? 50000 : 100000);
  const deudas = clampNumber(input.deudasActuales, 0, 500000, 0);
  const familia = clampNumber(input.relacionesFamilia, 0, 100, 75);
  const amigos = clampNumber(input.relacionesAmigos, 0, 100, 70);
  const profile = inferDecisionProfile(input.respuestaJugador || "");

  const baseCost = 6000 + turn * 2500;
  const cost = profile.responsible
    ? Math.min(saldo, Math.max(4000, Math.round(baseCost * 0.65)))
    : Math.round(baseCost * (profile.socialSpend ? 1.9 : 1.35));
  const uncovered = Math.max(0, cost - saldo);
  const saldoNuevo = Math.max(0, saldo - cost);
  const deudasNuevas = deudas + (profile.debtRisk ? Math.max(15000, uncovered) : uncovered > 0 ? Math.min(20000, uncovered) : 0);
  const relacionesFamiliaNueva = clampNumber(
    familia + (profile.familyCare ? 6 : profile.responsible ? 3 : -4),
    0,
    100,
    familia
  );
  const relacionesAmigosNueva = clampNumber(
    amigos + (profile.socialSpend ? 5 : profile.responsible ? -1 : -3),
    0,
    100,
    amigos
  );
  const cashScore = Math.min(35, saldoNuevo / 3000);
  const debtPenalty = Math.min(35, deudasNuevas / 6000);
  const relationScore = ((relacionesFamiliaNueva + relacionesAmigosNueva) / 2) * 0.35;
  const saludValor = clampNumber(30 + cashScore + relationScore - debtPenalty, 0, 100, 60);
  const requiredSaldo = Math.max(10000, Math.round(saldo * 0.25));
  const lowCashPenalty = saldoNuevo < requiredSaldo ? 20 : 0;
  const debtPressurePenalty = deudasNuevas > Math.max(0, saldoNuevo) ? 10 : 0;
  const puntos = clampNumber(
    (profile.responsible ? 78 : 45) - uncovered / 1000 - lowCashPenalty - debtPressurePenalty,
    0,
    100,
    40
  );
  const objetivoLogrado = profile.responsible && deudasNuevas <= deudas && saldoNuevo >= requiredSaldo;
  const alerta = saldoNuevo < 20000
    ? "Saldo bajo: conviene cuidar cada gasto."
    : deudasNuevas > saldoNuevo * 2 && deudasNuevas > 0
      ? "Deuda alta frente al saldo disponible."
      : null;

  return {
    puntos,
    saldoNuevo,
    deudasNuevas,
    relacionesFamiliaNueva,
    relacionesAmigosNueva,
    saludFinanciera: { valor: saludValor, alerta },
    objetivoLogrado,
  };
}

function buildNextObjective(input: GameRequest, economy: ReturnType<typeof computeEconomy>) {
  const turn = clampNumber(input.turno, 1, 10, 1);
  if (turn >= 10) return null;

  return {
    descripcion: `En el próximo turno, evita nueva deuda y conserva al menos $${Math.max(10000, Math.round(economy.saldoNuevo * 0.6)).toLocaleString("es-CL")}.`,
    recompensa: "Puedes resolver el siguiente problema con más margen.",
    consecuenciaSiFalla: "Tendrás menos espacio para elegir sin pedir ayuda."
  };
}

function buildPrompt(input: GameRequest): string {
  const edad = input.edad || 13;
  const edadGroup = edad <= 12 ? "10-12" : edad <= 13 ? "12-13" : "14-16";
  const secuencia = getSecuenciaConceptos(edad);
  const conceptosAprendidos = input.conceptosAprendidosArray || [];
  const conceptoSugerido = secuencia[conceptosAprendidos.length] || secuencia[secuencia.length - 1];

  const saldo = input.saldoActual ?? 100000;
  const deudas = input.deudasActuales ?? 0;
  const familia = input.relacionesFamilia ?? 75;
  const amigos = input.relacionesAmigos ?? 70;

  const alertas: string[] = [];
  if (saldo < 20000) alertas.push("⚠️ SALDO CRÍTICO — genera escenario de liquidez urgente");
  if (deudas > saldo * 2) alertas.push("⚠️ DEUDA ESPIRAL — deudas superan 2x el saldo");
  if (familia < 30) alertas.push("⚠️ CRISIS FAMILIAR — relación familia muy dañada");
  if (amigos < 20) alertas.push("⚠️ AISLAMIENTO SOCIAL — relaciones con amigos críticas");

  if (input.fase === "init") {
    const pool10_12 = [
      { situacion: "Es viernes y recibiste tu mesada de $50.000. Tu amigo te llama para juntarse en el mall.", monto: 50000 },
      { situacion: "Tu abuela te dio $80.000 por tu cumpleaños. Estás en casa mirando el sobre.", monto: 80000 },
      { situacion: "Vendiste cosas viejas en Instagram y juntaste $35.000 en efectivo.", monto: 35000 },
      { situacion: "Papá te pagó por ayudarlo a limpiar el patio durante el fin de semana: $40.000.", monto: 40000 },
      { situacion: "Tu tío te visitó y te dejó $60.000 'para lo que necesites'. Es lunes.", monto: 60000 },
    ];
    const pool13_16 = [
      { situacion: "Terminaste tu primer mes trabajando los fines de semana en una feria: $120.000.", monto: 120000 },
      { situacion: "Tu abuelo te transfirió $100.000 para 'que aprendas a manejarte'.", monto: 100000 },
      { situacion: "Vendiste ropa usada y electrodomésticos viejos. Juntaste $90.000.", monto: 90000 },
      { situacion: "Cuidaste al perro del vecino dos semanas. Te pagaron $75.000.", monto: 75000 },
      { situacion: "Tus papás te dieron $150.000 para los gastos del mes. Tú administras.", monto: 150000 },
    ];
    const pool = edad <= 12 ? pool10_12 : pool13_16;
    const ctx = pool[Math.floor(Math.random() * pool.length)];

    return `ESTADO DEL JUGADOR:
- Edad: ${edad} años (grupo ${edadGroup})
- Situación de inicio: ${ctx.situacion}
- Saldo disponible: $${ctx.monto.toLocaleString("es-CL")}
- Concepto a enseñar: DINERO (escasez, el dinero se gasta una sola vez)
- Próximos conceptos: ${secuencia.slice(0, 5).join(" → ")} → ...

INSTRUCCIONES:
Parte exactamente de la situación de inicio. El dilema debe ser GENUINO — ambas opciones son formas válidas de usar ese dinero con consecuencias distintas. NO hay opción obviamente mala.
- Usa el monto exacto: $${ctx.monto.toLocaleString("es-CL")}
- Precios REALISTAS según tabla del system prompt
- El dilema NO puede ser "gastar vs no gastar" — debe ser entre DOS usos distintos del dinero
- Presión de tiempo o social: ¿por qué decidir HOY?
- Al menos 2 personajes con nombres propios
- Un primer objetivo concreto para el siguiente turno
- Tono ${edadGroup === "10-12" ? "simple, mundo colegio/familia/barrio" : edadGroup === "12-13" ? "más maduro, primeras salidas solos, redes sociales" : "directo y realista, trabajo part-time, independencia"}

Responde como JSON puro válido. Sin markdown.`;
  }

  const historialText = (input.historialDecisiones || []).length > 0
    ? `\nHISTORIAL (los personajes RECUERDAN):\n${input.historialDecisiones!.map(d =>
        `- Turno ${d.turno}: "${d.textoJugador}" (concepto: ${d.conceptoIdentificado})`
      ).join("\n")}`
    : "";

  const alertasText = alertas.length > 0 ? `\nALERTAS:\n${alertas.join("\n")}` : "";

  return `ESTADO ACTUAL:
- Edad: ${edad} años | Turno: ${input.turno || 1}/10
- Saldo: $${saldo.toLocaleString("es-CL")} | Deudas: $${deudas.toLocaleString("es-CL")}
- Familia: ${familia}/100 | Amigos: ${amigos}/100
- Concepto actual: ${input.conceptoActual || "dinero"}
- Conceptos aprendidos: ${conceptosAprendidos.join(", ") || "ninguno"}
- Siguiente concepto sugerido: ${conceptoSugerido}
- Objetivo actual: "${input.objetivoActual || "ninguno"}"${historialText}${alertasText}

EL JUGADOR DECIDIÓ: "${input.respuestaJugador}"

GENERA en orden:
1. NARRACIÓN de consecuencias (2-3 párrafos vívidos, personajes reaccionan, historial afecta)
2. IMPACTO numérico (saldoNuevo, deudasNuevas, relacionesFamiliaNueva, relacionesAmigosNueva)
3. PUNTOS: 0-100 por sabiduría real (responsable=70-100, impulsivo=20-50, destructivo=0-20)
4. PAUSA EDUCATIVA si acaba de vivir ${conceptoSugerido} (personaje explica con ejemplo exacto vivido)
5. OBJETIVO para siguiente turno (concreto, con recompensa y consecuencia narrativa)
6. ESCENARIO SIGUIENTE (referencia lo que pasó, introduce ${conceptoSugerido}, dilema genuino)
${alertas.length > 0 ? "   IMPORTANTE: refleja la crisis en el siguiente escenario" : ""}

Responde como JSON puro válido. Sin markdown.`;
}

function buildMentorPrompt(input: GameRequest): string {
  const conceptos = input.conceptosAprendidosArray || [];
  const decisiones = input.historialDecisiones || [];

  return `Actúa como mentor financiero post-partida para un joven en Chile.

REGLAS:
- Responde SOLO sobre lo aprendido en esta partida.
- No recalcules saldo, deuda, puntos ni salud. Esos datos ya son definitivos.
- No introduzcas temas que no aparecieron en conceptos o decisiones.
- Si la pregunta se sale de la partida, redirige con cariño hacia un concepto visto.
- Lenguaje simple, concreto, máximo 4 oraciones.
- Cierra con una acción práctica que el jugador podría aplicar en la vida diaria.

RESUMEN DE PARTIDA:
- Edad: ${input.edad || "no indicada"}
- Puntaje final: ${input.puntuacionTotal ?? 0}
- Saldo final: $${(input.saldoActual ?? 0).toLocaleString("es-CL")}
- Deuda final: $${(input.deudasActuales ?? 0).toLocaleString("es-CL")}
- Relación familia: ${input.relacionesFamilia ?? 0}/100
- Relación amigos: ${input.relacionesAmigos ?? 0}/100
- Conceptos vistos: ${conceptos.join(", ") || "ninguno registrado"}
- Decisiones:
${decisiones.map(d => `  - Turno ${d.turno}: "${d.textoJugador}" | concepto: ${d.conceptoIdentificado} | puntos: ${d.puntos}`).join("\n") || "  - Sin decisiones registradas"}

PREGUNTA DEL JUGADOR:
"${input.preguntaMentor || "Resume lo que aprendí."}"

Responde como JSON puro válido:
{
  "answer": "respuesta del mentor",
  "suggestions": ["pregunta sugerida 1", "pregunta sugerida 2", "pregunta sugerida 3"]
}`;
}

function buildLocalMentor(input: GameRequest) {
  const conceptos = input.conceptosAprendidosArray || [];
  const deuda = input.deudasActuales ?? 0;
  const saldo = input.saldoActual ?? 0;
  const conceptoPrincipal = conceptos[conceptos.length - 1] || conceptos[0] || "presupuesto";
  const estado = deuda > saldo
    ? "Tu partida mostró que la deuda puede quitarte margen aunque una decisión parezca resolver el momento."
    : "Tu partida mostró que decidir antes de gastar te deja más margen para elegir después.";

  return {
    answer: `${estado} Lo más importante que viste fue ${conceptoPrincipal.replace(/_/g, " ")}: mirar el costo completo de una decisión, no solo si puedes pagarla ahora. Para llevarlo a la vida real, antes de comprar algo separa primero lo necesario y decide un límite para lo demás.`,
    suggestions: [
      "¿Qué decisión me costó más?",
      "¿Cómo evito endeudarme?",
      "¿Qué concepto debería recordar?"
    ]
  };
}

function buildLocalGameMaster(input: GameRequest) {
  const edad = input.edad || 13;

  if (input.fase === "init") {
    const initialSaldo = edad <= 12 ? 50000 : 120000;
    return {
      message: `Es viernes por la tarde y acabas de recibir $${initialSaldo.toLocaleString("es-CL")}. En el chat del curso todos hablan de juntarse en el mall, pero en la casa también quedó pendiente comprar algo que necesitas para la semana.\n\nTienes la plata en la mano y una decisión simple que no se siente tan simple: usarla para pasarlo bien ahora o guardarte margen para no quedar justo después.`,
      conceptoEnsenado: "dinero",
      puntos: 0,
      escenario: {
        narracion: `Es viernes por la tarde y acabas de recibir $${initialSaldo.toLocaleString("es-CL")}. En el chat del curso todos hablan de juntarse en el mall, pero en la casa también quedó pendiente comprar algo que necesitas para la semana.\n\nTienes la plata en la mano y una decisión simple que no se siente tan simple: usarla para pasarlo bien ahora o guardarte margen para no quedar justo después.`,
        opciones: [
          { id: "opcion_a", texto: "Ir al mall, pero poner un límite de gasto antes de salir.", consecuenciaHint: "Controlas el impulso sin aislarte." },
          { id: "opcion_b", texto: "Comprar primero lo necesario y ver cuánto queda para juntarte.", consecuenciaHint: "Priorizas estabilidad, pero puede costar socialmente." }
        ],
        concepto: "dinero",
        ubicacion: "casa",
        turno: 1,
        personajes: [
          { nombre: "Mamá", rol: "familia", estadoEmocional: "atenta" },
          { nombre: "Tomás", rol: "amigo", estadoEmocional: "entusiasmado" }
        ],
      },
      saludFinanciera: {
        valor: 70,
        saldo: initialSaldo,
        deudas: 0,
        relacionesFamilia: 75,
        relacionesAmigos: 70,
        alerta: null
      },
      objetivoActual: {
        descripcion: "Termina el próximo turno con al menos la mitad de tu dinero disponible.",
        recompensa: "Ganas confianza para decidir sin presión.",
        consecuenciaSiFalla: "Quedas con menos margen para imprevistos."
      }
    };
  }

  const decision = input.respuestaJugador || "tomar una decisión";
  const economy = computeEconomy(input);
  const concepto = input.conceptoActual || "presupuesto";
  const nextTurn = Math.min(10, (input.turno || 1) + 1);

  return {
    message: `Elegiste ${decision}. La decisión se nota al tiro: te queda $${economy.saldoNuevo.toLocaleString("es-CL")} y empiezas a mirar el resto de la semana con otros ojos.\n\nNo fue solo mover plata; fue decidir cuánto control querías conservar para lo que viene. La gente alrededor reacciona distinto, pero ahora tienes más claro que cada peso usado deja menos espacio para otra cosa.`,
    conceptoEnsenado: concepto,
    puntos: economy.puntos,
    escenario: {
      narracion: `Al día siguiente aparece una nueva presión: hay una actividad con amigos, pero también un gasto chico que no habías considerado. Parece menor, hasta que miras tu saldo.\n\nLa pregunta ya no es si puedes gastar, sino si ese gasto calza con el objetivo que te pusiste.`,
      opciones: [
        { id: "opcion_a", texto: "Comparar precios y elegir la opción más barata.", consecuenciaHint: "Cuidas saldo sin cancelar todo." },
        { id: "opcion_b", texto: "Pagar rápido para no quedar mal con el grupo.", consecuenciaHint: "Mantienes el ritmo social, pero pierdes margen." }
      ],
      concepto: "presupuesto",
      ubicacion: "colegio",
      turno: nextTurn,
      personajes: [
        { nombre: "Tomás", rol: "amigo", estadoEmocional: "apurado" },
        { nombre: "Mamá", rol: "familia", estadoEmocional: "observadora" }
      ],
    },
    saldoNuevo: economy.saldoNuevo,
    deudasNuevas: economy.deudasNuevas,
    relacionesFamiliaNueva: economy.relacionesFamiliaNueva,
    relacionesAmigosNueva: economy.relacionesAmigosNueva,
    saludFinanciera: economy.saludFinanciera,
    pausaEducativa: {
      concepto: "presupuesto",
      quienExplica: "Mamá",
      explicacion: "Presupuesto no es dejar de vivir, es decidir antes para que la plata no decida por ti después. Hoy viste que gastar sin mirar el resto de la semana te deja con menos libertad.",
      preguntaReflexiva: "¿Qué gasto chico te ha dejado apretado alguna vez?"
    },
    objetivoActual: buildNextObjective(input, economy),
    objetivoLogrado: economy.objetivoLogrado,
    transicion: "La semana sigue y la presión cambia de forma.",
    proximoConcepto: "presupuesto",
    consecuencias: "La decisión impactó tu saldo y tu margen para el siguiente turno."
  };
}

export async function POST(req: Request) {
  const input: GameRequest = await req.json();

  const availableProviders = PROVIDERS.filter(p => p.key());
  if (availableProviders.length === 0) {
    return NextResponse.json(input.fase === "mentor" ? buildLocalMentor(input) : buildLocalGameMaster(input), { status: 200 });
  }

  const userPrompt = input.fase === "mentor" ? buildMentorPrompt(input) : buildPrompt(input);
  let content = "";

  for (const provider of availableProviders) {
    try {
      const body: Record<string, unknown> = {
        model: provider.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.75,
        max_tokens: 3500,
      };
      if (provider.supportsJsonMode) {
        body.response_format = { type: "json_object" };
      }

      const response = await fetch(provider.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.key()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[${provider.name}] ${response.status}: ${errText}`);
        continue;
      }

      const data = await response.json();
      content = data.choices?.[0]?.message?.content || "";
      console.log(`[GM] responded via ${provider.name}`);
      break;
    } catch (err) {
      console.warn(`[${provider.name}] fetch failed:`, err);
      continue;
    }
  }

  if (!content) {
    return NextResponse.json(input.fase === "mentor" ? buildLocalMentor(input) : buildLocalGameMaster(input), { status: 200 });
  }

  let gm: Record<string, unknown>;
  try {
    const jsonStr = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    gm = JSON.parse(jsonStr);
  } catch {
    console.error("JSON parse failed:", content.slice(0, 200));
    return NextResponse.json(input.fase === "mentor" ? buildLocalMentor(input) : buildLocalGameMaster(input), { status: 200 });
  }

  if (input.fase === "mentor") {
    return NextResponse.json({
      answer: typeof gm.answer === "string" ? gm.answer : buildLocalMentor(input).answer,
      suggestions: Array.isArray(gm.suggestions) ? gm.suggestions.slice(0, 3) : buildLocalMentor(input).suggestions,
    });
  }

  const narracion = (gm.narracion as string) || (gm.narración as string) || "";
  const escSig = gm.escenarioSiguiente as Record<string, unknown> | undefined;
  const economy = input.fase === "evaluar_decision" ? computeEconomy(input) : null;
  const nextObjective = economy ? buildNextObjective(input, economy) : gm.objetivoActual;

  return NextResponse.json({
    message: narracion,
    conceptoEnsenado: gm.conceptoEnsenado,
    puntos: economy?.puntos ?? clampNumber(gm.puntos, 0, 100, 0),
    escenario: {
      narracion: (escSig?.narracion as string) || (escSig?.narración as string) || narracion,
      opciones: escSig?.opciones || gm.opciones,
      concepto: (escSig?.conceptoEnsenado as string) || (gm.conceptoEnsenado as string),
      ubicacion: (escSig?.ubicacion as string) || (gm.ubicacion as string),
      turno: escSig?.turno,
      personajes: escSig?.personajes,
    },
    saldoNuevo: economy?.saldoNuevo ?? gm.saldoNuevo,
    deudasNuevas: economy?.deudasNuevas ?? gm.deudasNuevas,
    relacionesFamiliaNueva: economy?.relacionesFamiliaNueva ?? gm.relacionesFamiliaNueva,
    relacionesAmigosNueva: economy?.relacionesAmigosNueva ?? gm.relacionesAmigosNueva,
    saludFinanciera: economy?.saludFinanciera ?? gm.saludFinancieraNueva ?? gm.saludFinanciera,
    pausaEducativa: gm.pausaEducativa,
    objetivoActual: nextObjective,
    objetivoLogrado: economy?.objetivoLogrado ?? gm.objetivoLogrado,
    transicion: gm.transicion,
    proximoConcepto: gm.proximoConcepto,
    consecuencias: gm.consecuencias,
  });
}
