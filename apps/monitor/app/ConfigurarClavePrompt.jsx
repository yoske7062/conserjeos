'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';

const MIN_PASSWORD = 8;

// Login es solo con código por email (sin password) — esto es opcional,
// por si alguien prefiere entrar con clave más adelante.
export default function ConfigurarClavePrompt() {
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (data.user && data.user.user_metadata?.password_set !== true) setVisible(true);
    });
  }, []);

  if (!visible) return null;

  async function guardar(e) {
    e.preventDefault();
    setError('');
    if (password.length < MIN_PASSWORD) { setError(`Mínimo ${MIN_PASSWORD} caracteres.`); return; }
    if (password !== confirmar) { setError('Las contraseñas no coinciden.'); return; }
    setGuardando(true);
    const supabase = getSupabase();
    const { error: err } = await supabase.auth.updateUser({ password, data: { password_set: true } });
    if (err) { setError('No se pudo guardar. Intenta de nuevo.'); setGuardando(false); return; }
    setOk(true);
    setTimeout(() => setVisible(false), 1600);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
        {ok ? (
          <p style={{ fontSize: 14, color: 'var(--text)' }}>Contraseña configurada.</p>
        ) : (
          <form onSubmit={guardar}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Configura una contraseña</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.5 }}>
              Opcional — hoy entras con código por email. Si prefieres, define una clave para más adelante.
            </p>
            <input type="password" value={password} autoFocus onChange={e => setPassword(e.target.value)}
              placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
              style={{ width: '100%', height: 42, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', marginBottom: 10, fontSize: 14, fontFamily: 'inherit' }} />
            <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)}
              placeholder="Repite la contraseña"
              style={{ width: '100%', height: 42, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', marginBottom: 14, fontSize: 14, fontFamily: 'inherit' }} />
            {error && <p style={{ fontSize: 12.5, color: 'var(--crit-tx)', marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setVisible(false)} style={{
                flex: 1, height: 40, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text-muted)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>Ahora no</button>
              <button type="submit" disabled={guardando} style={{
                flex: 1, height: 40, background: 'var(--brand)', border: 'none', borderRadius: 8,
                color: 'var(--brand-text-on)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>{guardando ? '...' : 'Guardar'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
