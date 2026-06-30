-- ============================================================
-- Portia — Schema PostgreSQL para Supabase
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase en orden.

-- ─── EXTENSIONES ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── TABLA: edificios (tenants) ──────────────────────────────
create table public.edificios (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  direccion   text,
  comuna      text,
  plan        text not null default 'trial',  -- trial | basic | pro
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  -- Ficha de edificio: [{ "nombre": "...", "rol": "...", "telefono": "..." }, ...]
  contactos   jsonb not null default '[]'::jsonb,
  -- Protocolos individuales: [{ "titulo": "...", "texto": "..." }, ...]
  protocolos  jsonb not null default '[]'::jsonb
);

-- ─── TABLA: perfiles de usuario ──────────────────────────────
-- Extiende auth.users de Supabase
create table public.perfiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  edificio_id  uuid references public.edificios(id) on delete cascade,
  nombre       text not null,
  rol          text not null check (rol in ('admin','conserje')),
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ─── TABLA: turnos ───────────────────────────────────────────
create table public.turnos (
  id                        uuid primary key default uuid_generate_v4(),
  edificio_id               uuid not null references public.edificios(id) on delete cascade,
  conserje_id               uuid not null references public.perfiles(id),
  inicio                    timestamptz not null default now(),
  fin                       timestamptz,
  resumen                   text,
  activo                    boolean not null default true,
  -- Pendientes que este turno deja al siguiente: [{ "texto": "..." }, ...]
  pendientes                jsonb not null default '[]'::jsonb,
  pendientes_reconocido_por uuid references public.perfiles(id),
  pendientes_reconocido_at  timestamptz
);

-- ─── TABLA: novedades ────────────────────────────────────────
create table public.novedades (
  id              uuid primary key default uuid_generate_v4(),
  edificio_id     uuid not null references public.edificios(id) on delete cascade,
  turno_id        uuid references public.turnos(id),
  conserje_id     uuid not null references public.perfiles(id),
  tipo            text not null check (tipo in ('incidente','informativo','urgente')),
  descripcion     text not null,
  foto_url        text,
  created_at      timestamptz not null default now(),
  editado_por     uuid references public.perfiles(id),
  editado_at      timestamptz,
  valor_anterior  jsonb
);

-- ─── TABLA: visitas ──────────────────────────────────────────
create table public.visitas (
  id              uuid primary key default uuid_generate_v4(),
  edificio_id     uuid not null references public.edificios(id) on delete cascade,
  turno_id        uuid references public.turnos(id),
  conserje_id     uuid not null references public.perfiles(id),
  nombre_visitante text not null,
  rut_visitante   text not null check (rut_visitante ~ '^\d{1,3}(\.\d{3})*-[0-9kK]$'),
  destino         text not null,          -- depto/oficina
  motivo          text,
  entrada         timestamptz not null default now(),
  salida          timestamptz,
  activa          boolean not null default true,
  editado_por     uuid references public.perfiles(id),
  editado_at      timestamptz,
  valor_anterior  jsonb
);

-- ─── TABLA: encomiendas ──────────────────────────────────────
create table public.encomiendas (
  id              uuid primary key default uuid_generate_v4(),
  edificio_id     uuid not null references public.edificios(id) on delete cascade,
  turno_id        uuid references public.turnos(id),
  conserje_id     uuid not null references public.perfiles(id),
  tipo            text not null default 'paquete'
                  check (tipo in ('paquete','comida','supermercado','otro')),
  remitente       text,
  destinatario    text not null,
  depto           text not null,
  foto_url        text,
  recibida_at     timestamptz not null default now(),
  entregada_at    timestamptz,
  entregada       boolean not null default false,
  retirado_por    text,
  retirado_tipo   text check (retirado_tipo in ('residente','tercero')),
  editado_por     uuid references public.perfiles(id),
  editado_at      timestamptz,
  valor_anterior  jsonb
);

-- ─── TABLA: tareas ───────────────────────────────────────────
-- El administrador asigna, el conserje ejecuta y marca como completada.
create table public.tareas (
  id              uuid primary key default uuid_generate_v4(),
  edificio_id     uuid not null references public.edificios(id) on delete cascade,
  titulo          text not null,
  descripcion     text,
  asignada_a      uuid references public.perfiles(id),  -- null = cualquier conserje del turno
  creada_por      uuid references public.perfiles(id),
  prioridad       text not null default 'normal' check (prioridad in ('baja','normal','alta')),
  estado          text not null default 'pendiente' check (estado in ('pendiente','completada')),
  vence_at        timestamptz,
  completada_at   timestamptz,
  completada_por  uuid references public.perfiles(id),
  created_at      timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.edificios   enable row level security;
alter table public.perfiles    enable row level security;
alter table public.turnos      enable row level security;
alter table public.novedades   enable row level security;
alter table public.visitas     enable row level security;
alter table public.encomiendas enable row level security;
alter table public.tareas      enable row level security;

-- Helper: obtiene edificio_id del usuario autenticado
create or replace function public.mi_edificio_id()
returns uuid language sql security definer stable as $$
  select edificio_id from public.perfiles where id = auth.uid()
$$;

-- Helper: obtiene rol del usuario autenticado
create or replace function public.mi_rol()
returns text language sql security definer stable as $$
  select rol from public.perfiles where id = auth.uid()
$$;

-- Policies: cada usuario solo ve datos de su edificio
create policy "edificio propio" on public.edificios
  for select using (id = public.mi_edificio_id());

create policy "perfiles del edificio" on public.perfiles
  for all using (edificio_id = public.mi_edificio_id());

create policy "turnos del edificio" on public.turnos
  for all using (edificio_id = public.mi_edificio_id());

create policy "novedades del edificio" on public.novedades
  for all using (edificio_id = public.mi_edificio_id());

create policy "visitas del edificio" on public.visitas
  for all using (edificio_id = public.mi_edificio_id());

create policy "encomiendas del edificio" on public.encomiendas
  for all using (edificio_id = public.mi_edificio_id());

create policy "tareas del edificio" on public.tareas
  for all using (edificio_id = public.mi_edificio_id());

-- ─── FUNCIÓN: crear perfil al registrar usuario ──────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- El perfil se crea manualmente desde el admin, no automático
  -- Esta función solo existe como hook futuro
  return new;
end;
$$;

-- ─── ÍNDICES ─────────────────────────────────────────────────
create index on public.novedades   (edificio_id, created_at desc);
create index on public.visitas     (edificio_id, activa);
create index on public.encomiendas (edificio_id, entregada);
create index on public.turnos      (edificio_id, activo);
create index on public.tareas      (edificio_id, estado);

-- ─── STORAGE BUCKET para fotos ───────────────────────────────
-- Ejecutar en Supabase Dashboard → Storage → New Bucket
-- Nombre: "fotos-novedades", público: false
-- O via API:
-- insert into storage.buckets (id, name) values ('fotos', 'fotos');

-- ============================================================
-- MIGRACIÓN — Auditoría de ediciones (22-jun-2026)
-- ============================================================
-- Este proyecto ya tiene las tablas creadas en Supabase con datos.
-- Ejecutar SOLO este bloque en el SQL Editor (no el create table de arriba).
-- Habilita "editar registro dejando rastro" en vez de sobreescribir/borrar.

alter table public.novedades   add column if not exists editado_por    uuid references public.perfiles(id);
alter table public.novedades   add column if not exists editado_at     timestamptz;
alter table public.novedades   add column if not exists valor_anterior jsonb;

alter table public.visitas     add column if not exists editado_por    uuid references public.perfiles(id);
alter table public.visitas     add column if not exists editado_at     timestamptz;
alter table public.visitas     add column if not exists valor_anterior jsonb;

alter table public.encomiendas add column if not exists editado_por    uuid references public.perfiles(id);
alter table public.encomiendas add column if not exists editado_at     timestamptz;
alter table public.encomiendas add column if not exists valor_anterior jsonb;

-- ============================================================
-- MIGRACIÓN — Entrega de turno con pendientes (22-jun-2026)
-- ============================================================
-- Habilita el módulo "Entrega de turno": pendientes que un turno deja
-- al siguiente, con reconocimiento explícito ("Leído") del conserje entrante.

alter table public.turnos add column if not exists pendientes                jsonb not null default '[]'::jsonb;
alter table public.turnos add column if not exists pendientes_reconocido_por uuid references public.perfiles(id);
alter table public.turnos add column if not exists pendientes_reconocido_at  timestamptz;

-- ============================================================
-- MIGRACIÓN — Ficha de edificio (22-jun-2026)
-- ============================================================
-- Contactos importantes y protocolos individuales del edificio, para que un
-- reemplazo que no conoce la comunidad pueda operar sin equivocarse.

alter table public.edificios add column if not exists contactos  jsonb not null default '[]'::jsonb;
alter table public.edificios add column if not exists protocolos jsonb not null default '[]'::jsonb;

-- ============================================================
-- MIGRACIÓN — Tareas (23-jun-2026)
-- ============================================================
-- El administrador asigna tareas, el conserje las ve y marca como completadas.

create table if not exists public.tareas (
  id              uuid primary key default uuid_generate_v4(),
  edificio_id     uuid not null references public.edificios(id) on delete cascade,
  titulo          text not null,
  descripcion     text,
  asignada_a      uuid references public.perfiles(id),
  creada_por      uuid references public.perfiles(id),
  prioridad       text not null default 'normal' check (prioridad in ('baja','normal','alta')),
  estado          text not null default 'pendiente' check (estado in ('pendiente','completada')),
  vence_at        timestamptz,
  completada_at   timestamptz,
  completada_por  uuid references public.perfiles(id),
  created_at      timestamptz not null default now()
);

alter table public.tareas enable row level security;

-- Nota: si ya corriste este bloque antes, borra la policy existente primero
-- (drop policy "tareas del edificio" on public.tareas;) para evitar error de duplicado.
create policy "tareas del edificio" on public.tareas
  for all using (edificio_id = public.mi_edificio_id());

-- Contexto: Ley 21.719 (28-jun-2026)

-- ============================================================
-- MIGRACIÓN — Consentimiento y Retención Ley 21.719 (28-jun-2026)
-- ============================================================
-- 1. Agregar columna para registrar consentimiento
alter table public.visitas add column if not exists consentimiento_ley boolean not null default false;

-- 2. Función de limpieza de visitas antiguas (retención de 30 días)
create or replace function public.cleanup_old_visitas()
returns void language plpgsql security definer as $$
begin
  delete from public.visitas where entrada < now() - interval '30 days';
end;
$$;

-- ============================================================
-- MIGRACIÓN — RLS con WITH CHECK en escritura (28-jun-2026)
-- ============================================================
-- Hallazgo (revisión técnica): las políticas usaban `for all using (...)`
-- SIN `with check`. La cláusula `using` no se evalúa en INSERT, por lo que
-- un usuario autenticado podía INSERTAR filas con un edificio_id ajeno
-- (y reasignar filas a otro edificio en UPDATE). `with check` cierra ese hueco.
--
-- Estado previo: lectura aislada por edificio OK; escritura no validada.
-- Estado nuevo: lectura y escritura validadas por edificio en todas las tablas.
--
-- Reversible: sí. Para revertir, recrear cada policy con solo `using (...)`.
-- No destructivo: no borra datos, solo refuerza la validación de escritura.
--
-- Ejecutar en Supabase → SQL Editor. Se recrea cada policy de forma idempotente.

-- perfiles
drop policy if exists "perfiles del edificio" on public.perfiles;
create policy "perfiles del edificio" on public.perfiles
  for all
  using      (edificio_id = public.mi_edificio_id())
  with check (edificio_id = public.mi_edificio_id());

-- turnos
drop policy if exists "turnos del edificio" on public.turnos;
create policy "turnos del edificio" on public.turnos
  for all
  using      (edificio_id = public.mi_edificio_id())
  with check (edificio_id = public.mi_edificio_id());

-- novedades
drop policy if exists "novedades del edificio" on public.novedades;
create policy "novedades del edificio" on public.novedades
  for all
  using      (edificio_id = public.mi_edificio_id())
  with check (edificio_id = public.mi_edificio_id());

-- visitas
drop policy if exists "visitas del edificio" on public.visitas;
create policy "visitas del edificio" on public.visitas
  for all
  using      (edificio_id = public.mi_edificio_id())
  with check (edificio_id = public.mi_edificio_id());

-- encomiendas
drop policy if exists "encomiendas del edificio" on public.encomiendas;
create policy "encomiendas del edificio" on public.encomiendas
  for all
  using      (edificio_id = public.mi_edificio_id())
  with check (edificio_id = public.mi_edificio_id());

-- tareas
drop policy if exists "tareas del edificio" on public.tareas;
create policy "tareas del edificio" on public.tareas
  for all
  using      (edificio_id = public.mi_edificio_id())
  with check (edificio_id = public.mi_edificio_id());

-- edificios: la lectura sigue restringida al edificio propio.
-- La escritura de edificios queda reservada al backend (service_role), que salta RLS.
-- No se agrega policy de escritura para usuarios anon a propósito.

-- ============================================================
-- MIGRACIÓN — Cron de retención Ley 21.719 (29-jun-2026)
-- ============================================================
-- La función cleanup_old_visitas() ya existía pero no se ejecutaba sola.
-- Se habilita pg_cron y se programa la limpieza diaria de visitas > 30 días.
--
-- Aplicado en producción (proyecto cpxywvxwdnpsrxqjoqjl) el 29-jun-2026
-- vía Supabase Management API. Job id: 1.

create extension if not exists pg_cron;

select cron.schedule(
  'cleanup-old-visitas',
  '0 4 * * *',                                   -- todos los días a las 04:00 UTC
  $$select public.cleanup_old_visitas();$$
);

-- Para revisar el job: select * from cron.job;
-- Para ver ejecuciones:  select * from cron.job_run_details order by start_time desc limit 20;
-- Para desactivar:       select cron.unschedule('cleanup-old-visitas');

-- ============================================================
-- MIGRACIÓN — Trazabilidad de retiro de encomiendas (28-jun-2026)
-- ============================================================
-- Quién retiró cada encomienda: el residente o un tercero autorizado.

alter table public.encomiendas add column if not exists retirado_por  text;
alter table public.encomiendas add column if not exists retirado_tipo text
  check (retirado_tipo in ('residente','tercero'));

create index if not exists tareas_edificio_estado_idx on public.tareas (edificio_id, estado);

-- ============================================================
-- STORAGE — Bucket de fotos (29-jun-2026, endurecido 30-jun-2026)
-- ============================================================
-- El bucket 'fotos' es PRIVADO. El desktop y el admin ya no usan
-- getPublicUrl() — usan createSignedUrl() (ver apps/desktop/src/lib/fotos.js
-- y apps/admin/lib/fotos.js), por lo que la lectura también pasa por RLS de
-- storage.objects. La escritura/lectura están restringidas por edificio: el
-- path es {tabla}/{edificio_id}/{archivo}, así que el 2do segmento de la ruta
-- debe coincidir con mi_edificio_id().
--
-- Aplicado en producción (proyecto cpxywvxwdnpsrxqjoqjl) vía Supabase
-- Management API: bucket creado público el 29-jun-2026, pasado a privado el
-- 30-jun-2026 (cumplimiento Ley 21.719 — las fotos ya no son accesibles por
-- URL directa sin autenticación).

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', false)
on conflict (id) do update set public = false;

-- Leer: solo dentro de la carpeta del propio edificio (necesario para
-- createSignedUrl(), que en bucket privado también pasa por esta policy).
drop policy if exists "fotos: leer mi edificio" on storage.objects;
create policy "fotos: leer mi edificio" on storage.objects
  for select to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[2] = public.mi_edificio_id()::text);

-- Subir: solo a la carpeta del propio edificio.
drop policy if exists "fotos: subir a mi edificio" on storage.objects;
create policy "fotos: subir a mi edificio" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'fotos'
    and (storage.foldername(name))[2] = public.mi_edificio_id()::text
  );

-- Modificar / borrar: solo dentro de la carpeta del propio edificio.
drop policy if exists "fotos: modificar mi edificio" on storage.objects;
create policy "fotos: modificar mi edificio" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[2] = public.mi_edificio_id()::text);

drop policy if exists "fotos: borrar mi edificio" on storage.objects;
create policy "fotos: borrar mi edificio" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[2] = public.mi_edificio_id()::text);
