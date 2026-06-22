import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function Encomiendas({ perfil, turno }) {
  const [encomiendas, setEncomiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ remitente: '', destinatario: '', depto: '' });
  const [fotoFile, setFotoFile] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const fileRef = useRef();

  useEffect(() => { cargarEncomiendas(); }, []);

  async function cargarEncomiendas() {
    setLoading(true);
    const { data } = await supabase
      .from('encomiendas')
      .select('*')
      .eq('edificio_id', perfil.edificio_id)
      .order('recibida_at', { ascending: false })
      .limit(50);
    setEncomiendas(data ?? []);
    setLoading(false);
  }

  async function registrarEncomienda(e) {
    e.preventDefault();
    setEnviando(true);
    let foto_url = null;
    if (fotoFile) {
      const ext = fotoFile.name.split('.').pop();
      const path = `encomiendas/${perfil.edificio_id}/${Date.now()}.${ext}`;
      const { data: up } = await supabase.storage.from('fotos').upload(path, fotoFile);
      if (up) {
        const { data: pub } = supabase.storage.from('fotos').getPublicUrl(path);
        foto_url = pub.publicUrl;
      }
    }
    const { error } = await supabase.from('encomiendas').insert({
      edificio_id: perfil.edificio_id,
      conserje_id: perfil.id,
      turno_id: turno?.id ?? null,
      foto_url,
      ...form,
    });
    if (!error) {
      setMostrarForm(false);
      setForm({ remitente: '', destinatario: '', depto: '' });
      setFotoFile(null);
      cargarEncomiendas();
    }
    setEnviando(false);
  }

  async function marcarEntregada(id) {
    await supabase.from('encomiendas').update({ entregada: true, entregada_at: new Date().toISOString() }).eq('id', id);
    cargarEncomiendas();
  }

  const pendientes = encomiendas.filter(e => !e.entregada);
  const entregadas = encomiendas.filter(e => e.entregada);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Encomiendas</h1>
          <p className="text-xs text-muted mt-0.5">{pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''} de entrega</p>
        </div>
        <button onClick={() => setMostrarForm(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Registrar llegada
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-5 space-y-6">
        {pendientes.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Pendientes de entrega</h2>
            <div className="space-y-2">
              {pendientes.map(enc => (
                <div key={enc.id} className="card flex items-center gap-4">
                  {enc.foto_url ? (
                    <img src={enc.foto_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border" />
                  ) : (
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{enc.destinatario}</p>
                    <p className="text-xs text-muted">
                      Depto <span className="text-slate-300">{enc.depto}</span>
                      {enc.remitente && ` · De: ${enc.remitente}`}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Recibida {new Date(enc.recibida_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => marcarEntregada(enc.id)}
                    className="shrink-0 text-xs bg-surface border border-border hover:border-success hover:text-success text-muted px-3 py-1.5 rounded-lg transition-all"
                  >
                    Marcar entregada
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {entregadas.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Entregadas hoy</h2>
            <div className="space-y-2">
              {entregadas.slice(0, 10).map(enc => (
                <div key={enc.id} className="card opacity-60 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">{enc.destinatario} — Depto {enc.depto}</p>
                    <p className="text-xs text-muted">
                      Entregada {new Date(enc.entregada_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && encomiendas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-4 border border-border">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">Sin encomiendas registradas</p>
          </div>
        )}
      </div>

      {mostrarForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-white">Registrar encomienda</h2>
              <button onClick={() => setMostrarForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={registrarEncomienda} className="p-6 space-y-4">
              <div>
                <label className="label">Destinatario</label>
                <input className="input" placeholder="Nombre del residente" required
                  value={form.destinatario} onChange={e => setForm(f => ({ ...f, destinatario: e.target.value }))} />
              </div>
              <div>
                <label className="label">Depto / Oficina</label>
                <input className="input" placeholder="201" required
                  value={form.depto} onChange={e => setForm(f => ({ ...f, depto: e.target.value }))} />
              </div>
              <div>
                <label className="label">Remitente (opcional)</label>
                <input className="input" placeholder="Falabella, Mercado Libre, etc."
                  value={form.remitente} onChange={e => setForm(f => ({ ...f, remitente: e.target.value }))} />
              </div>
              <div>
                <label className="label">Foto (opcional)</label>
                <input type="file" accept="image/*" ref={fileRef} className="hidden"
                  onChange={e => setFotoFile(e.target.files?.[0] ?? null)} />
                {fotoFile ? (
                  <div className="flex items-center gap-3 bg-base rounded-xl px-4 py-3 border border-border">
                    <span className="text-sm text-slate-300 flex-1 truncate">{fotoFile.name}</span>
                    <button type="button" onClick={() => setFotoFile(null)} className="text-muted hover:text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current.click()}
                    className="w-full border border-dashed border-border rounded-xl py-3 text-sm text-muted hover:text-white hover:border-accent transition-all flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Adjuntar foto
                  </button>
                )}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setMostrarForm(false)} className="btn-ghost flex-1">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={enviando}>
                  {enviando ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
