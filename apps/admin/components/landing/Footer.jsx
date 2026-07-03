'use client';
import { useRouter } from 'next/navigation';

const COLS = [
  {
    title: 'Producto',
    links: [
      { label: 'Novedades', href: '#producto' },
      { label: 'Visitas', href: '#producto' },
      { label: 'Encomiendas', href: '#producto' },
      { label: 'Precios', href: '#precios' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Cómo funciona', href: '#como-funciona' },
      { label: 'Preguntas frecuentes', href: '#faq' },
      { label: 'Contacto', href: 'mailto:hola@portia.cl' },
    ],
  },
];

export default function Footer() {
  const router = useRouter();

  function go(href) {
    if (href.startsWith('#')) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    else if (href.startsWith('mailto:')) window.location.href = href;
    else router.push(href);
  }

  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '56px 24px 32px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 40, marginBottom: 44 }} className="footer-grid">
          <div>
            <a href="#top" onClick={e => { e.preventDefault(); go('#top'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 14, cursor: 'pointer' }}>
              <img src="/logo.png" alt="Portia" style={{ width: 28, height: 28, borderRadius: 7 }} />
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>portia</span>
            </a>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 280 }}>
              Tu edificio. Todo en orden. El sistema que reemplaza el cuaderno de novedades de tu conserjería.
            </p>
          </div>

          {COLS.map(col => (
            <div key={col.title}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
                {col.title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {col.links.map(l => (
                  <button key={l.label} onClick={() => go(l.href)} style={{
                    background: 'transparent', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer',
                    fontSize: 14, color: 'var(--text-secondary)',
                  }}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          paddingTop: 24, borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>© 2026 Portia. Hecho en Chile.</p>
          <button onClick={() => go('/login')} style={{
            background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px',
            fontSize: 12.5, color: 'var(--text-secondary)', cursor: 'pointer',
          }}>
            Iniciar sesión
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid > div:first-child { grid-column: 1 / -1; }
        }
      `}</style>
    </footer>
  );
}
