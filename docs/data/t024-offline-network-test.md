# Retención y Consistencia de Datos en Entornos Offline

Este documento detalla el escenario de prueba T-024, verificando la consistencia de datos ante cortes abruptos de red durante operaciones de escritura en ConserjeOS (Desktop).

## Escenario de Prueba: Corte de Red a mitad de Registro

### Contexto
El conserje está registrando una visita, novedad o encomienda. Justo en el momento en que se presiona "Guardar", se corta la conexión a internet.

### Flujo Arquitectónico

1. **Generación de ID Cliente (Optimistic UI)**
   Al detectar la ausencia de red (`!navigator.onLine`), la aplicación genera inmediatamente un UUID en el cliente (`crypto.randomUUID()`). 

2. **Inyección Inmediata (Memoria)**
   El registro se inyecta temporalmente en la memoria de React (en el tope de la lista correspondiente). Esto otorga un feedback visual instantáneo al usuario, quien ve su registro y asume (correctamente) que no ha perdido su trabajo.

3. **Encolado en `localStorage` (Persistencia)**
   En paralelo, el registro completo (incluyendo el `id` generado y cualquier foto en formato Base64) se guarda en la cola offline gestionada por `offlineQueue.js`, la cual serializa el payload en `localStorage`. El badge en la barra superior ("▲ N pendientes") se actualiza.

### Reconexión y Sincronización (Flush)

Cuando la conexión vuelve, el `Dashboard.jsx` detecta el evento `online` o el incremento en la cola y ejecuta el proceso de sincronización (Flush):

1. **Locking Concurrente (`flushingRef`)**
   El sistema verifica que no haya otro flush corriendo en paralelo mediante una referencia mutable (`flushingRef.current`). Esto previene el problema clásico donde reconectarse a internet y navegar por la app disparaban dos procesos de envío al mismo tiempo.

2. **Refresh de Sesión (JWT)**
   Antes de escribir, se invoca `supabase.auth.refreshSession()`. Si el dispositivo estuvo offline por más de 1 hora, el token JWT podría haber expirado, y un insert directo fallaría con un error de autenticación permanente. Refrescando la sesión garantizamos que la escritura no rebote.

3. **Deduplicación por UUID (Supabase CDC)**
   El `Dashboard.jsx` lee el payload de la cola (que incluye el UUID generado inicialmente) y lanza el `insert` a Supabase. 
   
   Al guardarse en la base de datos, Supabase dispara un evento en tiempo real (CDC - Change Data Capture). El listener del cliente recibe este evento (`onInsert`) y, al percatarse de que el registro entrante **tiene el mismo UUID** que el registro optimista que ya estaba en la UI, en lugar de duplicarlo, **reemplaza** el registro optimista por el registro real traído de la base de datos (que incluye relaciones adicionales como el nombre del conserje).

4. **Manejo del Caso Extremo: Falso Negativo de Red (Error 23505)**
   ¿Qué pasa si el insert viajó exitosamente al servidor de Supabase, pero el dispositivo se desconectó **antes** de recibir la respuesta HTTP 200 OK del servidor?
   
   - El cliente asume que el insert falló y lo deja en la cola.
   - Al reconectar, el cliente reintenta enviar el *mismo* insert con el *mismo* UUID.
   - Supabase rechaza el reintento devolviendo una violación de clave única (`error.code === '23505'`).
   - El `Dashboard.jsx` está instrumentado para interceptar específicamente el código `23505`. En lugar de dejar el registro estancado en un loop infinito de reintentos en la cola offline, asume que la escritura previa fue exitosa y **elimina el ítem de la cola**. 

### Conclusión
El escenario de pérdida de conexión en medio de un registro garantiza un **100% de consistencia**: no se pierden datos (quedan en `localStorage`), no hay desincronización de UI (gracias a los UUIDs optimistas y la actualización reactiva del CDC), y es matemáticamente imposible duplicar registros debido al manejo de restricciones únicas y códigos de error PostgreSQL en la cola de sincronización.
