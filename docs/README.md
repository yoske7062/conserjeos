# Portia — Sistema de Gestión de Producto

Este directorio es el **sistema operativo del producto**: la fuente única de verdad para qué
construimos, por qué, en qué etapa estamos y qué sigue. Diseñado para escalar de 2 a 50 personas
sin perder claridad.

## Por dónde empezar (lectura de 10 minutos)

1. [`/project-state.md`](../project-state.md) — estado instantáneo del proyecto.
2. [`stages/README.md`](stages/README.md) — modelo de stages + **vista ejecutiva** (dónde estamos).
3. [`dashboard.md`](dashboard.md) — tablero de ejecución de la semana.
4. [`product/vision.md`](product/vision.md) — por qué existimos.

## Mapa de carpetas

| Carpeta | Qué contiene | Cadencia de actualización |
|---|---|---|
| [`product/`](product/) | Visión, ICP, MVP breakdown | Mensual / al pivotar |
| [`stages/`](stages/) | Stages 0–7, gates, vista ejecutiva | Al cerrar un stage |
| [`roadmap/`](roadmap/) | Master roadmap (Now/Next/Later/Icebox) | Semanal |
| [`features/`](features/) | Un archivo por feature + ciclo de vida | Al crear/avanzar una feature |
| [`decisions/`](decisions/) | ADRs — registro de decisiones | Al tomar una decisión irreversible |
| [`tasks/`](tasks/) | backlog / in-progress / blocked / done | Diaria |
| [`templates/`](templates/) | Plantillas reutilizables | Rara vez |
| [`dashboard.md`](dashboard.md) | Tablero ejecutivo semanal | Semanal (lunes) |
| [`founders.md`](founders.md) | Command center de fundadores | Continua |
| [`workflow.md`](workflow.md) | Flujo Idea → Producción | Rara vez |

## Reglas del sistema

1. **La prioridad se organiza por `Stage Completion %`, no por tareas sueltas.**
   Todo lo que no contribuye al stage actual queda marcado `Future Work`.
2. **Ninguna feature salta etapas** del ciclo de vida (ver [`workflow.md`](workflow.md)).
3. **Toda feature, tarea y decisión pertenece a un stage.**
4. **Si falta información, se documenta** en una sección `Missing Information` con preguntas
   concretas y qué queda bloqueado — nunca se inventa.
5. **Una decisión irreversible = un ADR.** Sin excepción.

## Cómo agregar cosas

- Nueva feature → copiar [`templates/feature-template.md`](templates/feature-template.md) a `features/feature-<nombre>.md`.
- Nueva tarea → agregar fila en [`tasks/backlog.md`](tasks/backlog.md) con el formato del [template](templates/task-template.md).
- Nueva decisión → copiar [`templates/adr-template.md`](templates/adr-template.md) a `decisions/ADR-NNN-<slug>.md`.
- Nuevo experimento → copiar [`templates/experiment-template.md`](templates/experiment-template.md).
