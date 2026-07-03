# Auditoría de backend — Portia — 02-jul-2026

> Preparado para la reunión de Diego con su ingeniero de software. Todo lo
> listado acá se verificó directo contra el código, GitHub, Supabase y Vercel
> reales — no son estimaciones.

## TL;DR

Backend funcionalmente completo y con seguridad razonable para un piloto real.
El código dejó de ser el cuello de botella del proyecto. Lo que sigue
pendiente es: (1) profundidad de tests, (2) revisión legal de un abogado,
(3) conseguir el primer edificio real. Ninguno de los tres es un problema
técnico.

---

## 1. Flujos funcionales

Los 7 flujos core están implementados de punta a punta contra Supabase real,
no mocks: visitas, encomiendas, novedades, tareas, entrega de turno, ficha de
edificio, botón de emergencia. Verificado hoy con login real de conserje y
admin, incluyendo la app de escritorio Electron corriendo de verdad (no solo
el build).

## 2. Seguridad — estado real de la base de datos

Verificado hoy vía acceso directo a Supabase (proyecto `portia`,
`cpxywvxwdnpsrxqjoqjl`, São Paulo, Postgres 17.6):

- **RLS activa en las 8 tablas de `public`**, sin excepción: `edificios`,
  `perfiles`, `turnos`, `novedades`, `visitas`, `encomiendas`, `tareas`,
  `eventos_analitica`.
- **RLS de `tareas` corregida** (PR #40, 02-jul): antes cualquier conserje
  autenticado podía crear o borrar tareas vía API directa aunque la UI lo
  ocultara. Ahora la policy está separada por operación — crear/borrar
  requiere `mi_rol() = 'admin'`.
- **Hardening aplicado hoy sobre el advisor de seguridad de Supabase:**
  - 3 funciones (`mi_edificio_id`, `mi_rol`, `cleanup_orphan_fotos`) tenían
    `search_path` mutable (vector conocido de *search_path hijacking*) — corregido.
  - `cleanup_orphan_fotos` era invocable públicamente sin login vía
    `/rest/v1/rpc/cleanup_orphan_fotos` (privilegio `EXECUTE` que Supabase
    otorga por defecto a `anon`/`authenticated` en funciones nuevas del
    schema `public`) — revocado, solo `postgres`/`service_role` la ejecutan.
  - Igual hardening aplicado a los dos crons nuevos de retención (ver §4).
- **Excepción aceptada, no un hueco:** `mi_edificio_id()` y `mi_rol()` siguen
  siendo ejecutables por `authenticated` — son las funciones que usa cada
  policy de RLS (`edificio_id = mi_edificio_id()`). Revocarles `EXECUTE`
  rompe el acceso a datos de toda la app. Cada usuario solo puede leer su
  propio `edificio_id`/`rol`, no hay escalación de privilegio posible.
- **Pendiente, no aplicado hoy:** *Leaked Password Protection* está
  deshabilitada en Auth (Supabase puede chequear contraseñas contra
  HaveIBeenPwned). Es un toggle en el dashboard (Authentication → Providers),
  no requiere código. Recomendado activarlo antes de Alpha.
- **Bucket de fotos privado**, acceso vía `createSignedUrl()`, aislado por
  `edificio_id` en el path.
- **Auditoría de cambios**: `novedades`, `visitas`, `encomiendas` guardan
  `editado_por`/`editado_at`/`valor_anterior` en cada edición.

### Performance (informativo, no urgente)

14 foreign keys sin índice de cobertura (`encomiendas`, `novedades`,
`tareas`, `turnos`, `visitas`, `perfiles`, `eventos_analitica`). Con los
datos de prueba actuales (1-4 filas por tabla) es irrelevante; con un
edificio real activo durante meses empezará a notarse en JOINs. No bloquea
nada — es una mejora para cuando haya volumen real.

## 3. Dependencias

**Cero deuda de Dependabot.** De los 20 PRs abiertos al empezar la sesión:
11 de bajo riesgo (GitHub Actions, patches, minors) mergeados directo; los
9 *majors* (Next 15→16, React 18→19, Tailwind 3→4, electron 33→39, vitest
2→3, electron-builder 25→26) se probaron uno por uno contra la app real
corriendo, no solo el build:

- **Next 16** (admin): probado con login real, las 4 páginas de detalle y
  creación de tarea con realtime.
- **React 19** (desktop): probado con login real de conserje, sin errores
  de consola ni regresión visual.
- **Electron 39** (desktop, salto de 6 versiones): se lanzó la app real
  (proceso Electron con GPU/Renderer/Network) e interactuó con la ventana
  nativa — login, navegación, renderizado, todo intacto.
- **Tailwind 3→4**: se eliminó en vez de migrar. Cero clases de utilidad en
  todo el código (el proyecto usa inline styles siempre) — migrar la config
  entera para mantener una dependencia sin uso real no tenía sentido. Cierra
  el PR de Dependabot para siempre.
- **electron-builder 25→26**: probado empaquetando los `.dmg` reales
  (arm64 + x64), no solo el build de Vite.

## 4. Retención de datos (Ley 21.719)

Hoy, con confirmación explícita de Diego (90 días, mismo plazo que ya regía
para visitas), se aplicaron directo en producción vía acceso MCP a Supabase:

```
cleanup-old-visitas      04:00 UTC   (ya existía)
cleanup-old-encomiendas  05:00 UTC   (nuevo, 02-jul)
cleanup-old-novedades    05:15 UTC   (nuevo, 02-jul)
cleanup-orphan-fotos     04:30 UTC   (ya existía)
```

Las 4 funciones son `SECURITY DEFINER` con `search_path` fijo y ejecutables
solo por `postgres`/`service_role` — no invocables desde el frontend ni por
un usuario autenticado.

## 5. Cobertura de tests

**Antes de hoy:** 30 tests, 100% de librerías aisladas (cola offline,
permisos, clasificación de errores). Cero cobertura de un flujo de UI
completo.

**Después de hoy:** 33 tests. Se agregó el primer test de integración real
— `Visitas.jsx` montado entero con `@testing-library/react` + `jsdom`,
simulando al conserje escribiendo en el formulario real (no llamando
funciones sueltas). Cubre: registro exitoso con payload correcto, RUT con
dígito verificador inválido (bloquea sin llamar a Supabase), y consentimiento
Ley 21.719 sin marcar (bloquea aunque el RUT sea válido).

**Pendiente real:** el mismo patrón falta replicarlo para Encomiendas,
Novedades y Tareas — es mecánico, no hay nada nuevo que inventar, es
repetir la plantilla que ya quedó armada hoy.

## 6. Infraestructura y CI/CD

- **GitHub↔Vercel conectado** (hoy, por Diego). Antes cada deploy a
  producción era manual vía `vercel deploy` — el sitio llevaba semanas
  mostrando un build viejo sin que nadie lo notara. Ahora cada push a
  `main` dispara deploy automático.
- **CI con gates reales**: lint + test + build corren en cada push,
  bloqueante antes de mergear.
- **Acceso directo a Supabase y Vercel vía MCP** (activado hoy) — ya no
  depende de manejar la `service_role key` a mano ni de la CLI de Vercel
  para deployar; se puede aplicar migraciones, revisar advisors de
  seguridad y leer logs de deploy directo.
- **Hallazgo real al activar la conexión hoy:** apenas se conectó
  GitHub↔Vercel, la mayoría de los deploys automáticos de los commits de
  esta misma sesión fallaron (`ERROR`) porque Turbo 2.x no resolvía el
  workspace sin el campo `packageManager` en el `package.json` raíz. Alguien
  con acceso directo al repo (no esta sesión — apareció al hacer `git fetch`)
  pusheó el fix `d447892` directo a `main` mientras se trabajaba. **Confirmado
  ahora:** el deploy más reciente (`68f9afb`) está `READY` y aliaseado en
  `admin-five-bay-95.vercel.app` — el pipeline funciona de punta a punta.
- **Atención — trabajo concurrente sin coordinar en `main`:** ese commit de
  fix no lo generó esta sesión. Indica que hay otro actor (probablemente
  Antigravity, dado un deploy anterior con `"actor": "antigravity"`) con
  push directo a `main` en paralelo, sin aviso. Vale la pena que Diego
  confirme quién es y coordine para no pisarse cambios entre sesiones.

## 7. Gente y acceso

- El repo (`yoske7062/conserjeos`) es público, pero **solo Diego tiene
  acceso de colaborador.** James (`crorkan`) no está agregado — su último
  commit fue el 23-jun, sus últimos 2 PRs se mergearon el 28-jun, y no hay
  ningún PR suyo pendiente hoy. El modelo fork→PR con él ya funcionó 3 veces
  sin problema; lo que falta es agregarlo como colaborador (Write) para que
  el flujo sea directo en vez de depender de sincronizar su fork a mano.

## 8. Lo que NO se tocó hoy (a propósito)

Cero cambios visuales — ni un `style`, layout o color. Todo lo de esta
sesión es funcional, seguridad, infraestructura y testing. El front/diseño
sigue siendo responsabilidad exclusiva de James.

## 9. Bloqueadores reales (no técnicos)

1. **Conseguir el primer edificio real (T-030)** — el verdadero cuello de
   botella del proyecto completo. Con el backend en este estado, ya se
   puede pilotar.
2. **Revisión legal** de los 3 documentos (Privacidad, Términos, DPA) por
   la tía de Diego, abogada — en curso.
3. **Definir pricing en CLP** — bloqueado hasta la reunión de negocio con
   James y el profesor de innovación.

---

*Preparado por Claude (Sonnet 5) trabajando como ingeniero de software del
proyecto. Toda la información de este documento se verificó en vivo contra
Supabase, GitHub y Vercel — no es un resumen de memoria de sesiones
anteriores.*
