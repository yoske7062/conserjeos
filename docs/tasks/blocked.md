# Tasks — Blocked

Tareas detenidas por una dependencia externa. Cada una declara **qué la desbloquea**.

| ID | Descripción | Stage | Bloqueada por | Qué la desbloquea | Responsable |
|---|---|---|---|---|---|
| T-047 | Aplicar a producción 4 migraciones que están en `schema.sql` pero no en la BD real: `perfiles.email`, `visitas.consentimiento_ley`, `encomiendas.retirado_por/tipo`, tabla `eventos_analitica` — ver `docs/data/prod-schema-drift-30jun2026.md` | 3/4 | Necesita `SUPABASE_SERVICE_ROLE_KEY` o acceso al SQL Editor de Supabase | Diego pega la key o corre el SQL a mano | Diego |
| T-030 | Conseguir 1er edificio real para Alpha | 4 | D5 (sin edificio objetivo) | Definir edificio + primer contacto comercial | Diego/James |
| T-031 | Definir pricing en CLP | 5 | D1 (decisión fundadores) | Reunión de fundadores sobre pricing | Diego/James |

> T-021 (deploy panel admin) salió de blocked: está LIVE en Vercel desde el 29-jun-2026. Ver `done.md`.
> **Bugs críticos abiertos: T-047** — registrar visitas e invitar/listar conserjes están rotos en producción ahora mismo por columnas faltantes en la BD real (no en el código). Detectado 30-jun-2026 probando inserts reales, no solo build.
> Ver decisiones que bloquean en [`../founders.md`](../founders.md) (D1–D5).
