import { supabase } from './supabase';
import { getAll, remove, base64ToBlob } from './offlineQueue';
import { crearLogger } from './logger';

const log = crearLogger('syncQueue');

// Vacía la cola offline contra Supabase. `client` es inyectable solo para
// tests; en producción siempre es el cliente real.
// Devuelve { procesados, fallidos } o { abortado: true } si no se pudo
// refrescar la sesión (offline > 1h puede dejar el JWT vencido).
export async function flushQueue(client = supabase) {
  const { error: sessionErr } = await client.auth.refreshSession();
  if (sessionErr) {
    log.warn('flush abortado: no se pudo refrescar la sesión', { detalle: sessionErr.message });
    return { abortado: true, procesados: 0, fallidos: 0 };
  }

  let procesados = 0;
  let fallidos = 0;

  for (const item of getAll()) {
    let error;
    let payload = item.payload;
    if (item.fotoBase64) {
      const blob = base64ToBlob(item.fotoBase64);
      if (blob) {
        const ext  = item.fotoName?.split('.').pop() || 'jpg';
        const path = `${item.table}/${payload.edificio_id}/${Date.now()}.${ext}`;
        const { data: up, error: upError } = await client.storage.from('fotos').upload(path, blob);
        if (!upError && up) {
          payload = { ...payload, foto_url: path };
        }
      }
    }
    if (item.op === 'insert') {
      ({ error } = await client.from(item.table).insert(payload));
      // 23505 (unique violation) = el registro ya existe: la red se cortó
      // justo después de que el server lo guardó. Éxito, sale de la cola.
      if (error && error.code === '23505') error = null;
    } else if (item.op === 'update') {
      ({ error } = await client.from(item.table).update(payload).eq('id', item.rowId));
    }
    if (error) {
      fallidos++;
      log.error('item de cola falló al sincronizar', { tabla: item.table, op: item.op, pg_code: error.code });
    } else {
      remove(item._id);
      procesados++;
    }
  }

  return { procesados, fallidos };
}
