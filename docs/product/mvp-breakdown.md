# Portia — MVP Breakdown

Descomposición del producto por etapa de madurez. Mapea con el [modelo de stages](../stages/README.md).

---

## MVP v0 — "El cuaderno digital" ✅ (Stage 1)
**Objetivo de negocio:** demostrar que un conserje puede operar un turno sin papel.

- **Entra:** auth, turno iniciar/cerrar, novedades, visitas, encomiendas, CI/CD.
- **Queda fuera:** panel admin, offline, métricas, tareas.
- **Riesgos:** que el conserje no entienda la app → mitigado con UX simple.

## MVP v1 — "Usable a diario" ✅ (Stage 2)
**Objetivo de negocio:** que un edificio pueda reemplazar el cuaderno de verdad, todos los días.

- **Entra:** hub Inicio, handoff de turno con pendientes, tareas, ficha de edificio, accesibilidad, auditoría, realtime.
- **Queda fuera:** administrador remoto, resiliencia offline.
- **Riesgos:** pérdida de info en handoff → mitigado con popup bloqueante.

## Beta privada — "Edificio real + administrador" 🔄 (Stage 3 → 4)
**Objetivo de negocio:** poner Portia en un edificio real y aprender.

- **Entra:** panel web admin, modo offline, notificaciones nativas, Ayuda, deploy, feedback/bug tracking.
- **Queda fuera:** adquisición, self-service, facturación a escala.
- **Riesgos:** offline sin probar; sin edificio comprometido.

## Public Beta — "Product-Market Fit" ⬜ (Stage 5)
**Objetivo de negocio:** validar que varias administradoras quieren y pagan.

- **Entra:** métricas de negocio, onboarding semi-self-service, facturación, infra prod.
- **Queda fuera:** growth/marketing a escala.
- **Riesgos:** PMF no se confirma → revisar ICP/pricing.

## Public Launch — "Crecer" ⬜ (Stage 6)
**Objetivo de negocio:** canal de adquisición repetible + revenue creciente.

- **Entra:** analytics, growth experiments, marketing roadmap, revenue tracking, soporte, self-service.
- **Queda fuera:** optimización de costos a gran escala.

## Scale Phase — "Operar a escala" ⬜ (Stage 7)
**Objetivo de negocio:** crecer usuarios y equipo sin perder calidad ni margen.

- **Entra:** performance/cost monitoring, team onboarding, engineering handbook, incident management.

---

### Resumen visual

```
v0 ✅ ── v1 ✅ ── Beta privada 🔄 ── Public Beta ⬜ ── Launch ⬜ ── Scale ⬜
Stage 1   Stage 2    Stage 3→4          Stage 5        Stage 6     Stage 7
papel      diario     edificio real      PMF            crecer      operar
```
