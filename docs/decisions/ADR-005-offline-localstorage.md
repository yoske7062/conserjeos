# ADR-005: Modo offline con cola en localStorage

- **Estado:** ✅ Aceptada
- **Fecha:** 2026-06-24
- **Stage:** 3
- **Decididores:** Diego

## Contexto
Las conserjerías suelen tener conectividad inestable. El conserje no puede dejar de registrar
visitas, encomiendas o novedades porque se cayó internet. Necesitamos resiliencia sin un backend
de sincronización complejo.

## Alternativas consideradas
1. **Nada (requiere conexión).** Pro: simple. Contra: inaceptable — se pierde el caso de uso central.
2. **IndexedDB + librería de sync (ej. RxDB/PouchDB).** Pro: robusto, queries offline. Contra: sobre-ingeniería para 2 personas en Stage 3; curva de aprendizaje.
3. **Cola simple en localStorage + flush al reconectar.** Pro: simple, suficiente para operaciones append/update; pub/sub para reaccionar en la UI. Contra: sin queries offline; fotos requieren un paso extra (encode/decode base64) en vez de subir directo a Storage.

## Decisión
Cola en **localStorage** (`apps/desktop/src/lib/offlineQueue.js`) con patrón pub/sub. Las
operaciones se encolan con timestamp explícito y se hace **flush automático al reconectar**.
Las fotos se codifican como base64 en la cola y se suben a Storage recién al flush. UI optimista para updates (salida/entrega).

## Consecuencias
- **Positivas:** el conserje sigue operando sin red; implementación mínima; el Dashboard reacciona vía pub/sub sin prop drilling.
- **Negativas / deuda:** sin resolución de conflictos sofisticada; sin TTL/límite de reintentos para items permanentemente fallidos (ver política de invalidación en [feature-offline-mode.md](../features/feature-offline-mode.md)).
- **Revertir costaría:** bajo — está encapsulado en un módulo.

## Missing Information
- Prueba en terreno pendiente (`T-024`) antes de declarar el modo offline "confiable".

## Actualización 2026-07-04
- Las fotos offline **sí están implementadas** (PR #3, James) — esta doc decía lo contrario, corregido.
- Riesgo de duplicación por flush concurrente: resuelto con guard de reentrancia a nivel de módulo en `flushQueue()` (`syncQueue.js`), no solo en el caller.
