import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeSync } from '../lib/useRealtimeSync';
import { enqueue } from '../lib/offlineQueue';
import { puedeCrearTareas } from '../lib/permisos';
import { clasificarError } from '../lib/errores';
import { state as estados } from '../lib/tokens';

const INPUT_STYLE = {
  width: '100%', height: 48, background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '0 12px', color: 'var(--text)', fontSize: 16,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms',
};

const PRIORIDAD = {
  alta:   { ...estados.incident, label: 'Alta' },
  normal: { ...estados.info,     label: 'Normal' },
  baja:   { color: 'var(--text-muted)', bg: 'var(--bg-surface-high)', border: 'var(--border)', icon: '–', label: 'Baja' },
};

function vencidaYa(vence_at) {
  return vence_at && new Date(vence_at) < new Date();
}

function TareaCard({ t, onCompletar }) {
  const p = PRIORIDAD[t.prioridad] || PRIORIDAD.normal;
  const vencida = !t.completada_at && vencidaYa(t.vence_at);

  return (
    <div style={{
      background: 'var(--bg-surface)', border: `1px solid ${vencida ? estados.emergency.border : 'var(--border)'}`,
      borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16,
      opacity: t.estado === 'completada' ? 0.6 : 1,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            background: p.bg, color: p.color, border: `1px solid ${p.border}`,
          }}><span>{p.icon}</span>{p.label}</span>
          {vencida && (
            <span style={{ fontSize: 11, fontWeight: 700, color: estados.emergency.color }}>{estados.emergency.icon} Vencida</span>
          )}
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: t.descripcion ? 4 : 0 }}>{t.titulo}</p>
        {t.descripcion && <p style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.5, marginBottom: 6 }}>{t.descripcion}</p>}
        {t.vence_at && !t.completada_at && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Vence: {new Date(t.vence_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
          </p>
        )}
        {t.completada_at && (
          <p style={{ fontSize: 12, color: estados.success.color }}>
            {estados.success.icon} Completada {new Date(t.completada_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
          </p>
        )}
      </div>
      {t.estado !== 'completada' && (
        <button onClick={() => onCompletar(t.id)} style={{
          flexShrink: 0, minHeight: 48, display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 16px', borderRadius: 8, background: 'var(--brand)', border: 'none',
          color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
        }}>✓ Completar</button>
      )}
    </div>
  );
}

export default function Tareas({ perfil }) {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pendientes');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', prioridad: 'normal', vence_at: '' });
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const esAdmin = puedeCrearTareas(perfil);

  const cargarTareas = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('tareas').select('*')
      .eq('edificio_id', perfil.edificio_id)
      .order('created_at', { ascending: false });
    setTareas(data ?? []);
    setLoading(false);
  }, [perfil.edificio_id]);

  useEffect(() => { cargarTareas(); }, [cargarTareas]);

  useRealtimeSync('tareas', perfil.edificio_id, {
    onInsert: (nuevo) => {
      setTareas(prev => [nuevo, ...prev.filter(t => t.id !== nuevo.id)]);
    },
    onUpdate: (actualizado) => {
      setTareas(prev => prev.map(t => t.id === actualizado.id ? actualizado : t));
    },
    onDelete: (borrado) => {
      setTareas(prev => prev.filter(t => t.id !== borrado.id));
    }
  });

  async function crearTarea(e) {
    e.preventDefault();
    if (!esAdmin || !form.titulo.trim()) return;

    const payload = {
      edificio_id: perfil.edificio_id, creada_por: perfil.id,
      titulo: form.titulo.trim(), descripcion: form.descripcion.trim() || null,
      prioridad: form.prioridad, vence_at: form.vence_at ? new Date(form.vence_at).toISOString() : null,
      estado: 'pendiente',
      created_at: new Date().toISOString()
    };

    if (!navigator.onLine) {
      const tempId = crypto.randomUUID();
      payload.id = tempId;
      enqueue({ table: 'tareas', op: 'insert', payload });
      setTareas(prev => [payload, ...prev]);
      setForm({ titulo: '', descripcion: '', prioridad: 'normal', vence_at: '' });
      setMostrarForm(false);
      return;
    }

    setEnviando(true);
    setErrorMsg('');
    const { error } = await supabase.from('tareas').insert(payload);
    if (error) {
      setErrorMsg(`No se pudo crear la tarea. ${clasificarError(error, 'tareas.crear').mensaje}`);
    } else {
      setForm({ titulo: '', descripcion: '', prioridad: 'normal', vence_at: '' });
      setMostrarForm(false); cargarTareas();
    }
    setEnviando(false);
  }

  async function completarTarea(id) {
    setErrorMsg('');
    const payload = { estado: 'completada', completada_at: new Date().toISOString(), completada_por: perfil.id };
    if (!navigator.onLine) {
      enqueue({ table: 'tareas', op: 'update', rowId: id, payload });
      setTareas(prev => prev.map(t => t.id === id ? { ...t, ...payload } : t));
      return;
    }
    const { error } = await supabase.from('tareas').update(payload).eq('id', id);
    if (error) setErrorMsg(`No se pudo marcar como completada. ${clasificarError(error, 'tareas.completar').mensaje}`);
    else cargarTareas();
  }

  const pendientes = tareas.filter(t => t.estado !== 'completada');
  const completadas = tareas.filter(t => t.estado === 'completada');
  const lista = tab === 'pendientes' ? pendientes : completadas;
  const vencidas = pendientes.filter(t => vencidaYa(t.vence_at)).length;

  return (
    <div style={{ padding: '22px 24px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(var(--brand-rgb),0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--brand)' }}>checklist</span>
            </div>
            <div style={{ fontSize: 23, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>Tareas</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {esAdmin ? 'Asigna tareas y revisa qué se ha cumplido' : 'Lo que el administrador te pidió hacer'}
          </p>
        </div>
        {esAdmin && (
          <button onClick={() => setMostrarForm(true)} style={{
            height: 48, padding: '0 20px', background: 'var(--brand)', border: 'none',
            borderRadius: 8, color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>+ Nueva tarea</button>
        )}
      </div>

      {vencidas > 0 && tab === 'pendientes' && (
        <p style={{ fontSize: 13, color: estados.emergency.color, marginBottom: 16, fontWeight: 600 }}>
          {estados.emergency.icon} Tienes {vencidas} tarea{vencidas !== 1 ? 's' : ''} vencida{vencidas !== 1 ? 's' : ''}
        </p>
      )}

      {errorMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--crit-bg)', borderLeft: '4px solid var(--crit-tx)',
          borderRadius: '0 8px 8px 0', padding: '12px 16px', marginBottom: 16,
        }}>
          <span style={{ fontSize: 12, color: 'var(--crit-tx)', fontWeight: 600 }}>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--bg-surface-high)' }}>
        {[['pendientes', `Pendientes (${pendientes.length})`], ['completadas', `Completadas (${completadas.length})`]].map(([id, label]) => (
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
          <div style={{ width: 52, height: 52, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>✓</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
            {tab === 'pendientes' ? 'Sin tareas pendientes' : 'Sin tareas completadas todavía'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lista.map(t => <TareaCard key={t.id} t={t} onCompletar={completarTarea} />)}
        </div>
      )}

      {/* Modal: nueva tarea (solo admin) */}
      {mostrarForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Nueva tarea</div>
              <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            <form onSubmit={crearTarea} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Qué hay que hacer</label>
                <input style={INPUT_STYLE} placeholder="Ej: revisar luces del estacionamiento" required autoFocus
                  value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Detalle (opcional)</label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Más contexto si hace falta…"
                  style={{ width: '100%', height: 80, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 16, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Prioridad</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    {Object.entries(PRIORIDAD).map(([id, p]) => (
                      <button key={id} type="button" onClick={() => setForm(f => ({ ...f, prioridad: id }))} style={{
                        minHeight: 40, padding: '6px 4px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        background: form.prioridad === id ? p.bg : 'transparent',
                        color: form.prioridad === id ? p.color : 'var(--text-muted)',
                        border: form.prioridad === id ? `1px solid ${p.border}` : '1px solid var(--border)',
                      }}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Vence (opcional)</label>
                  <input type="date" style={INPUT_STYLE} value={form.vence_at} onChange={e => setForm(f => ({ ...f, vence_at: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, height: 48, background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={enviando} style={{ flex: 1, height: 48, background: 'var(--brand)', border: 'none', borderRadius: 8, color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{enviando ? '...' : 'Crear tarea'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
