'use server';

import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseServiceRole } from '../../../lib/supabase';

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(list) {
          try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
  return perfil?.rol === 'admin' ? user : null;
}

export async function invitarConserjeAction(email, nombre, edificioId) {
  if (!email || !nombre || !edificioId) {
    return { error: 'Nombre, email y edificio son obligatorios.' };
  }

  const caller = await requireAdmin();
  if (!caller) return { error: 'No autorizado.' };

  try {
    const supabase = getSupabaseServiceRole();

    // El link del correo debe aterrizar en la página de establecer contraseña.
    // Esa URL tiene que estar en la allowlist de Supabase (Auth → URL Configuration).
    const h = await headers();
    const origin = process.env.NEXT_PUBLIC_SITE_URL
      ?? `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`;

    const { data: authData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        rol: 'conserje',
        edificio_id: edificioId,
      },
      redirectTo: `${origin}/auth/establecer-password`,
    });

    if (inviteError) {
      return { error: inviteError.message };
    }

    // Now insert the record into public.perfiles
    // ID from authData.user.id
    const { error: profileError } = await supabase.from('perfiles').insert({
      id: authData.user.id,
      edificio_id: edificioId,
      nombre: nombre,
      email: email,
      rol: 'conserje',
      activo: true
    });

    if (profileError) {
      console.error('Error inserting profile for invited user:', profileError);
      return { error: `Invitación enviada pero no se pudo crear el perfil: ${profileError.message}` };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in invitarConserjeAction:', err);
    return { error: err.message || 'Ocurrió un error inesperado al invitar al conserje.' };
  }
}
