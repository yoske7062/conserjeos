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

-- ============================================================
-- MIGRACIÓN — Trazabilidad de retiro de encomiendas (28-jun-2026)
-- ============================================================
-- Quién retiró cada encomienda: el residente o un tercero autorizado.

alter table public.encomiendas add column if not exists retirado_por  text;
alter table public.encomiendas add column if not exists retirado_tipo text
  check (retirado_tipo in ('residente','tercero'));

create index if not exists tareas_edificio_estado_idx on public.tareas (edificio_id, estado);
