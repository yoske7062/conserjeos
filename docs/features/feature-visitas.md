# Feature: Visitas (control de acceso)

- **ID:** F-003
- **Stage:** 1
- **Lifecycle:** DEPLOYED (pendiente MEASURED)
- **Responsable:** Diego
- **Estado:** ✅ Done

## Descripción
Registro de entrada y salida de visitantes con historial auditable.

## Problema
Sin registro de quién entra/sale, no hay trazabilidad ante incidentes ni control de acceso real.

## Solución
- Entrada con nombre, RUT (opcional), departamento destino y motivo.
- Tarjetas de visitas **activas** (quién está en el edificio ahora).
- Salida con cálculo automático de duración.
- Historial del día + filtro por fecha en el panel admin.
- Soporte offline (encola con timestamp) + UI optimista en la salida.

## User Stories
- Como **conserje**, quiero registrar la entrada de una visita, para saber quién está en el edificio.
- Como **administrador**, quiero ver el historial de visitas por fecha, para responder reclamos.

## Acceptance Criteria
- [x] Entrada crea registro con `activa = true`.
- [x] Salida marca `activa = false` y calcula duración.
- [x] Panel admin filtra por fecha y por activas/todas.

## Riesgos
- Datos personales (nombre + RUT) → cumplimiento Ley 21.719 pendiente (`T-040`).

## Dependencias
- Tabla `visitas`.

## Métricas (para MEASURED)
- Visitas registradas por turno; % de salidas efectivamente marcadas.

## Archivos
- `apps/desktop/src/pages/Visitas.jsx`; `apps/admin/app/dashboard/visitas/page.jsx`.
