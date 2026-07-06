import { getSupabaseServiceRole } from '../lib/supabase';
import LogoutButton from './LogoutButton';

// Datos en vivo, no estáticos — nunca prerenderizar esto en build time.
export const dynamic = 'force-dynamic';

function MetricCard({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 10 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

// Server component — corre solo en el servidor, nunca expone la service role
// key al navegador. middleware.js ya garantizó sesión + email en la
// allowlist antes de que esto renderice.
export default async function MonitorPage() {
  const service = getSupabaseServiceRole();
  const hace7dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [edificiosRes, edificiosActivosRes, novedadesRes, visitasRes, encomiendasRes, tareasRes] = await Promise.all([
    service.from('edificios').select('id,nombre,comuna,plan,activo,created_at').order('created_at', { ascending: false }),
    service.from('edificios').select('id', { count: 'exact', head: true }).eq('activo', true),
    service.from('novedades').select('id', { count: 'exact', head: true }).gte('created_at', hace7dias),
    service.from('visitas').select('id', { count: 'exact', head: true }).gte('entrada', hace7dias),
    service.from('encomiendas').select('id', { count: 'exact', head: true }).gte('recibida_at', hace7dias),
    service.from('tareas').select('id', { count: 'exact', head: true }),
  ]);

  const edificios = edificiosRes.data ?? [];

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Monitor Portia</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Todos los edificios — actividad últimos 7 días</p>
        </div>
        <LogoutButton />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 40 }}>
        <MetricCard label="Edificios activos" value={edificiosActivosRes.count ?? 0} sub={`${edificios.length} totales`} />
        <MetricCard label="Novedades" value={novedadesRes.count ?? 0} sub="últimos 7 días, todos los edificios" />
        <MetricCard label="Visitas" value={visitasRes.count ?? 0} sub="últimos 7 días, todos los edificios" />
        <MetricCard label="Encomiendas" value={encomiendasRes.count ?? 0} sub="últimos 7 días, todos los edificios" />
        <MetricCard label="Tareas" value={tareasRes.count ?? 0} sub="totales, todos los edificios" />
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Edificios</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {edificios.length === 0 && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Sin edificios registrados</p>
            </div>
          )}
          {edificios.map(e => (
            <div key={e.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{e.nombre}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{e.comuna || 'sin comuna'} · plan {e.plan || 'sin definir'}</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                background: e.activo ? 'rgba(26,122,66,0.12)' : 'rgba(196,43,43,0.12)',
                color: e.activo ? '#1A7A42' : 'var(--crit-tx)',
              }}>{e.activo ? 'Activo' : 'Inactivo'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
