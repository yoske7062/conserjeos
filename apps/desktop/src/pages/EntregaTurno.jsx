import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { state as estados } from '../lib/tokens';
import { clasificarError } from '../lib/errores';

const INPUT_STYLE = {
  width: '100%', height: 48, background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '0 12px', color: 'var(--text)', fontSize: 16,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 120ms',
};

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', flex: 1, minWidth: 120 }}>
      <p style={{ fontSize: 26, fontWeight: 800, color: color ?? 'var(--text)', marginBottom: 4, letterSpacing: '-0.5px' }}>{value}</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
    </div>
  );
}

export default function EntregaTurno({ perfil, turno, onTurnoChange }) {
  const [resumenData, setResumenData] = useState({ urgente: 0, incidente: 0, informativo: 0, visitasActivas: 0, encomiendasPendientes: 0 });
  const [pendienteTexto, setPendienteTexto] = useState('');
  const [pendientesNuevos, setPendientesNuevos] = useState([]);
  const [iniciando, setIniciando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resumenModal, setResumenModal] = useState(null);

  const cargarResumen = useCallback(async () => {
    const [novedadesRes, visitasRes, encomiendasRes] = await Promise.all([
      turno
        ? supabase.from('novedades').select('tipo').eq('turno_id', turno.id)
        : Promise.resolve({ data: [] }),
      supabase.from('visitas').select('id', { count: 'exact', head: true }).eq('edificio_id', perfil.edificio_id).eq('activa', true),
      supabase.from('encomiendas').select('id', { count: 'exact', head: true }).eq('edificio_id', perfil.edificio_id).eq('entregada', false),
    ]);
    const counts = (novedadesRes.data ?? []).reduce((acc, n) => { acc[n.tipo] = (acc[n.tipo] ?? 0) + 1; return acc; }, {});
    setResumenData({
      urgente: counts.urgente ?? 0,
      incidente: counts.incidente ?? 0,
      informativo: counts.informativo ?? 0,
      visitasActivas: visitasRes.count ?? 0,
      encomiendasPendientes: encomiendasRes.count ?? 0,
    });
  }, [turno, perfil.edificio_id]);

  useEffect(() => { cargarResumen(); }, [cargarResumen]);

  async function iniciarTurno() {
    setIniciando(true);
    setErrorMsg('');
    const { data, error } = await supabase.from('turnos')
      .insert({ edificio_id: perfil.edificio_id, conserje_id: perfil.id })
      .select().single();
    if (error) setErrorMsg(`No se pudo iniciar el turno. ${clasificarError(error, 'turnos.iniciar').mensaje}`);
    else onTurnoChange(data);
    setIniciando(false);
  }

  function agregarPendiente() {
    if (!pendienteTexto.trim()) return;
    setPendientesNuevos(prev => [...prev, { texto: pendienteTexto.trim() }]);
    setPendienteTexto('');
  }

  function quitarPendiente(i) {
    setPendientesNuevos(prev => prev.filter((_, idx) => idx !== i));
  }

  async function cerrarTurno() {
    setCerrando(true);
    setErrorMsg('');

    // Verificar si es el primer turno cerrado del conserje antes de desactivar el turno actual
    const { count, error: countError } = await supabase
      .from('turnos')
      .select('id', { count: 'exact', head: true })
      .eq('conserje_id', perfil.id)
      .eq('activo', false);

    const esPrimerTurno = !countError && count === 0;

    const inicio = new Date(turno.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const fin    = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const resumen = [
      `Turno: ${inicio} → ${fin}`,
      `Total novedades: ${resumenData.urgente + resumenData.incidente + resumenData.informativo}`,
      resumenData.urgente     ? `• Urgentes: ${resumenData.urgente}`     : null,
      resumenData.incidente   ? `• Incidentes: ${resumenData.incidente}` : null,
      resumenData.informativo ? `• Informativos: ${resumenData.informativo}` : null,
      pendientesNuevos.length ? `Pendientes para el siguiente turno: ${pendientesNuevos.length}` : null,
    ].filter(Boolean).join('\n');
    const { error } = await supabase.from('turnos')
      .update({ fin: new Date().toISOString(), activo: false, resumen, pendientes: pendientesNuevos })
      .eq('id', turno.id);
    if (error) {
      setErrorMsg(`No se pudo cerrar el turno. ${clasificarError(error, 'turnos.cerrar').mensaje}`);
    } else {
      setResumenModal(resumen);
      setPendientesNuevos([]);
      onTurnoChange(null);

      if (esPrimerTurno) {
        const duracionMinutos = Math.floor((Date.now() - new Date(turno.inicio)) / 60000);
        supabase.from('eventos_analitica').insert({
          edificio_id: perfil.edificio_id,
          conserje_id: perfil.id,
          nombre_evento: '1er_turno_cerrado',
          metadata: {
            turno_id: turno.id,
            duracion_minutos: duracionMinutos
          }
        }).then(({ error: analyticError }) => {
          if (analyticError) {
            console.error('[Analytics] Error logging 1er_turno_cerrado event:', analyticError);
          }
        });
      }
    }
    setCerrando(false);
  }

  return (
    <div style={{ padding: '22px 24px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(var(--brand-rgb),0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--brand)' }}>schedule</span>
            </div>
            <div style={{ fontSize: 23, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>Entrega de Turno</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {turno
              ? `Turno activo desde ${new Date(turno.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} — cuando termines, cierra aquí y deja pendientes para el siguiente`
              : 'No tienes un turno activo'}
          </p>
        </div>
        {turno ? (
          <button onClick={cerrarTurno} disabled={cerrando} style={{
            height: 48, padding: '0 20px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)', fontSize: 16, fontWeight: 500, cursor: 'pointer',
          }}>{cerrando ? '...' : 'Cerrar turno'}</button>
        ) : (
          <button onClick={iniciarTurno} disabled={iniciando} style={{
            height: 48, padding: '0 20px', background: 'var(--brand)', border: 'none',
            borderRadius: 'var(--radius)', color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          }}>{iniciando ? '...' : '⏱ Iniciar turno'}</button>
        )}
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

      {!turno ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
          <div style={{ width: 52, height: 52, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>⏱</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Sin turno activo</p>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Inicia tu turno para empezar a registrar novedades, visitas y encomiendas</p>
        </div>
      ) : (
        <>
          {/* Resumen visual */}
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Resumen del turno</p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            <StatCard label="Urgentes" value={resumenData.urgente} color={estados.emergency.color} />
            <StatCard label="Incidentes" value={resumenData.incidente} color={estados.incident.color} />
            <StatCard label="Informativos" value={resumenData.informativo} color={estados.info.color} />
            <StatCard label="Visitas activas" value={resumenData.visitasActivas} />
            <StatCard label="Encomiendas pendientes" value={resumenData.encomiendasPendientes} />
          </div>

          {/* Pendientes para el siguiente turno */}
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Pendientes para el siguiente turno
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              style={INPUT_STYLE} placeholder="Ej: falta avisar a depto 304 por encomienda dañada"
              value={pendienteTexto} onChange={e => setPendienteTexto(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarPendiente(); } }}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button onClick={agregarPendiente} type="button" style={{
              height: 48, padding: '0 20px', background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text)', fontSize: 16, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            }}>Agregar</button>
          </div>

          {pendientesNuevos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 28 }}>Sin pendientes agregados todavía.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {pendientesNuevos.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px',
                }}>
                  <span style={{ fontSize: 14, color: 'var(--text-body)' }}>{p.texto}</span>
                  <button onClick={() => quitarPendiente(i)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, flexShrink: 0,
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal: Resumen turno cerrado */}
      {resumenModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 380, boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
            <div style={{ padding: '22px 22px 14px' }}>
              <div style={{ width: 44, height: 44, background: estados.success.bg, border: `1px solid ${estados.success.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 20, color: estados.success.color }}>{estados.success.icon}</div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Turno cerrado</h2>
            </div>
            <div style={{ padding: '0 22px 22px' }}>
              <pre style={{ fontSize: 14, color: 'var(--text-body)', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', fontFamily: 'inherit', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{resumenModal}</pre>
              <button onClick={() => setResumenModal(null)} style={{ width: '100%', height: 48, marginTop: 12, background: 'var(--brand)', border: 'none', borderRadius: 8, color: 'var(--brand-text-on)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Aceptar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
