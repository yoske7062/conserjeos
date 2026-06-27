# Feature Registry

Un archivo por feature. Cada uno declara su **stage** y su **lifecycle stage**
(IDEA → VALIDATION → SPECIFICATION → DESIGN → DEVELOPMENT → TESTING → DEPLOYED → MEASURED).

> Una feature solo está "terminada" en **MEASURED**. Hoy ninguna llega a MEASURED porque aún no
> hay usuarios reales (Stage 4). Todas las construidas están en **DEPLOYED**, esperando medición.

| Feature | Stage | Lifecycle | Estado |
|---|---|---|---|
| [Turnos](feature-turnos.md) | 1–2 | DEPLOYED | ✅ |
| [Novedades](feature-novedades.md) | 1–3 | DEPLOYED | ✅ |
| [Visitas](feature-visitas.md) | 1 | DEPLOYED | ✅ |
| [Encomiendas](feature-encomiendas.md) | 1 | DEPLOYED | ✅ |
| [Tareas](feature-tareas.md) | 2–3 | DEPLOYED | ✅ |
| [Panel admin web](feature-admin-panel.md) | 3 | DEPLOYED* | 🔄 |
| [Modo offline](feature-offline-mode.md) | 3 | TESTING | 🔄 |
| [Notificaciones nativas](feature-notificaciones.md) | 3 | DEPLOYED | ✅ |

\* *DEPLOYED a nivel de código; falta deploy a URL pública (`T-021`).*

> Nueva feature → copiar [`../templates/feature-template.md`](../templates/feature-template.md).
