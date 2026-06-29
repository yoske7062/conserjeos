# Changelog

Todas las versiones publicadas de Portia, en formato [SemVer](https://semver.org/lang/es/).
Cada release debe responder: qué cambió, qué migraciones incluye, problemas conocidos y cómo revertir.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [No publicado]

### Añadido
- Documentación técnica de ingeniería: arquitectura, despliegue, rollback, pruebas, observabilidad.
- Documentación de seguridad: modelo de amenazas, autenticación/autorización, manejo de secretos, respuesta a incidentes.
- Documentación de datos: modelo de datos, migraciones, respaldo/restauración, retención.
- `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODEOWNERS`, `.env.example` completos.
- Workflow de CI (lint, build, pruebas) en cada Pull Request.
- Pruebas unitarias de validación de RUT (`apps/desktop/src/lib/rut.test.js`).

### Seguridad
- Migración que agrega `with check` a todas las políticas RLS, impidiendo escribir filas de otro edificio.
- Endurecimiento de Electron: `sandbox`, CSP, bloqueo de navegación a URLs arbitrarias, validación de IPC.

---

## [1.1.8] — Release estable previo

Última versión publicada en GitHub Releases antes de esta ronda de endurecimiento.
Artefactos: `Portia-1.1.8-arm64.dmg`, `Portia-1.1.8-x64.dmg`, `Portia-Setup-1.1.8.exe`.

---

## Cómo escribir una entrada de release

Al publicar una versión `vX.Y.Z`, agrega una sección con:

```
## [X.Y.Z] — AAAA-MM-DD

### Añadido / Cambiado / Corregido / Seguridad
- ...

### Migraciones
- Lista de migraciones SQL incluidas (o "ninguna").

### Problemas conocidos
- ...

### Cómo revertir
- Tag previo estable: vX.Y.(Z-1)
- Pasos de rollback: ver docs/engineering/rollback.md
```
