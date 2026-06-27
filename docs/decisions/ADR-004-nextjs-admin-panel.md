# ADR-004: Panel admin en Next.js (web, separado del desktop)

- **Estado:** ✅ Aceptada
- **Fecha:** 2026-06-25
- **Stage:** 3
- **Decididores:** Diego

## Contexto
El administrador del edificio tiene necesidades distintas al conserje: supervisa de forma remota,
desde cualquier dispositivo, sin instalar nada. No tiene sentido obligarlo a instalar la app de
escritorio (que está pensada para el puesto fijo del conserje).

## Alternativas consideradas
1. **Reusar la app Electron con vista de admin.** Pro: una sola app. Contra: obliga a instalar; mezcla dos perfiles muy distintos; mala UX para acceso ocasional.
2. **SPA con Vite + React Router.** Pro: consistente con desktop. Contra: sin SSR ni middleware de auth en el borde; routing/protección manual.
3. **Next.js 15 (App Router).** Pro: middleware para proteger rutas, SSR, deploy trivial en Vercel, mismo Supabase. Contra: segundo framework en el repo.

## Decisión
**Next.js 15 (App Router)** en `apps/admin`, con middleware que protege todas las rutas y valida
rol `admin`. Mismo proyecto Supabase, login propio. Auto-descubierto por el workspace `apps/*`.

## Consecuencias
- **Positivas:** acceso web sin instalación; middleware de auth en el borde; deploy directo en Vercel; reutiliza el backend y el modelo de datos.
- **Negativas / deuda:** segundo framework (React 19 en Electron + Next.js); duplicación menor del cliente Supabase; falta el deploy real (`T-021`).
- **Revertir costaría:** medio — los componentes son React reutilizables, pero el routing/middleware es específico de Next.

## Missing Information
- Dominio de despliegue (D3) y proyecto Supabase de producción (D2).
