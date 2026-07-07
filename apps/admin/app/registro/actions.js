'use server';

import { headers } from 'next/headers';
import { randomUUID } from 'crypto';
import { crearCliente, registrarTarjeta } from '../../lib/flow';
import { getSupabaseServiceRole } from '../../lib/supabase';

export async function iniciarCheckout(formData) {
  const nombreEdificio = formData.get('nombreEdificio')?.toString().trim();
  const comuna = formData.get('comuna')?.toString().trim();
  const nombreAdmin = formData.get('nombreAdmin')?.toString().trim();
  const email = formData.get('email')?.toString().trim();

  if (!nombreEdificio || !nombreAdmin || !email) {
    return { error: 'Faltan datos obligatorios.' };
  }

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL
    ?? `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`;

  try {
    // externalId propio (no reutilizamos el email — un mismo admin podría
    // registrar más de un edificio a futuro).
    const cliente = await crearCliente({ name: nombreAdmin, email, externalId: randomUUID() });

    const service = getSupabaseServiceRole();
    const { error: insertError } = await service.from('registros_pendientes').insert({
      flow_customer_id: cliente.customerId,
      nombre_edificio: nombreEdificio,
      comuna: comuna || null,
      nombre_admin: nombreAdmin,
      email,
    });
    if (insertError) throw insertError;

    const registro = await registrarTarjeta({
      customerId: cliente.customerId,
      urlReturn: `${origin}/api/flow/callback`,
    });

    return { url: `${registro.url}?token=${registro.token}` };
  } catch (err) {
    console.error('Error iniciando registro de tarjeta en Flow:', err);
    return { error: 'No se pudo iniciar el pago. Intenta de nuevo en unos minutos.' };
  }
}
