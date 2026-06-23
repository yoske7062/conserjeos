import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo.png';

const NAV = [
  { id: 'novedades',   icon: 'campaign',    label: 'Novedades'   },
  { id: 'visitas',     icon: 'group',       label: 'Visitas'     },
  { id: 'encomiendas', icon: 'inventory_2', label: 'Encomiendas' },
];

export default function Sidebar({ modulo, setModulo, perfil, turno }) {
  const nombre    = perfil?.nombre || perfil?.email?.split('@')[0] || 'Usuario';
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const edificio  = perfil?.edificios?.nombre || 'Edificio';

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, width: 256, height: '100vh',
      background: '#0D0D0D', borderRight: '1px solid #1F1F1F',
      display: 'flex', flexDirection: 'column', zIndex: 50,
      padding: '20px 12px',
    }}>

      {/* Logo */}
      <div style={{ padding: '4px 8px', marginBottom: 28 }}>
        <img
          src={logoImg} alt="Portia"
          style={{ width: 160, height: 'auto', display: 'block', mixBlendMode: 'lighten' }}
        />
        <p style={{ fontSize: 11, color: '#636363', marginTop: 2 }}>{edificio}</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ id, icon, label }) => {
          const active = modulo === id;
          return (
            <button
              key={id}
              onClick={() => setModulo(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 8,
                fontSize: 14, fontWeight: active ? 600 : 400,
                color: active ? '#00FF88' : '#A8A8A8',
                background: active ? 'rgba(0,255,136,0.08)' : 'transparent',
                border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                transition: 'all 120ms',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#161616'; e.currentTarget.style.color = '#F5F5F5'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#A8A8A8'; }}}
            >
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20, color: active ? '#00FF88' : 'inherit' }}>{icon}</span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Turno indicator */}
      {turno && (
        <div style={{
          background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.18)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{ width: 6, height: 6, background: '#00FF88', borderRadius: '50%' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#00FF88', letterSpacing: '0.08em' }}>TURNO ACTIVO</span>
          </div>
          <p style={{ fontSize: 12, color: '#636363', paddingLeft: 14 }}>
            Desde {new Date(turno.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1F1F1F', paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#00FF88' }}>{iniciales}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</p>
            <p style={{ fontSize: 11, color: '#636363' }}>Conserje</p>
          </div>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '9px 14px', borderRadius: 8, background: 'transparent',
            border: 'none', cursor: 'pointer', color: '#636363', fontSize: 13,
            fontWeight: 500, transition: 'all 120ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#161616'; e.currentTarget.style.color = '#F5F5F5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#636363'; }}
        >
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
