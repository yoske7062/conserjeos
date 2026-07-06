'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '../../../lib/supabase';

function MetricCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color }}>{icon}</span>
        </div>
      </div>
      <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value ?? '—'}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

const TIPO_NOVEDAD_LABEL = { urgente: 'Urgentes', incidente: 'Incidentes', informativo: 'Informativas' };
const TIPO_NOVEDAD_COLOR = { urgente: '#E5484D', incidente: '#FF6B3D', informativo: '#3B9EFF' };

function formatearDuracion(ms) {
  if (ms == null) return '—';
  const horas = ms / 1000 / 60 / 60;
  if (horas < 1) return `${Math.round(ms / 1000 / 60)} min`;
  if (horas < 24) return `${horas.toFixed(1)} h`;
  return `${(horas / 24).toFixed(1)} días`;
}

export default function MetricasPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: p } = await supabase.from('perfiles').select('edificio_id').eq('id', user.id).single();
      const eid = p.edificio_id;
      const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [novedadesRes, visitasRes, encomiendasRes, tareasRes] = await Promise.all([
        supabase.from('novedades').select('tipo').eq('edificio_id', eid).gte('created_at', hace7dias),
        supabase.from('visitas').select('id', { count: 'exact', head: true }).eq('edificio_id', eid).gte('entrada', hace7dias),
        supabase.from('encomiendas').select('recibida_at,entregada_at,entregada').eq('edificio_id', eid).gte('recibida_at', hace7dias),
        supabase.from('tareas').select('estado,vence_at,completada_at').eq('edificio_id', eid),
      ]);

      const porTipo = (novedadesRes.data ?? []).reduce((acc, n) => {
        acc[n.tipo] = (acc[n.tipo] ?? 0) + 1;
        return acc;
      }, {});

      const entregadas = (encomiendasRes.data ?? []).filter(e => e.entregada && e.entregada_at);
      const tiempoPromedioMs = entregadas.length
        ? entregadas.reduce((acc, e) => acc + (new Date(e.entregada_at) - new Date(e.recibida_at)), 0) / entregadas.length
        : null;

      const tareas = tareasRes.data ?? [];
      const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
      const tareasVencidas = tareas.filter(t => !t.completada_at && t.vence_at && new Date(t.vence_at) < new Date()).length;

      setData({
        novedadesTotal: (novedadesRes.data ?? []).length,
        porTipo,
        visitasSemana: visitasRes.count ?? 0,
        encomiendasRecibidasSemana: (encomiendasRes.data ?? []).length,
        tiempoPromedioMs,
        tareasTotal: tareas.length,
        tareasCompletadas,
        tareasVencidas,
        pctCompletadas: tareas.length ? Math.round((tareasCompletadas / tareas.length) * 100) : null,
      });
      setLoading(false);
    }
    cargar();
  }, []);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto', width: '100%' }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Métricas del edificio</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Últimos 7 días</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        <MetricCard icon="group" label="Visitas registradas" value={data.visitasSemana} color="#2FBF71" sub="últimos 7 días" />
        <MetricCard icon="inventory_2" label="Encomiendas recibidas" value={data.encomiendasRecibidasSemana} color="#F5A524" sub="últimos 7 días" />
        <MetricCard icon="schedule" label="Tiempo hasta el retiro" value={formatearDuracion(data.tiempoPromedioMs)} color="#3B9EFF" sub="promedio, encomiendas entregadas" />
        <MetricCard icon="checklist" label="Tareas completadas" value={data.pctCompletadas != null ? `${data.pctCompletadas}%` : '—'} color="var(--brand)" sub={`${data.tareasVencidas} vencida${data.tareasVencidas !== 1 ? 's' : ''}`} />
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Novedades por tipo (últimos 7 días)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {['urgente', 'incidente', 'informativo'].map(tipo => (
            <div key={tipo} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: TIPO_NOVEDAD_COLOR[tipo] }}>{TIPO_NOVEDAD_LABEL[tipo]}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginTop: 6 }}>{data.porTipo[tipo] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
