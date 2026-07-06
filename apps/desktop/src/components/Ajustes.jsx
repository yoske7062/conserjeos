import { useState, useEffect } from 'react';

const SECTIONS = [
  {
    group: 'App',
    items: [
      { id: 'general',    label: 'General',    icon: 'tune' },
      { id: 'apariencia', label: 'Apariencia', icon: 'palette' },
    ],
  },
  {
    group: 'Cuenta',
    items: [
      { id: 'perfil',   label: 'Mi perfil', icon: 'person' },
      { id: 'edificio', label: 'Edificio',  icon: 'apartment' },
    ],
  },
];

function SpNavItem({ item, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={() => onClick(item.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '7px 10px',
        borderRadius: 8, border: 'none', textAlign: 'left', cursor: 'pointer',
        fontSize: 12.5, fontWeight: active ? 600 : 500,
        fontFamily: 'var(--font-body)',
        color: active ? 'var(--info-tx)' : hov ? 'var(--text)' : 'var(--text-secondary)',
        background: active ? 'var(--info-bg)' : hov ? 'var(--border-line)' : 'transparent',
        transition: 'background .12s, color .12s',
      }}
    >
      <span style={{
        fontFamily: 'Material Symbols Outlined', fontSize: 18,
        color: active ? 'var(--info-tx)' : 'var(--text-muted)',
        lineHeight: 1,
      }}>
        {item.icon}
      </span>
      {item.label}
    </button>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px',
        color: 'var(--text-muted)', padding: '0 0 7px',
        fontFamily: 'var(--font-body)',
      }}>{label}</div>
      <div style={{
        background: 'var(--bg-section)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden',
      }}>{children}</div>
    </div>
  );
}

function ToggleRow({ label, sublabel, checked, onChange, last }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 14px', cursor: 'pointer',
      borderBottom: last ? 'none' : '1px solid var(--border-line)',
      gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sublabel}</div>}
      </div>
      <span className="sp-toggle">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="sp-toggle-track" />
      </span>
    </label>
  );
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 14px',
      borderBottom: last ? 'none' : '1px solid var(--border-line)',
    }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{value || '—'}</span>
    </div>
  );
}

function ZoomRow() {
  const [zoom, setZoom] = useState(() => parseInt(localStorage.getItem('portia:zoom') || '100'));
  function apply(factor) {
    const newZoom = Math.min(140, Math.max(80, zoom + factor));
    setZoom(newZoom);
    document.documentElement.style.zoom = newZoom / 100;
    localStorage.setItem('portia:zoom', newZoom);
  }
  function reset() {
    setZoom(100);
    document.documentElement.style.zoom = 1;
    localStorage.removeItem('portia:zoom');
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', gap: 8 }}>
      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>Tamaño del texto</span>
      {[['A−', () => apply(-10)], [`${zoom}%`, reset], ['A+', () => apply(10)]].map(([lbl, fn]) => (
        <button key={lbl} onClick={fn} style={{
          padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
          background: 'var(--bg-base)', color: 'var(--text-secondary)', fontSize: 12,
          fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>{lbl}</button>
      ))}
    </div>
  );
}

export default function Ajustes({ perfil, onClose }) {
  const [section, setSection] = useState('general');
  const [notifs, setNotifs] = useState(
    () => localStorage.getItem('portia:notifs') !== 'off'
  );
  const [temaOscuro, setTemaOscuro] = useState(
    () => localStorage.getItem('portia:tema') === 'dark'
  );
  const [version, setVersion] = useState('—');

  useEffect(() => {
    const savedZoom = localStorage.getItem('portia:zoom');
    if (savedZoom) document.documentElement.style.zoom = parseInt(savedZoom) / 100;
    window.electron?.getVersion?.().then(v => setVersion(v)).catch(() => {});
  }, []);

  function toggleNotifs(val) {
    setNotifs(val);
    localStorage.setItem('portia:notifs', val ? 'on' : 'off');
    if (val && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function toggleTema(val) {
    setTemaOscuro(val);
    localStorage.setItem('portia:tema', val ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light');
  }

  const nombre    = perfil?.nombre || perfil?.email?.split('@')[0] || 'Conserje';
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const edificio  = perfil?.edificios?.nombre || '—';

  const activeLabel = SECTIONS.flatMap(s => s.items).find(i => i.id === section)?.label ?? '';

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'backdrop-in 180ms ease both',
      }}
    >
      <div style={{
        display: 'flex', width: 700, height: 520, maxWidth: '94vw', maxHeight: '88vh',
        borderRadius: 18, overflow: 'hidden',
        background: 'var(--bg-surface)',
        boxShadow: '0 24px 64px rgba(0,0,0,.28), 0 0 0 1px var(--border-line)',
        animation: 'spPageIn .22s cubic-bezier(.22,1,.36,1)',
      }}>

        {/* ── Left sidebar ── */}
        <div style={{
          width: 210, flexShrink: 0, background: 'var(--bg-base)',
          borderRight: '1px solid var(--border-line)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 14px 10px', borderBottom: '1px solid var(--border-line)',
          }}>
            <span style={{
              fontSize: 14, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.3px',
              fontFamily: 'var(--font-heading)',
            }}>Ajustes</span>
            <button
              onClick={onClose}
              style={{
                width: 22, height: 22, borderRadius: '50%', border: 'none',
                background: 'var(--border-line)', color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}
            >✕</button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
            {SECTIONS.map(({ group, items }) => (
              <div key={group} style={{ marginBottom: 6 }}>
                <div style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px',
                  color: 'var(--text-muted)', padding: '5px 10px 3px',
                  fontFamily: 'var(--font-body)',
                }}>{group}</div>
                {items.map(item => (
                  <SpNavItem key={item.id} item={item} active={section === item.id} onClick={setSection} />
                ))}
              </div>
            ))}
          </nav>

          {/* User */}
          <div style={{
            borderTop: '1px solid var(--border-line)', padding: '10px 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'var(--info-tx)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
                fontFamily: 'var(--font-body)',
              }}>{iniciales}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Conserje · {edificio}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right content ── */}
        <div style={{ flex: 1, background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Content topbar */}
          <div style={{
            height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 20px',
            borderBottom: '1px solid var(--border-line)', background: 'var(--bg-section)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>{activeLabel}</span>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 28px' }}>

            {/* GENERAL */}
            {section === 'general' && (
              <div>
                <FieldGroup label="Sistema">
                  <ToggleRow
                    label="Notificaciones de escritorio"
                    sublabel="Alertas cuando hay novedades urgentes"
                    checked={notifs}
                    onChange={toggleNotifs}
                    last={true}
                  />
                </FieldGroup>
                <FieldGroup label="Texto">
                  <ZoomRow />
                </FieldGroup>
                <FieldGroup label="Versión">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>
                      Portia v{version}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                      Electron + React
                    </span>
                  </div>
                </FieldGroup>
              </div>
            )}

            {/* APARIENCIA */}
            {section === 'apariencia' && (
              <div>
                <FieldGroup label="Tema">
                  <ToggleRow
                    label="Tema oscuro"
                    sublabel="Superficies oscuras, mismo acento naranja"
                    checked={temaOscuro}
                    onChange={toggleTema}
                    last={true}
                  />
                </FieldGroup>
                <FieldGroup label="Zoom">
                  <ZoomRow />
                </FieldGroup>
              </div>
            )}

            {/* PERFIL */}
            {section === 'perfil' && (
              <div>
                <FieldGroup label="Información">
                  <InfoRow label="Nombre" value={perfil?.nombre} />
                  <InfoRow label="Correo" value={perfil?.email} />
                  <InfoRow label="Rol" value="Conserje" last={true} />
                </FieldGroup>
                <FieldGroup label="Sesión">
                  <div style={{ padding: '11px 14px' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 10 }}>
                      Para cambiar tu contraseña, usarás el correo de recuperación que Supabase envía.
                    </div>
                    <button
                      style={{
                        padding: '7px 16px', borderRadius: 980, border: 'none',
                        background: 'var(--info-tx)', color: '#fff', fontSize: 12,
                        fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}
                      onClick={() => {
                        import('../lib/supabase').then(({ supabase }) => {
                          if (perfil?.email) supabase.auth.resetPasswordForEmail(perfil.email);
                        });
                      }}
                    >
                      Enviar link de cambio de contraseña
                    </button>
                  </div>
                </FieldGroup>
              </div>
            )}

            {/* EDIFICIO */}
            {section === 'edificio' && (
              <div>
                <FieldGroup label="Este edificio">
                  <InfoRow label="Nombre" value={perfil?.edificios?.nombre} />
                  <InfoRow label="Dirección" value={perfil?.edificios?.direccion} />
                  <InfoRow label="Comuna" value={perfil?.edificios?.comuna} />
                  <InfoRow label="ID" value={perfil?.edificio_id} last={true} />
                </FieldGroup>
                <div style={{
                  background: 'var(--info-bg)', border: '1px solid rgba(27,42,74,0.12)',
                  borderRadius: 12, padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55,
                }}>
                  Para cambiar los datos del edificio, contacta al administrador del sistema.
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
