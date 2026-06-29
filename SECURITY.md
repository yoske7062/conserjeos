# Seguridad — Portia

Portia maneja datos personales de visitantes y residentes (nombres, RUT, departamentos). Esto exige un estándar de seguridad explícito.

---

## 1. Reportar una vulnerabilidad

Si encuentras una vulnerabilidad, **no abras un issue público**. Escribe a Diego Hadwa (yoske7062@gmail.com) con:

- Descripción del problema y su impacto.
- Pasos para reproducirlo.
- Versión / commit afectado.

Compromiso de respuesta: acuse en 48 horas, evaluación en 7 días.

---

## 2. Manejo de secretos

### Qué nunca se commitea
- `.env`, `.env.local`, `.env.*.local`
- `CREDENCIALES-PRIVADO.txt`
- La `service_role` key de Supabase
- Cualquier token, password o API key

Todo esto está cubierto por `.gitignore`. Verifícalo antes de cada commit con `git status`.

### Claves de Supabase
| Clave | Dónde puede vivir | Dónde nunca |
|---|---|---|
| `anon` key | Frontend (desktop + admin), protegida por RLS | — |
| `service_role` key | Solo backend seguro / scripts locales de admin en memoria | Frontend, Electron, repo, archivo público, logs |

La `anon` key es segura en el cliente **porque** RLS restringe cada fila. Si RLS no está bien configurado, la `anon` key deja de ser segura. Ver [`docs/security/threat-model.md`](docs/security/threat-model.md).

### Variables de entorno
Cada app tiene un `.env.example` con los nombres de variables requeridas, **sin valores reales**. Los valores reales se comparten por canal privado (nunca por el repo).

```
apps/desktop/.env.example
apps/admin/.env.example
```

Detalle completo en [`docs/security/secrets-management.md`](docs/security/secrets-management.md).

---

## 3. Autenticación y autorización

- Auth por email/password vía Supabase Auth.
- Autorización por **RLS en cada tabla** + rol (`admin` / `conserje`) en `perfiles`.
- **Ocultar una opción en la interfaz no es autorización.** Un usuario podría llamar directamente a la API. Toda restricción real vive en RLS y en validación de servidor, no en el frontend.

Detalle en [`docs/security/authentication-authorization.md`](docs/security/authentication-authorization.md).

---

## 4. RLS — no negociable

Antes de exponer cualquier tabla nueva:

1. `alter table ... enable row level security;`
2. Definir políticas explícitas para **lectura, creación, actualización y eliminación**.
3. Las políticas de escritura deben usar `with check` (no solo `using`), para impedir que un usuario inserte/actualice filas de otro edificio.

La autenticación por sí sola no evita que un usuario acceda a registros ajenos.

---

## 5. RUT — dato personal, no secreto

- El RUT se valida y normaliza también del lado de los datos (CHECK constraint en la BD), no solo en el formulario. La validación en vivo es solo experiencia de usuario.
- El RUT **nunca** se usa como contraseña, token ni mecanismo de acceso.
- En logs, el RUT se omite o se enmascara.

---

## 6. Electron

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- API mínima expuesta en `preload.cjs`.
- Bloqueo de navegación a URLs arbitrarias y de `window.open` no controlado.
- Validación de cada mensaje IPC.

Ver [`docs/engineering/architecture.md`](docs/engineering/architecture.md) sección Electron.

---

## 7. GitHub Actions

- El permiso `contents: write` existe solo en el job de release y se ejecuta desde tags.
- No se entregan secretos a workflows disparados por PRs no confiables.
- Las versiones de las Actions están fijadas.
