'use server';

import { getSupabaseServiceRole } from '../../../lib/supabase';

export async function invitarConserjeAction(email, nombre, edificioId) {
  if (!email || !nombre || !edificioId) {
    return { error: 'Nombre, email y edificio son obligatorios.' };
  }

  try {
    const supabase = getSupabaseServiceRole();

    // Invite the user using the Service Role Admin client
    const { data: authData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        rol: 'conserje',
        edificio_id: edificioId,
      }
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
