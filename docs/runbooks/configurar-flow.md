# Runbook: configurar Flow para el signup con pago

Stripe no soporta Chile como país — se migró todo el cobro a
[Flow](https://www.flow.cl). Este documento es lo que falta hacer en el
dashboard de Flow, algo que solo Diego puede hacer (requiere su cuenta).

## 1. Cuenta y API keys

Ya hecho (2026-07-06): cuenta de comercio creada en flow.cl, API Key y Secret
Key obtenidas desde **Integraciones → Integración por API** y cargadas en
`apps/admin/.env.local` (`FLOW_API_KEY`, `FLOW_SECRET_KEY`).

Faltan en Vercel — agregar las mismas 2 variables ahí cuando se despliegue.

## 2. Crear el Plan mensual (pendiente — falta el precio)

Flow necesita un "Plan de Suscripción" creado una sola vez vía API
(`POST /plans/create`), no se hace en el dashboard. Falta que Diego confirme
el precio mensual por edificio (CLP) para ejecutar esto.

Una vez haya precio, correr (reemplazando `MONTO`):

```bash
node -e "
const crypto = require('crypto');
const apiKey = 'FLOW_API_KEY_AQUI';
const secretKey = 'FLOW_SECRET_KEY_AQUI';
const params = {
  apiKey,
  planId: 'portia-mensual',
  name: 'Portia — Suscripción mensual',
  currency: 'CLP',
  amount: MONTO,
  interval: 3, // 3 = mensual
};
const claves = Object.keys(params).sort();
const concatenado = claves.map(k => k + params[k]).join('');
const s = crypto.createHmac('sha256', secretKey).update(concatenado).digest('hex');
const body = new URLSearchParams({ ...params, s });
fetch('https://www.flow.cl/api/plans/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: body.toString(),
}).then(r => r.json()).then(console.log);
"
```

El `planId` que se use (`portia-mensual` en el ejemplo) va en
`FLOW_PLAN_ID_MENSUAL`.

## 3. Variables de entorno

En `apps/admin/.env.local` (local) y en Vercel (producción):
- `FLOW_API_KEY`
- `FLOW_SECRET_KEY`
- `FLOW_PLAN_ID_MENSUAL` (tras el paso 2)
- `FLOW_SANDBOX` — `true` para probar contra `sandbox.flow.cl` sin mover
  plata real, `false` para producción.

Ver `apps/admin/.env.example` para el formato exacto.

## 4. Probar con Sandbox

Con `FLOW_SANDBOX=true`, ir a `/registro`, completar el form, y en la página
de Flow usar una tarjeta de prueba de sandbox (ver
[documentación de Flow](https://developers.flow.cl/api#section/Introduccion/Realizar-pruebas-en-nuestro-ambiente-Sandbox)
para los números de tarjeta de test). Confirmar que:
- El registro de tarjeta se completa y redirige a `/registro/exito`.
- En Supabase aparece la fila nueva en `edificios` con `subscription_status = active`
  y `stripe_customer_id`/`stripe_subscription_id` con valores de Flow (esas
  columnas se reutilizaron, no se renombraron).
- Llega el correo de invitación al email usado (revisar spam).
- El admin puede setear contraseña y entrar a `/dashboard`.

## 5. Pasar a producción

Cuando el flujo de sandbox funcione de punta a punta: `FLOW_SANDBOX=false`,
confirmar que el Plan (paso 2) se creó también contra `https://www.flow.cl/api`
(no sandbox — son cuentas/planes separados).

## Qué falta / no está resuelto todavía

- **Cancelación de suscripción desde el dashboard**: no implementado. El botón
  de "gestionar suscripción" de Stripe se reemplazó solo por "Actualizar método
  de pago" (`customer/register` de nuevo). Cancelar requiere el endpoint de
  Flow para cancelar suscripciones — hay que revisar la doc
  (`developers.flow.cl/api`, sección `subscription`) antes de escribirlo, no
  se adivinó.
- **Sincronización de estado de suscripción**: cuando Flow cobra o falla un
  cobro recurrente, notifica vía el `urlCallback` configurado en el Plan — no
  hay un endpoint todavía que reciba eso y actualice `subscription_status`
  (equivalente al viejo webhook `customer.subscription.updated/deleted` de
  Stripe). Hoy `subscription_status` se pone en `'active'` una sola vez al
  crear el edificio y no se actualiza más.
- No hay reintento automático de correo si `inviteUserByEmail` falla después de
  ya haber registrado la tarjeta — revisar logs de
  `apps/admin/app/api/flow/callback/route.js` si esto pasa.
