'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '../../../lib/supabase';

const TIPO = {
  urgente:     { color: '#E5484D', label: 'Urgente',     icon: 'priority_high' },
  incidente:   { color: '#FF6B3D', label: 'Incidente',   icon: 'warning' },
  informativo: { color: '#3B9EFF', label: 'Informativo', icon: 'info' },
};

const FILTROS = [
  { key: 'todos',       label: 'Todos' },
  { key: 'urgente',     label: 'Urgentes' },
  { key: 'incidente',   label: 'Incidentes' },
  { key: 'informativo', label: 'Informativos' },
];

export default function NovedadesPage() {
  const [items, setItems]     = useState([]);
  const [filtro, setFiltro]   = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: perfil }   = await supabase.from('perfiles').select('edificio_id').eq('id', user.id).single();
      let q = supabase.from('novedades')
        .select('*,perfiles(nombre)')
        .eq('edificio_id', perfil.edificio_id)
        .order('created_at', { ascending: false })
        .limit(60);
      if (filtro !== 'todos') q = q.eq('tipo', filtro);
      const { data } = await q;
      setItems(data ?? []);
      setLoading(false);
    }
    setLoading(true);
    cargar();
  }, [filtro]);

  const pill = (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: active ? 600 : 400,
    background: active ? 'var(--brand)' : 'var(--bg-surface)',
    color: active ? 'var(--brand-text-on)' : 'var(--text-muted)',
    border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
    cursor: 'pointer', fontFamily: 'inherit',
  });

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, margin: '0 auto', width: '100%' }} className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Novedades</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Historial completo de novedades registradas</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {FILTROS.map(f => (
          <button key={f.key} style={pill(filtro === f.key)} onClick={() => setFiltro(f.key)}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: 14 }}>No hay novedades</div>
          )}
          {items.map(nov => {
            const t = TIPO[nov.tipo] || TIPO.informativo;
            return (
              <div key={nov.id} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '14px 18px 14px 22px', display: 'flex', gap: 14, alignItems: 'flex-start',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: t.color }} />
                <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: t.color, marginTop: 1 }}>{t.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: t.color, background: `${t.color}18`, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(nov.created_at).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {nov.perfiles?.nombre && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {nov.perfiles.nombre}</span>}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.55 }}>{nov.descripcion}</p>
                  {nov.foto_url && (
                    <a href={nov.foto_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--brand)', textDecoration: 'none' }}>
                      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 14 }}>photo</span>Ver foto adjunta
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
