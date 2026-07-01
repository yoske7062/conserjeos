import Reveal from './Reveal';

const STEPS = [
  {
    icon: 'desktop_windows',
    title: 'El conserje inicia su turno',
    desc: 'Abre la app de escritorio Portia en el computador de conserjería e inicia turno. Así queda registrado quién está a cargo.',
  },
  {
    icon: 'bolt',
    title: 'Registra en el momento',
    desc: 'Cada novedad, visita o encomienda se registra al instante, con foto si corresponde. Sin papeles, sin esperar a anotarlo después.',
  },
  {
    icon: 'monitor',
    title: 'El administrador ve todo',
    desc: 'Desde el panel web, en tiempo real y desde donde esté: qué pasó en el edificio, quién está de turno y qué quedó pendiente.',
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" style={{ padding: '20px 24px 110px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 56px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Cómo funciona
            </p>
            <h2 style={{ fontSize: 'clamp(1.7rem,3vw,2.3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              De la conserjería al panel del administrador, en tres pasos
            </h2>
          </div>
        </Reveal>

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }} className="steps-grid">
          <div aria-hidden className="steps-line" style={{
            position: 'absolute', top: 27, left: '16.6%', right: '16.6%', height: 1,
            background: 'linear-gradient(90deg, transparent, var(--border), var(--border), transparent)',
          }} />
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <div style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', margin: '0 auto 22px',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1,
                }}>
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 25, color: 'var(--green)' }}>{s.icon}</span>
                  <span style={{
                    position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--green)', color: 'var(--green-text-on)', fontSize: 11.5, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-base)',
                  }}>{i + 1}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .steps-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .steps-line { display: none !important; }
        }
      `}</style>
    </section>
  );
}
