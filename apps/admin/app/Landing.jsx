'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ─── Tokens ─────────────────────────────────────────────── */
const BG      = '#0B0A08';
const BG2     = '#131210';
const ACID    = '#C8FF57';
const SNOW    = '#F0EBE3';
const MUTED   = 'rgba(240,235,227,0.46)';
const DIM     = 'rgba(240,235,227,0.20)';
const LINE    = 'rgba(240,235,227,0.07)';
const BORDER  = 'rgba(240,235,227,0.12)';

const SERIF  = "'DM Serif Display', Georgia, serif";
const COND   = "'Barlow Condensed', sans-serif";
const BODY   = "'Nunito', system-ui, sans-serif";

const CAPS = { fontFamily: COND, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' };

/* ─── Data ───────────────────────────────────────────────── */
const GH_BASE = 'https://github.com/yoske7062/conserjeos/releases/download/v1.0.0-stage1';
function descargar() {
  const ua = navigator.userAgent;
  if (/Win/i.test(ua)) { window.location.href = `${GH_BASE}/Portia-Setup-1.0.0.exe`; return; }
  const isArm = /arm64|aarch64/i.test(navigator.platform + ua) || typeof navigator.gpu !== 'undefined';
  window.location.href = isArm ? `${GH_BASE}/Portia-1.0.0-arm64.dmg` : `${GH_BASE}/Portia-1.0.0-x64.dmg`;
}

const SECTIONS = ['Inicio', 'Funciones', 'Cómo', 'Contacto'];

const FEATURES = [
  { n: '00', t: 'NOVEDADES',   d: 'El libro de la portería, ahora imborrable. Urgentes, incidentes y avisos con foto exacta.' },
  { n: '01', t: 'VISITAS',     d: 'Quién entra y quién sale, registrado. La trazabilidad que un edificio moderno necesita.' },
  { n: '02', t: 'ENCOMIENDAS', d: 'Cada paquete que llega queda anotado. Notificación al residente, entrega con firma.' },
  { n: '03', t: 'TAREAS',      d: 'El administrador asigna, el conserje ejecuta. Nada queda en conversaciones de WhatsApp.' },
  { n: '04', t: 'TURNOS',      d: 'El cambio de turno deja de perder información. Resumen automático al siguiente conserje.' },
  { n: '05', t: 'PANEL VIVO',  d: 'El administrador ve todo en tiempo real desde el navegador — sin instalar nada.' },
];

/* ─── Helpers ────────────────────────────────────────────── */
function Dot({ active }) {
  return (
    <div style={{ width: 6, height: 6, borderRadius: '50%', border: `1px solid ${active ? ACID : BORDER}`, background: active ? ACID : 'transparent', transition: 'all .4s' }} />
  );
}

/* ─── Component ──────────────────────────────────────────── */
export default function Landing() {
  const [active, setActive] = useState(0);
  const sectRefs = useRef([]);
  const cursorRef = useRef(null);

  useEffect(() => {
    /* scroll reveals */
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

    /* section tracker */
    const io2 = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(Number(e.target.dataset.sec)); }),
      { threshold: 0.5 }
    );
    sectRefs.current.forEach(el => el && io2.observe(el));

    /* cursor */
    const dot = cursorRef.current;
    let raf = 0, x = -100, y = -100, tx = -100, ty = -100;
    const mv = e => { tx = e.clientX; ty = e.clientY; };
    const loop = () => { x += (tx-x)*.14; y += (ty-y)*.14; if(dot) dot.style.transform=`translate(${x}px,${y}px)`; raf=requestAnimationFrame(loop); };
    if (window.matchMedia('(pointer:fine)').matches) { window.addEventListener('mousemove', mv); raf = requestAnimationFrame(loop); }
    return () => { io.disconnect(); io2.disconnect(); window.removeEventListener('mousemove', mv); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div style={{ background: BG, color: SNOW, fontFamily: BODY, minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Barlow+Condensed:wght@400;500;600;700&family=Nunito:wght@400;500;600&display=swap');

        @keyframes fadeUp   { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:none } }
        @keyframes riseIn   { from { opacity:0; transform:translateY(110%) } to { opacity:1; transform:none } }
        @keyframes marquee  { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes ticker   { from { transform:translateX(100%) } to { transform:translateX(-100%) } }
        @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:.35 } }
        @keyframes spin     { to { transform:rotate(360deg) } }

        [data-reveal]       { opacity:0; transform:translateY(26px); transition: opacity .9s cubic-bezier(.16,.84,.28,1), transform .9s cubic-bezier(.16,.84,.28,1); }
        [data-reveal].in    { opacity:1; transform:none; }

        .p-line             { display:block; overflow:hidden; }
        .p-line span        { display:block; animation: riseIn 1.1s cubic-bezier(.16,.84,.28,1) both; }

        .p-feat:hover .p-fn { color:${ACID}; }
        .p-feat:hover .p-ft { color:${SNOW}; letter-spacing:.14em; }
        .p-feat:hover       { border-color:${ACID}22 !important; background:${BG2} !important; }

        .p-btn-fill         { transition: background .3s, color .3s, transform .2s; }
        .p-btn-fill:hover   { background:${ACID} !important; color:${BG} !important; transform:scale(1.02); }

        .p-link-ul          { position:relative; }
        .p-link-ul::after   { content:''; position:absolute; left:0; bottom:-2px; width:100%; height:1px; background:${ACID}; transform:scaleX(0); transform-origin:right; transition:transform .5s cubic-bezier(.16,.84,.28,1); }
        .p-link-ul:hover::after { transform:scaleX(1); transform-origin:left; }

        @media (max-width: 860px) {
          .p-hero-h  { font-size: 18vw !important; }
          .p-two-col { grid-template-columns: 1fr !important; }
          .p-feat-grid { grid-template-columns: 1fr !important; }
          .p-side-l, .p-side-r { display:none !important; }
          .p-pad  { padding-left:22px !important; padding-right:22px !important; }
          .p-cursor { display:none !important; }
        }
      `}</style>

      {/* Custom cursor */}
      <div ref={cursorRef} className="p-cursor" aria-hidden style={{
        position:'fixed', top:0, left:0, width:10, height:10, marginLeft:-5, marginTop:-5,
        borderRadius:'50%', background:ACID, pointerEvents:'none', zIndex:999, mixBlendMode:'difference',
      }} />

      {/* Blueprint grid bg */}
      <div aria-hidden style={{
        position:'fixed', inset:0, zIndex:0, pointerEvents:'none', opacity:.18,
        backgroundImage:`linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`,
        backgroundSize:'60px 60px',
      }} />
      {/* Radial glow */}
      <div aria-hidden style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:`radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,255,87,0.06) 0%, transparent 70%)`
      }} />

      {/* Top ticker */}
      <div style={{ position:'relative', zIndex:10, borderBottom:`1px solid ${LINE}`, height:32, overflow:'hidden', background: BG }}>
        <div style={{ display:'flex', alignItems:'center', height:'100%', width:'max-content', animation:'ticker 40s linear infinite', whiteSpace:'nowrap' }}>
          {Array.from({length:8}).map((_,i)=>(
            <span key={i} style={{ ...CAPS, fontSize:10, color: DIM, paddingRight:60 }}>
              PORTIA — CONSERJERÍA DIGITAL — SANTIAGO DE CHILE — EST. 2026 —
              <span style={{ color: ACID, margin:'0 16px' }}>●</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:40, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 48px', height:60, background:`rgba(11,10,8,0.88)`, backdropFilter:'blur(16px)',
        borderBottom:`1px solid ${LINE}`, }} className="p-pad">
        <span style={{ fontFamily:SERIF, fontSize:22, color:SNOW }}>
          Portia<span style={{ color:ACID }}>.</span>
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:32 }}>
          {['Funciones','Descargar'].map(l => (
            l === 'Descargar'
              ? <button key={l} onClick={descargar} className="p-link-ul" style={{ ...CAPS, fontSize:11, color:DIM, background:'none', border:'none', cursor:'pointer', fontFamily:COND, padding:0 }}>{l}</button>
              : <a key={l} href="#features" className="p-link-ul" style={{ ...CAPS, fontSize:11, color:DIM, textDecoration:'none' }}>{l}</a>
          ))}
          <Link href="/login" className="p-btn-fill" style={{
            ...CAPS, fontSize:11, color:BG, background:ACID, textDecoration:'none',
            borderRadius:2, padding:'9px 20px', letterSpacing:'.16em',
          }}>
            Panel Admin
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section ref={el => sectRefs.current[0] = el} data-sec="0" style={{ position:'relative', zIndex:5, minHeight:'96vh', display:'flex', flexDirection:'column', justifyContent:'center', padding:'80px 48px 60px' }} className="p-pad">

        {/* Left vertical label */}
        <div className="p-side-l" style={{ position:'absolute', left:22, top:'50%', transform:'translateY(-50%) rotate(-90deg)', transformOrigin:'center center',
          ...CAPS, fontSize:9, color:DIM, letterSpacing:'.3em', whiteSpace:'nowrap',
        }}>Lat. 33.43°S — Long. 70.65°W</div>

        {/* Right section dots */}
        <div className="p-side-r" style={{ position:'absolute', right:26, top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:10 }}>
          {SECTIONS.map((_, i) => <Dot key={i} active={active === i} />)}
        </div>

        <div style={{ maxWidth:1100 }}>
          {/* Eyebrow */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:32, animation:'fadeUp .8s .1s both' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:ACID, animation:'pulse 2s infinite' }} />
            <span style={{ ...CAPS, fontSize:10, color:ACID }}>Sistema activo — v1.0.0</span>
          </div>

          {/* Main headline — mixed type */}
          <h1 style={{ margin:0, lineHeight:0.88 }}>
            <span className="p-line"><span style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:400, fontSize:'clamp(52px,6.5vw,90px)', color:MUTED, animationDelay:'.05s', letterSpacing:'-.01em' }}>
              El orden que tu edificio
            </span></span>
            <span className="p-line"><span style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:400, fontSize:'clamp(52px,6.5vw,90px)', color:MUTED, animationDelay:'.12s', letterSpacing:'-.01em' }}>
              siempre mereció —
            </span></span>
            <span className="p-line"><span className="p-hero-h" style={{ fontFamily:COND, fontWeight:700, fontSize:'clamp(80px,13vw,196px)', color:SNOW, textTransform:'uppercase', letterSpacing:'-.02em', lineHeight:.85, animationDelay:'.22s' }}>
              PORTIA
            </span></span>
          </h1>

          {/* Bottom row */}
          <div className="p-two-col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, marginTop:52, animation:'fadeUp 1s .6s both', alignItems:'end' }}>
            <p style={{ fontFamily:BODY, fontSize:'clamp(15px,1.8vw,19px)', lineHeight:1.6, color:MUTED, margin:0, maxWidth:480 }}>
              Reemplaza el cuaderno de la portería por un sistema en tiempo real.
              El conserje registra, el administrador observa — desde cualquier dispositivo.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'flex-end' }}>
              <button onClick={descargar} className="p-btn-fill" style={{
                ...CAPS, fontSize:11, letterSpacing:'.16em', color:BG, background:ACID,
                borderRadius:2, padding:'16px 28px', border:'none', cursor:'pointer', fontFamily:COND,
              }}>Descargar gratis</button>
              <Link href="/login" className="p-btn-fill" style={{
                ...CAPS, fontSize:11, letterSpacing:'.16em', color:SNOW, textDecoration:'none',
                borderRadius:2, padding:'16px 28px', border:`1px solid ${BORDER}`, background:'transparent',
              }}>Panel admin →</Link>
            </div>
          </div>
        </div>

        {/* Coordinate detail bottom-right */}
        <div style={{ position:'absolute', bottom:28, right:48, ...CAPS, fontSize:9, color:DIM, textAlign:'right' }}>
          <div>72PX | SISTEMA ACTIVO</div>
          <div style={{ color:ACID, marginTop:3 }}>▲ SCROLL PARA CONTINUAR</div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────── */}
      <div ref={el => sectRefs.current[1] = el} data-sec="1" data-reveal style={{
        position:'relative', zIndex:5, borderTop:`1px solid ${LINE}`, borderBottom:`1px solid ${LINE}`,
        display:'grid', gridTemplateColumns:'repeat(3,1fr)', padding:'0 48px',
      }} className="p-pad">
        {[
          { v:'6',    unit:'MÓDULOS',   d:'Novedades · Visitas · Encomiendas · Tareas · Turnos · Panel' },
          { v:'∞',    unit:'REGISTROS', d:'Historial completo sin límite, en la nube, accesible siempre' },
          { v:'≤10',  unit:'MINUTOS',   d:'Tiempo de onboarding desde instalación hasta primer turno' },
        ].map(({ v, unit, d }, i) => (
          <div key={unit} style={{ padding:'40px 0', borderRight: i < 2 ? `1px solid ${LINE}` : 'none', paddingLeft: i>0 ? 36 : 0 }}>
            <div style={{ fontFamily:COND, fontWeight:700, fontSize:'clamp(48px,5vw,72px)', color:SNOW, letterSpacing:'-.02em', lineHeight:1 }}>{v}</div>
            <div style={{ ...CAPS, fontSize:9, color:ACID, marginTop:8, marginBottom:6 }}>{unit}</div>
            <div style={{ fontFamily:BODY, fontSize:12, color:DIM, lineHeight:1.5, maxWidth:260 }}>{d}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="features" style={{ position:'relative', zIndex:5, padding:'100px 48px' }} className="p-pad">
        <div data-reveal style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:48, borderBottom:`1px solid ${BORDER}`, paddingBottom:20 }}>
          <h2 style={{ fontFamily:COND, fontWeight:700, fontSize:'clamp(32px,4vw,52px)', textTransform:'uppercase', letterSpacing:'-.01em', margin:0, color:SNOW }}>
            Funciones
          </h2>
          <span style={{ ...CAPS, fontSize:9, color:DIM }}>06 MÓDULOS / SISTEMA</span>
        </div>

        <div className="p-feat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:1, background:LINE }}>
          {FEATURES.map((f, i) => (
            <div key={f.n} className="p-feat" data-reveal style={{
              background: BG, border:`1px solid transparent`, padding:'36px 32px',
              transition:'border-color .4s, background .4s',
              transitionDelay:`${i*50}ms`,
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <span className="p-fn" style={{ ...CAPS, fontSize:9, color:DIM, transition:'color .3s' }}>{f.n}</span>
                <span style={{ width:5, height:5, borderRadius:'50%', background:LINE, border:`1px solid ${BORDER}` }} />
              </div>
              <h3 className="p-ft" style={{ fontFamily:COND, fontWeight:700, fontSize:'clamp(24px,2.8vw,38px)', textTransform:'uppercase', letterSpacing:'.06em', margin:'0 0 12px', color:DIM, transition:'color .4s, letter-spacing .4s' }}>{f.t}</h3>
              <p style={{ fontFamily:BODY, fontSize:13, color:DIM, lineHeight:1.6, margin:0, maxWidth:340 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MANIFESTO ─────────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:5, padding:'80px 48px 100px', borderTop:`1px solid ${LINE}` }} className="p-pad">
        <div data-reveal style={{ display:'flex', gap:24, alignItems:'flex-start', marginBottom:40 }}>
          <div style={{ width:1, background:`linear-gradient(to bottom, ${ACID}, transparent)`, minHeight:80, flexShrink:0 }} />
          <span style={{ ...CAPS, fontSize:9, color:ACID, paddingTop:6 }}>Manifiesto del sistema</span>
        </div>
        <p data-reveal style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:400, fontSize:'clamp(28px,4.5vw,64px)', lineHeight:1.18, letterSpacing:'-.02em', margin:0, maxWidth:1000, color:SNOW }}>
          Una portería invisible es la mejor portería. Nadie nota el paquete que llegó a tiempo,
          la visita registrada, el turno entregado completo.{' '}
          <span style={{ color:ACID }}>Portia hace que eso pase.</span>
        </p>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section style={{ position:'relative', zIndex:5, padding:'0 48px 110px', borderTop:`1px solid ${LINE}` }} className="p-pad">
        <div data-reveal style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'40px 0 48px', borderBottom:`1px solid ${LINE}` }}>
          <h2 style={{ fontFamily:COND, fontWeight:700, fontSize:'clamp(32px,4vw,52px)', textTransform:'uppercase', letterSpacing:'-.01em', margin:0 }}>
            Cómo funciona
          </h2>
          <span style={{ ...CAPS, fontSize:9, color:DIM }}>03 ETAPAS / ONBOARDING</span>
        </div>

        <div className="p-two-col" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0 }}>
          {[
            { n:'I',   t:'INSTALA EN PORTERÍA',  d:'El conserje descarga Portia en el computador de la entrada. Mac o Windows, dos minutos.' },
            { n:'II',  t:'ADMIN ENTRA A LA WEB', d:'Desde cualquier navegador. Invita a su equipo por correo, sin contraseñas manuales.' },
            { n:'III', t:'TIEMPO REAL',           d:'Lo que ocurre en la portería aparece al instante en el panel del administrador.' },
          ].map((s, i) => (
            <div key={s.n} data-reveal style={{ padding:'48px 36px 36px 0', borderRight: i<2 ? `1px solid ${LINE}` : 'none', paddingLeft: i>0 ? 36 : 0, transitionDelay:`${i*100}ms` }}>
              <div style={{ fontFamily:SERIF, fontStyle:'italic', fontWeight:400, fontSize:80, color:ACID, lineHeight:1, marginBottom:24, opacity:.7 }}>{s.n}</div>
              <h3 style={{ fontFamily:COND, fontWeight:700, fontSize:22, textTransform:'uppercase', letterSpacing:'.08em', margin:'0 0 12px', color:SNOW }}>{s.t}</h3>
              <p style={{ fontFamily:BODY, fontSize:14, color:DIM, lineHeight:1.65, margin:0, maxWidth:280 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section data-reveal style={{ position:'relative', zIndex:5, margin:'0 48px 80px', background:BG2, border:`1px solid ${BORDER}`, borderRadius:4, padding:'clamp(48px,8vw,96px)', overflow:'hidden' }} className="p-pad">
        {/* BG accent line */}
        <div aria-hidden style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${ACID}, transparent)` }} />
        <div style={{ ...CAPS, fontSize:9, color:ACID, marginBottom:24 }}>Empieza hoy — sin contratos</div>
        <h2 style={{ fontFamily:COND, fontWeight:700, fontSize:'clamp(48px,8vw,110px)', textTransform:'uppercase', letterSpacing:'-.02em', lineHeight:.9, margin:'0 0 44px', maxWidth:900, color:SNOW }}>
          PON TU EDIFICIO <span style={{ color:ACID, fontFamily:SERIF, fontStyle:'italic', fontWeight:400, textTransform:'none' }}>en orden</span>.
        </h2>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <button onClick={descargar} className="p-btn-fill" style={{
            ...CAPS, fontSize:11, letterSpacing:'.16em', color:BG, background:ACID,
            borderRadius:2, padding:'18px 36px', border:'none', cursor:'pointer', fontFamily:COND,
          }}>Descargar gratis</button>
          <Link href="/login" className="p-btn-fill" style={{
            ...CAPS, fontSize:11, letterSpacing:'.16em', color:SNOW, textDecoration:'none',
            borderRadius:2, padding:'18px 36px', border:`1px solid ${BORDER}`, background:'transparent',
          }}>Soy administrador →</Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ position:'relative', zIndex:5, padding:'0 48px 40px', borderTop:`1px solid ${LINE}` }} className="p-pad">
        <div className="p-two-col" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:40, paddingTop:52, paddingBottom:40, borderBottom:`1px solid ${LINE}` }}>
          <div>
            <div style={{ fontFamily:SERIF, fontSize:56, fontWeight:400, letterSpacing:'-.02em', lineHeight:1, marginBottom:16 }}>
              Portia<span style={{ color:ACID }}>.</span>
            </div>
            <p style={{ fontFamily:BODY, fontSize:13, color:DIM, maxWidth:340, lineHeight:1.6, margin:0 }}>
              El sistema operativo de la conserjería chilena.<br/>Hecho para conserjes reales.
            </p>
          </div>
          <div>
            <div style={{ ...CAPS, fontSize:9, color:DIM, marginBottom:18 }}>Producto</div>
            <button onClick={descargar} className="p-link-ul" style={{ display:'block', fontFamily:BODY, fontSize:14, color:SNOW, background:'none', border:'none', padding:'0 0 10px', cursor:'pointer', textAlign:'left' }}>Descargar app</button>
            <Link href="/login" className="p-link-ul" style={{ display:'block', fontFamily:BODY, fontSize:14, color:SNOW, textDecoration:'none', paddingBottom:10, width:'fit-content' }}>Panel admin</Link>
          </div>
          <div>
            <div style={{ ...CAPS, fontSize:9, color:DIM, marginBottom:18 }}>Contacto</div>
            <a href="mailto:hola@portia.cl" className="p-link-ul" style={{ display:'block', fontFamily:BODY, fontSize:14, color:SNOW, textDecoration:'none', paddingBottom:10, width:'fit-content' }}>hola@portia.cl</a>
            <span style={{ fontFamily:BODY, fontSize:13, color:DIM }}>Santiago, Chile</span>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:20, ...CAPS, fontSize:9, color:DIM }}>
          <span>© 2026 PORTIA</span>
          <span style={{ color:ACID }}>HECHO EN CHILE</span>
        </div>
      </footer>
    </div>
  );
}
