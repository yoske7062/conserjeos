import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo.png';

const ICONS = {
  home:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>,
  clock: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>,
  bell:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>,
  people:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  box:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  check: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  grid:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>,
  help:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5"/></svg>,
  logout:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  gear:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

const NAV = [
  { section: 'Principal', items: [
    { id: 'inicio',  label: 'Inicio',            icon: ICONS.home  },
    { id: 'turno',   label: 'Entrega de turno',  icon: ICONS.clock },
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
  return (
    <button
      onClick={() => onClick(item.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '6.5px 9px', borderRadius: 7, width: '100%',
        fontSize: 12.5, fontWeight: active ? 700 : 600, letterSpacing: '-0.01em',
        color: active ? '#fff' : hov ? '#C8D6E8' : '#8394AA',
        background: active ? 'rgba(143,175,212,.14)' : hov ? 'rgba(255,255,255,.05)' : 'transparent',
        border: 'none', borderLeft: `2px solid ${active ? '#8FAFD4' : 'transparent'}`,
        cursor: 'pointer', textAlign: 'left', marginBottom: 1,
        transition: 'background .12s, color .12s',
      }}
    >
      <span style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: active || hov ? 1 : 0.78 }}>
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
      background: '#0E1525',
      borderRight: '1px solid rgba(255,255,255,.06)',
      display: 'flex', flexDirection: 'column',
      zIndex: 50, overflowY: 'auto', overflowX: 'hidden',
    }}>

      {/* Drag region arriba */}
      <div style={{ height: 28, flexShrink: 0, WebkitAppRegion: 'drag' }} />

      {/* Brand */}
      <div style={{
        padding: '4px 14px 15px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          overflow: 'hidden',
        }}>
          <img src={logoImg} alt="" style={{
            width: 32, height: 32, objectFit: 'cover', objectPosition: 'center 18%',
          }} />
        </div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: '#fff', letterSpacing: '-.4px', lineHeight: 1 }}>Portia</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#8394AA', marginTop: 3, letterSpacing: '.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{edificio}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 8px 0', overflowY: 'auto' }}>
        {NAV.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 4 }}>
            <div style={{
              fontSize: 9.5, fontWeight: 700, color: 'rgba(131,148,170,.4)',
              textTransform: 'uppercase', letterSpacing: '.6px', padding: '6px 9px 4px',
            }}>{section}</div>
            {items.map(item => (
              <NavItem key={item.id} item={item} active={modulo === item.id} onClick={setModulo} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', padding: '12px 12px 14px', flexShrink: 0 }}>
        {/* User row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: turno ? 9 : 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #1B2A4A, #3A5A8A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
          }}>{iniciales}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
            <div style={{ fontSize: 10, color: '#8394AA', marginTop: 1 }}>Conserje</div>
          </div>
        </div>

        {/* Turno badge */}
        {turno && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.18)',
            borderRadius: 6, padding: '5px 9px', marginBottom: 8,
            fontSize: 10.5, fontWeight: 700, color: '#4ade80',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#4ade80', flexShrink: 0,
              animation: 'pulse-neon 2s ease-in-out infinite',
            }} />
            Turno activo · desde {turnoSince}
          </div>
        )}

        {/* Ajustes + Cerrar sesión */}
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
