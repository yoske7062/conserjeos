'use server';

import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { registrarTarjeta } from '../../lib/flow';
import { getSupabaseServiceRole } from '../../lib/supabase';

// Flow no tiene un Billing Portal hospedado como Stripe — lo más parecido
// es volver a correr el registro de tarjeta (customer/register), que
// reemplaza la tarjeta guardada del cliente.
export async function actualizarMetodoDePago() {
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
  if (error || !user) return { error: 'No autorizado.' };

  const { data: perfil } = await supabase.from('perfiles').select('edificio_id, rol').eq('id', user.id).single();
  if (perfil?.rol !== 'admin') return { error: 'No autorizado.' };

  const service = getSupabaseServiceRole();
  const { data: edificio } = await service.from('edificios').select('stripe_customer_id').eq('id', perfil.edificio_id).single();
  if (!edificio?.stripe_customer_id) return { error: 'Este edificio no tiene una suscripción asociada.' };

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL
    ?? `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`;

  try {
    const registro = await registrarTarjeta({
      customerId: edificio.stripe_customer_id,
      urlReturn: `${origin}/api/flow/actualizar-tarjeta-callback`,
    });
    return { url: `${registro.url}?token=${registro.token}` };
  } catch (err) {
    console.error('Error iniciando actualización de tarjeta en Flow:', err);
    return { error: 'No se pudo abrir la actualización de método de pago. Intenta de nuevo.' };
  }
}
