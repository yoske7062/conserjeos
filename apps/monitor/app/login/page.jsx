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
    if (authErr) { setError('Email o contraseña incorrectos.'); setLoading(false); return; }
    router.push('/');
    router.refresh();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 340, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 32 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Monitor Portia</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Acceso interno — solo equipo Portia.</p>

        {error && <p style={{ fontSize: 13, color: 'var(--crit-tx)', marginBottom: 14 }}>{error}</p>}

        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', height: 44, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', marginBottom: 14, fontSize: 15, fontFamily: 'inherit' }} />

        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contraseña</label>
        <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', height: 44, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', marginBottom: 20, fontSize: 15, fontFamily: 'inherit' }} />

        <button type="submit" disabled={loading} style={{ width: '100%', height: 44, background: 'var(--brand)', color: 'var(--brand-text-on)', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? '...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
