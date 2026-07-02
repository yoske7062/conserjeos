import { describe, it, expect } from 'vitest';
import { clasificarError } from './errores.js';

describe('clasificarError', () => {
  it('red caída: fetch falla', () => {
    const { codigo } = clasificarError({ message: 'TypeError: Failed to fetch' });
    expect(codigo).toBe('sin-conexion');
  });

  it('sesión expirada: 401 de auth', () => {
    const { codigo } = clasificarError({ status: 401, message: 'Invalid token' });
    expect(codigo).toBe('sesion-expirada');
  });

  it('sesión expirada: PGRST301 (JWT vencido en PostgREST)', () => {
    const { codigo } = clasificarError({ code: 'PGRST301', message: 'JWT expired' });
    expect(codigo).toBe('sesion-expirada');
  });

  it('RLS deniega la operación', () => {
    const { codigo } = clasificarError({ code: '42501', message: 'permission denied for table tareas' });
    expect(codigo).toBe('sin-permiso');
  });

  it('registro duplicado', () => {
    const { codigo } = clasificarError({ code: '23505', message: 'duplicate key value' });
    expect(codigo).toBe('duplicado');
  });

  it('dato inválido: not null violation', () => {
    const { codigo } = clasificarError({ code: '23502', message: 'null value in column "nombre_visitante"' });
    expect(codigo).toBe('dato-invalido');
  });

  it('dato inválido: check constraint (retirado_tipo fuera de rango)', () => {
    const { codigo } = clasificarError({ code: '23514', message: 'violates check constraint' });
    expect(codigo).toBe('dato-invalido');
  });

  it('error sin clasificar cae en desconocido', () => {
    const { codigo } = clasificarError({ message: 'algo raro' });
    expect(codigo).toBe('desconocido');
  });

  it('el mensaje al usuario incluye el código para poder reportarlo', () => {
    const { mensaje } = clasificarError({ code: '42501', message: 'permission denied' });
    expect(mensaje).toContain('(sin-permiso)');
  });
});
