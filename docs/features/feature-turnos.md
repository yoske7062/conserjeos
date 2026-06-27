# Feature: Turnos (gestión y handoff)

- **ID:** F-001
- **Stage:** 1 (básico) → 2 (handoff)
- **Lifecycle:** DEPLOYED (pendiente MEASURED)
- **Responsable:** Diego
- **Estado:** ✅ Done

## Descripción
Iniciar y cerrar el turno del conserje, con resumen automático y traspaso de pendientes al turno entrante.

## Problema
En el cambio de turno se pierde información crítica: el conserje entrante no sabe qué quedó pendiente,
qué pasó en el turno anterior ni qué debe vigilar. El cuaderno físico no obliga a leer nada.

## Solución
- Iniciar/cerrar turno con resumen automático de lo registrado.
- Al cerrar, el saliente deja **pendientes** en texto libre.
- El entrante recibe un **popup bloqueante** que no se cierra hasta confirmar que leyó los pendientes.

## User Stories
- Como **conserje saliente**, quiero dejar pendientes, para no olvidar avisar lo importante.
- Como **conserje entrante**, quiero ver los pendientes obligatoriamente, para no operar a ciegas.

## Acceptance Criteria
- [x] Iniciar turno crea registro activo en `turnos`.
- [x] Cerrar turno genera resumen y permite dejar pendientes (JSONB).
- [x] El entrante ve popup bloqueante hasta reconocer (`pendientes_reconocido_por`).

## Riesgos
- Que el entrante cierre el popup sin leer → mitigado: requiere acción explícita de confirmación.

## Dependencias
- Tablas `turnos`, `perfiles`.

## Métricas (para MEASURED)
- % de turnos con pendientes leídos vs. ignorados; incidentes por "no me avisaron".

## Archivos
- `apps/desktop/src/pages/Dashboard.jsx`, `packages/supabase/schema.sql` (tabla `turnos`).
