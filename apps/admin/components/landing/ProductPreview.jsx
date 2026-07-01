const FEED = [
  { tipo: 'urgente', color: '#E5484D', icon: '◆', label: 'Urgente', text: 'Fuga de agua en estacionamiento -2', time: 'hace 6 min' },
  { tipo: 'info', color: '#3B9EFF', icon: 'ℹ', label: 'Informativo', text: 'Ascensor B en mantención programada', time: 'hace 41 min' },
  { tipo: 'incidente', color: '#FF6B3D', icon: '!', label: 'Incidente', text: 'Vehículo mal estacionado en visita 12', time: 'hace 2 h' },
];

export default function ProductPreview() {
  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: 560, borderRadius: 18,
      border: '1px solid var(--border)', background: 'var(--bg-surface)',
      boxShadow: '0 30px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02)',
      overflow: 'hidden',
    }}>
      {/* window chrome */}
      <div style={{
        height: 38, display: 'flex', alignItems: 'center', gap: 7, padding: '0 14px',
        borderBottom: '1px solid var(--border)', background: 'var(--bg-input)',
      }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF6058' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#27C93F' }} />
        <span style={{ marginLeft: 10, fontSize: 11, color: 'var(--text-muted)' }}>app.portia.cl/dashboard</span>
      </div>

      <div style={{ display: 'flex', minHeight: 360 }}>
        {/* mini sidebar */}
        <div style={{ width: 120, borderRight: '1px solid var(--border)', padding: '14px 8px', display: 'none' }} className="pp-sidebar">
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', padding: '0 6px 12px' }}>portia</div>
          {[
            ['home', 'Inicio', true],
            ['campaign', 'Novedades', false],
            ['group', 'Visitas', false],
            ['inventory_2', 'Encomiendas', false],
          ].map(([icon, label, active]) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 7, marginBottom: 2,
              background: active ? 'rgba(var(--green-rgb),0.12)' : 'transparent',
              color: active ? 'var(--green)' : 'var(--text-muted)', fontSize: 11.5, fontWeight: active ? 600 : 400,
            }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 15 }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* main */}
        <div style={{ flex: 1, padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Resumen del edificio</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Edificio Las Encinas · lunes 30 de junio</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 18 }}>
            {[
              ['group', 'Visitas ahora', '7', '#2FBF71'],
              ['inventory_2', 'Encomiendas', '12', '#F5A524'],
              ['checklist', 'Tareas', '3', 'var(--green)'],
            ].map(([icon, label, value, color]) => (
              <div key={label} style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 12, color }}>{icon}</span>
                </div>
                <p style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)' }}>{value}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Novedades recientes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {FEED.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px',
                background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 9,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${f.color}1f`, color: f.color, fontSize: 11, fontWeight: 700,
                }}>{f.icon}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 11.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.text}</p>
                </div>
                <span style={{ fontSize: 9.5, color: 'var(--text-subtle)', flexShrink: 0 }}>{f.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 520px) { .pp-sidebar { display: block !important; } }
      `}</style>
    </div>
  );
}
