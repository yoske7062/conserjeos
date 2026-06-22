import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    setLoading(false);
  }

  return (
    <div className="h-screen flex bg-base">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-surface border-r border-border p-10">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ConserjeOS</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3 leading-snug">
            Control total de tu conserjería
          </h2>
          <p className="text-muted text-base leading-relaxed">
            Registra novedades, visitas y encomiendas en tiempo real. Sin papel, sin pérdida de información.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: '📋', text: 'Libro de novedades digital' },
            { icon: '👤', text: 'Control de visitas con trazabilidad' },
            { icon: '📦', text: 'Gestión de encomiendas' },
            { icon: '📊', text: 'Dashboard para el administrador' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-slate-400">
              <span className="text-xl">{icon}</span>
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">ConserjeOS</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Bienvenido</h1>
          <p className="text-muted text-sm mb-8">Ingresa tus credenciales para comenzar el turno</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="conserje@edificio.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-urgent text-sm rounded-xl px-4 py-3">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando…
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-8">
            ¿Problemas para ingresar? Contacta a tu administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
