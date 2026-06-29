import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#FAFAF8', fontFamily: "'DM Sans', system-ui, sans-serif",
      gap: 24,
    }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: '#1B2A4A', lineHeight: 1 }}>404</div>
      <div style={{ fontSize: 18, color: '#6A6762', textAlign: 'center' }}>
        Página no encontrada
      </div>
      <Link
        href="/dashboard"
        style={{
          background: '#1B2A4A', color: '#fff',
          padding: '10px 24px', borderRadius: 980,
          textDecoration: 'none', fontSize: 14, fontWeight: 600,
        }}
      >
        Ir al panel
      </Link>
    </div>
  );
}
