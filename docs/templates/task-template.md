# Task Template

Las tareas viven como filas en `docs/tasks/{backlog,in-progress,blocked,done}.md`.
Formato de fila:

```
| ID | Descripción | Stage | Prioridad | Estimación | Responsable | Dependencias | Estado |
```

- **ID:** `T-NNN` (correlativo, no se reutiliza).
- **Descripción:** verbo + objeto, accionable. Ej: "Desplegar apps/admin en Vercel".
- **Stage:** a qué stage contribuye (si no contribuye al actual → `Future Work`).
- **Prioridad:** `P0` (bloqueante del stage) · `P1` (importante) · `P2` (nice to have).
- **Estimación:** `S` (<½ día) · `M` (½–2 días) · `L` (2–5 días) · `XL` (>1 semana, partir).
- **Responsable:** una sola persona.
- **Dependencias:** IDs de tareas/decisiones o "—".
- **Estado:** ⬜ Todo · 🔄 Doing · ⛔ Blocked · ✅ Done.

### Ejemplo
```
| T-021 | Desplegar apps/admin en Vercel con env prod | 3 | P0 | M | Diego | D2,D3 | 🔄 |
```

### Reglas
- Una tarea se mueve **físicamente** entre archivos (backlog → in-progress → done).
- Si se bloquea, va a `blocked.md` con el motivo y qué la desbloquea.
