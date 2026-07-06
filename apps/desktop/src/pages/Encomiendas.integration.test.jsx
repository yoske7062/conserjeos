import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mismo patrón que Visitas.integration.test.jsx: monta la página completa y
// simula al conserje escribiendo, en vez de llamar funciones aisladas.
const mockInsert = vi.fn();
const mockUpdate = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
const FIXTURE = [{
  id: 'enc-1', edificio_id: 'edif-los-castanos', conserje_id: 'conserje-1', turno_id: 'turno-1',
  tipo: 'paquete', remitente: 'Falabella', destinatario: 'Pedro Soto', depto: '501',
  foto_url: null, entregada: false, recibida_at: new Date().toISOString(),
}];
const mockSelectChain = {
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue({ data: FIXTURE }),
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
vi.mock('../lib/offlineQueue.js', () => ({ enqueue: vi.fn(), fileToBase64: vi.fn() }));

import Encomiendas from './Encomiendas.jsx';

const PERFIL = { id: 'conserje-1', edificio_id: 'edif-los-castanos', rol: 'conserje' };

beforeEach(() => {
  mockInsert.mockReset();
  mockUpdate.mockClear();
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
});

describe('Encomiendas — registrar ingreso (integración)', () => {
  it('conserje registra un paquete con destinatario y depto', async () => {
    mockInsert.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<Encomiendas perfil={PERFIL} turno={{ id: 'turno-1' }} />);

    await waitFor(() => expect(screen.getByText('Pedro Soto')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: '+ Registrar ingreso' }));
    await user.type(screen.getByPlaceholderText('Nombre del residente'), 'Ximena Rodríguez');
    await user.type(screen.getByPlaceholderText('201'), '104');
    await user.type(screen.getByPlaceholderText('Falabella, Rappi, Jumbo…'), 'Amazon');

    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
    const payload = mockInsert.mock.calls[0][0];
    expect(payload.tipo).toBe('paquete');
    expect(payload.destinatario).toBe('Ximena Rodríguez');
    expect(payload.depto).toBe('104');
    expect(payload.remitente).toBe('Amazon');
    expect(payload.edificio_id).toBe('edif-los-castanos');
    expect(payload.conserje_id).toBe('conserje-1');
    expect(payload.turno_id).toBe('turno-1');
    expect(payload.foto_url).toBeNull();
  });

  it('marcar tipo "comida" avisa que es perecible antes de enviar', async () => {
    const user = userEvent.setup();
    render(<Encomiendas perfil={PERFIL} turno={{ id: 'turno-1' }} />);

    await waitFor(() => expect(screen.getByText('Pedro Soto')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: '+ Registrar ingreso' }));

    await user.click(screen.getByTitle('Rappi, Uber Eats, PedidosYa, DiDi Food'));

    expect(screen.getByText(/Perecible — avisa al residente/i)).toBeInTheDocument();
  });

  it('registrar quién retira marca la encomienda como entregada', async () => {
    const user = userEvent.setup();
    render(<Encomiendas perfil={PERFIL} turno={{ id: 'turno-1' }} />);

    await waitFor(() => expect(screen.getByText('Pedro Soto')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Marcar entregada/ }));
    await user.type(screen.getByPlaceholderText('Nombre completo'), 'Pedro Soto');
    await user.click(screen.getByRole('button', { name: 'Confirmar entrega' }));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    const payload = mockUpdate.mock.calls[0][0];
    expect(payload.entregada).toBe(true);
    expect(payload.retirado_por).toBe('Pedro Soto');
    expect(payload.retirado_tipo).toBe('residente');
  });
});
