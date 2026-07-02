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
| Última prueba de restauración | **Pendiente — debe ejecutarse y registrarse aquí** |

> Supabase ofrece backups automáticos y, en planes superiores, Point-in-Time Recovery (PITR). Confirmar el plan actual del proyecto `cpxywvxwdnpsrxqjoqjl` para saber qué nivel está disponible.

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
