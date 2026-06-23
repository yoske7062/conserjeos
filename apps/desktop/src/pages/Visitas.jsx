import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function Avatar({ nombre, size = 40 }) {
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, color: '#00FF88',
    }}>{iniciales}</div>
  );
}

function VisitaCard({ v, onSalida }) {
  const entrada = new Date(v.entrada);
  const minutos = Math.floor((Date.now() - entrada) / 60000);
  const duracion = minutos < 60 ? `${minutos}min` : `${Math.floor(minutos/60)}h ${minutos%60}min`;

  return (
    <div style={{
      background: '#161616', border: '1px solid #2E2E2E', borderRadius: 12,
      padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14,
      transition: 'border-color 120ms',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#3E3E3E'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#2E2E2E'}
    >
      <Avatar nombre={v.nombre_visitante} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F5', marginBottom: 3 }}>{v.nombre_visitante}</p>
        <p style={{ fontSize: 12, color: '#636363', marginBottom: 2 }}>
          Visita a <span style={{ color: '#A8A8A8' }}>{v.destino}</span>
          {v.motivo && <> · {v.motivo}</>}
        </p>
        {v.rut_visitante && <p style={{ fontSize: 11, color: '#4E4E4E' }}>RUT: {v.rut_visitante}</p>}
        <p style={{ fontSize: 11, color: '#636363', marginTop: 4 }}>
          Entrada {entrada.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} · hace {duracion}
        </p>
      </div>
      <button onClick={() => onSalida(v.id)} style={{
        flexShrink: 0, padding: '7px 14px', borderRadius: 8,
        background: 'transparent', border: '1px solid #2E2E2E',
        color: '#A8A8A8', fontSize: 12, fontWeight: 500, cursor: 'pointer',
        transition: 'all 120ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#00FF88'; e.currentTarget.style.color = '#00FF88'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2E2E2E'; e.currentTarget.style.color = '#A8A8A8'; }}
      >Registrar salida</button>
    </div>
  );
}

const INPUT_STYLE = {
  width: '100%', height: 40, background: '#0D0D0D', border: '1px solid #2E2E2E',
  borderRadius: 8, padding: '0 12px', color: '#F5F5F5', fontSize: 14,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms',
};

export default function Visitas({ perfil, turno }) {
  const [visitas, setVisitas]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm]               = useState({ nombre_visitante: '', rut_visitante: '', destino: '', motivo: '' });
  const [enviando, setEnviando]       = useState(false);

  useEffect(() => { cargarVisitas(); }, []);

  async function cargarVisitas() {
    setLoading(true);
    const { data } = await supabase.from('visitas').select('*')
      .eq('edificio_id', perfil.edificio_id)
      .order('entrada', { ascending: false }).limit(50);
    setVisitas(data ?? []);
    setLoading(false);
  }

  async function registrarEntrada(e) {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.from('visitas').insert({
      edificio_id: perfil.edificio_id, conserje_id: perfil.id,
      turno_id: turno?.id ?? null, ...form,
    });
    if (!error) { setMostrarForm(false); setForm({ nombre_visitante: '', rut_visitante: '', destino: '', motivo: '' }); cargarVisitas(); }
    setEnviando(false);
  }

  async function registrarSalida(id) {
    await supabase.from('visitas').update({ salida: new Date().toISOString(), activa: false }).eq('id', id);
    cargarVisitas();
  }

  const activas   = visitas.filter(v => v.activa);
  const historial = visitas.filter(v => !v.activa);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F5F5F5', marginBottom: 4 }}>Control de Visitas</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activas.length > 0 && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00FF88', display: 'inline-block' }} />}
            <p style={{ fontSize: 13, color: '#636363' }}>
              {activas.length > 0
                ? `${activas.length} persona${activas.length !== 1 ? 's' : ''} en el edificio ahora`
                : 'Sin visitas activas'}
            </p>
          </div>
        </div>
        <button onClick={() => setMostrarForm(true)} style={{
          height: 38, padding: '0 18px', background: '#00FF88', border: 'none',
          borderRadius: 8, color: '#0B0B0B', fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>+ Registrar entrada</button>
      </div>

      {/* Visitas activas */}
      {activas.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            En el edificio ahora
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {activas.map(v => <VisitaCard key={v.id} v={v} onSalida={registrarSalida} />)}
          </div>
        </div>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Historial del día
          </p>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px 90px',
            padding: '8px 16px', background: '#0D0D0D', border: '1px solid #1F1F1F',
            borderRadius: '10px 10px 0 0', gap: 12,
          }}>
            {['Visitante', 'Destino', 'Entrada', 'Salida', 'Duración'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>
          <div style={{ border: '1px solid #1F1F1F', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
            {historial.map((v, i) => {
              const entrada = new Date(v.entrada);
              const salida  = v.salida ? new Date(v.salida) : null;
              const minutos = salida ? Math.floor((salida - entrada) / 60000) : null;
              const dur = minutos !== null ? (minutos < 60 ? `${minutos}min` : `${Math.floor(minutos/60)}h ${minutos%60}min`) : '—';
              return (
                <div key={v.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px 90px',
                  padding: '12px 16px', gap: 12, alignItems: 'center',
                  borderTop: i > 0 ? '1px solid #1A1A1A' : 'none',
                  background: i % 2 === 0 ? '#111' : '#0D0D0D',
                  transition: 'background 100ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#111' : '#0D0D0D'}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#D0D0D0' }}>{v.nombre_visitante}</p>
                    {v.rut_visitante && <p style={{ fontSize: 11, color: '#4E4E4E' }}>{v.rut_visitante}</p>}
                  </div>
                  <span style={{ fontSize: 13, color: '#A8A8A8' }}>{v.destino}</span>
                  <span style={{ fontSize: 13, color: '#636363' }}>{entrada.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ fontSize: 13, color: '#636363' }}>{salida ? salida.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  <span style={{ fontSize: 13, color: '#636363' }}>{dur}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && visitas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ width: 52, height: 52, background: '#161616', border: '1px solid #2E2E2E', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>👤</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#636363', marginBottom: 6 }}>Sin visitas registradas hoy</p>
          <p style={{ fontSize: 13, color: '#3E3E3E' }}>Registra la entrada de visitantes al edificio</p>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setMostrarForm(true)} title="Registrar entrada" style={{
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
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F5' }}>Registrar entrada</h2>
              <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#636363', fontSize: 20 }}>✕</button>
            </div>
            <form onSubmit={registrarEntrada} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['nombre_visitante', 'Nombre del visitante', 'Juan Pérez', true],
                ['rut_visitante',    'RUT (opcional)',        '12.345.678-9', false],
                ['destino',          'Depto / Oficina',       '201, Oficina 3…', true],
                ['motivo',           'Motivo (opcional)',     'Visita personal, delivery…', false],
              ].map(([key, label, placeholder, required]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
                  <input
                    style={INPUT_STYLE} placeholder={placeholder} required={required}
                    value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = '#00FF88'}
                    onBlur={e => e.target.style.borderColor = '#2E2E2E'}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, height: 42, background: 'transparent', border: '1px solid #2E2E2E', borderRadius: 8, color: '#A8A8A8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={enviando} style={{ flex: 1, height: 42, background: '#00FF88', border: 'none', borderRadius: 8, color: '#0B0B0B', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{enviando ? '...' : 'Registrar entrada'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
