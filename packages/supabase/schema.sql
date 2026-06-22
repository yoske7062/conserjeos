-- ============================================================
-- ConserjeOS — Schema PostgreSQL para Supabase
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
  created_at  timestamptz not null default now()
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
  id           uuid primary key default uuid_generate_v4(),
  edificio_id  uuid not null references public.edificios(id) on delete cascade,
  conserje_id  uuid not null references public.perfiles(id),
  inicio       timestamptz not null default now(),
  fin          timestamptz,
  resumen      text,
  activo       boolean not null default true
);

-- ─── TABLA: novedades ────────────────────────────────────────
create table public.novedades (
  id           uuid primary key default uuid_generate_v4(),
  edificio_id  uuid not null references public.edificios(id) on delete cascade,
  turno_id     uuid references public.turnos(id),
  conserje_id  uuid not null references public.perfiles(id),
  tipo         text not null check (tipo in ('incidente','informativo','urgente')),
  descripcion  text not null,
  foto_url     text,
  created_at   timestamptz not null default now()
);

-- ─── TABLA: visitas ──────────────────────────────────────────
create table public.visitas (
  id              uuid primary key default uuid_generate_v4(),
  edificio_id     uuid not null references public.edificios(id) on delete cascade,
  turno_id        uuid references public.turnos(id),
  conserje_id     uuid not null references public.perfiles(id),
  nombre_visitante text not null,
  rut_visitante   text,
  destino         text not null,          -- depto/oficina
  motivo          text,
  entrada         timestamptz not null default now(),
  salida          timestamptz,
  activa          boolean not null default true
);

-- ─── TABLA: encomiendas ──────────────────────────────────────
create table public.encomiendas (
  id              uuid primary key default uuid_generate_v4(),
  edificio_id     uuid not null references public.edificios(id) on delete cascade,
  turno_id        uuid references public.turnos(id),
  conserje_id     uuid not null references public.perfiles(id),
  remitente       text,
  destinatario    text not null,
  depto           text not null,
  foto_url        text,
  recibida_at     timestamptz not null default now(),
  entregada_at    timestamptz,
  entregada       boolean not null default false
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.edificios   enable row level security;
alter table public.perfiles    enable row level security;
alter table public.turnos      enable row level security;
alter table public.novedades   enable row level security;
alter table public.visitas     enable row level security;
alter table public.encomiendas enable row level security;

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

-- ─── STORAGE BUCKET para fotos ───────────────────────────────
-- Ejecutar en Supabase Dashboard → Storage → New Bucket
-- Nombre: "fotos-novedades", público: false
-- O via API:
-- insert into storage.buckets (id, name) values ('fotos', 'fotos');
