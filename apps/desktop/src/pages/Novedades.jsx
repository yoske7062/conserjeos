import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TIPO_NOVEDAD } from '../lib/tokens';
import { enqueue, fileToBase64 } from '../lib/offlineQueue';
import FotoField from '../components/FotoField';

// Lo que un conserje anota de verdad, seguido, en el libro físico —
// frases completas y listas para tocar, sin tener que rellenar nada después.
const FRASES_RAPIDAS = [
  'Ronda realizada, todo en orden.',
  'Puertas y accesos revisados y cerrados.',
  'Ascensor fuera de servicio.',
  'Filtración de agua detectada.',
  'Vehículo desconocido estacionado en el edificio.',
  'Reclamo de ruidos molestos.',
];

function NovedadCard({ nov, perfil, onEditar }) {
  const t = TIPO_NOVEDAD[nov.tipo] || TIPO_NOVEDAD.informativo;
  const hora  = new Date(nov.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const fecha = new Date(nov.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
  const puedeEditar = nov.conserje_id === perfil.id;

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12,
      overflow: 'hidden', position: 'relative', transition: 'border-color 120ms',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: t.color }} />
      <div style={{ padding: '16px 20px 16px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 4,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              background: t.bg, color: t.color, border: `1px solid ${t.border}`,
            }}><span>{t.icon}</span>{t.label}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>schedule</span>
              {hora} · {fecha}
            </span>
            {nov.perfiles?.nombre && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>person</span>
                {nov.perfiles.nombre}
              </span>
            )}
          </div>
          <p style={{ fontSize: 16, color: 'var(--text-body)', lineHeight: 1.6 }}>{nov.descripcion}</p>
        </div>
        {nov.foto_url && (
          <img src={nov.foto_url} alt="foto"
            style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
        )}
        {puedeEditar && (
          <button onClick={() => onEditar(nov)} title="Editar" style={{
            flexShrink: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          ><span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>edit</span></button>
        )}
      </div>
    </div>
  );
}

function draftKey(edificioId) {
  return `portia:borrador-novedad:${edificioId}`;
}

// Lo urgente real ya tiene su propio botón rojo de Emergencia. Acá el conserje
// no tiene que pensar en categorías: por defecto es un registro normal, y solo
// marca esto si algo salió mal o se rompió algo — es secundario, no compite
// visualmente con escribir la nota.
function ToggleIncidente({ activo, onToggle }) {
  return (
    <button type="button" onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: 0,
      background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: activo ? 'none' : '1.5px solid var(--border-strong)',
        background: activo ? 'var(--warn-tx)' : 'transparent',
        color: '#fff', fontSize: 12, fontWeight: 700,
      }}>{activo ? '✓' : ''}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: activo ? 'var(--warn-tx)' : 'var(--text-secondary)' }}>
        Algo salió mal o se rompió algo
      </span>
    </button>
  );
}

export default function Novedades({ perfil, turno, filtroInicial }) {
  const [novedades, setNovedades]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [mostrarForm, setMostrarForm]   = useState(false);
  const [tipo, setTipo]                 = useState('informativo');
  const [descripcion, setDescripcion]   = useState('');
  const [enviando, setEnviando]         = useState(false);
  const [filtro, setFiltro]             = useState(filtroInicial || 'todos');
  const [fotoFile, setFotoFile]         = useState(null);
  const [errorMsg, setErrorMsg]         = useState('');
  const [borradorRestaurado, setBorradorRestaurado] = useState(false);

  // Búsqueda
  const [busqueda, setBusqueda]                     = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState(null);
  const [buscando, setBuscando]                     = useState(false);

  // Edición
  const [editTarget, setEditTarget]       = useState(null);
  const [editForm, setEditForm]           = useState({ tipo: 'informativo', descripcion: '' });
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  // Restaura un borrador si el conserje fue interrumpido a mitad de una novedad
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(perfil.edificio_id));
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.descripcion?.trim()) {
          setTipo(draft.tipo || 'informativo');
          setDescripcion(draft.descripcion);
          setBorradorRestaurado(true);
          setMostrarForm(true);
        }
      }
    } catch { /* borrador corrupto, se ignora */ }
  }, []);

  // Guarda el borrador en cada cambio mientras el modal está abierto
  useEffect(() => {
    if (!mostrarForm) return;
    if (!descripcion.trim()) { localStorage.removeItem(draftKey(perfil.edificio_id)); return; }
    localStorage.setItem(draftKey(perfil.edificio_id), JSON.stringify({ tipo, descripcion }));
  }, [tipo, descripcion, mostrarForm]);

  useEffect(() => {
    cargarNovedades();
    const channel = supabase.channel('novedades-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'novedades',
        filter: `edificio_id=eq.${perfil.edificio_id}` },
        async payload => {
          // CDC payload no incluye joins; fetchar el row completo para obtener perfiles.nombre
          const { data } = await supabase.from('novedades').select('*, perfiles(nombre)').eq('id', payload.new.id).single();
          if (data) setNovedades(prev => [data, ...prev]);
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [turno]);

  async function cargarNovedades() {
    setLoading(true);
    let q = supabase.from('novedades').select('*, perfiles(nombre)')
      .eq('edificio_id', perfil.edificio_id)
      .order('created_at', { ascending: false }).limit(100);
    if (turno) q = q.eq('turno_id', turno.id);
    const { data } = await q;
    setNovedades(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    const q = busqueda.replace(/[,()%]/g, '').trim();
    if (!q) { setResultadosBusqueda(null); return; }
    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase.from('novedades').select('*, perfiles(nombre)')
          .eq('edificio_id', perfil.edificio_id)
          .ilike('descripcion', `%${q}%`)
          .order('created_at', { ascending: false }).limit(50);
        setResultadosBusqueda(data ?? []);
      } catch {
        setResultadosBusqueda([]);
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [busqueda, perfil.edificio_id]);

  function abrirEdicion(nov) {
    setEditForm({ tipo: nov.tipo, descripcion: nov.descripcion });
    setEditTarget(nov);
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    if (!editForm.descripcion.trim()) return;
    if (!navigator.onLine) { setErrorMsg('Necesitas conexión a internet para editar un registro.'); return; }
    setGuardandoEdit(true);
    setErrorMsg('');
    const { id, ...valorAnterior } = editTarget;
    const { error } = await supabase.from('novedades').update({
      tipo: editForm.tipo, descripcion: editForm.descripcion.trim(),
      editado_por: perfil.id, editado_at: new Date().toISOString(), valor_anterior: valorAnterior,
    }).eq('id', editTarget.id);
    if (error) setErrorMsg('No se pudo guardar la edición. Intenta de nuevo.');
    else { setEditTarget(null); cargarNovedades(); }
    setGuardandoEdit(false);
  }

  async function enviarNovedad(e) {
    e.preventDefault();
    if (!descripcion.trim()) return;

    if (!navigator.onLine) {
      const fotoBase64 = fotoFile ? await fileToBase64(fotoFile) : null;
      enqueue({ table: 'novedades', op: 'insert', payload: {
        edificio_id: perfil.edificio_id, conserje_id: perfil.id,
        turno_id: turno?.id ?? null, tipo,
        descripcion: descripcion.trim(), foto_url: null,
        created_at: new Date().toISOString(),
      }, fotoBase64, fotoName: fotoFile?.name });
      localStorage.removeItem(draftKey(perfil.edificio_id));
      setDescripcion(''); setFotoFile(null); setTipo('informativo');
      setBorradorRestaurado(false); setMostrarForm(false);
      return;
    }

    setEnviando(true);
    setErrorMsg('');
    let foto_url = null;
    if (fotoFile) {
      const ext  = fotoFile.name.split('.').pop();
      const path = `novedades/${perfil.edificio_id}/${Date.now()}.${ext}`;
      const { data: up, error: upError } = await supabase.storage.from('fotos').upload(path, fotoFile);
      if (upError) { setErrorMsg('No se pudo subir la foto. Revisa tu conexión e intenta de nuevo.'); setEnviando(false); return; }
      if (up) { const { data: pub } = supabase.storage.from('fotos').getPublicUrl(path); foto_url = pub.publicUrl; }
    }
    const { error } = await supabase.from('novedades').insert({
      edificio_id: perfil.edificio_id, conserje_id: perfil.id,
      turno_id: turno?.id ?? null, tipo, descripcion: descripcion.trim(), foto_url,
    });
    if (error) {
      setErrorMsg('No se pudo guardar la novedad. Tu descripción no se perdió, intenta de nuevo.');
    } else {
      localStorage.removeItem(draftKey(perfil.edificio_id));
      setDescripcion(''); setFotoFile(null); setTipo('informativo'); setBorradorRestaurado(false);
      setMostrarForm(false); cargarNovedades();
    }
    setEnviando(false);
  }

  function cancelarForm() {
    localStorage.removeItem(draftKey(perfil.edificio_id));
    setDescripcion(''); setFotoFile(null); setTipo('informativo'); setBorradorRestaurado(false);
    setMostrarForm(false);
  }

  const counts         = novedades.reduce((acc, n) => { acc[n.tipo] = (acc[n.tipo] ?? 0) + 1; return acc; }, {});
  const filtradas      = filtro === 'todos' ? novedades : novedades.filter(n => n.tipo === filtro);
  const buscandoActivo = resultadosBusqueda !== null;
  const lista          = buscandoActivo ? resultadosBusqueda : filtradas;

  return (
    <div style={{ padding: '22px 24px 28px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, gap: 16 }}>
        <div>
          <div style={{ fontSize: 23, fontWeight: 800, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.5px' }}>Libro de Novedades</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Registra todo lo que pasa en tu turno — es tu respaldo si después hay un reclamo</p>
        </div>
        {turno && (
          <button onClick={() => setMostrarForm(true)} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, height: 48, padding: '0 20px',
            background: 'var(--brand)', border: 'none', borderRadius: 8,
            color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>+ Nueva novedad</button>
        )}
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--crit-bg)', borderLeft: '4px solid var(--crit-tx)',
          borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: 16,
        }}>
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--crit-tx)', flexShrink: 0 }}>error</span>
          <span style={{ fontSize: 12, color: 'var(--crit-tx)', fontWeight: 600 }}>{errorMsg}</span>
        </div>
      )}

      {/* Búsqueda */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--text-muted)' }}>search</span>
        <input
          style={{ width: '100%', height: 48, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px 0 40px', color: 'var(--text)', fontSize: 16, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms' }}
          placeholder="Buscar en el libro de novedades…"
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--brand)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Filter bar (oculta mientras se busca) */}
      {!buscandoActivo ? (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '12px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--bg-input)', border: '1px solid var(--bg-surface-high)', borderRadius: 8, padding: 3 }}>
            {[['todos','Todos'],['urgente','Urgentes'],['incidente','Incidentes'],['informativo','Informativos']].map(([id, label]) => (
              <button key={id} onClick={() => setFiltro(id)} style={{
                minHeight: 36, padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: filtro === id ? 600 : 400,
                background: filtro === id ? 'var(--brand)' : 'transparent',
                color: filtro === id ? 'var(--brand-text-on)' : 'var(--text-muted)',
                border: 'none', cursor: 'pointer', transition: 'all 100ms',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {counts.urgente > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: 'var(--crit-bg)', border: '1px solid var(--crit-border)', fontSize: 11, fontWeight: 600, color: 'var(--crit-tx)' }}>
                <span>◆</span>
                Urgentes: {counts.urgente}
              </span>
            )}
            {counts.incidente > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', fontSize: 11, fontWeight: 600, color: 'var(--warn-tx)' }}>
                <span>!</span>
                Incidentes: {counts.incidente}
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{novedades.length} novedades</span>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          {buscando ? 'Buscando…' : `${resultadosBusqueda.length} resultado${resultadosBusqueda.length !== 1 ? 's' : ''} para "${busqueda}"`}
        </p>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : lista.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 52, height: 52, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>📋</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              {buscandoActivo ? 'Sin resultados' : 'Sin novedades registradas'}
            </p>
            {!buscandoActivo && (
              <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
                {turno ? 'Registra la primera novedad de este turno' : 'Inicia tu turno en "Entrega de turno" para comenzar a registrar'}
              </p>
            )}
          </div>
        ) : (
          lista.map(n => <NovedadCard key={n.id} nov={n} perfil={perfil} onEditar={abrirEdicion} />)
        )}
      </div>

      {/* Modal: Nueva novedad */}
      {mostrarForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Nueva novedad</div>
              <button onClick={cancelarForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={enviarNovedad} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {borradorRestaurado && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--warn-tx)' }}>
                  <span>▲</span> Recuperamos lo que estabas escribiendo
                </div>
              )}
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                placeholder="¿Qué pasó? Escríbelo como lo anotarías en el libro…" required autoFocus
                style={{ width: '100%', height: 130, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px', color: 'var(--text)', fontSize: 16, lineHeight: 1.5, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms' }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {FRASES_RAPIDAS.map(frase => (
                  <button key={frase} type="button"
                    onClick={() => setDescripcion(prev => prev.trim() ? `${prev.trim()} ${frase}` : frase)}
                    style={{ padding: '6px 10px', borderRadius: 99, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >{frase}</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <ToggleIncidente activo={tipo === 'incidente'} onToggle={() => setTipo(t => t === 'incidente' ? 'informativo' : 'incidente')} />
                <FotoField value={fotoFile} onChange={setFotoFile} compact />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={cancelarForm} style={{ flex: 1, height: 44, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={enviando} style={{ flex: 1, height: 48, background: 'var(--brand)', border: 'none', borderRadius: 8, color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{enviando ? '...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar */}
      {editTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Editar novedad</div>
              <button onClick={() => setEditTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={guardarEdicion} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {editForm.tipo === 'urgente' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'var(--crit-bg)', border: '1px solid var(--crit-tx)' }}>
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 16, color: 'var(--crit-tx)' }}>{TIPO_NOVEDAD.urgente.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--crit-tx)' }}>Urgente — registrada desde el botón de Emergencia</span>
                </div>
              ) : (
                <ToggleIncidente activo={editForm.tipo === 'incidente'} onToggle={() => setEditForm(f => ({ ...f, tipo: f.tipo === 'incidente' ? 'informativo' : 'incidente' }))} />
              )}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Descripción</label>
                <textarea value={editForm.descripcion} onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))}
                  required autoFocus
                  style={{ width: '100%', height: 110, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 16, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setEditTarget(null)} style={{ flex: 1, height: 44, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={guardandoEdit} style={{ flex: 1, height: 48, background: 'var(--brand)', border: 'none', borderRadius: 8, color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{guardandoEdit ? '...' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
