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

  const inputSt = {
    width: '100%', height: 48,
    background: '#fff',
    border: '1.5px solid rgba(25,24,26,0.14)',
    borderRadius: 12, padding: '0 16px',
    color: '#19181A', fontSize: 15,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: 'none', transition: 'border-color .2s',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none} }
        @keyframes spin   { to { transform:rotate(360deg) } }
      `}</style>
      <div style={{
        minHeight: '100vh', display: 'flex',
        background: '#FAFAF8',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        {/* Left panel — brand */}
        <div style={{
          flex: '0 0 420px', background: '#1B2A4A', display: 'flex',
          flexDirection: 'column', justifyContent: 'space-between',
          padding: '48px 48px 40px',
        }} className="p-login-left">
          <div>
            <span style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: '#fff', letterSpacing: '-.02em' }}>
              Portia
            </span>
          </div>
          <div>
            <p style={{ fontFamily: "'Bricolage Grotesque', system-ui, sans-serif", fontWeight: 700, fontSize: 'clamp(28px,3.5vw,42px)', color: '#fff', letterSpacing: '-.03em', lineHeight: 1.15, margin: '0 0 16px' }}>
              Tu edificio.<br />Todo en orden.
            </p>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
              Panel de administración para edificios residenciales en Chile.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['Novedades', 'Visitas', 'Encomiendas', 'Tareas'].map(tag => (
              <span key={tag} style={{
                fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 500,
                color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.07)',
                borderRadius: 980, padding: '4px 12px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 40px',
        }}>
          <div style={{ width: '100%', maxWidth: 380, animation: 'fadeUp .6s both' }}>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              fontWeight: 700, fontSize: 26, color: '#19181A',
              letterSpacing: '-.02em', margin: '0 0 6px',
            }}>Bienvenido de vuelta</h1>
            <p style={{ fontSize: 15, color: '#6A6762', margin: '0 0 36px', lineHeight: 1.5 }}>
              Ingresa con tu cuenta de administrador
            </p>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#19181A', marginBottom: 7 }}>Email</label>
                <input
                  type="email" style={inputSt}
                  placeholder="admin@edificio.cl"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus
                  onFocus={e => e.target.style.borderColor = '#1B2A4A'}
                  onBlur={e => e.target.style.borderColor = 'rgba(25,24,26,0.14)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#19181A', marginBottom: 7 }}>Contraseña</label>
                <input
                  type="password" style={inputSt}
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  required
                  onFocus={e => e.target.style.borderColor = '#1B2A4A'}
                  onBlur={e => e.target.style.borderColor = 'rgba(25,24,26,0.14)'}
                />
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#FEF0F0', border: '1px solid rgba(196,43,43,0.15)',
                  borderRadius: 10, padding: '11px 14px',
                }}>
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: '#C42B2B', flexShrink: 0 }}>error</span>
                  <span style={{ fontSize: 13, color: '#C42B2B' }}>{error}</span>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                style={{
                  height: 50, background: '#1B2A4A', border: 'none', borderRadius: 12,
                  color: '#fff', fontSize: 15, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  marginTop: 4, transition: 'opacity .2s',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.86'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '.7' : '1'; }}
              >
                {loading
                  ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />Ingresando…</>
                  : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .p-login-left { display: none !important; }
        }
      `}</style>
    </>
  );
}
