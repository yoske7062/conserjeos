'use server';

import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getStripe } from '../../lib/stripe';
import { getSupabaseServiceRole } from '../../lib/supabase';

export async function crearSesionBillingPortal() {
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

  // service role acá porque stripe_customer_id no está expuesto por RLS al
  // cliente (no hace falta que un admin cualquiera vea la columna directo).
  const service = getSupabaseServiceRole();
  const { data: edificio } = await service.from('edificios').select('stripe_customer_id').eq('id', perfil.edificio_id).single();
  if (!edificio?.stripe_customer_id) return { error: 'Este edificio no tiene una suscripción de Stripe asociada.' };

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL
    ?? `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`;

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: edificio.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    });
    return { url: session.url };
  } catch (err) {
    console.error('Error creando sesión del Billing Portal:', err);
    return { error: 'No se pudo abrir la gestión de suscripción. Intenta de nuevo.' };
  }
}
