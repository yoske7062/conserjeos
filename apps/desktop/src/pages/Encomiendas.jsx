import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { enqueue, fileToBase64 } from '../lib/offlineQueue';
import { TIPOS_ENCOMIENDA, tipoInfo } from '../lib/tiposEncomienda';
import FotoField from '../components/FotoField';

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

function sanitizarBusqueda(s) {
  return s.replace(/[,()%]/g, '').trim();
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

  // Búsqueda
  const [busqueda, setBusqueda]               = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState(null);
  const [buscando, setBuscando]               = useState(false);

  // Retiro (quién retira la encomienda)
  const [retiroTarget, setRetiroTarget] = useState(null);
  const [retiroForm, setRetiroForm]     = useState({ retirado_por: '', retirado_tipo: 'residente' });
  const [confirmandoRetiro, setConfirmandoRetiro] = useState(false);

  // Edición de un registro existente
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm]     = useState({ tipo: 'paquete', remitente: '', destinatario: '', depto: '' });
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  useEffect(() => { cargarEncomiendas(); }, []);

  useEffect(() => {
    const q = sanitizarBusqueda(busqueda);
    if (!q) { setResultadosBusqueda(null); return; }
    setBuscando(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase.from('encomiendas').select('*')
          .eq('edificio_id', perfil.edificio_id)
          .or(`destinatario.ilike.%${q}%,remitente.ilike.%${q}%,depto.ilike.%${q}%`)
          .order('recibida_at', { ascending: false }).limit(50);
        setResultadosBusqueda(data ?? []);
      } catch {
        setResultadosBusqueda([]);
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [busqueda, perfil.edificio_id]);

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
      const fotoBase64 = fotoFile ? await fileToBase64(fotoFile) : null;
      enqueue({ table: 'encomiendas', op: 'insert', payload: {
        edificio_id: perfil.edificio_id, conserje_id: perfil.id,
        turno_id: turno?.id ?? null, foto_url: null,
        recibida_at: new Date().toISOString(), ...form,
      }, fotoBase64, fotoName: fotoFile?.name });
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

  function abrirRetiro(id) {
    setRetiroForm({ retirado_por: '', retirado_tipo: 'residente' });
    setRetiroTarget(id);
  }

  async function confirmarRetiro(e) {
    e.preventDefault();
    if (!retiroForm.retirado_por.trim()) return;
    setConfirmandoRetiro(true);
    setErrorMsg('');
    const ahora = new Date().toISOString();
    const payload = {
      entregada: true, entregada_at: ahora,
      retirado_por: retiroForm.retirado_por.trim(), retirado_tipo: retiroForm.retirado_tipo,
    };
    if (!navigator.onLine) {
      enqueue({ table: 'encomiendas', op: 'update', rowId: retiroTarget, payload });
      setEncomiendas(prev => prev.map(e => e.id === retiroTarget ? { ...e, ...payload } : e));
      setRetiroTarget(null); setConfirmandoRetiro(false);
      return;
    }
    const { error } = await supabase.from('encomiendas').update(payload).eq('id', retiroTarget);
    if (error) setErrorMsg('No se pudo marcar como entregada. Intenta de nuevo.');
    else { setRetiroTarget(null); cargarEncomiendas(); }
    setConfirmandoRetiro(false);
  }

  function abrirEdicion(enc) {
    setEditForm({ tipo: enc.tipo, remitente: enc.remitente ?? '', destinatario: enc.destinatario, depto: enc.depto });
    setEditTarget(enc);
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    if (!navigator.onLine) { setErrorMsg('Necesitas conexión a internet para editar un registro.'); return; }
    setGuardandoEdit(true);
    setErrorMsg('');
    const { id, ...valorAnterior } = editTarget;
    const { error } = await supabase.from('encomiendas').update({
      ...editForm,
      editado_por: perfil.id, editado_at: new Date().toISOString(), valor_anterior: valorAnterior,
    }).eq('id', editTarget.id);
    if (error) setErrorMsg('No se pudo guardar la edición. Intenta de nuevo.');
    else { setEditTarget(null); cargarEncomiendas(); if (busqueda) setBusqueda(b => b); }
    setGuardandoEdit(false);
  }

  const pendientesTodas = encomiendas.filter(e => !e.entregada)
    .sort((a, b) => (tipoInfo(b.tipo).urgente - tipoInfo(a.tipo).urgente));
  const entregadasTodas = encomiendas.filter(e => e.entregada);
  const urgentes        = pendientesTodas.filter(e => tipoInfo(e.tipo).urgente);
  const buscandoActivo  = resultadosBusqueda !== null;
  const lista            = buscandoActivo ? resultadosBusqueda : (tab === 'pendientes' ? pendientesTodas : entregadasTodas);

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
            {pendientesTodas.length > 0 && (
              <span style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(var(--brand-rgb),0.14)', color: 'var(--brand)', border: '1px solid rgba(var(--brand-rgb),0.25)', fontSize: 11, fontWeight: 700 }}>
                {pendientesTodas.length} pendientes
              </span>
            )}
            {urgentes.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, background: 'var(--crit-bg)', color: 'var(--crit-tx)', border: '1px solid var(--crit-tx)', fontSize: 11, fontWeight: 700 }}>
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 13 }}>schedule</span>
                {urgentes.length} urgente{urgentes.length !== 1 ? 's' : ''} (perecible)
              </span>
            )}
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{entregadasTodas.length} entregadas hoy</span>
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

      {/* Búsqueda */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--text-muted)' }}>search</span>
        <input
          style={{ ...INPUT_STYLE, paddingLeft: 40 }}
          placeholder="Buscar por destinatario, remitente o depto…"
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'var(--brand)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Tabs (ocultas mientras se busca) */}
      {!buscandoActivo && (
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--bg-surface-high)' }}>
          {[['pendientes', `Pendientes (${pendientesTodas.length})`], ['historial', `Historial (${entregadasTodas.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '10px 20px', fontSize: 13, fontWeight: tab === id ? 600 : 400,
              color: tab === id ? 'var(--text)' : 'var(--text-muted)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: tab === id ? '2px solid var(--brand)' : '2px solid transparent',
              marginBottom: -1, transition: 'all 120ms',
            }}>{label}</button>
          ))}
        </div>
      )}
      {buscandoActivo && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {buscando ? 'Buscando…' : `${lista.length} resultado${lista.length !== 1 ? 's' : ''} para "${busqueda}"`}
        </p>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : lista.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ width: 52, height: 52, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>📦</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            {buscandoActivo ? 'Sin resultados' : tab === 'pendientes' ? 'Sin encomiendas pendientes' : 'Sin encomiendas entregadas hoy'}
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
                {enc.entregada && enc.retirado_por && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>
                    Retiró: {enc.retirado_por} ({enc.retirado_tipo === 'tercero' ? 'tercero autorizado' : 'residente'})
                  </p>
                )}
                <p style={{ fontSize: 11, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 12 }}>schedule</span>
                  {enc.entregada
                    ? `Entregada ${new Date(enc.entregada_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
                    : `Recibida ${tiempoDesde(enc.recibida_at)}`
                  }
                </p>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button onClick={() => abrirEdicion(enc)} title="Editar" style={{
                  width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 120ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                ><span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>edit</span></button>
                {!enc.entregada && (
                  <button onClick={() => abrirRetiro(enc.id)} style={{
                    minHeight: 48, display: 'flex', alignItems: 'center', gap: 6,
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

      {/* Modal: Registrar */}
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
                <FotoField value={fotoFile} onChange={setFotoFile} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, height: 48, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={enviando} style={{ flex: 1, height: 48, background: 'var(--brand)', border: 'none', borderRadius: 8, color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{enviando ? '...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: ¿Quién retira? */}
      {retiroTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 380, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>¿Quién retira la encomienda?</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Esto queda registrado por si después hay un reclamo.</p>
            </div>
            <form onSubmit={confirmarRetiro} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Nombre de quien retira</label>
                <input style={INPUT_STYLE} placeholder="Nombre completo" required autoFocus
                  value={retiroForm.retirado_por} onChange={e => setRetiroForm(f => ({ ...f, retirado_por: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>¿Quién es?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['residente', 'El residente'], ['tercero', 'Un tercero autorizado']].map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setRetiroForm(f => ({ ...f, retirado_tipo: id }))} style={{
                      minHeight: 44, padding: '8px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: retiroForm.retirado_tipo === id ? 'rgba(var(--brand-rgb),0.12)' : 'var(--bg-input)',
                      color: retiroForm.retirado_tipo === id ? 'var(--brand)' : 'var(--text-secondary)',
                      border: retiroForm.retirado_tipo === id ? '1px solid var(--brand)' : '1px solid var(--border)',
                    }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setRetiroTarget(null)} style={{ flex: 1, height: 48, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={confirmandoRetiro} style={{ flex: 1, height: 48, background: 'var(--brand)', border: 'none', borderRadius: 8, color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{confirmandoRetiro ? '...' : 'Confirmar entrega'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar */}
      {editTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Editar encomienda</h2>
              <button onClick={() => setEditTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>
            <form onSubmit={guardarEdicion} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {TIPOS_ENCOMIENDA.map(t => (
                  <button key={t.id} type="button" onClick={() => setEditForm(f => ({ ...f, tipo: t.id }))} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', minHeight: 48,
                    borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    border: editForm.tipo === t.id ? '1px solid var(--brand)' : '1px solid var(--border)',
                    background: editForm.tipo === t.id ? 'rgba(var(--brand-rgb),0.12)' : 'var(--bg-input)',
                    color: editForm.tipo === t.id ? 'var(--brand)' : 'var(--text-secondary)',
                  }}>
                    <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>{t.icono}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span>
                  </button>
                ))}
              </div>
              {[
                ['destinatario', 'Destinatario', true],
                ['depto',        'Depto / Oficina', true],
                ['remitente',    'Empresa / remitente (opcional)', false],
              ].map(([key, label, required]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
                  <input style={INPUT_STYLE} required={required}
                    value={editForm[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setEditTarget(null)} style={{ flex: 1, height: 48, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
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
