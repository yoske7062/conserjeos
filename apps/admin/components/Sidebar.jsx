'use client';
import { useState } from 'react';
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

// Mismo rail circular que apps/desktop/src/components/Sidebar.jsx —
// solo íconos, tooltip fijo al hover, activo = círculo negro sólido.
export default function Sidebar({ perfil }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const nombre    = perfil?.nombre || 'Admin';
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const [tip, setTip] = useState(null); // { label, top }

  function showTip(e, label) {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ label, top: r.top + r.height / 2 });
  }
  function hideTip() { setTip(null); }

  async function signOut() {
    await getSupabase().auth.signOut();
    router.push('/login');
  }

  return (
    <>
      <aside style={{
        width: 84, height: '100vh', flexShrink: 0,
        background: 'var(--bg-surface-high)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'fixed', left: 0, top: 0, zIndex: 50, padding: '16px 0',
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '14px 0 20px',
          boxShadow: '0 4px 14px -4px rgba(var(--brand-rgb),0.45)',
        }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--brand)', color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>P</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'center', width: '100%' }}>
          {NAV.map(({ href, icon, label }) => {
            const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
            return (
              <button key={href} onClick={() => router.push(href)}
                onMouseEnter={e => showTip(e, label)} onMouseLeave={hideTip}
                title={label}
                style={{
                  width: 44, height: 44, flexShrink: 0, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? 'var(--text)' : 'transparent',
                  color: active ? 'var(--bg-base)' : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer', transition: 'background .16s, color .16s, transform .12s',
                }}
              >
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20 }}>{icon}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        <div
          onMouseEnter={e => showTip(e, nombre)} onMouseLeave={hideTip}
          style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0, marginBottom: 10,
            background: 'var(--text)', color: 'var(--bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
          }}>{iniciales}</div>

        <button onClick={signOut}
          onMouseEnter={e => showTip(e, 'Cerrar sesión')} onMouseLeave={hideTip}
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', color: 'var(--text-muted)',
            border: 'none', cursor: 'pointer',
          }}
        >
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 19 }}>logout</span>
        </button>
      </aside>

      {tip && (
        <div style={{
          position: 'fixed', left: 96, top: tip.top, transform: 'translateY(-50%)',
          background: 'var(--bg-surface)', color: 'var(--text)', border: '1px solid var(--border)',
          fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap',
          padding: '6px 12px', borderRadius: 9, pointerEvents: 'none', zIndex: 99997,
          boxShadow: 'var(--shadow)',
        }}>
          {tip.label}
        </div>
      )}
    </>
  );
}
