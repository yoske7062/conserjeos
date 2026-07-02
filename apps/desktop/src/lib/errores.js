import { crearLogger } from './logger';

const log = crearLogger('errores');

// Códigos estables para diagnóstico remoto. El usuario ve el mensaje;
// el código viaja en el log y en el sufijo entre paréntesis para poder
// pedirle "¿qué código te apareció?" sin acceso a su consola.
const MENSAJES = {
  'sin-conexion':    'Sin conexión con el servidor. Revisa internet e intenta de nuevo.',
  'sesion-expirada': 'Tu sesión expiró. Cierra sesión y vuelve a entrar.',
  'sin-permiso':     'No tienes permiso para hacer esto.',
  'duplicado':       'Este registro ya existe.',
  'dato-invalido':   'Hay un dato inválido o incompleto en el formulario.',
  'desconocido':     'Algo falló. Intenta de nuevo.',
};

function codigoDe(error) {
  // Comparación estricta: en Node (tests) navigator existe pero onLine es
  // undefined, y eso no significa estar offline.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 'sin-conexion';
  if (!error) return 'desconocido';

  const msg = String(error.message ?? '');
  if (/fetch|network|failed to fetch/i.test(msg)) return 'sin-conexion';

  // AuthError trae status; PostgREST devuelve PGRST301 cuando el JWT expiró.
  if (error.status === 401 || error.code === 'PGRST301' || /jwt/i.test(msg)) return 'sesion-expirada';

  const pg = String(error.code ?? '');
  if (pg === '42501') return 'sin-permiso';            // RLS / privilegios
  if (pg === '23505') return 'duplicado';              // unique violation
  if (/^(22|23)/.test(pg)) return 'dato-invalido';     // datos: not null, FK, check, formato

  return 'desconocido';
}

// Devuelve { codigo, mensaje } listo para mostrar, y deja el detalle en el log.
export function clasificarError(error, contexto) {
  const codigo = codigoDe(error);
  log.error(MENSAJES[codigo], {
    codigo,
    contexto,
    detalle: error?.message,
    pg_code: error?.code,
    status: error?.status,
  });
  return { codigo, mensaje: `${MENSAJES[codigo]} (${codigo})` };
}
