import { readFile } from "fs/promises";
import path from "path";

interface LegalBrainQuery {
  problemaReportado?: string;
  productType?: string;
  preventiveMode?: boolean;
}

const LEGAL_BRAIN_FILES = {
  map: ["Legal Brain", "wiki", "syntheses", "chile-financial-consumer-legal-map.md"],
  consumerMatrix: ["Legal Brain", "wiki", "syntheses", "ley-19496-article-matrix-consumidor-financiero.md"],
  consumerRights: ["Legal Brain", "wiki", "topics", "chile-consumer-finance-rights.md"],
  sernac: ["Legal Brain", "wiki", "topics", "chile-sernac-financiero.md"],
  cyberFraud: ["Legal Brain", "wiki", "topics", "chile-delitos-informaticos-21459.md"],
  cyberSecurity: ["Legal Brain", "wiki", "topics", "chile-ciberseguridad-anci-csirt.md"],
  dataProtection: ["Legal Brain", "wiki", "topics", "chile-data-protection-arco.md"],
  openFinance: ["Legal Brain", "wiki", "topics", "chile-fintech-open-finance.md"],
};

async function readLegalBrainFile(parts: string[]): Promise<string> {
  try {
    return await readFile(path.join(process.cwd(), ...parts), "utf8");
  } catch {
    return "";
  }
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function compactMarkdown(markdown: string, maxChars: number): string {
  return markdown
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxChars);
}

export async function getLegalBrainContextForAudit(query: LegalBrainQuery): Promise<string> {
  const problem = (query.problemaReportado || "").toLowerCase();
  const product = (query.productType || "").toLowerCase();
  const selected = new Set<keyof typeof LEGAL_BRAIN_FILES>([
    "map",
    "consumerMatrix",
    "consumerRights",
    "sernac",
  ]);

  if (includesAny(problem, ["fraude", "sospech", "desconoc", "no reconozco", "cargo", "monto", "tarjeta", "wallet"])) {
    selected.add("cyberFraud");
    selected.add("cyberSecurity");
  }

  if (includesAny(problem, ["dato", "rut", "correo", "mail", "cartola", "privacidad", "consentimiento"])) {
    selected.add("dataProtection");
  }

  if (query.preventiveMode || includesAny(problem + " " + product, ["credito", "crédito", "fintech", "open banking", "banco"])) {
    selected.add("openFinance");
  }

  const sections = await Promise.all(
    Array.from(selected).map(async (key) => {
      const content = await readLegalBrainFile(LEGAL_BRAIN_FILES[key]);
      if (!content) return "";
      return `## ${key}\n${compactMarkdown(content, key === "consumerMatrix" ? 4500 : 1800)}`;
    })
  );

  const context = sections.filter(Boolean).join("\n\n");

  if (!context) {
    return `
## Legal Brain fallback
- Tratar problemas reportados como hallazgos de auditoría que requieren curso de acción, no como casos descartados.
- Priorizar derechos de información clara, consentimiento, transparencia de cargos, reclamo ante proveedor, SERNAC/CMF y resguardo de evidencia.
- Si hay monto/cargo/seguro no reconocido, responder como hallazgo: qué se encontró, impacto estimado, fundamento legal y próximos pasos.
`.trim();
  }

  return context;
}
