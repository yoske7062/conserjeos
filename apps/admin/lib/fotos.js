import { getSupabase } from './supabase';

const PUBLIC_URL_MARKER = '/storage/v1/object/public/fotos/';

// foto_url históricamente guardaba la URL pública completa (bucket público).
// Tras pasar el bucket 'fotos' a privado, las filas nuevas guardan solo el
// path. Esto deja leer fotos antiguas sin necesitar una migración de datos.
function toPath(value) {
  if (!value) return null;
  const i = value.indexOf(PUBLIC_URL_MARKER);
  return i === -1 ? value : value.slice(i + PUBLIC_URL_MARKER.length);
}

export async function getSignedFotoUrl(value, expiresIn = 3600) {
  const path = toPath(value);
  if (!path) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from('fotos').createSignedUrl(path, expiresIn);
  return error ? null : data.signedUrl;
}
