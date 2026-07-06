# Feature: Modo offline + cola de sincronización

- **ID:** F-007
- **Stage:** 3
- **Lifecycle:** TESTING (falta prueba en terreno)
- **Responsable:** Diego
- **Estado:** 🔄 Doing

## Descripción
Permitir que el conserje siga registrando visitas, encomiendas y novedades (sin foto) cuando se cae
la conexión, sincronizando automáticamente al reconectar.

## Problema
Las conserjerías tienen conectividad inestable. Si la app deja de funcionar sin red, el conserje
vuelve al cuaderno y perdemos el caso de uso central.

## Solución
Cola en `localStorage` con pub/sub (`apps/desktop/src/lib/offlineQueue.js`):
- Operaciones se encolan con **timestamp explícito** (`_ts`).
- **Flush automático** al detectar reconexión; también al montar si quedó cola previa.
- UI optimista para updates (salida de visita, entrega de encomienda).
- Fotos **sí soportadas offline**: se codifican como base64 en la cola (`fileToBase64`) y se suben a Storage recién al flush (`syncQueue.js`). *(Corregido 2026-07-04 — esta doc decía "deshabilitadas", quedó desactualizada desde que se implementó en PR #3.)*
- TopBar muestra N operaciones pendientes / "Sincronizando…".

Ver decisión en [ADR-005](../decisions/ADR-005-offline-localstorage.md).

## Política de invalidación de la cola
No hay expiración por tiempo (TTL) hoy — un item se queda en la cola hasta que:
1. **Sincroniza con éxito** → se saca (`remove`).
2. **Falla con `23505` (unique violation)** → se trata como éxito igual: el insert ya había llegado al server antes de que se cortara la red, se saca de la cola sin reintentar.
3. **Falla con cualquier otro código** (ej. RLS, columna inválida) → **se reintenta para siempre**, en cada reconexión, sin límite de intentos ni backoff. Un item permanentemente inválido (ej. un `edificio_id` borrado) queda atascado ahí indefinidamente, ocupando espacio en `localStorage` y reintentando en cada reconexión.

**Concurrencia:** `flushQueue()` tiene guard de reentrancia a nivel de módulo (`enVuelo`, en `syncQueue.js`) — si dos disparos se solapan, el segundo devuelve `{ omitido: true }` sin tocar la cola. Antes esto solo estaba protegido en el caller (`Dashboard.jsx`, `flushingRef`); ahora está en la función misma para no depender de que cada nuevo punto de entrada lo repita.

**Deuda conocida, no implementada:** no hay límite de reintentos ni TTL para items permanentemente fallidos — si esto se vuelve un problema real en terreno, la solución sería mover a un item a un "dead letter" después de N fallos consecutivos en vez de reintentar para siempre.

## User Stories
- Como **conserje**, quiero seguir registrando aunque se caiga internet, para no perder información.

## Acceptance Criteria
- [x] Encolar visita/encomienda/novedad (sin foto) estando offline.
- [x] Flush automático al reconectar.
- [x] Indicador de pendientes en el TopBar.
- [ ] **Sin pérdida ni duplicación** verificado en corte real (`T-024`).

## Riesgos
- **Duplicación** si el flush corre dos veces → test obligatorio antes del gate de Stage 3.
- Sin resolución de conflictos avanzada (acepta el modelo append/update simple).

## Dependencias
- localStorage; cliente Supabase; tablas visitas/encomiendas/novedades.

## Métricas (para MEASURED)
- # de operaciones recuperadas por cortes reales; 0 duplicados/pérdidas.

## Archivos
- `apps/desktop/src/lib/offlineQueue.js`; integraciones en Visitas/Encomiendas/Novedades/Dashboard.
