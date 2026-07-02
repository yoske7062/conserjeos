'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../../../lib/supabase';
import { useRealtimeRefetch } from '../../../lib/useRealtimeRefetch';

export default function VisitasPage() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha]     = useState(new Date().toISOString().slice(0, 10));
  const [solo, setSolo]       = useState('todas'); // 'todas' | 'activas'
  const [eid, setEid]         = useState(null);

  const cargar = useCallback(async (edificioId) => {
    const supabase = getSupabase();
    let q = supabase.from('visitas')
      .select('*')
      .eq('edificio_id', edificioId)
      .gte('entrada', `${fecha}T00:00:00`)
      .lte('entrada', `${fecha}T23:59:59`)
      .order('entrada', { ascending: false });
    if (solo === 'activas') q = q.eq('activa', true);
    const { data } = await q;
    setVisitas(data ?? []);
    setLoading(false);
  }, [fecha, solo]);

  useEffect(() => {
    setLoading(true);
    async function init() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil }   = await supabase.from('perfiles').select('edificio_id').eq('id', user.id).single();
      setEid(perfil.edificio_id);
      cargar(perfil.edificio_id);
    }
    init();
  }, [fecha, solo, cargar]);

  useRealtimeRefetch('visitas', eid, () => cargar(eid));

  const pill = (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: active ? 600 : 400,
    background: active ? 'var(--brand)' : 'var(--bg-surface)',
    color: active ? 'var(--brand-text-on)' : 'var(--text-muted)',
    border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
    cursor: 'pointer', fontFamily: 'inherit',
  });

  const activas = visitas.filter(v => v.activa).length;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, margin: '0 auto', width: '100%' }} className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Visitas</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Registro de entradas y salidas</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{
          height: 36, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8,
          padding: '0 12px', color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
        }} />
        <button style={pill(solo === 'todas')}   onClick={() => setSolo('todas')}>Todas</button>
        <button style={pill(solo === 'activas')} onClick={() => setSolo('activas')}>Solo activas</button>
        {!loading && <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 4 }}>{visitas.length} visita(s) · {activas} en el edificio</span>}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px 80px', padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span>Visitante</span><span>Visita a</span><span>Entrada</span><span>Salida</span><span>Estado</span>
          </div>
          {visitas.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: 14 }}>Sin visitas para esta fecha</div>
          )}
          {visitas.map((v, i) => (
            <div key={v.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px 80px',
              padding: '12px 18px', alignItems: 'center',
              borderBottom: i < visitas.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: 13,
            }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)' }}>{v.nombre_visitante}</p>
                {v.rut_visitante && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{v.rut_visitante}</p>}
              </div>
              <span style={{ color: 'var(--text-body)' }}>{v.destino ?? '—'}</span>
              <span style={{ color: 'var(--text-body)' }}>{new Date(v.entrada).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
              <span style={{ color: 'var(--text-body)' }}>{v.salida ? new Date(v.salida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
                color: v.activa ? 'var(--success)' : 'var(--text-muted)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: v.activa ? 'var(--success)' : 'var(--border)', display: 'inline-block' }} />
                {v.activa ? 'Dentro' : 'Salió'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
