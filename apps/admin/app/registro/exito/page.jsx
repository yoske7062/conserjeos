import Link from 'next/link';

// El callback de Flow (no esta página) es quien crea el edificio + la
// cuenta admin — puede tardar unos segundos en llegar. Esta página solo
// confirma que el registro de tarjeta se hizo, no que la cuenta ya existe.
export default function RegistroExitoPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 36, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(26,122,66,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24, color: '#1A7A42' }}>✓</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
          Pago confirmado
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          Estamos creando tu edificio y tu cuenta de administrador. En un par de minutos te llega un correo para setear tu contraseña — revisa spam si no aparece.
        </p>
        <Link href="/login" style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
          Ir al login →
        </Link>
      </div>
    </div>
  );
}
