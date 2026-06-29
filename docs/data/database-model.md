# Modelo de datos — Portia

Qué datos se almacenan, en qué tablas y con qué reglas. Fuente única del esquema: `packages/supabase/schema.sql`.

---

## 1. Tablas

| Tabla | Qué guarda | Tenant (`edificio_id`) |
|---|---|---|
| `edificios` | Edificio (nombre, dirección, comuna, plan), contactos y protocolos (jsonb) | es el tenant |
| `perfiles` | Usuario (nombre, rol admin/conserje), extiende `auth.users` | sí |
| `turnos` | Turno de conserje (inicio, fin, pendientes jsonb, reconocimiento) | sí |
| `novedades` | Libro de novedades (tipo incidente/informativo/urgente, descripción, foto) | sí |
| `visitas` | Control de visitas (nombre, RUT, destino, entrada/salida, consentimiento) | sí |
| `encomiendas` | Encomiendas (tipo, remitente, destinatario, depto, estado) | sí |
| `tareas` | Tareas que el admin asigna al conserje | sí |

---

## 2. Convenciones de esquema

- PK: `uuid primary key default uuid_generate_v4()`.
- Timestamps: `timestamptz not null default now()`.
- Toda tabla con datos de tenant tiene `edificio_id uuid not null references public.edificios(id)`.
- Arreglos flexibles: `jsonb not null default '[]'::jsonb`.
- Enums vía `check (col in (...))`, no tipos `enum` de Postgres (difíciles de migrar).

---

## 3. Auditoría de ediciones

Las tablas mutables (`novedades`, `visitas`, `encomiendas`) tienen rastro de edición en vez de sobrescribir:

```sql
editado_por    uuid references public.perfiles(id),
editado_at     timestamptz,
valor_anterior jsonb   -- snapshot de los campos cambiados antes de editar
```

---

## 4. Datos personales (Ley 21.719)

| Campo | Tabla | Tratamiento |
|---|---|---|
| `nombre_visitante` | `visitas` | Personal |
| `rut_visitante` | `visitas` | Personal, con CHECK de formato; nunca usado como secreto |
| `consentimiento_ley` | `visitas` | Registro de consentimiento |
| `destino` / `depto` | `visitas`, `encomiendas` | Personal |

Retención de visitas: 30 días, vía `cleanup_old_visitas()`. Ver [`data-retention.md`](data-retention.md).

---

## 5. Validación del RUT

- **Frontend** (`apps/desktop/src/lib/rut.js`): formateo y validación de dígito verificador en vivo. Solo experiencia de usuario.
- **Base de datos**: `rut_visitante text not null check (rut_visitante ~ '^\d{1,3}(\.\d{3})*-[0-9kK]$')`. Esta es la defensa real: aunque alguien evada el formulario, la BD rechaza un RUT mal formado.

### Mejora pendiente (recomendación de revisión técnica)
Normalizar el RUT antes de guardar (almacenar `12345678-5`, mostrar `12.345.678-5`) para tener una forma canónica única que evite duplicados por formato. Hoy se almacena con puntos. Cambiar el formato de almacenamiento requiere migrar las filas existentes y ajustar el CHECK; debe hacerse como ADR + migración con respaldo previo. No se aplicó en esta ronda para no tocar datos en producción sin respaldo verificado.

---

## 6. RLS por tabla

| Tabla | RLS | Lectura | Escritura (`with check`) |
|---|---|---|---|
| `edificios` | ✅ | edificio propio (SELECT) | reservada a service_role |
| `perfiles` | ✅ | edificio propio | ✅ edificio propio |
| `turnos` | ✅ | edificio propio | ✅ edificio propio |
| `novedades` | ✅ | edificio propio | ✅ edificio propio |
| `visitas` | ✅ | edificio propio | ✅ edificio propio |
| `encomiendas` | ✅ | edificio propio | ✅ edificio propio |
| `tareas` | ✅ | edificio propio | ✅ edificio propio |

El `with check` se agregó en la migración del 28-jun-2026 (ver [`migrations.md`](migrations.md)). Antes, la escritura no validaba el edificio.

---

## 7. Índices

```
novedades   (edificio_id, created_at desc)
visitas     (edificio_id, activa)
encomiendas (edificio_id, entregada)
turnos      (edificio_id, activo)
tareas      (edificio_id, estado)
```

---

## 8. Restricciones recomendadas pendientes

Según la revisión técnica, la BD debería reforzar además:
- Claves foráneas: ✅ presentes.
- `NOT NULL` donde corresponde: ✅ mayormente.
- `UNIQUE` donde aplique (ej. un conserje no debería tener dos turnos activos): **pendiente de evaluar**.
- `CHECK` de formato: ✅ en RUT, tipos y estados.
