# Contribuir a Portia

Esta guía define cómo entra un cambio al repositorio. El objetivo: que `main` siempre contenga código revisado, probado y reversible.

---

## 1. Regla de oro

**Nadie hace push directo a `main`.** Todo cambio entra por una rama y un Pull Request con CI verde.

---

## 2. Flujo de trabajo

```bash
# 1. Partir desde main actualizado
git checkout main
git pull

# 2. Crear una rama por cambio
git checkout -b feature/panel-admin      # nueva funcionalidad
git checkout -b fix/validacion-rut       # corrección
git checkout -b chore/actualizar-ci      # mantenimiento

# 3. Trabajar y commitear (ver formato abajo)
git add -p
git commit

# 4. Subir y abrir PR
git push -u origin feature/panel-admin
gh pr create --fill

# 5. Esperar CI verde + revisión → merge (squash)
```

### Convención de ramas
| Prefijo | Para |
|---|---|
| `feature/<slug>` | Funcionalidad nueva |
| `fix/<slug>` | Corrección de bug |
| `chore/<slug>` | Mantenimiento, configuración, docs |
| `refactor/<slug>` | Reorganización sin cambio de comportamiento |

---

## 3. Un PR = una idea

Un cambio que combina panel administrativo, modo offline y notificaciones mezcla áreas con riesgos distintos. **Sepáralos en PRs independientes.** Esto facilita la revisión, las pruebas, la trazabilidad y el rollback.

Regla práctica: si el título del PR necesita un "y", probablemente son dos PRs.

---

## 4. Formato de commits

```
<tipo>(<área>): <qué cambió, en imperativo>

<por qué — solo si no es obvio>

Co-Authored-By: Claude <noreply@anthropic.com>
```

Tipos: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `test`.

Ejemplos:
```
fix(auth): impedir acceso con token expirado
feat(admin): agregar panel inicial de administración
test(rut): cubrir dígito verificador con K
docs(deployment): documentar variables de producción
```

Un commit debe representar una unidad lógica y comprensible. Evita `cambios`, `ahora si`, `actualizacion Claude`.

---

## 5. Antes de abrir el PR (checklist local)

- [ ] `npm run build` pasa en las apps afectadas.
- [ ] `npm test` pasa (en `apps/desktop`).
- [ ] Probaste el flujo principal manualmente, no solo que compila.
- [ ] No introdujiste secretos ni tokens.
- [ ] Si tocaste la BD: actualizaste `packages/supabase/schema.sql` con la migración versionada.
- [ ] Si fue una decisión costosa de revertir: escribiste un ADR en `docs/decisions/`.
- [ ] Actualizaste la documentación afectada **en el mismo PR**.

---

## 6. Definition of Done

Una feature está terminada solo si:

- [ ] Tiene criterios de aceptación verificables.
- [ ] Fue revisada mediante Pull Request.
- [ ] Pasa build y pruebas en CI.
- [ ] Tiene pruebas del flujo principal y de errores/permisos.
- [ ] No introduce secretos.
- [ ] Las migraciones están versionadas en `schema.sql`.
- [ ] Se revisaron las políticas RLS de las tablas afectadas.
- [ ] Se actualizó la documentación.
- [ ] Se probó fuera del entorno local.
- [ ] Existe una estrategia de rollback.
- [ ] Los logs no contienen datos sensibles.

Que el código compile o funcione localmente **no** demuestra que esté listo para producción.

---

## 7. Reglas que el asistente de IA (Claude) debe respetar

Estas reglas también viven en `CLAUDE.md` como contexto del asistente, pero son válidas para cualquier integrante del equipo:

- No modificar producción directamente.
- No cambiar tablas sin migración versionada en `schema.sql`.
- No desactivar pruebas ni lint para aprobar un cambio.
- No introducir secretos en el código ni en el repo.
- No modificar políticas RLS sin explicar el impacto en seguridad.
- No agregar dependencias sin justificación.
- Todo cambio debe incluir pruebas o justificar su ausencia.
- Antes de implementar, considerar los archivos influenciados y no asumir información faltante.

`CLAUDE.md` orienta al asistente; **no reemplaza** esta documentación. Ninguna regla crítica debe existir únicamente en `CLAUDE.md`.
