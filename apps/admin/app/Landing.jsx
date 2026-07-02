'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/* ── DESIGN SYSTEM — UI/UX Pro Max: Feature-Rich Showcase + Swiss Modernism 2.0 ─
   Style:   Editorial bold + Feature-Rich Showcase
   Color:   Warm off-white bg, #0F172A navy ink, #E64E1B orange accent
            Each feature module gets its own color identity
   Font:    Inter (Google Fonts)
   Pattern: Scroll-Triggered Storytelling — problema → solución → funciones → CTA
   Logo:    Official Vector SVG PortiaLogo
   Anim:    transform/opacity only, 150-400ms, cubic-bezier(.16,1,.3,1)
            prefers-reduced-motion fully respected
 ───────────────────────────────────────────────────────────────────────────── */

const T = {
  bg:       '#FFFFFF',
  bgWarm:   '#FFFAF8',
  bgDark:   '#0F172A',
  bgSubtle: '#F8FAFC',
  ink:      '#0F172A',
  inkMid:   '#64748B',
  inkSub:   '#94A3B8',
  border:   '#E2E8F0',
  accent:   '#E64E1B',
  accentBg: 'rgba(230,78,27,0.07)',
  font:     "'Inter', system-ui, -apple-system, sans-serif",
};

/* ── PORTIA OFFICIAL LOGO SVG ────────────────────────────────────────────── */
function PortiaLogo({ dark = false, size = 32 }) {
  const markColor = '#E64E1B'; // Terracota Accent
  const textColor = dark ? '#FFFFFF' : '#0F172A'; // White or Navy
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
        <rect width="28" height="28" rx="7" fill={markColor}/>
        <path d="M9 7h5.8c1.5 0 2.7.4 3.5 1.2.8.8 1.2 1.8 1.2 3.1s-.4 2.4-1.2 3.1c-.8.8-2 1.2-3.5 1.2H11.4V21H9V7zm2.4 6.6h3.2c.9 0 1.5-.2 2-.6.4-.4.6-.9.6-1.7s-.2-1.3-.6-1.7c-.4-.4-1.1-.6-2-.6h-3.2v4.6z" fill="white"/>
      </svg>
      <span style={{
        fontFamily: T.font,
        fontWeight: 300,
        fontSize: size * 0.65,
        letterSpacing: '0.08em',
        color: textColor,
        textTransform: 'uppercase'
      }}>
        Portia
      </span>
    </span>
  );
}

/* ── SCROLL FADE-UP ──────────────────────────────────────────────────────── */
function useFadeUp(delay = 0, threshold = 0.12) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity .55s ${delay}ms cubic-bezier(.16,1,.3,1), transform .55s ${delay}ms cubic-bezier(.16,1,.3,1)`;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.disconnect();
      }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

/* ── HERO LOAD-IN ────────────────────────────────────────────────────────── */
function useHeroIn(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    const timer = setTimeout(() => {
      el.style.transition = `opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)`;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return ref;
}

/* ── COUNT-UP ────────────────────────────────────────────────────────────── */
function CountUp({ end, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(ease * end));
          if (p < 1) requestAnimationFrame(tick);
          else setCount(end);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── FEATURES — cada módulo con su propio color ──────────────────────────── */
const FEATURES = [
  {
    n: '01', t: 'Novedades',
    d: 'Registro digital del libro de novedades. Urgentes, incidentes y avisos con foto, hora y firma — inmutable.',
    color: '#E64E1B', colorBg: 'rgba(230,78,27,0.10)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    n: '02', t: 'Visitas',
    d: 'Control de acceso con RUT validado y consentimiento integrado. Quién entró, a qué hora y a qué departamento.',
    color: '#3B82F6', colorBg: 'rgba(59,130,246,0.10)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    n: '03', t: 'Encomiendas',
    d: 'Cada paquete que llega queda registrado. Perecibles marcados como urgentes de forma automática.',
    color: '#10B981', colorBg: 'rgba(16,185,129,0.10)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    n: '04', t: 'Tareas',
    d: 'El administrador asigna, el conserje ejecuta y confirma. Sin WhatsApp, sin papel.',
    color: '#8B5CF6', colorBg: 'rgba(139,92,246,0.10)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    n: '05', t: 'Turnos',
    d: 'Traspaso de turno digital. El siguiente conserje recibe un resumen automático sin gaps.',
    color: '#F59E0B', colorBg: 'rgba(245,158,11,0.10)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    n: '06', t: 'Panel admin',
    d: 'Vista en tiempo real para el administrador desde cualquier navegador. Sin instalar nada.',
    color: '#0EA5E9', colorBg: 'rgba(14,165,233,0.10)',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
];

/* ── FEATURE CARD — siempre coloreado, no solo en hover ─────────────────── */
function FeatureCard({ n, t, d, icon, color, colorBg, delay }) {
  const ref = useFadeUp(delay);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '32px 28px 36px',
        background: hovered ? T.bg : 'rgba(255,255,255,0.7)',
        border: `1.5px solid ${hovered ? color : 'rgba(255,255,255,0.9)'}`,
        borderRadius: 20,
        transition: 'background .2s, border-color .2s, box-shadow .2s, transform .22s',
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.09), 0 2px 8px ${colorBg}`
          : '0 1px 4px rgba(15,23,42,0.05)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        cursor: 'default',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: colorBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 22,
        color: color,
        transition: 'transform .2s',
        transform: hovered ? 'scale(1.08)' : 'none',
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{n}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: T.ink, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>{t}</h3>
      <p style={{ fontSize: 14, color: T.inkMid, lineHeight: 1.75, margin: 0 }}>{d}</p>
    </div>
  );
}

/* ── STEP CARD — rediseñado sin marcas de agua y profesional ────────────── */
function StepCard({ n: _n, t, d, delay }) {
  const ref = useFadeUp(delay);
  const cardBg = 'rgba(255,255,255,0.02)';
  const borderColor = 'rgba(255,255,255,0.08)';
  return (
    <div ref={ref}
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: 24,
        padding: '48px 36px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'border-color 0.25s, transform 0.25s, background-color 0.25s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(230,78,27,0.4)';
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.backgroundColor = cardBg;
      }}
    >
      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'transparent',
          color: 'transparent',
          fontSize: 12,
          fontWeight: 700,
          padding: '6px 14px',
          borderRadius: 100,
          marginBottom: 28,
        }}>
          {/* Number omitted for premium look */}
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{t}</h3>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{d}</p>
      </div>
    </div>
  );
}

/* ── NAV ─────────────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: T.bgDark, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="pp">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <PortiaLogo dark size={48} />
        </Link>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[['#funciones', 'Funciones'], ['#como', 'Cómo funciona']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontFamily: T.font, fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 14px', borderRadius: 8, transition: 'color .15s, background .15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'transparent'; }}
            >{label}</a>
          ))}
          <Link href="/login" style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: '#fff', background: T.accent, textDecoration: 'none', borderRadius: 9, padding: '9px 20px', marginLeft: 8, transition: 'opacity .15s, transform .15s', boxShadow: '0 2px 12px rgba(230,78,27,0.35)' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
          >Panel admin</Link>
        </div>
      </div>
    </nav>
  );
}

/* ── MAIN ────────────────────────────────────────────────────────────────── */
export default function Landing() {
  const badge   = useHeroIn(80);
  const h1      = useHeroIn(180);
  const sub     = useHeroIn(280);
  const ctas    = useHeroIn(360);
  const trust   = useHeroIn(460);

  const probRef  = useFadeUp(0);
  const featHead = useFadeUp(0);
  const stepsRef = useFadeUp(0);
  const ctaRef   = useFadeUp(0);

  return (
    <div style={{ background: T.bg, color: T.ink, fontFamily: T.font, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes badge-pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
        @keyframes ticker      { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes float-blob  { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.06) translate(14px,10px)} }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration:0.01ms!important; transition-duration:0.01ms!important; }
        }
        @media (max-width: 860px) {
          .pp      { padding-left:20px!important; padding-right:20px!important; }
          .pfgrid  { grid-template-columns:1fr!important; }
          .psteps  { grid-template-columns:1fr!important; gap:20px!important; }
          .pfootg  { grid-template-columns:1fr!important; gap:32px!important; }
          .nav-links { display:none!important; }
        }
      `}</style>

      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: T.bgWarm, minHeight: 'calc(100dvh - 72px)', display: 'flex', alignItems: 'center' }}>
        {/* Naranja más visible — 16% opacidad */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', right: '-5%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,78,27,0.16) 0%, transparent 70%)', animation: 'float-blob 12s ease-in-out infinite', pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '-15%', left: '-8%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,78,27,0.07) 0%, transparent 70%)', animation: 'float-blob 18s ease-in-out infinite reverse', pointerEvents: 'none' }} />

        <div className="pp" style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '80px 40px 96px', width: '100%' }}>
          {/* eyebrow */}
          <div ref={badge} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.accentBg, border: `1px solid rgba(230,78,27,0.2)`, borderRadius: 100, padding: '6px 16px', marginBottom: 36 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, display: 'block', animation: 'badge-pulse 2s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: T.accent, letterSpacing: '0.02em' }}>Disponible en Mac y Windows · Portería digital</span>
          </div>

          {/* headline */}
          <h1 ref={h1} style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, color: T.ink, margin: '0 0 28px', maxWidth: 860 }}>
            La portería chilena,<br />
            <span style={{ color: T.accent }}>por fin digital.</span>
          </h1>

          {/* sub */}
          <p ref={sub} style={{ fontSize: 'clamp(16px,1.5vw,20px)', color: T.inkMid, maxWidth: 500, lineHeight: 1.65, margin: '0 0 40px' }}>
            Portia reemplaza el cuaderno, el WhatsApp y los post-its.<br />
            Cada visita, novedad y encomienda — registrada con hora y RUT.
          </p>

          {/* CTAs — sin "Descargar gratis" */}
          <div ref={ctas} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/login" style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, color: '#fff', background: T.accent, textDecoration: 'none', borderRadius: 12, padding: '14px 32px', transition: 'opacity .15s, transform .2s, box-shadow .2s', display: 'inline-block', cursor: 'pointer', boxShadow: '0 4px 20px rgba(230,78,27,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '.9'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,78,27,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(230,78,27,0.3)' }}
            >Entrar al panel</Link>
            <a href="mailto:hola@portia.cl" style={{ fontFamily: T.font, fontSize: 16, fontWeight: 500, color: T.ink, textDecoration: 'none', border: `1.5px solid ${T.border}`, background: T.bg, borderRadius: 12, padding: '14px 32px', transition: 'border-color .15s, transform .2s, box-shadow .2s', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.ink; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >Solicitar demo →</a>
          </div>

          {/* trust line */}
          <div ref={trust} style={{ display: 'flex', gap: 24, marginTop: 48, flexWrap: 'wrap' }}>
            {['Mac + Windows', 'Offline disponible', 'Hecho en Chile', 'Soporte real'].map(item => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.inkMid }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        overflow: 'hidden',
        padding: '14px 0',
        background: T.bg,
        position: 'relative',
      }}>
        {/* Faded edges to blend marquee with background */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 80, background: 'linear-gradient(to right, #FFFFFF, transparent)', zIndex: 10, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 80, background: 'linear-gradient(to left, #FFFFFF, transparent)', zIndex: 10, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', animation: 'ticker 360s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(2)].flatMap((_, ai) =>
            ['Novedades', 'Visitas', 'Encomiendas', 'Tareas', 'Turnos', 'Panel admin', 'Sin papel', 'Sin WhatsApp', 'Hecho en Chile'].map((item, i) => (
              <span key={`${ai}-${i}`} style={{ fontSize: 11, fontWeight: 600, color: T.inkSub, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 24px' }}>
                {item}&nbsp;&nbsp;<span style={{ color: T.accent }}>·</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── DARK STATS GRID — rediseñado como tarjetas ────────────────────── */}
      <section style={{ background: T.bgDark, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="pp pfgrid" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {[
            { n: 2,  suf: ' min',       label: 'Para estar listo' },
            { n: 6,  suf: ' módulos',   label: 'Cubiertos desde día 1' },
            { n: 0,  suf: ' papel',     label: 'Todo digital' },
            { n: 1,  suf: ' plataforma',label: 'Para conserje y admin' },
          ].map(({ n, suf, label }, i) => (
            <div key={label} style={{
              opacity: 0,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              padding: '32px 24px',
              transition: 'transform 0.3s ease, border-color 0.3s ease, background-color 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(230,78,27,0.3)';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
            }}
            ref={(el) => {
              if (!el) return;
              const obs = new IntersectionObserver(([e]) => {
                if (e.isIntersecting) {
                  el.style.transition = `opacity .6s ${i * 100}ms ease-out, transform .6s ${i * 100}ms ease-out, border-color 0.3s ease, background-color 0.3s ease`;
                  el.style.opacity = '1';
                  el.style.transform = 'none';
                  obs.disconnect();
                }
              }, { threshold: 0.3 });
              el.style.transform = 'translateY(16px)';
              obs.observe(el);
            }}>
              <div style={{ fontSize: 'clamp(28px,2.5vw,40px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                <CountUp end={n} suffix={suf} />
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 12, lineHeight: 1.4, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEMA ─────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${T.border}` }}>
        <div ref={probRef} className="pp" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 40px' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 24 }}>El problema</span>
          <p style={{ fontSize: 'clamp(24px,3.5vw,48px)', fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.02em', color: T.ink, maxWidth: 820, margin: 0 }}>
            Los conserjes de Chile gestionan visitas, encomiendas y novedades en{' '}
            <span style={{ textDecoration: 'line-through', color: T.inkSub, fontWeight: 400 }}>cuadernos, WhatsApp y papel</span>.{' '}
            <span style={{ color: T.accent, fontWeight: 600 }}>Portia termina con eso.</span>
          </p>
        </div>
      </section>

      {/* ── FUNCIONES — fondo cálido con blob naranja ────────────────────── */}
      <section id="funciones" style={{ background: T.bgWarm, borderBottom: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden' }}>
        {/* blob de fondo — da profundidad a las tarjetas */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '-20%', right: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,78,27,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div className="pp" style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
          <div ref={featHead} style={{ marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>Funciones</span>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: T.ink, margin: 0, maxWidth: 520 }}>
              Todo lo que pasa en portería,<br />en un solo lugar.
            </h2>
          </div>
          <div className="pfgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => <FeatureCard key={f.n} {...f} delay={i * 60} />)}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA — dark navy con tarjetas extensas y notorias ───── */}
      <section id="como" style={{ background: T.bgDark, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div className="pp" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 40px' }}>
          <div ref={stepsRef}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>Cómo funciona</span>
            <h2 style={{ fontSize: 'clamp(26px,3vw,44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#fff', margin: '0 0 56px', maxWidth: 480 }}>
              Tres pasos.<br />Una tarde.
            </h2>
          </div>
          <div className="psteps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            <StepCard dark n="01" t="Instala en portería"     d="Descarga Portia en el computador de conserjería (Windows o Mac) en menos de 2 minutos. La aplicación se instala sin complicaciones, funciona de inmediato, incluso offline, y sincroniza los datos de forma segura en una cola local encriptada. Esta instalación te brinda un control total desde el primer momento, sin dependencias externas." delay={0} />
            <StepCard dark n="02" t="El admin entra al panel" d="El administrador entra al panel desde cualquier navegador, sin instalación previa. Desde ahí, visualiza y gestiona el edificio en tiempo real, accede a reportes detallados, asigna tareas, autoriza conserjes y supervisa cada visita y encomienda con métricas en vivo y auditorías de seguridad." delay={100} />
            <StepCard dark n="03" t="Todo en tiempo real"     d="Cada visita, encomienda y novedad registrada por el conserje se envía al instante al panel administrativo, con cifrado de extremo a extremo y validación multi-tenant. Los datos están disponibles en tiempo real para análisis, auditoría y decisiones operativas, garantizando transparencia total y cumplimiento normativo." delay={200} />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ background: T.bgWarm }}>
        <div ref={ctaRef} className="pp" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 40px 112px', textAlign: 'center', position: 'relative' }}>
          <div aria-hidden="true" style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(230,78,27,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 20, position: 'relative' }}>Contáctanos</span>
          <h2 style={{ position: 'relative', fontSize: 'clamp(36px,7vw,80px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.97, color: T.ink, margin: '0 0 24px' }}>
            Pon tu edificio<br />
            <span style={{ color: T.accent }}>en orden.</span>
          </h2>
          <p style={{ position: 'relative', fontSize: 17, color: T.inkMid, maxWidth: 400, margin: '0 auto 40px', lineHeight: 1.65 }}>
            Hecho para edificios chilenos reales.<br />
            Escríbenos y te mostramos cómo funciona.
          </p>
          <div style={{ position: 'relative', display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:hola@portia.cl" style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, color: '#fff', background: T.accent, textDecoration: 'none', borderRadius: 12, padding: '14px 36px', transition: 'opacity .15s, transform .2s, box-shadow .2s', display: 'inline-block', boxShadow: '0 4px 20px rgba(230,78,27,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '.9'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,78,27,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(230,78,27,0.3)' }}
            >Solicitar demo</a>
            <Link href="/login" style={{ fontFamily: T.font, fontSize: 16, fontWeight: 500, color: T.ink, textDecoration: 'none', border: `1.5px solid ${T.border}`, background: T.bg, borderRadius: 12, padding: '14px 36px', transition: 'border-color .15s, transform .2s, box-shadow .2s', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.ink; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,23,42,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >Soy administrador →</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, background: T.bg }}>
        <div className="pp pfootg" style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <PortiaLogo size={48} />
            </div>
            <p style={{ fontSize: 14, color: T.inkMid, maxWidth: 280, lineHeight: 1.7, margin: '0 0 8px' }}>
              El sistema operativo de la conserjería chilena. Hecho para conserjes reales, en edificios reales.
            </p>
            <p style={{ fontSize: 12, color: T.inkSub, fontStyle: 'italic' }}>Tu edificio. Todo en orden.</p>
          </div>
          {[
            { h: 'Producto', links: [['Panel admin', '/login'], ['Solicitar demo', 'mailto:hola@portia.cl']] },
            { h: 'Contacto', links: [['hola@portia.cl', 'mailto:hola@portia.cl'], ['Santiago, Chile', null]] },
          ].map(({ h, links }) => (
            <div key={h}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.inkSub, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>{h}</div>
              {links.map(([label, href]) => href
                ? <a key={label} href={href} style={{ display: 'block', fontSize: 14, color: T.inkMid, textDecoration: 'none', marginBottom: 12, transition: 'color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = T.ink}
                    onMouseLeave={e => e.currentTarget.style.color = T.inkMid}
                  >{label}</a>
                : <span key={label} style={{ display: 'block', fontSize: 14, color: T.inkSub, marginBottom: 12 }}>{label}</span>
              )}
            </div>
          ))}
        </div>
        <div className="pp" style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: T.inkSub }}>© 2026 Portia — Hecho en Chile</span>
          <span style={{ fontSize: 12, color: T.inkSub }}>Conecta · Gestiona · Transparenta</span>
        </div>
      </footer>
    </div>
  );
}
