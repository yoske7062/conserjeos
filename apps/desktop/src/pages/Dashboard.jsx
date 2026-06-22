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

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <Sidebar perfil={perfil} modulo={modulo} setModulo={setModulo} turno={turno} />
      <main className="flex-1 overflow-hidden">
        {content[modulo]}
      </main>
    </div>
  );
}
