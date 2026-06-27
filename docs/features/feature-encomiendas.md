# Feature: Encomiendas (paquetería)

- **ID:** F-004
- **Stage:** 1
- **Lifecycle:** DEPLOYED (pendiente MEASURED)
- **Responsable:** Diego
- **Estado:** ✅ Done

## Descripción
Recepción y entrega de encomiendas con evidencia y seguimiento de pendientes.

## Problema
Paquetes que se pierden o se entregan al residente equivocado, sin registro de recepción ni entrega.

## Solución
- Registro de recepción con foto y destinatario/departamento.
- Tabs **Pendientes** / **Entregadas**; indicador de antigüedad.
- Marcado de entrega con timestamp.
- Soporte offline (encola) + UI optimista en la entrega.

## User Stories
- Como **conserje**, quiero registrar un paquete recibido, para que el residente sepa que llegó.
- Como **conserje**, quiero marcar la entrega, para tener constancia de a quién se entregó y cuándo.

## Acceptance Criteria
- [x] Recepción crea registro con `entregada = false` y `recibida_at`.
- [x] Entrega marca `entregada = true` con `entregada_at`.
- [x] Panel admin separa pendientes/entregadas con antigüedad.

## Riesgos
- Foto requiere red → offline sin foto.

## Dependencias
- Tabla `encomiendas`; Storage.

## Métricas (para MEASURED)
- Encomiendas pendientes promedio; tiempo recepción→entrega.

## Archivos
- `apps/desktop/src/pages/Encomiendas.jsx`; `apps/admin/app/dashboard/encomiendas/page.jsx`.
