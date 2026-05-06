# Guía de Implementación: Modo Preventivo Dinámico 2.0

**Módulo:** Coaching de Negociación Financiera  
**Estado:** Operativo (Detección por Producto)  

---

## 1. Concepto: El "Escudo de Firma"
A diferencia de una auditoría post-contratación, el **Modo Preventivo** está diseñado para ser usado *durante* la interacción con el ejecutivo bancario. Su objetivo es nivelar la cancha de información antes de que el usuario firme un contrato abusivo.

---

## 2. Arquitectura del Sistema de Consejos
El sistema utiliza un registro dinámico (`preventive_registry.ts`) que mapea productos financieros a riesgos específicos y mandatos legales.

### 2.1 Productos Soportados y Foco de Defensa
| Producto | Foco de Defensa | Base Legal |
| :--- | :--- | :--- |
| **Crédito Hipotecario** | Libertad de elección de seguros (Incendio/Desgravamen). | Art. 17 H Ley de Bancos |
| **Crédito de Consumo** | Derecho a retracto y transparencia de la CAE. | Ley 19.496 |
| **Tarjeta de Crédito** | Comisiones de mantención y seguros de fraude innecesarios. | Ley 21.234 |
| **Cuenta Corriente** | Transparencia en paquetes de productos no solicitados. | Normativa CMF |

---

## 3. Funcionamiento de la IA (Coach Mode)
Cuando se activa el modo preventivo, el sistema cambia el rol de la IA de "Auditor" a "Coach":
1.  **Fase de Preguntas**: Genera una lista de preguntas críticas que el usuario debe hacer al ejecutivo.
2.  **Detección de Red Flags**: Identifica frases comunes de ejecutivos que esconden abusos (ej. "Este seguro es necesario para darte la tasa").
3.  **Refuerzo Legal**: Entrega el "Tip de Oro" basado en la ley chilena para cerrar la negociación con empoderamiento.

---

## 4. Diseño para la Inclusión
El Modo Preventivo 2.0 ha sido optimizado para la **Inclusión Cognitiva**:
*   **Checklist de Empoderamiento**: Reemplaza el texto denso por una lista de verificación visual fácil de seguir.
*   **Traducción en Tiempo Real**: Utiliza el Diccionario de Inclusión para que el usuario pueda preguntar por el "Costo Real" en lugar de la "CAE".

---

## 5. Casos de Uso en Demo
*   **En Sucursal**: El usuario selecciona "Hipotecario" y el Beeper le recuerda que puede cotizar su seguro de incendio por fuera, ahorrando hasta un 30% del dividendo.
*   **Llamada Telefónica**: El usuario recibe una oferta de tarjeta y el Beeper le advierte sobre el costo de mantención "zombie".

---
**Firma:**  
*División de Educación y Defensa del Consumidor - Beeper Financiero Pro*
