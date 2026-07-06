'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '../../../lib/supabase';

// Aterrizaje del correo de invitación (inviteUserByEmail → redirectTo).
// El link de Supabase puede llegar con la sesión en el hash (#access_token)
// o como código PKCE (?code=); se cubren ambos. Página funcional — el
// diseño definitivo es de James.

const MIN_PASSWORD = 8;

export default function EstablecerPasswordPage() {
  const [fase, setFase] = useState('verificando'); // verificando | listo | invalido | exito
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    let activo = true;

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (activo && session) setFase('listo');
    });

    async function verificar() {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (activo && !exErr) { setFase('listo'); return; }
      }
      const { data } = await supabase.auth.getSession();
      if (activo && data.session) setFase('listo');
    }
    verificar();

    // Si en 8s no apareció sesión (link vencido, ya usado, o URL manipulada), se avisa.
    const timeout = setTimeout(() => {
      if (activo) setFase(f => (f === 'verificando' ? 'invalido' : f));
    }, 8000);

    return () => { activo = false; clearTimeout(timeout); listener.subscription.unsubscribe(); };
  }, []);

  async function guardar(e) {
    e.preventDefault();
    setError('');
    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setGuardando(true);
    const supabase = getSupabase();
    const { error: updErr } = await supabase.auth.updateUser({ password });
    if (updErr) {
      setError('No se pudo guardar la contraseña. El link puede haber vencido — pide una invitación nueva.');
      setGuardando(false);
      return;
    }
    // La cuenta queda lista para el desktop; no dejamos sesión de conserje viva en el navegador.
    await supabase.auth.signOut();
    setFase('exito');
  }

  const inputStyle = {
    width: '100%', height: 50, background: '#fff', border: '1.5px solid rgba(10,10,10,0.12)',
    borderRadius: 10, padding: '0 16px', color: '#0A0A0A', fontSize: 15,
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#FFFFFF', fontFamily: "'Inter', system-ui, sans-serif", padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#000000', marginBottom: 8 }}>
          Bienvenido a Portia
        </h1>

        {fase === 'verificando' && (
          <p style={{ fontSize: 14, color: 'rgba(15,23,42,0.5)' }}>Verificando tu invitación…</p>
        )}

        {fase === 'invalido' && (
          <p style={{ fontSize: 14, color: '#B42318', lineHeight: 1.5 }}>
            Este link de invitación no es válido o ya venció.
            Pide al administrador que te envíe una invitación nueva.
          </p>
        )}

        {fase === 'listo' && (
          <form onSubmit={guardar}>
            <p style={{ fontSize: 14, color: 'rgba(15,23,42,0.5)', marginBottom: 20, lineHeight: 1.5 }}>
              Crea la contraseña que usarás para entrar a Portia en el equipo de conserjería.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="password" value={password} autoFocus
                onChange={e => setPassword(e.target.value)}
                placeholder={`Contraseña (mínimo ${MIN_PASSWORD} caracteres)`}
                style={inputStyle}
              />
              <input
                type="password" value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                placeholder="Repite la contraseña"
                style={inputStyle}
              />
              {error && <p style={{ fontSize: 13, color: '#B42318' }}>{error}</p>}
              <button type="submit" disabled={guardando} style={{
                height: 50, width: '100%', background: '#0A0A0A', border: 'none', borderRadius: 10,
                color: '#fff', fontSize: 15, fontWeight: 600, cursor: guardando ? 'default' : 'pointer',
                opacity: guardando ? 0.6 : 1,
              }}>
                {guardando ? 'Guardando…' : 'Crear contraseña'}
              </button>
            </div>
          </form>
        )}

        {fase === 'exito' && (
          <p style={{ fontSize: 14, color: '#000000', lineHeight: 1.6 }}>
            Contraseña creada. Abre <strong>Portia</strong> en el equipo de conserjería
            y entra con tu email y la contraseña que acabas de crear.
            Ya puedes cerrar esta ventana.
          </p>
        )}
      </div>
    </div>
  );
}
