import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo.png';

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
    <div style={{ display:'flex', height:'100vh', background:'#0B0B0B' }}>

      {/* Panel izquierdo — branding */}
      <div style={{
        width: 420, background:'#0E1525', borderRight:'1px solid #1D2D45',
        padding: '48px 40px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between'
      }}>
        <div>
          {/* Logo — sin filtros, color original */}
          <div style={{ marginBottom:36 }}>
            <img src={logoImg} alt="Portia" style={{
              width:100, height:100, objectFit:'contain',
            }} />
          </div>

          <p style={{ fontSize:12, fontWeight:600, color:'#8FAFD4', letterSpacing:'0.1em', marginBottom:16, textTransform:'uppercase' }}>
            App de Conserjería
          </p>
          <h2 style={{ fontSize:28, fontWeight:700, color:'#F0EDE8', lineHeight:1.3, marginBottom:16 }}>
            Control total de tu conserjería
          </h2>
          <p style={{ fontSize:15, color:'#8394AA', lineHeight:1.6 }}>
            Registra novedades, visitas y encomiendas en tiempo real. Sin papel, sin pérdida de información.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:16, marginTop:40 }}>
            {[
              ['campaign',   'Libro de novedades digital'],
              ['group',      'Control de visitas con trazabilidad'],
              ['inventory_2','Gestión de encomiendas'],
              ['analytics',  'Dashboard para el administrador'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{
                  width:38, height:38, background:'#162035', borderRadius:9,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  border:'1px solid #1D2D45'
                }}>
                  <span style={{ fontFamily:'Material Symbols Outlined', fontSize:20, color:'#8FAFD4' }}>{icon}</span>
                </div>
                <span style={{ fontSize:14, color:'#8394AA' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize:12, color:'#4A5568', borderTop:'1px solid #1D2D45', paddingTop:16 }}>
          ¿Eres administrador? Accede desde el panel web.
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div style={{ width:'100%', maxWidth:360 }}>
          <h1 style={{ fontSize:26, fontWeight:700, color:'#F5F5F5', marginBottom:6 }}>Bienvenido</h1>
          <p style={{ fontSize:14, color:'#A8A8A8', marginBottom:36 }}>Ingresa tus credenciales para comenzar el turno</p>

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="conserje@edificio.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight:50 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'#636363', padding:0
                  }}
                >
                  <span style={{ fontFamily:'Material Symbols Outlined', fontSize:20 }}>
                    {showPwd ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                display:'flex', alignItems:'center', gap:10,
                background:'rgba(239,68,68,0.16)', borderLeft:'4px solid #ef4444',
                borderRadius:'0 10px 10px 0', padding:'12px 16px'
              }}>
                <span style={{ fontFamily:'Material Symbols Outlined', fontSize:18, color:'#fca5a5', flexShrink:0 }}>error</span>
                <span style={{ fontSize:14, color:'#fca5a5', fontWeight: 600 }}>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-primary btn-glow" disabled={loading} style={{ marginTop:4 }}>
              {loading ? (
                <>
                  <div style={{
                    width:18, height:18, border:'2px solid rgba(0,0,0,0.2)',
                    borderTop:'2px solid #0B0B0B', borderRadius:'50%',
                    animation:'spin 0.8s linear infinite'
                  }} />
                  Ingresando…
                </>
              ) : 'Iniciar sesión'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:12, color:'#636363', marginTop:32 }}>
            ¿Problemas para ingresar? Contacta a tu administrador.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
