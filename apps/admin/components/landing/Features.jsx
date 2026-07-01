import Reveal from './Reveal';

const FEATURES = [
  {
    icon: 'campaign', color: '#3B9EFF',
    title: 'Novedades',
    desc: 'El libro de novedades, pero digital. Urgencias, incidentes e información general con foto, en tiempo real y sin que se pierda nunca.',
    points: ['Clasificación por tipo y urgencia', 'Foto adjunta en cada registro', 'Visible al instante para el administrador'],
  },
  {
    icon: 'group', color: '#2FBF71',
    title: 'Visitas',
    desc: 'Control de acceso simple: quién entra, a quién visita y cuándo sale. Todo queda en un historial que se puede buscar en segundos.',
    points: ['Entrada y salida con un toque', 'Historial completo y buscable', 'Visitas activas visibles en todo momento'],
  },
  {
    icon: 'inventory_2', color: '#F5A524',
    title: 'Encomiendas',
    desc: 'Registra cada paquete con foto al llegar y márcalo entregado al retirarlo. Se acabaron los paquetes perdidos en bodega.',
    points: ['Foto del paquete al ingresar', 'Pendientes vs. entregadas, siempre claro', 'Trazabilidad completa por residente'],
  },
];

export default function Features() {
  return (
    <section id="producto" style={{ padding: '40px 24px 110px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 52px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Producto
            </p>
            <h2 style={{ fontSize: 'clamp(1.7rem,3vw,2.3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Tres módulos. Una sola conserjería ordenada.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Todo lo que hoy se anota a mano, en un solo lugar conectado en tiempo real.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="feat-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div style={{
                height: '100%', borderRadius: 18, border: '1px solid var(--border)',
                background: 'var(--bg-surface)', padding: '30px 26px',
                transition: 'border-color 200ms ease, transform 200ms ease',
              }}
              className="feat-card"
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12, marginBottom: 20,
                  background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 24, color: f.color }}>{f.icon}</span>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>{f.desc}</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none' }}>
                  {f.points.map(p => (
                    <li key={p} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: f.color, flexShrink: 0 }}>check</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={260}>
          <div style={{
            marginTop: 20, borderRadius: 18, border: '1px solid var(--border)', background: 'var(--bg-surface)',
            padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
          }}>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', flex: '1 1 220px' }}>
              Más lo esencial para administrar el día a día:
            </p>
            {[['checklist', 'Tareas y pendientes'], ['badge', 'Turnos de conserjes']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 19, color: 'var(--green)' }}>{icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <style>{`
        .feat-card:hover { border-color: rgba(var(--green-rgb),0.35); transform: translateY(-3px); }
        @media (max-width: 940px) {
          .feat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
