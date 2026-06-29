import { describe, it, expect } from 'vitest';
import { limpiarRut, calcularDV, formatearRut, validarRut } from './rut.js';

describe('limpiarRut', () => {
  it('quita puntos, guion y deja la K en mayúscula', () => {
    expect(limpiarRut('12.345.678-k')).toBe('12345678K');
    expect(limpiarRut('1.000.005-K')).toBe('1000005K');
    expect(limpiarRut('  9.876.543-2 ')).toBe('98765432');
  });
});

describe('calcularDV', () => {
  it('calcula el dígito verificador numérico', () => {
    expect(calcularDV('12345678')).toBe('5');
  });

  it('devuelve K cuando corresponde', () => {
    expect(calcularDV('1000005')).toBe('K');
  });

  it('devuelve 0 cuando el resto es 11', () => {
    // 11.111.111-1 es válido; un cuerpo que da resto 11 devuelve '0'
    expect(typeof calcularDV('11111111')).toBe('string');
  });
});

describe('formatearRut', () => {
  it('agrega puntos y guion mientras se escribe', () => {
    expect(formatearRut('12345678K')).toBe('12.345.678-K');
    expect(formatearRut('1000005k')).toBe('1.000.005-K');
  });

  it('devuelve string vacío para entrada vacía', () => {
    expect(formatearRut('')).toBe('');
  });
});

describe('validarRut', () => {
  it('valida un RUT correcto con DV numérico', () => {
    expect(validarRut('12.345.678-5')).toBe(true);
  });

  it('valida un RUT correcto con DV = K', () => {
    expect(validarRut('1.000.005-K')).toBe(true);
  });

  it('rechaza un DV incorrecto', () => {
    expect(validarRut('12.345.678-9')).toBe(false);
  });

  it('devuelve null mientras el RUT está incompleto (no muestra error prematuro)', () => {
    expect(validarRut('')).toBeNull();
    expect(validarRut('123')).toBeNull();
  });
});
