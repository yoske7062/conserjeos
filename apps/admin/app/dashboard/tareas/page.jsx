'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '../../../lib/supabase';

const PRIORIDADES = ['baja', 'normal', 'alta', 'urgente'];
const P_COLOR = { baja: '#636363', normal: '#3B9EFF', alta: '#F5A524', urgente: '#E5484D' };
const ESTADOS = ['pendiente', 'en_progreso', 'completada'];
const E_STYLE = {
  pendiente:   { color: '#A8A8A8', bg: 'rgba(168,168,168,0.1)', label: 'Pendiente'   },
  en_progreso: { color: '#3B9EFF', bg: 'rgba(59,158,255,0.1)',  label: 'En progreso' },
  completada:  { color: '#2FBF71', bg: 'rgba(47,191,113,0.1)',  label: 'Completada'  },
};

const FORM_INIT = { titulo: '', descripcion: '', prioridad: 'normal', asignado_a: '', fecha_limite: '' };

export default function TareasPage() {
  const [tareas, setTareas]     = useState([]);
  const [conserjes, setConserjes] = useState([]);
  const [filtroE, setFiltroE]   = useState('pendiente');
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(FORM_INIT);
  const [guardando, setGuardando] = useState(false);
  const [eid, setEid]           = useState(null);

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil }   = await supabase.from('perfiles').select('edificio_id').eq('id', user.id).single();
      setEid(perfil.edificio_id);
      const { data: cons } = await supabase.from('perfiles').select('id,nombre').eq('edificio_id', perfil.edificio_id).eq('rol', 'conserje').eq('activo', true);
      setConserjes(cons ?? []);
    }
    init();
  }, []);

  useEffect(() => {
    if (!eid) return;
    async function cargar() {
      setLoading(true);
      const supabase = getSupabase();
      const { data } = await supabase.from('tareas')
        .select('*,perfiles!asignado_a(nombre)')
        .eq('edificio_id', eid)
        .eq('estado', filtroE)
        .order('created_at', { ascending: false })
        .limit(50);
      setTareas(data ?? []);
      setLoading(false);
    }
    cargar();
  }, [eid, filtroE]);

  async function crearTarea(e) {
    e.preventDefault();
    setGuardando(true);
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('tareas').insert({
      edificio_id:  eid,
      titulo:       form.titulo,
      descripcion:  form.descripcion || null,
      prioridad:    form.prioridad,
      asignado_a:   form.asignado_a || null,
      fecha_limite: form.fecha_limite || null,
      estado:       'pendiente',
      creado_por:   user.id,
    });
    setModal(false);
    setForm(FORM_INIT);
    setGuardando(false);
    if (filtroE === 'pendiente') {
      setLoading(true);
      const { data } = await supabase.from('tareas').select('*,perfiles!asignado_a(nombre)').eq('edificio_id', eid).eq('estado', 'pendiente').order('created_at', { ascending: false }).limit(50);
      setTareas(data ?? []);
      setLoading(false);
    }
  }

  async function cambiarEstado(id, estado) {
    const supabase = getSupabase();
    await supabase.from('tareas').update({ estado }).eq('id', id);
    setTareas(prev => prev.filter(t => t.id !== id));
  }

  const pill = (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: active ? 600 : 400,
    background: active ? 'var(--brand)' : 'var(--bg-surface)',
    color: active ? 'var(--brand-text-on)' : 'var(--text-muted)',
    border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
    cursor: 'pointer', fontFamily: 'inherit',
  });
  const inputSt = { width: '100%', height: 44, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none' };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, margin: '0 auto', width: '100%' }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Tareas</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Crear y asignar tareas a los conserjes</p>
        </div>
        <button onClick={() => setModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 18px',
          background: 'var(--brand)', border: 'none', borderRadius: 10,
          color: 'var(--brand-text-on)', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18 }}>add</span>
          Nueva tarea
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {ESTADOS.map(e => <button key={e} style={pill(filtroE === e)} onClick={() => setFiltroE(e)}>{E_STYLE[e].label}</button>)}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tareas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 14 }}>No hay tareas {E_STYLE[filtroE].label.toLowerCase()}</div>
          )}
          {tareas.map(t => (
            <div key={t.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P_COLOR[t.prioridad], background: `${P_COLOR[t.prioridad]}18`, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.prioridad}</span>
                  {t.fecha_limite && (
                    <span style={{ fontSize: 12, color: new Date(t.fecha_limite) < new Date() ? 'var(--error)' : 'var(--text-muted)' }}>
                      Vence {new Date(t.fecha_limite).toLocaleDateString('es-CL')}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{t.titulo}</p>
                {t.descripcion && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.descripcion}</p>}
                {t.perfiles?.nombre && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>person</span>
                    {t.perfiles.nombre}
                  </p>
                )}
              </div>
              {filtroE !== 'completada' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  {filtroE === 'pendiente' && (
                    <button onClick={() => cambiarEstado(t.id, 'en_progreso')} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, background: 'rgba(59,158,255,0.1)', border: '1px solid rgba(59,158,255,0.2)', color: '#3B9EFF', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                      Iniciar
                    </button>
                  )}
                  <button onClick={() => cambiarEstado(t.id, 'completada')} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, background: 'rgba(47,191,113,0.1)', border: '1px solid rgba(47,191,113,0.2)', color: '#2FBF71', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    Completar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px', width: '100%', maxWidth: 480 }} className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Nueva tarea</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'Material Symbols Outlined', fontSize: 22 }}>close</button>
            </div>
            <form onSubmit={crearTarea} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Título *</label>
                <input style={inputSt} placeholder="Ej: Revisar sala de máquinas" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Descripción</label>
                <textarea style={{ ...inputSt, height: 80, padding: '10px 12px', resize: 'vertical' }} placeholder="Instrucciones adicionales…" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Prioridad</label>
                  <select style={{ ...inputSt, cursor: 'pointer' }} value={form.prioridad} onChange={e => setForm(p => ({ ...p, prioridad: e.target.value }))}>
                    {PRIORIDADES.map(p => <option key={p} value={p} style={{ background: 'var(--bg-surface)', textTransform: 'capitalize' }}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Asignar a</label>
                  <select style={{ ...inputSt, cursor: 'pointer' }} value={form.asignado_a} onChange={e => setForm(p => ({ ...p, asignado_a: e.target.value }))}>
                    <option value="" style={{ background: 'var(--bg-surface)' }}>Sin asignar</option>
                    {conserjes.map(c => <option key={c.id} value={c.id} style={{ background: 'var(--bg-surface)' }}>{c.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Fecha límite</label>
                <input type="date" style={{ ...inputSt, cursor: 'pointer' }} value={form.fecha_limite} onChange={e => setForm(p => ({ ...p, fecha_limite: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setModal(false)} style={{ flex: 1, height: 44, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button type="submit" disabled={guardando} style={{ flex: 1, height: 44, background: 'var(--brand)', border: 'none', borderRadius: 10, color: 'var(--brand-text-on)', fontSize: 14, fontWeight: 700, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {guardando ? 'Creando…' : 'Crear tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
