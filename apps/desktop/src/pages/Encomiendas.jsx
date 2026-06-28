import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { enqueue } from '../lib/offlineQueue';
import { TIPOS_ENCOMIENDA, tipoInfo } from '../lib/tiposEncomienda';

function tiempoDesde(fecha) {
  const min = Math.floor((Date.now() - new Date(fecha)) / 60000);
  if (min < 60) return `hace ${min}min`;
  const h = Math.floor(min / 60);
  return `hace ${h}h ${min % 60}min`;
}

const INPUT_STYLE = {
  width: '100%', height: 48, background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '0 12px', color: 'var(--text)', fontSize: 16,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms',
};

function PaqueteIcon({ tipo }) {
  const info = tipoInfo(tipo);
  return (
    <div style={{ width: 52, height: 52, background: 'var(--bg-surface-high)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: 'var(--text-muted)' }}>{info.icono}</span>
    </div>
  );
}

export default function Encomiendas({ perfil, turno }) {
  const [encomiendas, setEncomiendas] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState('pendientes');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm]               = useState({ tipo: 'paquete', remitente: '', destinatario: '', depto: '' });
  const [fotoFile, setFotoFile]       = useState(null);
  const [enviando, setEnviando]       = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const fileRef = useRef();

  useEffect(() => { cargarEncomiendas(); }, []);

  async function cargarEncomiendas() {
    setLoading(true);
    const { data } = await supabase.from('encomiendas').select('*')
      .eq('edificio_id', perfil.edificio_id)
      .order('recibida_at', { ascending: false }).limit(50);
    setEncomiendas(data ?? []);
    setLoading(false);
  }

  async function registrarEncomienda(e) {
    e.preventDefault();
    if (!navigator.onLine) {
      if (fotoFile) {
        setErrorMsg('Sin conexión: registra sin foto. Puedes adjuntarla cuando vuelva la red.');
        return;
      }
      enqueue({ table: 'encomiendas', op: 'insert', payload: {
        edificio_id: perfil.edificio_id, conserje_id: perfil.id,
        turno_id: turno?.id ?? null, foto_url: null,
        recibida_at: new Date().toISOString(), ...form,
      }});
      setMostrarForm(false);
      setForm({ tipo: 'paquete', remitente: '', destinatario: '', depto: '' });
      setFotoFile(null);
      return;
    }
    setEnviando(true);
    setErrorMsg('');
    let foto_url = null;
    if (fotoFile) {
      const ext  = fotoFile.name.split('.').pop();
      const path = `encomiendas/${perfil.edificio_id}/${Date.now()}.${ext}`;
      const { data: up, error: upError } = await supabase.storage.from('fotos').upload(path, fotoFile);
      if (upError) { setErrorMsg('No se pudo subir la foto. Revisa tu conexión e intenta de nuevo.'); setEnviando(false); return; }
      if (up) { const { data: pub } = supabase.storage.from('fotos').getPublicUrl(path); foto_url = pub.publicUrl; }
    }
    const { error } = await supabase.from('encomiendas').insert({
      edificio_id: perfil.edificio_id, conserje_id: perfil.id,
      turno_id: turno?.id ?? null, foto_url, ...form,
    });
    if (error) {
      setErrorMsg('No se pudo registrar la encomienda. Tus datos no se perdieron, intenta de nuevo.');
    } else {
      setMostrarForm(false); setForm({ tipo: 'paquete', remitente: '', destinatario: '', depto: '' }); setFotoFile(null); cargarEncomiendas();
    }
    setEnviando(false);
  }

  async function marcarEntregada(id) {
    setErrorMsg('');
    const ahora = new Date().toISOString();
    if (!navigator.onLine) {
      enqueue({ table: 'encomiendas', op: 'update', rowId: id, payload: { entregada: true, entregada_at: ahora } });
      setEncomiendas(prev => prev.map(e => e.id === id ? { ...e, entregada: true, entregada_at: ahora } : e));
      return;
    }
    const { error } = await supabase.from('encomiendas').update({ entregada: true, entregada_at: ahora }).eq('id', id);
    if (error) setErrorMsg('No se pudo marcar como entregada. Intenta de nuevo.');
    else cargarEncomiendas();
  }

  const pendientes = encomiendas.filter(e => !e.entregada)
    .sort((a, b) => (tipoInfo(b.tipo).urgente - tipoInfo(a.tipo).urgente));
  const entregadas = encomiendas.filter(e => e.entregada);
  const lista       = tab === 'pendientes' ? pendientes : entregadas;
  const urgentes    = pendientes.filter(e => tipoInfo(e.tipo).urgente);

  return (
    <div style={{ padding: '22px 24px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(var(--brand-rgb),0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--brand)' }}>inventory_2</span>
            </div>
            <div style={{ fontSize: 23, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>Encomiendas</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {pendientes.length > 0 && (
              <span style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(var(--brand-rgb),0.14)', color: 'var(--brand)', border: '1px solid rgba(var(--brand-rgb),0.25)', fontSize: 11, fontWeight: 700 }}>
                {pendientes.length} pendientes
              </span>
            )}
            {urgentes.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, background: 'var(--crit-bg)', color: 'var(--crit-tx)', border: '1px solid var(--crit-tx)', fontSize: 11, fontWeight: 700 }}>
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 13 }}>schedule</span>
                {urgentes.length} urgente{urgentes.length !== 1 ? 's' : ''} (perecible)
              </span>
            )}
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{entregadas.length} entregadas hoy</span>
          </div>
        </div>
        <button onClick={() => setMostrarForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 48, padding: '0 20px',
          background: 'var(--brand)', border: 'none', borderRadius: 8,
          color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
        }}>+ Registrar ingreso</button>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--crit-bg)', borderLeft: '4px solid var(--crit-tx)',
          borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: 16,
        }}>
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--crit-tx)', flexShrink: 0 }}>error</span>
          <span style={{ fontSize: 14, color: 'var(--crit-tx)', fontWeight: 600 }}>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--bg-surface-high)' }}>
        {[['pendientes', `Pendientes (${pendientes.length})`], ['historial', `Historial (${entregadas.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '10px 20px', fontSize: 13, fontWeight: tab === id ? 600 : 400,
            color: tab === id ? 'var(--text)' : 'var(--text-muted)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            borderBottom: tab === id ? '2px solid var(--brand)' : '2px solid transparent',
            marginBottom: -1, transition: 'all 120ms',
          }}>{label}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : lista.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ width: 52, height: 52, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>📦</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            {tab === 'pendientes' ? 'Sin encomiendas pendientes' : 'Sin encomiendas entregadas hoy'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lista.map(enc => {
            const info = tipoInfo(enc.tipo);
            const urgente = info.urgente && !enc.entregada;
            return (
            <div key={enc.id} style={{
              background: 'var(--bg-surface)', border: urgente ? '1px solid var(--crit-tx)' : '1px solid var(--border)', borderRadius: 12,
              padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16,
              transition: 'border-color 120ms', opacity: enc.entregada ? 0.6 : 1,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = urgente ? 'var(--crit-tx)' : 'var(--border-strong)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = urgente ? 'var(--crit-tx)' : 'var(--border)'}
            >
              {/* Foto o icono */}
              {enc.foto_url ? (
                <img src={enc.foto_url} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} />
              ) : <PaqueteIcon tipo={enc.tipo} />}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{enc.destinatario}</span>
                  <span style={{ padding: '1px 7px', borderRadius: 5, background: 'var(--bg-surface-high)', border: '1px solid var(--border-strong)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Depto {enc.depto}</span>
                  {urgente && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '1px 7px', borderRadius: 5, background: 'var(--crit-bg)', border: '1px solid var(--crit-tx)', fontSize: 11, fontWeight: 700, color: 'var(--crit-tx)' }}>
                      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 13 }}>schedule</span>
                      Entrega inmediata
                    </span>
                  )}
                  {enc.entregada && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ok-tx)' }}>
                      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>check_circle</span>
                      Entregada
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{info.label}</p>
                {enc.remitente && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>De: {enc.remitente}</p>}
                <p style={{ fontSize: 11, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 12 }}>schedule</span>
                  {enc.entregada
                    ? `Entregada ${new Date(enc.entregada_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
                    : `Recibida ${tiempoDesde(enc.recibida_at)}`
                  }
                </p>
              </div>

              {/* Acción */}
              {!enc.entregada && (
                <button onClick={() => marcarEntregada(enc.id)} style={{
                  flexShrink: 0, minHeight: 48, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0 16px', borderRadius: 8,
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 120ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>check_circle</span>
                  Marcar entregada
                </button>
              )}
            </div>
          );})}
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setMostrarForm(true)} title="Registrar encomienda" style={{
        position: 'fixed', bottom: 28, right: 28, width: 52, height: 52,
        background: 'var(--brand)', border: 'none', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 60, fontSize: 26, color: 'var(--brand-text-on)', fontWeight: 700,
        boxShadow: '0 4px 20px rgba(var(--brand-rgb),0.3)', transition: 'transform 120ms',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >+</button>

      {/* Modal */}
      {mostrarForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Registrar encomienda</h2>
              <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>
            <form onSubmit={registrarEncomienda} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Tipo de encomienda */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>¿Qué tipo de encomienda es?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {TIPOS_ENCOMIENDA.map(t => {
                    const activo = form.tipo === t.id;
                    return (
                      <button key={t.id} type="button" onClick={() => setForm(f => ({ ...f, tipo: t.id }))}
                        title={t.ejemplo}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', minHeight: 48,
                          borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                          border: activo ? '1px solid var(--brand)' : '1px solid var(--border)',
                          background: activo ? 'rgba(var(--brand-rgb),0.12)' : 'var(--bg-input)',
                          color: activo ? 'var(--brand)' : 'var(--text-secondary)',
                          transition: 'all 120ms',
                        }}>
                        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, flexShrink: 0 }}>{t.icono}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
                {form.tipo && tipoInfo(form.tipo).urgente && (
                  <p style={{ fontSize: 11, color: 'var(--crit-tx)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 13 }}>schedule</span>
                    Perecible — avisa al residente para que la retire al tiro, no la dejes en bodega.
                  </p>
                )}
              </div>
              {[
                ['destinatario', 'Destinatario', 'Nombre del residente', true],
                ['depto',        'Depto / Oficina', '201', true],
                ['remitente',    'Empresa / remitente (opcional)', 'Falabella, Rappi, Jumbo…', false],
              ].map(([key, label, placeholder, required]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
                  <input style={INPUT_STYLE} placeholder={placeholder} required={required}
                    value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              ))}
              {/* Foto */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Foto (opcional)</label>
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
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, height: 48, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
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
