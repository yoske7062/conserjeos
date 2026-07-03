'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../../../lib/supabase';
import { useRealtimeRefetch } from '../../../lib/useRealtimeRefetch';

export default function EncomiendePage() {
  const [items, setItems]     = useState([]);
  const [tab, setTab]         = useState('pendientes'); // pendientes | entregadas
  const [loading, setLoading] = useState(true);
  const [eid, setEid]         = useState(null);

  const cargar = useCallback(async (edificioId) => {
    const supabase = getSupabase();
    const { data } = await supabase.from('encomiendas')
      .select('*')
      .eq('edificio_id', edificioId)
      .eq('entregada', tab === 'entregadas')
      .order(tab === 'pendientes' ? 'recibida_at' : 'entregada_at', { ascending: false })
      .limit(60);
    setItems(data ?? []);
    setLoading(false);
  }, [tab]);

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
  }, [tab, cargar]);

  useRealtimeRefetch('encomiendas', eid, () => cargar(eid));

  const pill = (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: active ? 600 : 400,
    background: active ? 'var(--brand)' : 'var(--bg-surface)',
    color: active ? 'var(--brand-text-on)' : 'var(--text-muted)',
    border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
    cursor: 'pointer', fontFamily: 'inherit',
  });

  function diffDias(desde) {
    const diff = Date.now() - new Date(desde).getTime();
    const dias = Math.floor(diff / 86400000);
    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    return `Hace ${dias} días`;
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, margin: '0 auto', width: '100%' }} className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Encomiendas</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Registro de paquetes y correspondencia</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button style={pill(tab === 'pendientes')} onClick={() => setTab('pendientes')}>Pendientes</button>
        <button style={pill(tab === 'entregadas')} onClick={() => setTab('entregadas')}>Entregadas</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px', padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span>Destinatario</span><span>Tipo</span><span>Recibida</span><span>{tab === 'entregadas' ? 'Entregada' : 'Antigüedad'}</span>
          </div>
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              {tab === 'pendientes' ? 'No hay encomiendas pendientes' : 'Sin registros de encomiendas entregadas'}
            </div>
          )}
          {items.map((item, i) => (
            <div key={item.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px',
              padding: '12px 18px', alignItems: 'center',
              borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
              fontSize: 13,
            }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)' }}>{item.destinatario}</p>
                {item.depto && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Depto {item.depto}</p>}
              </div>
              <span style={{ color: 'var(--text-body)', textTransform: 'capitalize' }}>{item.tipo ?? 'Paquete'}</span>
              <span style={{ color: 'var(--text-body)', fontSize: 12 }}>{new Date(item.recibida_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}</span>
              <span style={{ color: tab === 'pendientes' && diffDias(item.recibida_at).startsWith('Hace') ? 'var(--warning)' : 'var(--text-body)', fontSize: 12 }}>
                {tab === 'entregadas'
                  ? (item.entregada_at ? new Date(item.entregada_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : '—')
                  : diffDias(item.recibida_at)
                }
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
