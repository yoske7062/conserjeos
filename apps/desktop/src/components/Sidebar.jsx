import { supabase } from '../lib/supabase';

const NAV = [
  {
    id: 'novedades',
    label: 'Novedades',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    id: 'visitas',
    label: 'Visitas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
      </svg>
    ),
  },
  {
    id: 'encomiendas',
    label: 'Encomiendas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
      </svg>
    ),
  },
];

export default function Sidebar({ perfil, modulo, setModulo, turno }) {
  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  const edificio = perfil?.edificios?.nombre ?? 'Edificio';
  const hora = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  return (
    <aside className="w-60 shrink-0 h-screen bg-surface border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">ConserjeOS</p>
            <p className="text-xs text-muted mt-0.5 truncate max-w-[130px]">{edificio}</p>
          </div>
        </div>

        {/* Estado del turno */}
        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
          turno ? 'bg-green-500/10 text-success' : 'bg-slate-500/10 text-muted'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${turno ? 'bg-success animate-pulse' : 'bg-muted'}`} />
          {turno ? 'Turno activo' : 'Sin turno activo'}
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setModulo(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              modulo === item.id
                ? 'bg-accent text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer — usuario */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <div className="px-3 py-2 rounded-xl">
          <p className="text-xs font-semibold text-white truncate">{perfil?.nombre}</p>
          <p className="text-xs text-muted capitalize">{perfil?.rol}</p>
        </div>
        <button
          onClick={cerrarSesion}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
