# Stage 1 — MVP Core

**Estado:** ✅ Done · **Progreso:** 100% · **Tag:** `v1.0.0-stage1`, `v1.1.0-stage1`

## Objetivo
Crear la funcionalidad mínima que entregue valor real al conserje en su turno.

## Alcance

### Must Have — ✅ entregado
- [x] Auth con Supabase (login conserje/admin)
- [x] Turno: iniciar / cerrar con resumen automático → [feature-turnos](../features/feature-turnos.md)
- [x] Novedades: tipo (urgente/incidente/informativo) + foto + realtime → [feature-novedades](../features/feature-novedades.md)
- [x] Visitas: entrada/salida + historial → [feature-visitas](../features/feature-visitas.md)
- [x] Encomiendas: recepción/entrega + foto → [feature-encomiendas](../features/feature-encomiendas.md)
- [x] Diseño base (sistema de colores, sidebar, layout)
- [x] CI/CD que compila instaladores Mac/Windows

### Nice To Have — diferido a Stage 2
- Animaciones entre módulos
- Estado de turno persistente en el sidebar

### Excluded (fuera de MVP Core)
- Panel web del administrador (→ Stage 3)
- Modo offline (→ Stage 3)
- Métricas y analítica (→ Stage 5)

## Gate de salida — ✅ Aprobado
- [x] Flujo principal funcional (turno → registrar → cerrar)
- [x] Sin errores críticos
- [x] Deployment estable (instaladores generados en CI)
