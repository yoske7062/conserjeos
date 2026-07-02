# ADR-002: Supabase como backend único

- **Estado:** ✅ Aceptada
- **Fecha:** 2026 (inferida — confirmar)
- **Stage:** 0
- **Decididores:** Diego, James

## Contexto
Equipo de 2 fundadores con necesidad de máxima velocidad. Requerimos auth, base de datos relacional,
realtime (novedades urgentes), storage (fotos) y multi-tenancy con aislamiento por edificio.

## Alternativas consideradas
1. **Backend propio (Node + Postgres + S3 + WS).** Pro: control total. Contra: meses de infra para 2 personas.
2. **Firebase.** Pro: rápido, realtime. Contra: NoSQL no calza con datos relacionales (edificios/perfiles/turnos); RLS menos expresivo.
3. **Supabase.** Pro: Postgres real + RLS + Auth + Realtime + Storage en una sola plataforma; SQL portable. Contra: dependencia de un proveedor.

## Decisión
**Supabase** (PostgreSQL + Auth + Realtime + Storage) como backend único, con **RLS** en todas las
tablas y helpers `mi_edificio_id()` / `mi_rol()` para el aislamiento multi-tenant.

## Consecuencias
- **Positivas:** velocidad de desarrollo, multi-tenant seguro desde el día 1, realtime listo, schema versionado en `packages/supabase/schema.sql`.
- **Negativas / deuda:** vendor lock-in parcial; falta separar proyecto **dev** de **producción** (ver D2 en founders).
- **Revertir costaría:** medio — el schema SQL y RLS son estándar Postgres, migrables; auth/realtime requerirían reescritura.

## Missing Information
- Confirmar estrategia de proyecto prod vs. dev (hoy comparten `cpxywvxwdnpsrxqjoqjl`).
