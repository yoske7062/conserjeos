'use client';
import { useState } from 'react';
import Reveal from './Reveal';

const QA = [
  { q: '¿Necesito instalar algo?', a: 'Sí, una app liviana para el computador de la conserjería. El panel del administrador funciona directo desde el navegador, sin instalar nada.' },
  { q: '¿Necesita internet para funcionar?', a: 'Sí. Portia sincroniza en tiempo real entre la conserjería y el panel del administrador, por lo que necesita conexión a internet.' },
  { q: '¿Cada edificio ve solo su información?', a: 'Sí. Los datos de cada edificio están aislados: nadie fuera de tu edificio puede ver tus novedades, visitas o encomiendas.' },
  { q: '¿Cuánto toma implementarlo?', a: 'En general un solo turno de capacitación basta para que el equipo de conserjería empiece a usarlo con confianza.' },
  { q: '¿Puedo probarlo antes de decidir?', a: 'Sí, tienes 14 días de prueba gratis con todas las funciones activas, sin necesidad de tarjeta de crédito.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" style={{ padding: '20px 24px 110px' }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Preguntas frecuentes
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem,2.8vw,2.1rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Lo que más nos preguntan
            </h2>
          </div>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {QA.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 50}>
                <div style={{
                  borderRadius: 14, border: '1px solid var(--border)',
                  background: 'var(--bg-surface)', overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 16, padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--text)' }}>{item.q}</span>
                    <span style={{
                      fontFamily: 'Material Symbols Outlined', fontSize: 20, color: 'var(--text-muted)',
                      transition: 'transform 200ms ease', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0,
                    }}>add</span>
                  </button>
                  <div style={{
                    maxHeight: isOpen ? 200 : 0, transition: 'max-height 260ms cubic-bezier(0.16,1,0.3,1)', overflow: 'hidden',
                  }}>
                    <p style={{ padding: '0 22px 20px', fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{item.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
