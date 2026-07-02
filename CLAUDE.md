# Portia — CLAUDE.md

> **Estándar de ingeniería:** Este proyecto sigue [Builds Up](~/.claude/plugins/cache/user-plugins/builds-up/unknown/skills/builds-up/SKILL.md).
> Toda nueva feature, componente, migración o refactor debe cumplir sus reglas salvo que Diego indique lo contrario explícitamente.

---

## Qué es esto

Portia es una app de escritorio para conserjes de edificios residenciales en Chile.
Reemplaza el libro físico de novedades, el registro de visitas y el control de encomiendas.
Producto SaaS B2B: se vende a administradoras de edificios.

**Tagline:** "Tu edificio. Todo en orden."

---

## Stack

| Capa | Tecnología |
|---|---|
| App escritorio (conserje) | Electron 29 + React + Vite |
| Panel admin (web) | Next.js App Router (`apps/admin`) |
| Backend | Supabase — Postgres + Auth + Realtime + Storage |
| Monorepo | Turborepo + npm workspaces |
| CI/CD | GitHub Actions → tags `vX.Y.Z-stageN` → instaladores Mac/Windows |

---

## Estructura de carpetas

```
apps/
  desktop/
    main.cjs          # proceso principal Electron (CommonJS forzado)
    preload.cjs       # context bridge — expone window.electron.*
    src/
      App.jsx         # router: session → Login | Dashboard
      main.jsx        # ReactDOM.createRoot + set data-theme inicial
      index.css       # CSS vars de design system (NO tocar sin revisar Builds Up §4)
      pages/
        Login.jsx
        Dashboard.jsx  # layout: Sidebar + TopBar + módulo activo
        Inicio.jsx     # home screen con stats grid + módulos
        EntregaTurno.jsx
        Novedades.jsx
        Visitas.jsx
        Encomiendas.jsx
        Tareas.jsx
        FichaEdificio.jsx
        Ayuda.jsx
      components/
        Sidebar.jsx          # nav fijo 240px, siempre oscuro
        Ajustes.jsx          # panel de configuración (overlay)
        EmergenciaButton.jsx
        PendientesChecklist.jsx
      lib/
        supabase.js    # cliente Supabase (único — no crear más)
        offlineQueue.js # cola localStorage para sync offline
        tokens.js
      assets/
        logo.png
  admin/
    app/
      dashboard/       # panel web del administrador
    components/
      Sidebar.jsx
    lib/
      supabase.js
    middleware.js      # protege /dashboard/* → redirect a /login
packages/
  supabase/
    schema.sql         # fuente única de verdad del esquema DB
    seed.sql           # datos de prueba
docs/
  decisions/           # ADR-NNN-slug.md
  features/            # feature-slug.md
  stages/              # stage-N-name.md
  tasks/               # backlog / in-progress / done / blocked
  templates/           # plantillas ADR + feature + task
```

---

## Design system activo (ver Builds Up §4 para referencia completa)

**Paleta light (default):**
- `--bg-base: #edeef8` — área principal lavanda
- `--bg-surface: #ffffff` — cards
- `--brand: #4f46e5` — índigo, botones/activos
- Sidebar: siempre `#0b0a14` (independiente del tema)

**Paleta dark:**
- `--bg-base: #0d0b1e` — mismo tono que sidebar
- `--bg-surface: #13102a`
- `--brand: #7c3aed` — violeta en dark

**Tipografía:** `-apple-system, SF Pro Display` · 13px · weight 600 · `font-variant-numeric: tabular-nums`

**Regla crítica:** inline styles en todos los componentes React. Cero Tailwind en JSX.

---

## Lanzar la app (desarrollo)

```bash
# Desde la raíz del monorepo:
/Users/diegohadwa/Desktop/PORTIA/ConserjeOS/node_modules/.bin/vite
# (en background, luego:)
/Users/diegohadwa/Desktop/PORTIA/ConserjeOS/node_modules/.bin/electron /Users/diegohadwa/Desktop/PORTIA/ConserjeOS/apps/desktop
```

> Las devDependencies están hoisted en el root por Turborepo. No buscar `apps/desktop/node_modules/.bin/`.

---

## Estado actual — Stage 3 en curso (2026-06-27)

### Stage 1 ✅ Completo
- Auth con Supabase
- Turno: iniciar/cerrar con resumen automático + handoff de pendientes
- Novedades, Visitas, Encomiendas, Tareas
- CI/CD Mac+Windows

### Stage 2 ✅ Completo
- Notificaciones nativas (novedades urgentes)
- Offline queue (cola localStorage + sync al reconectar)
- UX turno activo en sidebar

### Stage 3 — En curso
- [x] Panel admin web (Next.js) — `apps/admin` funcional
- [x] Rediseño visual: identidad índigo/violeta, light mode, Ajustes con dark mode toggle
- [ ] Modo offline robusto (tests de sync)
- [ ] Tareas vencidas + alertas push

### Stage 4 — Private Alpha (próximo gate)
- Validar supuestos A1–A4 con un cliente real (ver `docs/product/vision.md`)

---

## Base de datos

Tablas: `edificios` (tenants), `perfiles`, `turnos`, `novedades`, `visitas`, `encomiendas`, `tareas`

- RLS en todas — helpers `mi_edificio_id()`, `mi_rol()`
- Audit trail: `editado_por`, `editado_at`, `valor_anterior jsonb` en tablas mutables
- UUID PKs, timestamptz, jsonb para arrays flexibles

`.env` en `apps/desktop/.env` (no está en el repo):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
