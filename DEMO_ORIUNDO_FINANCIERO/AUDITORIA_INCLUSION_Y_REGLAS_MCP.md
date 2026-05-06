# Auditoría de Inclusión Financiera y Estandarización vía MCP

**Proyecto:** Beeper Financiero Pro  
**Enfoque:** Inclusión, Accesibilidad y Ética Algorítmica  
**Arquitectura:** MCP Business Rules Standardizer  

---

## 1. Auditoría de Reglas Actuales vs. Inclusión Financiera

Tras auditar las reglas en `lib/llm/prompts.ts`, se detectan las siguientes oportunidades de mejora para maximizar la inclusión:

| Regla Actual | Hallazgo de Inclusión | Propuesta de Mejora |
| :--- | :--- | :--- |
| **Ventas Atadas** | Lenguaje técnico complejo (Art. 17 H). | Traducir a "Derecho a elegir": Explicar que el banco no puede obligar a tomar su seguro para dar el crédito. |
| **Duplicidad** | Se enfoca en el ahorro monetario puro. | Enfocar en el "Costo de Oportunidad": Explicar qué podría comprar el usuario con ese dinero ahorrado (ej. 1 semana de pan). |
| **Cálculo de Ahorro** | Solo entrega números finales. | **Desglose Educativo:** Mostrar cómo se llegó al número para que el usuario aprenda a auditarse solo. |

---

## 2. Nuevas Reglas de Inclusión (Financial Inclusion Framework)

He diseñado tres nuevas reglas que el sistema debe estandarizar:

### REGLA 4: El Factor "Abuelo/Adulto Mayor"
*   **Mandato:** Si el perfil indica una edad avanzada o productos de pensionados, la IA debe usar una voz extremadamente empática y evitar términos en inglés o siglas técnicas sin explicación previa.

### REGLA 5: Auditoría de Micro-Créditos de Retail
*   **Mandato:** Detectar cobros de "Mantención" en tarjetas de retail que superen el 10% del cupo utilizado. Esto es un abuso común en sectores de bajos ingresos que usan la tarjeta para compras de alimentos.

### REGLA 6: Acción Proactiva de Alivio
*   **Mandato:** Si la carga financiera supera el 40%, el sistema no solo debe criticar, sino ofrecer un paso a paso para la **Ley de Insolvencia y Reemprendimiento** en lenguaje sencillo.

---

## 3. Implementación MCP: "The Rules Engine Server"

Para estandarizar estas reglas y que no dependan del "humor" del modelo de IA, implementaremos un **MCP Server** que actúe como la única fuente de verdad.

### Herramientas del MCP de Reglas:
*   `get_inclusion_guidelines(user_segment)`: Entrega el tono y las reglas éticas según el perfil de vulnerabilidad.
*   `validate_analysis_ethics(diagnosis_text)`: Un filtro que verifica que el diagnóstico no sea condescendiente ni excesivamente técnico.
*   `standardize_legal_citation(law_id)`: Asegura que todas las citas a la CMF sigan el mismo formato profesional.

### Beneficios de la Estandarización:
1.  **Consistencia:** No importa si usamos Gemini o Claude, las reglas de inclusión serán las mismas porque vienen del servidor MCP.
2.  **Auditabilidad:** Podemos cambiar una regla en el servidor MCP y se actualizará en todo el ecosistema instantáneamente.
3.  **Escalabilidad:** Otros desarrolladores de "Beeper" podrán consumir nuestras reglas estandarizadas, creando un ecosistema de inclusión financiera coherente en Chile.

---

## 4. Próximos Pasos Técnicos

1.  **Centralización:** Mover las reglas de `prompts.ts` a un archivo de configuración JSON que el servidor MCP pueda servir.
2.  **Capa de Traducción:** Implementar un "Diccionario de Inclusión" que traduzca términos como "CAE" a "Costo Real del Préstamo" automáticamente.

---
**Firma:**
*Comité de Ética y Tecnología - Beeper Financiero Pro*
