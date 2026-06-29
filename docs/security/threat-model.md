# Modelo de amenazas — Portia

Qué medidas de seguridad se aplican, contra qué, y dónde están los límites de confianza.

---

## 1. Datos que protegemos

| Dato | Sensibilidad | Dónde vive |
|---|---|---|
| RUT de visitantes | Personal (Ley 21.719) | `visitas.rut_visitante` |
| Nombres de visitantes y residentes | Personal | `visitas`, `encomiendas` |
| Departamentos / destinos | Personal | `visitas`, `encomiendas` |
| Credenciales de conserjes/admins | Crítico | Supabase Auth |
| Fotos de novedades/encomiendas | Personal | Supabase Storage |

---

## 2. Límites de confianza

```
[ Usuario ] → [ Frontend (desktop/admin) ] → [ Supabase: PostgREST + RLS + Postgres ]
                     ↑ NO confiable                    ↑ aquí vive la autorización real
```

**El frontend no es confiable.** Cualquiera con la `anon` key (que está en el cliente, por diseño) puede llamar a la API directamente. Por eso toda autorización real vive en RLS y constraints de la base de datos.

---

## 3. Amenazas y mitigaciones

| Amenaza | Mitigación |
|---|---|
| Un conserje accede a datos de otro edificio | RLS: `edificio_id = mi_edificio_id()` en cada tabla |
| Un usuario inserta/edita filas de otro edificio saltándose la UI | Políticas RLS con `with check` en INSERT/UPDATE |
| Escalamiento de privilegio conserje → admin | Rol en `perfiles` validado en servidor; ocultar UI no es autorización |
| Fuga de la `service_role` key | Solo en backend/scripts locales; nunca en frontend, repo, ni logs |
| Inyección SQL | Cliente Supabase parametriza; no se concatenan strings SQL |
| RUT usado como secreto de acceso | Prohibido: el RUT es identificador, no contraseña |
| Datos sensibles en logs | RUT y nombres se omiten o enmascaran en logs |
| App Electron comprometida vía web | `contextIsolation`, `sandbox`, CSP, bloqueo de navegación externa |
| Workflow de CI filtra secretos | `contents: write` solo en release desde tags; sin secretos en PRs no confiables |

---

## 4. La autenticación no basta

Estar autenticado **no** evita que un usuario acceda a registros ajenos. Cada tabla expuesta debe definir políticas explícitas para lectura, creación, actualización y eliminación. Ver [`../data/database-model.md`](../data/database-model.md) para el estado de RLS por tabla.

---

## 5. Ocultar no es proteger

Ocultar una opción en la interfaz (ej. el panel admin) no constituye autorización. Un usuario podría llamar directamente a la ruta o función. Toda acción privilegiada valida el rol en el servidor / base de datos.

---

## 6. Fuera de alcance (por ahora)

- Cifrado de columnas a nivel aplicación (se confía en el cifrado en reposo de Supabase).
- MFA para conserjes (candidato para una etapa futura).
- Auditoría centralizada de accesos (ver [`../engineering/observability.md`](../engineering/observability.md)).
