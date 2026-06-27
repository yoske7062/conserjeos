# ADR-003: Turborepo monorepo

- **Estado:** ✅ Aceptada
- **Fecha:** 2026 (inferida — confirmar)
- **Stage:** 0
- **Decididores:** Diego, James

## Contexto
Portia tiene varias superficies (app de escritorio del conserje, panel web del administrador) que
comparten el mismo backend Supabase, tipos y configuración. Queremos evitar duplicación y mantener
un solo lugar de verdad para el código.

## Alternativas consideradas
1. **Repos separados** (desktop / admin / supabase). Pro: aislamiento. Contra: duplicación de config y cliente Supabase, versionado descoordinado.
2. **Monorepo sin tooling** (carpetas + npm workspaces). Pro: simple. Contra: sin cache de builds ni orquestación de tareas.
3. **Turborepo** sobre npm workspaces. Pro: workspaces auto-descubiertos (`apps/*`), cache de builds, tareas orquestadas. Contra: capa extra de tooling.

## Decisión
**Turborepo** con workspaces `apps/*` y `packages/*`. Hoy: `apps/desktop`, `apps/admin`, `packages/supabase`.

## Consecuencias
- **Positivas:** agregar `apps/admin` fue auto-descubierto por el workspace glob; deps hoisteadas (Next.js en root); config compartida.
- **Negativas / deuda:** la ruta del proyecto contiene `:` (`C:WORK1.0`) lo que complica algunos scripts shell — se usan scripts wrapper.
- **Revertir costaría:** bajo — separar a repos es mecánico.
