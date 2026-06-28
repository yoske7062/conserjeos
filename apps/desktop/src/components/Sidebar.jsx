import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo_terracota.jpg';

const ICONS = {
  home:   'home',
  clock:  'schedule',
  bell:   'campaign',
  people: 'group',
  box:    'inventory_2',
  check:  'checklist',
  grid:   'apartment',
  help:   'help',
  logout: 'logout',
  gear:   'settings',
};

const NAV = [
  { section: 'Principal', items: [
    { id: 'inicio',  label: 'Inicio',           icon: ICONS.home  },
    { id: 'turno',   label: 'Entrega de turno', icon: ICONS.clock },
  ]},
  { section: 'Tu día', items: [
    { id: 'novedades',   label: 'Novedades',   icon: ICONS.bell   },
    { id: 'visitas',     label: 'Visitas',     icon: ICONS.people },
    { id: 'encomiendas', label: 'Encomiendas', icon: ICONS.box    },
    { id: 'tareas',      label: 'Tareas',      icon: ICONS.check  },
  ]},
  { section: 'Edificio', items: [
    { id: 'edificio', label: 'Ficha Edificio', icon: ICONS.grid },
    { id: 'ayuda',    label: 'Ayuda',          icon: ICONS.help },
  ]},
];

function NavItem({ item, active, onClick }) {
  const [hov, setHov] = useState(false);
  const isActive = active;
  return (
    <button
      onClick={() => onClick(item.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 12px', borderRadius: 10, width: '100%',
        fontSize: 13, fontWeight: isActive ? 600 : 500,
        fontFamily: 'var(--font-body)',
        color: isActive ? '#1B2A4A' : hov ? '#19181A' : '#6A6762',
        background: isActive ? '#EDF0F7' : hov ? 'rgba(25,24,26,0.04)' : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 1,
        transition: 'background .12s, color .12s',
        letterSpacing: '-0.01em',
      }}
    >
      <span style={{
        fontFamily: 'Material Symbols Outlined', fontSize: 19,
        color: isActive ? '#1B2A4A' : hov ? '#6A6762' : '#B4B0A9',
        transition: 'color .12s',
        lineHeight: 1,
      }}>
        {item.icon}
      </span>
      {item.label}
    </button>
  );
}

export default function Sidebar({ modulo, setModulo, perfil, turno, onAjustes }) {
  const nombre    = perfil?.nombre || perfil?.email?.split('@')[0] || 'Conserje';
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const edificio  = perfil?.edificios?.nombre || 'Edificio';
  const turnoSince = turno
    ? new Date(turno.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, width: 240, height: '100vh',
      background: '#FFFFFF',
      borderRight: '1px solid rgba(25,24,26,0.09)',
      display: 'flex', flexDirection: 'column',
      zIndex: 50, overflowY: 'auto', overflowX: 'hidden',
    }}>

      {/* Drag region */}
      <div style={{ height: 28, flexShrink: 0, WebkitAppRegion: 'drag' }} />

      {/* Brand */}
      <div style={{
        padding: '2px 16px 16px',
        borderBottom: '1px solid rgba(25,24,26,0.07)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        {/* Logo icon — cropped from full logo */}
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          overflow: 'hidden',
          backgroundImage: `url(${logoImg})`,
          backgroundSize: '220%',
          backgroundPosition: '48% 14%',
          backgroundRepeat: 'no-repeat',
        }} />
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 15, fontWeight: 700,
            color: '#19181A', letterSpacing: '-0.3px', lineHeight: 1,
          }}>Portia</div>
          <div style={{
            fontSize: 11, fontWeight: 500,
            color: '#B4B0A9', marginTop: 3,
            letterSpacing: '0em',
            whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis', maxWidth: 155,
            fontFamily: 'var(--font-body)',
          }}>{edificio}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 10px 0', overflowY: 'auto' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 6 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: '#B4B0A9',
              textTransform: 'uppercase', letterSpacing: '.7px',
              padding: '8px 12px 4px',
              fontFamily: 'var(--font-body)',
            }}>{section}</div>
            {items.map(item => (
              <NavItem key={item.id} item={item} active={modulo === item.id} onClick={setModulo} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(25,24,26,0.07)', padding: '12px 12px 14px', flexShrink: 0 }}>
        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: turno ? 10 : 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: '#1B2A4A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-body)',
          }}>{iniciales}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#19181A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
            <div style={{ fontSize: 10.5, color: '#B4B0A9', marginTop: 1 }}>Conserje</div>
          </div>
        </div>

        {/* Turno badge */}
        {turno && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--ok-bg)', border: '1px solid var(--ok-border)',
            borderRadius: 8, padding: '5px 10px', marginBottom: 8,
            fontSize: 10.5, fontWeight: 600, color: 'var(--ok-tx)',
            fontFamily: 'var(--font-body)',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--ok-tx)', flexShrink: 0,
              animation: 'pulse-neon 2s ease-in-out infinite',
            }} />
            Turno activo · desde {turnoSince}
          </div>
        )}

        {/* Ajustes + Logout */}
        <NavItem
          item={{ id: '__ajustes', label: 'Ajustes', icon: ICONS.gear }}
          active={false}
          onClick={onAjustes}
        />
        <NavItem
          item={{ id: '__logout', label: 'Cerrar sesión', icon: ICONS.logout }}
          active={false}
          onClick={() => supabase.auth.signOut()}
        />
      </div>
    </aside>
  );
}
