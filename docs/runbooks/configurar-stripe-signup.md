# Runbook: configurar Stripe para el signup con pago

Este documento es el procedimiento para que el flujo de `/registro` funcione de
punta a punta. El código ya está — esto es lo que falta hacer en el dashboard
de Stripe, algo que solo Diego puede hacer (requiere su cuenta).

## 1. Crear la cuenta y el producto

1. Crear cuenta en [stripe.com](https://stripe.com) si no existe una.
2. Dashboard → Product catalog → **Add product**: "Portia — Suscripción mensual".
3. Pricing: recurring, mensual, en el monto que se decida (CLP si Stripe lo soporta
   en tu país, si no USD).
4. Copiar el **API ID** del price (empieza con `price_...`) → va en
   `STRIPE_PRICE_ID_MENSUAL`.

## 2. API keys

Dashboard → Developers → API keys.
- Empezar con las de **test mode** (`sk_test_...`) hasta probar el flujo completo
  con una tarjeta de prueba de Stripe.
- Copiar la Secret key → `STRIPE_SECRET_KEY`.

## 3. Webhook

Dashboard → Developers → Webhooks → **Add endpoint**.
- URL: `https://<tu-dominio-admin>/api/webhooks/stripe`
- Eventos a escuchar (solo estos tres):
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Copiar el **Signing secret** del endpoint → `STRIPE_WEBHOOK_SECRET`.

## 4. Variables de entorno

En `apps/admin/.env.local` (local) y en Vercel (producción), agregar las 3 de
arriba. Ver `apps/admin/.env.example` para el formato exacto.

## 5. Probar con tarjeta de test

Con las keys de test puestas, ir a `/registro`, completar el form, y en el
Checkout de Stripe usar la tarjeta de prueba `4242 4242 4242 4242`, cualquier
fecha futura y CVC. Confirmar que:
- El pago se completa y redirige a `/registro/exito`.
- En Supabase aparece la fila nueva en `edificios` con `subscription_status = active`.
- Llega el correo de invitación al email usado (revisar spam).
- El admin puede setear contraseña y entrar a `/dashboard`.

## 6. Pasar a producción

Cuando el flujo de test funcione de punta a punta: repetir el paso 2 y 3 pero
con las **live keys** (`sk_live_...`, webhook apuntando al dominio real), sin
tocar código.

## Qué NO hace el código todavía

- No hay reintento automático de correo si `inviteUserByEmail` falla después de
  ya haber cobrado — quedaría un cliente pagando sin cuenta. Si esto pasa en
  producción, revisar logs del webhook (`console.error` con `event.type`) y
  crear el usuario a mano vía `invitarConserjeAction`-style flow.
- No hay página de "elegir plan" — hoy es un solo plan mensual fijo.
