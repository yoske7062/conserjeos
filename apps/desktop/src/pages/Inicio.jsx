import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function StatCard({ label, value, delta, deltaType }) {
  const [hov, setHov] = useState(false);
  const deltaColor = deltaType === 'pos' ? 'var(--brand)' : deltaType === 'neg' ? 'var(--crit-tx)' : 'var(--text-muted)';
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-surface)', border: `1px solid ${hov ? 'rgba(var(--brand-rgb),.28)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', padding: '15px 17px',
        transition: 'border-color .14s, transform .14s',
        transform: hov ? 'translateY(-1.5px)' : 'none',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', margin: '5px 0 3px', letterSpacing: '-.5px', lineHeight: 1 }}>{value}</div>
      {delta && <div style={{ fontSize: 11, fontWeight: 600, color: deltaColor }}>{delta}</div>}
    </div>
  );
}

function ModuloRow({ icon, accentBg, accentColor, titulo, subtitulo, subtituloColor, badges, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
        minHeight: 68, padding: '14px 16px', borderRadius: 'var(--radius)',
        background: 'var(--bg-surface)', border: `1px solid ${hov ? 'var(--brand)' : 'var(--border)'}`,
        cursor: 'pointer', transition: 'border-color .12s, background .12s',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
        background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: accentColor }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{titulo}</p>
        {badges ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{badges}</div>
        ) : (
          <p style={{ fontSize: 12, color: subtituloColor ?? 'var(--text-muted)', fontWeight: subtituloColor ? 600 : 400 }}>{subtitulo}</p>
        )}
      </div>
      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 20, color: 'var(--text-muted)', flexShrink: 0 }}>chevron_right</span>
    </button>
  );
}

// Tarjeta grande para los 4 módulos de uso diario: harto espacio para tocar,
// color propio por módulo para reconocerlo de un vistazo sin tener que leer.
function ModuloTile({ icon, accentBg, accentColor, accentBorder, titulo, subtitulo, subtituloColor, badges, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        alignItems: 'flex-start', textAlign: 'left', minHeight: 140,
        padding: '20px 22px', borderRadius: 18,
        background: 'var(--bg-surface)', border: `1.5px solid ${hov ? accentBorder : 'var(--border)'}`,
        cursor: 'pointer', transition: 'border-color .14s, transform .14s, box-shadow .14s',
        boxShadow: hov ? '0 10px 28px rgba(0,0,0,0.28)' : 'var(--shadow)',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}
    >
      <div style={{
        width: 54, height: 54, borderRadius: 14, flexShrink: 0,
        background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 28, color: accentColor }}>{icon}</span>
      </div>
      <div>
        <p style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', marginBottom: 5, letterSpacing: '-0.3px' }}>{titulo}</p>
        {badges ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{badges}</div>
        ) : (
          <p style={{ fontSize: 13.5, color: subtituloColor ?? 'var(--text-muted)', fontWeight: subtituloColor ? 700 : 500 }}>{subtitulo}</p>
        )}
      </div>
    </button>
  );
}

function NarrLine({ tipo, children }) {
  const styles = {
    urgente:     { bg: 'var(--crit-bg)',  border: 'var(--crit-tx)',  dot: 'var(--crit-tx)'  },
    incidente:   { bg: 'var(--warn-bg)',  border: 'var(--warn-tx)',  dot: 'var(--warn-tx)'  },
    ok:          { bg: 'var(--ok-bg)',    border: 'var(--ok-tx)',    dot: 'var(--ok-tx)'    },
    info:        { bg: 'rgba(var(--brand-rgb),.06)', border: 'var(--brand)', dot: 'var(--brand)' },
  };
  const s = styles[tipo] ?? styles.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, lineHeight: 1.45,
      padding: '7px 10px', borderLeft: `3px solid ${s.border}`, borderRadius: '0 7px 7px 0',
      background: s.bg, color: 'var(--text)',
    }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0, marginTop: 4 }} />
      <span>{children}</span>
    </div>
  );
}

function Badge({ texto, color, bg, border, onClick }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 28,
        padding: '2px 9px', borderRadius: 99, background: bg, border: `1px solid ${border}`,
        color, fontSize: 11, fontWeight: 700, cursor: 'pointer',
      }}
    >{texto}</button>
  );
}

function duracionTurno(inicio) {
  if (!inicio) return '—';
  const mins = Math.floor((Date.now() - new Date(inicio)) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Inicio({ perfil, turno, navegarA }) {
  const [resumen, setResumen] = useState({
    urgente: 0, incidente: 0, informativo: 0,
    visitasActivas: 0, encomiendasPendientes: 0,
    tareasPendientes: 0, tareasVencidas: 0,
  });

  useEffect(() => { cargarResumen(); }, [turno]);

  async function cargarResumen() {
    const [novedadesRes, visitasRes, encomiendasRes, tareasRes] = await Promise.all([
      turno
        ? supabase.from('novedades').select('tipo').eq('turno_id', turno.id)
        : Promise.resolve({ data: [] }),
      supabase.from('visitas').select('id', { count: 'exact', head: true }).eq('edificio_id', perfil.edificio_id).eq('activa', true),
      supabase.from('encomiendas').select('id', { count: 'exact', head: true }).eq('edificio_id', perfil.edificio_id).eq('entregada', false),
      supabase.from('tareas').select('vence_at').eq('edificio_id', perfil.edificio_id).eq('estado', 'pendiente'),
    ]);
    const counts = (novedadesRes.data ?? []).reduce((acc, n) => { acc[n.tipo] = (acc[n.tipo] ?? 0) + 1; return acc; }, {});
    const tareasPendientes = tareasRes.data ?? [];
    const ahora = new Date();
    setResumen({
      urgente: counts.urgente ?? 0,
      incidente: counts.incidente ?? 0,
      informativo: counts.informativo ?? 0,
      visitasActivas: visitasRes.count ?? 0,
      encomiendasPendientes: encomiendasRes.count ?? 0,
      tareasPendientes: tareasPendientes.length,
      tareasVencidas: tareasPendientes.filter(t => t.vence_at && new Date(t.vence_at) < ahora).length,
    });
  }

  const nombre = (perfil?.nombre || 'Conserje').split(' ')[0];
  const totalNovedades = resumen.urgente + resumen.incidente + resumen.informativo;

  const novedadBadges = [];
  if (resumen.urgente > 0) novedadBadges.push(
    <Badge key="u" texto={`${resumen.urgente} urgente${resumen.urgente !== 1 ? 's' : ''}`}
      color="var(--crit-tx)" bg="var(--crit-bg)" border="var(--crit-tx)"
      onClick={() => navegarA('novedades', 'urgente')} />
  );
  if (resumen.incidente > 0) novedadBadges.push(
    <Badge key="i" texto={`${resumen.incidente} incidente${resumen.incidente !== 1 ? 's' : ''}`}
      color="var(--warn-tx)" bg="var(--warn-bg)" border="var(--warn-tx)"
      onClick={() => navegarA('novedades', 'incidente')} />
  );
  if (resumen.informativo > 0) novedadBadges.push(
    <Badge key="n" texto={`${resumen.informativo} informativo${resumen.informativo !== 1 ? 's' : ''}`}
      color="var(--brand)" bg="rgba(var(--brand-rgb),.08)" border="rgba(var(--brand-rgb),.25)"
      onClick={() => navegarA('novedades', 'informativo')} />
  );

  return (
    <div style={{ padding: '22px 24px 28px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-.5px', color: 'var(--text)' }}>
            Hola, {nombre}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginTop: 3 }}>
            {turno
              ? `Turno activo desde las ${new Date(turno.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
              : 'Sin turno activo'}
          </div>
        </div>
        {turno ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700,
            background: 'var(--ok-bg)', color: 'var(--ok-tx)',
            padding: '4px 12px', borderRadius: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok-tx)' }} />
            En curso
          </div>
        ) : (
          <button
            onClick={() => navegarA('turno')}
            style={{
              padding: '7px 16px', background: 'var(--brand)', border: 'none', borderRadius: 9,
              color: 'var(--brand-text-on)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            }}
          >Iniciar turno</button>
        )}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 11, marginBottom: 16 }}>
        <StatCard
          label="Turno"
          value={turno ? duracionTurno(turno.inicio) : '—'}
          delta={turno ? 'En curso' : 'Sin turno'}
          deltaType={turno ? 'pos' : 'neu'}
        />
        <StatCard
          label="Novedades"
          value={totalNovedades}
          delta={resumen.urgente > 0 ? `${resumen.urgente} urgente${resumen.urgente !== 1 ? 's' : ''}` : 'Sin urgentes'}
          deltaType={resumen.urgente > 0 ? 'neg' : 'neu'}
        />
        <StatCard
          label="Visitas activas"
          value={resumen.visitasActivas}
          delta={resumen.visitasActivas > 0 ? 'En el edificio' : 'Nadie adentro'}
          deltaType={resumen.visitasActivas > 0 ? 'pos' : 'neu'}
        />
        <StatCard
          label="Encomiendas pend."
          value={resumen.encomiendasPendientes}
          delta={resumen.encomiendasPendientes > 0 ? 'Sin retirar' : 'Al día'}
          deltaType={resumen.encomiendasPendientes > 0 ? 'neg' : 'neu'}
        />
      </div>

      {/* Narr: alertas activas */}
      {(resumen.urgente > 0 || resumen.encomiendasPendientes > 2 || resumen.tareasVencidas > 0) && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '13px 15px', marginBottom: 16,
          boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {resumen.urgente > 0 && (
            <NarrLine tipo="urgente">
              <strong>{resumen.urgente} novedad{resumen.urgente !== 1 ? 'es' : ''} urgente{resumen.urgente !== 1 ? 's' : ''}</strong> — revisa el módulo de Novedades.
            </NarrLine>
          )}
          {resumen.tareasVencidas > 0 && (
            <NarrLine tipo="incidente">
              <strong>{resumen.tareasVencidas} tarea{resumen.tareasVencidas !== 1 ? 's' : ''} vencida{resumen.tareasVencidas !== 1 ? 's' : ''}</strong> — requieren atención.
            </NarrLine>
          )}
          {resumen.encomiendasPendientes > 2 && (
            <NarrLine tipo="info">
              <strong>{resumen.encomiendasPendientes} encomiendas</strong> esperando retiro.
            </NarrLine>
          )}
        </div>
      )}

      {/* Módulos principales — tarjetas grandes, las usa todo el turno */}
      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
        Tu día
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <ModuloTile
          icon="group"
          accentBg="rgba(var(--brand-rgb),.14)" accentColor="var(--brand)" accentBorder="var(--brand)"
          titulo="Visitas"
          subtitulo={resumen.visitasActivas > 0 ? `${resumen.visitasActivas} persona${resumen.visitasActivas !== 1 ? 's' : ''} en el edificio ahora` : 'Sin visitas activas'}
          subtituloColor={resumen.visitasActivas > 0 ? 'var(--brand)' : null}
          onClick={() => navegarA('visitas')}
        />
        <ModuloTile
          icon="inventory_2"
          accentBg="var(--warn-bg)" accentColor="var(--warn-tx)" accentBorder="var(--warn-tx)"
          titulo="Encomiendas"
          subtitulo={resumen.encomiendasPendientes > 0 ? `${resumen.encomiendasPendientes} pendiente${resumen.encomiendasPendientes !== 1 ? 's' : ''} de entregar` : 'Sin encomiendas pendientes'}
          subtituloColor={resumen.encomiendasPendientes > 0 ? 'var(--warn-tx)' : null}
          onClick={() => navegarA('encomiendas')}
        />
        <ModuloTile
          icon="checklist"
          accentBg="var(--info-bg)" accentColor="var(--info-tx)" accentBorder="var(--info-tx)"
          titulo="Tareas"
          subtitulo={
            resumen.tareasVencidas > 0
              ? `${resumen.tareasVencidas} vencida${resumen.tareasVencidas !== 1 ? 's' : ''} de ${resumen.tareasPendientes} pendiente${resumen.tareasPendientes !== 1 ? 's' : ''}`
              : resumen.tareasPendientes > 0 ? `${resumen.tareasPendientes} pendiente${resumen.tareasPendientes !== 1 ? 's' : ''}` : 'Sin tareas pendientes'
          }
          subtituloColor={resumen.tareasVencidas > 0 ? 'var(--crit-tx)' : resumen.tareasPendientes > 0 ? 'var(--info-tx)' : null}
          onClick={() => navegarA('tareas')}
        />
        <ModuloTile
          icon="campaign"
          accentBg="var(--crit-bg)" accentColor="var(--crit-tx)" accentBorder="var(--crit-tx)"
          titulo="Novedades"
          subtitulo="Sin novedades en este turno"
          badges={novedadBadges.length > 0 ? novedadBadges : null}
          onClick={() => navegarA('novedades')}
        />
      </div>

      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
        Más
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <ModuloRow
          icon="schedule"
          accentBg="rgba(var(--brand-rgb),.12)" accentColor="var(--brand)"
          titulo="Entrega de turno"
          subtitulo="Cerrar turno y dejar pendientes para el siguiente"
          onClick={() => navegarA('turno')}
        />
        <ModuloRow
          icon="apartment"
          accentBg="rgba(var(--brand-rgb),.12)" accentColor="var(--brand)"
          titulo="Edificio"
          subtitulo="Contactos y protocolos para casos puntuales"
          onClick={() => navegarA('edificio')}
        />
      </div>
    </div>
  );
}
