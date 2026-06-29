# Observabilidad — Portia

Capacidad de entender qué ocurre dentro del sistema mediante logs, métricas y trazas. Debe permitir responder: qué falló, cuándo falló, a qué usuario o proceso afectó, cuánto tiempo tomó y si el error sigue ocurriendo.

---

## 1. Estado actual

| Capa | Herramienta | Estado |
|---|---|---|
| Logs del cliente (desktop) | `src/lib/logger.js` con niveles + redacción de datos sensibles | Disponible, adopción gradual |
| Logs del panel admin | Logs de Vercel | Disponible |
| Logs de base de datos | Supabase → Logs (Postgres, Auth, PostgREST) | Disponible |
| Métricas de uso de producto | — | Pendiente |
| Trazas distribuidas | — | Fuera de alcance por ahora |

---

## 2. Logger del cliente

`crearLogger(modulo)` entrega un logger con niveles `debug | info | warn | error`. En desarrollo registra desde `debug`; en producción desde `info`.

```js
import { crearLogger } from '../lib/logger';
const log = crearLogger('Visitas');

log.info('visita registrada', { visitaId, edificioId });
log.error('falló insert de visita', { error: error.message });
```

### Redacción de datos sensibles
El logger **nunca** imprime el valor de claves sensibles (`rut`, `nombre`, `password`, `token`, `service_role`, etc.), aunque vengan anidadas en el objeto de contexto: las reemplaza por `«redactado»`. Esto cumple la regla "los logs no contienen datos sensibles" de la Definition of Done.

Qué sí registrar: identificadores (`visitaId`, `edificioId`), módulo, acción, mensaje de error. Qué no: RUT, nombres, fotos, credenciales.

---

## 3. Qué observar como mínimo

- Errores de escritura a Supabase (insert/update que devuelven `error`).
- Fallos de sincronización de la cola offline.
- Transiciones de conexión (online ↔ offline).
- Errores de autenticación.

---

## 4. Pendientes

- [ ] Adoptar `crearLogger` en los módulos que hoy usan `console.*` directo.
- [ ] Evaluar un sink remoto (ej. enviar `error` a un endpoint) respetando la redacción.
- [ ] Definir métricas de producto mínimas (visitas/día, encomiendas pendientes) para el panel admin.
