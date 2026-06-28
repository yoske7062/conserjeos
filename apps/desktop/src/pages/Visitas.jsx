import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { enqueue } from '../lib/offlineQueue';
import { formatearRut, validarRut } from '../lib/rut';

function Avatar({ nombre, size = 40 }) {
  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(var(--brand-rgb),0.1)', border: '1px solid rgba(var(--brand-rgb),0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, color: 'var(--brand)',
    }}>{iniciales}</div>
  );
}

function VisitaCard({ v, onSalida }) {
  const entrada = new Date(v.entrada);
  const minutos = Math.floor((Date.now() - entrada) / 60000);
  const duracion = minutos < 60 ? `${minutos}min` : `${Math.floor(minutos/60)}h ${minutos%60}min`;

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14,
      transition: 'border-color 120ms',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <Avatar nombre={v.nombre_visitante} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{v.nombre_visitante}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>
          Visita a <span style={{ color: 'var(--text-secondary)' }}>{v.destino}</span>
          {v.motivo && <> · {v.motivo}</>}
        </p>
        {v.rut_visitante && <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>RUT: {v.rut_visitante}</p>}
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Entrada {entrada.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} · hace {duracion}
        </p>
      </div>
      <button onClick={() => onSalida(v.id)} style={{
        flexShrink: 0, minHeight: 48, padding: '0 16px', borderRadius: 8,
        background: 'transparent', border: '1px solid var(--border)',
        color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500, cursor: 'pointer',
        transition: 'all 120ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >Registrar salida</button>
    </div>
  );
}

const INPUT_STYLE = {
  width: '100%', height: 48, background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '0 12px', color: 'var(--text)', fontSize: 16,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms',
};

function RutInput({ value, onChange }) {
  const valido = validarRut(value);
  const colorEstado = valido === true ? 'var(--brand)' : valido === false ? 'var(--crit-tx)' : 'var(--border)';
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>RUT del visitante</label>
      <div style={{ position: 'relative' }}>
        <input
          style={{ ...INPUT_STYLE, paddingRight: 40, borderColor: colorEstado }}
          placeholder="12.345.678-9" required
          inputMode="text" autoComplete="off"
          value={value}
          onChange={e => onChange(formatearRut(e.target.value))}
        />
        {valido !== null && (
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'Material Symbols Outlined', fontSize: 20,
            color: valido ? 'var(--brand)' : 'var(--crit-tx)',
          }}>{valido ? 'check_circle' : 'cancel'}</span>
        )}
      </div>
      {valido === false && (
        <p style={{ fontSize: 11, color: 'var(--crit-tx)', marginTop: 5 }}>Ese RUT no es válido. Revisa el número.</p>
      )}
    </div>
  );
}

export default function Visitas({ perfil, turno }) {
  const [visitas, setVisitas]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm]               = useState({ nombre_visitante: '', rut_visitante: '', destino: '', motivo: '' });
  const [enviando, setEnviando]       = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');

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
    if (validarRut(form.rut_visitante) !== true) {
      setErrorMsg('El RUT del visitante no es válido. Revísalo antes de registrar la entrada.');
      return;
    }
    if (!navigator.onLine) {
      const ahora = new Date().toISOString();
      enqueue({ table: 'visitas', op: 'insert', payload: {
        edificio_id: perfil.edificio_id, conserje_id: perfil.id,
        turno_id: turno?.id ?? null, entrada: ahora, activa: true, ...form,
      }});
      setMostrarForm(false);
      setForm({ nombre_visitante: '', rut_visitante: '', destino: '', motivo: '' });
      return;
    }
    setEnviando(true);
    setErrorMsg('');
    const { error } = await supabase.from('visitas').insert({
      edificio_id: perfil.edificio_id, conserje_id: perfil.id,
      turno_id: turno?.id ?? null, ...form,
    });
    if (error) {
      setErrorMsg('No se pudo registrar la visita. Tus datos no se perdieron, intenta de nuevo.');
    } else {
      setMostrarForm(false); setForm({ nombre_visitante: '', rut_visitante: '', destino: '', motivo: '' }); cargarVisitas();
    }
    setEnviando(false);
  }

  async function registrarSalida(id) {
    setErrorMsg('');
    const ahora = new Date().toISOString();
    if (!navigator.onLine) {
      enqueue({ table: 'visitas', op: 'update', rowId: id, payload: { salida: ahora, activa: false } });
      setVisitas(prev => prev.map(v => v.id === id ? { ...v, salida: ahora, activa: false } : v));
      return;
    }
    const { error } = await supabase.from('visitas').update({ salida: ahora, activa: false }).eq('id', id);
    if (error) setErrorMsg('No se pudo registrar la salida. Intenta de nuevo.');
    else cargarVisitas();
  }

  const activas   = visitas.filter(v => v.activa);
  const historial = visitas.filter(v => !v.activa);

  return (
    <div style={{ padding: '22px 24px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(var(--brand-rgb),0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--brand)' }}>group</span>
            </div>
            <div style={{ fontSize: 23, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>Control de Visitas</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activas.length > 0 && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block' }} />}
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {activas.length > 0
                ? `${activas.length} persona${activas.length !== 1 ? 's' : ''} en el edificio ahora`
                : 'Sin visitas activas'}
            </p>
          </div>
        </div>
        <button onClick={() => setMostrarForm(true)} style={{
          height: 48, padding: '0 20px', background: 'var(--brand)', border: 'none',
          borderRadius: 8, color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
        }}>+ Registrar entrada</button>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--crit-bg)', borderLeft: '4px solid var(--crit-tx)',
          borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: 20,
        }}>
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--crit-tx)', flexShrink: 0 }}>error</span>
          <span style={{ fontSize: 14, color: 'var(--crit-tx)', fontWeight: 600 }}>{errorMsg}</span>
        </div>
      )}

      {/* Visitas activas */}
      {activas.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
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
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Historial del día
          </p>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px 90px',
            padding: '8px 16px', background: 'var(--bg-input)', border: '1px solid var(--bg-surface-high)',
            borderRadius: '10px 10px 0 0', gap: 12,
          }}>
            {['Visitante', 'Destino', 'Entrada', 'Salida', 'Duración'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>
          <div style={{ border: '1px solid var(--bg-surface-high)', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
            {historial.map((v, i) => {
              const entrada = new Date(v.entrada);
              const salida  = v.salida ? new Date(v.salida) : null;
              const minutos = salida ? Math.floor((salida - entrada) / 60000) : null;
              const dur = minutos !== null ? (minutos < 60 ? `${minutos}min` : `${Math.floor(minutos/60)}h ${minutos%60}min`) : '—';
              return (
                <div key={v.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px 90px',
                  padding: '12px 16px', gap: 12, alignItems: 'center',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  background: i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-input)',
                  transition: 'background 100ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-input)'}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-body)' }}>{v.nombre_visitante}</p>
                    {v.rut_visitante && <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{v.rut_visitante}</p>}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{v.destino}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{entrada.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{salida ? salida.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{dur}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && visitas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ width: 52, height: 52, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>👤</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Sin visitas registradas hoy</p>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Registra la entrada de visitantes al edificio</p>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setMostrarForm(true)} title="Registrar entrada" style={{
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
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Registrar entrada</div>
              <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>✕</button>
            </div>
            <form onSubmit={registrarEntrada} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Nombre del visitante</label>
                <input
                  style={INPUT_STYLE} placeholder="Juan Pérez" required
                  value={form.nombre_visitante} onChange={e => setForm(f => ({ ...f, nombre_visitante: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <RutInput value={form.rut_visitante} onChange={v => setForm(f => ({ ...f, rut_visitante: v }))} />
              {[
                ['destino', 'Depto / Oficina',   '201, Oficina 3…', true],
                ['motivo',  'Motivo (opcional)', 'Visita personal, delivery…', false],
              ].map(([key, label, placeholder, required]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label>
                  <input
                    style={INPUT_STYLE} placeholder={placeholder} required={required}
                    value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, height: 48, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={enviando} style={{ flex: 1, height: 48, background: 'var(--brand)', border: 'none', borderRadius: 8, color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{enviando ? '...' : 'Registrar entrada'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
