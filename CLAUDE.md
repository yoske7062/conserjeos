# Portia — CLAUDE.md

## Qué es esto
Portia es una app de escritorio para conserjes de edificios residenciales. Reemplaza el libro físico de novedades, el registro de visitas y el control de encomiendas. Es un producto SaaS B2B: se vende a administradoras de edificios.

**Tagline:** "Tu edificio. Todo en orden."

## Stack
- **Electron + React + Vite** — app de escritorio (no web)
- **Supabase** — auth, PostgreSQL, realtime, storage
- **Turborepo** — monorepo con `apps/desktop` y `packages/supabase`
- Sin Tailwind en componentes — todo inline styles con el sistema de colores de Portia

## Estructura
```
apps/desktop/
  main.cjs          # proceso principal Electron (CommonJS forzado)
  preload.cjs       # preload Electron
  src/
    App.jsx         # router principal (session → Login o Dashboard)
    pages/
      Login.jsx
      Dashboard.jsx  # layout: Sidebar + TopBar + página activa
      Novedades.jsx  # libro de novedades digital
      Visitas.jsx    # control de acceso de visitantes
      Encomiendas.jsx# gestión de paquetes
    components/
      Sidebar.jsx    # nav fijo 256px
    lib/
      supabase.js    # cliente Supabase
    assets/
      logo.png       # logo oficial Portia
packages/supabase/
  schema.sql        # tablas, RLS, políticas
  seed.sql          # datos de prueba
```

## Colores (SIEMPRE usar estos)
| Token | Valor | Uso |
|---|---|---|
| base | `#0B0B0B` | fondo principal |
| surface | `#161616` | cards, modales |
| surface-high | `#1F1F1F` | hover estados |
| border | `#2E2E2E` | bordes |
| text | `#F5F5F5` | texto principal |
| muted | `#A8A8A8` | texto secundario |
| subtle | `#636363` | texto terciario |
| neon | `#00FF88` | acento primario — botones, activos, CTAs |
| error | `#FF4444` | urgente, errores |
| warning | `#F59E0B` | incidentes |

## Convenciones de código
- **Inline styles** en todos los componentes (no clases Tailwind en JSX)
- Props del Dashboard: `perfil` (objeto usuario+edificio), `turno` (turno activo o null)
- Sidebar recibe: `modulo`, `setModulo`, `perfil`, `turno`
- Cada página recibe: `perfil`, `turno`, y callbacks según necesidad
- FAB verde (+) en bottom-right para acciones principales
- Modales con overlay `rgba(0,0,0,0.65)` y card `#161616`

## Base de datos (Supabase)
Tablas principales: `edificios`, `perfiles`, `turnos`, `novedades`, `visitas`, `encomiendas`

RLS activo en todas — los helpers `mi_edificio_id()` y `mi_rol()` filtran por usuario autenticado.

El `.env` necesario (NO está en el repo — pídelo al equipo):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Para correr la app
```bash
npm install
cd apps/desktop && npm install
npm run dev   # desde apps/desktop
```

## Estado actual — Stage 1 completo ✅
- Auth con Supabase
- Turno: iniciar / cerrar con resumen automático
- Novedades: registro con tipo (urgente/incidente/informativo), foto, realtime
- Visitas: entrada/salida, historial con tabla
- Encomiendas: registro con foto, tabs pendientes/historial
- CI/CD: GitHub Actions compila Mac (arm64+x64) y Windows (x64) al pushear un tag

## Stage 2 — próximo
- Animaciones fluidas entre módulos (tipo macOS)
- Mejorar UX del turno (estado persistente en sidebar)
- Notificaciones de novedades urgentes
