'use client';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../lib/supabase';

export default function LogoutButton() {
  const router = useRouter();
  async function salir() {
    await getSupabase().auth.signOut();
    router.push('/login');
    router.refresh();
  }
  return (
    <button onClick={salir} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
      Cerrar sesión
    </button>
  );
}
