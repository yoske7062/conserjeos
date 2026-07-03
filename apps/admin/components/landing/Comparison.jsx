import Reveal from './Reveal';

const ANTES = [
  'Cuaderno físico que se pierde, se moja o se llena',
  'Letra ilegible y sin respaldo si pasa algo',
  'Cero visibilidad: hay que llamar para saber qué pasó',
  'La información se va con el conserje que cambia de turno',
];

const AHORA = [
  'Registro digital con foto, accesible desde cualquier parte',
  'Historial completo, ordenado y a prueba de cambios de turno',
  'El administrador ve todo en tiempo real desde el panel web',
  'Cada novedad, visita y encomienda queda guardada para siempre',
];

export default function Comparison() {
  return (
    <section style={{ padding: '20px 24px 100px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: 'clamp(1.7rem,3vw,2.3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              El cuaderno de novedades ya cumplió su rol
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Sigue siendo el método más usado en conserjerías chilenas. También el más fácil de perder.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="comp-grid">
          <Reveal delay={60}>
            <div style={{
              height: '100%', borderRadius: 18, border: '1px solid var(--border)',
              background: 'var(--bg-surface)', padding: '30px 28px',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
                Antes
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, listStyle: 'none' }}>
                {ANTES.map(item => (
                  <li key={item} style={{ display: 'flex', gap: 12, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--error)', flexShrink: 0 }}>close</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div style={{
              height: '100%', borderRadius: 18, border: '1px solid rgba(var(--green-rgb),0.3)',
              background: 'linear-gradient(180deg, rgba(var(--green-rgb),0.07), rgba(var(--green-rgb),0.02))',
              padding: '30px 28px', boxShadow: '0 0 0 1px rgba(var(--green-rgb),0.06)',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
                Con Portia
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, listStyle: 'none' }}>
                {AHORA.map(item => (
                  <li key={item} style={{ display: 'flex', gap: 12, fontSize: 15, color: 'var(--text)', lineHeight: 1.5 }}>
                    <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--green)', flexShrink: 0 }}>check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .comp-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
