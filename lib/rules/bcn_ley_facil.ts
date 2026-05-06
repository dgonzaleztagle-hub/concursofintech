/**
 * @file bcn_ley_facil.ts
 * @description Conocimiento curado de leyes chilenas en lenguaje ciudadano (Simulando API BCN Ley Fácil).
 * Fuente: Legal Brain wiki — leyes procesadas y sintetizadas artículo por artículo.
 */

export interface LegalGuide {
  id: string;
  ley: string;
  resumen: string;
  derechos_clave: string[];
  articulos_clave?: Array<{ articulo: string; implicancia: string }>;
  terminos_ciudadanos: Record<string, string>;
}

export const BCN_LEY_FACIL_DB: LegalGuide[] = [
  // ── CAPA BASE: Derechos del Consumidor ───────────────────────────────────
  {
    id: "LEY_PROTECCION_CONSUMIDOR",
    ley: "Ley N° 19.496 (modificada por Ley 20.555 — SERNAC Financiero)",
    resumen: "Base transversal de derechos del consumidor. La reforma SERNAC Financiero (20.555) incorporó los artículos 17A a 17L que regulan específicamente productos y servicios financieros: contratos de adhesión, transparencia de cargos, retracto y publicidad.",
    derechos_clave: [
      "Información veraz y oportuna antes de contratar",
      "No discriminación arbitraria al acceder a productos financieros",
      "Retracto de 10 días hábiles en contrataciones a distancia o en reunión convocada por el proveedor (Art. 3 bis)",
      "Clausulas abusivas sin efecto: cambios unilaterales, recargos no aceptados, mandatos en blanco (Art. 16)",
      "Copia íntegra del contrato y legibilidad garantizada (Art. 17)",
      "Desglose obligatorio de cargos, comisiones y tarifas en contratos financieros (Art. 17B)",
      "Cambios de tarifa deben comunicarse con 30 días hábiles de anticipación y basarse en condiciones objetivas (Art. 17B)",
      "Prohibición de mandatos irrevocables o en blanco (Art. 17B)",
      "Derecho a recibir información de costo total y CAE en máximo 3 días hábiles (Art. 17D)",
      "Prohibición de alterar precios o forzar nuevo contrato vía renovación de soporte (Art. 17D)",
      "CAE obligatorio en publicidad cuando se informe cuota o tasa; cotizaciones vigentes mínimo 7 días hábiles (Art. 17G)",
      "Sanciones directas por publicidad o información financiera que induzca a error y sea determinante para contratar (Art. 17L)"
    ],
    articulos_clave: [
      { articulo: "Art. 3 bis", implicancia: "Retracto unilateral de 10 días en contrataciones remotas o en reuniones convocadas por el proveedor. Omitir este derecho es infracción." },
      { articulo: "Art. 12", implicancia: "El proveedor debe cumplir exactamente las condiciones ofrecidas. Cobros o plazos distintos a los prometidos son ilegales." },
      { articulo: "Art. 16", implicancia: "Son nulas las cláusulas que permitan cambios unilaterales abusivos, recargos no aceptados por separado, inversión de carga probatoria o espacios en blanco." },
      { articulo: "Art. 17B", implicancia: "Contratos financieros deben desglosar todos los cargos y comisiones; cambios de tarifa requieren 30 días hábiles de aviso previo. Productos conexos obligatorios y voluntarios deben estar claramente diferenciados." },
      { articulo: "Art. 17D", implicancia: "El banco tiene 3 días hábiles para entregar información de costo total si el cliente la solicita. Está prohibido usar renovación de cartola/soporte para subir precios o forzar nuevo contrato." },
      { articulo: "Art. 17G", implicancia: "Toda publicidad de crédito que mencione cuota o tasa debe incluir el CAE con igual visibilidad. Las cotizaciones deben tener vigencia mínima de 7 días hábiles." },
      { articulo: "Art. 17L", implicancia: "Si la información o publicidad financiera indujo a error y fue determinante para contratar, activa multas del Art. 24 e indemnización." },
    ],
    terminos_ciudadanos: {
      "CAE": "Costo Anual Equivalente: el costo real total del crédito expresado como porcentaje anual, incluye tasa, seguros y comisiones.",
      "Contrato de adhesión": "Contrato cuyas cláusulas define solo el banco; tú solo puedes aceptar o rechazar en bloque.",
      "Retracto": "Tu derecho a arrepentirte y anular un contrato firmado, dentro del plazo legal, sin dar explicaciones.",
      "Mandato en blanco": "Autorización que te hacen firmar sin límites definidos — está prohibido por ley.",
      "SERNAC Financiero": "División de SERNAC especializada en productos financieros; puede mediar en conflictos con bancos y casas comerciales."
    }
  },
  // ── CAPA SECTORIAL: Fintech y Open Finance ───────────────────────────────
  {
    id: "LEY_FINTECH",
    ley: "Ley N° 21.521",
    resumen: "Marco legal para empresas de tecnología financiera. Establece que tus datos financieros son tuyos y puedes moverlos entre plataformas (Open Finance). La CMF regula el registro y operación de prestadores Fintech.",
    derechos_clave: [
      "Derecho a la información clara sobre costos y condiciones",
      "Portabilidad de datos financieros entre instituciones (Open Finance)",
      "Protección de datos personales con estándares sectoriales",
      "Las plataformas Fintech deben registrarse en CMF y operar con normas equivalentes a bancos"
    ],
    terminos_ciudadanos: {
      "Open Finance": "Tus datos financieros te pertenecen y puedes autorizar que pasen de un banco o Fintech a otro fácilmente.",
      "Prestador Fintech": "Empresa tecnológica autorizada por la CMF para ofrecer servicios financieros (pagos, créditos, inversiones).",
      "Crowdfunding": "Financiamiento colectivo: muchas personas aportan pequeños montos a un proyecto vía plataforma digital."
    }
  },
  // ── CAPA CONSUMIDOR REFORZADO ─────────────────────────────────────────────
  {
    id: "LEY_PRO_CONSUMIDOR",
    ley: "Ley N° 21.398",
    resumen: "Refuerza la protección de los consumidores financieros. Exige a los bancos analizar tu solvencia antes de darte un crédito para evitar que te sobreendeudes. También amplía garantías y facilita el cierre de contratos.",
    derechos_clave: [
      "Análisis de solvencia obligatorio antes de otorgar cualquier crédito",
      "Garantía legal ampliada a 6 meses para bienes y servicios",
      "Derecho a cerrar contratos y cancelar productos sin trabas ni trabas burocráticas",
      "Las instituciones deben informar explícitamente el CAE al momento de ofrecer cualquier crédito"
    ],
    terminos_ciudadanos: {
      "Solvencia": "Capacidad de pagar una deuda sin quedar sin dinero para vivir — el banco debe verificarla antes de darte crédito.",
      "CAE": "Costo Anual Equivalente: el precio real completo del crédito, incluyendo todos los cargos.",
      "Garantía legal": "Tu derecho a reparación o devolución de un producto defectuoso, ahora por 6 meses."
    }
  },
  // ── CAPA DATOS PERSONALES ────────────────────────────────────────────────
  {
    id: "LEY_PROTECCION_DATOS",
    ley: "Ley N° 19.628 / 21.719",
    resumen: "Regula cómo las empresas usan tu información personal. La nueva ley 21.719 (2024) crea sanciones reales para quienes filtren tus datos y fortalece los derechos ARCO del titular.",
    derechos_clave: [
      "Acceso a todos tus datos que tenga una institución (Derecho de Acceso)",
      "Rectificación de datos incorrectos (Derecho de Rectificación)",
      "Cancelación o eliminación de datos cuando ya no sean necesarios (Derecho de Cancelación)",
      "Oposición al uso de tus datos para fines no autorizados (Derecho de Oposición)",
      "Sanciones reales para instituciones que filtren o mal usen tus datos (Ley 21.719)"
    ],
    terminos_ciudadanos: {
      "Derechos ARCO": "Tus derechos a Acceder, Rectificar, Cancelar u Oponerte al uso de tus datos personales.",
      "Tratamiento de datos": "Cualquier uso que una empresa hace de tu información: almacenar, analizar, compartir o vender.",
      "Consentimiento": "Tu permiso explícito para que usen tus datos — debe ser libre, informado y revocable."
    }
  },
  // ── CAPA DEUDA CONSOLIDADA ───────────────────────────────────────────────
  {
    id: "LEY_DEUDA_CONSOLIDADA",
    ley: "Ley N° 21.680",
    resumen: "Crea un registro oficial de deuda consolidada supervisado por la CMF. Permite a instituciones financieras ver la deuda total de un cliente para hacer evaluaciones crediticias más precisas y justas.",
    derechos_clave: [
      "El registro solo puede usarse para evaluación crediticia y supervisión, no para perfilamiento amplio",
      "Como titular tienes derecho a conocer qué información está reportada sobre ti",
      "Los datos del registro se tratan con normas específicas distintas al marco general de privacidad",
      "Puedes exigir corrección de datos erróneos reportados al registro"
    ],
    terminos_ciudadanos: {
      "Registro de deuda consolidada": "Base de datos oficial donde las instituciones reportan cuánto debes en total — te ayuda a evitar sobreendeudamiento.",
      "Evaluación crediticia": "Análisis que hace un banco o Fintech para decidir si te puede dar un crédito y en qué condiciones.",
      "CMF": "Comisión para el Mercado Financiero: el organismo del Estado que regula y supervisa bancos, Fintechs y aseguradoras."
    }
  },
  // ── CAPA FRAUDE Y CIBERCRIMEN ────────────────────────────────────────────
  {
    id: "LEY_DELITOS_INFORMATICOS",
    ley: "Ley N° 21.459",
    resumen: "Tipifica delitos informáticos y adecúa el marco penal al Convenio de Budapest. Regula acceso ilícito, interferencia de datos, alteración de sistemas y fraude informático. Es la base penal para fraude digital en servicios financieros.",
    derechos_clave: [
      "El acceso no autorizado a sistemas financieros es delito penal con cárcel",
      "La alteración o destrucción de datos sin autorización está tipificada",
      "El fraude informático (engaño mediante sistemas digitales para obtener beneficio económico) tiene penas específicas",
      "Las víctimas de fraude digital tienen derecho a denuncia y acción penal"
    ],
    terminos_ciudadanos: {
      "Fraude informático": "Cuando alguien usa un sistema digital para engañarte y obtener dinero o datos — es delito penal en Chile.",
      "Acceso ilícito": "Entrar sin permiso a un sistema informático o cuenta bancaria — delito tipificado.",
      "Phishing": "Engaño digital donde te hacen creer que estás en un sitio legítimo para robarte tus claves — sancionado penalmente."
    }
  }
];

export function getLegalPrompt(): string {
  return BCN_LEY_FACIL_DB.map(guide => {
    const articulosSection = guide.articulos_clave?.length
      ? `\nArtículos Clave:\n${guide.articulos_clave.map(a => `  • ${a.articulo}: ${a.implicancia}`).join("\n")}`
      : "";
    return `[${guide.ley}] ${guide.resumen}
Derechos Clave: ${guide.derechos_clave.join(" | ")}${articulosSection}
Términos: ${Object.entries(guide.terminos_ciudadanos).map(([k, v]) => `${k}: ${v}`).join("; ")}`;
  }).join("\n---\n");
}
