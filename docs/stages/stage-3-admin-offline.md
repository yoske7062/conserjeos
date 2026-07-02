# Stage 3 — Admin Web + Offline

**Estado:** 🔄 En curso · **Progreso:** 85% · **Tag:** `v1.2.0-stage3`

## Objetivo
Dar al **administrador** una superficie propia (panel web) y hacer la app de escritorio
**resiliente a cortes de red**, para poder poner Portia en manos de un edificio real.

## Alcance

### Must Have
- [x] **Panel web admin** (Next.js 15) con login + rol admin → [feature-admin-panel](../features/feature-admin-panel.md)
  - [x] Dashboard (stats, novedades recientes, turnos activos)
  - [x] Módulos: Novedades, Visitas, Encomiendas, Tareas (crear/asignar), Conserjes
  - [x] Middleware que protege todas las rutas
- [x] **Modo offline** + cola de sincronización → [feature-offline-mode](../features/feature-offline-mode.md)
- [x] **Notificaciones nativas** de escritorio (urgentes) → [feature-notificaciones](../features/feature-notificaciones.md)
- [x] Módulo **Ayuda** / tutorial
- [x] Migración de paleta a **índigo** (`#6366F1`) → [ADR-006](../decisions/ADR-006-indigo-palette.md)
- [ ] **Deploy del panel admin** en Vercel → `T-021` ⬅ bloquea el gate
- [ ] Modo offline **probado en terreno** (corte real) → `T-024`
- [ ] **Alta de conserjes endurecida** (invitación por email) → `T-023`

### Nice To Have
- [ ] Export CSV de historial desde el panel admin → `T-026` (Future Work)
- [ ] Métricas agregadas en el dashboard admin → `T-027` (Future Work)

### Excluded
- Cumplimiento Ley 21.719 → se aborda en Stage 4 (con datos reales).
- Onboarding self-service de edificios → Stage 6.

## Gate de salida (para pasar a Stage 4)
- [ ] Panel admin desplegado y accesible por URL pública
- [ ] Flujo admin completo verificado contra datos reales del desktop
- [ ] Modo offline probado con corte de red sin pérdida ni duplicación de datos
- [ ] Sin bugs críticos abiertos → [`tasks/blocked.md`](../tasks/blocked.md)

## Riesgos
- Modo offline puede duplicar registros si el flush corre dos veces → cubrir con test antes del gate.
- `signUp` con anon key para crear conserjes no es el flujo final → `T-023`.

## Missing Information
- ¿Dominio para el panel admin? (ej. `admin.portia.cl`) — bloquea `T-021`.
- ¿Proyecto Supabase de **producción** separado del actual de desarrollo?
