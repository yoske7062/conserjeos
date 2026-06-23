import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

function tiempoDesde(fecha) {
  const min = Math.floor((Date.now() - new Date(fecha)) / 60000);
  if (min < 60) return `hace ${min}min`;
  const h = Math.floor(min / 60);
  return `hace ${h}h ${min % 60}min`;
}

const INPUT_STYLE = {
  width: '100%', height: 40, background: '#0D0D0D', border: '1px solid #2E2E2E',
  borderRadius: 8, padding: '0 12px', color: '#F5F5F5', fontSize: 14,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms',
};

function PaqueteIcon() {
  return (
    <div style={{ width: 52, height: 52, background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: '#636363' }}>inventory_2</span>
    </div>
  );
}

export default function Encomiendas({ perfil, turno }) {
  const [encomiendas, setEncomiendas] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState('pendientes');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm]               = useState({ remitente: '', destinatario: '', depto: '' });
  const [fotoFile, setFotoFile]       = useState(null);
  const [enviando, setEnviando]       = useState(false);
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
    setEnviando(true);
    let foto_url = null;
    if (fotoFile) {
      const ext  = fotoFile.name.split('.').pop();
      const path = `encomiendas/${perfil.edificio_id}/${Date.now()}.${ext}`;
      const { data: up } = await supabase.storage.from('fotos').upload(path, fotoFile);
      if (up) { const { data: pub } = supabase.storage.from('fotos').getPublicUrl(path); foto_url = pub.publicUrl; }
    }
    const { error } = await supabase.from('encomiendas').insert({
      edificio_id: perfil.edificio_id, conserje_id: perfil.id,
      turno_id: turno?.id ?? null, foto_url, ...form,
    });
    if (!error) { setMostrarForm(false); setForm({ remitente: '', destinatario: '', depto: '' }); setFotoFile(null); cargarEncomiendas(); }
    setEnviando(false);
  }

  async function marcarEntregada(id) {
    await supabase.from('encomiendas').update({ entregada: true, entregada_at: new Date().toISOString() }).eq('id', id);
    cargarEncomiendas();
  }

  const pendientes = encomiendas.filter(e => !e.entregada);
  const entregadas = encomiendas.filter(e => e.entregada);
  const lista      = tab === 'pendientes' ? pendientes : entregadas;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F5F5F5', marginBottom: 8 }}>Encomiendas</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {pendientes.length > 0 && (
              <span style={{ padding: '3px 10px', borderRadius: 6, background: '#00FF88', color: '#0B0B0B', fontSize: 12, fontWeight: 700 }}>
                {pendientes.length} pendientes
              </span>
            )}
            <span style={{ fontSize: 13, color: '#636363' }}>{entregadas.length} entregadas hoy</span>
          </div>
        </div>
        <button onClick={() => setMostrarForm(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 18px',
          background: '#00FF88', border: 'none', borderRadius: 8,
          color: '#0B0B0B', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>+ Registrar ingreso</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #1F1F1F' }}>
        {[['pendientes', `Pendientes (${pendientes.length})`], ['historial', `Historial (${entregadas.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '10px 20px', fontSize: 14, fontWeight: tab === id ? 600 : 400,
            color: tab === id ? '#F5F5F5' : '#636363',
            background: 'transparent', border: 'none', cursor: 'pointer',
            borderBottom: tab === id ? '2px solid #00FF88' : '2px solid transparent',
            marginBottom: -1, transition: 'all 120ms',
          }}>{label}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 24, height: 24, border: '2px solid #2E2E2E', borderTopColor: '#00FF88', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : lista.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ width: 52, height: 52, background: '#161616', border: '1px solid #2E2E2E', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>📦</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#636363', marginBottom: 6 }}>
            {tab === 'pendientes' ? 'Sin encomiendas pendientes' : 'Sin encomiendas entregadas hoy'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lista.map(enc => (
            <div key={enc.id} style={{
              background: '#161616', border: '1px solid #2E2E2E', borderRadius: 12,
              padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16,
              transition: 'border-color 120ms', opacity: enc.entregada ? 0.6 : 1,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3E3E3E'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2E2E2E'}
            >
              {/* Foto o icono */}
              {enc.foto_url ? (
                <img src={enc.foto_url} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #2E2E2E' }} />
              ) : <PaqueteIcon />}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F5' }}>{enc.destinatario}</span>
                  <span style={{ padding: '1px 7px', borderRadius: 5, background: '#222', border: '1px solid #333', fontSize: 11, fontWeight: 600, color: '#A8A8A8' }}>Depto {enc.depto}</span>
                  {enc.entregada && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#00FF88' }}>
                      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>check_circle</span>
                      Entregada
                    </span>
                  )}
                </div>
                {enc.remitente && <p style={{ fontSize: 12, color: '#636363', marginBottom: 2 }}>De: {enc.remitente}</p>}
                <p style={{ fontSize: 11, color: '#4E4E4E', display: 'flex', alignItems: 'center', gap: 4 }}>
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
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 8,
                  background: 'transparent', border: '1px solid #2E2E2E',
                  color: '#A8A8A8', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 120ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#00FF88'; e.currentTarget.style.color = '#00FF88'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2E2E2E'; e.currentTarget.style.color = '#A8A8A8'; }}
                >
                  <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>check_circle</span>
                  Marcar entregada
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setMostrarForm(true)} title="Registrar encomienda" style={{
        position: 'fixed', bottom: 28, right: 28, width: 52, height: 52,
        background: '#00FF88', border: 'none', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', zIndex: 60, fontSize: 26, color: '#0B0B0B', fontWeight: 700,
        boxShadow: '0 4px 20px rgba(0,255,136,0.3)', transition: 'transform 120ms',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >+</button>

      {/* Modal */}
      {mostrarForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#161616', border: '1px solid #2E2E2E', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #2E2E2E' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F5' }}>Registrar encomienda</h2>
              <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636363', fontSize: 20 }}>✕</button>
            </div>
            <form onSubmit={registrarEncomienda} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['destinatario', 'Destinatario', 'Nombre del residente', true],
                ['depto',        'Depto / Oficina', '201', true],
                ['remitente',    'Remitente (opcional)', 'Falabella, Amazon…', false],
              ].map(([key, label, placeholder, required]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
                  <input style={INPUT_STYLE} placeholder={placeholder} required={required}
                    value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = '#00FF88'}
                    onBlur={e => e.target.style.borderColor = '#2E2E2E'}
                  />
                </div>
              ))}
              {/* Foto */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Foto (opcional)</label>
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
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, height: 42, background: 'transparent', border: '1px solid #2E2E2E', borderRadius: 8, color: '#A8A8A8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={enviando} style={{ flex: 1, height: 42, background: '#00FF88', border: 'none', borderRadius: 8, color: '#0B0B0B', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{enviando ? '...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
