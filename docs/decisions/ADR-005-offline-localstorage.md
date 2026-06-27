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
3. **Cola simple en localStorage + flush al reconectar.** Pro: simple, suficiente para operaciones append/update; pub/sub para reaccionar en la UI. Contra: sin queries offline; fotos no soportadas offline (requieren storage).

## Decisión
Cola en **localStorage** (`apps/desktop/src/lib/offlineQueue.js`) con patrón pub/sub. Las
operaciones se encolan con timestamp explícito y se hace **flush automático al reconectar**.
Las fotos quedan deshabilitadas offline con mensaje claro. UI optimista para updates (salida/entrega).

## Consecuencias
- **Positivas:** el conserje sigue operando sin red; implementación mínima; el Dashboard reacciona vía pub/sub sin prop drilling.
- **Negativas / deuda:** **riesgo de duplicación** si el flush corre dos veces (cubrir con test, `T-024`); sin fotos offline; sin resolución de conflictos sofisticada.
- **Revertir costaría:** bajo — está encapsulado en un módulo.

## Missing Information
- Prueba en terreno pendiente (`T-024`) antes de declarar el modo offline "confiable".
