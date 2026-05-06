# Plan de Integración: Gemini + Google Wallet

Este plan detalla la transición al motor de IA de **Google Gemini** y la integración técnica con **Google Wallet** para el Beeper Financiero.

---

## 1. Integración de Gemini API (IA)

### Objetivo
Sustituir el motor de análisis actual por Gemini 1.5 Flash/Pro para aprovechar su mayor ventana de contexto y eficiencia.

### Pasos Técnicos:
1.  **Configuración de Variable de Entorno:**
    - Agregar `GOOGLE_GENERATIVE_AI_API_KEY` en `.env.local`.
2.  **Refactorización de `api/analyze/route.ts`:**
    - Importar `@google/generative-ai`.
    - Inicializar el modelo `gemini-1.5-flash`.
    - Adaptar el prompt del sistema para el formato de Gemini.
    - Mantener el esquema de validación `Zod` para asegurar que la salida de Gemini sea compatible con el frontend.
3.  **Mantenimiento de Resiliencia:**
    - Mantener el "Modo Mock" como fallback si la API de Gemini falla.

---

## 2. Conexión con Google Wallet (Sentinel Pass)

### Objetivo
Permitir que el usuario lleve su "Estado de Salud Financiera" y sus alertas activas directamente en su teléfono mediante un pase genérico de Google Wallet.

### Arquitectura de la Integración:
1.  **Google Wallet API (Google Pay Business Console):**
    - Configurar un `Issuer ID` en la consola de Google Pay.
    - Definir una `GenericClass` para el "Beeper Financial Pass".
2.  **Generación de Objetos (Backend):**
    - Crear un endpoint `/api/wallet/generate` que:
        - Reciba los hallazgos de la auditoría.
        - Firme un JWT (JSON Web Token) con los datos del pase (ahorro detectado, nivel de riesgo, nombre del titular).
        - Devuelva el link de guardado ("Add to Google Wallet").
3.  **Botón Frontend:**
    - Implementar el botón oficial "Add to Google Wallet" en la vista de resultados (`AlertCard.tsx`).
    - Al hacer clic, redirigir al usuario al link generado para guardar su pase.

### Atributos del Pase en el Wallet:
- **Header:** Nivel de Salud (Ej: "Protegido", "En Riesgo").
- **Campos Principales:** Ahorro Anual Detectado ($).
- **Notificaciones:** Posibilidad de enviar mensajes push al pase cuando el Beeper detecte un nuevo cobro sospechoso.

---

## 3. Cronograma de Ejecución
1.  **Fase 1:** Conexión Gemini (Hoy).
2.  **Fase 2:** Creación de credenciales de Google Wallet API.
3.  **Fase 3:** Implementación del generador de pases (JWT).
4.  **Fase 4:** Pruebas de guardado en dispositivo móvil.

---
**¿Deseas que procedamos primero con el cambio de código a Gemini?** Necesitaré que proporciones la API Key si ya la tienes, o puedo dejar la estructura lista para que la pegues.
