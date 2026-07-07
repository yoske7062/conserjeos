'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../../lib/supabase';
import { PerfilContext } from '../../lib/perfil-context';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('perfiles').select('*, edificios(nombre)').eq('id', user.id).single();
      if (!data || data.rol !== 'admin') { router.push('/login'); return; }
      setPerfil(data);
      setLoading(false);
    }
    cargar();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <PerfilContext.Provider value={perfil}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Sidebar perfil={perfil} />
        <main style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {children}
        </main>
      </div>
    </PerfilContext.Provider>
  );
}
