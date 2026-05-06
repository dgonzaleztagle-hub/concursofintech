# 02 Arquitectura Técnica: Sistema Beeper Pro

## 1. Diseño del Sistema
El sistema utiliza una arquitectura moderna basada en **Next.js 14**, con un enfoque en la resiliencia y la seguridad.

### Componentes Core:
*   **Frontend:** React 18 con Tailwind CSS, utilizando un sistema de diseño "Retro-LCD" para reducir la carga cognitiva.
*   **Backend:** API Routes de Next.js, actuando como orquestador entre el usuario y los modelos de IA.
*   **Motor de IA:** Integración dual con Anthropic (Claude 3.5) y Google Gemini (1.5 Flash).

## 2. Flujo de Datos (Data Pipeline)
1.  **Detección:** Notificación vía Wallet API o carga manual de datos.
2.  **Anonimización:** Middleware de seguridad que limpia datos PII (RUT, nombres).
3.  **Análisis Contextual:** Inyección de valor UF real y reglas MCP.
4.  **Validación Estructural:** Uso de **Zod** para garantizar que la respuesta de la IA sea procesable por la interfaz.

## 3. Integración con Billeteras (Wallet Integration)
*   **Google Wallet:** Generación de JWT firmados (RS256) para actualizar el "Financial Health Pass".
*   **Apple Wallet:** Soporte para notificaciones push silenciosas y Siri integration.
*   **Sincronización:** El pase en el wallet refleja en tiempo real el estado de salud financiera (`Protegido`, `Alerta`, `En Riesgo`).

## 4. Estrategia MCP (Model Context Protocol)
El Beeper implementa un servidor de herramientas y recursos (MCP Server) para:
*   **Tools:** Cálculos deterministas de CAE y tasas, validación de RUTs.
*   **Resources:** Acceso a circulares de la CMF y bases de datos legales actualizadas.
*   **Objetivo:** Eliminar alucinaciones y asegurar que la IA cite fuentes de verdad verificables.

## 5. Seguridad y Privacidad
*   **PII Scrubbing:** Reemplazo de datos sensibles por identificadores genéricos (`USUARIO_PROTEGIDO`) antes de la inferencia.
*   **Cifrado:** Cifrado en reposo (AES-256) y transporte (TLS 1.3).
*   **Soberanía:** "Pasaporte de Soberanía" que otorga portabilidad real de los datos auditados al usuario.

---
**Documento de Referencia:** `ARQUITECTURA_BILLETERAS.md`, `ESTRATEGIA_MCP_BEEPER.md`, `AUDITORIA_SISTEMA_TECNICA.md`
