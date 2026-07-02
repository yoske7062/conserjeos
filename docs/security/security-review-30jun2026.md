# Revisión de seguridad pre-Alpha — 30-jun-2026

Auditoría de seguridad antes de meter el primer edificio real (T-030). Estado: pre-alpha, sin
usuarios reales todavía. Esta revisión cubre lo que faltaba sobre lo ya hecho en los audits
anteriores (RLS, bucket privado, manejo de secretos).

---

## 1. Hallazgos y acciones

| # | Hallazgo | Severidad | Acción tomada |
|---|---|---|---|
| 1 | GitHub: Dependabot, secret scanning y push protection **desactivados** | Media | **Activados** los tres (repo es público → secret scanning gratis). + `dependabot.yml` para updates semanales |
| 2 | Panel admin (Next.js) **sin headers de seguridad HTTP** — clickjacking posible vía iframe | Media | **Aplicados** headers defensivos en `next.config.mjs` (X-Frame-Options, nosniff, Referrer-Policy, HSTS, Permissions-Policy). Verificado con build |
| 3 | Bucket de fotos en producción: estado público/privado a confirmar | Media | Documentado — ver §2. **No flipeado** sin confirmación |
| 4 | Sin Content-Security-Policy (CSP) en el admin | Baja | Documentado como mejora futura — ver §3. No se aplica sin testing por origen |
| 5 | CORS / rutas API abiertas | — | **Sin problema.** El admin usa server actions, no rutas API; no hay CORS abierto |

## 2. Flip del bucket de fotos a privado — decisión de timing

El código (PR #9) ya usa `createSignedUrl()` en vez de `getPublicUrl()`. El runbook para flipear
el bucket real está en [`bucket-fotos-flip-a-privado.md`](bucket-fotos-flip-a-privado.md).

**Recomendación de timing:** flipearlo **ahora**, antes del primer edificio real, no después.
Razón: hoy no hay usuarios, así que el flip no rompe la experiencia de nadie. Si se espera a
tener datos reales, cualquier cliente con una versión vieja del desktop vería fotos rotas
durante la ventana de actualización. Hacerlo en pre-alpha elimina ese riesgo por completo.

> Esto requiere ejecutar el SQL del runbook contra producción. **Decisión de Diego** — no se
> ejecuta en esta revisión. Es de bajo riesgo (reversible con `set public = true`) y el método
> de conexión ya está probado (ver `docs/data/prod-schema-drift-30jun2026.md`).

## 3. Mejoras futuras (no bloqueantes para Alpha)

- **CSP (Content-Security-Policy):** la mejora de seguridad de headers más fuerte que falta.
  Requiere enumerar cada origen permitido (Supabase `*.supabase.co`, Vercel, Google Fonts) y
  probar que no rompa nada. Vale la pena hacerlo, pero con la app corriendo y tiempo para probar,
  no a ciegas.
- **MFA para administradores:** hoy es email + password. Para cuentas admin (que ven todos los
  datos del edificio) un segundo factor sería deseable post-alpha. Ya estaba como "fuera de
  alcance" en `threat-model.md`.
- **Auditoría centralizada de accesos:** ya anotada en `threat-model.md` §6.

## 4. Lo que ya estaba bien (confirmado en esta revisión)

- RLS con `WITH CHECK` en todas las tablas — probado contra producción el 30-jun (un insert con
  `edificio_id` ajeno es rechazado).
- Bucket de fotos privado + signed URLs en el código.
- Sin secretos commiteados; `.gitignore` cubre `.env*` y `CREDENCIALES-PRIVADO.txt`.
- Electron endurecido (`contextIsolation`, `sandbox`, sin `nodeIntegration`) — ver `SECURITY.md`.
- Sin rutas API ni CORS abiertos en el admin.

## 5. Riesgo más grande que sigue abierto

**El marco legal, no el técnico.** La parte técnica está en buena forma para pre-alpha. Lo que
de verdad bloquea meter datos de personas reales es que **no hay Política de Privacidad ni
Términos publicados, ni un DPA firmado con el edificio, ni un owner de cumplimiento Ley 21.719
designado** (decisión D4 en `docs/founders.md`). Los borradores legales están en
[`../legal/`](../legal/), pero cerrar el riesgo requiere revisión de un abogado + las firmas,
no solo los borradores. Ver especialmente el punto de **transferencia internacional de datos**
(los datos viven en Brasil, no en Chile).
