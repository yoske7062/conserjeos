import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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

export default function Dashboard({ perfil }) {
  const [modulo, setModulo] = useState('inicio');
  const [filtroPendiente, setFiltroPendiente] = useState(null);
  const [turno, setTurno] = useState(null);
  const [turnoPrevioConPendientes, setTurnoPrevioConPendientes] = useState(null);
  const [enLinea, setEnLinea] = useState(navigator.onLine);

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

  useEffect(() => {
    // Buscar turno activo del conserje
    supabase
      .from('turnos')
      .select('*')
      .eq('conserje_id', perfil.id)
      .eq('activo', true)
      .maybeSingle()
      .then(({ data }) => setTurno(data));
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
  };

  const labels = { inicio: 'Inicio', turno: 'Entrega de turno', novedades:'Novedades', visitas:'Visitas', encomiendas:'Encomiendas', tareas: 'Tareas', edificio: 'Edificio' };

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg-base)' }}>
      <Sidebar perfil={perfil} modulo={modulo} setModulo={cambiarModulo} turno={turno} />
      <main style={{ marginLeft:256, flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Top bar */}
        <header style={{
          height:56, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 24px', borderBottom:'1px solid var(--bg-surface-high)', background:'var(--bg-input)'
        }}>
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>
            Portia / <span style={{ color:'var(--text)', fontWeight:600 }}>{labels[modulo]}</span>
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{
              display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600,
              color: enLinea ? '#2FBF71' : '#E5484D',
            }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background: enLinea ? '#2FBF71' : '#E5484D', display:'inline-block' }} />
              {enLinea ? 'En línea' : 'Sin conexión'}
            </span>
            <EmergenciaButton perfil={perfil} turno={turno} />
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>{perfil?.nombre || perfil?.email}</span>
            <div style={{
              width:30, height:30, borderRadius:'50%', background:'rgba(var(--brand-rgb),0.1)',
              border:'1px solid rgba(var(--brand-rgb),0.25)', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:700, color:'var(--brand)'
            }}>
              {(perfil?.nombre || 'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </div>
          </div>
        </header>
        {/* Page content — key forces remount → triggers page-enter animation */}
        <div key={modulo} className="page-enter" style={{ flex:1, overflowY:'auto' }}>
          {content[modulo]}
        </div>
      </main>

      {turnoPrevioConPendientes && (
        <PendientesChecklist turno={turnoPrevioConPendientes} onReconocido={reconocerPendientes} />
      )}
    </div>
  );
}
