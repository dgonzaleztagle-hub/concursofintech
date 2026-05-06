# Arquitectura de Integración con Billeteras

Este documento explica cómo el Beeper interactúa con el ecosistema de pagos moderno.

## 🔄 Flujo de Datos

```mermaid
graph TD
    A[Billetera Virtual / Google Pay] -- 1. Notificación de Cargo --> B[Backend Oriundo Beeper]
    B -- 2. Análisis Contextual IA --> C{¿Hay Abuso?}
    C -- SÍ --> D[Push Notification: Alerta Beeper]
    C -- NO --> E[Actualizar Score en Wallet Pass]
    D -- 3. Usuario Pulsa Alerta --> F[Generar Carta de Renuncia]
    F -- 4. Envío Automático --> G[Institución Financiera]
```

## 📱 Ecosistemas Soportados

### Google Wallet
- Integración vía Google Wallet API (Firma RS256).
- Actualización dinámica del "Financial Health Pass".
- [Ver Detalle de Integración Técnica](./INTEGRACION_GOOGLE_WALLET_PRO.md)


### Apple Wallet
- Notificaciones push silenciosas para actualizar el balance de ahorro.
- Diseño minimalista con integración de Siri.

### Open Banking (Fintoc / Floid)
- Conexión vía API para lectura de cartolas históricas y detección de seguros antiguos.
