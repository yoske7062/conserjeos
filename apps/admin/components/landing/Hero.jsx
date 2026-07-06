'use client';
import ProductPreview from './ProductPreview';
import Reveal from './Reveal';

export default function Hero() {
  function goCta() {
    document.querySelector('#cta')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function goComoFunciona() {
    document.querySelector('#como-funciona')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section id="top" style={{ position: 'relative', overflow: 'hidden', paddingTop: 64 }}>
      {/* ambient glow */}
      <div aria-hidden style={{
        position: 'absolute', top: -160, left: '50%', transform: 'translateX(-50%)',
        width: 900, height: 560, borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(var(--green-rgb),0.16), transparent 70%)',
        filter: 'blur(10px)', pointerEvents: 'none', animation: 'floatSlow 16s ease-in-out infinite',
      }} />

      <div style={{
        maxWidth: 1180, margin: '0 auto', padding: '76px 24px 96px',
        display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center',
        position: 'relative', zIndex: 1,
      }} className="hero-grid">
        <div>
          <Reveal>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px',
              borderRadius: 999, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)',
              fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 22,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 0 3px rgba(var(--green-rgb),0.18)' }} />
              Hecho para administradores de edificios en Chile
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h1 style={{
              fontSize: 'clamp(2.4rem, 4.6vw, 3.6rem)', fontWeight: 800, lineHeight: 1.05,
              letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 22,
            }}>
              Tu edificio.<br />
              <span style={{ color: 'var(--green)' }}>Todo en orden.</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p style={{ fontSize: 17.5, lineHeight: 1.6, color: 'var(--text-body)', maxWidth: 480, marginBottom: 34 }}>
              Portia reemplaza el cuaderno de novedades, el registro de visitas y la planilla de encomiendas
              por un sistema en tiempo real que tu conserjería aprende a usar en un turno.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 38 }}>
              <button onClick={goCta} style={{
                height: 50, padding: '0 24px', background: 'var(--green)', border: 'none',
                borderRadius: 11, color: 'var(--green-text-on)', fontSize: 15.5, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 10px 30px -10px rgba(var(--green-rgb),0.55)',
              }}>
                Solicitar demo
              </button>
              <button onClick={goComoFunciona} style={{
                height: 50, padding: '0 22px', background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 11, color: 'var(--text)', fontSize: 15.5, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 19 }}>play_circle</span>
                Ver cómo funciona
              </button>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, color: 'var(--text-muted)', fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: 'var(--green)' }}>check_circle</span>
                14 días gratis
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: 'var(--green)' }}>check_circle</span>
                Sin tarjeta para partir
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={140} as="div" style={{ display: 'flex', justifyContent: 'center' }}>
          <ProductPreview />
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 940px) {
          .hero-grid { grid-template-columns: 1fr !important; padding-top: 8px !important; }
        }
      `}</style>
    </section>
  );
}
