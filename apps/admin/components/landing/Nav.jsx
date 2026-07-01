'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const LINKS = [
  { href: '#producto', label: 'Producto' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#precios', label: 'Precios' },
  { href: '#faq', label: 'Preguntas' },
];

export default function Nav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function go(href) {
    setOpen(false);
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      router.push(href);
    }
  }

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(11,11,11,0.78)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px) saturate(140%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px) saturate(140%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'background 220ms ease, border-color 220ms ease',
      }}
    >
      <div style={{
        maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="#top" onClick={e => { e.preventDefault(); go('#top'); }} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <img src="/logo.png" alt="Portia" style={{ width: 30, height: 30, borderRadius: 8 }} />
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>portia</span>
        </a>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-desktop">
          {LINKS.map(l => (
            <button key={l.href} onClick={() => go(l.href)} style={navLink}>
              {l.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="nav-desktop">
          <button onClick={() => go('/login')} style={ghostBtn}>Iniciar sesión</button>
          <button onClick={() => go('#cta')} style={primaryBtn}>Solicitar demo</button>
        </div>

        <button
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen(o => !o)}
          className="nav-toggle"
          style={{
            display: 'none', width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer',
          }}
        >
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: 'var(--text)' }}>
            {open ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {open && (
        <div className="nav-mobile-panel" style={{
          borderTop: '1px solid var(--border)', background: 'rgba(11,11,11,0.97)',
          padding: '14px 24px 22px', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {LINKS.map(l => (
            <button key={l.href} onClick={() => go(l.href)} style={{ ...navLink, textAlign: 'left', padding: '12px 10px' }}>
              {l.label}
            </button>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            <button onClick={() => go('/login')} style={{ ...ghostBtn, width: '100%', justifyContent: 'center' }}>Iniciar sesión</button>
            <button onClick={() => go('#cta')} style={{ ...primaryBtn, width: '100%', justifyContent: 'center' }}>Solicitar demo</button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .nav-desktop { display: none !important; }
          .nav-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

const navLink = {
  height: 40, padding: '0 14px', background: 'transparent', border: 'none', borderRadius: 8,
  color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
  transition: 'color 150ms ease',
};

const ghostBtn = {
  height: 40, padding: '0 16px', background: 'transparent', border: '1px solid var(--border)',
  borderRadius: 9, color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', transition: 'border-color 150ms ease, background 150ms ease',
};

const primaryBtn = {
  height: 40, padding: '0 18px', background: 'var(--green)', border: 'none',
  borderRadius: 9, color: 'var(--green-text-on)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', boxShadow: '0 0 0 1px rgba(var(--green-rgb),0.3), 0 8px 20px -8px rgba(var(--green-rgb),0.5)',
  transition: 'transform 150ms ease, box-shadow 150ms ease',
};
