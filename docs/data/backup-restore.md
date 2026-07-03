# Respaldo y restauración — Portia

Cómo se protege y se recupera la base de datos. Un respaldo no se considera confiable hasta que se haya probado la restauración.

---

## 1. Qué respaldar

| Activo | Dónde | Quién respalda |
|---|---|---|
| Base de datos PostgreSQL | Supabase | Supabase (automático) + export manual |
| Storage (fotos) | Supabase Storage | Supabase |
| Esquema (DDL) | `packages/supabase/schema.sql` en git | El repo es el respaldo del esquema |

---

## 2. Política de respaldo

| Parámetro | Valor objetivo |
|---|---|
| Frecuencia | Diaria (automática de Supabase) + manual antes de cada migración riesgosa |
| Retención | Según plan de Supabase; mínimo 7 días recomendados |
| Ubicación | Infraestructura de Supabase (región São Paulo) + export puntual fuera de Supabase para hitos |
| Cifrado | En reposo, gestionado por Supabase |
| Responsable | Diego |
| RTO (tiempo objetivo de recuperación) | < 4 horas |
| Última prueba de restauración | Intentada 02-jul-2026 — ver hallazgos abajo. No completada aún. |

> El proyecto `cpxywvxwdnpsrxqjoqjl` está en plan **Free** — sin Point-in-Time Recovery (PITR) ni backups automáticos gestionados con restore por dashboard. Eso solo existe en planes Pro o superiores. Al pasar a Pro, repetir esta prueba usando PITR directo.

### Hallazgos del intento de prueba (02-jul-2026)

Se intentó una restauración real en dos niveles, con estos resultados:

1. **Restore a Postgres local (Homebrew, gratis):** falla de raíz. `schema.sql` no es
   auto-contenido — depende de esquemas y roles que solo existen dentro de la
   plataforma gestionada de Supabase (`auth.users`, `storage.buckets`, roles
   `anon`/`authenticated`/`service_role`). No se puede restaurar contra un Postgres
   vanilla sin antes recrear esa capa (vía Supabase CLI + Docker, no instalado en
   esta sesión).
2. **Restore a un segundo proyecto Supabase (gratis, mismo entorno real):**
   bloqueado — la organización ya tiene 2 proyectos free activos bajo la cuenta de
   James (límite del plan Free por organización). No se pudo crear el proyecto
   temporal sin pausar o borrar algo de él primero, y eso requiere su autorización,
   no la de esta sesión.

**Conclusión honesta:** la prueba de restauración real sigue sin completarse. No es
un pendiente que se pueda resolver solo con más tiempo de código — necesita, o (a)
que James libere un slot de proyecto free, o (b) que Diego apruebe crear un proyecto
en otra organización/cuenta, o (c) instalar Docker + Supabase CLI para levantar el
stack completo localmente (`supabase start`).

---

## 3. Respaldo manual antes de una migración

```bash
# Export de la base vía pg_dump (requiere la connection string de Supabase →
# Project Settings → Database → Connection string)
pg_dump "postgresql://postgres:[PASSWORD]@db.cpxywvxwdnpsrxqjoqjl.supabase.co:5432/postgres" \
  --no-owner --format=custom --file portia-backup-$(date +%F).dump
```

Guardar el archivo fuera del repo (nunca commitearlo: contiene datos personales).

---

## 4. Restauración

```bash
# Restaurar a un proyecto/instancia limpia
pg_restore --no-owner --clean --if-exists \
  --dbname "postgresql://postgres:[PASSWORD]@db.[PROYECTO].supabase.co:5432/postgres" \
  portia-backup-AAAA-MM-DD.dump
```

Alternativa gestionada: Supabase Dashboard → Database → Backups → Restore (o PITR si el plan lo permite).

---

## 5. Probar la restauración (obligatorio)

Un respaldo sin restauración probada no es un respaldo. Procedimiento de prueba:

1. Crear un proyecto Supabase temporal (o instancia local).
2. Restaurar el último backup ahí.
3. Verificar: número de filas por tabla coherente, login de un usuario de prueba, un flujo principal funciona.
4. Registrar la fecha de la prueba en la tabla de la sección 2.
5. Eliminar el proyecto temporal.

Frecuencia recomendada de la prueba: trimestral y antes de cualquier migración destructiva.

---

## 6. Recuperación ante pérdida de datos

Ver el flujo completo en [`../engineering/rollback.md`](../engineering/rollback.md) sección "Base de datos" y [`../security/incident-response.md`](../security/incident-response.md) sección "Pérdida o corrupción de datos".
