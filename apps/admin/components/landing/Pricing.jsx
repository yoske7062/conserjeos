'use client';
import Reveal from './Reveal';

export default function Pricing() {
  return (
    <section id="precios" style={{ padding: '20px 24px 110px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto 52px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Precios
            </p>
            <h2 style={{ fontSize: 'clamp(1.7rem,3vw,2.3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Empieza gratis. Crece con tu edificio.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Cada edificio es distinto, por eso preferimos conversar el plan contigo antes de cobrarte algo.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, maxWidth: 860, margin: '0 auto' }} className="pricing-grid">
          <Reveal delay={60}>
            <div style={{
              height: '100%', borderRadius: 18, border: '1px solid var(--border)',
              background: 'var(--bg-surface)', padding: '32px 28px', display: 'flex', flexDirection: 'column',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Prueba gratis
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--text)' }}>14 días</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Todas las funciones, sin tarjeta de crédito.</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', marginBottom: 28, flex: 1 }}>
                {['Novedades, visitas y encomiendas', 'App de escritorio para conserjería', 'Panel web para el administrador', 'Soporte por WhatsApp durante la prueba'].map(t => (
                  <li key={t} style={{ display: 'flex', gap: 9, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 17, color: 'var(--green)', flexShrink: 0 }}>check</span>
                    {t}
                  </li>
                ))}
              </ul>
              <button onClick={() => document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth' })} style={{
                height: 46, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text)', fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
              }}>
                Comenzar prueba gratis
              </button>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div style={{
              height: '100%', borderRadius: 18, border: '1px solid rgba(var(--green-rgb),0.35)',
              background: 'linear-gradient(180deg, rgba(var(--green-rgb),0.08), rgba(var(--green-rgb),0.02))',
              padding: '32px 28px', display: 'flex', flexDirection: 'column', position: 'relative',
            }}>
              <span style={{
                position: 'absolute', top: -12, right: 24, background: 'var(--green)', color: 'var(--green-text-on)',
                fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                Recomendado
              </span>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Plan para tu edificio
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--text)' }}>A medida</span>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Según el tamaño y las necesidades de tu edificio o administradora.</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', marginBottom: 28, flex: 1 }}>
                {['Todo lo de la prueba gratis', 'Múltiples conserjes y turnos', 'Onboarding guiado para tu equipo', 'Atención directa con el equipo Portia'].map(t => (
                  <li key={t} style={{ display: 'flex', gap: 9, fontSize: 14, color: 'var(--text)' }}>
                    <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 17, color: 'var(--green)', flexShrink: 0 }}>check</span>
                    {t}
                  </li>
                ))}
              </ul>
              <button onClick={() => document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth' })} style={{
                height: 46, borderRadius: 10, border: 'none', background: 'var(--green)',
                color: 'var(--green-text-on)', fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
              }}>
                Hablar con nosotros
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
