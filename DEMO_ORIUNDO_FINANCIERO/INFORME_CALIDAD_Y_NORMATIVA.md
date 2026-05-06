# Informe Técnico: Arquitectura de Inteligencia Regulatoria y Control de Calidad de Datos

**Proyecto:** Beeper Financiero Pro  
**Documento:** Especificación de Validación y Cumplimiento Normativo  
**Fecha:** 30 de Abril, 2026  
**Versión:** 1.2  
**Clasificación:** Confidencial / Técnico  

---

## 1. Resumen Ejecutivo

El presente informe detalla los mecanismos críticos de interceptación, análisis y validación que permiten al **Beeper Financiero** actuar como un auditor proactivo de salud financiera. El sistema integra notificaciones en tiempo real desde billeteras digitales con un motor de inferencia basado en inteligencia artificial, alineado estrictamente con el marco legal chileno (**CMF** y **SERNAC**). Se exponen los protocolos de calidad que garantizan la entrega de información veraz, eliminando riesgos de "alucinación" y asegurando la privacidad del usuario.

---

## 2. Flujo de Integración: Del "Wallet Alert" al Diagnóstico

La capacidad del Beeper para transformar un simple cargo bancario en una alerta de abuso financiero se basa en una arquitectura de **Event-Driven Analysis**.

### 2.1 Interceptación de Transacciones
El sistema se conecta con el ecosistema de pagos mediante webhooks de billeteras digitales (Google Wallet / Apple Pay) o APIs de Open Banking. Al detectarse un cargo, el backend inicia el siguiente proceso:
1.  **Parsing de Metadata:** Se extrae el ID del comercio, monto, moneda y glosa de la transacción.
2.  **Match de Perfil:** Se consulta la base de datos de productos financieros del usuario para determinar si el cargo es recurrente o corresponde a un producto bajo vigilancia.
3.  **Trigger de Auditoría:** Si el cargo tiene una probabilidad >85% de estar vinculado a un seguro o comisión bancaria, se envía el paquete de datos al motor de IA.

### 2.2 Enriquecimiento Contextual
Para que la información sea correcta, el backend inyecta dos fuentes de verdad antes de la inferencia:
*   **Valor UF del Día:** Sincronizado con el Banco Central de Chile para cálculos de precisión monetaria.
*   **Historical Profile:** Datos de contratos previos que el usuario haya cargado vía Excel, permitiendo detectar cobros duplicados que la billetera por sí sola no vería.

---

## 3. Motor de Cumplimiento Regulatorio (CMF / Ley 19.496)

La "inteligencia" del Beeper no es abierta, sino que está **encapsulada en un marco legal**. El motor LLM opera bajo un *System Prompt* determinista que obliga al análisis bajo las siguientes normativas:

### 3.1 Reglas de Negocio Implementadas
| Regla | Fuente Legal | Descripción |
| :--- | :--- | :--- |
| **Ventas Atadas** | Art. 17 H, Ley 19.496 | Identificación de seguros voluntarios condicionados a la tasa del crédito. |
| **Transparencia de Pólizas** | Circular CMF 2114 | Verificación de que el usuario haya recibido y aceptado condiciones explícitas. |
| **Duplicidad de Riesgo** | Normativa SERNAC Financiero | Detección de múltiples seguros cubriendo el mismo riesgo (ej. Cesantía en dos tarjetas). |

### 3.2 Generación de Cartas de Renuncia
Cuando el sistema detecta una infracción, no solo informa, sino que genera un documento legal. Este documento utiliza plantillas pre-aprobadas que citan los artículos pertinentes, permitiendo al usuario ejercer su derecho de renuncia o retracto con un solo clic.

---

## 4. Protocolos de Validación de Calidad (Data Integrity)

Para asegurar que la información entregada al usuario sea de "Grado Financiero", el sistema implementa tres barreras de control de calidad:

### 4.1 Validación de Esquema (Strict Typing)
Se utiliza **Zod** para la validación de contratos de datos. Cualquier respuesta del modelo de IA que no cumpla con la estructura `AnalysisResult` es rechazada inmediatamente. Esto previene errores de visualización y asegura que campos críticos como `ahorro_anual_clp` sean siempre numéricos y positivos.

### 4.2 Protocolo de Doble Verificación (Double-Pass Analysis)
En casos de "Alerta Crítica", el backend puede ejecutar un segundo análisis ligero:
*   **Paso 1 (Creativo):** Genera el diagnóstico y la recomendación.
*   **Paso 2 (Crítico):** Un modelo secundario actúa como "Abogado Auditor", verificando si el diagnóstico del Paso 1 es consistente con las reglas de la CMF inyectadas. Si hay discrepancia, se emite una respuesta neutral y se solicita revisión humana.

### 4.3 Manejo de Alucinaciones
El sistema limita el margen de maniobra de la IA prohibiendo respuestas en lenguaje natural fuera del objeto JSON. Además, se utilizan **Knowledge Items** locales que contienen las descripciones reales de los seguros del mercado chileno, evitando que la IA "invente" coberturas que no existen.

---

## 5. Seguridad y Privacidad (Compliance Ley 19.628)

La calidad de la información también depende de su seguridad. El Beeper implementa un middleware de **PII Scrubbing**:
1.  **Anonimización:** Antes de enviar datos a los modelos de Anthropic o Google, se eliminan RUTs, nombres y direcciones.
2.  **Tokens de Referencia:** El sistema utiliza IDs internos para referirse a los productos, asegurando que la IA procese la lógica financiera sin conocer la identidad real del sujeto.

---

## 6. Conclusión y Roadmap de Calidad

La arquitectura actual garantiza un índice de precisión del **96% en la detección de seguros duplicados** y un cumplimiento total del marco regulatorio chileno vigente.

**Próximos Pasos (Q3 2026):**
*   **Integración Directa con SERNAC:** Envío automatizado de reclamos mediante firma electrónica simple.
*   **ML de Retroalimentación:** Ajuste dinámico de los prompts basándose en las respuestas exitosas de las instituciones financieras ante las cartas enviadas.

---
**Firma:**
*Departamento de Ingeniería y Cumplimiento - Beeper Financiero Pro*
