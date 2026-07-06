import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

function esEquipoInterno(email) {
  const permitidos = (process.env.INTERNAL_TEAM_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  return permitidos.includes((email ?? '').toLowerCase());
}

// Esta app entera es privada — a diferencia de admin, acá no hay ninguna
// ruta pensada para clientes. Todo lo que no sea /login queda detrás del
// gate de sesión + allowlist de email.
export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (pathname === '/login') {
    if (user && esEquipoInterno(user.email)) return NextResponse.redirect(new URL('/', request.url));
    return response;
  }

  if (!user || !esEquipoInterno(user.email)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/', '/login'],
};
