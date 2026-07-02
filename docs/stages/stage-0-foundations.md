# Stage 0 — Foundations

**Estado:** ✅ Done · **Progreso:** 100% · **Cerrado:** Stage 1 alcanzado

## Objetivo
Validar el problema y la arquitectura antes de construir features.

## Checklist
- [x] Definición de ICP → [`product/vision.md`](../product/vision.md)
- [x] Definición del problema (cuaderno físico, sin trazabilidad)
- [x] Arquitectura inicial (Electron + Supabase + Turborepo) → [ADR-001](../decisions/ADR-001-electron-desktop.md), [ADR-002](../decisions/ADR-002-supabase-backend.md), [ADR-003](../decisions/ADR-003-turborepo-monorepo.md)
- [x] Stack tecnológico definido
- [x] Setup CI/CD → `.github/workflows/release.yml` (build Mac arm64/x64 + Windows x64 en tags `v*`)
- [x] Setup base de datos → `packages/supabase/schema.sql` (7 tablas + RLS)
- [x] Setup autenticación → Supabase Auth + JWT + helpers `mi_edificio_id()` / `mi_rol()`

## Gate de salida — ✅ Aprobado
- [x] Arquitectura documentada
- [x] Entorno funcionando (dev local + builds CI)
- [x] Equipo alineado

## Decisiones tomadas en este stage
- App de **escritorio** (no web) para el conserje → [ADR-001](../decisions/ADR-001-electron-desktop.md)
- **Supabase** como backend único → [ADR-002](../decisions/ADR-002-supabase-backend.md)
- **Turborepo** monorepo → [ADR-003](../decisions/ADR-003-turborepo-monorepo.md)
