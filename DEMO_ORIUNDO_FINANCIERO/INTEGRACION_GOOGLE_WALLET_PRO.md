# Documentación de Integración: Google Wallet PRO

**Proyecto:** Beeper Financiero Pro  
**Módulo:** Wallet Integration Engine  
**Estado:** Arquitectura Lista / Requiere Credenciales de Emisor

---

## 1. Visión General
Esta integración permite que el diagnóstico de salud financiera generado por la IA de Beeper se convierta en un **Pase Digital** persistente en el dispositivo del usuario. El pase actúa como un "Pasaporte de Seguridad" que el usuario puede consultar sin necesidad de abrir la aplicación.

---

## 2. Componentes Técnicos

### 2.1 Backend: Generador de JWT Criptográfico
Ubicado en `app/api/wallet/pass/route.ts`, este endpoint realiza las siguientes acciones:
1.  **Validación de Datos**: Recibe el nombre, ahorro y estado del usuario.
2.  **Detección de Entorno**: Si existen las variables `GOOGLE_ISSUER_ID`, cambia automáticamente de **MOCK MODE** a **REAL CONNECTION**.
3.  **Firma RS256**: Utiliza una llave privada de Google Cloud para firmar un token JWT que cumple con el estándar de Google Wallet.
4.  **Generación de URL de Guardado**: Crea el link oficial `https://pay.google.com/gp/v/save/{token}`.

### 2.2 Frontend: Botón de Sincronización
El componente `GoogleWalletButton.tsx` maneja el estado de la transacción:
*   Muestra una animación de "Firmando JWT" para dar transparencia al proceso de seguridad.
*   En conexión real, abre una nueva pestaña para que el usuario complete el guardado en su cuenta de Google.

---

## 3. Guía de Configuración (Para Producción)

Para activar la conexión real fuera de la simulación de demo, se deben configurar los siguientes parámetros en el archivo de entorno:

| Variable | Descripción | Fuente |
| :--- | :--- | :--- |
| `GOOGLE_ISSUER_ID` | ID único de emisor de pases. | Google Pay & Wallet Console |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email de la cuenta de servicio con permisos de API. | Google Cloud Console |
| `GOOGLE_PRIVATE_KEY` | Llave privada en formato RSA. | Google Cloud (JSON key) |

---

## 4. Estructura del Pase (Payload)
El pase generado incluye los siguientes módulos de datos dinámicos:
*   **Header**: "PASAPORTE DE SALUD"
*   **Estado**: (Protegido / Alerta / En Riesgo) con cambio de color dinámico (Verde/Rojo).
*   **Ahorro Anual**: El monto exacto calculado por la IA.
*   **Código QR**: Un identificador único del pase para validación futura.

---

## 5. Pruebas Locales
Para probar la lógica sin credenciales:
1.  Realice una auditoría manual.
2.  Pulse "Add to Google Wallet".
3.  El sistema detectará la falta de llaves y activará el **Modo de Simulación**, abriendo la vista previa visual en la web (`WalletPassPreview.tsx`).

---
**Firma:**  
*División de Infraestructura y Billeteras - Oriundo Beeper Pro*
