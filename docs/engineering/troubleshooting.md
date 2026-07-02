# Troubleshooting — Portia

Problemas comunes al desarrollar u operar Portia y cómo resolverlos.

---

## App de escritorio

**Electron no abre / pantalla en blanco**
- Verifica que Vite esté corriendo en `http://localhost:5173`.
- Revisa que `apps/desktop/.env` exista con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

**No conecta a Supabase**
- Confirma las keys en `.env`. La `anon` key, no la `service_role`.
- Revisa el indicador "En línea / Sin conexión" en la barra superior.

**La ventana no se puede arrastrar tras cerrar sesión**
- Causa histórica: un `drag-region` global cubría los controles. Solución: usar `WebkitAppRegion: 'drag'` en contenedores seguros y `'no-drag'` en los interactivos. No usar un div fijo de ancho completo.

## Base de datos

**`new row violates row-level security policy`**
- El usuario intenta escribir en un `edificio_id` que no es el suyo, o la política de escritura no tiene `with check`. Revisa las políticas RLS de la tabla.

**`null value in column "rut_visitante"` / falla el CHECK del RUT**
- El RUT no cumple el formato `^\d{1,3}(\.\d{3})*-[0-9kK]$`. Normaliza antes de insertar.

## CI

**CI falla en `npm ci`**
- El `package-lock.json` está desincronizado. Corre `npm install` y commitea el lock actualizado.

**Build de Electron falla en GitHub Actions**
- Revisa que los secrets `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configurados en el repo.
