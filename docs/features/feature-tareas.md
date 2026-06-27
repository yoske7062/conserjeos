# Feature: Tareas (asignación admin → conserje)

- **ID:** F-005
- **Stage:** 2 (desktop) → 3 (creación desde panel admin)
- **Lifecycle:** DEPLOYED (pendiente MEASURED)
- **Responsable:** Diego
- **Estado:** ✅ Done

## Descripción
El administrador asigna tareas a conserjes; el conserje las ve en su turno y las completa.

## Problema
Las instrucciones del administrador al conserje van por WhatsApp/papel, sin seguimiento ni constancia
de cumplimiento.

## Solución
- Panel admin: crear tarea con título, descripción, **prioridad** (baja/normal/alta/urgente),
  **asignar a** conserje y **fecha límite**.
- Estados: `pendiente` → `en_progreso` → `completada`.
- Desktop: el conserje ve sus tareas y las marca; las vencidas se destacan.

## User Stories
- Como **administrador**, quiero asignar una tarea a un conserje con prioridad y plazo, para hacer seguimiento.
- Como **conserje**, quiero ver mis tareas del turno, para no olvidar lo asignado.

## Acceptance Criteria
- [x] Crear tarea desde panel admin con asignación y prioridad.
- [x] Cambiar estado (iniciar/completar).
- [x] Tareas vencidas resaltadas.

## Riesgos
- Tareas sin asignar pueden quedar huérfanas → permitir "sin asignar" pero visible para todos.

## Dependencias
- Tabla `tareas`; perfiles con rol `conserje`.

## Métricas (para MEASURED)
- % de tareas completadas a tiempo.

## Archivos
- `apps/admin/app/dashboard/tareas/page.jsx`; desktop módulo Tareas.
