# ADR-001: App de escritorio (Electron) para el conserje

- **Estado:** ✅ Aceptada
- **Fecha:** 2026 (inferida del repo — confirmar)
- **Stage:** 0
- **Decididores:** Diego, James

## Contexto
El conserje opera desde un puesto fijo en la recepción del edificio, muchas veces con conectividad
inestable y siendo a menudo un adulto mayor con baja afinidad tecnológica. Necesita una herramienta
estable, siempre presente, que funcione aunque se caiga internet.

## Alternativas consideradas
1. **Web app (SPA).** Pro: cero instalación, deploy simple. Contra: frágil sin red, sin notificaciones nativas confiables, se "pierde" entre pestañas.
2. **App móvil.** Pro: notificaciones. Contra: el conserje trabaja en un puesto fijo con PC, no en celular; pantalla chica para adultos mayores.
3. **App de escritorio (Electron).** Pro: presencia permanente, notificaciones nativas, base para modo offline, una sola base de código React. Contra: peso del binario, builds por plataforma.

## Decisión
**Electron + React + Vite** para la app del conserje.

## Consecuencias
- **Positivas:** notificaciones nativas, modo offline viable, UX consistente Mac/Windows, reutiliza React.
- **Negativas / deuda:** pipeline de builds por plataforma (resuelto con `release.yml`); tamaño del instalador.
- **Revertir costaría:** medio — la lógica React es portable a web, pero se pierde offline + nativo.

## Missing Information
- Fecha exacta de la decisión (confirmar con primer commit).
