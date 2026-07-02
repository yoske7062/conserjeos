# Portia

> Tu edificio. Todo en orden.

Sistema de conserjería digital para edificios residenciales en Chile. Reemplaza el libro de novedades en papel, el cuaderno de visitas y el registro manual de encomiendas por una app de escritorio para el conserje y un panel web para el administrador.

- **Repositorio:** https://github.com/yoske7062/conserjeos
- **Infraestructura:** Supabase (PostgreSQL + Auth + Realtime + Storage), región São Paulo
- **Supabase project ID:** `cpxywvxwdnpsrxqjoqjl`

---

## 1. Qué hace

| Módulo | Para qué sirve |
|---|---|
| Novedades | Libro digital de novedades (incidente / informativo / urgente) con foto y auditoría de ediciones |
| Visitas | Registro de entrada/salida con RUT validado (dígito verificador real) y retención legal |
| Encomiendas | Registro con 4 tipos (paquete, comida, supermercado, otro) + alerta de perecibles |
| Tareas | El administrador asigna, el conserje ejecuta y marca como completada |
| Entrega de turno | Apertura/cierre de turno y pendientes reconocidos por el conserje entrante |
| Emergencia | Botón que dispara novedad urgente, muestra protocolo y permite detalles |
| Ficha de edificio | Contactos y protocolos individuales del edificio |
| Modo offline | Encola mutaciones sin conexión y sincroniza al reconectar |

---

## 2. Arquitectura

Monorepo (Turborepo + npm workspaces):

```
apps/
  desktop/     # Electron 33 + React 18 + Vite 6   (app del conserje)
  admin/       # Next.js 15 App Router              (landing + panel admin)
  web/         # sitio público (en evaluación)
packages/
  supabase/    # schema.sql + seed.sql              (fuente única de la BD)
docs/
  engineering/ # arquitectura, despliegue, rollback, pruebas, observabilidad
  security/    # modelo de amenazas, auth, secretos, respuesta a incidentes
  data/        # modelo de datos, migraciones, respaldo, retención
  decisions/   # ADRs
  features/    # specs por feature
  stages/      # planes por etapa
scripts/       # utilidades de administración (create-admin, etc.)
```

Cómo fluye una solicitud (ej. registrar una visita):

```
Renderer (React)                Supabase
  Visitas.jsx
    → valida RUT (lib/rut.js)
    → supabase.from('visitas').insert(...)
        ──────────────────────────────►  PostgREST
                                            → RLS verifica edificio_id = mi_edificio_id()
                                            → CHECK valida formato de RUT
                                            → INSERT
        ◄──────────────────────────────  { data, error }
    → si offline: encola en offlineQueue (localStorage) y reintenta al reconectar
```

Documentación técnica completa en [`docs/engineering/architecture.md`](docs/engineering/architecture.md).

---

## 3. Stack

| Capa | Tecnología |
|---|---|
| App conserje | Electron 33 + React 18 + Vite 6 |
| Panel admin | Next.js 15 (App Router) + `@supabase/ssr` |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Monorepo | Turborepo + npm workspaces |
| CI/CD | GitHub Actions (CI en cada PR; release en tags `v*`) |

---

## 4. Levantar el proyecto localmente

Requisitos: Node 20+, npm 10+.

```bash
git clone https://github.com/yoske7062/conserjeos
cd conserjeos
npm install            # instala el workspace completo

# App de escritorio (conserje)
cd apps/desktop
cp .env.example .env   # rellenar con las keys de Supabase (ver SECURITY.md)
npm install
npm run dev            # levanta Vite + Electron

# Panel admin / landing
cd ../admin
cp .env.example .env.local
npm install
npm run dev            # http://localhost:3001
```

Guía detallada (variables, troubleshooting, datos de prueba) en [`docs/engineering/local-development.md`](docs/engineering/local-development.md).

---

## 5. Cómo contribuir

`main` está protegida. Todo cambio entra por rama + Pull Request con CI verde. Lee [`CONTRIBUTING.md`](CONTRIBUTING.md) antes de tu primer cambio.

```bash
git checkout -b feature/mi-cambio
# ... trabajar ...
git push -u origin feature/mi-cambio
gh pr create
```

---

## 6. Seguridad

Reporte de vulnerabilidades y manejo de secretos: [`SECURITY.md`](SECURITY.md).

Nunca se commitea: `.env`, `.env.local`, `CREDENCIALES-PRIVADO.txt`, ni la `service_role` key de Supabase.

---

## 7. Documentos clave

| Documento | Qué responde |
|---|---|
| [`docs/engineering/architecture.md`](docs/engineering/architecture.md) | Cómo se relacionan las apps, cómo fluye la información |
| [`docs/engineering/deployment.md`](docs/engineering/deployment.md) | Cómo se despliega |
| [`docs/engineering/rollback.md`](docs/engineering/rollback.md) | Cómo revertir una versión |
| [`docs/engineering/testing-strategy.md`](docs/engineering/testing-strategy.md) | Qué pruebas son obligatorias |
| [`docs/security/threat-model.md`](docs/security/threat-model.md) | Qué medidas de seguridad se aplican |
| [`docs/data/database-model.md`](docs/data/database-model.md) | Qué datos se almacenan |
| [`docs/data/backup-restore.md`](docs/data/backup-restore.md) | Cómo se recupera la base de datos |
