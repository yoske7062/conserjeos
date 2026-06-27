'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const BONE   = '#E8E2D4';
const PAPER  = '#EFEADE';
const INK    = '#17150F';
const INK60  = 'rgba(23,21,15,0.58)';
const INK40  = 'rgba(23,21,15,0.40)';
const LINE   = 'rgba(23,21,15,0.16)';
const CLAY   = '#B6451F';

const SERIF = "'Bricolage Grotesque', system-ui, sans-serif";
const SANS  = "'Nunito', system-ui, sans-serif";

const CAPS = {
  fontFamily: SANS, fontSize: 11, fontWeight: 500,
  letterSpacing: '0.22em', textTransform: 'uppercase',
};

const INDEX = [
  { n: '01', t: 'Novedades',   d: 'El libro de la portería, ahora imborrable. Urgentes, incidentes y avisos con foto y hora exacta.' },
  { n: '02', t: 'Visitas',     d: 'Quién entra y quién sale, con nombre y registro. La trazabilidad que un edificio necesita.' },
  { n: '03', t: 'Encomiendas', d: 'Cada paquete que llega queda anotado. Se avisa al residente y se entrega con firma.' },
  { n: '04', t: 'Tareas',      d: 'Lo que el administrador pide, el conserje lo ve y lo cumple. Nada queda en el aire.' },
  { n: '05', t: 'Turnos',      d: 'El cambio de turno deja de perder información. Un resumen ordenado pasa al siguiente.' },
  { n: '06', t: 'Panel',       d: 'El administrador lo ve todo en vivo, desde el navegador, sin instalar nada.' },
];

const STEPS = [
  { r: 'I',   t: 'Se instala en portería',    d: 'El conserje abre Portia en el computador de la entrada. Mac o Windows.' },
  { r: 'II',  t: 'El admin entra a la web',    d: 'Desde cualquier navegador. Invita a su equipo por correo, sin contraseñas.' },
  { r: 'III', t: 'Todo en tiempo real',        d: 'Lo que ocurre en la portería aparece al instante en el panel.' },
];

const GH = 'https://github.com/yoske7062/conserjeos/releases';

export default function Landing() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

    const dot = cursorRef.current;
    let raf = 0, x = -100, y = -100, tx = -100, ty = -100;
    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      if (dot) dot.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };
    if (window.matchMedia('(pointer:fine)').matches) {
      window.addEventListener('mousemove', move);
      raf = requestAnimationFrame(loop);
    }
    return () => { io.disconnect(); window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div style={{ position: 'relative', background: BONE, color: INK, fontFamily: SANS, minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..700&family=Nunito:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        @keyframes riseIn { from { opacity: 0; transform: translateY(115%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity 1s cubic-bezier(.16,.84,.28,1), transform 1s cubic-bezier(.16,.84,.28,1); }
        [data-reveal].in { opacity: 1; transform: none; }
        .pia-line { display: block; overflow: hidden; }
        .pia-line > span { display: block; animation: riseIn 1.1s cubic-bezier(.16,.84,.28,1) both; }
        .pia-idx:hover .pia-idx-n { color: ${CLAY}; }
        .pia-idx:hover .pia-idx-t { transform: translateX(14px); color: ${CLAY}; }
        .pia-idx:hover .pia-idx-ar { opacity: 1; transform: translateX(0); }
        .pia-link { position: relative; }
        .pia-link::after { content: ''; position: absolute; left: 0; bottom: -3px; width: 100%; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: right; transition: transform .5s cubic-bezier(.16,.84,.28,1); }
        .pia-link:hover::after { transform: scaleX(1); transform-origin: left; }
        .pia-fill { transition: background .35s ease, color .35s ease; }
        .pia-fill:hover { background: ${INK} !important; color: ${BONE} !important; }
        .pia-cursor { mix-blend-mode: multiply; }
        @media (max-width: 860px) {
          .pia-hero-h { font-size: 56px !important; }
          .pia-cols { grid-template-columns: 1fr !important; }
          .pia-idx-row { grid-template-columns: 36px 1fr !important; }
          .pia-idx-d { display: none !important; }
          .pia-pad { padding-left: 22px !important; padding-right: 22px !important; }
          .pia-cursor { display: none !important; }
          .pia-quote { font-size: 34px !important; }
        }
      `}</style>

      <div ref={cursorRef} className="pia-cursor" aria-hidden style={{
        position: 'fixed', top: 0, left: 0, width: 11, height: 11, marginLeft: -5.5, marginTop: -5.5,
        borderRadius: '50%', background: CLAY, pointerEvents: 'none', zIndex: 999,
      }} />

      <div aria-hidden style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.5, mixBlendMode: 'multiply',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
      }} />

      {/* Top meta bar */}
      <div className="pia-pad" style={{
        position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '14px 48px', borderBottom: `1px solid ${LINE}`,
        ...CAPS, color: INK60,
      }}>
        <span>Santiago de Chile</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: CLAY, display: 'inline-block' }} />
          Sistema de conserjería
        </span>
        <span>Est. 2026</span>
      </div>

      {/* Nav */}
      <nav className="pia-pad" style={{
        position: 'sticky', top: 0, zIndex: 40, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '18px 48px', background: 'rgba(232,226,212,0.82)',
        backdropFilter: 'blur(10px)', borderBottom: `1px solid ${LINE}`,
      }}>
        <Link href="/" style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, color: INK, textDecoration: 'none', letterSpacing: '-0.01em' }}>
          Portia<span style={{ color: CLAY }}>.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <a href={GH} target="_blank" rel="noopener noreferrer" className="pia-link" style={{ ...CAPS, color: INK, textDecoration: 'none' }}>
            Descargar
          </a>
          <Link href="/login" className="pia-fill" style={{
            ...CAPS, color: INK, textDecoration: 'none', border: `1px solid ${INK}`,
            borderRadius: 40, padding: '10px 22px',
          }}>
            Acceder
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="pia-pad" style={{ position: 'relative', zIndex: 5, padding: '90px 48px 70px' }}>
        <div style={{ ...CAPS, color: CLAY, marginBottom: 30, animation: 'fadeUp .9s .1s both' }}>
          Conserjería digital para edificios
        </div>
        <h1 className="pia-hero-h" style={{
          fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(54px, 11vw, 158px)',
          lineHeight: 0.92, letterSpacing: '-0.035em', margin: 0,
        }}>
          <span className="pia-line"><span style={{ animationDelay: '0.05s' }}>Cada edificio</span></span>
          <span className="pia-line"><span style={{ animationDelay: '0.18s' }}>merece estar</span></span>
          <span className="pia-line"><span style={{ animationDelay: '0.31s', fontStyle: 'italic', color: CLAY }}>en orden.</span></span>
        </h1>

        <div className="pia-cols" style={{
          display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, marginTop: 56,
          alignItems: 'end', animation: 'fadeUp 1s .5s both',
        }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(20px, 2.4vw, 27px)', lineHeight: 1.4, fontWeight: 300, color: INK, maxWidth: 540, margin: 0 }}>
            Portia reemplaza el cuaderno de la portería por un sistema vivo:
            el conserje registra, el administrador observa, y el edificio entero
            funciona con la misma información, al mismo tiempo.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            <a href={GH} target="_blank" rel="noopener noreferrer" className="pia-fill" style={{
              ...CAPS, letterSpacing: '0.16em', color: BONE, background: INK, textDecoration: 'none',
              borderRadius: 44, padding: '17px 30px', border: `1px solid ${INK}`,
            }}>
              Descargar la app
            </a>
            <Link href="/login" className="pia-fill" style={{
              ...CAPS, letterSpacing: '0.16em', color: INK, textDecoration: 'none',
              borderRadius: 44, padding: '17px 30px', border: `1px solid ${INK}`,
            }}>
              Soy administrador
            </Link>
          </div>
        </div>
      </header>

      {/* Marquee */}
      <div style={{ position: 'relative', zIndex: 5, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, overflow: 'hidden', padding: '20px 0' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 32s linear infinite' }}>
          {[0, 1].map((k) => (
            <div key={k} aria-hidden={k === 1} style={{ display: 'flex', alignItems: 'center', paddingRight: 0 }}>
              {['Novedades', 'Visitas', 'Encomiendas', 'Tareas', 'Turnos', 'Panel en vivo'].map((w) => (
                <span key={w} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 42, padding: '0 30px', whiteSpace: 'nowrap', color: INK }}>{w}</span>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: CLAY }} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Manifesto */}
      <section className="pia-pad" data-reveal style={{ position: 'relative', zIndex: 5, padding: '110px 48px', maxWidth: 1000 }}>
        <div style={{ ...CAPS, color: INK40, marginBottom: 26 }}>— Manifiesto</div>
        <p style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 'clamp(26px, 4vw, 46px)', lineHeight: 1.25, letterSpacing: '-0.02em', margin: 0 }}>
          Una portería bien llevada es invisible. Nadie nota el paquete que
          llegó a tiempo, la visita que quedó registrada, el turno que se
          entregó completo. <span style={{ color: CLAY, fontStyle: 'italic' }}>Portia hace que eso pase, todos los días.</span>
        </p>
      </section>

      {/* Index */}
      <section className="pia-pad" style={{ position: 'relative', zIndex: 5, padding: '0 48px 40px' }}>
        <div data-reveal style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${INK}`, paddingBottom: 18, marginBottom: 6 }}>
          <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(30px, 4vw, 50px)', letterSpacing: '-0.02em', margin: 0 }}>
            Lo que hace
          </h2>
          <span style={{ ...CAPS, color: INK40 }}>Seis funciones</span>
        </div>

        {INDEX.map((it, i) => (
          <a key={it.n} href="/login" className="pia-idx" data-reveal style={{
            display: 'block', textDecoration: 'none', color: INK,
            borderBottom: `1px solid ${LINE}`, transitionDelay: `${i * 60}ms`,
          }}>
            <div className="pia-idx-row" style={{
              display: 'grid', gridTemplateColumns: '70px minmax(0,1.1fr) minmax(0,1.4fr) 40px',
              gap: 24, alignItems: 'center', padding: '30px 0',
            }}>
              <span className="pia-idx-n" style={{ ...CAPS, fontSize: 13, color: INK40, transition: 'color .4s ease' }}>{it.n}</span>
              <span className="pia-idx-t" style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.02em', transition: 'transform .5s cubic-bezier(.16,.84,.28,1), color .4s ease', display: 'inline-block' }}>{it.t}</span>
              <span className="pia-idx-d" style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: INK60 }}>{it.d}</span>
              <span className="pia-idx-ar" style={{ fontFamily: SERIF, fontSize: 28, color: CLAY, opacity: 0, transform: 'translateX(-12px)', transition: 'opacity .4s ease, transform .4s ease', justifySelf: 'end' }}>↗</span>
            </div>
          </a>
        ))}
      </section>

      {/* Pull quote */}
      <section className="pia-pad" data-reveal style={{ position: 'relative', zIndex: 5, padding: '120px 48px', textAlign: 'center' }}>
        <p className="pia-quote" style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 'clamp(34px, 6vw, 80px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 auto', maxWidth: 1100 }}>
          El orden no es un lujo. Es la base de un <span style={{ fontStyle: 'italic', color: CLAY }}>buen edificio</span>.
        </p>
      </section>

      {/* How it works */}
      <section className="pia-pad" style={{ position: 'relative', zIndex: 5, padding: '0 48px 110px' }}>
        <div data-reveal style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${INK}`, paddingBottom: 18, marginBottom: 50 }}>
          <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(30px, 4vw, 50px)', letterSpacing: '-0.02em', margin: 0 }}>Listo en una tarde</h2>
          <span style={{ ...CAPS, color: INK40 }}>Tres pasos</span>
        </div>
        <div className="pia-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
          {STEPS.map((s, i) => (
            <div key={s.r} data-reveal style={{ transitionDelay: `${i * 110}ms` }}>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 300, fontSize: 64, color: CLAY, lineHeight: 1, marginBottom: 22 }}>{s.r}</div>
              <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 26, letterSpacing: '-0.01em', margin: '0 0 12px' }}>{s.t}</h3>
              <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: INK60, margin: 0, maxWidth: 320 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pia-pad" data-reveal style={{
        position: 'relative', zIndex: 5, margin: '0 48px 90px', background: INK, color: BONE,
        borderRadius: 26, padding: 'clamp(48px, 8vw, 96px)', overflow: 'hidden',
      }}>
        <div style={{ ...CAPS, color: 'rgba(232,226,212,0.55)', marginBottom: 26 }}>— Empieza hoy</div>
        <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(40px, 7vw, 96px)', lineHeight: 0.98, letterSpacing: '-0.03em', margin: '0 0 40px', maxWidth: 900 }}>
          Pon tu edificio <span style={{ fontStyle: 'italic', color: '#E69A6B' }}>en orden</span>.
        </h2>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <a href={GH} target="_blank" rel="noopener noreferrer" style={{
            ...CAPS, letterSpacing: '0.16em', color: INK, background: BONE, textDecoration: 'none',
            borderRadius: 44, padding: '18px 32px',
          }}>
            Descargar gratis
          </a>
          <Link href="/login" style={{
            ...CAPS, letterSpacing: '0.16em', color: BONE, textDecoration: 'none',
            borderRadius: 44, padding: '18px 32px', border: '1px solid rgba(232,226,212,0.4)',
          }}>
            Entrar al panel
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="pia-pad" style={{ position: 'relative', zIndex: 5, padding: '0 48px 40px' }}>
        <div className="pia-cols" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, borderTop: `1px solid ${INK}`, paddingTop: 44 }}>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>
              Portia<span style={{ color: CLAY }}>.</span>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 14, color: INK60, marginTop: 16, maxWidth: 360, lineHeight: 1.6 }}>
              El sistema operativo de la conserjería chilena. Hecho para conserjes reales.
            </p>
          </div>
          <div>
            <div style={{ ...CAPS, color: INK40, marginBottom: 16 }}>Producto</div>
            {[['Descargar app', GH], ['Panel admin', '/login']].map(([l, h]) => (
              <a key={l} href={h} className="pia-link" style={{ display: 'block', fontFamily: SANS, fontSize: 15, color: INK, textDecoration: 'none', marginBottom: 10, width: 'fit-content' }}>{l}</a>
            ))}
          </div>
          <div>
            <div style={{ ...CAPS, color: INK40, marginBottom: 16 }}>Contacto</div>
            <a href="mailto:hola@portia.cl" className="pia-link" style={{ display: 'block', fontFamily: SANS, fontSize: 15, color: INK, textDecoration: 'none', marginBottom: 10, width: 'fit-content' }}>hola@portia.cl</a>
            <span style={{ fontFamily: SANS, fontSize: 15, color: INK60 }}>Santiago, Chile</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 44, ...CAPS, color: INK40 }}>
          <span>© 2026 Portia</span>
          <span>Hecho en Chile</span>
        </div>
      </footer>
    </div>
  );
}
