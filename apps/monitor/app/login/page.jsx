'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../../lib/supabase';
import { verificarEmail, crearPassword } from './actions';

const MIN_PASSWORD = 8;

export default function LoginPage() {
  const router = useRouter();
  const [fase, setFase] = useState('email'); // email | crear | password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function siguientePaso(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await verificarEmail(email);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setFase(res.estado === 'nueva' ? 'crear' : 'password');
  }

  async function crearYEntrar(e) {
    e.preventDefault();
    setError('');
    if (password.length < MIN_PASSWORD) { setError(`Mínimo ${MIN_PASSWORD} caracteres.`); return; }
    if (password !== confirmar) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    const res = await crearPassword(email, password);
    if (res.error) { setError(res.error); setLoading(false); return; }
    await entrarConPassword();
  }

  async function entrar(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await entrarConPassword();
  }

  async function entrarConPassword() {
    const supabase = getSupabase();
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authErr) { setError('Contraseña incorrecta.'); return; }
    router.push('/');
    router.refresh();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <form
        onSubmit={fase === 'email' ? siguientePaso : fase === 'crear' ? crearYEntrar : entrar}
        style={{ width: '100%', maxWidth: 340, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 32 }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Monitor Portia</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Acceso interno — solo equipo Portia.</p>

        {error && <p style={{ fontSize: 13, color: 'var(--crit-tx)', marginBottom: 14 }}>{error}</p>}

        {fase === 'email' && (
          <>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', height: 44, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', marginBottom: 20, fontSize: 15, fontFamily: 'inherit' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', height: 44, background: 'var(--brand)', color: 'var(--brand-text-on)', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {loading ? '...' : 'Continuar'}
            </button>
          </>
        )}

        {fase === 'crear' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Primera vez con <strong>{email}</strong> — crea tu contraseña.</p>
            <input type="password" required autoFocus value={password} onChange={e => setPassword(e.target.value)}
              placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
              style={{ width: '100%', height: 44, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', marginBottom: 10, fontSize: 15, fontFamily: 'inherit' }} />
            <input type="password" required value={confirmar} onChange={e => setConfirmar(e.target.value)}
              placeholder="Repite la contraseña"
              style={{ width: '100%', height: 44, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', marginBottom: 20, fontSize: 15, fontFamily: 'inherit' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', height: 44, background: 'var(--brand)', color: 'var(--brand-text-on)', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {loading ? '...' : 'Crear y entrar'}
            </button>
          </>
        )}

        {fase === 'password' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{email}</p>
            <input type="password" required autoFocus value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              style={{ width: '100%', height: 44, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', marginBottom: 20, fontSize: 15, fontFamily: 'inherit' }} />
            <button type="submit" disabled={loading} style={{ width: '100%', height: 44, background: 'var(--brand)', color: 'var(--brand-text-on)', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {loading ? '...' : 'Entrar'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
