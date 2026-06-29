# Respuesta a incidentes — Portia

Qué hacer cuando algo sale mal en producción: una brecha, una caída o una pérdida de datos.

---

## 1. Clasificación

| Severidad | Ejemplo | Tiempo de respuesta |
|---|---|---|
| Crítica | Fuga de datos personales, `service_role` expuesta, acceso entre edificios | Inmediato |
| Alta | App caída para todos, login roto | < 2 horas |
| Media | Una feature rota, sincronización offline falla | < 1 día |
| Baja | Bug cosmético, error no bloqueante | Próximo PR |

---

## 2. Primeros pasos (cualquier incidente)

1. **Contener:** detener despliegues en curso. Si hay datos comprometidos, restringir el acceso afectado.
2. **Evaluar:** qué falló, cuándo empezó, a qué usuarios/edificios afecta, si sigue ocurriendo. Apoyarse en logs (ver [`../engineering/observability.md`](../engineering/observability.md)).
3. **Comunicar:** avisar a Diego. Si afecta datos personales, evaluar obligaciones legales (Ley 21.719).

---

## 3. Brecha de seguridad

### `service_role` key expuesta
1. Rotar la key en Supabase → Settings → API.
2. Actualizar Vercel / GitHub Actions / entornos locales.
3. Revisar logs de acceso por uso anómalo.

### Acceso entre edificios (RLS rota)
1. Identificar la política faltante o sin `with check`.
2. Aplicar la corrección como migración (ver [`../data/migrations.md`](../data/migrations.md)).
3. Auditar qué datos pudieron verse y por quién.

---

## 4. Caída del servicio

- **App desktop:** revertir a la última versión estable (ver [`../engineering/rollback.md`](../engineering/rollback.md)).
- **Panel admin:** promover el último despliegue estable en Vercel.
- **Supabase caído:** la app entra en modo offline; las mutaciones se encolan. Verificar el estado en status.supabase.com.

---

## 5. Pérdida o corrupción de datos

1. Detener escrituras que empeoren el estado.
2. Restaurar desde el último respaldo verificado (ver [`../data/backup-restore.md`](../data/backup-restore.md)).
3. Verificar consistencia y sentido de negocio antes de reabrir.

---

## 6. Post-mortem

Después de resolver un incidente de severidad alta o crítica, escribir un registro breve:
- Qué pasó y cuándo.
- Causa raíz.
- Cómo se resolvió.
- Qué se cambia para que no vuelva a pasar (regla nueva, prueba nueva, ADR).

Sin culpar a personas; el objetivo es que el sistema no permita repetir el error.
