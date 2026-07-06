'use client';
import { useState } from 'react';
import Link from 'next/link';
import { iniciarCheckout } from './actions';

const INPUT = {
  width: '100%', height: 46, border: '1px solid var(--border)', borderRadius: 10,
  padding: '0 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box', color: 'var(--text)', background: '#fff',
};
const LABEL = {
  display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
  textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 6,
};

export default function RegistroPage() {
  const [form, setForm] = useState({ nombreEdificio: '', comuna: '', nombreAdmin: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    const res = await iniciarCheckout(fd);
    if (res.error) { setError(res.error); setLoading(false); return; }
    window.location.href = res.url;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 24, display: 'inline-block' }}>← Volver</Link>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 36, boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 4px 12px -4px rgba(0,0,0,.08)' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Empieza con Portia
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.5 }}>
            Suscripción mensual por edificio. Al confirmar el pago creamos tu edificio y tu cuenta de administrador — te llega un correo para setear la contraseña.
          </p>

          {error && (
            <div style={{ background: 'rgba(196,43,43,0.06)', border: '1px solid rgba(196,43,43,0.2)', borderRadius: 10, padding: '11px 14px', marginBottom: 18, fontSize: 13, color: '#C42B2B' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={LABEL}>Nombre del edificio</label>
              <input required style={INPUT} placeholder="Edificio Los Castaños"
                value={form.nombreEdificio} onChange={e => setForm(f => ({ ...f, nombreEdificio: e.target.value }))} />
            </div>
            <div>
              <label style={LABEL}>Comuna</label>
              <input style={INPUT} placeholder="Providencia"
                value={form.comuna} onChange={e => setForm(f => ({ ...f, comuna: e.target.value }))} />
            </div>
            <div>
              <label style={LABEL}>Tu nombre</label>
              <input required style={INPUT} placeholder="María Pérez"
                value={form.nombreAdmin} onChange={e => setForm(f => ({ ...f, nombreAdmin: e.target.value }))} />
            </div>
            <div>
              <label style={LABEL}>Tu email</label>
              <input required type="email" style={INPUT} placeholder="maria@edificio.cl"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <button type="submit" disabled={loading} style={{
              height: 48, background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Redirigiendo a pago…' : 'Continuar al pago'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
