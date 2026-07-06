import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mismo patrón que Visitas/Encomiendas: monta la página completa, simula
// al conserje escribiendo, verifica el payload real que llega a Supabase.
const mockInsert = vi.fn();
// Novedades.jsx encadena un .eq('turno_id', ...) condicional DESPUÉS de
// .limit() cuando hay turno activo — el chain necesita ser thenable en
// cualquier punto, no solo resolver en .limit() como en Visitas/Encomiendas.
const mockSelectChain = {
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  then: (resolve) => resolve({ data: [] }),
};

vi.mock('../lib/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => mockSelectChain),
      insert: mockInsert,
      update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
    })),
  },
}));

vi.mock('../lib/useRealtimeSync.js', () => ({ useRealtimeSync: () => {} }));
vi.mock('../lib/offlineQueue.js', () => ({ enqueue: vi.fn(), fileToBase64: vi.fn() }));

import Novedades from './Novedades.jsx';

const PERFIL = { id: 'conserje-1', edificio_id: 'edif-los-castanos', rol: 'conserje', nombre: 'Juan' };

// jsdom en este entorno no expone localStorage como global — Novedades.jsx
// lo usa directo (sin pasar por window) para el borrador, así que se
// polyfillea acá en vez de tocar la config compartida de vitest.
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}

beforeEach(() => {
  mockInsert.mockReset();
  localStorage.clear();
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
});

describe('Novedades — registrar (integración)', () => {
  it('conserje escribe una novedad informativa y se registra', async () => {
    mockInsert.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<Novedades perfil={PERFIL} turno={{ id: 'turno-1' }} />);

    await user.click(screen.getByRole('button', { name: '+ Nueva novedad' }));
    await user.type(screen.getByPlaceholderText(/Escríbelo como lo anotarías/i), 'Ronda de las 22h');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
    const payload = mockInsert.mock.calls[0][0];
    expect(payload.tipo).toBe('informativo');
    expect(payload.descripcion).toBe('Ronda de las 22h');
    expect(payload.edificio_id).toBe('edif-los-castanos');
    expect(payload.conserje_id).toBe('conserje-1');
    expect(payload.turno_id).toBe('turno-1');
  });

  it('una frase rápida se agrega al texto en vez de reemplazarlo', async () => {
    const user = userEvent.setup();
    render(<Novedades perfil={PERFIL} turno={{ id: 'turno-1' }} />);

    await user.click(screen.getByRole('button', { name: '+ Nueva novedad' }));
    const textarea = screen.getByPlaceholderText(/Escríbelo como lo anotarías/i);
    await user.type(textarea, 'Todo tranquilo.');
    await user.click(screen.getByRole('button', { name: 'Ascensor fuera de servicio.' }));

    expect(textarea).toHaveValue('Todo tranquilo. Ascensor fuera de servicio.');
  });

  it('elegir "Incidente" en el selector envía la novedad con ese tipo', async () => {
    mockInsert.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<Novedades perfil={PERFIL} turno={{ id: 'turno-1' }} />);

    await user.click(screen.getByRole('button', { name: '+ Nueva novedad' }));
    const textarea = screen.getByPlaceholderText(/Escríbelo como lo anotarías/i);
    await user.type(textarea, 'Filtración en subterráneo');
    const modal = textarea.closest('form');
    await user.click(within(modal).getByRole('button', { name: /Incidente/ }));
    await user.click(within(modal).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
    expect(mockInsert.mock.calls[0][0].tipo).toBe('incidente');
  });

  it('si quedó un borrador guardado, lo restaura y abre el modal solo', async () => {
    localStorage.setItem(
      `portia:borrador-novedad:${PERFIL.id}:${PERFIL.edificio_id}`,
      JSON.stringify({ tipo: 'informativo', descripcion: 'Se cortó la luz en el subterráneo' })
    );

    render(<Novedades perfil={PERFIL} turno={{ id: 'turno-1' }} />);

    expect(await screen.findByText(/Recuperamos lo que estabas escribiendo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Escríbelo como lo anotarías/i)).toHaveValue('Se cortó la luz en el subterráneo');
  });
});
