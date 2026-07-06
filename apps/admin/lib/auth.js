import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Chequeo de rol admin del lado del servidor — única fuente de verdad,
// usar en cualquier server action nueva en vez de copiar este código.
export async function requireAdmin() {
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
