# Portia — Weekly Execution Dashboard

> Tablero ejecutivo. Se actualiza **cada lunes**. Para el estado completo ver [`project-state.md`](../project-state.md).

**Semana:** 2026-06-22 → 2026-06-28 · **Stage:** 3 (Admin Web + Offline) · **Progreso stage:** 85%

---

## 🎯 Objetivo de la semana
Cerrar el gate de Stage 3: **desplegar el panel admin** y dejar el modo offline listo para prueba en terreno.

## 🔄 Features activas

| Feature | Estado | Avance | Responsable |
|---|---|---|---|
| Panel admin (deploy) | 🔄 Doing | Código 100%, deploy 0% | Diego |
| Modo offline (validación) | 🔄 Doing | Implementado, sin probar en campo | Diego |
| Alta de conserjes endurecida | ⬜ Todo | — | Diego |

## ⛔ Bloqueadores

| Bloqueador | Bloquea | Necesita | Owner |
|---|---|---|---|
| Sin edificio real comprometido | Stage 4 completo | Contacto comercial | Diego/James |
| Dominio + Supabase prod no definidos | Deploy admin (`T-021`) | Decisión fundadores | Diego |
| Pricing sin definir | Conversación comercial | Decisión fundadores | Diego/James |

## ⚠️ Riesgos de la semana
- Modo offline no probado → posible pérdida/duplicación de datos. Mitigar con test antes del gate.
- Crear conserjes con anon key (`signUp`) no es el flujo final → deuda a cerrar en `T-023`.

## 📊 Métricas

| Métrica | Valor | Nota |
|---|---|---|
| Stage 3 completitud | 85% | 4 ítems de gate pendientes |
| Usuarios reales activos | 0 | hasta tener edificio alpha |
| Bugs críticos abiertos | 0 | ver [blocked.md](tasks/blocked.md) |
| Último release | `v1.2.0-stage3` | tag pusheado 2026-06-25 |

## 🏁 Próximos hitos

| Hito | Stage | Estado |
|---|---|---|
| Panel admin desplegado en URL pública | 3 | ⬜ |
| Offline probado en terreno | 3 | ⬜ |
| **Gate Stage 3 cerrado** | 3→4 | ⬜ |
| 1er edificio en Private Alpha | 4 | ⛔ |

## ✅ Cerrado esta semana
- Panel web admin (Next.js) completo: login, dashboard, 5 módulos, middleware.
- Modo offline + cola de sync en desktop.
- Notificaciones nativas urgentes con click-to-navigate.
- Módulo Ayuda + informe de producto.
- Migración de paleta a índigo.
- Release `v1.2.0-stage3`.
