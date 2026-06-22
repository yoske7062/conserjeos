import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Visitas({ perfil, turno }) {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre_visitante: '', rut_visitante: '', destino: '', motivo: '' });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => { cargarVisitas(); }, []);

  async function cargarVisitas() {
    setLoading(true);
    const { data } = await supabase
      .from('visitas')
      .select('*')
      .eq('edificio_id', perfil.edificio_id)
      .order('entrada', { ascending: false })
      .limit(50);
    setVisitas(data ?? []);
    setLoading(false);
  }

  async function registrarEntrada(e) {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.from('visitas').insert({
      edificio_id: perfil.edificio_id,
      conserje_id: perfil.id,
      turno_id: turno?.id ?? null,
      ...form,
    });
    if (!error) { setMostrarForm(false); setForm({ nombre_visitante: '', rut_visitante: '', destino: '', motivo: '' }); cargarVisitas(); }
    setEnviando(false);
  }

  async function registrarSalida(id) {
    await supabase.from('visitas').update({ salida: new Date().toISOString(), activa: false }).eq('id', id);
    cargarVisitas();
  }

  const activas = visitas.filter(v => v.activa);
  const historial = visitas.filter(v => !v.activa);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Control de Visitas</h1>
          <p className="text-xs text-muted mt-0.5">{activas.length} visita{activas.length !== 1 ? 's' : ''} activa{activas.length !== 1 ? 's' : ''} en el edificio</p>
        </div>
        <button onClick={() => setMostrarForm(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar entrada
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-5 space-y-6">
        {/* Visitas activas */}
        {activas.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">En el edificio ahora</h2>
            <div className="space-y-2">
              {activas.map(v => (
                <div key={v.id} className="card flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/15 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{v.nombre_visitante}</p>
                    <p className="text-xs text-muted">
                      {v.rut_visitante && `${v.rut_visitante} · `}
                      Visita a <span className="text-slate-300">{v.destino}</span>
                      {v.motivo && ` · ${v.motivo}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted mb-2">
                      Entrada: {new Date(v.entrada).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <button
                      onClick={() => registrarSalida(v.id)}
                      className="text-xs bg-surface border border-border hover:border-success hover:text-success text-muted px-3 py-1.5 rounded-lg transition-all"
                    >
                      Registrar salida
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historial */}
        {historial.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Historial del día</h2>
            <div className="space-y-2">
              {historial.map(v => (
                <div key={v.id} className="card opacity-60 flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center shrink-0 border border-border">
                    <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-300">{v.nombre_visitante}</p>
                    <p className="text-xs text-muted">Visitó a {v.destino}</p>
                  </div>
                  <div className="text-right text-xs text-muted shrink-0">
                    <p>E: {new Date(v.entrada).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                    {v.salida && <p>S: {new Date(v.salida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && visitas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-4 border border-border">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">Sin visitas registradas hoy</p>
          </div>
        )}
      </div>

      {/* Modal nueva visita */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-white">Registrar entrada</h2>
              <button onClick={() => setMostrarForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={registrarEntrada} className="p-6 space-y-4">
              <div>
                <label className="label">Nombre del visitante</label>
                <input className="input" placeholder="Juan Pérez" required
                  value={form.nombre_visitante} onChange={e => setForm(f => ({ ...f, nombre_visitante: e.target.value }))} />
              </div>
              <div>
                <label className="label">RUT (opcional)</label>
                <input className="input" placeholder="12.345.678-9"
                  value={form.rut_visitante} onChange={e => setForm(f => ({ ...f, rut_visitante: e.target.value }))} />
              </div>
              <div>
                <label className="label">Visita a (Depto / Oficina)</label>
                <input className="input" placeholder="201, Oficina 3, etc." required
                  value={form.destino} onChange={e => setForm(f => ({ ...f, destino: e.target.value }))} />
              </div>
              <div>
                <label className="label">Motivo (opcional)</label>
                <input className="input" placeholder="Visita personal, delivery, técnico…"
                  value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setMostrarForm(false)} className="btn-ghost flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={enviando}>
                  {enviando ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Registrar entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
