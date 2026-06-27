# Feature: Notificaciones nativas de escritorio

- **ID:** F-008
- **Stage:** 3
- **Lifecycle:** DEPLOYED (pendiente MEASURED)
- **Responsable:** Diego
- **Estado:** ✅ Done

## Descripción
Aviso nativo (macOS/Windows) cuando se registra una novedad **urgente** desde otro dispositivo del
mismo edificio, con click que lleva directo al módulo Novedades.

## Problema
Una urgencia registrada por un conserje (o en otro acceso del edificio) puede pasar inadvertida si el
otro conserje no está mirando la app.

## Solución
- IPC Electron (`main.cjs` ↔ `preload.cjs`): handler `notify` con `action`.
- Suscripción Supabase Realtime al canal `notif-urgentes` filtrando novedades urgentes de otros.
- Al hacer **click** en la notificación, la ventana se enfoca y navega a Novedades (`onNotifyAction`).

## User Stories
- Como **conserje**, quiero un aviso nativo ante una urgencia, para reaccionar aunque no esté mirando la app.

## Acceptance Criteria
- [x] Notificación nativa al insertarse una novedad urgente de otro perfil del edificio.
- [x] Click enfoca la ventana y navega al módulo Novedades.

## Riesgos
- Permisos de notificación del SO denegados → degradar silenciosamente (try/catch).

## Dependencias
- Electron Notification API; Supabase Realtime; tabla `novedades`.

## Métricas (para MEASURED)
- Tiempo de reacción ante urgentes con vs. sin notificación.

## Archivos
- `apps/desktop/main.cjs`, `apps/desktop/preload.cjs`, `apps/desktop/src/pages/Dashboard.jsx`.
