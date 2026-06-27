# Portia — Development Workflow

Flujo **obligatorio** para todo lo que se construye. Ninguna feature salta etapas.

---

## Flujo macro: Idea → Producción

```
IDEA → DISCOVERY → SPECIFICATION → DESIGN → DEVELOPMENT → TESTING → REVIEW → PRODUCTION
```

| Etapa | Qué se produce | Criterio para avanzar |
|---|---|---|
| **Idea** | Una línea en backlog o Icebox | Está escrita y vinculada a un stage |
| **Discovery** | Problema validado, no solo deseado | Hay evidencia de que el dolor existe |
| **Specification** | `features/feature-<x>.md` con user stories + acceptance criteria | Spec aprobada por ambos fundadores |
| **Design** | Mockup / flujo / decisión de UX | Diseño coherente con el sistema visual |
| **Development** | Código en branch | Cumple acceptance criteria, compila |
| **Testing** | Verificación manual + (cuando exista) tests | Sin bugs críticos, flujo principal ok |
| **Review** | PR revisado | Aprobado por el otro fundador |
| **Production** | Merge + tag/deploy | Desplegado y verificado en real |

## Feature Lifecycle (estado interno de cada feature)

Todo archivo en `features/` declara su **lifecycle stage**. No se salta ninguno:

```
IDEA → VALIDATION → SPECIFICATION → DESIGN → DEVELOPMENT → TESTING → DEPLOYED → MEASURED
```

- **IDEA** — existe el problema/idea.
- **VALIDATION** — confirmamos que vale la pena (evidencia, no opinión).
- **SPECIFICATION** — user stories + acceptance criteria escritos.
- **DESIGN** — UX/UI definido.
- **DEVELOPMENT** — en construcción.
- **TESTING** — verificación.
- **DEPLOYED** — en producción.
- **MEASURED** — medimos su impacto real (cierra el ciclo).

> Una feature solo está **"terminada"** cuando llega a **MEASURED**, no en DEPLOYED.

## Git / Release

- Branch desde `main`, PR, revisión del otro fundador, merge.
- Release = tag `vX.Y.Z-stageN` → dispara `.github/workflows/release.yml` (builds Mac/Windows).
- Commits terminan con `Co-Authored-By` cuando aplica.

## Regla de oro

> **La prioridad #1 es cerrar el stage actual.** Si una idea es buena pero no contribuye al stage
> en curso, va a `Later`/`Icebox` (Future Work), no se trabaja ahora.
