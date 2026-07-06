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
      background: 'var(--bg-input)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 50, padding: '20px 12px',
    }}>
      {/* Header */}
      <div style={{ padding: '4px 10px', marginBottom: 28 }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--brand)', letterSpacing: '-0.01em' }}>Portia</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Panel de administración</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 10px 4px' }}>
          {edificio}
        </p>
        {NAV.map(({ href, icon, label }) => {
          const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <button key={href} onClick={() => router.push(href)} style={{
              display: 'flex', alignItems: 'center', gap: 12, minHeight: 44,
              padding: '0 12px', borderRadius: 8, width: '100%', textAlign: 'left',
              fontSize: 14, fontWeight: active ? 600 : 400,
              color: active ? 'var(--brand)' : 'var(--text-secondary)',
              background: active ? 'rgba(var(--brand-rgb),0.1)' : 'transparent',
              border: 'none', cursor: 'pointer', transition: 'all 120ms',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text)'; }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
            >
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20, color: active ? 'var(--brand)' : 'inherit' }}>{icon}</span>
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
            background: 'rgba(var(--brand-rgb),0.1)', border: '1px solid rgba(var(--brand-rgb),0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'var(--brand)',
          }}>{iniciales}</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administrador</p>
          </div>
        </div>
        <button onClick={signOut} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 44,
          padding: '0 12px', borderRadius: 8, background: 'transparent',
          border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, fontFamily: 'inherit',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>logout</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
