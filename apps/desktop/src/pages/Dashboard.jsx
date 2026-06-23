import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import Novedades from './Novedades';
import Visitas from './Visitas';
import Encomiendas from './Encomiendas';

export default function Dashboard({ perfil }) {
  const [modulo, setModulo] = useState('novedades');
  const [turno, setTurno] = useState(null);

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

  const content = {
    novedades:   <Novedades   perfil={perfil} turno={turno} onTurnoChange={setTurno} />,
    visitas:     <Visitas     perfil={perfil} turno={turno} />,
    encomiendas: <Encomiendas perfil={perfil} turno={turno} />,
  };

  const labels = { novedades:'Novedades', visitas:'Visitas', encomiendas:'Encomiendas' };

  return (
    <div style={{ display:'flex', height:'100vh', background:'#0B0B0B' }}>
      <Sidebar perfil={perfil} modulo={modulo} setModulo={setModulo} turno={turno} />
      <main style={{ marginLeft:256, flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Top bar */}
        <header style={{
          height:56, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 24px', borderBottom:'1px solid #1F1F1F', background:'#0D0D0D'
        }}>
          <span style={{ fontSize:13, color:'#636363' }}>
            Portia / <span style={{ color:'#F5F5F5', fontWeight:600 }}>{labels[modulo]}</span>
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:13, color:'#636363' }}>{perfil?.nombre || perfil?.email}</span>
            <div style={{
              width:30, height:30, borderRadius:'50%', background:'rgba(0,255,136,0.1)',
              border:'1px solid rgba(0,255,136,0.25)', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:700, color:'#00FF88'
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
    </div>
  );
}
