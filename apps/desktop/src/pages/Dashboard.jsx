import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { count, onCountChange } from '../lib/offlineQueue';
import { flushQueue } from '../lib/syncQueue';
import Sidebar from '../components/Sidebar';
import EntregaTurno from './EntregaTurno';
import Novedades from './Novedades';
import Visitas from './Visitas';
import Encomiendas from './Encomiendas';
import FichaEdificio from './FichaEdificio';
import Tareas from './Tareas';
import Inicio from './Inicio';
import PendientesChecklist from '../components/PendientesChecklist';
import EmergenciaButton from '../components/EmergenciaButton';
import Ayuda from './Ayuda';
import Ajustes from '../components/Ajustes';

export default function Dashboard({ perfil }) {
  const [modulo, setModulo] = useState('inicio');
  const [filtroPendiente, setFiltroPendiente] = useState(null);
  const [turno, setTurno] = useState(null);
  const [turnoPrevioConPendientes, setTurnoPrevioConPendientes] = useState(null);
  const [enLinea, setEnLinea] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(count);
  const [sincronizando, setSincronizando] = useState(false);
  const flushingRef = useRef(false);
  const [showAjustes, setShowAjustes] = useState(false);

  useEffect(() => {
    const marcarOnline  = () => setEnLinea(true);
    const marcarOffline = () => setEnLinea(false);
    window.addEventListener('online', marcarOnline);
    window.addEventListener('offline', marcarOffline);
    return () => {
      window.removeEventListener('online', marcarOnline);
      window.removeEventListener('offline', marcarOffline);
    };
  }, []);

  // Reaccionar a cambios en la cola (enqueues desde páginas hijas)
  useEffect(() => onCountChange(setPendingCount), []);

  // Al reconectar (o al agregar items estando ya online), vaciar la cola.
  // flushingRef previene ejecuciones concurrentes si pendingCount baja
  // a mitad de flush y re-dispara el efecto.
  useEffect(() => {
    if (!enLinea || pendingCount === 0 || flushingRef.current) return;
    async function flush() {
      flushingRef.current = true;
      setSincronizando(true);
      await flushQueue();
      setSincronizando(false);
      flushingRef.current = false;
    }
    flush();
  }, [enLinea, pendingCount]);

  useEffect(() => {
    // limit(1)+order en lugar de maybeSingle para no crashear si hay filas duplicadas (PGRST116)
    supabase
      .from('turnos')
      .select('*')
      .eq('conserje_id', perfil.id)
      .eq('activo', true)
      .order('inicio', { ascending: false })
      .limit(1)
      .then(({ data }) => setTurno(data?.[0] ?? null));
  }, [perfil.id]);

  useEffect(() => {
    if (!turno) return;
    // Si el turno anterior del edificio dejó pendientes sin reconocer, bloquear hasta que se reconozcan
    supabase
      .from('turnos')
      .select('*')
      .eq('edificio_id', perfil.edificio_id)
      .eq('activo', false)
      .is('pendientes_reconocido_at', null)
      .neq('id', turno.id)
      .order('fin', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data && Array.isArray(data.pendientes) && data.pendientes.length > 0) {
          setTurnoPrevioConPendientes(data);
        }
      });
  }, [turno, perfil.edificio_id]);

  async function reconocerPendientes() {
    if (!turnoPrevioConPendientes) return;
    const { error } = await supabase.from('turnos')
      .update({ pendientes_reconocido_por: perfil.id, pendientes_reconocido_at: new Date().toISOString() })
      .eq('id', turnoPrevioConPendientes.id);
    if (!error) setTurnoPrevioConPendientes(null);
  }

  // Notificaciones de escritorio: escucha novedades urgentes ajenas en tiempo real
  useEffect(() => {
    if (!perfil?.edificio_id) return;
    const ch = supabase.channel('notif-urgentes')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'novedades',
        filter: `edificio_id=eq.${perfil.edificio_id}`,
      }, payload => {
        const nov = payload.new;
        if (nov.tipo !== 'urgente' || nov.conserje_id === perfil.id) return;
        window.electron?.notify(
          '◆ Novedad Urgente',
          nov.descripcion?.slice(0, 100) ?? '',
          'open-novedades'
        );
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [perfil.edificio_id, perfil.id]);

  // Clic en notificación nativa → navegar al módulo
  useEffect(() => {
    if (!window.electron?.onNotifyAction) return;
    const off = window.electron.onNotifyAction(action => {
      if (action === 'open-novedades') setModulo('novedades');
    });
    return off;
  }, []);

  // Navegación desde Inicio: ir a un módulo y, si aplica, dejarlo pre-filtrado
  function navegarA(destino, valor = null) {
    setFiltroPendiente(valor !== null ? { modulo: destino, valor } : null);
    setModulo(destino);
  }

  // Navegación normal (sidebar): limpia cualquier filtro que venga de Inicio
  function cambiarModulo(destino) {
    setFiltroPendiente(null);
    setModulo(destino);
  }

  const filtroNovedades = filtroPendiente?.modulo === 'novedades' ? filtroPendiente.valor : null;

  const content = {
    inicio:      <Inicio       perfil={perfil} turno={turno} navegarA={navegarA} />,
    turno:       <EntregaTurno perfil={perfil} turno={turno} onTurnoChange={setTurno} />,
    novedades:   <Novedades   perfil={perfil} turno={turno} filtroInicial={filtroNovedades} />,
    visitas:     <Visitas     perfil={perfil} turno={turno} />,
    encomiendas: <Encomiendas perfil={perfil} turno={turno} />,
    tareas:      <Tareas      perfil={perfil} />,
    edificio:    <FichaEdificio perfil={perfil} />,
    ayuda:       <Ayuda />,
  };

  const labels = { inicio: 'Inicio', turno: 'Entrega de turno', novedades:'Novedades', visitas:'Visitas', encomiendas:'Encomiendas', tareas: 'Tareas', edificio: 'Edificio', ayuda: 'Ayuda' };

  const nombre = (perfil?.nombre || 'Conserje').split(' ')[0];
  const iniciales = (perfil?.nombre || perfil?.email?.split('@')[0] || 'C').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const titulo = modulo === 'inicio' ? `${saludo}, ${nombre}.` : labels[modulo];
  const fecha = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg-base)' }}>
      <Sidebar perfil={perfil} modulo={modulo} setModulo={cambiarModulo} turno={turno} onAjustes={() => setShowAjustes(true)} />
      <main style={{ marginLeft:84, flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Header — saludo estilo Catalina Hub, mismo patrón en todas las páginas */}
        <header style={{
          flexShrink:0, display:'flex', alignItems:'flex-start', justifyContent:'space-between',
          padding:'24px 28px 18px', background:'var(--bg-base)', borderBottom:'1px solid var(--border)',
        }}>
          <div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:26, fontWeight:700, letterSpacing:'-0.3px', color:'var(--text)' }}>
              {titulo}
            </div>
            <div style={{ fontSize:12.5, fontWeight:500, color:'var(--text-muted)', marginTop:5, textTransform:'capitalize' }}>
              {fecha}
              {pendingCount > 0 && ` · ${sincronizando ? 'Sincronizando…' : `${pendingCount} pendiente${pendingCount !== 1 ? 's' : ''} de sincronizar`}`}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div className="hh-qbtn" title={enLinea ? 'En línea' : 'Sin conexión'} style={{ cursor: 'default', color: enLinea ? 'var(--ok-tx)' : 'var(--crit-tx)' }}>
              <span style={{ fontFamily:'Material Symbols Outlined', fontSize:17 }}>{enLinea ? 'wifi' : 'wifi_off'}</span>
            </div>
            <EmergenciaButton perfil={perfil} turno={turno} />
            <div className="hh-avatar">{iniciales}</div>
          </div>
        </header>
        {/* Page content */}
        <div key={modulo} className="page-enter" style={{ flex:1, overflowY:'auto' }}>
          {content[modulo]}
        </div>
      </main>

      {turnoPrevioConPendientes && (
        <PendientesChecklist turno={turnoPrevioConPendientes} onReconocido={reconocerPendientes} />
      )}
      {showAjustes && <Ajustes perfil={perfil} onClose={() => setShowAjustes(false)} />}
    </div>
  );
}
