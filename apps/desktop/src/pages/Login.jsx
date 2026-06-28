import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo_terracota.jpg';

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

  const F = {
    heading: "'Bricolage Grotesque', system-ui, sans-serif",
    body:    "'DM Sans', -apple-system, sans-serif",
    icon:    'Material Symbols Outlined',
  };

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily: F.body }}>

      {/* Panel izquierdo — branding */}
      <div style={{
        width: 420, background:'#1B2A4A',
        padding: '52px 44px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between',
      }}>
        <div>
          {/* Logo */}
          <div style={{ marginBottom: 40 }}>
            <img src={logoImg} alt="Portia" style={{
              width: 120, height: 120, objectFit: 'cover',
              objectPosition: 'center 25%', borderRadius: 16,
            }} />
          </div>

          <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.12em', marginBottom:16, textTransform:'uppercase' }}>
            App de Conserjería
          </p>
          <h2 style={{
            fontFamily: F.heading,
            fontSize: 26, fontWeight: 800, color: '#FFFFFF',
            lineHeight: 1.3, marginBottom: 16,
          }}>
            Control total de tu conserjería
          </h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.65, fontWeight: 400 }}>
            Registra novedades, visitas y encomiendas en tiempo real. Sin papel, sin pérdida de información.
          </p>

          {/* Features */}
          <div style={{ display:'flex', flexDirection:'column', gap:13, marginTop:36 }}>
            {[
              { icon:'campaign',    text:'Libro de novedades digital' },
              { icon:'group',       text:'Control de visitas con trazabilidad' },
              { icon:'inventory_2', text:'Gestión de encomiendas' },
              { icon:'analytics',   text:'Dashboard para el administrador' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:13 }}>
                <div style={{
                  width:36, height:36, background:'rgba(255,255,255,0.08)', borderRadius:9,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                  border:'1px solid rgba(255,255,255,0.1)',
                }}>
                  <span style={{ fontFamily: F.icon, fontSize:19, color:'rgba(255,255,255,0.7)' }}>{icon}</span>
                </div>
                <span style={{ fontSize:13.5, color:'rgba(255,255,255,0.55)', fontWeight:400 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize:11.5, color:'rgba(255,255,255,0.2)', borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:16 }}>
          ¿Eres administrador? Accede desde el panel web.
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40, background:'#FAFAF8' }}>
        <div style={{ width:'100%', maxWidth:360 }}>
          <h1 style={{
            fontFamily: F.heading,
            fontSize: 28, fontWeight: 800, color: '#19181A', marginBottom: 6, letterSpacing:'-0.3px',
          }}>Bienvenido</h1>
          <p style={{ fontSize:14, color:'#6A6762', marginBottom:36, fontWeight:400 }}>Ingresa tus credenciales para comenzar el turno</p>

          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'#6A6762', marginBottom:8 }}>Email</label>
              <input
                type="email"
                placeholder="conserje@edificio.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  width:'100%', height:46, padding:'0 14px',
                  background:'#FFFFFF', border:'1.5px solid rgba(25,24,26,0.13)',
                  borderRadius:12, color:'#19181A', fontSize:13.5, fontWeight:500,
                  fontFamily: F.body, outline:'none',
                  transition:'border-color .15s, box-shadow .15s',
                }}
                onFocus={e => { e.target.style.borderColor='#1B2A4A'; e.target.style.boxShadow='0 0 0 3px rgba(27,42,74,0.08)'; }}
                onBlur={e => { e.target.style.borderColor='rgba(25,24,26,0.13)'; e.target.style.boxShadow='none'; }}
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'#6A6762', marginBottom:8 }}>Contraseña</label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width:'100%', height:46, padding:'0 46px 0 14px',
                    background:'#FFFFFF', border:'1.5px solid rgba(25,24,26,0.13)',
                    borderRadius:12, color:'#19181A', fontSize:13.5, fontWeight:500,
                    fontFamily: F.body, outline:'none',
                    transition:'border-color .15s, box-shadow .15s',
                  }}
                  onFocus={e => { e.target.style.borderColor='#1B2A4A'; e.target.style.boxShadow='0 0 0 3px rgba(27,42,74,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor='rgba(25,24,26,0.13)'; e.target.style.boxShadow='none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position:'absolute', right:13, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer',
                    color:'#B4B0A9', padding:0, lineHeight:1,
                  }}
                >
                  <span style={{ fontFamily: F.icon, fontSize:20 }}>
                    {showPwd ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                display:'flex', alignItems:'center', gap:10,
                background:'rgba(229,72,77,0.06)', borderLeft:'3px solid #E5484D',
                borderRadius:'0 10px 10px 0', padding:'12px 14px',
              }}>
                <span style={{ fontFamily: F.icon, fontSize:18, color:'#E5484D', flexShrink:0 }}>error</span>
                <span style={{ fontSize:13.5, color:'#E5484D', fontWeight:500 }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                height:46, background:'#1B2A4A', color:'#FFFFFF',
                border:'none', borderRadius:980, fontSize:14, fontWeight:600,
                fontFamily: F.body, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                transition:'filter .15s, transform .1s', marginTop:4,
                letterSpacing:'0.01em',
                opacity: loading ? 0.65 : 1,
              }}
              onMouseEnter={e => { if(!loading) e.currentTarget.style.filter='brightness(1.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter='none'; }}
            >
              {loading ? (
                <>
                  <div style={{
                    width:17, height:17, border:'2px solid rgba(255,255,255,0.3)',
                    borderTopColor:'#FFFFFF', borderRadius:'50%',
                    animation:'spin 0.8s linear infinite',
                  }} />
                  Ingresando…
                </>
              ) : 'Iniciar sesión'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:12, color:'#B4B0A9', marginTop:32, fontWeight:400 }}>
            ¿Problemas para ingresar? Contacta a tu administrador.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
