import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock del cliente Supabase real — el test monta la página completa y simula
// al conserje escribiendo, no llama funciones aisladas. La lógica de negocio
// (validación de RUT, armado del payload) corre tal cual corre en producción.
const mockInsert = vi.fn();
const mockSelectChain = {
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({ data: [] }),
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
vi.mock('../lib/offlineQueue.js', () => ({ enqueue: vi.fn() }));

import Visitas from './Visitas.jsx';

const PERFIL = { id: 'conserje-1', edificio_id: 'edif-los-castanos', rol: 'conserje' };

beforeEach(() => {
  mockInsert.mockReset();
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
});

describe('Visitas — registrar entrada (integración)', () => {
  it('conserje escribe nombre, RUT válido y destino, y la visita se registra', async () => {
    mockInsert.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<Visitas perfil={PERFIL} turno={{ id: 'turno-1' }} />);

    await user.click(screen.getAllByTitle('Registrar entrada')[0]);

    await user.type(screen.getByPlaceholderText('Juan Pérez'), 'Ximena Rodríguez Moore');
    // Input con máscara automática (formatearRut reescribe el valor en cada
    // tecla) — se setea de una vez, en lugar de simular tecla por tecla.
    fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), { target: { value: '123456785' } });
    await user.type(screen.getByPlaceholderText('201, Oficina 3…'), '402');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: 'Registrar entrada' }));

    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
    const payload = mockInsert.mock.calls[0][0];
    expect(payload.nombre_visitante).toBe('Ximena Rodríguez Moore');
    expect(payload.rut_visitante).toBe('12.345.678-5');
    expect(payload.destino).toBe('402');
    expect(payload.edificio_id).toBe('edif-los-castanos');
    expect(payload.conserje_id).toBe('conserje-1');
    expect(payload.turno_id).toBe('turno-1');
  });

  it('un RUT inválido bloquea el envío y muestra el error, sin llamar a Supabase', async () => {
    const user = userEvent.setup();
    render(<Visitas perfil={PERFIL} turno={{ id: 'turno-1' }} />);

    await user.click(screen.getAllByTitle('Registrar entrada')[0]);
    await user.type(screen.getByPlaceholderText('Juan Pérez'), 'Juan Soto');
    fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), { target: { value: '111111119' } });
    await user.type(screen.getByPlaceholderText('201, Oficina 3…'), '105');

    await user.click(screen.getByRole('button', { name: 'Registrar entrada' }));

    const mensajes = await screen.findAllByText(/Revísalo antes de registrar la entrada/i);
    expect(mensajes.length).toBeGreaterThan(0);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('sin marcar el consentimiento (Ley 21.719) no deja registrar, aunque el RUT sea válido', async () => {
    const user = userEvent.setup();
    render(<Visitas perfil={PERFIL} turno={{ id: 'turno-1' }} />);

    await user.click(screen.getAllByTitle('Registrar entrada')[0]);
    await user.type(screen.getByPlaceholderText('Juan Pérez'), 'Pedro Pérez');
    fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), { target: { value: '123456785' } });
    await user.type(screen.getByPlaceholderText('201, Oficina 3…'), '301');
    // consentimiento NO se marca a propósito

    await user.click(screen.getByRole('button', { name: 'Registrar entrada' }));

    const mensajes = await screen.findAllByText(/consiente el registro de sus datos/i);
    expect(mensajes.length).toBeGreaterThan(0);
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
