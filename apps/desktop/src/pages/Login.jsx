import { useState } from 'react';
import { supabase } from '../lib/supabase';

const GOLD  = '#C8932F';
const NAVY  = '#1B2A4A';
const BODY  = "'DM Sans', -apple-system, sans-serif";
const ICON  = 'Material Symbols Outlined';

function PortiaLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="9" fill={GOLD}/>
        <path d="M11 9h7.4c1.9 0 3.4.5 4.5 1.5 1 1 1.5 2.4 1.5 4s-.5 3-1.5 4c-1 1-2.6 1.5-4.5 1.5h-3.7V27H11V9zm3.2 8.4h4c1.1 0 2-.3 2.5-.8.6-.5.8-1.2.8-2.1 0-.9-.2-1.6-.8-2.1-.5-.5-1.4-.8-2.5-.8h-4v5.8z" fill="white"/>
      </svg>
      <span style={{ fontFamily: BODY, fontWeight: 700, fontSize: 22, letterSpacing: '0.06em', color: '#fff' }}>PORTIA</span>
    </div>
  );
}

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: BODY }}>

      {/* ── Panel izquierdo — branding ──────────────────────────────────── */}
      <div style={{
        width: 400, background: NAVY, flexShrink: 0,
        padding: '48px 44px 40px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          <PortiaLogo />

          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>
            Conserjería digital
          </p>
          <h2 style={{ fontFamily: BODY, fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 14 }}>
            El orden que tu edificio siempre mereció.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Novedades, visitas, encomiendas y turnos — todo trazado, sin papel.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
            {[
              { icon: 'campaign',    text: 'Libro de novedades digital' },
              { icon: 'group',       text: 'Control de visitas con RUT validado' },
              { icon: 'inventory_2', text: 'Encomiendas con alerta de perecibles' },
              { icon: 'task_alt',    text: 'Tareas asignadas por el administrador' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontFamily: ICON, fontSize: 18,
                  color: GOLD, flexShrink: 0,
                }}>{icon}</span>
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
          ¿Eres administrador? Accede desde el panel web.
        </p>
      </div>

      {/* ── Panel derecho — formulario ──────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#FAFAF8' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h1 style={{ fontFamily: BODY, fontSize: 26, fontWeight: 700, color: '#19181A', marginBottom: 6, letterSpacing: '-0.3px' }}>
            Bienvenido
          </h1>
          <p style={{ fontSize: 14, color: '#6A6762', marginBottom: 36 }}>
            Ingresa tus credenciales para comenzar el turno
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6A6762', marginBottom: 8 }}>Email</label>
              <input
                type="email" placeholder="conserje@edificio.cl"
                value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus
                style={{
                  width: '100%', height: 46, padding: '0 14px',
                  background: '#fff', border: '1.5px solid rgba(25,24,26,0.13)',
                  borderRadius: 10, color: '#19181A', fontSize: 14, fontFamily: BODY,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color .15s, box-shadow .15s',
                }}
                onFocus={e => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px rgba(27,42,74,0.1)`; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(25,24,26,0.13)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6A6762', marginBottom: 8 }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', height: 46, padding: '0 46px 0 14px',
                    background: '#fff', border: '1.5px solid rgba(25,24,26,0.13)',
                    borderRadius: 10, color: '#19181A', fontSize: 14, fontFamily: BODY,
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color .15s, box-shadow .15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = `0 0 0 3px rgba(27,42,74,0.1)`; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(25,24,26,0.13)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#B4B0A9', padding: 0 }}>
                  <span style={{ fontFamily: ICON, fontSize: 20 }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(229,72,77,0.06)', borderLeft: '3px solid #E5484D', borderRadius: '0 8px 8px 0', padding: '12px 14px' }}>
                <span style={{ fontFamily: ICON, fontSize: 18, color: '#E5484D', flexShrink: 0 }}>error</span>
                <span style={{ fontSize: 13.5, color: '#E5484D', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                height: 46, background: NAVY, color: '#fff',
                border: 'none', borderRadius: 980,
                fontSize: 14, fontWeight: 600, fontFamily: BODY,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'filter .15s', marginTop: 4,
                opacity: loading ? 0.65 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                  Ingresando…
                </>
              ) : 'Iniciar sesión'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#B4B0A9', marginTop: 28 }}>
            ¿Problemas para ingresar? Contacta a tu administrador.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
