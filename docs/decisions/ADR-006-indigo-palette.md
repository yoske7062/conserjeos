# ADR-006: Migración de paleta a índigo

- **Estado:** ✅ Aceptada
- **Fecha:** 2026-06-25
- **Stage:** 3
- **Decididores:** Diego

## Contexto
La paleta original usaba un acento verde neón (`#00FF88`) y hubo una iteración previa con dorado
(`#C8932F`). Ninguno transmitía la sensación de producto serio/confiable que queremos para un
software que maneja seguridad y datos de un edificio. Diego pidió explícitamente cambiar la paleta.

## Alternativas consideradas
1. **Mantener verde neón.** Contra: estética "cripto/gaming", poco confiable para B2B serio.
2. **Dorado (#C8932F).** Contra: probado y descartado por el equipo; difícil de usar bien.
3. **Índigo (#6366F1 / #4F46E5).** Pro: percepción profesional, buen contraste, neutral, calza con tema oscuro y claro.

## Decisión
Migrar a **índigo**: `#6366F1` (dark) / `#4F46E5` (light), con `--brand`, `--brand-rgb`,
`--brand-text-on` como CSS variables compartidas entre desktop y panel admin.

## Consecuencias
- **Positivas:** identidad consistente entre desktop y admin; percepción más profesional.
- **Negativas / deuda:** el **logo** y el indicador "En línea" quedaron pendientes de ajuste de color (diseño diferido por decisión de Diego: *"dejemos el diseño para el final"*).
- **Revertir costaría:** bajo — son CSS variables centralizadas.

## Missing Information
- Definición final de marca (logo, tipografía) diferida a una pasada de diseño dedicada.
