import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) cargarPerfil(data.session.user.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) cargarPerfil(session.user.id);
      else { setPerfil(null); setLoading(false); }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function cargarPerfil(userId) {
    const { data } = await supabase
      .from('perfiles')
      .select('*, edificios(nombre, comuna)')
      .eq('id', userId)
      .single();
    setPerfil(data);
    setLoading(false);
  }

  const content = (() => {
    if (loading) return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 34, height: 34, border: '2px solid rgba(27,42,74,0.12)', borderTopColor: '#1B2A4A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#B4B0A9', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Cargando Portia…</span>
        </div>
      </div>
    );
    if (!session || !perfil) return <Login onLogin={cargarPerfil} />;
    return <Dashboard session={session} perfil={perfil} />;
  })();

  return (
    <>
      <div className="drag-region" />
      {content}
    </>
  );
}
