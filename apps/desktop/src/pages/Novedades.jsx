import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const TIPOS = {
  urgente:     { label: 'Urgente',     color: '#FF4444', bg: '#FF4444', textColor: '#fff' },
  incidente:   { label: 'Incidente',   color: '#F59E0B', bg: '#F59E0B', textColor: '#000' },
  informativo: { label: 'Informativo', color: '#A8A8A8', bg: '#2A2A2A', textColor: '#A8A8A8' },
};

function NovedadCard({ nov }) {
  const t = TIPOS[nov.tipo] || TIPOS.informativo;
  const hora  = new Date(nov.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const fecha = new Date(nov.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });

  return (
    <div style={{
      background: '#161616', border: '1px solid #2E2E2E', borderRadius: 12,
      overflow: 'hidden', position: 'relative', transition: 'border-color 120ms',
    }}
    className="card-hover"
    onMouseEnter={e => e.currentTarget.style.borderColor = '#3E3E3E'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#2E2E2E'}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: t.color }} />
      <div style={{ padding: '16px 20px 16px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{
              padding: '2px 8px', borderRadius: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              background: t.bg, color: t.textColor,
            }}>{t.label}</span>
            <span style={{ fontSize: 12, color: '#636363', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>schedule</span>
              {hora} · {fecha}
            </span>
            {nov.perfiles?.nombre && (
              <span style={{ fontSize: 12, color: '#636363', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>person</span>
                {nov.perfiles.nombre}
              </span>
            )}
          </div>
          <p style={{ fontSize: 15, color: '#D0D0D0', lineHeight: 1.6 }}>{nov.descripcion}</p>
        </div>
        {nov.foto_url && (
          <img src={nov.foto_url} alt="foto"
            style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #2E2E2E' }} />
        )}
      </div>
    </div>
  );
}

export default function Novedades({ perfil, turno, onTurnoChange }) {
  const [novedades, setNovedades]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [mostrarForm, setMostrarForm]   = useState(false);
  const [tipo, setTipo]                 = useState('informativo');
  const [descripcion, setDescripcion]   = useState('');
  const [enviando, setEnviando]         = useState(false);
  const [filtro, setFiltro]             = useState('todos');
  const [cerrando, setCerrando]         = useState(false);
  const [resumenModal, setResumenModal] = useState(null);
  const fileRef = useRef();
  const [fotoFile, setFotoFile]         = useState(null);

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

  async function iniciarTurno() {
    const { data, error } = await supabase.from('turnos')
      .insert({ edificio_id: perfil.edificio_id, conserje_id: perfil.id })
      .select().single();
    if (!error) onTurnoChange(data);
  }

  async function cerrarTurno() {
    setCerrando(true);
    const counts = novedades.reduce((acc, n) => { acc[n.tipo] = (acc[n.tipo] ?? 0) + 1; return acc; }, {});
    const inicio = new Date(turno.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const fin    = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const resumen = [
      `Turno: ${inicio} → ${fin}`,
      `Total: ${novedades.length} novedades`,
      counts.urgente     ? `• Urgentes: ${counts.urgente}`     : null,
      counts.incidente   ? `• Incidentes: ${counts.incidente}` : null,
      counts.informativo ? `• Informativos: ${counts.informativo}` : null,
    ].filter(Boolean).join('\n');
    const { error } = await supabase.from('turnos')
      .update({ fin: new Date().toISOString(), activo: false, resumen }).eq('id', turno.id);
    if (!error) { setResumenModal(resumen); onTurnoChange(null); }
    setCerrando(false);
  }

  async function enviarNovedad(e) {
    e.preventDefault();
    if (!descripcion.trim()) return;
    setEnviando(true);
    let foto_url = null;
    if (fotoFile) {
      const ext  = fotoFile.name.split('.').pop();
      const path = `novedades/${perfil.edificio_id}/${Date.now()}.${ext}`;
      const { data: up } = await supabase.storage.from('fotos').upload(path, fotoFile);
      if (up) { const { data: pub } = supabase.storage.from('fotos').getPublicUrl(path); foto_url = pub.publicUrl; }
    }
    const { error } = await supabase.from('novedades').insert({
      edificio_id: perfil.edificio_id, conserje_id: perfil.id,
      turno_id: turno?.id ?? null, tipo, descripcion: descripcion.trim(), foto_url,
    });
    if (!error) {
      setDescripcion(''); setFotoFile(null); setTipo('informativo');
      setMostrarForm(false); cargarNovedades();
    }
    setEnviando(false);
  }

  const counts    = novedades.reduce((acc, n) => { acc[n.tipo] = (acc[n.tipo] ?? 0) + 1; return acc; }, {});
  const filtradas = filtro === 'todos' ? novedades : novedades.filter(n => n.tipo === filtro);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F5F5F5', marginBottom: 4 }}>Libro de Novedades</h2>
          <p style={{ fontSize: 13, color: '#636363' }}>Historial completo de novedades del edificio</p>
        </div>
        {turno ? (
          <button onClick={cerrarTurno} disabled={cerrando} style={{
            height: 38, padding: '0 16px', background: 'transparent',
            border: '1px solid #2E2E2E', borderRadius: 8,
            color: '#A8A8A8', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>{cerrando ? '...' : 'Cerrar turno'}</button>
        ) : (
          <button onClick={iniciarTurno} style={{
            height: 38, padding: '0 18px', background: '#00FF88', border: 'none',
            borderRadius: 8, color: '#0B0B0B', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>⏱ Iniciar turno</button>
        )}
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#161616', border: '1px solid #2E2E2E', borderRadius: 12,
        padding: '12px 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#0D0D0D', border: '1px solid #1F1F1F', borderRadius: 8, padding: 3 }}>
          {[['todos','Todos'],['urgente','Urgentes'],['incidente','Incidentes'],['informativo','Informativos']].map(([id, label]) => (
            <button key={id} onClick={() => setFiltro(id)} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: filtro === id ? 600 : 400,
              background: filtro === id ? '#00FF88' : 'transparent',
              color: filtro === id ? '#0B0B0B' : '#636363',
              border: 'none', cursor: 'pointer', transition: 'all 100ms',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {counts.urgente > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.25)', fontSize: 11, fontWeight: 600, color: '#FF4444' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF4444', display: 'inline-block' }} />
              Urgentes: {counts.urgente}
            </span>
          )}
          {counts.incidente > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, fontWeight: 600, color: '#F59E0B' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
              Incidentes: {counts.incidente}
            </span>
          )}
          <span style={{ fontSize: 12, color: '#636363' }}>{novedades.length} novedades</span>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 24, height: 24, border: '2px solid #2E2E2E', borderTopColor: '#00FF88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ width: 52, height: 52, background: '#161616', border: '1px solid #2E2E2E', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>📋</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#636363', marginBottom: 6 }}>Sin novedades registradas</p>
            <p style={{ fontSize: 13, color: '#3E3E3E' }}>
              {turno ? 'Registra la primera novedad de este turno' : 'Inicia un turno para comenzar a registrar'}
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
          background: '#00FF88', border: 'none', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 60, fontSize: 26, color: '#0B0B0B', fontWeight: 700,
          boxShadow: '0 4px 20px rgba(0,255,136,0.3)', transition: 'transform 120ms',
        }}
        className="fab btn-glow"
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >+</button>
      )}

      {/* Modal: Nueva novedad */}
      {mostrarForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }} className="modal-backdrop">
          <div style={{ background: '#161616', border: '1px solid #2E2E2E', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }} className="modal-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #2E2E2E' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F5' }}>Nueva novedad</h2>
              <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636363', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={enviarNovedad} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Tipo</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {Object.entries(TIPOS).map(([id, t]) => (
                    <button key={id} type="button" onClick={() => setTipo(id)} style={{
                      padding: '9px 8px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: tipo === id ? `${t.color}18` : 'transparent',
                      color: tipo === id ? t.color : '#636363',
                      border: tipo === id ? `1px solid ${t.color}50` : '1px solid #2E2E2E',
                      transition: 'all 100ms',
                    }}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Descripción</label>
                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="Describe la novedad con detalle…" required autoFocus
                  style={{ width: '100%', height: 100, background: '#0D0D0D', border: '1px solid #2E2E2E', borderRadius: 8, padding: '10px 12px', color: '#F5F5F5', fontSize: 14, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms' }}
                  onFocus={e => e.target.style.borderColor = '#00FF88'}
                  onBlur={e => e.target.style.borderColor = '#2E2E2E'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Foto (opcional)</label>
                <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={e => setFotoFile(e.target.files?.[0] ?? null)} />
                {fotoFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0D0D0D', border: '1px solid #2E2E2E', borderRadius: 8, padding: '10px 12px' }}>
                    <span style={{ color: '#00FF88' }}>📎</span>
                    <span style={{ fontSize: 13, color: '#D0D0D0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fotoFile.name}</span>
                    <button type="button" onClick={() => setFotoFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636363' }}>✕</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current.click()} style={{ width: '100%', padding: '10px', border: '1px dashed #2E2E2E', borderRadius: 8, background: 'transparent', color: '#636363', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 100ms' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#00FF88'; e.currentTarget.style.color = '#F5F5F5'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2E2E2E'; e.currentTarget.style.color = '#636363'; }}
                  >+ Adjuntar foto</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, height: 42, background: 'transparent', border: '1px solid #2E2E2E', borderRadius: 8, color: '#A8A8A8', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={enviando} style={{ flex: 1, height: 42, background: '#00FF88', border: 'none', borderRadius: 8, color: '#0B0B0B', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{enviando ? '...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resumen turno */}
      {resumenModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }} className="modal-backdrop">
          <div style={{ background: '#161616', border: '1px solid #2E2E2E', borderRadius: 16, width: '100%', maxWidth: 380, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ padding: '22px 22px 14px' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(0,255,136,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 20 }}>✅</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F5', marginBottom: 4 }}>Turno cerrado</h2>
            </div>
            <div style={{ padding: '0 22px 22px' }}>
              <pre style={{ fontSize: 13, color: '#D0D0D0', background: '#0D0D0D', border: '1px solid #2E2E2E', borderRadius: 8, padding: '12px 14px', fontFamily: 'inherit', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{resumenModal}</pre>
              <button onClick={() => setResumenModal(null)} style={{ width: '100%', height: 42, marginTop: 12, background: '#00FF88', border: 'none', borderRadius: 8, color: '#0B0B0B', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
