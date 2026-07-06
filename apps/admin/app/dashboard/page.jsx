'use client';
import { useState, useEffect, useRef } from 'react';
import { getSupabase } from '../../lib/supabase';
import DescargaCard from '../../components/DescargaCard';

function StatCard({ icon, label, value, color, sub }) {
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

const TIPO = {
  urgente:     { color: '#E5484D', icon: '◆', label: 'Urgente' },
  incidente:   { color: '#FF6B3D', icon: '!',  label: 'Incidente' },
  informativo: { color: '#3B9EFF', icon: 'ℹ',  label: 'Informativo' },
};

export default function DashboardPage() {
  const [stats, setStats]       = useState(null);
  const [novedades, setNovedades] = useState([]);
  const [turnos, setTurnos]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const debounceRef             = useRef(null);

  useEffect(() => {
    let channel;
    const supabase = getSupabase();

    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil }   = await supabase.from('perfiles').select('edificio_id').eq('id', user.id).single();
      const eid = perfil.edificio_id;
      const hoy = new Date(); hoy.setHours(0,0,0,0);

      const [v, e, t, n, tu] = await Promise.all([
        supabase.from('visitas').select('id', { count: 'exact' }).eq('edificio_id', eid).eq('activa', true),
        supabase.from('encomiendas').select('id', { count: 'exact' }).eq('edificio_id', eid).eq('entregada', false),
        supabase.from('tareas').select('id', { count: 'exact' }).eq('edificio_id', eid).eq('estado', 'pendiente'),
        supabase.from('novedades').select('id,tipo,descripcion,created_at,perfiles(nombre)').eq('edificio_id', eid).order('created_at', { ascending: false }).limit(8),
        supabase.from('turnos').select('id,inicio,perfiles(nombre)').eq('edificio_id', eid).eq('activo', true),
      ]);

      setStats({ visitas: v.count ?? 0, encomiendas: e.count ?? 0, tareas: t.count ?? 0 });
      setNovedades(n.data ?? []);
      setTurnos(tu.data ?? []);
      setLoading(false);

      // Debounce: si llega una ráfaga de INSERTs (ej. sync offline), solo ejecuta
      // un refetch después de que la ráfaga se calme, evitando race conditions.
      async function refetchDashboard() {
        const [latestNovedades, vCount, eCount, tCount] = await Promise.all([
          supabase.from('novedades').select('id,tipo,descripcion,created_at,perfiles(nombre)')
            .eq('edificio_id', eid).order('created_at', { ascending: false }).limit(8),
          supabase.from('visitas').select('id', { count: 'exact' }).eq('edificio_id', eid).eq('activa', true),
          supabase.from('encomiendas').select('id', { count: 'exact' }).eq('edificio_id', eid).eq('entregada', false),
          supabase.from('tareas').select('id', { count: 'exact' }).eq('edificio_id', eid).eq('estado', 'pendiente'),
        ]);
        setNovedades(latestNovedades.data ?? []);
        setStats({ visitas: vCount.count ?? 0, encomiendas: eCount.count ?? 0, tareas: tCount.count ?? 0 });
      }

      channel = supabase
        .channel(`dashboard-novedades-${eid}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'novedades', filter: `edificio_id=eq.${eid}` },
          () => {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(refetchDashboard, 400);
          }
        )
        .subscribe();
    }
    cargar();

    return () => {
      clearTimeout(debounceRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto', width: '100%' }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Resumen del edificio</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <DescargaCard />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        <StatCard icon="group"       label="Visitas en el edificio" value={stats.visitas}     color="#2FBF71" sub="personas ahora mismo" />
        <StatCard icon="inventory_2" label="Encomiendas pendientes" value={stats.encomiendas} color="#F5A524" sub="sin retirar" />
        <StatCard icon="checklist"   label="Tareas pendientes"      value={stats.tareas}      color="var(--brand)" sub="por completar" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Novedades recientes */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Novedades recientes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {novedades.length === 0 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Sin novedades registradas</p>
              </div>
            )}
            {novedades.map(nov => {
              const t = TIPO[nov.tipo] || TIPO.informativo;
              return (
                <div key={nov.id} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10,
                  padding: '12px 16px 12px 20px', display: 'flex', gap: 14, alignItems: 'flex-start',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: t.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.color, background: `${t.color}18`, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {t.icon} {t.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(nov.created_at).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nov.descripcion}</p>
                    {nov.perfiles?.nombre && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{nov.perfiles.nombre}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Turnos activos */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Turnos activos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {turnos.length === 0 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Sin turnos activos</p>
              </div>
            )}
            {turnos.map(tu => (
              <div key={tu.id} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0, boxShadow: '0 0 6px #2FBF71' }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{tu.perfiles?.nombre ?? 'Conserje'}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Desde {new Date(tu.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
