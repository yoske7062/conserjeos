import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo.png';

function leerTema() {
  return localStorage.getItem('portia:tema') || 'dark';
}

function ThemeToggle() {
  const [tema, setTema] = useState(leerTema);

  function alternar() {
    const siguiente = tema === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', siguiente);
    localStorage.setItem('portia:tema', siguiente);
    setTema(siguiente);
  }

  return (
    <button
      onClick={alternar}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 44,
        padding: '0 14px', borderRadius: 8, background: 'transparent',
        border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14,
        fontWeight: 500, transition: 'all 120ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>{tema === 'dark' ? 'light_mode' : 'dark_mode'}</span>
      {tema === 'dark' ? 'Tema claro' : 'Tema oscuro'}
    </button>
  );
}

const NAV_PRIMARIO = [
  { id: 'visitas',     icon: 'group',       label: 'Visitas'     },
  { id: 'encomiendas', icon: 'inventory_2', label: 'Encomiendas' },
  { id: 'tareas',      icon: 'checklist',   label: 'Tareas'      },
];

const NAV_SECUNDARIO = [
  { id: 'novedades',   icon: 'campaign',    label: 'Novedades'        },
  { id: 'turno',       icon: 'schedule',    label: 'Entrega de turno' },
  { id: 'edificio',    icon: 'apartment',   label: 'Edificio'         },
  { id: 'ayuda',       icon: 'help',        label: 'Ayuda'            },
];

function NavButton({ id, icon, label, active, setModulo }) {
  return (
    <button
      onClick={() => setModulo(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, minHeight: 44,
        padding: '0 14px', borderRadius: 8,
        fontSize: 15, fontWeight: active ? 600 : 400,
        color: active ? 'var(--brand)' : 'var(--text-secondary)',
        background: active ? 'rgba(var(--brand-rgb),0.08)' : 'transparent',
        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: 'all 120ms',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text)'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
    >
      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20, color: active ? 'var(--brand)' : 'inherit' }}>{icon}</span>
      {label}
    </button>
  );
}

export default function Sidebar({ modulo, setModulo, perfil, turno }) {
  const nombre    = perfil?.nombre || perfil?.email?.split('@')[0] || 'Usuario';
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const edificio  = perfil?.edificios?.nombre || 'Edificio';

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, width: 256, height: '100vh',
      background: 'var(--bg-input)', borderRight: '1px solid var(--bg-surface-high)',
      display: 'flex', flexDirection: 'column', zIndex: 50,
      padding: '20px 12px',
    }}>

      {/* Logo */}
      <div style={{ padding: '4px 8px', marginBottom: 28 }}>
        <img
          src={logoImg} alt="Portia"
          style={{ width: 160, height: 'auto', display: 'block', mixBlendMode: 'lighten' }}
        />
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{edificio}</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        <NavButton id="inicio" icon="home" label="Inicio" active={modulo === 'inicio'} setModulo={setModulo} />

        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 14px 4px' }}>
          Tu día
        </p>
        {NAV_PRIMARIO.map(({ id, icon, label }) => (
          <NavButton key={id} id={id} icon={icon} label={label} active={modulo === id} setModulo={setModulo} />
        ))}

        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 14px 4px' }}>
          Más
        </p>
        {NAV_SECUNDARIO.map(({ id, icon, label }) => (
          <NavButton key={id} id={id} icon={icon} label={label} active={modulo === id} setModulo={setModulo} />
        ))}
      </nav>

      {/* Turno indicator */}
      {turno && (
        <div style={{
          background: 'rgba(var(--brand-rgb),0.06)', border: '1px solid rgba(var(--brand-rgb),0.18)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{ width: 6, height: 6, background: 'var(--brand)', borderRadius: '50%' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.08em' }}>TURNO ACTIVO</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 14 }}>
            Desde {new Date(turno.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--bg-surface-high)', paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(var(--brand-rgb),0.1)', border: '1px solid rgba(var(--brand-rgb),0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>{iniciales}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Conserje</p>
          </div>
        </div>
        <ThemeToggle />
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 44,
            padding: '0 14px', borderRadius: 8, background: 'transparent',
            border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14,
            fontWeight: 500, transition: 'all 120ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
