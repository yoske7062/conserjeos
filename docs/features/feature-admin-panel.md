# Feature: Panel admin web

- **ID:** F-006
- **Stage:** 3
- **Lifecycle:** DEPLOYED* (código) → falta deploy público + MEASURED
- **Responsable:** Diego
- **Estado:** 🔄 Doing (deploy pendiente)

## Descripción
Interfaz web (Next.js) para que el administrador del edificio supervise de forma remota y gestione conserjes y tareas.

## Problema
El administrador no puede ver lo que pasa en su edificio sin estar físicamente o llamar al conserje.
La app de escritorio es para el puesto fijo, no para acceso ocasional remoto.

## Solución
Panel web con login propio (rol `admin`), middleware que protege todas las rutas, y módulos:
- **Dashboard:** stats (visitas/encomiendas/tareas), novedades recientes, turnos activos.
- **Novedades / Visitas / Encomiendas:** historial filtrable del edificio.
- **Tareas:** crear y asignar a conserjes.
- **Conserjes:** alta, activar/desactivar.

Ver decisión de stack en [ADR-004](../decisions/ADR-004-nextjs-admin-panel.md).

## User Stories
- Como **administrador**, quiero ver el estado de mi edificio en tiempo real, para supervisar sin ir.
- Como **administrador**, quiero gestionar las cuentas de mis conserjes, para controlar accesos.

## Acceptance Criteria
- [x] Login valida rol `admin`; middleware redirige no autenticados.
- [x] Dashboard muestra stats y actividad reciente del edificio.
- [x] CRUD de tareas y gestión de conserjes.
- [ ] **Desplegado en URL pública** (`T-021`).
- [ ] Realtime verificado contra datos del desktop (`T-025`).

## Riesgos
- Alta de conserjes con `signUp` (anon key) no es el flujo final → `T-023`.
- Sin deploy, el administrador real no puede usarlo (bloquea el gate de Stage 3).

## Dependencias
- Mismo Supabase; rol `admin` en `perfiles`; Vercel (deploy); decisiones D2/D3.

## Métricas (para MEASURED)
- ¿El administrador entra al menos 1 vez/día? ¿Reduce llamadas al conserje?

## Archivos
- `apps/admin/` (App Router, `middleware.js`, `components/Sidebar.jsx`, `lib/supabase.js`).
