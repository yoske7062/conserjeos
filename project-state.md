# Portia — Project State

> **Fuente única de verdad.** Si solo vas a leer un archivo, lee este.
> Última actualización: **2026-06-27** · Mantenedor: Diego
>
> Mapa del sistema de gestión: [`docs/README.md`](docs/README.md)

---

## TL;DR (30 segundos)

Portia es un SaaS B2B que digitaliza la conserjería de edificios residenciales en Chile:
reemplaza el cuaderno físico de novedades, el registro de visitas y el control de encomiendas
por una **app de escritorio** para conserjes y un **panel web** para administradores, en tiempo real.

- **Stage actual:** `Stage 3 — Admin Web + Offline` · **95% completo**.
- **Panel admin LIVE:** https://admin-five-bay-95.vercel.app (auto-deploy desde GitHub main)
- **Landing page LIVE:** https://admin-five-bay-95.vercel.app/ — landing + /dashboard + /login
- **Próximo hito:** onboarding del **primer edificio real** (Private Alpha).
- **Bloqueador #1:** no hay todavía un edificio real comprometido para validar.
- **Pendiente técnico:** agregar `SUPABASE_SERVICE_ROLE_KEY` en Vercel Settings → Environment Variables (necesario para invitación de conserjes por email). Copiarlo desde supabase.com/dashboard/project/cpxywvxwdnpsrxqjoqjl/settings/api-keys/legacy → service_role → Reveal → Copy.

---

## 1. Qué estamos construyendo

| | |
|---|---|
| **Producto** | Portia — sistema operativo de conserjería para edificios |
| **Tagline** | *"Tu edificio. Todo en orden."* |
| **Tipo** | SaaS B2B (se cobra a la administradora, no al conserje) |
| **Mercado** | Edificios residenciales en Chile |
| **Repo** | https://github.com/yoske7062/conserjeos |
| **Equipo** | 2 fundadores — Diego (`yoske7062`), James (`crorkan`) |

Dos superficies de producto sobre **un mismo backend Supabase**:
1. **App de escritorio** (Electron + React) → la usa el **conserje** en su turno.
2. **Panel web** (Next.js) → lo usa el **administrador** del edificio.

---

## 2. Qué ya existe (construido)

| Área | Estado | Dónde |
|---|---|---|
| Auth + multi-tenant con RLS | ✅ | `packages/supabase/schema.sql` |
| Turnos (iniciar/cerrar + handoff con pendientes) | ✅ | `apps/desktop/src/pages/Dashboard.jsx` |
| Novedades (libro digital, tipos, foto, realtime) | ✅ | `apps/desktop/src/pages/Novedades.jsx` |
| Visitas (entrada/salida, historial) | ✅ | `apps/desktop/src/pages/Visitas.jsx` |
| Encomiendas (recepción/entrega, foto) | ✅ | `apps/desktop/src/pages/Encomiendas.jsx` |
| Tareas (asignación admin → conserje) | ✅ | `apps/desktop/src/pages/Tareas` + panel |
| Ficha de edificio (contactos, protocolos) | ✅ | desktop |
| Módulo Ayuda / tutorial | ✅ | `apps/desktop/src/pages/Ayuda.jsx` |
| Modo offline + cola de sincronización | ✅ | `apps/desktop/src/lib/offlineQueue.js` |
| Notificaciones nativas de escritorio | ✅ | `apps/desktop/main.cjs` + `preload.cjs` |
| **Panel web admin (Next.js 15)** | ✅ código | `apps/admin/` |
| CI/CD — builds Mac/Windows en tags `v*` | ✅ | `.github/workflows/release.yml` |

## 3. Qué funciona / qué no

**Funciona hoy:**
- Flujo completo del conserje en la app de escritorio (turno → novedades/visitas/encomiendas → handoff).
- Panel admin corriendo en local (`localhost:3001`) con login, dashboard, y 5 módulos.
- Realtime de novedades urgentes entre dispositivos del mismo edificio.

**No funciona / no validado todavía:**
- ✅ Panel admin desplegado en Vercel: https://admin-five-bay-95.vercel.app
- ✅ Invitación de conserjes por email (Server Action con service_role) — falta SUPABASE_SERVICE_ROLE_KEY en Vercel env.
- ❌ Modo offline **construido pero no probado en terreno** con cortes reales.
- ❌ Sin usuarios reales → cero feedback de campo, cero métricas de uso.
- ❌ Cumplimiento Ley 21.719 (datos personales) no iniciado.

## 4. Qué estamos haciendo ahora

> **Objetivo del stage:** cerrar el gate de Stage 3 → habilitar Private Alpha.

1. Desplegar `apps/admin` en Vercel con las env vars de Supabase.
2. Conseguir **un edificio real** para alpha (bloqueador de negocio).
3. Probar el modo offline en condiciones reales.

## 5. Qué sigue (próximos 5 pasos concretos)

1. **Deploy admin panel** a Vercel (`apps/admin`) — desbloquea acceso del administrador real. → `docs/tasks/backlog.md` `T-021`
2. **Conseguir 1er edificio alpha** — Diego/James, contacto comercial. → `T-030`
3. **Instrumentar analítica mínima** (activación: 1er turno cerrado) antes de meter usuarios. → `T-022`
4. **Endurecer alta de conserjes** (invitación por email vs signUp directo). → `T-023`
5. **Definir pricing en CLP** y publicarlo en `docs/product/vision.md`. → `T-031` *(bloqueado: decisión de fundadores)*

Detalle ejecutable y estado en vivo: [`docs/dashboard.md`](docs/dashboard.md).

## 6. Cómo correr el proyecto

```bash
# Desktop (conserje)
cd apps/desktop && npm install && npm run dev        # Vite :5173 + Electron

# Admin panel (administrador)
npm install                                          # raíz (workspaces)
node node_modules/next/dist/bin/next dev apps/admin --port 3001
```

Credenciales de prueba (alpha local): `admin@portia.cl` / `Admin2024!`
Setup de admin inicial: `node scripts/create-admin.mjs <SERVICE_ROLE_KEY>`

---

*Este archivo se actualiza al cerrar cada semana o al cambiar de stage. No dejar que se desincronice del código.*
