# Tasks — Backlog

Tareas no empezadas. Formato en [`../templates/task-template.md`](../templates/task-template.md).
Prioridad: `P0` bloquea el stage actual · `P1` importante · `P2` nice to have.

| ID | Descripción | Stage | Prio | Est | Responsable | Dependencias | Estado |
|---|---|---|---|---|---|---|---|
| T-024 | Probar modo offline con corte de red real (sin pérdida/duplicación) | 3 | P0 | M | Diego | — | ⬜ |
| T-025 | Extender realtime a las páginas de detalle del admin (`/dashboard/novedades`, `/visitas`, `/encomiendas`, `/tareas`) — hoy solo `/dashboard` (overview) tiene `supabase.channel` con debounce (PR #7); las 4 páginas de detalle solo refrescan al cambiar filtro/tab, no ven en vivo lo que registra el desktop | 3 | P1 | S | _sin asignar_ | — | ⬜ |
| T-030 | Conseguir 1er edificio real para Alpha | 4 | P0 | L | Diego/James | D5 | ⛔ |
| T-040 | Cumplimiento Ley 21.719 — retención de encomiendas/novedades + flujo de supresión | 4 | P1 | M | _sin asignar_ | D4 | 🟡 procedimiento de supresión documentado + retención propuesta (90d, sin aplicar); falta que Diego apruebe el plazo y aplique el cron — ver `docs/data/data-retention.md` §3.1/§4 |
| T-048 | Revisión legal: TOS + Política de Privacidad + DPA por un abogado (borradores IA listos en `docs/legal/`); designar owner de cumplimiento (D4); revisar transferencia internacional de datos (Brasil) | 4 | P0 | M | Diego/James + abogado | D4 | ⬜ |
| T-049 | Flipear bucket de fotos a privado en producción — runbook listo, recomendado hacerlo antes de Alpha | 3 | P1 | S | Diego | — | ⬜ |
| T-041 | Montar Feedback + Bug Tracker (GitHub Issues + labels) | 4 | P1 | S | James | T-030 | ⬜ |
| T-042 | User Interview Log (validar supuestos A1–A4) | 4 | P1 | M | Diego | T-030 | ⬜ |
| T-031 | Definir pricing en CLP (Trial/Basic/Pro) | 5 | P1 | S | Diego/James | D1 | ⛔ |
| T-026 | Export CSV de historial desde panel admin | 5 | P2 | M | — | — | ⬜ |
| T-027 | Métricas agregadas en dashboard admin | 5 | P2 | M | — | — | ⬜ |

> **Regla:** las tareas de Stage ≥5 son **Future Work** mientras el stage actual sea 3/4. No se trabajan ahora.
