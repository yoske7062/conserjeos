# Desarrollo local — Portia

Cómo levantar Portia desde cero en una máquina nueva.

---

## 1. Requisitos

- Node 20 o superior
- npm 10 o superior
- Una cuenta de Supabase con acceso al proyecto `cpxywvxwdnpsrxqjoqjl` (o un proyecto propio para desarrollo)

---

## 2. Clonar e instalar

```bash
git clone https://github.com/yoske7062/conserjeos
cd conserjeos
npm install        # instala el workspace raíz (Turborepo)
```

---

## 3. App de escritorio (conserje)

```bash
cd apps/desktop
cp .env.example .env
# Editar .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY reales
npm install
npm run dev        # levanta Vite (5173) + Electron
```

Comandos útiles:
| Comando | Qué hace |
|---|---|
| `npm run dev` | Vite + Electron en modo desarrollo |
| `npm run build` | Build de producción (Vite → `dist/`) |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run dist:mac` | Build + instalador `.dmg` |
| `npm run dist:win` | Build + instalador `.exe` |

---

## 4. Panel admin / landing

```bash
cd apps/admin
cp .env.example .env.local
# Editar .env.local con las variables NEXT_PUBLIC_ y SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev        # http://localhost:3001
```

---

## 5. Base de datos

El esquema completo está en `packages/supabase/schema.sql`. Para un proyecto Supabase nuevo:

1. Abrir Supabase Dashboard → SQL Editor.
2. Ejecutar `packages/supabase/schema.sql` en orden.
3. Ejecutar `packages/supabase/seed.sql` para datos de prueba.
4. Crear el primer admin:
   ```bash
   node scripts/create-admin.mjs <SERVICE_ROLE_KEY> <password>
   ```

Las migraciones posteriores están documentadas en [`../data/migrations.md`](../data/migrations.md).

---

## 6. Datos de prueba

| Usuario | Rol | Password |
|---|---|---|
| admin@portia.cl | admin | (ver canal privado / CREDENCIALES-PRIVADO.txt) |
| conserje@portia.cl | conserje | (ver canal privado) |

Edificio de prueba: **Edificio Las Torres**.

Los passwords reales no se documentan en el repo. Están en `CREDENCIALES-PRIVADO.txt` (gitignored) y en el canal privado del equipo.

---

## 7. Problemas comunes

Ver [`troubleshooting.md`](troubleshooting.md).
