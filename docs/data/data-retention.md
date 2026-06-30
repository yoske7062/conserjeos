# Retención de datos — Portia

Cuánto tiempo se conservan los datos personales y cómo se eliminan. Marco legal: Ley 21.719 (protección de datos personales, Chile).

---

## 1. Principio

Se conserva el dato personal solo el tiempo necesario para la finalidad que justificó su recolección. Para Portia, la finalidad principal es el control de acceso al edificio (registro de visitas y encomiendas).

---

## 2. Políticas por dato

| Dato | Finalidad | Retención | Mecanismo |
|---|---|---|---|
| Visitas (nombre, RUT, destino) | Control de acceso | 30 días | `cleanup_old_visitas()` borra visitas con `entrada` > 30 días |
| Consentimiento (`consentimiento_ley`) | Evidencia legal | Mientras exista la visita | Columna en `visitas` |
| Encomiendas | Trazabilidad de entrega | A definir (sugerido: hasta entrega + N días) | **Pendiente** |
| Novedades | Bitácora operativa del edificio | A definir | **Pendiente** |
| Perfiles de usuario | Operación de la cuenta | Mientras la cuenta esté activa | Baja lógica (`activo = false`) |
| Fotos de novedades/encomiendas (Storage) | Evidencia adjunta al registro | Mientras exista la fila que las referencia; huérfanas se borran a los 7 días | Bucket `fotos` privado (signed URLs, sin acceso público) + `cleanup_orphan_fotos()` |

---

## 3. Limpieza automática de visitas

```sql
create or replace function public.cleanup_old_visitas()
returns void language plpgsql security definer as $$
begin
  delete from public.visitas where entrada < now() - interval '30 days';
end;
$$;
```

**Confirmado:** programada con `pg_cron`, job `cleanup-old-visitas`, corre diario a las 04:00 UTC. Aplicado en producción el 29-jun-2026 vía Supabase Management API (job id 1). Mismo patrón replicado para fotos huérfanas: `cleanup_orphan_fotos()`, job `cleanup-orphan-fotos`, diario a las 04:30 UTC.

---

## 4. Derechos del titular (Ley 21.719)

El sistema debe poder, ante una solicitud:
- **Acceso:** mostrar qué datos de una persona se almacenan.
- **Rectificación:** corregir un dato erróneo (la auditoría de ediciones deja rastro).
- **Supresión:** eliminar los datos de una persona.

Estos flujos hoy son manuales (vía consulta SQL). Candidato a feature del panel admin en una etapa futura.

---

## 5. Pendientes

- [x] Confirmar/crear el cron que ejecuta `cleanup_old_visitas()` — hecho 29-jun-2026.
- [x] Bucket de fotos privado + limpieza de huérfanos — hecho 30-jun-2026 (`fix/storage-private-bucket` PR #9, `fix/cleanup-orphan-fotos` PR #10).
- [ ] Definir retención de encomiendas y novedades — decisión de producto, no técnica.
- [ ] Documentar el procedimiento de respuesta a una solicitud de supresión.
