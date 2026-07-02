# Tasks — Done

Histórico de tareas completadas (más reciente arriba).

| ID | Descripción | Stage | Responsable | Cerrada |
|---|---|---|---|---|
| T-047 | Aplicar a producción 4 migraciones que estaban solo en `schema.sql`: `perfiles.email`, `visitas.consentimiento_ley`, `encomiendas.retirado_por/tipo`, tabla `eventos_analitica`. Aplicadas vía conexión directa a Postgres (Session pooler) y verificadas con inserts reales contra prod. Ver `docs/data/prod-schema-drift-30jun2026.md` | 3/4 | Diego (DB password) + Claude (ejecución y verificación) | 2026-06-30 |
| T-046 | Realtime + offline optimista para Tareas/Visitas, `useRealtimeSync` (PR #15) | 3 | Antigravity + Claude (fix de re-suscripción) | 2026-06-30 |
| T-045 | Fix bugs de campos desalineados con schema: Visitas, Tareas, `perfiles.email` (PR #11) | 4 | Claude | 2026-06-30 |
| T-044 | Cron de limpieza de fotos huérfanas (PR #10) | 4 | Claude | 2026-06-30 |
| T-043 | Bucket de fotos privado + signed URLs, Ley 21.719 (PR #9) | 4 | Claude | 2026-06-30 |
| T-022 | Instrumentar analítica mínima — evento `1er_turno_cerrado` (PR #8) | 4 | Diego | 2026-06-30 |
| T-023 | Endurecer alta de conserjes (invitación email vía `inviteUserByEmail`, no signUp directo) | 3 | Diego | 2026-06-29 |
| T-054 | Onboarding de conserje: invite con redirectTo + página /auth/establecer-password (antes el link del correo no llevaba a ningún lado) | 3 | Claude | 2026-07-01 |
| T-053 | ESLint (solo correctitud) en desktop y admin + gate en CI; limpieza de código muerto detectado | 3 | Claude | 2026-07-01 |
| T-052 | Tests de flujos críticos: cola offline → sync sin duplicados (23505), retiro de encomienda, fotos encoladas, sesión vencida (flushQueue extraído a lib compartida) | 3 | Claude | 2026-07-01 |
| T-051 | Errores con código diagnosticable en desktop: red/auth/RLS/duplicado/validación en vez de mensaje genérico | 3 | Claude | 2026-07-01 |
| T-050 | Seguridad: solo admin crea/borra tareas — RLS por operación + guard en desktop (antes cualquier conserje podía insertar vía API) | 3 | Claude | 2026-07-01 |
| T-021 | Desplegar `apps/admin` en Vercel — LIVE en https://admin-five-bay-95.vercel.app | 3 | Diego | 2026-06-29 |
| T-020 | Panel web admin (Next.js): login, dashboard, 5 módulos, middleware | 3 | Diego | 2026-06-25 |
| T-019 | Migrar paleta de la app a índigo (#6366F1) | 3 | Diego | 2026-06-25 |
| T-018 | Módulo Ayuda / tutorial en desktop | 3 | Diego | 2026-06-24 |
| T-017 | Modo offline + cola de sincronización (localStorage) | 3 | Diego | 2026-06-24 |
| T-016 | Notificaciones nativas urgentes + click-to-navigate | 3 | Diego | 2026-06-23 |
| T-015 | Informe de producto (`docs/informe-portia-24-jun-2026.md`) | 3 | Diego | 2026-06-24 |
| T-014 | Script `create-admin.mjs` para setup de admin inicial | 3 | Diego | 2026-06-25 |
| T-010 | Stage 2 completo (handoff turno, tareas, ficha, accesibilidad, auditoría) | 2 | Diego | — |
| T-001 | Stage 1 completo (auth, turnos, novedades, visitas, encomiendas, CI/CD) | 1 | Diego | — |

> Nota: las fechas previas a Stage 3 no estaban trackeadas en este sistema; se registran como "—".
