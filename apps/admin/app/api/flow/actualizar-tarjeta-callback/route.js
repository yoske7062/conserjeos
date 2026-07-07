import { NextResponse } from 'next/server';

// La tarjeta ya se actualiza en Flow directamente (mismo customerId) —
// acá no hay nada que crear, solo devolver al dashboard.
export async function POST() {
  return new Response('ok', { status: 200 });
}

export async function GET(request) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/dashboard`);
}
