import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getAll, remove, count, onCountChange } from '../lib/offlineQueue';
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

const necesitaNombre = p => !p?.nombre || p.nombre.trim() === '' || p.nombre === 'Conserje Portia';

export default function Dashboard({ perfil }) {
  const [modulo, setModulo] = useState('inicio');
  const [filtroPendiente, setFiltroPendiente] = useState(null);
  const [turno, setTurno] = useState(null);
  const [turnoPrevioConPendientes, setTurnoPrevioConPendientes] = useState(null);
  const [enLinea, setEnLinea] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(count);
  const [sincronizando, setSincronizando] = useState(false);
  const [showAjustes, setShowAjustes] = useState(false);
  const [perfilNombre, setPerfilNombre] = useState(perfil?.nombre || '');
  const [showNombreModal, setShowNombreModal] = useState(necesitaNombre(perfil));
  const [nombreInput, setNombreInput] = useState('');
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  const flushingRef = useRef(false);

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

  // Al reconectar, vaciar la cola
  useEffect(() => {
    if (!enLinea || pendingCount === 0 || flushingRef.current) return;
    
    async function flush() {
      flushingRef.current = true;
      setSincronizando(true);
      try {
        const items = getAll();
        for (const item of items) {
          let error;
          if (item.op === 'insert') {
            ({ error } = await supabase.from(item.table).insert(item.payload));
          } else if (item.op === 'update') {
            ({ error } = await supabase.from(item.table).update(item.payload).eq('id', item.rowId));
          }
          if (!error) {
            remove(item._id);
          } else {
            console.error('Error flushing offline item:', error);
            break; // Stop execution on error to preserve order and retry later
          }
        }
      } catch (err) {
        console.error('Unexpected error in flush:', err);
      } finally {
        setSincronizando(false);
        flushingRef.current = false;
      }
    }
    flush();
  }, [enLinea, pendingCount]);

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

  async function guardarNombre() {
    const n = nombreInput.trim();
    if (!n) return;
    setGuardandoNombre(true);
    await supabase.from('perfiles').update({ nombre: n }).eq('id', perfil.id);
    setPerfilNombre(n);
    setShowNombreModal(false);
    setGuardandoNombre(false);
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
    inicio:      <Inicio       perfil={{ ...perfil, nombre: perfilNombre || perfil?.nombre }} turno={turno} navegarA={navegarA} />,
    turno:       <EntregaTurno perfil={perfil} turno={turno} onTurnoChange={setTurno} />,
    novedades:   <Novedades   perfil={perfil} turno={turno} filtroInicial={filtroNovedades} />,
    visitas:     <Visitas     perfil={perfil} turno={turno} />,
    encomiendas: <Encomiendas perfil={perfil} turno={turno} />,
    tareas:      <Tareas      perfil={perfil} />,
    edificio:    <FichaEdificio perfil={perfil} />,
    ayuda:       <Ayuda />,
  };

  const labels = { inicio: 'Inicio', turno: 'Entrega de turno', novedades:'Novedades', visitas:'Visitas', encomiendas:'Encomiendas', tareas: 'Tareas', edificio: 'Edificio', ayuda: 'Ayuda' };

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg-base)' }}>
      <Sidebar perfil={{ ...perfil, nombre: perfilNombre || perfil?.nombre }} modulo={modulo} setModulo={cambiarModulo} turno={turno} onAjustes={() => setShowAjustes(true)} />
      <main style={{ marginLeft:240, flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Top bar — WebkitAppRegion drag en el header vacío, no-drag en los controles */}
        <header style={{
          height:52, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 28px', borderBottom:'1px solid var(--border)', background:'var(--bg-surface)',
          WebkitAppRegion: 'drag',
        }}>
          <span style={{ fontSize:12.5, color:'var(--text-muted)', fontWeight:600, letterSpacing:'0.01em', WebkitAppRegion:'no-drag' }}>
            {labels[modulo]}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:16, WebkitAppRegion:'no-drag' }}>
            {pendingCount > 0 && (
              <span style={{
                display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700,
                color: sincronizando ? 'var(--warn-tx)' : 'var(--text-secondary)',
                background: 'var(--warn-bg)', border: '1px solid var(--warn-border)',
                borderRadius:99, padding:'3px 10px',
              }}>
                {sincronizando
                  ? <span style={{ width:7, height:7, border:'1.5px solid var(--warn-tx)', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
                  : null}
                {sincronizando ? 'Sincronizando…' : `${pendingCount} pend.`}
              </span>
            )}
            <span style={{
              display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600,
              color: enLinea ? '#2471E7' : 'var(--crit-tx)',
            }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background: enLinea ? '#2471E7' : 'var(--crit-tx)', display:'inline-block' }} />
              {enLinea ? 'En línea' : 'Sin conexión'}
            </span>
            <EmergenciaButton perfil={perfil} turno={turno} />
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

      {/* Modal: pedir nombre si no existe */}
      {showNombreModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:24 }}>
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:380, padding:'36px 32px', boxShadow:'0 32px 80px rgba(0,0,0,0.35)', textAlign:'center' }}>
            <div style={{ fontSize:36, marginBottom:16 }}>👋</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#19181A', marginBottom:8, letterSpacing:'-0.3px' }}>
              ¿Cómo te llamas?
            </h2>
            <p style={{ fontSize:14, color:'#6A6762', lineHeight:1.55, marginBottom:28 }}>
              Escribe tu nombre para que aparezca en el sistema y en los registros.
            </p>
            <input
              autoFocus
              type="text"
              placeholder="Ej: Raúl, María, Juan Carlos…"
              value={nombreInput}
              onChange={e => setNombreInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && nombreInput.trim()) guardarNombre(); }}
              style={{
                width:'100%', height:48, padding:'0 16px', borderRadius:12,
                border:'1.5px solid rgba(25,24,26,0.15)', background:'#FAFAF8',
                fontSize:15, fontFamily:'inherit', fontWeight:500, color:'#19181A',
                outline:'none', boxSizing:'border-box', marginBottom:12,
                transition:'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#E6701E'}
              onBlur={e => e.target.style.borderColor = 'rgba(25,24,26,0.15)'}
            />
            <button
              disabled={!nombreInput.trim() || guardandoNombre}
              onClick={guardarNombre}
              style={{
                width:'100%', height:48, background:'#0A1C40', color:'#fff',
                border:'none', borderRadius:12, fontSize:15, fontWeight:700,
                fontFamily:'inherit', cursor: nombreInput.trim() ? 'pointer' : 'not-allowed',
                opacity: nombreInput.trim() ? 1 : 0.4, transition:'opacity .15s, filter .12s',
              }}
              onMouseEnter={e => { if (nombreInput.trim()) e.currentTarget.style.filter = 'brightness(1.3)'; }}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
              {guardandoNombre ? 'Guardando…' : 'Continuar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
