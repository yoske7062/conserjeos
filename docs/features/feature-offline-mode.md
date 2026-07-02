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
- Operaciones se encolan con **timestamp explícito**.
- **Flush automático** al detectar reconexión; también al montar si quedó cola previa.
- UI optimista para updates (salida de visita, entrega de encomienda).
- Fotos deshabilitadas offline con mensaje claro (requieren Storage).
- TopBar muestra N operaciones pendientes / "Sincronizando…".

Ver decisión en [ADR-005](../decisions/ADR-005-offline-localstorage.md).

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
