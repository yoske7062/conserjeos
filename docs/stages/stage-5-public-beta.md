# Stage 5 — Public Beta

**Estado:** ⬜ No iniciado · **Progreso:** 0%

## Objetivo
Validar **product-market fit inicial** con varios edificios y empezar a medir el negocio.

## Alcance

### Must Have
- [ ] Instrumentación de **activación / retención / conversión / churn / NPS**
- [ ] Onboarding semi-self-service para administradoras
- [ ] Facturación de prueba (cobro real a 1+ administradora)
- [ ] Infra de producción estable (Supabase prod, backups, monitoreo)
- [ ] Resolución de todos los bugs críticos del alpha

### Métricas a monitorear (definir umbrales en vision.md)
| Métrica | Definición Portia | Umbral objetivo |
|---|---|---|
| Activación | Edificio con 1er turno cerrado en la app | _por definir_ |
| Retención | Edificios activos semana 4 / semana 1 | _por definir_ |
| Conversión | Trials → plan pagado | _por definir_ |
| Churn | Edificios que cancelan / mes | _por definir_ |
| NPS | Encuesta a administradores y conserjes | _por definir_ |

## Gate de salida (para pasar a Stage 6)
- [ ] Métricas mínimas alcanzadas (umbrales definidos y cumplidos)
- [ ] Bugs críticos resueltos
- [ ] Infraestructura estable bajo carga de varios edificios

## Missing Information
- Umbrales numéricos de cada métrica del gate.
- Stack de analítica (PostHog / Amplitude / propio sobre Supabase).
