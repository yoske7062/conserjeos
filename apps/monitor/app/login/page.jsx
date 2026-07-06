'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [fase, setFase] = useState('email'); // email | codigo
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function enviarCodigo(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = getSupabase();
    // shouldCreateUser: false — el acceso interno lo controla la allowlist
    // del middleware, no se crea gente nueva solo por escribir un email.
    const { error: authErr } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    if (authErr) {
      const msg = authErr.status === 429 || authErr.code === 'over_email_send_rate_limit'
        ? 'Se enviaron demasiados correos en poco tiempo. Espera unos minutos e intenta de nuevo.'
        : 'No se pudo enviar el código. ¿Tu email está en la allowlist interna?';
      setError(msg);
      setLoading(false);
      return;
    }
    setFase('codigo');
    setLoading(false);
  }

  async function verificarCodigo(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = getSupabase();
    const { error: authErr } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'email' });
    if (authErr) { setError('Código incorrecto o vencido.'); setLoading(false); return; }
    router.push('/');
    router.refresh();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <form onSubmit={fase === 'email' ? enviarCodigo : verificarCodigo} style={{ width: '100%', maxWidth: 340, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 32 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Monitor Portia</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Acceso interno — solo equipo Portia.</p>

        {error && <p style={{ fontSize: 13, color: 'var(--crit-tx)', marginBottom: 14 }}>{error}</p>}

        {fase === 'email' && (
          <>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', height: 44, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', marginBottom: 20, fontSize: 15, fontFamily: 'inherit' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', height: 44, background: 'var(--brand)', color: 'var(--brand-text-on)', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {loading ? '...' : 'Enviar código'}
            </button>
          </>
        )}

        {fase === 'codigo' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Te mandamos un código a <strong>{email}</strong>.</p>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Código</label>
            <input type="text" inputMode="numeric" required autoFocus value={codigo} onChange={e => setCodigo(e.target.value)}
              placeholder="123456"
              style={{ width: '100%', height: 44, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', marginBottom: 20, fontSize: 15, fontFamily: 'inherit', letterSpacing: '0.15em' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', height: 44, background: 'var(--brand)', color: 'var(--brand-text-on)', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {loading ? '...' : 'Entrar'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
