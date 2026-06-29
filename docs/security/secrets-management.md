# Manejo de secretos — Portia

Qué es secreto, dónde puede vivir y dónde nunca.

---

## 1. Inventario de secretos

| Secreto | Qué es | Dónde puede vivir | Dónde nunca |
|---|---|---|---|
| Supabase `anon` key | Clave pública del cliente, protegida por RLS | Frontend (desktop + admin), bundle del cliente | — (es pública por diseño) |
| Supabase `service_role` key | Salta RLS, privilegios totales | Backend seguro, scripts locales (en memoria/CLI) | Frontend, Electron, repo, archivo público, logs |
| Passwords de usuarios | Credenciales de acceso | Supabase Auth (hasheadas) | Repo, logs, código |
| Secrets de GitHub Actions | `VITE_SUPABASE_*` para builds | GitHub → Settings → Secrets | Repo, logs de CI |

---

## 2. Archivos y `.gitignore`

Nunca se commitean (cubiertos por `.gitignore`):

```
.env
.env.local
.env.*.local
CREDENCIALES-PRIVADO.txt
*.credentials.txt
*.pem
```

Verificación: antes de cada commit, `git status` no debe listar ninguno de estos. `git ls-files | grep -i credencial` debe estar vacío.

Cada app tiene un `.env.example` con los **nombres** de las variables, sin valores reales:
- `apps/desktop/.env.example`
- `apps/admin/.env.example`

---

## 3. Por qué la `anon` key es segura en el cliente

La `anon` key identifica al proyecto, pero **no otorga acceso a datos por sí sola**: cada consulta pasa por RLS, que restringe las filas al edificio del usuario autenticado. Si RLS está mal configurado (ej. falta `with check`), la `anon` key deja de ser segura. Por eso RLS es no negociable.

---

## 4. La `service_role` key

Salta RLS por completo. Su uso correcto:
- Scripts de administración locales que reciben la key como argumento (ej. `scripts/create-admin.mjs <KEY>`), nunca hardcodeada.
- Código server-side del panel admin (route handlers / server actions), leída de variable de entorno.

Si la `service_role` key aparece en el bundle del cliente o en el repo, se considera **comprometida** y debe rotarse de inmediato en Supabase → Settings → API.

---

## 5. Rotación

Si un secreto se filtra:
1. Rotarlo en Supabase (Settings → API) o GitHub (Settings → Secrets).
2. Actualizar los entornos que lo usan (Vercel, GitHub Actions, máquinas locales).
3. Revisar el historial de git; si quedó commiteado, reescribir historia es insuficiente: **la key ya filtrada debe invalidarse**, no solo borrarse del repo.

---

## 6. Mejora pendiente

`scripts/create-admin.mjs` tiene un password por defecto (`'Admin2024!'`) como fallback. Recomendación: exigir el password como argumento obligatorio y eliminar el default, para que nunca se cree un admin con credencial conocida.
