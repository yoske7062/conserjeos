import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { TIPO_NOVEDAD } from '../lib/tokens';
import { enqueue } from '../lib/offlineQueue';

function NovedadCard({ nov }) {
  const t = TIPO_NOVEDAD[nov.tipo] || TIPO_NOVEDAD.informativo;
  const hora  = new Date(nov.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const fecha = new Date(nov.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });

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
      </div>
    </div>
  );
}

function draftKey(edificioId) {
  return `portia:borrador-novedad:${edificioId}`;
}

const EXPLICACION_TIPO = {
  urgente:     'Algo está pasando ahora y necesita atención inmediata (emergencia, accidente, situación de riesgo).',
  incidente:   'Algo salió mal o se rompió, pero ya pasó o está controlado (filtración, ascensor detenido, ruido molesto).',
  informativo: 'Para que quede registrado, sin que sea grave ni urgente (visita de mantención, aviso de un vecino).',
};

export default function Novedades({ perfil, turno, filtroInicial }) {
  const [novedades, setNovedades]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [mostrarForm, setMostrarForm]   = useState(false);
  const [tipo, setTipo]                 = useState('informativo');
  const [descripcion, setDescripcion]   = useState('');
  const [enviando, setEnviando]         = useState(false);
  const [filtro, setFiltro]             = useState(filtroInicial || 'todos');
  const fileRef = useRef();
  const [fotoFile, setFotoFile]         = useState(null);
  const [errorMsg, setErrorMsg]         = useState('');
  const [borradorRestaurado, setBorradorRestaurado] = useState(false);

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
        payload => setNovedades(prev => [payload.new, ...prev]))
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

  async function enviarNovedad(e) {
    e.preventDefault();
    if (!descripcion.trim()) return;

    if (!navigator.onLine) {
      if (fotoFile) {
        setErrorMsg('Sin conexión: registra sin foto. Puedes adjuntarla cuando vuelva la red.');
        return;
      }
      enqueue({ table: 'novedades', op: 'insert', payload: {
        edificio_id: perfil.edificio_id, conserje_id: perfil.id,
        turno_id: turno?.id ?? null, tipo,
        descripcion: descripcion.trim(), foto_url: null,
        created_at: new Date().toISOString(),
      }});
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

  const counts    = novedades.reduce((acc, n) => { acc[n.tipo] = (acc[n.tipo] ?? 0) + 1; return acc; }, {});
  const filtradas = filtro === 'todos' ? novedades : novedades.filter(n => n.tipo === filtro);

  return (
    <div style={{ padding: '22px 24px 28px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 23, fontWeight: 800, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.5px' }}>Libro de Novedades</div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Registra todo lo que pasa en tu turno — es tu respaldo si después hay un reclamo</p>
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

      {/* Filter bar */}
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

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 52, height: 52, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>📋</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Sin novedades registradas</p>
            <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
              {turno ? 'Registra la primera novedad de este turno' : 'Inicia tu turno en "Entrega de turno" para comenzar a registrar'}
            </p>
          </div>
        ) : (
          filtradas.map(n => <NovedadCard key={n.id} nov={n} />)
        )}
      </div>

      {/* FAB */}
      {turno && (
        <button onClick={() => setMostrarForm(true)} title="Nueva novedad" style={{
          position: 'fixed', bottom: 28, right: 28, width: 52, height: 52,
          background: 'var(--brand)', border: 'none', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 60, fontSize: 26, color: 'var(--brand-text-on)', fontWeight: 700,
          boxShadow: '0 4px 20px rgba(var(--brand-rgb),0.3)', transition: 'transform 120ms',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >+</button>
      )}

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
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Tipo</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {Object.entries(TIPO_NOVEDAD).map(([id, t]) => (
                    <button key={id} type="button" onClick={() => setTipo(id)} style={{
                      minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '9px 8px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: tipo === id ? t.bg : 'transparent',
                      color: tipo === id ? t.color : 'var(--text-muted)',
                      border: tipo === id ? `1px solid ${t.border}` : '1px solid var(--border)',
                      transition: 'all 100ms',
                    }}><span>{t.icon}</span>{t.label}</button>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.4 }}>{EXPLICACION_TIPO[tipo]}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Descripción</label>
                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="Describe la novedad con detalle…" required autoFocus
                  style={{ width: '100%', height: 110, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 16, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms' }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Foto (opcional)</label>
                <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={e => setFotoFile(e.target.files?.[0] ?? null)} />
                {fotoFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                    <span style={{ color: 'var(--brand)' }}>📎</span>
                    <span style={{ fontSize: 13, color: 'var(--text-body)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fotoFile.name}</span>
                    <button type="button" onClick={() => setFotoFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current.click()} style={{ width: '100%', padding: '10px', border: '1px dashed var(--border)', borderRadius: 8, background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 100ms' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >+ Adjuntar foto</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={cancelarForm} style={{ flex: 1, height: 44, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={enviando} style={{ flex: 1, height: 48, background: 'var(--brand)', border: 'none', borderRadius: 8, color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{enviando ? '...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
