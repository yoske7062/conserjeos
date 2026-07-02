// Logger mínimo con niveles y redacción de datos sensibles.
// Objetivo: poder responder qué falló, cuándo y en qué módulo, sin filtrar
// datos personales (RUT, nombres) a la consola ni a un futuro sink remoto.

const NIVELES = { debug: 10, info: 20, warn: 30, error: 40 };
const nivelActual = import.meta.env.DEV ? NIVELES.debug : NIVELES.info;

// Claves que nunca deben aparecer en un log, aunque vengan dentro de un objeto.
const CLAVES_SENSIBLES = ['rut', 'rut_visitante', 'nombre', 'nombre_visitante', 'password', 'token', 'anon_key', 'service_role'];

function redactar(valor) {
  if (valor == null) return valor;
  if (Array.isArray(valor)) return valor.map(redactar);
  if (typeof valor === 'object') {
    const limpio = {};
    for (const [k, v] of Object.entries(valor)) {
      limpio[k] = CLAVES_SENSIBLES.includes(k.toLowerCase()) ? '«redactado»' : redactar(v);
    }
    return limpio;
  }
  return valor;
}

function emitir(nivel, modulo, mensaje, contexto) {
  if (NIVELES[nivel] < nivelActual) return;
  const linea = {
    ts: new Date().toISOString(),
    nivel,
    modulo,
    mensaje,
    ...(contexto ? { ctx: redactar(contexto) } : {}),
  };
  const fn = nivel === 'error' ? console.error : nivel === 'warn' ? console.warn : console.log;
  fn(`[${linea.ts}] ${nivel.toUpperCase()} ${modulo}: ${mensaje}`, contexto ? linea.ctx : '');
}

export function crearLogger(modulo) {
  return {
    debug: (msg, ctx) => emitir('debug', modulo, msg, ctx),
    info:  (msg, ctx) => emitir('info',  modulo, msg, ctx),
    warn:  (msg, ctx) => emitir('warn',  modulo, msg, ctx),
    error: (msg, ctx) => emitir('error', modulo, msg, ctx),
  };
}
