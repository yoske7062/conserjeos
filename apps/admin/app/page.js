import Link from 'next/link';

export const metadata = {
  title: 'Portia — Tu edificio. Todo en orden.',
  description: 'Sistema operativo de conserjería para edificios residenciales. Digitaliza novedades, visitas y encomiendas en tiempo real.',
};

const FEATURES = [
  { icon: 'campaign',    title: 'Libro de novedades',    desc: 'Registra urgentes, incidentes e informativos con foto. El historial nunca se pierde.' },
  { icon: 'group',       title: 'Control de visitas',     desc: 'Entrada y salida con trazabilidad completa. Sabe quién estuvo en tu edificio y cuándo.' },
  { icon: 'inventory_2', title: 'Gestión de encomiendas', desc: 'Registra cada paquete que llega. Notifica al residente y marca entrega con firma.' },
  { icon: 'checklist',   title: 'Tareas asignadas',       desc: 'El administrador asigna tareas al conserje. Nada queda en el olvido.' },
  { icon: 'schedule',    title: 'Entrega de turno',       desc: 'Cierra el turno con un resumen automático y pendientes para el próximo conserje.' },
  { icon: 'analytics',   title: 'Panel en tiempo real',   desc: 'El administrador ve todo en vivo desde cualquier dispositivo, sin instalar nada.' },
];

const STEPS = [
  { n: '01', title: 'Descarga la app',      desc: 'El conserje instala Portia en el PC de la portería. Funciona en Mac y Windows.' },
  { n: '02', title: 'Ingresa al panel web', desc: 'El administrador entra desde el browser — sin instalación. Invita a sus conserjes por email.' },
  { n: '03', title: 'Trabajan en tiempo real', desc: 'Todo lo que registra el conserje aparece al instante en el panel del administrador.' },
];

export default function LandingPage() {
  return (
    <div style={{ background: '#0B0B0B', color: '#F5F5F5', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        background: 'rgba(11,11,11,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1E1E1E',
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#6366F1', letterSpacing: '-0.02em' }}>Portia</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="https://github.com/yoske7062/conserjeos/releases" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 14, color: '#A8A8A8', textDecoration: 'none', padding: '8px 16px' }}>
            Descargar app
          </a>
          <Link href="/login" style={{
            fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none',
            padding: '9px 20px', background: '#6366F1', borderRadius: 8,
          }}>
            Panel de administración
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '96px 48px 80px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24,
          padding: '6px 14px', borderRadius: 20, border: '1px solid #1E1E1E',
          background: 'rgba(99,102,241,0.08)', fontSize: 12, fontWeight: 600,
          color: '#818CF8', letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>verified</span>
          Sistema de conserjería para Chile
        </div>

        <h1 style={{
          fontSize: 56, fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-0.03em', marginBottom: 20,
          background: 'linear-gradient(135deg, #F5F5F5 40%, #6366F1)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Tu edificio.<br />Todo en orden.
        </h1>

        <p style={{ fontSize: 18, color: '#A8A8A8', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 40px' }}>
          Portia digitaliza la conserjería de edificios residenciales.
          Reemplaza el cuaderno físico por una app moderna que conecta
          al conserje con el administrador en tiempo real.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://github.com/yoske7062/conserjeos/releases" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', background: '#6366F1', borderRadius: 10,
            color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none',
          }}>
            <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>download</span>
            Descargar para Mac / Windows
          </a>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', background: 'transparent', borderRadius: 10,
            border: '1px solid #2E2E2E', color: '#A8A8A8', fontWeight: 600,
            fontSize: 15, textDecoration: 'none',
          }}>
            Panel de administrador
            <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16 }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* App preview strip */}
      <div style={{
        maxWidth: 900, margin: '0 auto 96px', padding: '0 48px',
        background: 'linear-gradient(135deg, #111, #161630)',
        border: '1px solid #1E1E1E', borderRadius: 16,
        display: 'flex', gap: 0, overflow: 'hidden',
      }}>
        {[
          { icon: 'campaign', label: 'Novedades', color: '#6366F1' },
          { icon: 'group', label: 'Visitas', color: '#6366F1' },
          { icon: 'inventory_2', label: 'Encomiendas', color: '#6366F1' },
          { icon: 'checklist', label: 'Tareas', color: '#6366F1' },
          { icon: 'schedule', label: 'Turno', color: '#6366F1' },
        ].map(({ icon, label, color }, i) => (
          <div key={label} style={{
            flex: 1, padding: '28px 20px', textAlign: 'center',
            borderRight: i < 4 ? '1px solid #1E1E1E' : 'none',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, margin: '0 auto 10px',
              background: 'rgba(99,102,241,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color }}>{icon}</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#636363' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 96px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Todo lo que necesita tu portería
        </h2>
        <p style={{ textAlign: 'center', color: '#636363', fontSize: 16, marginBottom: 48 }}>
          Diseñado para conserjes reales, no para ingenieros.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: '#111', border: '1px solid #1E1E1E', borderRadius: 12,
              padding: '24px', transition: 'border-color 200ms',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 9, marginBottom: 14,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20, color: '#818CF8' }}>{icon}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#F5F5F5' }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#636363', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#0D0D0D', borderTop: '1px solid #1E1E1E', borderBottom: '1px solid #1E1E1E' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 48px' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em', marginBottom: 48 }}>
            Listo en 10 minutos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', margin: '0 auto 16px',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, color: '#818CF8', letterSpacing: '-0.02em',
                }}>{n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#636363', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '96px 48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          ¿Listo para digitalizar tu edificio?
        </h2>
        <p style={{ fontSize: 16, color: '#A8A8A8', marginBottom: 32 }}>
          Empieza hoy. Sin contratos, sin configuración compleja.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://github.com/yoske7062/conserjeos/releases" target="_blank" rel="noopener noreferrer" style={{
            padding: '14px 32px', background: '#6366F1', borderRadius: 10,
            color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none',
          }}>
            Descargar Portia gratis
          </a>
          <Link href="/login" style={{
            padding: '14px 32px', background: 'transparent', borderRadius: 10,
            border: '1px solid #2E2E2E', color: '#A8A8A8', fontWeight: 600,
            fontSize: 15, textDecoration: 'none',
          }}>
            Soy administrador
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1E1E1E', padding: '24px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#6366F1' }}>Portia</span>
        <span style={{ fontSize: 12, color: '#363636' }}>© 2026 Portia. Hecho en Chile.</span>
        <a href="mailto:portia@portia.cl" style={{ fontSize: 12, color: '#636363', textDecoration: 'none' }}>contacto</a>
      </footer>
    </div>
  );
}
