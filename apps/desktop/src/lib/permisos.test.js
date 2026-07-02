import { describe, it, expect } from 'vitest';
import { puedeCrearTareas } from './permisos.js';

describe('puedeCrearTareas', () => {
  it('admin puede', () => {
    expect(puedeCrearTareas({ rol: 'admin', nombre: 'Catalina Andrade' })).toBe(true);
  });

  it('conserje no puede (la RLS también lo bloquea en el server)', () => {
    expect(puedeCrearTareas({ rol: 'conserje', nombre: 'Luis Soto Fuentes' })).toBe(false);
  });

  it('sin perfil cargado no puede', () => {
    expect(puedeCrearTareas(null)).toBe(false);
    expect(puedeCrearTareas(undefined)).toBe(false);
  });
});
