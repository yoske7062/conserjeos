import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const TIPOS = [
  { id: 'informativo', label: 'Informativo', color: 'badge-informativo', dot: 'bg-info' },
  { id: 'incidente',   label: 'Incidente',   color: 'badge-incidente',   dot: 'bg-warning' },
  { id: 'urgente',     label: 'Urgente',      color: 'badge-urgente',     dot: 'bg-urgent' },
];

function TipoBadge({ tipo }) {
  const t = TIPOS.find(t => t.id === tipo);
  if (!t) return null;
  return (
    <span className={t.color}>
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
      {t.label}
    </span>
  );
}

function NovedadCard({ nov }) {
  const hora = new Date(nov.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const fecha = new Date(nov.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });

  return (
    <article className={`card border-l-4 ${
      nov.tipo === 'urgente'     ? 'border-l-urgent' :
      nov.tipo === 'incidente'   ? 'border-l-warning' :
                                   'border-l-info'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <TipoBadge tipo={nov.tipo} />
            <span className="text-xs text-muted">{hora} · {fecha}</span>
            {nov.perfiles?.nombre && (
              <span className="text-xs text-muted">· {nov.perfiles.nombre}</span>
            )}
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{nov.descripcion}</p>
        </div>
        {nov.foto_url && (
          <img
            src={nov.foto_url}
            alt="foto novedad"
            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border"
          />
        )}
      </div>
    </article>
  );
}

export default function Novedades({ perfil, turno, onTurnoChange }) {
  const [novedades, setNovedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState('informativo');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [cerrando, setCerrando] = useState(false);
  const [resumenModal, setResumenModal] = useState(null);
  const fileRef = useRef();
  const [fotoFile, setFotoFile] = useState(null);

  useEffect(() => {
    cargarNovedades();
    // Suscripción realtime
    const channel = supabase
      .channel('novedades-live')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'novedades',
        filter: `edificio_id=eq.${perfil.edificio_id}`,
      }, payload => {
        setNovedades(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [turno]);

  async function cargarNovedades() {
    setLoading(true);
    let q = supabase
      .from('novedades')
      .select('*, perfiles(nombre)')
      .eq('edificio_id', perfil.edificio_id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (turno) q = q.eq('turno_id', turno.id);

    const { data } = await q;
    setNovedades(data ?? []);
    setLoading(false);
  }

  async function iniciarTurno() {
    const { data, error } = await supabase
      .from('turnos')
      .insert({ edificio_id: perfil.edificio_id, conserje_id: perfil.id })
      .select()
      .single();
    if (!error) onTurnoChange(data);
  }

  async function cerrarTurno() {
    setCerrando(true);
    const resumen = generarResumen();
    const { error } = await supabase
      .from('turnos')
      .update({ fin: new Date().toISOString(), activo: false, resumen })
      .eq('id', turno.id);
    if (!error) {
      setResumenModal(resumen);
      onTurnoChange(null);
    }
    setCerrando(false);
  }

  function generarResumen() {
    const counts = novedades.reduce((acc, n) => {
      acc[n.tipo] = (acc[n.tipo] ?? 0) + 1;
      return acc;
    }, {});
    const inicio = turno ? new Date(turno.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '';
    return [
      `Turno iniciado: ${inicio}`,
      `Total novedades: ${novedades.length}`,
      counts.urgente    ? `• Urgentes: ${counts.urgente}` : null,
      counts.incidente  ? `• Incidentes: ${counts.incidente}` : null,
      counts.informativo ? `• Informativos: ${counts.informativo}` : null,
    ].filter(Boolean).join('\n');
  }

  async function enviarNovedad(e) {
    e.preventDefault();
    if (!descripcion.trim()) return;
    setEnviando(true);

    let foto_url = null;
    if (fotoFile) {
      const ext = fotoFile.name.split('.').pop();
      const path = `novedades/${perfil.edificio_id}/${Date.now()}.${ext}`;
      const { data: up } = await supabase.storage.from('fotos').upload(path, fotoFile);
      if (up) {
        const { data: pub } = supabase.storage.from('fotos').getPublicUrl(path);
        foto_url = pub.publicUrl;
      }
    }

    const { error } = await supabase.from('novedades').insert({
      edificio_id: perfil.edificio_id,
      conserje_id: perfil.id,
      turno_id: turno?.id ?? null,
      tipo,
      descripcion: descripcion.trim(),
      foto_url,
    });

    if (!error) {
      setDescripcion('');
      setFotoFile(null);
      setTipo('informativo');
      setMostrarForm(false);
      cargarNovedades();
      if (tipo === 'urgente' && window.electron) {
        window.electron.notify('🚨 Novedad urgente registrada', descripcion.trim().slice(0, 60));
      }
    }
    setEnviando(false);
  }

  const novedadesFiltradas = filtro === 'todos'
    ? novedades
    : novedades.filter(n => n.tipo === filtro);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Libro de Novedades</h1>
          <p className="text-xs text-muted mt-0.5">
            {turno
              ? `Turno activo desde ${new Date(turno.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
              : 'Inicia un turno para registrar novedades'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!turno ? (
            <button onClick={iniciarTurno} className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Iniciar turno
            </button>
          ) : (
            <>
              <button
                onClick={() => setMostrarForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva novedad
              </button>
              <button
                onClick={cerrarTurno}
                disabled={cerrando}
                className="btn-ghost flex items-center gap-2"
              >
                {cerrando ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Cerrar turno
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 px-8 py-3 border-b border-border shrink-0">
        {['todos', 'urgente', 'incidente', 'informativo'].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg capitalize transition-all ${
              filtro === f
                ? 'bg-accent text-white'
                : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {f === 'todos' ? `Todos (${novedades.length})` : (
              `${f} (${novedades.filter(n => n.tipo === f).length})`
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-8 py-5 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : novedadesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-4 border border-border">
              <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">Sin novedades registradas</p>
            <p className="text-muted text-sm mt-1">
              {turno ? 'Registra la primera novedad del turno' : 'Inicia un turno para comenzar'}
            </p>
          </div>
        ) : (
          novedadesFiltradas.map(n => <NovedadCard key={n.id} nov={n} />)
        )}
      </div>

      {/* Modal: nueva novedad */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-white">Nueva novedad</h2>
              <button
                onClick={() => setMostrarForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted hover:text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={enviarNovedad} className="p-6 space-y-5">
              {/* Tipo */}
              <div>
                <label className="label">Tipo de novedad</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIPOS.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTipo(t.id)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                        tipo === t.id
                          ? t.id === 'urgente'     ? 'bg-urgent/20 border-urgent text-urgent'
                          : t.id === 'incidente'   ? 'bg-amber-500/20 border-warning text-warning'
                          :                          'bg-blue-500/20 border-info text-info'
                          : 'border-border text-muted hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="label">Descripción</label>
                <textarea
                  className="input resize-none h-28"
                  placeholder="Describe la novedad con detalle…"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Foto */}
              <div>
                <label className="label">Foto (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  className="hidden"
                  onChange={e => setFotoFile(e.target.files?.[0] ?? null)}
                />
                {fotoFile ? (
                  <div className="flex items-center gap-3 bg-base rounded-xl px-4 py-3 border border-border">
                    <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-slate-300 flex-1 truncate">{fotoFile.name}</span>
                    <button type="button" onClick={() => setFotoFile(null)} className="text-muted hover:text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    className="w-full border border-dashed border-border rounded-xl py-3 text-sm text-muted hover:text-white hover:border-accent transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Adjuntar foto
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setMostrarForm(false)} className="btn-ghost flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={enviando}>
                  {enviando ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: resumen de turno */}
      {resumenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="px-6 pt-6 pb-4 border-b border-border">
              <div className="w-12 h-12 bg-green-500/15 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Turno cerrado</h2>
              <p className="text-sm text-muted mt-0.5">Resumen del turno completado</p>
            </div>
            <div className="p-6">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed bg-base rounded-xl p-4 border border-border">
                {resumenModal}
              </pre>
              <button
                onClick={() => setResumenModal(null)}
                className="btn-primary w-full mt-4"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
