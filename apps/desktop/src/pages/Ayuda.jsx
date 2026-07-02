import { useState } from 'react';

const MODULOS = [
  {
    icon: 'home',
    nombre: 'Inicio',
    descripcion: 'Resumen del turno activo: visitas en el edificio, encomiendas pendientes y tareas del día. Desde aquí puedes navegar directo a lo que tiene pendientes.',
  },
  {
    icon: 'group',
    nombre: 'Visitas',
    descripcion: 'Registra la entrada y salida de visitantes. Escribe el nombre, el departamento que visitan y el motivo. El historial del día queda guardado automáticamente.',
    pasos: ['Pulsa "+ Registrar entrada"', 'Llena nombre, destino y motivo (opcional)', 'Cuando el visitante salga, pulsa "Registrar salida" en su tarjeta'],
  },
  {
    icon: 'inventory_2',
    nombre: 'Encomiendas',
    descripcion: 'Controla los paquetes recibidos. Puedes adjuntar una foto como comprobante. Una vez entregado al residente, márcalo como entregado.',
    pasos: ['Pulsa "+ Registrar ingreso"', 'Escribe destinatario, depto y remitente (opcional)', 'Adjunta foto si quieres dejar comprobante', 'Cuando se retire, pulsa "Marcar entregada"'],
  },
  {
    icon: 'checklist',
    nombre: 'Tareas',
    descripcion: 'El administrador asigna tareas. Aquí las ves y las marcas como completadas cuando las termines.',
    pasos: ['Revisa las tareas pendientes al iniciar el turno', 'Completa cada tarea y márcala con el botón correspondiente', 'Las tareas vencidas aparecen destacadas'],
  },
  {
    icon: 'campaign',
    nombre: 'Novedades',
    descripcion: 'El libro de novedades digital. Registra todo lo que pasa en tu turno: incidentes, avisos informativos y situaciones urgentes. Es tu respaldo ante cualquier reclamo posterior.',
    pasos: ['Pulsa el botón "+" o "Nueva novedad"', 'Elige el tipo: Urgente, Incidente o Informativo', 'Describe con detalle lo que pasó', 'Adjunta foto si es relevante'],
  },
  {
    icon: 'schedule',
    nombre: 'Entrega de turno',
    descripcion: 'Inicia y cierra tu turno desde aquí. Al cerrar, puedes dejar pendientes para el próximo conserje. El sistema bloquea el Dashboard del turno siguiente hasta que lea y confirme los pendientes.',
    pasos: ['Al llegar: pulsa "Iniciar turno"', 'Al salir: pulsa "Cerrar turno"', 'Agrega pendientes si quedó algo sin resolver', 'El conserje entrante verá un popup obligatorio con tus pendientes'],
  },
  {
    icon: 'apartment',
    nombre: 'Edificio',
    descripcion: 'Ficha del edificio con contactos importantes (administrador, electricista, gasista, etc.) y protocolos de emergencia. Útil para reemplazos que no conocen la comunidad.',
  },
];

const FAQ = [
  {
    p: '¿Qué pasa si se va la conexión a internet?',
    r: 'Portia guarda los registros en una cola local y los sincroniza automáticamente cuando vuelve la conexión. El badge "▲ N pendientes" en la barra superior te avisa cuántos están esperando.',
  },
  {
    p: '¿Puedo adjuntar fotos sin internet?',
    r: 'No. Las fotos requieren conexión para subirse. Portia te avisará y te pedirá que registres sin foto — puedes complementarla después.',
  },
  {
    p: '¿Cómo me llegan las notificaciones de novedades urgentes?',
    r: 'Si otro conserje del mismo edificio registra una novedad urgente mientras tú estás en otra pantalla, recibes una notificación nativa del sistema (igual que WhatsApp o correo). Al hacer clic, la app se abre directamente en Novedades.',
  },
  {
    p: '¿Quién puede ver lo que registro?',
    r: 'Solo el personal de tu edificio: otros conserjes y el administrador. Los datos están protegidos por Supabase con políticas de acceso por edificio.',
  },
  {
    p: '¿Puedo editar o borrar un registro?',
    r: 'Los registros dejan huella de auditoría (quién editó y cuándo). No se pueden borrar para garantizar la integridad del historial.',
  },
];

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
        {titulo}
      </p>
      {children}
    </div>
  );
}

function ModuloCard({ mod }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden', transition: 'border-color 120ms',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <button
        onClick={() => setAbierto(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: 'rgba(var(--brand-rgb),0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--brand)' }}>{mod.icon}</span>
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{mod.nombre}</span>
        <span style={{
          fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--text-muted)',
          transition: 'transform 180ms', transform: abierto ? 'rotate(180deg)' : 'none',
        }}>expand_more</span>
      </button>

      {abierto && (
        <div style={{ padding: '0 18px 16px 18px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 12, marginBottom: mod.pasos ? 12 : 0 }}>
            {mod.descripcion}
          </p>
          {mod.pasos && (
            <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {mod.pasos.map((paso, i) => (
                <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{paso}</li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

function FaqItem({ item }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 10, overflow: 'hidden',
    }}>
      <button
        onClick={() => setAbierto(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '13px 16px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{item.p}</span>
        <span style={{
          fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--text-muted)',
          flexShrink: 0, transition: 'transform 180ms', transform: abierto ? 'rotate(180deg)' : 'none',
        }}>expand_more</span>
      </button>
      {abierto && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 10 }}>{item.r}</p>
        </div>
      )}
    </div>
  );
}

export default function Ayuda() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: 780, margin: '0 auto' }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(var(--brand-rgb),0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 18, color: 'var(--brand)' }}>help</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Ayuda</h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Guía rápida de uso y preguntas frecuentes</p>
      </div>

      {/* Inicio rápido */}
      <Seccion titulo="Cómo empezar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['1', 'schedule',    'Inicia tu turno', 'Ve a "Entrega de turno" y pulsa "Iniciar turno". Sin turno activo no puedes registrar novedades.'],
            ['2', 'checklist',   'Revisa las tareas', 'En "Tareas" verás lo que el administrador dejó pendiente para tu turno.'],
            ['3', 'campaign',    'Registra todo', 'Cualquier incidente, visita o encomienda debe quedar registrado. Si después hay un reclamo, el historial es tu respaldo.'],
            ['4', 'schedule',    'Cierra el turno', 'Al salir, pulsa "Cerrar turno" y deja pendientes si hace falta. El próximo conserje los verá obligatoriamente.'],
          ].map(([num, _icon, titulo, desc]) => (
            <div key={num} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 18px',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(var(--brand-rgb),0.1)', border: '1px solid rgba(var(--brand-rgb),0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: 'var(--brand)',
              }}>{num}</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{titulo}</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Seccion>

      {/* Módulos */}
      <Seccion titulo="Módulos">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MODULOS.map(mod => <ModuloCard key={mod.nombre} mod={mod} />)}
        </div>
      </Seccion>

      {/* FAQ */}
      <Seccion titulo="Preguntas frecuentes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {FAQ.map(item => <FaqItem key={item.p} item={item} />)}
        </div>
      </Seccion>

      {/* Soporte */}
      <Seccion titulo="Soporte">
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(var(--brand-rgb),0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Material Symbols Outlined', fontSize: 22, color: 'var(--brand)' }}>support_agent</span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>¿Tienes un problema que no está aquí?</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Contacta al administrador de tu edificio. Él tiene acceso al panel de administración y puede revisar tu caso.</p>
          </div>
        </div>
      </Seccion>

    </div>
  );
}
