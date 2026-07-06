import { getStripe } from '../../../../lib/stripe';
import { getSupabaseServiceRole } from '../../../../lib/supabase';

// Nunca confiar en el body sin verificar la firma — cualquiera podría
// mandar un POST fingiendo ser Stripe y crear edificios/admins gratis.
async function verificarEvento(request) {
  const stripe = getStripe();
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

async function crearEdificioYAdmin(session) {
  const service = getSupabaseServiceRole();
  const { nombre_edificio, comuna, nombre_admin } = session.metadata ?? {};
  const email = session.customer_details?.email ?? session.customer_email;

  if (!nombre_edificio || !nombre_admin || !email) {
    console.error('Webhook Stripe: checkout.session.completed sin metadata esperada', session.id);
    return;
  }

  // Idempotencia — Stripe puede reintentar el mismo evento.
  const { data: existente } = await service.from('edificios')
    .select('id').eq('stripe_customer_id', session.customer).maybeSingle();
  if (existente) {
    console.warn('Webhook Stripe: edificio ya existe para este customer, se ignora', session.customer);
    return;
  }

  const { data: edificio, error: edificioError } = await service.from('edificios').insert({
    nombre: nombre_edificio,
    comuna: comuna || null,
    plan: 'pagado',
    activo: true,
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription,
    subscription_status: 'active',
  }).select().single();

  if (edificioError) {
    console.error('Webhook Stripe: no se pudo crear el edificio', edificioError);
    throw edificioError;
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://admin.portia.cl';
  const { data: authData, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    data: { rol: 'admin', edificio_id: edificio.id },
    redirectTo: `${origin}/auth/establecer-password`,
  });

  if (inviteError) {
    console.error('Webhook Stripe: no se pudo invitar al admin', inviteError);
    throw inviteError;
  }

  const { error: perfilError } = await service.from('perfiles').insert({
    id: authData.user.id,
    edificio_id: edificio.id,
    nombre: nombre_admin,
    email,
    rol: 'admin',
    activo: true,
  });

  if (perfilError) {
    console.error('Webhook Stripe: edificio y auth.users creados pero falló perfiles', perfilError);
    throw perfilError;
  }
}

async function actualizarEstadoSuscripcion(subscription) {
  const service = getSupabaseServiceRole();
  const { error } = await service.from('edificios')
    .update({ subscription_status: subscription.status })
    .eq('stripe_subscription_id', subscription.id);
  if (error) console.error('Webhook Stripe: no se pudo actualizar subscription_status', error);
}

export async function POST(request) {
  let event;
  try {
    event = await verificarEvento(request);
  } catch (err) {
    console.error('Webhook Stripe: firma inválida', err.message);
    return new Response('Firma inválida', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await crearEdificioYAdmin(event.data.object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await actualizarEstadoSuscripcion(event.data.object);
        break;
      default:
        // Otros eventos de Stripe no nos interesan hoy — se ignoran a propósito.
        break;
    }
  } catch (err) {
    console.error('Webhook Stripe: error procesando el evento', event.type, err);
    // 500 le dice a Stripe que reintente el webhook más tarde.
    return new Response('Error procesando el evento', { status: 500 });
  }

  return new Response('ok', { status: 200 });
}
