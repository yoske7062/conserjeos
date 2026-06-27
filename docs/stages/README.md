# Portia — Stage Model & Executive View

El desarrollo de Portia está organizado en **stages obligatorios**. Cada feature, tarea y decisión
pertenece a exactamente un stage. **La prioridad #1 siempre es cerrar el `% de completitud del stage
actual`** — no acumular tareas sueltas. Todo lo que no contribuye al stage actual es `Future Work`.

---

## ▓▓▓▓▓▓▓▓▓░ Executive View — 2026-06-25

```
STAGE ACTUAL          ►  Stage 3 — Admin Web + Offline
PROGRESO STAGE 3      ►  ████████████████░░░  85%
PRÓXIMO HITO          ►  Deploy panel admin (Vercel) + 1er edificio en Private Alpha
ETA A STAGE 4         ►  2–4 semanas (bloqueado por acceso a edificio real)
```

| Stage | Nombre | Estado | Progreso |
|---|---|---|---|
| 0 | Foundations | ✅ Done | `██████████` 100% |
| 1 | MVP Core (desktop) | ✅ Done | `██████████` 100% |
| 2 | UX & Realtime | ✅ Done | `██████████` 100% |
| **3** | **Admin Web + Offline** | 🔄 **En curso** | `████████▌░` **85%** |
| 4 | Private Alpha | ⬜ No iniciado | `░░░░░░░░░░` 0% |
| 5 | Public Beta | ⬜ No iniciado | `░░░░░░░░░░` 0% |
| 6 | Public Launch | ⬜ No iniciado | `░░░░░░░░░░` 0% |
| 7 | Scale | ⬜ No iniciado | `░░░░░░░░░░` 0% |

### Para cerrar Stage 3 (15% restante)
- [ ] Desplegar `apps/admin` en Vercel con env vars de producción → `T-021`
- [ ] Probar modo offline con corte de red real → `T-024`
- [ ] Endurecer alta de conserjes (invitación, no signUp directo) → `T-023`
- [ ] Verificar realtime del panel admin contra datos del desktop → `T-025`

### Cuellos de botella actuales
1. **Sin edificio real comprometido** → bloquea el gate de Stage 4 entero.
2. **Panel admin sin desplegar** → el administrador real no puede entrar.
3. **Pricing sin definir** → bloquea conversación comercial. *(decisión de fundadores)*

### Riesgos críticos
- Modo offline no probado en terreno (riesgo de pérdida/duplicación de datos).
- Cumplimiento Ley 21.719 sin iniciar (riesgo legal con datos de visitantes: nombre + RUT).

---

## Mapa de stages

Lifecycle de Portia (numeración propia, alineada al ciclo SaaS):

| Stage | Foco | Gate de salida |
|---|---|---|
| [0 — Foundations](stage-0-foundations.md) | Arquitectura validada | Entorno funcionando, arquitectura documentada, equipo alineado |
| [1 — MVP Core](stage-1-mvp-core.md) | Valor mínimo (conserje) | Flujo principal funcional, sin errores críticos, deploy estable |
| [2 — UX & Realtime](stage-2-ux-realtime.md) | Producto usable de verdad | Handoff de turno, realtime, accesibilidad, auditoría |
| [3 — Admin Web + Offline](stage-3-admin-offline.md) | Administrador + resiliencia | Panel desplegado, offline probado, flujo admin completo |
| [4 — Private Alpha](stage-4-private-alpha.md) | Primeros usuarios reales | 1+ edificio activo, feedback documentado, issues priorizados |
| [5 — Public Beta](stage-5-public-beta.md) | Product-Market Fit inicial | Métricas mínimas (activación/retención), infra estable |
| [6 — Public Launch](stage-6-public-launch.md) | Escalar adquisición | Canal de adquisición + soporte + revenue tracking |
| [7 — Scale](stage-7-scale.md) | Escalar usuarios y equipo | Performance, costos, onboarding de equipo, incident mgmt |

## Regla de transición

No se avanza de stage hasta que **todos los ítems del gate** estén ✅.
El gate se verifica explícitamente en la reunión de fundadores y se registra en
[`founders.md`](../founders.md). Avanzar de stage = nuevo tag `vX.Y.0-stageN` + actualización de
este archivo y de [`project-state.md`](../../project-state.md).

## Cómo se calcula el `% de stage`

`% = (ítems del gate completados + must-haves entregados) / (total de ítems del gate + must-haves)`.
Cada stage lista sus must-haves y su gate; el % se actualiza manualmente al cerrar cada semana.
