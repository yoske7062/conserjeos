import { NextResponse } from 'next/server';
import { estadoRegistroTarjeta, crearSuscripcion } from '../../../../lib/flow';
import { getSupabaseServiceRole } from '../../../../lib/supabase';

// Flow llama esta URL de dos formas (ver "Notificaciones de Flow a su
// comercio" en la doc): un POST servidor-a-servidor con el token, y
// posiblemente el browser del usuario aterriza acá también tras terminar
// el registro de tarjeta. Ambos casos se manejan igual — procesar es
// idempotente (chequea si el customerId ya generó un edificio).
async function procesar(token) {
  const service = getSupabaseServiceRole();

  const estado = await estadoRegistroTarjeta({ token });
  if (estado.status !== '1') {
    console.warn('Flow callback: registro de tarjeta no exitoso', estado);
    return { ok: false };
  }

  const { data: pendiente } = await service.from('registros_pendientes')
    .select('*').eq('flow_customer_id', estado.customerId).maybeSingle();
  if (!pendiente) {
    console.error('Flow callback: no hay registro pendiente para customerId', estado.customerId);
    return { ok: false };
  }
  if (pendiente.procesado) return { ok: true }; // ya se procesó, idempotente

  const { data: existente } = await service.from('edificios')
    .select('id').eq('stripe_customer_id', estado.customerId).maybeSingle();
  if (existente) {
    await service.from('registros_pendientes').update({ procesado: true }).eq('id', pendiente.id);
    return { ok: true };
  }

  const planId = process.env.FLOW_PLAN_ID_MENSUAL;
  const suscripcion = await crearSuscripcion({ planId, customerId: estado.customerId });
  const subscriptionId = suscripcion.subscriptionId ?? suscripcion.id ?? null;
  if (!subscriptionId) {
    console.warn('Flow callback: no se pudo determinar el id de la suscripción, respuesta completa:', suscripcion);
  }

  const { data: edificio, error: edificioError } = await service.from('edificios').insert({
    nombre: pendiente.nombre_edificio,
    comuna: pendiente.comuna,
    plan: 'pagado',
    activo: true,
    stripe_customer_id: estado.customerId,
    stripe_subscription_id: subscriptionId,
    subscription_status: 'active',
  }).select().single();
  if (edificioError) { console.error('Flow callback: no se pudo crear el edificio', edificioError); throw edificioError; }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://admin.portia.cl';
  const { data: authData, error: inviteError } = await service.auth.admin.inviteUserByEmail(pendiente.email, {
    data: { rol: 'admin', edificio_id: edificio.id },
    redirectTo: `${origin}/auth/establecer-password`,
  });
  if (inviteError) { console.error('Flow callback: no se pudo invitar al admin', inviteError); throw inviteError; }

  const { error: perfilError } = await service.from('perfiles').insert({
    id: authData.user.id,
    edificio_id: edificio.id,
    nombre: pendiente.nombre_admin,
    email: pendiente.email,
    rol: 'admin',
    activo: true,
  });
  if (perfilError) { console.error('Flow callback: edificio y auth.users creados pero falló perfiles', perfilError); throw perfilError; }

  await service.from('registros_pendientes').update({ procesado: true }).eq('id', pendiente.id);
  return { ok: true };
}

export async function POST(request) {
  const form = await request.formData();
  const token = form.get('token');
  if (!token) return new Response('Falta token', { status: 400 });

  try {
    await procesar(token.toString());
    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Flow callback (POST): error procesando', err);
    return new Response('Error procesando el callback', { status: 500 });
  }
}

export async function GET(request) {
  const token = request.nextUrl.searchParams.get('token');
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  if (!token) return NextResponse.redirect(`${origin}/registro`);

  try {
    await procesar(token);
  } catch (err) {
    console.error('Flow callback (GET): error procesando', err);
  }
  return NextResponse.redirect(`${origin}/registro/exito`);
}
