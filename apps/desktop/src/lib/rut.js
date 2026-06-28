// Utilidades de RUT chileno: limpieza, formateo automático y validación de dígito verificador.

export function limpiarRut(valor) {
  return valor.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function calcularDV(cuerpo) {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

// Formatea mientras se escribe: 12345678K -> 12.345.678-K
export function formatearRut(valor) {
  const limpio = limpiarRut(valor);
  if (limpio.length === 0) return '';
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (cuerpo.length === 0) return dv;
  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoConPuntos}-${dv}`;
}

// null = aún incompleto (no mostrar feedback), true/false = válido o inválido
export function validarRut(valor) {
  const limpio = limpiarRut(valor);
  if (limpio.length < 2) return null;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (cuerpo.length < 7) return null;
  return calcularDV(cuerpo) === dv;
}
