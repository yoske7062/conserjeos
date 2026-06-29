# Despliegue — Portia

Cómo se publica cada parte de Portia y qué garantías exige cada despliegue.

---

## 1. Qué se despliega y dónde

| Componente | Destino | Disparador |
|---|---|---|
| App desktop (conserje) | GitHub Releases (`.dmg` + `.exe`) | Push de un tag `v*` |
| Panel admin / landing | Vercel | Push a `main` (tras merge de PR) |
| Base de datos | Supabase (migraciones SQL manuales) | Ejecución revisada en SQL Editor |

---

## 2. App de escritorio

### Flujo
1. El cambio entra a `main` por PR con CI verde.
2. Se actualiza `CHANGELOG.md` y la versión en `apps/desktop/package.json`.
3. Se crea un tag siguiendo SemVer:
   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```
4. El workflow `.github/workflows/release.yml` compila Mac (arm64 + x64) y Windows (x64) y publica los instaladores en GitHub Releases.

### Requisitos previos a etiquetar
- [ ] CI verde en `main`.
- [ ] `CHANGELOG.md` actualizado con la versión, migraciones y problemas conocidos.
- [ ] Migraciones SQL aplicadas en Supabase (si las hay) **antes** de publicar el cliente que las usa.

### Secrets del workflow (GitHub → Settings → Secrets)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

El permiso `contents: write` existe solo para crear la release y se ejecuta solo desde tags.

---

## 3. Panel admin (Vercel)

- Conectado al repo; cada merge a `main` despliega.
- Variables de entorno configuradas en el dashboard de Vercel (no en el repo):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (solo server)

---

## 4. Migraciones de base de datos

Las migraciones **no son automáticas**. Orden seguro:

1. Escribir la migración como bloque versionado al final de `packages/supabase/schema.sql`.
2. Probarla en un proyecto de desarrollo.
3. Aplicarla en producción (Supabase → SQL Editor) **antes** de desplegar el código que la requiere.
4. Registrar la fecha y el contenido en [`../data/migrations.md`](../data/migrations.md).

Nunca aplicar una migración destructiva sin respaldo previo y sin confirmar (ver [`rollback.md`](rollback.md) y [`../data/backup-restore.md`](../data/backup-restore.md)).

---

## 5. Orden de despliegue cuando hay cambios acoplados

Si un release incluye cambios de cliente **y** de base de datos:

1. Respaldo de la BD.
2. Aplicar migración (debe ser retrocompatible con la versión actual del cliente).
3. Desplegar el cliente nuevo.
4. Verificar el flujo principal en producción.

Las migraciones deben ser retrocompatibles siempre que sea posible, para que un rollback del cliente no rompa contra la BD nueva.

---

## 6. Verificación post-despliegue

- [ ] Login funciona.
- [ ] Flujo principal (registrar visita / novedad / encomienda) funciona.
- [ ] No hay errores en consola del renderer ni en logs de Vercel.
- [ ] El indicador de conexión muestra "En línea".
