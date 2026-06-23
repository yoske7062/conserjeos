import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { state as estados } from '../lib/tokens';

function Badge({ texto, color, bg, border, onClick }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 5, minHeight: 32,
        padding: '4px 10px', borderRadius: 99, background: bg, border: `1px solid ${border}`,
        color, fontSize: 13, fontWeight: 700, cursor: 'pointer',
      }}
    >{texto}</button>
  );
}

function ModuloRow({ icon, accent, titulo, subtitulo, subtituloColor, badges, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, width: '100%', textAlign: 'left',
        minHeight: 76, padding: '16px 18px', borderRadius: 14,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        cursor: 'pointer', transition: 'border-color 120ms, background 120ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.background = 'var(--bg-surface-high)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: accent.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 26, color: accent.color }}>{icon}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{titulo}</p>
        {badges ? (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{badges}</div>
        ) : (
          <p style={{ fontSize: 14, color: subtituloColor ?? 'var(--text-muted)', fontWeight: subtituloColor ? 600 : 400 }}>{subtitulo}</p>
        )}
      </div>
      <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: 'var(--text-subtle)', flexShrink: 0 }}>chevron_right</span>
    </button>
  );
}

export default function Inicio({ perfil, turno, navegarA }) {
  const [resumen, setResumen] = useState({ urgente: 0, incidente: 0, informativo: 0, visitasActivas: 0, encomiendasPendientes: 0, tareasPendientes: 0, tareasVencidas: 0 });

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

  const novedadBadges = [];
  if (resumen.urgente > 0) novedadBadges.push(
    <Badge key="u" texto={`${estados.emergency.icon} ${resumen.urgente} urgente${resumen.urgente !== 1 ? 's' : ''}`}
      color={estados.emergency.color} bg={estados.emergency.bg} border={estados.emergency.border}
      onClick={() => navegarA('novedades', 'urgente')} />
  );
  if (resumen.incidente > 0) novedadBadges.push(
    <Badge key="i" texto={`${estados.incident.icon} ${resumen.incidente} incidente${resumen.incidente !== 1 ? 's' : ''}`}
      color={estados.incident.color} bg={estados.incident.bg} border={estados.incident.border}
      onClick={() => navegarA('novedades', 'incidente')} />
  );
  if (resumen.informativo > 0) novedadBadges.push(
    <Badge key="n" texto={`${estados.info.icon} ${resumen.informativo} informativo${resumen.informativo !== 1 ? 's' : ''}`}
      color={estados.info.color} bg={estados.info.bg} border={estados.info.border}
      onClick={() => navegarA('novedades', 'informativo')} />
  );

  return (
    <div style={{ padding: '28px 32px', maxWidth: 720, margin: '0 auto' }}>

      {/* Saludo + estado de turno */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Hola, {nombre}</h2>
        {turno ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block' }} />
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Turno activo desde {new Date(turno.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
            background: estados.warning.bg, border: `1px solid ${estados.warning.border}`, borderRadius: 10, padding: '12px 16px', marginTop: 8,
          }}>
            <p style={{ fontSize: 14, color: estados.warning.color, fontWeight: 600 }}>{estados.warning.icon} No tienes un turno activo</p>
            <button onClick={() => navegarA('turno')} style={{
              height: 40, padding: '0 16px', background: 'var(--brand)', border: 'none', borderRadius: 8,
              color: 'var(--brand-text-on)', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}>Iniciar turno</button>
          </div>
        )}
      </div>

      {/* Lo del día — toca cualquier tarjeta para entrar */}
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Toca para ver el detalle
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>

        <ModuloRow
          icon="group"
          accent={{ color: estados.success.color, bg: estados.success.bg }}
          titulo="Visitas"
          subtitulo={resumen.visitasActivas > 0 ? `${resumen.visitasActivas} persona${resumen.visitasActivas !== 1 ? 's' : ''} en el edificio ahora` : 'Sin visitas activas'}
          subtituloColor={resumen.visitasActivas > 0 ? estados.success.color : null}
          onClick={() => navegarA('visitas')}
        />

        <ModuloRow
          icon="inventory_2"
          accent={{ color: estados.warning.color, bg: estados.warning.bg }}
          titulo="Encomiendas"
          subtitulo={resumen.encomiendasPendientes > 0 ? `${resumen.encomiendasPendientes} pendiente${resumen.encomiendasPendientes !== 1 ? 's' : ''} de entregar` : 'Sin encomiendas pendientes'}
          subtituloColor={resumen.encomiendasPendientes > 0 ? estados.warning.color : null}
          onClick={() => navegarA('encomiendas')}
        />

        <ModuloRow
          icon="checklist"
          accent={{ color: 'var(--brand)', bg: 'rgba(var(--brand-rgb),0.15)' }}
          titulo="Tareas"
          subtitulo={
            resumen.tareasVencidas > 0
              ? `${estados.emergency.icon} ${resumen.tareasVencidas} vencida${resumen.tareasVencidas !== 1 ? 's' : ''} de ${resumen.tareasPendientes} pendiente${resumen.tareasPendientes !== 1 ? 's' : ''}`
              : resumen.tareasPendientes > 0 ? `${resumen.tareasPendientes} pendiente${resumen.tareasPendientes !== 1 ? 's' : ''}` : 'Sin tareas pendientes'
          }
          subtituloColor={resumen.tareasVencidas > 0 ? estados.emergency.color : resumen.tareasPendientes > 0 ? 'var(--brand)' : null}
          onClick={() => navegarA('tareas')}
        />

        <ModuloRow
          icon="campaign"
          accent={{ color: estados.info.color, bg: estados.info.bg }}
          titulo="Novedades"
          subtitulo="Sin novedades en este turno"
          badges={novedadBadges.length > 0 ? novedadBadges : null}
          onClick={() => navegarA('novedades')}
        />
      </div>

      {/* Secundario */}
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Más
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ModuloRow
          icon="schedule"
          accent={{ color: 'var(--text-secondary)', bg: 'var(--bg-surface-high)' }}
          titulo="Entrega de turno"
          subtitulo="Cerrar tu turno y dejar pendientes para el siguiente"
          onClick={() => navegarA('turno')}
        />
        <ModuloRow
          icon="apartment"
          accent={{ color: 'var(--text-secondary)', bg: 'var(--bg-surface-high)' }}
          titulo="Edificio"
          subtitulo="Contactos y protocolos para casos puntuales"
          onClick={() => navegarA('edificio')}
        />
      </div>
    </div>
  );
}
