# Rollback — Portia

Cómo volver a un estado estable cuando un despliegue introduce errores. Un rollback seguro exige saber, antes de actuar: qué versión funcionaba, qué cambios de BD se aplicaron, si son reversibles, cómo restaurar datos y cómo verificar que el sistema volvió a estar estable.

---

## 1. App de escritorio

Cada versión publicada es un tag inmutable con sus instaladores en GitHub Releases.

### Revertir a una versión anterior
1. Identificar el último tag estable (ej. `v1.1.8`).
2. Volver a publicar esa release como la recomendada, o avisar a los conserjes que instalen el instalador previo desde GitHub Releases.
3. Si el problema entró por código en `main`:
   ```bash
   git revert <sha-del-commit-problematico>   # crea un commit que deshace el cambio
   git push origin main                        # vía PR
   ```
   **No** se usa `git reset --hard` ni force-push sobre `main`.

### Por qué tags inmutables
Un tag nunca se reescribe. Si `v1.2.0` salió con un bug, no se "arregla" el tag: se publica `v1.2.1`. Esto garantiza que cada versión instalada sea trazable.

---

## 2. Panel admin (Vercel)

- Vercel guarda cada despliegue. Rollback inmediato desde el dashboard: *Deployments → seleccionar el despliegue estable → Promote to Production*.
- Alternativa por git: `git revert` del commit y merge por PR.

---

## 3. Base de datos

Este es el rollback más delicado, porque los datos no se "deshacen" con git.

### Antes de cualquier migración riesgosa
- [ ] Respaldo reciente verificado (ver [`../data/backup-restore.md`](../data/backup-restore.md)).
- [ ] La migración fue probada en desarrollo.
- [ ] Se conoce la migración inversa.

### Tipos de cambio y su reversibilidad
| Cambio | Reversible | Cómo revertir |
|---|---|---|
| `add column ... default` | Sí | `alter table ... drop column` (se pierde lo escrito en esa columna) |
| `add policy` / `with check` | Sí | `drop policy` |
| `add index` | Sí | `drop index` |
| `drop column` / `drop table` | **No sin respaldo** | Restaurar desde backup |
| Cambio de formato de datos existentes | Riesgoso | Restaurar desde backup |

### Procedimiento
1. Detener despliegues que dependan del estado nuevo.
2. Si el cambio es estructural y reversible: aplicar la migración inversa.
3. Si hubo pérdida o corrupción de datos: restaurar desde el último respaldo (ver `backup-restore.md`).
4. Verificar consistencia.

---

## 4. Verificar que el sistema volvió a estable

- [ ] Login funciona.
- [ ] Flujo principal funciona con datos reales.
- [ ] Las cifras/listados tienen sentido de negocio (no solo "no crashea").
- [ ] No hay errores nuevos en logs.
- [ ] El equipo confirma que el síntoma original desapareció.

---

## 5. Regla

Si no sabes cómo revertir un cambio **antes** de aplicarlo, no lo apliques. Todo cambio que llega a producción debe tener una ruta de rollback conocida.
