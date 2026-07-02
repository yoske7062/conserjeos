# Política de tags y releases — Portia

Cómo se versiona y publica Portia.

---

## 1. Versionado (SemVer)

Formato `MAYOR.MENOR.PARCHE`:

| Cambio | Ejemplo | Cuándo |
|---|---|---|
| MAYOR | `2.0.0` | Cambio incompatible (rompe datos o flujo existente) |
| MENOR | `1.2.0` | Funcionalidad nueva, compatible |
| PARCHE | `1.1.1` | Corrección de errores, compatible |

---

## 2. Los tags son inmutables

Un tag (`v1.2.0`) marca un commit y **nunca se reescribe**. Si una versión sale con un bug, no se "arregla" el tag: se publica una nueva versión (`v1.2.1`). Esto garantiza que cada instalación sea trazable a un commit exacto.

- Nunca `git tag -f` sobre un tag publicado.
- Nunca borrar un tag que ya generó una release.

---

## 3. Qué responde cada release

Cada entrada en `CHANGELOG.md` y cada GitHub Release debe responder:

- **Qué cambió** (añadido / cambiado / corregido / seguridad).
- **Qué migraciones incluye** (o "ninguna").
- **Problemas conocidos**.
- **Cómo revertir** (tag estable previo + referencia a `rollback.md`).

Esto es crítico: al inyectar funcionalidad nueva, necesitamos saber cómo revertir en caso de emergencia.

---

## 4. Flujo de release (app de escritorio)

1. Todo el contenido ya está en `main` vía PRs con CI verde.
2. Actualizar versión en `apps/desktop/package.json` y `CHANGELOG.md`.
3. Aplicar migraciones SQL en Supabase si las hay (ver [`../data/migrations.md`](../data/migrations.md)).
4. Crear y empujar el tag:
   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```
5. El workflow `release.yml` ejecuta, en orden:
   - **`test`** — pruebas unitarias (gate: si fallan, no se construye nada).
   - `build-mac` + `build-windows` — instaladores.
   - `release` — publica en GitHub Releases. El permiso `contents: write` existe solo en este job.

Una release solo se construye **después** de que las pruebas pasan. No se publica una versión sin pruebas verdes.

---

## 5. Tags protegidos

La configuración de protección del repositorio impide que los tags `v*` se borren o reescriban (regla de protección de tags). Ver [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md).
