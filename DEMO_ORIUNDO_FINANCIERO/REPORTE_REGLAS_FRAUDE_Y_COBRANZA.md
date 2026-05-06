# Reporte de Implementación: Ley de Fraudes y Cobranza Abusiva

**Proyecto:** Beeper Financiero Pro  
**Módulo:** Motor de Reglas de Negocio (Rules Engine)  
**Fecha:** 1 de Mayo, 2026  

---

## 1. Resumen Ejecutivo (Visión Pro)
El sistema Beeper Pro ha expandido su capacidad de auditoría más allá de los seguros bancarios para abordar dos de los problemas más críticos en la inclusión financiera en Chile: el **incumplimiento de la Ley de Fraudes** y el **acoso por cobranza extrajudicial**. Esta actualización permite que el sistema no solo sea un auditor preventivo, sino una herramienta de defensa activa para el ciudadano.

### Valor Agregado:
*   **Defensa del Patrimonio**: Garantiza que el usuario recupere sus fondos en los plazos legales tras un fraude.
*   **Protección de la Salud Mental**: Reduce el estrés financiero al alertar sobre llamadas de cobranza que superan los límites legales del SERNAC.

---

## 2. Detalle Técnico de la Implementación

### 2.1 Nuevas Reglas en el Registro (`registry.ts`)
Se han inyectado dos reglas de prioridad 1 y 2 en el motor de inferencia:

*   **RULE_LEY_FRAUDES (Ley 21.234)**: 
    *   *Lógica*: Verifica el cumplimiento de los 5 días hábiles para el reembolso de los primeros montos hasta 35 UF.
    *   *Mandato*: Generar alerta crítica si el banco dilata el proceso o exige condiciones no estipuladas en la ley.
*   **RULE_COBRANZA_ABUSIVA (Ley 19.496)**: 
    *   *Lógica*: Monitoreo de frecuencia (1 vez por semana) y horarios permitidos.
    *   *Mandato*: Identificar patrones de acoso y proponer la "Carta de Cese de Acoso".

### 2.2 Capa de Inclusión y Traducción (`inclusion_dictionary.ts`)
Se integró la traducción ciudadana para asegurar que el usuario entienda sus derechos sin barreras técnicas:
*   **Término Técnico**: "Cobranza Extrajudicial"
*   **Término Ciudadano**: "Acoso por Deuda"
*   **Explicación**: *"Cuando te llaman muchas veces o en horarios molestos para pedir que pagues, lo cual tiene límites legales."*

---

## 3. Alcance y Casos de Uso

### Caso A: El Beeper de Fraude
Cuando el usuario detecta una transferencia no reconocida, el Beeper inicia una cuenta regresiva. Si al quinto día el banco no ha reembolsado, el Beeper dispara una notificación push con la carta de reclamo lista para ser enviada a la CMF.

### Caso B: El Beeper de Privacidad
Ante llamadas repetitivas de departamentos de cobranza de retail, el usuario registra la interacción. El Beeper audita si se ha superado la frecuencia semanal permitida y activa el protocolo de denuncia ante el SERNAC.

---

## 4. Próximos Pasos de Integración
*   **Registro de Llamadas**: Implementar una interfaz sencilla para que el usuario "marque" cuándo recibió una llamada de cobranza.
*   **Timeline de Reembolso**: Un widget visual que muestre el progreso de los 5 días hábiles legales tras un fraude.

---
**Firma:**  
*Comité de Innovación y Cumplimiento - Beeper Financiero Pro*
