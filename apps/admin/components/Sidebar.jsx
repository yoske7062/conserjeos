'use client';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabase } from '../lib/supabase';

const NAV = [
  { href: '/dashboard',             icon: 'home',         label: 'Inicio'        },
  { href: '/dashboard/novedades',   icon: 'campaign',     label: 'Novedades'     },
  { href: '/dashboard/visitas',     icon: 'group',        label: 'Visitas'       },
  { href: '/dashboard/encomiendas', icon: 'inventory_2',  label: 'Encomiendas'   },
  { href: '/dashboard/tareas',      icon: 'checklist',    label: 'Tareas'        },
  { href: '/dashboard/conserjes',   icon: 'badge',        label: 'Conserjes'     },
  { href: '/dashboard/metricas',    icon: 'monitoring',   label: 'Métricas'      },
];

export default function Sidebar({ perfil }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const nombre    = perfil?.nombre || 'Admin';
  const edificio  = perfil?.edificios?.nombre || 'Edificio';
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  async function signOut() {
    await getSupabase().auth.signOut();
    router.push('/login');
  }

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, width: 240, height: '100vh',
      background: 'var(--bg-surface-high)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 50, padding: '20px 12px',
    }}>
      {/* Header — mismo mark cuadrado coral que la app real y la landing */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 10px', marginBottom: 24 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14, fontWeight: 800,
        }}>P</span>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>Portia</p>
          <p style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>Panel de administración</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 10px 6px' }}>
          {edificio}
        </p>
        {NAV.map(({ href, icon, label }) => {
          const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <button key={href} onClick={() => router.push(href)} style={{
              display: 'flex', alignItems: 'center', gap: 12, minHeight: 42,
              padding: '0 12px', borderRadius: 10, width: '100%', textAlign: 'left',
              fontSize: 14, fontWeight: active ? 600 : 500,
              color: active ? '#fff' : 'var(--text-secondary)',
              background: active ? 'var(--text)' : 'transparent',
              border: 'none', cursor: 'pointer', transition: 'all 120ms',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--text)'; }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
            >
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20, color: active ? '#fff' : 'inherit' }}>{icon}</span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'var(--bg-base)',
          }}>{iniciales}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administrador</p>
          </div>
        </div>
        <button onClick={signOut} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 42,
          padding: '0 12px', borderRadius: 10, background: 'transparent',
          border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, fontFamily: 'inherit',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
