# Arquitectura — Portia

Documento técnico de cómo está construido Portia, cómo se relacionan sus partes y cómo fluye la información. Complementa el `README.md` con el detalle que un ingeniero nuevo necesita para operar el sistema.

---

## 1. Vista general

Portia es un monorepo con dos aplicaciones cliente que hablan con un único backend gestionado (Supabase).

```
┌────────────────────┐        ┌────────────────────┐
│  apps/desktop      │        │  apps/admin        │
│  Electron + React  │        │  Next.js (SSR)     │
│  (conserje)        │        │  (administrador)   │
└─────────┬──────────┘        └─────────┬──────────┘
          │  anon key + RLS             │  anon key (cliente)
          │                             │  service_role (solo server)
          ▼                             ▼
        ┌───────────────────────────────────┐
        │           Supabase                │
        │  PostgreSQL + Auth + Realtime +   │
        │  Storage                          │
        │  RLS por edificio en cada tabla   │
        └───────────────────────────────────┘
```

No hay backend propio: la lógica de autorización vive en PostgreSQL (RLS), y los clientes hablan directo con Supabase vía PostgREST y la librería `@supabase/supabase-js`.

---

## 2. Relación entre las apps

| App | Usuario | Framework | Auth | Acceso a datos |
|---|---|---|---|---|
| `apps/desktop` | Conserje | Electron + React + Vite | Supabase Auth (email/pass) | `anon` key + RLS |
| `apps/admin` | Administrador | Next.js App Router | Supabase Auth vía `@supabase/ssr` | `anon` key (cliente) + `service_role` (solo server) |

Ambas comparten el **mismo proyecto Supabase** y el **mismo esquema**. La separación de privilegios entre conserje y admin es por **rol** (columna `rol` en `perfiles`) y por **RLS**, no por tener bases de datos distintas.

`packages/supabase/schema.sql` es la fuente única de verdad del esquema. Las dos apps dependen de él.

---

## 3. Flujo de una solicitud

Ejemplo: el conserje registra una visita.

1. `Visitas.jsx` valida el RUT en vivo con `lib/rut.js` (solo UX).
2. Llama `supabase.from('visitas').insert({...})` con la `anon` key.
3. PostgREST recibe la petición autenticada (JWT del usuario).
4. PostgreSQL aplica:
   - **RLS**: la política exige `edificio_id = mi_edificio_id()`. Un usuario no puede insertar en otro edificio.
   - **CHECK**: `rut_visitante` debe cumplir el formato. La validación del frontend no es la única defensa.
5. Devuelve `{ data, error }`. El cliente siempre maneja `error`.
6. Si no hay conexión, la mutación se encola en `offlineQueue` (localStorage) y se reintenta al volver online.

Principio: **el frontend nunca es la última línea de defensa.** La validación en vivo mejora la experiencia; la validación real está en la base de datos (RLS + constraints).

---

## 4. Tiempo real

- Las novedades urgentes se propagan con Supabase Realtime (`supabase.channel(...)`).
- Cada suscripción se filtra por `edificio_id` para evitar fuga entre edificios.
- Cada canal se da de baja al desmontar el componente (`return () => supabase.removeChannel(ch)`).

---

## 5. Electron (app de escritorio)

### Modelo de procesos
- `main.cjs` — proceso principal (CommonJS, requerido por Electron). Crea la ventana, maneja notificaciones nativas y abre enlaces externos.
- `preload.cjs` — context bridge. Expone una API mínima (`window.electron.*`): `notify`, `onNotifyAction`, `openExternal`, `getVersion`.
- Renderer — la SPA de React/Vite. Solo accede a Electron a través de la API expuesta.

### Endurecimiento de seguridad
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- Bloqueo de navegación a URLs externas (`will-navigate`) y de ventanas nuevas no controladas (`setWindowOpenHandler`).
- Content Security Policy restrictiva.
- Cada handler IPC valida su entrada.

Ver `apps/desktop/main.cjs` y [`../security/threat-model.md`](../security/threat-model.md).

---

## 6. Panel admin (Next.js)

```
app/
  layout.js          # metadata global + chequeo de sesión SSR
  login/page.jsx
  dashboard/
    layout.jsx       # Sidebar + guard de auth
    page.jsx
    <feature>/page.jsx
lib/
  supabase.js        # cliente SSR (server + browser)
middleware.js        # redirige no autenticados a /login
```

- `middleware.js` protege todas las rutas `/dashboard/*`.
- El cliente del navegador usa la `anon` key.
- Las operaciones privilegiadas (crear conserjes, etc.) usan la `service_role` key **solo en código de servidor**, nunca en el bundle del cliente.

---

## 7. Persistencia de archivos

- Las fotos (novedades, encomiendas) van a Supabase Storage.
- En la BD se guarda solo la URL pública (`foto_url text`), nunca binarios.

---

## 8. Decisiones registradas (ADRs)

Las decisiones arquitectónicas costosas de revertir están en [`../decisions/`](../decisions/):

- ADR-001 — Electron para la app de escritorio
- ADR-002 — Supabase como backend
- ADR-003 — Monorepo con Turborepo
- ADR-004 — Next.js para el panel admin
- ADR-005 — Offline con localStorage
- ADR-006 — Paleta de color (histórico; la paleta vigente es naranja `#E6701E` + navy `#0A1C40`)
