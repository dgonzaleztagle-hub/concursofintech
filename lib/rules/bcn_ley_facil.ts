/**
 * @file bcn_ley_facil.ts
 * @description Conocimiento curado de leyes chilenas en lenguaje ciudadano (Simulando API BCN Ley Fácil).
 */

export interface LegalGuide {
  id: string;
  ley: string;
  resumen: string;
  derechos_clave: string[];
  terminos_ciudadanos: Record<string, string>;
}

export const BCN_LEY_FACIL_DB: LegalGuide[] = [
  {
    id: "LEY_FINTECH",
    ley: "Ley N° 21.521",
    resumen: "Marco legal para empresas de tecnología financiera. Establece que tus datos financieros son tuyos y puedes moverlos entre plataformas (Open Finance).",
    derechos_clave: [
      "Derecho a la información clara",
      "Protección de datos personales",
      "Portabilidad de datos financieros"
    ],
    terminos_ciudadanos: {
      "Open Finance": "Tus datos financieros te pertenecen y puedes moverlos de un banco a otro fácilmente.",
      "Crowdfunding": "Invertir pequeñas sumas en proyectos de otras personas desde tu celular."
    }
  },
  {
    id: "LEY_PRO_CONSUMIDOR",
    ley: "Ley N° 21.398",
    resumen: "Refuerza la protección de los consumidores financieros. Exige a los bancos analizar tu solvencia antes de darte un crédito para evitar que te sobreendeudes.",
    derechos_clave: [
      "Análisis de solvencia obligatorio",
      "Garantía legal ampliada a 6 meses",
      "Derecho a cerrar contratos sin trabas"
    ],
    terminos_ciudadanos: {
      "Solvencia": "Capacidad de pagar una deuda sin quedar sin dinero para vivir.",
      "Garantía": "Tu derecho a que arreglen o cambien un producto que salió malo."
    }
  },
  {
    id: "LEY_PROTECCION_DATOS",
    ley: "Ley N° 19.628 / 21.719",
    resumen: "Regula cómo las empresas usan tu información personal. La nueva ley (2024) crea sanciones reales para quienes filtren tus datos.",
    derechos_clave: [
      "Acceso a tus datos",
      "Rectificación de errores",
      "Cancelación y Oposición (ARCO)"
    ],
    terminos_ciudadanos: {
      "Derechos ARCO": "Tus derechos a Acceder, Rectificar, Cancelar u Oponerte al uso de tus datos personales."
    }
  }
];

export function getLegalPrompt(): string {
  return BCN_LEY_FACIL_DB.map(guide => `
[${guide.ley}] ${guide.resumen}
Derechos Clave: ${guide.derechos_clave.join(", ")}
Términos: ${Object.entries(guide.terminos_ciudadanos).map(([k, v]) => `${k}: ${v}`).join("; ")}
  `).join("\n---\n");
}
