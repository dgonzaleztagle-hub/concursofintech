# 08 Análisis de Casos de Uso: Beeper Financiero Pro

Este documento detalla los escenarios de interacción entre los usuarios y el sistema, representados mediante diagramas de casos de uso y flujos detallados. Se ha actualizado para reflejar la implementación actual del sistema.

## 1. Diagrama General de Casos de Uso

```mermaid
useCaseDiagram
    actor "Usuario Bancarizado" as U
    actor "Sistema Beeper (Sentinel)" as S
    actor "Institución Financiera" as IF
    actor "IA (Sentinel Engine)" as IA

    package "Beeper Financiero Pro" {
        usecase "Auditoría Proactiva (Sentinel)" as UC1
        usecase "Auditoría Manual" as UC2
        usecase "Gestionar Soberanía de Datos" as UC3
        usecase "Empoderamiento Legal (Carta)" as UC4
        usecase "Modo Preventivo (Negociación)" as UC5
        usecase "Educación y Ciberseguridad" as UC6
    }

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6

    S --> UC1 : Dispara Alerta Push
    UC1 ..> IA : Análisis de Abuso
    UC2 ..> IA : Análisis de Cargo
    UC4 --> IF : Reclamo / Renuncia
    UC5 ..> IA : Guía de Negociación
    UC6 ..> IA : Tips de Protección
```

---

## 2. Descripción Detallada de Casos de Uso

### UC1: Auditoría Proactiva (Push Sentinel)
*   **Actor Principal:** Sistema Beeper (Sentinel) / Usuario.
*   **Pre-condición:** El usuario tiene activa la integración con su Billetera Digital (Google Wallet / Open Banking).
*   **Flujo Principal:**
    1. El Sistema detecta un cargo sospechoso (ej. seguro duplicado, comisión no informada) mediante el webhook de la Wallet o el feed de Open Banking.
    2. El Sistema emite una **Alerta Push** inmediata ("Detectamos un nuevo cobro de Seguro...").
    3. El Usuario pulsa la notificación, abriendo el Beeper directamente en la vista de análisis.
    4. El Sentinel Engine analiza el cargo en contexto con el perfil histórico y legal del usuario.
    5. Se muestra el diagnóstico de abuso y el ahorro potencial anual proyectado.
*   **Valor:** Elimina la pasividad del consumidor ante cobros hormiga y abusos automatizados.

### UC2: Auditoría Manual y Educación Contextual
*   **Actor Principal:** Usuario (especialmente Adulto Mayor).
*   **Pre-condición:** El usuario desea revisar un producto específico que no fue detectado automáticamente.
*   **Flujo Principal:**
    1. El Usuario selecciona el modo **MANUAL** en el selector de la pantalla principal.
    2. El Usuario elige el tipo de producto (Tarjeta, Crédito, etc.) y el seguro/cargo a auditar.
    3. El Sistema traduce los términos técnicos a lenguaje ciudadano y aplica reglas de negocio locales (CMF/SERNAC).
    4. El Usuario activa la opción **"OÍR"** (Voice Reporter) para recibir el reporte vía síntesis de voz.
*   **Valor:** Accesibilidad e inclusión para el segmento Silver, democratizando la defensa financiera.

### UC3: Gestión de Soberanía y Portabilidad
*   **Actor Principal:** Usuario (Dueño de los datos).
*   **Pre-condición:** El usuario desea controlar su privacidad o llevar sus datos a otra entidad.
*   **Flujo Principal:**
    1. El Usuario pulsa el botón de **"Escudo (🛡️)"** en la interfaz del Beeper.
    2. Se despliega el panel de **"Mi Soberanía"** con los consentimientos granulares.
    3. El Usuario ajusta permisos de procesamiento de IA o elimina su "Huella Digital".
    4. El Usuario selecciona **"Exportar Mi Pasaporte"** para descargar sus datos en formato JSON/PDF o guardarlos en Google Wallet.
*   **Valor:** Cumplimiento con la Ley 19.628 y empoderamiento sobre la propiedad del historial financiero.

### UC4: Empoderamiento Legal (Acción Inmediata)
*   **Actor Principal:** Usuario.
*   **Pre-condición:** Se ha detectado un abuso o "Red Flag" en una auditoría (UC1 o UC2).
*   **Flujo Principal:**
    1. El Usuario selecciona el botón **"SOLICITAR RENUNCIA"**.
    2. El Sistema genera una carta normalizada citando la Ley 19.496 y normativas específicas de la CMF.
    3. El Usuario puede:
        *   **Copiar** el texto para enviarlo por canales digitales del banco.
        *   **Descargar PDF** para entrega formal o respaldo legal.
*   **Valor:** Reduce la asimetría de poder y elimina el costo de entrada para ejercer derechos ciudadanos.

### UC5: Modo Preventivo (Coach de Negociación)
*   **Actor Principal:** Usuario.
*   **Pre-condición:** El usuario está cotizando un nuevo producto bancario.
*   **Flujo Principal:**
    1. El Usuario activa el modo **"PREVENTIVO"** antes de firmar un contrato.
    2. El Sistema despliega un checklist de preguntas críticas basadas en "Malas Prácticas" históricas.
    3. El Sistema entrega una orientación táctica (ej. "¿Me informaron la CAE?", "Derecho a retracto").
*   **Valor:** Prevención de abusos (ventas atadas) antes de que el consumidor quede atrapado en el contrato.

### UC6: Educación y Ciberseguridad (Cyber Tip)
*   **Actor Principal:** Usuario.
*   **Pre-condición:** El sistema detecta patrones de riesgo o el usuario solicita orientación.
*   **Flujo Principal:**
    1. Tras una auditoría, el Usuario pulsa **"CONSEJO DE SEGURIDAD"**.
    2. El Sistema entrega un tip específico sobre protección de identidad, phishing o seguridad transaccional vinculado al producto analizado.
*   **Valor:** Fortalece la resiliencia del ciudadano frente a fraudes digitales.

---

## 3. Resumen de Impacto

| Caso de Uso | Problema Resuelto | Beneficio Clave | Estado Actual |
| :--- | :--- | :--- | :--- |
| **Push Sentinel** | Inercia del consumidor | Ahorro en tiempo real | Implementado (Simulación) |
| **Manual Audit** | Complejidad bancaria | Educación y Accesibilidad | Implementado |
| **Soberanía** | Falta de control de datos | Portabilidad y Transparencia | Implementado |
| **Acción Legal** | Asimetría de poder | Recuperación de fondos | Implementado (PDF/Copy) |
| **Preventivo** | Ventas atadas | Prevención en el origen | Implementado |

---
**Oriundo Beeper Division**  
*Documentación de Procesos e Interacciones.*
