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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-muted text-sm">Cargando Portia…</span>
        </div>
      </div>
    );
  }

  if (!session || !perfil) {
    return <Login onLogin={cargarPerfil} />;
  }

  return <Dashboard session={session} perfil={perfil} />;
}
