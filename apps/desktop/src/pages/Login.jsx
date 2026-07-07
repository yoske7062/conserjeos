import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoMark from '../assets/logo_mark_coral.png';

const INK   = '#000000';
const CORAL = '#F95C4B';
const HEAD   = "'Sora', system-ui, sans-serif";
const BODY   = "'DM Sans', -apple-system, sans-serif";
const ICON   = 'Material Symbols Outlined';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Credenciales incorrectas.');
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: INK, fontFamily: BODY, position: 'relative' }}>

      {/* Drag strip — full width, no bloquea contenido */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 28, WebkitAppRegion: 'drag', zIndex: 10 }} />

      {/* ── Panel izquierdo — branding ── */}
      <div style={{
        width: 400, flexShrink: 0,
        padding: '52px 44px 44px',
        display: 'flex', flexDirection: 'column', gap: 0,
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 64 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#fff', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            <img src={logoMark} width={27} height={27} style={{ display: 'block', objectFit: 'contain' }} alt="Portia" />
          </div>
          <span style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 22, letterSpacing: '0.08em', color: '#fff' }}>
            PORTIA
          </span>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: HEAD, fontSize: 38, fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Tu edificio.
          </div>
          <div style={{ fontFamily: HEAD, fontSize: 38, fontWeight: 700, color: CORAL, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            En orden.
          </div>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, margin: 0, fontWeight: 400 }}>
          Todo lo que necesita un conserje,<br/>en una sola pantalla.
        </p>

        {/* Ilustración — edificio residencial, algunas ventanas encendidas */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <svg width="220" height="260" viewBox="0 0 220 260" fill="none" aria-hidden="true">
            <rect x="30" y="40" width="160" height="200" rx="4" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
            <rect x="30" y="40" width="160" height="14" fill="rgba(255,255,255,0.06)" />
            {Array.from({ length: 6 }).map((_, row) => (
              Array.from({ length: 4 }).map((_, col) => {
                const lit = (row === 1 && (col === 0 || col === 3)) || (row === 3 && col === 2) || (row === 4 && col === 1);
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={46 + col * 33} y={68 + row * 27}
                    width="20" height="16" rx="2"
                    fill={lit ? CORAL : 'rgba(255,255,255,0.08)'}
                    opacity={lit ? 0.9 : 1}
                  />
                );
              })
            ))}
            <rect x="95" y="212" width="30" height="28" rx="2" fill="rgba(255,255,255,0.1)" />
            <circle cx="120" cy="226" r="1.6" fill="rgba(0,0,0,0.4)" />
            <line x1="0" y1="240" x2="220" y2="240" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
          </svg>
        </div>

        {/* Admin link */}
        <div style={{ marginTop: 'auto', paddingTop: 44 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            ¿Administrador? Accede desde el panel web.
          </p>
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: '#FAFAF8' }}>
        <div style={{ width: '100%', maxWidth: 340 }}>

          {/* Micro label */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(25,24,26,0.35)', marginBottom: 10 }}>
            Acceso conserje
          </p>
          <h1 style={{ fontFamily: HEAD, fontSize: 28, fontWeight: 700, color: '#000000', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 40 }}>
            Iniciar turno
          </h1>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(25,24,26,0.45)', marginBottom: 8 }}>
                Email
              </label>
              <input
                type="email" placeholder="conserje@edificio.cl" autoFocus required
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', height: 48, padding: '0 14px', borderRadius: 12, background: '#fff', border: '1.5px solid rgba(25,24,26,0.12)', color: '#000000', fontSize: 14, fontFamily: BODY, outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                onFocus={e => e.target.style.borderColor = CORAL}
                onBlur={e => e.target.style.borderColor = 'rgba(25,24,26,0.12)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(25,24,26,0.45)', marginBottom: 8 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} placeholder="••••••••" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', height: 48, padding: '0 46px 0 14px', borderRadius: 12, background: '#fff', border: '1.5px solid rgba(25,24,26,0.12)', color: '#000000', fontSize: 14, fontFamily: BODY, outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                  onFocus={e => e.target.style.borderColor = CORAL}
                  onBlur={e => e.target.style.borderColor = 'rgba(25,24,26,0.12)'}
                />
                <button
                  type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#B4B0A9', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  <span style={{ fontFamily: ICON, fontSize: 20 }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(196,43,43,0.06)', border: '1px solid rgba(196,43,43,0.2)', borderRadius: 10, padding: '11px 14px' }}>
                <span style={{ fontFamily: ICON, fontSize: 17, color: '#C42B2B', flexShrink: 0 }}>error</span>
                <span style={{ fontSize: 13, color: '#C42B2B', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                height: 50, background: CORAL, color: '#fff', border: 'none',
                borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: BODY,
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1, transition: 'filter .15s, opacity .15s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              {loading
                ? <><div style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} /> Ingresando…</>
                : 'Ingresar'
              }
            </button>

          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#B4B0A9', marginTop: 28, lineHeight: 1.5 }}>
            ¿Problemas para ingresar?<br/>
            Contacta a tu administrador.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(25,24,26,0.28); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #fff inset;
          -webkit-text-fill-color: #000000;
        }
      `}</style>
    </div>
  );
}
