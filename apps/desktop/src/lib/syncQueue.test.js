import { describe, it, expect, beforeEach, vi } from 'vitest';

// La cola persiste en localStorage, que no existe en Node: se stubbea con un
// Map ANTES de que los módulos importados se evalúen (vi.hoisted corre primero).
const { store } = vi.hoisted(() => {
  const store = new Map();
  globalThis.localStorage = {
    getItem:    (k) => (store.has(k) ? store.get(k) : null),
    setItem:    (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  return { store };
});

// Siempre se inyecta un cliente falso, pero syncQueue.js importa el cliente
// real como default param — sin este mock, ese import instancia
// createClient() y en Node sin WebSocket nativo (CI, Node 20) explota antes
// de llegar a un solo test.
vi.mock('./supabase.js', () => ({ supabase: {} }));

import { enqueue, getAll, count } from './offlineQueue.js';
import { flushQueue } from './syncQueue.js';

function clienteFalso({ refreshFalla = false, errorInsert = null, errorUpdate = null } = {}) {
  const llamadas = { inserts: [], updates: [], uploads: [] };
  return {
    llamadas,
    auth: {
      refreshSession: async () => ({
        error: refreshFalla ? { message: 'refresh token expirado' } : null,
      }),
    },
    storage: {
      from: () => ({
        upload: async (path) => {
          llamadas.uploads.push(path);
          return { data: { path }, error: null };
        },
      }),
    },
    from: (table) => ({
      insert: async (payload) => {
        llamadas.inserts.push({ table, payload });
        return { error: errorInsert };
      },
      update: (payload) => ({
        eq: async (col, val) => {
          llamadas.updates.push({ table, payload, col, val });
          return { error: errorUpdate };
        },
      }),
    }),
  };
}

// Fixtures con datos del dominio real: nombres chilenos y RUT válido,
// no 'Client A' (los nombres genéricos esconden bugs de clasificación).
const VISITA = {
  edificio_id: 'edif-los-castanos',
  nombre_visitante: 'JOSE LUIS VERA MORENO',
  rut_visitante: '12.345.678-5',
  depto: '402',
};

const RETIRO_ENCOMIENDA = {
  retirado_por: 'XIMENA RODRIGUEZ MOORE',
  retirado_tipo: 'tercero',
  retirada_at: '2026-07-01T14:30:00.000Z',
};

beforeEach(() => store.clear());

describe('flushQueue', () => {
  it('sincroniza una visita creada offline y la saca de la cola', async () => {
    enqueue({ table: 'visitas', op: 'insert', payload: VISITA });
    const client = clienteFalso();

    const res = await flushQueue(client);

    expect(res).toEqual({ procesados: 1, fallidos: 0 });
    expect(client.llamadas.inserts).toEqual([{ table: 'visitas', payload: VISITA }]);
    expect(count()).toBe(0);
  });

  it('no duplica: un 23505 (la visita ya existía en el server) cuenta como éxito', async () => {
    enqueue({ table: 'visitas', op: 'insert', payload: VISITA });
    const client = clienteFalso({ errorInsert: { code: '23505', message: 'duplicate key' } });

    const res = await flushQueue(client);

    expect(res).toEqual({ procesados: 1, fallidos: 0 });
    expect(count()).toBe(0);
  });

  it('un error real (RLS) deja el item en la cola para reintentar', async () => {
    enqueue({ table: 'tareas', op: 'insert', payload: { titulo: 'Revisar citófono piso 4' } });
    const client = clienteFalso({ errorInsert: { code: '42501', message: 'permission denied' } });

    const res = await flushQueue(client);

    expect(res).toEqual({ procesados: 0, fallidos: 1 });
    expect(count()).toBe(1);
  });

  it('sincroniza el retiro de una encomienda (update por id)', async () => {
    enqueue({ table: 'encomiendas', op: 'update', rowId: 'enc-77', payload: RETIRO_ENCOMIENDA });
    const client = clienteFalso();

    const res = await flushQueue(client);

    expect(res).toEqual({ procesados: 1, fallidos: 0 });
    expect(client.llamadas.updates).toEqual([
      { table: 'encomiendas', payload: RETIRO_ENCOMIENDA, col: 'id', val: 'enc-77' },
    ]);
    expect(count()).toBe(0);
  });

  it('sube la foto encolada y agrega foto_url al payload antes de insertar', async () => {
    const fotoBase64 = 'data:image/jpeg;base64,' + Buffer.from('foto-porteria').toString('base64');
    enqueue({
      table: 'encomiendas',
      op: 'insert',
      payload: { edificio_id: 'edif-los-castanos', tipo: 'paquete', depto: '402' },
      fotoBase64,
      fotoName: 'encomienda.jpg',
    });
    const client = clienteFalso();

    await flushQueue(client);

    expect(client.llamadas.uploads).toHaveLength(1);
    expect(client.llamadas.uploads[0]).toMatch(/^encomiendas\/edif-los-castanos\/\d+\.jpg$/);
    expect(client.llamadas.inserts[0].payload.foto_url).toBe(client.llamadas.uploads[0]);
    expect(count()).toBe(0);
  });

  it('si la sesión no se puede refrescar, aborta sin tocar la cola', async () => {
    enqueue({ table: 'visitas', op: 'insert', payload: VISITA });
    const client = clienteFalso({ refreshFalla: true });

    const res = await flushQueue(client);

    expect(res.abortado).toBe(true);
    expect(client.llamadas.inserts).toHaveLength(0);
    expect(count()).toBe(1);
  });
});

describe('offlineQueue', () => {
  it('enqueue asigna id y timestamp propios a cada item', () => {
    enqueue({ table: 'visitas', op: 'insert', payload: VISITA });
    enqueue({ table: 'visitas', op: 'insert', payload: VISITA });

    const items = getAll();
    expect(items).toHaveLength(2);
    expect(items[0]._id).not.toBe(items[1]._id);
    expect(items[0]._ts).toBeTruthy();
  });

  it('si localStorage tiene basura, getAll devuelve cola vacía en vez de crashear', () => {
    localStorage.setItem('portia:offline-queue', '{corrupto');
    expect(getAll()).toEqual([]);
  });
});
