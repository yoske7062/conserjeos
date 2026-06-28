'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const INK    = '#0a0a0a';
const INK2   = '#555';
const INK3   = '#999';
const ORANGE = '#E64E1B';
const LINE   = 'rgba(0,0,0,0.08)';
const HEAD   = "'Sora', system-ui, sans-serif";
const BODY   = "'Manrope', system-ui, sans-serif";
const EYE    = { fontFamily: BODY, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.26em', fontWeight: 500, color: ORANGE };

const GH_BASE = 'https://github.com/yoske7062/conserjeos/releases/download/v1.1.8';
function descargar() {
  const ua = navigator.userAgent;
  if (/Win/i.test(ua)) { window.location.href = `${GH_BASE}/Portia-Setup-1.1.0.exe`; return; }
  const isArm = /arm64|aarch64/i.test(navigator.platform + ua) || typeof navigator.gpu !== 'undefined';
  window.location.href = isArm ? `${GH_BASE}/Portia-1.1.0-arm64.dmg` : `${GH_BASE}/Portia-1.1.0-x64.dmg`;
}

function Mark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill={ORANGE}/>
      <path d="M9 7h5.8c1.5 0 2.7.4 3.5 1.2.8.8 1.2 1.8 1.2 3.1s-.4 2.4-1.2 3.1c-.8.8-2 1.2-3.5 1.2H11.4V21H9V7zm2.4 6.6h3.2c.9 0 1.5-.2 2-.6.4-.4.6-.9.6-1.7s-.2-1.3-.6-1.7c-.4-.4-1.1-.6-2-.6h-3.2v4.6z" fill="white"/>
    </svg>
  );
}

function Logo({ size = 'nav' }) {
  const s = size === 'nav' ? { mark: 24, font: 19, gap: 10 } : { mark: 30, font: 24, gap: 12 };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap }}>
      <Mark size={s.mark} />
      <span style={{ fontFamily: HEAD, fontWeight: 300, fontSize: s.font, letterSpacing: '0.08em', color: INK }}>PORTIA</span>
    </span>
  );
}

const FEATURES = [
  { i: '01', t: 'Novedades',   d: 'El libro de la portería, ahora imborrable. Urgentes, incidentes y avisos con foto y hora exacta.' },
  { i: '02', t: 'Visitas',     d: 'Quién entra y quién sale, con RUT validado. La trazabilidad que un edificio moderno necesita.' },
  { i: '03', t: 'Encomiendas', d: 'Cada paquete que llega queda anotado. Perecibles marcados como urgentes, aviso automático.' },
  { i: '04', t: 'Tareas',      d: 'El administrador asigna, el conserje ejecuta. Nada se pierde en WhatsApp.' },
  { i: '05', t: 'Turnos',      d: 'El cambio de turno deja de perder información. Resumen automático al siguiente conserje.' },
  { i: '06', t: 'Panel admin', d: 'El administrador ve todo en tiempo real desde el navegador. Sin instalar nada.' },
];

const PASOS = [
  { n: '01', t: 'Instala en portería',     d: 'El conserje descarga Portia. Mac o Windows, dos minutos de configuración.' },
  { n: '02', t: 'El admin entra a la web', d: 'Desde cualquier navegador. Sin contraseñas manuales.' },
  { n: '03', t: 'Todo en tiempo real',     d: 'Lo que ocurre en portería aparece al instante en el panel.' },
];

const fadeUp   = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.16, 0.84, 0.44, 1] } } };
const stag     = (d = 0) => ({ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 0.84, 0.44, 1], delay: d } } });
const listCont = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const listItem = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 0.84, 0.44, 1] } } };

export default function Landing() {
  return (
    <div style={{ background: '#fff', color: INK, fontFamily: BODY, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=Manrope:wght@300;400;500;600&display=swap');

        @keyframes portiaScroll {
          0%   { transform:scaleY(0); transform-origin:top }
          45%  { transform:scaleY(1); transform-origin:top }
          55%  { transform:scaleY(1); transform-origin:bottom }
          100% { transform:scaleY(0); transform-origin:bottom }
        }

        .pnl { position:relative; text-decoration:none; }
        .pnl::after { content:''; position:absolute; left:0; bottom:-3px; height:1.5px; width:100%; background:${ORANGE}; transform:scaleX(0); transform-origin:right; transition:transform .4s cubic-bezier(.16,.84,.44,1); }
        .pnl:hover::after { transform:scaleX(1); transform-origin:left; }

        .pbtn-fill { transition:transform .2s ease, box-shadow .3s ease; }
        .pbtn-fill:hover { transform:translateY(-2px); box-shadow:0 16px 36px -10px rgba(230,78,27,0.44); }
        .pbtn-ghost { transition:background .22s, color .22s, border-color .22s, transform .2s; }
        .pbtn-ghost:hover { background:${INK}!important; color:#fff!important; border-color:${INK}!important; transform:translateY(-2px); }

        .pf-row { transition:background .3s; cursor:default; }
        .pf-row:hover { background:rgba(0,0,0,0.025); }
        .pf-row:hover .pf-t { color:${ORANGE}!important; }
        .pf-row:hover .pf-arr { opacity:1!important; transform:none!important; }

        .pfl { text-decoration:none; color:${INK2}; transition:color .2s; display:block; }
        .pfl:hover { color:${INK}!important; }

        @media(max-width:860px){
          .pmob-hide { display:none!important; }
          .pp { padding-left:22px!important; padding-right:22px!important; }
          .psteps { grid-template-columns:1fr!important; gap:40px!important; }
          .pfgrid { grid-template-columns:44px 1fr 40px!important; }
          .pf-desc { display:none!important; }
          .pfootg { grid-template-columns:1fr!important; gap:28px!important; }
          .phero-h1 { font-size: clamp(64px,18vw,160px)!important; }
        }
      `}</style>

      {/* ── TOPBAR ───────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="pp" style={{ maxWidth: 1280, margin: '0 auto', padding: '10px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: BODY, fontSize: 13, color: INK2 }}>hola@portia.cl</span>
          <span className="pmob-hide" style={{ ...EYE, fontSize: 11, color: INK3 }}>Santiago de Chile</span>
        </div>
      </div>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${LINE}` }}>
        <div className="pp" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size="nav" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="#funciones" className="pnl pmob-hide" style={{ fontFamily: BODY, fontSize: 14, color: INK, fontWeight: 400 }}>Funciones</a>
            <a href="#como" className="pnl pmob-hide" style={{ fontFamily: BODY, fontSize: 14, color: INK, fontWeight: 400 }}>Cómo funciona</a>
            <button onClick={descargar} className="pnl pmob-hide" style={{ fontFamily: BODY, fontSize: 14, color: INK, fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Descargar</button>
            <Link href="/login" className="pbtn-ghost" style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: INK, textDecoration: 'none', border: `1.5px solid ${INK}`, borderRadius: 100, padding: '8px 20px' }}>Panel admin</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="pp" style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 48px 80px', minHeight: 'calc(100vh - 112px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <motion.p variants={stag(0)} initial="hidden" animate="show" style={{ ...EYE, marginBottom: 40 }}>
          Conserjería digital · Chile
        </motion.p>

        <motion.h1
          variants={stag(0.1)} initial="hidden" animate="show"
          className="phero-h1"
          style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(72px,14vw,180px)', letterSpacing: '-0.03em', lineHeight: 0.9, color: INK, margin: '0 0 48px', maxWidth: 1100 }}
        >
          Tu edificio.<br/>
          <span style={{ color: ORANGE }}>En orden.</span>
        </motion.h1>

        <motion.p variants={stag(0.22)} initial="hidden" animate="show" style={{ fontFamily: BODY, fontWeight: 300, fontSize: 'clamp(17px,1.8vw,22px)', color: INK2, maxWidth: 480, lineHeight: 1.6, margin: '0 0 48px' }}>
          Portia reemplaza el cuaderno de la portería. Novedades, visitas, encomiendas y turnos — todo digital, todo trazado.
        </motion.p>

        <motion.div variants={stag(0.34)} initial="hidden" animate="show" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={descargar} className="pbtn-fill" style={{ fontFamily: BODY, fontWeight: 500, fontSize: 16, color: '#fff', background: ORANGE, border: `1.5px solid ${ORANGE}`, borderRadius: 100, padding: '14px 34px', cursor: 'pointer' }}>
            Descargar gratis
          </button>
          <Link href="/login" className="pbtn-ghost" style={{ fontFamily: BODY, fontWeight: 500, fontSize: 16, color: INK, textDecoration: 'none', border: `1.5px solid ${INK}`, borderRadius: 100, padding: '14px 34px', display: 'inline-block' }}>
            Soy administrador
          </Link>
        </motion.div>

        <div style={{ marginTop: 'auto', paddingTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ ...EYE, fontSize: 10, color: INK3 }}>Scroll</span>
          <div style={{ width: 1, height: 52, background: LINE, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: ORANGE, animation: 'portiaScroll 2.6s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, background: '#fafafa' }}>
        <div className="pp" style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 48px', display: 'flex', gap: 0, justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {[
            ['Mac + Windows', 'Corre en cualquier equipo'],
            ['100% offline', 'Sin internet, sigue andando'],
            ['Gratis', 'Sin contratos ni tarjetas'],
          ].map(([val, label]) => (
            <div key={val} style={{ textAlign: 'center', padding: '8px 24px' }}>
              <div style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 28, letterSpacing: '-0.02em', color: INK }}>{val}</div>
              <div style={{ fontFamily: BODY, fontWeight: 400, fontSize: 13, color: INK3, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MANIFIESTO ───────────────────────────────────────────────────── */}
      <section className="pp" style={{ maxWidth: 1280, margin: '0 auto', padding: '120px 48px' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}>
          <p style={{ ...EYE, marginBottom: 28 }}>El problema</p>
          <p style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(28px,4vw,54px)', lineHeight: 1.15, letterSpacing: '-0.02em', color: INK, margin: 0, maxWidth: 820 }}>
            Los conserjes de Chile gestionan visitas, encomiendas y novedades en <span style={{ textDecoration: 'line-through', color: INK3 }}>cuadernos y WhatsApp</span>.{' '}
            <span style={{ color: ORANGE, fontWeight: 500 }}>Portia lo cambia.</span>
          </p>
        </motion.div>
      </section>

      {/* ── FUNCIONES ────────────────────────────────────────────────────── */}
      <section id="funciones" style={{ borderTop: `1px solid ${LINE}`, padding: '80px 48px 100px' }} className="pp">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
            style={{ marginBottom: 64 }}>
            <p style={{ ...EYE, marginBottom: 20 }}>Funciones</p>
            <h2 style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(32px,4vw,56px)', letterSpacing: '-0.025em', lineHeight: 1.05, margin: 0, color: INK, maxWidth: 640 }}>
              Todo lo que pasa en portería,{' '}<span style={{ fontWeight: 600 }}>en un solo lugar.</span>
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={listCont} style={{ borderTop: `1px solid ${LINE}` }}>
            {FEATURES.map((f) => (
              <motion.div key={f.i} variants={listItem} className="pf-row" style={{ borderBottom: `1px solid ${LINE}` }}>
                <div className="pfgrid" style={{ display: 'grid', gridTemplateColumns: '60px 1.2fr 2fr 48px', alignItems: 'center', gap: 24, padding: '24px 12px' }}>
                  <span style={{ ...EYE, fontSize: 11, color: INK3 }}>{f.i}</span>
                  <h3 className="pf-t" style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(20px,2.2vw,30px)', letterSpacing: '-0.015em', color: INK, margin: 0, transition: 'color .3s' }}>{f.t}</h3>
                  <p className="pf-desc" style={{ fontFamily: BODY, fontWeight: 300, fontSize: 15, lineHeight: 1.65, color: INK2, margin: 0 }}>{f.d}</p>
                  <span className="pf-arr" style={{ justifySelf: 'end', fontSize: 20, color: ORANGE, opacity: 0, transform: 'translate(-6px,6px)', transition: 'opacity .3s, transform .3s' }}>↗</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────── */}
      <section id="como" style={{ borderTop: `1px solid ${LINE}`, background: '#fafafa', padding: '80px 48px 100px' }} className="pp">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp} style={{ marginBottom: 72 }}>
            <p style={{ ...EYE, marginBottom: 20 }}>Cómo funciona</p>
            <h2 style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(32px,4vw,56px)', letterSpacing: '-0.025em', margin: 0, color: INK }}>
              Tres pasos.{' '}<span style={{ fontWeight: 600 }}>Una tarde.</span>
            </h2>
          </motion.div>

          <motion.div className="psteps" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={listCont}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
            {PASOS.map((s, i) => (
              <motion.div key={s.n} variants={listItem} style={{ padding: '0 40px 0 0', paddingRight: i < 2 ? 40 : 0, borderRight: i < 2 ? `1px solid ${LINE}` : 'none', paddingLeft: i > 0 ? 40 : 0 }}>
                <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 11, color: ORANGE, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>{s.n}</div>
                <h3 style={{ fontFamily: HEAD, fontWeight: 400, fontSize: 22, letterSpacing: '-0.01em', color: INK, margin: '0 0 12px' }}>{s.t}</h3>
                <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: 15, lineHeight: 1.7, color: INK2, margin: 0 }}>{s.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="pp" style={{ padding: '100px 48px 120px', textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}>
          <p style={{ ...EYE, marginBottom: 28 }}>Empieza hoy</p>
          <h2 style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(40px,7vw,96px)', letterSpacing: '-0.03em', lineHeight: 0.94, color: INK, margin: '0 0 24px' }}>
            Pon tu edificio<br/><span style={{ fontWeight: 600, color: ORANGE }}>en orden.</span>
          </h2>
          <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: 18, color: INK2, margin: '0 auto 48px', maxWidth: 380, lineHeight: 1.6 }}>
            Gratis. Sin contratos. Dos minutos de instalación.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={descargar} className="pbtn-fill" style={{ fontFamily: BODY, fontWeight: 500, fontSize: 16, color: '#fff', background: ORANGE, border: `1.5px solid ${ORANGE}`, borderRadius: 100, padding: '14px 36px', cursor: 'pointer' }}>Descargar gratis</button>
            <Link href="/login" className="pbtn-ghost" style={{ fontFamily: BODY, fontWeight: 500, fontSize: 16, color: INK, textDecoration: 'none', border: `1.5px solid ${INK}`, borderRadius: 100, padding: '14px 36px', display: 'inline-block' }}>Soy administrador</Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${LINE}`, padding: '0 48px 44px' }} className="pp">
        <div className="pfootg" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, paddingTop: 48, paddingBottom: 40, borderBottom: `1px solid ${LINE}` }}>
          <div>
            <div style={{ marginBottom: 16 }}><Logo size="foot" /></div>
            <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: 15, color: INK2, maxWidth: 300, lineHeight: 1.7, margin: 0 }}>
              El sistema operativo de la conserjería chilena. Hecho para conserjes reales, en edificios reales.
            </p>
          </div>
          <div>
            <div style={{ ...EYE, fontSize: 11, color: INK3, marginBottom: 18 }}>Producto</div>
            <button onClick={descargar} className="pfl" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: BODY, fontSize: 15, padding: '0 0 11px' }}>Descargar app</button>
            <Link href="/login" className="pfl" style={{ fontFamily: BODY, fontSize: 15, paddingBottom: 11 }}>Panel admin</Link>
          </div>
          <div>
            <div style={{ ...EYE, fontSize: 11, color: INK3, marginBottom: 18 }}>Contacto</div>
            <a href="mailto:hola@portia.cl" className="pfl" style={{ fontFamily: BODY, fontSize: 15, paddingBottom: 11 }}>hola@portia.cl</a>
            <span style={{ fontFamily: BODY, fontWeight: 300, fontSize: 15, color: INK3, display: 'block' }}>Santiago, Chile</span>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', paddingTop: 20, fontFamily: BODY, fontWeight: 300, fontSize: 13, color: INK3 }}>
          <span>© 2026 Portia</span>
          <span>Hecho en Chile</span>
        </div>
      </footer>
    </div>
  );
}
