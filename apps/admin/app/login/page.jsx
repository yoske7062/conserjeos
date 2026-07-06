'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../../lib/supabase';

const BG   = '#FFFFFF';
const INK  = '#000000';
const INK2 = 'rgba(15,23,42,0.5)';
const ORG  = '#F95C4B';
const HEAD = "'Inter', system-ui, sans-serif";
const BODY = "'Inter', system-ui, sans-serif";

function Mark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill={ORG} />
      <path d="M9 7h5.8c1.5 0 2.7.4 3.5 1.2.8.8 1.2 1.8 1.2 3.1s-.4 2.4-1.2 3.1c-.8.8-2 1.2-3.5 1.2H11.4V21H9V7zm2.4 6.6h3.2c.9 0 1.5-.2 2-.6.4-.4.6-.9.6-1.7s-.2-1.3-.6-1.7c-.4-.4-1.1-.6-2-.6h-3.2v4.6z" fill="white" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = getSupabase();
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) { setError('Email o contraseña incorrectos.'); setLoading(false); return; }
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes gridIn  { from{opacity:0} to{opacity:1} }

        .pl-input {
          width: 100%; height: 50px;
          background: #fff;
          border: 1.5px solid rgba(10,10,10,0.12);
          border-radius: 10px; padding: 0 16px;
          color: #0A0A0A; font-size: 15px;
          font-family: ${BODY};
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          caret-color: ${ORG};
        }
        .pl-input::placeholder { color: rgba(10,10,10,0.3); }
        .pl-input:focus { border-color: ${ORG}; box-shadow: 0 0 0 3px rgba(230,78,27,0.1); }
        .pl-input:-webkit-autofill,
        .pl-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 100px #fff inset;
          -webkit-text-fill-color: #0A0A0A;
        }

        .pl-btn-primary {
          height: 50px; width: 100%;
          background: #0A0A0A; border: none; border-radius: 10px;
          color: #fff; font-size: 15px; font-weight: 600;
          font-family: ${BODY}; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity .2s, transform .15s;
          margin-top: 4px;
        }
        .pl-btn-primary:hover:not(:disabled) { opacity: .85; transform: translateY(-1px); }
        .pl-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

        .pl-pw-wrap { position: relative; }
        .pl-pw-wrap .pl-input { padding-right: 48px; }
        .pl-pw-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 4px;
          color: rgba(10,10,10,0.3); transition: color .2s; line-height: 1;
        }
        .pl-pw-eye:hover { color: rgba(10,10,10,0.7); }

        @media (max-width: 720px) {
          .pl-left { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: '100dvh', display: 'flex', background: '#FAFAF8', fontFamily: BODY }}>

        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div className="pl-left" style={{
          flex: '0 0 480px', background: '#0A0A0A', borderRight: `1px solid rgba(255,255,255,0.08)`,
          display: 'flex', flexDirection: 'column',
          padding: '48px', position: 'relative', overflow: 'hidden',
        }}>
          {/* subtle grid bg */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.06,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />

          {/* logo */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mark size={28} />
            <span style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 18, letterSpacing: '0.08em', color: '#F5F5F3' }}>PORTIA</span>
          </div>

          {/* main copy */}
          <div style={{ position: 'relative', marginTop: 'auto', marginBottom: 'auto', paddingTop: 80 }}>
            <p style={{
              fontFamily: HEAD, fontWeight: 200,
              fontSize: 'clamp(32px,3.2vw,48px)',
              letterSpacing: '-0.03em', lineHeight: 1.1,
              color: '#F5F5F3', margin: '0 0 20px',
            }}>
              Gestiona tu<br />
              edificio desde<br />
              <span style={{ color: ORG, fontWeight: 400 }}>cualquier lugar.</span>
            </p>
            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: 15, color: 'rgba(245,245,243,0.5)', lineHeight: 1.7 }}>
              Panel de administración para edificios<br />residenciales en Chile.
            </p>
          </div>

          {/* feature tags */}
          <div style={{ position: 'relative', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Novedades', 'Visitas', 'Encomiendas', 'Tareas', 'Turnos'].map(tag => (
              <span key={tag} style={{
                fontFamily: BODY, fontSize: 11, fontWeight: 500,
                color: 'rgba(245,245,243,0.45)', background: 'rgba(245,245,243,0.06)',
                border: '1px solid rgba(245,245,243,0.12)', borderRadius: 100, padding: '5px 13px',
              }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL — FORM ─────────────────────────────────────────── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 48px', background: '#FAFAF8',
        }}>
          <div style={{ width: '100%', maxWidth: 360, animation: 'fadeUp .6s cubic-bezier(.16,1,.3,1) both' }}>

            {/* header */}
            <div style={{ marginBottom: 40 }}>
              <h1 style={{
                fontFamily: HEAD, fontWeight: 300, fontSize: 28,
                color: '#0A0A0A', letterSpacing: '-0.025em', marginBottom: 8,
              }}>Bienvenido de vuelta</h1>
              <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: 14, color: 'rgba(10,10,10,0.5)', lineHeight: 1.5 }}>
                Ingresa con tu cuenta de administrador
              </p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* email */}
              <div>
                <label style={{ display: 'block', fontFamily: BODY, fontSize: 12, fontWeight: 600, color: 'rgba(10,10,10,0.45)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Email
                </label>
                <input
                  className="pl-input" type="email"
                  placeholder="admin@edificio.cl"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus autoComplete="email"
                />
              </div>

              {/* password */}
              <div>
                <label style={{ display: 'block', fontFamily: BODY, fontSize: 12, fontWeight: 600, color: 'rgba(10,10,10,0.45)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Contraseña
                </label>
                <div className="pl-pw-wrap">
                  <input
                    className="pl-input"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required autoComplete="current-password"
                  />
                  <button type="button" className="pl-pw-eye" onClick={() => setShowPw(s => !s)} aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPw
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
                  borderRadius: 8, padding: '11px 14px',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontFamily: BODY, fontSize: 13, color: '#f87171', lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              {/* submit */}
              <button type="submit" className="pl-btn-primary" disabled={loading}>
                {loading
                  ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(12,12,12,0.3)', borderTopColor: BG, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />Ingresando…</>
                  : 'Ingresar al panel'
                }
              </button>
            </form>

            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: 12, color: 'rgba(10,10,10,0.3)', textAlign: 'center', marginTop: 28 }}>
              ¿No tienes acceso?{' '}
              <a href="mailto:hola@portia.cl" style={{ color: INK2, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = INK}
                onMouseLeave={e => e.currentTarget.style.color = INK2}
              >Contacta a tu administrador</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
