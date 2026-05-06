import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NIM_API_KEY = process.env.NIM_API_KEY;

const PROVIDERS = [
  {
    name: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    key: () => GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    supportsJsonMode: true,
  },
  {
    name: "nim",
    url: "https://integrate.api.nvidia.com/v1/chat/completions",
    key: () => NIM_API_KEY,
    model: "mistralai/mistral-nemotron",
    supportsJsonMode: false,
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
  fase: "init" | "evaluar_decision";
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
}

function getSecuenciaConceptos(edad: number): string[] {
  const n1 = ["dinero", "ingresos", "gastos", "necesidad_vs_deseo", "ahorro", "presupuesto", "costo_oportunidad", "gastos_hormiga"];
  const n2 = ["deuda", "tipos_prestamo", "interes_simple", "interes_compuesto", "tarjeta_credito", "cuota_amortizacion", "fondo_emergencia", "valor_vs_precio"];
  const n3 = ["seguro", "inflacion", "activo_vs_pasivo", "deuda_buena_vs_mala", "historial_crediticio", "impuesto", "inversion", "riesgo", "diversificacion", "fomo", "publicidad", "pension", "roi", "deuda_espiral", "cae", "derechos_financieros"];
  if (edad <= 11) return n1;
  if (edad <= 13) return [...n1, ...n2];
  return [...n1, ...n2, ...n3];
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

export async function POST(req: Request) {
  const input: GameRequest = await req.json();

  const availableProviders = PROVIDERS.filter(p => p.key());
  if (availableProviders.length === 0) {
    return NextResponse.json(
      { message: "No AI provider configured. Set GROQ_API_KEY or NIM_API_KEY." },
      { status: 500 }
    );
  }

  const userPrompt = buildPrompt(input);
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
        if (response.status === 429 || response.status === 503) continue;
        return NextResponse.json(
          { message: `AI error (${provider.name}): ${errText}` },
          { status: response.status }
        );
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
    return NextResponse.json(
      { message: "Todos los proveedores de IA están ocupados. Intenta en un momento." },
      { status: 503 }
    );
  }

  let gm: Record<string, unknown>;
  try {
    const jsonStr = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    gm = JSON.parse(jsonStr);
  } catch {
    console.error("JSON parse failed:", content.slice(0, 200));
    return NextResponse.json(
      { message: "Error interpretando la respuesta del Game Master. Intenta de nuevo." },
      { status: 500 }
    );
  }

  const narracion = (gm.narracion as string) || (gm.narración as string) || "";
  const escSig = gm.escenarioSiguiente as Record<string, unknown> | undefined;

  return NextResponse.json({
    message: narracion,
    conceptoEnsenado: gm.conceptoEnsenado,
    puntos: gm.puntos,
    escenario: {
      narracion: (escSig?.narracion as string) || (escSig?.narración as string) || narracion,
      opciones: escSig?.opciones || gm.opciones,
      concepto: (escSig?.conceptoEnsenado as string) || (gm.conceptoEnsenado as string),
      ubicacion: (escSig?.ubicacion as string) || (gm.ubicacion as string),
      turno: escSig?.turno,
      personajes: escSig?.personajes,
    },
    saldoNuevo: gm.saldoNuevo,
    deudasNuevas: gm.deudasNuevas,
    relacionesFamiliaNueva: gm.relacionesFamiliaNueva,
    relacionesAmigosNueva: gm.relacionesAmigosNueva,
    saludFinanciera: gm.saludFinancieraNueva || gm.saludFinanciera,
    pausaEducativa: gm.pausaEducativa,
    objetivoActual: gm.objetivoActual,
    objetivoLogrado: gm.objetivoLogrado,
    transicion: gm.transicion,
    proximoConcepto: gm.proximoConcepto,
    consecuencias: gm.consecuencias,
  });
}
