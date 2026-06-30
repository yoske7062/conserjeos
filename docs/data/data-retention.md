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
| Encomiendas | Trazabilidad de entrega | **Propuesta: 90 días desde `recibida_at`** (a confirmar por Diego) | **Propuesto, NO aplicado** — ver §3.1 |
| Novedades | Bitácora operativa del edificio | **Propuesta: 90 días desde `created_at`** (a confirmar por Diego) | **Propuesto, NO aplicado** — ver §3.1 |
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

## 3.1 Retención de encomiendas y novedades — PROPUESTA (no aplicada)

> ⚠️ **Esto NO está aplicado en producción.** Es una propuesta para que Diego apruebe el plazo
> antes de programar el cron. Aplicar retención borra datos de forma automática y recurrente —
> es irreversible, por eso no se ejecuta sin aprobación explícita.

**Plazo propuesto: 90 días.** Razonamiento: para una bitácora operativa de portería, 90 días
cubre cualquier necesidad de consulta retroactiva razonable (reclamos, seguimiento de
encomiendas no retiradas, revisión de incidentes del trimestre) sin acumular datos personales
indefinidamente. Es más largo que el de visitas (30 días) porque novedades y encomiendas tienen
valor operativo por más tiempo, pero sigue siendo acotado. **Diego puede subir o bajar este
número** — es una decisión de negocio, no técnica.

SQL propuesto (mismo patrón que `cleanup_old_visitas`), **para correr solo tras aprobación**:

```sql
-- NO APLICADO — pendiente de aprobación de Diego sobre el plazo de 90 días.
create or replace function public.cleanup_old_encomiendas()
returns void language plpgsql security definer as $$
begin
  delete from public.encomiendas where recibida_at < now() - interval '90 days';
end;
$$;

create or replace function public.cleanup_old_novedades()
returns void language plpgsql security definer as $$
begin
  delete from public.novedades where created_at < now() - interval '90 days';
end;
$$;

-- Programar (ej. 04:15 y 04:20 UTC, después del cron de visitas):
-- select cron.schedule('cleanup-old-encomiendas', '15 4 * * *', $$select public.cleanup_old_encomiendas();$$);
-- select cron.schedule('cleanup-old-novedades',   '20 4 * * *', $$select public.cleanup_old_novedades();$$);
```

> Las fotos asociadas a esos registros borrados quedan huérfanas y las recoge el cron
> `cleanup_orphan_fotos` (7 días después). No hace falta borrarlas a mano.

**Sobre consentimiento en encomiendas/novedades:** a diferencia de visitas, estos flujos **no
requieren un campo de consentimiento propio**. El residente que recibe una encomienda no es un
tercero externo cuyo dato se capta para control de acceso; el dato (nombre + depto) ya lo tiene
el edificio por la relación contractual de copropiedad. Las novedades son bitácora operativa
interna. El abogado debe confirmarlo, pero la lógica de producto es que el consentimiento
explícito tiene sentido para el **visitante** (un tercero del que se capta el RUT), no para el
residente en estos dos flujos.

---

## 4. Derechos del titular (Ley 21.719) — procedimiento operativo

Mientras no exista una feature en el panel admin para esto, el procedimiento es **manual** y lo
ejecuta quien tenga acceso a la base (hoy, Diego). El primer punto de contacto del titular es la
**administración del edificio** (responsable); el edificio canaliza la solicitud a Portia.

### 4.1 Acceso — "¿qué datos míos tienen?"

Buscar por RUT (visitas) o por nombre (encomiendas) dentro del edificio del solicitante:

```sql
-- Reemplazar el RUT y el edificio_id reales.
select 'visita' as origen, nombre_visitante, rut_visitante, destino, entrada, salida
  from public.visitas
  where rut_visitante = '11.111.111-1' and edificio_id = '<edificio_id>'
union all
select 'encomienda', destinatario, null, depto, recibida_at, entregada_at
  from public.encomiendas
  where destinatario ilike '%<nombre>%' and edificio_id = '<edificio_id>';
```

Entregar el resultado al titular a través del responsable.

### 4.2 Rectificación — "este dato está mal"

La app ya permite editar visitas/encomiendas/novedades desde la UI, y deja rastro de auditoría
(`editado_por`, `editado_at`, `valor_anterior`). Para una rectificación pedida por un titular,
editar el registro por la vía normal de la app es suficiente y preferible (queda el rastro).

### 4.3 Supresión — "borren mis datos"

```sql
-- 1. Identificar las filas (ver §4.1) y confirmar que son del edificio correcto.
-- 2. Borrar. Las fotos asociadas quedan huérfanas y las recoge cleanup_orphan_fotos (7 días).
delete from public.visitas      where rut_visitante = '11.111.111-1' and edificio_id = '<edificio_id>';
delete from public.encomiendas  where destinatario ilike '%<nombre>%' and edificio_id = '<edificio_id>';
-- 3. Si la solicitud es urgente respecto de las fotos, correr cleanup_orphan_fotos() a mano:
--    select public.cleanup_orphan_fotos();
-- 4. Dejar constancia (fecha, qué se borró, quién lo pidió) fuera del sistema, sin volver a
--    guardar datos personales del titular.
```

> **Importante:** verificar siempre el `edificio_id` antes de borrar, para no afectar datos de
> otro edificio. No borrar por RUT/nombre globalmente.

---

## 5. Pendientes

- [x] Confirmar/crear el cron que ejecuta `cleanup_old_visitas()` — hecho 29-jun-2026.
- [x] Bucket de fotos privado + limpieza de huérfanos — hecho 30-jun-2026 (`fix/storage-private-bucket` PR #9, `fix/cleanup-orphan-fotos` PR #10).
- [x] Documentar el procedimiento de respuesta a una solicitud de supresión — §4.
- [ ] **Diego: aprobar el plazo de retención de encomiendas/novedades (propuesta: 90 días) y aplicar el cron de §3.1.**
- [ ] Futuro: convertir el procedimiento manual de §4 en una feature del panel admin.
