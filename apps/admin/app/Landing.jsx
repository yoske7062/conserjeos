'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/* ── DESIGN SYSTEM — Estímulo total (rediseño jul-2026 v4) ───────────────────
   Todo se mueve, todo responde. Fondo: malla de gradiente animada + grilla de
   puntos que panea + partículas flotantes de color. Botones: gradiente vivo
   con barrido de luz. La ventana de la app es hover-interactiva pieza por
   pieza. Sigue siendo transform/opacity y muere con prefers-reduced-motion.
 ───────────────────────────────────────────────────────────────────────────── */

const T = {
  bg:        '#F6F4F1',
  bgPanel:   '#E4DED2',
  bgCard:    '#FFFFFF',
  bgDark:    '#000000',
  ink:       '#000000',
  inkMid:    '#656055',
  inkSub:    '#969084',
  border:    '#E2DDD1',
  accent:    '#F95C4B',
  accentBtn: '#E14A38',
  violet:    '#F95C4B',
  pink:      '#F95C4B',
  ok:        '#1A7A42',
  font:      "'Inter', system-ui, -apple-system, sans-serif",
  shadowWin: '0 1px 2px rgba(29,27,22,0.05), 0 12px 24px -8px rgba(29,27,22,0.10), 0 32px 64px -24px rgba(29,27,22,0.18)',
  shadowCard:'0 1px 3px rgba(29,27,22,0.05), 0 16px 32px -16px rgba(29,27,22,0.12)',
  shadowFloat:'0 2px 6px rgba(29,27,22,0.06), 0 20px 40px -16px rgba(29,27,22,0.22)',
  ease: 'cubic-bezier(.16,1,.3,1)',
  app: {
    side:   '#000000',
    side2:  '#E4DED2',
    base:   '#E4DED2',
    card:   '#FFFFFF',
    brand:  '#F95C4B',
    ink:    '#000000',
    mid:    '#5A5A5A',
    sub:    '#8C8C8C',
    border: '#E3E2EE',
    okBg:   '#EEFAF2', okTx: '#1A7A42',
    critBg: '#FEF0F0', critTx: '#C42B2B',
    incident: '#FF6B3D',
  },
};

const REDUCED = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Los puntitos del fondo siguen al cursor: la sección expone --pmx/--pmy y
   cada punto los multiplica por su profundidad (--depth), efecto parallax. */
function useCursorParallax(strengthX = 38, strengthY = 30) {
  const ref = useRef(null);
  const onMouseMove = (e) => {
    if (REDUCED()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width - 0.5) * strengthX;
    const my = ((e.clientY - r.top) / r.height - 0.5) * strengthY;
    el.style.setProperty('--pmx', `${mx.toFixed(1)}px`);
    el.style.setProperty('--pmy', `${my.toFixed(1)}px`);
  };
  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--pmx', '0px');
    el.style.setProperty('--pmy', '0px');
  };
  return { ref, onMouseMove, onMouseLeave };
}

/* Tilt 3D sutil de la ventana del hero siguiendo el cursor. */
function useTilt(maxX = 3.5, maxY = 5) {
  const ref = useRef(null);
  const onMouseMove = (e) => {
    if (REDUCED()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = -((e.clientY - r.top) / r.height - 0.5) * maxX;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * maxY;
    el.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
  };
  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
  };
  return { ref, onMouseMove, onMouseLeave };
}

/* ── LOGO ────────────────────────────────────────────────────────────────── */
function PortiaMark({ size = 16, radius = 8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx={radius} fill={T.accent} />
      <path d="M9 7h5.8c1.5 0 2.7.4 3.5 1.2.8.8 1.2 1.8 1.2 3.1s-.4 2.4-1.2 3.1c-.8.8-2 1.2-3.5 1.2H11.4V21H9V7zm2.4 6.6h3.2c.9 0 1.5-.2 2-.6.4-.4.6-.9.6-1.7s-.2-1.3-.6-1.7c-.4-.4-1.1-.6-2-.6h-3.2v4.6z" fill="#fff" />
    </svg>
  );
}
function PortiaLogo({ dark = false, size = 30 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <PortiaMark size={size} radius={8} />
      <span style={{ fontFamily: T.font, fontWeight: 700, fontSize: size * 0.6, letterSpacing: '-0.02em', color: dark ? '#fff' : T.ink }}>
        Portia
      </span>
    </span>
  );
}

/* ── HOOKS ───────────────────────────────────────────────────────────────── */
function useFadeUp(delay = 0, threshold = 0.12) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity .6s ${delay}ms ${T.ease}, transform .6s ${delay}ms ${T.ease}`;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.disconnect();
      }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, threshold]);
  return ref;
}

function useHeroIn(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    const timer = setTimeout(() => {
      el.style.transition = `opacity .8s ${T.ease}, transform .8s ${T.ease}`;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return ref;
}

function CountUp({ end, suffix = '', duration = 1400 }) {
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
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
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

/* ── FONDO VIVO: malla + grilla que panea + partículas ───────────────────── */
const DOTS = [
  { x: '6%', y: '18%', s: 9, c: 'rgba(232,80,31,0.70)', d: 9, del: 0, z: 1.3 },
  { x: '14%', y: '64%', s: 6, c: 'rgba(249,92,75,0.65)', d: 11, del: 1.2, z: 0.7 },
  { x: '22%', y: '32%', s: 7, c: 'rgba(192,54,155,0.60)', d: 8, del: 0.6, z: 1.0 },
  { x: '31%', y: '78%', s: 10, c: 'rgba(232,80,31,0.50)', d: 12, del: 2, z: 1.5 },
  { x: '43%', y: '12%', s: 6, c: 'rgba(249,92,75,0.70)', d: 10, del: 0.3, z: 0.6 },
  { x: '55%', y: '70%', s: 8, c: 'rgba(192,54,155,0.60)', d: 9, del: 1.6, z: 1.1 },
  { x: '64%', y: '24%', s: 9, c: 'rgba(232,80,31,0.65)', d: 11, del: 0.9, z: 1.4 },
  { x: '72%', y: '58%', s: 6, c: 'rgba(249,92,75,0.55)', d: 8, del: 2.4, z: 0.8 },
  { x: '81%', y: '16%', s: 7, c: 'rgba(192,54,155,0.70)', d: 10, del: 0.2, z: 1.2 },
  { x: '88%', y: '46%', s: 10, c: 'rgba(232,80,31,0.50)', d: 12, del: 1.4, z: 1.6 },
  { x: '93%', y: '74%', s: 6, c: 'rgba(249,92,75,0.65)', d: 9, del: 0.7, z: 0.7 },
  { x: '48%', y: '42%', s: 5, c: 'rgba(29,27,22,0.40)', d: 13, del: 1.8, z: 0.5 },
  { x: '9%', y: '86%', s: 7, c: 'rgba(192,54,155,0.55)', d: 10, del: 2.2, z: 1.0 },
  { x: '77%', y: '86%', s: 9, c: 'rgba(232,80,31,0.60)', d: 11, del: 0.5, z: 1.3 },
  { x: '18%', y: '8%', s: 8, c: 'rgba(192,54,155,0.55)', d: 12, del: 1.1, z: 1.2 },
  { x: '37%', y: '55%', s: 5, c: 'rgba(249,92,75,0.60)', d: 9, del: 2.8, z: 0.6 },
  { x: '60%', y: '90%', s: 7, c: 'rgba(232,80,31,0.55)', d: 10, del: 0.4, z: 0.9 },
  { x: '96%', y: '28%', s: 6, c: 'rgba(192,54,155,0.65)', d: 11, del: 1.9, z: 1.1 },
];

function LiveBackground({ dots = true, grid = true, mesh = true, glows = [] }) {
  return (
    <>
      {mesh && <div aria-hidden="true" className="bg-mesh" />}
      {grid && <div aria-hidden="true" className="bg-grid" />}
      {glows.map((g, i) => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute', pointerEvents: 'none',
          background: `radial-gradient(ellipse, ${g.c} 0%, transparent 62%)`,
          ...g.pos,
        }} />
      ))}
      {dots && DOTS.map(({ x, y, s, c, d, del, z }, i) => (
        <span key={i} aria-hidden="true" className="bg-dot-wrap" style={{ left: x, top: y, '--depth': z }}>
          <span className="bg-dot" style={{
            width: s, height: s, background: c, boxShadow: `0 0 ${s * 1.6}px ${c}`,
            animationDuration: `${d}s`, animationDelay: `${del}s`,
          }} />
        </span>
      ))}
    </>
  );
}

/* ── MINI ICONS ──────────────────────────────────────────────────────────── */
function mi(paths, size = 13) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths}
    </svg>
  );
}
const MI = {
  home:  mi(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>),
  swap:  mi(<><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>),
  doc:   mi(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>),
  users: mi(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>),
  box:   mi(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></>),
  check: mi(<><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>),
  bld:   mi(<><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="7" x2="9" y2="7.01" /><line x1="15" y1="7" x2="15" y2="7.01" /><line x1="9" y1="12" x2="9" y2="12.01" /><line x1="15" y1="12" x2="15" y2="12.01" /></>),
  clock: mi(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>),
  camera: mi(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>),
  lock:  mi(<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>),
  monitor: mi(<><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>),
  globe: mi(<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>),
  down:  mi(<><line x1="12" y1="3" x2="12" y2="17" /><polyline points="6 11 12 17 18 11" /><line x1="4" y1="21" x2="20" y2="21" /></>, 15),
  book:  mi(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>, 14),
  okSm:  (c, s = 13) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
  ),
  xSm: (c) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  ),
};

/* ── VENTANA DE LA APP (hover-interactiva) ───────────────────────────────── */
const SIDE_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: MI.home },
  { id: 'turnos', label: 'Entrega de Turno', icon: MI.swap },
  { id: 'novedades', label: 'Novedades', icon: MI.doc },
  { id: 'visitas', label: 'Visitas', icon: MI.users },
  { id: 'encomiendas', label: 'Encomiendas', icon: MI.box },
  { id: 'tareas', label: 'Tareas', icon: MI.check },
  { id: 'edificio', label: 'Edificio', icon: MI.bld },
];

// Réplica del rail circular real (apps/desktop/src/components/Sidebar.jsx +
// index.css): sin barra de título ni semáforo — la app real no tiene chrome,
// el rail es solo íconos en círculos, el activo se marca en negro sólido.
function AppWindow({ active = 'inicio', minHeight = 420, children }) {
  return (
    <div style={{
      position: 'relative', zIndex: 1,
      background: T.bgCard, borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${T.border}`, boxShadow: T.shadowWin,
    }}>
      <div style={{ display: 'flex', minHeight }}>
        <div style={{ width: 62, flexShrink: 0, background: T.app.side2, borderRight: `1px solid ${T.border}`, padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#fff', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
            boxShadow: '0 4px 10px -3px rgba(217,67,13,0.4)',
          }}>
            <PortiaMark size={16} />
          </div>
          {SIDE_ITEMS.map(({ id, icon }) => {
            const on = id === active;
            return (
              <span key={id} style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: on ? T.ink : 'transparent',
                color: on ? T.bgCard : T.inkSub,
              }}>{icon}</span>
            );
          })}
        </div>
        <div style={{ flex: 1, background: T.app.base, padding: 18, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const chip = (bg, tx) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, background: bg, color: tx, fontSize: 9.5, fontWeight: 700, borderRadius: 100, padding: '3px 8px', letterSpacing: '0.02em' });
const appCard = { background: T.app.card, borderRadius: 10, border: `1px solid ${T.app.border}`, boxShadow: '0 1px 2px rgba(0,0,0,.03)' };
const appBtn = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11.5, fontWeight: 600, borderRadius: 8, padding: '8px 14px' };

function ViewHeader({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: T.app.ink, letterSpacing: '-0.01em' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: T.app.sub, marginTop: 2 }}>{sub}</div>}
      </div>
      {action && <span className="aw-btn" style={{ ...appBtn, padding: '6px 12px', fontSize: 11 }}>{action}</span>}
    </div>
  );
}

/* ── INICIO EN VIVO ──────────────────────────────────────────────────────── */
const LIVE_POOL = [
  { t: 'María González ingresó', s: 'Visita · Depto 1204' },
  { t: 'Encomienda Chilexpress', s: 'Perecible, marcada urgente · Depto 802' },
  { t: 'Pedro Salinas ingresó', s: 'Visita · Depto 310' },
  { t: 'Encomienda retirada', s: 'Firmada en pantalla · Depto 310' },
  { t: 'Novedad registrada', s: 'Recarga de gas recibida' },
  { t: 'Tarea completada', s: 'Ampolleta piso 5 · confirmada por el admin' },
  { t: 'Técnico Movistar ingresó', s: 'Visita autorizada · Depto 1508' },
];

function LiveInicioView() {
  const [feed, setFeed] = useState([
    { ...LIVE_POOL[0], h: '14:28', id: 0 },
    { ...LIVE_POOL[1], h: '14:26', id: 1 },
    { ...LIVE_POOL[2], h: '14:21', id: 2 },
  ]);
  const [visitas, setVisitas] = useState(12);
  const idx = useRef(3);

  useEffect(() => {
    if (REDUCED()) return;
    const iv = setInterval(() => {
      const item = LIVE_POOL[idx.current % LIVE_POOL.length];
      const now = new Date();
      const h = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setFeed(f => [{ ...item, h, id: Date.now() }, ...f].slice(0, 3));
      if (item.t.includes('ingresó')) setVisitas(v => Math.min(v + 1, 19));
      idx.current += 1;
    }, 3400);
    return () => clearInterval(iv);
  }, []);

  const modulos = [
    { l: 'Visitas', s: `${visitas} activas hoy`, bg: '#FDE4DF', tx: '#C4432E', icon: MI.users },
    { l: 'Encomiendas', s: '8 por retirar', bg: '#FBEFD9', tx: '#9A6B1E', icon: MI.box },
    { l: 'Tareas', s: '2 pendientes', bg: '#EDEBE6', tx: '#4A4847', icon: MI.check },
    { l: 'Novedades', s: '3 en el turno', bg: '#FDE4DF', tx: '#C4432E', icon: MI.doc },
  ];

  return (
    <div>
      {/* Header: saludo + wifi/emergencia/avatar, igual a la app real */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.app.ink, letterSpacing: '-0.01em' }}>Buenas tardes, Luis.</div>
          <div style={{ fontSize: 11, color: T.app.sub, marginTop: 2 }}>Miércoles 2 de julio</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#fff', border: `1px solid ${T.app.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.app.mid }}>{MI.globe}</span>
          <span style={{ height: 26, padding: '0 10px', borderRadius: 13, background: T.app.brand, color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center' }}>Emergencia</span>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: T.ink, color: T.bgCard, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>LS</span>
        </div>
      </div>

      <span className="aw-chip" style={{ ...chip(T.app.okBg, T.app.okTx), marginBottom: 14 }}>
        <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: T.app.okTx, display: 'block' }} />
        Turno activo desde 08:00
      </span>

      <div style={{ fontSize: 10, fontWeight: 700, color: T.app.sub, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '4px 0 9px' }}>Tu día</div>
      <div className="win-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
        {modulos.map(({ l, s, bg, tx, icon }) => (
          <div key={l} className="awc" style={{ ...appCard, padding: 13 }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, background: bg, color: tx, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{icon}</span>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.app.ink }}>{l}</div>
            <div style={{ fontSize: 10.5, color: T.app.mid, marginTop: 2 }}>{s}</div>
          </div>
        ))}
      </div>

      <div className="awc" style={{ ...appCard, padding: 13, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.app.sub, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Actividad reciente</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9.5, fontWeight: 700, color: T.app.okTx }}>
            <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: T.app.okTx, display: 'block' }} />
            EN VIVO
          </span>
        </div>
        {feed.map(({ t, s, h, id }, i) => (
          <div key={id} className={(i === 0 ? 'feed-in ' : '') + 'aw-row'} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 6px', margin: '0 -6px', borderBottom: i < feed.length - 1 ? `1px solid ${T.app.border}` : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: T.app.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</div>
              <div style={{ fontSize: 10, color: T.app.sub, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</div>
            </div>
            <span style={{ fontSize: 10, color: T.app.sub, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{h}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── VISTAS DE MÓDULOS ───────────────────────────────────────────────────── */
function VisitasView() {
  return (
    <div>
      <ViewHeader title="Visitas" sub="Registro de hoy · 12 ingresos" action="+ Nueva visita" />
      <div className="awc" style={{ ...appCard, padding: 14, marginBottom: 10 }}>
        <div className="win-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.app.sub, marginBottom: 4 }}>RUT</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1.5px solid ${T.app.okTx}`, borderRadius: 8, padding: '8px 10px', background: '#fff' }}>
              <span style={{ fontSize: 12, color: T.app.ink, fontVariantNumeric: 'tabular-nums' }}>12.345.678-5</span>
              {MI.okSm(T.app.okTx)}
            </div>
            <div style={{ fontSize: 9.5, color: T.app.okTx, fontWeight: 600, marginTop: 3 }}>RUT válido</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.app.sub, marginBottom: 4 }}>Departamento</div>
            <div style={{ border: `1px solid ${T.app.border}`, borderRadius: 8, padding: '8px 10px', background: '#fff', fontSize: 12, color: T.app.ink }}>1204</div>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: T.app.sub, marginBottom: 4 }}>Nombre completo</div>
          <div style={{ border: `1px solid ${T.app.border}`, borderRadius: 8, padding: '8px 10px', background: '#fff', fontSize: 12, color: T.app.ink }}>María González Rojas</div>
        </div>
        <span className="aw-btn" style={{ ...appBtn, width: '100%' }}>Registrar ingreso</span>
      </div>
      <div className="awc" style={{ ...appCard, padding: '4px 13px' }}>
        {[
          { n: 'Pedro Salinas', d: 'Depto 310', h: '13:52' },
          { n: 'Técnico Movistar', d: 'Depto 1508 · autorizado por residente', h: '12:20' },
        ].map(({ n, d, h }, i, a) => (
          <div key={n} className="aw-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 6px', margin: '0 -6px', borderBottom: i < a.length - 1 ? `1px solid ${T.app.border}` : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: T.app.ink }}>{n}</div>
              <div style={{ fontSize: 10, color: T.app.sub, marginTop: 1 }}>{d}</div>
            </div>
            <span style={{ fontSize: 10, color: T.app.sub, fontVariantNumeric: 'tabular-nums' }}>{h}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EncomiendasView() {
  return (
    <div>
      <ViewHeader title="Encomiendas" sub="8 por retirar · 23 entregadas esta semana" action="+ Registrar" />
      <div className="awc" style={{ ...appCard, padding: 13, marginBottom: 10, borderLeft: `3px solid ${T.app.incident}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.app.ink }}>Chilexpress · Depto 802</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: T.app.sub, marginTop: 3 }}>
              {MI.camera} Recibida 14:11 · Foto adjunta
            </div>
          </div>
          <span className="aw-chip" style={chip(T.app.critBg, T.app.critTx)}>Perecible · Urgente</span>
        </div>
        <span className="aw-btn-ghost" style={{ ...appBtn, background: 'transparent', color: T.app.brand, border: `1.5px solid ${T.app.brand}`, padding: '6px 12px', fontSize: 11 }}>Notificar al residente</span>
      </div>
      <div className="awc" style={{ ...appCard, padding: 13 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.app.ink }}>Correos de Chile · Depto 310</div>
            <div style={{ fontSize: 10, color: T.app.sub, marginTop: 3 }}>Recibida 09:40 · Notificada 09:41</div>
          </div>
          <span className="aw-chip" style={chip(T.app.okBg, T.app.okTx)}>
            {MI.okSm(T.app.okTx)} Retirada · Firmada 18:22
          </span>
        </div>
      </div>
    </div>
  );
}

function NovedadesView() {
  return (
    <div>
      <ViewHeader title="Novedades" sub="El libro de novedades del edificio" action="+ Nueva" />
      <div className="awc" style={{ ...appCard, padding: 13, marginBottom: 10, borderLeft: `3px solid ${T.app.critTx}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
          <span className="aw-chip" style={chip(T.app.critBg, T.app.critTx)}>Urgente</span>
          <span style={{ fontSize: 10, color: T.app.sub, fontVariantNumeric: 'tabular-nums' }}>02:14 · Turno noche</span>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.app.ink, marginBottom: 4 }}>Filtración de agua en el piso 3</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: T.app.sub, marginBottom: 8 }}>
          {MI.camera} 2 fotos · Administrador notificado al instante
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9.5, color: T.app.sub, borderTop: `1px solid ${T.app.border}`, paddingTop: 8 }}>
          {MI.lock} Registrado por Luis Soto · Este registro no se puede editar ni borrar
        </div>
      </div>
      <div className="awc" style={{ ...appCard, padding: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.app.ink }}>Se recibió la recarga de gas del edificio</div>
          <span style={{ fontSize: 10, color: T.app.sub, fontVariantNumeric: 'tabular-nums' }}>09:12</span>
        </div>
      </div>
    </div>
  );
}

function TurnosView() {
  return (
    <div>
      <ViewHeader title="Entrega de turno" sub="Turno día · Luis Soto · 08:00 a 20:00" />
      <div className="awc" style={{ ...appCard, padding: 13, marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.app.sub, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>Resumen automático del turno</div>
        <div style={{ display: 'flex', gap: 18 }}>
          {[['12', 'visitas'], ['8', 'encomiendas'], ['1', 'novedad urgente']].map(([n, l]) => (
            <div key={l}>
              <span style={{ fontSize: 17, fontWeight: 700, color: T.app.ink, fontVariantNumeric: 'tabular-nums' }}>{n}</span>
              <span style={{ fontSize: 10.5, color: T.app.mid, marginLeft: 5 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="awc" style={{ ...appCard, padding: 13, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.app.sub, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Pendientes para el turno que entra</div>
        {['Encomienda del depto 802 sin retirar', 'Confirmar visita técnica del ascensor'].map((t, i, a) => (
          <div key={t} className="aw-row" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 6px', margin: '0 -6px', borderBottom: i < a.length - 1 ? `1px solid ${T.app.border}` : 'none' }}>
            <span className="aw-check" style={{ width: 13, height: 13, borderRadius: 4, border: `1.5px solid ${T.app.border}`, flexShrink: 0, display: 'block' }} />
            <span style={{ fontSize: 11.5, color: T.app.mid }}>{t}</span>
          </div>
        ))}
      </div>
      <span className="aw-btn" style={{ ...appBtn, width: '100%' }}>Firmar y entregar turno</span>
    </div>
  );
}

function TareasView() {
  return (
    <div>
      <ViewHeader title="Tareas" sub="2 pendientes · 1 completada hoy" />
      {[
        { done: false, t: 'Cambiar ampolleta del pasillo, piso 5', s: 'Asignada por administración · vence hoy' },
        { done: false, t: 'Revisar citófono del depto 1204', s: 'Asignada hoy 10:02' },
        { done: true, t: 'Regar el jardín de la entrada', s: 'Completada 11:30 · Confirmada por el administrador' },
      ].map(({ done, t, s }) => (
        <div key={t} className="awc" style={{ ...appCard, padding: '11px 13px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, opacity: done ? 0.7 : 1 }}>
          <span className="aw-check" style={{
            width: 16, height: 16, borderRadius: 5, flexShrink: 0,
            border: done ? 'none' : `1.5px solid ${T.app.border}`,
            background: done ? T.app.okTx : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {done && MI.okSm('#fff')}
          </span>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: T.app.ink, textDecoration: done ? 'line-through' : 'none' }}>{t}</div>
            <div style={{ fontSize: 10, color: T.app.sub, marginTop: 1 }}>{s}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── DEMO INTERACTIVA ────────────────────────────────────────────────────── */
const DEMO_TABS = [
  {
    id: 'visitas', label: 'Visitas', tag: 'RUT validado en vivo', icon: MI.users,
    halo: 'rgba(44,140,87,0.20)',
    view: <VisitasView />,
    steps: [
      'El conserje escribe el RUT y Portia lo valida al instante.',
      'Elige el departamento y registra el ingreso en dos toques.',
      'La visita queda en el historial, visible para el administrador.',
    ],
  },
  {
    id: 'encomiendas', label: 'Encomiendas', tag: 'Nada se queda sin retirar', icon: MI.box,
    halo: 'rgba(201,138,27,0.22)',
    view: <EncomiendasView />,
    steps: [
      'Llega el paquete y se registra con foto en segundos.',
      'Si es perecible, Portia lo marca urgente automáticamente.',
      'El residente retira, firma en pantalla y queda el respaldo.',
    ],
  },
  {
    id: 'novedades', label: 'Novedades', tag: 'El cuaderno, pero inmutable', icon: MI.doc,
    halo: 'rgba(232,80,31,0.20)',
    view: <NovedadesView />,
    steps: [
      'El conserje registra la novedad con foto y categoría.',
      'Las urgentes le llegan al administrador al instante.',
      'El registro no se puede borrar ni adulterar. Queda para siempre.',
    ],
  },
  {
    id: 'turnos', label: 'Turnos', tag: 'Traspaso sin lagunas', icon: MI.swap,
    halo: 'rgba(192,54,155,0.20)',
    view: <TurnosView />,
    steps: [
      'Al cerrar el turno, Portia arma el resumen sola.',
      'Los pendientes pasan automáticamente al turno que entra.',
      'El conserje que llega sabe exactamente qué pasó antes.',
    ],
  },
  {
    id: 'tareas', label: 'Tareas', tag: 'Del panel a la pantalla del conserje', icon: MI.check,
    halo: 'rgba(249,92,75,0.22)',
    view: <TareasView />,
    steps: [
      'El administrador asigna la tarea desde el panel web.',
      'El conserje la ve en su pantalla y la ejecuta.',
      'Al completarla, el administrador recibe la confirmación.',
    ],
  },
];

const AUTOPLAY_MS = 5200;

function ProductDemo() {
  const [active, setActive] = useState('visitas');
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const tab = DEMO_TABS.find(t => t.id === active);
  const headRef = useFadeUp(0);
  const bodyRef = useFadeUp(120);

  useEffect(() => {
    if (!auto || paused || REDUCED()) return;
    const iv = setInterval(() => {
      setActive(cur => {
        const i = DEMO_TABS.findIndex(t => t.id === cur);
        return DEMO_TABS[(i + 1) % DEMO_TABS.length].id;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(iv);
  }, [auto, paused]);

  const pick = (id) => { setAuto(false); setActive(id); };

  return (
    <section id="producto" style={{ position: 'relative', overflow: 'hidden', background: T.bgPanel, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, scrollMarginTop: 80 }}>
      <LiveBackground mesh={false} grid={false} glows={[
        { c: 'rgba(232,80,31,0.07)', pos: { top: '-12%', right: '-8%', width: 620, height: 420 }, d: 15 },
        { c: 'rgba(249,92,75,0.06)', pos: { bottom: '-16%', left: '-6%', width: 540, height: 400 }, d: 18, rev: true },
      ]} />
      <div className="pp" style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '100px 40px 110px' }}>
        <div ref={headRef} style={{ maxWidth: 680, marginBottom: 56, display: 'flex', gap: 22, alignItems: 'flex-start' }}>
          <span className="section-badge" aria-hidden="true" style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${T.accent}, ${T.pink})`, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 22px -6px rgba(217,67,13,0.5)',
          }}><span style={{ transform: 'scale(1.8)' }}>{MI.check}</span></span>
          <div>
            <div className="grad-static" style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 10, letterSpacing: '0.01em' }}>LA SOLUCIÓN</div>
            <h2 style={{ fontSize: 'clamp(36px,4.4vw,58px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.03, color: T.ink, margin: '0 0 18px' }}>
              Así se ve un turno<br />con Portia.
            </h2>
            <p style={{ fontSize: 19, color: T.inkMid, lineHeight: 1.65, margin: 0, maxWidth: 520 }}>
              Haz clic en cada módulo y mira cómo lo usa un conserje en su día a día. Lo que ves acá es la aplicación real.
            </p>
          </div>
        </div>

        <div ref={bodyRef} className="demo-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 28, alignItems: 'start' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="demo-tabs" role="tablist" aria-label="Módulos de Portia" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_TABS.map(({ id, label, tag, icon }) => {
              const on = id === active;
              return (
                <button key={id} role="tab" aria-selected={on} onClick={() => pick(id)}
                  className={on ? 'demo-tab demo-tab-on' : 'demo-tab'}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
                    background: on ? T.bgCard : 'rgba(255,255,255,0.55)',
                    border: `1px solid ${on ? T.border : 'rgba(226,221,209,0.6)'}`,
                    boxShadow: on ? '0 4px 14px rgba(29,27,22,0.08)' : 'none',
                    borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                    fontFamily: T.font, width: '100%', flexShrink: 0,
                  }}
                >
                  <span className="tab-ic" style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: on ? `linear-gradient(120deg, ${T.ink}, #3B3830)` : 'rgba(29,27,22,0.07)',
                    color: on ? '#fff' : T.inkMid,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{icon}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 16, fontWeight: 700, color: T.ink, letterSpacing: '-0.01em' }}>{label}</span>
                    <span className="demo-tag" style={{ display: 'block', fontSize: 13, color: T.inkMid, marginTop: 2 }}>{tag}</span>
                  </span>
                  {on && auto && (
                    <span key={active} className="tab-progress" aria-hidden="true" style={{
                      position: 'absolute', left: 0, bottom: 0, height: 2.5,
                      background: `linear-gradient(90deg, ${T.accent}, ${T.pink})`,
                      animationDuration: `${AUTOPLAY_MS}ms`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ position: 'relative' }}>
            {/* halo ambiente que cambia de color según el módulo activo */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: '-8% -6%', zIndex: 0, pointerEvents: 'none',
              background: `radial-gradient(ellipse at 20% 80%, ${tab.halo} 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(249,92,75,0.13) 0%, transparent 55%)`,
              transition: 'background .6s ease',
            }} />
            <div key={active} className="demo-view" role="tabpanel" style={{ position: 'relative', zIndex: 1 }}>
              <div className="demo-frame">
                <AppWindow active={active} minHeight={392}>
                  {tab.view}
                </AppWindow>
              </div>
            </div>
            <div className="demo-steps" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 22 }}>
              {tab.steps.map((s, i) => (
                <div key={s} className="demo-view step-pill" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animationDelay: `${i * 70}ms`, animationFillMode: 'backwards' }}>
                  <span className="step-num" style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    background: `linear-gradient(130deg, ${T.ink}, #45413a)`, color: T.bg, fontSize: 11.5, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontVariantNumeric: 'tabular-nums',
                  }}>{i + 1}</span>
                  <p style={{ fontSize: 15, color: T.inkMid, lineHeight: 1.6, margin: 0 }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── STATS v2 — visuales que se entienden ────────────────────────────────── */
function StatCards() {
  const ref = useFadeUp(120);
  const tile = (grad) => ({
    width: 30, height: 30, borderRadius: 9, flexShrink: 0, color: '#fff',
    background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(29,27,22,0.12)',
  });
  return (
    <div ref={ref} className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
      {/* 2 min: anillo de progreso */}
      <div className="stat-card" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18, padding: '26px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="stat-num" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: T.ink }}>
              <CountUp end={2} suffix=" min" />
            </div>
            <div style={{ fontSize: 15, color: T.inkMid, marginTop: 9, fontWeight: 500 }}>y Portia está instalado</div>
          </div>
          <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true" style={{ flexShrink: 0 }}>
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={T.accent} />
                <stop offset="100%" stopColor={T.pink} />
              </linearGradient>
            </defs>
            <circle cx="30" cy="30" r="27" fill="none" stroke="rgba(29,27,22,0.08)" strokeWidth="2" />
            {[...Array(12)].map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const r1 = i % 3 === 0 ? 21 : 23.5;
              const x1 = (30 + Math.sin(a) * r1).toFixed(2), y1 = (30 - Math.cos(a) * r1).toFixed(2);
              const x2 = (30 + Math.sin(a) * 25.5).toFixed(2), y2 = (30 - Math.cos(a) * 25.5).toFixed(2);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(29,27,22,0.22)" strokeWidth={i % 3 === 0 ? 2 : 1.2} strokeLinecap="round" />;
            })}
            <line x1="30" y1="30" x2="30" y2="17" stroke={T.ink} strokeWidth="2.6" strokeLinecap="round" />
            <line className="clock-min-hand" x1="30" y1="30" x2="30" y2="10" stroke="url(#ringGrad)" strokeWidth="3" strokeLinecap="round" style={{ transformOrigin: '30px 30px' }} />
            <circle cx="30" cy="30" r="2.6" fill={T.ink} />
          </svg>
        </div>
        <div style={{ fontSize: 13, color: T.inkSub, marginTop: 14 }}>Descarga, abre y empieza a registrar</div>
      </div>

      {/* 6 módulos: tiles de colores tipo app */}
      <div className="stat-card" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18, padding: '26px 24px' }}>
        <div className="stat-num" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: T.ink }}>
          <CountUp end={6} />
        </div>
        <div style={{ fontSize: 15, color: T.inkMid, margin: '9px 0 16px', fontWeight: 500 }}>módulos desde el día uno</div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {[
            [`linear-gradient(130deg, ${T.accent}, #F0793F)`, MI.doc],
            ['linear-gradient(130deg, #2C8C57, #55B380)', MI.users],
            ['linear-gradient(130deg, #C98A1B, #E7B04C)', MI.box],
            [`linear-gradient(130deg, ${T.violet}, #FF9478)`, MI.check],
            [`linear-gradient(130deg, ${T.pink}, #DE62C0)`, MI.swap],
            ['linear-gradient(130deg, #1D1B16, #45413A)', MI.monitor],
          ].map(([grad, icon], i) => (
            <span key={i} className="mod-tile mod-tile-idle" style={{ ...tile(grad), animationDelay: `${i * 0.12}s` }}>{icon}</span>
          ))}
        </div>
        <div style={{ fontSize: 13, color: T.inkSub, marginTop: 12 }}>Sin planes a medias</div>
      </div>

      {/* 0 papel: cuaderno → Portia */}
      <div className="stat-card" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18, padding: '26px 24px' }}>
        <div className="stat-num" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: T.ink }}>
          <CountUp end={0} />
        </div>
        <div style={{ fontSize: 15, color: T.inkMid, margin: '9px 0 16px', fontWeight: 500 }}>papel en la operación</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(196,121,91,0.12)', color: '#C4795B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
            {MI.doc}
            <svg className="paper-strike" width="34" height="34" viewBox="0 0 34 34" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
              <line x1="8" y1="26" x2="26" y2="8" stroke="#C4795B" strokeWidth="2.4" strokeLinecap="round" pathLength="100" />
            </svg>
          </span>
          <span className="flow-track" aria-hidden="true" style={{ position: 'relative', flex: 1, maxWidth: 52, height: 2.5, borderRadius: 2, background: `linear-gradient(90deg, rgba(29,27,22,0.15), ${T.accent})`, display: 'block' }}>
            <span className="flow-dot" style={{ position: 'absolute', top: -2.2, left: 0, width: 7, height: 7, borderRadius: '50%', background: T.accent, boxShadow: `0 0 8px rgba(232,80,31,0.6)` }} />
          </span>
          <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(130deg, ${T.accent}, ${T.pink})`, boxShadow: '0 2px 8px rgba(217,67,13,0.35)' }}>
            <PortiaMark size={18} radius={5} />
          </span>
        </div>
        <div style={{ fontSize: 13, color: T.inkSub, marginTop: 14 }}>El cuaderno de papel queda tachado — todo va directo a la nube</div>
      </div>

      {/* 1 plataforma: app y web conectadas */}
      <div className="stat-card" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 18, padding: '26px 24px' }}>
        <div className="stat-num" style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: T.ink }}>
          <CountUp end={1} />
        </div>
        <div style={{ fontSize: 15, color: T.inkMid, margin: '9px 0 16px', fontWeight: 500 }}>plataforma, dos mundos</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span className="node-pulse-a" style={{ width: 34, height: 34, borderRadius: 9, background: T.app.side, color: '#FFDCD3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{MI.monitor}</span>
          <span className="flow-track" aria-hidden="true" style={{ position: 'relative', flex: 1, maxWidth: 52, height: 2.5, borderRadius: 2, background: `linear-gradient(90deg, ${T.violet}, ${T.accent})`, display: 'block' }}>
            <span className="flow-dot" style={{ position: 'absolute', top: -2.2, left: 0, width: 7, height: 7, borderRadius: '50%', background: '#fff', border: `1.5px solid ${T.violet}`, boxShadow: '0 0 8px rgba(249,92,75,0.55)' }} />
          </span>
          <span className="node-pulse-b" style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(130deg, ${T.violet}, #FF9478)`, color: '#fff' }}>{MI.globe}</span>
        </div>
        <div style={{ fontSize: 13, color: T.inkSub, marginTop: 14 }}>Conserje en la app, admin en la web</div>
      </div>
    </div>
  );
}

/* ── COMPARACIÓN ─────────────────────────────────────────────────────────── */
function Comparison() {
  const stmtRef = useFadeUp(0);
  const leftRef = useFadeUp(80);
  const rightRef = useFadeUp(160);

  const hoy = [
    'La letra de cada turno es distinta y nadie la entiende',
    'Las encomiendas se anotan en papelitos que se pierden',
    'El traspaso de turno depende de la memoria del que sale',
    'El administrador se entera de los problemas días después',
  ];
  const portia = [
    'Cada registro con hora, autor y foto',
    'Encomiendas con retiro firmado en pantalla',
    'Resumen de turno automático para el que entra',
    'El administrador lo ve en el momento',
  ];

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <LiveBackground mesh={false} grid={false} dots={false} glows={[
        { c: 'rgba(192,54,155,0.06)', pos: { top: '10%', left: '-10%', width: 520, height: 420 }, d: 16 },
      ]} />
      <div className="pp" style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '104px 40px 100px' }}>
        <div ref={stmtRef} style={{ maxWidth: 900, marginBottom: 60, display: 'flex', gap: 22, alignItems: 'flex-start' }}>
          <span className="section-badge" aria-hidden="true" style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            background: T.bgDark, color: '#FF8A6B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 22px -6px rgba(23,21,31,0.35)',
          }}><span style={{ transform: 'scale(1.8)' }}>{MI.bld}</span></span>
          <div>
            <div className="grad-static" style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 10, letterSpacing: '0.01em' }}>EL PROBLEMA</div>
            <p style={{ fontSize: 'clamp(30px,4vw,50px)', fontWeight: 700, lineHeight: 1.16, letterSpacing: '-0.025em', color: T.ink, margin: '0 0 14px' }}>
              En Chile, la operación de un edificio todavía vive en{' '}
              <span style={{ textDecoration: 'line-through', textDecorationThickness: 3, textDecorationColor: T.accent, color: T.inkSub, fontWeight: 600 }}>cuadernos y grupos de WhatsApp</span>.{' '}
              Portia la pone en orden.
            </p>
            <p style={{ fontSize: 17, color: T.inkMid, lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
              Un incidente sin foto, una encomienda sin firma, un turno que se entrega de memoria. Cada vacío de información es una llamada de un residente molesto.
            </p>
          </div>
        </div>

        <div className="cmp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 72 }}>
          <div ref={leftRef} className="cmp-card" style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: '34px 34px 38px' }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: T.inkSub, marginBottom: 22 }}>La conserjería de hoy</div>
            {hoy.map((t, i) => (
              <div key={t} className="cmp-row" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < hoy.length - 1 ? 17 : 0 }}>
                <span style={{ marginTop: 4, flexShrink: 0 }}>{MI.xSm('#C4795B')}</span>
                <span style={{ fontSize: 16.5, color: T.inkMid, lineHeight: 1.55 }}>{t}</span>
              </div>
            ))}
          </div>
          <div ref={rightRef} className="cmp-card" style={{ position: 'relative', overflow: 'hidden', background: T.bgDark, borderRadius: 20, padding: '34px 34px 38px', boxShadow: T.shadowCard }}>
            <div className="grad-strip" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }} />
            <div aria-hidden="true" style={{
              position: 'absolute', top: '-40%', right: '-30%', width: 400, height: 320,
              background: `radial-gradient(ellipse, rgba(249,92,75,0.28) 0%, transparent 65%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
                <PortiaMark size={16} />
                <span style={{ fontSize: 14.5, fontWeight: 700, color: '#fff' }}>La conserjería con Portia</span>
              </div>
              {portia.map((t, i) => (
                <div key={t} className="cmp-row" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < portia.length - 1 ? 17 : 0 }}>
                  <span style={{ marginTop: 4, flexShrink: 0 }}>{MI.okSm('#7ED09A')}</span>
                  <span style={{ fontSize: 16.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <StatCards />
      </div>
    </section>
  );
}

/* ── CHIP FLOTANTE ───────────────────────────────────────────────────────── */
// Antes tenían un bucle infinito de translateY que se veía roto/tembloroso
// (y a veces quedaban tapando el mockup en pantallas angostas). Ahora es una
// sola aparición al entrar en viewport, sin loop.
function FloatChip({ style, delay = 0, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || REDUCED()) return;
    const tilt = style?.['--tilt'] ?? '0deg';
    el.style.opacity = '0';
    el.style.transform = `translateY(14px) rotate(${tilt})`;
    el.style.transition = `opacity .6s ${delay}s ${T.ease}, transform .6s ${delay}s ${T.ease}`;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = `translateY(0) rotate(${tilt})`;
        obs.disconnect();
      }
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, style]);

  return (
    <div ref={ref} className="float-chip" aria-hidden="true" style={{
      position: 'absolute', zIndex: 2,
      background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12,
      boxShadow: T.shadowFloat, padding: '10px 14px 10px 10px',
      display: 'flex', alignItems: 'center', gap: 9,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ── NAV ─────────────────────────────────────────────────────────────────── */
// Banda sólida con presencia real (inspirado en nablus.cl) en vez de una
// barra traslúcida delgada que se perdía contra el fondo.
function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: T.ink }}>
      <div className="pp" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 40px', height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} aria-label="Portia, inicio">
          <PortiaLogo dark size={34} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 10 }}>
            {[['#producto', 'Producto'], ['#como', 'Cómo funciona']].map(([href, label]) => (
              <a key={href} href={href} className="nav-link" style={{ fontFamily: T.font, fontSize: 15.5, fontWeight: 500, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', padding: '9px 16px', borderRadius: 8 }}>
                {label}
              </a>
            ))}
          </div>
          <Link href="/login" style={{
            fontFamily: T.font, fontSize: 15, fontWeight: 700, color: T.ink, background: '#fff',
            textDecoration: 'none', borderRadius: 10, padding: '12px 24px', display: 'inline-block',
          }}>Entrar al panel</Link>
        </div>
      </div>
      <div className="grad-strip" aria-hidden="true" style={{ height: 3 }} />
    </nav>
  );
}

/* ── MAIN ────────────────────────────────────────────────────────────────── */
export default function Landing() {
  const h1 = useHeroIn(80);
  const sub = useHeroIn(200);
  const ctas = useHeroIn(300);
  const win = useHeroIn(440);
  const stepsHead = useFadeUp(0);
  const ctaRef = useFadeUp(0);
  const heroPar = useCursorParallax();
  const ctaPar = useCursorParallax(30, 24);
  const tilt = useTilt();

  return (
    <div style={{ background: T.bg, color: T.ink, fontFamily: T.font, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { -webkit-tap-highlight-color: transparent; }

        /* ── fondo vivo ── */
        .bg-mesh {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(115deg, rgba(232,80,31,0.07), rgba(192,54,155,0.06) 35%, rgba(249,92,75,0.07) 68%, rgba(232,80,31,0.06));
        }
        .bg-grid {
          position: absolute; inset: -26px; pointer-events: none;
          background-image: radial-gradient(rgba(29,27,22,0.14) 1.2px, transparent 1.2px);
          background-size: 26px 26px;
          mask-image: radial-gradient(ellipse 78% 64% at 50% 32%, black 0%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 78% 64% at 50% 32%, black 0%, transparent 70%);
        }
        .bg-dot-wrap {
          position: absolute; pointer-events: none;
          transform: translate(calc(var(--pmx, 0px) * var(--depth, 1)), calc(var(--pmy, 0px) * var(--depth, 1)));
          transition: transform .3s cubic-bezier(.16,1,.3,1);
        }
        .bg-dot {
          display: block; border-radius: 50%; pointer-events: none; opacity: .7;
        }

        /* ── texto de acento (color fijo, sin animación) ── */
        .grad-text, .grad-static {
          color: ${T.accent};
          display: inline-block;
        }
        .grad-strip {
          background: ${T.accent};
        }

        /* ── botones gradiente con luz ── */
        .btn-grad {
          position: relative; overflow: hidden;
          background: linear-gradient(110deg, ${T.accent}, ${T.accentBtn} 45%, ${T.pink});
          background-size: 170% 100%;
          transition: background-position .45s ${T.ease}, transform .2s, box-shadow .25s;
          box-shadow: 0 4px 16px -4px rgba(217,67,13,0.45);
        }
        .btn-grad:hover {
          background-position: 95% 0; transform: translateY(-2px);
          box-shadow: 0 10px 28px -6px rgba(192,54,155,0.5);
        }
        .btn-grad::after {
          content: ''; position: absolute; top: 0; bottom: 0; left: -70%; width: 45%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.5), transparent);
          transform: skewX(-20deg); transition: left .55s ease;
        }
        .btn-grad:hover::after { left: 125%; }

        .btn-ghost {
          border: 1.5px solid ${T.border}; background: ${T.bgCard};
          transition: transform .2s, box-shadow .25s, border-color .2s;
        }
        .btn-ghost:hover {
          transform: translateY(-2px);
          border-color: transparent;
          background-image: linear-gradient(${T.bgCard}, ${T.bgCard}), linear-gradient(110deg, ${T.accent}, ${T.pink}, ${T.violet});
          background-origin: border-box; background-clip: padding-box, border-box;
          box-shadow: 0 8px 22px -8px rgba(29,27,22,0.2);
        }

        .btn-nav { background: ${T.ink}; transition: background .25s, transform .2s, box-shadow .25s; }
        .btn-nav:hover {
          background: linear-gradient(110deg, ${T.accent}, ${T.pink});
          transform: translateY(-1px);
          box-shadow: 0 6px 18px -6px rgba(217,67,13,0.5);
        }
        .nav-link { transition: color .15s, background .15s, transform .15s; }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.1); transform: translateY(-1px); }

        /* ── ventana hover-interactiva ── */
        .aw-side-item { cursor: pointer; transition: background .18s, color .18s, transform .2s ${T.ease}; }
        .aw-side-item:hover { background: rgba(255,255,255,0.08)!important; color: #fff!important; transform: translateX(3px); }
        .aw-side-on:hover { background: rgba(249,92,75,0.4)!important; color: #FFDCD3!important; }
        .awc { transition: transform .25s ${T.ease}, box-shadow .25s, border-color .2s; }
        .awc:hover { transform: translateY(-3px); box-shadow: 0 10px 24px -10px rgba(17,17,17,0.2); border-color: #C7C5E8!important; }
        .aw-row { transition: background .15s, transform .18s ${T.ease}; cursor: default; }
        .aw-row:hover { background: rgba(249,92,75,0.06); transform: translateX(2px); }
        .aw-check { transition: border-color .18s, transform .18s, box-shadow .2s; }
        .aw-row:hover .aw-check { border-color: ${T.app.brand}; transform: scale(1.15); box-shadow: 0 0 0 3px rgba(249,92,75,0.12); }
        .aw-chip { transition: transform .18s ${T.ease}; }
        .aw-chip:hover { transform: scale(1.07); }
        .aw-btn {
          position: relative; overflow: hidden; cursor: pointer;
          background: linear-gradient(110deg, ${T.app.brand}, ${T.violet} 55%, #FF9478);
          background-size: 165% 100%;
          transition: background-position .4s ${T.ease}, transform .2s, box-shadow .25s;
        }
        .aw-btn:hover {
          background-position: 95% 0; transform: translateY(-1.5px);
          box-shadow: 0 6px 16px -5px rgba(249,92,75,0.55);
        }
        .aw-btn::after {
          content: ''; position: absolute; top: 0; bottom: 0; left: -70%; width: 45%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent);
          transform: skewX(-20deg); transition: left .5s ease;
        }
        .aw-btn:hover::after { left: 125%; }
        .aw-btn-ghost { cursor: pointer; transition: background .2s, color .2s, transform .2s; }
        .aw-btn-ghost:hover { background: rgba(249,92,75,0.09)!important; transform: translateY(-1px); }
        .tl-dot { transition: transform .15s; }
        .tl-dot:hover { transform: scale(1.3); }

        /* ── demo ── */
        @keyframes viewIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .demo-view { animation: viewIn .38s ${T.ease}; }
        .demo-frame {
          padding: 3px; border-radius: 17px;
          background: linear-gradient(120deg, ${T.accent}, ${T.pink}, ${T.violet}, ${T.accent});
        }
        .demo-tab { transform: translateX(0); transition: background .25s, border-color .25s, box-shadow .25s, transform .3s ${T.ease}; }
        .demo-tab-on { transform: translateX(4px); }
        .demo-tab:hover { background: rgba(255,255,255,0.92)!important; transform: translateX(7px) translateY(-2px); box-shadow: 0 6px 16px rgba(29,27,22,0.09); }
        .demo-tab-on:hover { transform: translateX(9px) translateY(-2px); }
        .demo-tab:hover .tab-ic { background: linear-gradient(120deg, ${T.accent}, ${T.pink})!important; color: #fff!important; transform: scale(1.08) rotate(-4deg); }
        .tab-ic { transition: background .25s, color .25s, transform .25s ${T.ease}; }
        @keyframes tabProg { from { width: 0%; } to { width: 100%; } }
        .tab-progress { animation-name: tabProg; animation-timing-function: linear; animation-fill-mode: forwards; }
        .step-pill { transition: transform .2s ${T.ease}; }
        .step-pill:hover { transform: translateY(-2px); }
        .step-pill:hover .step-num { background: linear-gradient(130deg, ${T.accent}, ${T.pink})!important; }
        .step-num { transition: background .25s; }

        /* ── feed vivo ── */
        @keyframes feedIn {
          0% { opacity: 0; transform: translateY(-10px); background: rgba(232,80,31,0.10); }
          40% { opacity: 1; background: rgba(232,80,31,0.10); }
          100% { opacity: 1; transform: translateY(0); background: transparent; }
        }
        .feed-in { animation: feedIn .9s ${T.ease}; }

        .float-chip { transition: transform .25s ${T.ease}, box-shadow .25s; cursor: default; }
        .float-chip:hover { transform: scale(1.08) rotate(0deg)!important; box-shadow: 0 8px 24px -8px rgba(29,27,22,0.3); }
        .pulse-dot { opacity: 1; }

        /* ── stats ── */
        .stat-card { transition: transform .3s ${T.ease}, box-shadow .3s, border-color .25s; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: ${T.shadowCard}; border-color: rgba(192,54,155,0.35)!important; }
        .stat-card:hover .stat-num {
          background: linear-gradient(100deg, ${T.accent}, ${T.pink});
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
        }
        .clock-min-hand { transform: rotate(0deg); }
        .mod-tile { transition: transform .2s ${T.ease}; }
        .stat-card:hover .mod-tile { transform: translateY(-3px) rotate(-4deg); }
        .stat-card:hover .mod-tile:nth-child(2n) { transform: translateY(-3px) rotate(4deg); }
        .flow-dot { transform: translateX(22px); }
        .paper-strike line { stroke-dasharray: 100; stroke-dashoffset: 0; }

        .cmp-card { transition: transform .3s ${T.ease}, box-shadow .3s; }
        .cmp-card:hover { transform: translateY(-4px); box-shadow: ${T.shadowFloat}; }
        .cmp-row { transition: transform .18s ${T.ease}; }
        .cmp-row:hover { transform: translateX(4px); }

        .pstep { transition: background .25s, transform .25s ${T.ease}; border-radius: 0 14px 14px 0; }
        .pstep:hover { background: rgba(255,255,255,0.05); transform: translateX(4px); }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration:0.01ms!important; transition-duration:0.01ms!important; }
          html { scroll-behavior: auto; }
          .grad-text, .grad-static { background: none; color: ${T.accent}; -webkit-text-fill-color: currentColor; animation: none; }
        }
        @media (max-width: 1100px) {
          .float-chip { display: none!important; }
        }
        @media (max-width: 1020px) {
          .demo-grid { grid-template-columns: 1fr!important; }
          .demo-tabs { flex-direction: row!important; overflow-x: auto; padding-bottom: 6px; }
          .demo-tabs button { width: auto!important; min-width: 200px; }
          .stat-grid { grid-template-columns: 1fr 1fr!important; }
        }
        @media (max-width: 860px) {
          .pp { padding-left: 22px!important; padding-right: 22px!important; }
          .cmp-grid { grid-template-columns: 1fr!important; }
          .psteps { grid-template-columns: 1fr!important; gap: 0!important; }
          .pstep { padding: 22px 0 22px 28px!important; }
          .pfootg { grid-template-columns: 1fr!important; gap: 32px!important; }
          .nav-links { display: none!important; }
          .demo-steps { grid-template-columns: 1fr!important; gap: 12px!important; }
          .demo-tag { display: none!important; }
        }
        @media (max-width: 720px) {
          .appwin-side { display: none!important; }
          .win-stats { grid-template-columns: 1fr 1fr!important; }
          .win-cols { grid-template-columns: 1fr!important; }
          .stat-grid { grid-template-columns: 1fr!important; }
        }
      `}</style>

      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroPar.ref} onMouseMove={heroPar.onMouseMove} onMouseLeave={heroPar.onMouseLeave} style={{ position: 'relative', overflow: 'hidden' }}>
        <LiveBackground glows={[
          { c: 'rgba(232,80,31,0.14)', pos: { top: '-16%', left: '50%', marginLeft: -460, width: 920, height: 480 }, d: 13 },
          { c: 'rgba(249,92,75,0.11)', pos: { top: '22%', right: '-14%', width: 560, height: 460 }, d: 17, del: 1, rev: true },
          { c: 'rgba(192,54,155,0.09)', pos: { top: '46%', left: '-10%', width: 480, height: 400 }, d: 15, del: 2 },
        ]} />

        <div className="pp" style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '92px 40px 104px', textAlign: 'center' }}>
          <h1 ref={h1} style={{
            fontSize: 'clamp(42px,5.8vw,76px)', fontWeight: 800, letterSpacing: '-0.038em',
            lineHeight: 1.02, color: T.ink, margin: '0 auto 26px', maxWidth: 840,
          }}>
            La portería chilena,<br />
            <span className="grad-text">por fin digital.</span>
          </h1>

          <p ref={sub} style={{ fontSize: 'clamp(17.5px,1.7vw,21px)', color: T.inkMid, maxWidth: 600, lineHeight: 1.65, margin: '0 auto 38px' }}>
            El cuaderno de la conserjería se queda en el pasado. Con Portia, todo
            lo que pasa en tu edificio queda registrado al instante: cada visita,
            encomienda y novedad, con hora, RUT y foto.
          </p>

          <div ref={ctas} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/registro" className="btn-grad" style={{
              fontFamily: T.font, fontSize: 17, fontWeight: 700, color: '#fff',
              textDecoration: 'none', borderRadius: 13, padding: '16px 34px', display: 'inline-block',
            }}>Crear mi cuenta</Link>
            <a href="#producto" className="btn-ghost" style={{
              fontFamily: T.font, fontSize: 17, fontWeight: 600, color: T.ink,
              textDecoration: 'none', borderRadius: 13, padding: '16px 30px', display: 'inline-block',
            }}>Ver cómo funciona</a>
          </div>

          <div ref={win} style={{ position: 'relative', maxWidth: 960, margin: '68px auto 0', textAlign: 'left' }}>
            <div ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave}
              style={{ position: 'relative', transition: 'transform .18s ease-out', transformStyle: 'preserve-3d', willChange: 'transform' }}>
            <FloatChip style={{ top: '18%', left: -74, '--tilt': '-3deg' }} dur={6.5}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: '#EEFAF2', color: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {MI.okSm(T.ok, 15)}
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: T.ink }}>RUT válido</span>
                <span style={{ display: 'block', fontSize: 11, color: T.inkSub }}>12.345.678-5</span>
              </span>
            </FloatChip>
            <FloatChip style={{ top: -26, right: -58, '--tilt': '2.5deg' }} dur={7.5} delay={0.8}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: '#FEF0F0', color: '#C42B2B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {MI.box}
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: T.ink }}>Encomienda urgente</span>
                <span style={{ display: 'block', fontSize: 11, color: T.inkSub }}>Perecible · Depto 802</span>
              </span>
            </FloatChip>
            <FloatChip style={{ bottom: '14%', right: -70, '--tilt': '-2deg' }} dur={7} delay={1.6}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(249,92,75,0.10)', color: T.app.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {MI.swap}
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: T.ink }}>Turno entregado</span>
                <span style={{ display: 'block', fontSize: 11, color: T.inkSub }}>Resumen automático listo</span>
              </span>
            </FloatChip>

            <AppWindow active="inicio" minHeight={400}>
              <LiveInicioView />
            </AppWindow>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEMA PRIMERO: crear la necesidad ─────────────────────────── */}
      <Comparison />

      {/* ── LA SOLUCIÓN: demo del producto ───────────────────────────────── */}
      <ProductDemo />

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────── */}
      <section id="como" style={{ position: 'relative', overflow: 'hidden', background: T.bgDark, scrollMarginTop: 80 }}>
        <div className="grad-strip" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, opacity: 0.85 }} />
        <div aria-hidden="true" style={{
          position: 'absolute', top: '-30%', right: '-10%', width: 700, height: 520,
          background: 'radial-gradient(ellipse, rgba(249,92,75,0.22) 0%, transparent 62%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: '-35%', left: '-8%', width: 560, height: 440,
          background: 'radial-gradient(ellipse, rgba(192,54,155,0.14) 0%, transparent 62%)',
          pointerEvents: 'none',
        }} />
        <div className="pp" style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '100px 40px 108px' }}>
          <div ref={stepsHead} style={{ marginBottom: 56, maxWidth: 560 }}>
            <div className="grad-static" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Cómo funciona</div>
            <h2 style={{ fontSize: 'clamp(32px,3.8vw,50px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#fff', margin: 0 }}>
              Tres pasos. Una tarde.
            </h2>
          </div>
          <div className="psteps" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
            {[
              { n: '01', t: 'Instala en portería', d: 'Windows o Mac, listo en dos minutos. Funciona de inmediato, incluso sin internet.' },
              { n: '02', t: 'El administrador entra al panel', d: 'Desde cualquier navegador, sin instalar nada. Asigna tareas, revisa reportes y supervisa en tiempo real.' },
              { n: '03', t: 'Todo queda registrado', d: 'Cada movimiento aparece al instante en el panel, con historial completo y auditable.' },
            ].map(({ n, t, d }, i) => (
              <StepItem key={n} n={n} t={t} d={d} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section ref={ctaPar.ref} onMouseMove={ctaPar.onMouseMove} onMouseLeave={ctaPar.onMouseLeave} style={{ position: 'relative', overflow: 'hidden' }}>
        <LiveBackground mesh={true} grid={false} glows={[
          { c: 'rgba(232,80,31,0.12)', pos: { top: '6%', left: '50%', marginLeft: -420, width: 840, height: 440 }, d: 15 },
        ]} />
        <div ref={ctaRef} className="pp" style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '110px 40px 120px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(42px,6.6vw,80px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.98, color: T.ink, margin: '0 0 24px' }}>
            Pon tu edificio<br />
            <span className="grad-text">en orden.</span>
          </h2>
          <p style={{ fontSize: 18, color: T.inkMid, maxWidth: 460, margin: '0 auto 42px', lineHeight: 1.65 }}>
            Portia está hecho para edificios chilenos reales.
            Escríbenos y te lo mostramos funcionando.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/registro" className="btn-grad" style={{
              fontFamily: T.font, fontSize: 17.5, fontWeight: 700, color: '#fff',
              textDecoration: 'none', borderRadius: 13, padding: '17px 40px', display: 'inline-block',
            }}>Crear mi cuenta</Link>
            <Link href="/login" className="btn-ghost" style={{
              fontFamily: T.font, fontSize: 17.5, fontWeight: 600, color: T.ink,
              textDecoration: 'none', borderRadius: 13, padding: '17px 36px', display: 'inline-block',
            }}>Entrar al panel</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ position: 'relative', background: T.bgDark }}>
        <div className="grad-strip" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.6 }} />
        <div className="pp pfootg" style={{
          maxWidth: 1180, margin: '0 auto', padding: '60px 40px 44px',
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 44,
          borderBottom: '1px solid rgba(255,255,255,0.09)',
        }}>
          <div>
            <div style={{ marginBottom: 16 }}>
              <PortiaLogo dark size={32} />
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', maxWidth: 320, lineHeight: 1.7, margin: '0 0 10px' }}>
              El sistema operativo de la conserjería chilena. Hecho para conserjes reales, en edificios reales.
            </p>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>Tu edificio. Todo en orden.</p>
          </div>
          {[
            { h: 'Producto', links: [['Panel admin', '/login'], ['Crear mi cuenta', '/registro']] },
            { h: 'Contacto', links: [['hola@portia.cl', 'mailto:hola@portia.cl'], ['Santiago, Chile', null]] },
          ].map(({ h, links }) => (
            <div key={h}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>{h}</div>
              {links.map(([label, href]) => href
                ? <a key={label} href={href} style={{ display: 'block', fontSize: 15, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: 12, transition: 'color .15s, transform .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.transform = 'none'; }}
                  >{label}</a>
                : <span key={label} style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>{label}</span>
              )}
            </div>
          ))}
        </div>
        <div className="pp" style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 40px 24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>© 2026 Portia · Hecho en Chile</span>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>Conecta · Gestiona · Transparenta</span>
        </div>
      </footer>
    </div>
  );
}

/* ── STEP ────────────────────────────────────────────────────────────────── */
function StepItem({ n, t, d, delay }) {
  const ref = useFadeUp(delay);
  return (
    <div ref={ref} className="pstep" style={{
      borderLeft: '1px solid rgba(255,255,255,0.12)',
      padding: '6px 32px 6px 28px',
    }}>
      <div className="grad-static" style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 16, fontVariantNumeric: 'tabular-nums' }}>{n}</div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>{t}</h3>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', margin: 0 }}>{d}</p>
    </div>
  );
}
