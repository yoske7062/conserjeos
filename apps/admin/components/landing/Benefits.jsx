import Reveal from './Reveal';

const ITEMS = [
  { icon: 'visibility', title: 'Visibilidad total', desc: 'Sabes qué pasa en tu edificio sin tener que llamar a conserjería a preguntar.' },
  { icon: 'history', title: 'Nada se pierde', desc: 'El historial sigue ahí aunque cambie el conserje de turno o pase el tiempo.' },
  { icon: 'bar_chart', title: 'Datos para decidir', desc: 'Cuántas visitas, cuántos incidentes, qué tan rápido se resuelven las novedades.' },
  { icon: 'schedule', title: 'Implementación rápida', desc: 'Tu equipo de conserjería aprende a usarlo en un turno, sin capacitación extensa.' },
];

export default function Benefits() {
  return (
    <section style={{ padding: '20px 24px 110px' }}>
      <div style={{
        maxWidth: 1180, margin: '0 auto', borderRadius: 22, border: '1px solid var(--border)',
        background: 'var(--bg-surface)', padding: 'clamp(36px, 5vw, 56px)',
        display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 48, alignItems: 'center',
      }} className="benefits-grid">
        <Reveal>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Para administradores
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.1rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16 }}>
              Administra el edificio, no persigas información
            </h2>
            <p style={{ fontSize: 15.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>
              Portia centraliza lo que hoy está repartido entre cuadernos, planillas y llamadas telefónicas,
              para que tu tiempo se vaya en decidir, no en buscar.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }} className="benefits-items">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={i * 70}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(var(--green-rgb),0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 19, color: 'var(--green)' }}>{it.icon}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text)', marginBottom: 5 }}>{it.title}</h3>
                  <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>{it.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .benefits-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .benefits-items { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
