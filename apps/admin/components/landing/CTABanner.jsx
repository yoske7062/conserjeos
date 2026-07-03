'use client';
import Reveal from './Reveal';

export default function CTABanner() {
  return (
    <section id="cta" style={{ padding: '20px 24px 110px' }}>
      <Reveal>
        <div style={{
          maxWidth: 1180, margin: '0 auto', position: 'relative', overflow: 'hidden',
          borderRadius: 24, border: '1px solid rgba(var(--green-rgb),0.3)',
          background: 'linear-gradient(135deg, rgba(var(--green-rgb),0.14), var(--bg-surface) 60%)',
          padding: 'clamp(40px, 6vw, 64px)', textAlign: 'center',
        }}>
          <div aria-hidden style={{
            position: 'absolute', bottom: -120, right: -80, width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(var(--green-rgb),0.18), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.025em',
            color: 'var(--text)', marginBottom: 16, position: 'relative',
          }}>
            ¿Listo para ordenar tu edificio?
          </h2>
          <p style={{ fontSize: 16.5, color: 'var(--text-body)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6, position: 'relative' }}>
            Cuéntanos sobre tu edificio y te mostramos Portia funcionando con tu propia conserjería.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', position: 'relative' }}>
            <a href="mailto:hola@portia.cl?subject=Quiero%20una%20demo%20de%20Portia" style={{
              height: 52, padding: '0 28px', background: 'var(--green)', borderRadius: 12,
              color: 'var(--green-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 9,
              boxShadow: '0 14px 34px -12px rgba(var(--green-rgb),0.55)',
            }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>mail</span>
              Solicitar demo
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
