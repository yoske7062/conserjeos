# Portia — Master Roadmap

**Última actualización:** 2026-06-25 · Revisar **cada lunes** junto al [dashboard](../dashboard.md).

Organizado por horizonte, **no por fechas**. La prioridad real es cerrar el `% del stage actual`
(Stage 3). Todo lo que no contribuye a Stage 3/4 está en **Later** o **Icebox** (= Future Work).

Estados: `⬜ Todo` · `🔄 Doing` · `✅ Done` · `⛔ Blocked`

---

## 🔵 NOW (cerrar Stage 3 → habilitar Alpha)

| Feature / Tarea | Objetivo | Impacto | Prioridad | Dependencias | Estado | Responsable |
|---|---|---|---|---|---|---|
| Deploy panel admin (Vercel) `T-021` | Administrador real puede entrar | Alto — desbloquea alpha | P0 | Dominio + env prod | 🔄 | Diego |
| Probar offline en terreno `T-024` | Evitar pérdida de datos | Alto | P0 | Edificio/red real | ⬜ | Diego |
| Endurecer alta de conserjes `T-023` | Invitación segura, no signUp directo | Medio | P1 | — | ⬜ | Diego |
| Verificar realtime panel admin `T-025` | Confianza en datos en vivo | Medio | P1 | Deploy | ⬜ | Diego |

## 🟢 NEXT (Stage 4 — Private Alpha)

| Feature / Tarea | Objetivo | Impacto | Prioridad | Dependencias | Estado | Responsable |
|---|---|---|---|---|---|---|
| Conseguir 1er edificio alpha `T-030` | Usuarios reales | Crítico | P0 | Comercial | ⛔ | Diego/James |
| Feedback + Bug Tracker `T-041` | Aprender del uso real | Alto | P1 | Alpha activo | ⬜ | James |
| Cumplimiento Ley 21.719 `T-040` | Legalidad datos visitantes | Alto | P1 | Owner legal | ⬜ | _sin asignar_ |
| User Interview Log `T-042` | Validar supuestos A1–A4 | Alto | P1 | Alpha activo | ⬜ | Diego |

## 🟡 LATER (Stage 5+ — Future Work)

| Feature | Objetivo | Stage |
|---|---|---|
| Instrumentación métricas (activación/retención/churn) | Medir negocio | 5 |
| Onboarding semi-self-service | Reducir fricción de alta | 5 |
| Facturación / billing | Cobrar a administradoras | 5 |
| Export CSV de historial `T-026` | Valor para administrador | 5 |
| Analytics dashboard + growth experiments | Escalar adquisición | 6 |

## ⚪ ICEBOX (ideas sin compromiso)

- App móvil para el administrador (hoy es web).
- Integración con citófono / control de acceso físico.
- Reconocimiento de patente para visitas en auto.
- Reportes mensuales automáticos por email al administrador.
- Multi-idioma.

---

## Missing Information
- Fechas objetivo: hoy el roadmap es por horizonte. Definir target de cierre de Stage 3 si hay
  presión externa (ver [founders.md](../founders.md)).
- Responsable de cumplimiento Ley 21.719 sin asignar.
