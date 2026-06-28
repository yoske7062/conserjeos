'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ── Tokens — bloon-exact: Sora 300 / Manrope, white, navy, orange accent ── */
const INK   = '#003054';
const INK2  = '#5d7a92';
const INK3  = '#9ab0c4';
const ORANGE= '#E64E1B';
const LINE  = 'rgba(0,48,84,.09)';
const HEAD  = "'Sora', system-ui, sans-serif";
const BODY  = "'Manrope', system-ui, sans-serif";
const EYE   = { fontFamily: BODY, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.26em', fontWeight: 500, color: ORANGE };
const HALO  = 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.82) 48%, rgba(255,255,255,0) 100%)';

const GH_BASE = 'https://github.com/yoske7062/conserjeros/releases/download/v1.1.0';
function descargar() {
  const ua = navigator.userAgent;
  if (/Win/i.test(ua)) { window.location.href = `${GH_BASE}/Portia-Setup-1.0.0.exe`; return; }
  const isArm = /arm64|aarch64/i.test(navigator.platform + ua) || typeof navigator.gpu !== 'undefined';
  window.location.href = isArm ? `${GH_BASE}/Portia-1.0.0-arm64.dmg` : `${GH_BASE}/Portia-1.0.0-x64.dmg`;
}

/* ── Planet — dark navy body, orange-lit, like bloon's moon ─────────────── */
function Planet({ size = 380 }) {
  const px = (n) => `${n}px`;
  return (
    <div style={{ position: 'relative', width: px(size), height: px(size), flexShrink: 0 }}>
      {/* Atmospheric glow — naranja, grande, difuminado */}
      <div aria-hidden style={{
        position: 'absolute',
        inset: px(-size * 0.3),
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(230,78,27,0.22) 0%, rgba(230,78,27,0.08) 45%, transparent 72%)`,
        filter: `blur(${size * 0.04}px)`,
        pointerEvents: 'none',
      }} />
      {/* Sphere body */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
        background: `radial-gradient(circle at 68% 30%, #4a6a8c 0%, #1e3a56 28%, #0d1f30 60%, #060e18 100%)`,
        boxShadow: [
          `inset ${px(size*0.06)} ${px(size*0.06)} ${px(size*0.18)} rgba(230,100,40,0.35)`,
          `inset ${px(-size*0.08)} ${px(-size*0.1)} ${px(size*0.22)} rgba(0,0,0,0.7)`,
          `0 ${px(size*0.06)} ${px(size*0.3)} ${px(-size*0.06)} rgba(230,78,27,0.28)`,
          `0 ${px(size*0.14)} ${px(size*0.5)} ${px(-size*0.1)} rgba(0,0,0,0.25)`,
        ].join(', '),
      }}>
        {/* Surface detail — subtle terrain bands */}
        {[
          { top: '22%', left: '55%', w: '28%', h: '14%', op: 0.12 },
          { top: '44%', left: '18%', w: '22%', h: '10%', op: 0.09 },
          { top: '62%', left: '60%', w: '18%', h: '8%',  op: 0.10 },
          { top: '30%', left: '30%', w: '14%', h: '12%', op: 0.08 },
        ].map((b, i) => (
          <div key={i} aria-hidden style={{
            position: 'absolute', left: b.left, top: b.top, width: b.w, height: b.h,
            borderRadius: '50%', transform: 'translate(-50%,-50%)',
            background: `rgba(255,255,255,${b.op})`, filter: 'blur(6px)',
          }} />
        ))}
        {/* Orange rim light — right edge */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `radial-gradient(circle at 82% 22%, rgba(255,130,60,0.45) 0%, rgba(230,78,27,0.18) 30%, transparent 60%)`,
        }} />
        {/* Subtle specular */}
        <div aria-hidden style={{
          position: 'absolute', top: '8%', left: '52%', width: '22%', height: '16%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(200,220,255,0.55) 0%, transparent 70%)`,
          filter: 'blur(3px)',
        }} />
      </div>
      {/* Ground shadow */}
      <div aria-hidden style={{
        position: 'absolute', bottom: px(-size*0.06), left: '50%', transform: 'translateX(-50%)',
        width: px(size*0.7), height: px(size*0.08),
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(0,15,30,0.25) 0%, transparent 70%)`,
        filter: `blur(${size*0.02}px)`,
      }} />
    </div>
  );
}

/* ── Portia mark — P in a small orange square ───────────────────────────── */
function Mark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill={ORANGE}/>
      <path d="M9 7h5.8c1.5 0 2.7.4 3.5 1.2.8.8 1.2 1.8 1.2 3.1s-.4 2.4-1.2 3.1c-.8.8-2 1.2-3.5 1.2H11.4V21H9V7zm2.4 6.6h3.2c.9 0 1.5-.2 2-.6.4-.4.6-.9.6-1.7s-.2-1.3-.6-1.7c-.4-.4-1.1-.6-2-.6h-3.2v4.6z" fill="white"/>
    </svg>
  );
}

/* ── Wordmark ────────────────────────────────────────────────────────────── */
function Logo({ size = 'nav' }) {
  const s = size === 'nav' ? { mark: 24, font: 20, gap: 10 } : { mark: 32, font: 28, gap: 12 };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap, textDecoration: 'none' }}>
      <Mark size={s.mark} />
      <span style={{ fontFamily: HEAD, fontWeight: 300, fontSize: s.font, letterSpacing: '0.08em', color: INK }}>PORTIA</span>
    </span>
  );
}

const FEATURES = [
  { i: '01', t: 'Novedades',   d: 'El libro de la portería, ahora imborrable. Urgentes, incidentes y avisos con foto y hora exacta.' },
  { i: '02', t: 'Visitas',     d: 'Quién entra y quién sale, registrado. La trazabilidad que un edificio moderno necesita.' },
  { i: '03', t: 'Encomiendas', d: 'Cada paquete que llega queda anotado. Aviso al residente, entrega con firma.' },
  { i: '04', t: 'Tareas',      d: 'El administrador asigna, el conserje ejecuta. Nada se pierde en WhatsApp.' },
  { i: '05', t: 'Turnos',      d: 'El cambio de turno deja de perder información. Resumen automático al siguiente conserje.' },
  { i: '06', t: 'Panel vivo',  d: 'El administrador ve todo en tiempo real desde el navegador. Sin instalar nada.' },
];

const PASOS = [
  { n: '01', t: 'Instala en portería',    d: 'El conserje descarga Portia. Mac o Windows, dos minutos de configuración.' },
  { n: '02', t: 'El admin entra a la web', d: 'Desde cualquier navegador. Invita a su equipo por correo, sin contraseñas manuales.' },
  { n: '03', t: 'Todo en tiempo real',     d: 'Lo que ocurre en portería aparece al instante en el panel del administrador.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 0.84, 0.44, 1] } },
};
const stag = (d = 0) => ({ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.16, 0.84, 0.44, 1], delay: d } } });
const listCont = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const listItem = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 0.84, 0.44, 1] } } };

export default function Landing() {
  return (
    <div style={{ background: '#fff', color: INK, fontFamily: BODY, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=Manrope:wght@300;400;500;600&display=swap');

        /* ── fixed planet — siempre visible al fondo ── */
        #portia-planet {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
          pointer-events: none;
          animation: planetFloat 12s ease-in-out infinite;
          width: min(460px, 44vw);
          height: min(460px, 44vw);
        }
        #portia-planet > div { width: 100% !important; height: 100% !important; }
        @keyframes planetFloat { 0%,100%{transform:translate(-50%,-58%)} 50%{transform:translate(-50%,-42%)} }
        @keyframes portiaScroll { 0%{transform:scaleY(0);transform-origin:top} 45%{transform:scaleY(1);transform-origin:top} 55%{transform:scaleY(1);transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }
        @keyframes spinSlow { to { transform:rotate(360deg) } }

        /* nav link underline */
        .pnl { position:relative; text-decoration:none; }
        .pnl::after { content:''; position:absolute; left:0; bottom:-3px; height:1.5px; width:100%; background:${ORANGE}; transform:scaleX(0); transform-origin:right; transition:transform .4s cubic-bezier(.16,.84,.44,1); }
        .pnl:hover::after { transform:scaleX(1); transform-origin:left; }

        /* button hover */
        .pbtn-fill:hover  { transform:translateY(-2px); box-shadow:0 16px 36px -10px rgba(230,78,27,0.44); }
        .pbtn-fill  { transition:transform .2s ease, box-shadow .3s ease; }
        .pbtn-ghost { transition:background .22s, color .22s, border-color .22s, transform .2s; }
        .pbtn-ghost:hover { background:${INK}!important; color:#fff!important; border-color:${INK}!important; transform:translateY(-2px); }

        /* feature row */
        .pf-row { transition:background .3s; cursor:default; }
        .pf-row:hover { background:rgba(0,48,84,.03); }
        .pf-row:hover .pf-t { color:${ORANGE}!important; }
        .pf-row:hover .pf-arr { opacity:1!important; transform:none!important; }

        /* footer link */
        .pfl { text-decoration:none; color:${INK2}; transition:color .2s; display:block; }
        .pfl:hover { color:${INK}!important; }

        @media(max-width:860px){
          .pmob-hide { display:none!important; }
          .pp   { padding-left:22px!important; padding-right:22px!important; }
          .psteps { grid-template-columns:1fr!important; }
          .pfgrid { grid-template-columns:52px 1fr 48px!important; }
          .pf-desc { display:none!important; }
          .pfootg { grid-template-columns:1fr!important; gap:28px!important; }
        }
      `}</style>

      {/* ════ PLANETA FIJO — fondo de toda la página ════════════════════════ */}
      <div id="portia-planet" aria-hidden>
        <Planet size={460} />
      </div>

      {/* ════ TOP BAR ════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 10, borderBottom: `1px solid ${LINE}`, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="pp" style={{ maxWidth: 1280, margin: '0 auto', padding: '10px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: BODY, fontSize: 13, color: INK2 }}>hola@portia.cl</span>
          <span className="pmob-hide" style={{ ...EYE, fontSize: 11, color: INK3 }}>Santiago de Chile</span>
        </div>
      </div>

      {/* ════ NAV ════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${LINE}`,
      }}>
        <div className="pp" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size="nav" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="#funciones" className="pnl pmob-hide" style={{ fontFamily: BODY, fontSize: 14, color: INK, fontWeight: 400 }}>Funciones</a>
            <a href="#como" className="pnl pmob-hide" style={{ fontFamily: BODY, fontSize: 14, color: INK, fontWeight: 400 }}>Cómo funciona</a>
            <button onClick={descargar} className="pnl pmob-hide" style={{ fontFamily: BODY, fontSize: 14, color: INK, fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Descargar</button>
            <Link href="/login" className="pbtn-ghost" style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: INK, textDecoration: 'none', border: `1.5px solid ${INK}`, borderRadius: 100, padding: '8px 20px' }}>Panel admin</Link>
          </div>
        </div>
      </nav>

      {/* ════ HERO — 100vh, texto sobre el planeta ════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 114px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 48px 0' }} className="pp">
        {/* halo blanco centrado sobre el texto */}
        <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '100%', maxWidth: 820, height: 520, background: HALO, pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.p variants={stag(0)} initial="hidden" animate="show" style={{ ...EYE, marginBottom: 36 }}>
            Conserjería digital · Chile
          </motion.p>

          <motion.h1 variants={stag(0.12)} initial="hidden" animate="show" style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(64px,12vw,200px)', letterSpacing: '-0.02em', lineHeight: 0.92, color: INK, margin: 0 }}>
            PORTIA
          </motion.h1>

          <motion.p variants={stag(0.26)} initial="hidden" animate="show" style={{ fontFamily: BODY, fontWeight: 300, fontSize: 'clamp(18px,2.2vw,28px)', color: INK2, letterSpacing: '-0.005em', margin: '34px auto 0', maxWidth: 580, lineHeight: 1.45 }}>
            El <span style={{ color: INK, fontWeight: 500 }}>orden</span> que tu edificio siempre mereció.
          </motion.p>

          <motion.div variants={stag(0.4)} initial="hidden" animate="show" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 44 }}>
            <button onClick={descargar} className="pbtn-fill" style={{ fontFamily: BODY, fontWeight: 500, fontSize: 16, color: '#fff', background: ORANGE, border: `1.5px solid ${ORANGE}`, borderRadius: 100, padding: '14px 34px', cursor: 'pointer' }}>
              Descargar gratis
            </button>
            <Link href="/login" className="pbtn-ghost" style={{ fontFamily: BODY, fontWeight: 500, fontSize: 16, color: INK, textDecoration: 'none', border: `1.5px solid ${INK}`, borderRadius: 100, padding: '14px 34px', display: 'block' }}>
              Soy administrador
            </Link>
          </motion.div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 48, paddingBottom: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <span style={{ ...EYE, fontSize: 10, color: INK3 }}>Scroll</span>
          <div style={{ width: 1, height: 48, background: LINE, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: ORANGE, animation: 'portiaScroll 2.6s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ════ MANIFIESTO — texto izquierda, planeta al fondo ════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '88vh', display: 'flex', alignItems: 'center', padding: '80px 48px' }} className="pp">
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp}
            style={{ maxWidth: 580, padding: '40px 44px', background: HALO, backdropFilter: 'blur(2px)' }}
          >
            <p style={{ ...EYE, marginBottom: 24 }}>El edificio en orden</p>
            <p style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(26px,3.8vw,50px)', lineHeight: 1.18, letterSpacing: '-0.02em', color: INK, margin: 0 }}>
              Una portería invisible es la{' '}
              <span style={{ fontWeight: 600 }}>mejor portería</span>.{' '}
              <span style={{ color: ORANGE }}>Portia hace que eso pase.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ════ FUNCIONES — fondo blanco, rompe el planeta ════════════════════ */}
      <section id="funciones" style={{ position: 'relative', zIndex: 2, background: '#fff', padding: '80px 48px 100px' }} className="pp">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
            style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 64px' }}>
            <p style={{ ...EYE, marginBottom: 22 }}>Funciones</p>
            <h2 style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(30px,4vw,54px)', letterSpacing: '-0.02em', lineHeight: 1.06, margin: 0, color: INK }}>
              Todo lo que pasa en la portería,{' '}<span style={{ fontWeight: 600 }}>en un solo lugar.</span>
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={listCont} style={{ borderTop: `1px solid ${LINE}` }}>
            {FEATURES.map((f) => (
              <motion.div key={f.i} variants={listItem} className="pf-row" style={{ borderBottom: `1px solid ${LINE}` }}>
                <div className="pfgrid" style={{ display: 'grid', gridTemplateColumns: '64px 1.2fr 2fr 52px', alignItems: 'center', gap: 24, padding: '26px 16px' }}>
                  <span style={{ ...EYE, fontSize: 12, color: INK3 }}>{f.i}</span>
                  <h3 className="pf-t" style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(22px,2.4vw,32px)', letterSpacing: '-0.015em', color: INK, margin: 0, transition: 'color .3s' }}>{f.t}</h3>
                  <p className="pf-desc" style={{ fontFamily: BODY, fontWeight: 300, fontSize: 15, lineHeight: 1.6, color: INK2, margin: 0 }}>{f.d}</p>
                  <span className="pf-arr" style={{ justifySelf: 'end', fontFamily: BODY, fontSize: 20, color: ORANGE, opacity: 0, transform: 'translate(-5px,5px)', transition: 'opacity .3s, transform .3s' }}>↗</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════ CÓMO FUNCIONA — transparente, planeta al fondo ════════════════ */}
      <section id="como" style={{ position: 'relative', zIndex: 1, padding: '80px 48px 100px' }} className="pp">
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
            style={{ textAlign: 'center', marginBottom: 64, padding: '32px', background: HALO }}>
            <p style={{ ...EYE, marginBottom: 22 }}>Cómo funciona</p>
            <h2 style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(30px,4vw,54px)', letterSpacing: '-0.02em', margin: 0, color: INK }}>
              Tres pasos.{' '}<span style={{ fontWeight: 600 }}>Una tarde.</span>
            </h2>
          </motion.div>

          <motion.div className="psteps" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={listCont}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
            {PASOS.map((s, i) => (
              <motion.div key={s.n} variants={listItem} style={{ padding: '0 40px', textAlign: 'center', borderRight: i < 2 ? `1px solid ${LINE}` : 'none' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', border: `1.5px solid ${ORANGE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontFamily: BODY, fontWeight: 500, fontSize: 16, color: ORANGE }}>{s.n}</div>
                <h3 style={{ fontFamily: HEAD, fontWeight: 400, fontSize: 22, letterSpacing: '-0.01em', color: INK, margin: '0 0 12px' }}>{s.t}</h3>
                <p style={{ fontFamily: BODY, fontWeight: 300, fontSize: 15, lineHeight: 1.65, color: INK2, margin: '0 auto', maxWidth: 260 }}>{s.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════ CTA — transparente, planeta al fondo ════════════════════════ */}
      <motion.section
        initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={listCont}
        style={{ position: 'relative', zIndex: 1, padding: '60px 48px 120px', textAlign: 'center' }} className="pp">
        <motion.div variants={listItem} style={{ display: 'inline-block', padding: '56px 64px 60px', background: HALO, backdropFilter: 'blur(2px)' }}>
          <motion.h2 variants={listItem} style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 'clamp(36px,6vw,86px)', letterSpacing: '-0.025em', lineHeight: 0.97, color: INK, margin: '0 0 20px' }}>
            Pon tu edificio{' '}<span style={{ fontWeight: 600, color: ORANGE }}>en orden.</span>
          </motion.h2>
          <motion.p variants={listItem} style={{ fontFamily: BODY, fontWeight: 300, fontSize: 18, color: INK2, margin: '0 auto 40px', maxWidth: 400, lineHeight: 1.6 }}>
            Empieza hoy, gratis y sin contratos. Dos minutos de instalación.
          </motion.p>
          <motion.div variants={listItem} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={descargar} className="pbtn-fill" style={{ fontFamily: BODY, fontWeight: 500, fontSize: 16, color: '#fff', background: ORANGE, border: `1.5px solid ${ORANGE}`, borderRadius: 100, padding: '14px 36px', cursor: 'pointer' }}>Descargar gratis</button>
            <Link href="/login" className="pbtn-ghost" style={{ fontFamily: BODY, fontWeight: 500, fontSize: 16, color: INK, textDecoration: 'none', border: `1.5px solid ${INK}`, borderRadius: 100, padding: '14px 36px', display: 'block' }}>Soy administrador</Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ════ FOOTER — blanco, tapa el planeta ════════════════════════════ */}
      <footer style={{ position: 'relative', zIndex: 2, background: '#fff', padding: '0 48px 44px' }} className="pp">
        <div className="pfootg" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, paddingTop: 48, paddingBottom: 40, borderTop: `1px solid ${LINE}` }}>
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
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', paddingTop: 20, borderTop: `1px solid ${LINE}`, fontFamily: BODY, fontWeight: 300, fontSize: 13, color: INK3 }}>
          <span>© 2026 Portia</span>
          <span>Hecho en Chile</span>
        </div>
      </footer>
    </div>
  );
}
