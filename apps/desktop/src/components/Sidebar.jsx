import { useState } from 'react';
import { supabase } from '../lib/supabase';
import logoPortia from '../assets/logo_mark_coral.png';

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
  { section: 'principal', items: [
    { id: 'inicio',  label: 'Inicio',           icon: ICONS.home  },
    { id: 'turno',   label: 'Entrega de turno', icon: ICONS.clock },
  ]},
  { section: 'dia', items: [
    { id: 'novedades',   label: 'Novedades',   icon: ICONS.bell   },
    { id: 'visitas',     label: 'Visitas',     icon: ICONS.people },
    { id: 'encomiendas', label: 'Encomiendas', icon: ICONS.box    },
    { id: 'tareas',      label: 'Tareas',      icon: ICONS.check  },
  ]},
  { section: 'edificio', items: [
    { id: 'edificio', label: 'Ficha Edificio', icon: ICONS.grid },
    { id: 'ayuda',    label: 'Ayuda',          icon: ICONS.help },
  ]},
];

// Tooltip fixed compartido — un solo nodo, se reposiciona en cada hover en
// vez de tener un tooltip propio por ítem (mismo patrón que Catalina Hub).
function useRailTooltip() {
  const [tip, setTip] = useState(null); // { label, top }
  const show = (e, label) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ label, top: r.top + r.height / 2 });
  };
  const hide = () => setTip(null);
  return { tip, show, hide };
}

function RailItem({ item, active, onClick, onShowTip, onHideTip }) {
  return (
    <button
      className={`rail-item${active ? ' active' : ''}`}
      onClick={() => onClick(item.id)}
      onMouseEnter={(e) => onShowTip(e, item.label)}
      onMouseLeave={onHideTip}
      title={item.label}
    >
      <span className="rail-icon">{item.icon}</span>
    </button>
  );
}

export default function Sidebar({ modulo, setModulo, perfil, turno, onAjustes }) {
  const nombre    = perfil?.nombre || perfil?.email?.split('@')[0] || 'Conserje';
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const { tip, show, hide } = useRailTooltip();

  return (
    <>
      <aside className="rail">
        {/* Drag region */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 28, WebkitAppRegion: 'drag' }} />

        {/* Brand */}
        <div className="rail-logo">
          <div className="rail-mark">
            <img src={logoPortia} width={26} height={26} style={{ display: 'block', objectFit: 'contain' }} alt="Portia" />
          </div>
        </div>

        {/* Navigation */}
        <div className="rail-nav-list">
          {NAV.map(({ section, items }) => (
            <div key={section} className="rail-section">
              <div className="rail-nav-list" style={{ gap: 5 }}>
                {items.map(item => (
                  <RailItem key={item.id} item={item} active={modulo === item.id} onClick={setModulo} onShowTip={show} onHideTip={hide} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Turno indicator — punto pulsante sobre el avatar en vez de badge de texto */}
        <div style={{ position: 'relative', marginBottom: 10 }}
          onMouseEnter={(e) => show(e, turno ? `Turno activo` : nombre)}
          onMouseLeave={hide}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--text)', color: 'var(--bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
          }}>{iniciales}</div>
          {turno && (
            <div style={{
              position: 'absolute', bottom: -1, right: -1,
              width: 10, height: 10, borderRadius: '50%',
              background: 'var(--ok-tx)', border: '2px solid var(--sidebar-bg)',
              animation: 'pulse-neon 2s ease-in-out infinite',
            }} />
          )}
        </div>

        {/* Ajustes + Logout */}
        <div className="rail-section">
          <div className="rail-nav-list" style={{ gap: 5 }}>
            <RailItem item={{ id: '__ajustes', label: 'Ajustes', icon: ICONS.gear }} active={false} onClick={onAjustes} onShowTip={show} onHideTip={hide} />
            <RailItem item={{ id: '__logout', label: 'Cerrar sesión', icon: ICONS.logout }} active={false} onClick={() => supabase.auth.signOut()} onShowTip={show} onHideTip={hide} />
          </div>
        </div>
      </aside>

      {tip && (
        <div className="rail-tooltip visible" style={{ left: 96, top: tip.top }}>
          {tip.label}
        </div>
      )}
    </>
  );
}
