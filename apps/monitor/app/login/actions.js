'use server';
import { getSupabaseServiceRole } from '../../lib/supabase';

const MIN_PASSWORD = 8;

function esEquipoInterno(email) {
  const permitidos = (process.env.INTERNAL_TEAM_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return permitidos.includes((email ?? '').toLowerCase());
}

async function buscarUsuario(service, email) {
  // El admin API de Supabase no tiene "getUserByEmail" directo — se pagina
  // y se filtra. Aceptable acá: la allowlist de founders son 1-2 emails,
  // esto nunca corre para el resto de los usuarios del sistema.
  const { data, error } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find(u => u.email?.toLowerCase() === email) ?? null;
}

export async function verificarEmail(email) {
  const limpio = (email ?? '').trim().toLowerCase();
  if (!esEquipoInterno(limpio)) return { error: 'Ese correo no tiene acceso al Monitor.' };

  const service = getSupabaseServiceRole();
  try {
    const user = await buscarUsuario(service, limpio);
    if (!user || user.user_metadata?.password_set !== true) return { estado: 'nueva' };
    return { estado: 'existente' };
  } catch (err) {
    console.error('verificarEmail:', err);
    return { error: 'No se pudo verificar el correo. Intenta de nuevo.' };
  }
}

export async function crearPassword(email, password) {
  const limpio = (email ?? '').trim().toLowerCase();
  if (!esEquipoInterno(limpio)) return { error: 'Ese correo no tiene acceso al Monitor.' };
  if (!password || password.length < MIN_PASSWORD) return { error: `Mínimo ${MIN_PASSWORD} caracteres.` };

  const service = getSupabaseServiceRole();
  try {
    const existente = await buscarUsuario(service, limpio);
    if (existente) {
      const { error } = await service.auth.admin.updateUserById(existente.id, {
        password,
        user_metadata: { ...existente.user_metadata, password_set: true },
      });
      if (error) throw error;
    } else {
      const { error } = await service.auth.admin.createUser({
        email: limpio,
        password,
        email_confirm: true,
        user_metadata: { password_set: true },
      });
      if (error) throw error;
    }
    return { ok: true };
  } catch (err) {
    console.error('crearPassword:', err);
    return { error: 'No se pudo guardar la contraseña. Intenta de nuevo.' };
  }
}
