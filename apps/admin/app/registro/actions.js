'use server';

import { headers } from 'next/headers';
import { getStripe } from '../../lib/stripe';

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
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID_MENSUAL, quantity: 1 }],
      customer_email: email,
      // El webhook lee esto para crear el edificio + el admin — nunca confiar
      // en datos que vengan del cliente después del pago, solo en esto.
      metadata: { nombre_edificio: nombreEdificio, comuna: comuna || '', nombre_admin: nombreAdmin },
      subscription_data: {
        metadata: { nombre_edificio: nombreEdificio, comuna: comuna || '', nombre_admin: nombreAdmin },
      },
      success_url: `${origin}/registro/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/registro`,
    });
    return { url: session.url };
  } catch (err) {
    console.error('Error creando Checkout Session:', err);
    return { error: 'No se pudo iniciar el pago. Intenta de nuevo en unos minutos.' };
  }
}
