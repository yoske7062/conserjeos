# Migraciones — Portia

Registro de cambios al esquema de la base de datos. Fuente única: `packages/supabase/schema.sql` (las migraciones se agregan como bloques versionados al final).

---

## 1. Cómo se aplica una migración

Las migraciones **no son automáticas**.

1. Escribir el bloque SQL al final de `packages/supabase/schema.sql`, con fecha y motivo.
2. Probarlo en un proyecto Supabase de desarrollo.
3. Hacer respaldo de producción (ver [`backup-restore.md`](backup-restore.md)).
4. Aplicarlo en Supabase → SQL Editor.
5. Registrar aquí la entrada.
6. Desplegar el código que la usa **después** de aplicar la migración.

Las migraciones deben ser idempotentes (`if not exists`, `drop policy if exists`) y, cuando sea posible, retrocompatibles con la versión anterior del cliente.

---

## 2. Historial

| Fecha | Migración | Reversible | Estado |
|---|---|---|---|
| 22-jun-2026 | Auditoría de ediciones (`editado_por`, `editado_at`, `valor_anterior`) en novedades/visitas/encomiendas | Sí (drop column) | Aplicada |
| 22-jun-2026 | Entrega de turno con pendientes (jsonb + reconocimiento) | Sí | Aplicada |
| 22-jun-2026 | Ficha de edificio (contactos, protocolos jsonb) | Sí | Aplicada |
| 23-jun-2026 | Tabla `tareas` + RLS | Sí | Aplicada |
| 28-jun-2026 | Consentimiento y retención Ley 21.719 (`consentimiento_ley`, `cleanup_old_visitas()`) | Sí | Aplicada |
| 28-jun-2026 | **RLS con `with check` en escritura** (todas las tablas de tenant) | Sí | **Pendiente de aplicar en producción** |

---

## 3. Migración pendiente — RLS `with check`

**Qué corrige:** las políticas usaban `for all using (...)` sin `with check`. La cláusula `using` no se evalúa en INSERT, así que un usuario podía insertar filas con `edificio_id` ajeno. La migración recrea cada política con `with check`.

**Riesgo:** bajo. No borra datos; solo refuerza la validación de escritura. Es idempotente (`drop policy if exists` + `create policy`).

**Cómo aplicar:** copiar el bloque "MIGRACIÓN — RLS con WITH CHECK" del final de `schema.sql` y ejecutarlo en Supabase → SQL Editor.

**Cómo revertir:** recrear cada policy con solo `using (...)` (vuelve al estado previo).

**Verificación post-aplicación:** autenticado como conserje del edificio A, intentar `insert` en `visitas` con `edificio_id` del edificio B → debe fallar con error de RLS.

---

## 4. Migración pendiente sugerida — RUT NOT NULL + formato (PR de James)

Quedó documentada en sesiones previas; confirmar si ya se aplicó en producción:

```sql
UPDATE public.visitas SET rut_visitante = '0-0' WHERE rut_visitante IS NULL;
ALTER TABLE public.visitas ALTER COLUMN rut_visitante SET NOT NULL;
-- (el CHECK de formato ya está en el create table actual)
```

Antes de aplicar: respaldo + revisar que no rompa filas existentes.
