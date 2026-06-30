# Drift entre `schema.sql` y producción — detectado 30-jun-2026

`schema.sql` es documentación, no se aplica solo. Esto se detectó probando inserts reales
contra el proyecto Supabase de producción (`cpxywvxwdnpsrxqjoqjl`) con la cuenta de prueba
`admin@portia.cl`, no solo corriendo `build`.

## Qué falta en producción ahora mismo

| Falta | Rompe hoy en prod | Línea en `schema.sql` |
|---|---|---|
| `perfiles.email` | Invitar conserje y listar conserjes en el admin (`apps/admin/app/dashboard/conserjes/`) | 371 |
| `visitas.consentimiento_ley` | Registrar una visita desde el desktop (el form exige el checkbox) | 259 |
| `encomiendas.retirado_por` / `retirado_tipo` | Confirmar retiro de una encomienda desde el desktop | 357-359 |
| tabla `eventos_analitica` | Evento `1er_turno_cerrado` (T-022, PR #8) — falla en silencio (el insert tiene `.catch` con `console.error`, no rompe el cierre de turno, pero no se registra nada) | 407-424 (commit `ea6bd71`) |

Confirmado que **sí** está aplicado en producción: `turnos.pendientes_reconocido_por/at`, RLS
`WITH CHECK` en `novedades`, y las columnas de `tareas` (`vence_at`/`asignada_a`/`creada_por`).

## SQL para aplicar (correr en orden, en el SQL Editor de Supabase — proyecto `cpxywvxwdnpsrxqjoqjl`)

Idempotente — usa `if not exists` en todo, seguro de correr aunque parte ya exista.

```sql
-- 1. perfiles.email
alter table public.perfiles add column if not exists email text;

-- 2. visitas.consentimiento_ley
alter table public.visitas add column if not exists consentimiento_ley boolean not null default false;

-- 3. encomiendas.retirado_por / retirado_tipo
alter table public.encomiendas add column if not exists retirado_por  text;
alter table public.encomiendas add column if not exists retirado_tipo text
  check (retirado_tipo in ('residente','tercero'));

-- 4. tabla eventos_analitica completa
create table if not exists public.eventos_analitica (
  id            uuid primary key default uuid_generate_v4(),
  edificio_id   uuid not null references public.edificios(id) on delete cascade,
  conserje_id   uuid not null references public.perfiles(id) on delete cascade,
  nombre_evento text not null,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

alter table public.eventos_analitica enable row level security;

drop policy if exists "insertar_eventos_edificio_propio" on public.eventos_analitica;
create policy "insertar_eventos_edificio_propio" on public.eventos_analitica
  for insert
  with check (edificio_id = public.mi_edificio_id());

drop policy if exists "ver_eventos_edificio_propio" on public.eventos_analitica;
create policy "ver_eventos_edificio_propio" on public.eventos_analitica
  for select
  using (edificio_id = public.mi_edificio_id());
```

## Cómo verificar que quedó aplicado

Mismo método con el que se detectó — probar un insert real, no solo mirar el schema:

```js
// requiere @supabase/supabase-js, correr con node desde apps/admin (ya tiene la dependencia)
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://cpxywvxwdnpsrxqjoqjl.supabase.co', '<anon key>');
await supabase.auth.signInWithPassword({ email: 'admin@portia.cl', password: '<password>' });
const { error } = await supabase.from('perfiles').select('email').limit(1);
console.log(error ? 'todavía falta' : 'OK');
```

## Por qué pasó esto

Cada PR que tocó `schema.sql` documentó la migración en el archivo y a veces la aplicó a mano
vía Supabase Management API en la misma sesión (ver notas "Aplicado en producción... vía
Management API" en el propio `schema.sql`) — pero no todas las sesiones tuvieron ese acceso, y
no hay ningún paso automático (CI/CD) que sincronice `schema.sql` con la base real. Cada PR que
toque el schema debería terminar con un chequeo explícito tipo el de la sección anterior, no
asumir que "está en el archivo" significa "está en producción".
