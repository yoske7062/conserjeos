'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = getSupabase();
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) { setError('Credenciales incorrectas.'); setLoading(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
    if (perfil?.rol !== 'admin') {
      await supabase.auth.signOut();
      setError('Tu cuenta no tiene acceso al panel de administración.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  }

  const input = {
    width: '100%', height: 48, background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '0 14px', color: 'var(--text)', fontSize: 15,
    fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'rgba(var(--brand-rgb),0.12)',
            border: '1px solid rgba(var(--brand-rgb),0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 26, color: 'var(--brand)' }}>admin_panel_settings</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Panel de administración</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Ingresa con tu cuenta de administrador</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Email</label>
            <input type="email" style={input} placeholder="admin@edificio.cl" value={email}
              onChange={e => setEmail(e.target.value)} required autoFocus
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Contraseña</label>
            <input type="password" style={input} placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} required
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(229,72,77,0.1)', borderLeft: '3px solid var(--error)', borderRadius: '0 8px 8px 0', padding: '11px 14px' }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: 'var(--error)' }}>error</span>
              <span style={{ fontSize: 13, color: '#FF8A8A' }}>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            height: 48, background: 'var(--brand)', border: 'none', borderRadius: 10,
            color: 'var(--brand-text-on)', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'inherit', marginTop: 4,
          }}>
            {loading
              ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Ingresando…</>
              : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
