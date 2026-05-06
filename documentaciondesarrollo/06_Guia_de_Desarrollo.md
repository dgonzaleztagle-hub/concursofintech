# 06 Guía de Desarrollo: Stack y Roadmap

## 1. Stack Tecnológico
*   **Framework:** Next.js 14 (App Router).
*   **Lenguaje:** TypeScript (Strict Mode).
*   **Estilos:** Tailwind CSS con variables para diseño Retro-LCD.
*   **IA:** Anthropic Claude SDK / Google Generative AI SDK.
*   **Validación:** Zod.
*   **Testing:** Vitest.

## 2. Estructura de Archivos Críticos
*   `lib/llm/inclusion_framework.ts`: Motor de reglas MCP.
*   `lib/utils/security.ts`: Middleware de anonimización PII.
*   `lib/utils/letters.ts`: Generador de plantillas legales.
*   `app/api/analyze/route.ts`: Endpoint principal de auditoría dual.
*   `components/AlertCard.tsx`: UI unificada de resultados.

## 3. Guía de Refactorización
El sistema sigue principios de **Clean Architecture**:
*   Los Hooks (`useBeeperAudit`) gestionan el estado y los efectos.
*   Las utilidades (`lib/utils`) contienen la lógica pura y testeable.
*   Los tipos (`lib/types`) actúan como el contrato de verdad entre frontend y backend.

## 4. Configuración de Entorno (Producción)
Para habilitar funciones reales fuera del modo demo:
*   `GOOGLE_ISSUER_ID`: Para Google Wallet real.
*   `GOOGLE_PRIVATE_KEY`: Firma de pases digitales.
*   `ANTHROPIC_API_KEY` / `GEMINI_API_KEY`: Motores de IA productivos.

## 5. Roadmap de Desarrollo (Q3-Q4 2026)
1.  **Integración Directa SERNAC:** Envío automatizado de reclamos vía firma electrónica.
2.  **ML de Retroalimentación:** Ajuste de prompts basado en el éxito de las cartas enviadas.
3.  **Expansión Regulatoria:** Incluir seguros automotrices, de salud y pensiones.
4.  **Open Banking Real:** Conexión vía Fintoc/Floid para ingesta automática de cartolas.

---
**Documento de Referencia:** `DETALLE_REFACTORIZACION.md`, `INFORME_FINAL_DESARROLLO_SENIOR.md`, `PLAN_GEMINI_WALLET.md`
