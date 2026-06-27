import { useState, useEffect } from 'react';

const SECTIONS = [
  {
    group: 'App',
    items: [
      {
        id: 'general', label: 'General',
        iconBg: '#6b7280',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
      },
      {
        id: 'apariencia', label: 'Apariencia',
        iconBg: '#4f46e5',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none"/></svg>,
      },
    ],
  },
  {
    group: 'Cuenta',
    items: [
      {
        id: 'perfil', label: 'Mi perfil',
        iconBg: '#7c3aed',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      },
      {
        id: 'edificio', label: 'Edificio',
        iconBg: '#0ea5e9',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="19" rx="2"/><path d="M2 9h20"/><path d="M9 21V9"/><circle cx="5.5" cy="6" r="1" fill="currentColor" stroke="none"/></svg>,
      },
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
        display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '6px 9px',
        borderRadius: 7, border: 'none', textAlign: 'left', cursor: 'pointer',
        fontSize: 12.5, fontWeight: active ? 700 : 600,
        color: active ? '#fff' : hov ? '#e2e0f4' : '#a3a8bd',
        background: active ? 'rgba(124,58,237,.22)' : hov ? 'rgba(255,255,255,.07)' : 'transparent',
        boxShadow: active ? 'inset 0 0 0 1px rgba(124,58,237,.2)' : 'none',
        transition: 'background .12s, color .12s',
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: 6, background: item.iconBg, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
      }}>
        <span style={{ width: 13, height: 13, display: 'flex' }}>{item.icon}</span>
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
      }}>{label}</div>
      <div style={{
        background: 'var(--bg-surface-high)', border: '1px solid var(--border)',
        borderRadius: 10, overflow: 'hidden',
      }}>{children}</div>
    </div>
  );
}

function ToggleRow({ label, sublabel, checked, onChange, last }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 14px', cursor: 'pointer',
      borderBottom: last ? 'none' : '1px solid var(--border)',
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
      borderBottom: last ? 'none' : '1px solid var(--border)',
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
  const [darkMode, setDarkMode] = useState(
    () => (localStorage.getItem('portia:tema') || 'light') === 'dark'
  );
  const [notifs, setNotifs] = useState(
    () => localStorage.getItem('portia:notifs') !== 'off'
  );
  const [version, setVersion] = useState('—');

  useEffect(() => {
    const savedZoom = localStorage.getItem('portia:zoom');
    if (savedZoom) document.documentElement.style.zoom = parseInt(savedZoom) / 100;
    window.electron?.getVersion?.().then(v => setVersion(v)).catch(() => {});
  }, []);

  function toggleDark(val) {
    setDarkMode(val);
    const tema = val ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('portia:tema', tema);
  }

  function toggleNotifs(val) {
    setNotifs(val);
    localStorage.setItem('portia:notifs', val ? 'on' : 'off');
    if (val && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
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
        background: 'rgba(0,0,0,.38)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'backdrop-in 180ms ease both',
      }}
    >
      <div style={{
        display: 'flex', width: 700, height: 520, maxWidth: '94vw', maxHeight: '88vh',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.06)',
        animation: 'spPageIn .22s cubic-bezier(.22,1,.36,1)',
      }}>

        {/* ── Left sidebar ── */}
        <div style={{
          width: 210, flexShrink: 0, background: '#12101f',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 14px 10px', borderBottom: '1px solid rgba(255,255,255,.07)',
          }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', letterSpacing: '-.3px' }}>Ajustes</span>
            <button
              onClick={onClose}
              style={{
                width: 22, height: 22, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,.1)', color: '#a3a8bd', cursor: 'pointer',
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
                  color: 'rgba(163,168,189,.45)', padding: '5px 9px 3px',
                }}>{group}</div>
                {items.map(item => (
                  <SpNavItem key={item.id} item={item} active={section === item.id} onClick={setSection} />
                ))}
              </div>
            ))}
          </nav>

          {/* User */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,.07)', padding: '10px 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#fff',
              }}>{iniciales}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
                <div style={{ fontSize: 10, color: '#a3a8bd', marginTop: 1 }}>Conserje · {edificio}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right content ── */}
        <div style={{ flex: 1, background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Content topbar */}
          <div style={{
            height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 20px',
            borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-high)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{activeLabel}</span>
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
                    label="Dark mode"
                    sublabel="Fondo oscuro, ideal para turnos nocturnos"
                    checked={darkMode}
                    onChange={toggleDark}
                    last={true}
                  />
                </FieldGroup>
                <FieldGroup label="Paleta actual">
                  <div style={{ padding: '13px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {darkMode ? 'Dark — fondo #0c0b0a + acento slate' : 'Light — fondo #ede6db + acento navy'}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['var(--bg-base)', 'var(--bg-surface)', 'var(--brand)', '#7c3aed', 'var(--ok-tx)', 'var(--warn-tx)', 'var(--crit-tx)'].map((c, i) => (
                        <div key={i} style={{ width: 26, height: 26, borderRadius: 6, background: c, border: '1.5px solid var(--border)' }} />
                      ))}
                    </div>
                  </div>
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
                        padding: '7px 16px', borderRadius: 8, border: 'none',
                        background: 'var(--brand)', color: '#fff', fontSize: 12,
                        fontWeight: 700, cursor: 'pointer',
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
                  background: 'rgba(var(--brand-rgb),.06)', border: '1px solid rgba(var(--brand-rgb),.18)',
                  borderRadius: 10, padding: '11px 14px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55,
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
