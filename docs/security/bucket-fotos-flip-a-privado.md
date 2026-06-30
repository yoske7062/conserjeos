# Runbook: flipear el bucket `fotos` a privado en producción

Este documento es solo el procedimiento. **Cuándo ejecutarlo es una decisión de Diego**, no algo
que un agente decida solo — ver la sección 1.

---

## 1. Por qué está pendiente

El código (`fix/storage-private-bucket`, PR #9, mergeado a `main`) ya asume bucket privado:
usa `createSignedUrl()` en vez de `getPublicUrl()` tanto en desktop como en admin. Pero el
**bucket real en producción** (proyecto `cpxywvxwdnpsrxqjoqjl`) puede seguir configurado como
público hasta que alguien ejecute el flip vía Management API o el SQL Editor.

**No conviene flipear el bucket antes de que el desktop actualizado esté distribuido.** Si el
bucket pasa a privado mientras hay clientes desktop corriendo una versión vieja (que todavía
usa `getPublicUrl()`), esos clientes van a mostrar fotos rotas hasta que actualicen — no es un
error de datos, es solo una ventana de UX incómoda. Como hoy no hay usuarios reales (sigue sin
resolverse T-030), el riesgo es bajo, pero igual hay que decidirlo a propósito, no por default.

## 2. Pre-requisitos antes de ejecutar

- [ ] Confirmar que `main` tiene mergeado el PR #9 (bucket privado + signed URLs en código) —
      ya está, mergeado 30-jun-2026.
- [ ] Confirmar que el build de `apps/desktop` que la gente tiene instalado (o va a instalar)
      corresponde a un commit posterior al merge de PR #9. Si hay una release de Electron
      pendiente de publicar, publicarla primero.
- [ ] Avisar a Diego/James antes de ejecutar — esto es un cambio en infraestructura de
      producción, no en código.

## 3. Procedimiento

1. **Verificar el estado actual del bucket** (Supabase Dashboard → Storage → bucket `fotos` →
   ícono de configuración, o vía SQL):
   ```sql
   select id, public from storage.buckets where id = 'fotos';
   ```

2. **Aplicar el flip** (ya está en `schema.sql` como migración idempotente, así que correr el
   bloque "STORAGE — Bucket de fotos" completo del archivo es seguro incluso si se corre dos
   veces):
   ```sql
   insert into storage.buckets (id, name, public)
   values ('fotos', 'fotos', false)
   on conflict (id) do update set public = false;
   ```
   La policy de SELECT scoped por edificio (`"fotos: leer mi edificio"`) ya debería existir si
   se corrió el resto de la migración del PR #9 — confirmar con:
   ```sql
   select policyname from pg_policies where tablename = 'objects' and schemaname = 'storage';
   ```
   Debe aparecer `fotos: leer mi edificio` junto a las de insert/update/delete que ya existían
   desde antes.

3. **Probar inmediatamente después del flip:**
   - Abrir el admin (`https://admin-five-bay-95.vercel.app/dashboard/novedades`) y confirmar que
     "Ver foto adjunta" sigue funcionando para una novedad con foto.
   - Abrir el desktop, ir a Novedades o Encomiendas, confirmar que las miniaturas siguen
     cargando.
   - Si algo se rompe: revertir con `update storage.buckets set public = true where id = 'fotos';`
     y avisar — no debería pasar si el código del PR #9 ya está desplegado en ambos lados, pero
     es la salida de emergencia.

4. **Confirmar el cron de limpieza de huérfanos** (PR #10) quedó programado:
   ```sql
   select * from cron.job where jobname = 'cleanup-orphan-fotos';
   ```

## 4. Quién puede ejecutar esto

Requiere la `SUPABASE_SERVICE_ROLE_KEY` o acceso al SQL Editor del dashboard de Supabase — no es
algo que un agente con solo la `anon` key pueda hacer. Lo ejecuta Diego (o alguien con acceso al
dashboard) manualmente, siguiendo este runbook.
