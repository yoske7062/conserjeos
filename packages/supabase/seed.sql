-- ============================================================
-- Portia — Seed inicial (ejecutar DESPUÉS del schema.sql)
-- ============================================================
-- PASO 1: Crea los usuarios en Supabase Dashboard → Authentication → Users
--   Admin:    admin@portia.cl   / portia2026
--   Conserje: conserje@portia.cl / portia2026
--
-- PASO 2: Copia los UUIDs generados y reemplaza abajo.
-- PASO 3: Ejecuta este SQL en el SQL Editor de Supabase.
-- ============================================================

-- ─── Reemplaza estos UUIDs con los reales de tus usuarios ────
-- (Encuéntralos en Authentication → Users → columna "UID")
do $$
declare
  v_edificio_id  uuid := uuid_generate_v4();
  v_admin_id     uuid := 'REEMPLAZAR-CON-UUID-ADMIN';
  v_conserje_id  uuid := 'REEMPLAZAR-CON-UUID-CONSERJE';
begin

  -- Edificio de prueba
  insert into public.edificios (id, nombre, direccion, comuna, plan)
  values (v_edificio_id, 'Edificio Las Torres', 'Av. Providencia 1234', 'Providencia', 'trial');

  -- Perfil del admin
  insert into public.perfiles (id, edificio_id, nombre, rol)
  values (v_admin_id, v_edificio_id, 'Carlos Administrador', 'admin');

  -- Perfil del conserje
  insert into public.perfiles (id, edificio_id, nombre, rol)
  values (v_conserje_id, v_edificio_id, 'María González', 'conserje');

end $$;

-- ─── Verificación ─────────────────────────────────────────────
select 'edificios' as tabla, count(*) from public.edificios
union all
select 'perfiles', count(*) from public.perfiles;
