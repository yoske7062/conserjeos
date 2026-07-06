import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mismo patrón que Visitas/Encomiendas/Novedades: monta la página completa,
// simula al usuario real (admin o conserje), verifica el payload real.
const mockInsert = vi.fn();
const mockUpdate = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
let fixtureData = [];
const mockSelectChain = {
  eq: vi.fn().mockReturnThis(),
  order: vi.fn(() => Promise.resolve({ data: fixtureData })),
};

vi.mock('../lib/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => mockSelectChain),
      insert: mockInsert,
      update: mockUpdate,
    })),
  },
}));

vi.mock('../lib/useRealtimeSync.js', () => ({ useRealtimeSync: () => {} }));
vi.mock('../lib/offlineQueue.js', () => ({ enqueue: vi.fn() }));

import Tareas from './Tareas.jsx';

const ADMIN = { id: 'admin-1', edificio_id: 'edif-los-castanos', rol: 'admin' };
const CONSERJE = { id: 'conserje-1', edificio_id: 'edif-los-castanos', rol: 'conserje' };

beforeEach(() => {
  mockInsert.mockReset();
  mockUpdate.mockClear();
  fixtureData = [];
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
});

describe('Tareas — permisos y flujo (integración)', () => {
  it('un conserje no ve el botón de crear tarea', async () => {
    render(<Tareas perfil={CONSERJE} />);
    await waitFor(() => expect(screen.getByText('Sin tareas pendientes')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: '+ Nueva tarea' })).not.toBeInTheDocument();
  });

  it('el admin crea una tarea con prioridad alta', async () => {
    mockInsert.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<Tareas perfil={ADMIN} />);

    await user.click(screen.getByRole('button', { name: '+ Nueva tarea' }));
    await user.type(screen.getByPlaceholderText('Ej: revisar luces del estacionamiento'), 'Revisar portón eléctrico');
    await user.click(screen.getByRole('button', { name: 'Alta' }));
    await user.click(screen.getByRole('button', { name: 'Crear tarea' }));

    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
    const payload = mockInsert.mock.calls[0][0];
    expect(payload.titulo).toBe('Revisar portón eléctrico');
    expect(payload.prioridad).toBe('alta');
    expect(payload.estado).toBe('pendiente');
    expect(payload.edificio_id).toBe('edif-los-castanos');
    expect(payload.creada_por).toBe('admin-1');
  });

  it('el conserje completa una tarea asignada', async () => {
    fixtureData = [{
      id: 'tarea-1', edificio_id: 'edif-los-castanos', creada_por: 'admin-1',
      titulo: 'Revisar portón eléctrico', descripcion: null, prioridad: 'normal',
      estado: 'pendiente', vence_at: null, completada_at: null, created_at: new Date().toISOString(),
    }];
    const user = userEvent.setup();
    render(<Tareas perfil={CONSERJE} />);

    await screen.findByText('Revisar portón eléctrico');
    await user.click(screen.getByRole('button', { name: /Completar/ }));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    const payload = mockUpdate.mock.calls[0][0];
    expect(payload.estado).toBe('completada');
    expect(payload.completada_por).toBe('conserje-1');
  });

  it('una tarea con vence_at en el pasado se marca como vencida', async () => {
    fixtureData = [{
      id: 'tarea-2', edificio_id: 'edif-los-castanos', creada_por: 'admin-1',
      titulo: 'Tarea vieja', descripcion: null, prioridad: 'normal',
      estado: 'pendiente', vence_at: '2020-01-01T00:00:00.000Z', completada_at: null,
      created_at: new Date().toISOString(),
    }];
    render(<Tareas perfil={CONSERJE} />);

    await screen.findByText('Tarea vieja');
    expect(screen.getByText(/Vencida/)).toBeInTheDocument();
  });
});
