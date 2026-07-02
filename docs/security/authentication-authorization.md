# Autenticación y autorización — Portia

Cómo se identifica un usuario y cómo se decide qué puede hacer.

---

## 1. Autenticación

- Proveedor: Supabase Auth (email + password).
- La app de escritorio usa la `anon` key y guarda la sesión vía `@supabase/supabase-js`.
- El panel admin usa `@supabase/ssr` para sesión compatible con SSR; `middleware.js` redirige a `/login` a los no autenticados en `/dashboard/*`.

Cada request lleva el JWT del usuario. PostgREST lo valida y expone `auth.uid()` a las políticas RLS.

---

## 2. Autorización: dos niveles

### Nivel 1 — Aislamiento por edificio (RLS)
Cada tabla con datos de tenant tiene `edificio_id` y una política que exige:

```sql
edificio_id = public.mi_edificio_id()
```

`mi_edificio_id()` es una función `security definer` que devuelve el `edificio_id` del perfil del usuario autenticado. Un usuario nunca ve ni escribe datos de otro edificio.

### Nivel 2 — Rol (admin / conserje)
La columna `perfiles.rol` distingue `admin` de `conserje`. Las acciones privilegiadas (crear conserjes, configurar el edificio) se validan contra el rol **en el servidor**, no en la UI.

```sql
-- Helper disponible
public.mi_rol()  -- devuelve 'admin' | 'conserje'
```

---

## 3. Reglas de escritura: `using` vs `with check`

- `using` controla qué filas **se ven** (SELECT) y cuáles se pueden tocar (UPDATE/DELETE).
- `with check` controla qué valores **se pueden escribir** (INSERT/UPDATE).

Una política con solo `using` permite insertar filas con un `edificio_id` ajeno, porque `using` no se evalúa en INSERT. **Toda política de escritura debe incluir `with check`.** Ver la migración correspondiente en [`../data/migrations.md`](../data/migrations.md).

---

## 4. La interfaz no autoriza

Esconder un botón o una ruta no impide que un usuario llame a la API. Si una acción no debe permitirse, debe bloquearse en RLS o en una función de servidor que valide el rol. Nunca se confía en que "el usuario no verá la opción".

---

## 5. El RUT no es un mecanismo de acceso

El RUT es un identificador personal que recopilamos para el registro de visitas (obligación operativa y legal). **Nunca** se usa como contraseña, token de sesión ni prueba de identidad para autorizar acciones.
