# 10 Historias de Usuario: Beeper Financiero Pro

Este documento define las necesidades de los usuarios mediante Historias de Usuario (User Stories), detallando los criterios de aceptación para cada una.

## 👥 Personas y Roles
*   **Don Manuel (Segmento Silver):** Adulto mayor de 72 años, pensionado. Teme los cobros bancarios que no entiende y prefiere interfaces simples con audio.
*   **Claudia (Usuario Bancarizado):** Profesional de 35 años. Tiene múltiples tarjetas y poco tiempo para auditar sus cartolas manualmente.
*   **Roberto (Microempresario):** Usa tarjetas de retail para su negocio. Es vulnerable a las altas comisiones de mantención y seguros atados.

---

## 📋 Historias de Usuario

### HU01: Alerta Proactiva (Sentinel)
**Como** Claudia,  
**quiero** recibir una notificación inmediata cuando se detecte un cargo sospechoso en mi cuenta,  
**para** poder actuar antes de que el cobro se consolide y no tenga que revisar cartolas a fin de mes.

*   **Criterios de Aceptación:**
    *   La notificación debe llegar en menos de 30 segundos tras la detección del cargo.
    *   La alerta debe mostrar el monto y una breve descripción del motivo de sospecha (ej. "Seguro Duplicado").
    *   Al pulsar la alerta, el sistema debe abrir directamente el diagnóstico detallado.

### HU02: Accesibilidad por Voz (Factor Abuelo)
**Como** Don Manuel,  
**quiero** que el sistema me lea los resultados de la auditoría en voz alta,  
**para** entender mis derechos sin tener que forzar la vista leyendo términos legales complejos.

*   **Criterios de Aceptación:**
    *   Debe existir un botón "OÍR" claramente visible y con alto contraste.
    *   La lectura debe usar un lenguaje natural y pausado.
    *   El reporte debe evitar siglas técnicas (ej. dirá "Costo Real" en lugar de "CAE").

### HU03: Acción Legal Inmediata
**Como** Roberto,  
**quiero** generar una carta de renuncia legal automáticamente tras detectar un abuso,  
**para** recuperar mi dinero sin tener que pagar a un abogado o buscar plantillas en internet.

*   **Criterios de Aceptación:**
    *   La carta debe incluir los datos de la institución y el artículo legal infringido.
    *   El usuario debe poder descargar la carta en formato PDF profesional.
    *   Debe existir una opción para copiar el texto para envío vía email o WhatsApp.

### HU04: Soberanía y Escudo de Datos
**Como** Usuario preocupado por la privacidad,  
**quiero** decidir exactamente qué datos financieros se envían a la IA para su análisis,  
**para** mantener mi privacidad y cumplir con mis derechos de protección de datos.

*   **Criterios de Aceptación:**
    *   El botón de "Escudo" debe estar accesible en todo momento.
    *   El sistema debe mostrar un aviso de anonimización (Scrubbing) antes de procesar.
    *   El usuario debe poder descargar su historial de auditorías en un formato portable (JSON).

### HU05: Asistencia en Negociación (Coach Mode)
**Como** Claudia,  
**quiero** tener un asistente de bolsillo mientras hablo con un ejecutivo bancario,  
**para** saber qué preguntas hacer y no ser engañada con ventas atadas.

*   **Criterios de Aceptación:**
    *   El sistema debe ofrecer un checklist específico según el producto seleccionado.
    *   Debe alertar sobre frases típicas de ventas abusivas (ej. "Es obligatorio para la tasa").
    *   Debe entregar al menos tres consejos de defensa legal en tiempo real.

---

## 📈 Priorización (MoSCoW)
*   **Must Have:** HU01 (Alertas), HU03 (Cartas Legales), HU04 (Privacidad).
*   **Should Have:** HU02 (Voz), HU05 (Coach Mode).
*   **Could Have:** Gamificación del ahorro acumulado.
*   **Won't Have:** Realización de transferencias bancarias desde el Beeper.

---
**Oriundo Beeper Division**  
*Ingeniería Orientada al Usuario y al Impacto Social.*
