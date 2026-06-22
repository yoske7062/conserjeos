import { supabase } from '../lib/supabase';

const NAV = [
  { id: 'novedades',   icon: 'campaign',    label: 'Novedades'   },
  { id: 'visitas',     icon: 'group',       label: 'Visitas'     },
  { id: 'encomiendas', icon: 'inventory_2', label: 'Encomiendas' },
];

export default function Sidebar({ page, setPage, perfil, turnoActivo }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const nombre   = perfil?.nombre_completo || perfil?.email || 'Usuario';
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const edificio  = perfil?.edificios?.nombre || 'Edificio';

  return (
    <aside style={{
      position:'fixed', left:0, top:0, width:240, height:'100vh',
      background:'#161616', borderRight:'1px solid #2E2E2E',
      display:'flex', flexDirection:'column', zIndex:50, padding:'20px 12px'
    }}>
      {/* Logo */}
      <div style={{ padding:'0 4px', marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <div style={{
            width:34, height:34, background:'#00FF88', borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
          }}>
            <span style={{ fontFamily:'Material Symbols Outlined', fontSize:18, color:'#0B0B0B' }}>apartment</span>
          </div>
          <span style={{ fontSize:15, fontWeight:700, color:'#F5F5F5' }}>ConserjeOS</span>
        </div>
        <p style={{ fontSize:11, color:'#636363', paddingLeft:44 }}>{edificio}</p>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
        {NAV.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
              borderRadius:10, fontSize:15, fontWeight: page === id ? 700 : 500,
              color: page === id ? '#0B0B0B' : '#A8A8A8',
              background: page === id ? '#00FF88' : 'transparent',
              border:'none', cursor:'pointer', width:'100%', textAlign:'left',
              transition:'all 120ms'
            }}
            onMouseEnter={e => { if (page !== id) { e.currentTarget.style.background='#1F1F1F'; e.currentTarget.style.color='#F5F5F5'; }}}
            onMouseLeave={e => { if (page !== id) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#A8A8A8'; }}}
          >
            <span style={{
              fontFamily:'Material Symbols Outlined', fontSize:20,
              color: page === id ? '#0B0B0B' : 'inherit'
            }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* Turno indicator */}
      {turnoActivo && (
        <div style={{
          background:'rgba(0,255,136,0.06)', border:'1px solid rgba(0,255,136,0.2)',
          borderRadius:10, padding:'10px 14px', marginBottom:12
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <div style={{ width:7, height:7, background:'#00FF88', borderRadius:'50%' }} className="pulse-neon" />
            <span style={{ fontSize:11, fontWeight:600, color:'#00FF88' }}>TURNO ACTIVO</span>
          </div>
          <p style={{ fontSize:12, color:'#A8A8A8', paddingLeft:15 }}>
            {new Date(turnoActivo.inicio).toLocaleTimeString('es-CL', { hour:'2-digit', minute:'2-digit' })}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop:'1px solid #2E2E2E', paddingTop:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 6px', marginBottom:4 }}>
          <div style={{
            width:32, height:32, background:'rgba(0,255,136,0.1)', borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            border:'1px solid rgba(0,255,136,0.25)'
          }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#00FF88' }}>{iniciales}</span>
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'#F5F5F5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {nombre}
            </p>
            <p style={{ fontSize:11, color:'#636363' }}>Conserje</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 14px',
            borderRadius:10, background:'transparent', border:'none', cursor:'pointer',
            color:'#636363', fontSize:14, fontWeight:500, transition:'all 120ms'
          }}
          onMouseEnter={e => { e.currentTarget.style.background='#1F1F1F'; e.currentTarget.style.color='#F5F5F5'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#636363'; }}
        >
          <span style={{ fontFamily:'Material Symbols Outlined', fontSize:18 }}>logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
