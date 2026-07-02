# Stage 4 — Private Alpha

**Estado:** ⬜ No iniciado · **Progreso:** 0%

## Objetivo
Poner Portia en manos de los **primeros usuarios reales** (conserjes + 1 administrador en
un edificio real) y aprender de su uso diario.

## Alcance

### Must Have
- [ ] **1er edificio real** onboarded (datos reales: edificio, conserjes, turnos) → `T-030` ⬅ bloqueador de negocio
- [ ] **Feedback Tracker** → `docs/tasks/` + canal directo con el conserje
- [ ] **Bug Tracker** operativo (GitHub Issues con labels `alpha`, `sev:*`)
- [ ] **User Interview Log** (registro de entrevistas con conserjes y administrador)
- [ ] Cumplimiento mínimo **Ley 21.719** (consentimiento + retención de datos de visitantes) → `T-040`
- [ ] Onboarding asistido de edificio (script o checklist, no self-service aún)

### Nice To Have
- [ ] Telemetría de errores (Sentry o equivalente)
- [ ] Export de datos para el administrador

### Excluded
- Adquisición / marketing (→ Stage 6)
- Self-service signup (→ Stage 6)

## Gate de salida (para pasar a Stage 5)
- [ ] **5–10 usuarios activos** reales (conserjes usándolo en turnos reales)
- [ ] Feedback documentado y sintetizado
- [ ] Issues priorizados y los críticos resueltos

## Métricas a observar
- ¿Completan el turno en la app sin volver al cuaderno?
- ¿Cuántas novedades/visitas/encomiendas registran por turno?
- ¿El handoff de turno evita pérdida de información?

## Missing Information
- ¿Qué edificio será el alpha? ¿Hay contacto comprometido? *(bloquea todo el stage)*
- ¿Quién es el dueño del cumplimiento legal (Ley 21.719)?
- Definir las **métricas mínimas** numéricas del gate de Stage 5 → ver [`product/vision.md`](../product/vision.md) §Métricas.
