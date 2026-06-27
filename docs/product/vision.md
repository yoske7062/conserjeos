# Portia — Product Vision

**Última actualización:** 2026-06-25 · **Owner:** Diego

---

## Problema que resolvemos

La conserjería de edificios residenciales en Chile opera con **cuadernos físicos**. Esto produce:

- **Pérdida de información en el cambio de turno** (cuaderno ilegible, páginas arrancadas, "no me avisaron").
- **Cero trazabilidad**: nadie sabe quién atendió a quién, cuándo, ni qué pasó.
- **Sin alertas** ante novedades urgentes (accidente, robo, corte de suministro, emergencia médica).
- **Responsabilidad difusa** ante reclamos de residentes: *"no quedó registrado"*.
- **Administrador a ciegas**: no puede ver qué ocurre en su edificio sin ir físicamente o llamar.

## ICP — Ideal Customer Profile

**Comprador (quien paga):** administradora de edificios / comunidad residencial.
- Administra entre **3 y 50 edificios** residenciales.
- Edificios de 50–300 departamentos, con conserjería 24/7 (2–4 conserjes en turnos).
- Ya siente el dolor de reclamos sin respaldo y rotación de conserjes.

**Usuario final:**
- **Conserje** (a veces adulto mayor, baja afinidad tecnológica) → app de escritorio simple.
- **Administrador** → panel web para supervisar sin estar presente.

## Casos de uso

1. **Cambio de turno sin pérdida de información** — el conserje saliente deja pendientes; el entrante los confirma antes de operar.
2. **Registro de visita** — entrada con nombre/RUT/depto, salida con duración, historial auditable.
3. **Encomienda** — recepción con foto, aviso de pendiente, entrega con timestamp.
4. **Novedad urgente** — incidente registrado + notificación nativa a otros dispositivos del edificio.
5. **Supervisión remota** — el administrador ve en tiempo real lo que pasa y asigna tareas.

## Propuesta de valor

> "Reemplaza el cuaderno del conserje por un sistema en tiempo real: nada se pierde en el cambio de
> turno, todo queda registrado, y el administrador ve su edificio sin estar ahí."

## Diferenciadores

- **App de escritorio nativa** (no web frágil): funciona aunque se caiga internet (modo offline con cola de sync).
- **Diseñada para adultos mayores**: WCAG AA, botones grandes, sin jerga.
- **Handoff de turno a prueba de olvidos**: popup bloqueante de pendientes.
- **Auditoría completa**: cada edición guarda quién, cuándo y el valor anterior.
- **Multi-tenant con RLS** desde el día 1: aislamiento real por edificio.

## Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Conserjes no adoptan (resistencia al cambio) | Alto | UX ultra simple, onboarding asistido en alpha |
| Modo offline pierde/duplica datos | Alto | Tests de sync antes del gate de Stage 3 |
| Ley 21.719 (datos personales de visitantes) | Alto (legal) | Consentimiento + política de retención en Stage 4 |
| Venta B2B lenta (ciclo de administradoras) | Medio | Empezar con 1 administradora aliada en alpha |
| Dependencia de Supabase (vendor lock-in) | Medio | Esquema SQL portable, RLS estándar |

## Supuestos críticos (a validar)

- **A1** — Las administradoras pagarán por trazabilidad y supervisión remota. *(no validado)*
- **A2** — Los conserjes adoptarán una app si es más simple que el cuaderno. *(no validado)*
- **A3** — El modo offline es un requisito real (conectividad inestable en conserjerías). *(parcial)*
- **A4** — El dolor es suficiente para cambiar un hábito de décadas. *(no validado)*

> Estos supuestos son el objetivo de aprendizaje de **Stage 4 — Private Alpha**.

## Métricas de éxito

| Horizonte | Métrica | Objetivo |
|---|---|---|
| Alpha (S4) | Edificios usando la app en turnos reales | 1 → 5–10 usuarios activos |
| Beta (S5) | Activación / Retención S4 / Churn | _por definir (ver Missing Information)_ |
| Launch (S6) | MRR, LTV/CAC, canal repetible | _por definir_ |

## Missing Information

1. **Pricing en CLP** — los planes (Trial/Basic/Pro) existen pero sin precios. → bloquea conversación comercial (`T-031`).
2. **Umbrales numéricos** de activación, retención, churn y NPS para los gates de Stage 5/6.
3. **Validación de A1–A4** — ningún supuesto crítico está validado con un cliente real.
4. **Owner de cumplimiento legal** (Ley 21.719).
