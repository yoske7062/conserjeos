# Feature: Novedades (libro digital)

- **ID:** F-002
- **Stage:** 1 → 3 (offline + notificación)
- **Lifecycle:** DEPLOYED (pendiente MEASURED)
- **Responsable:** Diego
- **Estado:** ✅ Done

## Descripción
Reemplazo digital del libro de novedades: registro tipificado con evidencia fotográfica, en tiempo real.

## Problema
El libro físico es ilegible, se pierde, no avisa de urgencias y no tiene trazabilidad de quién escribió qué.

## Solución
- Tipos: **Urgente** / **Incidente** / **Informativo** con color e icono.
- Foto adjunta como evidencia.
- **Realtime** (Supabase WebSocket): aparece al instante en otros dispositivos del edificio.
- Notificación nativa al registrar una urgente (ver [notificaciones](feature-notificaciones.md)).
- Borrador automático si se cierra la app a mitad.
- Funciona offline sin foto (ver [modo offline](feature-offline-mode.md)).
- Auditoría de ediciones (editado_por / editado_at / valor_anterior).

## User Stories
- Como **conserje**, quiero registrar una novedad con foto, para dejar evidencia.
- Como **conserje de otro turno**, quiero enterarme al instante de una urgente, para reaccionar.

## Acceptance Criteria
- [x] Crear novedad con tipo, descripción y foto opcional.
- [x] Propagación realtime a otros dispositivos del mismo edificio.
- [x] Notificación nativa en urgentes.
- [x] Auditoría de ediciones.

## Riesgos
- Foto requiere red (storage) → offline la deshabilita con mensaje claro.

## Dependencias
- Tablas `novedades`; Supabase Realtime + Storage.

## Métricas (para MEASURED)
- Novedades por turno; tiempo de reacción ante urgentes.

## Archivos
- `apps/desktop/src/pages/Novedades.jsx`; panel: `apps/admin/app/dashboard/novedades/page.jsx`.
